'use client';

import { PatternData } from '@/types/pattern';
import { VariationAccordionItem } from './VariationAccordionItem';

interface PatternContentClientProps {
  pattern: PatternData & { variations?: any[] };
  htmlBlocks: Record<string, string>;
}

export function PatternContentClient({ pattern, htmlBlocks }: PatternContentClientProps) {
  return (
    <div className="w-full space-y-6">
      {pattern.variations?.map((variationData) => {
        const variationId = variationData._id || variationData.id || '';

        // Skip empty variations with no theory content
        if (!variationData.description && !variationData.concept && !variationData.important_details?.length && !variationData.template_code && !variationData.templateCode) {
          return null;
        }

        return (
          <VariationAccordionItem
            key={variationId}
            variation={variationData}
            patternSlug={pattern.slug}
            html={htmlBlocks[variationId]}
          />
        );
      })}
    </div>
  );
}
