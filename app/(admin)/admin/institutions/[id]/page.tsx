'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  GraduationCap,
  Users,
  Calendar,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Mail,
  UserCheck,
  Building,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeading, Text } from '@/components/ui/typography';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface MemberItem {
  _id: string;
  role: 'head' | 'coordinator' | 'invigilator';
  department: string;
  status: 'active' | 'invited' | 'revoked';
  userId?: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  createdAt: string;
}

interface DriveItem {
  _id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  strictProctoring: boolean;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  assessmentId?: {
    _id: string;
    title: string;
    passingPercentage: number;
  };
}

interface InstitutionDetail {
  _id: string;
  name: string;
  slug: string;
  domain: string;
  totalSeats: number;
  usedSeats: number;
  licenseValidUntil: string;
  status: 'active' | 'suspended' | 'expired';
  createdAt: string;
}

export default function AdminInstitutionDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(props.params);
  const queryClient = useQueryClient();

  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState<'head' | 'coordinator' | 'invigilator'>('coordinator');
  const [memberDept, setMemberDept] = useState('');

  // Editable license state
  const [editSeats, setEditSeats] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<string | null>(null);
  const [editDomain, setEditDomain] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{
    institution: InstitutionDetail;
    members: MemberItem[];
    drives: DriveItem[];
  }>({
    queryKey: ['admin-institution-detail', id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/institutions/${id}`);
      if (!res.ok) throw new Error('Failed to load institution details');
      return res.json();
    },
  });

  const institution = data?.institution;
  const members = data?.members || [];
  const drives = data?.drives || [];

  const currentSeats = editSeats ?? institution?.totalSeats ?? 100;
  const currentStatus = editStatus ?? institution?.status ?? 'active';
  const currentDomain = editDomain ?? institution?.domain ?? '';

  const updateMutation = useMutation({
    mutationFn: async (payload: Partial<InstitutionDetail>) => {
      const res = await fetch(`/api/admin/institutions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update campus');
      return json;
    },
    onSuccess: () => {
      toast.success('Campus settings saved');
      queryClient.invalidateQueries({ queryKey: ['admin-institution-detail', id] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Update failed');
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: async (payload: { email: string; role: string; department: string }) => {
      const res = await fetch(`/api/admin/institutions/${id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to add member');
      return json;
    },
    onSuccess: () => {
      toast.success('Member assigned to TPC roster');
      setIsMemberDialogOpen(false);
      setMemberEmail('');
      setMemberDept('');
      queryClient.invalidateQueries({ queryKey: ['admin-institution-detail', id] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Could not add member');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await fetch(`/api/admin/institutions/${id}/members?memberId=${memberId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove member');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Member removed from campus');
      queryClient.invalidateQueries({ queryKey: ['admin-institution-detail', id] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to remove member');
    },
  });

  const handleSaveLicense = () => {
    updateMutation.mutate({
      totalSeats: Number(currentSeats),
      status: currentStatus as any,
      domain: currentDomain,
    });
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberEmail.trim()) {
      toast.error('Email is required');
      return;
    }
    addMemberMutation.mutate({
      email: memberEmail.trim(),
      role: memberRole,
      department: memberDept.trim(),
    });
  };

  if (isLoading || !institution) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Loading campus governance data...
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    head: 'Head of TPC',
    coordinator: 'Placement Coordinator',
    invigilator: 'Live Invigilator',
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <Link href="/admin/institutions">
          <Button variant="ghost" size="sm" className="-ml-2 text-xs text-muted-foreground">
            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to Campuses
          </Button>
        </Link>
      </div>

      {/* Header */}
      <PageHeading
        title={institution.name}
        overline={
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] tracking-wide font-mono uppercase',
              institution.status === 'active'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500'
                : 'border-rose-500/40 bg-rose-500/10 text-rose-500'
            )}
          >
            {institution.status}
          </Badge>
        }
        description={`Domain: @${institution.domain || 'Unrestricted'} • Slug: /${institution.slug} • Created ${format(new Date(institution.createdAt), 'MMM d, yyyy')}`}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/portal?institutionId=${institution._id}`} target="_blank">
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                Launch Portal in Observer Mode
              </Button>
            </Link>
          </div>
        }
      />

      {/* Grid of Governance & Settings */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Seat License Governance */}
        <Card className="border-border/60 bg-card/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              License & Capacity Allocation
            </CardTitle>
            <CardDescription className="text-xs">
              Configure maximum contracted student seats and tenant status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Total Seat Licenses</label>
              <Input
                type="number"
                min="10"
                value={currentSeats}
                onChange={(e) => setEditSeats(Number(e.target.value))}
              />
              <span className="text-[10px] text-muted-foreground">
                Currently utilized: {institution.usedSeats} / {currentSeats} seats (
                {Math.round((institution.usedSeats / (currentSeats || 1)) * 100)}%)
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Campus Domain Restriction</label>
              <Input
                value={currentDomain}
                onChange={(e) => setEditDomain(e.target.value)}
                placeholder="e.g. iitb.ac.in"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Account Status</label>
              <select
                value={currentStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
              >
                <option value="active">Active (Access Allowed)</option>
                <option value="suspended">Suspended (Lockout)</option>
                <option value="expired">Expired Contract</option>
              </select>
            </div>

            <div className="pt-2">
              <Button
                onClick={handleSaveLicense}
                disabled={updateMutation.isPending}
                size="sm"
                className="w-full"
              >
                <Save className="mr-2 h-3.5 w-3.5" />
                {updateMutation.isPending ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* TPC Leadership & Team Roster */}
        <Card className="border-border/60 bg-card/60 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                TPC Leadership & Roster ({members.length})
              </CardTitle>
              <CardDescription className="text-xs">
                College staff authorized to schedule placement drives and invigilate students.
              </CardDescription>
            </div>
            <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
              <DialogTrigger
                render={
                  <Button size="sm" variant="outline" className="h-8 text-xs">
                    <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Member
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Campus Team Member</DialogTitle>
                  <DialogDescription>
                    Assign a faculty or student coordinator to manage placement drives for {institution.name}.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddMemberSubmit} className="space-y-3 py-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">User Email</label>
                    <Input
                      type="email"
                      placeholder="coordinator@campus.edu"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Role Assignment</label>
                    <select
                      value={memberRole}
                      onChange={(e) => setMemberRole(e.target.value as any)}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                    >
                      <option value="head">Head of TPC (Full College Portal Control)</option>
                      <option value="coordinator">Placement Coordinator (Schedule & Export)</option>
                      <option value="invigilator">Invigilator (Live Monitoring Only)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Department (Optional)</label>
                    <Input
                      placeholder="e.g. Computer Science & Engineering"
                      value={memberDept}
                      onChange={(e) => setMemberDept(e.target.value)}
                    />
                  </div>
                  <DialogFooter className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsMemberDialogOpen(false)}
                      disabled={addMemberMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={addMemberMutation.isPending}>
                      {addMemberMutation.isPending ? 'Assigning...' : 'Assign Member'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No TPC members assigned yet. Click &ldquo;Add Member&rdquo; to designate college coordinators.
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {members.map((m) => (
                  <div key={m._id} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold uppercase">
                        {m.userId?.name?.substring(0, 2) || m.userId?.email?.substring(0, 2) || 'TP'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-foreground truncate">
                          {m.userId?.name || 'Unnamed User'}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {m.userId?.email} {m.department ? `• ${m.department}` : ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {roleLabels[m.role] || m.role}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMemberMutation.mutate(m._id)}
                        disabled={removeMemberMutation.isPending}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500"
                        title="Remove member"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cohort Drives Table */}
      <Card className="border-border/60 bg-card/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Scheduled & Past Placement Drives ({drives.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {drives.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No placement drives scheduled for this campus yet.
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {drives.map((d) => (
                <div key={d._id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-xs font-medium text-foreground">{d.title}</div>
                    <div className="text-[11px] text-muted-foreground">
                      Assessment: {d.assessmentId?.title || 'Custom Test'} • Duration: {d.durationMinutes} mins
                      • Window: {format(new Date(d.startsAt), 'MMM d, h:mm a')} – {format(new Date(d.endsAt), 'h:mm a')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {d.strictProctoring && (
                      <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-500 text-[10px]">
                        Strict Proctoring
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {d.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
