'use client';

import { use, Suspense } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ProblemTable } from '@/components/problem/ProblemTable';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Database, Zap, BookOpen, ChevronRight } from 'lucide-react';

// Map of slug → display name
const SLUG_TO_NAME: Record<string, string> = {
  'sliding-window': 'Sliding Window',
  'two-pointers': 'Two Pointers',
  'binary-search': 'Binary Search',
  backtracking: 'Backtracking',
  dp: 'DP',
  graphs: 'Graphs',
  trees: 'Trees',
  greedy: 'Greedy',
  heap: 'Heap',
  trie: 'Trie',
  'segment-tree': 'Segment Tree',
  'bit-manipulation': 'Bit Manipulation',
};

function slugToName(slug: string): string {
  return (
    SLUG_TO_NAME[slug] ??
    slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  );
}

interface PatternMeta {
  title: string;
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  useCases: string[];
  variations: { id: string; title: string; description: string }[];
}

// Dynamically import MDX files based on slug
function PatternContent({ slug }: { slug: string }) {
  const MDXContent = dynamic<{ metadata?: PatternMeta }>(
    () => import(`@/content/patterns/${slug}.mdx`).catch(() => ({ default: () => null })) as any,
    {
      loading: () => (
        <div className="space-y-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded" style={{ width: `${70 + (i % 3) * 10}%` }} />
          ))}
        </div>
      ),
    }
  );

  return <MDXContent />;
}

export default function DSAPatternPage({ params }: { params: Promise<{ pattern: string }> }) {
  const { pattern: slug } = use(params);
  const patternName = slugToName(slug);

  // Lazy-load metadata from MDX (we read it separately)
  const MDXModule = dynamic(
    () => import(`@/content/patterns/${slug}.mdx`).catch(() => ({ default: () => null, metadata: undefined })) as any,
    { ssr: false }
  );

  return (
    <div className="space-y-8">
      {/* Back button + breadcrumb */}
      <div className="flex items-center gap-3">
        <Link href="/dsa">
          <Button variant="ghost" size="icon-sm" className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/dsa" className="hover:text-foreground transition-colors">Pattern DSA</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{patternName}</span>
        </div>
      </div>

      {/* Two-column layout: MDX content + problems */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8 items-start">

        {/* Left: MDX Pattern Content */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-5 border-b border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">{patternName}</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-12">
              Conceptual guide · Template code · Variations
            </p>
          </div>

          <div className="px-6 py-6 prose-content">
            <Suspense
              fallback={
                <div className="space-y-4 py-4 animate-pulse">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-4 bg-muted rounded" style={{ width: `${60 + (i % 4) * 10}%` }} />
                  ))}
                </div>
              }
            >
              <PatternContent slug={slug} />
            </Suspense>
          </div>
        </div>

        {/* Right: Problems */}
        <div className="space-y-4 xl:sticky xl:top-4">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted/30">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Your Problem List
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Track your progress on {patternName} problems
              </p>
            </div>
            <div className="p-4">
              <ProblemTable
                kind="pattern"
                group={patternName}
                groupLabel={patternName}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
