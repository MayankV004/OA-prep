'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Radio,
  Clock,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Users,
  CheckCircle2,
  ExternalLink,
  Search,
  Loader2,
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

interface DriveRow {
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
  activeSubmissions: number;
  completedSubmissions: number;
  flaggedSubmissions: number;
}

function PortalDrivesContent() {
  const searchParams = useSearchParams();
  const instId = searchParams.get('institutionId');
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState<'all' | 'live' | 'scheduled' | 'completed'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [assessmentId, setAssessmentId] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [strictProctoring, setStrictProctoring] = useState(true);
  const [domainRestriction, setDomainRestriction] = useState('');

  const buildHref = (path: string) => (instId ? `${path}?institutionId=${instId}` : path);

  const { data, isLoading } = useQuery({
    queryKey: ['portal-drives', instId],
    queryFn: async () => {
      const url = instId ? `/api/portal/drives?institutionId=${instId}` : '/api/portal/drives';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load drives');
      return res.json();
    },
  });

  const createDriveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const url = instId ? `/api/portal/drives?institutionId=${instId}` : '/api/portal/drives';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to schedule drive');
      return json;
    },
    onSuccess: () => {
      toast.success('Placement drive scheduled successfully');
      setIsDialogOpen(false);
      setTitle('');
      setAssessmentId('');
      setStartsAt('');
      setEndsAt('');
      queryClient.invalidateQueries({ queryKey: ['portal-drives', instId] });
      queryClient.invalidateQueries({ queryKey: ['portal-overview-data', instId] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error scheduling drive');
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assessmentId || !startsAt || !endsAt) {
      toast.error('Please fill in all required fields');
      return;
    }
    createDriveMutation.mutate({
      title: title.trim(),
      assessmentId,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      durationMinutes: Number(durationMinutes),
      strictProctoring,
      allowedEmailDomains: domainRestriction ? [domainRestriction.trim()] : [],
    });
  };

  const drives: DriveRow[] = data?.drives || [];
  const assessments = data?.availableAssessments || [];

  const filteredDrives = drives.filter((d) => {
    if (filter === 'all') return true;
    return d.status === filter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Schedule CTA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Placement Drives</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Configure campus coding rounds, monitor live candidate concurrency, and inspect proctoring integrity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger
              render={
                <Button size="sm">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Schedule Placement Drive
                </Button>
              }
            />
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule Placement Drive</DialogTitle>
                <DialogDescription>
                  Choose a verified assessment and specify the candidate testing window.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="space-y-3 py-2 text-xs">
                <div className="space-y-1">
                  <label className="font-medium">Drive Title</label>
                  <Input
                    placeholder="e.g. 2026 Campus Drive - Technical Screening"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium">Assessment Module</label>
                  <select
                    value={assessmentId}
                    onChange={(e) => setAssessmentId(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                    required
                  >
                    <option value="">Select an Assessment...</option>
                    {assessments.map((a: any) => (
                      <option key={a._id} value={a._id}>
                        {a.title} ({a.timeLimitMinutes || 90}m, Pass: {a.passingPercentage || 60}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-medium">Start Window</label>
                    <Input
                      type="datetime-local"
                      value={startsAt}
                      onChange={(e) => setStartsAt(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium">End Window</label>
                    <Input
                      type="datetime-local"
                      value={endsAt}
                      onChange={(e) => setEndsAt(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-medium">Duration (Minutes)</label>
                    <Input
                      type="number"
                      min="15"
                      max="300"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium">Domain Filter (Optional)</label>
                    <Input
                      placeholder="e.g. @campus.edu"
                      value={domainRestriction}
                      onChange={(e) => setDomainRestriction(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="strictProc"
                    checked={strictProctoring}
                    onChange={(e) => setStrictProctoring(e.target.checked)}
                    className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                  />
                  <label htmlFor="strictProc" className="font-medium cursor-pointer">
                    Enforce AI Biometric Proctoring & Tab Switch Lockdown
                  </label>
                </div>

                <DialogFooter className="pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={createDriveMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createDriveMutation.isPending}>
                    {createDriveMutation.isPending ? 'Scheduling...' : 'Schedule Drive'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['all', 'live', 'scheduled', 'completed'] as const).map((tab) => (
          <Button
            key={tab}
            variant={filter === tab ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-xs capitalize"
            onClick={() => setFilter(tab)}
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Drives List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            Loading placement drives...
          </div>
        ) : filteredDrives.length === 0 ? (
          <Card className="border-border/60 bg-card/60">
            <CardContent className="py-12 text-center text-xs text-muted-foreground space-y-2">
              <Calendar className="h-8 w-8 mx-auto text-muted-foreground/60" />
              <p>No placement drives match the current filter.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredDrives.map((d) => (
              <Card key={d._id} className="border-border/60 bg-card/60 hover:border-border transition-colors">
                <CardContent className="p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  {/* Left Column: Drive Details */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">{d.title}</span>
                      {d.status === 'live' && (
                        <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-500 text-[10px] animate-pulse">
                          <Radio className="mr-1 h-2.5 w-2.5" /> LIVE NOW
                        </Badge>
                      )}
                      {d.status === 'scheduled' && (
                        <Badge variant="outline" className="border-blue-500/40 bg-blue-500/10 text-blue-500 text-[10px]">
                          SCHEDULED
                        </Badge>
                      )}
                      {d.status === 'completed' && (
                        <Badge variant="outline" className="border-muted bg-muted/20 text-muted-foreground text-[10px]">
                          COMPLETED
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>Assessment: <strong className="text-foreground">{d.assessmentId?.title || 'Custom'}</strong></span>
                      <span>&bull;</span>
                      <span>Duration: {d.durationMinutes} mins</span>
                      <span>&bull;</span>
                      <span>
                        Window: {format(new Date(d.startsAt), 'MMM d, h:mm a')} – {format(new Date(d.endsAt), 'h:mm a')}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Telemetry & Entry Action */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3 text-xs">
                      {d.status === 'live' && (
                        <div className="font-mono text-emerald-400 font-semibold flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          <span>{d.activeSubmissions} Taking Test</span>
                        </div>
                      )}
                      <div className="text-muted-foreground font-mono">
                        {d.completedSubmissions} Submitted
                      </div>
                      {d.flaggedSubmissions > 0 && (
                        <Badge variant="outline" className="border-rose-500/40 bg-rose-500/10 text-rose-500 text-[10px]">
                          <ShieldAlert className="mr-1 h-2.5 w-2.5" />
                          {d.flaggedSubmissions} Flagged
                        </Badge>
                      )}
                    </div>

                    <Link href={buildHref(`/portal/drives/${d._id}`)}>
                      <Button size="sm" variant={d.status === 'live' ? 'default' : 'outline'} className="text-xs h-8">
                        {d.status === 'live' ? 'Live Invigilation Room' : 'View Drive Details'}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PortalDrivesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
          <Loader2 className="size-7 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">Loading placement drives...</span>
        </div>
      }
    >
      <PortalDrivesContent />
    </Suspense>
  );
}

