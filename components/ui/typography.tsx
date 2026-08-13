import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Central type system. Reach for these instead of ad-hoc `text-lg font-bold`
 * combinations so hierarchy stays consistent across the app.
 */

const headingVariants = cva("font-display text-balance text-foreground", {
  variants: {
    level: {
      display: "text-4xl font-bold sm:text-5xl lg:text-6xl",
      page: "text-2xl font-semibold sm:text-3xl",
      section: "text-lg font-semibold sm:text-xl",
      card: "text-sm font-semibold sm:text-base",
      overline:
        "font-sans text-2xs font-semibold uppercase tracking-[0.1em] text-text-muted",
    },
  },
  defaultVariants: {
    level: "page",
  },
})

type HeadingElement = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div"

const DEFAULT_TAG: Record<string, HeadingElement> = {
  display: "h1",
  page: "h1",
  section: "h2",
  card: "h3",
  overline: "p",
}

function Heading({
  className,
  level = "page",
  as,
  ...props
}: React.ComponentProps<"h2"> &
  VariantProps<typeof headingVariants> & { as?: HeadingElement }) {
  const Tag = (as ?? DEFAULT_TAG[level ?? "page"] ?? "h2") as HeadingElement

  return (
    <Tag
      data-slot="heading"
      className={cn(headingVariants({ level, className }))}
      {...props}
    />
  )
}

const textVariants = cva("", {
  variants: {
    size: {
      lead: "text-base sm:text-lg",
      body: "text-sm sm:text-base",
      compact: "text-sm",
      caption: "text-xs",
      micro: "text-2xs",
    },
    tone: {
      primary: "text-foreground",
      secondary: "text-text-secondary",
      muted: "text-text-muted",
      accent: "text-primary",
      success: "text-success",
      warning: "text-warning",
      danger: "text-destructive",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
    },
    numeric: {
      true: "tabular-nums",
      false: "",
    },
  },
  defaultVariants: {
    size: "body",
    tone: "secondary",
    weight: "normal",
    numeric: false,
  },
})

function Text({
  className,
  size,
  tone,
  weight,
  numeric,
  as = "p",
  ...props
}: React.ComponentProps<"p"> &
  VariantProps<typeof textVariants> & { as?: "p" | "span" | "div" | "label" }) {
  const Tag = as as "p"

  return (
    <Tag
      data-slot="text"
      className={cn(textVariants({ size, tone, weight, numeric, className }))}
      {...props}
    />
  )
}

/** Large figure for stat cards — always tabular so columns line up. */
function Metric({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="metric"
      data-numeric=""
      className={cn(
        "font-display text-2xl font-semibold tabular-nums tracking-tight text-foreground sm:text-3xl",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

/** Page header block: overline, title and optional supporting copy. */
function PageHeading({
  title,
  description,
  overline,
  actions,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  title: React.ReactNode
  description?: React.ReactNode
  overline?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div
      data-slot="page-heading"
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
      {...props}
    >
      <div className="min-w-0 space-y-1">
        {overline ? <Heading level="overline">{overline}</Heading> : null}
        <Heading level="page">{title}</Heading>
        {description ? (
          <Text size="compact" tone="muted" className="max-w-2xl">
            {description}
          </Text>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}

export { Heading, Text, Metric, PageHeading, headingVariants, textVariants }
