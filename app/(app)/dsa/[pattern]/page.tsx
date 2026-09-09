import { TemplateCodeBlock } from '@/components/dsa/TemplateCodeBlock';
import { ExplanationBlock } from '@/components/dsa/ExplanationBlock';
import { PatternContentClient } from '@/components/dsa/PatternContentClient';
import { highlightCode } from '@/lib/shiki';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import { Pattern } from '@/models';
import { MarkdownView } from '@/components/markdown/View';
import { ArrowLeft, Code2, BookOpen, Layers, Terminal } from 'lucide-react';

export const revalidate = 60;

export default async function DSAPatternPage({ params }: { params: Promise<{ pattern: string }> }) {
  const { pattern: slug } = await params;

  await dbConnect();
  const patternDoc = await Pattern.findOne({ slug }).lean();
  const pattern = patternDoc ? JSON.parse(JSON.stringify(patternDoc)) : null;

  if (!pattern) {
    notFound();
  }

  // Pre-render code highlighting on the server
  const baseTemplateHtml = pattern.templateCode ? await highlightCode(pattern.templateCode, 'java') : '';

  const htmlBlocks: Record<string, string> = {};
  if (pattern.variations) {
    for (const v of pattern.variations) {
      if (v.templateCode || v.template_code) {
        htmlBlocks[v._id || v.id] = await highlightCode(v.templateCode || v.template_code, 'java');
      }
    }
  }

  const totalProblems = (pattern.variations || []).reduce(
    (acc: number, v: any) => acc + (v.problems?.length || 0),
    0
  );

  return (
    <div className="pb-24 space-y-8">
      {/* 1. Breadcrumb & Navigation Header */}
      <div className="flex flex-col gap-4 pt-2">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <Link
            href="/dsa"
            className="hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            <span>DSA Patterns</span>
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold">{pattern.title}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
              {pattern.title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-normal">
              {pattern.variations?.length || 0} variation{(pattern.variations?.length || 0) !== 1 ? 's' : ''} · {totalProblems} practice problem{totalProblems !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Time & Space Complexity Badges */}
          {(pattern.timeComplexity || pattern.spaceComplexity || (pattern.useCases?.length > 0)) && (
            <div className="flex flex-wrap items-center gap-2">
              {pattern.timeComplexity && (
                <span className="px-3 py-1.5 rounded-xl bg-card border border-border/80 text-foreground font-mono text-xs font-semibold shadow-2xs">
                  <span className="text-muted-foreground font-normal mr-1">Time:</span>
                  <span className="text-primary font-bold">{pattern.timeComplexity}</span>
                </span>
              )}
              {pattern.spaceComplexity && (
                <span className="px-3 py-1.5 rounded-xl bg-card border border-border/80 text-foreground font-mono text-xs font-semibold shadow-2xs">
                  <span className="text-muted-foreground font-normal mr-1">Space:</span>
                  <span className="text-foreground font-bold">{pattern.spaceComplexity}</span>
                </span>
              )}
              {(pattern.useCases || []).map((tag: string) => (
                <span
                  key={tag}
                  className="px-2.5 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 2. Quick-Jump Sticky Anchor Bar */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs border-y border-border/60">
          <a
            href="#concept"
            className="px-3 py-1.5 rounded-xl bg-surface-sunken hover:bg-card border border-border/50 text-muted-foreground hover:text-foreground font-medium transition-colors whitespace-nowrap"
          >
            Concept & Intuition
          </a>
          {pattern.important_details?.length > 0 && (
            <a
              href="#details"
              className="px-3 py-1.5 rounded-xl bg-surface-sunken hover:bg-card border border-border/50 text-muted-foreground hover:text-foreground font-medium transition-colors whitespace-nowrap"
            >
              Key Details
            </a>
          )}
          {pattern.templateCode && (
            <a
              href="#template"
              className="px-3 py-1.5 rounded-xl bg-surface-sunken hover:bg-card border border-border/50 text-muted-foreground hover:text-foreground font-medium transition-colors whitespace-nowrap"
            >
              Universal Template
            </a>
          )}
          {pattern.variations?.length > 0 && (
            <a
              href="#variations"
              className="px-3 py-1.5 rounded-xl bg-surface-sunken hover:bg-card border border-border/50 text-muted-foreground hover:text-foreground font-medium transition-colors whitespace-nowrap"
            >
              Variations & Problems ({pattern.variations.length})
            </a>
          )}
        </div>
      </div>

      {/* 3. Main Content Body */}
      <div className="space-y-8">
        {/* Concept / Description */}
        {(pattern.description || pattern.concept) && (
          <section
            id="concept"
            className="scroll-mt-24 p-6 sm:p-8 rounded-3xl bg-card/70 border border-border/80 backdrop-blur-xl shadow-e2 space-y-4 relative overflow-hidden"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-primary">
              <BookOpen className="size-3.5" />
              <span>Intuition & Blueprint</span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Concept & Intuitive Model
            </h2>
            <div className="leading-relaxed">
              <MarkdownView content={pattern.description || pattern.concept} />
            </div>
          </section>
        )}

        {/* Key Implementation Details Card */}
        {pattern.important_details && pattern.important_details.length > 0 && (
          <section
            id="details"
            className="scroll-mt-24 p-6 sm:p-8 rounded-3xl bg-card/70 border border-border/80 backdrop-blur-xl shadow-e2 space-y-4 relative overflow-hidden"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-primary">
              <Terminal className="size-3.5" />
              <span>Boundary Checkpoints</span>
            </div>
            <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Key Implementation Nuances
            </h2>
            <ul className="space-y-3.5 pt-2">
              {pattern.important_details.map((detail: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-foreground">
                  <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-mono text-xs font-bold shrink-0 mt-0.5 border border-primary/20">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 leading-relaxed text-muted-foreground [&_p]:my-0 text-xs sm:text-sm">
                    <MarkdownView content={detail} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Additional Info */}
        {pattern.other_relevant_details && (
          <div className="p-6 rounded-3xl bg-card/50 border border-border/60 backdrop-blur-md space-y-2">
            <h3 className="font-mono text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Additional Technical Details
            </h3>
            <div className="leading-relaxed">
              <MarkdownView content={pattern.other_relevant_details} />
            </div>
          </div>
        )}

        {/* Universal Template Code Block */}
        {pattern.templateCode && (
          <section
            id="template"
            className="scroll-mt-24 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  Universal Pattern Template
                </h2>
                <p className="text-xs text-muted-foreground">
                  Standardized skeleton designed for immediate recall during technical interviews.
                </p>
              </div>
            </div>
            <TemplateCodeBlock code={pattern.templateCode} html={baseTemplateHtml} />
          </section>
        )}

        {/* Explanation Block */}
        {pattern.explanation && (
          <ExplanationBlock text={pattern.explanation} />
        )}

        {/* Variations List Section */}
        {pattern.variations && pattern.variations.length > 0 && (
          <section
            id="variations"
            className="scroll-mt-24 space-y-5 pt-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                    Variations & Practice Sets
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono text-xs font-bold">
                    {pattern.variations.length}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Apply this pattern to distinct problem variations with automated testing.
                </p>
              </div>
            </div>

            <PatternContentClient
              pattern={pattern}
              htmlBlocks={htmlBlocks}
            />
          </section>
        )}
      </div>
    </div>
  );
}
