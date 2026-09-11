'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Radio,
  RefreshCw,
  Clock,
  ShieldAlert,
  Users,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  ExternalLink,
  GraduationCap,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeading, Text } from '@/components/ui/typography';
import { DataTable, type Column } from '@/components/admin/DataTable';

interface DriveTelemetryRow {
  _id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  strictProctoring: boolean;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  institutionId?: {
    _id: string;
    name: string;
    slug: string;
  };
  assessmentId?: {
    _id: string;
    title: string;
    passingPercentage: number;
  };
  activeSubmissions: number;
  completedSubmissions: number;
  flaggedSubmissions: number;
}

interface ApiResponse {
  drives: DriveTelemetryRow[];
  metrics: {
    liveCount: number;
    scheduledCount: number;
    totalAssessed: number;
    totalDrives: number;
  };
}

export default function AdminLiveDrivesPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, isLoading, isRefetching, refetch } = useQuery<ApiResponse>({
    queryKey: ['admin-live-drives', statusFilter],
    queryFn: async () => {
      const res = await fetch(`/api/admin/institutions/live-drives?status=${statusFilter}`);
      if (!res.ok) throw new Error('Failed to fetch live drives telemetry');
      return res.json();
    },
    refetchInterval: 10000, // 10s auto-refresh for live radar
  });

  const updateDriveMutation = useMutation({
    mutationFn: async (payload: { driveId: string; status?: string; durationMinutes?: number }) => {
      const res = await fetch('/api/admin/institutions/live-drives', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update drive');
      return json;
    },
    onSuccess: () => {
      toast.success('Drive status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-live-drives'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Update failed');
    },
  });

  const columns: Column<DriveTelemetryRow>[] = [
    {
      id: 'campus',
      header: 'Partner Campus',
      cell: (row) => (
        <div>
          <Link
            href={`/admin/institutions/${row.institutionId?._id}`}
            className="font-medium text-foreground hover:text-primary transition-colors block text-xs"
          >
            {row.institutionId?.name || 'Unknown Campus'}
          </Link>
          <span className="text-[11px] text-muted-foreground font-mono">
            /{row.institutionId?.slug}
          </span>
        </div>
      ),
    },
    {
      id: 'title',
      header: 'Placement Drive & Assessment',
      cell: (row) => (
        <div>
          <div className="font-medium text-xs text-foreground">{row.title}</div>
          <div className="text-[11px] text-muted-foreground">
            Test: {row.assessmentId?.title || 'Custom Test'} • {row.durationMinutes} mins
          </div>
        </div>
      ),
    },
    {
      id: 'active',
      header: 'Live Test Takers',
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'live' ? (
            <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-500 text-xs font-mono">
              <Radio className="mr-1 h-2.5 w-2.5 animate-pulse" />
              {row.activeSubmissions} taking test
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground font-mono">
              {row.activeSubmissions} active
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'completed',
      header: 'Submitted',
      cell: (row) => (
        <span className="text-xs font-mono">{row.completedSubmissions} finished</span>
      ),
    },
    {
      id: 'flagged',
      header: 'Integrity Flags',
      cell: (row) =>
        row.flaggedSubmissions > 0 ? (
          <Link href="/admin/proctoring">
            <Badge variant="outline" className="border-rose-500/40 bg-rose-500/10 text-rose-500 text-[10px]">
              <ShieldAlert className="mr-1 h-3 w-3" />
              {row.flaggedSubmissions} Flagged
            </Badge>
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground">0 incidents</span>
        ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => {
        const variants: Record<string, string> = {
          live: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500 animate-pulse',
          scheduled: 'border-blue-500/40 bg-blue-500/10 text-blue-500',
          completed: 'border-muted bg-muted/20 text-muted-foreground',
          cancelled: 'border-rose-500/40 bg-rose-500/10 text-rose-500',
        };
        return (
          <Badge variant="outline" className={cn('text-[10px] uppercase font-mono', variants[row.status])}>
            {row.status}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Emergency Controls',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          {row.status === 'scheduled' && (
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-[10px]"
              onClick={() => updateDriveMutation.mutate({ driveId: row._id, status: 'live' })}
            >
              Force Start
            </Button>
          )}
          {row.status === 'live' && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-[10px] border-amber-500/40 text-amber-500 hover:bg-amber-500/10"
                onClick={() =>
                  updateDriveMutation.mutate({
                    driveId: row._id,
                    durationMinutes: row.durationMinutes + 15,
                  })
                }
              >
                +15m
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-[10px] border-rose-500/40 text-rose-500 hover:bg-rose-500/10"
                onClick={() => updateDriveMutation.mutate({ driveId: row._id, status: 'completed' })}
              >
                Conclude
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const metrics = data?.metrics;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <PageHeading
        title="Nationwide Placement Drives Radar"
        description="Live operational telemetry across institutional cohort tests, candidate active concurrency, and real-time proctoring flags."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching || isLoading}
            >
              <RefreshCw className={cn('mr-2 h-4 w-4', (isRefetching || isLoading) && 'animate-spin')} />
              Refresh Radar
            </Button>
            <Link href="/admin/institutions">
              <Button variant="outline" size="sm">
                <GraduationCap className="mr-2 h-4 w-4" />
                All Campuses
              </Button>
            </Link>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Radio className="h-4 w-4 text-emerald-500" />
              Live Placement Drives
            </CardTitle>
            <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-500 text-[10px] animate-pulse">
              LIVE
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.liveCount ?? 0}</div>
            <p className="mt-1 text-xs text-muted-foreground">Active drives in-flight right now</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Scheduled Drives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.scheduledCount ?? 0}</div>
            <p className="mt-1 text-xs text-muted-foreground">Upcoming campus testing windows</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Total Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metrics?.totalAssessed ?? 0).toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Completed candidate assessments</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-500" />
              Incident Desk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Link href="/admin/proctoring" className="hover:underline text-rose-500">
                Review Flags
              </Link>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Proctoring AI & forensic audits</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['all', 'live', 'scheduled', 'completed'].map((st) => (
          <Button
            key={st}
            variant={statusFilter === st ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-xs capitalize"
            onClick={() => setStatusFilter(st)}
          >
            {st}
          </Button>
        ))}
      </div>

      {/* Drives Table */}
      <DataTable
        columns={columns}
        data={data?.drives || []}
        getRowId={(row) => row._id}
        loading={isLoading}
        emptyTitle="No placement drives found"
        emptyDescription="No cohort placement drives match the current filter."
        exportable
        exportFilename="bigo_live_drives_telemetry"
        columnVisibility
      />
    </div>
  );
}
