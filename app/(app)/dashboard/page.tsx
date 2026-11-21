'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { subscriptionApi } from '@/lib/api/subscription';
import {
  ArrowRight,
  Compass,
  Code2,
  Sparkles,
  Terminal,
  Activity,
  Layers,
  TrendingUp,
  Cpu,
  Timer,
  Workflow,
  Flame,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

import { authClient } from '@/lib/auth-client';
import { dashboardQueries } from '@/lib/queries/dashboard';
import { problemQueries } from '@/lib/queries/problems';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { cn } from '@/lib/utils';
import type { ProgressGroupStat } from '@/types/problem';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'patterns'>('overview');

  const orderId = searchParams.get('order_id');
  const subscriptionId = searchParams.get('subscription_id');
  const paymentStatus = searchParams.get('payment');

  const { data: session } = authClient.useSession();
  const userName = session?.user?.name || 'Candidate';

  // Fast server-side verification after Cashfree redirects back. Webhooks remain authoritative.
  useEffect(() => {
    if (paymentStatus === 'success' && (orderId || subscriptionId) && !verifiedRef.current) {
      verifiedRef.current = true;
      subscriptionApi
        .verifySession({ orderId: orderId || undefined, subscriptionId: subscriptionId || undefined })
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
  }, [orderId, subscriptionId, paymentStatus, queryClient, router]);

  // Centralized TanStack Query v5 queryOptions
  const { data: stats, isLoading } = useQuery(dashboardQueries.stats('me'));

  // Centralized progress query (fetches concurrently with stats)
  const { data: rawPatternProgress } = useQuery(problemQueries.progressStats('pattern'));

  // Safely normalize into an array in all scenarios (raw array or { stats: [] } payload)
  const patternProgress = useMemo<ProgressGroupStat[]>(() => {
    if (Array.isArray(rawPatternProgress)) return rawPatternProgress;
    if (rawPatternProgress && Array.isArray((rawPatternProgress as { stats?: ProgressGroupStat[] }).stats)) {
      return (rawPatternProgress as { stats: ProgressGroupStat[] }).stats;
    }
    return [];
  }, [rawPatternProgress]);

  // Derived real metrics directly from authenticated user stats
  const patternStats = stats?.totalsByKind?.find((t) => t.kind === 'pattern');
  const nonstandardStats = stats?.totalsByKind?.find((t) => t.kind === 'nonstandard');
  const totalCompleted = stats?.totalsByKind?.reduce((s, t) => s + t.completed, 0) ?? 0;
  const totalProblems = stats?.totalsByKind?.reduce((s, t) => s + t.total, 0) ?? 0;
  const actionsTotal = stats?.heatmap?.reduce((s, d) => s + d.count, 0) ?? 0;
  const overallPct = totalProblems > 0 ? Math.round((totalCompleted / totalProblems) * 100) : 0;

  const masteredPatternsCount = useMemo(() => {
    return patternProgress.filter((p) => p.total > 0 && p.completed >= p.total).length;
  }, [patternProgress]);

  const easySolved = stats?.difficultyMix?.Easy ?? 0;
  const medSolved = stats?.difficultyMix?.Medium ?? 0;
  const hardSolved = stats?.difficultyMix?.Hard ?? 0;
  const diffTotal = easySolved + medSolved + hardSolved;
  const tier1Ratio = diffTotal > 0 ? Math.round(((medSolved + hardSolved) / diffTotal) * 100) : 0;

  return (
    <div className="space-y-8 pb-16">
      {/* ── 1. Header Section & Cockpit Greeting ─────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-2">
        <div className="space-y-2">
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Welcome back, <span className="text-primary">{userName}</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl font-normal leading-relaxed">
            Real-time algorithmic mastery, pattern retention velocity, and proctored assessment readiness.
          </p>
        </div>

        {/* Top Quick Actions Launcher */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link href="/dsa">
            <button className="h-10 px-5 rounded-xl font-bold text-xs bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] border-t border-white/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5">
              <Code2 className="size-3.5" />
              <span>Practice DSA &rarr;</span>
            </button>
          </Link>
        </div>
      </div>

      {/* ── 2. Executive Stat Cards with Spotlight Effect ────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Syllabus Mastery */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.16)"
          className="p-5 flex flex-col justify-between bg-gradient-to-br from-[#059669] via-[#047857] to-[#065f46] text-white border-white/20 shadow-lg shadow-emerald-950/20 hover:border-white/40 dark:from-[#081e18] dark:via-[#061713] dark:to-[#030d0a] dark:text-white dark:border-emerald-500/25 dark:shadow-[0_4px_24px_rgba(0,0,0,0.6)] dark:hover:border-emerald-500/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/80 dark:text-emerald-200/80 font-mono">
              Problems Solved
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30">
              CORE
            </span>
          </div>

          <div className="mt-4 space-y-2.5">
            {isLoading ? (
              <Skeleton className="h-8 w-24 bg-white/20 dark:bg-emerald-900/30" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl sm:text-4xl font-black text-white dark:text-white tabular-nums">
                  {totalCompleted}
                </span>
                <span className="text-xs text-white/80 dark:text-emerald-100/70 font-mono font-medium">
                  / {totalProblems} ({overallPct}%)
                </span>
              </div>
            )}

            {/* Custom High-Contrast Progress Bar */}
            <div className="h-1.5 w-full rounded-full bg-black/20 dark:bg-emerald-950/60 overflow-hidden relative">
              <div
                style={{ width: `${overallPct}%` }}
                className="h-full rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)] dark:bg-emerald-400 dark:shadow-[0_0_10px_rgba(16,185,129,0.7)] transition-all duration-500"
              />
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-white/15 dark:border-emerald-500/15 text-[11px] text-white/80 dark:text-emerald-100/70 flex items-center justify-between font-mono">
            <span>
              {nonstandardStats ? `${nonstandardStats.completed} OA Spec` : 'All Categories'}
            </span>
            <span className="font-bold text-white dark:text-emerald-300">{overallPct}% of syllabus</span>
          </div>
        </SpotlightCard>

        {/* Card 2: Pattern Intuition */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.16)"
          className="p-5 flex flex-col justify-between bg-gradient-to-br from-[#059669] via-[#047857] to-[#065f46] text-white border-white/20 shadow-lg shadow-emerald-950/20 hover:border-white/40 dark:from-[#081e18] dark:via-[#061713] dark:to-[#030d0a] dark:text-white dark:border-emerald-500/25 dark:shadow-[0_4px_24px_rgba(0,0,0,0.6)] dark:hover:border-emerald-500/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/80 dark:text-emerald-200/80 font-mono">
              Pattern DSA
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30">
              {patternProgress.length > 0 ? `${patternProgress.length} PATTERNS` : '19 PATTERNS'}
            </span>
          </div>

          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-24 bg-white/20 dark:bg-emerald-900/30" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl sm:text-4xl font-black text-white dark:text-white tabular-nums">
                  {patternStats ? patternStats.completed : 0}
                </span>
                <span className="text-xs text-white/80 dark:text-emerald-100/70 font-mono font-medium">
                  / {patternStats?.total ?? 0}
                </span>
              </div>
            )}
            <p className="mt-2 text-xs font-semibold text-white/90 dark:text-emerald-300">
              {masteredPatternsCount} of {patternProgress.length || 19} Patterns Mastered
            </p>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-white/15 dark:border-emerald-500/15 text-[11px] text-white/80 dark:text-emerald-100/70 flex items-center justify-between font-mono">
            <span>Algorithmic Track</span>
            <button
              onClick={() => setActiveTab('patterns')}
              className="font-bold text-white hover:text-emerald-100 dark:text-emerald-400 dark:hover:text-emerald-300 underline-offset-2 hover:underline transition-colors cursor-pointer"
            >
              View Roadmap &rarr;
            </button>
          </div>
        </SpotlightCard>

        {/* Card 3: Difficulty Mix */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.16)"
          className="p-5 flex flex-col justify-between bg-gradient-to-br from-[#059669] via-[#047857] to-[#065f46] text-white border-white/20 shadow-lg shadow-emerald-950/20 hover:border-white/40 dark:from-[#081e18] dark:via-[#061713] dark:to-[#030d0a] dark:text-white dark:border-emerald-500/25 dark:shadow-[0_4px_24px_rgba(0,0,0,0.6)] dark:hover:border-emerald-500/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/80 dark:text-emerald-200/80 font-mono">
              Difficulty Mix
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30">
              DEPTH
            </span>
          </div>

          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-24 bg-white/20 dark:bg-emerald-900/30" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl sm:text-4xl font-black text-white dark:text-white tabular-nums">
                  {hardSolved}
                </span>
                <span className="text-xs font-bold text-white/90 dark:text-rose-400 font-mono">Hard Solved</span>
              </div>
            )}

            <div className="mt-2 flex items-center gap-1.5 text-xs font-mono font-bold">
              <span className="px-1.5 py-0.5 rounded bg-white/15 text-white dark:bg-emerald-500/20 dark:text-emerald-300 dark:border dark:border-emerald-500/30">{easySolved}E</span>
              <span className="px-1.5 py-0.5 rounded bg-white/15 text-white dark:bg-amber-500/20 dark:text-amber-300 dark:border dark:border-amber-500/30">{medSolved}M</span>
              <span className="px-1.5 py-0.5 rounded bg-white/25 text-white ring-1 ring-white/30 dark:bg-rose-500/20 dark:text-rose-300 dark:border dark:border-rose-500/30 dark:ring-0">{hardSolved}H</span>
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-white/15 dark:border-emerald-500/15 text-[11px] text-white/80 dark:text-emerald-100/70 flex items-center justify-between font-mono">
            <span>Tier-1 Weight</span>
            <span className="font-bold text-white dark:text-amber-400">{tier1Ratio}% Med+Hard</span>
          </div>
        </SpotlightCard>

        {/* Card 4: 90d Activity Velocity */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.16)"
          className="p-5 flex flex-col justify-between bg-gradient-to-br from-[#059669] via-[#047857] to-[#065f46] text-white border-white/20 shadow-lg shadow-emerald-950/20 hover:border-white/40 dark:from-[#081e18] dark:via-[#061713] dark:to-[#030d0a] dark:text-white dark:border-emerald-500/25 dark:shadow-[0_4px_24px_rgba(0,0,0,0.6)] dark:hover:border-emerald-500/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/80 dark:text-emerald-200/80 font-mono">
              90d Velocity
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30">
              CADENCE
            </span>
          </div>

          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-24 bg-white/20 dark:bg-emerald-900/30" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl sm:text-4xl font-black text-white dark:text-white tabular-nums">
                  {actionsTotal}
                </span>
                <span className="text-xs text-white/80 dark:text-emerald-100/70 font-mono font-medium">
                  Actions Logged
                </span>
              </div>
            )}
            <p className="mt-2 text-xs font-semibold text-white/90 dark:text-emerald-300">
              Continuous Placement Cadence
            </p>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-white/15 dark:border-emerald-500/15 text-[11px] text-white/80 dark:text-emerald-100/70 flex items-center justify-between font-mono">
            <span>Activity Status</span>
            <span className="font-bold text-white dark:text-emerald-400">
              {actionsTotal > 0 ? 'Active Stream' : 'Ready to Start'}
            </span>
          </div>
        </SpotlightCard>
      </div>

      {/* ── 3. Preparation Cockpit & Active Missions ─────────────────── */}
      <div className="space-y-4 pt-2">
        {/* Section Heading & View Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h2 className="text-base sm:text-lg font-bold font-display tracking-tight text-foreground flex items-center gap-2">
              <Compass className="size-4 text-primary" />
              <span>Recommended Prep Tracks</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Direct jump into timed assessments, algorithmic roadmaps, and CS core topics.
            </p>
          </div>

          {/* Segmented Cockpit View Tabs */}
          <div className="flex items-center gap-1 bg-surface-sunken p-1 rounded-xl border border-border/80 shadow-2xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
                activeTab === 'overview'
                  ? 'bg-card text-foreground font-bold shadow-2xs border border-border/80'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <BarChart3 className="size-3.5 text-primary" />
              <span>Cockpit Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('patterns')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
                activeTab === 'patterns'
                  ? 'bg-card text-foreground font-bold shadow-2xs border border-border/80'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Workflow className="size-3.5 text-emerald-500" />
              <span>Pattern Roadmaps ({patternProgress.length || 19})</span>
            </button>
          </div>
        </div>

        {/* 3 High-Impact Mission Jump Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Card 1: OA Simulator */}
          <Link
            href="/oa/free-universal-diagnostic-oa"
            className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5 dark:bg-card dark:hover:border-amber-500/50"
          >
            <div className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-amber-500/10 blur-2xl transition-all duration-300 group-hover:bg-amber-500/20" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/25">
                  <Timer className="size-4" />
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">
                  TIMED OA SIMULATOR
                </span>
              </div>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
            </div>
            <h4 className="mt-3.5 text-sm font-bold text-foreground group-hover:text-amber-500 transition-colors">
              Universal Diagnostic Assessment
            </h4>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              3 algorithmic challenges, 90 mins timed simulation with real-time testrunner.
            </p>
            <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
              <span>90-min Session</span>
              <span className="font-semibold text-amber-500 group-hover:underline">Launch Assessment &rarr;</span>
            </div>
          </Link>

          {/* Card 2: High-Frequency DSA */}
          <Link
            href="/dsa"
            className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-emerald-500/5 dark:bg-card dark:hover:border-primary/50"
          >
            <div className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-emerald-500/10 blur-2xl transition-all duration-300 group-hover:bg-emerald-500/20" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-xl bg-emerald-500/10 text-primary border border-emerald-500/25">
                  <Workflow className="size-4" />
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
                  HIGH-FREQUENCY DSA
                </span>
              </div>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <h4 className="mt-3.5 text-sm font-bold text-foreground group-hover:text-primary transition-colors">
              Two Pointers & Sliding Window
            </h4>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              Subarray bounds, two-sum variations, and cyclic window optimizations.
            </p>
            <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
              <span>{patternProgress.length || 19} Patterns</span>
              <span className="font-semibold text-primary group-hover:underline">Practice DSA &rarr;</span>
            </div>
          </Link>

          {/* Card 3: CS Core Revision */}
          <Link
            href="/subjects"
            className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-sky-500/40 hover:shadow-lg hover:shadow-sky-500/5 dark:bg-card dark:hover:border-sky-500/50"
          >
            <div className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-sky-500/10 blur-2xl transition-all duration-300 group-hover:bg-sky-500/20" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/25">
                  <Cpu className="size-4" />
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-500">
                  CS CORE REVISION
                </span>
              </div>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-sky-500 group-hover:translate-x-1 transition-all" />
            </div>
            <h4 className="mt-3.5 text-sm font-bold text-foreground group-hover:text-sky-500 transition-colors">
              OS Concurrency & Threads
            </h4>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              Deadlocks, race conditions, semaphores, and memory hierarchy.
            </p>
            <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
              <span>Core Theory</span>
              <span className="font-semibold text-sky-500 group-hover:underline">Review Core &rarr;</span>
            </div>
          </Link>
        </div>
      </div>

      {/* ── 4. Analytics Views Based on Active Tab ───────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6 pt-2"
          >
            {/* Analytics Grid Row 1 (Completion Trend + Activity Feed) */}
            <div className="grid gap-6 lg:grid-cols-7">
              <Card className="min-w-0 lg:col-span-4 rounded-2xl bg-card border border-border/80 shadow-e2 relative overflow-hidden">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent" />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-display text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
                        <TrendingUp className="size-4 text-primary" />
                        <span>90-Day Completion Trend</span>
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Problems completed per day over the last 90 days
                      </CardDescription>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      Daily Rolling
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="min-w-0 pt-3">
                  {isLoading ? (
                    <Skeleton className="h-[240px] w-full rounded-2xl" />
                  ) : (
                    <CompletionTrend data={stats?.trend ?? []} />
                  )}
                </CardContent>
              </Card>

              <Card className="min-w-0 lg:col-span-3 rounded-2xl bg-card border border-border/80 shadow-e2 relative overflow-hidden">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent" />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-display text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Activity className="size-4 text-emerald-500" />
                        <span>Recent Activity Log</span>
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Your latest problem submissions and actions
                      </CardDescription>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                      Live Stream
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-3 max-h-[300px] overflow-y-auto pr-1">
                  {isLoading ? (
                    <Skeleton className="h-[240px] w-full rounded-2xl" />
                  ) : (
                    <ActivityFeed events={stats?.recent ?? []} />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Analytics Grid Row 2 (Difficulty Mix + Pattern Progress Preview) */}
            <div className="grid gap-6 lg:grid-cols-7">
              <Card className="min-w-0 lg:col-span-3 rounded-2xl bg-card border border-border/80 shadow-e2 relative overflow-hidden">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-display text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Layers className="size-4 text-amber-500" />
                        <span>Difficulty Breakdown</span>
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Easy vs. Medium vs. Hard distribution
                      </CardDescription>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      Balance
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="min-w-0 pt-3">
                  {isLoading ? (
                    <Skeleton className="h-[180px] w-full rounded-2xl" />
                  ) : (
                    <DifficultyMix data={stats?.difficultyMix ?? {}} />
                  )}
                </CardContent>
              </Card>

              <Card className="min-w-0 lg:col-span-4 rounded-2xl bg-card border border-border/80 shadow-e2 relative overflow-hidden">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent" />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-display text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Workflow className="size-4 text-primary" />
                        <span>Pattern Completion</span>
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Mastery status across core algorithmic patterns
                      </CardDescription>
                    </div>
                    <button
                      onClick={() => setActiveTab('patterns')}
                      className="text-xs font-bold text-primary hover:text-primary-hover hover:underline cursor-pointer flex items-center gap-1 transition-colors"
                    >
                      <span>View All {patternProgress.length || 19} Patterns</span>
                      <ArrowRight className="size-3" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="min-w-0 pt-3">
                  {isLoading ? (
                    <Skeleton className="h-[240px] w-full rounded-2xl" />
                  ) : (
                    <GroupProgress data={patternProgress ?? []} maxHeight="max-h-[300px]" />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Row 3: Activity Heatmap Card */}
            <Card className="min-w-0 rounded-2xl bg-card border border-border/80 shadow-e2 relative overflow-hidden">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-display text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
                      <Flame className="size-4 text-amber-500" />
                      <span>Preparation Activity Heatmap</span>
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Daily problem solving submissions and evaluation runs
                    </CardDescription>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border/60">
                    Contribution Matrix
                  </span>
                </div>
              </CardHeader>
              <CardContent className="min-w-0 pt-3">
                {isLoading ? (
                  <Skeleton className="h-28 w-full rounded-2xl" />
                ) : (
                  <ActivityHeatmap data={stats?.heatmap ?? []} />
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="patterns"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6 pt-2"
          >
            <Card className="rounded-2xl bg-card border border-border/80 shadow-e2 p-6 relative overflow-hidden">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
                <div>
                  <div className="flex items-center gap-2">
                    <Workflow className="size-4 text-primary" />
                    <h3 className="text-base font-bold text-foreground">
                      {patternProgress.length || 19} Core Interview Pattern Roadmaps
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Filter and track problem-by-problem completion rates across high-yield placement categories.
                  </p>
                </div>
                <Link href="/dsa">
                  <button className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5">
                    <Terminal className="size-3.5" />
                    <span>Open DSA Workspace</span>
                  </button>
                </Link>
              </div>

              <div className="pt-4">
                <GroupProgress
                  data={patternProgress ?? []}
                  showSearch={true}
                  maxHeight="max-h-[640px]"
                />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
