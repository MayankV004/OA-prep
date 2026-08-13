'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FolderTree, Plus, Trash2 } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

import { DataTable, type Column } from '@/components/admin/DataTable';
import { SlideOver } from '@/components/admin/SlideOver';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { PageHeading, Text } from '@/components/ui/typography';

interface Topic {
  _id: string;
  title: string;
  groupId: string;
  userId?: { name: string; email: string };
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

export default function AdminTopicsPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [confirming, setConfirming] = useState<Topic | null>(null);
  const [bulkConfirm, setBulkConfirm] = useState<{
    ids: string[];
    clear: () => void;
  } | null>(null);

  const { data, isLoading, error } = useQuery<{ data: Topic[] }>({
    queryKey: ['admin', 'topics', search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '50' });
      if (search) params.set('q', search);
      const res = await fetch(`/api/admin/content/topics?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  const topics = data?.data || [];

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/topics/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? 'Failed to delete topic');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'topics'] });
      toast.add('Topic deleted', { type: 'success' });
      setConfirming(null);
    },
    onError: (err: unknown) => {
      toast.add("Couldn't delete topic", {
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
          const res = await fetch(`/api/topics/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error(id);
        })
      );
      return {
        succeeded: results.filter((r) => r.status === 'fulfilled').length,
        failed: results.filter((r) => r.status === 'rejected').length,
      };
    },
    onSuccess: ({ succeeded, failed }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'topics'] });
      toast.add(`${succeeded} deleted, ${failed} failed`, {
        type: failed > 0 ? 'error' : 'success',
      });
      bulkConfirm?.clear();
      setBulkConfirm(null);
    },
    onError: () => {
      toast.add("Couldn't delete the selected topics", { type: 'error' });
    },
  });

  const columns: Column<Topic>[] = [
    {
      id: 'title',
      header: 'Title',
      primary: true,
      sortValue: (row) => row.title,
      cell: (row) => (
        <span className="block truncate font-medium text-foreground" title={row.title}>
          {row.title}
        </span>
      ),
    },
    {
      id: 'groupId',
      header: 'Group',
      sortValue: (row) => row.groupId,
      cell: (row) => (
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-2xs text-text-secondary">
          {row.groupId}
        </code>
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
            System
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

  const newTopicButton = (
    <Button onClick={() => setCreateOpen(true)}>
      <Plus className="size-4" aria-hidden />
      New topic
    </Button>
  );

  return (
    <div className="space-y-6">
      <PageHeading
        overline="Content"
        title="Topics"
        description="Every topic created across all users."
        actions={newTopicButton}
      />

      <DataTable
        data={topics}
        columns={columns}
        getRowId={(row) => row._id}
        loading={isLoading}
        error={error}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search topics…"
        emptyTitle="No topics yet"
        emptyDescription="Topics created by any user will show up here."
        emptyIcon={FolderTree}
        emptyAction={newTopicButton}
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

      {/* TODO: backend — POST endpoint needed before this form can submit */}
      <SlideOver
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New topic"
        description="Form is ready — the create endpoint is not."
        width="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button disabled>Create topic</Button>
          </>
        }
      >
        <form
          className="space-y-5"
          onSubmit={(e) => {
            // TODO: backend — POST endpoint needed before this form can submit
            e.preventDefault();
          }}
        >
          <div className="rounded-lg bg-warning-muted p-3">
            <Text size="caption" className="text-warning">
              Saving is disabled: there is no <code className="font-mono">POST</code>{' '}
              /api/topics endpoint yet. The fields below are wired to local state only.
            </Text>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic-title">Title</Label>
            <Input id="topic-title" name="title" placeholder="e.g. Dynamic Programming" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic-group">Group ID</Label>
            <Input id="topic-group" name="groupId" placeholder="e.g. core-dsa" />
            <Text size="micro" tone="muted">
              Groups bucket related topics together in the learner view.
            </Text>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic-notes">Notes</Label>
            <Textarea id="topic-notes" name="notes" rows={4} placeholder="Optional context…" />
          </div>
        </form>
      </SlideOver>

      <ConfirmDialog
        open={Boolean(confirming)}
        onOpenChange={(open) => !open && setConfirming(null)}
        itemName={confirming?.title ?? 'this topic'}
        action="delete"
        pending={deleteMutation.isPending}
        onConfirm={() => confirming && deleteMutation.mutate(confirming._id)}
      />

      <ConfirmDialog
        open={Boolean(bulkConfirm)}
        onOpenChange={(open) => !open && setBulkConfirm(null)}
        itemName={`${bulkConfirm?.ids.length ?? 0} topics`}
        action="delete"
        confirmLabel="Yes, delete all"
        description={`This will permanently delete ${bulkConfirm?.ids.length ?? 0} topics. This action cannot be undone.`}
        pending={bulkDeleteMutation.isPending}
        onConfirm={() => bulkConfirm && bulkDeleteMutation.mutate(bulkConfirm.ids)}
      />
    </div>
  );
}
