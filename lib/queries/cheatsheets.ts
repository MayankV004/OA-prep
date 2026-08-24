import { queryOptions } from '@tanstack/react-query';
import { cheatsheetsApi } from '@/lib/api/cheatsheets';
import { queryKeys, STALE_TIMES } from '@/lib/query-keys';

export const cheatsheetQueries = {
  /** Query options for listing all cheat sheets */
  all: (params?: { tag?: string; subjectId?: string }) =>
    queryOptions({
      queryKey: queryKeys.cheatsheets.all(),
      queryFn: () => cheatsheetsApi.list(params),
      staleTime: STALE_TIMES.shared,
    }),

  /** Query options for cheat sheet detail view */
  detail: (slug: string) =>
    queryOptions({
      queryKey: queryKeys.cheatsheets.detail(slug),
      queryFn: () => cheatsheetsApi.detail(slug),
      staleTime: STALE_TIMES.shared,
      enabled: Boolean(slug),
    }),
};
