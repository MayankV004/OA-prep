import * as React from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Heading, Text } from "@/components/ui/typography"

/**
 * Placeholder for anywhere data can legitimately be absent. Always an icon, an
 * explanation and — where there is something to do — an action.
 */
function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact = false,
  ...props
}: React.ComponentProps<"div"> & {
  icon?: LucideIcon
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  compact?: boolean
}) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "gap-2 px-4 py-10" : "gap-3 px-6 py-16",
        className
      )}
      {...props}
    >
      {Icon ? (
        <span
          aria-hidden
          className={cn(
            "grid place-items-center rounded-xl bg-muted text-text-muted",
            compact ? "size-9" : "size-12"
          )}
        >
          <Icon className={compact ? "size-4" : "size-5"} />
        </span>
      ) : null}

      <div className="space-y-1">
        <Heading level="card" as="p">
          {title}
        </Heading>
        {description ? (
          <Text size="caption" tone="muted" className="mx-auto max-w-sm">
            {description}
          </Text>
        ) : null}
      </div>

      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}

export { EmptyState }
