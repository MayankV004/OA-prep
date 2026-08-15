'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Blocks, ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

import { DataTable, type Column } from '@/components/admin/DataTable';
import { SlideOver } from '@/components/admin/SlideOver';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { PageHeading, Text } from '@/components/ui/typography';

interface Pattern {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  useCases?: string[];
  concept?: string;
  templateCode?: string;
  explanation?: string;
  variations?: any[];
  createdAt: string;
}

type PatternFormState = {
  title: string;
  slug: string;
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  useCases: string;
  concept: string;
  templateCode: string;
  explanation: string;
};

const EMPTY_FORM: PatternFormState = {
  title: '',
  slug: '',
  description: '',
  timeComplexity: '',
  spaceComplexity: '',
  useCases: '',
  concept: '',
  templateCode: '',
  explanation: '',
};

function relative(value?: string) {
  if (!value) return '—';
  try {
    return formatDistanceToNow(parseISO(value), { addSuffix: true });
  } catch {
    return '—';
  }
}

export default function AdminPatternsPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [search, setSearch] = useState('');

  // Panel state: null = closed, 'new' = create, otherwise the slug being edited.
  const [panelSlug, setPanelSlug] = useState<string | null>(null);
  const [form, setForm] = useState<PatternFormState>(EMPTY_FORM);
  const [confirming, setConfirming] = useState<Pattern | null>(null);
  const [bulkConfirm, setBulkConfirm] = useState<{
    slugs: string[];
    clear: () => void;
  } | null>(null);

  const isCreating = panelSlug === 'new';
  const isEditing = Boolean(panelSlug) && !isCreating;

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'patterns'],
    queryFn: async () => {
      const res = await fetch(`/api/admin/content/patterns`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  const patterns: Pattern[] = (data?.data || []).filter((p: any) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  // Full record for the row being edited — PUT is a full replace, so the form
  // has to be seeded from the server copy and sent back whole.
  const { data: detail, isFetching: detailLoading } = useQuery<Pattern>({
    queryKey: ['admin', 'patterns', panelSlug],
    queryFn: async () => {
      const res = await fetch(`/api/admin/content/patterns/${panelSlug}`);
      if (!res.ok) throw new Error('Failed to load pattern');
      return res.json();
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (isCreating) {
      setForm(EMPTY_FORM);
      return;
    }
    if (isEditing && detail) {
      setForm({
        title: detail.title ?? '',
        slug: detail.slug ?? '',
        description: detail.description ?? '',
        timeComplexity: detail.timeComplexity ?? '',
        spaceComplexity: detail.spaceComplexity ?? '',
        useCases: (detail.useCases ?? []).join(', '),
        concept: detail.concept ?? '',
        templateCode: detail.templateCode ?? '',
        explanation: detail.explanation ?? '',
      });
    }
  }, [detail, isCreating, isEditing]);

  const closePanel = () => setPanelSlug(null);

  const buildPayload = () => ({
    title: form.title.trim(),
    slug: form.slug.trim(),
    description: form.description,
    timeComplexity: form.timeComplexity,
    spaceComplexity: form.spaceComplexity,
    useCases: form.useCases
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    concept: form.concept,
    templateCode: form.templateCode,
    explanation: form.explanation,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/content/patterns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? 'Failed to create pattern');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'patterns'] });
      toast.add('Pattern created', {
        description: form.title,
        type: 'success',
      });
      closePanel();
    },
    onError: (err: unknown) => {
      toast.add("Couldn't create pattern", {
        description: err instanceof Error ? err.message : undefined,
        type: 'error',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      // PUT is a full replace — carry the variations we fetched back untouched.
      const res = await fetch(`/api/admin/content/patterns/${panelSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...buildPayload(),
          variations: detail?.variations ?? [],
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? 'Failed to save pattern');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'patterns'] });
      toast.add('Pattern saved', { description: form.title, type: 'success' });
      closePanel();
    },
    onError: (err: unknown) => {
      toast.add("Couldn't save pattern", {
        description: err instanceof Error ? err.message : undefined,
        type: 'error',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (slug: string) => {
      const res = await fetch(`/api/admin/content/patterns/${slug}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? 'Failed to delete pattern');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'patterns'] });
      toast.add('Pattern deleted', { type: 'success' });
      setConfirming(null);
    },
    onError: (err: unknown) => {
      toast.add("Couldn't delete pattern", {
        description: err instanceof Error ? err.message : undefined,
        type: 'error',
      });
    },
  });

  // TODO: backend — bulk endpoint would replace this client-side loop
  const bulkDeleteMutation = useMutation({
    mutationFn: async (slugs: string[]) => {
      const results = await Promise.allSettled(
        slugs.map(async (slug) => {
          const res = await fetch(`/api/admin/content/patterns/${slug}`, { method: 'DELETE' });
          if (!res.ok) throw new Error(slug);
        })
      );
      return {
        succeeded: results.filter((r) => r.status === 'fulfilled').length,
        failed: results.filter((r) => r.status === 'rejected').length,
      };
    },
    onSuccess: ({ succeeded, failed }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'patterns'] });
      toast.add(`${succeeded} deleted, ${failed} failed`, {
        type: failed > 0 ? 'error' : 'success',
      });
      bulkConfirm?.clear();
      setBulkConfirm(null);
    },
    onError: () => {
      toast.add("Couldn't delete the selected patterns", { type: 'error' });
    },
  });

  const columns: Column<Pattern>[] = [
    {
      id: 'title',
      header: 'Title',
      primary: true,
      sortValue: (row) => row.title,
      cell: (row) => (
        <div className="min-w-0">
          <span className="block truncate font-medium text-foreground" title={row.title}>
            {row.title}
          </span>
          <code className="mt-0.5 block truncate font-mono text-2xs text-text-muted">
            {row.slug}
          </code>
        </div>
      ),
    },
    {
      id: 'variations',
      header: 'Variations',
      sortValue: (row) => row.variations?.length ?? 0,
      cell: (row) => (
        <Badge variant="secondary" className="tabular-nums">
          {row.variations?.length || 0}
        </Badge>
      ),
    },
    {
      id: 'complexity',
      header: 'Time',
      hideBelow: 'lg',
      sortValue: (row) => row.timeComplexity ?? null,
      cell: (row) => (
        <Text as="span" size="caption" tone="muted" className="font-mono">
          {row.timeComplexity || '—'}
        </Text>
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

  const newPatternButton = (
    <Button onClick={() => setPanelSlug('new')}>
      <Plus className="size-4" aria-hidden />
      New pattern
    </Button>
  );

  const saving = createMutation.isPending || updateMutation.isPending;
  const canSubmit = form.title.trim().length > 0 && form.slug.trim().length > 0;

  return (
    <div className="space-y-6">
      <PageHeading
        overline="Content"
        title="Patterns"
        description="DSA patterns, their templates and variations."
        actions={newPatternButton}
      />

      <DataTable
        data={patterns}
        columns={columns}
        getRowId={(row) => row._id}
        loading={isLoading}
        error={error}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search patterns…"
        emptyTitle="No patterns yet"
        emptyDescription="Create your first pattern to give learners a template to work from."
        emptyIcon={Blocks}
        emptyAction={newPatternButton}
        rowActions={(row) => (
          <div className="flex items-center justify-end gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Edit ${row.title}`}
              className="size-11 text-text-muted hover:text-foreground md:size-8"
              onClick={() => setPanelSlug(row.slug)}
            >
              <Pencil className="size-4" aria-hidden />
            </Button>
            <Link href={`/admin/content/patterns/${row.slug}`}>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Manage variations and problems for ${row.title}`}
                className="h-8 gap-1.5 text-text-muted hover:text-primary"
              >
                <ExternalLink className="size-3.5" aria-hidden />
                Manage
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Delete ${row.title}`}
              className="size-11 text-text-muted hover:text-destructive md:size-8"
              onClick={() => setConfirming(row)}
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
          </div>
        )}
        bulkActions={(ids, clear) => (
          <Button
            variant="destructive"
            size="sm"
            onClick={() =>
              setBulkConfirm({
                slugs: patterns.filter((p) => ids.includes(p._id)).map((p) => p.slug),
                clear,
              })
            }
          >
            <Trash2 className="size-3.5" aria-hidden />
            Delete
          </Button>
        )}
        pageSize={15}
      />

      <SlideOver
        open={Boolean(panelSlug)}
        onOpenChange={(open) => !open && closePanel()}
        title={isCreating ? 'New pattern' : 'Edit pattern'}
        description={
          isCreating
            ? 'Variations can be added afterwards in the full editor.'
            : 'Saving replaces the whole record — variations are carried over untouched.'
        }
        width="xl"
        footer={
          <>
            <Button variant="ghost" onClick={closePanel} disabled={saving}>
              Cancel
            </Button>
            <Button
              form="pattern-form"
              type="submit"
              loading={saving}
              disabled={!canSubmit || (isEditing && detailLoading)}
            >
              {isCreating ? 'Create pattern' : 'Save changes'}
            </Button>
          </>
        }
      >
        {isEditing && detailLoading && !detail ? (
          <div className="space-y-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <form
            id="pattern-form"
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!canSubmit) return;
              if (isCreating) createMutation.mutate();
              else updateMutation.mutate();
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pattern-title">Title</Label>
                <Input
                  id="pattern-title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Sliding Window"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pattern-slug">Slug</Label>
                <Input
                  id="pattern-slug"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="e.g. sliding_window"
                  className="font-mono"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pattern-time">Time complexity</Label>
                <Input
                  id="pattern-time"
                  value={form.timeComplexity}
                  onChange={(e) => setForm((f) => ({ ...f, timeComplexity: e.target.value }))}
                  placeholder="e.g. O(N)"
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pattern-space">Space complexity</Label>
                <Input
                  id="pattern-space"
                  value={form.spaceComplexity}
                  onChange={(e) => setForm((f) => ({ ...f, spaceComplexity: e.target.value }))}
                  placeholder="e.g. O(1)"
                  className="font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pattern-usecases">Use cases</Label>
              <Input
                id="pattern-usecases"
                value={form.useCases}
                onChange={(e) => setForm((f) => ({ ...f, useCases: e.target.value }))}
                placeholder="Subarrays, Strings"
              />
              <Text size="micro" tone="muted">
                Comma separated.
              </Text>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pattern-description">Description</Label>
              <Textarea
                id="pattern-description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pattern-concept">Concept</Label>
              <Textarea
                id="pattern-concept"
                rows={4}
                value={form.concept}
                onChange={(e) => setForm((f) => ({ ...f, concept: e.target.value }))}
                placeholder="Markdown…"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pattern-template">Template code</Label>
              <Textarea
                id="pattern-template"
                rows={8}
                value={form.templateCode}
                onChange={(e) => setForm((f) => ({ ...f, templateCode: e.target.value }))}
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pattern-explanation">Explanation</Label>
              <Textarea
                id="pattern-explanation"
                rows={4}
                value={form.explanation}
                onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
              />
            </div>

            {isEditing ? (
              <div className="rounded-lg bg-surface-sunken p-3">
                <Text size="caption" tone="muted">
                  {detail?.variations?.length || 0} variation
                  {(detail?.variations?.length || 0) === 1 ? '' : 's'} will be preserved. Edit them
                  in the{' '}
                  <Link
                    href={`/admin/content/patterns/${panelSlug}`}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    full editor
                  </Link>
                  .
                </Text>
              </div>
            ) : null}
          </form>
        )}
      </SlideOver>

      <ConfirmDialog
        open={Boolean(confirming)}
        onOpenChange={(open) => !open && setConfirming(null)}
        itemName={confirming?.title ?? 'this pattern'}
        action="delete"
        description={
          confirming ? (
            <>
              This will delete{' '}
              <span className="font-medium text-foreground">{confirming.title}</span> and its{' '}
              {confirming.variations?.length || 0} variation
              {(confirming.variations?.length || 0) === 1 ? '' : 's'}. This action cannot be undone.
            </>
          ) : undefined
        }
        pending={deleteMutation.isPending}
        onConfirm={() => confirming && deleteMutation.mutate(confirming.slug)}
      />

      <ConfirmDialog
        open={Boolean(bulkConfirm)}
        onOpenChange={(open) => !open && setBulkConfirm(null)}
        itemName={`${bulkConfirm?.slugs.length ?? 0} patterns`}
        action="delete"
        confirmLabel="Yes, delete all"
        description={`This will permanently delete ${bulkConfirm?.slugs.length ?? 0} patterns and all of their variations. This action cannot be undone.`}
        pending={bulkDeleteMutation.isPending}
        onConfirm={() => bulkConfirm && bulkDeleteMutation.mutate(bulkConfirm.slugs)}
      />
    </div>
  );
}
