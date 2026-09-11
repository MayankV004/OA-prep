'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Award,
  Download,
  Filter,
  Users,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Search,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/admin/DataTable';

interface ScorecardRow {
  rank: number;
  id: string;
  candidateName: string;
  candidateEmail: string;
  college: string;
  driveTitle: string;
  scorePercentage: number;
  totalScore: number;
  passed: boolean;
  durationSeconds: number;
  integrityVerdict: 'clean' | 'suspicious' | 'flagged';
  cheatingRiskPercentage: number;
  submittedAt: string;
}

export default function PortalResultsPage() {
  const searchParams = useSearchParams();
  const instId = searchParams.get('institutionId');

  const [selectedDrive, setSelectedDrive] = useState('all');
  const [search, setSearch] = useState('');

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['portal-results', instId, selectedDrive],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (instId) params.set('institutionId', instId);
      if (selectedDrive !== 'all') params.set('driveId', selectedDrive);
      const res = await fetch(`/api/portal/results?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load scorecards');
      return res.json();
    },
  });

  const results: ScorecardRow[] = data?.results || [];
  const drives: Array<{ id: string; title: string }> = data?.drives || [];

  const filteredResults = results.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.candidateName.toLowerCase().includes(q) ||
      r.candidateEmail.toLowerCase().includes(q) ||
      r.driveTitle.toLowerCase().includes(q)
    );
  });

  const total = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const passRate = total > 0 ? Math.round((passedCount / total) * 100) : 0;
  const avgScore = total > 0 ? Math.round(results.reduce((acc, r) => acc + r.scorePercentage, 0) / total) : 0;
  const cleanCount = results.filter((r) => r.integrityVerdict === 'clean').length;
  const cleanRate = total > 0 ? Math.round((cleanCount / total) * 100) : 100;

  const columns: Column<ScorecardRow>[] = [
    {
      id: 'rank',
      header: 'Rank',
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-muted-foreground">
          #{row.rank}
        </span>
      ),
    },
    {
      id: 'candidate',
      header: 'Student Candidate',
      cell: (row) => (
        <div>
          <div className="text-xs font-semibold text-foreground">{row.candidateName}</div>
          <div className="text-[11px] text-muted-foreground">{row.candidateEmail}</div>
        </div>
      ),
    },
    {
      id: 'drive',
      header: 'Placement Drive',
      cell: (row) => (
        <span className="text-xs text-foreground truncate max-w-[200px] block">
          {row.driveTitle}
        </span>
      ),
    },
    {
      id: 'score',
      header: 'Score & Qualification',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="text-xs font-mono font-bold">{row.scorePercentage}%</div>
          {row.passed ? (
            <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-500 text-[10px]">
              <CheckCircle2 className="mr-1 h-2.5 w-2.5" /> PASSED
            </Badge>
          ) : (
            <Badge variant="outline" className="border-rose-500/40 bg-rose-500/10 text-rose-500 text-[10px]">
              <XCircle className="mr-1 h-2.5 w-2.5" /> BELOW CUTOFF
            </Badge>
          )}
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
          <Badge variant="outline" className={cn('text-[10px] uppercase font-mono', variants[row.integrityVerdict])}>
            {row.integrityVerdict || 'CLEAN'}
          </Badge>
        );
      },
    },
    {
      id: 'duration',
      header: 'Duration',
      cell: (row) => {
        const mins = Math.floor((row.durationSeconds || 0) / 60);
        return <span className="text-xs font-mono text-muted-foreground">{mins} mins</span>;
      },
    },
    {
      id: 'date',
      header: 'Completed At',
      cell: (row) => (
        <span className="text-[11px] text-muted-foreground">
          {format(new Date(row.submittedAt), 'MMM d, yyyy h:mm a')}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Candidate Scorecards & Placement Leaderboard
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Standardized evaluation results, passing qualification cutoffs, and integrity audits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching || isLoading}
            className="text-xs"
          >
            <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5', (isRefetching || isLoading) && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Total Evaluated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{total}</div>
            <p className="mt-1 text-xs text-muted-foreground">Submissions evaluated</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Pass Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-emerald-400">{passRate}%</div>
            <p className="mt-1 text-xs text-muted-foreground">{passedCount} students qualified</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4 text-blue-500" />
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{avgScore}%</div>
            <p className="mt-1 text-xs text-muted-foreground">Cohort performance mean</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-500" />
              Honor Code Integrity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-emerald-400">{cleanRate}%</div>
            <p className="mt-1 text-xs text-muted-foreground">Clean proctoring clearance</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates by student name, email, or drive..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
        <select
          value={selectedDrive}
          onChange={(e) => setSelectedDrive(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-xs"
        >
          <option value="all">All Placement Drives</option>
          {drives.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </select>
      </div>

      {/* DataTable with CSV Export */}
      <DataTable
        columns={columns}
        data={filteredResults}
        getRowId={(row) => row.id}
        loading={isLoading}
        emptyTitle="No scorecard records found"
        emptyDescription="Candidate scores will populate as students conclude their tests."
        exportable
        exportFilename="campus_placement_scorecards"
        columnVisibility
      />
    </div>
  );
}
