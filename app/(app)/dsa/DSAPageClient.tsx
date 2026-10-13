'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import {
  Search,
  X,
  ArrowRight,
  RotateCcw,
  Layers,
  Code2,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PatternStat {
  group: string;
  slug?: string;
  total: number;
  completed: number;
}

interface LastPracticedInfo {
  title: string;
  slug: string;
  completed: number;
  total: number;
  updatedAt?: string;
}

interface CategoryFilterItem {
  id: string;
  label: string;
  keywords: string[];
}

const CATEGORY_FILTERS: CategoryFilterItem[] = [
  { id: 'all', label: 'All Patterns', keywords: [] },
  { id: 'two-pointers', label: 'Two Pointers & Sliding Window', keywords: ['pointer', 'window', 'two pointers', 'sliding'] },
  { id: 'fast-slow', label: 'Fast & Slow / Cyclic Sort', keywords: ['cyclic', 'fast', 'slow', 'linked list'] },
  { id: 'trees-graphs', label: 'Trees & Graphs', keywords: ['tree', 'graph', 'bfs', 'dfs', 'topological'] },
  { id: 'intervals-heaps', label: 'Intervals & Heaps', keywords: ['interval', 'heap', 'merge', 'k-way'] },
  { id: 'dp', label: 'Dynamic Programming', keywords: ['dynamic', 'dp', 'knapsack', 'subsets'] },
  { id: 'binary-search', label: 'Binary Search', keywords: ['binary search', 'search', 'modified'] },
];

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
      {/* Center readout: checkmark if mastered, else percentage number */}
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
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

export default function DSAPageClient({ initialPatterns }: { initialPatterns: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in-progress' | 'mastered' | 'unstarted'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [localLastPattern, setLocalLastPattern] = useState<LastPracticedInfo | null>(null);
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

  // Read local fallback last pattern
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('bigo_last_pattern');
        if (stored) {
          setLocalLastPattern(JSON.parse(stored));
        }
      } catch { }
    }
  }, []);

  const { data: progressResponse } = useQuery<any>({
    queryKey: ['problems', 'progress', 'pattern'],
    queryFn: async () => {
      const res = await fetch('/api/problems/progress?kind=pattern');
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 15_000,
  });

  const progressList: PatternStat[] = Array.isArray(progressResponse)
    ? progressResponse
    : progressResponse?.stats || [];

  const apiLastPracticed: LastPracticedInfo | null = progressResponse?.lastPracticed || null;
  const lastPracticed: LastPracticedInfo | null = apiLastPracticed || localLastPattern;

  const statsMap = useMemo(() => {
    return Object.fromEntries(progressList.map((p) => [p.group, p]));
  }, [progressList]);

  const masteredCount = useMemo(() => {
    return initialPatterns.filter((p) => {
      const s = statsMap[p.title];
      return s && s.total > 0 && s.completed === s.total;
    }).length;
  }, [initialPatterns, statsMap]);

  const inProgressCount = useMemo(() => {
    return initialPatterns.filter((p) => {
      const s = statsMap[p.title];
      return s && s.completed > 0 && s.completed < s.total;
    }).length;
  }, [initialPatterns, statsMap]);

  const unstartedCount = Math.max(0, initialPatterns.length - masteredCount - inProgressCount);

  // Filter patterns
  const filteredPatterns = useMemo(() => {
    return initialPatterns.filter((pattern) => {
      // 1. Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        pattern.title.toLowerCase().includes(q) ||
        (pattern.useCases || []).some((tag: string) => tag.toLowerCase().includes(q)) ||
        (pattern.timeComplexity || '').toLowerCase().includes(q) ||
        (pattern.spaceComplexity || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // 2. Status Filter
      const stat = statsMap[pattern.title] ?? { total: 0, completed: 0 };
      const isMastered = stat.total > 0 && stat.completed === stat.total;
      const isInProgress = stat.completed > 0 && stat.completed < stat.total;
      const isUnstarted = !stat.completed || stat.completed === 0;

      if (statusFilter === 'mastered' && !isMastered) return false;
      if (statusFilter === 'in-progress' && !isInProgress) return false;
      if (statusFilter === 'unstarted' && !isUnstarted) return false;

      // 3. Category Filter
      if (categoryFilter !== 'all') {
        const catConfig = CATEGORY_FILTERS.find((c) => c.id === categoryFilter);
        if (catConfig && catConfig.keywords) {
          const lowerTitle = pattern.title.toLowerCase();
          const lowerUseCases = (pattern.useCases || []).map((u: string) => u.toLowerCase()).join(' ');
          const matchesCategory = catConfig.keywords.some(
            (kw) => lowerTitle.includes(kw) || lowerUseCases.includes(kw)
          );
          if (!matchesCategory) return false;
        }
      }

      return true;
    });
  }, [initialPatterns, searchQuery, statusFilter, categoryFilter, statsMap]);

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all' || categoryFilter !== 'all';
  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Cockpit Header */}
      <div className="pt-1">
        <div className="space-y-2 max-w-3xl">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.08]">
            Algorithmic{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-200 bg-clip-text text-transparent">
              Patterns
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl font-normal leading-relaxed">
            Deconstruct complex interview problems into reusable structural blueprints. Master pattern recognition triggers, analyze space-time trade-offs, and drill high-yield variations.
          </p>
        </div>
      </div>

      {/* 2. Resume Active Track (Separated by top and bottom border, clean frameless design) */}
      {lastPracticed && (
        <div className="py-5 sm:py-6 border-y border-foreground/20 dark:border-white/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider block">
              Last Practiced Session
            </span>
            <h2 className="text-lg sm:text-xl font-bold font-display text-foreground">
              {lastPracticed.title}
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              Progress: <strong className="text-foreground">{lastPracticed.completed}</strong> of {lastPracticed.total} variations completed
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex flex-col gap-1 w-full sm:w-36">
              <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                <span>Progress</span>
                <span>{lastPracticed.total > 0 ? Math.round((lastPracticed.completed / lastPracticed.total) * 100) : 0}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted/80 overflow-hidden">
                <div
                  style={{ width: `${lastPracticed.total > 0 ? (lastPracticed.completed / lastPracticed.total) * 100 : 0}%` }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
            </div>

            <Link href={`/dsa/${lastPracticed.slug}`} className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary-hover shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2">
                <span>Continue Studying</span>
                <ArrowRight className="size-3.5" />
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* 3. Search & Dual-Tier Filter Toolbar */}
      <div className="space-y-3">
        {/* Search Bar & Status Tabs */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl bg-card/60 border border-border/70 backdrop-blur-md shadow-xs">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search patterns by name, triggers, or complexities (e.g. 'two pointers', 'O(N)')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-16 text-xs sm:text-sm font-medium bg-background/80 rounded-xl border border-border/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
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

          {/* Status Filter Tabs with Counts */}
          <div className="flex items-center gap-1 overflow-x-auto p-1 rounded-xl bg-surface-sunken/80 border border-border/60 shrink-0">
            {(
              [
                { id: 'all', label: 'All', count: initialPatterns.length },
                { id: 'in-progress', label: 'In Progress', count: inProgressCount },
                { id: 'mastered', label: 'Mastered', count: masteredCount },
                { id: 'unstarted', label: 'Unstarted', count: unstartedCount },
              ] as const
            ).map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5',
                    isActive
                      ? 'bg-card text-foreground font-bold shadow-2xs border border-border/60'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      'px-1.5 py-0.2 rounded text-[10px] font-mono tabular-nums',
                      isActive ? 'bg-muted text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Taxonomy Filter Chips & Feedback Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-0.5">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {CATEGORY_FILTERS.map((cat) => {
              const isActive = categoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer',
                    isActive
                      ? 'bg-primary/15 text-primary border-primary/30 font-bold shadow-2xs'
                      : 'bg-card/50 text-muted-foreground border-border/60 hover:bg-card hover:text-foreground'
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-muted-foreground font-mono shrink-0 pl-1">
            <span>
              Showing <strong className="text-foreground">{filteredPatterns.length}</strong> of {initialPatterns.length}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-primary hover:text-primary-hover font-semibold hover:underline cursor-pointer ml-1"
              >
                <RotateCcw className="size-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Pattern Grid (Modern LMS Course-Cards Aesthetic with Pastel Tones) */}
      {filteredPatterns.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-card/40 border border-dashed border-border/80 space-y-4">
          <div className="size-12 rounded-2xl bg-muted/60 border border-border/60 flex items-center justify-center text-muted-foreground mx-auto">
            <Search className="size-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">No patterns found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {searchQuery
                ? `No patterns match "${searchQuery}". Try searching for alternative triggers or clearing filters.`
                : 'No patterns found under the selected category and status criteria.'}
            </p>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary-hover transition-all cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>Clear All Filters</span>
            </button>
          )}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
        >
          {filteredPatterns.map((pattern) => {
            const stat = statsMap[pattern.title] ?? { total: 0, completed: 0 };
            const pct = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
            const isMastered = pct === 100 && stat.total > 0;
            const isInProgress = stat.completed > 0 && stat.completed < stat.total;
            const slug = pattern.slug;
            const variationsCount = pattern.variations?.length || 0;

            // Clean description snippet
            const rawDesc = pattern.description || pattern.concept || '';
            const cleanDesc = rawDesc.replace(/[#*`_]/g, '').trim();

            return (
              <motion.div key={pattern.title} variants={itemVariants} className="h-full">
                <Link href={`/dsa/${slug}`} className="group block h-full outline-none">
                  <div
                    className={cn(
                      'h-full flex flex-col justify-between p-6 sm:p-7 rounded-[28px] sm:rounded-3xl border transition-all duration-300 relative overflow-hidden',
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
                      {/* Top Header Row: Frosted Badge + Circular Mastery Ring */}
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className={cn(
                            'px-3.5 py-1 rounded-full text-xs font-semibold border shadow-2xs backdrop-blur-md',
                            isMastered
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                              : isInProgress
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
                              : 'bg-foreground/[0.04] dark:bg-white/[0.06] text-muted-foreground border-border/70 dark:border-white/10'
                          )}
                        >
                          {isMastered ? 'Mastered' : isInProgress ? 'In Progress' : 'Roadmap'}
                        </span>

                        <CircularMasteryRing pct={pct} isMastered={isMastered} />
                      </div>

                      {/* Pattern Title & Subtitle */}
                      <div>
                        <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                          {pattern.title}
                        </h3>
                        {cleanDesc && (
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 mt-1.5 font-normal">
                            {cleanDesc}
                          </p>
                        )}
                      </div>

                      {/* Variations & Tasks Meta Row */}
                      <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium text-foreground/80 pt-1">
                        <span className="flex items-center gap-1.5">
                          <Layers className="size-3.5 text-muted-foreground" />
                          {variationsCount} variations
                        </span>
                        <span className="text-muted-foreground/40">•</span>
                        <span className="flex items-center gap-1.5">
                          <Code2 className="size-3.5 text-muted-foreground" />
                          <strong className="text-foreground">{stat.completed}</strong>/{stat.total} solved
                        </span>
                      </div>

                      {/* Complexities Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {pattern.timeComplexity && (
                          <span className="px-2.5 py-0.5 rounded-lg bg-foreground/[0.03] dark:bg-white/[0.04] border border-border/60 dark:border-white/10 font-mono text-[11px] text-muted-foreground backdrop-blur-xs">
                            Time: {pattern.timeComplexity}
                          </span>
                        )}
                        {pattern.spaceComplexity && (
                          <span className="px-2.5 py-0.5 rounded-lg bg-foreground/[0.03] dark:bg-white/[0.04] border border-border/60 dark:border-white/10 font-mono text-[11px] text-muted-foreground backdrop-blur-xs">
                            Space: {pattern.spaceComplexity}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer Action Row */}
                    <div className="pt-4 mt-4 border-t border-border/50 dark:border-white/10 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                        <span className="font-bold text-foreground">{stat.completed}</span>
                        <span>/</span>
                        <span>{stat.total} solved</span>
                      </div>

                      <div className="px-4 py-2 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover active:scale-95 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0">
                        <span>{isMastered ? 'Review' : isInProgress ? 'Continue' : 'Practice'}</span>
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

