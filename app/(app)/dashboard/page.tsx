'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Code2,
  Trophy,
  Activity,
  TrendingUp,
  ArrowRight,
  Flame,
  CheckCircle2,
  Sparkles,
  Terminal,
  ChevronRight,
  Target,
  Clock,
  Layers,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';

const CompletionTrend = dynamic(
  () => import('@/components/dashboard/CompletionTrend').then((m) => m.CompletionTrend),
  {
    loading: () => <Skeleton className="h-[240px] w-full rounded-2xl" />,
    ssr: false,
  }
);

const GroupProgress = dynamic(
  () => import('@/components/dashboard/GroupProgress').then((m) => m.GroupProgress),
  {
    loading: () => <Skeleton className="h-[240px] w-full rounded-2xl" />,
    ssr: false,
  }
);

const DifficultyMix = dynamic(
  () => import('@/components/dashboard/DifficultyMix').then((m) => m.DifficultyMix),
  {
    loading: () => <Skeleton className="h-[180px] w-full rounded-2xl" />,
    ssr: false,
  }
);

const ActivityHeatmap = dynamic(
  () => import('@/components/dashboard/ActivityHeatmap').then((m) => m.ActivityHeatmap),
  {
    loading: () => <Skeleton className="h-28 w-full rounded-2xl" />,
    ssr: false,
  }
);

import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { authClient } from '@/lib/auth-client';

interface DashboardStats {
  totalsByKind: { kind: string; total: number; completed: number }[];
  difficultyMix: { Easy?: number; Medium?: number; Hard?: number };
  trend: { date: string; completed: number }[];
  heatmap: { date: string; count: number }[];
  recent: any[];
}

export default function DashboardPage() {
  const { data: session } = authClient.useSession();
  const userName = session?.user?.name || 'Prep Warrior';

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard', 'me'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/stats?userId=me');
      if (!res.ok) throw new Error('Failed to load dashboard stats');
      return res.json();
    },
  });

  const patternStats = stats?.totalsByKind?.find((t) => t.kind === 'pattern');
  const totalCompleted = stats?.totalsByKind?.reduce((s, t) => s + t.completed, 0) ?? 0;
  const totalProblems = stats?.totalsByKind?.reduce((s, t) => s + t.total, 0) ?? 0;
  const actionsTotal = stats?.heatmap?.reduce((s, d) => s + d.count, 0) ?? 0;
  const overallPct = totalProblems > 0 ? Math.round((totalCompleted / totalProblems) * 100) : 0;

  const { data: patternProgress } = useQuery({
    queryKey: ['problems', 'progress', 'pattern'],
    queryFn: async () => {
      const res = await fetch('/api/problems/progress?kind=pattern');
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!stats,
  });

  const topPatterns = [
    { title: 'Two Pointers', slug: 'two-pointers', count: '12 problems' },
    { title: 'Sliding Window', slug: 'sliding-window', count: '10 problems' },
    { title: 'Dynamic Programming', slug: 'dynamic-programming', count: '25 problems' },
    { title: 'Graph Traversals', slug: 'graph-traversals', count: '18 problems' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header Section with Tall Display Typography & Red Accents */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-2">
        <div className="space-y-1.5">
          <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
            Welcome back, <span className="text-rose-500">{userName}</span> 👋
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl font-light">
            Track your DSA patterns, CS core fundamentals, and assessment readiness in real time.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link href="/dsa">
            <button className="flex items-center gap-2 h-11 px-5 rounded-2xl font-semibold text-xs text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-500 shadow-[0_0_20px_rgba(225,29,72,0.35)] hover:shadow-[0_0_25px_rgba(225,29,72,0.6)] hover:scale-105 active:scale-95 transition-all border-none">
              <Code2 className="h-4 w-4" />
              <span>Practice DSA</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
          <Link href="/subjects">
            <button className="flex items-center gap-2 h-11 px-5 rounded-2xl font-medium text-xs text-foreground bg-background hover:bg-accent/60 border border-border/40 hover:scale-105 active:scale-95 transition-all">
              <Terminal className="h-4 w-4 text-rose-500" />
              <span>CS Core</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 2. Glassmorphic Stat Metric Cards (Borderless, Consistent Red Theme) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Stat Card 1: Solved */}
        <div className="group relative p-5 rounded-2xl bg-background/60 dark:bg-background/30 backdrop-blur-xl border-none shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">Problems Solved</span>
            <div className="h-9 w-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl sm:text-4xl font-black tracking-tight text-foreground">{totalCompleted}</span>
                <span className="text-xs text-muted-foreground font-medium">/ {totalProblems} ({overallPct}%)</span>
              </div>
            )}
            <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                style={{ width: `${overallPct}%` }}
                className="h-full rounded-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-500"
              />
            </div>
          </div>
        </div>

        {/* Stat Card 2: Pattern DSA */}
        <div className="group relative p-5 rounded-2xl bg-background/60 dark:bg-background/30 backdrop-blur-xl border-none shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">Pattern DSA</span>
            <div className="h-9 w-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
              <Trophy className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                  {patternStats ? patternStats.completed : 0}
                </span>
                <span className="text-xs text-muted-foreground font-medium">/ {patternStats?.total ?? 0} completed</span>
              </div>
            )}
            <p className="mt-2 text-xs text-rose-500 font-medium flex items-center gap-1">
              <Sparkles className="h-3 w-3 inline" /> Structured interview paths
            </p>
          </div>
        </div>

        {/* Stat Card 3: Difficulty Split */}
        <div className="group relative p-5 rounded-2xl bg-background/60 dark:bg-background/30 backdrop-blur-xl border-none shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">Difficulty Mix</span>
            <div className="h-9 w-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                  {stats?.difficultyMix?.Hard ?? 0}
                </span>
                <span className="text-xs font-semibold text-rose-500">Hard</span>
              </div>
            )}
            <div className="mt-2 flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="text-emerald-500 font-semibold">{stats?.difficultyMix?.Easy ?? 0}E</span> ·{' '}
              <span className="text-amber-500 font-semibold">{stats?.difficultyMix?.Medium ?? 0}M</span> ·{' '}
              <span className="text-rose-500 font-semibold">{stats?.difficultyMix?.Hard ?? 0}H</span>
            </div>
          </div>
        </div>

        {/* Stat Card 4: 90d Activity */}
        <div className="group relative p-5 rounded-2xl bg-background/60 dark:bg-background/30 backdrop-blur-xl border-none shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">90d Activity</span>
            <div className="h-9 w-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl sm:text-4xl font-black tracking-tight text-foreground">{actionsTotal}</span>
                <span className="text-xs text-muted-foreground font-medium">actions logged</span>
              </div>
            )}
            <p className="mt-2 text-xs text-rose-500 font-medium flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-rose-500 inline" /> Active prep streak
            </p>
          </div>
        </div>
      </div>

      {/* 4. Analytics Grid Row 1 (Completion Trend + Activity Feed) */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Completion Trend Card */}
        <Card className="min-w-0 lg:col-span-4 rounded-3xl bg-background/60 dark:bg-background/30 backdrop-blur-xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="font-display text-lg font-bold tracking-tight">Completion Trend</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Problems completed per day (Last 90 Days)</CardDescription>
            </div>
            <div className="h-8 w-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="min-w-0 pt-4">
            {isLoading ? (
              <Skeleton className="h-[240px] w-full rounded-2xl" />
            ) : (
              <CompletionTrend data={stats?.trend ?? []} />
            )}
          </CardContent>
        </Card>

        {/* Activity Feed Card */}
        <Card className="min-w-0 lg:col-span-3 rounded-3xl bg-background/60 dark:bg-background/30 backdrop-blur-xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="font-display text-lg font-bold tracking-tight">Recent Activity</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Your last 10 prep events</CardDescription>
            </div>
            <div className="h-8 w-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-4 max-h-[300px] overflow-y-auto pr-1">
            {isLoading ? (
              <Skeleton className="h-[240px] w-full rounded-2xl" />
            ) : (
              <ActivityFeed events={stats?.recent ?? []} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* 5. Analytics Grid Row 2 (Pattern Progress + Difficulty Mix) */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Pattern Progress Card */}
        <Card className="min-w-0 lg:col-span-4 rounded-3xl bg-background/60 dark:bg-background/30 backdrop-blur-xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="font-display text-lg font-bold tracking-tight">Pattern Progress</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Completion breakdown across DSA patterns</CardDescription>
            </div>
            <div className="h-8 w-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="min-w-0 pt-4">
            {isLoading ? (
              <Skeleton className="h-[240px] w-full rounded-2xl" />
            ) : (
              <GroupProgress data={patternProgress ?? []} />
            )}
          </CardContent>
        </Card>

        {/* Difficulty Mix Card */}
        <Card className="min-w-0 lg:col-span-3 rounded-3xl bg-background/60 dark:bg-background/30 backdrop-blur-xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="font-display text-lg font-bold tracking-tight">Difficulty Mix</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Easy vs. Medium vs. Hard distribution</CardDescription>
            </div>
            <div className="h-8 w-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Trophy className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="min-w-0 pt-4">
            {isLoading ? (
              <Skeleton className="h-[180px] w-full rounded-2xl" />
            ) : (
              <DifficultyMix data={stats?.difficultyMix ?? {}} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* 6. Activity Heatmap Card */}
      <Card className="min-w-0 rounded-3xl bg-background/60 dark:bg-background/30 backdrop-blur-xl border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="font-display text-lg font-bold tracking-tight">Activity Heatmap</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Daily problem solving activity over the last 90 days</CardDescription>
          </div>
          <div className="h-8 w-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <Activity className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="min-w-0 pt-4">
          {isLoading ? (
            <Skeleton className="h-28 w-full rounded-2xl" />
          ) : (
            <ActivityHeatmap data={stats?.heatmap ?? []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
