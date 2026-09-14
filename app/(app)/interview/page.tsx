'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Cpu,
  Database,
  Network,
  Layers,
  Code2,
  Sparkles,
  Search,
  CheckCircle2,
  MessageSquare,
  Flame,
  Star,
  Clock,
  Zap,
} from 'lucide-react';
import { PageHeading } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
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

export default function InterviewPage() {
  const [searchQuery, setSearchQuery] = useState('');

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
  const { data: statsData } = useQuery<StatsApiResponse>({
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
    if (!searchQuery.trim()) return groups;
    const q = searchQuery.toLowerCase();
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.slug.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q)
    );
  }, [groups, searchQuery]);

  const overall = statsData?.overall;

  return (
    <div className="space-y-8 pb-16">
      <PageHeading
        overline="Interview Prep & Flashcard Drills"
        title="Technical Interview Q&A & Flashcards"
        description="Master high-yield questions, test your mental models with 3D spaced-repetition flashcards, and prepare for top tier technical interviews."
      />

      {/* ── 1. Mastery Overview Stats Strip ── */}
      {overall && overall.totalQuestions > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 sm:p-5 rounded-2xl bg-card/60 border border-border/40 backdrop-blur-xl shadow-xs space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-2xs font-mono font-bold uppercase tracking-wider">Total Questions</span>
              <BookOpen className="size-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-foreground font-display">
              {overall.totalQuestions}
            </p>
            <p className="text-xs text-muted-foreground">Across {groups.length} subjects</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-card/60 border border-border/40 backdrop-blur-xl shadow-xs space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-2xs font-mono font-bold uppercase tracking-wider text-emerald-400">Mastered</span>
              <CheckCircle2 className="size-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-display">
                {overall.totalMastered}
              </p>
              <span className="text-xs font-mono text-muted-foreground">({overall.masteryPercentage}%)</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted/40 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${overall.masteryPercentage}%` }}
              />
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-card/60 border border-border/40 backdrop-blur-xl shadow-xs space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-2xs font-mono font-bold uppercase tracking-wider text-amber-400">Due for Review</span>
              <Clock className="size-4 text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-400 font-display">
              {overall.totalDue}
            </p>
            <p className="text-xs text-muted-foreground">
              {overall.totalDue > 0 ? 'Spaced repetition due' : 'All caught up!'}
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-card/60 border border-border/40 backdrop-blur-xl shadow-xs space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-2xs font-mono font-bold uppercase tracking-wider text-yellow-400">Starred Cards</span>
              <Star className="size-4 text-yellow-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-yellow-400 font-display">
              {overall.totalBookmarked}
            </p>
            <p className="text-xs text-muted-foreground">Saved for pre-round cram</p>
          </div>
        </div>
      )}

      {/* ── 2. Search & Filter Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search interview subjects or topics..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-card/80 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            {filteredGroups.length} subject {filteredGroups.length === 1 ? 'module' : 'modules'}
          </span>
        </div>
      </div>

      {/* ── 3. Subject Cards Grid ── */}
      {isGroupsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-56 rounded-2xl bg-card/50 border border-border/30 p-5 space-y-3"
            >
              <Skeleton className="size-11 rounded-xl" />
              <Skeleton className="h-5 w-36 rounded-md" />
              <Skeleton className="h-3.5 w-full rounded-md" />
              <Skeleton className="h-3.5 w-2/3 rounded-md" />
            </div>
          ))}
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-8 shadow-xs">
          <EmptyState
            icon={MessageSquare}
            title="No question sets found"
            description={
              searchQuery
                ? `No interview question sets matched "${searchQuery}".`
                : 'Interview subjects will appear here once they have been added to your workspace.'
            }
          />
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group) => {
            const meta = getSubjectMeta(group.slug, group.name);
            const Icon = meta.icon;
            const stats = subjectStatsMap.get(group._id) || subjectStatsMap.get(group.slug);
            const total = stats?.totalQuestions || 0;
            const mastered = stats?.masteredCount || 0;
            const pct = stats?.masteryPercentage || 0;
            const due = stats?.dueCount || 0;

            return (
              <div
                key={group._id}
                className={cn(
                  'relative overflow-hidden rounded-2xl border border-border/30 bg-card/70 hover:bg-card/90 backdrop-blur-xl p-5 sm:p-6',
                  'transition-all duration-200 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1',
                  'flex flex-col justify-between space-y-5'
                )}
              >
                {/* Subtle top gradient glow */}
                <div
                  className={cn(
                    'absolute -top-12 -right-12 size-36 rounded-full blur-2xl opacity-20 pointer-events-none transition-opacity duration-300 hover:opacity-40 bg-gradient-to-br',
                    meta.gradient
                  )}
                />

                <div className="relative space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div
                      className={cn(
                        'grid size-12 place-items-center rounded-xl border transition-all duration-200 shadow-sm',
                        meta.bg,
                        meta.border,
                        meta.text
                      )}
                    >
                      <Icon className="size-6" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      {due > 0 && (
                        <span className="text-3xs font-mono font-bold px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400">
                          {due} Due
                        </span>
                      )}
                      <span className="text-2xs font-mono font-semibold px-2.5 py-0.5 rounded-full border border-border/40 bg-muted/40 text-muted-foreground">
                        {total} {total === 1 ? 'Card' : 'Cards'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-display text-xl font-bold text-foreground">
                      {group.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-normal">
                      {group.description ||
                        'Core theoretical concepts, edge cases, real interview questions, and deep answers.'}
                    </p>
                  </div>

                  {/* Progress bar */}
                  {total > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-2xs font-mono">
                        <span className="text-muted-foreground">Mastery</span>
                        <span className="text-emerald-400 font-bold">
                          {mastered}/{total} ({pct}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted/40 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Dual Action CTAs */}
                <div className="relative flex items-center justify-between gap-2 pt-3 border-t border-border/30">
                  <Link
                    href={`/interview/${group.slug}?mode=deck`}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Zap className="size-3.5" />
                    <span>3D Flashcards</span>
                  </Link>
                  <Link
                    href={`/interview/${group.slug}?mode=list`}
                    className="py-2 px-3 rounded-xl border border-border/40 hover:bg-muted/60 text-muted-foreground hover:text-foreground text-xs font-semibold text-center transition-all flex items-center gap-1"
                  >
                    <span>Browse List</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
