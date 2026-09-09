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
    queryKey: ['contests', selectedPlatform],
    queryFn: async () => {
      const url =
        selectedPlatform === 'all'
          ? '/api/contests?status=UPCOMING,RUNNING'
          : `/api/contests?platform=${selectedPlatform}&status=UPCOMING,RUNNING`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch contests');
      return res.json();
    },
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
      {/* ── Top Navigation & Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button
            render={<Link href="/cp" />}
            variant="ghost"
            size="icon-xl"
            aria-label="Back to CP Hub"
            className="mt-0.5 shrink-0 sm:size-9 hover:bg-emerald-500/10 hover:text-emerald-500"
          >
            <ArrowLeft aria-hidden />
          </Button>
          <PageHeading
            className="min-w-0 flex-1"
            overline="Global CP Tracker"
            title="Contest Radar & Schedule"
            description="Real-time multi-platform radar tracking upcoming and live competitions with automated email reminders."
          />
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending || isRefetching}
            className="gap-1.5 text-xs border-border/70 hover:border-emerald-500/40 hover:bg-emerald-500/5 shadow-2xs rounded-xl cursor-pointer"
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
            className="gap-1.5 text-xs border-border/70 hover:border-emerald-500/40 hover:bg-emerald-500/5 shadow-2xs rounded-xl cursor-pointer"
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
            className="gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-xs hover:shadow-emerald-500/20 rounded-xl cursor-pointer"
          >
            <BellRing className="size-3.5" />
            <span>Alert Preferences</span>
          </Button>
        </div>
      </div>

      {/* ── Cockpit Status Summary Strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-2xl bg-card/60 border border-border/70 shadow-xs backdrop-blur-xs">
        <div className="space-y-0.5">
          <span className="text-2xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Radio className="size-3 text-emerald-500" /> Live Contests
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-black text-foreground tabular-nums">
              {liveCount}
            </span>
            {liveCount > 0 && (
              <span className="text-2xs font-mono font-bold text-emerald-500 animate-pulse">
                Active Now
              </span>
            )}
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-2xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Clock className="size-3 text-amber-500" /> Next 24 Hours
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-black text-foreground tabular-nums">
              {next24hCount}
            </span>
            <span className="text-2xs font-mono text-muted-foreground">Starting soon</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-2xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Trophy className="size-3 text-blue-500" /> Total Radar
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-black text-foreground tabular-nums">
              {contests.length}
            </span>
            <span className="text-2xs font-mono text-muted-foreground">Tracked contests</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-2xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Globe className="size-3 text-emerald-500" /> Timezone
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs font-bold text-foreground truncate max-w-[170px]" title={userTimezone}>
              {userTimezone}
            </span>
          </div>
        </div>
      </div>

      {/* ── Filter Controls Bar ── */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center rounded-xl bg-muted/50 p-1 border border-border/60 self-start">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer',
                activeTab === 'all'
                  ? 'bg-background text-foreground shadow-2xs font-bold'
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
                  ? 'bg-background text-emerald-500 shadow-2xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Live Now ({liveCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upcoming')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer',
                activeTab === 'upcoming'
                  ? 'bg-background text-foreground shadow-2xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Upcoming ({contests.length - liveCount})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search contest name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-card border-border/70 rounded-xl"
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
                    ? 'bg-emerald-500 text-black border-emerald-500 font-bold shadow-xs'
                    : 'bg-card border-border/60 text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/30'
                )}
              >
                <span>{plat.label}</span>
                <span
                  className={cn(
                    'font-mono text-2xs px-1.5 py-0.2 rounded-full',
                    isSelected ? 'bg-black/20 text-black font-bold' : 'bg-muted text-muted-foreground'
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl w-full" />
          ))}
        </div>
      ) : filteredContests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/50 p-12 text-center shadow-xs">
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
            className="mt-4 text-xs font-semibold rounded-xl cursor-pointer"
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
