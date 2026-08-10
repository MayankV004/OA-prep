'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface Invite {
  _id: string;
  email: string;
  name?: string;
  role: string;
  status: string;
  sentAt: string;
  expiresAt: string;
}

export default function AdminInvitesPage() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery<{ data: Invite[] }>({
    queryKey: ['admin', 'invites', statusFilter],
    queryFn: async () => {
      const res = await fetch(`/api/admin/invites?status=${statusFilter}&limit=50`);
      if (!res.ok) throw new Error('Failed to load');
      return res.json();
    },
  });

  const invites = data?.data ?? [];

  const sendInvite = async () => {
    if (!email) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name || undefined, role }),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? 'Failed');
      setEmail(''); setName('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'invites'] });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  const revoke = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/admin/invites/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'invites'] }),
  });

  const STATUS_CLASSES: Record<string, string> = {
    pending: 'text-amber-600 bg-amber-500/10',
    accepted: 'text-emerald-600 bg-emerald-500/10',
    revoked: 'text-red-600 bg-red-500/10',
    expired: 'text-muted-foreground bg-muted',
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Invites</h1>

      {/* Send invite form */}
      <div className="rounded-xl border border-border p-5 space-y-4 max-w-md">
        <h2 className="font-semibold">Send Invite</h2>
        <div className="space-y-3">
          <Input
            placeholder="Email address"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <Input
            placeholder="Name (optional)"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <select
            value={role}
            onChange={e => setRole(e.target.value as any)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button onClick={sendInvite} disabled={sending || !email} className="w-full">
            {sending ? 'Sending...' : 'Send Invite'}
          </Button>
        </div>
      </div>

      {/* Invite list */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {['pending', 'accepted', 'revoked'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs rounded-md font-medium capitalize transition-colors ${
                statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Role</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Sent</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Expires</th>
                <th className="px-4 py-2.5 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-background">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-5 bg-muted animate-pulse rounded" /></td></tr>
                ))
              ) : invites.map(inv => (
                <tr key={inv._id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{inv.email}</p>
                    {inv.name && <p className="text-xs text-muted-foreground">{inv.name}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs capitalize text-muted-foreground">{inv.role}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_CLASSES[inv.status] ?? ''}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDistanceToNow(parseISO(inv.sentAt), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDistanceToNow(parseISO(inv.expiresAt), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3">
                    {inv.status === 'pending' && (
                      <Button variant="ghost" size="xs" onClick={() => revoke.mutate(inv._id)}>
                        Revoke
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && invites.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">No {statusFilter} invites</div>
          )}
        </div>
      </div>
    </div>
  );
}
