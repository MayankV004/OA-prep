'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Code2,
  Copy,
  Check,
  ChevronDown,
  Camera,
  Mic,
  Eye,
  Lock,
  FileDown,
  Printer,
  Calendar,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AssessmentReportPage({
  params,
}: {
  params: Promise<{ slug: string; submissionId: string }>;
}) {
  const { slug, submissionId } = use(params);
  const router = useRouter();

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCodes, setExpandedCodes] = useState<Record<string, boolean>>({});
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Trap back navigation: If the candidate tries to navigate back from the report, take them cleanly to /oa catalog instead of re-entering test
  useEffect(() => {
    window.history.pushState({ isReport: true }, '', window.location.href);

    const handlePopState = () => {
      router.replace('/oa');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [router]);

  useEffect(() => {
    fetch(`/api/oa/submissions/${submissionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReport(data.report);
        }
      })
      .catch((err) => console.error('Failed to load submission report:', err))
      .finally(() => setLoading(false));
  }, [submissionId]);

  const toggleProblemCode = (problemId: string) => {
    setExpandedCodes((prev) => ({
      ...prev,
      [problemId]: !prev[problemId],
    }));
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleDownloadPdf = () => {
    // Automatically expand all code blocks before triggering native PDF print
    if (report?.problemResults) {
      const allExpanded: Record<string, boolean> = {};
      report.problemResults.forEach((p: any) => {
        allExpanded[p.problemId] = true;
      });
      setExpandedCodes(allExpanded);
    }

    setTimeout(() => {
      window.print();
    }, 200);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-background text-foreground">
        <div className="animate-spin rounded-full size-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-4 bg-background text-foreground">
        <h2 className="text-xl font-bold">Report Not Found</h2>
        <Link href="/oa">
          <button className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground">
            Back to OA Catalog
          </button>
        </Link>
      </div>
    );
  }

  const { assessment, integrity, problemResults, patternDiagnostic } = report;
  const isPassed = report.passed;
  const cheatingRisk = integrity.cheatingRiskPercentage;
  const isCleanIntegrity = integrity.integrityVerdict === 'clean';

  // Format seconds to mm:ss
  const formatTimeSpent = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const formattedDate = new Date(report.submittedAt || report.startedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      className="min-h-screen bg-background text-foreground pb-24 w-full overscroll-none"
      style={{ overscrollBehavior: 'none' }}
    >
      {/* ── PRINT-ONLY OFFICIAL HEADER (Appears only on PDF export) ── */}
      <div className="hidden print:block w-full p-8 border-b border-slate-200 bg-white text-slate-900 font-sans">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-black tracking-tight text-slate-900">BigO Assessment & Proctoring Audit</div>
            <div className="text-xs text-slate-600 font-mono">
              Candidate Performance Scorecard • Verified Assessment Record
            </div>
          </div>
          <div className="text-right text-xs font-mono text-slate-600">
            <div><strong>Company:</strong> {assessment?.company}</div>
            <div><strong>Role:</strong> {assessment?.role}</div>
            <div><strong>Date:</strong> {formattedDate}</div>
            <div><strong>Audit ID:</strong> {submissionId.slice(-8).toUpperCase()}</div>
          </div>
        </div>
      </div>

      {/* ── BORDERLESS HERO HEADER ──────────────────────── */}
      <div className="w-full px-6 sm:px-10 lg:px-14 pt-8 pb-6 no-print">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                {assessment?.company} • {assessment?.role}
              </span>
              <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                <Calendar className="size-3 text-muted-foreground" />
                {formattedDate}
              </span>
              <span
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase font-mono',
                  isPassed ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-400'
                )}
              >
                {isPassed ? '✓ Passed Bar' : '⚠ Below Cutoff'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              {assessment?.title}
            </h1>
          </div>

          {/* Action Buttons: PDF Download & Retake */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
              title="Save clean PDF report"
            >
              <FileDown className="size-4" />
              <span>Download PDF Report</span>
            </button>

            <Link href={`/oa/${slug}`}>
              <button className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer">
                <RotateCcw className="size-3.5" />
                <span>Retake</span>
              </button>
            </Link>

            <Link href="/oa">
              <button className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer">
                All OAs
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER (FULL-WIDTH BORDERLESS) ── */}
      <div className="w-full px-6 sm:px-10 lg:px-14 space-y-8">
        {/* ── 1. HERO SCORE & BENCHMARK CARD (BORDERLESS) ── */}
        <div
          className={cn(
            'p-6 sm:p-8 rounded-3xl space-y-6 transition-all',
            isPassed ? 'bg-primary/[0.06]' : 'bg-amber-500/[0.05]'
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono',
                    isPassed ? 'bg-primary/15 text-primary' : 'bg-amber-500/15 text-amber-400'
                  )}
                >
                  {isPassed ? '✓ Cleared Company Hiring Bar' : '⚠ Below Target Cutoff'}
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  (Company Cutoff: {assessment?.passingScore}%)
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {isPassed
                  ? `Congratulations! Your score matches or exceeds ${assessment?.company}'s interview screening bar.`
                  : `Your score is below ${assessment?.company}'s typical candidate passing cutoff of ${assessment?.passingScore}%. Practice the diagnostic patterns below to bridge the gap.`}
              </p>
            </div>

            {/* Big Score Display */}
            <div className="text-right font-mono">
              <div className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
                {report.totalScore} <span className="text-lg text-muted-foreground font-normal">/ {report.maxScore}</span>
              </div>
              <div className="text-2xs font-mono text-muted-foreground uppercase tracking-wider">
                Composite Score
              </div>
            </div>
          </div>

          {/* Quick Metrics Row (Borderless) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border/20 text-xs font-mono">
            <div>
              <span className="text-muted-foreground uppercase text-2xs block">Percentile Rank</span>
              <span className="text-lg font-bold text-primary">{report.percentile}th Percentile</span>
            </div>
            <div>
              <span className="text-muted-foreground uppercase text-2xs block">Time Spent</span>
              <span className="text-lg font-bold text-foreground">{formatTimeSpent(report.timeSpentSeconds)}</span>
            </div>
            <div>
              <span className="text-muted-foreground uppercase text-2xs block">Passing Threshold</span>
              <span className="text-lg font-bold text-foreground">{assessment?.passingScore}%</span>
            </div>
            <div>
              <span className="text-muted-foreground uppercase text-2xs block">Problems Solved</span>
              <span className="text-lg font-bold text-foreground">
                {problemResults.filter((p: any) => p.status === 'accepted').length} of {problemResults.length}
              </span>
            </div>
          </div>
        </div>

        {/* ── 2. MULTI-MODAL PROCTORING & INTEGRITY AUDIT (BORDERLESS) ── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-muted/20 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                {isCleanIntegrity ? (
                  <ShieldCheck className="size-4 text-primary" />
                ) : (
                  <ShieldAlert className="size-4 text-amber-400" />
                )}
                <span>Proctoring & Anti-Cheat Telemetry Audit</span>
              </div>
              <h3 className="text-lg font-bold text-foreground">Integrity Risk Assessment</h3>
            </div>

            {/* Cheating percentage pill */}
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-bold font-mono',
                  cheatingRisk <= 15
                    ? 'bg-primary/10 text-primary'
                    : cheatingRisk < 45
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'bg-red-500/10 text-red-400'
                )}
              >
                {cheatingRisk}% Cheating Risk • {integrity.integrityVerdict.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Risk Level Gauge Bar */}
          <div className="space-y-1.5">
            <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden flex">
              <div
                className={cn(
                  'h-full transition-all duration-500',
                  cheatingRisk <= 15
                    ? 'bg-primary'
                    : cheatingRisk < 45
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                )}
                style={{ width: `${Math.max(5, cheatingRisk)}%` }}
              />
            </div>
            <div className="flex justify-between text-2xs font-mono text-muted-foreground">
              <span>0% (Verified Human)</span>
              <span>45% (Suspicious Threshold)</span>
              <span>100% (Flagged for Review)</span>
            </div>
          </div>

          {/* Multi-Modal Telemetry Metrics Grid (6 Pillars) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-muted/25 font-mono space-y-1">
              <div className="text-2xs text-muted-foreground uppercase">Tab Switches</div>
              <div className={cn('text-lg font-bold', integrity.tabSwitchCount > 0 ? 'text-amber-400' : 'text-foreground')}>
                {integrity.tabSwitchCount}
              </div>
              <div className="text-3xs text-muted-foreground/80">{integrity.timeAwaySeconds}s outside tab</div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/25 font-mono space-y-1">
              <div className="text-2xs text-muted-foreground uppercase flex items-center gap-1">
                <Camera className="size-3 text-primary" />
                <span>Face Pres.</span>
              </div>
              <div
                className={cn(
                  'text-lg font-bold',
                  integrity.faceAbsenceCount > 0 || integrity.multipleFacesCount > 0
                    ? 'text-amber-400'
                    : 'text-foreground'
                )}
              >
                {integrity.faceAbsenceCount === 0 && integrity.multipleFacesCount === 0
                  ? 'Verified 1'
                  : `${integrity.faceAbsenceCount}A / ${integrity.multipleFacesCount}M`}
              </div>
              <div className="text-3xs text-muted-foreground/80">
                {integrity.faceAbsenceCount === 0 ? 'Single verified' : 'Absence/multi'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/25 font-mono space-y-1">
              <div className="text-2xs text-muted-foreground uppercase flex items-center gap-1">
                <Eye className="size-3 text-primary" />
                <span>Eye Gaze</span>
              </div>
              <div className={cn('text-lg font-bold', integrity.gazeDivertedCount > 0 ? 'text-amber-400' : 'text-foreground')}>
                {integrity.gazeDivertedCount === 0 ? 'Centered' : `${integrity.gazeDivertedCount} Away`}
              </div>
              <div className="text-3xs text-muted-foreground/80">
                {integrity.gazeDivertedCount === 0 ? '100% Focused' : 'Off-screen gaze'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/25 font-mono space-y-1">
              <div className="text-2xs text-muted-foreground uppercase flex items-center gap-1">
                <Mic className="size-3 text-primary" />
                <span>Voice Audio</span>
              </div>
              <div className={cn('text-lg font-bold', integrity.voiceInterruptionCount > 0 ? 'text-amber-400' : 'text-foreground')}>
                {integrity.voiceInterruptionCount === 0 ? 'Silent' : `${integrity.voiceInterruptionCount} Spikes`}
              </div>
              <div className="text-3xs text-muted-foreground/80">
                {integrity.voiceInterruptionCount === 0 ? 'Quiet room' : 'Voice detected'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/25 font-mono space-y-1">
              <div className="text-2xs text-muted-foreground uppercase flex items-center gap-1">
                <Lock className="size-3 text-primary" />
                <span>Pastes</span>
              </div>
              <div className={cn('text-lg font-bold', integrity.pasteAttemptsBlocked > 0 ? 'text-amber-400' : 'text-foreground')}>
                {integrity.pasteAttemptsBlocked > 0 ? `${integrity.pasteAttemptsBlocked} Blocked` : '0 (Locked)'}
              </div>
              <div className="text-3xs text-muted-foreground/80">
                {integrity.pasteAttemptsBlocked > 0 ? 'Clipboard stopped' : 'Manual code'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/25 font-mono space-y-1">
              <div className="text-2xs text-muted-foreground uppercase">Keystrokes</div>
              <div className="text-lg font-bold text-foreground">{integrity.keystrokesCount}</div>
              <div className="text-3xs text-muted-foreground/80">Natural cadence</div>
            </div>
          </div>

          {/* Telemetry Timeline Audit Log */}
          {integrity.telemetryTimeline?.length > 0 && (
            <div className="pt-3 border-t border-border/20 space-y-2">
              <span className="text-2xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                Chronological Audit Event Log ({integrity.telemetryTimeline.length} events)
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2 font-mono text-xs">
                {integrity.telemetryTimeline.map((ev: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-muted/30 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400">⚠️</span>
                      <span className="text-foreground/90">{ev.details || ev.type}</span>
                    </div>
                    <span className="text-2xs text-muted-foreground">
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── 3. AI BEHAVIORAL & FORENSIC ACTIVITY ANALYSIS (BORDERLESS) ── */}
        {integrity.activityAnalysisNarrative && (
          <div className="p-6 sm:p-8 rounded-3xl bg-muted/20 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    AI Behavioral & Integrity Forensic Audit
                  </h3>
                  <p className="text-2xs font-mono text-muted-foreground">
                    Synthesized forensic summary of keystrokes, eye gaze, acoustic spikes, and problem flow
                  </p>
                </div>
              </div>

              <div className="px-3 py-1 rounded-full text-2xs font-mono font-bold uppercase bg-muted/50 text-muted-foreground">
                Proctor Intelligence Engine
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-muted/25 text-foreground leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h3: ({ children }) => (
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-bold font-mono uppercase tracking-wider text-primary mt-6 mb-3 pb-1 border-b border-border/20 first:mt-0">
                      <span className="size-1.5 rounded-full bg-primary inline-block shrink-0" />
                      <span>{children}</span>
                    </div>
                  ),
                  p: ({ children }) => (
                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed my-2.5 font-sans">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="my-3 space-y-2 text-xs sm:text-sm font-sans list-none pl-0">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="my-3 space-y-2 text-xs sm:text-sm font-sans list-decimal pl-5">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="flex items-start gap-2.5 text-foreground/80 leading-relaxed font-sans">
                      <span className="text-primary font-bold shrink-0 mt-0.5">•</span>
                      <div className="flex-1 [&_strong]:text-foreground [&_strong]:font-semibold">
                        {children}
                      </div>
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-foreground">{children}</strong>
                  ),
                }}
              >
                {integrity.activityAnalysisNarrative?.replace(/^[•●]\s+/gm, '- ')}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* ── 4. QUESTION-BY-QUESTION BREAKDOWN (BORDERLESS) ── */}
        <div className="space-y-4">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-foreground">
            Detailed Problem Evaluation ({problemResults.length} Coding Questions)
          </h3>

          <div className="space-y-3">
            {problemResults.map((result: any, idx: number) => {
              const isAccepted = result.status === 'accepted';
              const isExpanded = Boolean(expandedCodes[result.problemId]);

              return (
                <div
                  key={result.problemId}
                  className="rounded-2xl bg-muted/20 overflow-hidden"
                >
                  <div className="p-5 flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground font-bold">
                          Question {idx + 1}
                        </span>
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded-full text-2xs font-mono font-bold uppercase',
                            isAccepted ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-500'
                          )}
                        >
                          {result.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-foreground">
                        {assessment?.problems?.[idx]?.title || `Problem ${idx + 1}`}
                      </h4>
                      <div className="text-xs font-mono text-primary font-medium">
                        {assessment?.problems?.[idx]?.patternTag}
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right font-mono">
                        <div className="text-base font-bold text-foreground">
                          {result.score} / {assessment?.problems?.[idx]?.score || 50} pts
                        </div>
                        <div className="text-2xs text-muted-foreground">
                          {result.passedTestCases}/{result.totalTestCases} Testcases Passed
                        </div>
                      </div>

                      {result.code && (
                        <button
                          onClick={() => toggleProblemCode(result.problemId)}
                          className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-muted/50 hover:bg-muted text-foreground transition-all cursor-pointer flex items-center gap-1.5 no-print"
                        >
                          <Code2 className="size-3.5" />
                          <span>{isExpanded ? 'Hide Code' : 'View Code'}</span>
                          <ChevronDown className={cn('size-3 transition-transform', isExpanded && 'rotate-180')} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable submitted code */}
                  {isExpanded && result.code && (
                    <div className="p-5 bg-black/40 font-mono text-xs relative">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/20 text-2xs text-muted-foreground no-print">
                        <span>Submitted {result.language.toUpperCase()} Solution:</span>
                        <button
                          onClick={() => copyCode(result.code, result.problemId)}
                          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-0"
                        >
                          {copiedCodeId === result.problemId ? (
                            <Check className="size-3 text-primary" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                          <span>{copiedCodeId === result.problemId ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <pre className="text-slate-200 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                        <code>{result.code}</code>
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 5. TARGETED PATTERN GAP CALIBRATION (BORDERLESS) ── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-muted/20 space-y-4">
          <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase tracking-wider">
            <BookOpen className="size-4" />
            <span>BigO Pattern Calibration & Action Plan</span>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Based on your testcase execution and time allocation, here is your customized remedial focus before your live interview round:
          </p>

          <div className="space-y-3 pt-2">
            {patternDiagnostic.map((diag: any, i: number) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-muted/25 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="font-bold text-foreground">{diag.patternTag}</span>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-2xs font-bold uppercase',
                        diag.verdict === 'mastered'
                          ? 'bg-primary/10 text-primary'
                          : diag.verdict === 'needs_practice'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-red-500/10 text-red-400'
                      )}
                    >
                      {diag.verdict.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{diag.recommendation}</p>
                </div>

                <Link href="/dsa" className="no-print">
                  <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-muted/50 hover:bg-muted text-foreground transition-all cursor-pointer shrink-0">
                    <span>Practice Pattern</span>
                    <ArrowRight className="size-3" />
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. BOTTOM NAVIGATION (BORDERLESS) ─────────────── */}
        <div className="pt-4 flex items-center justify-between no-print">
          <Link href="/oa">
            <button className="px-5 py-3 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer bg-muted/40 hover:bg-muted">
              ← Return to OA Catalog
            </button>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-muted/60 hover:bg-muted text-foreground transition-all cursor-pointer"
            >
              <FileDown className="size-4" />
              <span>Download PDF</span>
            </button>

            <Link href={`/oa/${slug}`}>
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-xs">
                <RotateCcw className="size-3.5" />
                <span>Retake Assessment</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
