/**
 * Web Audio API Acoustic Speech & Volume Analyzer
 */

export interface AcousticSetupResult {
  audioContext: AudioContext;
  analyser: AnalyserNode;
}

/**
 * Initializes the Web Audio API context and frequency analyser node
 */
export function setupAcousticAnalyzer(stream: MediaStream): AcousticSetupResult | null {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;

    const ctx = new AudioContextClass();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    return { audioContext: ctx, analyser };
  } catch (err) {
    console.warn('Web Audio API initialization failed:', err);
    return null;
  }
}

/**
 * Computes normalized RMS audio level (0 - 100%) from frequency data
 */
export function computeRmsVolume(analyser: AnalyserNode, dataArray: Uint8Array): number {
  analyser.getByteFrequencyData(dataArray as any);

  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i] * dataArray[i];
  }
  const rms = Math.sqrt(sum / dataArray.length);
  return Math.min(100, Math.round((rms / 128) * 100));
}
