'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Check, ExternalLink, Star, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Problem {
  _id: string;
  title?: string;
  name?: string;
  url?: string;
  link?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completed: boolean;
  notes?: string;
  userNotes?: string;
  revision?: boolean;
  tags?: string[];
  pattern?: string;
  variation?: string;
  bucket?: string;
  platform?: string;
  contest?: string;
  rating?: number;
  company_tags?: string[];
}

interface ProblemRowProps {
  problem: Problem;
  index?: number;
  queryKey: unknown[];
  onNotesClick: (problem: Problem) => void;
}

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: 'bg-success-muted text-success border border-success/20',
  Medium: 'bg-warning-muted text-warning border border-warning/20',
  Hard: 'bg-destructive/10 text-destructive border border-destructive/20',
};

export function ProblemRow({ problem, index = 0, queryKey, onNotesClick }: ProblemRowProps) {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: async (completed: boolean) => {
      const res = await fetch(`/api/problems/${problem._id}/completion`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onMutate: async (completed) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: Problem[] | undefined) =>
        old?.map((p) => (p._id === problem._id ? { ...p, completed } : p))
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(queryKey, ctx?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      queryClient.invalidateQueries({ queryKey: ['variationProgress'] });
      queryClient.invalidateQueries({ queryKey: ['patternProgress'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });

  const revisionMutation = useMutation({
    mutationFn: async (revision: boolean) => {
      const res = await fetch('/api/problems/revision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId: problem._id, revision }),
      });
      if (!res.ok) throw new Error('Failed to update revision');
      return res.json();
    },
    onMutate: async (revision) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: Problem[] | undefined) =>
        old?.map((p) => (p._id === problem._id ? { ...p, revision } : p))
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(queryKey, ctx?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['problems'] });
    },
  });

  const label = problem.name || problem.title || 'problem';
  const url = problem.link || problem.url || '#';
  const hasNotes = Boolean(problem.notes || problem.userNotes);

  return (
    <tr
      className={cn(
        'group transition-colors duration-150 ease-out-quart',
        'max-md:grid max-md:grid-cols-[2.75rem_minmax(0,1fr)_2.5rem] max-md:items-start max-md:gap-x-2 max-md:rounded-xl max-md:bg-card max-md:p-3 max-md:shadow-e1',
        'md:table-row md:odd:bg-surface-sunken/40 md:hover:bg-accent/40',
        problem.completed && 'opacity-70'
      )}
    >
      {/* Index */}
      <td className="hidden md:table-cell w-8 px-3 py-3 text-center text-xs font-medium tabular-nums text-text-muted">
        {index + 1}
      </td>

      {/* Completion toggle */}
      <td className="max-md:col-start-1 max-md:row-span-2 max-md:row-start-1 max-md:flex max-md:size-11 max-md:items-center max-md:justify-center md:table-cell md:w-10 md:px-3 md:py-3">
        <button
          type="button"
          onClick={() => toggleMutation.mutate(!problem.completed)}
          aria-pressed={problem.completed}
          aria-label={`Mark ${label} as ${problem.completed ? 'incomplete' : 'complete'}`}
          className="press grid size-8 shrink-0 place-items-center rounded-full outline-none"
        >
          <span
            aria-hidden
            className={cn(
              'grid size-6 place-items-center rounded-full border-2 transition-all duration-200',
              problem.completed
                ? 'border-rose-500 bg-rose-500 text-white shadow-[0_0_10px_rgba(225,29,72,0.4)]'
                : 'border-muted-foreground/30 bg-transparent text-transparent group-hover:border-rose-500/50'
            )}
          >
            <Check className="size-3.5" strokeWidth={3} />
          </span>
        </button>
      </td>

      {/* Title & Platform */}
      <td className="max-md:col-start-2 max-md:row-start-1 max-md:block max-md:py-1.5 md:table-cell md:px-3 md:py-3">
        <div className="flex flex-col gap-1">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'group/link inline-flex max-w-md items-center gap-1.5 text-sm font-medium transition-colors duration-150 hover:text-rose-500',
              problem.completed ? 'text-text-muted line-through decoration-text-muted/50' : 'text-foreground'
            )}
          >
            <span className="truncate">{label}</span>
            <ExternalLink
              aria-hidden
              className="size-3.5 shrink-0 text-text-muted opacity-0 transition-opacity duration-150 group-hover/link:opacity-100"
            />
          </a>

          <div className="flex flex-wrap items-center gap-1.5">
            {problem.platform && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                {problem.platform}
              </span>
            )}
            {problem.tags && problem.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                {problem.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="ghost" className="h-4 px-1.5 text-[10px] bg-muted/60 text-text-muted">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Difficulty badge */}
      <td className="max-md:col-start-2 max-md:row-start-2 max-md:block max-md:pb-1.5 md:table-cell md:px-3 md:py-3 md:text-center">
        <Badge
          variant="secondary"
          className={cn('text-xs font-semibold', DIFFICULTY_STYLES[problem.difficulty] ?? 'bg-muted text-text-muted')}
        >
          {problem.difficulty}
        </Badge>
      </td>

      {/* Revision Star Toggle */}
      <td className="hidden md:table-cell w-10 px-2 py-3 text-center">
        <button
          type="button"
          onClick={() => revisionMutation.mutate(!problem.revision)}
          aria-pressed={problem.revision}
          aria-label={problem.revision ? 'Remove from revision' : 'Mark for revision'}
          className="press inline-grid size-8 place-items-center rounded-lg outline-none transition-colors hover:bg-warning-muted"
        >
          <Star
            className={cn(
              'size-4 transition-colors duration-150',
              problem.revision
                ? 'fill-warning text-warning'
                : 'fill-transparent text-text-muted group-hover:text-warning/70'
            )}
          />
        </button>
      </td>

      {/* Notes button */}
      <td className="max-md:col-start-3 max-md:row-start-1 max-md:flex max-md:justify-end md:table-cell md:w-12 md:px-3 md:py-3 md:text-right">
        <button
          type="button"
          onClick={() => onNotesClick(problem)}
          aria-label={`${hasNotes ? 'Edit' : 'Add'} notes for ${label}`}
          className={cn(
            'press inline-grid size-8 place-items-center rounded-lg outline-none transition-colors',
            hasNotes ? 'bg-primary/10 text-rose-500 font-semibold' : 'text-text-muted hover:bg-accent hover:text-foreground'
          )}
        >
          <StickyNote className="size-4" />
        </button>
      </td>
    </tr>
  );
}
