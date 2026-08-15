'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

interface PatternStat { group: string; total: number; completed: number }

const containerVariants: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function DSAPageClient({ initialPatterns }: { initialPatterns: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

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

  // Filter patterns by search & tag
  const filteredPatterns = initialPatterns.filter((pattern) => {
    const matchesSearch =
      pattern.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pattern.useCases || []).some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedTag === 'all') return matchesSearch;
    if (selectedTag === 'completed') {
      const stat = statsMap[pattern.title];
      return matchesSearch && stat && stat.completed > 0 && stat.completed === stat.total;
    }
    if (selectedTag === 'in-progress') {
      const stat = statsMap[pattern.title];
      return matchesSearch && stat && stat.completed > 0 && stat.completed < stat.total;
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-2">
        <div className="space-y-1.5">
          <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
            Master <span className="text-rose-500">DSA Patterns</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl font-light">
            Learn the underlying patterns, study universal templates, and apply them to solve any interview variation with confidence.
          </p>
        </div>

        {/* Overall Mastery Meter Card */}
        <div className="w-full sm:w-64 p-4 rounded-2xl bg-background/60 dark:bg-background/30 backdrop-blur-xl border-none shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-sans">
              Overall Mastery
            </span>
            <span className="text-xs font-semibold text-rose-500 font-mono">{totalCompleted}/{totalProblems}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-black tracking-tight text-foreground">{overallProgress}%</span>
            <span className="text-xs text-muted-foreground font-medium">completed</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              style={{ width: `${overallProgress}%` }}
              className="h-full rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-red-400 transition-all duration-500"
            />
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 rounded-2xl bg-background/50 backdrop-blur-md border border-border/30">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search patterns or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 px-4 text-sm font-medium bg-background/80 rounded-xl border border-border/40 focus:border-rose-500/50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Patterns' },
            { id: 'in-progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTag(tab.id)}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap',
                selectedTag === tab.id
                  ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Pattern Grid */}
      {filteredPatterns.length === 0 ? (
        <Card className="rounded-3xl border-none bg-background/50 p-8 text-center">
          <CardContent>
            <EmptyState
              title="No patterns found"
              description={
                searchQuery
                  ? `No patterns match "${searchQuery}". Try a different keyword.`
                  : 'Patterns will show up here as soon as they are added to the library.'
              }
            />
          </CardContent>
        </Card>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filteredPatterns.map((pattern) => {
            const stat = statsMap[pattern.title] ?? { total: 0, completed: 0 };
            const pct = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
            const complete = pct === 100 && stat.total > 0;
            const slug = pattern.slug;

            return (
              <motion.div key={pattern.title} variants={itemVariants} className="h-full">
                <Link
                  href={`/dsa/${slug}`}
                  className="group block h-full outline-none"
                >
                  <Card className="h-full flex flex-col justify-between p-6 rounded-3xl bg-background/60 dark:bg-background/30 backdrop-blur-xl border-none shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5">
                    <div className="space-y-4">
                      {/* Top Header Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-display text-lg font-bold tracking-tight text-foreground group-hover:text-rose-500 transition-colors truncate">
                            {pattern.title}
                          </h3>
                          <div className="text-xs text-muted-foreground font-mono mt-0.5">
                            <span className="font-semibold text-foreground">{stat.completed}</span> / {stat.total} solved
                          </div>
                        </div>
                      </div>

                      {/* Complexity Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {pattern.timeComplexity && (
                          <span className="px-2.5 py-1 rounded-lg bg-muted/60 text-muted-foreground font-mono text-[11px] font-medium border border-border/20">
                            Time: {pattern.timeComplexity}
                          </span>
                        )}
                        {pattern.spaceComplexity && (
                          <span className="px-2.5 py-1 rounded-lg bg-muted/60 text-muted-foreground font-mono text-[11px] font-medium border border-border/20">
                            Space: {pattern.spaceComplexity}
                          </span>
                        )}
                        {(pattern.useCases || []).slice(0, 2).map((tag: string) => (
                          <span key={tag} className="px-2.5 py-1 rounded-lg bg-background/80 text-muted-foreground text-[11px] font-medium border border-border/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Progress Bar Footer */}
                    <div className="pt-6 space-y-2 mt-auto">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium">Progress</span>
                        <span className={cn('font-semibold', complete ? 'text-rose-500 font-bold' : 'text-foreground')}>
                          {complete ? 'Complete' : `${pct}%`}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            complete
                              ? 'bg-rose-500'
                              : 'bg-gradient-to-r from-red-600 via-rose-500 to-red-400'
                          }`}
                        />
                      </div>
                    </div>
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
