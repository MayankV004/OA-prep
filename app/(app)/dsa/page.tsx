'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Code2, Clock, Zap } from 'lucide-react';

interface PatternStat { group: string; total: number; completed: number }

const PATTERNS = [
  {
    name: 'Sliding Window',
    time: 'O(n)',
    space: 'O(k)',
    tags: ['Array', 'String'],
  },
  {
    name: 'Two Pointers',
    time: 'O(n)',
    space: 'O(1)',
    tags: ['Array', 'Sorting'],
  },
  {
    name: 'Binary Search',
    time: 'O(log n)',
    space: 'O(1)',
    tags: ['Array', 'Search'],
  },
  {
    name: 'Backtracking',
    time: 'O(2ⁿ)',
    space: 'O(n)',
    tags: ['DFS', 'Recursion'],
  },
  {
    name: 'DP',
    time: 'O(n²)',
    space: 'O(n)',
    tags: ['Memoization', 'Optimization'],
  },
  {
    name: 'Graphs',
    time: 'O(V+E)',
    space: 'O(V)',
    tags: ['BFS', 'DFS'],
  },
  {
    name: 'Trees',
    time: 'O(n)',
    space: 'O(h)',
    tags: ['DFS', 'BFS'],
  },
  {
    name: 'Greedy',
    time: 'O(n log n)',
    space: 'O(1)',
    tags: ['Sorting', 'Intervals'],
  },
  {
    name: 'Heap',
    time: 'O(log n)',
    space: 'O(k)',
    tags: ['Priority Queue'],
  },
  {
    name: 'Trie',
    time: 'O(L)',
    space: 'O(N×L)',
    tags: ['String', 'Prefix'],
  },
  {
    name: 'Segment Tree',
    time: 'O(log n)',
    space: 'O(n)',
    tags: ['Range Query', 'Update'],
  },
  {
    name: 'Bit Manipulation',
    time: 'O(1)',
    space: 'O(1)',
    tags: ['Bitwise', 'XOR'],
  },
];

export default function DSAPage() {
  const { data: progress = [] } = useQuery<PatternStat[]>({
    queryKey: ['problems', 'progress', 'pattern'],
    queryFn: async () => {
      const res = await fetch('/api/problems/progress?kind=pattern');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const statsMap = Object.fromEntries(progress.map((p) => [p.group, p]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pattern-wise DSA</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Learn the concept, study the template, then solve problems — pattern by pattern.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PATTERNS.map((pattern) => {
          const stat = statsMap[pattern.name] ?? { total: 0, completed: 0 };
          const pct = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
          const slug = pattern.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

          return (
            <Link key={pattern.name} href={`/dsa/${slug}`}>
              <div className="group rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer">
                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Code2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm leading-tight">{pattern.name}</h3>
                      <p className="text-xs text-muted-foreground">{stat.completed}/{stat.total} solved</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                </div>

                {/* Complexity badges */}
                <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" />{pattern.time}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                    <Zap className="h-2.5 w-2.5" />{pattern.space}
                  </span>
                  {pattern.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-medium bg-primary/8 text-primary px-1.5 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <Progress value={pct} className="h-1.5" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{pct}%</span>
                    {stat.total === 0 && (
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                        Empty
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
