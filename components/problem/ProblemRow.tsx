'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Problem {
  _id: string;
  title: string;
  url: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completed: boolean;
  notes?: string;
  tags?: string[];
  pattern?: string;
  bucket?: string;
  platform?: string;
  contest?: string;
  rating?: number;
}

interface ProblemRowProps {
  problem: Problem;
  queryKey: unknown[];
  onNotesClick: (problem: Problem) => void;
}

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  Medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  Hard: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
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

  return (
    <tr className={cn(
      'group border-b border-border/50 transition-colors hover:bg-muted/30',
      problem.completed && 'opacity-60'
    )}>
      <td className="w-10 px-3 py-3">
        <Checkbox
          checked={problem.completed}
          onCheckedChange={(val) => toggleMutation.mutate(val === true)}
          aria-label={`Mark ${problem.title} as ${problem.completed ? 'incomplete' : 'complete'}`}
        />
      </td>
      <td className="px-3 py-3">
        <a
          href={problem.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'font-medium hover:underline flex items-center gap-1.5 max-w-sm',
            problem.completed && 'line-through text-muted-foreground'
          )}
        >
          {problem.title}
          <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 flex-shrink-0" />
        </a>
        {problem.tags && problem.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {problem.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </td>
      <td className="px-3 py-3">
        <span className={cn(
          'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
          DIFFICULTY_STYLES[problem.difficulty]
        )}>
          {problem.difficulty}
        </span>
      </td>
      {problem.rating !== undefined && (
        <td className="px-3 py-3 text-sm text-muted-foreground">{problem.rating}</td>
      )}
      <td className="w-16 px-3 py-3 text-right">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onNotesClick(problem)}
          aria-label="Edit notes"
          className={cn(problem.notes ? 'text-primary' : 'text-muted-foreground')}
        >
          <FileText className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
}
