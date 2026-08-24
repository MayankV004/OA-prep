# Scalable Architecture Plan — BigO (2000 DAU Target)

> Full audit performed on the live codebase. Every finding references a real file.
> **Constraint:** MongoDB Atlas M0 (free tier) — architecture is designed around this limit.

---

## 1. Load Model

| Signal | Value | Reasoning |
|---|---|---|
| Target DAU | 2,000 | Stated target |
| Estimated peak concurrent | ~120–200 | ~8–10% of DAU online simultaneously |
| Avg API requests / concurrent user / min | ~4–6 | Dashboard + problem fetch + progress sync |
| Peak API req/min | ~600–1200 | Conservative burst estimate |
| Peak MongoDB queries/min | ~2,000–5,000 | 2–4 queries per API request |
| Email sends/day | ~50–150 | Invite-based user growth |

**Verdict:** 2000 DAU is achievable on M0 **only if you cache aggressively**. M0's hard limits are the binding constraint — not CPU or memory. Redis caching is not optional at this scale with M0; it is what keeps you under M0's connection and throughput ceilings.

---

## 2. Architecture — Current State vs Target State

### Current (as-built)

```
Browser (React / TanStack Query)
    │
    ▼
proxy.ts  ─── in-memory rate limiter (broken on serverless)
    │
    ▼
Next.js Route Handlers (Vercel serverless functions)
    │                       │
    ▼                       ▼
MongoDB Atlas M0        Resend API (blocking — holds up response)
(shared, ~500 conn cap, every lambda cold start = new connection)
```

### Target (after this plan)

```
Browser (React / TanStack Query + per-query staleTime)
    │
    ▼
proxy.ts ─── Upstash Redis rate limiter (shared across all lambdas)
    │
    ▼
Next.js Route Handlers (Vercel)
    │         │               │
    ▼         ▼               ▼
Upstash    MongoDB Atlas M0  QStash job queue
Redis      (pool=3, most req    │
(cache)     served from cache)  │
(cache)                        ▼
                           /api/workers/email
                               │
                               ▼
                           Resend API
                    (async, 3 retries, not blocking)
```

---

## 3. Fixes — Priority Ordered

---

### 🔴 P0 — Critical Correctness Bugs (Fix Before Production)

#### 3.1 In-Memory Rate Limiter is Broken on Vercel

**File:** [`lib/rate-limit.ts`](./lib/rate-limit.ts) · **File:** [`lib/auth.ts`](./lib/auth.ts#L13)

The `store = new Map()` in `rate-limit.ts` and `storage: 'memory'` in `auth.ts` are **per-process**. On Vercel, every cold Lambda gets a fresh process. The same user can be rate-limited on Lambda A but unlimited on Lambda B. Rate limiting provides zero protection.

**Fix:** Replace with Upstash Redis.

```typescript
// lib/rate-limit.ts — new implementation
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv(); // UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN

export async function checkRateLimit(
  req: Request,
  options: { key: string; max: number; windowMs: number }
) {
  const ip = getClientIp(req);
  const redisKey = `rl:${options.key}:${ip}`;
  const count = await redis.incr(redisKey);
  if (count === 1) await redis.pexpire(redisKey, options.windowMs);

  const success = count <= options.max;
  if (!success) {
    recordRateLimitExceeded(options.key, ip); // existing telemetry
  }
  return { success, remaining: Math.max(0, options.max - count) };
}
```

Also update `lib/auth.ts` better-auth config:
```typescript
rateLimit: {
  storage: 'secondary-storage', // use Redis adapter
}
```

**Cost:** Upstash Redis free tier — 10,000 requests/day, no credit card required.

---

#### 3.2 `/api/stats` Full Document Scan on Every Landing Page Hit

**File:** [`app/api/stats/route.ts`](./app/api/stats/route.ts)

Every unauthenticated visitor (including web crawlers) triggers a full `Pattern.find()` that loads all pattern documents into Node.js memory, then traverses nested arrays manually. This query runs with **no index**, loads **all docs**, and is **not cached**.

**Fix — Part A:** Replace with a MongoDB `$aggregate` pipeline (single DB round-trip, no memory allocation):

```typescript
const [result] = await Pattern.aggregate([
  {
    $group: {
      _id: null,
      patternCount: { $sum: 1 },
      variationCount: { $sum: { $size: { $ifNull: ['$variations', []] } } },
      problemCount: {
        $sum: {
          $sum: {
            $map: {
              input: { $ifNull: ['$variations', []] },
              as: 'v',
              in: { $size: { $ifNull: ['$$v.problems', []] } },
            },
          },
        },
      },
    },
  },
]);
```

**Fix — Part B:** Cache the result in Redis for 10 minutes — this data changes only when an admin seeds content:

```typescript
const stats = await withCache('global:stats', 600, async () => {
  // aggregation above
});
```

---

#### 3.3 Dashboard Stats Load All Patterns Into Memory

**File:** [`app/api/dashboard/stats/route.ts`](./app/api/dashboard/stats/route.ts#L22-L38)

Same pattern as above — `Pattern.find().lean()` loads every pattern + variation + problem into Node.js memory to count completion. This runs on every dashboard load, **per authenticated user**.

**Fix:** Pre-compute the pattern→problem map via aggregation and cache the static map (it only changes when admin edits patterns):

```typescript
// Cache the global problem→difficulty map for 5 minutes (changes only on admin seed)
const problemDifficultyMap = await withCache('global:problemDifficultyMap', 300, async () => {
  const patterns = await Pattern.aggregate([
    { $unwind: '$variations' },
    { $unwind: '$variations.problems' },
    { $project: { _id: '$variations.problems._id', difficulty: '$variations.problems.difficulty' } }
  ]);
  return Object.fromEntries(patterns.map(p => [p._id.toString(), p.difficulty]));
});
```

---

### 🟡 P1 — High Value (This Sprint)

#### 3.4 Email Sending Blocks Request Lifecycle

**Files:** [`app/api/admin/invites/route.ts`](./app/api/admin/invites/route.ts#L42) · [`app/api/admin/invites/route.ts`](./app/api/admin/invites/route.ts#L60)

Both `sendInviteEmail(...)` calls are `await`ed synchronously. If Resend is slow or errors, the admin sees a timeout or failure — even though the invite was saved correctly.

**Fix:** Use **QStash** (Upstash's managed job queue) to enqueue email delivery and return immediately.

```
POST /api/admin/invites
  → validate + save to MongoDB         ← sync (user waits for this)
  → enqueue email job to QStash        ← ~10ms HTTP call
  → return 201 Created                 ← admin gets response fast

(QStash, async — up to 3 retries with backoff)
  → POST /api/workers/email
      → sendInviteEmail(...)
      → Resend delivers email
```

**New files to create:**
- `lib/qstash.ts` — QStash client + `enqueueEmail(job)` helper
- `app/api/workers/email/route.ts` — QStash callback endpoint with signature verification

**Modified:**
- `app/api/admin/invites/route.ts` — replace `await sendInviteEmail(...)` with `await enqueueEmail(...)`

**Dev fallback:** When `QSTASH_TOKEN` is not set, `enqueueEmail` falls back to `after(() => sendEmail())` (Next.js built-in post-response hook). Email still fires in dev — just without retry guarantees.

---

#### 3.5 MongoDB Connection Pool Not Configured

**File:** [`lib/db.ts`](./lib/db.ts#L26-L29)

The connection is opened with MongoDB's default pool (5 connections). At 100 concurrent users, queries queue behind each other. Simple fix — configure pool size for your workload.

```typescript
const opts = {
  bufferCommands: false,
  dbName: process.env.MONGODB_DB,
  maxPoolSize: 10,              // ← add
  minPoolSize: 2,               // ← add
  serverSelectionTimeoutMS: 5_000,
  socketTimeoutMS: 45_000,
};
```

**M0 Connection Reality Check**

M0 (free tier) has a hard cap of **500 connections shared across ALL free clusters on your account**. On Vercel, every Lambda cold start opens a fresh TCP connection to MongoDB. The `global.mongoose` pattern in `lib/db.ts` reuses connections within the same process, but under load you can have 50–100 concurrent Lambda processes.

**This is why Redis caching is non-negotiable with M0.** Every request served from Redis cache is a request that never touches MongoDB and never uses a connection slot.

Configure the pool conservatively:
```typescript
const opts = {
  bufferCommands: false,
  dbName: process.env.MONGODB_DB,
  maxPoolSize: 3,                  // ← keep low for M0 (not 10)
  minPoolSize: 1,
  serverSelectionTimeoutMS: 5_000,
  socketTimeoutMS: 45_000,
};
```

> **Note:** If you hit M0's limits consistently (connection errors, slow queries), the next step is M10 at $57/mo. That's the upgrade path — not a requirement today.

---

#### 3.6 Auth Layout is a Client Component (TTFB + Flash)

**File:** [`app/(app)/layout.tsx`](./app/(app)/layout.tsx)

The layout is marked `'use client'` to run `authClient.useSession()`. This means:
1. Server sends HTML with empty shell
2. JS hydrates
3. Session check fires
4. Loading spinner shows
5. Finally renders children

**Fix:** Move session check to Server Component. `better-auth` supports server-side session reads via `auth.api.getSession({ headers: await headers() })`.

```typescript
// app/(app)/layout.tsx — remove 'use client'
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/sign-in');
  if (!(session.user as any).emailVerified) redirect('/verify-email');
  
  const isAdmin = (session.user as any).role === 'admin';
  return <AppShell sections={APP_NAV} isAdmin={isAdmin} homeHref="/dashboard" idPrefix="app">
    {children}
  </AppShell>;
}
```

Benefits: No loading spinner, better TTFB, RSC streaming works for child pages.

---

#### 3.7 Activity Logging Blocks Mutations Inline

**File:** [`lib/activity.ts`](./lib/activity.ts#L16) · Called in: `app/api/problems/route.ts`, `app/api/admin/invites/route.ts`

`recordActivity()` does `await Activity.create(...)` inside the mutation handler. If the Activity write is slow, the user's problem creation is also slow. It already catches and swallows errors — good — but it still adds latency.

**Fix:** Wrap in `after()` for true fire-and-forget:

```typescript
// lib/activity.ts
import { after } from 'next/server';

export function recordActivity(args: RecordActivityArgs): void {
  after(async () => {
    try {
      await Activity.create({ ... });
    } catch (err) {
      console.error('Failed to record activity:', err);
    }
  });
}
// Note: remove `async` from signature — callers shouldn't await this
```

**Impact:** Every `POST /api/problems`, `PATCH /api/problems/[id]` etc. becomes faster by the Activity write latency (~30–80ms).

---

#### 3.8 HTTP Cache Headers Missing on Shared Endpoints

Several API routes serve data that's identical for all users (topics, cheatsheets, landing stats). Without `Cache-Control`, every request hits the DB.

Add to public/shared endpoints:
```typescript
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
  },
});
```

| Route | TTL | Reason |
|---|---|---|
| `GET /api/stats` | 600s | Changes only on admin seed |
| `GET /api/topics` (admin-curated) | 300s | Changes only on admin edit |
| `GET /api/cheatsheets` | 120s | Admin edits occasionally |

For per-user routes, explicitly set `Cache-Control: private, no-store` to prevent CDN caching.

---

### 🟢 P2 — Code Quality & Maintainability

#### 3.9 Centralize Query Keys

String literals like `['cheatsheets']`, `['problems']` scattered across component files. A typo silently breaks cache invalidation.

**Create `lib/query-keys.ts`:**
```typescript
export const queryKeys = {
  cheatsheets: {
    all: () => ['cheatsheets'] as const,
    detail: (slug: string) => ['cheatsheets', slug] as const,
  },
  problems: {
    list: (kind: string) => ['problems', kind] as const,
  },
  dashboard: {
    stats: (userId: string) => ['dashboard', 'stats', userId] as const,
  },
  stats: {
    global: () => ['stats', 'global'] as const,
  },
} as const;
```

#### 3.10 Extract API Fetchers to Service Layer

Direct `fetch('/api/...')` in components makes the code fragile. Extract to `lib/api/`:

```
lib/api/
  client.ts          ← base fetch with error normalization
  problems.ts        ← problemsApi.list(), .create(), .update()
  cheatsheets.ts     ← cheatsheetsApi.list(), .create()
  dashboard.ts       ← dashboardApi.getStats()
  stats.ts           ← statsApi.getGlobal()
```

#### 3.11 Tune TanStack Query `staleTime` Per Query

**File:** [`components/Providers.tsx`](./components/Providers.tsx#L15)

Global `staleTime: 60 * 1000` is too uniform.

| Data | Recommended staleTime | Reason |
|---|---|---|
| Session | `0` | Must always be fresh |
| Global stats | `10 * 60 * 1000` | Changes only on seed |
| Topic/Cheatsheet list | `5 * 60 * 1000` | Admin edits occasionally |
| User's problem list | `30 * 1000` | User may add one in another tab |
| Dashboard stats | `2 * 60 * 1000` | Changes on problem completion |

---

## 4. New Infrastructure Components

| Component | Service | Cost | Why |
|---|---|---|---|
| Distributed cache + rate limiter | Upstash Redis | Free tier (10k req/day), $10/mo beyond | Fixes rate limiting; **critical mitigation for M0 connection limits** |
| Async job queue with retries | Upstash QStash | Free tier (500 msg/day), $1/mo beyond | Decouples email from request lifecycle |
| MongoDB | Atlas M0 | **Free** | Kept as-is; Redis caching compensates for its limits |

**Total infrastructure addition: ~$0–$10/mo** at this scale with M0 + Upstash free tiers.

> **M0 Risk:** If Redis cache is unavailable (cold start, miss rate spike), M0 will feel the load. Monitor the MongoDB Atlas connection count metric in Atlas UI — if you regularly approach 400+ connections, that's the signal to upgrade to M10.

---

## 5. Redis Cache Helper

Create `lib/cache.ts` — used by all routes that benefit from caching:

```typescript
import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (process.env.UPSTASH_REDIS_REST_URL) {
    redis ??= Redis.fromEnv();
    return redis;
  }
  return null; // dev fallback: always miss cache
}

export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>
): Promise<T> {
  const r = getRedis();
  if (r) {
    const cached = await r.get<T>(key);
    if (cached !== null) return cached;
  }

  const fresh = await fn();

  if (r) {
    await r.set(key, fresh, { ex: ttlSeconds });
  }

  return fresh;
}

export async function invalidateCache(...keys: string[]): Promise<void> {
  const r = getRedis();
  if (r && keys.length > 0) await r.del(...keys);
}
```

When `UPSTASH_REDIS_REST_URL` is absent (dev), `withCache` transparently runs the function directly — no behavior change in development.

---

## 6. QStash Email Worker Design

### `lib/qstash.ts` — Client + job types

```typescript
import { Client } from '@upstash/qstash';
import { after } from 'next/server';
import * as email from '@/lib/email';

export type EmailJob =
  | { type: 'invite'; to: string; inviterName: string; role: string; token: string; expiresInHours: number }
  | { type: 'welcome'; to: string; userName: string }
  | { type: 'invite_accepted'; to: string; adminName: string; invitedEmail: string; invitedName?: string; role: string };

export async function enqueueEmail(job: EmailJob): Promise<void> {
  const token = process.env.QSTASH_TOKEN;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!token || token.startsWith('qstash_dummy')) {
    // Dev: fire-and-forget via after() — no retry, but email still sends
    after(() => dispatchEmail(job));
    return;
  }

  const client = new Client({ token });
  await client.publishJSON({
    url: `${appUrl}/api/workers/email`,
    body: job,
    retries: 3,
  });
}

export async function dispatchEmail(job: EmailJob): Promise<void> {
  if (job.type === 'invite') await email.sendInviteEmail(job);
  else if (job.type === 'welcome') await email.sendWelcomeEmail(job);
  else if (job.type === 'invite_accepted') await email.sendInviteAcceptedEmail(job);
}
```

### `app/api/workers/email/route.ts` — QStash callback

```typescript
import { Receiver } from '@upstash/qstash';
import { dispatchEmail, type EmailJob } from '@/lib/qstash';

export async function POST(req: Request) {
  const bodyText = await req.text();

  // Verify QStash signature in production
  if (process.env.QSTASH_CURRENT_SIGNING_KEY) {
    const receiver = new Receiver({
      currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
      nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
    });
    const isValid = await receiver
      .verify({ signature: req.headers.get('upstash-signature') ?? '', body: bodyText })
      .catch(() => false);

    if (!isValid) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const job: EmailJob = JSON.parse(bodyText);
  await dispatchEmail(job);
  return Response.json({ ok: true });
}
```

---

## 7. Database Index Audit

### Verified (from `models/problem.ts`)
- `{ userId: 1, kind: 1, pattern: 1 }` ✅
- `{ userId: 1, kind: 1, completed: 1 }` ✅
- `{ userId: 1, completedAt: -1 }` ✅ (dashboard trend query)
- `{ title: 'text', notes: 'text' }` ✅ (search)

### Add / Verify Missing

```typescript
// models/cheatsheet.ts
cheatsheetSchema.index({ slug: 1 }, { unique: true });  // used in detail page lookup
cheatsheetSchema.index({ tags: 1 });                     // used in tag filter

// models/activity.ts
activitySchema.index({ targetUserId: 1, createdAt: -1 }); // dashboard heatmap + feed
activitySchema.index({ actorId: 1, createdAt: -1 });       // admin activity feed

// models/progress.ts
progressSchema.index({ userId: 1, problemId: 1 }, { unique: true }); // join in problems route
progressSchema.index({ userId: 1, completed: 1 });                    // stats aggregation
```

Run this to check index usage in production:
```javascript
db.problems.aggregate([{ $indexStats: {} }])
db.activities.aggregate([{ $indexStats: {} }])
```

---

## 8. Folder Structure — After Changes

```
lib/
  api/
    client.ts          ← [NEW] base fetch wrapper
    problems.ts        ← [NEW] problemsApi
    cheatsheets.ts     ← [NEW] cheatsheetsApi
    dashboard.ts       ← [NEW] dashboardApi
  cache.ts             ← [NEW] withCache / invalidateCache
  qstash.ts            ← [NEW] enqueueEmail / dispatchEmail
  rate-limit.ts        ← [MODIFY] swap Map for Redis
  db.ts                ← [MODIFY] add maxPoolSize
  activity.ts          ← [MODIFY] wrap in after()
  query-keys.ts        ← [NEW] centralized query key factory

app/api/
  workers/
    email/route.ts     ← [NEW] QStash callback worker
  stats/route.ts       ← [MODIFY] aggregation + Redis cache
  dashboard/stats/route.ts ← [MODIFY] cache pattern map

app/(app)/layout.tsx   ← [MODIFY] convert to Server Component
```

---

## 9. Environment Variables — Full List After Changes

```env
# Existing
MONGODB_URI=
MONGODB_DB=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
NEXT_PUBLIC_APP_URL=
RESEND_API_KEY=
EMAIL_FROM=
EMAIL_REPLY_TO=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# New — Upstash Redis (rate limiting + caching)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# New — Upstash QStash (async email jobs)
QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=
```

All new variables are optional for local dev — code degrades gracefully (in-process fallback for cache, `after()` fallback for email queue).

---

## 10. Execution Roadmap

```
Sprint 1 — Correctness (1–2 days)
  ✦ Install @upstash/redis, @upstash/qstash
  ✦ Create lib/cache.ts
  ✦ Fix lib/rate-limit.ts → Redis
  ✦ Fix lib/auth.ts rate limit storage
  ✦ Fix /api/stats aggregation + cache
  ✦ Fix /api/dashboard/stats pattern map cache

Sprint 2 — Reliability (1 day)
  ✦ Create lib/qstash.ts
  ✦ Create app/api/workers/email/route.ts
  ✦ Update admin/invites/route.ts → enqueueEmail()
  ✦ Wrap recordActivity() in after()
  ✦ Add db pool config (maxPoolSize: 10)

Sprint 3 — Performance (1 day)
  ✦ Convert app/(app)/layout.tsx to Server Component
  ✦ Add Cache-Control headers to shared GET routes
  ✦ Add missing DB indexes
  ✦ Upgrade MongoDB Atlas M0 → M10

Sprint 4 — Code Quality (ongoing)
  ✦ Create lib/query-keys.ts
  ✦ Create lib/api/* service layer
  ✦ Tune per-query staleTime in TanStack Query
  ✦ Split large page components (Container/Presentational)
```

---

## 11. Scaling Beyond 2000 DAU

When/if you grow past this plan's target:

| Threshold | Next Step |
|---|---|
| 10k DAU | Add Next.js Edge Middleware for auth (eliminates cold starts on protected routes) |
| 50k DAU | MongoDB Atlas M30 + read replicas for dashboard queries |
| 100k DAU | Separate read-model service for heatmap/stats (materialized views updated by Change Streams) |
| 500k DAU | Full CQRS split — separate write DB from read replicas; Redis cluster |
