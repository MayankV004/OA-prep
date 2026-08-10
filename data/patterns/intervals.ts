import { PatternData } from '@/types/pattern';

export const intervals: PatternData = {
  "slug": "intervals",
  "title": "Intervals",
  "description": "Problems involving merging, scheduling, or intersecting ranges on a 1D line. Usually solved by sorting based on start or end times and applying a greedy approach.",
  "timeComplexity": "O(n log n) due to sorting",
  "spaceComplexity": "O(1) or O(n)",
  "useCases": [
    "Merge intervals",
    "Meeting rooms",
    "Insert interval",
    "Non-overlapping intervals"
  ],
  "concept": "Greedy works when you can prove two things:\n1. **Greedy choice property**: A globally optimal solution can always include the locally optimal choice.\n2. **Optimal substructure**: After making the greedy choice, the remaining problem has the same structure.\n\n> **Key insight**: If you can't easily prove these, consider DP instead. Many greedy problems look like DP but have a much simpler solution.",
  "templateCode": "class Solution {\n    public int[][] merge(int[][] intervals) {\n        if (intervals.length <= 1) return intervals;\n        \n        // Sort by start time\n        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));\n        \n        List<int[]> merged = new ArrayList<>();\n        int[] current = intervals[0];\n        merged.add(current);\n        \n        for (int[] next : intervals) {\n            if (next[0] <= current[1]) { // overlaps\n                current[1] = Math.max(current[1], next[1]);\n            } else {\n                current = next;\n                merged.add(current);\n            }\n        }\n        \n        return merged.toArray(new int[merged.size()][]);\n    }\n}",
  "explanation": "- Problem involves **selection** from a set with some optimization goal\n- There's a natural **ordering** (sort by deadline, end time, ratio, etc.)\n- The problem has \"minimum number of X\" or \"maximum number of non-overlapping Y\"\n- After sorting, a single linear scan gives the answer",
  "variations": [
    {
      "id": "merge",
      "title": "Merge / Insert",
      "concept": "Sort by start time. Keep track of the current merged interval and extend its end if the next interval overlaps.",
      "templateCode": "class Solution {\n    public int eraseOverlapIntervals(int[][] intervals) {\n        if (intervals.length == 0) return 0;\n        \n        // Sort by end time\n        Arrays.sort(intervals, (a, b) -> Integer.compare(a[1], b[1]));\n        \n        int count = 0;\n        int lastEnd = Integer.MIN_VALUE;\n        \n        for (int[] interval : intervals) {\n            if (interval[0] >= lastEnd) {\n                lastEnd = interval[1];\n            } else {\n                count++;\n            }\n        }\n        \n        return count;\n    }\n}"
    },
    {
      "id": "scheduling",
      "title": "Activity Selection / Scheduling",
      "concept": "Sort by end time to maximize the number of non-overlapping intervals (Greedy choice).",
      "templateCode": "class Solution {\n    public int eraseOverlapIntervals(int[][] intervals) {\n        if (intervals.length == 0) return 0;\n        \n        // Sort by end time\n        Arrays.sort(intervals, (a, b) -> Integer.compare(a[1], b[1]));\n        \n        int count = 0;\n        int lastEnd = Integer.MIN_VALUE;\n        \n        for (int[] interval : intervals) {\n            if (interval[0] >= lastEnd) {\n                lastEnd = interval[1];\n            } else {\n                count++;\n            }\n        }\n        \n        return count;\n    }\n}"
    },
    {
      "id": "sweep-line",
      "title": "Sweep Line / Events",
      "concept": "Treat start and end points as independent events (+1 active, -1 active) and sweep across time.",
      "templateCode": "class Solution {\n    public int eraseOverlapIntervals(int[][] intervals) {\n        if (intervals.length == 0) return 0;\n        \n        // Sort by end time\n        Arrays.sort(intervals, (a, b) -> Integer.compare(a[1], b[1]));\n        \n        int count = 0;\n        int lastEnd = Integer.MIN_VALUE;\n        \n        for (int[] interval : intervals) {\n            if (interval[0] >= lastEnd) {\n                lastEnd = interval[1];\n            } else {\n                count++;\n            }\n        }\n        \n        return count;\n    }\n}"
    }
  ]
};
