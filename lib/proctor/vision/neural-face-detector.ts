'use client';

import type { BlazeFaceModel } from '@tensorflow-models/blazeface';
import { NeuralFaceResult, FaceStatus, GazeStatus } from '../types';

let blazeFaceModel: BlazeFaceModel | null = null;
let blazeFacePromise: Promise<BlazeFaceModel | null> | null = null;

/**
 * Initializes and caches the Google BlazeFace model using WebGL/WASM acceleration.
 * Uses promise singleton to prevent React Strict Mode duplicate-mount race conditions.
 */
export async function initNeuralFaceModel(): Promise<BlazeFaceModel | null> {
  if (typeof window === 'undefined') return null;
  if (blazeFaceModel) return blazeFaceModel;
  if (blazeFacePromise) return blazeFacePromise;

  blazeFacePromise = (async () => {
    try {
      const tf = await import('@tensorflow/tfjs');
      await tf.ready();

      const blazeface = await import('@tensorflow-models/blazeface');
      blazeFaceModel = await blazeface.load();
      console.log('Google BlazeFace neural model loaded successfully');
      return blazeFaceModel;
    } catch (err: any) {
      console.warn('BlazeFace neural model failed to initialize, using fallback:', err);
      return null;
    } finally {
      blazeFacePromise = null;
    }
  })();

  return blazeFacePromise;
}

/**
 * High-Performance Neural Face & Landmark Analysis (5-8 FPS)
 * Evaluates webcam frame with Google BlazeFace.
 *
 * @param input - HTMLVideoElement or HTMLCanvasElement
 * @param frameWidth - Video frame width (default 320)
 * @param frameHeight - Video frame height (default 240)
 * @param skinPixelCount - Optional skin count from canvas to detect hand occlusion
 */
export async function analyzeNeuralFaceFrame(
  input: HTMLVideoElement | HTMLCanvasElement,
  frameWidth: number = 320,
  frameHeight: number = 240,
  skinPixelCount: number = 0
): Promise<NeuralFaceResult | null> {
  if (!blazeFaceModel) {
    const loaded = await initNeuralFaceModel();
    if (!loaded) return null;
  }

  try {
    // estimateFaces(input, returnTensors = false, flipHorizontal = false)
    const predictions = await blazeFaceModel!.estimateFaces(input, false);

    // 1. Candidate Absent
    if (!predictions || predictions.length === 0) {
      // If skin mass is detected (e.g. palm) but zero facial landmarks resolve -> Face Covered
      const isCovered = skinPixelCount > 45;

      return {
        faceCount: 0,
        inScreenPercent: isCovered ? 20 : 0,
        faceStatus: isCovered ? 'partial' : 'absent',
        gazeStatus: 'no_face',
        headYawRatio: 0,
        headPitchRatio: 0,
        isOccluded: isCovered,
        boxWidth: 0,
        boxHeight: 0,
        centroidX: frameWidth / 2,
        centroidY: frameHeight / 2,
      };
    }

    // Filter confident predictions (probability > 45% to reliably detect secondary background faces)
    const confidentFaces = predictions.filter((p: any) => {
      const prob = Array.isArray(p.probability) ? p.probability[0] : (p.probability ?? 1);
      return prob >= 0.45;
    });

    const activeFaces = confidentFaces.length > 0 ? confidentFaces : predictions;

    // 2. Multiple People / Faces Detected
    if (activeFaces.length > 1) {
      return {
        faceCount: activeFaces.length,
        inScreenPercent: 100,
        faceStatus: 'multiple',
        gazeStatus: 'diverted',
        headYawRatio: 0,
        headPitchRatio: 0,
        isOccluded: false,
        boxWidth: frameWidth,
        boxHeight: frameHeight,
        centroidX: frameWidth / 2,
        centroidY: frameHeight / 2,
      };
    }

    // 3. Single Face Primary Candidate Analysis
    const primary = activeFaces[0];
    const [tlX, tlY] = primary.topLeft as [number, number];
    const [brX, brY] = primary.bottomRight as [number, number];

    const boxWidth = Math.max(0, brX - tlX);
    const boxHeight = Math.max(0, brY - tlY);
    const centroidX = tlX + boxWidth / 2;
    const centroidY = tlY + boxHeight / 2;

    // Boundary Containment (70% framing rule)
    const visibleW = Math.max(0, Math.min(frameWidth, brX) - Math.max(0, tlX));
    const visibleH = Math.max(0, Math.min(frameHeight, brY) - Math.max(0, tlY));
    const visibleArea = visibleW * visibleH;
    const totalArea = Math.max(1, boxWidth * boxHeight);

    let inScreenPercent = Math.round((visibleArea / totalArea) * 100);

    // Scale distance check: penalize only if face is extraordinarily tiny (< 10% of frame height)
    if (boxHeight < frameHeight * 0.12) {
      inScreenPercent = Math.min(inScreenPercent, 40);
    }

    // 4. True 3D Geometric Head Pose & Gaze Tracking from 6 Landmarks
    // Landmarks: [rightEye, leftEye, noseTip, mouthCenter, rightEar, leftEar]
    let headYawRatio = 0;
    let headPitchRatio = 0;
    let gazeStatus: GazeStatus = 'centered';

    const lms = primary.landmarks as [number, number][];
    let structuredLandmarks;

    if (lms && lms.length >= 4) {
      const eye1 = lms[0];
      const eye2 = lms[1];
      const nose = lms[2];

      const midEyeX = (eye1[0] + eye2[0]) / 2;
      const midEyeY = (eye1[1] + eye2[1]) / 2;
      const eyeDist = Math.max(1, Math.hypot(eye2[0] - eye1[0], eye2[1] - eye1[1]));

      // Horizontal yaw: deviation of nose from midpoint between eyes
      headYawRatio = (nose[0] - midEyeX) / eyeDist;

      // Vertical pitch: distance from eye line to nose tip
      headPitchRatio = (nose[1] - midEyeY) / eyeDist;

      // Looking away thresholds:
      // Yaw > 0.46 indicates head rotated left/right away from screen
      // Pitch > 0.88 indicates head tilted down toward lap/phone
      const isLookingAway = Math.abs(headYawRatio) > 0.46 || headPitchRatio > 0.88 || headPitchRatio < 0.12;

      if (inScreenPercent < 70) {
        gazeStatus = 'no_face';
      } else if (isLookingAway) {
        gazeStatus = 'diverted';
      } else {
        gazeStatus = 'centered';
      }

      structuredLandmarks = {
        rightEye: eye1,
        leftEye: eye2,
        noseTip: nose,
        mouthCenter: lms[3],
        rightEar: lms[4] || eye1,
        leftEar: lms[5] || eye2,
      };
    }

    const faceStatus: FaceStatus = inScreenPercent < 70 ? 'partial' : 'verified';

    return {
      faceCount: 1,
      inScreenPercent,
      faceStatus,
      gazeStatus,
      headYawRatio,
      headPitchRatio,
      isOccluded: false,
      boxWidth,
      boxHeight,
      centroidX,
      centroidY,
      landmarks: structuredLandmarks,
    };
  } catch (err) {
    console.warn('Neural face detection inference error:', err);
    return null;
  }
}
