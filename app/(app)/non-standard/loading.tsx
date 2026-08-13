import { Skeleton } from '@/components/ui/skeleton';

/**
 * Mirrors the non-standard index: page heading, then a 1 → 2 → 3 grid of
 * bucket cards with a progress footer. Shapes only — no spinners.
 */
export default function NonStandardLoading() {
  return (
    <div className="space-y-8 pb-12" aria-busy role="status" aria-label="Loading non-standard buckets">
      <span className="sr-only">Loading non-standard buckets…</span>

      {/* Page heading */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-56 sm:h-9" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      {/* Bucket cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl bg-card shadow-e2"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start justify-between gap-3 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <Skeleton className="size-10 shrink-0 rounded-xl" />
                <div className="min-w-0 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              <Skeleton className="size-8 shrink-0 rounded-full" />
            </div>

            <div className="space-y-2 bg-surface-sunken p-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
