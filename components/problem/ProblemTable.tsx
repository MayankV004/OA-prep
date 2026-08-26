'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProblemRow, Problem } from './ProblemRow';
import { NotesDrawer } from './NotesDrawer';
import { Button } from '@/components/ui/button';
import { Check, Search, SearchX, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton, SkeletonRows } from '@/components/ui/skeleton';
import { Heading } from '@/components/ui/typography';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface ProblemTableProps {
  kind: 'pattern' | 'nonstandard' | 'cp';
  group: string;          // pattern slug, bucket slug, or platform slug
  groupLabel: string;     // human-readable label
  showRating?: boolean;
}

export function ProblemTable({ kind, group, groupLabel, showRating }: ProblemTableProps) {
  const [notesTarget, setNotesTarget] = useState<Problem | null>(null);
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState<string>('all');

  const queryKey = ['problems', { kind, group }];

  const { data: problems = [], isLoading } = useQuery<Problem[]>({
    queryKey,
    queryFn: async () => {
      const groupParam = kind === 'pattern' ? 'pattern' : kind === 'nonstandard' ? 'bucket' : 'platform';
      const res = await fetch(`/api/problems?kind=${kind}&${groupParam}=${encodeURIComponent(group)}`);
      if (!res.ok) throw new Error('Failed to load problems');
      return res.json();
    },
  });

  const filtered = problems.filter((p) => {
    const titleOrName = p.name || p.title || '';
    const matchesSearch = !search || titleOrName.toLowerCase().includes(search.toLowerCase());
    const matchesDiff = diffFilter === 'all' || p.difficulty === diffFilter;
    return matchesSearch && matchesDiff;
  });

  const completed = filtered.filter((p) => p.completed).length;
  const revisionCount = filtered.filter((p) => p.revision).length;
  const total = filtered.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Group by variation
  const groupedByVariation = filtered.reduce((acc, problem) => {
    const variation = problem.variation || 'General';
    if (!acc[variation]) acc[variation] = [];
    acc[variation].push(problem);
    return acc;
  }, {} as Record<string, Problem[]>);

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy role="status" aria-label={`Loading ${groupLabel} problems`}>
        <span className="sr-only">Loading problems…</span>
        <div className="space-y-2">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-full max-w-xs" />
          <Skeleton className="h-7 w-14 rounded-lg" />
          <Skeleton className="h-7 w-14 rounded-lg" />
          <Skeleton className="h-7 w-14 rounded-lg" />
        </div>
        <SkeletonRows rows={6} className="rounded-xl bg-card p-2 shadow-e2" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Practice Stats Bar (Matches /dsa practice UI) */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 p-4 shadow-sm sm:gap-6">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-xl bg-rose-500/10 text-rose-500">
            <Check className="size-4" strokeWidth={2.5} />
          </span>
          <div>
            <p className="text-xs text-text-muted">Solved</p>
            <p className="text-sm font-semibold tabular-nums text-foreground">
              {completed} / {total}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-xl bg-warning/10 text-warning">
            <Star className="size-4" />
          </span>
          <div>
            <p className="text-xs text-text-muted">Revision</p>
            <p className="text-sm font-semibold tabular-nums text-foreground">{revisionCount}</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="h-2 w-32 sm:w-48 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-red-400 transition-all duration-500"
              style={{ width: `${pct}%` }}
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <span className={cn('text-sm font-bold font-mono', pct === 100 ? 'text-rose-500' : 'text-foreground')}>
            {pct}%
          </span>
        </div>
      </div>

      {/* 2. Search & Difficulty Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search problems..."
            aria-label={`Search ${groupLabel} problems`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 text-sm font-medium bg-background/80 rounded-xl border border-border/40 focus:border-rose-500/50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by difficulty">
          {['all', 'Easy', 'Medium', 'Hard'].map((d) => (
            <button
              key={d}
              onClick={() => setDiffFilter(d)}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap',
                diffFilter === d
                  ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
              )}
            >
              {d === 'all' ? 'All Difficulties' : d}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Problem Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No problems found"
          description={
            search || diffFilter !== 'all'
              ? 'Nothing matches the current search and difficulty filter.'
              : `No problems have been added to ${groupLabel} yet.`
          }
          action={
            (search || diffFilter !== 'all') && (
              <Button
                variant="soft"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setDiffFilter('all');
                }}
              >
                Clear filters
              </Button>
            )
          }
          className="rounded-2xl bg-card shadow-sm border border-border/30 p-8"
        />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 shadow-sm">
          <Accordion defaultValue={Object.keys(groupedByVariation)} className="w-full gap-2 md:gap-0">
            {Object.entries(groupedByVariation).map(([variation, groupProblems]) => (
              <AccordionItem key={variation} value={variation} className="overflow-hidden border-b border-border/20 last:border-0">
                {Object.keys(groupedByVariation).length > 1 && (
                  <AccordionTrigger className="items-center bg-muted/40 px-4 py-3 hover:bg-muted/70 aria-expanded:bg-rose-500/10 aria-expanded:text-rose-500">
                    <span className="flex items-center gap-2">
                      <Heading level="card" as="span">{variation}</Heading>
                      <Badge variant="secondary" className="tabular-nums font-mono">
                        {groupProblems.filter((p) => p.completed).length} / {groupProblems.length}
                      </Badge>
                    </span>
                  </AccordionTrigger>
                )}
                <AccordionContent className="pt-0 pb-0">
                  {/* Practice Table Header */}
                  <div className="hidden grid-cols-[24px_32px_1fr_90px_32px_32px] items-center gap-3 border-b border-border/20 bg-muted/30 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:grid sm:px-5">
                    <span className="text-center">#</span>
                    <span className="text-center">Done</span>
                    <span>Problem</span>
                    <span className="text-center">Difficulty</span>
                    <span className="text-center">Rev</span>
                    <span className="text-right">Notes</span>
                  </div>

                  <table className="w-full text-sm max-md:block md:table">
                    <tbody className="max-md:flex max-md:flex-col max-md:gap-2 max-md:p-2 md:table-row-group">
                      {groupProblems.map((problem, idx) => (
                        <ProblemRow
                          key={problem._id}
                          problem={problem}
                          index={idx}
                          queryKey={queryKey}
                          onNotesClick={setNotesTarget}
                        />
                      ))}
                    </tbody>
                  </table>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {/* Notes Drawer */}
      {notesTarget && (
        <NotesDrawer
          problem={notesTarget}
          queryKey={queryKey}
          onClose={() => setNotesTarget(null)}
        />
      )}
    </div>
  );
}
