"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

/**
 * Base UI's Switch.Root renders a <div> by default; `nativeButton` plus a
 * button render keeps it focusable and labellable from a sibling <label>.
 */
function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      nativeButton
      render={<button type="button" />}
      className={cn(
        "press peer inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 outline-none",
        "bg-input-background transition-colors duration-200 ease-out-quart",
        "hover:bg-muted",
        "data-checked:bg-primary data-checked:hover:bg-accent-700",
        "focus-visible:shadow-glow",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-surface shadow-e1",
          "transition-transform duration-200 ease-out-quart",
          "data-checked:translate-x-4"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
