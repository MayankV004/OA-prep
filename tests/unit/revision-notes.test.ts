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

    expect(result).toContain('### Approach');
    expect(result).toContain('### Correct Code');
    expect(result).toContain('```cpp');
    expect(result).toContain('```java');
    expect(result).toContain('```python');
    expect(result).toContain('### Edge Cases');
    expect(result).toContain('### Complexity');
    expect(result).not.toMatch(/\p{Extended_Pictographic}/u);
    expect(result).toContain('Watch out for duplicate triplets.');
    expect(result).toContain('Two Pointers');
  });

  it('calls Groq API when GROQ_API_KEY is configured and returns formatted LLM notes', async () => {
    process.env.GROQ_API_KEY = 'gsk_valid_test_key_12345';

    const mockAiResponse = `### Approach
* Sort the input array to enable a two-pointer scan.
* Fix the first element at index i, then use two pointers left and right to find pairs that sum to the target.

### Correct Code
\`\`\`cpp
class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        vector<vector<int>> res;
        sort(nums.begin(), nums.end());
        return res;
    }
};
\`\`\`

\`\`\`java
class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        List<List<Integer>> res = new ArrayList<>();
        Arrays.sort(nums);
        return res;
    }
}
\`\`\`

\`\`\`python
class Solution:
    def threeSum(self, nums: list[int]) -> list[list[int]]:
        nums.sort()
        res = []
        return res
\`\`\`

### Edge Cases
* Array length less than 3 (returns empty list).
* Duplicate triplets (handled by skipping consecutive equal elements).
* All positive or all negative values.

### Complexity
* Time Complexity: O(N^2) for the two-pointer scan after O(N log N) sorting.
* Space Complexity: O(1) auxiliary space (excluding output array).`;

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
    expect(result).toContain('```cpp');
    expect(result).toContain('```java');
    expect(result).toContain('```python');
    expect(result).not.toMatch(/\p{Extended_Pictographic}/u);

    // Verify prompt sent to Groq includes our updated requirements
    const fetchBody = JSON.parse((fetchSpy.mock.calls[0][1] as any).body);
    const systemMessage = fetchBody.messages.find((m: any) => m.role === 'system')?.content;
    const userMessage = fetchBody.messages.find((m: any) => m.role === 'user')?.content;

    expect(systemMessage).toContain('Do NOT use emojis anywhere');
    expect(systemMessage).toContain('Explain the approach to the problem');
    expect(systemMessage).toContain('C++, Java, and Python');
    expect(systemMessage).toContain('interactive language toggles');
    expect(systemMessage).toContain('Edge Cases');
    expect(systemMessage).toContain('Time and Space complexity');

    expect(userMessage).toContain('### Approach');
    expect(userMessage).toContain('### Correct Code');
    expect(userMessage).toContain('```cpp');
    expect(userMessage).toContain('```java');
    expect(userMessage).toContain('```python');
    expect(userMessage).toContain('### Edge Cases');
    expect(userMessage).toContain('### Complexity');
  });

  it('falls back gracefully to deterministic notes if Groq API returns non-200', async () => {
    process.env.GROQ_API_KEY = 'gsk_valid_test_key_12345';

    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
    } as any);

    const result = await generateRevisionNotes({
      problemTitle: 'LRU Cache',
      patternTitle: 'Design / Linked List + Hash',
      difficulty: 'Medium',
    });

    expect(result).toContain('### Approach');
    expect(result).toContain('### Correct Code');
    expect(result).toContain('```cpp');
    expect(result).toContain('```java');
    expect(result).toContain('```python');
    expect(result).toContain('### Edge Cases');
    expect(result).toContain('### Complexity');
    expect(result).not.toMatch(/\p{Extended_Pictographic}/u);
    expect(result).toContain('Design / Linked List + Hash');
  });

  it('calls NVIDIA NIM API when NVIDIA_API_KEY is configured and prioritizes it', async () => {
    process.env.NVIDIA_API_KEY = 'nvapi_test_key_12345';
    delete process.env.GROQ_API_KEY;

    const mockNvidiaResponse = `### Approach
* Use two pointers after sorting.

### Correct Code
\`\`\`cpp
// C++ Nemotron code
\`\`\`

\`\`\`java
// Java Nemotron code
\`\`\`

\`\`\`python
# Python Nemotron code
\`\`\`

### Edge Cases
* Array size < 3.

### Complexity
* Time: O(N^2), Space: O(1)`;

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: mockNvidiaResponse } }],
      }),
    } as any);

    const result = await generateRevisionNotes({
      problemTitle: '3Sum',
      patternTitle: 'Two Pointers',
      difficulty: 'Medium',
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toBe('https://integrate.api.nvidia.com/v1/chat/completions');
    expect(result).toBe(mockNvidiaResponse);
  });
});
