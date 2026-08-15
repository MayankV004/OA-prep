import { TemplateCodeBlock } from '@/components/dsa/TemplateCodeBlock';
import { ExplanationBlock } from '@/components/dsa/ExplanationBlock';
import { PatternContentClient } from '@/components/dsa/PatternContentClient';
import { highlightCode } from '@/lib/shiki';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import { Pattern } from '@/models';
import ReactMarkdown from 'react-markdown';

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
      {/* 1. Header Section with Tall Display Typography */}
      <header className="flex flex-col gap-4 pt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
              {pattern.title}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground font-light">
              {pattern.variations?.length || 0} variation{(pattern.variations?.length || 0) !== 1 ? 's' : ''} · {totalProblems} practice problem{totalProblems !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Time & Space Complexity Badges */}
          {(pattern.timeComplexity || pattern.spaceComplexity || (pattern.useCases?.length > 0)) && (
            <div className="flex flex-wrap items-center gap-2">
              {pattern.timeComplexity && (
                <span className="px-3 py-1 rounded-xl bg-background/60 dark:bg-background/30 backdrop-blur-md text-foreground font-mono text-xs font-semibold border border-border/30">
                  Time: {pattern.timeComplexity}
                </span>
              )}
              {pattern.spaceComplexity && (
                <span className="px-3 py-1 rounded-xl bg-background/60 dark:bg-background/30 backdrop-blur-md text-foreground font-mono text-xs font-semibold border border-border/30">
                  Space: {pattern.spaceComplexity}
                </span>
              )}
              {(pattern.useCases || []).map((tag: string) => (
                <span key={tag} className="px-3 py-1 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-semibold">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* 2. Main Content Body */}
      <div className="space-y-8">
        {/* Concept / Description */}
        {(pattern.description || pattern.concept) && (
          <section className="p-6 sm:p-8 rounded-3xl bg-background/60 dark:bg-background/30 backdrop-blur-xl border-none shadow-sm space-y-4">
            <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
              Concept & Intuition
            </h2>
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none leading-relaxed text-muted-foreground">
              <ReactMarkdown>{pattern.description || pattern.concept}</ReactMarkdown>
            </div>
          </section>
        )}

        {/* Key Details Card */}
        {pattern.important_details && pattern.important_details.length > 0 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-background/60 dark:bg-background/30 backdrop-blur-xl border-none shadow-sm space-y-4">
            <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
              Key Implementation Details
            </h2>
            <ul className="space-y-3">
              {pattern.important_details.map((detail: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-foreground">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                  <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed text-muted-foreground [&_p]:my-0">
                    <ReactMarkdown>{detail}</ReactMarkdown>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Additional Info */}
        {pattern.other_relevant_details && (
          <div className="p-6 rounded-3xl bg-background/60 dark:bg-background/30 backdrop-blur-xl border-none shadow-sm space-y-2">
            <h3 className="font-display text-sm font-bold text-foreground uppercase tracking-wider">Additional Information</h3>
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
              <ReactMarkdown>{pattern.other_relevant_details}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Template Code Block */}
        {pattern.templateCode && (
          <section className="space-y-3">
            <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
              Universal Pattern Template
            </h2>
            <TemplateCodeBlock code={pattern.templateCode} html={baseTemplateHtml} />
          </section>
        )}

        {/* Explanation Block */}
        <ExplanationBlock text={pattern.explanation} />

        {/* Variations List Section */}
        {pattern.variations && pattern.variations.length > 0 && (
          <section className="space-y-4 pt-4">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Variations & Problem Sets</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 font-mono text-xs font-bold">
                {pattern.variations.length}
              </span>
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
