import { use, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
import { PatternConceptBlock } from '@/components/dsa/PatternConceptBlock';
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

  return (
    <div className="pb-24">
      {/* Twitter-like Sticky Header */}
      <div className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border/40 w-full px-6 sm:px-10 py-6 sm:py-8 flex flex-col gap-2 transition-all duration-300">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground/80">
          <Link href="/dsa" className="flex items-center hover:text-foreground transition-colors group">
            <ArrowLeft className="h-4 w-4 mr-1.5 group-hover:-translate-x-1 transition-transform duration-300" />
            Pattern DSA
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground/90">{pattern.title}</span>
        </div>
        <div className="flex items-center gap-4 mt-1">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm hidden sm:block">
            <BookOpen className="h-6 w-6" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
            {pattern.title}
          </h1>
        </div>
      </div>

      <div className=" mx-auto px-6 sm:px-10 pt-10 space-y-12">
        <div className="space-y-10">
          {/* Concept / Description */}
          {(pattern.description || pattern.concept) && (
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-foreground/90 leading-relaxed border-b border-border/50 pb-8">
              <ReactMarkdown>{pattern.description || pattern.concept}</ReactMarkdown>
            </div>
          )}

          {pattern.important_details && pattern.important_details.length > 0 && (
            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 transition-colors duration-300 hover:bg-primary/10">
              <h4 className="text-sm font-bold text-primary mb-4 flex items-center gap-2 uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-primary" /> Key Details
              </h4>
              <ul className="space-y-2 text-sm text-foreground/80 list-disc list-inside">
                {pattern.important_details.map((detail: string, idx: number) => (
                  <li key={idx} className="leading-relaxed">
                    <div className="inline prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{detail}</ReactMarkdown>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pattern.other_relevant_details && (
            <div className="text-sm text-muted-foreground bg-muted/30 rounded-xl p-5 border border-border/50">
              <h4 className="text-sm font-semibold text-foreground/70 mb-2">Additional Information</h4>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{pattern.other_relevant_details}</ReactMarkdown>
              </div>
            </div>
          )}
          
          {pattern.templateCode && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold flex items-center gap-2 text-foreground/80 uppercase tracking-wider">
                Template Code
              </h2>
              <TemplateCodeBlock code={pattern.templateCode} html={baseTemplateHtml} />
            </div>
          )}

          <ExplanationBlock text={pattern.explanation} />
          
          {pattern.variations && pattern.variations.length > 0 && (
            <div className="pt-4 space-y-4">
              <h2 className="text-lg font-bold">Variations</h2>
              <PatternContentClient 
                pattern={pattern} 
                htmlBlocks={htmlBlocks} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
