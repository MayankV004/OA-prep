'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileCode2,
  Image as ImageIcon,
  Mic,
  Monitor,
  RefreshCw,
  Save,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  X,
  XCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageHeading, Text } from '@/components/ui/typography';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import type { ITelemetryEvent } from '@/models/assessmentSubmission';

interface SubmissionDetail {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    image?: string;
    role?: string;
  };
  assessmentId?: {
    _id: string;
    title: string;
    company: string;
    difficulty: string;
    slug: string;
    durationMinutes: number;
    passingScore: number;
  };
  status: string;
  startedAt: string;
  submittedAt?: string;
  timeSpentSeconds: number;
  totalScore: number;
  maxScore: number;
  passed: boolean;
  cheatingRiskPercentage: number;
  integrityVerdict: 'clean' | 'suspicious' | 'flagged';
  activityAnalysisNarrative?: string;
  baselineSelfieUrl?: string;
  multipleFacesCount: number;
  faceAbsenceCount: number;
  prohibitedObjectCount: number;
  voiceInterruptionCount: number;
  tabSwitchCount: number;
  gazeDivertedCount: number;
  telemetryTimeline: ITelemetryEvent[];
  problemResults: Array<{
    problemId: string;
    code: string;
    language: string;
    score: number;
    passedTestCases: number;
    totalTestCases: number;
    status: string;
  }>;
}

export default function ProctoringDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [activeSnapshot, setActiveSnapshot] = useState<{
    url: string;
    type: string;
    time: string;
    details?: string;
  } | null>(null);

  const [decisionVerdict, setDecisionVerdict] = useState<'clean' | 'suspicious' | 'flagged'>('flagged');
  const [adminNotes, setAdminNotes] = useState('');

  const { data, isLoading, error } = useQuery<{ data: SubmissionDetail }>({
    queryKey: ['admin', 'proctoring', params.id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/proctoring/${params.id}`);
      if (!res.ok) throw new Error('Failed to load session audit');
      const json = await res.json();
      if (json.data) {
        setDecisionVerdict(json.data.integrityVerdict || 'flagged');
        setAdminNotes(json.data.activityAnalysisNarrative || '');
      }
      return json;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { integrityVerdict: string; adminNotes: string }) => {
      const res = await fetch(`/api/admin/proctoring/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save adjudication');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'proctoring'] });
      toast.add('Adjudication Saved', {
        description: `Candidate status updated to "${decisionVerdict.toUpperCase()}".`,
        type: 'success',
      });
    },
    onError: (err: any) => {
      toast.add('Update Failed', {
        description: err.message,
        type: 'error',
      });
    },
  });

  const sub = data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !sub) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertOctagon className="size-10 text-destructive mx-auto" />
        <h2 className="text-lg font-bold">Failed to load session evidence</h2>
        <Button variant="outline" render={<Link href="/admin/proctoring" />}>
          Back to Incident Desk
        </Button>
      </div>
    );
  }

  const timeline = sub.telemetryTimeline || [];

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/admin/proctoring" />}
          className="rounded-xl gap-1.5"
        >
          <ArrowLeft className="size-3.5" />
          <span>Incident Desk</span>
        </Button>

        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={cn(
              'font-mono uppercase font-bold text-xs px-3 py-1',
              sub.integrityVerdict === 'flagged' && 'bg-destructive/15 text-destructive border-destructive/30',
              sub.integrityVerdict === 'suspicious' && 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
              sub.integrityVerdict === 'clean' && 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
            )}
          >
            {sub.integrityVerdict}
          </Badge>
          <span className="text-xs font-mono text-muted-foreground">Session ID: {sub._id}</span>
        </div>
      </div>

      <PageHeading
        overline="Forensic Audit"
        title={`${sub.userId?.name || 'Candidate'} — ${sub.assessmentId?.company || 'Company'} OA`}
        description={`Submitted ${sub.submittedAt ? format(new Date(sub.submittedAt), 'PPP p') : 'In Progress'}. Duration: ${Math.round(sub.timeSpentSeconds / 60)} mins.`}
      />

      {/* ── Top Grid: Baseline Identity & Forensic Telemetry ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Baseline Identity Card */}
        <Card className="rounded-2xl border-border/70 shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Camera className="size-4 text-emerald-500" />
              Candidate Baseline Selfie
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative size-24 rounded-xl overflow-hidden bg-surface-sunken border border-border shrink-0">
                {sub.baselineSelfieUrl ? (
                  <img
                    src={sub.baselineSelfieUrl}
                    alt="Baseline Selfie"
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="size-full grid place-items-center text-muted-foreground text-xs font-mono">
                    No Selfie
                  </div>
                )}
              </div>

              <div className="min-w-0 space-y-1">
                <div className="font-bold text-foreground text-base truncate">
                  {sub.userId?.name || 'Anonymous'}
                </div>
                <div className="text-xs text-muted-foreground font-mono truncate">
                  {sub.userId?.email || 'N/A'}
                </div>
                <div className="text-2xs uppercase tracking-wider text-muted-foreground font-semibold pt-1">
                  OA Passing Score: {sub.assessmentId?.passingScore || 70}%
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-sunken border border-border/40 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Candidate Score:</span>
                <span className="font-mono font-bold text-foreground">
                  {sub.totalScore} / {sub.maxScore || 100} ({sub.passed ? 'Passed' : 'Failed'})
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Cheating Risk Score:</span>
                <span
                  className={cn(
                    'font-mono font-bold',
                    sub.cheatingRiskPercentage >= 65
                      ? 'text-destructive'
                      : sub.cheatingRiskPercentage >= 35
                        ? 'text-amber-500'
                        : 'text-emerald-500'
                  )}
                >
                  {sub.cheatingRiskPercentage}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Biometric & Machine Counts */}
        <Card className="rounded-2xl border-border/70 shadow-xs lg:col-span-2">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Shield className="size-4 text-primary" />
              Biometric Infraction Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-surface-sunken border border-border/40 space-y-1">
                <div className="flex items-center gap-1.5 text-2xs text-muted-foreground uppercase font-bold">
                  <Users className="size-3.5 text-destructive" />
                  Multiple Faces
                </div>
                <div className="font-mono text-xl font-bold text-foreground">
                  {sub.multipleFacesCount || 0}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-sunken border border-border/40 space-y-1">
                <div className="flex items-center gap-1.5 text-2xs text-muted-foreground uppercase font-bold">
                  <Smartphone className="size-3.5 text-destructive" />
                  Prohibited Device
                </div>
                <div className="font-mono text-xl font-bold text-foreground">
                  {sub.prohibitedObjectCount || 0}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-sunken border border-border/40 space-y-1">
                <div className="flex items-center gap-1.5 text-2xs text-muted-foreground uppercase font-bold">
                  <Monitor className="size-3.5 text-amber-500" />
                  Tab Switches
                </div>
                <div className="font-mono text-xl font-bold text-foreground">
                  {sub.tabSwitchCount || 0}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-sunken border border-border/40 space-y-1">
                <div className="flex items-center gap-1.5 text-2xs text-muted-foreground uppercase font-bold">
                  <Eye className="size-3.5 text-amber-500" />
                  Face Absence
                </div>
                <div className="font-mono text-xl font-bold text-foreground">
                  {sub.faceAbsenceCount || 0}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-sunken border border-border/40 space-y-1">
                <div className="flex items-center gap-1.5 text-2xs text-muted-foreground uppercase font-bold">
                  <Mic className="size-3.5 text-indigo-400" />
                  Voice Detected
                </div>
                <div className="font-mono text-xl font-bold text-foreground">
                  {sub.voiceInterruptionCount || 0}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-sunken border border-border/40 space-y-1">
                <div className="flex items-center gap-1.5 text-2xs text-muted-foreground uppercase font-bold">
                  <Eye className="size-3.5 text-blue-400" />
                  Gaze Deviations
                </div>
                <div className="font-mono text-xl font-bold text-foreground">
                  {sub.gazeDivertedCount || 0}
                </div>
              </div>
            </div>

            {/* Groq LLM Forensic Narrative */}
            <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-primary">
                <Sparkles className="size-4" />
                AI Forensic Analysis (Llama 3.3 Engine)
              </div>
              <p className="text-xs text-foreground/90 leading-relaxed font-sans">
                {sub.activityAnalysisNarrative ||
                  'No forensic narrative generated. Evaluation scored automatically via deterministic fallback.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Chronological Telemetry Scrubber ── */}
      <Card className="rounded-2xl border-border/70 shadow-xs">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              Chronological Telemetry Timeline ({timeline.length} Events)
            </CardTitle>
            <span className="text-2xs text-muted-foreground font-mono">
              Cloudflare R2 Snapshots Vault Active
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {timeline.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No anomaly events were logged during this candidate session.
            </div>
          ) : (
            <div className="space-y-3">
              {timeline.map((event, idx) => {
                const isViolation =
                  event.type === 'multiple_faces' ||
                  event.type === 'prohibited_object_detected';
                const hasSnapshot = Boolean(event.snapshotUrl);

                return (
                  <div
                    key={idx}
                    className={cn(
                      'flex items-start justify-between gap-4 p-3.5 rounded-xl border transition-all',
                      isViolation
                        ? 'border-destructive/30 bg-destructive/5'
                        : 'border-border/40 bg-surface-sunken/40'
                    )}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={cn(
                          'size-8 rounded-lg grid place-items-center shrink-0 text-white font-mono text-xs',
                          isViolation ? 'bg-destructive' : 'bg-muted-foreground/30 text-foreground'
                        )}
                      >
                        {idx + 1}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-foreground font-mono">
                            {event.type.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          <span className="text-2xs text-muted-foreground font-mono">
                            {format(new Date(event.timestamp), 'HH:mm:ss')}
                          </span>
                        </div>
                        {event.details && (
                          <p className="text-xs text-muted-foreground truncate">{event.details}</p>
                        )}
                      </div>
                    </div>

                    {hasSnapshot && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setActiveSnapshot({
                            url: event.snapshotUrl!,
                            type: event.type,
                            time: format(new Date(event.timestamp), 'HH:mm:ss'),
                            details: event.details,
                          })
                        }
                        className="gap-1.5 text-xs shrink-0 font-medium"
                      >
                        <ImageIcon className="size-3.5 text-emerald-500" />
                        <span>View Evidence</span>
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Adjudication & Decision Desk ── */}
      <Card className="rounded-2xl border-border/70 shadow-xs">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-500" />
            Adjudication & Final Verdict
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Integrity Verdict</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={decisionVerdict === 'clean' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDecisionVerdict('clean')}
                className="gap-1.5"
              >
                <ShieldCheck className="size-3.5 text-emerald-500" />
                Verified Clean (Clear Flags)
              </Button>

              <Button
                type="button"
                variant={decisionVerdict === 'suspicious' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDecisionVerdict('suspicious')}
                className="gap-1.5"
              >
                <AlertTriangle className="size-3.5 text-amber-500" />
                Mark Under Suspicion
              </Button>

              <Button
                type="button"
                variant={decisionVerdict === 'flagged' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDecisionVerdict('flagged')}
                className="gap-1.5 text-destructive"
              >
                <ShieldAlert className="size-3.5" />
                Confirm Disqualification
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-notes" className="text-xs font-semibold">
              Adjudication Audit Notes
            </Label>
            <Textarea
              id="admin-notes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Provide internal review justification for this verdict..."
              className="h-24 text-xs font-sans"
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() =>
                updateMutation.mutate({
                  integrityVerdict: decisionVerdict,
                  adminNotes,
                })
              }
              loading={updateMutation.isPending}
              className="gap-1.5 font-semibold rounded-xl"
            >
              <Save className="size-4" />
              Save Adjudication Verdict
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Snapshot Preview Modal */}
      {activeSnapshot && (
        <Dialog open={Boolean(activeSnapshot)} onOpenChange={() => setActiveSnapshot(null)}>
          <DialogContent className="sm:max-w-xl p-6 rounded-2xl">
            <DialogHeader className="pb-3 border-b border-border/40">
              <DialogTitle className="text-sm font-bold flex items-center justify-between">
                <span>R2 Snapshot Vault Evidence</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {activeSnapshot.time}
                </span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-border">
                <img
                  src={activeSnapshot.url}
                  alt="Proctoring Snapshot"
                  className="size-full object-contain"
                />
              </div>

              <div className="p-3 rounded-xl bg-surface-sunken border border-border/40 text-xs space-y-1">
                <div className="font-bold text-foreground uppercase tracking-wider text-2xs">
                  Event: {activeSnapshot.type.replace(/_/g, ' ')}
                </div>
                {activeSnapshot.details && (
                  <div className="text-muted-foreground">{activeSnapshot.details}</div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
