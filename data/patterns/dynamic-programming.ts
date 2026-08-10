import { PatternData } from '@/types/pattern';

export const dynamic_programming: PatternData = {
  "slug": "dynamic-programming",
  "title": "Dynamic Programming",
  "description": "Break problems into overlapping subproblems, solve each once, and store results to avoid redundant computation.",
  "timeComplexity": "O(n²) or O(n×m) typical; problem-specific",
  "spaceComplexity": "O(n) or O(n×m); often reducible",
  "useCases": [
    "Fibonacci / climbing stairs",
    "Knapsack variants",
    "Longest common subsequence",
    "Coin change",
    "Edit distance"
  ],
  "concept": "DP works when a problem has:\n1. **Optimal substructure** — optimal solution is built from optimal sub-solutions\n2. **Overlapping subproblems** — same subproblem is solved multiple times in recursion\n\nThe two implementation styles:\n- **Top-down (Memoization)** — recursion + cache\n- **Bottom-up (Tabulation)** — iterative, fill a table\n\n> **Key insight**: Define the state `dp[i]` (or `dp[i][j]`) precisely: *\"the answer to the subproblem with parameter i (and j)\"*. Then write the recurrence.",
  "templateCode": "class Solution {\n    public int rob(int[] nums) {\n        if (nums.length == 1) return nums[0];\n\n        int[] dp = new int[nums.length];\n        dp[0] = nums[0];\n        dp[1] = Math.max(nums[0], nums[1]);\n\n        for (int i = 2; i < nums.length; i++) {\n            dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]);\n        }\n\n        return dp[nums.length - 1];\n    }\n    \n    // Space-optimized:\n    public int robOptimized(int[] nums) {\n        int prev2 = 0, prev1 = 0;\n        for (int n : nums) {\n            int temp = prev1;\n            prev1 = Math.max(prev1, prev2 + n);\n            prev2 = temp;\n        }\n        return prev1;\n    }\n}",
  "explanation": "- Counting ways to reach a goal\n- Finding the min/max cost to reach a target\n- Any problem asking \"can we achieve X?\" with overlapping sub-decisions\n- String comparison / alignment problems",
  "variations": [
    {
      "id": "1d",
      "title": "1-D DP (Linear)",
      "concept": "State depends only on a single index. Classic: Fibonacci, House Robber, Climbing Stairs.",
      "templateCode": "class Solution {\n    public int longestCommonSubsequence(String text1, String text2) {\n        int m = text1.length(), n = text2.length();\n        int[][] dp = new int[m + 1][n + 1];\n\n        for (int i = 1; i <= m; i++) {\n            for (int j = 1; j <= n; j++) {\n                if (text1.charAt(i - 1) == text2.charAt(j - 1)) {\n                    dp[i][j] = dp[i - 1][j - 1] + 1;\n                } else {\n                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);\n                }\n            }\n        }\n\n        return dp[m][n];\n    }\n}"
    },
    {
      "id": "2d",
      "title": "2-D DP (Grid / Two Sequences)",
      "concept": "State depends on two indices (i, j). Classic: LCS, Edit Distance, Unique Paths.",
      "templateCode": "class Solution {\n    public int longestCommonSubsequence(String text1, String text2) {\n        int m = text1.length(), n = text2.length();\n        int[][] dp = new int[m + 1][n + 1];\n\n        for (int i = 1; i <= m; i++) {\n            for (int j = 1; j <= n; j++) {\n                if (text1.charAt(i - 1) == text2.charAt(j - 1)) {\n                    dp[i][j] = dp[i - 1][j - 1] + 1;\n                } else {\n                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);\n                }\n            }\n        }\n\n        return dp[m][n];\n    }\n}"
    },
    {
      "id": "knapsack",
      "title": "Knapsack / Subset Sum",
      "concept": "0/1 or unbounded — can you pick items to hit a target? dp[i][w] = max value with i items and capacity w.",
      "templateCode": "class Solution {\n    public int knapsack(int[] weights, int[] values, int capacity) {\n        int n = weights.length;\n        int[][] dp = new int[n + 1][capacity + 1];\n\n        for (int i = 1; i <= n; i++) {\n            for (int w = 0; w <= capacity; w++) {\n                // Don't take item i-1\n                dp[i][w] = dp[i - 1][w];\n                // Take item i-1 if it fits\n                if (weights[i - 1] <= w) {\n                    dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - weights[i - 1]] + values[i - 1]);\n                }\n            }\n        }\n\n        return dp[n][capacity];\n    }\n}"
    },
    {
      "id": "interval",
      "title": "Interval DP",
      "concept": "State is a range [i, j]. Build answers for larger intervals from smaller ones. Classic: Matrix Chain, Burst Balloons.",
      "templateCode": "class Solution {\n    public int longestCommonSubsequence(String text1, String text2) {\n        int m = text1.length(), n = text2.length();\n        int[][] dp = new int[m + 1][n + 1];\n\n        for (int i = 1; i <= m; i++) {\n            for (int j = 1; j <= n; j++) {\n                if (text1.charAt(i - 1) == text2.charAt(j - 1)) {\n                    dp[i][j] = dp[i - 1][j - 1] + 1;\n                } else {\n                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);\n                }\n            }\n        }\n\n        return dp[m][n];\n    }\n}"
    },
    {
      "id": "bitmask",
      "title": "Bitmask DP",
      "concept": "State encodes a subset as a bitmask. Classic: Travelling Salesman, Shortest Path visiting all nodes.",
      "templateCode": "class Solution {\n    public int longestCommonSubsequence(String text1, String text2) {\n        int m = text1.length(), n = text2.length();\n        int[][] dp = new int[m + 1][n + 1];\n\n        for (int i = 1; i <= m; i++) {\n            for (int j = 1; j <= n; j++) {\n                if (text1.charAt(i - 1) == text2.charAt(j - 1)) {\n                    dp[i][j] = dp[i - 1][j - 1] + 1;\n                } else {\n                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);\n                }\n            }\n        }\n\n        return dp[m][n];\n    }\n}"
    }
  ]
};
