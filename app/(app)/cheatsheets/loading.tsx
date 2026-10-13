import { Skeleton } from '@/components/ui/skeleton';

/**
 * Mirrors the cheat sheets index: cockpit heading, search & tag filter bar,
 * and responsive grid of frosted glass cheat sheet cards.
 */
export default function CheatsheetsLoading() {
  return (
    <div className="space-y-8 pb-16" aria-busy role="status" aria-label="Loading cheat sheets">
      <span className="sr-only">Loading cheat sheets…</span>

      {/* 1. Page Heading Skeleton */}
      <div className="pt-2 space-y-3">
        <Skeleton className="h-12 w-80 sm:w-96 rounded-xl" />
        <Skeleton className="h-4 w-full max-w-xl rounded-md" />
        <Skeleton className="h-4 w-4/5 max-w-md rounded-md" />
      </div>

      {/* 2. Filter Bar Skeleton */}
      <div className="p-2.5 sm:p-3 rounded-2xl bg-card/70 border border-border/80 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <Skeleton className="h-10 flex-1 sm:max-w-md rounded-xl" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>
        <div className="flex items-center gap-2 overflow-hidden pt-0.5">
          <Skeleton className="h-7 w-28 rounded-lg shrink-0" />
          <Skeleton className="h-7 w-20 rounded-lg shrink-0" />
          <Skeleton className="h-7 w-24 rounded-lg shrink-0" />
          <Skeleton className="h-7 w-20 rounded-lg shrink-0" />
        </div>
      </div>

      {/* 3. Sheet Card Grid Skeleton */}
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
                <Skeleton className="h-5 w-16 rounded-lg" />
                <Skeleton className="h-5 w-16 rounded-lg" />
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-border/50 dark:border-white/10 flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
