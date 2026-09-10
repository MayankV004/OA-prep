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
    <div className="min-h-screen bg-background text-foreground pb-28 relative">
      {/* ── Ambient Radial Atmosphere (Borderless Background) ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-primary/10 via-emerald-500/5 to-transparent blur-3xl opacity-50" />
      </div>

      {/* ── Hero & Readiness Header (Borderless Surface) ── */}
      <div className="relative pt-2 sm:pt-4 pb-6 w-full">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-12">
          {/* Headline & Overview */}
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-elevated text-xs font-mono font-bold tracking-wider text-primary shadow-xs">
                <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                PLACEMENT READINESS SIMULATOR
              </span>
              {isPro && <ProBadge />}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-heading text-foreground">
              Company OA Mock Simulator
            </h1>

            <p className="text-sm sm:text-base text-text-muted font-normal leading-relaxed max-w-3xl">
              Experience authentic Online Assessments under strict countdown timers, proctoring emulation, and real hiring cut-offs for Amazon, Google, Uber, and Microsoft.
            </p>

            {/* Feature Highlights Ribbon (Borderless Floating Pills) */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-elevated/70 text-2xs font-mono text-text-secondary shadow-xs backdrop-blur-xs">
                <Clock className="size-3 text-primary" />
                <span>Strict 90–120m Timers</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-elevated/70 text-2xs font-mono text-text-secondary shadow-xs backdrop-blur-xs">
                <ShieldAlert className="size-3 text-primary" />
                <span>Camera & Tab-Switch Emulation</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-elevated/70 text-2xs font-mono text-text-secondary shadow-xs backdrop-blur-xs">
                <Target className="size-3 text-primary" />
                <span>Authentic Bar Cutoffs</span>
              </div>
            </div>
          </div>

          {/* Candidate Readiness Scorecard (Borderless Glass Panel) */}
          {completedAttempts.length > 0 ? (
            <div className="relative group self-start lg:self-center shrink-0 w-full lg:w-auto">
              <div className="rounded-3xl bg-surface-elevated/90 backdrop-blur-md p-5 sm:p-6 shadow-e2 relative overflow-hidden before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent">
                <div className="text-2xs font-mono font-bold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-1.5">
                  <Trophy className="size-3.5 text-primary" />
                  <span>Candidate Performance Ledger</span>
                </div>
                <div className="grid grid-cols-3 gap-5 sm:gap-8">
                  <div>
                    <div className="text-2xs font-mono text-text-muted uppercase">Tests Taken</div>
                    <div className="text-2xl font-bold font-mono text-foreground mt-0.5">
                      {completedAttempts.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xs font-mono text-text-muted uppercase">Avg Score</div>
                    <div className="text-2xl font-bold font-mono text-primary mt-0.5">
                      {avgScore}%
                    </div>
                  </div>
                  <div>
                    <div className="text-2xs font-mono text-text-muted uppercase">Pass Rate</div>
                    <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
                      {passRate}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-surface-elevated/60 backdrop-blur-md p-5 sm:p-6 shadow-xs max-w-sm self-start lg:self-center shrink-0">
              <div className="flex items-start gap-3">
                <div className="size-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Flame className="size-4" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-foreground">Zero Attempts Logged</div>
                  <p className="text-2xs text-text-muted leading-relaxed">
                    Pick a mock assessment below to test your speed under real-world company pressure.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Search & Filter Controls (Borderless Surfaces) ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-7">
          {/* Borderless Search Input */}
          <div className="relative w-full sm:w-88 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search company, pattern, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-2xl bg-surface-elevated/70 backdrop-blur-md text-xs sm:text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-surface-elevated shadow-xs border-0 transition-all"
            />
          </div>

          {/* Borderless Horizontal Company Chips */}
          <div className="flex items-center gap-2 overflow-x-auto flex-1 min-w-0 pb-1 sm:pb-0 scrollbar-none">
            {companiesWithCounts.map(({ name, count }) => (
              <button
                key={name}
                onClick={() => setSelectedCompany(name)}
                className={cn(
                  'px-3.5 py-2 rounded-2xl text-xs font-medium cursor-pointer transition-all shrink-0 capitalize border-0 flex items-center gap-2',
                  selectedCompany === name
                    ? 'bg-primary text-primary-foreground font-bold shadow-glow scale-[1.02]'
                    : 'bg-surface-elevated/50 hover:bg-surface-elevated text-text-secondary hover:text-foreground backdrop-blur-xs'
                )}
              >
                <span>{name === 'all' ? 'All Companies' : name}</span>
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.2 rounded-full font-mono',
                    selectedCompany === name
                      ? 'bg-black/20 text-white font-bold'
                      : 'bg-surface-sunken/80 text-text-muted'
                  )}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Catalog Grid (Borderless Cards - Full Width Responsive) ── */}
      <div className="w-full pt-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-5 sm:gap-6 w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-72 rounded-3xl bg-surface-elevated/40 shadow-e1 animate-pulse border-0"
              />
            ))}
          </div>
        ) : filteredAssessments.length === 0 ? (
          <div className="text-center py-20 bg-surface-elevated/40 backdrop-blur-md rounded-3xl p-8 shadow-e1 w-full">
            <Search className="size-8 mx-auto text-text-muted/40 mb-3" />
            <h3 className="text-base font-bold text-foreground">No assessments found</h3>
            <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
              We couldn’t find any assessments matching your query. Try searching for a different keyword or company filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-5 sm:gap-6 w-full">
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
                      'h-full relative group rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300',
                      'bg-surface-elevated/85 dark:bg-[#111622]/90 backdrop-blur-md',
                      'shadow-e1 hover:shadow-e4 hover:-translate-y-1.5',
                      'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent',
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
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'px-2.5 py-1 rounded-xl text-xs font-mono font-bold uppercase tracking-wider',
                              tone.bg,
                              tone.accent
                            )}
                          >
                            {assessment.company}
                          </span>
                          <span className="text-2xs text-text-muted font-mono truncate max-w-[120px]">
                            • {assessment.role}
                          </span>
                        </div>

                        {/* Status Badge (Borderless Pill) */}
                        {assessment.isLocked ? (
                          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400">
                            <Lock className="size-3" />
                            <span>PRO</span>
                          </div>
                        ) : !assessment.isProOnly ? (
                          <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400">
                            Free Demo
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-primary/15 text-primary font-mono">
                            Pro Pack
                          </span>
                        )}
                      </div>

                      {/* Assessment Title */}
                      <h2 className="text-lg sm:text-xl font-bold font-heading text-foreground leading-snug group-hover:text-primary transition-colors">
                        {assessment.title}
                      </h2>

                      {/* Description */}
                      <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                        {assessment.description}
                      </p>

                      {/* Sunken Integrated Metrics Pod (Borderless) */}
                      <div className="flex items-center justify-between gap-2 py-2.5 px-3.5 rounded-2xl bg-surface-sunken/60 text-xs font-mono text-text-secondary">
                        <div className="flex items-center gap-1.5">
                          <Clock className="size-3.5 text-text-muted" />
                          <span>{assessment.durationMinutes}m</span>
                        </div>
                        <span className="text-text-muted/30">•</span>
                        <div className="flex items-center gap-1.5">
                          <Code2 className="size-3.5 text-text-muted" />
                          <span>{assessment.problemCount} Problems</span>
                        </div>
                        <span className="text-text-muted/30">•</span>
                        <div className="flex items-center gap-1.5">
                          <Target className="size-3.5 text-text-muted" />
                          <span>Cutoff {assessment.passingScore}%</span>
                        </div>
                      </div>

                      {/* Patterns Tested Chips (Borderless) */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {assessment.problemSummaries.map((prob) => (
                          <span
                            key={prob.id}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium bg-surface-sunken/80 text-text-secondary group-hover:text-foreground transition-colors"
                          >
                            {prob.patternTag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-6 mt-5 flex items-center justify-between relative z-10">
                      {hasAttempted ? (
                        <div className="flex items-center gap-1.5 text-xs font-mono">
                          {hasPassed ? (
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold">
                              <CheckCircle2 className="size-3.5" />
                              Passed ({assessment.pastSubmission?.totalScore}%)
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-400 font-medium">
                              <AlertCircle className="size-3.5" />
                              Score: {assessment.pastSubmission?.totalScore}%
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-text-muted font-mono">Not attempted</span>
                      )}

                      {assessment.isLocked ? (
                        <button
                          onClick={() => setPaywallOpen(true)}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-all cursor-pointer active:scale-95 shadow-xs border-0"
                        >
                          <Lock className="size-3.5" />
                          <span>Unlock Pro</span>
                        </button>
                      ) : (
                        <Link href={`/oa/${assessment.slug}`}>
                          <button className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary-hover transition-all cursor-pointer shadow-glow hover:shadow-glow-lg active:scale-95 border-0">
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
