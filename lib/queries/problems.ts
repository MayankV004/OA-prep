import { queryOptions } from '@tanstack/react-query';
import { problemsApi } from '@/lib/api/problems';
import { queryKeys, STALE_TIMES } from '@/lib/query-keys';
import type { ProblemKind } from '@/types/problem';

export const problemQueries = {
  /** Query options for listing problems by kind and filters */
  list: (kind: ProblemKind, filters?: Record<string, string | undefined>) =>
    queryOptions({
      queryKey: queryKeys.problems.list(kind, filters),
      queryFn: () => problemsApi.list(kind, filters),
      staleTime: STALE_TIMES.userFast,
    }),

  /** Query options for progress breakdown stats */
  progressStats: (kind: ProblemKind) =>
    queryOptions({
      queryKey: queryKeys.progress.stats(kind),
      queryFn: () => problemsApi.getProgressStats(kind),
      staleTime: STALE_TIMES.userFast,
    }),

  /** Query options for completed problem IDs */
  completedIds: (kind: ProblemKind) =>
    queryOptions({
      queryKey: queryKeys.progress.ids(kind),
      queryFn: () => problemsApi.getCompletedIds(kind),
      staleTime: STALE_TIMES.userFast,
    }),
};
