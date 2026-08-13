'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { LineChart as LineChartIcon } from 'lucide-react';

import { EmptyState } from '@/components/ui/empty-state';

interface TrendPoint { date: string; completed: number }

/** Borderless popover styling, driven entirely by design tokens. */
const TOOLTIP_STYLE = {
  backgroundColor: 'var(--popover)',
  color: 'var(--popover-foreground)',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--elevation-3)',
  fontSize: '12px',
} as const;

export function CompletionTrend({ data }: { data: TrendPoint[] }) {
  if (!data.length) return (
    <div className="flex h-[200px] items-center justify-center">
      <EmptyState
        compact
        icon={LineChartIcon}
        title="No completions yet"
        description="Nothing completed in the last 90 days. Solve a problem to start the trend."
      />
    </div>
  );

  return (
    <div className="h-[200px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--divider)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={d => {
              try { return format(parseISO(d), 'MMM d'); } catch { return d; }
            }}
            stroke="var(--muted-foreground)"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            fontSize={11}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            allowDecimals={false}
            stroke="var(--muted-foreground)"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={28}
          />
          <Tooltip
            cursor={{ stroke: 'var(--divider)', strokeWidth: 1 }}
            contentStyle={TOOLTIP_STYLE}
            labelStyle={{ color: 'var(--muted-foreground)', fontSize: '11px' }}
            itemStyle={{ color: 'var(--popover-foreground)' }}
            labelFormatter={d => {
              try { return format(parseISO(d as string), 'MMM d, yyyy'); } catch { return d; }
            }}
          />
          <Line
            type="monotone"
            dataKey="completed"
            stroke="var(--chart-1)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: 'var(--chart-1)', stroke: 'var(--card)', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
