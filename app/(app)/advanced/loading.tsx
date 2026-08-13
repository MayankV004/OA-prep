import { Skeleton } from '@/components/ui/skeleton';

/** Mirrors the Advanced Topics index: page heading + 1/2/3-column card grid. */
export default function AdvancedLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading advanced topics">
      {/* PageHeading: overline, title, description */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-60 max-w-full" />
          <Skeleton className="h-3 w-80 max-w-full" />
        </div>
        <Skeleton className="h-3 w-16 shrink-0" />
      </div>

      {/* Track card grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-e2"
          >
            <Skeleton className="size-9 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3.5 w-32 max-w-full" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
