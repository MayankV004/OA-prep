import { Skeleton } from '@/components/ui/skeleton';

/**
 * Mirrors the interview index: page heading block, then the responsive grid of
 * subject cards. Shapes only — no spinners.
 */
export default function InterviewLoading() {
  return (
    <div className="space-y-8 pb-12" aria-busy role="status" aria-label="Loading interview subjects">
      <span className="sr-only">Loading interview subjects…</span>

      {/* Page heading */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-8 w-56 sm:h-9" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      {/* Subject card grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-e2"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <Skeleton className="size-10 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="size-4 shrink-0 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
