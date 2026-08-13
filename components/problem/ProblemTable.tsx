'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProblemRow, Problem } from './ProblemRow';
import { NotesDrawer } from './NotesDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
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
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header + Progress */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1.5">
            <span className="text-sm text-muted-foreground font-medium">{completed}/{total} completed</span>
            <span className="text-sm font-semibold text-primary">{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search problems..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-8"
          />
        </div>
        <div className="flex gap-1">
          {['all', 'Easy', 'Medium', 'Hard'].map(d => (
            <button
              key={d}
              onClick={() => setDiffFilter(d)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${diffFilter === d
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
            >
              {d === 'all' ? 'All' : d}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">No problems found.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden bg-card">
          <Accordion defaultValue={Object.keys(groupedByVariation)} className="w-full">
            {Object.entries(groupedByVariation).map(([variation, groupProblems], index) => (
              <AccordionItem key={variation} value={variation} className={index === Object.keys(groupedByVariation).length - 1 ? 'border-b-0' : ''}>
                <AccordionTrigger className="px-4 py-3 hover:bg-muted/30 text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <span>{variation}</span>
                    <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {groupProblems.filter(p => p.completed).length} / {groupProblems.length}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-0 pt-0">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 hidden">
                      <tr>
                        <th className="w-10 px-3 py-2" />
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Problem</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Difficulty</th>
                        {showRating && <th className="px-3 py-2 text-left font-medium text-muted-foreground">Rating</th>}
                        <th className="w-16 px-3 py-2" />
                      </tr>
                    </thead>
                    <tbody className="bg-background">
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
