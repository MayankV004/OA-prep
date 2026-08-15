'use client';

import { BarChart3, CheckCircle2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

interface GroupStat { group: string; total: number; completed: number }

export function GroupProgress({ data }: { data: GroupStat[] }) {
  if (!data.length) return (
    <div className="flex h-[200px] items-center justify-center">
      <EmptyState
        compact
        icon={BarChart3}
        title="No pattern data yet"
        description="Progress per pattern appears once problems are tracked."
      />
    </div>
  );

  return (
    <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
      {data.map((item) => {
        const pct = item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0;
        const isComplete = pct === 100 && item.total > 0;

        return (
          <div
            key={item.group}
            className="p-3 rounded-2xl bg-background/50 border border-border/30 hover:border-rose-500/30 transition-colors shadow-sm space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-foreground truncate max-w-[70%] font-display">
                {isComplete && <CheckCircle2 className="h-3.5 w-3.5 text-rose-500 shrink-0" />}
                <span className="truncate">{item.group}</span>
              </div>
              <div className="text-muted-foreground font-mono text-[11px]">
                <span className="font-semibold text-foreground">{item.completed}</span> / {item.total} ({pct}%)
              </div>
            </div>

            {/* Custom Progress Bar */}
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                style={{ width: `${pct}%` }}
                className={`h-full rounded-full transition-all duration-500 ${
                  isComplete
                    ? 'bg-rose-500'
                    : 'bg-gradient-to-r from-red-600 via-rose-500 to-red-400'
                }`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
