'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Shield, Users, Mail } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  disabled: boolean;
  createdAt: string;
  lastSeenAt?: string;
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ data: UserRow[] }>({
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Users
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {users.length} total · {activeCount} active · {adminCount} admins
          </p>
        </div>
        <Link href="/admin/invites">
          <Button size="sm">
            <Mail className="h-3.5 w-3.5 mr-1.5" />
            Invite User
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Joined</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Last seen</th>
              <th className="px-4 py-3 w-16" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading
              ? [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-3">
                      <div className="h-5 bg-muted animate-pulse rounded" />
                    </td>
                  </tr>
                ))
              : users.map((user) => (
                  <tr key={user._id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                          {user.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm leading-tight">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                          user.role === 'admin'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {user.role === 'admin' && <Shield className="h-3 w-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold ${
                          user.disabled ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {user.disabled ? '● Disabled' : '● Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDistanceToNow(parseISO(user.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {user.lastSeenAt
                        ? formatDistanceToNow(parseISO(user.lastSeenAt), { addSuffix: true })
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/users/${user._id}`}>
                        <Button variant="ghost" size="xs" className="h-7 text-xs">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!isLoading && users.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            <Users className="h-8 w-8 mx-auto mb-3 opacity-30" />
            No users found
          </div>
        )}
      </div>
    </div>
  );
}
