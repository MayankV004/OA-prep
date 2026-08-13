import { Skeleton } from '@/components/ui/skeleton';

/**
 * Mirrors the CP index: page heading, then a 1 → 2 → 4 grid of platform cards
 * with a percentage figure and progress footer. Shapes only — no spinners.
 */
export default function CPLoading() {
  return (
    <div className="space-y-8 pb-12" aria-busy role="status" aria-label="Loading contest platforms">
      <span className="sr-only">Loading contest platforms…</span>

      {/* Page heading */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-64 sm:h-9" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      {/* Platform cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl bg-card shadow-e2"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Skeleton className="size-10 shrink-0 rounded-xl" />
                  <div className="min-w-0 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="size-8 shrink-0 rounded-full" />
              </div>
              <Skeleton className="h-7 w-16" />
            </div>

            <div className="bg-surface-sunken p-4">
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
