import { apiFetch } from './client';

export interface Cheatsheet {
  _id: string;
  title: string;
  slug: string;
  body?: string;
  tags?: string[];
  updatedAt: string;
  createdAt: string;
}

export interface CreateCheatsheetPayload {
  title: string;
  slug?: string;
  body?: string;
  tags?: string[];
}

export interface UpdateCheatsheetPayload {
  title?: string;
  body?: string;
  tags?: string[];
}

export const cheatsheetsApi = {
  /** Fetch all cheat sheets (optionally filtered by tag or subjectId) */
  list: (params?: { tag?: string; subjectId?: string }) => {
    const qs = params
      ? '?' + new URLSearchParams(Object.fromEntries(
          Object.entries(params).filter(([, v]) => v != null) as [string, string][]
        )).toString()
      : '';
    return apiFetch<Cheatsheet[]>(`/api/cheatsheets${qs}`);
  },

  /** Fetch a single cheat sheet by slug */
  detail: (slug: string) => apiFetch<Cheatsheet>(`/api/cheatsheets/${slug}`),

  /** Create a new cheat sheet (admin only) */
  create: (payload: CreateCheatsheetPayload) =>
    apiFetch<Cheatsheet>('/api/cheatsheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),

  /** Update a cheat sheet (admin only) */
  update: (id: string, payload: UpdateCheatsheetPayload) =>
    apiFetch<Cheatsheet>(`/api/cheatsheets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),

  /** Delete a cheat sheet (admin only) */
  delete: (id: string) =>
    apiFetch<{ ok: boolean }>(`/api/cheatsheets/${id}`, { method: 'DELETE' }),
};
