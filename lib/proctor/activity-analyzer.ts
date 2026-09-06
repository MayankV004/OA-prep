import { IActivityAnalysisInput } from './types';
import { callGroqLlama, callHuggingFaceInference } from './llm-client';
import { generateDeterministicForensicReport } from './deterministic-fallback';

export type { IActivityAnalysisInput };

/**
 * Generate a comprehensive candidate behavioral & integrity analysis
 * Orchestrates external LLMs (Groq / Hugging Face) with an automated deterministic fallback.
 *
 * @param input - The complete telemetry, score, and problem results
 * @returns Formatted forensic markdown report
 */
export async function generateActivityAnalysis(input: IActivityAnalysisInput): Promise<string> {
  // 1. Check for external LLM API configurations (Groq / HuggingFace)
  const groqApiKey = process.env.GROQ_API_KEY;
  const hfApiKey = process.env.HUGGINGFACE_API_KEY;

  if (groqApiKey) {
    try {
      const result = await callGroqLlama(input, groqApiKey);
      if (result && result.trim().length > 100) return result;
    } catch (err) {
      console.warn('Groq LLM activity analysis fallback:', err);
    }
  } else if (hfApiKey) {
    try {
      const result = await callHuggingFaceInference(input, hfApiKey);
      if (result && result.trim().length > 100) return result;
    } catch (err) {
      console.warn('Hugging Face LLM activity analysis fallback:', err);
    }
  }

  // 2. High-precision deterministic behavioral synthesizer fallback
  return generateDeterministicForensicReport(input);
}
