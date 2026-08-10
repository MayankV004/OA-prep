'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Code2, Clock, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PatternStat { group: string; total: number; completed: number }

const PATTERNS = [
  {
    name: 'Backtracking',
    time: 'O(2ⁿ)',
    space: 'O(n)',
    tags: ['DFS', 'Recursion'],
    color: 'from-pink-500/20 to-rose-500/20',
    iconColor: 'text-pink-500',
  },
  {
    name: 'Trees',
    time: 'O(n)',
    space: 'O(h)',
    tags: ['DFS', 'BFS', 'BST'],
    color: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-500',
  },
  {
    name: 'dynamic-programming',
    displayName: 'Dynamic Programming',
    time: 'O(n²)',
    space: 'O(n)',
    tags: ['Memoization', 'Optimization'],
    color: 'from-violet-500/20 to-purple-500/20',
    iconColor: 'text-violet-500',
  },
  {
    name: 'binary-search',
    displayName: 'Binary Search',
    time: 'O(log n)',
    space: 'O(1)',
    tags: ['Array', 'Search'],
    color: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-500',
  },
  {
    name: 'Graphs',
    time: 'O(V+E)',
    space: 'O(V)',
    tags: ['BFS', 'DFS', 'Shortest Path'],
    color: 'from-orange-500/20 to-amber-500/20',
    iconColor: 'text-orange-500',
  },
  {
    name: 'prefix-sum',
    displayName: 'Prefix Sum',
    time: 'O(n)',
    space: 'O(n)',
    tags: ['Array', 'Subarray'],
    color: 'from-indigo-500/20 to-blue-500/20',
    iconColor: 'text-indigo-500',
  },
  {
    name: 'Intervals',
    time: 'O(n log n)',
    space: 'O(1)',
    tags: ['Sorting', 'Greedy'],
    color: 'from-fuchsia-500/20 to-pink-500/20',
    iconColor: 'text-fuchsia-500',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function DSAPage() {
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
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card to-background border border-border p-8 sm:p-12 shadow-sm">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">
              Master DSA Patterns
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Don&apos;t just grind random problems. Learn the underlying patterns, study the universal templates, and apply them to solve any variation with confidence.
            </p>
          </div>
          
          <div className="shrink-0 flex items-center justify-center p-6 bg-background/50 backdrop-blur-md rounded-2xl border border-border/50 shadow-sm min-w-[200px]">
            <div className="text-center space-y-2">
              <Target className="h-8 w-8 text-primary mx-auto mb-2 opacity-80" />
              <div className="text-3xl font-bold">{overallProgress}%</div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Overall Mastery</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {PATTERNS.map((pattern) => {
          const stat = statsMap[pattern.name] ?? { total: 0, completed: 0 };
          const pct = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
          const slug = pattern.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

          return (
            <motion.div key={pattern.name} variants={itemVariants} className="h-full">
              <Link href={`/dsa/${slug}`} className="block h-full outline-none group">
                <div className="relative h-full flex flex-col rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 overflow-hidden">
                  {/* Subtle hover gradient background */}
                  <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br", pattern.color)} />
                  
                  {/* Top row */}
                  <div className="relative flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br", pattern.color)}>
                        <Code2 className={cn("h-6 w-6", pattern.iconColor)} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg leading-tight tracking-tight">{pattern.displayName || pattern.name}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">{stat.completed} / {stat.total} solved</p>
                      </div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center border border-border shadow-sm group-hover:bg-primary group-hover:border-primary transition-colors duration-300">
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                    </div>
                  </div>

                  {/* Complexity badges */}
                  <div className="relative flex items-center gap-2 mb-6 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-background/80 border border-border/50 px-2.5 py-1 rounded-md text-foreground/80 shadow-sm">
                      <Clock className="h-3 w-3 text-blue-500" />{pattern.time}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-background/80 border border-border/50 px-2.5 py-1 rounded-md text-foreground/80 shadow-sm">
                      <Zap className="h-3 w-3 text-amber-500" />{pattern.space}
                    </span>
                    {pattern.tags.map((tag) => (
                      <span key={tag} className="text-xs font-medium bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-md shadow-sm">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Progress bar (pushed to bottom) */}
                  <div className="relative mt-auto pt-2 space-y-2.5">
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span className="text-muted-foreground">Progress</span>
                      <span className={pct === 100 ? "text-emerald-500" : "text-foreground"}>{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-2 bg-muted/50" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
