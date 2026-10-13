import { Skeleton } from '@/components/ui/skeleton';

/**
 * Mirrors the Advanced Topics index: cockpit header, search toolbar,
 * and responsive grid of frosted glass specialization track cards.
 */
export default function AdvancedLoading() {
  return (
    <div className="space-y-8 pb-16" aria-busy role="status" aria-label="Loading advanced topics">
      <span className="sr-only">Loading advanced topics…</span>

      {/* 1. Cockpit Header Skeleton */}
      <div className="pt-2 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className="h-12 w-72 sm:w-96 rounded-xl" />
            <Skeleton className="h-4 w-full max-w-xl rounded-md" />
            <Skeleton className="h-4 w-4/5 max-w-md rounded-md" />
          </div>
        </div>
      </div>

      {/* 2. Search & Toolbar Skeleton */}
      <div className="p-2.5 rounded-2xl bg-card/70 border border-border/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <Skeleton className="h-10 flex-1 sm:max-w-md rounded-xl" />
        <Skeleton className="h-4 w-48 rounded-md" />
      </div>

      {/* 3. Track Cards Grid Skeleton */}
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
                <Skeleton className="h-5 w-24 rounded-lg" />
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
