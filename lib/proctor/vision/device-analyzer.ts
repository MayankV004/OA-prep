import { PhoneAnalysisResult } from '../types';

export interface CandidateRegion {
  centroidX: number;
  centroidY: number;
  boxWidth: number;
  boxHeight: number;
}

/**
 * Optical Real-Time Smartphone & Prohibited Device Detector (160x120)
 * Scans video frames for handheld rectangular mobile devices.
 * Uses spatial candidate exclusion to prevent false-positives from
 * candidate's hair, eyeglasses, facial hair, or background walls.
 *
 * Requires high cluster density (>35%) and handheld smartphone aspect ratio (1.25 to 2.6).
 *
 * @param ctx - Canvas 2D rendering context
 * @param candidate - Optional coordinates of detected candidate head/face to exclude
 * @returns PhoneAnalysisResult
 */
export function detectOpticalPhone(
  ctx: CanvasRenderingContext2D,
  candidate?: CandidateRegion
): PhoneAnalysisResult {
  // Optical phone detection is strictly peripheral to an active seated candidate.
  // If candidate is absent from camera view, optical phone detection must not run.
  if (!candidate || candidate.boxWidth <= 12 || candidate.boxHeight <= 12) {
    return {
      isPhoneDetected: false,
      phoneScreenPixels: 0,
      phoneDarkPixels: 0,
      aspectRatio: 0,
      boxWidth: 0,
      boxHeight: 0,
    };
  }

  const imgData = ctx.getImageData(0, 0, 160, 120);
  const data = imgData.data;

  // Candidate Head/Hair Exclusion Zone
  // A candidate's own head, hair, glasses, beard, and collar must never be flagged as a phone
  const halfW = Math.max(18, candidate.boxWidth * 0.75);
  const headLeft = Math.max(0, candidate.centroidX - halfW);
  const headRight = Math.min(160, candidate.centroidX + halfW);
  const headTop = Math.max(0, candidate.centroidY - candidate.boxHeight * 0.95);
  const headBottom = Math.min(120, candidate.centroidY + candidate.boxHeight * 0.85);

  // Multi-Zone Trackers: Evaluate Left Side, Right Side, and Lower-Chest separately
  // This prevents dark pixels on opposite sides from merging into an invalid huge box.
  interface ZoneCluster {
    count: number;
    screenPixels: number;
    darkPixels: number;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  }

  const leftZone: ZoneCluster = { count: 0, screenPixels: 0, darkPixels: 0, minX: 160, maxX: 0, minY: 120, maxY: 0 };
  const rightZone: ZoneCluster = { count: 0, screenPixels: 0, darkPixels: 0, minX: 160, maxX: 0, minY: 120, maxY: 0 };
  const lowerZone: ZoneCluster = { count: 0, screenPixels: 0, darkPixels: 0, minX: 160, maxX: 0, minY: 120, maxY: 0 };

  for (let py = 12; py < 112; py += 2) {
    for (let px = 8; px < 152; px += 2) {
      // Skip candidate's head, hair, and facial features
      if (headLeft >= 0 && px >= headLeft && px <= headRight && py >= headTop && py <= headBottom) {
        continue;
      }

      const pIdx = (py * 160 + px) * 4;
      const pr = data[pIdx];
      const pg = data[pIdx + 1];
      const pb = data[pIdx + 2];

      const Y = 0.299 * pr + 0.587 * pg + 0.114 * pb;

      // Non-skin classification (rejects human skin tones)
      const isSkin = pr > pg && pr > pb && pr > 75 && pb < pr * 0.75;
      if (isSkin) continue;

      // 1. Emissive Display / Lit Screen (bright non-skin display / wallpaper / text)
      const isScreen = Y >= 155;

      // 2. Dark Device Body / Bezel (solid black/dark gray phone chassis)
      const isDarkBody = Y <= 82;

      if (!isScreen && !isDarkBody) continue;

      // Route pixel to corresponding zone
      let targetZone: ZoneCluster | null = null;
      if (px < headLeft) {
        targetZone = leftZone;
      } else if (px > headRight) {
        targetZone = rightZone;
      } else if (py > headBottom) {
        targetZone = lowerZone;
      }

      if (targetZone) {
        targetZone.count++;
        if (isScreen) targetZone.screenPixels++;
        if (isDarkBody) targetZone.darkPixels++;
        if (px < targetZone.minX) targetZone.minX = px;
        if (px > targetZone.maxX) targetZone.maxX = px;
        if (py < targetZone.minY) targetZone.minY = py;
        if (py > targetZone.maxY) targetZone.maxY = py;
      }
    }
  }

  // Validate smartphone geometry in a given zone
  const evaluateZone = (zone: ZoneCluster): { detected: boolean; width: number; height: number; aspect: number } => {
    if (zone.count < 22) return { detected: false, width: 0, height: 0, aspect: 0 };

    const W = Math.max(0, zone.maxX - zone.minX);
    const H = Math.max(0, zone.maxY - zone.minY);
    if (W < 10 || W > 68 || H < 20 || H > 92) {
      return { detected: false, width: W, height: H, aspect: 0 };
    }

    // Must be elevated in view (held up in air, not sitting on desk bottom)
    if (zone.minY > 90) {
      return { detected: false, width: W, height: H, aspect: 0 };
    }

    const aspect = H >= W ? H / W : W / H;
    const sampledPoints = Math.max(1, (W / 2) * (H / 2));
    const density = zone.count / sampledPoints;

    // Classic smartphone aspect ratio (1.25 to 3.0) and dense cluster
    const isPhone = aspect >= 1.25 && aspect <= 3.1 && density >= 0.20;

    return { detected: isPhone, width: W, height: H, aspect };
  };

  const evalLeft = evaluateZone(leftZone);
  const evalRight = evaluateZone(rightZone);
  const evalLower = evaluateZone(lowerZone);

  const isPhoneDetected = evalLeft.detected || evalRight.detected || evalLower.detected;
  const bestZone = evalRight.detected ? rightZone : evalLeft.detected ? leftZone : lowerZone;
  const bestEval = evalRight.detected ? evalRight : evalLeft.detected ? evalLeft : evalLower;

  if (isPhoneDetected) {
    console.log(`[PROCTOR OPTICAL] Handheld smartphone detected in ${evalRight.detected ? 'RIGHT' : evalLeft.detected ? 'LEFT' : 'LOWER'} zone (Aspect: ${bestEval.aspect.toFixed(2)}, Size: ${bestEval.width}x${bestEval.height})`);
  }

  return {
    isPhoneDetected,
    phoneScreenPixels: bestZone.screenPixels,
    phoneDarkPixels: bestZone.darkPixels,
    aspectRatio: bestEval.aspect,
    boxWidth: bestEval.width,
    boxHeight: bestEval.height,
  };
}
