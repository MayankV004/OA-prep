'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraOff, Mic, MicOff, AlertCircle, Eye, Shield, ShieldAlert, Smartphone, Users, BookOpen, Minimize2, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ProctorViolationEvent,
  FaceStatus,
  GazeStatus,
  NeuralModelStatus,
  CandidateRegion,
  analyzeNeuralFaceFrame,
  initNeuralFaceModel,
  detectNeuralDevices,
  initNeuralDeviceModel,
  analyzeFaceFrame,
  detectOpticalPhone,
  setupAcousticAnalyzer,
  computeRmsVolume,
} from '@/lib/proctor';

export type { ProctorViolationEvent };

interface ProctorCameraPipProps {
  onViolation: (event: ProctorViolationEvent) => void;
  onMediaStateChange?: (state: { camera: boolean; mic: boolean }) => void;
}

export function ProctorCameraPip({ onViolation, onMediaStateChange }: ProctorCameraPipProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [hasMic, setHasMic] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // Neural Engine Model Status
  const [modelStatus, setModelStatus] = useState<NeuralModelStatus>('uninitialized');

  // Face Detection & Prohibited Object State
  const [faceStatus, setFaceStatus] = useState<FaceStatus>('detecting');
  const [faceCount, setFaceCount] = useState<number>(1);
  const [faceInScreenPercent, setFaceInScreenPercent] = useState<number>(0);
  const [gazeStatus, setGazeStatus] = useState<GazeStatus>('no_face');
  const [phoneDetected, setPhoneDetected] = useState(false);
  const [phoneScore, setPhoneScore] = useState(0);
  const [bookDetected, setBookDetected] = useState(false);
  const [faceOccluded, setFaceOccluded] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Consecutive counters for debouncing alerts
  const partialOrAbsentStreak = useRef(0);
  const gazeDivertedStreak = useRef(0);
  const voiceActivityStreak = useRef(0);
  const phoneStreak = useRef(0);
  const multiPersonStreak = useRef(0);
  const lastViolationTime = useRef<Record<string, number>>({});
  const latestFaceRef = useRef<CandidateRegion | null>(null);
  const phonePersistenceTimer = useRef<NodeJS.Timeout | null>(null);

  const shouldTriggerViolation = (key: string, cooldownMs = 3500) => {
    const now = Date.now();
    const last = lastViolationTime.current[key] || 0;
    if (now - last > cooldownMs) {
      lastViolationTime.current[key] = now;
      return true;
    }
    return false;
  };

  // 1. Initialize Camera and Microphone Stream
  useEffect(() => {
    let active = true;

    async function startMedia() {
      try {
        let mediaStream: MediaStream;

        try {
          // Standard high-compatibility constraints
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: 'user',
            },
            audio: true,
          });
        } catch {
          // Basic fallback if ideal constraints fail on Linux/Chromium
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
        }

        if (!active) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }

        setStream(mediaStream);
        setHasCamera(true);
        setHasMic(true);
        onMediaStateChange?.({ camera: true, mic: true });

        // Setup Modular Web Audio API
        const acoustic = setupAcousticAnalyzer(mediaStream);
        if (acoustic) {
          audioContextRef.current = acoustic.audioContext;
          analyserRef.current = acoustic.analyser;
        }
      } catch (err: any) {
        console.warn('Camera/Microphone access error:', err);
        setInitError('Camera or Microphone access was denied.');
        setHasCamera(false);
        setHasMic(false);
        setFaceStatus('absent');
        setGazeStatus('no_face');
        onMediaStateChange?.({ camera: false, mic: false });
        onViolation({
          type: 'camera_disabled',
          details: 'Candidate started assessment without webcam authorization',
        });
      }
    }

    startMedia();

    return () => {
      active = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (phonePersistenceTimer.current) {
        clearTimeout(phonePersistenceTimer.current);
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // 2. Bind Stream to Video Element & Live Display Canvas
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const playVideo = () => {
      video.play().catch((err) => {
        console.warn('Video auto-play delayed/blocked:', err);
      });
    };

    video.onloadedmetadata = playVideo;
    playVideo();

    // Live Render Loop: renders camera frame to displayCanvas at 30fps
    const renderLoop = () => {
      const displayCanvas = displayCanvasRef.current;
      if (displayCanvas && video && video.readyState >= 2) {
        const ctx = displayCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, displayCanvas.width, displayCanvas.height);
        }
      }
      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [stream]);

  // 3. Modular Audio Level & Voice Activity Analysis Loop (every 250ms)
  useEffect(() => {
    if (!hasMic || !analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const audioInterval = setInterval(() => {
      const normalizedVolume = computeRmsVolume(analyser, dataArray);
      setAudioLevel(normalizedVolume);

      // Human speech threshold
      if (normalizedVolume > 28) {
        voiceActivityStreak.current += 1;
        if (voiceActivityStreak.current >= 5) {
          if (shouldTriggerViolation('voice', 15000)) {
            onViolation({
              type: 'voice_detected',
              details: `Acoustic voice activity detected (Volume: ${normalizedVolume}%)`,
            });
          }
        }
      } else {
        voiceActivityStreak.current = Math.max(0, voiceActivityStreak.current - 1);
      }
    }, 250);

    return () => clearInterval(audioInterval);
  }, [hasMic, onViolation]);

  // 4. Load Neural AI Models (BlazeFace + COCO-SSD) on Client Mount
  useEffect(() => {
    let isMounted = true;
    async function loadModels() {
      try {
        setModelStatus('loading');
        const [faceMod, devMod] = await Promise.all([
          initNeuralFaceModel(),
          initNeuralDeviceModel(),
        ]);
        if (!isMounted) return;
        if (faceMod && devMod) {
          setModelStatus('ready');
        } else if (faceMod || devMod) {
          setModelStatus('ready');
        } else {
          setModelStatus('fallback');
        }
      } catch (err) {
        console.warn('Neural models initialization failed, using fallback:', err);
        if (isMounted) setModelStatus('fallback');
      }
    }

    loadModels();
    return () => {
      isMounted = false;
    };
  }, []);

  // 5. ENGINE 1: Real-Time Neural Face, Multiple Person & 3D Gaze Analysis (Every 180ms)
  const runFaceAnalysis = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !hasCamera) return;

    if (video.readyState < 2 || video.videoWidth === 0) {
      setFaceStatus('detecting');
      setFaceInScreenPercent(0);
      setGazeStatus('no_face');
      latestFaceRef.current = null;
      return;
    }

    const inputSource = displayCanvasRef.current || video;
    const videoW = displayCanvasRef.current?.width || video.videoWidth || 320;
    const videoH = displayCanvasRef.current?.height || video.videoHeight || 240;

    // Fast Path A: Google BlazeFace Neural Model
    if (modelStatus === 'ready') {
      const neuralResult = await analyzeNeuralFaceFrame(inputSource, videoW, videoH);
      if (neuralResult) {
        setFaceCount(neuralResult.faceCount);

        // Update latestFaceRef for spatial candidate exclusion in device analysis
        if (neuralResult.faceCount > 0 && neuralResult.boxWidth > 0) {
          latestFaceRef.current = {
            centroidX: (neuralResult.centroidX / videoW) * 160,
            centroidY: (neuralResult.centroidY / videoH) * 120,
            boxWidth: (neuralResult.boxWidth / videoW) * 160,
            boxHeight: (neuralResult.boxHeight / videoH) * 120,
          };
        } else {
          latestFaceRef.current = null;
        }

        // Multiple faces check
        if (neuralResult.faceCount > 1) {
          multiPersonStreak.current += 1;
          setFaceStatus('multiple');
          setFaceInScreenPercent(100);
          setGazeStatus('no_face');

          if (multiPersonStreak.current >= 2 && shouldTriggerViolation('multiple_faces', 12000)) {
            onViolation({
              type: 'multiple_faces',
              details: `Multiple people detected in camera view (${neuralResult.faceCount} faces visible)`,
            });
          }
          return;
        }

        multiPersonStreak.current = 0;

        // Hand occlusion / face covering check
        if (neuralResult.isOccluded) {
          setFaceOccluded(true);
          setFaceStatus('partial');
          setFaceInScreenPercent(20);
          setGazeStatus('no_face');
          partialOrAbsentStreak.current += 1;

          if (shouldTriggerViolation('covered_face', 3500)) {
            onViolation({
              type: 'no_face_detected',
              details: 'Face is covered or occluded by hand/object. Ensure full facial visibility.',
            });
          }
          return;
        }

        setFaceOccluded(false);
        setFaceInScreenPercent(neuralResult.inScreenPercent);

        if (neuralResult.faceCount === 0) {
          partialOrAbsentStreak.current += 1;
          setFaceStatus('absent');
          setGazeStatus('no_face');
          latestFaceRef.current = null;
          setPhoneDetected(false);
          setPhoneScore(0);
          phoneStreak.current = 0;
          if (phonePersistenceTimer.current) {
            clearTimeout(phonePersistenceTimer.current);
          }

          if (shouldTriggerViolation('absence', 3500)) {
            onViolation({
              type: 'no_face_detected',
              details: 'Candidate absent from camera view (0% face detected)',
            });
          }
          return;
        }

        if (neuralResult.inScreenPercent < 70) {
          partialOrAbsentStreak.current += 1;
          setFaceStatus('partial');
          setGazeStatus('no_face');

          if (shouldTriggerViolation('partial_face', 3500)) {
            onViolation({
              type: 'no_face_detected',
              details: `Face only ${neuralResult.inScreenPercent}% visible in frame (less than 70% threshold). Please center your face.`,
            });
          }
          return;
        }

        // Single Face Verified (>= 70%)
        partialOrAbsentStreak.current = 0;
        setFaceStatus('verified');
        setGazeStatus(neuralResult.gazeStatus);

        if (neuralResult.gazeStatus === 'diverted') {
          gazeDivertedStreak.current += 1;
          if (gazeDivertedStreak.current >= 3 && shouldTriggerViolation('gaze', 10000)) {
            onViolation({
              type: 'gaze_diverted',
              details: 'Candidate looking away from screen (diverted gaze detected via 3D facial landmarks)',
            });
          }
        } else {
          gazeDivertedStreak.current = 0;
        }
        return;
      }
    }

    // Path B: Modular Canvas Computer Vision Fallback
    let canvas = analysisCanvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 120;
      analysisCanvasRef.current = canvas;
    }
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const faceResult = analyzeFaceFrame(ctx, video);
    setFaceInScreenPercent(faceResult.inScreenPercent);
    setFaceStatus(faceResult.faceStatus);
    setGazeStatus(faceResult.gazeStatus);
    setFaceOccluded(faceResult.isCovered);

    if (faceResult.totalSkinPixels >= 40) {
      latestFaceRef.current = {
        centroidX: faceResult.centroidX,
        centroidY: faceResult.centroidY,
        boxWidth: faceResult.boxWidth,
        boxHeight: faceResult.boxHeight,
      };
    } else {
      latestFaceRef.current = null;
    }

    if (faceResult.isCovered) {
      if (shouldTriggerViolation('covered_face', 3500)) {
        onViolation({
          type: 'no_face_detected',
          details: 'Face is covered or occluded by hand/object.',
        });
      }
    } else if (faceResult.faceStatus === 'absent') {
      latestFaceRef.current = null;
      setPhoneDetected(false);
      setPhoneScore(0);
      phoneStreak.current = 0;
      if (phonePersistenceTimer.current) {
        clearTimeout(phonePersistenceTimer.current);
      }
      if (shouldTriggerViolation('absence', 3500)) {
        onViolation({
          type: 'no_face_detected',
          details: 'Candidate absent from camera view.',
        });
      }
    } else if (faceResult.faceStatus === 'partial') {
      if (shouldTriggerViolation('partial_face', 3500)) {
        onViolation({
          type: 'no_face_detected',
          details: `Face only ${faceResult.inScreenPercent}% visible in frame (< 70%).`,
        });
      }
    } else if (faceResult.gazeStatus === 'diverted') {
      if (shouldTriggerViolation('gaze', 10000)) {
        onViolation({
          type: 'gaze_diverted',
          details: 'Candidate looking away from screen.',
        });
      }
    }
  }, [hasCamera, modelStatus, onViolation]);

  // 6. ENGINE 2: Dual-Tier Neural & Optical Prohibited Device Detection (Every 450ms)
  const runDeviceAnalysis = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !hasCamera || video.readyState < 2) return;

    // GUARD: If candidate is absent from camera view, device detection MUST NOT trigger!
    // A missing candidate cannot be using a phone. Empty room or chair must never cause a phone alert.
    if (!latestFaceRef.current || faceStatus === 'absent' || faceCount === 0) {
      setPhoneDetected(false);
      setPhoneScore(0);
      phoneStreak.current = 0;
      if (phonePersistenceTimer.current) {
        clearTimeout(phonePersistenceTimer.current);
      }
      return;
    }

    let phoneFound = false;
    let score = 0;

    // Use active 320x240 RGB canvas rendering loop for fastest WebGL texture ingestion
    const inputSource = displayCanvasRef.current || video;

    // Tier 1: COCO-SSD MobileNet Neural Object Detector
    if (modelStatus === 'ready' || modelStatus === 'loading') {
      try {
        const devResult = await detectNeuralDevices(inputSource);
        if (devResult) {
          if (devResult.isPhoneDetected) {
            phoneFound = true;
            score = devResult.phoneScore;
          }
          setBookDetected(devResult.isBookDetected);

          if (devResult.isMultiplePeopleDetected) {
            setFaceStatus('multiple');
            setFaceCount((prev) => Math.max(prev, 2));
            if (shouldTriggerViolation('multi_person', 12000)) {
              onViolation({
                type: 'multiple_faces',
                details: 'Secondary person detected in testing environment',
              });
            }
          }

          if (devResult.isBookDetected) {
            if (shouldTriggerViolation('book', 10000)) {
              onViolation({
                type: 'prohibited_object_detected',
                details: 'Physical reference material / book detected in testing area',
              });
            }
          }
        }
      } catch (err) {
        console.warn('Neural device inference error:', err);
      }
    }

    // Tier 2: Real-time Multi-Zone Optical Geometry Detector (runs on fresh frame)
    let canvas = analysisCanvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 120;
      analysisCanvasRef.current = canvas;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      ctx.drawImage(inputSource, 0, 0, 160, 120);
      const opticalResult = detectOpticalPhone(ctx, latestFaceRef.current || undefined);
      if (opticalResult.isPhoneDetected) {
        phoneFound = true;
        if (score === 0) score = 85;
      }
    }

    if (phoneFound) {
      setPhoneDetected(true);
      setPhoneScore(score);
      phoneStreak.current += 1;

      // Keep alert visible for at least 2.2s to prevent rapid UI flashing
      if (phonePersistenceTimer.current) clearTimeout(phonePersistenceTimer.current);
      phonePersistenceTimer.current = setTimeout(() => {
        setPhoneDetected(false);
      }, 2200);

      if (shouldTriggerViolation('phone', 3500)) {
        onViolation({
          type: 'prohibited_object_detected',
          details: `Mobile phone detected in camera view${score > 0 ? ` (${score}% confidence)` : ''}`,
        });
      }
    } else {
      phoneStreak.current = Math.max(0, phoneStreak.current - 1);
    }
  }, [hasCamera, modelStatus, faceStatus, faceCount, onViolation]);

  // Fast Face & Gaze Loop (180ms)
  useEffect(() => {
    if (!hasCamera) return;
    const faceInterval = setInterval(runFaceAnalysis, 180);
    return () => clearInterval(faceInterval);
  }, [hasCamera, runFaceAnalysis]);

  // Throttled Object & Device Loop (450ms)
  useEffect(() => {
    if (!hasCamera) return;
    const deviceInterval = setInterval(runDeviceAnalysis, 450);
    return () => clearInterval(deviceInterval);
  }, [hasCamera, runDeviceAnalysis]);

  if (initError) {
    return (
      <div className="fixed bottom-4 left-4 z-50 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono flex items-center gap-2.5 shadow-lg backdrop-blur-md">
        <CameraOff className="size-4 shrink-0" />
        <span>Proctor stream unverified (Permissions denied)</span>
      </div>
    );
  }

  // Minimized Floating Pill View (Left side of screen)
  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed bottom-4 left-4 z-50 px-3.5 py-2 rounded-full bg-card/90 border border-border/80 text-foreground text-xs font-mono flex items-center gap-2.5 shadow-xl backdrop-blur-md hover:bg-muted/60 transition-all cursor-pointer"
      >
        <span className="relative flex size-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full size-2 bg-primary" />
        </span>
        <span className="font-bold">PROCTOR LIVE</span>
        <span className="text-2xs text-muted-foreground">({faceInScreenPercent}%)</span>
        <Maximize2 className="size-3.5 text-muted-foreground ml-1" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 w-72 sm:w-80 rounded-2xl bg-card/95 border border-border/80 shadow-2xl overflow-hidden backdrop-blur-md transition-all font-mono">
      {/* Top Header Bar */}
      <div className="px-3.5 py-2 bg-muted/40 border-b border-border/60 flex items-center justify-between text-2xs">
        <div className="flex items-center gap-2">
          {modelStatus === 'ready' ? (
            <>
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
              </span>
              <span className="font-bold text-foreground tracking-wide">REC • AI PROCTOR</span>
              <span className="text-3xs text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/25">
                NEURAL
              </span>
            </>
          ) : modelStatus === 'loading' ? (
            <>
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-amber-500" />
              </span>
              <span className="font-bold text-foreground tracking-wide">REC • CALIBRATING AI...</span>
            </>
          ) : (
            <>
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
              </span>
              <span className="font-bold text-foreground tracking-wide">REC • PROCTOR LIVE</span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMinimized(true)}
          className="p-1 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title="Minimize to pill"
        >
          <Minimize2 className="size-3.5" />
        </button>
      </div>

      {/* Video & Live Canvas Viewport */}
      <div className="relative aspect-4/3 bg-black overflow-hidden flex items-center justify-center">
        {/* Real hidden video element receiving raw stream */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover -scale-x-100 opacity-0 pointer-events-none"
        />

        {/* Live Canvas rendering decoded video frames smoothly at 30fps */}
        <canvas
          ref={displayCanvasRef}
          width={320}
          height={240}
          className="w-full h-full object-cover -scale-x-100"
        />

        {/* Prohibited Device / Phone Banner */}
        {phoneDetected && faceStatus !== 'absent' && (
          <div className="absolute bottom-9 left-1/2 -translate-x-1/2 z-20 bg-red-600/95 text-white font-semibold text-3xs py-0.5 px-2.5 rounded-full shadow-md flex items-center gap-1 border border-red-400/60 whitespace-nowrap animate-in fade-in">
            <Smartphone className="size-2.5 shrink-0" />
            <span>Phone Detected {phoneScore > 0 ? `(${phoneScore}%)` : ''}</span>
          </div>
        )}

        {/* Multiple People Alert Banner */}
        {faceStatus === 'multiple' && (
          <div className="absolute bottom-9 left-1/2 -translate-x-1/2 z-20 bg-purple-600/95 text-white font-semibold text-3xs py-0.5 px-2.5 rounded-full shadow-md flex items-center gap-1 border border-purple-400/60 whitespace-nowrap animate-in fade-in">
            <Users className="size-2.5 shrink-0" />
            <span>Multiple People ({faceCount} Faces)</span>
          </div>
        )}

        {/* Physical Book / Material Banner */}
        {bookDetected && !phoneDetected && faceStatus !== 'absent' && (
          <div className="absolute bottom-9 left-1/2 -translate-x-1/2 z-20 bg-amber-500/95 text-black font-semibold text-3xs py-0.5 px-2.5 rounded-full shadow-md flex items-center gap-1 border border-amber-300 whitespace-nowrap animate-in fade-in">
            <BookOpen className="size-2.5 shrink-0" />
            <span>Prohibited Material / Book</span>
          </div>
        )}

        {/* Face Occluded / Covered Banner */}
        {faceOccluded && !phoneDetected && faceStatus !== 'multiple' && faceStatus !== 'absent' && (
          <div className="absolute bottom-9 left-1/2 -translate-x-1/2 z-20 bg-amber-500/95 text-black font-semibold text-3xs py-0.5 px-2.5 rounded-full shadow-md flex items-center gap-1 border border-amber-300 whitespace-nowrap animate-in fade-in">
            <ShieldAlert className="size-2.5 shrink-0" />
            <span>Face Occluded</span>
          </div>
        )}

        {/* ── LIVE FACE FRAMING RETICLE (70% Target Zone) ── */}
        <div
          className={cn(
            'absolute inset-3 rounded-xl border border-dashed transition-all duration-300 pointer-events-none',
            faceStatus === 'absent' && 'border-red-500/60 bg-red-500/[0.04]',
            faceStatus !== 'absent' && phoneDetected && 'border-red-500/80 bg-red-500/[0.04]',
            faceStatus !== 'absent' && !phoneDetected && faceOccluded && 'border-amber-400/80 bg-amber-500/[0.04]',
            faceStatus !== 'absent' && !phoneDetected && !faceOccluded && faceStatus === 'verified' && 'border-primary/40 bg-primary/[0.02]',
            faceStatus !== 'absent' && !phoneDetected && !faceOccluded && faceStatus === 'partial' && 'border-amber-400/60 bg-amber-500/[0.04]',
            faceStatus !== 'absent' && !phoneDetected && !faceOccluded && faceStatus === 'multiple' && 'border-purple-500/60 bg-purple-500/[0.04]',
            faceStatus !== 'absent' && !phoneDetected && !faceOccluded && faceStatus === 'detecting' && 'border-muted-foreground/20'
          )}
        />

        {/* Overlay Biometrics Diagnostics Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {/* Face Status Pill */}
          <div
            className={cn(
              'px-2 py-0.5 rounded text-3xs font-semibold uppercase backdrop-blur-md transition-all',
              faceStatus === 'absent' && 'bg-red-500 text-white shadow-sm shadow-red-500/20',
              faceStatus !== 'absent' && phoneDetected && 'bg-red-500 text-white shadow-sm shadow-red-500/20',
              faceStatus !== 'absent' && !phoneDetected && faceOccluded && 'bg-amber-500 text-black shadow-sm shadow-amber-500/20',
              faceStatus !== 'absent' && !phoneDetected && !faceOccluded && faceStatus === 'verified' && 'bg-black/60 text-emerald-400 border border-emerald-500/30 shadow-sm',
              faceStatus !== 'absent' && !phoneDetected && !faceOccluded && faceStatus === 'partial' && 'bg-amber-500 text-black shadow-sm shadow-amber-500/20',
              faceStatus !== 'absent' && !phoneDetected && !faceOccluded && faceStatus === 'multiple' && 'bg-purple-600 text-white shadow-sm shadow-purple-600/20',
              faceStatus !== 'absent' && !phoneDetected && !faceOccluded && faceStatus === 'detecting' && 'bg-black/60 text-muted-foreground'
            )}
          >
            {faceStatus === 'absent' && 'Face: Missing'}
            {faceStatus !== 'absent' && phoneDetected && 'Phone Alert'}
            {faceStatus !== 'absent' && !phoneDetected && faceOccluded && 'Covered'}
            {faceStatus !== 'absent' && !phoneDetected && !faceOccluded && faceStatus === 'verified' && `Face: ${faceInScreenPercent}%`}
            {faceStatus !== 'absent' && !phoneDetected && !faceOccluded && faceStatus === 'partial' && `Face: ${faceInScreenPercent}%`}
            {faceStatus !== 'absent' && !phoneDetected && !faceOccluded && faceStatus === 'multiple' && `Multiple (${faceCount})`}
            {faceStatus !== 'absent' && !phoneDetected && !faceOccluded && faceStatus === 'detecting' && 'Calibrating'}
          </div>

          {/* Gaze Status Pill */}
          <div
            className={cn(
              'px-2 py-0.5 rounded text-3xs font-semibold uppercase backdrop-blur-md flex items-center gap-1 transition-all',
              (phoneDetected || faceOccluded || gazeStatus === 'no_face') && 'bg-black/70 text-zinc-400 border border-white/5',
              !phoneDetected && !faceOccluded && gazeStatus === 'centered' && 'bg-black/60 text-emerald-400 border border-emerald-500/30',
              !phoneDetected && !faceOccluded && gazeStatus === 'diverted' && 'bg-amber-500 text-black shadow-sm shadow-amber-500/20'
            )}
          >
            <Eye className="size-2.5" />
            <span>
              {phoneDetected || faceOccluded || gazeStatus === 'no_face'
                ? 'No Face'
                : gazeStatus === 'centered'
                ? 'Gaze: OK'
                : 'Looking Away'}
            </span>
          </div>
        </div>

        {/* Audio Level Meter Overlay */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-2 py-1 rounded-md">
          <Mic className={cn('size-3 shrink-0', audioLevel > 28 ? 'text-amber-400' : 'text-primary')} />
          <div className="h-1.5 flex-1 bg-muted/60 rounded-full overflow-hidden flex">
            <div
              className={cn(
                'h-full transition-all duration-75',
                audioLevel > 50 ? 'bg-red-500' : audioLevel > 28 ? 'bg-amber-400' : 'bg-primary'
              )}
              style={{ width: `${Math.min(100, Math.max(5, audioLevel * 1.5))}%` }}
            />
          </div>
          <span className="text-3xs text-muted-foreground font-mono">{audioLevel}%</span>
        </div>
      </div>
    </div>
  );
}
