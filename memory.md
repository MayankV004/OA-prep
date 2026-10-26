# BigO Codebase Memory

> Living engineering memory for the BigO placement-preparation platform. Read this before making a cross-cutting change. Update the relevant section in the same change whenever code changes the architecture, data model, route contract, integration, workflow, or operational behavior.

## Memory contract

- **Last reviewed:** 2026-10-26
- **Repository:** `oa-prep` / product name `BigO`
- **Primary source of truth:** implementation under `app/`, `components/`, `lib/`, `models/`, `types/`, and `scripts/`. Treat older prose in `README.md` and `docs/` as supporting documentation and verify it against code.
- **Update rule:** every code change must also update this file when it changes a recorded fact. At minimum, refresh `Last reviewed` and add a short entry to the change log. Do not record credentials, tokens, personal data, or production dumps.
- **Useful companion docs:** [`README.md`](./README.md), [`docs/architecture.md`](./docs/architecture.md), [`docs/api.md`](./docs/api.md), [`docs/schema.md`](./docs/schema.md), [`docs/security.md`](./docs/security.md), and [`docs/setup.md`](./docs/setup.md).

## 1. Product and runtime shape

BigO is an invite-oriented technical interview preparation platform combining:

1. DSA pattern and variation tracking, including non-standard problems and revision scheduling.
2. Core CS subject notes and advanced/system-design content.
3. Interview flashcards with Leitner-style spaced repetition.
4. Online assessment simulation with Monaco, multi-language execution, hidden grading, and proctoring telemetry.
5. Competitive-programming profile synchronization and contest alerts.
6. Subscriptions, dynamic pricing, promo codes, Stripe checkout, and a development payment adapter.
7. Admin content, user, billing, feedback, taxonomy, runner, and proctoring operations.

The application is a Next.js 16 App Router project using React 19 and strict TypeScript. Route handlers live in `app/api/**`; reusable backend logic lives in `lib/**`; Mongoose models live in `models/**`; browser UI lives in `app/**` and `components/**`.

## 2. Request and authentication flow

### Browser page request

1. `proxy.ts` matches API requests and selected protected page prefixes.
2. For API requests, `proxy.ts` applies a shared Upstash Redis IP limit of 100 requests/minute when Redis is configured. Without Redis, this edge check is skipped.
3. The `(app)` server layout calls Better Auth and redirects unauthenticated, unverified, or disabled users before rendering protected app pages.
4. The admin layout (`app/(admin)/admin/layout.tsx`) uses `authClient.useSession()` and redirects non-admin users to `/dashboard`. The admin API remains protected independently.
5. The root layout installs `next-themes`, TanStack Query providers, toast UI, cookie consent, and analytics.

### API request

1. A route handler parses the request and normally enters `withAuth()` or `withRole(req, 'admin', ...)` from `lib/auth.ts`.
2. `withAuth()` obtains a cached Better Auth session, rejects missing sessions, disabled accounts, and unverified email, then supplies `{ userId, role }`.
3. `withRole()` rejects non-admin roles with 403.
4. Sensitive routes call `checkRateLimit()` from `lib/rate-limit.ts`; it uses an Upstash Redis counter and allows all requests when Redis is not configured.
5. The handler connects through `lib/db.ts`, validates input with local Zod schemas or route checks, performs the domain operation, and returns JSON.
6. Mutations commonly call `recordActivity()` from `lib/activity.ts`; it schedules a non-blocking write with Next.js `after()` and swallows logging failures.
7. `withAuth()` applies private no-cache headers unless a handler already supplied cache headers.

### Auth boundaries to remember

- Better Auth is configured in `lib/auth.ts` with a MongoDB adapter, email/password auth, optional GitHub/Google providers, database rate limiting, and user fields for `role`, `disabled`, `lastSeenAt`, and `invitedBy`.
- Public auth/invite/OTP routes are under `app/api/auth/**` and `app/api/invites/**`.
- API ownership checks must use the authenticated actor and role; admin access is not a substitute for validating the target resource exists.
- `proxy.ts` protects selected URL prefixes, while the `(app)` server layout is the broader page-level guard. Keep both in mind when adding a new route.

## 3. Repository map

| Path | Responsibility |
| --- | --- |
| `app/` | Next.js App Router pages, layouts, metadata, route handlers, SEO endpoints |
| `app/(app)/` | Authenticated student experience: dashboard, DSA, subjects, interview, OA, CP, profile, pricing, search, feedback |
| `app/(admin)/admin/` | Client admin shell and operations console |
| `app/(auth)/` | Sign-in, sign-up, invite acceptance, and email verification screens |
| `app/api/` | JSON route handlers for product, admin, cron, worker, webhook, and integration APIs |
| `components/` | Feature UI, shell/navigation, markdown, reader, OA/proctoring, admin, and UI primitives |
| `lib/api/` | Typed client-side API helpers |
| `lib/queries/` | TanStack Query factories and query configuration |
| `lib/runner/` | Code harness generation, Piston/Judge0 execution, fallback evaluation, runner types |
| `lib/proctor/` | Client/server proctoring analysis, evidence storage, LLM and deterministic reports |
| `lib/contests/` | Contest aggregation, calendars, and user profile fetchers |
| `lib/payments/` | Stripe/mock adapters, pricing service, payment types |
| `lib/ai/` | AI revision-note generation and provider fallback logic |
| `lib/telemetry/` | OpenTelemetry tracing, metrics, Prometheus, and structured logging |
| `models/` | Mongoose schemas and model exports |
| `types/` | Shared domain and API TypeScript types |
| `data/` | Seed content, assessment fixtures, backups, and static pattern JSON |
| `scripts/` | Database seeding, maintenance, admin, email, restore, and contrast utilities |
| `emails/` | React Email templates dispatched through Resend/QStash |
| `docs/` | Detailed product, architecture, API, schema, security, setup, deployment, and operations docs |
| `public/` | Static assets and published standalone diagrams |

## 4. Main feature flows

### DSA, notes, and revision

- Curated pattern content is stored in `Pattern` documents with nested variations and problems; seed files are in `data/pattern-dsa/` and `scripts/seed-mongo-patterns.ts`.
- User-trackable problems use the `Problem` collection and `kind` discriminator (`pattern`, `nonstandard`, or `cp`).
- User completion, notes, revision bookmarks, confidence, and next-review dates are stored in `UserProgress`.
- `/api/problems/revision` schedules confidence intervals: `struggled` = 2 days, `good` = 7 days, `mastered` = 30 days.
- `/api/problems/ai-notes` uses `lib/ai/revision-notes.ts`; it requires an active Pro entitlement or admin access in the route flow and has provider fallbacks.
- Dashboard/profile reads aggregate progress, activity, difficulty, trends, and heatmap data through query/service modules.

### Subjects, advanced topics, cheatsheets, and flashcards

- `Group` represents either a subject or an advanced topic group, differentiated by `kind`.
- `Topic` and `Cheatsheet` store Markdown content and belong to the current user; `ReaderLayout` provides the long-form reading experience.
- `Question` contains interview flashcards. `UserQuestionProgress` overlays per-user status, confidence, bookmarks, notes, and next-review dates.
- `/api/questions/[id]/progress` applies Leitner intervals: confidence 1/2/3/4 maps to 1/3/7/21 days.
- Markdown rendering is centralized in `components/markdown/` and uses sanitization; preserve that boundary for user-authored content.

### Online assessments and code execution

- Assessment templates and test suites are modeled by `Assessment`; candidate attempts and forensic results are in `AssessmentSubmission`.
- The student flow is `/oa` → `/oa/[slug]` → `/oa/[slug]/test` → `/oa/[slug]/report/[id]`.
- `/api/oa/execute` handles practice execution and rate-limits to 12 requests/minute per client key.
- `lib/runner/harness.ts` wraps function-style Python/C++/Java solutions, parses nested named arguments, and preserves programs that already provide standard input/main entry points.
- `lib/runner/judge0.ts` execution order is: local Docker Piston (`CODE_RUNNER_URL`) → Judge0 (`JUDGE0_API_URL` or RapidAPI credentials) → deterministic `lib/runner/mock-fallback.ts`.
- Submission routes execute visible and hidden cases, classify compile/runtime/TLE/WA outcomes, calculate results, and persist the attempt.
- The browser OA UI manages Monaco, fullscreen/focus signals, clipboard policy, telemetry, and `components/oa/ProctorCameraPip.tsx`.

### Proctoring

- Client-side vision/audio analysis is under `lib/proctor/` and the OA camera component; raw continuous video is intended to stay in the browser.
- Face and device analysis uses TensorFlow.js models plus deterministic analyzers/fallbacks. `lib/proctor/types.ts` is the shared contract.
- `storage.ts` uploads selected evidence frames to Cloudflare R2 using signed requests when configured.
- `activity-analyzer.ts` combines timeline signals and available Groq/Hugging Face providers, with a deterministic report fallback.
- Admin review is exposed at `/admin/proctoring` and `/admin/proctoring/[id]`; API routes are admin-gated.

### Competitive programming and contests

- Linked handles and ratings are stored in `UserCpProfile` and `UserContestHistory`.
- `lib/contests/aggregator.ts`, `calendar.ts`, and `user-fetchers.ts` normalize platform data for Codeforces, LeetCode, CodeChef, and AtCoder.
- Contest data/subscriptions are exposed under `/api/contests/**`; public unsubscribe uses a signed token flow.
- Cron handlers under `/api/cron/**` sync contests, user profiles, alerts, and revision digests. Email jobs are queued through QStash and handled by `/api/workers/email`.

### Billing and entitlements

- `lib/payments/index.ts` selects Stripe when configured, or the mock adapter when `PAYMENT_PROVIDER=mock` or Stripe is not configured.
- `PricingPlan` documents can override static plan defaults through `getDynamicPlans()`; static values remain the fallback.
- `Subscription` stores plan, status, period, Stripe metadata, and AI credit usage.
- `lib/entitlements.ts` is the entitlement boundary. Paid plans currently recognized as Pro are `pro_monthly`, `pro_annual`, `oa_pass`, and `campus`; admins are separately identified.
- Checkout, session verification, portal, and Stripe webhook routes live under `app/api/checkout/**`, `app/api/subscription/**`, and `app/api/webhooks/stripe/**`.
- Promo validation is public/authenticated and separately rate-limited; admin promo management is under `/api/admin/promos/**`.

## 5. Data model memory

MongoDB is accessed with Mongoose 9 through `lib/db.ts`. The connection is cached globally for development and configured with a bounded pool, disabled command buffering, and short selection timeout. Better Auth also uses a MongoDB client adapter for its auth collections.

| Model | Scope and purpose |
| --- | --- |
| `User` | Better Auth user plus BigO role/status fields |
| `Group` | Shared subject or advanced-topic group |
| `Topic` | User-owned Markdown topic in a group |
| `Pattern` | Shared curated DSA pattern, variations, and problem references |
| `Problem` | User-trackable pattern/non-standard/CP problem discriminator collection |
| `Progress` / `UserProgress` | Per-user completion, notes, revision, and scheduling state |
| `Question` | Curated or user-owned interview flashcard |
| `UserQuestionProgress` | Per-user flashcard Leitner state |
| `Cheatsheet` | User-owned Markdown quick reference |
| `Taxonomy` | Admin-managed shared values for patterns, buckets, platforms, subjects, advanced groups, difficulty |
| `Activity` | Append-only actor/target audit and activity feed |
| `Invite` / `Otp` | Hashed invite tokens and expiring OTP verification state |
| `Assessment` | Shared company OA definitions, problems, starter code, and test cases |
| `AssessmentSubmission` | User attempt, grading, telemetry, and forensic report |
| `Subscription` | User plan, billing status, periods, and AI quota |
| `PricingPlan` / `PromoCode` | Dynamic pricing and discount rules |
| `UserCpProfile` / `UserContestHistory` | Linked CP handles and rating history |
| `Contest` / `ContestSubscription` / `ContestAlertLog` | Global contests, user alert settings, and delivery deduplication |
| `Feedback` | User feedback and admin moderation state |

Ownership is a security invariant: user-owned reads/writes must be scoped by authenticated `userId`; cross-user operations require admin authorization. Update both `models/` and `docs/schema.md` when changing a collection, index, discriminator, or ownership rule.

## 6. Caching, async work, and observability

- `lib/cache.ts` provides L1 process memory plus optional L2 Upstash Redis caching. `invalidateCache()` must be considered after writes that affect cached reads.
- `proxy.ts` supplies an edge/API IP limit; route-specific limits use `lib/rate-limit.ts`.
- `lib/qstash.ts` publishes asynchronous jobs. `/api/workers/email` verifies QStash signatures in production and dispatches Resend/React Email templates.
- `lib/activity.ts` deliberately uses `after()`; callers must not await `recordActivity()`.
- `instrumentation.ts` initializes Node telemetry. `lib/telemetry/` owns traces, HTTP/rate-limit metrics, logs, and Prometheus support.
- `docker-compose.telemetry.yml` and Grafana/Prometheus configuration are operational support files, not application request dependencies.

## 7. Configuration and external services

Validated defaults and primary names are in `lib/config.ts`. Important groups are:

- MongoDB: `MONGODB_URI`, `MONGODB_DB`
- Auth: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, OAuth client credentials
- Email/queue: `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`, `QSTASH_*`
- Redis: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- Cron: `CRON_SECRET`
- Payments: Stripe keys/price IDs and `PAYMENT_PROVIDER`
- Runner: `CODE_RUNNER_URL`, `JUDGE0_API_URL`, `JUDGE0_RAPIDAPI_KEY`, `JUDGE0_RAPIDAPI_HOST`
- OA browser policy: `NEXT_PUBLIC_ALLOW_COPY_PASTE`
- Additional integrations read directly by feature modules include `GROQ_API_KEY`, `HUGGINGFACE_API_KEY`, NVIDIA keys/models, Cloudflare R2 credentials, analytics keys, and OpenTelemetry settings.

Never commit `.env*`, access keys, signed URLs, real user exports, or production database snapshots. Prefer the typed `env` object for server configuration; if a feature adds an environment variable, update `lib/config.ts`, setup/deployment docs, and this section.

## 8. Development commands and checks

```bash
npm install
npm run dev
npm run build
npm run test
npm run test:coverage
npm run lint
```

Useful data/operations scripts include:

```bash
npm run seed:patterns
npm run seed:assessments
npm run seed:interview
npm run seed:nonstandard
npm run restore:progress
```

Docker Piston is optional for local OA execution:

```bash
docker compose -f docker-compose.runner.yml up -d
```

When validating a change, start with the narrowest relevant unit test, then run the broader test/build check when practical. Do not run destructive seed/flush scripts against a shared database.

## 9. Change checklist

Before finishing a code change:

1. Locate callers, route handlers, models, types, tests, and docs affected by the change.
2. Preserve auth, ownership, rate-limit, cache invalidation, and activity-log behavior where applicable.
3. Update this file’s affected section, `Last reviewed`, and the change log.
4. Update `docs/api.md`, `docs/schema.md`, or `docs/architecture.md` when their public contract changed.
5. Run the relevant test, lint, type/build, or manual flow check and report the result.

## Change log

- **2026-10-26:** Created the initial code-backed memory map covering runtime flow, auth boundaries, repository structure, feature pipelines, data models, integrations, operational commands, and the ongoing update contract.
