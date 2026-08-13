'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PatternData } from '@/types/pattern';
import { VariationAccordionItem } from './VariationAccordionItem';
import { Accordion } from '@/components/ui/accordion';

interface PatternContentClientProps {
  pattern: PatternData & { variations?: any[] };
  htmlBlocks: Record<string, string>;
}

export function PatternContentClient({ pattern, htmlBlocks }: PatternContentClientProps) {
  const queryClient = useQueryClient();
  const queryKey = ['problems', 'progress', { kind: 'pattern', group: pattern.title }];

  // Fetch only the array of completed sanityProblemIds from our Next.js API
  const { data: completedIds = [] } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/problems/progress?kind=pattern&returnType=ids`);
      if (!res.ok) throw new Error('Failed to load progress');
      return res.json();
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ problemId, completed }: { problemId: string; completed: boolean }) => {
      const res = await fetch('/api/problems/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId, completed }),
      });
      if (!res.ok) throw new Error('Failed to update progress');
      return res.json();
    },
    onMutate: async ({ problemId, completed }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<string[]>(queryKey);
      if (previous) {
        const next = completed 
          ? [...previous, problemId] 
          : previous.filter(id => id !== problemId);
        queryClient.setQueryData(queryKey, next);
      }
      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
  });

  const handleToggleComplete = (problemId: string, completed: boolean) => {
    toggleMutation.mutate({ problemId, completed });
  };

  return (
    <Accordion multiple className="w-full space-y-4">
      {pattern.variations?.map((variationData) => {
        // Map nested problems to include completed status
        const variationProblems = (variationData.problems || []).filter(Boolean).map((p: any) => ({
          ...p,
          _id: p._id,
          completed: completedIds.includes(p._id)
        }));

        if (variationProblems.length === 0 && !variationData.concept && !variationData.templateCode) {
          return null;
        }

        const variationId = variationData._id || variationData.id || '';

        return (
          <VariationAccordionItem
            key={variationId}
            variation={variationData}
            problems={variationProblems}
            html={htmlBlocks[variationId]}
            onToggleComplete={handleToggleComplete}
          />
        );
      })}
    </Accordion>
  );
}
