'use client';

import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Shield,
  Users,
  UserCheck,
  Database,
  FileText,
  Activity,
  TrendingUp,
  ArrowRight,
  Mail,
  BookOpen,
  LayoutList,
} from 'lucide-react';
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

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  href,
}: {
  icon: any;
  label: string;
  value: number | string;
  sub?: string;
  color: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer`}>
        <div className="flex items-start justify-between mb-4">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        <p className="text-sm font-medium text-foreground mt-0.5">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        <div className={`absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent via-primary to-transparent`} />
      </div>
    </Link>
  );
}

export default function AdminDashboard() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery<{ data: UserRow[] }>({
    queryKey: ['admin', 'users', search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '50' });
      if (search) params.set('q', search);
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
  });

  const users = data?.data ?? [];
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const activeCount = users.filter((u) => !u.disabled).length;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Platform overview and quick actions
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={totalUsers}
          sub={`${activeCount} active`}
          color="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          href="/admin/users"
        />
        <StatCard
          icon={Shield}
          label="Admins"
          value={adminCount}
          sub="with full access"
          color="bg-primary/10 text-primary"
          href="/admin/users"
        />
        <StatCard
          icon={UserCheck}
          label="Active Users"
          value={activeCount}
          sub={`${totalUsers - activeCount} disabled`}
          color="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          href="/admin/users"
        />
        <StatCard
          icon={Activity}
          label="Activity Log"
          value="View"
          sub="Recent platform events"
          color="bg-orange-500/10 text-orange-600 dark:text-orange-400"
          href="/admin/activity"
        />
      </div>

      {/* Content quick links */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Content Management
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: LayoutList, label: 'Patterns', href: '/admin/content/patterns', desc: 'Manage DSA patterns' },
            { icon: Database, label: 'Problems', href: '/admin/content/problems', desc: 'User-tracked problems' },
            { icon: BookOpen, label: 'Topics', href: '/admin/content/topics', desc: 'Core subject topics' },
            { icon: FileText, label: 'Cheat Sheets', href: '/admin/content/cheatsheets', desc: 'Quick reference sheets' },
            { icon: Mail, label: 'Invites', href: '/admin/invites', desc: 'Manage invitations' },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-muted/30 transition-all cursor-pointer group">
                <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 ml-auto shrink-0 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold">All Users</h2>
            <p className="text-xs text-muted-foreground">{totalUsers} registered</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm w-52"
              />
            </div>
            <Link href="/admin/invites">
              <Button size="sm" className="h-8 text-xs">
                <Mail className="h-3.5 w-3.5 mr-1.5" />
                Invite
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Last seen</th>
                <th className="px-4 py-3 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading
                ? [...Array(5)].map((_, i) => (
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
            <div className="text-center py-12 text-muted-foreground text-sm">No users found</div>
          )}
        </div>
      </div>
    </div>
  );
}
