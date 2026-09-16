import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateRevisionNotes } from '@/lib/ai/revision-notes';

describe('AI Revision Notes Generator (lib/ai/revision-notes.ts)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('generates high-yield deterministic template when no GROQ_API_KEY is present', async () => {
    delete process.env.GROQ_API_KEY;

    const result = await generateRevisionNotes({
      problemTitle: '3Sum',
      patternTitle: 'Two Pointers',
      difficulty: 'Medium',
      existingNotes: 'Watch out for duplicate triplets.',
    });

    expect(result).toContain('### 💡 Core Intuition');
    expect(result).toContain('### 📐 Invariant & Pattern Formula');
    expect(result).toContain('### ⚠️ Deadly Edge Cases & Pitfalls');
    expect(result).toContain('### ⏱️ Complexity');
    expect(result).toContain('Watch out for duplicate triplets.');
    expect(result).toContain('Two Pointers');
  });

  it('calls Groq API when GROQ_API_KEY is configured and returns formatted LLM notes', async () => {
    process.env.GROQ_API_KEY = 'gsk_valid_test_key_12345';

    const mockAiResponse = `### 💡 Core Intuition (The "Aha!" Moment)
* Sorting the array allows a two-pointer contraction.

### 📐 Invariant & Pattern Formula
* Fix first element at \`i\`, then run two pointers on the remainder.

### ⚠️ Deadly Edge Cases & Pitfalls
* Remember to skip adjacent duplicate values.

### ⏱️ Complexity
* Time: O(N^2), Space: O(1) auxiliary.`;

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: mockAiResponse } }],
      }),
    } as any);

    const result = await generateRevisionNotes({
      problemTitle: '3Sum',
      patternTitle: 'Two Pointers',
      difficulty: 'Medium',
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockAiResponse);
  });

  it('falls back gracefully to deterministic notes if Groq API returns non-200', async () => {
    process.env.GROQ_API_KEY = 'gsk_valid_test_key_12345';

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as any);

    const result = await generateRevisionNotes({
      problemTitle: 'LRU Cache',
      patternTitle: 'Design / Linked List + Hash',
      difficulty: 'Medium',
    });

    expect(result).toContain('### 💡 Core Intuition');
    expect(result).toContain('Design / Linked List + Hash');
  });
});
