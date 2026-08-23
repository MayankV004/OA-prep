'use client';

import { useMemo, useState } from 'react';
import {
  format,
  eachDayOfInterval,
  subMonths,
  startOfMonth,
  endOfMonth,
  subDays,
  startOfDay,
  min,
  eachMonthOfInterval,
} from 'date-fns';
import { Flame, Trophy, Zap, ChevronDown, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface HeatmapCell {
  date: string;
  count: number;
}

type TimeRange = 'year' | '6months' | '3months';
type ColorTheme = 'emerald' | 'rose';

const EMERALD_CLASSES = [
  'bg-neutral-200/80 dark:bg-neutral-800/80 border border-border/30',
  'bg-emerald-950/40 border border-emerald-800/50 dark:bg-emerald-950/70 text-emerald-300',
  'bg-emerald-800/70 border border-emerald-600/60 dark:bg-emerald-800/90 text-emerald-200',
  'bg-emerald-600 border border-emerald-500 dark:bg-emerald-600 text-white',
  'bg-emerald-500 border border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)] dark:bg-emerald-400 text-black font-bold',
];

const ROSE_CLASSES = [
  'bg-neutral-200/80 dark:bg-neutral-800/80 border border-border/30',
  'bg-rose-950/40 border border-rose-800/50 dark:bg-rose-950/70',
  'bg-rose-800/70 border border-rose-600/60 dark:bg-rose-800/90',
  'bg-rose-600 border border-rose-500 dark:bg-rose-600',
  'bg-rose-500 border border-rose-400 shadow-[0_0_8px_rgba(225,29,72,0.5)] dark:bg-rose-400',
];

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function ActivityHeatmap({ data = [] }: { data?: HeatmapCell[] }) {
  const [timeRange, setTimeRange] = useState<TimeRange>('year');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('emerald');

  const countByDate = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach((d) => {
      map[d.date] = d.count;
    });
    return map;
  }, [data]);

  const today = startOfDay(new Date());

  // Determine months to display based on selected time range
  const monthCount = timeRange === 'year' ? 12 : timeRange === '6months' ? 6 : 3;
  const startMonthDate = startOfMonth(subMonths(today, monthCount));

  // Get array of month start dates
  const months = useMemo(() => {
    return eachMonthOfInterval({
      start: startMonthDate,
      end: today,
    });
  }, [startMonthDate, today]);

  // Compute month blocks containing week columns (7 rows: Sun..Sat)
  const monthBlocks = useMemo(() => {
    return months.map((monthDate) => {
      const mStart = startOfMonth(monthDate);
      const mEnd = min([endOfMonth(monthDate), today]);
      const monthDays = eachDayOfInterval({ start: mStart, end: mEnd });

      const weekColumns: (Date | null)[][] = [];
      let currentColumn: (Date | null)[] = Array(7).fill(null);

      monthDays.forEach((day) => {
        const dayOfWeek = day.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

        // If it's Sunday and we already have entries in currentColumn, push it and reset
        if (dayOfWeek === 0 && currentColumn.some((d) => d !== null)) {
          weekColumns.push(currentColumn);
          currentColumn = Array(7).fill(null);
        }

        currentColumn[dayOfWeek] = day;
      });

      if (currentColumn.some((d) => d !== null)) {
        weekColumns.push(currentColumn);
      }

      return {
        monthName: MONTH_NAMES[monthDate.getMonth()],
        monthYear: format(monthDate, 'MMM yyyy'),
        weekColumns,
      };
    });
  }, [months, today]);

  // Compute Streaks and Stats (LeetCode style)
  const { totalSubmissions, activeDays, currentStreak, maxStreak } = useMemo(() => {
    let total = 0;
    let active = 0;
    let curStreak = 0;
    let maxStrk = 0;
    let runningStreak = 0;

    const daysInterval = eachDayOfInterval({ start: subDays(today, 365), end: today });

    daysInterval.forEach((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const count = countByDate[dateStr] || 0;
      total += count;

      if (count > 0) {
        active++;
        runningStreak++;
        if (runningStreak > maxStrk) maxStrk = runningStreak;
      } else {
        runningStreak = 0;
      }
    });

    let tempDate = today;
    let dateStr = format(tempDate, 'yyyy-MM-dd');
    if ((countByDate[dateStr] || 0) === 0) {
      tempDate = subDays(today, 1);
      dateStr = format(tempDate, 'yyyy-MM-dd');
    }

    while ((countByDate[dateStr] || 0) > 0) {
      curStreak++;
      tempDate = subDays(tempDate, 1);
      dateStr = format(tempDate, 'yyyy-MM-dd');
    }

    return {
      totalSubmissions: total,
      activeDays: active,
      currentStreak: curStreak,
      maxStreak: maxStrk,
    };
  }, [countByDate, today]);

  const intensityClasses = colorTheme === 'emerald' ? EMERALD_CLASSES : ROSE_CLASSES;

  return (
    <div className="space-y-4">
      {/* ── LeetCode Style Header Stats Bar ────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/40">
        {/* Left: Total Submissions */}
        <div className="flex items-center gap-2">
          <span className="font-display text-base font-bold text-foreground">
            {totalSubmissions} submissions in the past {timeRange === 'year' ? 'one year' : timeRange === '6months' ? '6 months' : '90 days'}
          </span>
          <Tooltip>
            <TooltipTrigger render={
              <button type="button" className="text-text-muted hover:text-foreground">
                <Info className="size-4" />
              </button>
            } />
            <TooltipContent>
              Tracks problem completions and study notes created on BigO
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Right: Active Days, Max Streak & Controls */}
        <div className="flex items-center gap-4 text-xs">
          <span className="text-text-muted">
            Total active days: <strong className="text-foreground font-semibold">{activeDays}</strong>
          </span>
          <span className="text-text-muted">
            Max streak: <strong className="text-foreground font-semibold">{maxStreak}</strong>
          </span>
          <span className="text-text-muted hidden sm:inline">
            Current: <strong className="text-emerald-500 font-semibold">{currentStreak} d</strong>
          </span>

          {/* Time range dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="outline" size="xs" className="gap-1 text-2xs font-semibold bg-muted/40">
                {timeRange === 'year' ? '1 Year' : timeRange === '6months' ? '6 Months' : '90 Days'}
                <ChevronDown className="size-3 text-text-muted" />
              </Button>
            } />
            <DropdownMenuContent align="end" className="min-w-32">
              <DropdownMenuItem onClick={() => setTimeRange('year')}>1 Year</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange('6months')}>6 Months</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange('3months')}>90 Days</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme toggle button */}
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setColorTheme((t) => (t === 'emerald' ? 'rose' : 'emerald'))}
            className="text-2xs font-medium text-text-muted hover:text-foreground"
            title="Toggle theme"
          >
            {colorTheme === 'emerald' ? '🟢 LeetCode' : '🔴 BigO'}
          </Button>
        </div>
      </div>

      {/* ── Main Monthwise Blocks Grid (LeetCode Layout) ─────────────── */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="inline-flex items-start gap-3 sm:gap-4 min-w-full pt-1">
          {monthBlocks.map((block, mIdx) => (
            <div key={mIdx} className="flex flex-col items-center gap-2">
              {/* 7-Row Grid of Weeks for this Month */}
              <div className="flex gap-1">
                {block.weekColumns.map((col, cIdx) => (
                  <div key={cIdx} className="flex flex-col gap-1">
                    {col.map((day, rIdx) => {
                      if (!day) {
                        return <div key={rIdx} className="size-3.5 rounded-[3px]" />;
                      }

                      const dateStr = format(day, 'yyyy-MM-dd');
                      const count = countByDate[dateStr] ?? 0;
                      let intensity = 0;
                      if (count > 0) {
                        if (count <= 2) intensity = 1;
                        else if (count <= 5) intensity = 2;
                        else if (count <= 8) intensity = 3;
                        else intensity = 4;
                      }

                      const formattedDate = format(day, 'MMM d, yyyy');

                      return (
                        <Tooltip key={rIdx}>
                          <TooltipTrigger render={
                            <div
                              className={cn(
                                'size-3.5 shrink-0 rounded-[3px] transition-all duration-150 hover:scale-125 hover:z-20 cursor-pointer',
                                intensityClasses[intensity]
                              )}
                            />
                          } />
                          <TooltipContent side="top" className="text-2xs font-semibold">
                            {count} submission{count !== 1 ? 's' : ''} on {formattedDate}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Month Name Label Centered Directly Below Month Block */}
              <span className="text-2xs font-semibold text-text-muted select-none">
                {block.monthName}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer Legend ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-2xs text-text-muted border-t border-border/30">
        <div className="flex items-center gap-2 font-medium">
          <Flame className="size-3.5 text-amber-500" />
          <span>Active Streak: <strong className="text-foreground">{currentStreak} days</strong></span>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <span>Less</span>
          <div className="flex gap-1">
            {intensityClasses.map((cls, i) => (
              <div key={i} className={cn('size-3 rounded-[3px]', cls)} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
