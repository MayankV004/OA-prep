'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/empty-state';

interface TrendPoint {
  date: string;
  completed: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const value = payload[0].value;
  let formattedDate = label || '';
  try {
    if (label) {
      formattedDate = format(parseISO(label), 'MMMM d, yyyy');
    }
  } catch {
    // fallback
  }

  return (
    <div className="rounded-xl border border-border/80 bg-popover/95 px-3 py-2 shadow-xl backdrop-blur-md text-xs space-y-1">
      <div className="text-[10px] font-mono text-muted-foreground">{formattedDate}</div>
      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        <span className="font-bold text-foreground font-mono tabular-nums">{value}</span>
        <span className="text-muted-foreground">problem{value !== 1 ? 's' : ''} solved</span>
      </div>
    </div>
  );
}

export function CompletionTrend({ data }: { data: TrendPoint[] }) {
  const { totalInWindow, peakSolves, activeDays } = useMemo(() => {
    if (!data.length) return { totalInWindow: 0, peakSolves: 0, activeDays: 0 };
    let total = 0;
    let peak = 0;
    let active = 0;
    for (const point of data) {
      total += point.completed;
      if (point.completed > peak) peak = point.completed;
      if (point.completed > 0) active++;
    }
    return { totalInWindow: total, peakSolves: peak, activeDays: active };
  }, [data]);

  if (!data.length || totalInWindow === 0) {
    return (
      <div className="py-8 flex flex-col items-center justify-center text-center">
        <EmptyState
          compact
          icon={TrendingUp}
          title="No completions in this window"
          description="Solve algorithmic problems to generate your 90-day mastery trajectory."
        />
        <Link
          href="/dsa"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
        >
          <span>Begin Practicing DSA</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Telemetry Header Summary Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Period Solved:</span>
            <span className="font-mono font-bold text-foreground tabular-nums">{totalInWindow}</span>
          </div>
          <span className="text-muted-foreground/40">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Active Days:</span>
            <span className="font-mono font-bold text-primary tabular-nums">{activeDays}</span>
          </div>
          <span className="text-muted-foreground/40 hidden sm:inline">•</span>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-muted-foreground">Peak Daily:</span>
            <span className="font-mono font-bold text-foreground tabular-nums">{peakSolves}</span>
          </div>
        </div>

        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          90-Day Cadence
        </span>
      </div>

      {/* Chart Canvas */}
      <div className="h-[210px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="dashboardTrendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              strokeOpacity={0.35}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={(d) => {
                try {
                  return format(parseISO(d), 'MMM d');
                } catch {
                  return d;
                }
              }}
              stroke="var(--muted-foreground)"
              tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={32}
            />
            <YAxis
              allowDecimals={false}
              stroke="var(--muted-foreground)"
              tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="completed"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="url(#dashboardTrendGradient)"
              activeDot={{
                r: 4.5,
                fill: 'var(--primary)',
                stroke: 'var(--background)',
                strokeWidth: 2.5,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
