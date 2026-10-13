'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lock,
  Search,
  Clock,
  Code2,
  Target,
  Sparkles,
  Trophy,
  Flame,
  ShieldAlert,
} from 'lucide-react';
import { PaywallModal } from '@/components/pricing/PaywallModal';
import { ProBadge } from '@/components/pricing/ProBadge';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { queryKeys, STALE_TIMES } from '@/lib/query-keys';

interface ProblemSummary {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  score: number;
  patternTag: string;
}

interface AssessmentItem {
  id: string;
  title: string;
  slug: string;
  company: string;
  role: string;
  description: string;
  durationMinutes: number;
  passingScore: number;
  isProOnly: boolean;
  isLocked: boolean;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  problemCount: number;
  problemSummaries: ProblemSummary[];
  pastSubmission: {
    submissionId: string;
    totalScore: number;
    maxScore: number;
    passed: boolean;
    percentile: number;
    cheatingRiskPercentage: number;
    submittedAt: string;
  } | null;
}

interface OACatalogResponse {
  success: boolean;
  assessments: AssessmentItem[];
  isPro: boolean;
}

function getCompanyTone(company: string) {
  const c = company.toLowerCase();
  if (c.includes('google')) {
    return {
      accent: 'text-sky-400',
      bg: 'bg-sky-500/10',
      glow: 'rgba(56, 189, 248, 0.12)',
    };
  }
  if (c.includes('amazon')) {
    return {
      accent: 'text-amber-400',
      bg: 'bg-amber-500/10',
      glow: 'rgba(245, 158, 11, 0.12)',
    };
  }
  if (c.includes('microsoft')) {
    return {
      accent: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      glow: 'rgba(6, 182, 212, 0.12)',
    };
  }
  if (c.includes('uber')) {
    return {
      accent: 'text-violet-400',
      bg: 'bg-violet-500/10',
      glow: 'rgba(139, 92, 246, 0.12)',
    };
  }
  if (c.includes('meta')) {
    return {
      accent: 'text-blue-400',
      bg: 'bg-blue-500/10',
      glow: 'rgba(59, 130, 246, 0.12)',
    };
  }
  return {
    accent: 'text-primary',
    bg: 'bg-primary/10',
    glow: 'rgba(16, 185, 129, 0.12)',
  };
}

export default function OACatalogPage() {
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [paywallOpen, setPaywallOpen] = useState(false);

  const { data, isLoading } = useQuery<OACatalogResponse>({
    queryKey: queryKeys.oa.assessments(),
    queryFn: async () => {
      const res = await fetch('/api/oa/assessments');
      if (!res.ok) throw new Error('Failed to fetch OA catalog');
      return res.json();
    },
    staleTime: STALE_TIMES.shared,
    placeholderData: (prev) => prev,
  });

  const assessments = useMemo(() => data?.assessments || [], [data]);
  const isPro = Boolean(data?.isPro);

  const companiesWithCounts = useMemo(() => {
    const counts: Record<string, number> = { all: assessments.length };
    assessments.forEach((a) => {
      counts[a.company] = (counts[a.company] || 0) + 1;
    });

    const uniqueCompanies = Array.from(new Set(assessments.map((a) => a.company)));
    return [
      { name: 'all', count: assessments.length },
      ...uniqueCompanies.map((c) => ({ name: c, count: counts[c] || 0 })),
    ];
  }, [assessments]);

  const filteredAssessments = useMemo(() => {
    return assessments.filter((a) => {
      const matchesCompany =
        selectedCompany === 'all' ||
        (selectedCompany === 'Free Demo'
          ? !a.isProOnly
          : a.company.toLowerCase() === selectedCompany.toLowerCase());

      const matchesSearch =
        !searchQuery ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.problemSummaries.some((p) =>
          p.patternTag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      return matchesCompany && matchesSearch;
    });
  }, [assessments, selectedCompany, searchQuery]);

  // Overall candidate readiness stats
  const completedAttempts = useMemo(() => {
    return assessments.filter((a) => a.pastSubmission !== null);
  }, [assessments]);

  const avgScore = useMemo(() => {
    if (completedAttempts.length === 0) return 0;
    const sum = completedAttempts.reduce(
      (acc, curr) => acc + (curr.pastSubmission?.totalScore || 0),
      0
    );
    return Math.round(sum / completedAttempts.length);
  }, [completedAttempts]);

  const passCount = useMemo(() => {
    return completedAttempts.filter((a) => a.pastSubmission?.passed).length;
  }, [completedAttempts]);

  const passRate = useMemo(() => {
    if (completedAttempts.length === 0) return 0;
    return Math.round((passCount / completedAttempts.length) * 100);
  }, [completedAttempts, passCount]);

  return (
    <div className="space-y-8 pb-16">
      {/* ── 1. Page Header (Modern Cockpit Header) ── */}
      <div className="pt-2 space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-card/70 dark:bg-card/35 border border-border/80 dark:border-white/10 text-xs font-mono font-bold tracking-wider text-primary shadow-xs backdrop-blur-md">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            PLACEMENT READINESS SIMULATOR
          </span>
          {isPro && <ProBadge />}
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-foreground leading-[1.08]">
          Company OA{' '}
          <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-200 bg-clip-text text-transparent">
            Mock Simulator
          </span>
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground font-normal leading-relaxed max-w-2xl">
          Experience authentic Online Assessments under strict countdown timers, proctoring emulation, and real hiring cut-offs for Amazon, Google, Uber, and Microsoft.
        </p>

        {/* Feature Highlights Ribbon */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-card/70 dark:bg-card/35 border border-border/60 dark:border-white/10 text-2xs font-mono text-muted-foreground shadow-2xs backdrop-blur-md">
            <Clock className="size-3 text-primary" />
            <span>Strict 90–120m Timers</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-card/70 dark:bg-card/35 border border-border/60 dark:border-white/10 text-2xs font-mono text-muted-foreground shadow-2xs backdrop-blur-md">
            <ShieldAlert className="size-3 text-primary" />
            <span>Camera & Tab-Switch Emulation</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-card/70 dark:bg-card/35 border border-border/60 dark:border-white/10 text-2xs font-mono text-muted-foreground shadow-2xs backdrop-blur-md">
            <Target className="size-3 text-primary" />
            <span>Authentic Bar Cutoffs</span>
          </div>
        </div>
      </div>

      {/* ── 2. Frameless Candidate Readiness Divider Banner ── */}
      <div className="w-full py-5 px-1 sm:px-2 border-y border-foreground/20 dark:border-white/20 bg-foreground/[0.02] dark:bg-white/[0.02] transition-colors">
        {completedAttempts.length > 0 ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-1">
              <span className="text-2xs font-mono font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                <Trophy className="size-3.5 text-primary" />
                Candidate Performance Ledger
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-foreground">
                Live Assessment Readiness Benchmark
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-6 sm:gap-10 shrink-0">
              <div>
                <div className="text-2xs font-mono text-muted-foreground uppercase">Tests Taken</div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-foreground mt-0.5 tabular-nums">
                  {completedAttempts.length}
                </div>
              </div>
              <div>
                <div className="text-2xs font-mono text-muted-foreground uppercase">Avg Score</div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-primary mt-0.5 tabular-nums">
                  {avgScore}%
                </div>
              </div>
              <div>
                <div className="text-2xs font-mono text-muted-foreground uppercase">Pass Rate</div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 mt-0.5 tabular-nums">
                  {passRate}%
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Flame className="size-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-2xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                  Candidate Readiness
                </span>
                <h2 className="text-lg sm:text-xl font-bold font-display text-foreground">
                  Zero Mock Assessments Attempted Yet
                </h2>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground font-normal max-w-md">
              Simulate a timed assessment below under full anti-cheat monitoring to benchmark your speed and problem-solving readiness before real company tests.
            </p>
          </div>
        )}
      </div>

      {/* ── 3. Search & Filter Controls ── */}
      <div className="space-y-3.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl bg-card/70 dark:bg-card/35 border border-border/80 dark:border-white/10 backdrop-blur-2xl shadow-xs">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search company, pattern, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-background/50 border border-border/60 dark:border-white/10 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all font-sans"
            />
          </div>

          {/* Horizontal Company Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none">
            {companiesWithCounts.map(({ name, count }) => (
              <button
                key={name}
                onClick={() => setSelectedCompany(name)}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer capitalize flex items-center gap-1.5',
                  selectedCompany === name
                    ? 'bg-primary text-primary-foreground border-primary font-bold shadow-xs'
                    : 'bg-card/70 dark:bg-card/35 border-border/60 dark:border-white/10 text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/30 backdrop-blur-md'
                )}
              >
                <span>{name === 'all' ? 'All Companies' : name}</span>
                <span
                  className={cn(
                    'text-[10px] font-mono px-1.5 py-0.2 rounded-full',
                    selectedCompany === name
                      ? 'bg-black/20 text-white font-bold'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. Main Catalog Grid ── */}
      <div className="w-full">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-80 rounded-[28px] sm:rounded-3xl bg-card/70 dark:bg-card/35 border border-border/80 dark:border-white/10 shadow-xs animate-pulse"
              />
            ))}
          </div>
        ) : filteredAssessments.length === 0 ? (
          <div className="text-center py-16 bg-card/70 dark:bg-card/35 backdrop-blur-2xl border border-dashed border-border/80 dark:border-white/10 rounded-[28px] sm:rounded-3xl p-8 shadow-xs w-full">
            <Search className="size-8 mx-auto text-muted-foreground/40 mb-3" />
            <h3 className="text-base font-bold text-foreground font-display">No assessments found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              We couldn’t find any assessments matching your query. Try searching for a different keyword or company filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 w-full">
            {filteredAssessments.map((assessment, index) => {
              const hasPassed = assessment.pastSubmission?.passed;
              const hasAttempted = Boolean(assessment.pastSubmission);
              const tone = getCompanyTone(assessment.company);

              return (
                <motion.div
                  key={assessment.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
                  className="h-full"
                >
                  <div
                    className={cn(
                      'h-full relative group rounded-[28px] sm:rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300',
                      'bg-card/70 dark:bg-card/35 backdrop-blur-2xl',
                      'border border-border/80 dark:border-white/10 hover:border-foreground/20 dark:hover:border-white/20',
                      'shadow-xs hover:shadow-xl hover:-translate-y-1',
                      'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/70 dark:before:via-white/15 before:to-transparent',
                      'overflow-hidden',
                      assessment.isLocked && 'opacity-95'
                    )}
                  >
                    {/* Ambient Glow Accent Behind Card on Hover */}
                    <div
                      className="pointer-events-none absolute -top-24 -right-24 size-52 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: tone.glow }}
                    />

                    {/* Card Body */}
                    <div className="space-y-4 relative z-10">
                      {/* Top Bar: Company Pill, Role & Pro/Free Pill */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={cn(
                              'px-2.5 py-1 rounded-xl text-xs font-mono font-bold uppercase tracking-wider border shrink-0',
                              tone.bg,
                              tone.accent,
                              'border-foreground/10 dark:border-white/10'
                            )}
                          >
                            {assessment.company}
                          </span>
                          <span className="text-2xs text-muted-foreground font-mono truncate">
                            • {assessment.role}
                          </span>
                        </div>

                        {/* Status Badge */}
                        {assessment.isLocked ? (
                          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-500 border border-amber-500/25 shrink-0">
                            <Lock className="size-3" />
                            <span>PRO</span>
                          </div>
                        ) : !assessment.isProOnly ? (
                          <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shrink-0">
                            Free Demo
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-primary/15 text-primary border border-primary/25 font-mono shrink-0">
                            Pro Pack
                          </span>
                        )}
                      </div>

                      {/* Assessment Title */}
                      <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug group-hover:text-primary transition-colors">
                        {assessment.title}
                      </h2>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed font-normal">
                        {assessment.description}
                      </p>

                      {/* Metrics Pod */}
                      <div className="flex items-center justify-between gap-2 py-2.5 px-3.5 rounded-2xl bg-muted/30 dark:bg-card/40 border border-border/50 dark:border-white/5 text-xs font-mono text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="size-3.5 text-muted-foreground/70" />
                          <span>{assessment.durationMinutes}m</span>
                        </div>
                        <span className="text-muted-foreground/30">•</span>
                        <div className="flex items-center gap-1.5">
                          <Code2 className="size-3.5 text-muted-foreground/70" />
                          <span>{assessment.problemCount} Problems</span>
                        </div>
                        <span className="text-muted-foreground/30">•</span>
                        <div className="flex items-center gap-1.5">
                          <Target className="size-3.5 text-muted-foreground/70" />
                          <span>Cutoff {assessment.passingScore}%</span>
                        </div>
                      </div>

                      {/* Patterns Tested */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {assessment.problemSummaries.map((prob) => (
                          <span
                            key={prob.id}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium bg-muted/40 dark:bg-card/60 border border-border/40 dark:border-white/5 text-muted-foreground group-hover:text-foreground transition-colors"
                          >
                            {prob.patternTag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-6 mt-5 flex items-center justify-between border-t border-border/60 dark:border-white/10 relative z-10">
                      {hasAttempted ? (
                        <div className="flex items-center gap-1.5 text-xs font-mono">
                          {hasPassed ? (
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 font-bold">
                              <CheckCircle2 className="size-3.5" />
                              Passed ({assessment.pastSubmission?.totalScore}%)
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 font-medium">
                              <AlertCircle className="size-3.5" />
                              Score: {assessment.pastSubmission?.totalScore}%
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground font-mono">Not attempted</span>
                      )}

                      {assessment.isLocked ? (
                        <button
                          onClick={() => setPaywallOpen(true)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 transition-all cursor-pointer active:scale-95 shadow-xs border border-amber-500/30"
                        >
                          <Lock className="size-3.5" />
                          <span>Unlock Pro</span>
                        </button>
                      ) : (
                        <Link href={`/oa/${assessment.slug}`}>
                          <button className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-semibold bg-primary hover:bg-primary-hover text-primary-foreground transition-all cursor-pointer shadow-xs active:scale-95">
                            <span>{hasAttempted ? 'Retake / Review' : 'Start Assessment'}</span>
                            <ArrowRight className="size-3.5" />
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <PaywallModal open={paywallOpen} onOpenChange={setPaywallOpen} />
    </div>
  );
}
