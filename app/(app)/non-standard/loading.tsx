import { Skeleton } from '@/components/ui/skeleton';

/**
 * Mirrors the non-standard index: page heading, 4 metric strips, then a 3-col grid of
 * category cards with a progress footer. Shapes only — no spinners.
 */
export default function NonStandardLoading() {
  return (
    <div className="space-y-8 pb-16" aria-busy role="status" aria-label="Loading non-standard categories">
      <span className="sr-only">Loading non-standard categories…</span>

      {/* 1. Header Skeleton */}
      <div className="pt-2 space-y-3">
        <Skeleton className="h-12 w-80 sm:w-96 rounded-xl" />
        <Skeleton className="h-4 w-full max-w-xl rounded-md" />
      </div>

      {/* 2. Frameless Assessment Banner Skeleton */}
      <div className="w-full py-5 px-2 border-y border-foreground/20 dark:border-white/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-36 rounded" />
            <Skeleton className="h-6 w-64 rounded-md" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-40 rounded" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>
        </div>
      </div>

      {/* 3. Filter toolbar skeleton */}
      <Skeleton className="h-14 w-full rounded-2xl" />

      {/* 4. Category cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col justify-between p-6 sm:p-7 rounded-[28px] sm:rounded-3xl bg-card/60 dark:bg-card/30 border border-border/70 dark:border-white/10 backdrop-blur-xl space-y-4"
          >
            <div className="space-y-3.5">
              <div className="flex items-start justify-between gap-3">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="size-11 sm:size-12 rounded-2xl shrink-0" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4 rounded-lg" />
                <Skeleton className="h-3.5 w-full rounded" />
                <Skeleton className="h-3.5 w-4/5 rounded" />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>

              <div className="pt-1">
                <Skeleton className="h-5 w-28 rounded-lg" />
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
