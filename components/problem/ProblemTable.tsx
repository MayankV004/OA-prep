'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProblemRow, Problem } from './ProblemRow';
import { NotesDrawer } from './NotesDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, SearchX } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton, SkeletonRows } from '@/components/ui/skeleton';
import { Heading, Text } from '@/components/ui/typography';
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

  const filtered = problems.filter(p => {
    const titleOrName = (p.name || p.title || '');
    const matchesSearch = !search || titleOrName.toLowerCase().includes(search.toLowerCase());
    const matchesDiff = diffFilter === 'all' || p.difficulty === diffFilter;
    return matchesSearch && matchesDiff;
  });

  const completed = filtered.filter(p => p.completed).length;
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
    <div className="space-y-4">
      {/* Progress summary */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <Text as="span" size="caption" tone="secondary" weight="medium" numeric>
            {completed}/{total} completed
          </Text>
          <Text as="span" size="caption" tone={pct === 100 ? 'success' : 'accent'} weight="semibold" numeric>
            {pct}%
          </Text>
        </div>
        <Progress value={pct} className="h-2" />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Search problems..."
            aria-label={`Search ${groupLabel} problems`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-9 pl-8"
          />
        </div>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by difficulty">
          {['all', 'Easy', 'Medium', 'Hard'].map(d => (
            <Button
              key={d}
              variant={diffFilter === d ? 'default' : 'ghost'}
              size="sm"
              aria-pressed={diffFilter === d}
              onClick={() => setDiffFilter(d)}
            >
              {d === 'all' ? 'All' : d}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
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
          className="rounded-xl bg-card shadow-e2"
        />
      ) : (
        <div className="overflow-hidden rounded-xl md:bg-card md:shadow-e2">
          <Accordion defaultValue={Object.keys(groupedByVariation)} className="w-full gap-2 md:gap-0">
            {Object.entries(groupedByVariation).map(([variation, groupProblems]) => (
              <AccordionItem key={variation} value={variation} className="overflow-hidden rounded-xl border-b-0! md:rounded-none">
                <AccordionTrigger className="items-center bg-surface-sunken px-4 py-3 hover:bg-muted aria-expanded:bg-accent aria-expanded:text-accent-foreground">
                  <span className="flex items-center gap-2">
                    <Heading level="card" as="span">{variation}</Heading>
                    <Badge variant="secondary" className="tabular-nums">
                      {groupProblems.filter(p => p.completed).length} / {groupProblems.length}
                    </Badge>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pt-0 pb-0">
                  <table className="w-full text-sm max-md:block md:table">
                    <thead className="hidden">
                      <tr>
                        <th className="w-10 px-3 py-2" />
                        <th className="px-3 py-2 text-left font-medium text-text-muted">Problem</th>
                        <th className="px-3 py-2 text-left font-medium text-text-muted">Difficulty</th>
                        {showRating && <th className="px-3 py-2 text-left font-medium text-text-muted">Rating</th>}
                        <th className="w-16 px-3 py-2" />
                      </tr>
                    </thead>
                    <tbody className="max-md:flex max-md:flex-col max-md:gap-2 max-md:p-2 md:table-row-group">
                      {groupProblems.map(problem => (
                        <ProblemRow
                          key={problem._id}
                          problem={problem}
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
