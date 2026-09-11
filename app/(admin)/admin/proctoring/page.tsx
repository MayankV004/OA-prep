'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { formatDistanceToNow, parseISO } from 'date-fns';
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileCheck2,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Users,
} from 'lucide-react';

import { DataTable, type Column } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeading, Text, Metric } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

interface SubmissionItem {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  assessmentId?: {
    _id: string;
    title: string;
    company: string;
    difficulty: string;
    slug: string;
  };
  status: string;
  startedAt: string;
  submittedAt?: string;
  totalScore: number;
  maxScore: number;
  passed: boolean;
  cheatingRiskPercentage: number;
  integrityVerdict: 'clean' | 'suspicious' | 'flagged';
  multipleFacesCount: number;
  faceAbsenceCount: number;
  prohibitedObjectCount: number;
  voiceInterruptionCount: number;
  tabSwitchCount: number;
  gazeDivertedCount: number;
  createdAt: string;
}

function relative(value?: string) {
  if (!value) return '—';
  try {
    return formatDistanceToNow(parseISO(value), { addSuffix: true });
  } catch {
    return '—';
  }
}

function RiskBadge({ percentage }: { percentage: number }) {
  if (percentage >= 65) {
    return (
      <Badge variant="secondary" className="bg-destructive/15 text-destructive font-mono font-bold text-xs gap-1">
        <ShieldAlert className="size-3" />
        {percentage}% High Risk
      </Badge>
    );
  }
  if (percentage >= 35) {
    return (
      <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono font-bold text-xs gap-1">
        <AlertTriangle className="size-3" />
        {percentage}% Suspicious
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs gap-1">
      <ShieldCheck className="size-3" />
      {percentage}% Clean
    </Badge>
  );
}

function MetricSummaryCard({
  label,
  value,
  sub,
  tone = 'default',
}: {
  label: string;
  value: number;
  sub: string;
  tone?: 'default' | 'danger' | 'warning' | 'success';
}) {
  const toneClasses = {
    default: 'border-border/60 bg-card',
    danger: 'border-destructive/30 bg-destructive/5',
    warning: 'border-amber-500/30 bg-amber-500/5',
    success: 'border-emerald-500/30 bg-emerald-500/5',
  }[tone];

  return (
    <Card className={cn('rounded-2xl shadow-xs', toneClasses)}>
      <CardContent className="p-4 space-y-1">
        <Text size="micro" tone="muted" weight="semibold" className="uppercase tracking-wider">
          {label}
        </Text>
        <Metric className="font-bold">
          {value}
        </Metric>
        <Text size="caption" tone="muted">
          {sub}
        </Text>
      </CardContent>
    </Card>
  );
}

export default function AdminProctoringPage() {
  const [search, setSearch] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<string>('all');

  const { data, isLoading, error, refetch, isRefetching } = useQuery<{
    data: SubmissionItem[];
    stats: {
      total: number;
      flaggedCount: number;
      suspiciousCount: number;
      cleanCount: number;
    };
  }>({
    queryKey: ['admin', 'proctoring', verdictFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '100' });
      if (verdictFilter !== 'all') params.set('verdict', verdictFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/proctoring?${params}`);
      if (!res.ok) throw new Error('Failed to fetch proctoring sessions');
      return res.json();
    },
  });

  const submissions = data?.data || [];
  const stats = data?.stats || {
    total: 0,
    flaggedCount: 0,
    suspiciousCount: 0,
    cleanCount: 0,
  };

  const columns: Column<SubmissionItem>[] = [
    {
      id: 'candidate',
      header: 'Candidate',
      primary: true,
      sortValue: (row) => row.userId?.name || row.userId?.email || '',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-surface-sunken border border-border/70 flex items-center justify-center font-bold text-xs text-foreground uppercase shrink-0">
            {row.userId?.name ? row.userId.name.slice(0, 2) : 'CA'}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-foreground text-sm truncate">
              {row.userId?.name || 'Anonymous Candidate'}
            </div>
            <div className="font-mono text-2xs text-muted-foreground truncate">
              {row.userId?.email || 'No email attached'}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'assessment',
      header: 'Assessment & Company',
      sortValue: (row) => row.assessmentId?.title || '',
      cell: (row) => (
        <div className="min-w-0">
          <div className="font-medium text-foreground text-xs truncate">
            {row.assessmentId?.title || 'Custom OA'}
          </div>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="font-bold text-2xs uppercase tracking-wider text-muted-foreground">
              {row.assessmentId?.company || 'General'}
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-2xs text-muted-foreground font-mono">
              {row.assessmentId?.difficulty || 'Medium'}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'risk',
      header: 'Risk Level',
      sortValue: (row) => row.cheatingRiskPercentage,
      cell: (row) => <RiskBadge percentage={row.cheatingRiskPercentage} />,
    },
    {
      id: 'infractions',
      header: 'Infraction Triggers',
      hideBelow: 'lg',
      cell: (row) => {
        const triggers = [];
        if (row.multipleFacesCount > 0) triggers.push(`${row.multipleFacesCount} Multi-Face`);
        if (row.prohibitedObjectCount > 0) triggers.push(`${row.prohibitedObjectCount} Device/Phone`);
        if (row.tabSwitchCount > 0) triggers.push(`${row.tabSwitchCount} Tab Blur`);
        if (row.faceAbsenceCount > 0) triggers.push(`${row.faceAbsenceCount} Face Loss`);

        if (triggers.length === 0) {
          return <span className="text-xs text-muted-foreground/60 italic">None logged</span>;
        }

        return (
          <div className="flex flex-wrap gap-1 max-w-[220px]">
            {triggers.slice(0, 2).map((t, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md bg-surface-sunken text-2xs font-mono font-medium border border-border/40">
                {t}
              </span>
            ))}
            {triggers.length > 2 && (
              <span className="px-1.5 py-0.5 rounded-md text-2xs text-muted-foreground">
                +{triggers.length - 2} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'score',
      header: 'Score',
      hideBelow: 'md',
      sortValue: (row) => row.totalScore,
      cell: (row) => (
        <div className="font-mono text-xs">
          <span className="font-bold text-foreground">{row.totalScore}</span>
          <span className="text-muted-foreground">/{row.maxScore || 100}</span>
          {row.passed ? (
            <span className="ml-1 text-2xs text-emerald-500 font-bold">(Passed)</span>
          ) : (
            <span className="ml-1 text-2xs text-destructive font-bold">(Failed)</span>
          )}
        </div>
      ),
    },
    {
      id: 'date',
      header: 'Attempted',
      hideBelow: 'md',
      sortValue: (row) => row.createdAt,
      cell: (row) => (
        <span className="font-mono text-xs text-muted-foreground">
          {relative(row.submittedAt || row.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeading
        overline="Command & Control"
        title="Proctoring Incident Desk"
        description="Forensic investigation suite for AI-monitored candidate assessments, dual-engine biometric alerts, and integrity dispute adjudication."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="gap-2 text-xs font-semibold"
          >
            <RefreshCw className={cn('size-3.5', isRefetching && 'animate-spin')} />
            Refresh Queue
          </Button>
        }
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricSummaryCard
          label="Total Monitored"
          value={stats.total}
          sub="Evaluated submissions"
        />
        <MetricSummaryCard
          label="Flagged Incidents"
          value={stats.flaggedCount}
          sub="Severe risk anomalies"
          tone="danger"
        />
        <MetricSummaryCard
          label="Suspicious Sessions"
          value={stats.suspiciousCount}
          sub="Requires human review"
          tone="warning"
        />
        <MetricSummaryCard
          label="Clean Sessions"
          value={stats.cleanCount}
          sub="Integrity validated"
          tone="success"
        />
      </div>

      <DataTable
        data={submissions}
        columns={columns}
        getRowId={(row) => row._id}
        loading={isLoading}
        error={error}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search candidate, email, or company…"
        emptyTitle="No proctoring incidents found"
        emptyDescription="Assessment submissions with dual-engine biometric telemetry will be listed here."
        emptyIcon={ShieldCheck}
        exportable
        exportFilename="proctoring-incidents"
        filters={
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-sunken border border-border/50">
            {['all', 'flagged', 'suspicious', 'clean'].map((v) => (
              <button
                key={v}
                onClick={() => setVerdictFilter(v)}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all',
                  verdictFilter === v
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {v}
              </button>
            ))}
          </div>
        }
        rowActions={(row) => (
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs font-semibold gap-1.5"
            render={<Link href={`/admin/proctoring/${row._id}`} />}
          >
            <Eye className="size-3.5 text-muted-foreground" />
            Audit Evidence
          </Button>
        )}
        pageSize={15}
      />
    </div>
  );
}
