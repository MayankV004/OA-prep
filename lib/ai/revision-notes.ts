export interface GenerateRevisionNotesInput {
  problemTitle: string;
  patternTitle?: string;
  difficulty?: string;
  existingNotes?: string;
}

/**
 * Builds system & user prompt tailored for high-retention interview revision
 */
function buildRevisionPrompt(input: GenerateRevisionNotesInput): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `You are a Principal Software Engineer and elite competitive programming coach. 
Your task is to write high-yield, ultra-concise interview revision notes ("Cram Cards") for algorithmic coding problems.
Guidelines:
- Do NOT write lengthy textbook explanations or giant full code files.
- Focus on high-retention memory anchors: the core aha! intuition, invariant/state, deadly edge cases that trigger WA (Wrong Answer), and tight Big-O.
- Format strictly in clean GitHub Markdown with emojis and bold highlights.
- If the user already provided draft notes, integrate their personal thoughts seamlessly into the structured sections.`;

  const userPrompt = `Generate a high-yield interview revision card for this problem:
Problem: ${input.problemTitle}
Pattern / Category: ${input.patternTitle || 'Data Structures & Algorithms'}
Difficulty: ${input.difficulty || 'Medium'}
${input.existingNotes?.trim() ? `User's Draft Notes:\n"""\n${input.existingNotes.trim()}\n"""` : ''}

Format your response exactly with these 4 sections:
### 💡 Core Intuition (The "Aha!" Moment)
(1-2 bullet points explaining the key mental model / why this pattern works)

### 📐 Invariant & Pattern Formula
(The critical loop invariant, base case, or state transition equation, plus 4-6 lines of clean pseudocode/idiomatic pattern logic)

### ⚠️ Deadly Edge Cases & Pitfalls
(2-3 critical pitfalls that cause Wrong Answer or TLE, e.g. duplicates, empty arrays, integer overflow, boundary off-by-one)

### ⏱️ Complexity
(Big-O Time and Space complexity breakdown)`;

  return { systemPrompt, userPrompt };
}

/**
 * Deterministic fallback generator when LLM API keys are not present
 */
function generateDeterministicNotes(input: GenerateRevisionNotesInput): string {
  const pattern = input.patternTitle || 'Data Structures & Algorithms';
  const difficulty = input.difficulty || 'Medium';
  const existingNotes = input.existingNotes?.trim();

  return `### 💡 Core Intuition (The "Aha!" Moment)
* Identify the monotonic or invariant property specific to **${pattern}** to prune the brute-force search space.
* Look for repeated subproblems or boundary decisions before committing to an approach.

### 📐 Invariant & Pattern Formula
* **Approach**: ${pattern}
* **Difficulty Level**: ${difficulty}
\`\`\`text
1. Initialize primary pointers / data structures.
2. Maintain invariant across the active window/state.
3. Update global answer whenever valid state is reached.
4. Contract / transition state when constraints are violated.
\`\`\`

### ⚠️ Deadly Edge Cases & Pitfalls
* **Empty / Single-element inputs**: Verify boundaries ($N=0$ or $N=1$).
* **Duplicates & Zeroes**: Ensure pointers or visited sets handle duplicate entries properly.
* **Overflow / Boundary conditions**: Check for integer overflow or off-by-one index calculations.

### ⏱️ Complexity
* **Time Complexity**: $O(N)$ or $O(N \\log N)$ depending on sorting/data structure overhead.
* **Space Complexity**: $O(1)$ auxiliary or $O(N)$ for state tracking.

${existingNotes ? `\n---\n#### 📝 My Original Notes\n${existingNotes}` : ''}`.trim();
}

/**
 * Generates structured interview revision notes using Groq Llama 3.3 or deterministic fallback
 */
export async function generateRevisionNotes(input: GenerateRevisionNotesInput): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey.startsWith('gsk_dummy')) {
    return generateDeterministicNotes(input);
  }

  const { systemPrompt, userPrompt } = buildRevisionPrompt(input);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 1000,
      }),
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`Groq API returned status ${res.status}, falling back to deterministic template`);
      return generateDeterministicNotes(input);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (content && content.length > 50) {
      return content;
    }

    return generateDeterministicNotes(input);
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn('Groq AI notes generation failed or timed out, using fallback:', err?.message || err);
    return generateDeterministicNotes(input);
  }
}
