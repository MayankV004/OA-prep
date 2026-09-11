'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  CheckCircle2,
  Mail,
  Building,
  Info,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface MemberRow {
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

export default function PortalTeamPage() {
  const searchParams = useSearchParams();
  const instId = searchParams.get('institutionId');
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'coordinator' | 'invigilator'>('coordinator');
  const [department, setDepartment] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['portal-team', instId],
    queryFn: async () => {
      const url = instId ? `/api/portal/team?institutionId=${instId}` : '/api/portal/team';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load team roster');
      return res.json();
    },
  });

  const members: MemberRow[] = data?.members || [];
  const currentRole = data?.currentRole;
  const canManage = currentRole === 'head' || currentRole === 'admin';

  const addMemberMutation = useMutation({
    mutationFn: async (payload: any) => {
      const url = instId ? `/api/portal/team?institutionId=${instId}` : '/api/portal/team';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to add member');
      return json;
    },
    onSuccess: () => {
      toast.success('Team member invited to campus portal');
      setIsDialogOpen(false);
      setEmail('');
      setDepartment('');
      queryClient.invalidateQueries({ queryKey: ['portal-team', instId] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error inviting member');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const url = instId
        ? `/api/portal/team?memberId=${memberId}&institutionId=${instId}`
        : `/api/portal/team?memberId=${memberId}`;
      const res = await fetch(url, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to remove member');
      return json;
    },
    onSuccess: () => {
      toast.success('Member removed from campus roster');
      queryClient.invalidateQueries({ queryKey: ['portal-team', instId] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error removing member');
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Valid email is required');
      return;
    }
    addMemberMutation.mutate({
      email: email.trim(),
      role,
      department: department.trim(),
    });
  };

  const roleLabels: Record<string, string> = {
    head: 'TPC Head',
    coordinator: 'Placement Coordinator',
    invigilator: 'Live Invigilator',
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">TPC Team & Roster</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Authorize college placement officers, student coordinators, and invigilators to run drives.
          </p>
        </div>

        {canManage && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger
              render={
                <Button size="sm">
                  <UserPlus className="mr-1.5 h-4 w-4" />
                  Invite Team Member
                </Button>
              }
            />
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Placement Coordinator</DialogTitle>
                <DialogDescription>
                  Grant access to schedule drives or invigilate coding rounds for your campus.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddSubmit} className="space-y-3 py-2 text-xs">
                <div className="space-y-1">
                  <label className="font-medium">Academic Email</label>
                  <Input
                    type="email"
                    placeholder="coordinator@campus.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium">Role Responsibility</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                  >
                    <option value="coordinator">Placement Coordinator (Schedule, Export, Invigilate)</option>
                    <option value="invigilator">Live Invigilator (Live Monitoring Only)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-medium">Department / Branch</label>
                  <Input
                    placeholder="e.g. Dept of Computer Engineering"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>

                <DialogFooter className="pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={addMemberMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addMemberMutation.isPending}>
                    {addMemberMutation.isPending ? 'Inviting...' : 'Invite Member'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Role Explainer Card */}
      <Card className="border-border/60 bg-card/60">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 text-xs text-muted-foreground">
          <div className="flex-1 space-y-1">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-primary" /> Head of TPC
            </span>
            <p className="text-[11px]">
              Full administrative governance over campus portal, license capacity, scheduling drives, and managing team coordinators.
            </p>
          </div>
          <div className="flex-1 space-y-1">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-blue-400" /> Placement Coordinator
            </span>
            <p className="text-[11px]">
              Can create and schedule placement rounds, monitor live test sessions, and export scorecard analytics to CSV.
            </p>
          </div>
          <div className="flex-1 space-y-1">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Live Invigilator
            </span>
            <p className="text-[11px]">
              Dedicated proctoring desk observer during active drives. Can view live webcam/tab integrity feeds in real-time.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Roster List */}
      <Card className="border-border/60 bg-card/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Authorized Placement Staff ({members.length})
          </CardTitle>
          <CardDescription className="text-xs">
            Members authenticated to view institutional placement operations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Loading team members...
            </div>
          ) : members.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No additional team members assigned yet.
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {members.map((m) => (
                <div key={m._id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold uppercase">
                      {m.userId?.name?.substring(0, 2) || m.userId?.email?.substring(0, 2) || 'TP'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-foreground truncate">
                        {m.userId?.name || 'Authorized Member'}
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
                    <span className="text-[10px] text-muted-foreground hidden sm:inline">
                      Joined {format(new Date(m.createdAt), 'MMM d, yyyy')}
                    </span>

                    {canManage && m.role !== 'head' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMemberMutation.mutate(m._id)}
                        disabled={removeMemberMutation.isPending}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500"
                        title="Remove coordinator"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
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
