'use client';

import { useState } from 'react';
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
  RefreshCw,
  Search,
  SlidersHorizontal,
} from 'lucide-react';

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
    },
  });

  const contests = data?.contests || [];

  // Filter by search & tab
  const filteredContests = contests.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.platform.toLowerCase().includes(searchQuery.toLowerCase());

    const isLive =
      new Date() >= new Date(c.startTime) && new Date() <= new Date(c.endTime);

    if (activeTab === 'live') return matchesSearch && isLive;
    if (activeTab === 'upcoming') return matchesSearch && !isLive;
    return matchesSearch;
  });

  const liveCount = contests.filter(
    (c) => new Date() >= new Date(c.startTime) && new Date() <= new Date(c.endTime)
  ).length;

  return (
    <div className="space-y-8 pb-16">
      {/* ── Top Navigation & Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button
            render={<Link href="/cp" />}
            variant="ghost"
            size="icon-xl"
            aria-label="Back to CP Hub"
            className="mt-0.5 shrink-0 sm:size-9 hover:bg-rose-500/10 hover:text-rose-500"
          >
            <ArrowLeft aria-hidden />
          </Button>
          <PageHeading
            className="min-w-0 flex-1"
            overline="Live Radar"
            title="Contest Schedule & Email Alerts"
            description="Real-time schedule of upcoming and live coding contests with automated email reminders."
          />
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending || isRefetching}
            className="gap-1.5 text-xs border-border/70 hover:border-rose-500/40 hover:bg-rose-500/5 shadow-xs"
          >
            <RefreshCw
              className={`size-3.5 ${
                syncMutation.isPending || isRefetching ? 'animate-spin text-rose-500' : ''
              }`}
            />
            <span>Refresh</span>
          </Button>

          <Button
            onClick={() => setModalOpen(true)}
            className="gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm hover:shadow-md"
          >
            <BellRing className="size-3.5" />
            <span>Alert Preferences</span>
          </Button>
        </div>
      </div>

      {/* ── Filter Controls Bar ─────────────────────────────────────────────── */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center rounded-xl bg-surface-sunken p-1 border border-border/60 self-start">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-surface text-foreground shadow-xs'
                  : 'text-text-muted hover:text-foreground'
              }`}
            >
              All Contests ({contests.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('live')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'live'
                  ? 'bg-surface text-emerald-500 shadow-xs'
                  : 'text-text-muted hover:text-foreground'
              }`}
            >
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Live Now ({liveCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upcoming')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-surface text-foreground shadow-xs'
                  : 'text-text-muted hover:text-foreground'
              }`}
            >
              Upcoming ({contests.length - liveCount})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-text-muted" />
            <Input
              type="text"
              placeholder="Search contest name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-surface border-border/70 rounded-xl"
            />
          </div>
        </div>

        {/* Platform Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {PLATFORMS.map((plat) => {
            const isSelected = selectedPlatform === plat.id;
            return (
              <button
                key={plat.id}
                type="button"
                onClick={() => setSelectedPlatform(plat.id)}
                className={`inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-surface border-border/60 text-text-muted hover:text-foreground hover:border-border hover:bg-surface-sunken/40'
                }`}
              >
                {plat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Contests Grid ───────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl w-full" />
          ))}
        </div>
      ) : filteredContests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface p-12 text-center shadow-sm">
          <div className="grid size-12 place-items-center rounded-full bg-rose-500/10 text-rose-500 mb-3">
            <SlidersHorizontal className="size-5" />
          </div>
          <Heading level="section" className="text-base font-bold">
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
            className="mt-4 text-xs font-semibold"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
