'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/typography';
import { ExternalLink, FileText } from 'lucide-react';
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
  queryKey: unknown[];
  onNotesClick: (problem: Problem) => void;
}

/** Colour reinforces the written label; it never carries the meaning alone. */
const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: 'bg-success-muted text-success',
  Medium: 'bg-warning-muted text-warning',
  Hard: 'bg-danger-muted text-destructive',
};

export function ProblemRow({ problem, queryKey, onNotesClick }: ProblemRowProps) {
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
        old?.map(p => p._id === problem._id ? { ...p, completed } : p)
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(queryKey, ctx?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const label = problem.name || problem.title || 'problem';

  return (
    /*
      One row, two shapes: a stacked card below `md` (grid) and a real table
      row from `md` up (zebra striping instead of rules).
    */
    <tr
      className={cn(
        'group transition-colors duration-150 ease-out-quart',
        'max-md:grid max-md:grid-cols-[2.75rem_minmax(0,1fr)_2.5rem] max-md:items-start max-md:gap-x-2 max-md:rounded-xl max-md:bg-card max-md:p-2 max-md:shadow-e1',
        'md:table-row md:odd:bg-surface-sunken/60 md:hover:bg-accent/50',
        problem.completed && 'opacity-60'
      )}
    >
      <td className="max-md:col-start-1 max-md:row-span-2 max-md:row-start-1 max-md:flex max-md:size-11 max-md:items-center max-md:justify-center md:table-cell md:w-10 md:px-3 md:py-3">
        <Checkbox
          checked={problem.completed}
          onCheckedChange={(val) => toggleMutation.mutate(val === true)}
          aria-label={`Mark ${label} as ${problem.completed ? 'incomplete' : 'complete'}`}
          className="max-md:after:-inset-4"
        />
      </td>

      <td className="max-md:col-start-2 max-md:row-start-1 max-md:block max-md:py-1.5 md:table-cell md:px-3 md:py-3">
        <a
          href={problem.link || problem.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'flex max-w-sm items-center gap-1.5 text-sm font-medium transition-colors duration-150 ease-out-quart hover:text-primary',
            problem.completed ? 'text-text-muted line-through' : 'text-foreground'
          )}
        >
          <span className="truncate">{problem.name || problem.title}</span>
          <ExternalLink
            aria-hidden
            className="size-3 shrink-0 text-text-muted opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          />
        </a>
        {problem.tags && problem.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {problem.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="ghost" className="bg-muted text-text-muted">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </td>

      <td className="max-md:col-start-2 max-md:row-start-2 max-md:block max-md:pb-1.5 md:table-cell md:px-3 md:py-3">
        <span className="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className={cn('font-semibold', DIFFICULTY_STYLES[problem.difficulty] ?? 'bg-muted text-text-muted')}
          >
            {problem.difficulty}
          </Badge>
          {problem.platform && (
            <Text
              as="span"
              size="micro"
              tone="muted"
              weight="medium"
              className="uppercase tracking-[0.08em] md:hidden"
            >
              {problem.platform}
            </Text>
          )}
        </span>
      </td>

      {problem.rating !== undefined && (
        <td className="max-md:col-start-2 max-md:row-start-3 max-md:block max-md:pb-1.5 md:table-cell md:px-3 md:py-3">
          <Text as="span" size="caption" tone="muted" numeric>
            {problem.rating}
          </Text>
        </td>
      )}

      <td className="max-md:col-start-3 max-md:row-start-1 max-md:flex max-md:justify-end md:table-cell md:w-16 md:px-3 md:py-3 md:text-right">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onNotesClick(problem)}
          aria-label={`${problem.notes ? 'Edit' : 'Add'} notes for ${label}`}
          className={cn('max-md:size-10', problem.notes ? 'text-primary' : 'text-text-muted')}
        >
          <FileText aria-hidden className="size-4" />
        </Button>
      </td>
    </tr>
  );
}
