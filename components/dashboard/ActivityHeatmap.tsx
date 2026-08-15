'use client';

import { useMemo } from 'react';
import { format, eachDayOfInterval, subDays, startOfDay } from 'date-fns';
import { CalendarDays, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';

interface HeatmapCell { date: string; count: number }

const INTENSITY_CLASSES = [
  'bg-muted/60 dark:bg-muted/30 border border-border/20',
  'bg-rose-500/25 border border-rose-500/35',
  'bg-rose-500/55 border border-rose-500/65',
  'bg-rose-500/85 border border-rose-400',
  'bg-red-600 border border-red-400 shadow-[0_0_10px_rgba(225,29,72,0.5)]',
];

export function ActivityHeatmap({ data }: { data: HeatmapCell[] }) {
  const countByDate = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach(d => { map[d.date] = d.count; });
    return map;
  }, [data]);

  const today = startOfDay(new Date());
  const startDate = subDays(today, 89);
  const allDays = eachDayOfInterval({ start: startDate, end: today });

  const firstDayOfWeek = allDays[0].getDay();
  const paddedDays: (Date | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...allDays,
  ];

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
      description="Your 90-day activity grid will update as you solve problems."
    />
  );

  return (
    <div className="min-w-0 space-y-4">
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-2 scrollbar-none">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1.5">
            {week.map((day, di) => {
              if (!day) return <div key={di} className="size-3.5 rounded-md" />;
              const dateStr = format(day, 'yyyy-MM-dd');
              const count = countByDate[dateStr] ?? 0;
              const intensity = Math.min(count, 4);
              return (
                <div
                  key={di}
                  title={`${format(day, 'MMM d, yyyy')}: ${count} action${count !== 1 ? 's' : ''}`}
                  className={cn(
                    'size-3.5 shrink-0 rounded-md transition-all duration-200 hover:scale-125 hover:z-10 cursor-pointer',
                    INTENSITY_CLASSES[intensity]
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/30">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Flame className="h-4 w-4 text-rose-500 inline" />
          <span><strong className="text-foreground">{totalCount}</strong> actions in the last 90 days</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Less</span>
          {INTENSITY_CLASSES.map((cls, i) => (
            <div key={i} className={cn('size-3 rounded-md', cls)} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
