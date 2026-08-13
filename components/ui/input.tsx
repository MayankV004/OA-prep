import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

/**
 * Borderless input: a filled surface at rest that gains an accent ring on
 * focus. No permanent outline.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-lg bg-input-background px-3 py-1 text-base text-foreground",
        "transition-[box-shadow,background-color] duration-150 ease-out-quart outline-none",
        "placeholder:text-text-muted",
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "hover:bg-muted",
        "focus-visible:bg-surface focus-visible:shadow-glow focus-visible:outline-none",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:bg-danger-muted aria-invalid:shadow-[0_0_0_3px_var(--destructive-muted)]",
        "md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
