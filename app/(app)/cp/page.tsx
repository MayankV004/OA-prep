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

      {/* Contest Radar & Alert Subscription Callout */}
      <Link
        href="/cp/contests"
        className="group block rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-surface to-surface-sunken p-5 transition-all hover:border-primary/60 hover:shadow-md outline-none focus-visible:shadow-glow"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground font-bold shadow-sm">
              ⏰
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base text-text">Contest Radar & Email Alerts</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-500 font-mono">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                  LIVE SCHEDULE
                </span>
              </div>
              <Text size="caption" tone="muted" className="text-xs max-w-xl">
                Get automated email alerts before LeetCode, Codeforces, CodeChef, and AtCoder contests begin. Never miss rating rounds again.
              </Text>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-xs font-semibold text-primary group-hover:underline">
              Open Contest Radar
            </span>
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-sunken text-text-muted transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <ArrowRight className="size-4" />
            </span>
          </div>
        </div>
      </Link>

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
