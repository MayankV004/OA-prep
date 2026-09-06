'use client';

import type { ObjectDetection } from '@tensorflow-models/coco-ssd';
import { NeuralDeviceResult, NeuralDetectedObject } from '../types';

let cocoModel: ObjectDetection | null = null;
let cocoPromise: Promise<ObjectDetection | null> | null = null;

/**
 * Initializes and caches the COCO-SSD (MobileNet) neural object detector.
 * Specifically trained on 80 COCO categories including 'cell phone', 'person', 'book', 'laptop'.
 * Uses promise singleton to prevent React Strict Mode duplicate-mount race conditions.
 */
export async function initNeuralDeviceModel(): Promise<ObjectDetection | null> {
  if (typeof window === 'undefined') return null;
  if (cocoModel) return cocoModel;
  if (cocoPromise) return cocoPromise;

  cocoPromise = (async () => {
    try {
      const tf = await import('@tensorflow/tfjs');
      await tf.ready();

      const cocoSsd = await import('@tensorflow-models/coco-ssd');
      cocoModel = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
      console.log('COCO-SSD MobileNet neural device model loaded successfully');
      return cocoModel;
    } catch (err: any) {
      console.warn('COCO-SSD neural model failed to load, using optical fallback:', err);
      return null;
    } finally {
      cocoPromise = null;
    }
  })();

  return cocoPromise;
}

/**
 * Throttled Neural Prohibited Device & Secondary Person Detection (Runs ~1 FPS)
 * Scans video frames for smartphones, physical books, and extra people.
 *
 * @param input - HTMLVideoElement or HTMLCanvasElement
 */
export async function detectNeuralDevices(
  input: HTMLVideoElement | HTMLCanvasElement
): Promise<NeuralDeviceResult | null> {
  if (!cocoModel) {
    const loaded = await initNeuralDeviceModel();
    if (!loaded) return null;
  }

  try {
    // Run inference with low threshold (0.20) to capture handheld devices at tilted angles
    const rawPredictions = await cocoModel!.detect(input, 10, 0.20);

    let isPhoneDetected = false;
    let phoneScore = 0;
    let isBookDetected = false;
    let personCount = 0;
    const detectedObjects: NeuralDetectedObject[] = [];

    for (const pred of rawPredictions) {
      const label = pred.class.toLowerCase();
      const score = pred.score;
      const bbox = pred.bbox;

      // 1. Mobile Smartphone Detection
      // COCO classifies handheld phones as either 'cell phone' or 'remote'
      const isCellPhone = (label === 'cell phone' || label.includes('phone')) && score >= 0.32;
      const isRemote = label === 'remote' && score >= 0.42;
      if (isCellPhone || isRemote) {
        isPhoneDetected = true;
        const normalizedScore = Math.round(score * 100);
        if (normalizedScore > phoneScore) phoneScore = normalizedScore;
        detectedObjects.push({ label: 'cell phone', score, bbox });
        console.log(`[PROCTOR NEURAL] Device detected: ${label} (${normalizedScore}%)`);
      }

      // 2. Physical Reference Material / Textbook (COCO Class: 'book')
      else if (label === 'book' && score >= 0.40) {
        isBookDetected = true;
        detectedObjects.push({ label: 'book', score, bbox });
        console.log(`[PROCTOR NEURAL] Book detected: (${Math.round(score * 100)}%)`);
      }

      // 3. Human Count (COCO Class: 'person')
      else if (label === 'person' && score >= 0.50) {
        personCount++;
        detectedObjects.push({ label: 'person', score, bbox });
      }

      // 4. Secondary Laptop / Display (COCO Classes: 'laptop', 'tv')
      else if ((label === 'laptop' || label === 'tv') && score >= 0.50) {
        detectedObjects.push({ label, score, bbox });
      }
    }

    // Flag multiple people if 2 or more distinct person bodies are identified
    const isMultiplePeopleDetected = personCount >= 2;

    return {
      isPhoneDetected,
      isMultiplePeopleDetected,
      isBookDetected,
      phoneScore,
      detectedObjects,
    };
  } catch (err) {
    console.warn('Neural device detection error:', err);
    return null;
  }
}
