import { use, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
import { PatternConceptBlock } from '@/components/dsa/PatternConceptBlock';
import { TemplateCodeBlock } from '@/components/dsa/TemplateCodeBlock';
import { ExplanationBlock } from '@/components/dsa/ExplanationBlock';
import { PatternContentClient } from '@/components/dsa/PatternContentClient';
import { highlightCode } from '@/lib/shiki';
import * as allPatterns from '@/data/patterns';
import { notFound } from 'next/navigation';

export default async function DSAPatternPage({ params }: { params: Promise<{ pattern: string }> }) {
  const { pattern: slug } = await params;
  
  // Find the pattern by matching the slug
  const pattern = Object.values(allPatterns).find(p => p.slug === slug);

  if (!pattern) {
    notFound();
  }

  // Pre-render code highlighting on the server
  const baseTemplateHtml = await highlightCode(pattern.templateCode, 'java');
  
  const htmlBlocks: Record<string, string> = {};
  for (const v of pattern.variations) {
    htmlBlocks[v.id] = await highlightCode(v.templateCode, 'java');
  }

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-24">
      {/* Back button + breadcrumb */}
      <div className="flex items-center gap-3 px-2">
        <Link href="/dsa">
          <Button variant="ghost" size="icon" className="shrink-0 rounded-full bg-muted/50 hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dsa" className="hover:text-foreground transition-colors font-medium">Pattern DSA</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-semibold">{pattern.title}</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card to-background border border-border p-8 sm:p-10 shadow-sm">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 shadow-inner">
              <BookOpen className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                {pattern.title}
              </h1>
              <p className="text-base text-muted-foreground mt-2 font-medium">
                Conceptual guide · Template code · Practice Problems
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        <PatternConceptBlock concept={pattern.concept} />
        
        {pattern.templateCode && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold flex items-center gap-2 text-foreground/80 uppercase tracking-wider">
              Template Code
            </h2>
            <TemplateCodeBlock code={pattern.templateCode} html={baseTemplateHtml} />
          </div>
        )}

        <ExplanationBlock text={pattern.explanation} />
        
        {pattern.variations.length > 0 && (
          <div className="pt-4 space-y-4">
            <h2 className="text-lg font-bold">Variations</h2>
            <PatternContentClient pattern={pattern} htmlBlocks={htmlBlocks} />
          </div>
        )}
      </div>
    </div>
  );
}
