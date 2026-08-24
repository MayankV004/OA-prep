/**
 * Centralized TanStack Query key factory.
 *
 * Use these instead of inline string arrays so that:
 *  1. TypeScript catches key typos at compile time
 *  2. Cache invalidation is reliable — one rename updates all usages
 *  3. Key shape is visible at a glance
 *
 * Usage:
 *   queryKey: queryKeys.cheatsheets.all()
 *   queryClient.invalidateQueries({ queryKey: queryKeys.cheatsheets.all() })
 */
export const queryKeys = {
  // ── Public / shared data ──────────────────────────────────────────────────
  stats: {
    /** Landing page stats — patternCount, variationCount, problemCount */
    global: () => ['stats', 'global'] as const,
  },

  // ── Cheatsheets ───────────────────────────────────────────────────────────
  cheatsheets: {
    all: () => ['cheatsheets'] as const,
    detail: (slug: string) => ['cheatsheets', slug] as const,
  },

  // ── Topics ────────────────────────────────────────────────────────────────
  topics: {
    all: () => ['topics'] as const,
    detail: (id: string) => ['topics', id] as const,
  },

  // ── Problems (per-user, per-kind) ─────────────────────────────────────────
  problems: {
    list: (kind: string, filters?: Record<string, string | undefined>) =>
      ['problems', kind, filters ?? {}] as const,
    detail: (id: string) => ['problems', 'detail', id] as const,
  },

  // ── Progress ──────────────────────────────────────────────────────────────
  progress: {
    /** Per-kind completion stats (total vs completed per group) */
    stats: (kind: string) => ['progress', 'stats', kind] as const,
    /** Set of completed problem IDs for a given kind */
    ids: (kind: string) => ['progress', 'ids', kind] as const,
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  dashboard: {
    stats: (userId: string) => ['dashboard', 'stats', userId] as const,
  },

  // ── Patterns / Taxonomy (admin-seeded, rarely changes) ───────────────────
  patterns: {
    all: () => ['patterns'] as const,
  },
  taxonomies: {
    all: () => ['taxonomies'] as const,
    byKind: (kind: string) => ['taxonomies', kind] as const,
  },

  // ── Admin ─────────────────────────────────────────────────────────────────
  admin: {
    users: () => ['admin', 'users'] as const,
    invites: () => ['admin', 'invites'] as const,
    activity: () => ['admin', 'activity'] as const,
    metrics: () => ['admin', 'metrics'] as const,
  },
} as const;

/**
 * Per-query staleTime values (milliseconds).
 * Import and use inline: staleTime: STALE_TIMES.cheatsheets
 */
export const STALE_TIMES = {
  /** Data that almost never changes (admin-seeded) */
  static: 10 * 60 * 1000,     // 10 minutes
  /** Shared content that changes occasionally */
  shared: 5 * 60 * 1000,      // 5 minutes
  /** User data that changes when user interacts */
  userSlow: 2 * 60 * 1000,    // 2 minutes
  /** User data the user may have just mutated */
  userFast: 30 * 1000,        // 30 seconds
  /** Always re-fetch (sessions, critical state) */
  realtime: 0,
} as const;
