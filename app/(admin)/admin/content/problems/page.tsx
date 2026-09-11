'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ExternalLink, ListChecks } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

import { DataTable, type Column } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonRows } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { Heading, PageHeading, Text } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

interface Problem {
  _id: string;
  title: string;
  url: string;
  difficulty: string;
  kind: string;
  pattern?: string;
  bucket?: string;
  platform?: string;
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

/** Difficulty is never colour-only — the label always rides along in the badge. */
function DifficultyBadge({ value }: { value?: string }) {
  const key = (value ?? '').toLowerCase();
  const tone =
    key === 'easy'
      ? 'bg-success-muted text-success'
      : key === 'medium'
        ? 'bg-warning-muted text-warning'
        : key === 'hard'
          ? 'bg-danger-muted text-destructive'
          : 'bg-muted text-text-secondary';

  return (
    <Badge variant="secondary" className={cn('capitalize', tone)}>
      {value || 'Unrated'}
    </Badge>
  );
}

export default function AdminProblemsPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState('all');
  const [patternFilter, setPatternFilter] = useState('all');

  const { data, isLoading, error } = useQuery<{ data: Problem[] }>({
    queryKey: ['admin', 'problems', search, kindFilter, patternFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: 'all' });
      if (search) params.set('q', search);
      if (kindFilter !== 'all') params.set('kind', kindFilter);
      if (patternFilter !== 'all') params.set('pattern', patternFilter);
      // Hit the admin global content API
      const res = await fetch(`/api/admin/content/problems?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  const problems = data?.data || [];
  const columns: Column<Problem>[] = [
    {
      id: 'title',
      header: 'Title',
      primary: true,
      sortValue: (row) => row.title,
      cell: (row) => (
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="truncate font-medium text-foreground" title={row.title}>
            {row.title}
          </span>
          {row.url ? (
            <a
              href={row.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${row.title} in a new tab`}
              className="press grid size-7 shrink-0 place-items-center rounded-md text-text-muted outline-none hover:bg-muted hover:text-foreground"
            >
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          ) : null}
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
      id: 'kind',
      header: 'Kind & Category',
      hideBelow: 'lg',
      sortValue: (row) => row.kind,
      cell: (row) => (
        <div className="flex min-w-0 items-baseline gap-1.5">
          <Text as="span" size="caption" tone="secondary" weight="medium" className="capitalize">
            {row.kind}
          </Text>
          {row.pattern || row.bucket || row.platform ? (
            <Text as="span" size="micro" tone="muted" className="truncate">
              {row.pattern || row.bucket || row.platform}
            </Text>
          ) : null}
        </div>
      ),
    },
    {
      id: 'createdAt',
      header: 'Added',
      hideBelow: 'md',
      sortValue: (row) => row.createdAt ?? null,
      cell: (row) => (
        <Text as="span" size="caption" tone="muted" numeric>
          {relative(row.createdAt)}
        </Text>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeading
        overline="Content"
        title={`Problems Catalog (${problems.length})`}
        description="Comprehensive repository of pattern DSA problems, non-standard challenges, and competitive programming problems."
      />

      {isLoading ? (
        <div className="rounded-xl bg-card p-3 shadow-e2">
          <SkeletonRows rows={4} />
        </div>
      ) : (
        <DataTable
          data={problems}
          columns={columns}
          getRowId={(row) => row._id}
          loading={isLoading}
          error={error}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search all problems by title…"
          emptyTitle="No problems found"
          emptyDescription="Try adjusting search or category filters."
          emptyIcon={ListChecks}
          filters={
            <div className="flex items-center gap-2">
              <select
                aria-label="Filter by kind"
                value={kindFilter}
                onChange={(e) => {
                  setKindFilter(e.target.value);
                  if (e.target.value !== 'pattern' && e.target.value !== 'all') {
                    setPatternFilter('all');
                  }
                }}
                className="h-9 rounded-lg bg-surface-sunken px-3 text-sm text-foreground outline-none border border-border/40"
              >
                <option value="all">All problem kinds</option>
                <option value="pattern">Pattern DSA</option>
                <option value="nonstandard">Non-standard problems</option>
                <option value="cp">Competitive programming</option>
              </select>

              {(kindFilter === 'all' || kindFilter === 'pattern') && (
                <select
                  aria-label="Filter by pattern"
                  value={patternFilter}
                  onChange={(e) => setPatternFilter(e.target.value)}
                  className="h-9 rounded-lg bg-surface-sunken px-3 text-sm text-foreground outline-none border border-border/40"
                >
                  <option value="all">All Patterns (10)</option>
                  <option value="dynamic_programming_full">Dynamic Programming</option>
                  <option value="binary_search">Binary Search</option>
                  <option value="graph_algorithms">Graph Algorithms</option>
                  <option value="trees">Trees</option>
                  <option value="backtracking">Backtracking</option>
                  <option value="prefix_sum">Prefix Sum</option>
                  <option value="monotonic_stack">Monotonic Stack</option>
                  <option value="greedy_algorithms">Greedy Algorithms</option>
                  <option value="overlapping_intervals">Overlapping Intervals</option>
                  <option value="segment_tree">Segment Tree</option>
                </select>
              )}
            </div>
          }
          pageSize={25}
          exportable
          exportFilename="bigo_complete_problems_catalog"
          columnVisibility
        />
      )}
    </div>
  );
}
