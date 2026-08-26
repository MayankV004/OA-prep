'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PatternData } from '@/types/pattern';
import { VariationAccordionItem } from './VariationAccordionItem';

interface PatternContentClientProps {
  pattern: PatternData & { variations?: any[] };
  htmlBlocks: Record<string, string>;
}

export function PatternContentClient({ pattern, htmlBlocks }: PatternContentClientProps) {
  // Save current pattern as last visited pattern in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && pattern?.slug) {
      try {
        localStorage.setItem(
          'bigo_last_pattern',
          JSON.stringify({
            slug: pattern.slug,
            title: pattern.title,
            updatedAt: new Date().toISOString(),
          })
        );
      } catch {}
    }
  }, [pattern?.slug, pattern?.title]);

  // Fetch completed problem IDs for pattern kind
  const { data: completedIdsArray = [] } = useQuery<string[]>({
    queryKey: ['problems', 'progress', 'pattern', 'ids'],
    queryFn: async () => {
      const res = await fetch('/api/problems/progress?kind=pattern&returnType=ids');
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 30_000,
  });

  const completedIdsSet = new Set(completedIdsArray);

  return (
    <div className="w-full space-y-6">
      {pattern.variations?.map((variationData) => {
        const variationId = variationData._id || variationData.id || '';

        // Skip empty variations with no theory content
        if (
          !variationData.description &&
          !variationData.concept &&
          !variationData.important_details?.length &&
          !variationData.template_code &&
          !variationData.templateCode
        ) {
          return null;
        }

        return (
          <VariationAccordionItem
            key={variationId}
            variation={variationData}
            patternSlug={pattern.slug}
            html={htmlBlocks[variationId]}
            completedIds={completedIdsSet}
          />
        );
      })}
    </div>
  );
}
