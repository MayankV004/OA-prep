'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, Trash2, Loader2, Check } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

import { DataTable, type Column } from '@/components/admin/DataTable';
import { SlideOver } from '@/components/admin/SlideOver';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { PageHeading, Text } from '@/components/ui/typography';

interface Cheatsheet {
  _id: string;
  title: string;
  slug: string;
  userId?: { name: string; email: string };
  tags: string[];
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

export default function AdminCheatsheetsPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [body, setBody] = useState('');

  const [confirming, setConfirming] = useState<Cheatsheet | null>(null);
  const [bulkConfirm, setBulkConfirm] = useState<{
    ids: string[];
    clear: () => void;
  } | null>(null);

  const { data, isLoading, error } = useQuery<{ data: Cheatsheet[] }>({
    queryKey: ['admin', 'cheatsheets', search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '50' });
      if (search) params.set('q', search);
      const res = await fetch(`/api/admin/content/cheatsheets?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  const cheatsheets = data?.data || [];

  const createMutation = useMutation({
    mutationFn: async (payload: { title: string; slug?: string; body?: string; tags?: string[] }) => {
      const res = await fetch('/api/cheatsheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const bodyRes = await res.json().catch(() => null);
        throw new Error(bodyRes?.error?.message || 'Failed to create cheat sheet');
      }
      return res.json();
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cheatsheets'] });
      toast.add('Cheat sheet created', { description: `"${created.title}" saved successfully`, type: 'success' });
      setCreateOpen(false);
      setTitle('');
      setSlug('');
      setTagsInput('');
      setBody('');
    },
    onError: (err: unknown) => {
      toast.add("Couldn't create cheat sheet", {
        description: err instanceof Error ? err.message : undefined,
        type: 'error',
      });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    createMutation.mutate({
      title: title.trim(),
      slug: slug.trim() || undefined,
      body: body.trim() || undefined,
      tags,
    });
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/cheatsheets/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const bodyRes = await res.json().catch(() => null);
        throw new Error(bodyRes?.error?.message ?? 'Failed to delete cheat sheet');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cheatsheets'] });
      toast.add('Cheat sheet deleted', { type: 'success' });
      setConfirming(null);
    },
    onError: (err: unknown) => {
      toast.add("Couldn't delete cheat sheet", {
        description: err instanceof Error ? err.message : undefined,
        type: 'error',
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map(async (id) => {
          const res = await fetch(`/api/cheatsheets/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error(id);
        })
      );
      return {
        succeeded: results.filter((r) => r.status === 'fulfilled').length,
        failed: results.filter((r) => r.status === 'rejected').length,
      };
    },
    onSuccess: ({ succeeded, failed }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cheatsheets'] });
      toast.add(`${succeeded} deleted, ${failed} failed`, {
        type: failed > 0 ? 'error' : 'success',
      });
      bulkConfirm?.clear();
      setBulkConfirm(null);
    },
    onError: () => {
      toast.add("Couldn't delete the selected cheat sheets", { type: 'error' });
    },
  });

  const columns: Column<Cheatsheet>[] = [
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
            /{row.slug}
          </code>
        </div>
      ),
    },
    {
      id: 'tags',
      header: 'Tags',
      hideBelow: 'sm',
      sortValue: (row) => row.tags?.length ?? 0,
      cell: (row) =>
        row.tags?.length ? (
          <div className="flex flex-wrap items-center justify-end gap-1 md:justify-start">
            {row.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
            {row.tags.length > 3 ? (
              <Text as="span" size="micro" tone="muted" numeric>
                +{row.tags.length - 3}
              </Text>
            ) : null}
          </div>
        ) : (
          <Text as="span" size="caption" tone="muted">
            —
          </Text>
        ),
    },
    {
      id: 'author',
      header: 'Author',
      hideBelow: 'lg',
      sortValue: (row) => row.userId?.name ?? null,
      cell: (row) =>
        row.userId ? (
          <div className="min-w-0">
            <Text as="span" size="caption" tone="primary" weight="medium" className="block truncate">
              {row.userId.name}
            </Text>
            <Text as="span" size="micro" tone="muted" className="block truncate">
              {row.userId.email}
            </Text>
          </div>
        ) : (
          <Text as="span" size="caption" tone="muted">
            Unknown
          </Text>
        ),
    },
    {
      id: 'createdAt',
      header: 'Created',
      hideBelow: 'md',
      sortValue: (row) => row.createdAt ?? null,
      cell: (row) => (
        <Text as="span" size="caption" tone="muted" numeric>
          {relative(row.createdAt)}
        </Text>
      ),
    },
  ];

  const newSheetButton = (
    <Button onClick={() => setCreateOpen(true)}>
      <Plus className="size-4" aria-hidden />
      New cheat sheet
    </Button>
  );

  return (
    <div className="space-y-6">
      <PageHeading
        overline="Content"
        title="Cheat sheets"
        description="Every cheat sheet published across all users."
        actions={newSheetButton}
      />

      <DataTable
        data={cheatsheets}
        columns={columns}
        getRowId={(row) => row._id}
        loading={isLoading}
        error={error}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search cheat sheets…"
        emptyTitle="No cheat sheets yet"
        emptyDescription="Cheat sheets created by any user will show up here."
        emptyIcon={FileText}
        emptyAction={newSheetButton}
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

      <SlideOver
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New cheat sheet"
        description="Create a new quick-reference sheet."
        width="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending || !title.trim()}
              className="gap-1.5"
            >
              {createMutation.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Check className="size-3.5" />
              )}
              Create cheat sheet
            </Button>
          </>
        }
      >
        <form className="space-y-5" onSubmit={handleCreate}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sheet-title">Title *</Label>
              <Input
                id="sheet-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Big-O Reference"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sheet-slug">Custom Slug (Optional)</Label>
              <Input
                id="sheet-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. big-o-reference"
                className="font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sheet-tags">Tags</Label>
            <Input
              id="sheet-tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="complexity, dsa, interview"
            />
            <Text size="micro" tone="muted">
              Comma separated.
            </Text>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sheet-content">Initial Content (Markdown)</Label>
            <Textarea
              id="sheet-content"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              className="font-mono text-xs"
              placeholder="# Markdown Reference…"
            />
          </div>
        </form>
      </SlideOver>

      <ConfirmDialog
        open={Boolean(confirming)}
        onOpenChange={(open) => !open && setConfirming(null)}
        itemName={confirming?.title ?? 'this cheat sheet'}
        action="delete"
        pending={deleteMutation.isPending}
        onConfirm={() => confirming && deleteMutation.mutate(confirming._id)}
      />

      <ConfirmDialog
        open={Boolean(bulkConfirm)}
        onOpenChange={(open) => !open && setBulkConfirm(null)}
        itemName={`${bulkConfirm?.ids.length ?? 0} cheat sheets`}
        action="delete"
        confirmLabel="Yes, delete all"
        description={`This will permanently delete ${bulkConfirm?.ids.length ?? 0} cheat sheets. This action cannot be undone.`}
        pending={bulkDeleteMutation.isPending}
        onConfirm={() => bulkConfirm && bulkDeleteMutation.mutate(bulkConfirm.ids)}
      />
    </div>
  );
}
