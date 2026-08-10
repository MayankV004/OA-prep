import { PatternData } from '@/types/pattern';

export const trees: PatternData = {
  "slug": "trees",
  "title": "Trees",
  "description": "Hierarchical structures where each node has at most one parent. Most problems reduce to a DFS traversal computing values bottom-up or top-down.",
  "timeComplexity": "O(n) for full traversal",
  "spaceComplexity": "O(h) — h = height; O(log n) balanced, O(n) worst",
  "useCases": [
    "Tree traversals",
    "Path sum problems",
    "LCA",
    "Diameter",
    "BST operations",
    "Serialization"
  ],
  "concept": "The key to tree problems is choosing the **direction of information flow**:\n\n- **Top-down**: pass data from parent to child (e.g., current path sum)\n- **Bottom-up**: return aggregated data from children to parent (e.g., height, diameter)\n\nMost hard tree problems combine both.\n\n> **Key insight**: If you can define `f(node)` that returns what you need from a subtree, a single DFS gives you the answer.",
  "templateCode": "class TreeNode {\n    int val;\n    TreeNode left;\n    TreeNode right;\n    TreeNode() {}\n    TreeNode(int val) { this.val = val; }\n    TreeNode(int val, TreeNode left, TreeNode right) {\n        this.val = val;\n        this.left = left;\n        this.right = right;\n    }\n}\n\nclass Solution {\n    public int treeHeight(TreeNode root) {\n        if (root == null) return 0;\n        int leftH = treeHeight(root.left);\n        int rightH = treeHeight(root.right);\n        return 1 + Math.max(leftH, rightH);\n    }\n}",
  "explanation": "| Problem shape | Approach |\n|---------------|----------|\n| Compute height / depth | Bottom-up DFS |\n| Check if subtree satisfies property | Bottom-up DFS returning bool |\n| Path sum / path count | Top-down DFS with running sum |\n| Level-specific info | BFS |\n| BST range queries | Inorder DFS |\n| Ancestors / LCA | Post-order DFS |",
  "variations": [
    {
      "id": "traversal",
      "title": "DFS Traversals (Pre/In/Post-order)",
      "concept": "The foundation. Inorder of BST = sorted order. Preorder = serialize tree. Postorder = bottom-up aggregation.",
      "templateCode": "class Solution {\n    private int best = Integer.MIN_VALUE;\n\n    public int maxPathSum(TreeNode root) {\n        dfs(root);\n        return best;\n    }\n\n    private int dfs(TreeNode node) {\n        if (node == null) return 0;\n        // Take only positive contributions from children\n        int left = Math.max(0, dfs(node.left));\n        int right = Math.max(0, dfs(node.right));\n        // Update global best: path going through this node\n        best = Math.max(best, node.val + left + right);\n        // Return max one-directional contribution for parent\n        return node.val + Math.max(left, right);\n    }\n}"
    },
    {
      "id": "bfs-level",
      "title": "BFS / Level-Order",
      "concept": "Process nodes level by level using a queue. Essential for finding level-specific properties.",
      "templateCode": "class Solution {\n    private int best = Integer.MIN_VALUE;\n\n    public int maxPathSum(TreeNode root) {\n        dfs(root);\n        return best;\n    }\n\n    private int dfs(TreeNode node) {\n        if (node == null) return 0;\n        // Take only positive contributions from children\n        int left = Math.max(0, dfs(node.left));\n        int right = Math.max(0, dfs(node.right));\n        // Update global best: path going through this node\n        best = Math.max(best, node.val + left + right);\n        // Return max one-directional contribution for parent\n        return node.val + Math.max(left, right);\n    }\n}"
    },
    {
      "id": "path",
      "title": "Root-to-Leaf / Any Path",
      "concept": "Path sum, max path sum, longest path. Carry accumulated value top-down; return aggregated value bottom-up.",
      "templateCode": "class Solution {\n    private int best = Integer.MIN_VALUE;\n\n    public int maxPathSum(TreeNode root) {\n        dfs(root);\n        return best;\n    }\n\n    private int dfs(TreeNode node) {\n        if (node == null) return 0;\n        // Take only positive contributions from children\n        int left = Math.max(0, dfs(node.left));\n        int right = Math.max(0, dfs(node.right));\n        // Update global best: path going through this node\n        best = Math.max(best, node.val + left + right);\n        // Return max one-directional contribution for parent\n        return node.val + Math.max(left, right);\n    }\n}"
    },
    {
      "id": "bst",
      "title": "Binary Search Tree (BST)",
      "concept": "Exploit the BST property: left < node < right. Enables O(log n) search, insert, and range queries.",
      "templateCode": "class Solution {\n    private int best = Integer.MIN_VALUE;\n\n    public int maxPathSum(TreeNode root) {\n        dfs(root);\n        return best;\n    }\n\n    private int dfs(TreeNode node) {\n        if (node == null) return 0;\n        // Take only positive contributions from children\n        int left = Math.max(0, dfs(node.left));\n        int right = Math.max(0, dfs(node.right));\n        // Update global best: path going through this node\n        best = Math.max(best, node.val + left + right);\n        // Return max one-directional contribution for parent\n        return node.val + Math.max(left, right);\n    }\n}"
    },
    {
      "id": "lca",
      "title": "Lowest Common Ancestor (LCA)",
      "concept": "Find the deepest node that is an ancestor of both targets. Works via DFS post-order or parent-pointer + path.",
      "templateCode": "class Solution {\n    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {\n        if (root == null || root == p || root == q) return root;\n        TreeNode left = lowestCommonAncestor(root.left, p, q);\n        TreeNode right = lowestCommonAncestor(root.right, p, q);\n        if (left != null && right != null) return root; // p and q are in different subtrees\n        return left != null ? left : right;\n    }\n}"
    }
  ]
};
