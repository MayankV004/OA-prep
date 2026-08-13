'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Ban, Mail, Shield, Trash2, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/toast';
import { Metric, PageHeading, Text } from '@/components/ui/typography';
import { DataTable, type Column } from '@/components/admin/DataTable';

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  disabled: boolean;
  createdAt: string;
  lastSeenAt?: string;
}

type RoleFilter = 'all' | 'admin' | 'user';
type BulkKind = 'disable' | 'delete';

const ROLE_FILTERS: { value: RoleFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'admin', label: 'Admins' },
  { value: 'user', label: 'Users' },
];

function SummaryCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <Card size="sm">
      <CardContent className="space-y-0.5">
        <Text size="micro" tone="muted" weight="medium" className="uppercase tracking-[0.08em]">
          {label}
        </Text>
        <Metric className="text-xl sm:text-2xl">{value}</Metric>
        {sub ? (
          <Text size="micro" tone="muted" numeric>
            {sub}
          </Text>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const toast = useToast();

  /**
   * Role narrowing happens on the fetched page. The list endpoint does accept a
   * `role=` param, but wiring it would change the query — left client-side.
   */
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  const [bulk, setBulk] = useState<{
    kind: BulkKind;
    ids: string[];
    clear: () => void;
  } | null>(null);

  const { data, isLoading, error } = useQuery<{ data: UserRow[] }>({
    queryKey: ['admin', 'users', search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '100' });
      if (search) params.set('q', search);
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
  });

  const users = data?.data ?? [];
  const activeCount = users.filter((u) => !u.disabled).length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

  const rows = useMemo(
    () =>
      roleFilter === 'all'
        ? users
        : users.filter((user) => user.role === roleFilter),
    [roleFilter, users]
  );

  /**
   * No endpoint accepts an array of ids, so each selected row is hit
   * individually and the outcomes are reported in aggregate.
   * TODO: backend — bulk endpoint would replace this client-side loop
   */
  const bulkMutation = useMutation({
    mutationFn: async ({ kind, ids }: { kind: BulkKind; ids: string[] }) => {
      const settled = await Promise.allSettled(
        ids.map(async (id) => {
          const res =
            kind === 'delete'
              ? await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
              : await fetch(`/api/admin/users/${id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ disabled: true }),
                });

          if (!res.ok) {
            const body = await res.json().catch(() => null);
            throw new Error(body?.error?.message ?? 'Request failed');
          }
        })
      );

      const succeeded = settled.filter((r) => r.status === 'fulfilled').length;
      return { succeeded, failed: settled.length - succeeded, kind };
    },
    onSuccess: ({ succeeded, failed, kind }) => {
      const verb = kind === 'delete' ? 'deleted' : 'disabled';

      toast.add(
        failed === 0
          ? `${succeeded} ${succeeded === 1 ? 'user' : 'users'} ${verb}`
          : `${succeeded} succeeded, ${failed} failed`,
        {
          description:
            failed === 0
              ? undefined
              : `Some accounts could not be ${verb}. Retry the ones still listed.`,
          type: failed === 0 ? 'success' : 'error',
        }
      );
    },
    onError: (err: unknown) => {
      toast.add('Bulk action failed', {
        description: err instanceof Error ? err.message : 'Please try again.',
        type: 'error',
      });
    },
    // Single invalidation once the whole batch has settled.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      bulk?.clear();
      setBulk(null);
    },
  });

  const columns: Column<UserRow>[] = [
    {
      id: 'user',
      header: 'User',
      primary: true,
      sortValue: (row) => row.name,
      cell: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden
            className="grid size-7 shrink-0 place-items-center rounded-full bg-accent text-2xs font-semibold text-accent-foreground"
          >
            {row.name?.[0]?.toUpperCase() ?? '?'}
          </span>
          <span className="min-w-0">
            <Text
              as="span"
              size="caption"
              tone="primary"
              weight="medium"
              className="block truncate"
            >
              {row.name}
            </Text>
            <Text as="span" size="micro" tone="muted" className="block truncate">
              {row.email}
            </Text>
          </span>
        </div>
      ),
    },
    {
      id: 'role',
      header: 'Role',
      sortValue: (row) => row.role,
      cell: (row) =>
        row.role === 'admin' ? (
          <Badge variant="secondary" className="bg-accent text-accent-foreground">
            <Shield aria-hidden />
            Admin
          </Badge>
        ) : (
          <Badge variant="secondary">User</Badge>
        ),
    },
    {
      id: 'status',
      header: 'Status',
      sortValue: (row) => (row.disabled ? 1 : 0),
      cell: (row) =>
        row.disabled ? (
          <Badge variant="destructive">Disabled</Badge>
        ) : (
          <Badge variant="secondary" className="bg-success-muted text-success">
            Active
          </Badge>
        ),
    },
    {
      id: 'createdAt',
      header: 'Joined',
      hideBelow: 'lg',
      sortValue: (row) => row.createdAt ?? null,
      cell: (row) => (
        <Text size="caption" tone="muted" as="span" numeric>
          {row.createdAt
            ? formatDistanceToNow(parseISO(row.createdAt), { addSuffix: true })
            : '—'}
        </Text>
      ),
    },
    {
      id: 'lastSeenAt',
      header: 'Last seen',
      hideBelow: 'lg',
      sortValue: (row) => row.lastSeenAt ?? null,
      cell: (row) => (
        <Text size="caption" tone="muted" as="span" numeric>
          {row.lastSeenAt
            ? formatDistanceToNow(parseISO(row.lastSeenAt), { addSuffix: true })
            : '—'}
        </Text>
      ),
    },
  ];

  const bulkCount = bulk?.ids.length ?? 0;

  return (
    <div className="animate-in-fade space-y-6">
      <PageHeading
        overline="Admin"
        title="Users"
        description="Every account on the platform. Select rows to act on several at once."
        actions={
          <Button
            size="lg"
            className="h-11 sm:h-9"
            render={<Link href="/admin/invites" />}
          >
            <Mail aria-hidden />
            Invite user
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard label="Total" value={users.length} sub="loaded accounts" />
        <SummaryCard
          label="Active"
          value={activeCount}
          sub={`${users.length - activeCount} disabled`}
        />
        <SummaryCard label="Admins" value={adminCount} sub="with full access" />
      </div>

      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row._id}
        loading={isLoading}
        error={error}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or email…"
        emptyTitle="No users found"
        emptyDescription="Nobody matches this filter yet. Invite someone to get started."
        emptyIcon={Users}
        emptyAction={
          <Button render={<Link href="/admin/invites" />}>
            <Mail aria-hidden />
            Invite user
          </Button>
        }
        filters={
          <div
            role="group"
            aria-label="Filter by role"
            className="flex items-center gap-1 rounded-lg bg-surface-sunken p-1"
          >
            {ROLE_FILTERS.map((option) => (
              <Button
                key={option.value}
                variant={roleFilter === option.value ? 'soft' : 'ghost'}
                size="sm"
                aria-pressed={roleFilter === option.value}
                onClick={() => setRoleFilter(option.value)}
                className="h-11 sm:h-7"
              >
                {option.label}
              </Button>
            ))}
          </div>
        }
        rowActions={(row) => (
          <Button
            variant="ghost"
            size="sm"
            className="h-11 sm:h-7"
            render={<Link href={`/admin/users/${row._id}`} />}
          >
            View
          </Button>
        )}
        bulkActions={(ids, clear) => (
          <>
            <Button
              variant="soft"
              size="sm"
              className="h-11 sm:h-7"
              onClick={() => setBulk({ kind: 'disable', ids, clear })}
            >
              <Ban aria-hidden />
              Disable
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-11 sm:h-7"
              onClick={() => setBulk({ kind: 'delete', ids, clear })}
            >
              <Trash2 aria-hidden />
              Delete
            </Button>
          </>
        )}
        pageSize={15}
      />

      <ConfirmDialog
        open={bulk !== null}
        onOpenChange={(open) => {
          if (!open && !bulkMutation.isPending) setBulk(null);
        }}
        itemName={`${bulkCount} ${bulkCount === 1 ? 'user' : 'users'}`}
        action={bulk?.kind === 'delete' ? 'delete' : 'disable'}
        confirmLabel={
          bulk?.kind === 'delete'
            ? `Yes, delete ${bulkCount}`
            : `Yes, disable ${bulkCount}`
        }
        description={
          bulk?.kind === 'delete' ? (
            <>
              This deletes{' '}
              <span className="font-medium text-foreground">
                {bulkCount} selected {bulkCount === 1 ? 'account' : 'accounts'}
              </span>{' '}
              one at a time. Any that fail stay untouched and are reported back.
            </>
          ) : (
            <>
              This signs out and disables{' '}
              <span className="font-medium text-foreground">
                {bulkCount} selected {bulkCount === 1 ? 'account' : 'accounts'}
              </span>
              . They can be re-enabled individually afterwards.
            </>
          )
        }
        pending={bulkMutation.isPending}
        onConfirm={() => {
          if (!bulk) return;
          bulkMutation.mutate({ kind: bulk.kind, ids: bulk.ids });
        }}
      />
    </div>
  );
}
