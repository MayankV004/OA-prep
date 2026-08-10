import { PatternData } from '@/types/pattern';

export const backtracking: PatternData = {
  "slug": "backtracking",
  "title": "Backtracking",
  "description": "Systematically explore all possible solutions by building candidates incrementally and abandoning (backtracking) paths that cannot lead to a valid answer.",
  "timeComplexity": "O(n! or 2ⁿ) worst case — pruning reduces practical runtime",
  "spaceComplexity": "O(n) recursion stack",
  "useCases": [
    "Permutations & combinations",
    "Sudoku solver",
    "N-Queens",
    "Word search in grid"
  ],
  "concept": "Backtracking is a **DFS + undo** strategy. You make a choice, recurse into that choice, then **undo** (backtrack) and try the next option. The art is in writing a good **pruning condition** that cuts branches early.\n\n> **Key insight**: Backtracking = DFS on a decision tree. Each node is a partial solution; leaves are complete solutions or dead ends.",
  "templateCode": "public void backtrack(State state, List<Choice> choices) {\n    if (isSolution(state)) {\n        record(state);\n        return;\n    }\n\n    for (Choice choice : choices) {\n        if (isValid(choice, state)) {\n            makeChoice(state, choice);         // apply\n            backtrack(state, nextChoices);     // recurse\n            undoChoice(state, choice);         // backtrack\n        }\n    }\n}",
  "explanation": "- You need to enumerate **all** valid configurations (permutations, combinations, subsets)\n- Problem has a **decision at each step** with a validity check\n- Greedy doesn't work because a locally valid choice may lead to a dead end\n- Grid/graph path problems where you must **undo** movement",
  "variations": [
    {
      "id": "permutations",
      "title": "Permutations",
      "concept": "Generate all orderings of elements. Use a `used[]` array to avoid reuse.",
      "templateCode": "class Solution {\n    public List<List<Integer>> permute(int[] nums) {\n        List<List<Integer>> result = new ArrayList<>();\n        boolean[] used = new boolean[nums.length];\n        backtrack(nums, new ArrayList<>(), used, result);\n        return result;\n    }\n\n    private void backtrack(int[] nums, List<Integer> path, boolean[] used, List<List<Integer>> result) {\n        if (path.size() == nums.length) {\n            result.add(new ArrayList<>(path));\n            return;\n        }\n        for (int i = 0; i < nums.length; i++) {\n            if (used[i]) continue;\n            used[i] = true;\n            path.add(nums[i]);\n            backtrack(nums, path, used, result);\n            path.remove(path.size() - 1);\n            used[i] = false;\n        }\n    }\n}"
    },
    {
      "id": "subsets",
      "title": "Subsets / Combinations",
      "concept": "Generate all subsets. Use a `start` index to avoid going backward.",
      "templateCode": "class Solution {\n    public List<List<Integer>> subsets(int[] nums) {\n        List<List<Integer>> result = new ArrayList<>();\n        backtrack(nums, 0, new ArrayList<>(), result);\n        return result;\n    }\n\n    private void backtrack(int[] nums, int start, List<Integer> path, List<List<Integer>> result) {\n        result.add(new ArrayList<>(path)); // every path is a valid subset\n        for (int i = start; i < nums.length; i++) {\n            path.add(nums[i]);\n            backtrack(nums, i + 1, path, result); // i+1: no re-use of same element\n            path.remove(path.size() - 1);\n        }\n    }\n}"
    },
    {
      "id": "constraint",
      "title": "Constraint Satisfaction",
      "concept": "Place elements on a board (e.g., N-Queens, Sudoku). Prune invalid placements early.",
      "templateCode": "class Solution {\n    public List<List<Integer>> permute(int[] nums) {\n        List<List<Integer>> result = new ArrayList<>();\n        boolean[] used = new boolean[nums.length];\n        backtrack(nums, new ArrayList<>(), used, result);\n        return result;\n    }\n\n    private void backtrack(int[] nums, List<Integer> path, boolean[] used, List<List<Integer>> result) {\n        if (path.size() == nums.length) {\n            result.add(new ArrayList<>(path));\n            return;\n        }\n        for (int i = 0; i < nums.length; i++) {\n            if (used[i]) continue;\n            used[i] = true;\n            path.add(nums[i]);\n            backtrack(nums, path, used, result);\n            path.remove(path.size() - 1);\n            used[i] = false;\n        }\n    }\n}"
    },
    {
      "id": "path",
      "title": "Path / Grid Search",
      "concept": "Explore paths in a graph or 2D grid. Mark cells as visited; unmark on backtrack.",
      "templateCode": "class Solution {\n    public List<List<Integer>> permute(int[] nums) {\n        List<List<Integer>> result = new ArrayList<>();\n        boolean[] used = new boolean[nums.length];\n        backtrack(nums, new ArrayList<>(), used, result);\n        return result;\n    }\n\n    private void backtrack(int[] nums, List<Integer> path, boolean[] used, List<List<Integer>> result) {\n        if (path.size() == nums.length) {\n            result.add(new ArrayList<>(path));\n            return;\n        }\n        for (int i = 0; i < nums.length; i++) {\n            if (used[i]) continue;\n            used[i] = true;\n            path.add(nums[i]);\n            backtrack(nums, path, used, result);\n            path.remove(path.size() - 1);\n            used[i] = false;\n        }\n    }\n}"
    }
  ]
};
