'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heading } from '@/components/ui/typography';
import { Calendar, ExternalLink, Timer, Clock, ArrowUpRight, Sparkles } from 'lucide-react';
import { generateGoogleCalendarUrl } from '@/lib/contests/calendar';
import { cn } from '@/lib/utils';

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
  { label: string; bg: string; text: string; border: string; glow: string }
> = {
  leetcode: {
    label: 'LeetCode',
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-500 dark:text-amber-400',
    border: 'border-amber-500/30',
    glow: 'from-amber-500/10 to-transparent',
  },
  codeforces: {
    label: 'Codeforces',
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    text: 'text-blue-500 dark:text-blue-400',
    border: 'border-blue-500/30',
    glow: 'from-blue-500/10 to-transparent',
  },
  codechef: {
    label: 'CodeChef',
    bg: 'bg-orange-500/10 dark:bg-orange-500/15',
    text: 'text-orange-500 dark:text-orange-400',
    border: 'border-orange-500/30',
    glow: 'from-orange-500/10 to-transparent',
  },
  atcoder: {
    label: 'AtCoder',
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
    text: 'text-cyan-500 dark:text-cyan-400',
    border: 'border-cyan-500/30',
    glow: 'from-cyan-500/10 to-transparent',
  },
  hackerearth: {
    label: 'HackerEarth',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-500 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    glow: 'from-emerald-500/10 to-transparent',
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
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-500',
    border: 'border-emerald-500/30',
    glow: 'from-emerald-500/10 to-transparent',
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
    <Card className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card/70 backdrop-blur-xs hover:border-emerald-500/40 hover:shadow-e2 transition-all duration-300">
      {/* Specular Ambient Glow Top Beam */}
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r',
          isLive ? 'from-emerald-500 via-teal-400 to-emerald-500 opacity-90' : meta.glow
        )}
      />

      <CardContent className="space-y-4 p-5">
        {/* Header: Platform Badge & Duration / Live Chip */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-2xs font-mono font-bold tracking-wider uppercase border',
              meta.bg,
              meta.text,
              meta.border
            )}
          >
            <span>{meta.label}</span>
          </span>

          {isLive ? (
            <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 font-mono font-bold text-2xs animate-pulse">
              <span className="size-1.5 rounded-full bg-emerald-500 mr-1.5 inline-block animate-ping" />
              LIVE NOW
            </Badge>
          ) : (
            <span className="text-2xs text-muted-foreground font-mono flex items-center gap-1">
              <Clock className="size-3 text-muted-foreground/70" />
              <span>{formatDuration(contest.durationSeconds)}</span>
            </span>
          )}
        </div>

        {/* Title */}
        <div>
          <Heading
            level="card"
            className="line-clamp-2 leading-snug font-display font-bold text-foreground group-hover:text-emerald-400 transition-colors"
          >
            {contest.name}
          </Heading>
        </div>

        {/* Digital Countdown Container */}
        <div
          className={cn(
            'rounded-xl border p-3.5 shadow-inner transition-all',
            isLive
              ? 'bg-emerald-500/[0.04] border-emerald-500/30'
              : 'bg-muted/40 border-border/50'
          )}
        >
          <div className="flex items-center justify-between text-2xs text-muted-foreground mb-2 font-mono font-semibold">
            <span className="flex items-center gap-1.5">
              <Timer className={cn('size-3.5', isLive ? 'text-emerald-500' : 'text-emerald-500/80')} />
              <span>{time.label}</span>
            </span>
            {isLive ? (
              <span className="text-emerald-500 font-mono font-bold uppercase tracking-wider">Remaining</span>
            ) : (
              <span className="font-mono text-muted-foreground">{formattedTime}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-foreground">
            {time.status === 'COMPLETED' ? (
              <span className="text-xs text-muted-foreground">Contest Finished</span>
            ) : isLive ? (
              <span className="text-emerald-400 font-black tracking-wide text-base">
                {String(time.hours).padStart(2, '0')}h : {String(time.minutes).padStart(2, '0')}m :{' '}
                {String(time.seconds).padStart(2, '0')}s
              </span>
            ) : (
              <div className="flex items-center gap-1">
                {time.days !== undefined && time.days > 0 && (
                  <span className="bg-background px-2 py-0.5 rounded-lg border border-border/70 text-foreground text-xs font-bold tabular-nums">
                    {time.days}d
                  </span>
                )}
                <span className="bg-background px-2 py-0.5 rounded-lg border border-border/70 text-foreground text-xs font-bold tabular-nums">
                  {String(time.hours).padStart(2, '0')}h
                </span>
                <span className="text-muted-foreground text-xs">:</span>
                <span className="bg-background px-2 py-0.5 rounded-lg border border-border/70 text-foreground text-xs font-bold tabular-nums">
                  {String(time.minutes).padStart(2, '0')}m
                </span>
                <span className="text-muted-foreground text-xs">:</span>
                <span className="bg-background px-2 py-0.5 rounded-lg border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-xs font-black tabular-nums">
                  {String(time.seconds).padStart(2, '0')}s
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Date & Time info */}
        <div className="space-y-1 text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5 shrink-0 text-muted-foreground/70" />
            <span className="truncate">
              {formattedDate} • {formattedTime} (Local)
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center gap-2 border-t border-border/50 bg-muted/20 p-3">
        <a
          href={googleCalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border/70 bg-card hover:bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all flex-1 text-center shadow-2xs cursor-pointer"
          title="Add to Google Calendar"
        >
          <Calendar className="size-3.5 text-emerald-500" />
          <span>Calendar</span>
        </a>

        <a
          href={contest.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'inline-flex items-center justify-center gap-1.5 rounded-xl font-bold px-3.5 py-2 text-xs transition-all flex-1 text-center cursor-pointer shadow-xs',
            isLive
              ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
              : 'bg-primary hover:bg-primary/90 text-primary-foreground'
          )}
        >
          <span>{isLive ? 'Join Live' : 'Register'}</span>
          <ArrowUpRight className="size-3.5" />
        </a>
      </CardFooter>
    </Card>
  );
}
