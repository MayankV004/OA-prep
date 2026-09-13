import { describe, it, expect } from 'vitest';
import { evaluateWithFallback } from '@/lib/runner/mock-fallback';
import { buildExecutableSource } from '@/lib/runner/harness';

describe('Code Execution Engine & Harness (lib/runner/)', () => {
  describe('Deterministic Mock Fallback (mock-fallback.ts)', () => {
    it('fails submissions with minimal or empty code', () => {
      const result = evaluateWithFallback(
        'class Solution: pass',
        'python',
        [{ input: '1, 2', expectedOutput: '3' }],
        'math',
        'class Solution:\n    def add(self, a, b):\n        pass'
      );

      expect(result.allPassed).toBe(false);
      expect(result.passedCount).toBe(0);
      expect(result.results[0].passed).toBe(false);
    });

    it('passes substantive code that addresses the pattern keywords', () => {
      const validCode = `
class Solution {
    int minSubArrayLen(int target, vector<int>& nums) {
        int left = 0, sum = 0, minlen = INT_MAX;
        for (int right = 0; right < nums.size(); right++) {
            sum += nums[right];
            while (sum >= target) {
                minlen = min(minlen, right - left + 1);
                sum -= nums[left++];
            }
        }
        return minlen == INT_MAX ? 0 : minlen;
    }
};`;

      const result = evaluateWithFallback(
        validCode,
        'cpp',
        [
          { input: 'target = 7, nums = [2,3,1,2,4,3]', expectedOutput: '2' },
          { input: 'target = 4, nums = [1,4,4]', expectedOutput: '1' },
        ],
        'sliding window',
        'class Solution { int minSubArrayLen(int target, vector<int>& nums) {} };'
      );

      expect(result.allPassed).toBe(true);
      expect(result.passedCount).toBe(2);
      expect(result.results[0].passed).toBe(true);
    });
  });

  describe('Harness Wrapper Generator (harness.ts)', () => {
    it('generates executable Python harness injecting arguments and runner', () => {
      const pythonUserCode = `
class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        lookup = {}
        for i, n in enumerate(nums):
            diff = target - n
            if diff in lookup:
                return [lookup[diff], i]
            lookup[n] = i
        return []
`;
      const input = 'nums = [2,7,11,15], target = 9';
      const executable = buildExecutableSource(pythonUserCode, 'python', input);

      expect(executable).toContain('import sys');
      expect(executable).toContain('nums = [2,7,11,15]');
      expect(executable).toContain('target = 9');
      expect(executable).toContain('twoSum(nums, target)');
    });

    it('generates executable C++ harness injecting main and headers', () => {
      const cppUserCode = `
class Solution {
public:
    int add(int a, int b) {
        return a + b;
    }
};
`;
      const input = 'a = 3, b = 7';
      const executable = buildExecutableSource(cppUserCode, 'cpp', input);

      expect(executable).toContain('#include <iostream>');
      expect(executable).toContain('int main()');
      expect(executable).toContain('Solution solver;');
      expect(executable).toContain('solver.add(a, b)');
    });

    it('generates executable Java harness injecting main method', () => {
      const javaUserCode = `
class Solution {
    public int multiply(int a, int b) {
        return a * b;
    }
}
`;
      const input = 'a = 4, b = 5';
      const executable = buildExecutableSource(javaUserCode, 'java', input);

      expect(executable).toContain('public static void main(String[] args)');
      expect(executable).toContain('Solution sol = new Solution();');
      expect(executable).toContain('sol.multiply(a, b)');
    });
  });
});
