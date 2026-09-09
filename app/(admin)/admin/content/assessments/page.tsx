'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ExternalLink,
  Plus,
  Timer,
  Trash2,
  Edit,
  Shield,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

import { DataTable, type Column } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SkeletonRows } from '@/components/ui/skeleton';
import { PageHeading, Text } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AssessmentRow {
  _id: string;
  title: string;
  slug: string;
  company: string;
  role: string;
  durationMinutes: number;
  passingScore: number;
  isProOnly: boolean;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  problemCount: number;
  createdAt: string;
  updatedAt: string;
}

function DifficultyBadge({ value }: { value: string }) {
  const key = value.toLowerCase();
  const tone =
    key === 'easy'
      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
      : key === 'medium'
      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
      : 'bg-red-500/15 text-red-600 dark:text-red-400';

  return (
    <Badge variant="secondary" className={cn('capitalize font-medium', tone)}>
      {value}
    </Badge>
  );
}

export default function AdminAssessmentsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [proFilter, setProFilter] = useState('all');

  const { data, isLoading, error } = useQuery<{ data: AssessmentRow[] }>({
    queryKey: ['admin', 'assessments', search, difficultyFilter, proFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (difficultyFilter !== 'all') params.set('difficulty', difficultyFilter);
      if (proFilter === 'pro') params.set('isProOnly', 'true');
      if (proFilter === 'free') params.set('isProOnly', 'false');

      const res = await fetch(`/api/admin/assessments?${params}`);
      if (!res.ok) throw new Error('Failed to fetch assessments');
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/assessments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete assessment');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Assessment removed successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'assessments'] });
    },
    onError: (err: any) => {
      toast.error('Failed to delete assessment', { description: err.message });
    },
  });

  const assessments = data?.data || [];

  const columns: Column<AssessmentRow>[] = [
    {
      id: 'company',
      header: 'Company & Role',
      primary: true,
      sortValue: (row) => row.company,
      cell: (row) => (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground truncate">{row.company}</span>
            {row.isProOnly ? (
              <Badge variant="secondary" className="bg-amber-500/15 text-amber-500 text-2xs px-1.5 py-0">
                PRO
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-500 text-2xs px-1.5 py-0">
                FREE
              </Badge>
            )}
          </div>
          <Text size="caption" tone="muted" className="truncate">
            {row.role}
          </Text>
        </div>
      ),
    },
    {
      id: 'title',
      header: 'Assessment Title',
      sortValue: (row) => row.title,
      cell: (row) => (
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="truncate font-medium text-foreground text-sm" title={row.title}>
            {row.title}
          </span>
          <a
            href={`/oa/${row.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Preview Candidate Assessment"
            className="p-1 text-muted-foreground hover:text-emerald-500 transition-colors"
          >
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      ),
    },
    {
      id: 'difficulty',
      header: 'Difficulty',
      sortValue: (row) => row.difficulty,
      cell: (row) => <DifficultyBadge value={row.difficulty} />,
    },
    {
      id: 'problems',
      header: 'Problems',
      sortValue: (row) => row.problemCount,
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-foreground/90">
          {row.problemCount} {row.problemCount === 1 ? 'task' : 'tasks'}
        </span>
      ),
    },
    {
      id: 'duration',
      header: 'Duration',
      hideBelow: 'lg',
      sortValue: (row) => row.durationMinutes,
      cell: (row) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.durationMinutes} mins
        </span>
      ),
    },
    {
      id: 'passing',
      header: 'Passing Score',
      hideBelow: 'lg',
      sortValue: (row) => row.passingScore,
      cell: (row) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.passingScore}%
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeading
        overline="Content Management"
        title="Company OA Simulations"
        description="Configure realistic, timed company online assessments, coding challenges, and test suites."
        actions={
          <Button
            size="lg"
            className="h-10 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl shadow-xs"
            render={<Link href="/admin/content/assessments/new" />}
          >
            <Plus className="size-4 mr-1.5" />
            Create Company OA
          </Button>
        }
      />

      {isLoading ? (
        <div className="rounded-xl bg-card p-4 shadow-xs">
          <SkeletonRows rows={5} />
        </div>
      ) : (
        <DataTable
          data={assessments}
          columns={columns}
          getRowId={(row) => row._id}
          loading={isLoading}
          error={error}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search company, title, or role…"
          emptyTitle="No company assessments found"
          emptyDescription="Create your first placement OA simulation to populate the candidate catalog."
          emptyIcon={Timer}
          emptyAction={
            <Button
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold"
              render={<Link href="/admin/content/assessments/new" />}
            >
              <Plus className="size-4 mr-1" />
              Create Assessment
            </Button>
          }
          filters={
            <div className="flex items-center gap-2">
              <select
                aria-label="Filter by difficulty"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="h-9 rounded-lg bg-surface-sunken px-3 text-xs sm:text-sm text-foreground outline-none border border-border/60"
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              <select
                aria-label="Filter by access tier"
                value={proFilter}
                onChange={(e) => setProFilter(e.target.value)}
                className="h-9 rounded-lg bg-surface-sunken px-3 text-xs sm:text-sm text-foreground outline-none border border-border/60"
              >
                <option value="all">All Access</option>
                <option value="free">Free Only</option>
                <option value="pro">Pro Only</option>
              </select>
            </div>
          }
          rowActions={(row) => (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2.5 text-xs text-foreground hover:text-emerald-500"
                render={<Link href={`/admin/content/assessments/${row._id}`} />}
              >
                <Edit className="size-3.5 mr-1" />
                Edit
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete "${row.title}"?`)) {
                    deleteMutation.mutate(row._id);
                  }
                }}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          )}
          pageSize={12}
        />
      )}
    </div>
  );
}
