import { FaceAnalysisResult, FaceStatus, GazeStatus } from '../types';

/**
 * High-performance real-time Canvas Computer Vision Face & Gaze Analyzer (160x120)
 * Evaluates YCbCr skin chrominance, feature contrast, edge boundary containment,
 * and ocular eye-band occlusion.
 *
 * @param ctx - Canvas 2D rendering context
 * @param video - HTML5 video element source
 * @returns FaceAnalysisResult
 */
export function analyzeFaceFrame(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement
): FaceAnalysisResult {
  ctx.drawImage(video, 0, 0, 160, 120);
  const imgData = ctx.getImageData(0, 0, 160, 120);
  const data = imgData.data;

  let totalSkinPixels = 0;
  let minX = 160;
  let maxX = 0;
  let minY = 120;
  let maxY = 0;
  let sumX = 0;
  let sumY = 0;

  let sumL = 0;
  let sumL2 = 0;

  // Scan central region with step 2 for sub-millisecond execution
  for (let y = 8; y < 114; y += 2) {
    for (let x = 8; x < 152; x += 2) {
      const idx = (y * 160 + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const sum = r + g + b;
      if (sum < 85 || sum > 710) continue; // Ignore dark shadow / blown-out ceiling lights

      // Normalized chromaticity
      const normR = r / sum;
      const normG = g / sum;

      // YCbCr transformation
      const Y = 0.299 * r + 0.587 * g + 0.114 * b;
      const Cb = -0.1687 * r - 0.3313 * g + 0.5 * b + 128;
      const Cr = 0.5 * r - 0.4187 * g - 0.0813 * b + 128;

      // Human skin tone & feature chromaticity filter (Kovac / Chai & Ngan model)
      const isSkin =
        normR >= 0.36 &&
        normR <= 0.56 &&
        normG >= 0.27 &&
        normG <= 0.38 &&
        normR > normG &&
        Cr >= 134 &&
        Cr <= 176 &&
        Cb >= 76 &&
        Cb <= 126 &&
        Cr > Cb;

      if (isSkin) {
        totalSkinPixels++;
        sumX += x;
        sumY += y;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;

        sumL += Y;
        sumL2 += Y * Y;
      }
    }
  }

  // 1. Minimum face mass check: candidate absent from frame
  if (totalSkinPixels < 50) {
    return {
      inScreenPercent: 0,
      faceStatus: 'absent',
      gazeStatus: 'no_face',
      horizontalGazeRatio: 0.5,
      isCovered: false,
      totalSkinPixels: 0,
      boxWidth: 0,
      boxHeight: 0,
      centroidX: 80,
      centroidY: 60,
    };
  }

  // 2. Feature contrast check (flat painted walls/ceilings have low variance)
  const meanL = sumL / totalSkinPixels;
  const varianceL = sumL2 / totalSkinPixels - meanL * meanL;
  const stdDevL = Math.sqrt(Math.max(0, varianceL));
  if (stdDevL < 6.5) {
    return {
      inScreenPercent: 0,
      faceStatus: 'absent',
      gazeStatus: 'no_face',
      horizontalGazeRatio: 0.5,
      isCovered: false,
      totalSkinPixels,
      boxWidth: maxX - minX,
      boxHeight: maxY - minY,
      centroidX: 80,
      centroidY: 60,
    };
  }

  // 3. Compute Centroid & Bounding Box
  const centroidX = sumX / totalSkinPixels;
  const centroidY = sumY / totalSkinPixels;
  const boxWidth = maxX - minX;
  const boxHeight = maxY - minY;

  // 4. True In-Screen Face Containment Percentage
  let inScreenPercent = 100;

  // Check severe horizontal edge cut-off (e.g. sliding out of view)
  if (minX <= 2) {
    const visibleRatio = Math.min(1.0, boxWidth / 30);
    inScreenPercent = Math.min(inScreenPercent, Math.round(visibleRatio * 100));
  } else if (maxX >= 158) {
    const visibleRatio = Math.min(1.0, boxWidth / 30);
    inScreenPercent = Math.min(inScreenPercent, Math.round(visibleRatio * 100));
  }

  // Check severe vertical edge cut-off (e.g. ducking completely below camera view)
  if (centroidY > 98 || minY > 75) {
    // Face is ducking down off-screen
    const visibleH = Math.max(0, 120 - minY);
    const visibleRatio = Math.min(1.0, visibleH / 35);
    inScreenPercent = Math.min(inScreenPercent, Math.round(visibleRatio * 100));
  } else if (minY <= 2 && centroidY < 25) {
    // Face is rising up off-screen
    const visibleH = Math.max(0, maxY);
    const visibleRatio = Math.min(1.0, visibleH / 35);
    inScreenPercent = Math.min(inScreenPercent, Math.round(visibleRatio * 100));
  }

  // Scale & distance check (only penalize if face is genuinely tiny/distant)
  if (totalSkinPixels < 35 || boxHeight < 16 || boxWidth < 14) {
    const scaleRatio = Math.min(1.0, totalSkinPixels / 40);
    inScreenPercent = Math.min(inScreenPercent, Math.round(scaleRatio * 100));
  }

  inScreenPercent = Math.min(100, Math.max(0, inScreenPercent));

  // 5. Ocular Eye-Band Occlusion (Anti-Hand Covering) Check
  let isCovered = false;

  if (totalSkinPixels >= 50 && boxHeight >= 28) {
    const eyeBandTop = minY + Math.round(boxHeight * 0.20);
    const eyeBandBottom = minY + Math.round(boxHeight * 0.52);
    const eyeBandLeft = minX + Math.round(boxWidth * 0.15);
    const eyeBandRight = maxX - Math.round(boxWidth * 0.15);

    let eyeZoneTotal = 0;
    let eyeZoneDarkPixels = 0;

    for (let ey = eyeBandTop; ey <= eyeBandBottom; ey += 2) {
      for (let ex = eyeBandLeft; ex <= eyeBandRight; ex += 2) {
        const idx = (ey * 160 + ex) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        eyeZoneTotal++;
        if (lum < meanL * 0.72 || lum < 65) {
          eyeZoneDarkPixels++;
        }
      }
    }

    const darkRatio = eyeZoneTotal > 12 ? eyeZoneDarkPixels / eyeZoneTotal : 0;

    // Bare palm covering face has virtually zero dark eye features
    if (eyeZoneTotal >= 18 && darkRatio < 0.04) {
      isCovered = true;
    }
  }

  // Horizontal gaze ratio: relative to canvas center
  const horizontalGazeRatio = centroidX / 160;

  // Determine face and gaze statuses
  let faceStatus: FaceStatus = 'verified';
  let gazeStatus: GazeStatus = 'centered';

  if (isCovered) {
    faceStatus = 'partial';
    inScreenPercent = Math.min(inScreenPercent, 20);
    gazeStatus = 'no_face';
  } else if (inScreenPercent < 70) {
    faceStatus = 'partial';
    gazeStatus = 'no_face';
  } else {
    faceStatus = 'verified';
    if (horizontalGazeRatio < 0.28 || horizontalGazeRatio > 0.72) {
      gazeStatus = 'diverted';
    } else {
      gazeStatus = 'centered';
    }
  }

  return {
    inScreenPercent,
    faceStatus,
    gazeStatus,
    horizontalGazeRatio,
    isCovered,
    totalSkinPixels,
    boxWidth,
    boxHeight,
    centroidX,
    centroidY,
  };
}
