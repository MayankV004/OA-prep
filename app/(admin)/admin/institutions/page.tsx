'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  GraduationCap,
  Building2,
  Users,
  Calendar,
  ShieldCheck,
  Plus,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeading, Text } from '@/components/ui/typography';
import { DataTable, type Column } from '@/components/admin/DataTable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface InstitutionRow {
  _id: string;
  name: string;
  slug: string;
  domain: string;
  totalSeats: number;
  usedSeats: number;
  licenseValidUntil: string;
  status: 'active' | 'suspended' | 'expired';
  memberCount: number;
  driveCount: number;
  liveDrivesCount: number;
  createdAt: string;
}

interface ApiResponse {
  institutions: InstitutionRow[];
  metrics: {
    totalInstitutions: number;
    activeInstitutions: number;
    totalSeatsAllocated: number;
    totalSeatsUsed: number;
  };
}

export default function AdminInstitutionsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [totalSeats, setTotalSeats] = useState(250);
  const [licenseDays, setLicenseDays] = useState(365);

  const { data, isLoading, isRefetching, refetch } = useQuery<ApiResponse>({
    queryKey: ['admin-institutions', search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`/api/admin/institutions?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch institutions');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: {
      name: string;
      domain: string;
      totalSeats: number;
      licenseValidUntil: string;
    }) => {
      const res = await fetch('/api/admin/institutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create campus');
      return json;
    },
    onSuccess: () => {
      toast.success('Campus partner provisioned successfully');
      setIsDialogOpen(false);
      setName('');
      setDomain('');
      setTotalSeats(250);
      queryClient.invalidateQueries({ queryKey: ['admin-institutions'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Could not provision campus');
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Campus name is required');
      return;
    }
    const expiry = new Date(Date.now() + licenseDays * 86400000).toISOString();
    createMutation.mutate({
      name: name.trim(),
      domain: domain.trim(),
      totalSeats: Number(totalSeats),
      licenseValidUntil: expiry,
    });
  };

  const columns: Column<InstitutionRow>[] = [
    {
      id: 'name',
      header: 'Campus / Institution',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-primary/10 text-primary font-bold">
            {row.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <Link
              href={`/admin/institutions/${row._id}`}
              className="font-medium text-foreground hover:text-primary transition-colors block truncate"
            >
              {row.name}
            </Link>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>/{row.slug}</span>
              {row.domain && <span>&bull; @{row.domain}</span>}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'seats',
      header: 'Seat Capacity',
      cell: (row) => {
        const pct = Math.min(100, Math.round(((row.usedSeats || 0) / (row.totalSeats || 1)) * 100));
        return (
          <div className="w-40 space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span>{row.usedSeats || 0} used</span>
              <span className="text-muted-foreground">{row.totalSeats} max</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={cn(
                  'h-full transition-all',
                  pct > 90 ? 'bg-rose-500' : pct > 70 ? 'bg-amber-500' : 'bg-primary'
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      id: 'leadership',
      header: 'TPC Team',
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5 text-primary" />
          <span>{row.memberCount} members</span>
        </div>
      ),
    },
    {
      id: 'drives',
      header: 'Drives',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="text-xs">{row.driveCount} total</span>
          {row.liveDrivesCount > 0 && (
            <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-500 text-[10px] animate-pulse">
              <Radio className="mr-1 h-2.5 w-2.5" />
              {row.liveDrivesCount} Live
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: 'validity',
      header: 'License Expiry',
      cell: (row) => {
        const isExpired = new Date(row.licenseValidUntil) < new Date();
        return (
          <div className="text-xs space-y-0.5">
            <div className={cn(isExpired ? 'text-rose-500 font-medium' : 'text-foreground')}>
              {format(new Date(row.licenseValidUntil), 'MMM d, yyyy')}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {isExpired ? 'Expired' : 'Active contract'}
            </div>
          </div>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => {
        const variants: Record<string, string> = {
          active: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500',
          suspended: 'border-rose-500/40 bg-rose-500/10 text-rose-500',
          expired: 'border-amber-500/40 bg-amber-500/10 text-amber-500',
        };
        return (
          <Badge variant="outline" className={variants[row.status] || ''}>
            {row.status.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Link href={`/admin/institutions/${row._id}`}>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              Manage
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  const metrics = data?.metrics;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <PageHeading
        title="Campus & Institutional Control Hub"
        description="Provision enterprise partner colleges, govern seat licenses, and inspect placement drive execution nationwide."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/admin/institutions/live-drives">
              <Button variant="outline" size="sm">
                <Radio className="mr-2 h-4 w-4 text-emerald-500" />
                Live Drives Radar
              </Button>
            </Link>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger
                render={
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Provision Campus
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Provision Partner Campus</DialogTitle>
                  <DialogDescription>
                    Create a new institutional tenant license. TPC coordinators will access their dedicated portal under this organization.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Institution / University Name</label>
                    <Input
                      placeholder="e.g. Indian Institute of Technology Bombay"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Domain Filter (Optional)</label>
                    <Input
                      placeholder="e.g. iitb.ac.in"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      Restricts student and coordinator roster to authorized academic email domains.
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">Total Seat Licenses</label>
                      <Input
                        type="number"
                        min="10"
                        max="50000"
                        value={totalSeats}
                        onChange={(e) => setTotalSeats(Number(e.target.value))}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">License Duration</label>
                      <select
                        value={licenseDays}
                        onChange={(e) => setLicenseDays(Number(e.target.value))}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                      >
                        <option value={90}>3 Months (Pilot)</option>
                        <option value={180}>6 Months (Semester)</option>
                        <option value={365}>1 Year (Annual Enterprise)</option>
                        <option value={730}>2 Years (Multi-Year)</option>
                      </select>
                    </div>
                  </div>
                  <DialogFooter className="pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={createMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? 'Provisioning...' : 'Confirm Provisioning'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              Partner Campuses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalInstitutions ?? 0}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {metrics?.activeInstitutions ?? 0} active partner contracts
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Active Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.totalInstitutions
                ? Math.round(((metrics.activeInstitutions || 0) / metrics.totalInstitutions) * 100)
                : 100}
              %
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Healthy tenant operations</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Allocated Seats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metrics?.totalSeatsAllocated ?? 0).toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Contracted candidate licenses</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-500" />
              Active Seat Burn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metrics?.totalSeatsUsed ?? 0).toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {metrics?.totalSeatsAllocated
                ? Math.round(((metrics.totalSeatsUsed || 0) / metrics.totalSeatsAllocated) * 100)
                : 0}
              % overall seat consumption
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campuses by name, slug, or domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-xs"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Directory Table */}
      <DataTable
        columns={columns}
        data={data?.institutions || []}
        getRowId={(row) => row._id}
        loading={isLoading}
        emptyTitle="No partner campuses found"
        emptyDescription="Try adjusting your search criteria or provision a new campus partner."
        exportable
        exportFilename="bigo_campus_partners"
        columnVisibility
      />
    </div>
  );
}
