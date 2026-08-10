# Architecture

## 1. Stack summary

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router) + TypeScript |
| Auth | BetterAuth (email + password, MongoDB adapter) |
| Database | MongoDB Atlas (M0 free tier for dev, M10 optional for prod) |
| ODM | Mongoose |
| API | Next.js Route Handlers under `app/api/**` |
| Client data | TanStack Query v5 with `persistQueryClient` + `localStorage` |
| Markdown edit | `@uiw/react-md-editor` (edit + preview toggle built in) |
| Markdown read | `react-markdown` + `remark-gfm` + `rehype-sanitize` |
| Styling | Tailwind CSS + shadcn/ui |
| Charts | Recharts |
| Email | Resend + React Email templates |
| Validation | Zod schemas shared between route handler and client form |
| Hosting | Vercel (Node runtime for `/api/**`; Edge not used because Mongoose needs Node) |

The stack is locked. This doc describes how the pieces sit together.

## 2. High-level shape

```
                 ┌──────────────────────────┐
                 │      Browser (React)     │
                 │  shadcn/ui + Tailwind    │
                 │  TanStack Query cache    │
                 │  Recharts (dashboard)    │
                 └────────────┬─────────────┘
                              │  fetch(/api/*)
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
2. Route handler runs `withAuth` (returns 401 on miss) or `withRole('admin')` for admin routes.
3. Payload parses through a Zod schema shared with the client form.
4. Service function talks to Mongoose. Every mutating service also appends an ActivityLog row.

## 3. The trackable-entity pattern

Three sections share the same "problem row" shape: Pattern DSA, Non-standard DSA, Competitive Programming. One `Problem` collection uses Mongoose discriminators keyed by `kind`.

```ts
Problem (base)
├── PatternProblem       { pattern: string }
├── NonStandardProblem   { bucket: string }
└── CpProblem            { platform: string, contest?: string, rating?: number }
```

Base fields: `userId`, `title`, `url`, `difficulty`, `completed`, `notes`, `tags`, `createdAt`, `updatedAt`. All three surface through one `/api/problems` route with `kind` as a required filter or body field.

`Subject` and `AdvancedTopicGroup` are two flavors of one `Group` entity discriminated by `kind`. A `Topic` belongs to any Group by ObjectId. Interview questions attach to a Subject.

Result: five effective entities behind seven user-facing content sections, plus three system entities (User, Taxonomy, Activity, Invite).

## 4. Shared taxonomies

Pattern names, non-standard buckets, CP platforms, subject names, advanced-group names, and difficulty tiers were previously seed constants. They now live in one `Taxonomy` collection keyed by `kind`:

```
Taxonomy {
  kind: "pattern" | "bucket" | "platform" | "subject" | "advanced" | "difficulty",
  name: string,
  slug: string,
  order: number,
  archived: boolean
}
```

Every write path validates the referenced taxonomy value exists and is not archived. Admin panel edits the collection; regular users see the values as read-only chips or dropdowns.

## 5. Role-based route gate

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

## 6. Activity logging

A single service helper writes activity rows. Every mutating service function calls it after the write commits:

```ts
await recordActivity({
  actorId, targetUserId, kind: "problem.completed",
  entity: { type: "problem", id: problem._id, title: problem.title },
  metadata: { difficulty: problem.difficulty, pattern: problem.pattern }
});
```

`kind` values are enumerated in admin.md. `targetUserId` matters when an admin edits another user's content — the row shows both actor and target.

Activity is queried three ways:
- `/api/activity?scope=me` → user dashboard feed
- `/api/dashboard/stats?userId=me` → aggregated stats + heatmap
- `/api/admin/activity` → cross-user feed (admin only)

## 7. Folder structure

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
│  │     ├─ layout.tsx                # withRole gate on server component
│  │     ├─ page.tsx                  # users list
│  │     ├─ users/[id]/page.tsx       # user detail + read-only dashboard
│  │     ├─ invites/page.tsx
│  │     ├─ content/
│  │     │  ├─ problems/page.tsx
│  │     │  ├─ topics/page.tsx
│  │     │  ├─ cheatsheets/page.tsx
│  │     │  └─ questions/page.tsx
│  │     ├─ taxonomies/page.tsx
│  │     └─ activity/page.tsx
│  └─ api/
│     ├─ auth/[...all]/route.ts
│     ├─ problems/... (as before)
│     ├─ topics/... (as before)
│     ├─ groups/... (as before)
│     ├─ cheatsheets/... (as before)
│     ├─ questions/... (as before)
│     ├─ tags/route.ts
│     ├─ search/route.ts
│     ├─ activity/route.ts
│     ├─ dashboard/stats/route.ts
│     ├─ invites/[token]/route.ts     # public GET/POST for accept
│     └─ admin/
│        ├─ users/route.ts
│        ├─ users/[id]/route.ts
│        ├─ users/[id]/role/route.ts
│        ├─ invites/route.ts
│        ├─ invites/[id]/route.ts
│        ├─ taxonomies/route.ts
│        ├─ taxonomies/[id]/route.ts
│        ├─ activity/route.ts
│        └─ export/route.ts
├─ components/
│  ├─ ui/
│  ├─ markdown/{Editor.tsx,View.tsx}
│  ├─ problem/{ProblemRow.tsx,ProblemTable.tsx,NotesDrawer.tsx}
│  ├─ dashboard/
│  │  ├─ CompletionTrend.tsx          # Recharts LineChart
│  │  ├─ GroupProgress.tsx            # Recharts BarChart
│  │  ├─ DifficultyMix.tsx            # Recharts stacked bar
│  │  ├─ ActivityHeatmap.tsx          # custom SVG
│  │  └─ ActivityFeed.tsx
│  ├─ admin/
│  │  ├─ UsersTable.tsx
│  │  ├─ TaxonomyEditor.tsx
│  │  ├─ InviteForm.tsx
│  │  └─ ContentTable.tsx
│  └─ layout/Sidebar.tsx
├─ emails/                            # React Email templates
│  ├─ Invite.tsx
│  └─ PasswordReset.tsx
├─ lib/
│  ├─ auth.ts                         # withAuth, withRole, BetterAuth config
│  ├─ db.ts
│  ├─ query.ts
│  ├─ email.ts                        # Resend client + render helpers
│  ├─ activity.ts                     # recordActivity
│  ├─ zod/
│  ├─ services/
│  └─ markdown/sanitize.ts
├─ models/
│  ├─ user.ts                         # extends BetterAuth with role field
│  ├─ group.ts
│  ├─ topic.ts
│  ├─ problem.ts
│  ├─ question.ts
│  ├─ cheatsheet.ts
│  ├─ taxonomy.ts
│  ├─ activity.ts
│  └─ invite.ts
├─ scripts/
│  ├─ seed.ts
│  ├─ export.ts
│  └─ promote-admin.ts                # emergency escape hatch
├─ docs/
├─ tailwind.config.ts
├─ next.config.js
├─ tsconfig.json
└─ package.json
```

## 8. Markdown edit / preview toggle

- `components/markdown/Editor.tsx` wraps `@uiw/react-md-editor`, sets `preview="edit"` by default, exposes a toolbar toggle.
- Preview HTML goes through the shared `View.tsx` render (`react-markdown` + `remark-gfm` + `rehype-sanitize`) so write-mode preview and read-only page produce identical HTML.
- Auto-save fires 800ms after the last keystroke. Optimistic update on the notes field; rollback on error.

## 9. Sanitization schema

Default `rehype-sanitize` schema plus `className` on `code`/`span` for syntax highlighting, plus `target="_blank"` and `rel="noopener noreferrer nofollow"` on links. Reject `iframe`, `object`, `embed`, `style`, `link`, `form`, `input`, `button`. Details in security.md.

## 10. State + cache

- TanStack Query owns server state.
- Query key conventions: `["problems", { kind, group }]`, `["dashboard", userId]`, `["admin", "users"]`.
- Persist to `localStorage` under a versioned key.
- Optimistic updates on completion toggle and note edit.
- Admin pages call the same hooks with `userId` param overrides.

## 11. Search

- MongoDB text index across `Problem.title/notes`, `Topic.title/body`, `CheatSheet.title/body`, `Question.question/answer`.
- `/api/search?q=...` runs parallel queries per collection, merges by `$meta: "textScore"`.
- User search is scoped to their own userId; admin search adds a `?scope=all` flag that lifts the scope.

## 12. Email

- Resend SDK client in `lib/email.ts` reads `RESEND_API_KEY`.
- Templates live in `/emails` as React Email components. Render to HTML at send time via `@react-email/render`.
- Two templates in v1: `Invite.tsx` (invite link with 7-day expiry), `PasswordReset.tsx` (reserved; admin-triggered).
- `From` uses `EMAIL_FROM` env — a verified sender on the domain.
- Send failures do not roll back the invite record; a background retry job is out of scope for v1, so the admin sees a "resend" button on any invite older than 5 minutes with no accept.

## 13. Testing posture

Do write:
- Zod schema tests for every API contract.
- One integration test per route handler using `mongodb-memory-server`.
- Snapshot test for the sanitizer on a fixture Markdown file with hostile inputs.
- One E2E flow: admin invite → user accepts → user marks problem complete → admin sees the update in the user's dashboard.
- Role gate tests: hitting `/api/admin/*` as a `user` returns 403.

Do not write:
- Component snapshot tests for shadcn primitives.
- Unit tests for straightforward Mongoose CRUD.
- Visual regression tests.

Tools: Vitest + `mongodb-memory-server` + Playwright.
