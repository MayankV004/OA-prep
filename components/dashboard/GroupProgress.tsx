'use client';

import { useState, useMemo } from 'react';
import { BarChart3, CheckCircle2, ArrowRight, Search } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

interface GroupStat {
  group: string;
  total: number;
  completed: number;
}

interface GroupProgressProps {
  data: GroupStat[];
  showSearch?: boolean;
  maxHeight?: string;
}

export function GroupProgress({
  data,
  showSearch = false,
  maxHeight = 'max-h-[380px]',
}: GroupProgressProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Defensive array normalization
  const safeData = useMemo<GroupStat[]>(() => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray((data as unknown as { stats?: GroupStat[] }).stats)) {
      return (data as unknown as { stats: GroupStat[] }).stats;
    }
    return [];
  }, [data]);

  // Derived real metrics
  const { masteredCount, inProgressCount, totalCompleted, totalPossible } = useMemo(() => {
    let mastered = 0;
    let inProgress = 0;
    let completedSum = 0;
    let totalSum = 0;

    for (const item of safeData) {
      completedSum += item.completed;
      totalSum += item.total;
      if (item.total > 0 && item.completed >= item.total) {
        mastered++;
      } else if (item.completed > 0) {
        inProgress++;
      }
    }
    return {
      masteredCount: mastered,
      inProgressCount: inProgress,
      totalCompleted: completedSum,
      totalPossible: totalSum,
    };
  }, [safeData]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return safeData;
    const q = searchQuery.toLowerCase().trim();
    return safeData.filter((item) => item.group.toLowerCase().includes(q));
  }, [safeData, searchQuery]);

  if (!safeData.length) {
    return (
      <div className="py-8 flex flex-col items-center justify-center text-center">
        <EmptyState
          compact
          icon={BarChart3}
          title="No pattern data recorded"
          description="Pattern telemetry tracks your progress as problems are categorized by interview pattern."
        />
        <Link
          href="/dsa"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
        >
          <span>Explore Pattern Problems</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>
    );
  }

  const overallPatternPct =
    totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  return (
    <div className="space-y-3.5">
      {/* Telemetry Summary Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs pb-1">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            {safeData.length} Patterns
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">
            Mastered:{' '}
            <strong className="text-emerald-500 font-mono tabular-nums">{masteredCount}</strong>
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">
            In Progress:{' '}
            <strong className="text-amber-500 font-mono tabular-nums">{inProgressCount}</strong>
          </span>
        </div>

        <div className="text-[11px] font-mono text-muted-foreground">
          Overall: <strong className="text-foreground">{overallPatternPct}%</strong> ({totalCompleted}/{totalPossible})
        </div>
      </div>

      {/* Optional Search Filter Bar */}
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter patterns (e.g. Sliding Window, Two Pointers, Dynamic Programming)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-surface-sunken border border-border/80 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      )}

      {/* Pattern Progress Items List */}
      <div className={cn('space-y-2.5 overflow-y-auto pr-1 scrollbar-thin', maxHeight)}>
        {filteredData.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No patterns matched &ldquo;{searchQuery}&rdquo;.
          </div>
        ) : (
          filteredData.map((item) => {
            const pct = item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0;
            const isComplete = pct === 100 && item.total > 0;
            const isStarted = pct > 0 && !isComplete;

            return (
              <div
                key={item.group}
                className={cn(
                  'group p-3 rounded-xl border bg-card/60 transition-all hover:border-primary/40 hover:bg-card space-y-2',
                  isComplete ? 'border-emerald-500/25' : 'border-border/70'
                )}
              >
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 font-bold text-foreground truncate min-w-0">
                    {isComplete ? (
                      <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <span className="size-2 rounded-full bg-muted-foreground/30 shrink-0 group-hover:bg-primary transition-colors" />
                    )}
                    <span className="truncate text-xs font-semibold">{item.group}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isComplete ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        Mastered
                      </span>
                    ) : isStarted ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        {pct}%
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-muted text-muted-foreground">
                        0%
                      </span>
                    )}

                    <span className="text-muted-foreground font-mono text-[11px] tabular-nums">
                      <strong className="text-foreground">{item.completed}</strong>/{item.total}
                    </span>
                  </div>
                </div>

                {/* Progress Bar with Glowing Tip */}
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden relative">
                  <div
                    style={{ width: `${pct}%` }}
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      isComplete
                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                        : isStarted
                        ? 'bg-amber-500'
                        : 'bg-primary'
                    )}
                  />
                </div>

                {/* Quick Link on Hover */}
                <div className="flex items-center justify-between text-[11px] pt-0.5 text-muted-foreground">
                  <span className="text-[10px] font-mono">
                    {item.total - item.completed === 0
                      ? 'All problems completed'
                      : `${item.total - item.completed} problems remaining`}
                  </span>
                  <Link
                    href={`/dsa?pattern=${encodeURIComponent(item.group)}`}
                    className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                  >
                    <span>Practice pattern</span>
                    <ArrowRight className="size-2.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
