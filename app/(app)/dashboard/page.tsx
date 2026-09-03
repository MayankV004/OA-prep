'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { subscriptionApi } from '@/lib/api/subscription';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';

import { authClient } from '@/lib/auth-client';
import { dashboardQueries } from '@/lib/queries/dashboard';
import { problemQueries } from '@/lib/queries/problems';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';

// Dynamic lazy-loading for heavy Recharts visualization components
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

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const verifiedRef = useRef(false);

  const sessionId = searchParams.get('session_id');
  const paymentStatus = searchParams.get('payment');

  const { data: session } = authClient.useSession();
  const userName = session?.user?.name || 'Prep Warrior';

  // Instant session verification when redirected back from Stripe
  useEffect(() => {
    if (paymentStatus === 'success' && sessionId && !verifiedRef.current) {
      verifiedRef.current = true;
      subscriptionApi
        .verifySession(sessionId)
        .then((res) => {
          if (res.success) {
            toast.success('Subscription Activated! ⚡', {
              description: 'Welcome to BigO Pro! All company mock tests and AI features are now unlocked.',
            });
            queryClient.invalidateQueries({ queryKey: ['subscription'] });
          }
        })
        .catch((err) => {
          console.error('Session verification error:', err);
        })
        .finally(() => {
          router.replace('/dashboard');
        });
    }
  }, [sessionId, paymentStatus, queryClient, router]);

  // Centralized TanStack Query v5 queryOptions
  const { data: stats, isLoading } = useQuery(dashboardQueries.stats('me'));

  const patternStats = stats?.totalsByKind?.find((t) => t.kind === 'pattern');
  const totalCompleted = stats?.totalsByKind?.reduce((s, t) => s + t.completed, 0) ?? 0;
  const totalProblems = stats?.totalsByKind?.reduce((s, t) => s + t.total, 0) ?? 0;
  const actionsTotal = stats?.heatmap?.reduce((s, d) => s + d.count, 0) ?? 0;
  const overallPct = totalProblems > 0 ? Math.round((totalCompleted / totalProblems) * 100) : 0;

  // Centralized progress query
  const { data: patternProgress = [] } = useQuery({
    ...problemQueries.progressStats('pattern'),
    enabled: Boolean(stats),
  });

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-2">
        <div className="space-y-1.5">
          <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
            Welcome back, <span className="text-primary">{userName}</span> 👋
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl font-normal">
            Track your DSA patterns, CS core fundamentals, and assessment readiness in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link href="/dsa">
            <button className="flex items-center gap-1.5 h-10 px-5 rounded-xl font-bold text-xs bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all shadow-xs border-none cursor-pointer">
              <span>Practice DSA</span>
              <ArrowRight className="size-3.5" />
            </button>
          </Link>
          <Link href="/subjects">
            <button className="flex items-center h-10 px-5 rounded-xl font-semibold text-xs text-foreground bg-card hover:bg-muted border border-border active:scale-95 transition-all cursor-pointer">
              <span>CS Core</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 2. Solid Stat Metric Cards — Clean & Minimalist */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Stat Card 1: Solved */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs hover:border-border/80 transition-all duration-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">Problems Solved</span>
          <div className="mt-3">
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
                className="h-full rounded-full bg-primary transition-all duration-500"
              />
            </div>
          </div>
        </div>

        {/* Stat Card 2: Pattern DSA */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs hover:border-border/80 transition-all duration-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">Pattern DSA</span>
          <div className="mt-3">
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
            <p className="mt-2.5 text-xs text-primary font-semibold">
              Structured interview paths
            </p>
          </div>
        </div>

        {/* Stat Card 3: Difficulty Split */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs hover:border-border/80 transition-all duration-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">Difficulty Mix</span>
          <div className="mt-3">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                  {stats?.difficultyMix?.Hard ?? 0}
                </span>
                <span className="text-xs font-bold text-destructive">Hard</span>
              </div>
            )}
            <div className="mt-2.5 flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="text-primary font-bold">{stats?.difficultyMix?.Easy ?? 0}E</span> ·{' '}
              <span className="text-warning font-bold">{stats?.difficultyMix?.Medium ?? 0}M</span> ·{' '}
              <span className="text-destructive font-bold">{stats?.difficultyMix?.Hard ?? 0}H</span>
            </div>
          </div>
        </div>

        {/* Stat Card 4: 90d Activity */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs hover:border-border/80 transition-all duration-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">90d Activity</span>
          <div className="mt-3">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl sm:text-4xl font-black tracking-tight text-foreground">{actionsTotal}</span>
                <span className="text-xs text-muted-foreground font-medium">actions logged</span>
              </div>
            )}
            <p className="mt-2.5 text-xs text-warning font-semibold">
              Active prep streak
            </p>
          </div>
        </div>
      </div>

      {/* 4. Analytics Grid Row 1 (Completion Trend + Activity Feed) */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="min-w-0 lg:col-span-4 rounded-2xl bg-card border border-border shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base font-bold tracking-tight">Completion Trend</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Problems completed per day (Last 90 Days)</CardDescription>
          </CardHeader>
          <CardContent className="min-w-0 pt-4">
            {isLoading ? (
              <Skeleton className="h-[240px] w-full rounded-2xl" />
            ) : (
              <CompletionTrend data={stats?.trend ?? []} />
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0 lg:col-span-3 rounded-2xl bg-card border border-border shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base font-bold tracking-tight">Recent Activity</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Your last 10 prep events</CardDescription>
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
        <Card className="min-w-0 lg:col-span-4 rounded-2xl bg-card border border-border shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base font-bold tracking-tight">Pattern Progress</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Completion breakdown across DSA patterns</CardDescription>
          </CardHeader>
          <CardContent className="min-w-0 pt-4">
            {isLoading ? (
              <Skeleton className="h-[240px] w-full rounded-2xl" />
            ) : (
              <GroupProgress data={patternProgress ?? []} />
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0 lg:col-span-3 rounded-2xl bg-card border border-border shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base font-bold tracking-tight">Difficulty Mix</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Easy vs. Medium vs. Hard distribution</CardDescription>
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
      <Card className="min-w-0 rounded-2xl bg-card border border-border shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base font-bold tracking-tight">Activity Heatmap</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">Daily problem solving activity over the last 90 days</CardDescription>
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
