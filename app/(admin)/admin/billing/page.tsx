'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  CreditCard,
  Plus,
  Shield,
  UserCheck,
  Percent,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Key,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import { formatDistanceToNow, format, parseISO } from 'date-fns';

import { DataTable, type Column } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton, SkeletonRows } from '@/components/ui/skeleton';
import { Heading, Metric, PageHeading, Text } from '@/components/ui/typography';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// Lazy-loaded line graph component to ensure smooth SSR and client canvas rendering
const RevenueTrendChart = dynamic(
  () => import('@/components/admin/RevenueTrendChart').then((m) => m.RevenueTrendChart),
  {
    loading: () => <div className="h-[250px] w-full rounded-2xl bg-muted/20 animate-pulse" />,
    ssr: false,
  }
);

interface SubscriptionRow {
  _id: string;
  userId: string | null;
  userName: string;
  userEmail: string;
  plan: 'free' | 'pro_monthly' | 'pro_annual' | 'oa_pass' | 'campus';
  status: 'active' | 'canceled' | 'past_due' | 'expired' | 'trialing';
  provider: 'stripe' | 'mock';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  aiCreditsQuota: number;
  aiCreditsUsed: number;
  promoCode: string | null;
  paidPriceUsd: number | null;
  grantedByAdmin: boolean;
  updatedAt: string;
}

interface BillingApiResponse {
  stats: {
    totalActiveSubscribers: number;
    proMonthlyCount: number;
    proAnnualCount: number;
    oaPassCount: number;
    totalPromos: number;
    totalRedemptions: number;
    totalRevenueUsd: number;
    mrrUsd: number;
    revenueTrend: {
      date: string;
      revenue: number;
      cumulativeRevenue: number;
    }[];
  };
  data: SubscriptionRow[];
}

export default function AdminBillingPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');

  // Grant Pro Modal state
  const [isGrantOpen, setIsGrantOpen] = useState(false);
  const [grantUserId, setGrantUserId] = useState('');
  const [grantPlan, setGrantPlan] = useState<'pro_monthly' | 'pro_annual' | 'oa_pass'>('pro_monthly');
  const [grantDurationDays, setGrantDurationDays] = useState(30);

  const { data, isLoading, error } = useQuery<BillingApiResponse>({
    queryKey: ['admin', 'billing', planFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (planFilter !== 'all') params.set('plan', planFilter);
      const res = await fetch(`/api/admin/billing?${params}`);
      if (!res.ok) throw new Error('Failed to fetch billing data');
      return res.json();
    },
  });

  const grantMutation = useMutation({
    mutationFn: async (payload: {
      userId: string;
      action: 'grant' | 'revoke';
      plan?: string;
      durationDays?: number;
    }) => {
      const res = await fetch('/api/admin/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Operation failed');
      return json;
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Updated subscription status');
      setIsGrantOpen(false);
      setGrantUserId('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'billing'] });
    },
    onError: (err: any) => {
      toast.error('Action failed', { description: err.message });
    },
  });

  const stats = data?.stats || {
    totalActiveSubscribers: 0,
    proMonthlyCount: 0,
    proAnnualCount: 0,
    oaPassCount: 0,
    totalPromos: 0,
    totalRedemptions: 0,
    totalRevenueUsd: 0,
    mrrUsd: 0,
    revenueTrend: [],
  };

  const rows = (data?.data || []).filter((row) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      row.userName.toLowerCase().includes(q) ||
      row.userEmail.toLowerCase().includes(q) ||
      row.userId?.toLowerCase().includes(q) ||
      (row.promoCode && row.promoCode.toLowerCase().includes(q))
    );
  });

  const columns: Column<SubscriptionRow>[] = [
    {
      id: 'user',
      header: 'Subscriber',
      primary: true,
      sortValue: (row) => row.userName,
      cell: (row) => (
        <div className="flex min-w-0 flex-col">
          <span className="font-semibold text-foreground truncate text-sm">
            {row.userName}
          </span>
          <span className="text-2xs text-muted-foreground truncate font-mono">
            {row.userEmail}
          </span>
        </div>
      ),
    },
    {
      id: 'plan',
      header: 'Plan',
      sortValue: (row) => row.plan,
      cell: (row) => {
        const planColors: Record<string, string> = {
          pro_monthly: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
          pro_annual: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
          oa_pass: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
          free: 'bg-muted text-muted-foreground',
          campus: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
        };

        const planNames: Record<string, string> = {
          pro_monthly: 'Pro Monthly',
          pro_annual: 'Pro Annual',
          oa_pass: 'OA Pass',
          free: 'Free Core',
          campus: 'Campus',
        };

        return (
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className={`font-mono text-2xs uppercase ${planColors[row.plan] || ''}`}>
              {planNames[row.plan] || row.plan}
            </Badge>
            {row.grantedByAdmin && (
              <span className="text-2xs text-muted-foreground font-mono" title="Granted manually by Admin">
                [Admin]
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      sortValue: (row) => row.status,
      cell: (row) => (
        <Badge
          variant="secondary"
          className={
            row.status === 'active'
              ? 'bg-emerald-500/15 text-emerald-500'
              : 'bg-red-500/15 text-destructive'
          }
        >
          {row.status}
        </Badge>
      ),
    },
    {
      id: 'promo',
      header: 'Promo Applied',
      hideBelow: 'md',
      sortValue: (row) => row.promoCode || '',
      cell: (row) =>
        row.promoCode ? (
          <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
            <Percent className="size-3" />
            {row.promoCode}
            {row.paidPriceUsd !== null && (
              <span className="text-2xs text-muted-foreground font-normal">(${row.paidPriceUsd})</span>
            )}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    {
      id: 'expires',
      header: 'Period End',
      hideBelow: 'lg',
      sortValue: (row) => row.currentPeriodEnd,
      cell: (row) => (
        <div className="flex flex-col text-xs">
          <span className="font-mono text-foreground/90">
            {row.currentPeriodEnd ? format(parseISO(row.currentPeriodEnd), 'MMM dd, yyyy') : '—'}
          </span>
          <span className="text-2xs text-muted-foreground">
            {row.currentPeriodEnd ? formatDistanceToNow(parseISO(row.currentPeriodEnd), { addSuffix: true }) : ''}
          </span>
        </div>
      ),
    },
    {
      id: 'provider',
      header: 'Provider',
      hideBelow: 'lg',
      sortValue: (row) => row.provider,
      cell: (row) => (
        <span className="font-mono text-2xs uppercase text-muted-foreground">
          {row.provider}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeading
        overline="Billing & Growth"
        title="Subscriptions & Revenue"
        description="Monitor active paid subscribers, manage candidate entitlements, and review promo code performance."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="lg"
              className="h-10 text-xs font-semibold rounded-xl"
              render={<Link href="/admin/billing/pricing" />}
            >
              Configure Pricing
            </Button>

            <Button
              size="lg"
              onClick={() => setIsGrantOpen(true)}
              className="h-10 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl shadow-xs"
            >
              <Plus className="size-4 mr-1.5" />
              Grant Pro Access
            </Button>
          </div>
        }
      />

      {/* ── Metric Stat Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-xl">
          <CardContent className="p-4 space-y-1">
            <Text size="caption" tone="muted" weight="medium" className="flex items-center gap-1">
              <DollarSign className="size-3.5 text-emerald-500" /> Gross Revenue
            </Text>
            <Metric className="text-emerald-500">
              ${(stats.totalRevenueUsd || 0).toLocaleString()}
            </Metric>
            <Text size="micro" tone="muted">
              All-time paid memberships & passes
            </Text>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardContent className="p-4 space-y-1">
            <Text size="caption" tone="muted" weight="medium" className="flex items-center gap-1">
              <TrendingUp className="size-3.5 text-emerald-500" /> Projected MRR
            </Text>
            <Metric>
              ${(stats.mrrUsd || 0).toLocaleString()}
              <span className="text-xs font-normal text-muted-foreground font-mono">/mo</span>
            </Metric>
            <Text size="micro" tone="muted">
              Active monthly + amortized annual
            </Text>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardContent className="p-4 space-y-1">
            <Text size="caption" tone="muted" weight="medium">
              Active Paid Members
            </Text>
            <Metric>{stats.totalActiveSubscribers}</Metric>
            <Text size="micro" tone="muted">
              {stats.proMonthlyCount} Monthly • {stats.proAnnualCount} Annual
            </Text>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardContent className="p-4 space-y-1">
            <Text size="caption" tone="muted" weight="medium">
              OA Passes & Promos
            </Text>
            <Metric>{stats.oaPassCount}</Metric>
            <Text size="micro" tone="muted">
              {stats.totalRedemptions} redemptions ({stats.totalPromos} codes)
            </Text>
          </CardContent>
        </Card>
      </div>

      {/* ── Revenue Progression Line Graph ── */}
      <Card className="rounded-2xl border-border/80 bg-card/60 backdrop-blur-xs shadow-xs overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="size-4 text-emerald-500" />
                Revenue Progression & Trajectory
              </CardTitle>
              <CardDescription className="text-xs">
                Historical 30-day cumulative gross revenue and daily cash inflow in USD ($).
              </CardDescription>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-2xs font-mono font-medium border border-emerald-500/20">
              <DollarSign className="size-3" />
              <span>USD Currency</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          {isLoading ? (
            <div className="h-[250px] w-full rounded-xl bg-muted/20 animate-pulse flex items-center justify-center">
              <span className="text-xs font-mono text-muted-foreground">Loading revenue trajectory...</span>
            </div>
          ) : (
            <RevenueTrendChart
              data={stats.revenueTrend || []}
              totalRevenue={stats.totalRevenueUsd || 0}
              mrr={stats.mrrUsd || 0}
            />
          )}
        </CardContent>
      </Card>

      {/* ── Subscriptions Data Table ── */}
      {isLoading ? (
        <div className="rounded-xl bg-card p-4 shadow-xs">
          <SkeletonRows rows={5} />
        </div>
      ) : (
        <DataTable
          data={rows}
          columns={columns}
          getRowId={(row) => row._id}
          loading={isLoading}
          error={error}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search subscriber name, email, or promo code…"
          emptyTitle="No subscriptions found"
          emptyDescription="Paid subscribers and access grants will appear here."
          emptyIcon={CreditCard}
          filters={
            <select
              aria-label="Filter by plan"
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="h-9 rounded-lg bg-surface-sunken px-3 text-xs sm:text-sm text-foreground outline-none border border-border/60"
            >
              <option value="all">All Plans</option>
              <option value="pro_monthly">Pro Monthly</option>
              <option value="pro_annual">Pro Annual</option>
              <option value="oa_pass">OA Season Pass</option>
              <option value="free">Free Core Tier</option>
            </select>
          }
          rowActions={(row) => (
            <div className="flex items-center gap-1">
              {row.plan !== 'free' && row.status === 'active' ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-2xs text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    if (row.userId && confirm(`Revoke Pro access for ${row.userName}?`)) {
                      grantMutation.mutate({ userId: row.userId, action: 'revoke' });
                    }
                  }}
                >
                  Revoke
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-2xs text-emerald-500 hover:bg-emerald-500/10"
                  onClick={() => {
                    if (row.userId) {
                      setGrantUserId(row.userId);
                      setIsGrantOpen(true);
                    }
                  }}
                >
                  Grant Pro
                </Button>
              )}
            </div>
          )}
          pageSize={15}
        />
      )}

      {/* ── Grant Pro Access Dialog ── */}
      <Dialog open={isGrantOpen} onOpenChange={setIsGrantOpen}>
        <DialogContent className="sm:max-w-[460px] p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Shield className="size-5 text-emerald-500" />
              Grant Manual Pro Access
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Manually upgrade a candidate or university student account without requiring credit card checkout.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">User ID or Mongo ID *</Label>
              <Input
                placeholder="User ID or search target"
                value={grantUserId}
                onChange={(e) => setGrantUserId(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Plan Level</Label>
                <select
                  value={grantPlan}
                  onChange={(e) => setGrantPlan(e.target.value as any)}
                  className="w-full h-10 rounded-lg bg-surface-sunken px-3 text-xs text-foreground outline-none border border-border"
                >
                  <option value="pro_monthly">Pro Monthly</option>
                  <option value="pro_annual">Pro Annual</option>
                  <option value="oa_pass">OA Season Pass</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Duration (Days)</Label>
                <Input
                  type="number"
                  min={1}
                  max={3650}
                  value={grantDurationDays}
                  onChange={(e) => setGrantDurationDays(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGrantOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!grantUserId || grantMutation.isPending}
              onClick={() => {
                grantMutation.mutate({
                  userId: grantUserId,
                  action: 'grant',
                  plan: grantPlan,
                  durationDays: grantDurationDays,
                });
              }}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold"
            >
              {grantMutation.isPending ? 'Granting...' : 'Grant Access'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
