# Architecture

## 1. Stack Summary

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) + TypeScript |
| Middleware | `proxy.ts` (Next.js request interceptor for auth & Edge Redis rate limiting) |
| Auth | BetterAuth (email + password, MongoDB adapter, database rate limiting) |
| Database | MongoDB Atlas (M0 free tier with pool size = 3, M10 optional for prod) |
| ODM | Mongoose 9 |
| Cache & Rate Limiting | Upstash Redis (`lib/cache.ts`, `lib/rate-limit.ts`, `proxy.ts`) |
| Async Queue | Upstash QStash (`lib/qstash.ts`, `app/api/workers/email/route.ts`) |
| API | Next.js Route Handlers under `app/api/**` + Typed Services in `lib/api/**` |
| Client data | TanStack Query v5 with `queryOptions()` (`lib/queries/**`) & `STALE_TIMES` |
| Domain Types | Centralized interfaces under `types/**` |
| Markdown edit | `@uiw/react-md-editor` (edit + preview toggle built in) |
| Markdown read | `react-markdown` + `remark-gfm` + `rehype-sanitize` |
| Styling | Tailwind CSS v4 + Base UI / shadcn |
| Charts | Recharts (lazy loaded via `next/dynamic`) |
| Telemetry | OpenTelemetry (`instrumentation.ts` + `docker-compose.telemetry.yml`) |
| Email | Resend + React Email templates (`emails/*`) dispatched asynchronously via QStash |
| Validation | Zod schemas shared between route handler and client forms |
| Hosting | Vercel (Node runtime for `/api/**`, Edge runtime for `proxy.ts`) |

## 2. High-Level Shape

```
                 ┌──────────────────────────┐
                 │      Browser (React)     │
                 │   shadcn / Base UI       │
                 │  TanStack Query v5       │
                 │  (queryOptions & types)  │
                 └────────────┬─────────────┘
                              │  fetch(/api/*)
                 ┌────────────▼─────────────┐
                 │        proxy.ts          │
                 │  Redis Rate Limit + Auth │
                 └────────────┬─────────────┘
                              │
                 ┌────────────▼─────────────┐
                 │  Next.js Route Handlers  │
                 │  Zod → withAuth/withRole │
                 │  after() → Activity Log  │
                 └────┬───────────┬─────────┘
                      │ Mongoose  │ Redis cache  ┌────────────────┐
         ┌────────────▼───┐   ┌───▼──────────┐   │ Upstash QStash │
         │ MongoDB Atlas  │   │ Upstash      │   └───────┬────────┘
         │ (M0 pool = 3)  │   │ Redis        │           │ POST
         └────────────────┘   └──────────────┘   ┌───────▼────────┐
                                                 │ /workers/email │
                                                 └───────┬────────┘
                                                         │
                                                 ┌───────▼────────┐
                                                 │  Resend API    │
                                                 └────────────────┘
```

Every request path:
1. Client component calls a typed API service (`lib/api/*`) wrapped in a centralized `queryOptions()` hook (`lib/queries/*`).
2. `proxy.ts` middleware intercepts incoming requests to enforce Edge Redis rate limits and protected route access.
3. Route handler runs `withAuth` (returns 401 on miss) or `withRole('admin')` for admin routes.
4. Payload parses through a Zod schema shared with the client form.
5. Service function checks Upstash Redis cache (`lib/cache.ts`). On cache miss, it queries MongoDB and caches the result.
6. Mutating routes schedule background activity writes via Next.js 16 `after()` (non-blocking).
7. Email triggers enqueue a job to Upstash QStash (async with up to 3 retries and signature verification).

## 3. The Trackable-Entity Pattern

Three sections share the same "problem row" shape: Pattern DSA, Non-standard DSA, Competitive Programming. One `Problem` collection uses Mongoose discriminators keyed by `kind`.

```ts
Problem (base)
├── PatternProblem       { pattern: string, variation?: string }
├── NonStandardProblem   { bucket: string }
└── CpProblem            { platform?: string, contest?: string, rating?: number }
```

Base fields: `userId`, `title`, `url`, `difficulty`, `completed`, `notes`, `tags`, `createdAt`, `updatedAt`. All three surface through `/api/problems` routes with `kind` as a required filter or body field.

Additionally, user problem completion state and per-problem notes are stored in the `UserProgress` collection (`userId`, `problemId`, `completed`, `completedAt`, `userNotes`, `revision`).

`Subject` and `AdvancedTopicGroup` are two flavors of one `Group` entity discriminated by `kind`. A `Topic` belongs to any Group by ObjectId. Interview questions attach to a Subject.

## 4. Shared Taxonomies

Pattern names, non-standard buckets, CP platforms, subject names, advanced-group names, and difficulty tiers live in one `Taxonomy` collection keyed by `kind`:

```ts
Taxonomy {
  kind: "pattern" | "bucket" | "platform" | "subject" | "advanced" | "difficulty",
  name: string,
  slug: string,
  order: number,
  archived: boolean
}
```

Every write path validates the referenced taxonomy value exists and is not archived. Admin panel edits the collection; regular users see the values as read-only chips or dropdowns.

## 5. Role-Based Route Gate

Two helpers in `lib/auth.ts`:

```ts
export async function withAuth<T>(
  req: Request,
  fn: (ctx: { userId: string; role: "admin" | "user" }) => Promise<T>,
) { /* returns 401 on miss */ }

export async function withRole<T>(
  req: Request,
  role: "admin",
  fn: (ctx: { userId: string; role: "admin" }) => Promise<T>,
) { /* returns 401 on miss, 403 on wrong role */ }
```

Every service function that reads or writes another user's data takes `actorRole` and enforces the rule: `if (actorRole !== "admin" && targetUserId !== actorUserId) throw 403`.

## 6. Activity Logging & Post-Response `after()`

A single service helper logs activity rows. Every mutating service function invokes it, which wraps the DB write in Next.js 16 `after()` to ensure zero impact on HTTP response latency:

```ts
recordActivity({
  actorId,
  targetUserId,
  kind: "problem.completed",
  entity: { type: "problem", id: problem._id, title: problem.title },
  metadata: { difficulty: problem.difficulty, pattern: problem.pattern }
});
```

Activity is queried three ways:
- `/api/activity?scope=me` → user dashboard feed
- `/api/dashboard/stats?userId=me` → aggregated stats + heatmap
- `/api/admin/activity` → cross-user feed (admin only)

## 7. Folder Structure

```
/
├─ app/
│  ├─ (auth)/
│  │  ├─ sign-in/page.tsx
│  │  └─ invite/[token]/page.tsx      # invite acceptance
│  ├─ (app)/
│  │  ├─ layout.tsx                   # Server Component layout (RSC auth check)
│  │  ├─ dashboard/page.tsx           # user dashboard (lazy loaded charts)
│  │  ├─ dsa/[pattern]/page.tsx
│  │  ├─ non-standard/page.tsx
│  │  ├─ cp/[platform]/page.tsx
│  │  ├─ subjects/[subject]/[topic]/page.tsx
│  │  ├─ advanced/[group]/[topic]/page.tsx
│  │  ├─ interview/[subject]/page.tsx
│  │  ├─ cheatsheets/[slug]/page.tsx
│  │  └─ search/page.tsx
│  ├─ (admin)/
│  │  └─ admin/
│  │     ├─ layout.tsx                # role gate on client component
│  │     ├─ page.tsx                  # users list
│  │     ├─ users/[id]/page.tsx       # user detail + read-only dashboard
│  │     ├─ invites/page.tsx
│  │     ├─ content/
│  │     ├─ taxonomies/page.tsx
│  │     ├─ activity/page.tsx
│  │     └─ settings/page.tsx
│  └─ api/
│     ├─ auth/[...all]/route.ts
│     ├─ workers/email/route.ts       # QStash background worker
│     ├─ problems/...
│     ├─ topics/...
│     ├─ groups/...
│     ├─ cheatsheets/...
│     ├─ stats/route.ts               # cached aggregation
│     └─ admin/...
├─ components/
│  ├─ cheatsheets/                    # Cheatsheet UI presentational components
│  ├─ dashboard/                      # Recharts components, heatmaps, activity feed
│  ├─ markdown/                     # Markdown editor and viewer
│  ├─ problem/                      # Problem tables and note drawer
│  ├─ shell/                        # AppShell navigation frame
│  └─ ui/                           # Base UI & Shadcn primitives
├─ hooks/                           # Reusable React hooks (useDebounce)
├─ types/                           # Centralized TypeScript domain interfaces
├─ emails/                          # React Email templates
├─ lib/
│  ├─ api/                          # Typed API services (problems, cheatsheets, dashboard)
│  ├─ queries/                      # TanStack Query v5 queryOptions factories
│  ├─ activity.ts                   # recordActivity (wrapped in after())
│  ├─ auth.ts                       # Better Auth config
│  ├─ cache.ts                      # Upstash Redis caching wrapper
│  ├─ db.ts                         # Mongoose connection with pool size cap
│  ├─ email.ts                      # Resend email dispatcher
│  ├─ qstash.ts                     # QStash async job queue client
│  ├─ query-keys.ts                 # Query key factory & STALE_TIMES
│  └─ rate-limit.ts                 # Redis sliding window rate limiter
├─ models/                          # Mongoose Schemas
├─ scripts/                         # CLI utilities & seeders
├─ proxy.ts                         # Next.js Edge Middleware
├─ instrumentation.ts               # OpenTelemetry
├─ docs/                            # System Documentation
├─ next.config.mjs
├─ tsconfig.json
└─ package.json
```

## 8. Observability & Telemetry

- **OpenTelemetry**: Initialized in `instrumentation.ts` to capture system traces and performance metrics.
- **Grafana & Prometheus**: Configured via `docker-compose.telemetry.yml` and provisioned files in `grafana/` for metric visualization.

## 9. State + Cache

- **TanStack Query v5**: Owns server state using centralized `queryOptions()` (`lib/queries/*`).
- **Redis Cache Layer**: `withCache()` in `lib/cache.ts` transparently caches heavy DB query aggregations.
- **Optimistic UI Updates**: Instant checkbox toggling and note saves via mutation `onMutate`.

## 10. Email & Background Jobs

- **QStash Queue**: `enqueueEmail()` in `lib/qstash.ts` publishes jobs to Upstash QStash (3 retries).
- **Worker Verification**: `app/api/workers/email/route.ts` verifies `upstash-signature` headers.
- **Resend SDK**: Renders React Email templates (`Invite.tsx`, `WelcomeConfirmation.tsx`, etc.) to HTML.
