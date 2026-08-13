'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ExternalLink, ListChecks, Sparkles, Trash2 } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

import { DataTable, type Column } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/alert-dialog';
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
  const [confirming, setConfirming] = useState<Problem | null>(null);
  const [bulkConfirm, setBulkConfirm] = useState<{
    ids: string[];
    clear: () => void;
  } | null>(null);

  const { data, isLoading, error } = useQuery<{ data: Problem[] }>({
    queryKey: ['admin', 'problems', search, kindFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '50' });
      if (search) params.set('q', search);
      if (kindFilter !== 'all') params.set('kind', kindFilter);
      // Hit the admin global content API
      const res = await fetch(`/api/admin/content/problems?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      // Always { data: [...] } from this new endpoint
      return res.json();
    },
  });

  const problems = data?.data || [];

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/problems/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? 'Failed to delete problem');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'problems'] });
      toast.add('Problem deleted', { type: 'success' });
      setConfirming(null);
    },
    onError: (err: unknown) => {
      toast.add("Couldn't delete problem", {
        description: err instanceof Error ? err.message : undefined,
        type: 'error',
      });
    },
  });

  // TODO: backend — bulk endpoint would replace this client-side loop
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map(async (id) => {
          const res = await fetch(`/api/problems/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error(id);
        })
      );
      return {
        succeeded: results.filter((r) => r.status === 'fulfilled').length,
        failed: results.filter((r) => r.status === 'rejected').length,
      };
    },
    onSuccess: ({ succeeded, failed }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'problems'] });
      toast.add(`${succeeded} deleted, ${failed} failed`, {
        type: failed > 0 ? 'error' : 'success',
      });
      bulkConfirm?.clear();
      setBulkConfirm(null);
    },
    onError: () => {
      toast.add("Couldn't delete the selected problems", { type: 'error' });
    },
  });

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
      header: 'Kind & group',
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

  const studioCta = (
    <Link href="/studio">
      <Button size="lg">
        <Sparkles className="size-4" aria-hidden />
        Open Sanity Studio
      </Button>
    </Link>
  );

  // TODO: backend — /api/admin/content/problems returns [] by design; Sanity is the source of truth
  const isEmpty = !isLoading && !error && problems.length === 0;

  return (
    <div className="space-y-6">
      <PageHeading
        overline="Content"
        title="Problems"
        description="Problem content is authored and published from Sanity Studio. This screen stays read-only until the admin API serves rows again."
        actions={studioCta}
      />

      {isLoading ? (
        <div className="rounded-xl bg-card p-3 shadow-e2">
          <SkeletonRows rows={4} />
        </div>
      ) : isEmpty ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={Sparkles}
              title="Problems are managed in Sanity Studio"
              description="The admin problems endpoint intentionally returns nothing — Sanity is the source of truth for problem content. Create, edit and publish problems there and they'll flow through to the app."
              action={studioCta}
            />
          </CardContent>
        </Card>
      ) : (
        /* Kept wired so this screen lights up automatically if the endpoint ever returns rows. */
        <DataTable
          data={problems}
          columns={columns}
          getRowId={(row) => row._id}
          loading={isLoading}
          error={error}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search problems…"
          emptyTitle="No problems found"
          emptyDescription="Problems are managed in Sanity Studio."
          emptyIcon={ListChecks}
          emptyAction={studioCta}
          filters={
            <select
              aria-label="Filter by kind"
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value)}
              className="h-9 rounded-lg bg-surface-sunken px-3 text-sm text-foreground outline-none"
            >
              <option value="all">All kinds</option>
              <option value="pattern">Pattern DSA</option>
              <option value="nonstandard">Non-standard</option>
              <option value="cp">Comp. prog.</option>
            </select>
          }
          rowActions={(row) => (
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Delete ${row.title}`}
              className="size-11 text-text-muted hover:text-destructive md:size-8"
              onClick={() => setConfirming(row)}
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
          )}
          bulkActions={(ids, clear) => (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkConfirm({ ids, clear })}
            >
              <Trash2 className="size-3.5" aria-hidden />
              Delete
            </Button>
          )}
          pageSize={15}
        />
      )}

      {isEmpty ? (
        <div className="rounded-xl bg-surface-sunken p-4">
          <Heading level="overline">Why is this empty?</Heading>
          <Text size="caption" tone="muted" className="mt-1 max-w-2xl">
            The table above is still wired to{' '}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-2xs">
              /api/admin/content/problems
            </code>
            . It currently answers with an empty list by design, so nothing renders. No action is
            needed here.
          </Text>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(confirming)}
        onOpenChange={(open) => !open && setConfirming(null)}
        itemName={confirming?.title ?? 'this problem'}
        action="delete"
        pending={deleteMutation.isPending}
        onConfirm={() => confirming && deleteMutation.mutate(confirming._id)}
      />

      <ConfirmDialog
        open={Boolean(bulkConfirm)}
        onOpenChange={(open) => !open && setBulkConfirm(null)}
        itemName={`${bulkConfirm?.ids.length ?? 0} problems`}
        action="delete"
        confirmLabel="Yes, delete all"
        description={`This will permanently delete ${bulkConfirm?.ids.length ?? 0} problems. This action cannot be undone.`}
        pending={bulkDeleteMutation.isPending}
        onConfirm={() => bulkConfirm && bulkDeleteMutation.mutate(bulkConfirm.ids)}
      />
    </div>
  );
}
