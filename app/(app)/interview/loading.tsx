import { Skeleton } from '@/components/ui/skeleton';

/**
 * Mirrors the interview index: cockpit header, 4-card KPI bento strip,
 * search & filter toolbar, and responsive grid of interview subject cards.
 */
export default function InterviewLoading() {
  return (
    <div className="space-y-8 pb-16" aria-busy role="status" aria-label="Loading interview subjects">
      <span className="sr-only">Loading interview subjects…</span>

      {/* 1. Cockpit Header Skeleton */}
      <div className="pt-2 space-y-3">
        <Skeleton className="h-12 w-80 sm:w-96 rounded-xl" />
        <Skeleton className="h-4 w-full max-w-xl rounded-md" />
        <Skeleton className="h-4 w-4/5 max-w-md rounded-md" />
      </div>

      {/* 2. 4-Card KPI Bento Strip Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 sm:p-6 rounded-[28px] sm:rounded-3xl bg-card/70 dark:bg-card/35 backdrop-blur-2xl border border-border/80 dark:border-white/10 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="size-4 rounded" />
            </div>
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-3 w-32 rounded" />
          </div>
        ))}
      </div>

      {/* 3. Search & Status Toolbar Skeleton */}
      <div className="p-2.5 sm:p-3 rounded-2xl bg-card/70 border border-border/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-9 w-64 rounded-xl" />
      </div>

      {/* 4. Subject Cards Grid Skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col justify-between p-6 sm:p-7 rounded-[28px] sm:rounded-3xl bg-card/60 dark:bg-card/30 border border-border/70 dark:border-white/10 backdrop-blur-xl space-y-4"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="space-y-3.5">
              <div className="flex items-start justify-between gap-3">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="size-11 sm:size-12 rounded-2xl shrink-0" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4 rounded-lg" />
                <Skeleton className="h-3.5 w-full rounded" />
                <Skeleton className="h-3.5 w-4/5 rounded" />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Skeleton className="h-5 w-24 rounded-lg" />
                <Skeleton className="h-5 w-20 rounded-lg" />
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-border/50 dark:border-white/10 flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-8 w-36 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
