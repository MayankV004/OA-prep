import { Skeleton } from '@/components/ui/skeleton';

/**
 * Loading skeleton for the redesigned Profile & Progress cockpit.
 * Mirrors the exact Bento Hero ID Deck + Dynamic Workspace architecture.
 */
export default function ProfileLoading() {
  return (
    <div className="space-y-8 pb-16" aria-busy role="status" aria-label="Loading candidate dossier">
      <span className="sr-only">Loading candidate dossier…</span>

      {/* 1. Cockpit Header Skeleton (No banner below) */}
      <div className="pt-1 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2.5 max-w-2xl">
          <Skeleton className="h-5 w-36 rounded-full" />
          <Skeleton className="h-12 w-80 sm:w-96 rounded-2xl" />
          <Skeleton className="h-4 w-full max-w-lg rounded-md" />
        </div>
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-36 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-full" />
        </div>
      </div>

      {/* 2. Bento Hero Pass Skeleton */}
      <div className="p-6 sm:p-8 rounded-[32px] sm:rounded-[36px] bg-card dark:bg-card/50 shadow-e1 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 flex-1">
          <Skeleton className="size-24 sm:size-28 rounded-full shrink-0" />
          <div className="space-y-2.5 flex-1 min-w-0">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-32 rounded-full" />
            </div>
            <Skeleton className="h-8 w-48 sm:w-64 rounded-xl" />
            <Skeleton className="h-3.5 w-36 rounded" />
            <Skeleton className="h-10 w-full max-w-md rounded-xl" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-6 w-24 rounded-lg" />
              <Skeleton className="h-6 w-28 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 shrink-0">
          <Skeleton className="size-36 sm:size-40 rounded-full shrink-0" />
          <div className="flex flex-col gap-2 w-full sm:w-44">
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-5 w-full rounded" />
          </div>
        </div>
      </div>

      {/* 3. Floating View Switcher Skeleton */}
      <div className="p-1.5 sm:p-2 rounded-2xl bg-surface-sunken/80 dark:bg-card/50 shadow-e1 flex items-center gap-2 overflow-hidden">
        <Skeleton className="h-8 w-36 rounded-xl" />
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-8 w-44 rounded-xl" />
        <Skeleton className="h-8 w-40 rounded-xl" />
      </div>

      {/* 4. Bento Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 p-6 rounded-[28px] sm:rounded-3xl bg-card dark:bg-card/50 shadow-e1 space-y-4">
          <Skeleton className="h-6 w-32 rounded" />
          <Skeleton className="h-3 w-full rounded-full" />
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
          </div>
        </div>

        <div className="lg:col-span-7 p-6 rounded-[28px] sm:rounded-3xl bg-card dark:bg-card/50 shadow-e1 space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-40 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
