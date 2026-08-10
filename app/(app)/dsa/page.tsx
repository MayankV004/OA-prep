'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Code2 } from 'lucide-react';

interface PatternStat { group: string; total: number; completed: number }

const PATTERNS = [
  'Sliding Window', 'Two Pointers', 'Binary Search', 'Backtracking',
  'DP', 'Graphs', 'Trees', 'Greedy', 'Heap', 'Trie', 'Segment Tree', 'Bit Manipulation',
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

  const statsMap = Object.fromEntries(progress.map(p => [p.group, p]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pattern-wise DSA</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track problems grouped by algorithmic pattern
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PATTERNS.map(pattern => {
          const stat = statsMap[pattern] ?? { total: 0, completed: 0 };
          const pct = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
          const slug = pattern.toLowerCase().replace(/\s+/g, '-');

          return (
            <Link key={pattern} href={`/dsa/${slug}`}>
              <div className="group rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Code2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm leading-tight">{pattern}</h3>
                      <p className="text-xs text-muted-foreground">{stat.completed}/{stat.total} done</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                </div>
                <div className="space-y-1.5">
                  <Progress value={pct} className="h-1.5" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{pct}%</span>
                    {stat.total === 0 && <Badge variant="outline" className="text-[10px] h-4">Empty</Badge>}
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
