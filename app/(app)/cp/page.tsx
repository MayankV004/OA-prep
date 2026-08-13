'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Trophy } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Heading, Metric, PageHeading, Text } from '@/components/ui/typography';

interface Stat { group: string; total: number; completed: number }

const PLATFORMS = ['Codeforces', 'LeetCode Contest', 'AtCoder', 'CodeChef'];

export default function CPPage() {
  const { data: progress = [] } = useQuery<Stat[]>({
    queryKey: ['problems', 'progress', 'cp'],
    queryFn: async () => {
      const res = await fetch('/api/problems/progress?kind=cp');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const statsMap = Object.fromEntries(progress.map(p => [p.group, p]));

  return (
    <div className="space-y-8 pb-12">
      <PageHeading
        overline="Practice"
        title="Competitive programming"
        description="Track contest problems by platform and keep an eye on where the backlog is building up."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLATFORMS.map(platform => {
          const stat = statsMap[platform] ?? { total: 0, completed: 0 };
          const pct = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
          const slug = platform.toLowerCase().replace(/\s+/g, '-');

          return (
            <Link
              key={platform}
              href={`/cp/${slug}`}
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
                        <Trophy className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <Heading level="card" className="truncate">{platform}</Heading>
                        <Text size="caption" tone="muted" numeric className="mt-0.5">
                          {stat.completed}/{stat.total} done
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

                  <Metric className="text-xl sm:text-2xl">{pct}%</Metric>
                </CardContent>

                <CardFooter className="mt-auto flex-col items-stretch gap-2">
                  {stat.total === 0 ? (
                    <Text size="caption" tone="muted">
                      No problems tracked yet — open {platform} to add some.
                    </Text>
                  ) : (
                    <Progress
                      value={pct}
                      aria-label={`${platform}: ${pct} percent complete`}
                      className="[&_[data-slot=progress-track]]:h-1.5"
                    />
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
