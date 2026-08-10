import { PatternData } from '@/types/pattern';

export const prefix_sum: PatternData = {
  "slug": "prefix-sum",
  "title": "Prefix Sum",
  "description": "Precompute cumulative sums of an array to answer range sum queries in O(1) time. Often combined with hash maps to find subarrays with specific properties.",
  "timeComplexity": "O(n) to build, O(1) per query",
  "spaceComplexity": "O(n) for the prefix array or hash map",
  "useCases": [
    "Range sum queries",
    "Subarray sum equals K",
    "Contiguous array (0s and 1s)",
    "2D range sum"
  ],
  "concept": "The core idea is to precompute the cumulative sum of an array up to each index.\nFor an array `A`, `prefix[i] = A[0] + A[1] + ... + A[i]`.\nTo find the sum of a subarray from index `i` to `j`, you can simply compute `prefix[j] - prefix[i - 1]`.\n\n> **Key insight**: When looking for a subarray that sums to `K`, instead of checking all subarrays, keep a running sum and check if `(running_sum - K)` has been seen before using a Hash Map.",
  "templateCode": "class NumArray {\n    private int[] prefix;\n\n    public NumArray(int[] nums) {\n        prefix = new int[nums.length + 1];\n        for (int i = 0; i < nums.length; i++) {\n            prefix[i + 1] = prefix[i] + nums[i];\n        }\n    }\n    \n    public int sumRange(int left, int right) {\n        return prefix[right + 1] - prefix[left];\n    }\n}",
  "explanation": "- Calculating sum/product/XOR of elements in a contiguous range\n- The problem asks for a subarray with a specific sum or property\n- The array contains negative numbers (where Sliding Window fails)",
  "variations": [
    {
      "id": "1d",
      "title": "1D Prefix Sum",
      "concept": "Compute sum from index 0 to i. Sum of range [i, j] is prefix[j] - prefix[i-1].",
      "templateCode": "class NumMatrix {\n    private int[][] dp;\n\n    public NumMatrix(int[][] matrix) {\n        if (matrix.length == 0 || matrix[0].length == 0) return;\n        int m = matrix.length, n = matrix[0].length;\n        dp = new int[m + 1][n + 1];\n        \n        for (int r = 0; r < m; r++) {\n            for (int c = 0; c < n; c++) {\n                dp[r + 1][c + 1] = dp[r + 1][c] + dp[r][c + 1] + matrix[r][c] - dp[r][c];\n            }\n        }\n    }\n    \n    public int sumRegion(int row1, int col1, int row2, int col2) {\n        return dp[row2 + 1][col2 + 1] - dp[row1][col2 + 1] - dp[row2 + 1][col1] + dp[row1][col1];\n    }\n}"
    },
    {
      "id": "hashmap",
      "title": "Prefix Sum with Hash Map",
      "concept": "Store prefix sums in a hash map to quickly find if a complementary prefix sum exists (e.g., prefix[current] - target).",
      "templateCode": "import java.util.HashMap;\n\nclass Solution {\n    public int subarraySum(int[] nums, int k) {\n        int count = 0, sum = 0;\n        HashMap<Integer, Integer> map = new HashMap<>();\n        map.put(0, 1); // Base case: a prefix sum of 0 exists at the start\n        \n        for (int num : nums) {\n            sum += num;\n            if (map.containsKey(sum - k)) {\n                count += map.get(sum - k);\n            }\n            map.put(sum, map.getOrDefault(sum, 0) + 1);\n        }\n        \n        return count;\n    }\n}"
    },
    {
      "id": "2d",
      "title": "2D Prefix Sum",
      "concept": "Compute cumulative sums in a 2D grid to query submatrix sums in O(1) time.",
      "templateCode": "class NumMatrix {\n    private int[][] dp;\n\n    public NumMatrix(int[][] matrix) {\n        if (matrix.length == 0 || matrix[0].length == 0) return;\n        int m = matrix.length, n = matrix[0].length;\n        dp = new int[m + 1][n + 1];\n        \n        for (int r = 0; r < m; r++) {\n            for (int c = 0; c < n; c++) {\n                dp[r + 1][c + 1] = dp[r + 1][c] + dp[r][c + 1] + matrix[r][c] - dp[r][c];\n            }\n        }\n    }\n    \n    public int sumRegion(int row1, int col1, int row2, int col2) {\n        return dp[row2 + 1][col2 + 1] - dp[row1][col2 + 1] - dp[row2 + 1][col1] + dp[row1][col1];\n    }\n}"
    }
  ]
};
