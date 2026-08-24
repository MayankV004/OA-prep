import { apiFetch } from './client';
import type { DashboardStats, GlobalStats } from '@/types/dashboard';

export const dashboardApi = {
  /** Get dashboard metrics, trend, heatmap, and recent activity for user */
  getStats: (userId: string = 'me') =>
    apiFetch<DashboardStats>(`/api/dashboard/stats?userId=${encodeURIComponent(userId)}`),

  /** Get landing page global stats */
  getGlobalStats: () => apiFetch<GlobalStats>('/api/stats'),
};
