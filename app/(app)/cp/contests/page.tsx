'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { PageHeading, Heading, Text } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ContestCountdownCard, ContestItemProps } from '@/components/contests/ContestCountdownCard';
import { ContestAlertPreferencesModal } from '@/components/contests/ContestAlertPreferencesModal';
import {
  ArrowLeft,
  Bell,
  BellRing,
  RefreshCw,
  Search,
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

  // Fetch subscription status for the header banner
  const { data: subData } = useQuery({
    queryKey: ['contestSubscription'],
    queryFn: async () => {
      const res = await fetch('/api/contests/subscription');
      if (!res.ok) return null;
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

  const isAlertsActive = subData?.subscription?.enabled ?? true;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Navigation & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button
            render={<Link href="/cp" />}
            variant="ghost"
            size="icon-xl"
            aria-label="Back to CP Hub"
            className="mt-0.5 shrink-0 sm:size-9"
          >
            <ArrowLeft aria-hidden />
          </Button>
          <PageHeading
            className="min-w-0 flex-1"
            overline="Live Radar"
            title="Contest Schedule & Email Alerts"
            description="Track upcoming and ongoing coding contests across LeetCode, Codeforces, CodeChef, and AtCoder with automated email alerts."
          />
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending || isRefetching}
            className="gap-1.5 text-xs"
          >
            <RefreshCw
              className={`size-3.5 ${
                syncMutation.isPending || isRefetching ? 'animate-spin text-primary' : ''
              }`}
            />
            <span>Refresh</span>
          </Button>

          <Button
            onClick={() => setModalOpen(true)}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-sm"
          >
            <BellRing className="size-3.5" />
            <span>Email Alert Settings</span>
          </Button>
        </div>
      </div>

      {/* Subscription Callout Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-surface to-surface-sunken p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
                ⏰
              </span>
              <span className="font-semibold text-sm text-text">
                Never Miss Another Contest
              </span>
              {isAlertsActive ? (
                <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-[10px] py-0 px-2 font-mono">
                  ● ALERTS ON
                </Badge>
              ) : (
                <Badge className="bg-zinc-500/15 text-zinc-400 border-zinc-500/30 text-[10px] py-0 px-2 font-mono">
                  PAUSED
                </Badge>
              )}
            </div>
            <Text size="caption" tone="muted" className="text-xs">
              Get timely notifications <strong>2 hours</strong> and <strong>30 minutes</strong> before contest start
              with direct calendar links and practice recommendations right in your inbox.
            </Text>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setModalOpen(true)}
            className="shrink-0 gap-1.5 font-medium border border-border/60 hover:bg-surface-sunken"
          >
            <Bell className="size-3.5 text-primary" />
            <span>{isAlertsActive ? 'Customize Reminders' : 'Enable Email Alerts'}</span>
          </Button>
        </div>
      </div>

      {/* Search & Platform Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-subtle" />
            <Input
              type="text"
              placeholder="Search contest title or platform..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs bg-surface"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-sunken border border-border/60 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-surface text-text font-semibold shadow-xs'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              All ({contests.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('live')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'live'
                  ? 'bg-surface text-emerald-500 font-semibold shadow-xs'
                  : 'text-text-muted hover:text-emerald-500'
              }`}
            >
              <span className="size-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Live Now ({liveCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upcoming')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-surface text-text font-semibold shadow-xs'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              Upcoming ({contests.length - liveCount})
            </button>
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
                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs font-semibold'
                    : 'bg-surface border-border/60 text-text-muted hover:text-text hover:border-border hover:bg-surface-sunken/40'
                }`}
              >
                {plat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contests Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : filteredContests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-dashed border-border/80 bg-surface-sunken/30 text-center">
          <div className="grid size-12 place-items-center rounded-2xl bg-surface-sunken text-2xl mb-3">
            📅
          </div>
          <Heading level="card" className="font-semibold mb-1">
            No Contests Found
          </Heading>
          <Text size="caption" tone="muted" className="max-w-md mb-4">
            {searchQuery
              ? `No contests matching "${searchQuery}". Try searching for another platform or keyword.`
              : `No upcoming contests found for ${selectedPlatform}. Click refresh to check for schedule updates.`}
          </Text>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedPlatform('all');
              setSearchQuery('');
              setActiveTab('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredContests.map((contest) => (
            <ContestCountdownCard key={contest.externalId || contest._id} contest={contest} />
          ))}
        </div>
      )}

      {/* Preferences Modal */}
      <ContestAlertPreferencesModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
