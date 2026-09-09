'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lock,
  Search,
} from 'lucide-react';
import { PaywallModal } from '@/components/pricing/PaywallModal';
import { ProBadge } from '@/components/pricing/ProBadge';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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

export default function OACatalogPage() {
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [paywallOpen, setPaywallOpen] = useState(false);

  useEffect(() => {
    fetch('/api/oa/assessments')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAssessments(data.assessments);
          setIsPro(data.isPro);
        }
      })
      .catch((err) => console.error('Failed to load OA catalog:', err))
      .finally(() => setLoading(false));
  }, []);

  const companies = useMemo(() => {
    const list = Array.from(new Set(assessments.map((a) => a.company)));
    return ['all', ...list];
  }, [assessments]);

  const filteredAssessments = useMemo(() => {
    return assessments.filter((a) => {
      const matchesCompany =
        selectedCompany === 'all' ||
        (selectedCompany === 'Free Demo' ? !a.isProOnly : a.company.toLowerCase() === selectedCompany.toLowerCase());
      const matchesSearch =
        !searchQuery ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.problemSummaries.some((p) => p.patternTag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCompany && matchesSearch;
    });
  }, [assessments, selectedCompany, searchQuery]);

  // Overall readiness stats
  const completedAttempts = useMemo(() => {
    return assessments.filter((a) => a.pastSubmission !== null);
  }, [assessments]);

  const avgScore = useMemo(() => {
    if (completedAttempts.length === 0) return 0;
    const sum = completedAttempts.reduce((acc, curr) => acc + (curr.pastSubmission?.totalScore || 0), 0);
    return Math.round(sum / completedAttempts.length);
  }, [completedAttempts]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden border-b border-border/60 bg-card/40 aurora-mesh py-12 px-4 sm:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="max-w-7xl mx-auto space-y-4 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                  Placement Readiness
                </span>
                {isPro && <ProBadge />}
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                Company OA Mock Simulator
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl font-normal leading-relaxed">
                Practice authentic Online Assessments under strict countdown timers, proctoring emulation, and real hiring cut-offs for Amazon, Google, Uber, and Microsoft.
              </p>
            </div>

            {/* Candidate Readiness Summary Pill */}
            {completedAttempts.length > 0 && (
              <div className="flex items-center gap-4 bg-card border border-border/80 px-5 py-3 rounded-2xl shadow-2xs">
                <div>
                  <div className="text-2xs font-mono text-muted-foreground uppercase">Tests Taken</div>
                  <div className="text-xl font-bold font-mono text-foreground">{completedAttempts.length}</div>
                </div>
                <div className="h-8 w-px bg-border/80" />
                <div>
                  <div className="text-2xs font-mono text-muted-foreground uppercase">Avg Score</div>
                  <div className="text-xl font-bold font-mono text-primary">{avgScore}%</div>
                </div>
              </div>
            )}
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search company, pattern, role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0 scrollbar-none">
              {companies.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCompany(c)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all shrink-0 capitalize border-0',
                    selectedCompany === c
                      ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                      : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  {c === 'all' ? 'All Companies' : c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-card/40 border border-border/40 animate-pulse" />
            ))}
          </div>
        ) : filteredAssessments.length === 0 ? (
          <div className="text-center py-20 bg-card/20 rounded-2xl border border-dashed border-border p-8">
            <Search className="size-8 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="text-base font-bold text-foreground">No assessments found</h3>
            <p className="text-xs text-muted-foreground mt-1">Try clearing your search query or selecting another company filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssessments.map((assessment) => {
              const hasPassed = assessment.pastSubmission?.passed;
              const hasAttempted = Boolean(assessment.pastSubmission);

              return (
                <motion.div
                  key={assessment.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: filteredAssessments.indexOf(assessment) * 0.04 }}
                    >
                      <SpotlightCard
                        spotlightColor={
                          hasPassed
                            ? 'rgba(16, 185, 129, 0.15)'
                            : assessment.isLocked
                            ? 'rgba(245, 158, 11, 0.12)'
                            : 'rgba(99, 102, 241, 0.16)'
                        }
                        className={cn(
                          'h-full flex flex-col justify-between',
                          assessment.isLocked ? 'border-border/70 opacity-95' : 'border-border hover:border-primary/50'
                        )}
                      >
                        {/* Top Metadata & Badges */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                                {assessment.company}
                              </span>
                              <span className="text-[11px] text-muted-foreground font-mono">• {assessment.role}</span>
                            </div>

                            {/* Lock / Free Badge */}
                            {assessment.isLocked ? (
                              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                <Lock className="size-3" />
                                <span>PRO</span>
                              </div>
                            ) : !assessment.isProOnly ? (
                              <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                Free Demo
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 font-mono">
                                Pro Pack
                              </span>
                            )}
                          </div>

                          <h2 className="text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                            {assessment.title}
                          </h2>

                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {assessment.description}
                          </p>

                          {/* Metrics Strip */}
                          <div className="flex items-center gap-3 pt-2 text-xs font-mono text-muted-foreground border-t border-border/40">
                            <span>{assessment.durationMinutes} mins</span>
                            <span>•</span>
                            <span>{assessment.problemCount} Problems</span>
                            <span>•</span>
                            <span>Cutoff: {assessment.passingScore}%</span>
                          </div>

                          {/* Patterns Tested Chips */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {assessment.problemSummaries.map((prob) => (
                              <span
                                key={prob.id}
                                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-muted/60 text-muted-foreground border border-border/40"
                              >
                                {prob.patternTag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Bottom Action Footer */}
                        <div className="pt-6 mt-4 border-t border-border/40 flex items-center justify-between">
                          {hasAttempted ? (
                            <div className="flex items-center gap-1.5 text-xs font-mono">
                              {hasPassed ? (
                                <span className="flex items-center gap-1 text-emerald-500 font-bold">
                                  <CheckCircle2 className="size-3.5" />
                                  Passed ({assessment.pastSubmission?.totalScore}%)
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-amber-500 font-medium">
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
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30 hover:bg-amber-500/25 transition-all cursor-pointer active:scale-95"
                            >
                              <Lock className="size-3.5" />
                              <span>Unlock Pro</span>
                            </button>
                          ) : (
                            <Link href={`/oa/${assessment.slug}`}>
                              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-sm hover:shadow-glow active:scale-95 border-t border-white/20">
                                <span>{hasAttempted ? 'Retake / Review' : 'Start Assessment'}</span>
                                <ArrowRight className="size-3.5" />
                              </button>
                            </Link>
                          )}
                        </div>
                      </SpotlightCard>
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
