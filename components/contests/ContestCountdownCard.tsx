'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heading } from '@/components/ui/typography';
import { Calendar, ExternalLink, Timer, Clock } from 'lucide-react';
import { generateGoogleCalendarUrl } from '@/lib/contests/calendar';

export interface ContestItemProps {
  _id?: string;
  externalId: string;
  platform: 'leetcode' | 'codeforces' | 'codechef' | 'atcoder' | 'hackerearth' | string;
  name: string;
  url: string;
  startTime: string | Date;
  endTime: string | Date;
  durationSeconds: number;
  status: 'UPCOMING' | 'RUNNING' | 'COMPLETED';
}

const PLATFORM_META: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  leetcode: {
    label: 'LeetCode',
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/25',
  },
  codeforces: {
    label: 'Codeforces',
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/25',
  },
  codechef: {
    label: 'CodeChef',
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/25',
  },
  atcoder: {
    label: 'AtCoder',
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-500/25',
  },
  hackerearth: {
    label: 'HackerEarth',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/25',
  },
};

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
  return `${minutes} mins`;
}

function getTimeRemaining(startTimeMs: number, endTimeMs: number) {
  const now = Date.now();
  if (now >= startTimeMs && now <= endTimeMs) {
    const diff = endTimeMs - now;
    return {
      status: 'RUNNING',
      label: 'Live Now',
      hours: Math.floor(diff / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  }
  if (now > endTimeMs) {
    return { status: 'COMPLETED', label: 'Ended', hours: 0, minutes: 0, seconds: 0 };
  }
  const diff = startTimeMs - now;
  return {
    status: 'UPCOMING',
    label: 'Starts in',
    days: Math.floor(diff / (3600000 * 24)),
    hours: Math.floor((diff % (3600000 * 24)) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export function ContestCountdownCard({ contest }: { contest: ContestItemProps }) {
  const startMs = new Date(contest.startTime).getTime();
  const endMs = new Date(contest.endTime).getTime();

  const [time, setTime] = useState(() => getTimeRemaining(startMs, endMs));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(getTimeRemaining(startMs, endMs));
    }, 1000);
    return () => clearInterval(timer);
  }, [startMs, endMs]);

  const platformKey = contest.platform.toLowerCase();
  const meta = PLATFORM_META[platformKey] || {
    label: contest.platform,
    bg: 'bg-rose-500/10',
    text: 'text-rose-500',
    border: 'border-rose-500/20',
  };

  const startDate = new Date(contest.startTime);
  const formattedDate = startDate.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = startDate.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const googleCalUrl = generateGoogleCalendarUrl({
    title: contest.name,
    description: `Competitive programming contest on ${meta.label}`,
    url: contest.url,
    startTime: new Date(contest.startTime),
    endTime: new Date(contest.endTime),
    platform: contest.platform,
  });

  const isLive = time.status === 'RUNNING';

  return (
    <Card className="flex flex-col justify-between overflow-hidden border border-border/60 bg-surface hover:border-rose-500/40 hover:shadow-e2 transition-all duration-300">
      <CardContent className="space-y-4 p-5">
        {/* Header: Platform & Status */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${meta.bg} ${meta.text} ${meta.border}`}
          >
            {meta.label}
          </span>

          {isLive ? (
            <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 animate-pulse font-mono font-medium text-xs">
              <span className="size-2 rounded-full bg-emerald-500 mr-1.5 inline-block animate-ping" />
              LIVE NOW
            </Badge>
          ) : (
            <span className="text-xs text-text-muted font-mono flex items-center gap-1">
              <Clock className="size-3 text-text-subtle" />
              <span>{formatDuration(contest.durationSeconds)}</span>
            </span>
          )}
        </div>

        {/* Title */}
        <div>
          <Heading level="card" className="line-clamp-2 leading-snug font-bold text-foreground hover:text-rose-500 transition-colors">
            {contest.name}
          </Heading>
        </div>

        {/* Countdown Box */}
        <div className="rounded-xl bg-surface-sunken/90 border border-border/50 p-3.5 shadow-inner">
          <div className="flex items-center justify-between text-xs text-text-muted mb-2 font-medium">
            <span className="flex items-center gap-1">
              <Timer className="size-3.5 text-rose-500" />
              {time.label}
            </span>
            {isLive ? (
              <span className="text-emerald-500 font-mono font-semibold">Remaining</span>
            ) : (
              <span className="font-mono text-text-subtle">{formattedTime}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-foreground">
            {time.status === 'COMPLETED' ? (
              <span className="text-text-muted">Contest Finished</span>
            ) : isLive ? (
              <span className="text-emerald-500 font-extrabold tracking-wide">
                {String(time.hours).padStart(2, '0')}h : {String(time.minutes).padStart(2, '0')}m :{' '}
                {String(time.seconds).padStart(2, '0')}s
              </span>
            ) : (
              <>
                {time.days !== undefined && time.days > 0 && (
                  <span className="bg-surface px-2 py-0.5 rounded-md border border-border/70 text-foreground">
                    {time.days}d
                  </span>
                )}
                <span className="bg-surface px-2 py-0.5 rounded-md border border-border/70 text-foreground">
                  {String(time.hours).padStart(2, '0')}h
                </span>
                <span className="text-text-muted">:</span>
                <span className="bg-surface px-2 py-0.5 rounded-md border border-border/70 text-foreground">
                  {String(time.minutes).padStart(2, '0')}m
                </span>
                <span className="text-text-muted">:</span>
                <span className="bg-surface px-2 py-0.5 rounded-md border border-rose-500/30 text-rose-500 bg-rose-500/5 font-extrabold">
                  {String(time.seconds).padStart(2, '0')}s
                </span>
              </>
            )}
          </div>
        </div>

        {/* Date & Time info */}
        <div className="space-y-1 text-xs text-text-muted">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5 shrink-0 text-text-subtle" />
            <span className="truncate">
              {formattedDate} at {formattedTime} (Local Time)
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center gap-2 border-t border-border/40 bg-surface-sunken/30 p-3.5">
        <a
          href={googleCalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border/70 bg-surface px-3 py-2 text-xs font-semibold text-text-muted hover:text-foreground hover:border-border hover:bg-surface-sunken/40 transition-colors flex-1 text-center shadow-xs"
          title="Add to Google Calendar"
        >
          <Calendar className="size-3.5 text-rose-500" />
          <span>Add to Cal</span>
        </a>

        <a
          href={contest.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold px-3.5 py-2 text-xs transition-all shadow-sm hover:shadow-md flex-1 text-center"
        >
          <span>{isLive ? 'Join Live' : 'Register'}</span>
          <ExternalLink className="size-3.5" />
        </a>
      </CardFooter>
    </Card>
  );
}
