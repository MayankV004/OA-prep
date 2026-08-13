'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Archive, Edit2, Plus, Tags } from 'lucide-react';

import { DataTable, type Column } from '@/components/admin/DataTable';
import { SlideOver } from '@/components/admin/SlideOver';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTab } from '@/components/ui/tabs';
import { PageHeading, Text } from '@/components/ui/typography';
import { useToast } from '@/components/ui/toast';

interface Taxonomy {
  _id: string;
  name: string;
  slug: string;
  kind: string;
  order?: number;
  icon?: string;
  createdAt: string;
}

const KIND_TABS = ['all', 'pattern', 'subject', 'group', 'platform', 'bucket'] as const;

const KIND_LABEL: Record<string, string> = {
  pattern: 'Pattern (DSA)',
  subject: 'Subject',
  group: 'Group',
  platform: 'Platform (CP)',
  bucket: 'Bucket (Non-std)',
};

const SELECT_CLASS =
  'h-11 w-full appearance-none rounded-lg bg-surface-sunken px-3 text-sm text-foreground outline-none transition-shadow focus-visible:shadow-glow';

/** Fields the PATCH endpoint accepts from this form. */
type EditForm = { name: string; slug: string; order: string; icon: string };

function toForm(tax: Taxonomy): EditForm {
  return {
    name: tax.name ?? '',
    slug: tax.slug ?? '',
    order: tax.order == null ? '' : String(tax.order),
    icon: tax.icon ?? '',
  };
}

export default function AdminTaxonomiesPage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [kindFilter, setKindFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newKind, setNewKind] = useState('pattern');

  const [editing, setEditing] = useState<Taxonomy | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Taxonomy | null>(null);

  const { data: taxonomies = [], isLoading, error } = useQuery<Taxonomy[]>({
    queryKey: ['admin', 'taxonomies', kindFilter],
    queryFn: async () => {
      const url = kindFilter === 'all' ? '/api/admin/taxonomies' : `/api/admin/taxonomies?kind=${kindFilter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch');
      // The API returns an array directly because it returns await Taxonomy.find() inside withRole which does Response.json(result)
      return res.json();
    },
  });

  const rows = useMemo(() => {
    const list = Array.isArray(taxonomies) ? taxonomies : [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (tax) =>
        tax.name.toLowerCase().includes(q) ||
        tax.slug.toLowerCase().includes(q) ||
        tax.kind.toLowerCase().includes(q)
    );
  }, [taxonomies, search]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/taxonomies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, kind: newKind }),
      });
      if (!res.ok) {
        throw new Error(
          (await res.json().catch(() => null))?.error?.message ?? 'Failed to create'
        );
      }
    },
    onSuccess: () => {
      toast.add('Taxonomy created', {
        description: `${newName} was added under ${KIND_LABEL[newKind] ?? newKind}.`,
        type: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'taxonomies'] });
      setNewName('');
      setIsCreating(false);
    },
    onError: (e: unknown) => {
      toast.add("Couldn't create taxonomy", {
        description: e instanceof Error ? e.message : 'Unexpected error.',
        type: 'error',
      });
    },
  });

  /**
   * PATCH /api/admin/taxonomies/[id] has always existed but had no UI. Only the
   * fields the user actually changed are sent, so an untouched field is never
   * overwritten with a normalised copy of itself.
   */
  const updateMutation = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, unknown> }) => {
      const res = await fetch(`/api/admin/taxonomies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        throw new Error(
          (await res.json().catch(() => null))?.error?.message ?? 'Failed to update'
        );
      }
    },
    onSuccess: () => {
      toast.add('Taxonomy updated', { type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'taxonomies'] });
      setEditing(null);
      setEditForm(null);
    },
    onError: (e: unknown) => {
      toast.add("Couldn't update taxonomy", {
        description: e instanceof Error ? e.message : 'Unexpected error.',
        type: 'error',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/taxonomies/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error(
          (await res.json().catch(() => null))?.error?.message ?? `Archive failed (${res.status}).`
        );
      }
    },
    onSuccess: () => {
      toast.add('Taxonomy archived', {
        description: 'It is hidden from pickers but existing references are kept.',
        type: 'success',
      });
      setArchiveTarget(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'taxonomies'] });
    },
    onError: (e: unknown) => {
      toast.add("Couldn't archive taxonomy", {
        description: e instanceof Error ? e.message : 'Unexpected error.',
        type: 'error',
      });
    },
  });

  // TODO: backend — bulk endpoint would replace this client-side loop
  const bulkArchive = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map(async (id) => {
          const res = await fetch(`/api/admin/taxonomies/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error(String(res.status));
        })
      );
      const succeeded = results.filter((r) => r.status === 'fulfilled').length;
      return { succeeded, failed: results.length - succeeded };
    },
    onSuccess: ({ succeeded, failed }) => {
      toast.add(`${succeeded} succeeded, ${failed} failed`, {
        type: failed ? 'error' : 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'taxonomies'] });
    },
    onError: (e: unknown) => {
      toast.add('Bulk archive failed', {
        description: e instanceof Error ? e.message : 'Unexpected error.',
        type: 'error',
      });
    },
  });

  const openEdit = (tax: Taxonomy) => {
    setEditing(tax);
    setEditForm(toForm(tax));
  };

  const closeEdit = () => {
    setEditing(null);
    setEditForm(null);
  };

  /** Diff the form against the loaded row — only changed keys are sent. */
  const buildPatch = (): Record<string, unknown> => {
    if (!editing || !editForm) return {};
    const original = toForm(editing);
    const patch: Record<string, unknown> = {};

    if (editForm.name.trim() !== original.name) patch.name = editForm.name.trim();
    if (editForm.slug.trim() !== original.slug) patch.slug = editForm.slug.trim();
    if (editForm.order !== original.order) {
      patch.order = editForm.order === '' ? null : Number(editForm.order);
    }
    if (editForm.icon.trim() !== original.icon) patch.icon = editForm.icon.trim();

    return patch;
  };

  const patchSize = editing && editForm ? Object.keys(buildPatch()).length : 0;

  const columns: Column<Taxonomy>[] = [
    {
      id: 'name',
      header: 'Name',
      primary: true,
      sortValue: (row) => row.name,
      cell: (row) => (
        <Text size="compact" tone="primary" weight="medium" className="truncate">
          {row.name}
        </Text>
      ),
    },
    {
      id: 'slug',
      header: 'Slug',
      hideBelow: 'md',
      sortValue: (row) => row.slug,
      cell: (row) => (
        <span className="font-mono text-xs text-text-muted">{row.slug}</span>
      ),
    },
    {
      id: 'kind',
      header: 'Kind',
      sortValue: (row) => row.kind,
      cell: (row) => (
        <Badge variant="secondary" className="capitalize">
          {row.kind}
        </Badge>
      ),
    },
    {
      id: 'order',
      header: 'Order',
      hideBelow: 'sm',
      sortValue: (row) => row.order ?? 0,
      cell: (row) => (
        <Text size="caption" tone="muted" numeric>
          {row.order ?? 0}
        </Text>
      ),
    },
    {
      id: 'createdAt',
      header: 'Created',
      hideBelow: 'lg',
      sortValue: (row) => row.createdAt ?? null,
      cell: (row) => (
        <Text size="caption" tone="muted" numeric>
          {row.createdAt
            ? formatDistanceToNow(parseISO(row.createdAt), { addSuffix: true })
            : '—'}
        </Text>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeading
        overline="Content"
        title="Taxonomies"
        description="Patterns, subjects, groups, platforms and buckets used to organise problems."
        actions={
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="size-4" aria-hidden />
            New taxonomy
          </Button>
        }
      />

      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row._id}
        loading={isLoading}
        error={error}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name or slug…"
        emptyTitle="No taxonomies found"
        emptyDescription="Create a taxonomy to start grouping problems under it."
        emptyIcon={Tags}
        emptyAction={
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="size-4" aria-hidden />
            New taxonomy
          </Button>
        }
        filters={
          <Tabs value={kindFilter} onValueChange={(value) => setKindFilter(String(value))}>
            <TabsList>
              {KIND_TABS.map((k) => (
                <TabsTab key={k} value={k} className="capitalize">
                  {k}
                </TabsTab>
              ))}
            </TabsList>
          </Tabs>
        }
        rowActions={(row) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Edit ${row.name}`}
              className="size-11 md:size-8"
              onClick={() => openEdit(row)}
            >
              <Edit2 className="size-4" aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Archive ${row.name}`}
              className="size-11 text-destructive md:size-8"
              onClick={() => setArchiveTarget(row)}
            >
              <Archive className="size-4" aria-hidden />
            </Button>
          </div>
        )}
        bulkActions={(ids, clear) => (
          <Button
            variant="destructive"
            size="sm"
            loading={bulkArchive.isPending}
            onClick={() => bulkArchive.mutate(ids, { onSettled: clear })}
          >
            Archive {ids.length}
          </Button>
        )}
        pageSize={15}
      />

      {/* ── Create ─────────────────────────────────────────────── */}
      <SlideOver
        open={isCreating}
        onOpenChange={setIsCreating}
        title="New taxonomy"
        description="The slug is generated from the name automatically."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              loading={createMutation.isPending}
              disabled={!newName}
            >
              Create
            </Button>
          </>
        }
      >
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (newName) createMutation.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="taxonomy-name">Name</Label>
            <Input
              id="taxonomy-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Arrays"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxonomy-kind">Kind</Label>
            <select
              id="taxonomy-kind"
              value={newKind}
              onChange={(e) => setNewKind(e.target.value)}
              className={SELECT_CLASS}
            >
              {Object.entries(KIND_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <Text size="caption" tone="muted">
              Kind cannot be changed after creation.
            </Text>
          </div>

          <button type="submit" className="sr-only" tabIndex={-1} aria-hidden>
            Create
          </button>
        </form>
      </SlideOver>

      {/* ── Edit ───────────────────────────────────────────────── */}
      <SlideOver
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) closeEdit();
        }}
        title="Edit taxonomy"
        description={editing ? `${KIND_LABEL[editing.kind] ?? editing.kind} · ${editing.slug}` : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={closeEdit}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!editing) return;
                const patch = buildPatch();
                if (!Object.keys(patch).length) {
                  toast.add('Nothing to save', {
                    description: 'No fields were changed.',
                    type: 'error',
                  });
                  return;
                }
                updateMutation.mutate({ id: editing._id, patch });
              }}
              loading={updateMutation.isPending}
              disabled={patchSize === 0}
            >
              Save changes
            </Button>
          </>
        }
      >
        {editForm ? (
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!editing) return;
              const patch = buildPatch();
              if (Object.keys(patch).length) {
                updateMutation.mutate({ id: editing._id, patch });
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-slug">Slug</Label>
              <Input
                id="edit-slug"
                value={editForm.slug}
                onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                className="h-11 font-mono"
              />
              <Text size="caption" tone="muted">
                Changing the slug will break any existing links that use the old one.
              </Text>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-order">Order</Label>
              <Input
                id="edit-order"
                type="number"
                inputMode="numeric"
                value={editForm.order}
                onChange={(e) => setEditForm({ ...editForm, order: e.target.value })}
                placeholder="0"
                className="h-11 tabular-nums"
              />
              <Text size="caption" tone="muted">
                Lower values sort first. Leave blank to keep it unordered.
              </Text>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-icon">Icon</Label>
              <Input
                id="edit-icon"
                value={editForm.icon}
                onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                placeholder="Optional icon name"
                className="h-11 font-mono"
              />
            </div>

            <div className="rounded-lg bg-surface-sunken p-3">
              <Text size="caption" tone="muted">
                {patchSize === 0
                  ? 'No changes yet — only edited fields are sent.'
                  : `${patchSize} ${patchSize === 1 ? 'field' : 'fields'} will be sent.`}
              </Text>
            </div>

            <button type="submit" className="sr-only" tabIndex={-1} aria-hidden>
              Save
            </button>
          </form>
        ) : null}
      </SlideOver>

      <ConfirmDialog
        open={Boolean(archiveTarget)}
        onOpenChange={(open) => {
          if (!open) setArchiveTarget(null);
        }}
        itemName={archiveTarget?.name ?? ''}
        action="archive"
        confirmLabel="Yes, archive"
        description={
          <>
            <span className="font-medium text-foreground">{archiveTarget?.name}</span> will be
            archived and hidden from pickers. Nothing is permanently deleted — problems already
            tagged with it keep their reference.
          </>
        }
        pending={deleteMutation.isPending}
        onConfirm={() => {
          if (archiveTarget) deleteMutation.mutate(archiveTarget._id);
        }}
      />
    </div>
  );
}
