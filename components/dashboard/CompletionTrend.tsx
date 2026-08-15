'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { LineChart as LineChartIcon } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

interface TrendPoint { date: string; completed: number }

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--popover)',
  color: 'var(--popover-foreground)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  fontSize: '12px',
  padding: '8px 12px',
} as const;

export function CompletionTrend({ data }: { data: TrendPoint[] }) {
  if (!data.length) return (
    <div className="flex h-[240px] items-center justify-center">
      <EmptyState
        compact
        icon={LineChartIcon}
        title="No completions recorded"
        description="Solve a problem to start tracking your 90-day trend."
      />
    </div>
  );

  return (
    <div className="h-[240px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="completionRedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#e11d48" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            strokeOpacity={0.3}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={d => {
              try { return format(parseISO(d), 'MMM d'); } catch { return d; }
            }}
            stroke="var(--muted-foreground)"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={28}
          />
          <YAxis
            allowDecimals={false}
            stroke="var(--muted-foreground)"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <Tooltip
            cursor={{ stroke: '#e11d48', strokeWidth: 1.5, strokeDasharray: '4 4' }}
            contentStyle={TOOLTIP_STYLE}
            labelFormatter={d => {
              try { return format(parseISO(d as string), 'MMM d, yyyy'); } catch { return d; }
            }}
          />
          <Area
            type="monotone"
            dataKey="completed"
            stroke="#e11d48"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#completionRedGradient)"
            activeDot={{ r: 5, fill: '#e11d48', stroke: 'var(--background)', strokeWidth: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
