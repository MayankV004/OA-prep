'use client';

import { TemplateCodeBlock } from "./TemplateCodeBlock";
import { PatternVariation } from "@/types/pattern";
import { MarkdownView } from '@/components/markdown/View';
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle2 } from "lucide-react";

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
    <div className="relative rounded-3xl bg-card/80 dark:bg-card/40 border border-border/80 p-6 sm:p-8 backdrop-blur-xl shadow-lg space-y-6 mb-6 overflow-hidden transition-all">
      {/* Specular top glow */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/25 to-transparent pointer-events-none" />

      {/* Variation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div className="space-y-2.5">
          <div className="flex items-center gap-3">
            <h3 className="font-display text-xl sm:text-2xl font-black tracking-tight text-foreground">
              {variation.variation || variation.title}
            </h3>
            {isCompleted && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="size-3" />
                Completed
              </span>
            )}
          </div>

          {/* Progress Bar & Counter */}
          {problemCount > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className="text-muted-foreground font-medium">
                  Variation Mastery:
                </span>
                <span className="font-mono text-xs text-foreground font-semibold">
                  <span className={cn(solvedCount > 0 ? "text-primary font-bold" : "text-foreground")}>
                    {solvedCount}
                  </span>
                  <span className="text-muted-foreground font-normal mx-1">/</span>
                  <span>{problemCount} solved</span>
                  <span className="text-primary font-mono ml-2">({pct}%)</span>
                </span>
              </div>
              <div className="h-2 w-full sm:w-80 rounded-full bg-muted/60 overflow-hidden border border-border/40">
                <div
                  style={{ width: `${pct}%` }}
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-primary to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Practice CTA Button */}
        {problemCount > 0 && (
          <Link
            href={`/dsa/${patternSlug}/${variationSlug}/practice`}
            className="group/btn inline-flex items-center justify-center gap-2 h-10 sm:h-11 px-6 rounded-xl font-bold text-xs bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md shrink-0 self-start sm:self-center cursor-pointer"
          >
            <span>Practice Session ({problemCount})</span>
            <ArrowRight className="size-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>

      {/* Variation Concept / Description */}
      {(variation.description || variation.concept) && (
        <div className="leading-relaxed text-muted-foreground">
          <MarkdownView content={variation.description || variation.concept || ''} />
        </div>
      )}

      {/* Key Implementation Details */}
      {variation.important_details && variation.important_details.length > 0 && (
        <div className="p-5 sm:p-6 rounded-2xl bg-card/60 dark:bg-card/20 border border-border/70 space-y-3.5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
              Key Implementation Details
            </span>
          </div>
          <ul className="space-y-3">
            {variation.important_details.map((detail, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm">
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 shrink-0 select-none mt-0.5">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 leading-relaxed text-muted-foreground [&_p]:my-0">
                  <MarkdownView content={detail} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Additional Information */}
      {variation.other_relevant_details && (
        <div className="p-5 rounded-2xl bg-muted/30 border border-border/40 space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Additional Information
          </span>
          <div className="leading-relaxed text-muted-foreground">
            <MarkdownView content={variation.other_relevant_details} />
          </div>
        </div>
      )}

      {/* Template Code Block */}
      {(variation.template_code || variation.templateCode) && html && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
              Variation Code Template
            </span>
          </div>
          <TemplateCodeBlock
            code={variation.template_code || variation.templateCode || ''}
            html={html}
          />
        </div>
      )}
    </div>
  );
}

