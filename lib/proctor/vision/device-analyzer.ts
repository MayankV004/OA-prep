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
  const imgData = ctx.getImageData(0, 0, 160, 120);
  const data = imgData.data;

  // Candidate Head/Hair Exclusion Zone
  // A candidate's own head, hair, glasses, beard, and collar must never be flagged as a phone
  let headLeft = -1;
  let headRight = -1;
  let headTop = -1;
  let headBottom = -1;

  if (candidate && candidate.boxWidth > 12 && candidate.boxHeight > 12) {
    const halfW = Math.max(16, candidate.boxWidth * 0.75);
    headLeft = candidate.centroidX - halfW;
    headRight = candidate.centroidX + halfW;
    // Exclude top hair/scalp to chin/neck
    headTop = candidate.centroidY - candidate.boxHeight * 0.95;
    headBottom = candidate.centroidY + candidate.boxHeight * 0.85;
  }

  // 1. Track Illuminated Mobile Screen Clusters (Bright neutral emissive display)
  let sCount = 0;
  let sMinX = 160, sMaxX = 0, sMinY = 120, sMaxY = 0;

  // 2. Track Dark Handheld Device Bodies (Solid black/gray rectangular phone slabs)
  let dCount = 0;
  let dMinX = 160, dMaxX = 0, dMinY = 120, dMaxY = 0;

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

      // Illuminated mobile screen: high brightness neutral/blue-white emissive light
      const isScreenLit =
        pr > 195 && pg > 195 && pb > 195 &&
        Math.abs(pr - pg) < 18 && Math.abs(pr - pb) < 18;

      // Dark phone slab: very dark non-reflective pixels (excluding bottom lap/desk edge)
      const isDarkPhone = py < 106 && pr < 30 && pg < 30 && pb < 30;

      if (isScreenLit) {
        sCount++;
        if (px < sMinX) sMinX = px;
        if (px > sMaxX) sMaxX = px;
        if (py < sMinY) sMinY = py;
        if (py > sMaxY) sMaxY = py;
      } else if (isDarkPhone) {
        dCount++;
        if (px < dMinX) dMinX = px;
        if (px > dMaxX) dMaxX = px;
        if (py < dMinY) dMinY = py;
        if (py > dMaxY) dMaxY = py;
      }
    }
  }

  // Evaluate Screen Detection
  const sW = Math.max(0, sMaxX - sMinX);
  const sH = Math.max(0, sMaxY - sMinY);
  const sAspect = sH > 0 && sW > 0 ? (sH >= sW ? sH / sW : sW / sH) : 0;
  // Step is 2, so sampled pixels in bounding box = (sW / 2) * (sH / 2)
  const sSampledGridPoints = Math.max(1, (sW / 2) * (sH / 2));
  const sDensity = sCount / sSampledGridPoints;

  const isScreenPhone =
    sCount >= 28 &&
    sW >= 12 && sW <= 55 &&
    sH >= 18 && sH <= 80 &&
    sAspect >= 1.25 && sAspect <= 2.6 &&
    sDensity >= 0.35; // Dense solid rectangle, NOT diffuse ambient wall light

  // Evaluate Dark Handheld Device Body
  const dW = Math.max(0, dMaxX - dMinX);
  const dH = Math.max(0, dMaxY - dMinY);
  const dAspect = dH > 0 && dW > 0 ? (dH >= dW ? dH / dW : dW / dH) : 0;
  const dSampledGridPoints = Math.max(1, (dW / 2) * (dH / 2));
  const dDensity = dCount / dSampledGridPoints;

  const isDarkPhoneDetected =
    dCount >= 40 &&
    dW >= 14 && dW <= 48 &&
    dH >= 22 && dH <= 75 &&
    dAspect >= 1.30 && dAspect <= 2.5 &&
    dDensity >= 0.40; // Dense solid slab, NOT scattered ambient shadows

  const isPhoneDetected = isScreenPhone || isDarkPhoneDetected;
  const bestW = isScreenPhone ? sW : dW;
  const bestH = isScreenPhone ? sH : dH;
  const bestAspect = isScreenPhone ? sAspect : dAspect;

  return {
    isPhoneDetected,
    phoneScreenPixels: sCount,
    phoneDarkPixels: dCount,
    aspectRatio: bestAspect,
    boxWidth: bestW,
    boxHeight: bestH,
  };
}
