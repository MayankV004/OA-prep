export interface GenerateRevisionNotesInput {
  problemTitle: string;
  patternTitle?: string;
  difficulty?: string;
  existingNotes?: string;
  language?: string;
}

/**
 * Builds system & user prompt tailored for high-retention interview revision
 */
function buildRevisionPrompt(input: GenerateRevisionNotesInput): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `You are a Principal Software Engineer and elite competitive programming coach.
Your task is to write high-yield, ultra-concise interview revision notes for algorithmic coding problems.

Guidelines:
- Do NOT use emojis anywhere in your response (no emoji icons in headings, bullet points, or text).
- Be ultra-concise, direct, and fast: avoid long conversational introductions, boilerplate, or filler text.
- Explain the approach to the problem in 2-3 clear, simple bullet points so any engineer can quickly grasp the intuition.
- Under Correct Code, provide concise, optimal, and correct code implementations in all three major interview languages: C++, Java, and Python. Focus on the core solution class/method without excessive boilerplate.
- Format each language implementation as consecutive code blocks with their respective language identifiers (\`\`\`cpp, \`\`\`java, \`\`\`python) so they render as interactive language toggles (like LeetCode solution tabs).
- Under Edge Cases, provide 3-4 critical pitfalls in bullet points.
- Under Complexity, provide exact Big-O Time and Space complexity breakdown.
- If the user already provided draft notes, integrate their personal thoughts seamlessly into the structured sections.
- Format strictly in clean GitHub Markdown.`;

  const userPrompt = `Generate interview revision notes for this problem:
Problem: ${input.problemTitle}
Pattern / Category: ${input.patternTitle || 'Data Structures & Algorithms'}
Difficulty: ${input.difficulty || 'Medium'}
${input.existingNotes?.trim() ? `User's Draft Notes:\n"""\n${input.existingNotes.trim()}\n"""` : ''}

Format your response strictly with the following 4 sections and do NOT use any emojis:

### Approach
(2-3 concise bullet points explaining the core intuition and step-by-step logic in simple language)

### Correct Code
(Provide concise, optimal, and correct code implementations in C++, Java, and Python. Format them as consecutive code blocks so they form interactive language toggle tabs:
\`\`\`cpp
// C++ solution
\`\`\`

\`\`\`java
// Java solution
\`\`\`

\`\`\`python
# Python solution
\`\`\`
)

### Edge Cases
(3-4 bullet points detailing key edge cases and boundary conditions)

### Complexity
(Exact Big-O Time and Space complexity breakdown)`;

  return { systemPrompt, userPrompt };
}

/**
 * Deterministic fallback generator when LLM API keys are not present
 */
function generateDeterministicNotes(input: GenerateRevisionNotesInput): string {
  const pattern = input.patternTitle || 'Data Structures & Algorithms';
  const difficulty = input.difficulty || 'Medium';
  const existingNotes = input.existingNotes?.trim();

  return `### Approach
* Understand the problem and identify the underlying pattern: **${pattern}** (Difficulty: ${difficulty}).
* Break down the solution into simple steps: process the input sequentially, maintain required state or invariants, and compute the result efficiently without redundant work.

### Correct Code
\`\`\`cpp
class Solution {
public:
    int solve(vector<int>& nums) {
        // Base / boundary check
        if (nums.empty()) return 0;

        int result = 0;
        // Process elements following the ${pattern} approach
        for (int num : nums) {
            // Update state and evaluate condition
        }
        return result;
    }
};
\`\`\`

\`\`\`java
class Solution {
    public int solve(int[] nums) {
        // Base / boundary check
        if (nums == null || nums.length == 0) return 0;

        int result = 0;
        // Process elements following the ${pattern} approach
        for (int num : nums) {
            // Update state and evaluate condition
        }
        return result;
    }
}
\`\`\`

\`\`\`python
class Solution:
    def solve(self, nums: list[int]) -> int:
        # Base / boundary check
        if not nums:
            return 0

        result = 0
        # Process elements following the ${pattern} approach
        for num in nums:
            # Update state and evaluate condition
            pass
        return result
\`\`\`

### Edge Cases
* Empty or single-element inputs (e.g., N = 0 or N = 1).
* Duplicate values or uniform elements.
* Extreme values, negative numbers, or integer overflow.
* Boundary conditions at array or string limits.

### Complexity
* Time Complexity: O(N) or O(N log N) depending on sorting/data structure operations.
* Space Complexity: O(1) auxiliary space or O(N) for state tracking.

${existingNotes ? `\n---\n#### User Notes\n${existingNotes}` : ''}`.trim();
}

/**
 * Calls NVIDIA NIM API (e.g. Nemotron-3-Ultra-550B, Nemotron-4-340B, Llama-3.1-Nemotron-70B)
 */
async function callNvidiaNemotron(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string | null> {
  const candidateModels = [
    process.env.NVIDIA_MODEL,
    'nvidia/nemotron-3-ultra-550b-a55b',
    'nvidia/llama-3.1-nemotron-70b-instruct',
    'nvidia/nemotron-4-340b-instruct',
  ].filter(Boolean) as string[];

  for (const model of candidateModels) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    try {
      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.2,
          max_tokens: 2000,
        }),
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn(`NVIDIA NIM (${model}) returned status ${res.status}`);
        continue;
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      if (content && content.length > 50) {
        return content;
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn(`NVIDIA NIM (${model}) call failed:`, err?.message || err);
    }
  }

  return null;
}

/**
 * Calls Groq chat completions with model fallback
 */
async function callGroqWithFallback(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string | null> {
  const candidateModels = [
    process.env.GROQ_MODEL,
    'qwen/qwen3.8-27b',
    'groq/compound',
    'openai/gpt-oss-120b',
    'llama-3.3-70b-versatile',
  ].filter(Boolean) as string[];

  for (const model of candidateModels) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.1,
          max_tokens: 1600,
        }),
      });

      clearTimeout(timeoutId);

      if (res.status === 404) {
        console.warn(`Groq model ${model} not found (404), trying next candidate...`);
        continue;
      }

      if (!res.ok) {
        console.warn(`Groq API (${model}) returned status ${res.status}`);
        continue;
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      if (content && content.length > 50) {
        return content;
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn(`Groq call (${model}) failed:`, err?.message || err);
    }
  }

  return null;
}

/**
 * Generates structured interview revision notes using NVIDIA Nemotron, Groq, HuggingFace, or deterministic fallback
 */
export async function generateRevisionNotes(input: GenerateRevisionNotesInput): Promise<string> {
  const { systemPrompt, userPrompt } = buildRevisionPrompt(input);

  // 1. Try NVIDIA Nemotron if configured (e.g. Nemotron-3-Ultra-550B)
  const nvidiaApiKey = process.env.NVIDIA_API_KEY || process.env.NVIDIA_NIM_API_KEY;
  if (nvidiaApiKey && !nvidiaApiKey.startsWith('nvapi_dummy')) {
    const nvidiaResult = await callNvidiaNemotron(nvidiaApiKey, systemPrompt, userPrompt);
    if (nvidiaResult) {
      return nvidiaResult;
    }
  }

  // 2. Try Groq if configured
  const groqApiKey = process.env.GROQ_API_KEY;
  if (groqApiKey && !groqApiKey.startsWith('gsk_dummy')) {
    const groqResult = await callGroqWithFallback(groqApiKey, systemPrompt, userPrompt);
    if (groqResult) {
      return groqResult;
    }
  }

  // 3. Try Hugging Face if configured
  const hfApiKey = process.env.HUGGINGFACE_API_KEY;
  if (hfApiKey && !hfApiKey.startsWith('hf_dummy')) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const res = await fetch('https://router.huggingface.co/hf-inference/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${hfApiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'Qwen/Qwen2.5-Coder-32B-Instruct',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.2,
          max_tokens: 2500,
        }),
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content && content.length > 50) {
          return content;
        }
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn('Hugging Face AI notes generation failed:', err?.message || err);
    }
  }

  // 4. Fallback to high-yield deterministic template
  return generateDeterministicNotes(input);
}
