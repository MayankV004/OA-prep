import { queryOptions } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/dashboard';
import { queryKeys, STALE_TIMES } from '@/lib/query-keys';

export const dashboardQueries = {
  /** Query options for dashboard metrics, heatmap, trend, and feed */
  stats: (userId: string = 'me') =>
    queryOptions({
      queryKey: queryKeys.dashboard.stats(userId),
      queryFn: () => dashboardApi.getStats(userId),
      staleTime: STALE_TIMES.userSlow,
    }),

  /** Query options for landing page global stats */
  globalStats: () =>
    queryOptions({
      queryKey: queryKeys.stats.global(),
      queryFn: () => dashboardApi.getGlobalStats(),
      staleTime: STALE_TIMES.static,
    }),
};
