'use client';

import { useMemo } from 'react';
import { format, parseISO, eachDayOfInterval, subDays, startOfDay } from 'date-fns';

interface HeatmapCell { date: string; count: number }

const INTENSITY_CLASSES = [
  'bg-muted',
  'bg-primary/20',
  'bg-primary/40',
  'bg-primary/65',
  'bg-primary',
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

  return (
    <div className="space-y-2">
      <div className="flex gap-1 overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => {
              if (!day) return <div key={di} className="h-3 w-3 rounded-sm" />;
              const dateStr = format(day, 'yyyy-MM-dd');
              const count = countByDate[dateStr] ?? 0;
              const intensity = Math.min(count, 4);
              return (
                <div
                  key={di}
                  title={`${format(day, 'MMM d, yyyy')}: ${count} action${count !== 1 ? 's' : ''}`}
                  className={`h-3 w-3 rounded-sm cursor-default transition-opacity hover:opacity-80 ${INTENSITY_CLASSES[intensity]}`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{totalCount} actions in the last 90 days</span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          {INTENSITY_CLASSES.map((cls, i) => (
            <div key={i} className={`h-2.5 w-2.5 rounded-sm ${cls}`} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
