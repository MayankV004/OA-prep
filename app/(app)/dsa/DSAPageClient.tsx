'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Check, Clock, Code2, Target, Zap } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { Heading, Metric, PageHeading, Text } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

interface PatternStat { group: string; total: number; completed: number }

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function DSAPageClient({ initialPatterns }: { initialPatterns: any[] }) {
  const { data: progress = [] } = useQuery<PatternStat[]>({
    queryKey: ['problems', 'progress', 'pattern'],
    queryFn: async () => {
      const res = await fetch('/api/problems/progress?kind=pattern');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const statsMap = Object.fromEntries(progress.map((p) => [p.group, p]));
  const totalCompleted = progress.reduce((acc, curr) => acc + curr.completed, 0);
  const totalProblems = progress.reduce((acc, curr) => acc + curr.total, 0);
  const overallProgress = totalProblems > 0 ? Math.round((totalCompleted / totalProblems) * 100) : 0;

  return (
    <div className="space-y-10 pb-12">
      {/* Intro + overall mastery */}
      <div className="flex flex-col gap-6 rounded-2xl bg-card p-6 shadow-e2 sm:p-8 md:flex-row md:items-end md:justify-between">
        <PageHeading
          className="w-full max-w-2xl"
          overline="Practice"
          title="Master DSA patterns"
          description="Don't just grind random problems. Learn the underlying patterns, study the universal templates, and apply them to solve any variation with confidence."
        />

        <div className="w-full shrink-0 space-y-2.5 rounded-xl bg-surface-sunken p-5 md:w-56">
          <div className="flex items-center gap-2">
            <Target className="size-3.5 text-primary" aria-hidden />
            <Heading level="overline">Overall mastery</Heading>
          </div>
          <div className="flex items-baseline gap-2">
            <Metric>{overallProgress}%</Metric>
            <Text size="caption" tone="muted" numeric as="span">
              {totalCompleted}/{totalProblems} solved
            </Text>
          </div>
          <Progress
            value={overallProgress}
            aria-label={`Overall mastery: ${overallProgress} percent`}
            className="[&_[data-slot=progress-track]]:h-1.5"
          />
        </div>
      </div>

      {/* Pattern grid */}
      {initialPatterns.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Code2}
              title="No patterns yet"
              description="Patterns will show up here as soon as they are published to the content library."
            />
          </CardContent>
        </Card>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {initialPatterns.map((pattern) => {
            const stat = statsMap[pattern.title] ?? { total: 0, completed: 0 };
            const pct = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
            const complete = pct === 100;
            const slug = pattern.slug;

            return (
              <motion.div key={pattern.title} variants={itemVariants} className="h-full">
                <Link
                  href={`/dsa/${slug}`}
                  className="group block h-full rounded-xl outline-none focus-visible:shadow-glow"
                >
                  <Card interactive className="h-full">
                    <CardContent className="flex flex-1 flex-col gap-4">
                      {/* Title row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            aria-hidden
                            className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"
                          >
                            <Code2 className="size-5" />
                          </span>
                          <div className="min-w-0">
                            <Heading level="card" className="truncate">
                              {pattern.title}
                            </Heading>
                            <Text size="caption" tone="muted" numeric className="mt-0.5">
                              {stat.completed} / {stat.total} solved
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

                      {/* Complexity + use cases */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="secondary" className="font-mono">
                          <Clock aria-hidden />
                          <span className="sr-only">Time complexity</span>
                          {pattern.timeComplexity}
                        </Badge>
                        <Badge variant="secondary" className="font-mono">
                          <Zap aria-hidden />
                          <span className="sr-only">Space complexity</span>
                          {pattern.spaceComplexity}
                        </Badge>
                        {(pattern.useCases || []).slice(0, 2).map((tag: string) => (
                          <Badge key={tag} variant="ghost" className="bg-accent text-accent-foreground">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>

                    {/* Progress */}
                    <CardFooter className="mt-auto flex-col items-stretch gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <Text size="caption" tone="muted" weight="medium" as="span">
                          Progress
                        </Text>
                        <span className="inline-flex items-center gap-1">
                          {complete ? (
                            <Check className="size-3.5 text-success" aria-hidden />
                          ) : null}
                          <Text
                            size="caption"
                            weight="medium"
                            numeric
                            as="span"
                            tone={complete ? 'success' : 'primary'}
                          >
                            {complete ? 'Complete' : `${pct}%`}
                          </Text>
                        </span>
                      </div>
                      <Progress
                        value={pct}
                        aria-label={`${pattern.title}: ${pct} percent complete`}
                        className={cn('[&_[data-slot=progress-track]]:h-1.5')}
                      />
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
