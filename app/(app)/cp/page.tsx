'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  BellRing,
  Activity,
  Trophy,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Radio,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { Skeleton } from '@/components/ui/skeleton';
import { CpProfileOverviewCard, UserCpProfileData } from '@/components/cp/CpProfileOverviewCard';
import { RatingProgressChart } from '@/components/cp/RatingProgressChart';
import { ContestHistoryTable, ContestHistoryRecord } from '@/components/cp/ContestHistoryTable';
import { ContestAlertPreferencesModal } from '@/components/contests/ContestAlertPreferencesModal';
import { Button } from '@/components/ui/button';
import { queryKeys, STALE_TIMES } from '@/lib/query-keys';

interface PerformanceData {
  success: boolean;
  profile: UserCpProfileData;
  contests: ContestHistoryRecord[];
  chartData: Array<{
    date: string;
    codeforces?: number;
    leetcode?: number;
    atcoder?: number;
    codechef?: number;
  }>;
  totalContestsAttended: number;
}

const PLATFORM_SHORTCUTS = [
  { name: 'LeetCode', slug: 'leetcode-contest', color: 'text-amber-500' },
  { name: 'Codeforces', slug: 'codeforces', color: 'text-blue-500' },
  { name: 'CodeChef', slug: 'codechef', color: 'text-orange-500' },
  { name: 'AtCoder', slug: 'atcoder', color: 'text-cyan-500' },
];

export default function CPPage() {
  const { data: perfData, isLoading } = useQuery<PerformanceData>({
    queryKey: queryKeys.cp.performance(),
    queryFn: async () => {
      const res = await fetch('/api/cp/performance');
      if (!res.ok) throw new Error('Failed to load performance data');
      return res.json();
    },
    staleTime: STALE_TIMES.userSlow,
    placeholderData: (previousData) => previousData,
  });

  const totalContests = perfData?.totalContestsAttended ?? perfData?.contests?.length ?? 0;
  const compositeScore = perfData?.profile?.compositeScore ?? 0;

  const { maxRating, peakPlatform, peakRankBadge, connectedCount, latestContest } = useMemo(() => {
    const prof = perfData?.profile;
    const contests = perfData?.contests || [];

    let count = 0;
    let peak = 0;
    let peakPlat = 'All Platforms';
    let rankBadge = '';

    if (prof?.codeforces?.handle) {
      count++;
      const r = prof.codeforces.maxRating || prof.codeforces.rating || 0;
      if (r > peak) {
        peak = r;
        peakPlat = 'Codeforces';
        rankBadge = prof.codeforces.rank ? prof.codeforces.rank.toUpperCase() : '';
      }
    }
    if (prof?.leetcode?.username) {
      count++;
      const r = prof.leetcode.rating || 0;
      if (r > peak) {
        peak = r;
        peakPlat = 'LeetCode';
        rankBadge = prof.leetcode.topPercentage
          ? `Top ${prof.leetcode.topPercentage}%`
          : prof.leetcode.globalRanking
          ? `Rank #${prof.leetcode.globalRanking.toLocaleString()}`
          : '';
      }
    }
    if (prof?.codechef?.handle) {
      count++;
      const r = prof.codechef.rating || 0;
      if (r > peak) {
        peak = r;
        peakPlat = 'CodeChef';
        rankBadge = prof.codechef.stars ? `${prof.codechef.stars}` : '';
      }
    }
    if (prof?.atcoder?.handle) {
      count++;
      const r = prof.atcoder.highestRating || prof.atcoder.rating || 0;
      if (r > peak) {
        peak = r;
        peakPlat = 'AtCoder';
        rankBadge = prof.atcoder.color ? prof.atcoder.color.toUpperCase() : '';
      }
    }

    const latest = contests[0] || null;

    return {
      maxRating: peak,
      peakPlatform: peakPlat,
      peakRankBadge: rankBadge,
      connectedCount: count,
      latestContest: latest,
    };
  }, [perfData?.profile, perfData?.contests]);

  const { latestContestDate, latestContestPlatform } = useMemo(() => {
    if (!latestContest) return { latestContestDate: '', latestContestPlatform: 'No contests yet' };
    let dateStr = 'Recently';
    try {
      const d = typeof latestContest.contestDate === 'string' ? parseISO(latestContest.contestDate) : latestContest.contestDate;
      dateStr = format(d, 'MMM d, yyyy');
    } catch {
      dateStr = String(latestContest.contestDate);
    }
    const platLabels: Record<string, string> = {
      leetcode: 'LeetCode',
      codeforces: 'Codeforces',
      codechef: 'CodeChef',
      atcoder: 'AtCoder',
    };
    return {
      latestContestDate: dateStr,
      latestContestPlatform: platLabels[latestContest.platform] || latestContest.platform,
    };
  }, [latestContest]);

  return (
    <div className="space-y-8 pb-16">
      {/* ── 1. Page Header (Modern Cockpit Header) ────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-2">
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-foreground leading-[1.08]">
            Contest Radar &{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-200 bg-clip-text text-transparent">
              CP Analytics
            </span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-xl font-normal leading-relaxed">
            Multi-platform contest radar, automated reminders, and synchronized rating trajectories across Codeforces, LeetCode, CodeChef, and AtCoder.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 self-start lg:self-center shrink-0">
          <Button
            render={<Link href="/cp/contests" />}
            size="sm"
            className="gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs shadow-xs active:scale-95 transition-all rounded-full px-4 py-2 cursor-pointer"
          >
            <Activity className="size-3.5" />
            <span>Contest Radar</span>
          </Button>

          <ContestAlertPreferencesModal
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="gap-2 font-semibold text-xs border-border/70 hover:border-primary/40 hover:bg-primary/5 shadow-2xs rounded-full px-4 py-2 cursor-pointer"
              >
                <BellRing className="size-3.5 text-primary" />
                <span>Alert Preferences</span>
              </Button>
            }
          />
        </div>
      </div>

      {/* ── 2. Frosted Executive CP Metrics Strip with SpotlightCard ───────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Composite CP Score */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.14)"
          className="p-6 flex flex-col justify-between rounded-[28px] sm:rounded-3xl bg-card/70 dark:bg-card/35 backdrop-blur-2xl border border-border/80 dark:border-white/10 hover:border-foreground/20 dark:hover:border-white/20 shadow-xs hover:shadow-xl transition-all relative overflow-hidden before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/70 dark:before:via-white/15 before:to-transparent"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
                <Trophy className="size-3.5" />
              </span>
              <span>Composite Score</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-primary px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
              {compositeScore >= 75 ? 'EXPERT' : compositeScore >= 50 ? 'ADVANCED' : 'RANKED'}
            </span>
          </div>

          <div className="mt-4 space-y-2.5">
            {isLoading ? (
              <Skeleton className="h-9 w-24 rounded-lg" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl sm:text-4xl font-black text-foreground tabular-nums tracking-tight">
                  {compositeScore > 0 ? compositeScore : '--'}
                </span>
                <span className="text-xs text-muted-foreground font-mono font-medium">
                  / 100
                </span>
              </div>
            )}

            {/* Glowing progress bar */}
            <div className="h-1.5 w-full rounded-full bg-muted/80 overflow-hidden relative">
              <div
                style={{ width: `${Math.min(100, Math.max(0, compositeScore))}%` }}
                className="h-full rounded-full bg-primary transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
              />
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between font-mono">
            <span>Unified CP Index</span>
            <span className="font-bold text-primary">
              {compositeScore >= 50 ? 'Top 20% Contender' : 'Placement Ready'}
            </span>
          </div>
        </SpotlightCard>

        {/* Card 2: Contests Attended */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.14)"
          className="p-6 flex flex-col justify-between rounded-[28px] sm:rounded-3xl bg-card/70 dark:bg-card/35 backdrop-blur-2xl border border-border/80 dark:border-white/10 hover:border-foreground/20 dark:hover:border-white/20 shadow-xs hover:shadow-xl transition-all relative overflow-hidden before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/70 dark:before:via-white/15 before:to-transparent"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                <Activity className="size-3.5" />
              </span>
              <span>Contests Attended</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-500 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
              LIFETIME
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {isLoading ? (
              <Skeleton className="h-9 w-20 rounded-lg" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl sm:text-4xl font-black text-foreground tabular-nums tracking-tight">
                  {totalContests}
                </span>
                <span className="text-xs text-muted-foreground font-mono font-medium">
                  participations
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{perfData?.contests?.length ? `${perfData.contests.length} rated contests on radar` : 'Tracking active'}</span>
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between font-mono">
            <span>{latestContestDate ? `Latest: ${latestContestDate}` : 'Recent Activity'}</span>
            <span className="font-bold text-foreground truncate max-w-[110px]" title={latestContestPlatform}>
              {latestContestPlatform}
            </span>
          </div>
        </SpotlightCard>

        {/* Card 3: Peak Contest Rating */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.14)"
          className="p-6 flex flex-col justify-between rounded-[28px] sm:rounded-3xl bg-card/70 dark:bg-card/35 backdrop-blur-2xl border border-border/80 dark:border-white/10 hover:border-foreground/20 dark:hover:border-white/20 shadow-xs hover:shadow-xl transition-all relative overflow-hidden before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/70 dark:before:via-white/15 before:to-transparent"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
                <TrendingUp className="size-3.5" />
              </span>
              <span>Peak Rating</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-primary px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 uppercase">
              {peakPlatform !== 'All Platforms' ? peakPlatform : 'GLOBAL'}
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {isLoading ? (
              <Skeleton className="h-9 w-24 rounded-lg" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl sm:text-4xl font-black text-foreground tabular-nums tracking-tight">
                  {maxRating > 0 ? maxRating : '--'}
                </span>
                <span className="text-xs text-muted-foreground font-mono font-medium">
                  rating
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
              {peakRankBadge ? (
                <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold border border-primary/20 truncate max-w-full">
                  {peakRankBadge}
                </span>
              ) : (
                <span>Highest recorded standing</span>
              )}
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between font-mono">
            <span>Peak Platform</span>
            <span className="font-bold text-primary">{peakPlatform}</span>
          </div>
        </SpotlightCard>

        {/* Card 4: Linked Platforms */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.14)"
          className="p-6 flex flex-col justify-between rounded-[28px] sm:rounded-3xl bg-card/70 dark:bg-card/35 backdrop-blur-2xl border border-border/80 dark:border-white/10 hover:border-foreground/20 dark:hover:border-white/20 shadow-xs hover:shadow-xl transition-all relative overflow-hidden before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/70 dark:before:via-white/15 before:to-transparent"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                <CheckCircle2 className="size-3.5" />
              </span>
              <span>Linked Handles</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-500 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
              {connectedCount === 4 ? 'ALL SYNCED' : `${connectedCount}/4 LINKED`}
            </span>
          </div>

          <div className="mt-4 space-y-2.5">
            {isLoading ? (
              <Skeleton className="h-9 w-20 rounded-lg" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl sm:text-4xl font-black text-foreground tabular-nums tracking-tight">
                  {connectedCount}
                </span>
                <span className="text-xs text-muted-foreground font-mono font-medium">
                  / 4 platforms
                </span>
              </div>
            )}

            {/* Platform indicators strip */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { name: 'CF', key: 'codeforces', color: 'bg-blue-500', connected: Boolean(perfData?.profile?.codeforces?.handle) },
                { name: 'LC', key: 'leetcode', color: 'bg-amber-500', connected: Boolean(perfData?.profile?.leetcode?.username) },
                { name: 'CC', key: 'codechef', color: 'bg-orange-500', connected: Boolean(perfData?.profile?.codechef?.handle) },
                { name: 'AC', key: 'atcoder', color: 'bg-cyan-500', connected: Boolean(perfData?.profile?.atcoder?.handle) },
              ].map((p) => (
                <div
                  key={p.key}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold border transition-all ${
                    p.connected
                      ? 'bg-card border-border/80 text-foreground'
                      : 'bg-muted/30 border-border/40 text-muted-foreground/50 opacity-60'
                  }`}
                  title={`${p.name}: ${p.connected ? 'Connected' : 'Not linked'}`}
                >
                  <span className={`size-1.5 rounded-full ${p.connected ? p.color : 'bg-muted-foreground/30'}`} />
                  <span>{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between font-mono">
            <span>
              {4 - connectedCount > 0 ? `${4 - connectedCount} handle unlinked` : 'All platforms active'}
            </span>
            <Link href="/profile" className="font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer">
              <span>Profile</span>
              <ArrowRight className="size-2.5" />
            </Link>
          </div>
        </SpotlightCard>
      </div>

      {/* ── 3. Platform Upsolving Shortcuts Bar ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-card/70 border border-border/80 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5 font-mono">
            <Radio className="size-3.5 text-primary" />
            <span>Practice By Platform:</span>
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {PLATFORM_SHORTCUTS.map((p) => (
            <Link key={p.slug} href={`/cp/${p.slug}`}>
              <button
                type="button"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-muted/60 hover:bg-primary/10 hover:text-primary border border-border/60 hover:border-primary/30 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <span className={`inline-block size-1.5 rounded-full ${p.color}`} />
                <span>{p.name}</span>
                <ArrowRight className="size-3 opacity-60" />
              </button>
            </Link>
          ))}
        </div>
      </div>

      {/* ── 4. Verified CP Profiles & Ratings Overview ───────────────────── */}
      <CpProfileOverviewCard profile={perfData?.profile} isLoading={isLoading} />

      {/* ── 5. Multi-Platform Rating Trajectory Chart ────────────────────── */}
      <RatingProgressChart data={perfData?.chartData || []} />

      {/* ── 6. Chronological Contest History Log ────────────────────────── */}
      {perfData?.contests && perfData.contests.length > 0 && (
        <ContestHistoryTable contests={perfData.contests} />
      )}
    </div>
  );
}
