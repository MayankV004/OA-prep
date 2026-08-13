'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Mail, Plus, ShieldCheck, User } from 'lucide-react';

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
import { cn } from '@/lib/utils';

interface Invite {
  _id: string;
  email: string;
  name?: string;
  role: string;
  status: string;
  sentAt: string;
  expiresAt: string;
}

const STATUS_TABS = ['pending', 'accepted', 'revoked'] as const;

/** Status is never colour-only — the word is always in the badge. */
const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-warning-muted text-warning',
  accepted: 'bg-success-muted text-success',
  revoked: 'bg-danger-muted text-destructive',
  expired: 'bg-muted text-text-muted',
};

const SELECT_CLASS =
  'h-11 w-full appearance-none rounded-lg bg-surface-sunken px-3 text-sm text-foreground outline-none transition-shadow focus-visible:shadow-glow';

function relative(iso: string | undefined) {
  if (!iso) return '—';
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true });
  } catch {
    return '—';
  }
}

export default function AdminInvitesPage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<Invite | null>(null);

  const { data, isLoading, error } = useQuery<unknown>({
    queryKey: ['admin', 'invites', statusFilter],
    queryFn: async () => {
      const res = await fetch(`/api/admin/invites?status=${statusFilter}&limit=50`);
      if (!res.ok) throw new Error('Failed to load');
      return res.json();
    },
  });

  // BUGFIX: GET /api/admin/invites responds with a bare array (`return invites;`),
  // not `{ data: [...] }`. The previous `data?.data ?? []` read therefore always
  // resolved to an empty list and the table rendered blank. Read the array
  // directly, but keep the envelope fallback so a later backend change to
  // `{ data: [...] }` does not break this page again.
  const invites: Invite[] = Array.isArray(data)
    ? (data as Invite[])
    : ((data as { data?: Invite[] } | undefined)?.data ?? []);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return invites;
    return invites.filter(
      (inv) =>
        inv.email.toLowerCase().includes(q) ||
        (inv.name ?? '').toLowerCase().includes(q) ||
        inv.role.toLowerCase().includes(q)
    );
  }, [invites, search]);

  const resetCompose = () => {
    setEmail('');
    setName('');
  };

  const sendInvite = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name || undefined, role }),
      });
      if (!res.ok) {
        throw new Error(
          (await res.json().catch(() => null))?.error?.message ?? 'Failed to send invite'
        );
      }
      return res.json();
    },
    onSuccess: (invite: Invite) => {
      toast.add('Invite sent', {
        description: `${invite?.email ?? email} can now accept the invitation.`,
        type: 'success',
      });
      resetCompose();
      setComposeOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin', 'invites'] });
    },
    onError: (e: unknown) => {
      toast.add("Couldn't send invite", {
        description: e instanceof Error ? e.message : 'Unexpected error.',
        type: 'error',
      });
    },
  });

  // TODO: backend — DELETE /api/admin/invites/[id] is not implemented; revoke currently 404s
  const revoke = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/invites/${id}`, { method: 'DELETE' });
      // The route file does not exist, so this is a 404 today. Surface it instead
      // of silently resolving, which is what made the broken button look like it
      // had worked.
      if (!res.ok) {
        const message =
          (await res.json().catch(() => null))?.error?.message ??
          (res.status === 404
            ? 'Revoke endpoint not found (404). This action is not available yet.'
            : `Revoke failed (${res.status}).`);
        throw new Error(message);
      }
    },
    onSuccess: () => {
      toast.add('Invite revoked', { type: 'success' });
      setRevokeTarget(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'invites'] });
    },
    onError: (e: unknown) => {
      toast.add("Couldn't revoke invite", {
        description: e instanceof Error ? e.message : 'Unexpected error.',
        type: 'error',
      });
    },
  });

  // TODO: backend — bulk endpoint would replace this client-side loop
  const bulkRevoke = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map(async (id) => {
          const res = await fetch(`/api/admin/invites/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error(String(res.status));
        })
      );
      const succeeded = results.filter((r) => r.status === 'fulfilled').length;
      return { succeeded, failed: results.length - succeeded };
    },
    onSuccess: ({ succeeded, failed }) => {
      toast.add(`${succeeded} succeeded, ${failed} failed`, {
        description: failed
          ? 'Revoke is not implemented on the backend yet, so these requests 404.'
          : undefined,
        type: failed ? 'error' : 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'invites'] });
    },
    onError: (e: unknown) => {
      toast.add('Bulk revoke failed', {
        description: e instanceof Error ? e.message : 'Unexpected error.',
        type: 'error',
      });
    },
  });

  const columns: Column<Invite>[] = [
    {
      id: 'email',
      header: 'Email',
      primary: true,
      sortValue: (row) => row.email,
      cell: (row) => (
        <div className="min-w-0">
          <Text size="compact" tone="primary" weight="medium" className="truncate">
            {row.email}
          </Text>
          {row.name ? (
            <Text size="caption" tone="muted" className="truncate">
              {row.name}
            </Text>
          ) : null}
        </div>
      ),
    },
    {
      id: 'role',
      header: 'Role',
      hideBelow: 'lg',
      sortValue: (row) => row.role,
      cell: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs capitalize text-text-secondary">
          {row.role === 'admin' ? (
            <ShieldCheck className="size-3.5 text-primary" aria-hidden />
          ) : (
            <User className="size-3.5 text-text-muted" aria-hidden />
          )}
          {row.role}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      sortValue: (row) => row.status,
      cell: (row) => (
        <Badge
          variant="secondary"
          className={cn('capitalize', STATUS_BADGE[row.status] ?? 'bg-muted text-text-muted')}
        >
          {row.status}
        </Badge>
      ),
    },
    {
      id: 'sentAt',
      header: 'Sent',
      hideBelow: 'md',
      sortValue: (row) => row.sentAt ?? null,
      cell: (row) => (
        <Text size="caption" tone="muted" numeric>
          {relative(row.sentAt)}
        </Text>
      ),
    },
    {
      id: 'expiresAt',
      header: 'Expires',
      hideBelow: 'lg',
      sortValue: (row) => row.expiresAt ?? null,
      cell: (row) => (
        <Text size="caption" tone="muted" numeric>
          {relative(row.expiresAt)}
        </Text>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeading
        overline="Access"
        title="Invites"
        description="Send invitations and keep track of who has accepted."
        actions={
          <Button onClick={() => setComposeOpen(true)}>
            <Plus className="size-4" aria-hidden />
            New invite
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
        searchPlaceholder="Search email, name or role…"
        emptyTitle={`No ${statusFilter} invites`}
        emptyDescription="Invitations you send will show up here with their status."
        emptyIcon={Mail}
        emptyAction={
          <Button onClick={() => setComposeOpen(true)}>
            <Plus className="size-4" aria-hidden />
            Send an invite
          </Button>
        }
        filters={
          <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(String(value))}>
            <TabsList>
              {STATUS_TABS.map((s) => (
                <TabsTab key={s} value={s} className="capitalize">
                  {s}
                </TabsTab>
              ))}
            </TabsList>
          </Tabs>
        }
        rowActions={(row) =>
          row.status === 'pending' ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-11 md:h-8"
              onClick={() => setRevokeTarget(row)}
            >
              Revoke
            </Button>
          ) : null
        }
        bulkActions={(ids, clear) => (
          <Button
            variant="destructive"
            size="sm"
            loading={bulkRevoke.isPending}
            onClick={() => bulkRevoke.mutate(ids, { onSettled: clear })}
          >
            Revoke {ids.length}
          </Button>
        )}
        pageSize={15}
      />

      <SlideOver
        open={composeOpen}
        onOpenChange={(open) => {
          setComposeOpen(open);
          if (!open) resetCompose();
        }}
        title="Send an invite"
        description="They will get an email with a link to create their account."
        footer={
          <>
            <Button variant="ghost" onClick={() => setComposeOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => sendInvite.mutate()}
              loading={sendInvite.isPending}
              disabled={!email}
            >
              Send invite
            </Button>
          </>
        }
      >
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (email) sendInvite.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email address</Label>
            <Input
              id="invite-email"
              type="email"
              autoComplete="off"
              placeholder="person@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-name">Name</Label>
            <Input
              id="invite-name"
              placeholder="Optional"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
            />
            <Text size="caption" tone="muted">
              Used to personalise the invitation email.
            </Text>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-role">Role</Label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
              className={SELECT_CLASS}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <Text size="caption" tone="muted">
            Inviting an address that already has a pending invite re-sends it rather than
            creating a duplicate.
          </Text>

          <button type="submit" className="sr-only" tabIndex={-1} aria-hidden>
            Send
          </button>
        </form>
      </SlideOver>

      <ConfirmDialog
        open={Boolean(revokeTarget)}
        onOpenChange={(open) => {
          if (!open) setRevokeTarget(null);
        }}
        itemName={revokeTarget?.email ?? ''}
        action="revoke"
        confirmLabel="Yes, revoke"
        description={
          <>
            The invitation link sent to{' '}
            <span className="font-medium text-foreground">{revokeTarget?.email}</span> will stop
            working. They can be invited again later.
          </>
        }
        pending={revoke.isPending}
        onConfirm={() => {
          if (revokeTarget) revoke.mutate(revokeTarget._id);
        }}
      />
    </div>
  );
}
