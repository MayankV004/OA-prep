'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { PageHeading, Heading, Text } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ContestCountdownCard, ContestItemProps } from '@/components/contests/ContestCountdownCard';
import { ContestAlertPreferencesModal } from '@/components/contests/ContestAlertPreferencesModal';
import {
  ArrowLeft,
  BellRing,
  MailCheck,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Radio,
  Clock,
  Globe,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { queryKeys, STALE_TIMES } from '@/lib/query-keys';

const PLATFORMS = [
  { id: 'all', label: 'All Platforms' },
  { id: 'leetcode', label: 'LeetCode' },
  { id: 'codeforces', label: 'Codeforces' },
  { id: 'codechef', label: 'CodeChef' },
  { id: 'atcoder', label: 'AtCoder' },
  { id: 'hackerearth', label: 'HackerEarth' },
];

export default function ContestsPage() {
  const queryClient = useQueryClient();
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'upcoming'>('all');
  const [modalOpen, setModalOpen] = useState(false);

  // Auto-detected timezone
  const userTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
    } catch {
      return 'Asia/Kolkata';
    }
  }, []);

  // Fetch contests
  const { data, isLoading, isRefetching } = useQuery<{
    success: boolean;
    count: number;
    contests: ContestItemProps[];
  }>({
    queryKey: queryKeys.contests.list(selectedPlatform),
    queryFn: async () => {
      const url =
        selectedPlatform === 'all'
          ? '/api/contests?status=UPCOMING,RUNNING'
          : `/api/contests?platform=${selectedPlatform}&status=UPCOMING,RUNNING`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch contests');
      return res.json();
    },
    staleTime: STALE_TIMES.shared,
    placeholderData: (previousData) => previousData,
  });

  // Manual sync mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/cron/contests-sync', { method: 'POST' });
      if (!res.ok) throw new Error('Sync failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contests'] });
      toast.success('Contests refreshed from LeetCode & Codeforces!');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Sync failed');
    },
  });

  // Manual alert scan mutation
  const scanMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/cron/contest-alerts', { method: 'POST' });
      if (!res.ok) throw new Error('Alert scan failed');
      return res.json();
    },
    onSuccess: (res) => {
      if (res.totalDispatched > 0) {
        toast.success(`Dispatched ${res.totalDispatched} contest alert emails!`);
      } else {
        toast.info(
          `Evaluated ${res.totalEvaluated} contests. No contests are currently in the 24h, 2h, or 30m reminder window.`
        );
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to scan alerts');
    },
  });

  const contests = data?.contests || [];

  // Filter by search & tab
  const filteredContests = useMemo(() => {
    return contests.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.platform.toLowerCase().includes(searchQuery.toLowerCase());

      const isLive =
        new Date() >= new Date(c.startTime) && new Date() <= new Date(c.endTime);

      if (activeTab === 'live') return matchesSearch && isLive;
      if (activeTab === 'upcoming') return matchesSearch && !isLive;
      return matchesSearch;
    });
  }, [contests, searchQuery, activeTab]);

  // Compute live & upcoming stats
  const { liveCount, next24hCount, platformCounts } = useMemo(() => {
    const now = Date.now();
    const in24h = now + 24 * 3600 * 1000;

    let live = 0;
    let next24 = 0;
    const counts: Record<string, number> = {};

    for (const c of contests) {
      const start = new Date(c.startTime).getTime();
      const end = new Date(c.endTime).getTime();
      if (now >= start && now <= end) live++;
      if (start > now && start <= in24h) next24++;
      const p = c.platform.toLowerCase();
      counts[p] = (counts[p] || 0) + 1;
    }

    return { liveCount: live, next24hCount: next24, platformCounts: counts };
  }, [contests]);

  return (
    <div className="space-y-8 pb-16">
      {/* ── 1. Page Header (Modern Cockpit Header) ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-2">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Link
              href="/cp"
              className="inline-flex items-center justify-center size-9 rounded-full bg-card/70 dark:bg-card/35 border border-border/80 dark:border-white/10 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shadow-2xs cursor-pointer"
              aria-label="Back to CP Hub"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <span className="text-2xs font-mono font-bold tracking-wider text-primary uppercase">
              Global CP Tracker
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-foreground leading-[1.08]">
            Contest Radar &{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-200 bg-clip-text text-transparent">
              Schedule
            </span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed font-normal">
            Real-time multi-platform radar tracking upcoming and live competitions with automated email reminders.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending || isRefetching}
            className="gap-1.5 text-xs rounded-full border-border/80 dark:border-white/10 bg-card/70 dark:bg-card/35 backdrop-blur-md hover:border-emerald-500/40 hover:bg-emerald-500/5 shadow-2xs cursor-pointer px-3.5 py-2"
          >
            <RefreshCw
              className={cn(
                'size-3.5',
                syncMutation.isPending || isRefetching ? 'animate-spin text-emerald-500' : ''
              )}
            />
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => scanMutation.mutate()}
            disabled={scanMutation.isPending}
            className="gap-1.5 text-xs rounded-full border-border/80 dark:border-white/10 bg-card/70 dark:bg-card/35 backdrop-blur-md hover:border-emerald-500/40 hover:bg-emerald-500/5 shadow-2xs cursor-pointer px-3.5 py-2"
            title="Scan upcoming contests and dispatch due email alerts"
          >
            <MailCheck
              className={cn(
                'size-3.5 text-emerald-500',
                scanMutation.isPending ? 'animate-pulse' : ''
              )}
            />
            <span>{scanMutation.isPending ? 'Scanning...' : 'Check Alerts'}</span>
          </Button>

          <Button
            onClick={() => setModalOpen(true)}
            className="gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs rounded-full shadow-xs cursor-pointer px-4 py-2"
          >
            <BellRing className="size-3.5" />
            <span>Alert Preferences</span>
          </Button>
        </div>
      </div>

      {/* ── 2. Cockpit Status Summary Strip (Frameless Divider Architecture) ── */}
      <div className="w-full py-5 px-1 sm:px-2 border-y border-foreground/20 dark:border-white/20 bg-foreground/[0.02] dark:bg-white/[0.02] transition-colors">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="space-y-1">
            <span className="text-2xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Radio className="size-3 text-emerald-500" /> Live Contests
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-2xl sm:text-3xl font-black text-foreground tabular-nums">
                {liveCount}
              </span>
              {liveCount > 0 && (
                <span className="text-2xs font-mono font-bold text-emerald-500 animate-pulse">
                  Active Now
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-2xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Clock className="size-3 text-amber-500" /> Next 24 Hours
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-2xl sm:text-3xl font-black text-foreground tabular-nums">
                {next24hCount}
              </span>
              <span className="text-2xs font-mono text-muted-foreground">Starting soon</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-2xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Trophy className="size-3 text-blue-500" /> Total Radar
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-2xl sm:text-3xl font-black text-foreground tabular-nums">
                {contests.length}
              </span>
              <span className="text-2xs font-mono text-muted-foreground">Tracked contests</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-2xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Globe className="size-3 text-emerald-500" /> Timezone
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xs sm:text-sm font-bold text-foreground truncate max-w-[200px]" title={userTimezone}>
                {userTimezone}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Filter Controls Bar ── */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl bg-card/70 dark:bg-card/35 border border-border/80 dark:border-white/10 backdrop-blur-2xl shadow-xs">
          {/* Status Tabs */}
          <div className="flex items-center rounded-xl bg-muted/60 dark:bg-card/40 p-1 border border-border/40 dark:border-white/5 self-start">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer',
                activeTab === 'all'
                  ? 'bg-card text-foreground shadow-2xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              All Contests ({contests.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('live')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 cursor-pointer',
                activeTab === 'live'
                  ? 'bg-card text-emerald-500 shadow-2xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Now ({liveCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upcoming')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer',
                activeTab === 'upcoming'
                  ? 'bg-card text-foreground shadow-2xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Upcoming ({contests.length - liveCount})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search contest name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-background/50 border-border/60 dark:border-white/10 rounded-xl font-sans"
            />
          </div>
        </div>

        {/* Platform Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {PLATFORMS.map((plat) => {
            const isSelected = selectedPlatform === plat.id;
            const count = plat.id === 'all' ? contests.length : platformCounts[plat.id] || 0;
            return (
              <button
                key={plat.id}
                type="button"
                onClick={() => setSelectedPlatform(plat.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer',
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary font-bold shadow-xs'
                    : 'bg-card/70 dark:bg-card/35 border-border/60 dark:border-white/10 text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/30 backdrop-blur-md'
                )}
              >
                <span>{plat.label}</span>
                <span
                  className={cn(
                    'font-mono text-2xs px-1.5 py-0.2 rounded-full',
                    isSelected ? 'bg-black/20 text-white font-bold' : 'bg-muted text-muted-foreground'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Contests Grid ── */}
      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-[28px] sm:rounded-3xl w-full" />
          ))}
        </div>
      ) : filteredContests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[28px] sm:rounded-3xl border border-dashed border-border/80 dark:border-white/10 bg-card/70 dark:bg-card/35 backdrop-blur-2xl p-12 text-center shadow-xs">
          <div className="grid size-12 place-items-center rounded-full bg-emerald-500/10 text-emerald-500 mb-3">
            <SlidersHorizontal className="size-5" />
          </div>
          <Heading level="section" className="text-base font-bold text-foreground">
            No Contests Found
          </Heading>
          <Text tone="muted" className="text-xs max-w-sm mt-1">
            No upcoming or active contests matched your search criteria. Try switching platforms or refreshing the feed.
          </Text>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedPlatform('all');
              setSearchQuery('');
              setActiveTab('all');
            }}
            className="mt-4 text-xs font-semibold rounded-full border-border/80 dark:border-white/10 bg-card/70 dark:bg-card/40 cursor-pointer px-4"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredContests.map((contest) => (
            <ContestCountdownCard
              key={contest._id || `${contest.platform}-${contest.externalId}`}
              contest={contest}
            />
          ))}
        </div>
      )}

      {/* Preferences Modal Trigger */}
      <ContestAlertPreferencesModal
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
