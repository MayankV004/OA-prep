import { Skeleton, SkeletonCard, SkeletonRows } from '@/components/ui/skeleton';

/**
 * Route-level fallback for /admin. Mirrors the dashboard's rhythm — heading,
 * four stat cards, the signup chart, content shortcuts and the users table —
 * so nothing shifts when the real content lands.
 */
export default function AdminDashboardLoading() {
  return (
    <div className="space-y-8" aria-busy role="status" aria-label="Loading dashboard">
      {/* Page heading */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-3.5 w-72" />
        </div>
        <Skeleton className="h-9 w-32 shrink-0" />
      </div>

      {/* Stats — 1 → 2 → 4 columns, same as the dashboard */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Signup chart */}
      <div className="space-y-4 rounded-xl bg-card p-4 shadow-e2">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-56" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>

      {/* Content quick links */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-40" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[4.25rem] w-full rounded-xl" />
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Skeleton className="h-9 w-full sm:max-w-xs sm:flex-1" />
          <Skeleton className="h-7 w-32 sm:ml-auto" />
        </div>

        <div className="rounded-xl bg-card p-3 shadow-e2">
          <SkeletonRows rows={6} />
        </div>
      </div>

      <span className="sr-only">Loading dashboard…</span>
    </div>
  );
}
