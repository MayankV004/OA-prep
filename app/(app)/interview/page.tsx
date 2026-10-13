'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Cpu,
  Database,
  Network,
  Layers,
  Code2,
  Search,
  X,
  RotateCcw,
  Check,
  CheckCircle2,
  MessageSquare,
  Star,
  Clock,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import { queryKeys, STALE_TIMES } from '@/lib/query-keys';
import { SubjectFlashcardStats } from '@/types/interview';

interface Group {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

interface OverallStats {
  totalQuestions: number;
  totalMastered: number;
  totalDue: number;
  totalBookmarked: number;
  masteryPercentage: number;
}

interface StatsApiResponse {
  overall: OverallStats;
  subjects: SubjectFlashcardStats[];
}

const SUBJECT_META: Record<
  string,
  { icon: typeof BookOpen; gradient: string; text: string; bg: string; border: string }
> = {
  os: {
    icon: Cpu,
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
  },
  'operating-system': {
    icon: Cpu,
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
  },
  'operating-systems': {
    icon: Cpu,
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
  },
  dbms: {
    icon: Database,
    gradient: 'from-violet-500/20 via-purple-500/10 to-transparent',
    text: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/25',
  },
  'database-management-system': {
    icon: Database,
    gradient: 'from-violet-500/20 via-purple-500/10 to-transparent',
    text: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/25',
  },
  cn: {
    icon: Network,
    gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    text: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/25',
  },
  'computer-networks': {
    icon: Network,
    gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    text: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/25',
  },
  'system-design': {
    icon: Layers,
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/25',
  },
  oops: {
    icon: Code2,
    gradient: 'from-blue-500/20 via-indigo-500/10 to-transparent',
    text: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/25',
  },
  'object-oriented-programming': {
    icon: Code2,
    gradient: 'from-blue-500/20 via-indigo-500/10 to-transparent',
    text: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/25',
  },
};

function getSubjectMeta(slug: string, name: string) {
  const s = slug.toLowerCase();
  const n = name.toLowerCase();

  for (const key of Object.keys(SUBJECT_META)) {
    if (s.includes(key) || n.includes(key)) {
      return SUBJECT_META[key];
    }
  }

  return {
    icon: MessageSquare,
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
  };
}

function CircularMasteryRing({ pct, isMastered }: { pct: number; isMastered: boolean }) {
  const radius = 13;
  const circumference = 2 * Math.PI * radius; // ~81.68
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
        {/* Track */}
        <circle
          cx="18"
          cy="18"
          r={radius}
          className="stroke-foreground/10 dark:stroke-white/10 fill-none"
          strokeWidth="2.75"
        />
        {/* Progress fill */}
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
      {/* Center readout */}
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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

export default function InterviewPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'due' | 'mastered'>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener for '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch subject groups
  const { data: groups = [], isLoading: isGroupsLoading } = useQuery<Group[]>({
    queryKey: queryKeys.groups.byKind('subject'),
    queryFn: async () => {
      const res = await fetch('/api/groups?kind=subject');
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: STALE_TIMES.static,
  });

  // Fetch stats
  const { data: statsData, isLoading: isStatsLoading } = useQuery<StatsApiResponse>({
    queryKey: queryKeys.questions.stats(),
    queryFn: async () => {
      const res = await fetch('/api/questions/stats');
      if (!res.ok) return { overall: { totalQuestions: 0, totalMastered: 0, totalDue: 0, totalBookmarked: 0, masteryPercentage: 0 }, subjects: [] };
      return res.json();
    },
    staleTime: STALE_TIMES.userFast,
  });

  const subjectStatsMap = useMemo(() => {
    const map = new Map<string, SubjectFlashcardStats>();
    statsData?.subjects?.forEach((s) => {
      map.set(s.subjectId, s);
      map.set(s.slug, s);
    });
    return map;
  }, [statsData]);

  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          g.name.toLowerCase().includes(q) ||
          g.slug.toLowerCase().includes(q) ||
          g.description?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // 2. Filter Mode
      const stats = subjectStatsMap.get(g._id) || subjectStatsMap.get(g.slug);
      if (filterMode === 'due') {
        return (stats?.dueCount || 0) > 0;
      }
      if (filterMode === 'mastered') {
        return (stats?.masteryPercentage || 0) === 100 && (stats?.totalQuestions || 0) > 0;
      }

      return true;
    });
  }, [groups, searchQuery, filterMode, subjectStatsMap]);

  const overall = statsData?.overall;
  const isLoading = isGroupsLoading || isStatsLoading;

  return (
    <div className="space-y-8 pb-16">
      {/* ── 1. Page Header (Modern Cockpit Header) ── */}
      <div className="pt-2 space-y-3">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-foreground leading-[1.08]">
          Technical Interview{' '}
          <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-200 bg-clip-text text-transparent">
            Q&A & Flashcards
          </span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed font-normal">
          Master high-yield questions, test your mental models with 3D spaced-repetition flashcards, and prepare for top tier technical interviews.
        </p>
      </div>

      {/* ── 2. Mastery Overview Stats Strip (Executive Frosted Bento Strip) ── */}
      {overall && overall.totalQuestions > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Total Questions Tile */}
          <div className="relative overflow-hidden p-5 sm:p-6 rounded-[28px] sm:rounded-3xl bg-card/70 dark:bg-card/35 backdrop-blur-2xl border border-border/80 dark:border-white/10 shadow-xs space-y-2 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/70 dark:before:via-white/15 before:to-transparent">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-2xs font-mono font-bold uppercase tracking-wider">
                Total Questions
              </span>
              <BookOpen className="size-4 text-emerald-500" />
            </div>
            <p className="text-3xl sm:text-4xl font-black text-foreground font-display tracking-tight">
              {overall.totalQuestions}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              Across {groups.length} subject tracks
            </p>
          </div>

          {/* Mastered Tile */}
          <div className="relative overflow-hidden p-5 sm:p-6 rounded-[28px] sm:rounded-3xl bg-card/70 dark:bg-card/35 backdrop-blur-2xl border border-border/80 dark:border-white/10 shadow-xs space-y-2 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/70 dark:before:via-white/15 before:to-transparent">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-2xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Mastered
              </span>
              <CheckCircle2 className="size-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-display tracking-tight">
                {overall.totalMastered}
              </p>
              <span className="text-xs font-mono text-muted-foreground">
                ({overall.masteryPercentage}%)
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${overall.masteryPercentage}%` }}
              />
            </div>
          </div>

          {/* Due for Review Tile */}
          <div className="relative overflow-hidden p-5 sm:p-6 rounded-[28px] sm:rounded-3xl bg-card/70 dark:bg-card/35 backdrop-blur-2xl border border-border/80 dark:border-white/10 shadow-xs space-y-2 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/70 dark:before:via-white/15 before:to-transparent">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-2xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Due for Review
              </span>
              <Clock className="size-4 text-amber-500" />
            </div>
            <p className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 font-display tracking-tight">
              {overall.totalDue}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              {overall.totalDue > 0 ? 'Spaced repetition due' : 'All reviews completed!'}
            </p>
          </div>

          {/* Starred Cards Tile */}
          <div className="relative overflow-hidden p-5 sm:p-6 rounded-[28px] sm:rounded-3xl bg-card/70 dark:bg-card/35 backdrop-blur-2xl border border-border/80 dark:border-white/10 shadow-xs space-y-2 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/70 dark:before:via-white/15 before:to-transparent">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-2xs font-mono font-bold uppercase tracking-wider text-yellow-600 dark:text-yellow-400">
                Starred Cards
              </span>
              <Star className="size-4 text-yellow-500" />
            </div>
            <p className="text-3xl sm:text-4xl font-black text-yellow-600 dark:text-yellow-400 font-display tracking-tight">
              {overall.totalBookmarked}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              Saved for pre-round revision
            </p>
          </div>
        </div>
      )}

      {/* ── 3. Search & Status Toolbar ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl bg-card/70 border border-border/80 backdrop-blur-md shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search interview subjects or concept topics..."
            className="w-full h-10 pl-10 pr-10 text-xs sm:text-sm font-medium bg-background/80 rounded-xl border border-border/80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans placeholder:text-muted-foreground/60"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted/60 border border-border/50 rounded pointer-events-none">
              /
            </kbd>
          )}
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 rounded-xl bg-surface-sunken/80 border border-border/60 shrink-0">
          {(
            [
              { id: 'all', label: 'All Modules' },
              { id: 'due', label: 'Due for Review' },
              { id: 'mastered', label: 'Mastered' },
            ] as const
          ).map((tab) => {
            const isActive = filterMode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterMode(tab.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
                  isActive
                    ? 'bg-card text-foreground font-bold shadow-2xs border border-border/60'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {!isLoading && groups.length > 0 && (
          <div className="text-xs font-mono text-muted-foreground px-2 hidden lg:flex items-center gap-2 shrink-0">
            <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              <strong className="text-foreground">{filteredGroups.length}</strong> of {groups.length} modules
            </span>
          </div>
        )}
      </div>

      {/* ── 4. Subject Cards Grid ── */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col justify-between p-6 sm:p-7 rounded-[28px] sm:rounded-3xl bg-card/60 dark:bg-card/30 border border-border/70 dark:border-white/10 backdrop-blur-xl space-y-4"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="size-11 sm:size-12 rounded-2xl shrink-0" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4 rounded-lg" />
                  <Skeleton className="h-3.5 w-full rounded" />
                  <Skeleton className="h-3.5 w-4/5 rounded" />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Skeleton className="h-5 w-24 rounded-lg" />
                  <Skeleton className="h-5 w-20 rounded-lg" />
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-border/50 dark:border-white/10 flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-8 w-28 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredGroups.length === 0 ? (
        <Card className="rounded-3xl border border-dashed border-border/80 bg-card/50 p-12 text-center shadow-xs">
          <CardContent className="p-0">
            <EmptyState
              icon={MessageSquare}
              title="No question sets found"
              description={
                searchQuery || filterMode !== 'all'
                  ? `No interview question sets matched your current filters. Try resetting them.`
                  : 'Interview subjects will appear here once they have been added to your workspace.'
              }
              action={
                searchQuery || filterMode !== 'all' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterMode('all');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover transition-all cursor-pointer"
                  >
                    <RotateCcw className="size-3.5" />
                    <span>Reset Filters</span>
                  </button>
                ) : undefined
              }
            />
          </CardContent>
        </Card>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filteredGroups.map((group) => {
            const meta = getSubjectMeta(group.slug, group.name);
            const Icon = meta.icon;
            const stats = subjectStatsMap.get(group._id) || subjectStatsMap.get(group.slug);
            const total = stats?.totalQuestions || 0;
            const mastered = stats?.masteredCount || 0;
            const pct = stats?.masteryPercentage || 0;
            const due = stats?.dueCount || 0;
            const isMastered = pct === 100 && total > 0;
            const isInProgress = mastered > 0 && mastered < total;

            return (
              <motion.div key={group._id} variants={itemVariants} className="h-full">
                <div
                  className={cn(
                    'h-full flex flex-col justify-between p-6 sm:p-7 rounded-[28px] sm:rounded-3xl border transition-all duration-300 relative overflow-hidden group',
                    // Frosted glass styling
                    'bg-card/70 dark:bg-card/35 backdrop-blur-2xl',
                    'border-border/80 dark:border-white/10',
                    'hover:border-foreground/20 dark:hover:border-white/20',
                    'shadow-xs hover:shadow-xl hover:-translate-y-0.5',
                    // Top specular sheen
                    'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/70 dark:before:via-white/15 before:to-transparent'
                  )}
                >
                  <div className="space-y-3.5">
                    {/* Header Row: Status Badge + Circular Mastery Ring */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {due > 0 ? (
                          <span className="px-3.5 py-1 rounded-full text-xs font-semibold border shadow-2xs backdrop-blur-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25">
                            {due} Due Review
                          </span>
                        ) : isMastered ? (
                          <span className="px-3.5 py-1 rounded-full text-xs font-semibold border shadow-2xs backdrop-blur-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25">
                            Mastered
                          </span>
                        ) : isInProgress ? (
                          <span className="px-3.5 py-1 rounded-full text-xs font-semibold border shadow-2xs backdrop-blur-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25">
                            In Progress
                          </span>
                        ) : (
                          <span className="px-3.5 py-1 rounded-full text-xs font-semibold border shadow-2xs backdrop-blur-md bg-foreground/[0.04] dark:bg-white/[0.06] text-muted-foreground border-border/70 dark:border-white/10">
                            Interview Module
                          </span>
                        )}
                      </div>

                      {total > 0 ? (
                        <CircularMasteryRing pct={pct} isMastered={isMastered} />
                      ) : (
                        <div
                          className={cn(
                            'size-11 sm:size-12 rounded-2xl flex items-center justify-center border shadow-2xs backdrop-blur-md transition-all duration-300 group-hover:scale-105 shrink-0',
                            'bg-foreground/[0.03] dark:bg-white/[0.06] border-border/70 dark:border-white/10',
                            'group-hover:border-primary/40 group-hover:bg-primary/[0.05]'
                          )}
                        >
                          <Icon className="size-5 text-foreground/80 group-hover:text-primary transition-colors" />
                        </div>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {group.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 mt-1.5 font-normal">
                        {group.description ||
                          'Core theoretical concepts, edge cases, real interview questions, and deep answers.'}
                      </p>
                    </div>

                    {/* Meta tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="px-2.5 py-0.5 rounded-lg bg-foreground/[0.03] dark:bg-white/[0.04] border border-border/60 dark:border-white/10 font-mono text-[11px] text-muted-foreground backdrop-blur-xs">
                        {total} {total === 1 ? 'question' : 'questions'}
                      </span>
                      {total > 0 && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-foreground/[0.03] dark:bg-white/[0.04] border border-border/60 dark:border-white/10 font-mono text-[11px] text-muted-foreground backdrop-blur-xs">
                          {mastered} mastered
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer Dual Action Row */}
                  <div className="pt-4 mt-4 border-t border-border/50 dark:border-white/10 flex items-center justify-between gap-2.5">
                    <span className="font-mono text-xs text-muted-foreground truncate">
                      {total > 0 ? (
                        <>
                          <strong className="text-foreground">{mastered}</strong>/{total} solved
                        </>
                      ) : (
                        `/${group.slug}`
                      )}
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/interview/${group.slug}?mode=list`}
                        className="px-3 py-2 rounded-full text-xs font-semibold bg-foreground/[0.04] dark:bg-white/[0.06] hover:bg-muted text-muted-foreground hover:text-foreground border border-border/70 dark:border-white/10 transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Browse</span>
                        <ArrowRight className="size-3" />
                      </Link>

                      <Link
                        href={`/interview/${group.slug}?mode=deck`}
                        className="px-4 py-2 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover active:scale-95 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Zap className="size-3.5 fill-current" />
                        <span>Flashcards</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
