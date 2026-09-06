'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraOff, Mic, MicOff, AlertCircle, Eye, Shield, ShieldAlert, Smartphone, Minimize2, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ProctorViolationEvent,
  FaceStatus,
  GazeStatus,
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

  // Face Detection & Prohibited Object State
  const [faceStatus, setFaceStatus] = useState<FaceStatus>('detecting');
  const [faceInScreenPercent, setFaceInScreenPercent] = useState<number>(0);
  const [gazeStatus, setGazeStatus] = useState<GazeStatus>('no_face');
  const [phoneDetected, setPhoneDetected] = useState(false);
  const [faceOccluded, setFaceOccluded] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Consecutive counters for debouncing alerts
  const partialOrAbsentStreak = useRef(0);
  const gazeDivertedStreak = useRef(0);
  const voiceActivityStreak = useRef(0);
  const lastViolationTime = useRef<Record<string, number>>({});

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

  // 4. Continuous Face Detection, Gaze & Device Check Loop (Runs every 450ms)
  const runVisionAnalysis = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !hasCamera) return;

    if (video.readyState < 2 || video.videoWidth === 0) {
      setFaceStatus('detecting');
      setFaceInScreenPercent(0);
      setGazeStatus('no_face');
      return;
    }

    const videoW = video.videoWidth || 320;
    const videoH = video.videoHeight || 240;

    // Option A: Check Chromium Native Shape Detection API if available
    const hasNativeFaceDetector = typeof (window as any).FaceDetector !== 'undefined';
    if (hasNativeFaceDetector) {
      try {
        const detector = new (window as any).FaceDetector({ fastMode: true, maxDetectedFaces: 4 });
        const faces = await detector.detect(video);

        if (!faces || faces.length === 0) {
          handleFaceCalculation(0, false, 0.5, false, false);
          return;
        }

        if (faces.length > 1) {
          handleFaceCalculation(100, true, 0.5, false, false);
          if (shouldTriggerViolation('multiple_faces', 15000)) {
            onViolation({
              type: 'multiple_faces',
              details: `Multiple people detected in camera frame (${faces.length} faces)`,
            });
          }
          return;
        }

        const face = faces[0].boundingBox;
        const visibleW = Math.max(0, Math.min(videoW, face.x + face.width) - Math.max(0, face.x));
        const visibleH = Math.max(0, Math.min(videoH, face.y + face.height) - Math.max(0, face.y));
        const visibleArea = visibleW * visibleH;
        const totalArea = Math.max(1, face.width * face.height);

        let inScreenPercent = Math.round((visibleArea / totalArea) * 100);

        const faceCenterY = face.y + face.height / 2;
        if (faceCenterY > videoH * 0.74) {
          inScreenPercent = Math.min(inScreenPercent, 30);
        } else if (faceCenterY < videoH * 0.24) {
          inScreenPercent = Math.min(inScreenPercent, 30);
        }

        const faceCenterX = face.x + face.width / 2;
        const horizontalRatio = faceCenterX / videoW;

        handleFaceCalculation(inScreenPercent, false, horizontalRatio, false, false);
        return;
      } catch {
        // Fallback to high-performance modular canvas heuristic
      }
    }

    // Option B: Real-time Modular Computer Vision Heuristics (160x120)
    let canvas = analysisCanvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 120;
      analysisCanvasRef.current = canvas;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Run modular face & ocular occlusion analysis
    const faceResult = analyzeFaceFrame(ctx, video);

    // Run modular optical phone & prohibited device analysis (excluding candidate's head/hair)
    const phoneResult = detectOpticalPhone(ctx, faceResult);

    handleFaceCalculation(
      faceResult.inScreenPercent,
      false,
      faceResult.horizontalGazeRatio,
      faceResult.isCovered,
      phoneResult.isPhoneDetected
    );
  }, [hasCamera]);

  const handleFaceCalculation = (
    percent: number,
    isMultiple: boolean,
    horizontalGazeRatio: number,
    isCovered: boolean = false,
    isPhone: boolean = false
  ) => {
    setPhoneDetected(isPhone);
    setFaceOccluded(isCovered);

    if (isPhone) {
      if (shouldTriggerViolation('phone', 3500)) {
        onViolation({
          type: 'prohibited_object_detected',
          details: 'Mobile phone detected in camera view',
        });
      }
    }

    if (isCovered) {
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

    setFaceInScreenPercent(percent);

    if (isMultiple) {
      setFaceStatus('multiple');
      setGazeStatus('no_face');
      return;
    }

    // Continuous 70% In-Screen Rule:
    if (percent === 0) {
      partialOrAbsentStreak.current += 1;
      setFaceStatus('absent');
      setGazeStatus('no_face');

      if (shouldTriggerViolation('absence', 3500)) {
        onViolation({
          type: 'no_face_detected',
          details: 'Candidate absent or face covered from camera view (0% face detected)',
        });
      }
      return;
    }

    if (percent < 70) {
      // Face is present, but less than 70% visible in the screen!
      partialOrAbsentStreak.current += 1;
      setFaceStatus('partial');
      setGazeStatus('no_face');

      if (shouldTriggerViolation('partial_face', 3500)) {
        onViolation({
          type: 'no_face_detected',
          details: `Face only ${percent}% visible in frame (less than 70% threshold). Please center your face.`,
        });
      }
      return;
    }

    // Face is >= 70% visible and verified
    partialOrAbsentStreak.current = 0;
    setFaceStatus('verified');

    // Evaluate Gaze Tracking ONLY when face is verified and >= 70% in frame
    if (horizontalGazeRatio < 0.28 || horizontalGazeRatio > 0.72) {
      gazeDivertedStreak.current += 1;
      if (gazeDivertedStreak.current >= 3) {
        setGazeStatus('diverted');
        if (shouldTriggerViolation('gaze', 10000)) {
          onViolation({
            type: 'gaze_diverted',
            details: `Off-screen gaze detected (${horizontalGazeRatio < 0.28 ? 'Looking left' : 'Looking right'} for >3s)`,
          });
        }
      }
    } else {
      gazeDivertedStreak.current = 0;
      setGazeStatus('centered');
    }
  };

  useEffect(() => {
    if (!hasCamera) return;
    const visionInterval = setInterval(runVisionAnalysis, 450);
    return () => clearInterval(visionInterval);
  }, [hasCamera, runVisionAnalysis]);

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
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
          </span>
          <span className="font-bold text-foreground tracking-wide">REC • PROCTOR</span>
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

        {/* Prohibited Device / Phone Banner (Slim compact floating badge) */}
        {phoneDetected && (
          <div className="absolute bottom-9 left-1/2 -translate-x-1/2 z-20 bg-red-600/95 text-white font-semibold text-3xs py-0.5 px-2.5 rounded-full shadow-md flex items-center gap-1 border border-red-400/60 whitespace-nowrap animate-in fade-in">
            <Smartphone className="size-2.5 shrink-0" />
            <span>Phone Detected</span>
          </div>
        )}

        {/* Face Occluded / Covered Banner (Slim compact floating badge) */}
        {faceOccluded && !phoneDetected && (
          <div className="absolute bottom-9 left-1/2 -translate-x-1/2 z-20 bg-amber-500/95 text-black font-semibold text-3xs py-0.5 px-2.5 rounded-full shadow-md flex items-center gap-1 border border-amber-300 whitespace-nowrap animate-in fade-in">
            <ShieldAlert className="size-2.5 shrink-0" />
            <span>Face Occluded</span>
          </div>
        )}

        {/* ── LIVE FACE FRAMING RETICLE (70% Target Zone) ── */}
        <div
          className={cn(
            'absolute inset-3 rounded-xl border border-dashed transition-all duration-300 pointer-events-none',
            phoneDetected && 'border-red-500/80 bg-red-500/[0.04]',
            !phoneDetected && faceOccluded && 'border-amber-400/80 bg-amber-500/[0.04]',
            !phoneDetected && !faceOccluded && faceStatus === 'verified' && 'border-primary/40 bg-primary/[0.02]',
            !phoneDetected && !faceOccluded && faceStatus === 'partial' && 'border-amber-400/60 bg-amber-500/[0.04]',
            !phoneDetected && !faceOccluded && faceStatus === 'absent' && 'border-red-500/60 bg-red-500/[0.04]',
            !phoneDetected && !faceOccluded && faceStatus === 'multiple' && 'border-purple-500/60 bg-purple-500/[0.04]',
            !phoneDetected && !faceOccluded && faceStatus === 'detecting' && 'border-muted-foreground/20'
          )}
        />

        {/* Overlay Biometrics Diagnostics Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {/* Face Status Pill */}
          <div
            className={cn(
              'px-2 py-0.5 rounded text-3xs font-semibold uppercase backdrop-blur-md transition-all',
              phoneDetected && 'bg-red-500 text-white shadow-sm shadow-red-500/20',
              !phoneDetected && faceOccluded && 'bg-amber-500 text-black shadow-sm shadow-amber-500/20',
              !phoneDetected && !faceOccluded && faceStatus === 'verified' && 'bg-black/60 text-emerald-400 border border-emerald-500/30 shadow-sm',
              !phoneDetected && !faceOccluded && faceStatus === 'partial' && 'bg-amber-500 text-black shadow-sm shadow-amber-500/20',
              !phoneDetected && !faceOccluded && faceStatus === 'absent' && 'bg-red-500 text-white shadow-sm shadow-red-500/20',
              !phoneDetected && !faceOccluded && faceStatus === 'multiple' && 'bg-purple-600 text-white shadow-sm shadow-purple-600/20',
              !phoneDetected && !faceOccluded && faceStatus === 'detecting' && 'bg-black/60 text-muted-foreground'
            )}
          >
            {phoneDetected && 'Phone Alert'}
            {!phoneDetected && faceOccluded && 'Covered'}
            {!phoneDetected && !faceOccluded && faceStatus === 'verified' && `Face: ${faceInScreenPercent}%`}
            {!phoneDetected && !faceOccluded && faceStatus === 'partial' && `Face: ${faceInScreenPercent}%`}
            {!phoneDetected && !faceOccluded && faceStatus === 'absent' && 'Face: Missing'}
            {!phoneDetected && !faceOccluded && faceStatus === 'multiple' && 'Multiple!'}
            {!phoneDetected && !faceOccluded && faceStatus === 'detecting' && 'Calibrating'}
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
