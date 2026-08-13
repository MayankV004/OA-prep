import { Skeleton } from '@/components/ui/skeleton';

/**
 * Mirrors the cheat sheets index: heading + action, the tag filter row, then
 * the responsive grid of sheet cards. Shapes only — no spinners.
 */
export default function CheatsheetsLoading() {
  return (
    <div className="space-y-8 pb-12" aria-busy role="status" aria-label="Loading cheat sheets">
      <span className="sr-only">Loading cheat sheets…</span>

      {/* Page heading + primary action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-48 sm:h-9" />
          <Skeleton className="h-4 w-full max-w-sm" />
        </div>
        <Skeleton className="h-9 w-40 shrink-0 rounded-lg" />
      </div>

      {/* Tag filter row */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-16 rounded-full" />
        ))}
      </div>

      {/* Sheet card grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="space-y-4 rounded-xl bg-card p-4 shadow-e2"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start gap-3">
              <Skeleton className="size-10 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
