'use client';

import { useState } from 'react';
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
import { TrendingUp, DollarSign, Calendar, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RevenuePoint {
  date: string; // ISO date 'yyyy-MM-dd'
  revenue: number; // Daily revenue in USD
  cumulativeRevenue: number; // Cumulative total revenue in USD
}

interface RevenueTrendChartProps {
  data: RevenuePoint[];
  totalRevenue: number;
  mrr: number;
}

export function RevenueTrendChart({
  data = [],
  totalRevenue = 0,
  mrr = 0,
}: RevenueTrendChartProps) {
  const [viewMode, setViewMode] = useState<'cumulative' | 'daily'>('cumulative');

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center text-xs text-muted-foreground font-mono">
        No subscription revenue data recorded yet.
      </div>
    );
  }

  const latestPoint = data[data.length - 1];
  const firstPoint = data[0];
  const deltaUsd = (latestPoint?.cumulativeRevenue || 0) - (firstPoint?.cumulativeRevenue || 0);

  return (
    <div className="space-y-4">
      {/* Chart Header Controls & Sub-metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-2xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <DollarSign className="size-3 text-emerald-500" />
              <span>{viewMode === 'cumulative' ? 'Total Revenue (Cumulative)' : 'Daily Revenue Additions'}</span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-display text-2xl font-black text-foreground tabular-nums">
                ${(viewMode === 'cumulative' ? totalRevenue : deltaUsd).toLocaleString()}
              </span>
              <span className="text-xs font-mono font-semibold text-emerald-500 flex items-center">
                <ArrowUpRight className="size-3 mr-0.5" />
                ${mrr.toLocaleString()}/mo MRR
              </span>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('cumulative')}
            className={cn(
              'px-3 py-1 rounded-lg text-2xs font-semibold font-mono transition-all cursor-pointer',
              viewMode === 'cumulative'
                ? 'bg-background text-foreground shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Cumulative ($)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('daily')}
            className={cn(
              'px-3 py-1 rounded-lg text-2xs font-semibold font-mono transition-all cursor-pointer',
              viewMode === 'daily'
                ? 'bg-background text-foreground shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Daily ($)
          </button>
        </div>
      </div>

      {/* Recharts Area / Line Chart Container */}
      <div className="h-[250px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="admin-revenue-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              strokeOpacity={0.4}
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
              tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={32}
            />

            <YAxis
              tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
              stroke="var(--muted-foreground)"
              tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={45}
            />

            <Tooltip
              cursor={{ stroke: '#10B981', strokeWidth: 1.5, strokeDasharray: '4 4' }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const pt = payload[0].payload as RevenuePoint;
                return (
                  <div className="rounded-xl border border-border/80 bg-popover/95 p-3 shadow-xl backdrop-blur-md text-xs font-mono space-y-1.5 min-w-[170px]">
                    <div className="text-2xs text-muted-foreground font-semibold flex items-center gap-1">
                      <Calendar className="size-3 text-emerald-500" />
                      <span>
                        {(() => {
                          try {
                            return format(parseISO(label as string), 'MMM d, yyyy');
                          } catch {
                            return label;
                          }
                        })()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1 border-t border-border/50">
                      <span className="text-muted-foreground text-2xs">Cumulative:</span>
                      <span className="font-bold text-foreground text-sm font-mono">
                        ${pt.cumulativeRevenue.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground text-2xs">Day Revenue:</span>
                      <span className="font-bold text-emerald-400 text-xs font-mono">
                        +${pt.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              }}
            />

            <Area
              type="monotone"
              dataKey={viewMode === 'cumulative' ? 'cumulativeRevenue' : 'revenue'}
              stroke="#10B981"
              strokeWidth={2.5}
              fill="url(#admin-revenue-gradient)"
              fillOpacity={1}
              activeDot={{
                r: 5,
                fill: '#10B981',
                stroke: 'var(--background)',
                strokeWidth: 3,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
