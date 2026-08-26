'use client';

import { use } from 'react';
import Link from 'next/link';
import { ProblemTable } from '@/components/problem/ProblemTable';
import { ArrowLeft } from 'lucide-react';
import { getNonStandardCategoryBySlug, slugToBucketName } from '@/lib/non-standard-dsa';

export default function NonStandardBucketPage({ params }: { params: Promise<{ bucket: string }> }) {
  const { bucket: slug } = use(params);
  const category = getNonStandardCategoryBySlug(slug);
  const bucketName = category ? category.category : slugToBucketName(slug);
  const title = category ? category.shortName : bucketName;
  const description = category?.note || 'Ad-hoc, constructive, geometric, and math problems in this category.';
  const problemCount = category?.problemCount || 0;

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header Section */}
      <header className="flex flex-col gap-4 pt-2">
        <div className="flex items-center gap-3">
          <Link
            href="/non-standard"
            className="group inline-flex items-center justify-center size-10 rounded-2xl bg-background/60 dark:bg-background/30 backdrop-blur-md border border-border/30 text-muted-foreground hover:text-foreground hover:border-rose-500/40 transition-all shrink-0"
            aria-label="Back to non-standard categories"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-0.5" />
          </Link>
          <span className="px-3 py-1 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-semibold border border-rose-500/20">
            Non-Standard DSA
          </span>
          {problemCount > 0 && (
            <span className="px-3 py-1 rounded-xl bg-background/60 dark:bg-background/30 backdrop-blur-md text-muted-foreground font-mono text-xs font-medium border border-border/30">
              {problemCount} problems
            </span>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-light">
              {bucketName}
            </p>
          </div>
        </div>
      </header>

      {/* 2. Category Overview Card */}
      {description && (
        <section className="p-6 sm:p-8 rounded-3xl bg-background/60 dark:bg-background/30 backdrop-blur-xl border border-border/30 shadow-sm space-y-3">
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
            Category Focus & Overview
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-light">
            {description}
          </p>
        </section>
      )}

      {/* 3. Problems Section Card */}
      <section className="p-6 sm:p-8 rounded-3xl bg-background/60 dark:bg-background/30 backdrop-blur-xl border border-border/30 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-border/20">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Practice Problems
          </h2>
        </div>

        <ProblemTable kind="nonstandard" group={bucketName} groupLabel={title} />
      </section>
    </div>
  );
}
