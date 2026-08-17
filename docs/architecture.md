# Architecture

## 1. Stack Summary

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) + TypeScript |
| Middleware | `proxy.ts` (Next.js request interceptor for auth & rate limiting) |
| Auth | BetterAuth (email + password, MongoDB adapter) |
| Database | MongoDB Atlas (M0 free tier for dev, M10 optional for prod) |
| ODM | Mongoose 9 |
| API | Next.js Route Handlers under `app/api/**` |
| Client data | TanStack Query v5 with `persistQueryClient` + `localStorage` |
| Markdown edit | `@uiw/react-md-editor` (edit + preview toggle built in) |
| Markdown read | `react-markdown` + `remark-gfm` + `rehype-sanitize` |
| Styling | Tailwind CSS v4 + Base UI / shadcn |
| Charts | Recharts |
| Telemetry | OpenTelemetry (`instrumentation.ts` + `docker-compose.telemetry.yml`) |
| Email | Resend + React Email templates (`emails/Invite.tsx`) |
| Validation | Zod schemas shared between route handler and client forms |
| Hosting | Vercel (Node runtime for `/api/**`) |

## 2. High-Level Shape

```
                 ┌──────────────────────────┐
                 │      Browser (React)     │
                 │   shadcn / Base UI       │
                 │  TanStack Query cache    │
                 │  Recharts (dashboard)    │
                 └────────────┬─────────────┘
                              │  fetch(/api/*)
                 ┌────────────▼─────────────┐
                 │        proxy.ts          │
                 │  Rate Limiting + Auth    │
                 └────────────┬─────────────┘
                              │
                 ┌────────────▼─────────────┐
                 │  Next.js Route Handlers  │
                 │  Zod → withAuth/withRole │
                 │  service → activity log  │
                 └────────────┬─────────────┘
                              │  Mongoose        ┌──────────┐
                 ┌────────────▼─────────────┐   │  Resend  │
                 │      MongoDB Atlas       │   │  (email) │
                 │  Collections + indexes   │   └────▲─────┘
                 └──────────────────────────┘        │
                                                     │ invites
                               ┌──────────────────────┘
                               │
                      Invite route handler
```

Every request path:
1. Client component calls a typed `fetch` helper wrapped in a TanStack Query hook.
2. `proxy.ts` middleware intercepts incoming requests to enforce rate limits and protected route access.
3. Route handler runs `withAuth` (returns 401 on miss) or `withRole('admin')` for admin routes.
4. Payload parses through a Zod schema shared with the client form.
5. Service function talks to Mongoose. Every mutating service also appends an `ActivityLog` row.

## 3. The Trackable-Entity Pattern

Three sections share the same "problem row" shape: Pattern DSA, Non-standard DSA, Competitive Programming. One `Problem` collection uses Mongoose discriminators keyed by `kind`.

```ts
Problem (base)
├── PatternProblem       { pattern: string, variation?: string }
├── NonStandardProblem   { bucket: string }
└── CpProblem            { platform?: string, contest?: string, rating?: number }
```

Base fields: `userId`, `title`, `url`, `difficulty`, `completed`, `notes`, `tags`, `createdAt`, `updatedAt`. All three surface through `/api/problems` routes with `kind` as a required filter or body field.

Additionally, user problem completion state and per-problem notes can be stored in the `UserProgress` collection (`userId`, `problemId`, `completed`, `completedAt`, `userNotes`, `revision`).

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

## 6. Activity Logging

A single service helper writes activity rows. Every mutating service function calls it after the write commits:

```ts
await recordActivity({
  actorId, targetUserId, kind: "problem.completed",
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
│  │  ├─ layout.tsx
│  │  ├─ dashboard/page.tsx           # user dashboard
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
│  │     ├─ layout.tsx                # role gate on server component
│  │     ├─ page.tsx                  # users list
│  │     ├─ users/[id]/page.tsx       # user detail + read-only dashboard
│  │     ├─ invites/page.tsx
│  │     ├─ content/
│  │     │  ├─ problems/page.tsx
│  │     │  ├─ topics/page.tsx
│  │     │  ├─ cheatsheets/page.tsx
│  │     │  └─ questions/page.tsx
│  │     ├─ taxonomies/page.tsx
│  │     ├─ activity/page.tsx
│  │     └─ settings/page.tsx
│  └─ api/
│     ├─ auth/[...all]/route.ts
│     ├─ problems/...
│     ├─ topics/...
│     ├─ groups/...
│     ├─ cheatsheets/...
│     ├─ questions/...
│     ├─ tags/route.ts
│     ├─ search/route.ts
│     ├─ activity/route.ts
│     ├─ dashboard/stats/route.ts
│     └─ admin/
│        ├─ users/route.ts
│        ├─ invites/route.ts
│        ├─ taxonomies/route.ts
│        ├─ settings/route.ts
│        └─ activity/route.ts
├─ components/
│  ├─ ui/
│  ├─ markdown/{Editor.tsx,View.tsx}
│  ├─ problem/
│  ├─ dashboard/
│  ├─ admin/
│  └─ shell/AppShell.tsx
├─ emails/                            # React Email templates
│  └─ Invite.tsx
├─ grafana/                           # Grafana & Prometheus config
├─ lib/
│  ├─ auth.ts                         # withAuth, withRole, BetterAuth config
│  ├─ auth-client.ts                  # BetterAuth React client
│  ├─ db.ts                           # Mongoose cached connection
│  ├─ email.ts                        # Resend client + render helpers
│  ├─ activity.ts                     # recordActivity
│  └─ zod/
├─ models/
│  ├─ user.ts
│  ├─ group.ts
│  ├─ topic.ts
│  ├─ problem.ts
│  ├─ pattern.ts                      # DSA Pattern + Variations schema
│  ├─ progress.ts                     # UserProgress schema
│  ├─ question.ts
│  ├─ cheatsheet.ts
│  ├─ taxonomy.ts
│  ├─ activity.ts
│  └─ invite.ts
├─ scripts/
│  ├─ seed-mongo-patterns.ts
│  ├─ seed-advanced-topics.ts
│  ├─ promote-admin.ts
│  └─ flush_data.ts
├─ proxy.ts                           # Next.js middleware
├─ instrumentation.ts                 # OpenTelemetry
├─ docs/
├─ next.config.mjs
├─ tsconfig.json
└─ package.json
```

## 8. Observability & Telemetry

- **OpenTelemetry**: Initialized in `instrumentation.ts` to capture system traces and performance metrics.
- **Grafana & Prometheus**: Configured via `docker-compose.telemetry.yml` and provisioned files in `grafana/` for metric visualization.

## 9. State + Cache

- TanStack Query v5 owns server state.
- Query key conventions: `["problems", { kind, group }]`, `["dashboard", userId]`, `["admin", "users"]`.
- Persist to `localStorage` under a versioned key via `persistQueryClient`.
- Optimistic updates on completion toggle and note edits.

## 10. Email

- Resend SDK client in `lib/email.ts` reads `RESEND_API_KEY`.
- Templates live in `/emails` as React Email components (`Invite.tsx`). Rendered to HTML at send time.
- `From` header uses `EMAIL_FROM` env var.
