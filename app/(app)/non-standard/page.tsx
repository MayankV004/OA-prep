'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Layers, Shapes, Sigma } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Heading, PageHeading, Text } from '@/components/ui/typography';

interface Stat { group: string; total: number; completed: number }

const BUCKETS = ['Ad-hoc', 'Constructive', 'Math'];

/** Presentational only — one glyph per bucket, all in the same accent family. */
const BUCKET_ICONS: Record<string, LucideIcon> = {
  'Ad-hoc': Layers,
  Constructive: Shapes,
  Math: Sigma,
};

const BUCKET_BLURB: Record<string, string> = {
  'Ad-hoc': 'One-off reasoning, no template',
  Constructive: 'Build a valid answer from scratch',
  Math: 'Number theory, combinatorics, parity',
};

export default function NonStandardPage() {
  const { data: progress = [] } = useQuery<Stat[]>({
    queryKey: ['problems', 'progress', 'nonstandard'],
    queryFn: async () => {
      const res = await fetch('/api/problems/progress?kind=nonstandard');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const statsMap = Object.fromEntries(progress.map(p => [p.group, p]));

  return (
    <div className="space-y-8 pb-12">
      <PageHeading
        overline="Practice"
        title="Non-standard DSA"
        description="Ad-hoc, constructive, and math problems — the ones that do not fall out of a pattern."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BUCKETS.map(bucket => {
          const stat = statsMap[bucket] ?? { total: 0, completed: 0 };
          const pct = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
          const slug = bucket.toLowerCase();
          const Icon = BUCKET_ICONS[bucket] ?? Layers;

          return (
            <Link
              key={bucket}
              href={`/non-standard/${slug}`}
              className="group block h-full rounded-xl outline-none focus-visible:shadow-glow"
            >
              <Card interactive className="h-full">
                <CardContent className="flex flex-1 flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        aria-hidden
                        className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"
                      >
                        <Icon className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <Heading level="card" className="truncate">{bucket}</Heading>
                        <Text size="caption" tone="muted" className="mt-0.5">
                          {BUCKET_BLURB[bucket] ?? 'Non-standard problems'}
                        </Text>
                      </div>
                    </div>
                    <span
                      aria-hidden
                      className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-sunken text-text-muted transition-colors duration-150 ease-out-quart group-hover:bg-primary group-hover:text-primary-foreground"
                    >
                      <ArrowRight className="size-4" />
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="mt-auto flex-col items-stretch gap-2">
                  {stat.total === 0 ? (
                    <Text size="caption" tone="muted">
                      Nothing tracked here yet — open the bucket to add problems.
                    </Text>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <Text size="caption" tone="muted" numeric as="span">
                          {stat.completed}/{stat.total} done
                        </Text>
                        <Text size="caption" tone="primary" weight="medium" numeric as="span">
                          {pct}%
                        </Text>
                      </div>
                      <Progress
                        value={pct}
                        aria-label={`${bucket}: ${pct} percent complete`}
                        className="[&_[data-slot=progress-track]]:h-1.5"
                      />
                    </>
                  )}
                </CardFooter>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
