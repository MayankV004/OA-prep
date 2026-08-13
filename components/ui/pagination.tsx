"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/typography"

/** Compact page window: 1 … 4 5 6 … 20 */
function pageWindow(page: number, pageCount: number): (number | "gap")[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1)
  }

  const pages = new Set<number>([1, pageCount, page])
  if (page - 1 > 1) pages.add(page - 1)
  if (page + 1 < pageCount) pages.add(page + 1)
  if (page <= 3) pages.add(2).add(3).add(4)
  if (page >= pageCount - 2) {
    pages.add(pageCount - 1).add(pageCount - 2).add(pageCount - 3)
  }

  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b)
  const out: (number | "gap")[] = []

  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap")
    out.push(p)
  })

  return out
}

function Pagination({
  page,
  pageCount,
  total,
  pageSize,
  onPageChange,
  className,
}: {
  page: number
  pageCount: number
  total?: number
  pageSize?: number
  onPageChange: (page: number) => void
  className?: string
}) {
  if (pageCount <= 1 && !total) return null

  const from = pageSize ? (page - 1) * pageSize + 1 : undefined
  const to = pageSize && total ? Math.min(page * pageSize, total) : undefined

  return (
    <nav
      aria-label="Pagination"
      data-slot="pagination"
      className={cn(
        "flex flex-col-reverse items-center justify-between gap-3 sm:flex-row",
        className
      )}
    >
      {total !== undefined ? (
        <Text size="caption" tone="muted" numeric>
          {from !== undefined && to !== undefined
            ? `${from}–${to} of ${total}`
            : `${total} total`}
        </Text>
      ) : (
        <span />
      )}

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
        </Button>

        {pageWindow(page, Math.max(pageCount, 1)).map((p, i) =>
          p === "gap" ? (
            <span
              key={`gap-${i}`}
              className="px-1 text-sm text-text-muted"
              aria-hidden
            >
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? "default" : "ghost"}
              size="icon-sm"
              aria-label={`Page ${p}`}
              aria-current={p === page ? "page" : undefined}
              onClick={() => onPageChange(p)}
              className="tabular-nums"
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Next page"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </nav>
  )
}

export { Pagination }
