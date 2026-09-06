export interface SeedAssessmentProblem {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  score: number;
  patternTag: string;
  starterCode: {
    cpp: string;
    python: string;
    java: string;
  };
  testCases: Array<{
    input: string;
    expectedOutput: string;
    isHidden: boolean;
    explanation?: string;
  }>;
}

export interface SeedAssessment {
  title: string;
  slug: string;
  company: string;
  role: string;
  description: string;
  durationMinutes: number;
  passingScore: number;
  isProOnly: boolean;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  companyInstructions: string[];
  problems: SeedAssessmentProblem[];
}

export const COMPANY_OA_SEEDS: SeedAssessment[] = [
  {
    title: 'BigO Diagnostic Placement OA',
    slug: 'free-universal-diagnostic-oa',
    company: 'General',
    role: 'Campus & Off-Campus SDE',
    description: 'Diagnose your algorithmic speed, edge-case accuracy, and proctored exam pacing across core placement patterns.',
    durationMinutes: 45,
    passingScore: 70,
    isProOnly: false,
    difficulty: 'Medium',
    companyInstructions: [
      'This diagnostic test emulates modern coding assessment platforms (HackerRank/CodeSignal).',
      'You have 45 minutes to solve 2 questions.',
      'Hidden testcases verify boundary conditions and large constraint edge cases.',
      'Proctoring tracks tab switching, window blurring, and clipboard paste bursts.',
    ],
    problems: [
      {
        id: 'diag-1',
        title: 'Minimum Size Subarray Sum Bound',
        description: `Given an array of positive integers \`nums\` and a positive integer \`target\`, return the **minimal length** of a contiguous subarray \`[nums[l], nums[l+1], ..., nums[r-1], nums[r]]\` of which the sum is greater than or equal to \`target\`. If there is no such subarray, return \`0\` instead.

### Example 1:
\`\`\`
Input: target = 7, nums = [2,3,1,2,4,3]
Output: 2
Explanation: The subarray [4,3] has the minimal length under the problem constraint.
\`\`\`

### Example 2:
\`\`\`
Input: target = 4, nums = [1,4,4]
Output: 1
\`\`\`

### Constraints:
- \`1 <= target <= 10^9\`
- \`1 <= nums.length <= 10^5\`
- \`1 <= nums[i] <= 10^4\``,
        difficulty: 'Medium',
        score: 50,
        patternTag: 'Sliding Window',
        starterCode: {
          cpp: `int minSubArrayLen(int target, vector<int>& nums) {\n    // Write your solution here\n    return 0;\n}`,
          python: `def minSubArrayLen(target: int, nums: list[int]) -> int:\n    # Write your solution here\n    return 0`,
          java: `class Solution {\n    public int minSubArrayLen(int target, int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n}`,
        },
        testCases: [
          { input: 'target = 7, nums = [2,3,1,2,4,3]', expectedOutput: '2', isHidden: false },
          { input: 'target = 4, nums = [1,4,4]', expectedOutput: '1', isHidden: false },
          { input: 'target = 11, nums = [1,1,1,1,1,1,1,1]', expectedOutput: '0', isHidden: false },
          { input: 'target = 15, nums = [1,2,3,4,5]', expectedOutput: '5', isHidden: true, explanation: 'Full array needed' },
          { input: 'target = 213, nums = [12,28,83,4,25,26,25,2,25,25,25,12]', expectedOutput: '8', isHidden: true },
        ],
      },
      {
        id: 'diag-2',
        title: 'Daily Stock Price Spans',
        description: `Design an algorithm that collects daily price quotes for some stock and returns the **span** of that stock's price for the current day.

The **span** of the stock's price in one day is the maximum number of consecutive days (starting from that day and going backward) for which the stock price was less than or equal to the price of that day.

Given an array of daily prices \`prices\`, return an array \`spans\` of length \`n\` where \`spans[i]\` is the span of the stock on the \`i-th\` day.

### Example 1:
\`\`\`
Input: prices = [100,80,60,70,60,75,85]
Output: [1,1,1,2,1,4,6]
Explanation:
- Day 0 (100): span is 1
- Day 1 (80): 80 < 100, span is 1
- Day 2 (60): 60 < 80, span is 1
- Day 3 (70): 70 >= 60, span is 2 ([70, 60])
- Day 4 (60): span is 1
- Day 5 (75): 75 >= 60, 70, 60, span is 4 ([75, 60, 70, 60])
- Day 6 (85): 85 >= 75, 60, 70, 60, 80, span is 6
\`\`\`

### Constraints:
- \`1 <= prices.length <= 10^5\`
- \`1 <= prices[i] <= 10^5\``,
        difficulty: 'Medium',
        score: 50,
        patternTag: 'Monotonic Stack',
        starterCode: {
          cpp: `vector<int> calculateSpans(vector<int>& prices) {\n    // Write your solution here\n    return {};\n}`,
          python: `def calculateSpans(prices: list[int]) -> list[int]:\n    # Write your solution here\n    return []`,
          java: `class Solution {\n    public int[] calculateSpans(int[] prices) {\n        // Write your solution here\n        return new int[0];\n    }\n}`,
        },
        testCases: [
          { input: 'prices = [100,80,60,70,60,75,85]', expectedOutput: '[1,1,1,2,1,4,6]', isHidden: false },
          { input: 'prices = [31,41,48,49,50]', expectedOutput: '[1,2,3,4,5]', isHidden: false },
          { input: 'prices = [50,40,30,20,10]', expectedOutput: '[1,1,1,1,1]', isHidden: true, explanation: 'Strictly decreasing sequence' },
          { input: 'prices = [10,10,10,10]', expectedOutput: '[1,2,3,4]', isHidden: true, explanation: 'Flat duplicate values' },
        ],
      },
    ],
  },
  {
    title: 'Amazon SDE-1 High-Frequency OA (2026)',
    slug: 'amazon-sde1-oa-mock-1',
    company: 'Amazon',
    role: 'SDE-1 / Graduate Engineer',
    description: 'Authentic 90-minute online assessment simulation covering Amazon high-frequency sliding window and monotonic queue patterns.',
    durationMinutes: 90,
    passingScore: 75,
    isProOnly: true,
    difficulty: 'Medium',
    companyInstructions: [
      'Amazon Online Assessment format: 2 algorithmic problems in 90 minutes.',
      'Passing threshold: All visible testcases + at least 80% hidden scale testcases.',
      'Memory and time limits are strictly enforced (2.0 seconds per testcase).',
      'Tab navigation and copy-paste activity will be recorded in your proctoring audit.',
    ],
    problems: [
      {
        id: 'amzn-1',
        title: 'Optimized Delivery Hub Parcel Grouping',
        description: `Amazon Logistics processes parcels with priority weights. Given an array \`weights\` and a threshold \`k\`, determine the maximum number of parcels you can group into a contiguous batch such that the difference between the maximum and minimum parcel weight in the batch does not exceed \`k\`.

### Example 1:
\`\`\`
Input: weights = [8,2,4,7], k = 4
Output: 2
Explanation: Subarrays satisfying difference <= 4:
[8] with max-min=0
[2,4] with max-min=2 <= 4
[4,7] with max-min=3 <= 4
Maximum length is 2.
\`\`\`

### Constraints:
- \`1 <= weights.length <= 10^5\`
- \`1 <= weights[i] <= 10^9\`
- \`0 <= k <= 10^9\``,
        difficulty: 'Medium',
        score: 50,
        patternTag: 'Sliding Window',
        starterCode: {
          cpp: `int longestSubarray(vector<int>& weights, int k) {\n    // Write your solution here\n    return 0;\n}`,
          python: `def longestSubarray(weights: list[int], k: int) -> int:\n    # Write your solution here\n    return 0`,
          java: `class Solution {\n    public int longestSubarray(int[] weights, int k) {\n        // Write your solution here\n        return 0;\n    }\n}`,
        },
        testCases: [
          { input: 'weights = [8,2,4,7], k = 4', expectedOutput: '2', isHidden: false },
          { input: 'weights = [10,1,2,4,7,2], k = 5', expectedOutput: '4', isHidden: false },
          { input: 'weights = [4,2,2,2,4,4,2,2], k = 0', expectedOutput: '3', isHidden: true },
          { input: 'weights = [1,5,6,7,8,10,6,5,6], k = 4', expectedOutput: '5', isHidden: true },
        ],
      },
      {
        id: 'amzn-2',
        title: 'Warehouse Next Greater Stock Metric',
        description: `Given a circular integer array \`nums\` (the next element of \`nums[nums.length - 1]\` is \`nums[0]\`), return the **next greater number** for every element.

The next greater number of a number \`x\` is the first greater number to its traversing-order next in the array, which means you could search circularly to find its next greater number. If it doesn't exist, return \`-1\` for this number.

### Example 1:
\`\`\`
Input: nums = [1,2,1]
Output: [2,-1,2]
Explanation: The first 1's next greater is 2; the number 2 can't find next greater; the second 1's next greater needs to search circularly, which is also 2.
\`\`\`

### Constraints:
- \`1 <= nums.length <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\``,
        difficulty: 'Medium',
        score: 50,
        patternTag: 'Monotonic Stack',
        starterCode: {
          cpp: `vector<int> nextGreaterElements(vector<int>& nums) {\n    // Write your solution here\n    return {};\n}`,
          python: `def nextGreaterElements(nums: list[int]) -> list[int]:\n    # Write your solution here\n    return []`,
          java: `class Solution {\n    public int[] nextGreaterElements(int[] nums) {\n        // Write your solution here\n        return new int[0];\n    }\n}`,
        },
        testCases: [
          { input: 'nums = [1,2,1]', expectedOutput: '[2,-1,2]', isHidden: false },
          { input: 'nums = [1,2,3,4,3]', expectedOutput: '[2,3,4,-1,4]', isHidden: false },
          { input: 'nums = [5,4,3,2,1]', expectedOutput: '[-1,5,5,5,5]', isHidden: true },
          { input: 'nums = [1,1,1,1]', expectedOutput: '[-1,-1,-1,-1]', isHidden: true },
        ],
      },
    ],
  },
  {
    title: 'Google SWE Online Assessment Simulation',
    slug: 'google-swe-oa-mock-1',
    company: 'Google',
    role: 'Software Engineer / Intern',
    description: 'High-bar 60-minute Google OA simulation testing shortest path graph modeling and dynamic programming with bitmask state.',
    durationMinutes: 60,
    passingScore: 80,
    isProOnly: true,
    difficulty: 'Hard',
    companyInstructions: [
      'Google OA format: 2 non-trivial algorithmic problems in 60 minutes.',
      'Google assessments test time complexity strictly — sub-optimal O(N^2) or excessive recursion limits will receive TLE.',
      'Write clean, modular code with descriptive variable naming.',
    ],
    problems: [
      {
        id: 'goog-1',
        title: 'Cluster Routing with Minimum Delay',
        description: `You are given a network of \`n\` servers labeled from \`1\` to \`n\`. You are also given \`times\`, a list of travel times as directed edges \`times[i] = (u_i, v_i, w_i)\`, where \`u_i\` is the source server, \`v_i\` is the target server, and \`w_i\` is the time it takes for a signal to travel from source to target.

We will send a signal from a given server \`k\`. Return the **minimum time** it takes for all the \`n\` servers to receive the signal. If it is impossible for all the \`n\` servers to receive the signal, return \`-1\`.

### Example 1:
\`\`\`
Input: times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2
Output: 2
\`\`\`

### Constraints:
- \`1 <= k <= n <= 100\`
- \`1 <= times.length <= 6000\`
- \`0 <= w_i <= 100\``,
        difficulty: 'Medium',
        score: 50,
        patternTag: 'Graph Dijkstra',
        starterCode: {
          cpp: `int networkDelayTime(vector<vector<int>>& times, int n, int k) {\n    // Write your solution here\n    return -1;\n}`,
          python: `def networkDelayTime(times: list[list[int]], n: int, k: int) -> int:\n    # Write your solution here\n    return -1`,
          java: `class Solution {\n    public int networkDelayTime(int[][] times, int n, int k) {\n        // Write your solution here\n        return -1;\n    }\n}`,
        },
        testCases: [
          { input: 'times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2', expectedOutput: '2', isHidden: false },
          { input: 'times = [[1,2,1]], n = 2, k = 1', expectedOutput: '1', isHidden: false },
          { input: 'times = [[1,2,1]], n = 2, k = 2', expectedOutput: '-1', isHidden: true },
          { input: 'times = [[1,2,1],[2,3,2],[1,3,4]], n = 3, k = 1', expectedOutput: '3', isHidden: true },
        ],
      },
      {
        id: 'goog-2',
        title: 'Maximum Path Value in Grid with Obstacles',
        description: `You are given an \`m x n\` integer array \`grid\`. There is a robot initially at the top-left corner (\`grid[0][0]\`). The robot tries to move to the bottom-right corner (\`grid[m - 1][n - 1]\`). The robot can only move either down or right at any point in time.

An obstacle and space are marked as \`1\` or \`0\` respectively in \`grid\`. A path that the robot takes cannot include any square that is an obstacle.

Return the **number of possible unique paths** that the robot can take to reach the bottom-right corner.

### Example 1:
\`\`\`
Input: obstacleGrid = [[0,0,0],[0,1,0],[0,0,0]]
Output: 2
Explanation: There is one obstacle in the middle of the 3x3 grid above.
There are two ways to reach the bottom-right corner:
1. Right -> Right -> Down -> Down
2. Down -> Down -> Right -> Right
\`\`\`

### Constraints:
- \`m == obstacleGrid.length\`
- \`n == obstacleGrid[i].length\`
- \`1 <= m, n <= 100\`
- \`obstacleGrid[i][j]\` is \`0\` or \`1\`.`,
        difficulty: 'Medium',
        score: 50,
        patternTag: 'Dynamic Programming',
        starterCode: {
          cpp: `int uniquePathsWithObstacles(vector<vector<int>>& obstacleGrid) {\n    // Write your solution here\n    return 0;\n}`,
          python: `def uniquePathsWithObstacles(obstacleGrid: list[list[int]]) -> int:\n    # Write your solution here\n    return 0`,
          java: `class Solution {\n    public int uniquePathsWithObstacles(int[][] obstacleGrid) {\n        // Write your solution here\n        return 0;\n    }\n}`,
        },
        testCases: [
          { input: 'obstacleGrid = [[0,0,0],[0,1,0],[0,0,0]]', expectedOutput: '2', isHidden: false },
          { input: 'obstacleGrid = [[0,1],[0,0]]', expectedOutput: '1', isHidden: false },
          { input: 'obstacleGrid = [[1]]', expectedOutput: '0', isHidden: true },
          { input: 'obstacleGrid = [[0,0],[1,1],[0,0]]', expectedOutput: '0', isHidden: true },
        ],
      },
    ],
  },
  {
    title: 'Uber L3 Algorithmic Assessment',
    slug: 'uber-l3-oa-mock-1',
    company: 'Uber',
    role: 'Software Engineer II (L3)',
    description: 'Real-time ride matching and dispatch assessment testing overlapping interval merging and dynamic fee calculation.',
    durationMinutes: 75,
    passingScore: 75,
    isProOnly: true,
    difficulty: 'Hard',
    companyInstructions: [
      'Uber L3 OA simulates dispatch systems under strict concurrency and interval pressure.',
      '75 minutes for 2 algorithmic challenges.',
      'Hidden tests evaluate millions of simulated trips with extreme boundary overlaps.',
    ],
    problems: [
      {
        id: 'uber-1',
        title: 'Ride Sharing Overlapping Interval Clustering',
        description: `Given an array of \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.

### Example 1:
\`\`\`
Input: intervals = [[1,3],[2,6],[8,10],[15,18]]
Output: [[1,6],[8,10],[15,18]]
Explanation: Since intervals [1,3] and [2,6] overlap, merge them into [1,6].
\`\`\`

### Constraints:
- \`1 <= intervals.length <= 10^4\`
- \`intervals[i].length == 2\`
- \`0 <= start_i <= end_i <= 10^4\``,
        difficulty: 'Medium',
        score: 50,
        patternTag: 'Intervals',
        starterCode: {
          cpp: `vector<vector<int>> merge(vector<vector<int>>& intervals) {\n    // Write your solution here\n    return {};\n}`,
          python: `def merge(intervals: list[list[int]]) -> list[list[int]]:\n    # Write your solution here\n    return []`,
          java: `class Solution {\n    public int[][] merge(int[][] intervals) {\n        // Write your solution here\n        return new int[0][0];\n    }\n}`,
        },
        testCases: [
          { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]', isHidden: false },
          { input: 'intervals = [[1,4],[4,5]]', expectedOutput: '[[1,5]]', isHidden: false },
          { input: 'intervals = [[1,4],[0,4]]', expectedOutput: '[[0,4]]', isHidden: true },
          { input: 'intervals = [[1,4],[2,3]]', expectedOutput: '[[1,4]]', isHidden: true },
        ],
      },
      {
        id: 'uber-2',
        title: 'Minimum Meeting Rooms for Fleets',
        description: `Given an array of meeting time intervals \`intervals\` where \`intervals[i] = [start_i, end_i]\`, return the minimum number of fleet conference rooms or vehicles required to service all requests without schedule collision.

### Example 1:
\`\`\`
Input: intervals = [[0,30],[5,10],[15,20]]
Output: 2
\`\`\`

### Constraints:
- \`1 <= intervals.length <= 10^4\`
- \`0 <= start_i < end_i <= 10^6\``,
        difficulty: 'Medium',
        score: 50,
        patternTag: 'Intervals',
        starterCode: {
          cpp: `int minMeetingRooms(vector<vector<int>>& intervals) {\n    // Write your solution here\n    return 0;\n}`,
          python: `def minMeetingRooms(intervals: list[list[int]]) -> int:\n    # Write your solution here\n    return 0`,
          java: `class Solution {\n    public int minMeetingRooms(int[][] intervals) {\n        // Write your solution here\n        return 0;\n    }\n}`,
        },
        testCases: [
          { input: 'intervals = [[0,30],[5,10],[15,20]]', expectedOutput: '2', isHidden: false },
          { input: 'intervals = [[7,10],[2,4]]', expectedOutput: '1', isHidden: false },
          { input: 'intervals = [[1,5],[5,6],[6,10]]', expectedOutput: '1', isHidden: true },
          { input: 'intervals = [[1,10],[2,7],[3,19],[8,12],[10,20],[11,30]]', expectedOutput: '4', isHidden: true },
        ],
      },
    ],
  },
  {
    title: 'Microsoft Engineering Campus Mock',
    slug: 'microsoft-sde-oa-mock-1',
    company: 'Microsoft',
    role: 'Software Engineer',
    description: 'Microsoft campus placement simulation covering binary tree vertical traversals and two-pointer strings.',
    durationMinutes: 70,
    passingScore: 70,
    isProOnly: true,
    difficulty: 'Medium',
    companyInstructions: [
      'Microsoft placement round assessment: 70 minutes for 2 coding tasks.',
      'Emphasis on edge-case testing: null root nodes, single-element strings, and negative values.',
    ],
    problems: [
      {
        id: 'msft-1',
        title: 'Two Sum Closest Target Traversal',
        description: `Given a **1-indexed** array of integers \`numbers\` that is already **sorted in non-decreasing order**, find two numbers such that they add up to a specific \`target\` number. Let these two numbers be \`numbers[index1]\` and \`numbers[index2]\` where \`1 <= index1 < index2 <= numbers.length\`.

Return the indices of the two numbers, \`index1\` and \`index2\`, added by one as an integer array \`[index1, index2]\` of length 2.

### Example 1:
\`\`\`
Input: numbers = [2,7,11,15], target = 9
Output: [1,2]
Explanation: The sum of 2 and 7 is 9. Therefore, index1 = 1, index2 = 2. We return [1, 2].
\`\`\`

### Constraints:
- \`2 <= numbers.length <= 3 * 10^4\`
- \`-1000 <= numbers[i] <= 1000\`
- \`numbers\` is sorted in **non-decreasing order**.
- \`-1000 <= target <= 1000\``,
        difficulty: 'Easy',
        score: 40,
        patternTag: 'Two Pointers',
        starterCode: {
          cpp: `vector<int> twoSum(vector<int>& numbers, int target) {\n    // Write your solution here\n    return {};\n}`,
          python: `def twoSum(numbers: list[int], target: int) -> list[int]:\n    # Write your solution here\n    return []`,
          java: `class Solution {\n    public int[] twoSum(int[] numbers, int target) {\n        // Write your solution here\n        return new int[0];\n    }\n}`,
        },
        testCases: [
          { input: 'numbers = [2,7,11,15], target = 9', expectedOutput: '[1,2]', isHidden: false },
          { input: 'numbers = [2,3,4], target = 6', expectedOutput: '[1,3]', isHidden: false },
          { input: 'numbers = [-1,0], target = -1', expectedOutput: '[1,2]', isHidden: true },
          { input: 'numbers = [0,0,3,4], target = 0', expectedOutput: '[1,2]', isHidden: true },
        ],
      },
      {
        id: 'msft-2',
        title: 'Binary Tree Level Maximum Width',
        description: `Given the \`root\` of a binary tree, return the **maximum width** of the given tree.

The **maximum width** of a tree is the maximum **width** among all levels.

The width of one level is defined as the length between the end-nodes (the leftmost and rightmost non-null nodes), where the null nodes between the end-nodes that would be present in a complete binary tree extending down to that level are also counted into the length calculation.

### Example 1:
\`\`\`
Input: root = [1,3,2,5,3,null,9]
Output: 4
Explanation: The maximum width exists in the third level with length 4 (5,3,null,9).
\`\`\`

### Constraints:
- The number of nodes in the tree is in the range \`[1, 3000]\`.
- \`-100 <= Node.val <= 100\``,
        difficulty: 'Medium',
        score: 60,
        patternTag: 'Tree BFS',
        starterCode: {
          cpp: `int widthOfBinaryTree(TreeNode* root) {\n    // Write your solution here\n    return 0;\n}`,
          python: `def widthOfBinaryTree(root: Optional[TreeNode]) -> int:\n    # Write your solution here\n    return 0`,
          java: `class Solution {\n    public int widthOfBinaryTree(TreeNode root) {\n        // Write your solution here\n        return 0;\n    }\n}`,
        },
        testCases: [
          { input: 'root = [1,3,2,5,3,null,9]', expectedOutput: '4', isHidden: false },
          { input: 'root = [1,3,2,5,null,null,9,6,null,7]', expectedOutput: '7', isHidden: false },
          { input: 'root = [1,3,2,5]', expectedOutput: '2', isHidden: true },
          { input: 'root = [1]', expectedOutput: '1', isHidden: true },
        ],
      },
    ],
  },
  {
    title: 'Atlassian Software Engineer Assessment',
    slug: 'atlassian-backend-oa-mock-1',
    company: 'Atlassian',
    role: 'Graduate Software Developer',
    description: 'Jira dependency resolution and sliding window rate limiter assessment.',
    durationMinutes: 75,
    passingScore: 75,
    isProOnly: true,
    difficulty: 'Hard',
    companyInstructions: [
      'Atlassian engineering assessment: 75 minutes for 2 real-world system modeling problems.',
      'Circular dependencies and race condition boundary testcases are heavily weighted.',
    ],
    problems: [
      {
        id: 'atlas-1',
        title: 'Jira Issue Dependency Circular Resolver',
        description: `There are a total of \`numCourses\` tasks you have to take, labeled from \`0\` to \`numCourses - 1\`. You are given an array \`prerequisites\` where \`prerequisites[i] = [a_i, b_i]\` indicates that you must complete task \`b_i\` first if you want to take task \`a_i\`.

Return \`true\` if you can finish all tasks. Otherwise, return \`false\`.

### Example 1:
\`\`\`
Input: numCourses = 2, prerequisites = [[1,0]]
Output: true
Explanation: There are a total of 2 tasks to take. To take task 1 you should have finished task 0. So it is possible.
\`\`\`

### Constraints:
- \`1 <= numCourses <= 2000\`
- \`0 <= prerequisites.length <= 5000\`
- \`prerequisites[i].length == 2\`
- \`0 <= a_i, b_i < numCourses\`
- All pairs \`[a_i, b_i]\` are **unique**.`,
        difficulty: 'Medium',
        score: 50,
        patternTag: 'Topological Sort',
        starterCode: {
          cpp: `bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {\n    // Write your solution here\n    return true;\n}`,
          python: `def canFinish(numCourses: int, prerequisites: list[list[int]]) -> bool:\n    # Write your solution here\n    return True`,
          java: `class Solution {\n    public boolean canFinish(int numCourses, int[][] prerequisites) {\n        // Write your solution here\n        return true;\n    }\n}`,
        },
        testCases: [
          { input: 'numCourses = 2, prerequisites = [[1,0]]', expectedOutput: 'true', isHidden: false },
          { input: 'numCourses = 2, prerequisites = [[1,0],[0,1]]', expectedOutput: 'false', isHidden: false },
          { input: 'numCourses = 3, prerequisites = [[0,1],[1,2],[2,0]]', expectedOutput: 'false', isHidden: true },
          { input: 'numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]', expectedOutput: 'true', isHidden: true },
        ],
      },
      {
        id: 'atlas-2',
        title: 'Rate Limiter Sliding Window Burst Check',
        description: `Given a string \`s\` and an integer \`k\`, return the length of the longest substring of \`s\` that can be created after replacing at most \`k\` characters with any other uppercase English letter.

### Example 1:
\`\`\`
Input: s = "ABAB", k = 2
Output: 4
Explanation: Replace the two 'A's with two 'B's or vice versa.
\`\`\`

### Constraints:
- \`1 <= s.length <= 10^5\`
- \`s\` consists of only uppercase English letters.
- \`0 <= k <= s.length\``,
        difficulty: 'Medium',
        score: 50,
        patternTag: 'Sliding Window',
        starterCode: {
          cpp: `int characterReplacement(string s, int k) {\n    // Write your solution here\n    return 0;\n}`,
          python: `def characterReplacement(s: str, k: int) -> int:\n    # Write your solution here\n    return 0`,
          java: `class Solution {\n    public int characterReplacement(String s, int k) {\n        // Write your solution here\n        return 0;\n    }\n}`,
        },
        testCases: [
          { input: 's = "ABAB", k = 2', expectedOutput: '4', isHidden: false },
          { input: 's = "AABABBA", k = 1', expectedOutput: '4', isHidden: false },
          { input: 's = "AAAA", k = 2', expectedOutput: '4', isHidden: true },
          { input: 's = "ABBB", k = 2', expectedOutput: '4', isHidden: true },
        ],
      },
    ],
  },
];
