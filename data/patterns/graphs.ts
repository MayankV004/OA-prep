import { PatternData } from '@/types/pattern';

export const graphs: PatternData = {
  "slug": "graphs",
  "title": "Graphs",
  "description": "Model relationships as nodes and edges, then traverse or search to answer connectivity, shortest-path, or cycle-detection queries.",
  "timeComplexity": "O(V + E) for BFS/DFS; O(E log V) for Dijkstra",
  "spaceComplexity": "O(V + E)",
  "useCases": [
    "Shortest path",
    "Connected components",
    "Cycle detection",
    "Topological sort",
    "Bipartite check"
  ],
  "concept": "Graphs are the most general data structure. Know two representations:\n- **Adjacency List**: `graph[u] = [(v, weight), ...]` — sparse graphs, most common\n- **Adjacency Matrix**: `matrix[u][v] = weight` — dense graphs, O(1) edge check\n\n> **Key insight**: Almost every graph problem is either a BFS/DFS traversal + some bookkeeping, or a shortest-path variant.",
  "templateCode": "class Solution {\n    public int bfs(Map<Integer, List<Integer>> graph, int start, int end) {\n        Set<Integer> visited = new HashSet<>();\n        Queue<int[]> queue = new LinkedList<>(); // [node, distance]\n\n        visited.add(start);\n        queue.offer(new int[]{start, 0});\n\n        while (!queue.isEmpty()) {\n            int[] curr = queue.poll();\n            int node = curr[0];\n            int dist = curr[1];\n\n            if (node == end) return dist;\n\n            for (int neighbor : graph.getOrDefault(node, new ArrayList<>())) {\n                if (!visited.contains(neighbor)) {\n                    visited.add(neighbor);\n                    queue.offer(new int[]{neighbor, dist + 1});\n                }\n            }\n        }\n\n        return -1; // unreachable\n    }\n}",
  "explanation": "| Scenario | Algorithm |\n|----------|-----------|\n| Unweighted shortest path | BFS |\n| Reachability / cycle detection | DFS |\n| Weighted shortest path (non-neg) | Dijkstra |\n| Negative edges | Bellman-Ford |\n| Task ordering with dependencies | Topological Sort |\n| Dynamic connectivity / MST | Union-Find / Kruskal |",
  "variations": [
    {
      "id": "bfs",
      "title": "BFS (Level-Order / Shortest Path)",
      "concept": "Unweighted shortest path, level-by-level traversal, multi-source BFS.",
      "templateCode": "class Solution {\n    public int countComponents(int n, int[][] edges) {\n        List<List<Integer>> graph = new ArrayList<>();\n        for (int i = 0; i < n; i++) graph.add(new ArrayList<>());\n        for (int[] edge : edges) {\n            graph.get(edge[0]).add(edge[1]);\n            graph.get(edge[1]).add(edge[0]);\n        }\n\n        boolean[] visited = new boolean[n];\n        int count = 0;\n\n        for (int i = 0; i < n; i++) {\n            if (!visited[i]) {\n                dfs(graph, i, visited);\n                count++;\n            }\n        }\n\n        return count;\n    }\n\n    private void dfs(List<List<Integer>> graph, int node, boolean[] visited) {\n        visited[node] = true;\n        for (int neighbor : graph.get(node)) {\n            if (!visited[neighbor]) {\n                dfs(graph, neighbor, visited);\n            }\n        }\n    }\n}"
    },
    {
      "id": "dfs",
      "title": "DFS (Reachability / Cycle Detection)",
      "concept": "Connected components, topological sort, detecting cycles via recursion colors.",
      "templateCode": "class Solution {\n    public int countComponents(int n, int[][] edges) {\n        List<List<Integer>> graph = new ArrayList<>();\n        for (int i = 0; i < n; i++) graph.add(new ArrayList<>());\n        for (int[] edge : edges) {\n            graph.get(edge[0]).add(edge[1]);\n            graph.get(edge[1]).add(edge[0]);\n        }\n\n        boolean[] visited = new boolean[n];\n        int count = 0;\n\n        for (int i = 0; i < n; i++) {\n            if (!visited[i]) {\n                dfs(graph, i, visited);\n                count++;\n            }\n        }\n\n        return count;\n    }\n\n    private void dfs(List<List<Integer>> graph, int node, boolean[] visited) {\n        visited[node] = true;\n        for (int neighbor : graph.get(node)) {\n            if (!visited[neighbor]) {\n                dfs(graph, neighbor, visited);\n            }\n        }\n    }\n}"
    },
    {
      "id": "dijkstra",
      "title": "Dijkstra's (Weighted Shortest Path)",
      "concept": "Greedy BFS using a min-heap on weighted graphs with non-negative edges.",
      "templateCode": "class Solution {\n    public int[] dijkstra(int n, List<List<int[]>> graph, int start) {\n        int[] dist = new int[n];\n        Arrays.fill(dist, Integer.MAX_VALUE);\n        dist[start] = 0;\n        \n        // PriorityQueue storing [distance, node]\n        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));\n        pq.offer(new int[]{0, start});\n\n        while (!pq.isEmpty()) {\n            int[] curr = pq.poll();\n            int d = curr[0], u = curr[1];\n\n            if (d > dist[u]) continue;\n\n            for (int[] edge : graph.get(u)) {\n                int v = edge[0], weight = edge[1];\n                if (dist[u] + weight < dist[v]) {\n                    dist[v] = dist[u] + weight;\n                    pq.offer(new int[]{dist[v], v});\n                }\n            }\n        }\n\n        return dist;\n    }\n}"
    },
    {
      "id": "topo",
      "title": "Topological Sort (DAGs)",
      "concept": "Kahn's algorithm (BFS) or DFS-based post-order to linearize a DAG.",
      "templateCode": "class Solution {\n    public int[] topoSort(int n, int[][] prerequisites) {\n        int[] indegree = new int[n];\n        List<List<Integer>> graph = new ArrayList<>();\n        for (int i = 0; i < n; i++) graph.add(new ArrayList<>());\n\n        for (int[] pre : prerequisites) {\n            graph.get(pre[1]).add(pre[0]);\n            indegree[pre[0]]++;\n        }\n\n        Queue<Integer> queue = new LinkedList<>();\n        for (int i = 0; i < n; i++) {\n            if (indegree[i] == 0) queue.offer(i);\n        }\n\n        int[] order = new int[n];\n        int index = 0;\n\n        while (!queue.isEmpty()) {\n            int node = queue.poll();\n            order[index++] = node;\n\n            for (int neighbor : graph.get(node)) {\n                indegree[neighbor]--;\n                if (indegree[neighbor] == 0) {\n                    queue.offer(neighbor);\n                }\n            }\n        }\n\n        return index == n ? order : new int[0]; // empty = cycle detected\n    }\n}"
    },
    {
      "id": "union-find",
      "title": "Union-Find (Disjoint Sets)",
      "concept": "Efficiently merge and query connected components. Great for Kruskal's MST and cycle detection in undirected graphs.",
      "templateCode": "class UnionFind {\n    private int[] parent;\n    private int[] rank;\n    public int components;\n\n    public UnionFind(int n) {\n        parent = new int[n];\n        rank = new int[n];\n        components = n;\n        for (int i = 0; i < n; i++) parent[i] = i;\n    }\n\n    public int find(int x) {\n        if (parent[x] != x) {\n            parent[x] = find(parent[x]); // path compression\n        }\n        return parent[x];\n    }\n\n    public boolean union(int x, int y) {\n        int px = find(x), py = find(y);\n        if (px == py) return false; // already connected\n        \n        if (rank[px] < rank[py]) {\n            int temp = px; px = py; py = temp;\n        }\n        parent[py] = px;\n        if (rank[px] == rank[py]) rank[px]++;\n        \n        components--;\n        return true;\n    }\n}"
    }
  ]
};
