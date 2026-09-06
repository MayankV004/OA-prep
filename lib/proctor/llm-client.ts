import { IActivityAnalysisInput } from './types';

/**
 * Builds the structured technical prompt for LLM forensic assessment analysis
 */
export function buildProctorPrompt(input: IActivityAnalysisInput): string {
  return `Analyze this online assessment candidate session:
Company & Role Assessment: ${input.company} - ${input.assessmentTitle}
Total Score: ${input.totalScore}/${input.maxScore}
Time Spent: ${Math.round(input.timeSpentSeconds / 60)} minutes
Cheating Risk Score: ${input.cheatingRiskPercentage}% (Verdict: ${input.integrityVerdict})

Proctoring Telemetry Metrics:
- Tab Switches: ${input.tabSwitchCount} (Total Away Time: ${input.timeAwaySeconds}s)
- Blocked Paste Attempts: ${input.pasteAttemptsBlocked}
- Keystrokes Logged: ${input.keystrokesCount}
- Camera Enabled: ${input.cameraEnabled ? 'Yes' : 'No'}
- Microphone Enabled: ${input.micEnabled ? 'Yes' : 'No'}
- Face Absences (stepped away from camera): ${input.faceAbsenceCount}
- Multiple Faces Detected (extra persons): ${input.multipleFacesCount}
- Gaze Deviations (looking away from screen >3s): ${input.gazeDivertedCount}
- Voice / Audio Activity Detected: ${input.voiceInterruptionCount}

Problem Solved Summary:
${input.problems
  .map(
    (p, i) =>
      `Problem ${i + 1}: ${p.title} (${p.patternTag}) -> Score: ${p.score}, Passed: ${p.passedTestCases}/${p.totalTestCases} cases, Status: ${p.status}, Time: ${Math.round(p.timeSpentSeconds / 60)}m`
  )
  .join('\n')}

Recent Audit Timeline Events:
${input.timeline
  .slice(0, 8)
  .map((e) => `[${new Date(e.timestamp).toLocaleTimeString()}] ${e.type}: ${e.details || ''}`)
  .join('\n')}

Format your report into 4 clear markdown sections:
1. Executive Integrity Summary (Verdict, overall honesty rating, risk breakdown)
2. Visual & Acoustic Biometrics Analysis (Face presence, off-screen gaze patterns, audio/voice analysis)
3. Code Writing Cadence & Keyboard Dynamics (Typing natural rhythm, blocked paste attempts, focus continuity)
4. Official Proctor Recommendation (Hire / Review Recording / Disqualify)
Keep it concise, rigorous, and professional.`;
}

/**
 * Calls open-source Llama-3.3-70B via Groq for sub-second inference
 */
export async function callGroqLlama(input: IActivityAnalysisInput, apiKey: string): Promise<string> {
  const prompt = buildProctorPrompt(input);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert Technical Assessment Proctor and Senior Engineering Hiring Auditor. Your job is to analyze candidate telemetry during an algorithmic online assessment and write a professional, objective behavioral forensic report.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    clearTimeout(timeoutId);
    if (!res.ok) return '';

    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  } catch {
    clearTimeout(timeoutId);
    return '';
  }
}

/**
 * Calls Hugging Face Serverless Inference API with open-source instruction models
 */
export async function callHuggingFaceInference(input: IActivityAnalysisInput, apiKey: string): Promise<string> {
  const prompt = buildProctorPrompt(input);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        inputs: `<s>[INST] ${prompt} [/INST]`,
        parameters: { max_new_tokens: 700, temperature: 0.3 },
      }),
    });

    clearTimeout(timeoutId);
    if (!res.ok) return '';

    const data = await res.json();
    if (Array.isArray(data) && data[0]?.generated_text) {
      return data[0].generated_text.replace(/<s>\[INST\][\s\S]*?\[\/INST\]/, '').trim();
    }
    return '';
  } catch {
    clearTimeout(timeoutId);
    return '';
  }
}
