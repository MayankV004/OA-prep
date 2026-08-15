'use client';

import { TemplateCodeBlock } from "./TemplateCodeBlock";
import { PatternVariation } from "@/types/pattern";
import ReactMarkdown from 'react-markdown';
import Link from "next/link";

interface VariationItemProps {
  variation: PatternVariation;
  patternSlug: string;
  html: string;
}

export function VariationAccordionItem({ variation, patternSlug, html }: VariationItemProps) {
  const problemCount = (variation.problems || []).length;
  const variationId = variation._id || variation.id || '';
  const variationSlug = variationId;

  return (
    <div className="rounded-3xl border-none bg-background/60 dark:bg-background/30 backdrop-blur-xl shadow-sm p-6 sm:p-8 space-y-6 mb-6">
      {/* Variation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/30">
        <div>
          <h3 className="font-display text-xl sm:text-2xl font-black tracking-tight text-foreground">
            {variation.variation || variation.title}
          </h3>
          <span className="text-xs text-muted-foreground font-medium">
            {problemCount} practice problem{problemCount !== 1 ? 's' : ''} available
          </span>
        </div>

        {/* Practice CTA Button */}
        {problemCount > 0 && (
          <Link
            href={`/dsa/${patternSlug}/${variationSlug}/practice`}
            className="group/btn inline-flex items-center justify-center gap-2 h-11 px-6 rounded-2xl font-semibold text-xs text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-500 shadow-[0_0_20px_rgba(225,29,72,0.35)] hover:shadow-[0_0_25px_rgba(225,29,72,0.6)] hover:scale-105 active:scale-95 transition-all border-none shrink-0"
          >
            <span>Practice Session</span>
          </Link>
        )}
      </div>

      {/* Variation Concept / Description */}
      {(variation.description || variation.concept) && (
        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none leading-relaxed text-muted-foreground">
          <ReactMarkdown>{variation.description || variation.concept || ''}</ReactMarkdown>
        </div>
      )}

      {/* Key Implementation Details */}
      {variation.important_details && variation.important_details.length > 0 && (
        <div className="p-5 rounded-2xl bg-background/50 space-y-3">
          <span className="font-display text-xs font-bold uppercase tracking-wider text-rose-500">Key Implementation Details</span>
          <ul className="space-y-2.5">
            {variation.important_details.map((detail, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-foreground">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed text-muted-foreground [&_p]:my-0">
                  <ReactMarkdown>{detail}</ReactMarkdown>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Additional Information */}
      {variation.other_relevant_details && (
        <div className="p-5 rounded-2xl bg-background/50 space-y-2">
          <span className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">Additional Information</span>
          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
            <ReactMarkdown>{variation.other_relevant_details}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Template Code Block */}
      {(variation.template_code || variation.templateCode) && html && (
        <div className="space-y-2 pt-2">
          <span className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">Variation Code Template</span>
          <TemplateCodeBlock
            code={variation.template_code || variation.templateCode || ''}
            html={html}
          />
        </div>
      )}
    </div>
  );
}
