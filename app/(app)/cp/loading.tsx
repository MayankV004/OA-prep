import { Skeleton } from '@/components/ui/skeleton';

/**
 * Mirrors the CP index: page heading, 4 metric strips, platform shortcuts,
 * verified profile card, and chart skeleton. Shapes only — no spinners.
 */
export default function CPLoading() {
  return (
    <div className="space-y-8 pb-16" aria-busy role="status" aria-label="Loading competitive programming hub">
      <span className="sr-only">Loading competitive programming hub…</span>

      {/* Header and Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-2">
        <div className="space-y-2">
          <Skeleton className="h-5 w-48 rounded-full" />
          <Skeleton className="h-10 w-80 rounded-xl" />
          <Skeleton className="h-4 w-full max-w-md rounded-lg" />
        </div>

        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-32 rounded-xl" />
          <Skeleton className="h-9 w-36 rounded-xl" />
        </div>
      </div>

      {/* 4 Executive Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>

      {/* Practice shortcuts bar skeleton */}
      <Skeleton className="h-12 w-full rounded-2xl" />

      {/* CP Profile overview card skeleton */}
      <Skeleton className="h-52 w-full rounded-2xl" />

      {/* Recharts chart card skeleton */}
      <Skeleton className="h-[440px] w-full rounded-2xl" />
    </div>
  );
}
