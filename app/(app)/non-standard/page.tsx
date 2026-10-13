'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Layers,
  Compass,
  Lightbulb,
  Trophy,
  Puzzle,
  Boxes,
  Network,
  Binary,
  Sigma,
  Search,
  X,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Check,
  Code2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import { getNonStandardCategories } from '@/lib/non-standard-dsa';

interface Stat {
  group: string;
  slug?: string;
  total: number;
  completed: number;
}

function CircularMasteryRing({ pct, isMastered }: { pct: number; isMastered: boolean }) {
  const radius = 13;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div
      className={cn(
        'size-11 sm:size-12 rounded-2xl flex items-center justify-center border shadow-2xs backdrop-blur-md transition-all duration-300 group-hover:scale-105 shrink-0 relative',
        'bg-foreground/[0.03] dark:bg-white/[0.06] border-border/70 dark:border-white/10',
        isMastered
          ? 'group-hover:border-emerald-500/40 group-hover:bg-emerald-500/[0.05]'
          : 'group-hover:border-primary/40 group-hover:bg-primary/[0.05]'
      )}
      title={`${pct}% mastered`}
    >
      <svg className="size-8 -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
        <circle
          cx="18"
          cy="18"
          r={radius}
          className="stroke-foreground/10 dark:stroke-white/10 fill-none"
          strokeWidth="2.75"
        />
        <circle
          cx="18"
          cy="18"
          r={radius}
          className={cn(
            'fill-none transition-all duration-500 ease-out',
            isMastered ? 'stroke-emerald-500' : 'stroke-primary'
          )}
          strokeWidth="2.75"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {isMastered ? (
          <Check className="size-3.5 text-emerald-500 stroke-[3]" />
        ) : (
          <span className="text-[10px] font-mono font-bold text-foreground/90">
            {pct}%
          </span>
        )}
      </div>
    </div>
  );
}

const ICON_MAP: Record<string, LucideIcon> = {
  Layers,
  Compass,
  Lightbulb,
  Trophy,
  Puzzle,
  Boxes,
  Network,
  Binary,
  Sigma,
};

const containerVariants: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function NonStandardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<'all' | 'in-progress' | 'mastered' | 'unstarted'>('all');

  const categories = useMemo(() => getNonStandardCategories(), []);

  const { data: progress = [] } = useQuery<Stat[]>({
    queryKey: ['problems', 'progress', 'nonstandard'],
    queryFn: async () => {
      const res = await fetch('/api/problems/progress?kind=nonstandard');
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 15_000,
  });

  const statsMap = useMemo(() => {
    return Object.fromEntries(progress.map((p) => [p.group, p]));
  }, [progress]);

  const totalCompleted = useMemo(() => {
    return progress.reduce((acc, curr) => acc + curr.completed, 0);
  }, [progress]);

  const totalProblems = useMemo(() => {
    return progress.reduce((acc, curr) => acc + curr.total, 0) || 100;
  }, [progress]);

  const overallProgress = totalProblems > 0 ? Math.round((totalCompleted / totalProblems) * 100) : 0;

  const masteredCount = useMemo(() => {
    return categories.filter((cat) => {
      const stat = statsMap[cat.category];
      return stat && stat.total > 0 && stat.completed >= stat.total;
    }).length;
  }, [categories, statsMap]);

  const inProgressCount = useMemo(() => {
    return categories.filter((cat) => {
      const stat = statsMap[cat.category];
      return stat && stat.completed > 0 && stat.completed < stat.total;
    }).length;
  }, [categories, statsMap]);

  const unstartedCount = Math.max(0, categories.length - masteredCount - inProgressCount);

  // Filter categories by search query and tag filter
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        cat.shortName.toLowerCase().includes(q) ||
        cat.category.toLowerCase().includes(q) ||
        cat.note.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      const stat = statsMap[cat.category] ?? { total: cat.problemCount, completed: 0 };
      const isMastered = stat.total > 0 && stat.completed >= stat.total;
      const isInProgress = stat.completed > 0 && stat.completed < stat.total;
      const isUnstarted = stat.completed === 0;

      if (selectedTag === 'mastered') return isMastered;
      if (selectedTag === 'in-progress') return isInProgress;
      if (selectedTag === 'unstarted') return isUnstarted;
      return true;
    });
  }, [categories, searchQuery, selectedTag, statsMap]);

  return (
    <div className="space-y-8 pb-16">
      {/* ── 1. Page Header (Modern Cockpit Header) ── */}
      <div className="pt-2 space-y-3">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-foreground leading-[1.08]">
          Non-Standard{' '}
          <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-200 bg-clip-text text-transparent">
            DSA
          </span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed font-normal">
          Ad-hoc, constructive, geometric, and mathematical insight problems that test first-principles reasoning without fixed pattern templates.
        </p>
      </div>

      {/* ── 2. Frameless Assessment Divider Banner ── */}
      <div className="w-full py-5 px-1 sm:px-2 border-y border-foreground/20 dark:border-white/20 bg-foreground/[0.02] dark:bg-white/[0.02] transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
          <div className="space-y-1">
            <span className="text-2xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">
              Assessment Specialization
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-foreground">
              100 First-Principles OA Challenges
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 shrink-0">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="inline-block size-2 rounded-full bg-primary" />
              <span>
                <strong className="text-foreground">{totalCompleted}</strong> of {totalProblems} solved ({overallProgress}%)
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="text-emerald-500 font-semibold">{masteredCount} mastered</span>
              <span>•</span>
              <span className="text-amber-500 font-semibold">{inProgressCount} active</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Search & Filter Controls Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2.5 rounded-2xl bg-card/70 border border-border/80 backdrop-blur-md shadow-xs">
        {/* Search Bar */}
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search categories, invariant tricks, or concepts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-9 text-xs sm:text-sm font-medium bg-background/80 rounded-xl border border-border/80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 rounded-xl bg-surface-sunken/80 border border-border/60">
          {[
            { id: 'all' as const, label: 'All Categories', count: categories.length },
            { id: 'in-progress' as const, label: 'In Progress', count: inProgressCount },
            { id: 'mastered' as const, label: 'Mastered', count: masteredCount },
            { id: 'unstarted' as const, label: 'Unstarted', count: unstartedCount },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedTag(tab.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5',
                selectedTag === tab.id
                  ? 'bg-card text-foreground font-bold shadow-2xs border border-border/50'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  'font-mono text-[10px] px-1.5 py-0.2 rounded-full',
                  selectedTag === tab.id ? 'bg-primary/10 text-primary font-bold' : 'bg-muted text-muted-foreground'
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. Category Grid ── */}
      {filteredCategories.length === 0 ? (
        <Card className="rounded-3xl border border-dashed border-border/80 bg-card/50 p-12 text-center shadow-xs">
          <EmptyState
            title="No categories found"
            description={
              searchQuery
                ? `No categories match "${searchQuery}". Try a different keyword.`
                : 'Categories will show up here as soon as problems are available.'
            }
            action={
              searchQuery || selectedTag !== 'all' ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTag('all');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover transition-all cursor-pointer shadow-xs"
                >
                  Clear Filters
                </button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
        >
          {filteredCategories.map((cat) => {
            const stat = statsMap[cat.category] ?? { total: cat.problemCount, completed: 0 };
            const pct = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
            const complete = pct === 100 && stat.total > 0;
            const inProgress = stat.completed > 0 && !complete;

            return (
              <motion.div key={cat.slug} variants={itemVariants} className="h-full">
                <Link href={`/non-standard/${cat.slug}`} className="group block h-full outline-none">
                  <div
                    className={cn(
                      'h-full flex flex-col justify-between p-6 sm:p-7 rounded-[28px] sm:rounded-3xl border transition-all duration-300 relative overflow-hidden',
                      // Frosted glass styling
                      'bg-card/70 dark:bg-card/35 backdrop-blur-2xl',
                      'border-border/80 dark:border-white/10',
                      'hover:border-foreground/20 dark:hover:border-white/20',
                      'shadow-xs hover:shadow-xl hover:-translate-y-0.5',
                      // Top specular sheen line
                      'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/70 dark:before:via-white/15 before:to-transparent'
                    )}
                  >
                    <div className="space-y-3.5">
                      {/* Top Header Row: Status Badge + Circular Mastery Ring */}
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className={cn(
                            'px-3.5 py-1 rounded-full text-xs font-semibold border shadow-2xs backdrop-blur-md',
                            complete
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                              : inProgress
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
                              : 'bg-foreground/[0.04] dark:bg-white/[0.06] text-muted-foreground border-border/70 dark:border-white/10'
                          )}
                        >
                          {complete ? 'Mastered' : inProgress ? 'In Progress' : 'Roadmap'}
                        </span>

                        <CircularMasteryRing pct={pct} isMastered={complete} />
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                          {cat.shortName}
                        </h3>
                        {cat.note && (
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 mt-1.5 font-normal">
                            {cat.note}
                          </p>
                        )}
                      </div>

                      {/* Problems & Solved Meta Row */}
                      <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium text-foreground/80 pt-1">
                        <span className="flex items-center gap-1.5">
                          <Layers className="size-3.5 text-muted-foreground" />
                          {cat.problemCount} problems
                        </span>
                        <span className="text-muted-foreground/40">•</span>
                        <span className="flex items-center gap-1.5">
                          <Code2 className="size-3.5 text-muted-foreground" />
                          <strong className="text-foreground">{stat.completed}</strong>/{stat.total} solved
                        </span>
                      </div>

                      {/* Category Badge */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="px-2.5 py-0.5 rounded-lg bg-foreground/[0.03] dark:bg-white/[0.04] border border-border/60 dark:border-white/10 font-mono text-[11px] text-muted-foreground backdrop-blur-xs">
                          {cat.category}
                        </span>
                      </div>
                    </div>

                    {/* Single-Line Footer Action Row */}
                    <div className="pt-4 mt-4 border-t border-border/50 dark:border-white/10 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                        <span className="font-bold text-foreground">{stat.completed}</span>
                        <span>/</span>
                        <span>{stat.total} solved</span>
                      </div>

                      <div className="px-4 py-2 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover active:scale-95 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0">
                        <span>{complete ? 'Review' : inProgress ? 'Continue' : 'Practice'}</span>
                        <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
