import { apiFetch } from './client';
import type { Problem, ProblemKind, ProblemWritePayload, ProgressGroupStat } from '@/types/problem';

export const problemsApi = {
  /** List problems by kind and optional filters */
  list: (kind: ProblemKind, filters?: Record<string, string | undefined>) => {
    const params = new URLSearchParams({ kind });
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v != null && v !== '') params.append(k, v);
      });
    }
    return apiFetch<Problem[]>(`/api/problems?${params.toString()}`);
  },

  /** Create a problem */
  create: (payload: ProblemWritePayload) =>
    apiFetch<Problem>('/api/problems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),

  /** Update problem completion state */
  toggleCompletion: (problemId: string, completed: boolean) =>
    apiFetch<{ problemId: string; completed: boolean }>(`/api/problems/${problemId}/completion`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    }),

  /** Get progress breakdown stats for a given kind */
  getProgressStats: (kind: ProblemKind) =>
    apiFetch<ProgressGroupStat[]>(`/api/problems/progress?kind=${kind}`),

  /** Get completed problem IDs for a given kind */
  getCompletedIds: (kind: ProblemKind) =>
    apiFetch<string[]>(`/api/problems/progress?kind=${kind}&returnType=ids`),
};
