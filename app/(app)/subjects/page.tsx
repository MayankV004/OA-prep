'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeading } from '@/components/ui/typography';
import {
  BookOpen,
  Cpu,
  Database,
  Network,
  Layers,
  Code2,
  ArrowRight,
  Search,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Group {
  _id: string;
  name: string;
  slug: string;
  kind: string;
  description?: string;
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
    icon: BookOpen,
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
  };
}

import { queryKeys, STALE_TIMES } from '@/lib/query-keys';

export default function SubjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: groups = [], isLoading } = useQuery<Group[]>({
    queryKey: queryKeys.groups.byKind('subject'),
    queryFn: async () => {
      const res = await fetch('/api/groups?kind=subject');
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: STALE_TIMES.static,
  });

  const filteredGroups = useMemo(() => {
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [groups, searchQuery]);

  return (
    <div className="space-y-8 pb-16">
      {/* ── 1. Page Header (Modern Cockpit Header) ── */}
      <div className="pt-2 space-y-3">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-foreground leading-[1.08]">
          Core CS{' '}
          <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-200 bg-clip-text text-transparent">
            Subjects
          </span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed font-normal">
          High-yield engineering notes and interview preparation guides covering Operating Systems, DBMS, Computer Networks, OOPs, and System Design.
        </p>
      </div>

      {/* ── 2. Search & Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2.5 rounded-2xl bg-card/70 border border-border/80 backdrop-blur-md shadow-xs">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search subjects by name, topic, or concept..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-xs sm:text-sm font-medium bg-background/80 rounded-xl border border-border/80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans"
          />
        </div>
        {!isLoading && groups.length > 0 && (
          <div className="text-xs font-mono text-muted-foreground px-2">
            <span>Showing <strong className="text-foreground">{filteredGroups.length}</strong> of {groups.length} subjects</span>
          </div>
        )}
      </div>

      {/* ── 3. Subjects Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col justify-between p-6 sm:p-7 rounded-[28px] sm:rounded-3xl bg-card/60 dark:bg-card/30 border border-border/70 dark:border-white/10 backdrop-blur-xl space-y-4"
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
              title="No subjects found"
              description={
                searchQuery
                  ? `No subjects match "${searchQuery}". Try a different keyword.`
                  : 'Core computer science subjects will appear here once published.'
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group) => {
            const meta = getSubjectMeta(group.slug, group.name);
            const Icon = meta.icon;

            return (
              <Link
                key={group._id}
                href={`/subjects/${group.slug}`}
                className="group block h-full outline-none"
              >
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
                    {/* Header Row: Subject Pill + Icon Container */}
                    <div className="flex items-start justify-between gap-3">
                      <span className="px-3.5 py-1 rounded-full text-xs font-semibold border shadow-2xs backdrop-blur-md bg-foreground/[0.04] dark:bg-white/[0.06] text-muted-foreground border-border/70 dark:border-white/10">
                        Technical Subject
                      </span>

                      <div
                        className={cn(
                          'size-11 sm:size-12 rounded-2xl flex items-center justify-center border shadow-2xs backdrop-blur-md transition-all duration-300 group-hover:scale-105 shrink-0',
                          'bg-foreground/[0.03] dark:bg-white/[0.06] border-border/70 dark:border-white/10',
                          'group-hover:border-primary/40 group-hover:bg-primary/[0.05]'
                        )}
                      >
                        <Icon className="size-5 text-foreground/80 group-hover:text-primary transition-colors" />
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {group.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 mt-1.5 font-normal">
                        {group.description ||
                          `Comprehensive interactive concept notes and interview preparation guide for ${group.name}.`}
                      </p>
                    </div>

                    {/* Meta tag */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="px-2.5 py-0.5 rounded-lg bg-foreground/[0.03] dark:bg-white/[0.04] border border-border/60 dark:border-white/10 font-mono text-[11px] text-muted-foreground backdrop-blur-xs">
                        Curriculum Track
                      </span>
                    </div>
                  </div>

                  {/* Single-Line Footer Action Row */}
                  <div className="pt-4 mt-4 border-t border-border/50 dark:border-white/10 flex items-center justify-between gap-3">
                    <span className="font-mono text-xs text-muted-foreground">
                      /{group.slug}
                    </span>

                    <div className="px-4 py-2 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover active:scale-95 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0">
                      <span>Explore Topics</span>
                      <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
