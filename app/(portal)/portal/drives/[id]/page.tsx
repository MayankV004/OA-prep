'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Radio,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Users,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  Calendar,
  AlertTriangle,
  Play,
  StopCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/admin/DataTable';

interface SubmissionItem {
  _id: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  scorePercentage: number;
  totalScore: number;
  durationSeconds: number;
  integrityVerdict: 'clean' | 'suspicious' | 'flagged';
  cheatingRiskPercentage: number;
  infractionsCount: number;
  userId?: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  createdAt: string;
  completedAt?: string;
}

export default function PortalLiveInvigilationPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(props.params);
  const searchParams = useSearchParams();
  const instId = searchParams.get('institutionId');
  const queryClient = useQueryClient();

  const buildHref = (path: string) => (instId ? `${path}?institutionId=${instId}` : path);

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['portal-drive-invigilation', id, instId],
    queryFn: async () => {
      const url = instId
        ? `/api/portal/drives/${id}?institutionId=${instId}`
        : `/api/portal/drives/${id}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load drive monitoring data');
      return res.json();
    },
    refetchInterval: (query) => {
      const status = query.state.data?.drive?.status;
      return status === 'live' ? 8000 : 30000;
    },
  });

  const updateDriveMutation = useMutation({
    mutationFn: async (payload: { status?: string; durationMinutes?: number }) => {
      const url = instId
        ? `/api/portal/drives/${id}?institutionId=${instId}`
        : `/api/portal/drives/${id}`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update drive');
      return json;
    },
    onSuccess: () => {
      toast.success('Drive updated');
      queryClient.invalidateQueries({ queryKey: ['portal-drive-invigilation', id, instId] });
      queryClient.invalidateQueries({ queryKey: ['portal-drives', instId] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Update failed');
    },
  });

  const drive = data?.drive;
  const metrics = data?.metrics;
  const submissions: SubmissionItem[] = data?.submissions || [];

  const columns: Column<SubmissionItem>[] = [
    {
      id: 'candidate',
      header: 'Student Candidate',
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold uppercase">
            {row.userId?.name?.substring(0, 2) || row.userId?.email?.substring(0, 2) || 'ST'}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-foreground truncate">
              {row.userId?.name || 'Anonymous Student'}
            </div>
            <div className="text-[11px] text-muted-foreground truncate">{row.userId?.email}</div>
          </div>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Test Status',
      cell: (row) =>
        row.status === 'in_progress' ? (
          <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-500 text-[10px] animate-pulse">
            <Radio className="mr-1 h-2 w-2" /> IN PROGRESS
          </Badge>
        ) : (
          <Badge variant="outline" className="border-muted bg-muted/20 text-muted-foreground text-[10px]">
            COMPLETED
          </Badge>
        ),
    },
    {
      id: 'score',
      header: 'Score',
      cell: (row) => (
        <div className="text-xs font-mono">
          <span className="font-semibold text-foreground">{row.scorePercentage ?? 0}%</span>
          <span className="text-[10px] text-muted-foreground ml-1">({row.totalScore ?? 0} pts)</span>
        </div>
      ),
    },
    {
      id: 'integrity',
      header: 'Integrity Verdict',
      cell: (row) => {
        const variants: Record<string, string> = {
          clean: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500',
          suspicious: 'border-amber-500/40 bg-amber-500/10 text-amber-500',
          flagged: 'border-rose-500/40 bg-rose-500/10 text-rose-500',
        };
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn('text-[10px] uppercase font-mono', variants[row.integrityVerdict])}>
              {row.integrityVerdict || 'CLEAN'}
            </Badge>
            {row.cheatingRiskPercentage > 30 && (
              <span className="text-[10px] font-mono text-rose-400">
                {row.cheatingRiskPercentage}% Risk
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'time',
      header: 'Time Elapsed',
      cell: (row) => {
        const mins = Math.floor((row.durationSeconds || 0) / 60);
        const secs = (row.durationSeconds || 0) % 60;
        return (
          <span className="text-xs font-mono text-muted-foreground">
            {mins}m {secs}s
          </span>
        );
      },
    },
  ];

  if (isLoading || !drive) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-muted-foreground">
        Connecting to live invigilation room...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center gap-2">
        <Link href={buildHref('/portal/drives')}>
          <Button variant="ghost" size="sm" className="-ml-2 text-xs text-muted-foreground">
            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to Drives
          </Button>
        </Link>
      </div>

      {/* Invigilation Room Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{drive.title}</h1>
            {drive.status === 'live' && (
              <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-500 text-xs animate-pulse">
                <Radio className="mr-1 h-3 w-3" /> LIVE ROOM
              </Badge>
            )}
            {drive.status === 'scheduled' && (
              <Badge variant="outline" className="border-blue-500/40 bg-blue-500/10 text-blue-500 text-xs">
                SCHEDULED
              </Badge>
            )}
            {drive.status === 'completed' && (
              <Badge variant="outline" className="text-xs">
                CONCLUDED
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Assessment: <strong className="text-foreground">{drive.assessmentId?.title || 'Custom Test'}</strong> • Duration: {drive.durationMinutes} mins • Passing: {drive.assessmentId?.passingPercentage || 60}%
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching || isLoading}
            className="text-xs"
          >
            <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5', (isRefetching || isLoading) && 'animate-spin')} />
            Refresh Roster
          </Button>

          {drive.status === 'scheduled' && (
            <Button
              size="sm"
              onClick={() => updateDriveMutation.mutate({ status: 'live' })}
              disabled={updateDriveMutation.isPending}
              className="text-xs"
            >
              <Play className="mr-1.5 h-3.5 w-3.5 fill-current" />
              Force Start Drive
            </Button>
          )}

          {drive.status === 'live' && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-amber-500/40 text-amber-500 hover:bg-amber-500/10"
                onClick={() => updateDriveMutation.mutate({ durationMinutes: drive.durationMinutes + 15 })}
                disabled={updateDriveMutation.isPending}
              >
                +15m Extra Time
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-rose-500/40 text-rose-500 hover:bg-rose-500/10"
                onClick={() => updateDriveMutation.mutate({ status: 'completed' })}
                disabled={updateDriveMutation.isPending}
              >
                <StopCircle className="mr-1.5 h-3.5 w-3.5" />
                Conclude Round
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Radio className="h-4 w-4 text-emerald-500" />
              Active Test Takers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {metrics?.activeCount ?? 0}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Currently coding in sandbox</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
              Submitted Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {metrics?.completedCount ?? 0}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Completed round submissions</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-500" />
              Proctoring Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-rose-400">
              {metrics?.flaggedCount ?? 0}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Biometric & tab breach events</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Testing Window
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold">
              {format(new Date(drive.startsAt), 'h:mm a')} – {format(new Date(drive.endsAt), 'h:mm a')}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{drive.durationMinutes} min limit per candidate</p>
          </CardContent>
        </Card>
      </div>

      {/* Live Roster DataTable */}
      <div className="space-y-2">
        <h2 className="text-base font-semibold">Candidate Live Roster ({submissions.length})</h2>
        <DataTable
          columns={columns}
          data={submissions}
          getRowId={(row) => row._id}
          loading={isLoading}
          emptyTitle="No candidates registered in this drive"
          emptyDescription="Students will appear here in real-time as they launch their test."
          exportable
          exportFilename={`invigilation_roster_${drive.title.replace(/\s+/g, '_')}`}
          columnVisibility
        />
      </div>
    </div>
  );
}
