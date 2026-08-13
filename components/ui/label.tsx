import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Base UI has no standalone Label primitive, so this is a plain element with
 * the project's type treatment.
 */
function Label({
  className,
  ...props
}: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm font-medium leading-none text-foreground select-none",
        "has-disabled:pointer-events-none has-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
