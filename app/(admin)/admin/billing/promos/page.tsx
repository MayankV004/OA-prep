'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Check,
  Copy,
  Percent,
  Plus,
  Power,
  Shield,
  Tag,
  Trash2,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

import { DataTable, type Column } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SkeletonRows } from '@/components/ui/skeleton';
import { PageHeading, Text } from '@/components/ui/typography';
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
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface PromoCodeRow {
  _id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  applicablePlans: string[];
  maxRedemptions: number | null;
  redemptionCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdBy?: {
    name?: string;
    email?: string;
  };
  createdAt: string;
}

export default function AdminPromosPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [applicablePlans, setApplicablePlans] = useState<string[]>(['all']);
  const [maxRedemptions, setMaxRedemptions] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');

  const { data, isLoading, error } = useQuery<{ data: PromoCodeRow[] }>({
    queryKey: ['admin', 'promos', search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/promos?${params}`);
      if (!res.ok) throw new Error('Failed to fetch promo codes');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/admin/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create promo code');
      return json;
    },
    onSuccess: () => {
      toast.success('Promo code created successfully!');
      setIsCreateOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['admin', 'promos'] });
    },
    onError: (err: any) => {
      toast.error('Failed to create promo code', { description: err.message });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch(`/api/admin/promos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to toggle promo code');
      return json;
    },
    onSuccess: (_, variables) => {
      toast.success(variables.isActive ? 'Promo code activated' : 'Promo code deactivated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'promos'] });
    },
    onError: (err: any) => {
      toast.error('Failed to update promo status', { description: err.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/promos/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to delete promo code');
      return json;
    },
    onSuccess: () => {
      toast.success('Promo code deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'promos'] });
    },
    onError: (err: any) => {
      toast.error('Failed to delete promo code', { description: err.message });
    },
  });

  const resetForm = () => {
    setNewCode('');
    setNewDesc('');
    setDiscountType('percentage');
    setDiscountValue(20);
    setApplicablePlans(['all']);
    setMaxRedemptions('');
    setExpiresAt('');
  };

  const handleGenerateRandomCode = () => {
    const prefixes = ['PROMO', 'CAMPUS', 'OFFER', 'SPRINT', 'TECH'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(100 + Math.random() * 900);
    setNewCode(`${randomPrefix}${randomNum}`);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode) {
      toast.error('Please enter a promo code');
      return;
    }

    createMutation.mutate({
      code: newCode,
      description: newDesc,
      discountType,
      discountValue: Number(discountValue),
      applicablePlans,
      maxRedemptions: maxRedemptions ? Number(maxRedemptions) : null,
      expiresAt: expiresAt || null,
      isActive: true,
    });
  };

  const promoList = data?.data || [];

  const columns: Column<PromoCodeRow>[] = [
    {
      id: 'code',
      header: 'Promo Code',
      primary: true,
      sortValue: (row) => row.code,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-sm tracking-wider text-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/50">
            {row.code}
          </span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(row.code);
              toast.success(`Copied ${row.code} to clipboard`);
            }}
            title="Copy promo code"
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Copy className="size-3.5" />
          </button>
        </div>
      ),
    },
    {
      id: 'discount',
      header: 'Discount',
      sortValue: (row) => row.discountValue,
      cell: (row) => (
        <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono text-xs">
          {row.discountType === 'percentage' ? `${row.discountValue}% OFF` : `$${row.discountValue} OFF`}
        </span>
      ),
    },
    {
      id: 'plans',
      header: 'Applicable Plans',
      hideBelow: 'md',
      sortValue: (row) => row.applicablePlans.join(','),
      cell: (row) => (
        <span className="text-xs text-muted-foreground font-mono capitalize">
          {row.applicablePlans.includes('all') ? 'All Plans' : row.applicablePlans.join(', ')}
        </span>
      ),
    },
    {
      id: 'redemptions',
      header: 'Redemptions',
      sortValue: (row) => row.redemptionCount,
      cell: (row) => (
        <span className="font-mono text-xs text-foreground/90">
          {row.redemptionCount}
          {row.maxRedemptions !== null ? ` / ${row.maxRedemptions}` : ' (unlimited)'}
        </span>
      ),
    },
    {
      id: 'expiresAt',
      header: 'Expiry',
      hideBelow: 'lg',
      sortValue: (row) => row.expiresAt || '',
      cell: (row) => {
        if (!row.expiresAt) return <span className="text-muted-foreground text-xs font-mono">Never</span>;
        const isExpired = new Date(row.expiresAt).getTime() < Date.now();
        return (
          <span className={`text-xs font-mono ${isExpired ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
            {format(parseISO(row.expiresAt), 'MMM dd, yyyy')}
            {isExpired && ' (Expired)'}
          </span>
        );
      },
    },
    {
      id: 'status',
      header: 'Active',
      sortValue: (row) => (row.isActive ? 1 : 0),
      cell: (row) => (
        <Switch
          checked={row.isActive}
          onCheckedChange={(checked) => toggleMutation.mutate({ id: row._id, isActive: checked })}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/billing"
            className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="size-3.5 mr-1" />
            Back to Billing & Subscriptions
          </Link>
          <PageHeading
            overline="Billing & Growth"
            title="Promo Codes & Coupons"
            description="Create custom promotional vouchers, university partnership discounts, and campaign discount codes."
          />
        </div>

        <Button
          size="lg"
          onClick={() => setIsCreateOpen(true)}
          className="h-10 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl shadow-xs"
        >
          <Plus className="size-4 mr-1.5" />
          Create Promo Code
        </Button>
      </div>

      {isLoading ? (
        <div className="rounded-xl bg-card p-4 shadow-xs">
          <SkeletonRows rows={5} />
        </div>
      ) : (
        <DataTable
          data={promoList}
          columns={columns}
          getRowId={(row) => row._id}
          loading={isLoading}
          error={error}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search promo code or description…"
          emptyTitle="No promo codes created yet"
          emptyDescription="Create your first promotional discount voucher for college placement drives."
          emptyIcon={Percent}
          emptyAction={
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold"
            >
              <Plus className="size-4 mr-1" />
              Create Promo Code
            </Button>
          }
          filters={
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-lg bg-surface-sunken px-3 text-xs sm:text-sm text-foreground outline-none border border-border/60"
            >
              <option value="all">All Codes</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          }
          rowActions={(row) => (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive hover:bg-destructive/10"
                onClick={() => {
                  if (confirm(`Delete promo code "${row.code}"?`)) {
                    deleteMutation.mutate(row._id);
                  }
                }}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          )}
          pageSize={15}
        />
      )}

      {/* ── Create Promo Code Dialog ── */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[480px] p-6">
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Percent className="size-5 text-emerald-500" />
                Create New Promo Code
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Set up a promotional coupon with percentage or fixed dollar discounts for checkout.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-2">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Promo Code *</Label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomCode}
                    className="text-2xs text-emerald-600 dark:text-emerald-400 hover:underline font-mono"
                  >
                    Generate Random
                  </button>
                </div>
                <Input
                  placeholder="e.g. CAMPUS50"
                  className="font-mono uppercase font-bold"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Internal Memo / Campaign Name</Label>
                <Input
                  placeholder="e.g. IIT Delhi Placement Sponsorship 2026"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Discount Type</Label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full h-10 rounded-lg bg-surface-sunken px-3 text-xs text-foreground outline-none border border-border"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Dollar ($)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {discountType === 'percentage' ? 'Percentage Off (%)' : 'Amount Off ($)'}
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={discountType === 'percentage' ? 100 : 1000}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Max Uses (Leave empty for unlimited)</Label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="Unlimited"
                    value={maxRedemptions}
                    onChange={(e) => setMaxRedemptions(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Expiry Date (Optional)</Label>
                  <Input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <Label className="text-xs font-semibold">Applicable Plans</Label>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    { id: 'all', label: 'All Plans' },
                    { id: 'pro_monthly', label: 'Pro Monthly' },
                    { id: 'pro_annual', label: 'Pro Annual' },
                    { id: 'oa_pass', label: 'OA Pass' },
                  ].map((p) => {
                    const isSelected = applicablePlans.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          if (p.id === 'all') {
                            setApplicablePlans(['all']);
                          } else {
                            const withoutAll = applicablePlans.filter((x) => x !== 'all');
                            if (isSelected) {
                              const remaining = withoutAll.filter((x) => x !== p.id);
                              setApplicablePlans(remaining.length ? remaining : ['all']);
                            } else {
                              setApplicablePlans([...withoutAll, p.id]);
                            }
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                            : 'bg-muted/40 border-border/60 text-muted-foreground'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Promo Code'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
