'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Layers,
  Compass,
  Lightbulb,
  Trophy,
  Puzzle,
  Boxes,
  Network,
  Binary,
  Sigma,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import { getNonStandardCategories } from '@/lib/non-standard-dsa';

interface Stat {
  group: string;
  slug?: string;
  total: number;
  completed: number;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Layers,
  Compass,
  Lightbulb,
  Trophy,
  Puzzle,
  Boxes,
  Network,
  Binary,
  Sigma,
};

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

export default function NonStandardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const categories = getNonStandardCategories();

  const { data: progress = [] } = useQuery<Stat[]>({
    queryKey: ['problems', 'progress', 'nonstandard'],
    queryFn: async () => {
      const res = await fetch('/api/problems/progress?kind=nonstandard');
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 15_000,
  });

  const statsMap = Object.fromEntries(progress.map((p) => [p.group, p]));
  const totalCompleted = progress.reduce((acc, curr) => acc + curr.completed, 0);
  const totalProblems = progress.reduce((acc, curr) => acc + curr.total, 0) || 100;
  const overallProgress = Math.round((totalCompleted / totalProblems) * 100);

  // Filter categories by search query and tag filter
  const filteredCategories = categories.filter((cat) => {
    const matchesSearch =
      cat.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.note.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedTag === 'all') return matchesSearch;

    const stat = statsMap[cat.category];
    if (selectedTag === 'completed') {
      return matchesSearch && stat && stat.completed > 0 && stat.completed === stat.total;
    }
    if (selectedTag === 'in-progress') {
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
            Master <span className="text-rose-500">Non-Standard DSA</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl font-light">
            Ad-hoc, constructive, geometric, and math problems — 100 curated questions that test first-principles reasoning without fixed pattern templates.
          </p>
        </div>

        {/* Overall Mastery Meter Card */}
        <div className="w-full sm:w-64 p-4 rounded-2xl bg-background/60 dark:bg-background/30 backdrop-blur-xl border border-border/30 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-sans">
              Overall Mastery
            </span>
            <span className="text-xs font-semibold text-rose-500 font-mono">
              {totalCompleted}/{totalProblems}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-black tracking-tight text-foreground">
              {overallProgress}%
            </span>
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
            placeholder="Search categories or concepts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 px-4 text-sm font-medium bg-background/80 rounded-xl border border-border/40 focus:border-rose-500/50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Categories' },
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

      {/* 3. Category Grid */}
      {filteredCategories.length === 0 ? (
        <Card className="rounded-3xl border-none bg-background/50 p-8 text-center">
          <CardContent>
            <EmptyState
              title="No categories found"
              description={
                searchQuery
                  ? `No categories match "${searchQuery}". Try a different keyword.`
                  : 'Categories will show up here as soon as problems are available.'
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
          {filteredCategories.map((cat) => {
            const stat = statsMap[cat.category] ?? { total: cat.problemCount, completed: 0 };
            const pct = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
            const complete = pct === 100 && stat.total > 0;
            const Icon = ICON_MAP[cat.iconName] || Layers;

            return (
              <motion.div key={cat.slug} variants={itemVariants} className="h-full">
                <Link href={`/non-standard/${cat.slug}`} className="group block h-full outline-none">
                  <Card
                    className={cn(
                      'h-full flex flex-col justify-between p-6 rounded-3xl bg-background/60 dark:bg-background/30 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-xl border border-border/30 hover:border-border/60'
                    )}
                  >
                    <div className="space-y-4">
                      {/* Top Header Row */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-display text-lg font-bold tracking-tight text-foreground group-hover:text-rose-500 transition-colors truncate">
                            {cat.shortName}
                          </h3>
                        </div>

                        {/* Subheader info: Problem count & Solved counter */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground text-[11px] font-semibold">
                            {cat.problemCount} problem{cat.problemCount !== 1 ? 's' : ''}
                          </span>
                          <span className="text-border">•</span>
                          <span className="font-mono text-xs">
                            <span className="font-semibold text-foreground">{stat.completed}</span> / {stat.total} solved
                          </span>
                        </div>
                      </div>

                      {/* Description Snippet */}
                      {cat.note && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-light">
                          {cat.note}
                        </p>
                      )}
                    </div>

                    {/* Progress Bar Footer */}
                    <div className="pt-6 space-y-2 mt-auto">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium">Progress</span>
                        <span
                          className={cn(
                            'font-semibold font-mono',
                            complete ? 'text-rose-500 font-bold' : 'text-foreground'
                          )}
                        >
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
