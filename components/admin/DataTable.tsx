'use client';

import * as React from 'react';
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Inbox,
  Search,
  TriangleAlert,
  X,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { SkeletonRows } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/typography';

export type Column<T> = {
  id: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  /** Providing this makes the column sortable. */
  sortValue?: (row: T) => string | number | null | undefined;
  className?: string;
  headClassName?: string;
  /** Hide this column below the given breakpoint on narrow screens. */
  hideBelow?: 'sm' | 'md' | 'lg';
  /** Marks the column used as the title in the mobile card layout. */
  primary?: boolean;
};

type SortState = { columnId: string; direction: 'asc' | 'desc' } | null;

const HIDE_CLASS = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
} as const;

/**
 * Table used across the admin panel. Search, sort, pagination and selection are
 * all client-side over the fetched page — none of the list endpoints return a
 * total count today, so server-side paging isn't available yet.
 * TODO: backend — return a `total` (or wire the existing `nextCursor`) so this
 * can page server-side instead of over a capped fetch.
 */
function DataTable<T>({
  data,
  columns,
  getRowId,
  loading = false,
  error,
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  emptyAction,
  emptyIcon = Inbox,
  filters,
  actions,
  rowActions,
  bulkActions,
  pageSize = 15,
  zebra = true,
}: {
  data: T[] | undefined;
  columns: Column<T>[];
  getRowId: (row: T) => string;
  loading?: boolean;
  error?: unknown;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyDescription?: React.ReactNode;
  emptyAction?: React.ReactNode;
  emptyIcon?: React.ComponentType<{ className?: string }>;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  rowActions?: (row: T) => React.ReactNode;
  bulkActions?: (selected: string[], clear: () => void) => React.ReactNode;
  pageSize?: number;
  zebra?: boolean;
}) {
  const [sort, setSort] = React.useState<SortState>(null);
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<string[]>([]);

  const rows = data ?? [];
  const selectable = Boolean(bulkActions);

  // Reset paging and selection whenever the underlying result set changes.
  React.useEffect(() => {
    setPage(1);
    setSelected([]);
  }, [search, rows.length]);

  const sorted = React.useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((c) => c.id === sort.columnId);
    if (!column?.sortValue) return rows;

    return [...rows].sort((a, b) => {
      const av = column.sortValue!(a);
      const bv = column.sortValue!(b);

      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;

      const result =
        typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv), undefined, { numeric: true });

      return sort.direction === 'asc' ? result : -result;
    });
  }, [columns, rows, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const pageIds = pageRows.map(getRowId);
  const allOnPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.includes(id));

  const toggleSort = (columnId: string) => {
    setSort((prev) =>
      prev?.columnId === columnId
        ? prev.direction === 'asc'
          ? { columnId, direction: 'desc' }
          : null
        : { columnId, direction: 'asc' }
    );
  };

  const toggleRow = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAllOnPage = () => {
    setSelected((prev) =>
      allOnPageSelected
        ? prev.filter((id) => !pageIds.includes(id))
        : [...new Set([...prev, ...pageIds])]
    );
  };

  const clearSelection = () => setSelected([]);

  const visibleColumns = columns;
  const primaryColumn = columns.find((c) => c.primary) ?? columns[0];
  const secondaryColumns = columns.filter((c) => c !== primaryColumn);

  return (
    <div className="flex flex-col gap-3">
      {/* ── Toolbar ─────────────────────────────────────────────── */}
      {(onSearchChange || filters || actions) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {onSearchChange ? (
            <div className="relative sm:max-w-xs sm:flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
                aria-hidden
              />
              <Input
                value={search ?? ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="h-9 pl-9 pr-9"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search"
                  className="press absolute right-1 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-text-muted outline-none hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>
          ) : (
            <div className="sm:flex-1" />
          )}

          {filters ? (
            <div className="flex flex-wrap items-center gap-2">{filters}</div>
          ) : null}
          {actions ? (
            <div className="flex items-center gap-2 sm:ml-auto">{actions}</div>
          ) : null}
        </div>
      )}

      {/* ── Bulk action bar ────────────────────────────────────── */}
      {selectable && selected.length > 0 ? (
        <div className="animate-in-fade flex flex-wrap items-center gap-2 rounded-lg bg-accent px-3 py-2">
          <Text size="caption" weight="medium" className="text-accent-foreground">
            {selected.length} selected
          </Text>
          <div className="ml-auto flex items-center gap-2">
            {bulkActions!(selected, clearSelection)}
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              Clear
            </Button>
          </div>
        </div>
      ) : null}

      {/* ── Body ───────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl bg-card shadow-e2">
        {loading ? (
          <div className="p-3">
            <SkeletonRows rows={6} />
          </div>
        ) : error ? (
          <EmptyState
            icon={TriangleAlert}
            title="Couldn't load this data"
            description={
              error instanceof Error
                ? error.message
                : 'Something went wrong fetching these records.'
            }
          />
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={emptyIcon as never}
            title={search ? `No matches for “${search}”` : emptyTitle}
            description={
              search
                ? 'Try a different search term or clear the filter.'
                : emptyDescription
            }
            action={search ? undefined : emptyAction}
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr>
                    {selectable ? (
                      <th className="w-10 pl-4 pr-0">
                        <Checkbox
                          checked={allOnPageSelected}
                          onCheckedChange={toggleAllOnPage}
                          aria-label="Select all rows on this page"
                        />
                      </th>
                    ) : null}

                    {visibleColumns.map((column) => {
                      const isSorted = sort?.columnId === column.id;

                      return (
                        <th
                          key={column.id}
                          aria-sort={
                            isSorted
                              ? sort!.direction === 'asc'
                                ? 'ascending'
                                : 'descending'
                              : undefined
                          }
                          className={cn(
                            'h-10 px-3 text-left align-middle text-2xs font-semibold uppercase tracking-[0.08em] whitespace-nowrap text-text-muted',
                            column.hideBelow && HIDE_CLASS[column.hideBelow],
                            column.headClassName
                          )}
                        >
                          {column.sortValue ? (
                            <button
                              type="button"
                              onClick={() => toggleSort(column.id)}
                              className="inline-flex items-center gap-1 rounded outline-none transition-colors hover:text-foreground"
                            >
                              {column.header}
                              {isSorted ? (
                                sort!.direction === 'asc' ? (
                                  <ArrowUp className="size-3" aria-hidden />
                                ) : (
                                  <ArrowDown className="size-3" aria-hidden />
                                )
                              ) : (
                                <ChevronsUpDown
                                  className="size-3 opacity-40"
                                  aria-hidden
                                />
                              )}
                            </button>
                          ) : (
                            column.header
                          )}
                        </th>
                      );
                    })}

                    {rowActions ? <th className="w-10 pr-4" /> : null}
                  </tr>
                </thead>

                <tbody>
                  {pageRows.map((row, index) => {
                    const id = getRowId(row);
                    const isSelected = selected.includes(id);

                    return (
                      <tr
                        key={id}
                        data-state={isSelected ? 'selected' : undefined}
                        className={cn(
                          'transition-colors',
                          // Zebra striping instead of row borders.
                          zebra && index % 2 === 1 && 'bg-surface-sunken/60',
                          isSelected && 'bg-accent/70',
                          'hover:bg-muted'
                        )}
                      >
                        {selectable ? (
                          <td className="w-10 pl-4 pr-0">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleRow(id)}
                              aria-label={`Select row ${id}`}
                            />
                          </td>
                        ) : null}

                        {visibleColumns.map((column) => (
                          <td
                            key={column.id}
                            className={cn(
                              'px-3 py-2.5 align-middle',
                              column.hideBelow && HIDE_CLASS[column.hideBelow],
                              column.className
                            )}
                          >
                            {column.cell(row)}
                          </td>
                        ))}

                        {rowActions ? (
                          <td className="pr-4 text-right">{rowActions(row)}</td>
                        ) : null}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards — tables never force a pinch-zoom */}
            <ul className="divide-y divide-divider md:hidden">
              {pageRows.map((row) => {
                const id = getRowId(row);
                const isSelected = selected.includes(id);

                return (
                  <li
                    key={id}
                    className={cn('p-4', isSelected && 'bg-accent/70')}
                  >
                    <div className="flex items-start gap-3">
                      {selectable ? (
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleRow(id)}
                          aria-label={`Select row ${id}`}
                          className="mt-0.5"
                        />
                      ) : null}

                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="text-sm font-medium text-foreground">
                          {primaryColumn.cell(row)}
                        </div>

                        <dl className="grid gap-1.5">
                          {secondaryColumns.map((column) => (
                            <div
                              key={column.id}
                              className="flex items-baseline justify-between gap-3"
                            >
                              <dt className="text-2xs uppercase tracking-[0.08em] text-text-muted">
                                {column.header}
                              </dt>
                              <dd className="min-w-0 text-right text-xs text-text-secondary">
                                {column.cell(row)}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </div>

                      {rowActions ? (
                        <div className="shrink-0">{rowActions(row)}</div>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      {sorted.length > pageSize ? (
        <Pagination
          page={safePage}
          pageCount={pageCount}
          total={sorted.length}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      ) : sorted.length > 0 ? (
        <Text size="caption" tone="muted" numeric>
          {sorted.length} {sorted.length === 1 ? 'record' : 'records'}
        </Text>
      ) : null}
    </div>
  );
}

export { DataTable };
