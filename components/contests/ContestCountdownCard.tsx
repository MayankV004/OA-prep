'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heading } from '@/components/ui/typography';
import { Calendar, ExternalLink, Timer } from 'lucide-react';
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
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/20',
  },
  codeforces: {
    label: 'Codeforces',
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/20',
  },
  codechef: {
    label: 'CodeChef',
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/20',
  },
  atcoder: {
    label: 'AtCoder',
    bg: 'bg-zinc-500/10 dark:bg-zinc-500/20',
    text: 'text-zinc-600 dark:text-zinc-400',
    border: 'border-zinc-500/20',
  },
  hackerearth: {
    label: 'HackerEarth',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/20',
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
    bg: 'bg-primary/10',
    text: 'text-primary',
    border: 'border-primary/20',
    icon: '💻',
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
    <Card className="flex flex-col justify-between overflow-hidden border border-border/60 hover:border-primary/40 transition-all duration-200">
      <CardContent className="space-y-4 p-5">
        {/* Header: Platform & Status */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${meta.bg} ${meta.text} ${meta.border}`}
          >
            {meta.label}
          </span>

          {isLive ? (
            <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 animate-pulse font-mono font-medium text-xs">
              <span className="size-2 rounded-full bg-emerald-500 mr-1.5 inline-block animate-ping" />
              LIVE NOW
            </Badge>
          ) : (
            <span className="text-xs text-text-muted font-mono">
              ⏱️ {formatDuration(contest.durationSeconds)}
            </span>
          )}
        </div>

        {/* Title */}
        <div>
          <Heading level="card" className="line-clamp-2 leading-snug font-semibold text-text">
            {contest.name}
          </Heading>
        </div>

        {/* Countdown Box */}
        <div className="rounded-xl bg-surface-sunken/80 border border-border/40 p-3">
          <div className="flex items-center justify-between text-xs text-text-muted mb-1.5 font-medium">
            <span className="flex items-center gap-1">
              <Timer className="size-3.5" />
              {time.label}
            </span>
            {isLive ? (
              <span className="text-emerald-500 font-mono">Remaining</span>
            ) : (
              <span className="font-mono">{formattedTime}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-text">
            {time.status === 'COMPLETED' ? (
              <span className="text-text-muted">Contest Finished</span>
            ) : isLive ? (
              <span className="text-emerald-500">
                {String(time.hours).padStart(2, '0')}h : {String(time.minutes).padStart(2, '0')}m :{' '}
                {String(time.seconds).padStart(2, '0')}s
              </span>
            ) : (
              <>
                {time.days !== undefined && time.days > 0 && (
                  <span className="bg-surface px-1.5 py-0.5 rounded border border-border/50">
                    {time.days}d
                  </span>
                )}
                <span className="bg-surface px-1.5 py-0.5 rounded border border-border/50">
                  {String(time.hours).padStart(2, '0')}h
                </span>
                <span>:</span>
                <span className="bg-surface px-1.5 py-0.5 rounded border border-border/50">
                  {String(time.minutes).padStart(2, '0')}m
                </span>
                <span>:</span>
                <span className="bg-surface px-1.5 py-0.5 rounded border border-border/50 text-primary">
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
            <span>
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
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border/70 bg-surface px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text hover:border-border transition-colors flex-1 text-center"
          title="Add to Google Calendar"
        >
          <Calendar className="size-3.5" />
          <span>Add to Cal</span>
        </a>

        <a
          href={contest.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground px-3.5 py-1.5 text-xs font-medium transition-all shadow-sm flex-1 text-center"
        >
          <span>{isLive ? 'Join Live' : 'Register'}</span>
          <ExternalLink className="size-3.5" />
        </a>
      </CardFooter>
    </Card>
  );
}
