'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  format,
  formatDistanceToNow,
  parseISO,
  startOfWeek,
  subWeeks,
} from 'date-fns';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  ArrowRight,
  BookOpen,
  Database,
  FileText,
  LayoutList,
  Mail,
  Shield,
  UserCheck,
  Users,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Heading, Metric, PageHeading, Text } from '@/components/ui/typography';
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

/* ── Stat card ──────────────────────────────────────────────────────── */

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  sub?: string;
  tone: 'accent' | 'success' | 'info' | 'warning';
  href: string;
}) {
  const toneClass = {
    accent: 'bg-accent text-accent-foreground',
    success: 'bg-success-muted text-success',
    info: 'bg-info-muted text-info',
    warning: 'bg-warning-muted text-warning',
  }[tone];

  return (
    <Link href={href} className="group block rounded-xl outline-none">
      <Card interactive className="h-full">
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <span
              aria-hidden
              className={cn('grid size-9 place-items-center rounded-lg', toneClass)}
            >
              <Icon className="size-4" />
            </span>
            <ArrowRight
              aria-hidden
              className="size-4 text-text-muted opacity-0 transition-opacity group-hover:opacity-100"
            />
          </div>

          <div className="space-y-0.5">
            <Metric>{value}</Metric>
            <Text size="caption" tone="secondary" weight="medium">
              {label}
            </Text>
            {sub ? (
              <Text size="micro" tone="muted" numeric>
                {sub}
              </Text>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/* ── Chart tooltip ──────────────────────────────────────────────────── */

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value?: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg bg-popover px-3 py-2 shadow-e3">
      <Text size="micro" tone="muted">
        Week of {label}
      </Text>
      <Text size="caption" tone="primary" weight="semibold" numeric>
        {payload[0]?.value ?? 0} new
      </Text>
    </div>
  );
}

/* ── Content quick links ────────────────────────────────────────────── */

const CONTENT_LINKS = [
  { icon: LayoutList, label: 'Patterns', href: '/admin/content/patterns', desc: 'Manage DSA patterns' },
  { icon: Database, label: 'Problems', href: '/admin/content/problems', desc: 'User-tracked problems' },
  { icon: BookOpen, label: 'Topics', href: '/admin/content/topics', desc: 'Core subject topics' },
  { icon: FileText, label: 'Cheat Sheets', href: '/admin/content/cheatsheets', desc: 'Quick reference sheets' },
  { icon: Mail, label: 'Invites', href: '/admin/invites', desc: 'Manage invitations' },
];

const SIGNUP_WEEKS = 8;

export default function AdminDashboard() {
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useQuery<{ data: UserRow[] }>({
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

  /**
   * Signup trend is derived entirely from the `createdAt` values already on the
   * loaded page of users — no extra request. It therefore describes the fetched
   * page, not the whole platform.
   * TODO: backend — an aggregate signups-per-week endpoint would make this exact.
   */
  const signupSeries = useMemo(() => {
    const rows = data?.data ?? [];
    const now = new Date();

    const buckets = Array.from({ length: SIGNUP_WEEKS }, (_, i) => {
      const start = startOfWeek(subWeeks(now, SIGNUP_WEEKS - 1 - i), {
        weekStartsOn: 1,
      });
      return { key: start.getTime(), label: format(start, 'MMM d'), count: 0 };
    });

    for (const user of rows) {
      if (!user.createdAt) continue;
      const created = parseISO(user.createdAt);
      if (Number.isNaN(created.getTime())) continue;

      const key = startOfWeek(created, { weekStartsOn: 1 }).getTime();
      const bucket = buckets.find((b) => b.key === key);
      if (bucket) bucket.count += 1;
    }

    return buckets.map(({ label, count }) => ({ label, count }));
  }, [data]);

  const hasSignupData = signupSeries.some((point) => point.count > 0);

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

  return (
    <div className="animate-in-fade space-y-8">
      <PageHeading
        overline="Admin"
        title="Dashboard"
        description="Platform overview, content shortcuts and the most recent accounts."
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

      {/* ── Stats ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total users"
          value={totalUsers}
          sub={`${activeCount} active`}
          tone="info"
          href="/admin/users"
        />
        <StatCard
          icon={Shield}
          label="Admins"
          value={adminCount}
          sub="with full access"
          tone="accent"
          href="/admin/users"
        />
        <StatCard
          icon={UserCheck}
          label="Active users"
          value={activeCount}
          sub={`${totalUsers - activeCount} disabled`}
          tone="success"
          href="/admin/users"
        />
        <StatCard
          icon={Activity}
          label="Activity log"
          value="View"
          sub="Recent platform events"
          tone="warning"
          href="/admin/activity"
        />
      </div>

      {/* ── Signup trend ──────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>New accounts</CardTitle>
          <Text size="caption" tone="muted">
            Weekly signups across the {totalUsers} loaded accounts, last{' '}
            {SIGNUP_WEEKS} weeks.
          </Text>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-48 animate-shimmer rounded-lg bg-muted" aria-hidden />
          ) : hasSignupData ? (
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={signupSeries}
                  margin={{ top: 8, right: 4, bottom: 0, left: -20 }}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="var(--divider)"
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ fill: 'var(--muted)' }}
                    content={<ChartTooltip />}
                  />
                  <Bar
                    dataKey="count"
                    name="New accounts"
                    fill="var(--chart-1)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              compact
              icon={Activity}
              title="No recent signups"
              description="Nobody in the loaded set joined in the last eight weeks."
            />
          )}
        </CardContent>
      </Card>

      {/* ── Content quick links ───────────────────────────────────── */}
      <section className="space-y-3">
        <Heading level="overline">Content management</Heading>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CONTENT_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="group block rounded-xl outline-none">
              <div className="lift flex min-h-11 items-center gap-3 rounded-xl bg-card p-4 shadow-e1">
                <span
                  aria-hidden
                  className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-text-muted transition-colors group-hover:bg-accent group-hover:text-accent-foreground"
                >
                  <item.icon className="size-4" />
                </span>

                <span className="min-w-0">
                  <Text as="span" size="caption" tone="primary" weight="medium" className="block">
                    {item.label}
                  </Text>
                  <Text as="span" size="micro" tone="muted" className="block truncate">
                    {item.desc}
                  </Text>
                </span>

                <ArrowRight
                  aria-hidden
                  className="ml-auto size-4 shrink-0 text-text-muted opacity-0 transition-opacity group-hover:opacity-100"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Recent users ──────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <Heading level="section">All users</Heading>
          <Text size="caption" tone="muted" numeric>
            {totalUsers} loaded
          </Text>
        </div>

        <DataTable
          data={users}
          columns={columns}
          getRowId={(row) => row._id}
          loading={isLoading}
          error={error}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search users…"
          emptyTitle="No users yet"
          emptyDescription="Invite someone to get the platform started."
          emptyIcon={Users}
          emptyAction={
            <Button render={<Link href="/admin/invites" />}>
              <Mail aria-hidden />
              Invite user
            </Button>
          }
          actions={
            <Button
              variant="soft"
              size="sm"
              className="h-11 sm:h-7"
              render={<Link href="/admin/users" />}
            >
              Manage users
            </Button>
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
          pageSize={10}
        />
      </section>
    </div>
  );
}
