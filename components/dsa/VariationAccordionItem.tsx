'use client';

import { TemplateCodeBlock } from "./TemplateCodeBlock";
import { PatternVariation } from "@/types/pattern";
import { MarkdownView } from '@/components/markdown/View';
import Link from "next/link";
import { cn } from "@/lib/utils";

interface VariationItemProps {
  variation: PatternVariation;
  patternSlug: string;
  html: string;
  completedIds?: Set<string>;
}

export function VariationAccordionItem({ variation, patternSlug, html, completedIds }: VariationItemProps) {
  const problems = variation.problems || [];
  const problemCount = problems.length;
  const variationId = variation._id || variation.id || '';
  const variationSlug = variationId;

  // Calculate solved problems count for this variation
  const solvedCount = completedIds
    ? problems.filter((p: any) => {
        const idStr = p._id ? p._id.toString() : p.id;
        return completedIds.has(idStr);
      }).length
    : 0;

  const pct = problemCount > 0 ? Math.round((solvedCount / problemCount) * 100) : 0;
  const isCompleted = problemCount > 0 && solvedCount === problemCount;

  return (
    <div className="rounded-3xl border-none bg-background/60 dark:bg-background/30 backdrop-blur-xl shadow-sm p-6 sm:p-8 space-y-6 mb-6">
      {/* Variation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/30">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="font-display text-xl sm:text-2xl font-black tracking-tight text-foreground">
              {variation.variation || variation.title}
            </h3>
            {isCompleted && (
              <span className="px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Completed
              </span>
            )}
          </div>

          {/* Progress Bar & Counter */}
          {problemCount > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className="text-muted-foreground font-medium text-xs">
                  Variation Progress:
                </span>
                <span className="font-mono text-xs text-foreground font-semibold">
                  <span className={cn(solvedCount > 0 ? "text-rose-500 font-bold" : "text-foreground")}>
                    {solvedCount}
                  </span>
                  <span className="text-muted-foreground font-normal mx-1">/</span>
                  <span>{problemCount} solved</span>
                  <span className="text-rose-500/90 font-mono ml-2">({pct}%)</span>
                </span>
              </div>
              <div className="h-2 w-full sm:w-80 rounded-full bg-muted/60 overflow-hidden">
                <div
                  style={{ width: `${pct}%` }}
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isCompleted
                      ? "bg-emerald-500"
                      : "bg-gradient-to-r from-red-600 via-rose-500 to-red-400"
                  )}
                />
              </div>
            </div>
          )}
        </div>

        {/* Practice CTA Button */}
        {problemCount > 0 && (
          <Link
            href={`/dsa/${patternSlug}/${variationSlug}/practice`}
            className="group/btn inline-flex items-center justify-center gap-2 h-11 px-6 rounded-2xl font-semibold text-xs text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-500 shadow-[0_0_20px_rgba(225,29,72,0.35)] hover:shadow-[0_0_25px_rgba(225,29,72,0.6)] hover:scale-105 active:scale-95 transition-all border-none shrink-0 self-start sm:self-center"
          >
            <span>Practice Session ({problemCount})</span>
          </Link>
        )}
      </div>

      {/* Variation Concept / Description */}
      {(variation.description || variation.concept) && (
        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none leading-relaxed text-muted-foreground">
          <MarkdownView content={variation.description || variation.concept || ''} />
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
                  <MarkdownView content={detail} />
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
            <MarkdownView content={variation.other_relevant_details} />
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
