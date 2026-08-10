import { PatternData } from '@/types/pattern';

export const binary_search: PatternData = {
  "slug": "binary-search",
  "title": "Binary Search",
  "description": "Halve the search space at every step by comparing against a mid-point, reducing O(n) search to O(log n) on monotone structures.",
  "timeComplexity": "O(log n)",
  "spaceComplexity": "O(1) iterative, O(log n) recursive",
  "useCases": [
    "Search in sorted array",
    "Find first/last position",
    "Search in rotated array",
    "Minimize/maximize on answer space"
  ],
  "concept": "Binary search works on any **monotone** structure — not just sorted arrays. The key is identifying a predicate that transitions from `False` to `True` exactly once. You then find that boundary.\n\n> **Key insight**: Think in terms of `feasible(mid)` — a function that returns `True` or `False`. Binary search finds the exact boundary.",
  "templateCode": "class Solution {\n    public int binarySearch(int[] arr, int target) {\n        int left = 0, right = arr.length - 1;\n\n        while (left <= right) {\n            int mid = left + (right - left) / 2; // avoids overflow\n\n            if (arr[mid] == target) {\n                return mid;\n            } else if (arr[mid] < target) {\n                left = mid + 1;\n            } else {\n                right = mid - 1;\n            }\n        }\n\n        return -1;\n    }\n}",
  "explanation": "- Searching in a **sorted** (or rotated-sorted) array\n- Finding the **first/last** occurrence of a value\n- Minimizing/maximizing a value where checking feasibility is O(n) or less\n- The search space is **implicitly ordered** (answer space problems)",
  "variations": [
    {
      "id": "exact",
      "title": "Exact Target Search",
      "concept": "Classic binary search — find the exact value or return -1.",
      "templateCode": "class Solution {\n    public int lowerBound(int[] arr, int target) {\n        int left = 0, right = arr.length; // right = n (open boundary)\n\n        while (left < right) {\n            int mid = left + (right - left) / 2;\n            if (arr[mid] < target) {\n                left = mid + 1;\n            } else {\n                right = mid; // could be the answer, keep it\n            }\n        }\n\n        return left; // first index >= target\n    }\n}"
    },
    {
      "id": "boundary",
      "title": "Boundary / Lower–Upper Bound",
      "concept": "Find the first or last position where condition holds. Use leftmost/rightmost templates.",
      "templateCode": "class Solution {\n    public int lowerBound(int[] arr, int target) {\n        int left = 0, right = arr.length; // right = n (open boundary)\n\n        while (left < right) {\n            int mid = left + (right - left) / 2;\n            if (arr[mid] < target) {\n                left = mid + 1;\n            } else {\n                right = mid; // could be the answer, keep it\n            }\n        }\n\n        return left; // first index >= target\n    }\n}"
    },
    {
      "id": "answer-space",
      "title": "Binary Search on Answer",
      "concept": "When the answer itself is monotone — binary search on the answer range and validate with a feasibility check.",
      "templateCode": "class Solution {\n    public int binarySearchAnswer(int[] nums, int days) {\n        int left = 0, right = 0;\n        for (int num : nums) {\n            left = Math.max(left, num); // minimum possible capacity\n            right += num;               // maximum possible capacity\n        }\n\n        while (left < right) {\n            int mid = left + (right - left) / 2;\n            if (feasible(nums, days, mid)) {\n                right = mid;            // try smaller\n            } else {\n                left = mid + 1;         // must be larger\n            }\n        }\n\n        return left;\n    }\n\n    private boolean feasible(int[] nums, int days, int capacity) {\n        int ships = 1;\n        int load = 0;\n        for (int w : nums) {\n            if (load + w > capacity) {\n                ships++;\n                load = 0;\n            }\n            load += w;\n        }\n        return ships <= days;\n    }\n}"
    },
    {
      "id": "rotated",
      "title": "Rotated / Modified Array",
      "concept": "Handle arrays that are rotated or have a special structure by identifying which half is sorted.",
      "templateCode": "class Solution {\n    public int searchRotated(int[] nums, int target) {\n        int left = 0, right = nums.length - 1;\n\n        while (left <= right) {\n            int mid = left + (right - left) / 2;\n\n            if (nums[mid] == target) {\n                return mid;\n            }\n\n            // Determine which half is sorted\n            if (nums[left] <= nums[mid]) { // left half is sorted\n                if (nums[left] <= target && target < nums[mid]) {\n                    right = mid - 1;\n                } else {\n                    left = mid + 1;\n                }\n            } else { // right half is sorted\n                if (nums[mid] < target && target <= nums[right]) {\n                    left = mid + 1;\n                } else {\n                    right = mid - 1;\n                }\n            }\n        }\n\n        return -1;\n    }\n}"
    }
  ]
};
