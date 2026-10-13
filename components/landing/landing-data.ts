import { Code2, Terminal, BookOpen, Building2 } from 'lucide-react';
import { StickyScrollItem } from '@/components/ui/sticky-scroll-section';

export interface CodeSnippet {
  lang: string;
  file: string;
  code: string;
  stats: string;
}

export const CODE_SNIPPETS: Record<string, CodeSnippet> = {
  cpp: {
    lang: 'C++',
    file: 'sliding_window_max.cpp',
    code: `// Pattern: Sliding Window (Maximum Sum Subarray of Size K)
#include <vector>
#include <numeric>
#include <algorithm>

int maxSumSubarray(const std::vector<int>& nums, int k) {
    if (nums.size() < k) return 0;
    int windowSum = std::accumulate(nums.begin(), nums.begin() + k, 0);
    int maxSum = windowSum;

    for (size_t i = k; i < nums.size(); ++i) {
        windowSum += nums[i] - nums[i - k];
        maxSum = std::max(maxSum, windowSum);
    }
    return maxSum;
}`,
    stats: 'O(N) Time · O(1) Space · C++20 Standard',
  },
  python: {
    lang: 'Python',
    file: 'two_pointers.py',
    code: `# Pattern: Two Pointers (Container With Most Water)
def maxArea(height: list[int]) -> int:
    left, right = 0, len(height) - 1
    max_water = 0
    
    while left < right:
        width = right - left
        h = min(height[left], height[right])
        max_water = max(max_water, width * h)
        
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
            
    return max_water`,
    stats: 'O(N) Time · O(1) Space · Python 3.12',
  },
  java: {
    lang: 'Java',
    file: 'GraphBipartite.java',
    code: `// Pattern: BFS / Graph Coloring (Check Bipartite)
import java.util.*;

public class Solution {
    public boolean isBipartite(int[][] graph) {
        int n = graph.length;
        int[] colors = new int[n];
        
        for (int i = 0; i < n; i++) {
            if (colors[i] != 0) continue;
            Queue<Integer> q = new LinkedList<>();
            q.add(i);
            colors[i] = 1;
            
            while (!q.isEmpty()) {
                int node = q.poll();
                for (int neighbor : graph[node]) {
                    if (colors[neighbor] == 0) {
                        colors[neighbor] = -colors[node];
                        q.add(neighbor);
                    } else if (colors[neighbor] == colors[node]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
}`,
    stats: 'O(V+E) Time · O(V) Space · Java 21',
  },
};

export const getPlatformModules = (liveStats: {
  variations: string;
  problems: string;
  topics: string;
}): StickyScrollItem[] => [
  {
    id: 'dsa-patterns',
    number: '01',
    title: 'Pattern-Based DSA Roadmap',
    subtitle: 'Master reusable algorithmic patterns instead of memorizing hundreds of problems.',
    description:
      'Deconstruct complex LeetCode and OA questions into 19 foundational pattern categories. Learn to spot pattern triggers like Sliding Window, Two Pointers, Monotonic Stack, Graph BFS/DFS, and Dynamic Programming.',
    highlights: [
      '19 Core DSA Pattern Categories',
      'Problem Variations Grouped by Type',
      'Visual Intuition & Code Templates',
      'Pattern Mastery Tracker',
    ],
    linkText: 'Explore DSA Roadmap',
    linkUrl: '/dsa',
    icon: Code2,
    metric: `${liveStats.variations} Variations`,
  },
  {
    id: 'cs-subjects',
    number: '02',
    title: 'CS Core Fundamentals',
    subtitle: 'Prepare for technical interview rounds in OS, DBMS, Networks, and System Design.',
    description:
      'High-yield preparation for computer science fundamentals. Master Operating Systems concurrency, SQL query indexing, TCP/IP networking protocols, and System Design principles.',
    highlights: [
      'Operating Systems & Concurrency',
      'DBMS, B-Trees & SQL Indexing',
      'Computer Networks & Protocols',
      'Object-Oriented Design Principles',
    ],
    linkText: 'Study CS Subjects',
    linkUrl: '/subjects',
    icon: Terminal,
    metric: '4 Core CS Subjects',
  },
  {
    id: 'company-oa',
    number: '03',
    title: 'Company OA & Non-Standard Problems',
    subtitle: 'Practice authentic assessments from top engineering employers.',
    description:
      'Tackle authentic Online Assessment questions and non-standard problem sets asked by Amazon, Google, Microsoft, Uber, and Atlassian under timed conditions.',
    highlights: [
      'Amazon, Google & Uber OA Sets',
      'Non-Standard Problem Buckets',
      'Timed Exam Simulation Mode',
      'Hidden Edge Cases & Time Constraints',
    ],
    linkText: 'View OA Question Sets',
    linkUrl: '/oa',
    icon: Building2,
    metric: '6 Company OA Simulators',
  },
  {
    id: 'active-recall',
    number: '04',
    title: 'Active Recall & Cheatsheets',
    subtitle: 'Retain crucial algorithms and complexity proofs before interviews.',
    description:
      'Built-in spaced repetition engine and quick-reference cheatsheets. Retain time & space complexity proofs, OS mutex vs semaphore nuances, and SQL indexing rules right before your interview.',
    highlights: [
      'Algorithm Complexity Proofs',
      'OS & Networking Flashcards',
      'System Design Architecture Notes',
      'Spaced Repetition Review Engine',
    ],
    linkText: 'Open Cheatsheets',
    linkUrl: '/cheatsheets',
    icon: BookOpen,
    metric: 'Active Recall System',
  },
];

export const PLACEMENT_STEPS = [
  {
    num: '01',
    title: 'Identify Patterns',
    desc: 'Understand fundamental triggers across 19 algorithmic patterns rather than memorizing isolated solutions.',
  },
  {
    num: '02',
    title: 'Practice Variations',
    desc: 'Solve handpicked OA problem variations grouped by pattern difficulty and company frequency.',
  },
  {
    num: '03',
    title: 'Retain CS Cores',
    desc: 'Use active-recall flashcards for Operating Systems, DBMS, Computer Networks, and System Design.',
  },
  {
    num: '04',
    title: 'Simulate Real OAs',
    desc: 'Test your speed and accuracy in timed exam environments with multi-language code execution.',
  },
];

export const WORKSPACE_HIGHLIGHTS = [
  'Handpicked problem sets mapped to top company OA patterns',
  'Detailed complexity breakdowns and intuition notes',
  'Integrated code playground with multi-language execution',
  'Personalized progress tracker and performance analytics',
];
