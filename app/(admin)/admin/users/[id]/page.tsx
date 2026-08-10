'use client';

import { use, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, ShieldOff, Trash2, Ban, CheckCircle } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

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

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

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
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users', id] }),
    onError: (err: any) => setError(err.message),
  });

  const disableMutation = useMutation({
    mutationFn: async (disabled: boolean) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disabled }),
      });
      if (!res.ok) throw new Error('Failed to update status');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users', id] }),
    onError: (err: any) => setError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!confirm('Are you sure you want to completely delete this user? This cannot be undone.')) return;
      const res = await fetch(`/api/admin/users/${id}?wipe=true`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error?.message || 'Failed to delete');
      router.push('/admin');
    },
    onError: (err: any) => setError(err.message),
  });

  if (isLoading) return <div className="p-8"><div className="h-32 bg-muted animate-pulse rounded-xl" /></div>;
  if (!user) return <div className="p-8 text-center text-muted-foreground">User not found</div>;

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/admin">
          <Button variant="ghost" size="icon-sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">User Details</h1>
      </div>

      {error && <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Role</p>
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              }`}>
                {user.role}
              </span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <span className={`text-xs font-medium ${user.disabled ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {user.disabled ? 'Disabled' : 'Active'}
              </span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Joined</p>
              <p className="text-sm">{formatDistanceToNow(parseISO(user.createdAt), { addSuffix: true })}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Last Seen</p>
              <p className="text-sm">{user.lastSeenAt ? formatDistanceToNow(parseISO(user.lastSeenAt), { addSuffix: true }) : 'Never'}</p>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-medium">Platform Stats</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Problems Completed</span>
                <span className="font-medium">{user.completedProblems} / {user.totalProblems}</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${user.totalProblems ? (user.completedProblems / user.totalProblems) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions Card */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4 md:col-span-2">
          <h3 className="font-medium">Administrative Actions</h3>
          <div className="flex flex-wrap gap-3">
            {user.role === 'user' ? (
              <Button variant="outline" onClick={() => roleMutation.mutate('admin')} disabled={roleMutation.isPending}>
                <Shield className="h-4 w-4 mr-2" /> Promote to Admin
              </Button>
            ) : (
              <Button variant="outline" onClick={() => roleMutation.mutate('user')} disabled={roleMutation.isPending}>
                <ShieldOff className="h-4 w-4 mr-2" /> Demote to User
              </Button>
            )}

            {user.disabled ? (
              <Button variant="outline" onClick={() => disableMutation.mutate(false)} disabled={disableMutation.isPending}>
                <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" /> Enable Account
              </Button>
            ) : (
              <Button variant="outline" onClick={() => disableMutation.mutate(true)} disabled={disableMutation.isPending}>
                <Ban className="h-4 w-4 mr-2 text-amber-500" /> Disable Account
              </Button>
            )}

            <Button variant="destructive" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending} className="ml-auto">
              <Trash2 className="h-4 w-4 mr-2" /> Delete User
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
