import { use, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, ChevronRight, Layers } from 'lucide-react';
import { PatternConceptBlock } from '@/components/dsa/PatternConceptBlock';
import { TemplateCodeBlock } from '@/components/dsa/TemplateCodeBlock';
import { ExplanationBlock } from '@/components/dsa/ExplanationBlock';
import { PatternContentClient } from '@/components/dsa/PatternContentClient';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Heading, PageHeading, Text } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
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
      {/* Sticky page header — separated by elevation, not a border */}
      <header className="surface-blur sticky top-0 z-40 flex w-full flex-col gap-3 px-6 py-5 shadow-e1 sm:px-10 sm:py-6">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link
                href="/dsa"
                className="group inline-flex items-center gap-1.5 text-xs font-medium text-text-muted transition-colors duration-150 ease-out-quart hover:text-foreground"
              >
                <ArrowLeft
                  aria-hidden
                  className="size-3.5 transition-transform duration-200 ease-out-quart group-hover:-translate-x-0.5"
                />
                Pattern DSA
              </Link>
            </li>
            <li aria-hidden className="flex items-center">
              <ChevronRight className="size-3 text-text-muted" />
            </li>
            <li className="min-w-0">
              <Text as="span" size="caption" tone="secondary" weight="medium" className="truncate">
                {pattern.title}
              </Text>
            </li>
          </ol>
        </nav>

        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="hidden size-10 shrink-0 place-items-center rounded-xl bg-accent text-primary shadow-e1 sm:grid"
          >
            <BookOpen className="size-5" />
          </span>
          <PageHeading title={pattern.title} className="min-w-0 flex-1" />
        </div>
      </header>

      <div className="mx-auto px-6 pt-8 sm:px-10">
        <div className="space-y-8">
          {/* Concept / Description */}
          {(pattern.description || pattern.concept) && (
            <section className="space-y-6">
              <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none leading-relaxed text-text-secondary">
                <ReactMarkdown>{pattern.description || pattern.concept}</ReactMarkdown>
              </div>
              <Separator />
            </section>
          )}

          {pattern.important_details && pattern.important_details.length > 0 && (
            <Card className="bg-accent shadow-e1">
              <CardHeader>
                <Heading level="overline" className="text-accent-foreground">
                  Key details
                </Heading>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5">
                  {pattern.important_details.map((detail: string, idx: number) => (
                    <li key={idx} className="flex gap-2.5">
                      <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                      <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed text-foreground [&_p]:my-0">
                        <ReactMarkdown>{detail}</ReactMarkdown>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {pattern.other_relevant_details && (
            <Card size="sm" className="bg-surface-sunken shadow-e1">
              <CardHeader>
                <Heading level="overline">Additional information</Heading>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none text-text-secondary">
                  <ReactMarkdown>{pattern.other_relevant_details}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}

          {pattern.templateCode && (
            <section className="space-y-2.5">
              <Heading level="overline">Template code</Heading>
              <TemplateCodeBlock code={pattern.templateCode} html={baseTemplateHtml} />
            </section>
          )}

          <ExplanationBlock text={pattern.explanation} />

          {pattern.variations && pattern.variations.length > 0 && (
            <section className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <Layers aria-hidden className="size-4 text-primary" />
                <Heading level="section">Variations</Heading>
                <Text as="span" size="caption" tone="muted" numeric>
                  {pattern.variations.length}
                </Text>
              </div>
              <PatternContentClient
                pattern={pattern}
                htmlBlocks={htmlBlocks}
              />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
