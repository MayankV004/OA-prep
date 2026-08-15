'use client';

import { Layers, Flame, Zap, ShieldAlert } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

interface DifficultyMixProps {
  data: { Easy?: number; Medium?: number; Hard?: number };
}

export function DifficultyMix({ data }: DifficultyMixProps) {
  const easy = data.Easy ?? 0;
  const medium = data.Medium ?? 0;
  const hard = data.Hard ?? 0;
  const total = easy + medium + hard;

  if (!total) return (
    <div className="flex h-[180px] items-center justify-center">
      <EmptyState
        compact
        icon={Layers}
        title="No completed problems yet"
        description="Your Easy / Medium / Hard breakdown appears once you solve problems."
      />
    </div>
  );

  const easyPct = Math.round((easy / total) * 100);
  const medPct = Math.round((medium / total) * 100);
  const hardPct = Math.round((hard / total) * 100);

  const items = [
    { label: 'Easy', count: easy, pct: easyPct, color: 'bg-emerald-500', icon: Zap, textColor: 'text-emerald-500' },
    { label: 'Medium', count: medium, pct: medPct, color: 'bg-amber-500', icon: Flame, textColor: 'text-amber-500' },
    { label: 'Hard', count: hard, pct: hardPct, color: 'bg-rose-500', icon: ShieldAlert, textColor: 'text-rose-500' },
  ];

  return (
    <div className="space-y-5">
      {/* Multi-segmented Progress Bar */}
      <div className="space-y-2">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted p-0.5 shadow-inner">
          <div
            style={{ width: `${easyPct}%` }}
            className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
            title={`Easy: ${easy} (${easyPct}%)`}
          />
          <div
            style={{ width: `${medPct}%` }}
            className="h-full bg-amber-500 transition-all duration-500"
            title={`Medium: ${medium} (${medPct}%)`}
          />
          <div
            style={{ width: `${hardPct}%` }}
            className="h-full bg-rose-500 rounded-r-full transition-all duration-500"
            title={`Hard: ${hard} (${hardPct}%)`}
          />
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-3 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex flex-col justify-between p-3 rounded-2xl bg-background/60 border border-border/50 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">{item.label}</span>
                <Icon className={`h-3.5 w-3.5 ${item.textColor}`} />
              </div>
              <div className="mt-2">
                <div className="text-xl font-bold tracking-tight text-foreground">{item.count}</div>
                <div className="text-[10px] font-medium text-muted-foreground">{item.pct}% of total</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
