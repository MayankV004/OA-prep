"use client"

import * as React from "react"
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/**
 * Base UI nests Portal > Backdrop + Viewport > Popup. There is no Positioner
 * on AlertDialog — the Viewport handles scroll containment.
 */

function AlertDialog(
  props: React.ComponentProps<typeof AlertDialogPrimitive.Root>
) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger
      data-slot="alert-dialog-trigger"
      className={cn("outline-none", className)}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Popup>) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Backdrop
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
          "transition-opacity duration-200 ease-out-quart",
          "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0"
        )}
      />
      <AlertDialogPrimitive.Viewport className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4">
        <AlertDialogPrimitive.Popup
          data-slot="alert-dialog-content"
          className={cn(
            "w-full max-w-md rounded-2xl bg-popover p-6 text-popover-foreground shadow-e4 outline-none",
            "transition-[transform,opacity] duration-200 ease-out-quart",
            "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className
          )}
          {...props}
        >
          {children}
        </AlertDialogPrimitive.Popup>
      </AlertDialogPrimitive.Viewport>
    </AlertDialogPrimitive.Portal>
  )
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn(
        "font-display text-base font-semibold text-foreground",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("mt-2 text-sm leading-relaxed text-text-secondary", className)}
      {...props}
    />
  )
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogCancel({
  className,
  children = "Cancel",
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Close>) {
  return (
    <AlertDialogPrimitive.Close
      data-slot="alert-dialog-cancel"
      render={<Button variant="ghost" />}
      className={cn("w-full sm:w-auto", className)}
      {...props}
    >
      {children}
    </AlertDialogPrimitive.Close>
  )
}

/**
 * Destructive confirmation. The item name is echoed in the copy so a
 * mis-click on the wrong row is obvious before it is confirmed.
 */
function ConfirmDialog({
  open,
  onOpenChange,
  itemName,
  action = "delete",
  description,
  confirmLabel,
  onConfirm,
  pending = false,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  itemName: string
  action?: string
  description?: React.ReactNode
  confirmLabel?: string
  onConfirm: () => void
  pending?: boolean
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogTitle>
          {action.charAt(0).toUpperCase() + action.slice(1)}{" "}
          <span className="text-primary">{itemName}</span>?
        </AlertDialogTitle>
        <AlertDialogDescription>
          {description ?? (
            <>
              This will {action}{" "}
              <span className="font-medium text-foreground">{itemName}</span>.
              This action cannot be undone.
            </>
          )}
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending} />
          <Button
            variant="destructive-solid"
            loading={pending}
            onClick={onConfirm}
            className="w-full sm:w-auto"
          >
            {confirmLabel ?? `Yes, ${action}`}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  ConfirmDialog,
}
