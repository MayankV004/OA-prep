'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Search, X, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { EmptyState } from '@/components/ui/empty-state';
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


const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function DSAPageClient({ initialPatterns }: { initialPatterns: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in-progress' | 'mastered' | 'unstarted'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [localLastPattern, setLocalLastPattern] = useState<LastPracticedInfo | null>(null);

  // Read local fallback last pattern
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('bigo_last_pattern');
        if (stored) {
          setLocalLastPattern(JSON.parse(stored));
        }
      } catch {}
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

  // Aggregate stats
  const totalCompleted = useMemo(() => {
    return progressList.reduce((acc, curr) => acc + curr.completed, 0);
  }, [progressList]);

  const totalProblems = useMemo(() => {
    return progressList.reduce((acc, curr) => acc + curr.total, 0);
  }, [progressList]);

  const overallProgress = totalProblems > 0 ? Math.round((totalCompleted / totalProblems) * 100) : 0;

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
      const isUnstarted = stat.completed === 0;

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

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Cockpit Header & Mastery Metrics */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              Placement Roadmaps
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              • 14 Foundational Interview Patterns
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
            Algorithmic <span className="text-primary">Patterns</span>
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl font-normal leading-relaxed">
            Deconstruct complex interview problems into reusable structural templates. Master pattern triggers and write optimal solutions under timed assessment pressure.
          </p>
        </div>

        {/* Executive Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
          <div className="p-3 sm:p-4 rounded-2xl bg-card/60 border border-border/70 backdrop-blur-md text-center">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground block">
              Syllabus
            </span>
            <span className="text-xl sm:text-2xl font-black font-display text-foreground tabular-nums">
              {overallProgress}%
            </span>
            <div className="mt-1.5 h-1 w-12 mx-auto rounded-full bg-muted overflow-hidden">
              <div
                style={{ width: `${overallProgress}%` }}
                className="h-full rounded-full bg-primary transition-all duration-500"
              />
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-card/60 border border-border/70 backdrop-blur-md text-center">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-500 block">
              Mastered
            </span>
            <span className="text-xl sm:text-2xl font-black font-display text-foreground tabular-nums">
              {masteredCount}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">patterns</span>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-card/60 border border-border/70 backdrop-blur-md text-center">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500 block">
              In Progress
            </span>
            <span className="text-xl sm:text-2xl font-black font-display text-foreground tabular-nums">
              {inProgressCount}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">active tracks</span>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-card/60 border border-border/70 backdrop-blur-md text-center">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground block">
              Solved
            </span>
            <span className="text-xl sm:text-2xl font-black font-display text-foreground tabular-nums">
              {totalCompleted}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">/ {totalProblems}</span>
          </div>
        </div>
      </div>

      {/* 2. Resume Active Session Banner (If Candidate Has Recent Track) */}
      {lastPracticed && (
        <div className="p-5 sm:p-6 rounded-2xl bg-card/70 dark:bg-surface-elevated/40 border border-border/80 backdrop-blur-xl shadow-e2 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="pointer-events-none absolute -left-12 -top-12 size-36 rounded-full bg-emerald-500/10 blur-2xl" />
          
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">
                Resume Active Track
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                Last Practiced Session
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              {lastPracticed.title}
            </h3>
            <p className="text-xs text-muted-foreground font-mono">
              Progress: <span className="font-bold text-foreground">{lastPracticed.completed}</span> / {lastPracticed.total} variations completed
            </p>
          </div>

          <Link href={`/dsa/${lastPracticed.slug}`} className="relative z-10 shrink-0 w-full sm:w-auto">
            <button className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] border-t border-white/20 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2">
              <span>Continue Studying</span>
              <ArrowRight className="size-3.5" />
            </button>
          </Link>
        </div>
      )}

      {/* 3. Search & Dual-Tier Filter Toolbar */}
      <div className="space-y-3">
        {/* Search Bar & Status Tabs */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-2.5 rounded-2xl bg-card/70 border border-border/80 backdrop-blur-md shadow-xs">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search patterns, triggers, or complexities (e.g., sliding window, O(N))..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-9 text-xs sm:text-sm font-medium bg-background/80 rounded-xl border border-border/80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
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

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto p-1 rounded-xl bg-surface-sunken/80 border border-border/60">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'in-progress', label: 'In Progress' },
                { id: 'mastered', label: 'Mastered' },
                { id: 'unstarted', label: 'Unstarted' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
                  statusFilter === tab.id
                    ? 'bg-card text-foreground font-bold shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Taxonomy Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer',
                categoryFilter === cat.id
                  ? 'bg-primary/15 text-primary border-primary/30 font-bold'
                  : 'bg-card/40 text-muted-foreground border-border/50 hover:bg-card hover:text-foreground'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Pattern Grid */}
      {filteredPatterns.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-card/40 border border-dashed border-border/80">
          <EmptyState
            title="No patterns found"
            description={
              searchQuery
                ? `No patterns match your search "${searchQuery}". Try clearing filters.`
                : 'No patterns matching the selected criteria.'
            }
          />
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
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
                  <SpotlightCard
                    spotlightColor="rgba(16, 185, 129, 0.12)"
                    className="h-full flex flex-col justify-between p-6 rounded-3xl bg-card/70 border border-border/80 shadow-e2 group-hover:border-primary/50 transition-all duration-300 relative overflow-hidden"
                  >
                    {/* Top Specular Edge */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="space-y-4">
                      {/* Top Header Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h3 className="font-display text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                            {pattern.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                            <span>{variationsCount} variations</span>
                            <span>•</span>
                            <span>
                              <strong className="text-foreground">{stat.completed}</strong>/{stat.total} solved
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        {isMastered ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                            Mastered
                          </span>
                        ) : isInProgress ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                            In Progress
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border/40 shrink-0">
                            Unstarted
                          </span>
                        )}
                      </div>

                      {/* Description Snippet */}
                      {cleanDesc && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-normal">
                          {cleanDesc}
                        </p>
                      )}

                      {/* Complexities & Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {pattern.timeComplexity && (
                          <span className="px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground font-mono text-[10px] font-medium border border-border/40">
                            Time: {pattern.timeComplexity}
                          </span>
                        )}
                        {pattern.spaceComplexity && (
                          <span className="px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground font-mono text-[10px] font-medium border border-border/40">
                            Space: {pattern.spaceComplexity}
                          </span>
                        )}
                        {(pattern.useCases || []).slice(0, 2).map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md bg-primary/[0.06] text-primary text-[10px] font-medium border border-primary/15"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Progress Bar & Footer Action */}
                    <div className="pt-6 mt-4 border-t border-border/40 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium">Mastery</span>
                        <span className={cn('font-mono font-bold', isMastered ? 'text-primary' : 'text-foreground')}>
                          {isMastered ? '100% Solved' : `${pct}%`}
                        </span>
                      </div>

                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full rounded-full transition-all duration-500 bg-primary"
                        />
                      </div>

                      <div className="pt-1 flex items-center justify-between text-xs font-semibold text-primary group-hover:text-primary-hover transition-colors">
                        <span>Study Blueprint & Practice</span>
                        <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </SpotlightCard>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
