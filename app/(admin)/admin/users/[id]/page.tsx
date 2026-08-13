'use client';

import { use, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow, parseISO } from 'date-fns';
import {
  ArrowLeft,
  Ban,
  CheckCircle,
  Shield,
  ShieldOff,
  Trash2,
  UserX,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/alert-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Progress } from '@/components/ui/progress';
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { Heading, Metric, PageHeading, Text } from '@/components/ui/typography';

interface UserDetail {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  disabled: boolean;
  createdAt: string;
  lastSeenAt?: string;
  totalProblems: number;
  completedProblems: number;
}

type PendingAction = 'demote' | 'disable' | 'delete';

function DetailField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Text size="micro" tone="muted" weight="medium" className="uppercase tracking-[0.08em]">
        {label}
      </Text>
      {children}
    </div>
  );
}

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [confirming, setConfirming] = useState<PendingAction | null>(null);

  const { data: user, isLoading } = useQuery<UserDetail>({
    queryKey: ['admin', 'users', id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users/${id}`);
      if (!res.ok) throw new Error('User not found');
      return res.json();
    },
  });

  const roleMutation = useMutation({
    mutationFn: async (role: 'admin' | 'user') => {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message || 'Failed to change role');
      return role;
    },
    onSuccess: (role) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', id] });
      setConfirming(null);
      toast.add(role === 'admin' ? 'Promoted to admin' : 'Demoted to user', {
        description: `${user?.name ?? 'This account'} now has ${
          role === 'admin' ? 'full admin access' : 'standard access'
        }.`,
        type: 'success',
      });
    },
    onError: (err: any) =>
      toast.add('Could not change role', {
        description: err?.message ?? 'Please try again.',
        type: 'error',
      }),
  });

  const disableMutation = useMutation({
    mutationFn: async (disabled: boolean) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disabled }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      return disabled;
    },
    onSuccess: (disabled) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', id] });
      setConfirming(null);
      toast.add(disabled ? 'Account disabled' : 'Account enabled', {
        description: disabled
          ? `${user?.name ?? 'This account'} can no longer sign in.`
          : `${user?.name ?? 'This account'} can sign in again.`,
        type: 'success',
      });
    },
    onError: (err: any) =>
      toast.add('Could not update status', {
        description: err?.message ?? 'Please try again.',
        type: 'error',
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      // Confirmation is handled by ConfirmDialog before this runs.
      const res = await fetch(`/api/admin/users/${id}?wipe=true`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error?.message || 'Failed to delete');
      router.push('/admin');
    },
    onSuccess: () => {
      setConfirming(null);
      toast.add('User deleted', {
        description: `${user?.name ?? 'The account'} and all its data were removed.`,
        type: 'success',
      });
    },
    onError: (err: any) =>
      toast.add('Could not delete user', {
        description: err?.message ?? 'Please try again.',
        type: 'error',
      }),
  });

  /* ── Loading ─────────────────────────────────────────────────── */

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-8 w-56" />
        </div>
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl">
        <div className="rounded-xl bg-card shadow-e2">
          <EmptyState
            icon={UserX}
            title="User not found"
            description="This account may have been deleted, or the link is out of date."
            action={
              <Button variant="soft" render={<Link href="/admin/users" />}>
                <ArrowLeft aria-hidden />
                Back to users
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const completionPct = user.totalProblems
    ? Math.round((user.completedProblems / user.totalProblems) * 100)
    : 0;

  const isPending =
    roleMutation.isPending || disableMutation.isPending || deleteMutation.isPending;

  return (
    <div className="animate-in-fade max-w-3xl space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 h-11 sm:h-7"
        render={<Link href="/admin/users" />}
      >
        <ArrowLeft aria-hidden />
        All users
      </Button>

      {/* ── Identity ───────────────────────────────────────────── */}
      <PageHeading
        overline="User"
        title={user.name}
        description={user.email}
        actions={
          <div className="flex items-center gap-2">
            {user.role === 'admin' ? (
              <Badge variant="secondary" className="bg-accent text-accent-foreground">
                <Shield aria-hidden />
                Admin
              </Badge>
            ) : (
              <Badge variant="secondary">User</Badge>
            )}
            {user.disabled ? (
              <Badge variant="destructive">Disabled</Badge>
            ) : (
              <Badge variant="secondary" className="bg-success-muted text-success">
                Active
              </Badge>
            )}
          </div>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <span
            aria-hidden
            className="grid size-14 shrink-0 place-items-center rounded-full bg-accent text-lg font-semibold text-accent-foreground"
          >
            {user.name?.[0]?.toUpperCase() ?? '?'}
          </span>

          <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3">
            <DetailField label="Email">
              <Text size="caption" tone="primary" className="break-all">
                {user.email}
              </Text>
            </DetailField>
            <DetailField label="Joined">
              <Text size="caption" tone="primary" numeric>
                {user.createdAt
                  ? formatDistanceToNow(parseISO(user.createdAt), { addSuffix: true })
                  : '—'}
              </Text>
            </DetailField>
            <DetailField label="Last seen">
              <Text size="caption" tone="primary" numeric>
                {user.lastSeenAt
                  ? formatDistanceToNow(parseISO(user.lastSeenAt), { addSuffix: true })
                  : 'Never'}
              </Text>
            </DetailField>
          </div>
        </CardContent>
      </Card>

      {/* ── Stats ──────────────────────────────────────────────── */}
      <section className="space-y-3">
        <Heading level="overline">Platform activity</Heading>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card size="sm">
            <CardContent className="space-y-0.5">
              <Text size="micro" tone="muted" weight="medium" className="uppercase tracking-[0.08em]">
                Completed
              </Text>
              <Metric className="text-xl sm:text-2xl">{user.completedProblems}</Metric>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardContent className="space-y-0.5">
              <Text size="micro" tone="muted" weight="medium" className="uppercase tracking-[0.08em]">
                Tracked problems
              </Text>
              <Metric className="text-xl sm:text-2xl">{user.totalProblems}</Metric>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardContent className="space-y-2">
              <Text size="micro" tone="muted" weight="medium" className="uppercase tracking-[0.08em]">
                Completion
              </Text>
              <Metric className="text-xl sm:text-2xl">{completionPct}%</Metric>
              <Progress value={completionPct} aria-label="Problem completion" />
              <Text size="micro" tone="muted" numeric>
                {user.completedProblems} of {user.totalProblems} problems
              </Text>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Administrative actions ─────────────────────────────── */}
      <section className="space-y-3">
        <Heading level="overline">Administrative actions</Heading>

        <div className="overflow-hidden rounded-xl bg-surface-sunken shadow-e1">
          <div className="space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <Text size="caption" tone="primary" weight="medium">
                  {user.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
                </Text>
                <Text size="micro" tone="muted">
                  {user.role === 'admin'
                    ? 'Removes access to every admin screen.'
                    : 'Grants full access to every admin screen.'}
                </Text>
              </div>

              {user.role === 'admin' ? (
                <Button
                  variant="soft"
                  className="h-11 sm:h-8"
                  disabled={isPending}
                  onClick={() => setConfirming('demote')}
                >
                  <ShieldOff aria-hidden />
                  Demote to user
                </Button>
              ) : (
                <Button
                  variant="soft"
                  className="h-11 sm:h-8"
                  loading={roleMutation.isPending}
                  disabled={isPending}
                  onClick={() => roleMutation.mutate('admin')}
                >
                  <Shield aria-hidden />
                  Promote to admin
                </Button>
              )}
            </div>

            <div className="h-px bg-divider" />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <Text size="caption" tone="primary" weight="medium">
                  {user.disabled ? 'Enable account' : 'Disable account'}
                </Text>
                <Text size="micro" tone="muted">
                  {user.disabled
                    ? 'Restores sign-in for this account.'
                    : 'Blocks sign-in without deleting any data.'}
                </Text>
              </div>

              {user.disabled ? (
                <Button
                  variant="soft"
                  className="h-11 sm:h-8"
                  loading={disableMutation.isPending}
                  disabled={isPending}
                  onClick={() => disableMutation.mutate(false)}
                >
                  <CheckCircle aria-hidden />
                  Enable account
                </Button>
              ) : (
                <Button
                  variant="soft"
                  className="h-11 sm:h-8"
                  disabled={isPending}
                  onClick={() => setConfirming('disable')}
                >
                  <Ban aria-hidden />
                  Disable account
                </Button>
              )}
            </div>
          </div>

          {/* Irreversible action, held apart from the reversible ones. */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-danger-muted p-5">
            <div className="min-w-0">
              <Text size="caption" tone="danger" weight="semibold">
                Delete this user
              </Text>
              <Text size="micro" tone="muted">
                Permanently wipes the account and all of its tracked data.
              </Text>
            </div>

            <Button
              variant="destructive-solid"
              className="h-11 sm:h-8"
              disabled={isPending}
              onClick={() => setConfirming('delete')}
            >
              <Trash2 aria-hidden />
              Delete user
            </Button>
          </div>
        </div>
      </section>

      {/* ── Confirmations ──────────────────────────────────────── */}
      <ConfirmDialog
        open={confirming === 'demote'}
        onOpenChange={(open) => {
          if (!open && !isPending) setConfirming(null);
        }}
        itemName={user.name}
        action="demote"
        confirmLabel="Yes, demote"
        description={
          <>
            <span className="font-medium text-foreground">{user.name}</span> will
            immediately lose access to every admin screen.
          </>
        }
        pending={roleMutation.isPending}
        onConfirm={() => roleMutation.mutate('user')}
      />

      <ConfirmDialog
        open={confirming === 'disable'}
        onOpenChange={(open) => {
          if (!open && !isPending) setConfirming(null);
        }}
        itemName={user.name}
        action="disable"
        confirmLabel="Yes, disable"
        description={
          <>
            <span className="font-medium text-foreground">{user.name}</span> will
            no longer be able to sign in. No data is deleted and this can be
            reversed.
          </>
        }
        pending={disableMutation.isPending}
        onConfirm={() => disableMutation.mutate(true)}
      />

      <ConfirmDialog
        open={confirming === 'delete'}
        onOpenChange={(open) => {
          if (!open && !isPending) setConfirming(null);
        }}
        itemName={user.name}
        action="delete"
        confirmLabel="Yes, delete permanently"
        description={
          <>
            This permanently deletes{' '}
            <span className="font-medium text-foreground">{user.name}</span> (
            {user.email}) and every problem they have tracked. This cannot be
            undone.
          </>
        }
        pending={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  );
}
