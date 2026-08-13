'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Layers } from 'lucide-react';

import { EmptyState } from '@/components/ui/empty-state';
import { Text } from '@/components/ui/typography';

interface DifficultyMixProps {
  data: { Easy?: number; Medium?: number; Hard?: number };
  groups?: string[];
}

/**
 * One source of truth for the difficulty ramp so the legend swatches and the
 * stacked bar can never drift apart. All values are design tokens.
 */
const DIFFICULTY_COLORS: Record<'Easy' | 'Medium' | 'Hard', string> = {
  Easy: 'var(--chart-4)',
  Medium: 'var(--chart-3)',
  Hard: 'var(--destructive)',
};

/** Borderless popover styling, driven entirely by design tokens. */
const TOOLTIP_STYLE = {
  backgroundColor: 'var(--popover)',
  color: 'var(--popover-foreground)',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--elevation-3)',
  fontSize: '12px',
} as const;

export function DifficultyMix({ data }: DifficultyMixProps) {
  const chartData = [
    { name: 'Difficulty', Easy: data.Easy ?? 0, Medium: data.Medium ?? 0, Hard: data.Hard ?? 0 },
  ];

  const total = (data.Easy ?? 0) + (data.Medium ?? 0) + (data.Hard ?? 0);
  if (!total) return (
    <div className="flex h-[120px] items-center justify-center">
      <EmptyState
        compact
        icon={Layers}
        title="No completed problems yet"
        description="Your Easy / Medium / Hard split shows up after your first completion."
      />
    </div>
  );

  return (
    <div className="min-w-0 space-y-3">
      <dl className="flex flex-wrap gap-x-4 gap-y-2">
        {(['Easy', 'Medium', 'Hard'] as const).map(d => (
          <div key={d} className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: DIFFICULTY_COLORS[d] }}
            />
            <Text as="span" size="caption" tone="muted">
              {d}
            </Text>
            <Text as="span" size="caption" tone="primary" weight="semibold" numeric>
              {data[d] ?? 0}
            </Text>
          </div>
        ))}
      </dl>

      <div className="h-10 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 0 }}>
            <XAxis type="number" hide />
            <YAxis type="category" hide />
            <Tooltip
              cursor={false}
              contentStyle={TOOLTIP_STYLE}
              labelStyle={{ color: 'var(--muted-foreground)', fontSize: '11px' }}
              itemStyle={{ color: 'var(--popover-foreground)' }}
            />
            <Bar dataKey="Easy" stackId="d" fill={DIFFICULTY_COLORS.Easy} radius={[4, 0, 0, 4]} />
            <Bar dataKey="Medium" stackId="d" fill={DIFFICULTY_COLORS.Medium} />
            <Bar dataKey="Hard" stackId="d" fill={DIFFICULTY_COLORS.Hard} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
