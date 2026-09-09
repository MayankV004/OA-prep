'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { subscriptionApi } from '@/lib/api/subscription';
import { ArrowRight } from 'lucide-react';
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

  const sessionId = searchParams.get('session_id');
  const paymentStatus = searchParams.get('payment');

  const { data: session } = authClient.useSession();
  const userName = session?.user?.name || 'Candidate';

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
    <div className="space-y-8 pb-16">
      
      {/* 1. Header Section & Cockpit Greeting */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-2">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              Candidate Cockpit
            </span>
            <span className="text-xs text-muted-foreground font-mono">• Target: Tier-1 SDE Placement</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Welcome back, <span className="text-primary">{userName}</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl font-normal leading-relaxed">
            Real-time algorithmic mastery, pattern retention velocity, and proctored assessment readiness.
          </p>
        </div>

        {/* Top Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link href="/oa/free-universal-diagnostic-oa">
            <button className="h-10 px-5 rounded-xl font-bold text-xs bg-amber-500/15 text-amber-500 border border-amber-500/30 hover:bg-amber-500/25 active:scale-95 transition-all cursor-pointer">
              Diagnostic OA
            </button>
          </Link>
          <Link href="/dsa">
            <button className="h-10 px-5 rounded-xl font-bold text-xs bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] border-t border-white/20 active:scale-95 transition-all cursor-pointer">
              Practice DSA &rarr;
            </button>
          </Link>
        </div>
      </div>

      {/* 2. Executive Stat Cards with Spotlight Effect */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1: Syllabus Mastery */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.15)"
          className="p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Problems Solved
            </span>
            <span className="text-[10px] font-mono font-bold text-primary px-2 py-0.5 rounded-md bg-primary/10">
              CORE
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-black text-foreground tabular-nums">
                  {totalCompleted}
                </span>
                <span className="text-xs text-muted-foreground font-mono font-medium">
                  / {totalProblems} ({overallPct}%)
                </span>
              </div>
            )}

            {/* Custom Progress Bar */}
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                style={{ width: `${overallPct}%` }}
                className="h-full rounded-full bg-primary transition-all duration-500"
              />
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Core Completion</span>
            <span className="font-bold text-primary">{overallPct}% of syllabus</span>
          </div>
        </SpotlightCard>

        {/* Card 2: Pattern Intuition */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.15)"
          className="p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Pattern DSA
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-500 px-2 py-0.5 rounded-md bg-emerald-500/10">
              14 PATTERNS
            </span>
          </div>

          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-black text-foreground tabular-nums">
                  {patternStats ? patternStats.completed : 0}
                </span>
                <span className="text-xs text-muted-foreground font-mono font-medium">
                  / {patternStats?.total ?? 0}
                </span>
              </div>
            )}
            <p className="mt-2 text-xs font-semibold text-emerald-500">
              High-Yield Placement Patterns
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Algorithmic Intuition</span>
            <span className="font-bold text-foreground">Active Track</span>
          </div>
        </SpotlightCard>

        {/* Card 3: Difficulty Mix */}
        <SpotlightCard
          spotlightColor="rgba(245, 158, 11, 0.12)"
          className="p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Difficulty Mix
            </span>
            <span className="text-[10px] font-mono font-bold text-amber-500 px-2 py-0.5 rounded-md bg-amber-500/10">
              BALANCE
            </span>
          </div>

          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-black text-foreground tabular-nums">
                  {stats?.difficultyMix?.Hard ?? 0}
                </span>
                <span className="text-xs font-bold text-rose-500 font-mono">Hard Solved</span>
              </div>
            )}

            <div className="mt-2 flex items-center gap-2 text-xs font-mono font-bold">
              <span className="text-emerald-500">{stats?.difficultyMix?.Easy ?? 0}E</span>
              <span className="text-muted-foreground/60">·</span>
              <span className="text-amber-500">{stats?.difficultyMix?.Medium ?? 0}M</span>
              <span className="text-muted-foreground/60">·</span>
              <span className="text-rose-500">{stats?.difficultyMix?.Hard ?? 0}H</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Balanced Distribution</span>
            <span className="font-bold text-amber-500">Tier-1 Ratio</span>
          </div>
        </SpotlightCard>

        {/* Card 4: 90d Activity Velocity */}
        <SpotlightCard
          spotlightColor="rgba(245, 158, 11, 0.12)"
          className="p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              90d Velocity
            </span>
            <span className="text-[10px] font-mono font-bold text-amber-500 px-2 py-0.5 rounded-md bg-amber-500/10">
              VELOCITY
            </span>
          </div>

          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-black text-foreground tabular-nums">
                  {actionsTotal}
                </span>
                <span className="text-xs text-muted-foreground font-mono font-medium">
                  Actions Logged
                </span>
              </div>
            )}
            <p className="mt-2 text-xs font-semibold text-amber-500">
              Continuous Prep Momentum
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Placement Cadence</span>
            <span className="font-bold text-emerald-500">Active</span>
          </div>
        </SpotlightCard>
      </div>

      {/* 3. Recommended Next Missions Strip */}
      <div className="p-6 rounded-2xl bg-card/60 dark:bg-card/40 border border-border/70 backdrop-blur-xl shadow-e2 relative overflow-hidden">
        <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10 mb-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-foreground">Recommended Prep Tracks</h3>
            <p className="text-xs text-muted-foreground">Pick up where you left off or test your boundary edge-case handling.</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 bg-surface-sunken p-1 rounded-xl border border-border/60">
            <button
              onClick={() => setActiveTab('overview')}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                activeTab === 'overview'
                  ? 'bg-card text-foreground font-bold shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Overview & Trends
            </button>
            <button
              onClick={() => setActiveTab('patterns')}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                activeTab === 'patterns'
                  ? 'bg-card text-foreground font-bold shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Pattern Roadmaps
            </button>
          </div>
        </div>

        {/* 3 Action Jump Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative z-10">
          <Link href="/dsa" className="group p-3.5 rounded-xl bg-card border border-border/70 hover:border-primary/50 transition-all hover:-translate-y-0.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-mono font-bold uppercase tracking-wider text-emerald-500">Pattern Focus</span>
              <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
            <h4 className="mt-1.5 text-xs font-bold text-foreground group-hover:text-primary transition-colors">Sliding Window & Two Pointers</h4>
            <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">Subarray bounds and contiguous sum optimizations.</p>
          </Link>

          <Link href="/oa" className="group p-3.5 rounded-xl bg-card border border-border/70 hover:border-amber-500/50 transition-all hover:-translate-y-0.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-mono font-bold uppercase tracking-wider text-amber-500">OA Simulator</span>
              <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
            </div>
            <h4 className="mt-1.5 text-xs font-bold text-foreground group-hover:text-amber-500 transition-colors">Amazon & Google OA Mock</h4>
            <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">Timed environment with full proctoring emulation.</p>
          </Link>

          <Link href="/subjects" className="group p-3.5 rounded-xl bg-card border border-border/70 hover:border-sky-500/50 transition-all hover:-translate-y-0.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-mono font-bold uppercase tracking-wider text-sky-500">CS Core Revision</span>
              <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-sky-500 group-hover:translate-x-0.5 transition-all" />
            </div>
            <h4 className="mt-1.5 text-xs font-bold text-foreground group-hover:text-sky-500 transition-colors">OS Processes & Threads</h4>
            <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">Deadlocks, semaphore sync, and memory hierarchy.</p>
          </Link>
        </div>
      </div>

      {/* 4. Analytics Views Based on Active Tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Analytics Grid Row 1 (Completion Trend + Activity Feed) */}
            <div className="grid gap-6 lg:grid-cols-7">
              <Card className="min-w-0 lg:col-span-4 rounded-2xl bg-card border border-border/80 shadow-e2 relative overflow-hidden">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-display text-sm font-bold tracking-tight text-foreground">
                        90-Day Completion Trend
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Problems completed per day over the last 90 days
                      </CardDescription>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-primary/10 text-primary">
                      Daily Rolling
                    </span>
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

              <Card className="min-w-0 lg:col-span-3 rounded-2xl bg-card border border-border/80 shadow-e2 relative overflow-hidden">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-display text-sm font-bold tracking-tight text-foreground">
                        Recent Activity Log
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Your latest 10 problem submissions
                      </CardDescription>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-muted text-muted-foreground">
                      Timeline
                    </span>
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

            {/* Analytics Grid Row 2 (Difficulty Mix + Pattern Progress Preview) */}
            <div className="grid gap-6 lg:grid-cols-7">
              <Card className="min-w-0 lg:col-span-3 rounded-2xl bg-card border border-border/80 shadow-e2 relative overflow-hidden">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-display text-sm font-bold tracking-tight text-foreground">
                        Difficulty Breakdown
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Easy vs. Medium vs. Hard distribution
                      </CardDescription>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500">
                      Balance
                    </span>
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

              <Card className="min-w-0 lg:col-span-4 rounded-2xl bg-card border border-border/80 shadow-e2 relative overflow-hidden">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-display text-sm font-bold tracking-tight text-foreground">
                        Pattern Completion
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Mastery status across core algorithmic patterns
                      </CardDescription>
                    </div>
                    <button
                      onClick={() => setActiveTab('patterns')}
                      className="text-xs font-bold text-primary hover:underline cursor-pointer"
                    >
                      View Detailed &rarr;
                    </button>
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
            </div>

            {/* 5. Activity Heatmap Card */}
            <Card className="min-w-0 rounded-2xl bg-card border border-border/80 shadow-e2 relative overflow-hidden">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-display text-sm font-bold tracking-tight text-foreground">
                      Preparation Activity Heatmap
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Daily problem solving submissions and evaluation runs over the last 90 days
                    </CardDescription>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-muted text-muted-foreground">
                    Rolling 90 Days
                  </span>
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
          </motion.div>
        ) : (
          <motion.div
            key="patterns"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <Card className="rounded-2xl bg-card border border-border/80 shadow-e2 p-6">
              <div className="flex items-center justify-between pb-4 border-b border-border/60">
                <div>
                  <h3 className="text-base font-bold text-foreground">14 Core Interview Pattern Roadmaps</h3>
                  <p className="text-xs text-muted-foreground">Detailed problem-by-problem completion rates across placement categories.</p>
                </div>
                <Link href="/dsa">
                  <button className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm">
                    Open DSA Workspace
                  </button>
                </Link>
              </div>

              <div className="pt-6">
                <GroupProgress data={patternProgress ?? []} />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
