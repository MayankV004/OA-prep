'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';

import { EmptyState } from '@/components/ui/empty-state';

interface GroupStat { group: string; total: number; completed: number }

/** Borderless popover styling, driven entirely by design tokens. */
const TOOLTIP_STYLE = {
  backgroundColor: 'var(--popover)',
  color: 'var(--popover-foreground)',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--elevation-3)',
  fontSize: '12px',
} as const;

export function GroupProgress({ data }: { data: GroupStat[] }) {
  const chartData = data.map(d => ({
    name: d.group,
    completed: d.completed,
    remaining: d.total - d.completed,
  }));

  if (!chartData.length) return (
    <div className="flex h-[200px] items-center justify-center">
      <EmptyState
        compact
        icon={BarChart3}
        title="No pattern data yet"
        description="Progress per pattern appears once problems are tracked."
      />
    </div>
  );

  const chartHeight = Math.max(200, chartData.length * 36);

  return (
    <div className="w-full min-w-0" style={{ height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 8 }}>
          <XAxis
            type="number"
            allowDecimals={false}
            stroke="var(--muted-foreground)"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            dataKey="name"
            type="category"
            width={112}
            stroke="var(--muted-foreground)"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: 'var(--divider)' }}
            contentStyle={TOOLTIP_STYLE}
            labelStyle={{ color: 'var(--muted-foreground)', fontSize: '11px' }}
            itemStyle={{ color: 'var(--popover-foreground)' }}
          />
          <Bar dataKey="completed" stackId="a" fill="var(--chart-1)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="remaining" stackId="a" fill="var(--muted)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
