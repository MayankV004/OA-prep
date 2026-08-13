'use client';

import { useMemo } from 'react';
import { format, eachDayOfInterval, subDays, startOfDay } from 'date-fns';
import { CalendarDays } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Text } from '@/components/ui/typography';
import { EmptyState } from '@/components/ui/empty-state';

interface HeatmapCell { date: string; count: number }

const INTENSITY_CLASSES = [
  'bg-muted',
  'bg-accent-200',
  'bg-accent-300',
  'bg-accent-400',
  'bg-accent-500',
];

export function ActivityHeatmap({ data }: { data: HeatmapCell[] }) {
  const countByDate = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach(d => { map[d.date] = d.count; });
    return map;
  }, [data]);

  // Build 90-day grid aligned to Sun–Sat weeks
  const today = startOfDay(new Date());
  const startDate = subDays(today, 89);
  const allDays = eachDayOfInterval({ start: startDate, end: today });

  // Pad start to nearest Sunday
  const firstDayOfWeek = allDays[0].getDay(); // 0=Sun
  const paddedDays: (Date | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...allDays,
  ];
  // Build weeks (columns)
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }

  const totalCount = data.reduce((s, d) => s + d.count, 0);

  if (!data.length) return (
    <EmptyState
      compact
      icon={CalendarDays}
      title="No activity recorded"
      description="Your last 90 days will fill in as you work through problems."
    />
  );

  return (
    <div className="min-w-0 space-y-3">
      <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => {
              if (!day) return <div key={di} className="size-3 rounded-sm" />;
              const dateStr = format(day, 'yyyy-MM-dd');
              const count = countByDate[dateStr] ?? 0;
              const intensity = Math.min(count, 4);
              return (
                <div
                  key={di}
                  title={`${format(day, 'MMM d, yyyy')}: ${count} action${count !== 1 ? 's' : ''}`}
                  className={cn(
                    'size-3 shrink-0 rounded-sm transition-opacity duration-200 ease-out-quart hover:opacity-70',
                    INTENSITY_CLASSES[intensity]
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Text size="caption" tone="muted" numeric>
          {totalCount} actions in the last 90 days
        </Text>
        <div className="flex items-center gap-1">
          <Text as="span" size="micro" tone="muted">
            Less
          </Text>
          {INTENSITY_CLASSES.map((cls, i) => (
            <div key={i} aria-hidden className={cn('size-2.5 rounded-sm', cls)} />
          ))}
          <Text as="span" size="micro" tone="muted">
            More
          </Text>
        </div>
      </div>
    </div>
  );
}
