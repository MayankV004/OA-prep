import { Skeleton } from '@/components/ui/skeleton';

/**
 * Mirrors the DSA index layout: cockpit header, 4-card KPI bento strip,
 * search & filter toolbar, and responsive grid of pattern cards.
 */
export default function DSALoading() {
  return (
    <div className="space-y-8 pb-16" aria-busy role="status" aria-label="Loading DSA patterns">
      <span className="sr-only">Loading DSA patterns…</span>

      {/* 1. Cockpit Header Skeleton */}
      <div className="pt-1">
        <div className="space-y-2 max-w-3xl">
          <Skeleton className="h-12 w-80 sm:w-96 rounded-xl" />
          <Skeleton className="h-4 w-full max-w-xl rounded-md" />
          <Skeleton className="h-4 w-4/5 max-w-md rounded-md" />
        </div>
      </div>

      {/* 2. Search & Toolbar Skeleton */}
      <div className="space-y-3">
        <div className="p-2.5 sm:p-3 rounded-2xl bg-card/60 border border-border/70 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-9 w-64 rounded-xl" />
        </div>
        <div className="flex items-center gap-2 overflow-hidden">
          <Skeleton className="h-7 w-24 rounded-xl" />
          <Skeleton className="h-7 w-36 rounded-xl" />
          <Skeleton className="h-7 w-28 rounded-xl" />
          <Skeleton className="h-7 w-32 rounded-xl" />
        </div>
      </div>

      {/* 3. Pattern Card Grid Skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col justify-between p-6 sm:p-7 rounded-[28px] sm:rounded-3xl bg-card/60 dark:bg-card/30 border border-border/70 dark:border-white/10 backdrop-blur-xl space-y-4"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="space-y-3.5">
              {/* Top row: Pill badge + icon box */}
              <div className="flex items-start justify-between gap-3">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="size-11 sm:size-12 rounded-2xl shrink-0" />
              </div>

              {/* Title & description */}
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4 rounded-lg" />
                <Skeleton className="h-3.5 w-full rounded" />
                <Skeleton className="h-3.5 w-4/5 rounded" />
              </div>

              {/* Variations & Tasks Meta */}
              <div className="flex items-center gap-2 pt-1">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>

              {/* Complexities */}
              <div className="flex items-center gap-2 pt-1">
                <Skeleton className="h-5 w-24 rounded-lg" />
                <Skeleton className="h-5 w-24 rounded-lg" />
              </div>
            </div>

            {/* Footer Action Skeleton */}
            <div className="pt-4 mt-4 border-t border-border/50 dark:border-white/10 flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

