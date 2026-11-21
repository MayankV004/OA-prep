'use client';

import { use } from 'react';
import Link from 'next/link';
import { ProblemTable } from '@/components/problem/ProblemTable';
import { ArrowLeft } from 'lucide-react';

function slugToPlatform(slug: string) {
  const map: Record<string, string> = {
    codeforces: 'Codeforces',
    'leetcode-contest': 'LeetCode Contest',
    atcoder: 'AtCoder',
    codechef: 'CodeChef',
  };
  return map[slug] ?? slug;
}

export default function CPPlatformPage({ params }: { params: Promise<{ platform: string }> }) {
  const { platform: slug } = use(params);
  const platformName = slugToPlatform(slug);

  return (
    <div className="space-y-8 pb-16">
      {/* ── 1. Header & Navigation ── */}
      <header className="flex flex-col gap-4 pt-2">
        <div>
          <Link
            href="/cp"
            className="group inline-flex items-center justify-center size-9 rounded-xl bg-card border border-border/70 text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all shrink-0"
            aria-label="Back to CP Hub"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          </Link>
        </div>

        <div className="space-y-1">
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-tight">
            {platformName} <span className="text-primary">Contests</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-normal">
            Contest problem archives, rated challenges, and benchmark difficulty targets.
          </p>
        </div>
      </header>

      {/* ── 2. Problems Table ── */}
      <section className="space-y-4">
        <ProblemTable kind="cp" group={platformName} groupLabel={platformName} showRating />
      </section>
    </div>
  );
}
