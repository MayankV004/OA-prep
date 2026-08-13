"use client"

import * as React from "react"
import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Toast stack. `ToastProvider` wraps the app (see components/Providers.tsx);
 * `Toaster` renders the viewport; `useToast` is the imperative entry point.
 *
 *   const toast = useToast()
 *   toast.add("Saved", { type: "success" })
 */

const ToastProvider = ToastPrimitive.Provider

function useToast() {
  return ToastPrimitive.useToastManager()
}

const TYPE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  loading: Info,
}

const TYPE_TONE: Record<string, string> = {
  success: "text-success",
  error: "text-destructive",
  warning: "text-warning",
  loading: "text-primary",
}

function Toaster() {
  const { toasts } = ToastPrimitive.useToastManager()

  return (
    <ToastPrimitive.Portal>
      <ToastPrimitive.Viewport
        className={cn(
          "fixed bottom-0 right-0 z-[100] flex w-full max-w-sm flex-col gap-2 p-4",
          "sm:bottom-4 sm:right-4 sm:p-0"
        )}
      >
        {toasts.map((toast) => {
          const type = (toast.type ?? "") as string
          const Icon = TYPE_ICON[type]

          return (
            <ToastPrimitive.Root
              key={toast.id}
              toast={toast}
              className={cn(
                "w-full rounded-xl bg-popover p-4 shadow-e3 outline-none",
                "transition-[transform,opacity] duration-250 ease-out-quart",
                "data-[starting-style]:translate-y-2 data-[starting-style]:opacity-0",
                "data-[ending-style]:translate-y-2 data-[ending-style]:opacity-0",
                "data-behind:scale-[0.97] data-behind:opacity-0"
              )}
            >
              <ToastPrimitive.Content className="flex items-start gap-3">
                {Icon ? (
                  <Icon
                    className={cn("mt-0.5 size-4 shrink-0", TYPE_TONE[type])}
                  />
                ) : null}
                <div className="min-w-0 flex-1 space-y-0.5">
                  <ToastPrimitive.Title className="text-sm font-semibold text-foreground" />
                  <ToastPrimitive.Description className="text-sm leading-snug text-text-muted" />
                </div>
                <ToastPrimitive.Close
                  aria-label="Dismiss notification"
                  className={cn(
                    "press -mr-1 -mt-1 grid size-7 shrink-0 place-items-center rounded-md",
                    "text-text-muted outline-none hover:bg-muted hover:text-foreground"
                  )}
                >
                  <X className="size-3.5" />
                </ToastPrimitive.Close>
              </ToastPrimitive.Content>
            </ToastPrimitive.Root>
          )
        })}
      </ToastPrimitive.Viewport>
    </ToastPrimitive.Portal>
  )
}

export { ToastProvider, Toaster, useToast }
