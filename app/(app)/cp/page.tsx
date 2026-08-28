'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { BellRing, Activity } from 'lucide-react';
import { PageHeading } from '@/components/ui/typography';
import { CpProfileOverviewCard, UserCpProfileData } from '@/components/cp/CpProfileOverviewCard';
import { RatingProgressChart } from '@/components/cp/RatingProgressChart';
import { ContestHistoryTable, ContestHistoryRecord } from '@/components/cp/ContestHistoryTable';
import { ContestAlertPreferencesModal } from '@/components/contests/ContestAlertPreferencesModal';
import { Button } from '@/components/ui/button';

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

export default function CPPage() {
  const { data: perfData, isLoading } = useQuery<PerformanceData>({
    queryKey: ['cpPerformance'],
    queryFn: async () => {
      const res = await fetch('/api/cp/performance');
      if (!res.ok) throw new Error('Failed to load performance data');
      return res.json();
    },
  });

  return (
    <div className="space-y-6 pb-16">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeading
          overline="Competitive Programming"
          title="Contest Radar & CP Analytics"
          description="Live contest radar, automated email reminders, and unified multi-platform rating trajectories."
        />

        <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
          <Button
            render={<Link href="/cp/contests" />}
            size="sm"
            className="gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm hover:shadow-md"
          >
            <Activity className="size-3.5" />
            <span>Contest Radar</span>
          </Button>

          <ContestAlertPreferencesModal
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="gap-2 font-semibold text-xs border-border/70 hover:border-rose-500/40 hover:bg-rose-500/5 shadow-xs"
              >
                <BellRing className="size-3.5 text-rose-500" />
                <span>Alert Preferences</span>
              </Button>
            }
          />
        </div>
      </div>

      {/* ── 1. Verified CP Profiles & Ratings Overview ───────────────────────── */}
      <CpProfileOverviewCard profile={perfData?.profile} isLoading={isLoading} />

      {/* ── 2. Multi-Platform Rating Trajectory Chart ────────────────────────── */}
      <RatingProgressChart data={perfData?.chartData || []} />

      {/* ── 3. Chronological Contest History Log ────────────────────────────── */}
      {perfData?.contests && perfData.contests.length > 0 && (
        <ContestHistoryTable contests={perfData.contests} />
      )}
    </div>
  );
}
