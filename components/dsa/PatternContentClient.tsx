'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PatternData } from '@/types/pattern';
import { VariationAccordionItem } from './VariationAccordionItem';
import { Accordion } from '@/components/ui/accordion';

interface PatternContentClientProps {
  pattern: PatternData;
  htmlBlocks: Record<string, string>; // Map of variation id -> html
}

export function PatternContentClient({ pattern, htmlBlocks }: PatternContentClientProps) {
  const queryClient = useQueryClient();
  const queryKey = ['problems', { kind: 'pattern', group: pattern.title }];

  const { data: problems = [] } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/problems?kind=pattern&pattern=${encodeURIComponent(pattern.slug)}`);
      if (!res.ok) throw new Error('Failed to load problems');
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
      const previous = queryClient.getQueryData<any[]>(queryKey);
      if (previous) {
        queryClient.setQueryData(
          queryKey,
          previous.map((p) => (p._id === problemId ? { ...p, completed } : p))
        );
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
    <Accordion type="multiple" className="w-full space-y-4">
      {(() => {
        // Find all unique variations from problems
        const problemVariations = Array.from(new Set(problems.map((p: any) => p.variation || 'General')));
        
        // Also include any variations defined in the pattern data that might not have problems yet
        const definedVariations = pattern.variations.map(v => v.title);
        
        const allVariationTitles = Array.from(new Set([...definedVariations, ...problemVariations]));
        
        return allVariationTitles.map((variationTitle) => {
          const variationProblems = problems.filter((p: any) => (p.variation || 'General') === variationTitle);
          if (variationProblems.length === 0 && !definedVariations.includes(variationTitle)) return null;

          // Try to find matching pattern data for this variation
          const variationData = pattern.variations.find(v => v.title === variationTitle) || {
            id: variationTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            title: variationTitle,
            concept: '',
            templateCode: ''
          };

          return (
            <VariationAccordionItem
              key={variationData.id}
              variation={variationData}
              problems={variationProblems}
              html={htmlBlocks[variationData.id]}
              onToggleComplete={handleToggleComplete}
            />
          );
        });
      })()}
    </Accordion>
  );
}
