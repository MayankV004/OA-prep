import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus, FileCode2, RotateCcw } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { CheatsheetCard } from './CheatsheetCard';
import type { Cheatsheet } from '@/types/cheatsheet';

interface CheatsheetGridProps {
  cheatsheets: Cheatsheet[];
  isLoading: boolean;
  searchQuery: string;
  selectedTag: string;
  isAdmin: boolean;
  onNewClick: () => void;
  onResetFilters?: () => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

export function CheatsheetGrid({
  cheatsheets,
  isLoading,
  searchQuery,
  selectedTag,
  isAdmin,
  onNewClick,
  onResetFilters,
}: CheatsheetGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col justify-between p-6 sm:p-7 rounded-[28px] sm:rounded-3xl bg-card/60 dark:bg-card/30 border border-border/70 dark:border-white/10 backdrop-blur-xl space-y-4"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="space-y-3.5">
              <div className="flex items-start justify-between gap-3">
                <Skeleton className="h-6 w-28 rounded-full" />
                <Skeleton className="size-11 sm:size-12 rounded-2xl shrink-0" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4 rounded-lg" />
                <Skeleton className="h-3.5 w-full rounded" />
                <Skeleton className="h-3.5 w-4/5 rounded" />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Skeleton className="h-5 w-20 rounded-lg" />
                <Skeleton className="h-5 w-20 rounded-lg" />
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-border/50 dark:border-white/10 flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (cheatsheets.length === 0) {
    return (
      <Card className="rounded-3xl border border-dashed border-border/80 bg-card/50 p-12 text-center shadow-xs">
        <CardContent className="p-0">
          <EmptyState
            icon={FileCode2}
            title={searchQuery || selectedTag ? 'No matching cheat sheets' : 'No cheat sheets created yet'}
            description={
              searchQuery || selectedTag
                ? 'Try clearing your search query or tag filter to discover more sheets.'
                : 'Curated quick-reference sheets and interview syntax guides will appear here.'
            }
            action={
              searchQuery || selectedTag ? (
                onResetFilters ? (
                  <button
                    type="button"
                    onClick={onResetFilters}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover transition-all cursor-pointer"
                  >
                    <RotateCcw className="size-3.5" />
                    <span>Reset Filters</span>
                  </button>
                ) : undefined
              ) : isAdmin ? (
                <Button
                  onClick={onNewClick}
                  className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs gap-1.5 shadow-xs px-4 py-2 rounded-full cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>New Cheat Sheet</span>
                </Button>
              ) : undefined
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {cheatsheets.map((sheet) => (
        <motion.div key={sheet._id} variants={itemVariants} className="h-full">
          <CheatsheetCard sheet={sheet} />
        </motion.div>
      ))}
    </motion.div>
  );
}
