'use client';

import { useQuery } from '@tanstack/react-query';
import { Code2, BookOpen, Trophy, Activity, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Your placement prep at a glance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Problems Solved</CardTitle>
            <Code2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '—' : totalCompleted}</div>
            <p className="text-xs text-muted-foreground">of {totalProblems} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pattern DSA</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '—' : patternStats ? `${patternStats.completed}/${patternStats.total}` : '0/0'}
            </div>
            <p className="text-xs text-muted-foreground">completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Difficulty Mix</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '—' : `${stats?.difficultyMix.Hard ?? 0} Hard`}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.difficultyMix.Easy ?? 0}E · {stats?.difficultyMix.Medium ?? 0}M · {stats?.difficultyMix.Hard ?? 0}H
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">90d Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '—' : actionsTotal}</div>
            <p className="text-xs text-muted-foreground">total actions</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1: Trend + Activity Feed */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Completion Trend</CardTitle>
            <CardDescription>Problems completed per day, last 90 days</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[200px] bg-muted animate-pulse rounded-lg" />
            ) : (
              <CompletionTrend data={stats?.trend ?? []} />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your last 10 actions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : (
              <ActivityFeed events={stats?.recent ?? []} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: Group Progress + Difficulty Mix */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Pattern Progress</CardTitle>
            <CardDescription>Completed vs. remaining per pattern</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[200px] bg-muted animate-pulse rounded-lg" />
            ) : (
              <GroupProgress data={patternProgress ?? []} />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Difficulty Mix</CardTitle>
            <CardDescription>Completed problems by difficulty</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? (
              <div className="h-[120px] bg-muted animate-pulse rounded-lg" />
            ) : (
              <DifficultyMix data={stats?.difficultyMix ?? {}} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Heatmap</CardTitle>
          <CardDescription>90-day activity grid</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-16 bg-muted animate-pulse rounded-lg" />
          ) : (
            <ActivityHeatmap data={stats?.heatmap ?? []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
