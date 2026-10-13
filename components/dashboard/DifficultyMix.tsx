'use client';

import { Layers, ArrowRight, ShieldCheck, Flame, Zap } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/empty-state';

interface DifficultyMixProps {
  data: { Easy?: number; Medium?: number; Hard?: number };
}

export function DifficultyMix({ data }: DifficultyMixProps) {
  const easy = data.Easy ?? 0;
  const medium = data.Medium ?? 0;
  const hard = data.Hard ?? 0;
  const total = easy + medium + hard;

  if (!total) {
    return (
      <div className="py-8 flex flex-col items-center justify-center text-center">
        <EmptyState
          compact
          icon={Layers}
          title="No completed problems recorded"
          description="Your Easy, Medium, and Hard distribution appears once problems are marked complete."
        />
        <Link
          href="/dsa"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
        >
          <span>Solve Practice Problems</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>
    );
  }

  const easyPct = Math.round((easy / total) * 100);
  const medPct = Math.round((medium / total) * 100);
  const hardPct = Math.round((hard / total) * 100);

  // Real metric: Medium + Hard ratio (Tier-1 companies evaluate heavily on Med/Hard readiness)
  const tier1WeightPct = Math.round(((medium + hard) / total) * 100);

  const tiers = [
    {
      label: 'Easy',
      count: easy,
      pct: easyPct,
      category: 'Foundations',
      icon: ShieldCheck,
      colorText: 'text-emerald-500',
      bgColor: 'bg-emerald-500',
      cardBg: 'bg-emerald-500/[0.03]',
      cardBorder: 'border-emerald-500/20 hover:border-emerald-500/40',
      barColor: 'bg-emerald-500',
    },
    {
      label: 'Medium',
      count: medium,
      pct: medPct,
      category: 'OA Core',
      icon: Zap,
      colorText: 'text-amber-500',
      bgColor: 'bg-amber-500',
      cardBg: 'bg-amber-500/[0.03]',
      cardBorder: 'border-amber-500/20 hover:border-amber-500/40',
      barColor: 'bg-amber-500',
    },
    {
      label: 'Hard',
      count: hard,
      pct: hardPct,
      category: 'Differentiator',
      icon: Flame,
      colorText: 'text-red-500',
      bgColor: 'bg-red-500',
      cardBg: 'bg-red-500/[0.04]',
      cardBorder: 'border-red-500/20 hover:border-red-500/40',
      barColor: 'bg-red-500',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Tier-1 Interview Weight Insight */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Placement Difficulty Depth:</span>
          <span className="font-mono font-bold text-foreground tabular-nums">
            {tier1WeightPct}% Med+Hard
          </span>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground">
          {total} total solved
        </span>
      </div>

      {/* Multi-segmented Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted/70 p-0.5 border border-border/40">
          {easyPct > 0 && (
            <div
              style={{ width: `${easyPct}%` }}
              className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
              title={`Easy: ${easy} (${easyPct}%)`}
            />
          )}
          {medPct > 0 && (
            <div
              style={{ width: `${medPct}%` }}
              className="h-full bg-amber-500 transition-all duration-500"
              title={`Medium: ${medium} (${medPct}%)`}
            />
          )}
          {hardPct > 0 && (
            <div
              style={{ width: `${hardPct}%` }}
              className="h-full bg-red-500 rounded-r-full transition-all duration-500"
              title={`Hard: ${hard} (${hardPct}%)`}
            />
          )}
        </div>

        {/* Legend Percentages */}
        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground px-0.5">
          <span className="text-emerald-500 font-bold">{easyPct}% Easy</span>
          <span className="text-amber-500 font-bold">{medPct}% Medium</span>
          <span className="text-red-500 font-bold">{hardPct}% Hard</span>
        </div>
      </div>

      {/* 3 Difficulty Metric Cards */}
      <div className="grid grid-cols-3 gap-2.5 pt-1">
        {tiers.map((tier) => {
          const IconComponent = tier.icon;
          return (
            <div
              key={tier.label}
              className={`p-3 rounded-xl border transition-all ${tier.cardBg} ${tier.cardBorder} flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <IconComponent className={`size-3.5 ${tier.colorText}`} />
                  <span>{tier.label}</span>
                </span>
                <span className={`size-1.5 rounded-full ${tier.bgColor}`} />
              </div>

              <div className="mt-3">
                <div className="font-display text-2xl font-bold tracking-tight text-foreground tabular-nums">
                  {tier.count}
                </div>
                <div className="mt-0.5 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                  <span>{tier.pct}% share</span>
                  <span className="hidden sm:inline text-muted-foreground/80">{tier.category}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
