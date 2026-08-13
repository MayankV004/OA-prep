import * as React from "react"

import { cn } from "@/lib/utils"

/** Placeholder surface for async content. Prefer this over bare spinners. */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn("animate-shimmer rounded-lg bg-muted", className)}
      {...props}
    />
  )
}

/** Repeating skeleton rows sized for table bodies. */
function SkeletonRows({
  rows = 5,
  className,
  ...props
}: React.ComponentProps<"div"> & { rows?: number }) {
  return (
    <div
      data-slot="skeleton-rows"
      className={cn("space-y-2", className)}
      {...props}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-11 w-full"
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  )
}

/** Skeleton shaped like a stat card. */
function SkeletonCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton-card"
      className={cn(
        "space-y-3 rounded-xl bg-card p-5 shadow-e1",
        className
      )}
      {...props}
    >
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-7 w-16" />
      <Skeleton className="h-2.5 w-32" />
    </div>
  )
}

export { Skeleton, SkeletonRows, SkeletonCard }
