'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Layers } from 'lucide-react';

interface Stat { group: string; total: number; completed: number }

const BUCKETS = ['Ad-hoc', 'Constructive', 'Math'];

export default function NonStandardPage() {
  const { data: progress = [] } = useQuery<Stat[]>({
    queryKey: ['problems', 'progress', 'nonstandard'],
    queryFn: async () => {
      const res = await fetch('/api/problems/progress?kind=nonstandard');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const statsMap = Object.fromEntries(progress.map(p => [p.group, p]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Non-standard DSA</h1>
        <p className="text-muted-foreground text-sm mt-1">Ad-hoc, constructive, and math problems</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {BUCKETS.map(bucket => {
          const stat = statsMap[bucket] ?? { total: 0, completed: 0 };
          const pct = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
          const slug = bucket.toLowerCase();

          return (
            <Link key={bucket} href={`/non-standard/${slug}`}>
              <div className="group rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Layers className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{bucket}</h3>
                      <p className="text-xs text-muted-foreground">{stat.completed}/{stat.total} done</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                </div>
                <Progress value={pct} className="h-1.5" />
                <p className="text-xs text-muted-foreground mt-1.5">{pct}%</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
