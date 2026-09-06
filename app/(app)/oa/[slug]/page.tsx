'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Timer,
  ShieldAlert,
  Building2,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Lock,
  FileCode2,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { PaywallModal } from '@/components/pricing/PaywallModal';
import { ProBadge } from '@/components/pricing/ProBadge';
import { cn } from '@/lib/utils';

export default function AssessmentBriefingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();

  const [assessment, setAssessment] = useState<any>(null);
  const [latestSubmission, setLatestSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [agreedToProctor, setAgreedToProctor] = useState(true);

  useEffect(() => {
    fetch(`/api/oa/assessments/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAssessment(data.assessment);
          setLatestSubmission(data.latestCompletedSubmission);
        }
      })
      .catch((err) => console.error('Error fetching briefing:', err))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleStart = async () => {
    if (assessment?.isLocked) {
      setPaywallOpen(true);
      return;
    }

    setStarting(true);
    try {
      const res = await fetch(`/api/oa/assessments/${slug}/start`, {
        method: 'POST',
      });
      const data = await res.json();

      if (data.success) {
        router.push(`/oa/${slug}/test`);
      } else if (data.code === 'UPGRADE_REQUIRED') {
        setPaywallOpen(true);
      } else {
        alert(data.message || 'Failed to start assessment. Please ensure you are logged in.');
      }
    } catch (err) {
      console.error('Failed to start test:', err);
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="animate-spin rounded-full size-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-foreground">Assessment Not Found</h2>
        <Link href="/oa">
          <button className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground">
            Return to OA Catalog
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 w-full">
      {/* Full-width Borderless Header */}
      <div className="w-full px-6 sm:px-10 lg:px-14 pt-8 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Building2 className="size-3.5 text-primary" />
                {assessment.company}
              </span>
              <span className="text-xs font-mono text-muted-foreground">• {assessment.role}</span>
              {assessment.isProOnly && <ProBadge />}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              {assessment.title}
            </h1>
          </div>

          {/* Quick Meta Stats Pills (Borderless) */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-muted/40 px-4 py-2 rounded-xl text-xs font-mono">
              <Clock className="size-4 text-primary" />
              <span className="font-bold text-foreground">{assessment.durationMinutes} Minutes</span>
            </div>
            <div className="flex items-center gap-2 bg-muted/40 px-4 py-2 rounded-xl text-xs font-mono">
              <span className="text-muted-foreground">Cutoff:</span>
              <span className="font-bold text-primary">{assessment.passingScore}%</span>
            </div>
            <div className="flex items-center gap-2 bg-muted/40 px-4 py-2 rounded-xl text-xs font-mono">
              <span className="text-muted-foreground">Format:</span>
              <span className="font-bold text-foreground">{assessment.problems?.length || 2} Coding Challenges</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Instructions Area (Borderless & Full-Width) */}
      <div className="w-full px-6 sm:px-10 lg:px-14 space-y-8">
        {/* Previous Attempt Banner if any (Borderless) */}
        {latestSubmission && (
          <div className="p-5 rounded-2xl bg-muted/20 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-2xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                Previous Attempt
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold font-mono text-foreground">
                  Score: {latestSubmission.totalScore}%
                </span>
                <span
                  className={cn(
                    'px-2.5 py-0.5 rounded-full text-2xs font-bold font-mono uppercase',
                    latestSubmission.passed
                      ? 'bg-primary/10 text-primary'
                      : 'bg-amber-500/10 text-amber-500'
                  )}
                >
                  {latestSubmission.passed ? 'Passed Bar' : 'Below Cutoff'}
                </span>
              </div>
            </div>

            <Link href={`/oa/${slug}/report/${latestSubmission.submissionId}`}>
              <button className="px-4 py-2 rounded-xl text-xs font-bold bg-muted/60 hover:bg-muted text-foreground transition-all cursor-pointer">
                View Past Scorecard & Diagnostic →
              </button>
            </Link>
          </div>
        )}

        {/* Strict Proctoring & Telemetry Pillars (Borderless Cards) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="size-4 text-primary" />
            <span>Multi-Modal Proctoring & Telemetry Engine</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-muted/25 space-y-2">
              <div className="font-bold text-sm text-foreground">Camera & Face Tracking</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Live webcam monitors facial presence. Unregistered absences or multiple people trigger instant audit flags.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-muted/25 space-y-2">
              <div className="font-bold text-sm text-foreground">Eye Gaze & Head Pose</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Computer vision detects sustained off-screen glances (&gt;3.0s), identifying potential secondary screens or notes.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-muted/25 space-y-2">
              <div className="font-bold text-sm text-foreground">Microphone & Voice Audio</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Web Audio acoustic sensors detect ambient human speech and conversational voice spikes in real time.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-muted/25 space-y-2">
              <div className="font-bold text-sm text-foreground">Strict Paste Lockdown</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                External clipboard insertion is hard-blocked. All code must be typed manually; attempted pastes are logged.
              </p>
            </div>
          </div>
        </div>

        {/* Assessment Environment & Company Instructions (2-Column Full Width Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Assessment Format & Testing Constraints */}
          <div className="p-6 rounded-2xl bg-muted/20 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
              Assessment Structure & Constraints
            </h3>

            <div className="space-y-3 text-xs text-muted-foreground">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Blind Assessment:</strong> Coding questions remain hidden until the test environment initializes, matching real-world Online Assessment conditions.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">AI Forensic Analysis:</strong> Post-test report includes an LLM-synthesized behavioral integrity breakdown correlating keystrokes, eye gaze, and time-per-problem.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Execution Limits:</strong> 2.0 seconds execution timeout per testcase and 512 MB memory threshold strictly enforced.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Supported Runtimes:</strong> C++20, Python 3, and Java 21 with syntax highlighting and full screen editor.
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Company Specific Instructions & Guidelines */}
          <div className="p-6 rounded-2xl bg-muted/20 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
              {assessment.company} Candidate Protocol
            </h3>

            <div className="space-y-3 text-xs text-muted-foreground">
              {assessment.companyInstructions?.map((inst: string, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                  <span>{inst}</span>
                </div>
              ))}
              <div className="flex items-start gap-3">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                <span>Ensure your camera and microphone remain unblocked. Closing or switching browser tabs will penalize your risk score.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Acknowledgement Checkbox & CTA Buttons (Borderless) */}
        <div className="p-6 rounded-2xl bg-muted/25 space-y-6">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="proctor-agree"
              checked={agreedToProctor}
              onChange={(e) => setAgreedToProctor(e.target.checked)}
              className="size-4 rounded accent-primary cursor-pointer"
            />
            <label htmlFor="proctor-agree" className="text-xs text-foreground font-medium cursor-pointer">
              I acknowledge that this test enforces strict proctoring (camera, microphone, eye gaze tracking, tab switches, blocked copy-pastes) and will generate an AI behavioral integrity report.
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <Link href="/oa">
              <button className="px-5 py-3 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer bg-muted/50 hover:bg-muted">
                ← Back to OA Catalog
              </button>
            </Link>

            {assessment.isLocked ? (
              <button
                onClick={() => setPaywallOpen(true)}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
              >
                <Sparkles className="size-4" />
                <span>Unlock with BigO Pro</span>
              </button>
            ) : (
              <button
                onClick={handleStart}
                disabled={!agreedToProctor || starting}
                className={cn(
                  'inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-xs border-0',
                  agreedToProctor && !starting
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                )}
              >
                <span>{starting ? 'Initializing Environment...' : 'Start Assessment Now'}</span>
                <ArrowRight className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <PaywallModal open={paywallOpen} onOpenChange={setPaywallOpen} />
    </div>
  );
}
