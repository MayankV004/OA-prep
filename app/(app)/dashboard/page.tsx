'use client';

import { useQuery } from '@tanstack/react-query';
import { Code2, Trophy, Activity, TrendingUp, type LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heading, Metric, PageHeading, Text } from '@/components/ui/typography';
import { Skeleton, SkeletonRows } from '@/components/ui/skeleton';
import { CompletionTrend } from '@/components/dashboard/CompletionTrend';
import { GroupProgress } from '@/components/dashboard/GroupProgress';
import { DifficultyMix } from '@/components/dashboard/DifficultyMix';
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';

interface DashboardStats {
  totalsByKind: { kind: string; total: number; completed: number }[];
  difficultyMix: { Easy?: number; Medium?: number; Hard?: number };
  trend: { date: string; completed: number }[];
  heatmap: { date: string; count: number }[];
  recent: any[];
}

/** Stat tile: label + icon, one hero figure, one line of supporting context. */
function StatCard({
  label,
  icon: Icon,
  value,
  hint,
  isLoading,
}: {
  label: string;
  icon: LucideIcon;
  value: React.ReactNode;
  hint: React.ReactNode;
  isLoading: boolean;
}) {
  return (
    <Card className="min-w-0">
      <CardHeader className="grid-cols-[1fr_auto] items-center gap-2">
        <Heading level="overline" as="p">
          {label}
        </Heading>
        <span
          aria-hidden
          className="grid size-8 place-items-center rounded-lg bg-muted text-text-muted"
        >
          <Icon className="size-4" />
        </span>
      </CardHeader>
      <CardContent className="space-y-1">
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="mt-2 h-3 w-28" />
          </>
        ) : (
          <>
            <div className="flex items-baseline gap-1.5">{value}</div>
            <Text size="caption" tone="muted" numeric>
              {hint}
            </Text>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard', 'me'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/stats?userId=me');
      if (!res.ok) throw new Error('Failed to load dashboard stats');
      return res.json();
    },
  });

  const patternStats = stats?.totalsByKind?.find(t => t.kind === 'pattern');
  const totalCompleted = stats?.totalsByKind?.reduce((s, t) => s + t.completed, 0) ?? 0;
  const totalProblems = stats?.totalsByKind?.reduce((s, t) => s + t.total, 0) ?? 0;
  const actionsTotal = stats?.heatmap?.reduce((s, d) => s + d.count, 0) ?? 0;

  // For group progress bars, we need per-group data from progress endpoint
  const { data: patternProgress } = useQuery({
    queryKey: ['problems', 'progress', 'pattern'],
    queryFn: async () => {
      const res = await fetch('/api/problems/progress?kind=pattern');
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!stats,
  });

  return (
    <div className="space-y-6">
      <PageHeading
        overline="Overview"
        title="Dashboard"
        description="Your placement prep at a glance"
      />

      {/* Stats Cards */}
      <div className="animate-in-up grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Problems Solved"
          icon={Code2}
          isLoading={isLoading}
          value={<Metric>{totalCompleted}</Metric>}
          hint={`of ${totalProblems} total`}
        />

        <StatCard
          label="Pattern DSA"
          icon={Trophy}
          isLoading={isLoading}
          value={
            <Metric>
              {patternStats ? `${patternStats.completed}/${patternStats.total}` : '0/0'}
            </Metric>
          }
          hint="completed"
        />

        <StatCard
          label="Difficulty Mix"
          icon={TrendingUp}
          isLoading={isLoading}
          value={
            <>
              <Metric>{stats?.difficultyMix.Hard ?? 0}</Metric>
              <Text as="span" size="compact" tone="muted" weight="medium">
                Hard
              </Text>
            </>
          }
          hint={`${stats?.difficultyMix.Easy ?? 0}E · ${stats?.difficultyMix.Medium ?? 0}M · ${stats?.difficultyMix.Hard ?? 0}H`}
        />

        <StatCard
          label="90d Activity"
          icon={Activity}
          isLoading={isLoading}
          value={<Metric>{actionsTotal}</Metric>}
          hint="total actions"
        />
      </div>

      {/* Charts Row 1: Trend + Activity Feed */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="min-w-0 lg:col-span-4">
          <CardHeader>
            <CardTitle>Completion Trend</CardTitle>
            <CardDescription>Problems completed per day, last 90 days</CardDescription>
          </CardHeader>
          <CardContent className="min-w-0">
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <CompletionTrend data={stats?.trend ?? []} />
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your last 10 actions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonRows rows={5} />
            ) : (
              <ActivityFeed events={stats?.recent ?? []} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: Group Progress + Difficulty Mix */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="min-w-0 lg:col-span-4">
          <CardHeader>
            <CardTitle>Pattern Progress</CardTitle>
            <CardDescription>Completed vs. remaining per pattern</CardDescription>
          </CardHeader>
          <CardContent className="min-w-0">
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <GroupProgress data={patternProgress ?? []} />
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0 lg:col-span-3">
          <CardHeader>
            <CardTitle>Difficulty Mix</CardTitle>
            <CardDescription>Completed problems by difficulty</CardDescription>
          </CardHeader>
          <CardContent className="min-w-0">
            {isLoading ? (
              <Skeleton className="h-[120px] w-full" />
            ) : (
              <DifficultyMix data={stats?.difficultyMix ?? {}} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Heatmap */}
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Activity Heatmap</CardTitle>
          <CardDescription>90-day activity grid</CardDescription>
        </CardHeader>
        <CardContent className="min-w-0">
          {isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <ActivityHeatmap data={stats?.heatmap ?? []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
