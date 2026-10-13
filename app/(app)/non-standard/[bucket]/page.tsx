'use client';

import { use } from 'react';
import Link from 'next/link';
import { ProblemTable } from '@/components/problem/ProblemTable';
import { ArrowLeft, Compass, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getNonStandardCategoryBySlug, slugToBucketName } from '@/lib/non-standard-dsa';

export default function NonStandardBucketPage({ params }: { params: Promise<{ bucket: string }> }) {
  const { bucket: slug } = use(params);
  const category = getNonStandardCategoryBySlug(slug);
  const bucketName = category ? category.category : slugToBucketName(slug);
  const title = category ? category.shortName : bucketName;
  const description = category?.note || 'Ad-hoc, constructive, geometric, and math-insight problems in this category.';
  const problemCount = category?.problemCount || 0;

  return (
    <div className="space-y-8 pb-16">
      {/* ── 1. Header & Navigation Section ── */}
      <header className="flex flex-col gap-4 pt-2">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/non-standard"
            className="group inline-flex items-center justify-center size-9 rounded-xl bg-card border border-border/70 text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all shrink-0"
            aria-label="Back to non-standard categories"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          </Link>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            Non-Standard DSA
          </span>

          {problemCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-muted/70 text-muted-foreground font-mono text-[10px] font-medium border border-border/50">
              {problemCount} questions
            </span>
          )}
        </div>

        <div className="space-y-1">
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-normal">
            {bucketName}
          </p>
        </div>
      </header>

      {/* ── 2. Category Focus & Overview Card ── */}
      {description && (
        <section className="p-6 sm:p-7 rounded-2xl bg-card/70 border border-border/70 backdrop-blur-md shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Compass className="size-4" />
            </span>
            <h2 className="font-display text-base sm:text-lg font-bold tracking-tight text-foreground">
              Core Invariant & Problem Solving Strategy
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal pl-10.5">
            {description}
          </p>
        </section>
      )}

      {/* ── 3. Problems Section ── */}
      <section className="space-y-4">
        <ProblemTable kind="nonstandard" group={bucketName} groupLabel={title} />
      </section>
    </div>
  );
}
