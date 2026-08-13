import { Skeleton } from '@/components/ui/skeleton';

/**
 * Mirrors the DSA index layout: intro block + overall-mastery stat, then the
 * responsive grid of pattern cards. Shapes only — no spinners.
 */
export default function DSALoading() {
  return (
    <div className="space-y-10 pb-12" aria-busy role="status" aria-label="Loading DSA patterns">
      <span className="sr-only">Loading DSA patterns…</span>

      {/* Intro + overall progress */}
      <div className="flex flex-col gap-6 rounded-2xl bg-card p-6 shadow-e2 md:flex-row md:items-end md:justify-between sm:p-8">
        <div className="w-full max-w-2xl space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-2/3 sm:h-10" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="w-full shrink-0 space-y-2.5 rounded-xl bg-surface-sunken p-5 md:w-56">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>

      {/* Pattern card grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-5 rounded-xl bg-card p-5 shadow-e2"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Skeleton className="size-10 shrink-0 rounded-xl" />
                <div className="min-w-0 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="size-8 shrink-0 rounded-full" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>

            <div className="mt-auto space-y-2.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
