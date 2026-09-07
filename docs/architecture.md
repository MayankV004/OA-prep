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
| Async Queue & Crons | Upstash QStash (`lib/qstash.ts`, `app/api/workers/email/route.ts`, `app/api/cron/*`) |
| Client-Side AI & CV | TensorFlow.js (Google BlazeFace + COCO-SSD MobileNet-v2 via WebGL) |
| Audio Telemetry | Web Audio API (FFT frequency analysis + RMS volume metering) |
| Code Editor | Monaco Editor (`@monaco-editor/react`) with syntax highlighting & language drivers |
| Evidence Storage | Cloudflare R2 (S3-compatible, native AWS SigV4 signed uploads via Node crypto) |
| Payment Gateway | Stripe (Checkout Sessions, Customer Portal, Webhooks, mock fallback) |
| Behavioral Forensic | Groq (Llama-3.3-70B) / Hugging Face / Deterministic Synthesizer fallback |
| API | Next.js Route Handlers under `app/api/**` + Typed Services in `lib/api/**` |
| Client data | TanStack Query v5 with `queryOptions()` (`lib/queries/**`) & `STALE_TIMES` |
| Domain Types | Centralized interfaces under `types/**` and `lib/proctor/types.ts` |
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
                       ┌──────────────────────────────────────────────┐
                       │               Browser (React)                │
                       │   shadcn / Base UI · TanStack Query v5       │
                       │   Monaco Code Editor · SVG Biometric HUD     │
                       │   TensorFlow.js (BlazeFace + COCO-SSD WebGL) │
                       │   Web Audio API Frequency RMS Analyser       │
                       └───────────────────────┬──────────────────────┘
                                               │ fetch(/api/*)
                               ┌───────────────▼──────────────┐
                               │           proxy.ts           │
                               │   Redis Rate Limit + Auth    │
                               └───────────────┬──────────────┘
                                               │
                               ┌───────────────▼──────────────┐
                               │    Next.js Route Handlers    │
                               │   Zod → withAuth / withRole  │
                               │   after() → Activity Log     │
                               └───┬───────┬───────┬───────┬──┘
                                   │       │       │       │
          ┌────────────────────────┘       │       │       └────────────────────────┐
          │ Mongoose                       │ Redis │                                │
┌─────────▼────────┐             ┌─────────▼──┐    │                      ┌─────────▼────────┐
│  MongoDB Atlas   │             │  Upstash   │    │                      │  Cloudflare R2   │
│  - Users / Auth  │             │  Redis     │    │                      │  - WebP Evidence │
│  - Assessments   │             └────────────┘    │                      │  - Audit Frames  │
│  - Submissions   │                               │                      └──────────────────┘
│  - CP Profiles   │                     ┌─────────▼──────────┐
│  - Contests      │                     │   Upstash QStash   │
│  - Subscriptions │                     └─────────┬──────────┘
└──────────────────┘                               │ POST
                                     ┌─────────────┼─────────────┐
                                     │             │             │
                               ┌─────▼───────┐ ┌───▼───────┐ ┌───▼───────┐
                               │   /workers  │ │   /cron   │ │   /cron   │
                               │    /email   │ │  /alerts  │ │   /sync   │
                               └─────┬───────┘ └───┬───────┘ └───┬───────┘
                                     │             │             │
                               ┌─────▼───────┐     │     ┌───────▼────────┐
                               │ Resend API  │     └────►│ Codeforces /   │
                               └─────────────┘           │ LeetCode APIs  │
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

## 7. Enterprise Dual-Engine Neural Proctoring Subsystem

Located under `lib/proctor/` and `components/oa/ProctorCameraPip.tsx`, the proctoring pipeline safeguards assessment integrity with zero client installations:

1. **Client-Side Hardware Acceleration**: Uses TensorFlow.js with the WebGL backend, offloading matrix calculations to candidate GPU/iGPU.
2. **Dual-Loop Execution**:
   - **Fast Biometric Loop (180ms)**: Runs Google BlazeFace for sub-30ms face presence, landmark tracking (6 3D coordinates), 3D head pose estimation (Yaw/Pitch deviation from center), and multi-face violation flags.
   - **Throttled Device Loop (450ms)**: Runs COCO-SSD (MobileNet-v2) for prohibited device detection (smartphones, handheld displays, books, secondary persons).
3. **Multi-Zone Spatial Optical Fallback (`device-analyzer.ts`)**:
   - Isolates candidate head/torso with dynamic exclusion zones ($x \pm 75\%$, $y \pm 85\%$) so hair, eyeglasses, and dark clothing are never falsely identified as smartphones.
   - Independently scans Left, Right, and Lower-desk zones for dense rectangular objects with aspect ratios between $1.25$ and $2.6$.
4. **Anti-False-Positive Face Guard**: Prohibited device detection is strictly gated on candidate presence (`faceStatus === 'verified'`). When a candidate is absent from frame, false alarms caused by room shadows or empty chair frames are completely suppressed.
5. **Acoustic Speech Analysis (`acoustic-analyzer.ts`)**: Uses Web Audio API with a 256-point FFT analyser node to calculate normalized RMS energy and flag unauthorized speech or whispering.
6. **Zero-Dependency Cloudflare R2 Uploads (`storage.ts`)**: Violation frames are compressed to lightweight WebP files and uploaded directly via native Node.js crypto AWS SigV4 PUT requests without heavy SDK dependencies.
7. **Automated Behavioral Forensic Evaluation (`activity-analyzer.ts`)**: Synthesizes session telemetry (tab switches, gaze diversion, paste attempts, face absence, audio spikes) into an executive report using Groq Llama-3.3-70B, Hugging Face, or a high-precision deterministic synthesizer.

## 8. Online Assessment (OA) Simulation Engine

Located under `app/(app)/oa/`:
- **Real-Time Code Editor**: Monaco Editor integration supporting C++, Python, Java with syntax validation, auto-closing brackets, and custom themes.
- **Isolated Multi-Language Test Runner**: Client and API execution pathways evaluating candidate code against both public sample test cases and hidden evaluation cases.
- **Enforced Testing Environment**: HTML5 Fullscreen lockdown, clipboard interception (blocking external paste injections), and tab-blur detection via Page Visibility API.
- **Post-Assessment Performance Analytics**: Automatic generation of problem results, time spent, percentile score, pattern diagnostics, and full proctoring forensic integrity reports (`/oa/[slug]/report/[submissionId]`).

## 9. Multi-Platform Competitive Programming (CP) Sync & Contest Crons

Located under `models/userCpProfile.ts`, `models/contest.ts`, and `app/api/cron/*`:
- **Platform Integrations**: Automated profile fetching and rating synchronization for Codeforces, LeetCode, CodeChef, and AtCoder.
- **Composite CP Score**: Algorithmically aggregates candidate multi-platform ratings into a normalized 0–100 placement readiness score.
- **Global Contest Alerts & Scrapers**: Background cron jobs (`/api/cron/contests-sync`) periodically aggregate upcoming programming contests across platforms and dispatch customizable notification emails via QStash and Resend (`/api/cron/contest-alerts`).

## 10. Monetization, Stripe Billing & Entitlement Architecture

Located under `models/subscription.ts`, `lib/subscription.ts`, and `app/api/checkout/*`:
- **Tier Structure**: Free Tier, Pro Monthly, Pro Annual, and OA Single-Pass entitlements.
- **Stripe Webhook Processing**: Cryptographically verified webhooks (`/api/webhooks/stripe`) handle `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted`.
- **AI Credits Quota Management**: Tracks automated behavioral forensic credits and OA simulator attempt limits per billing cycle.
- **Dev-Mode Mock Simulator**: Zero-friction local development pathway allowing instant tier upgrades and credit resets without Stripe API credentials.

## 11. Folder Structure

```
.
├── app/                               # Next.js 16 App Router
│   ├── (admin)/admin/                 # Protected Admin Management Panel
│   │   ├── activity/                  # Global cross-user audit feed
│   │   ├── content/                   # Content tables (Problems, Patterns, Topics)
│   │   ├── feedback/                  # User feedback review & moderation
│   │   ├── invites/                   # Invite manager & token issuance
│   │   ├── settings/                  # Feature flags & system settings
│   │   ├── taxonomies/                # Category taxonomy editor
│   │   └── users/                     # User management & read-only dashboards
│   ├── (app)/                         # Main Authenticated Application Pages
│   │   ├── advanced/                  # System Design & Advanced CS modules
│   │   ├── cheatsheets/               # Topic cheat sheets
│   │   ├── cp/                        # CP profile sync & performance dashboard
│   │   ├── dashboard/                 # Heatmap, completion stats, activity feed
│   │   ├── dsa/                       # 12+ Core DSA pattern tracker & variations
│   │   ├── interview/                 # Interactive interview Q&A flashcards
│   │   ├── non-standard/              # Ad-hoc & bucket problem tracker
│   │   ├── oa/                        # Online Assessment Simulator
│   │   │   ├── [slug]/                # Assessment instructions & onboarding
│   │   │   │   ├── test/              # Monaco Editor & live proctored exam engine
│   │   │   │   └── report/[id]/       # Diagnostic score & proctoring forensic report
│   │   ├── pricing/                   # Stripe pricing tiers & checkout
│   │   ├── profile/                   # User profile, CP handles, and heatmap
│   │   ├── search/                    # Multi-entity fulltext search
│   │   └── subjects/                  # Core CS concept notes (OS, DBMS, CN, OOP)
│   ├── (auth)/                        # Authentication Routes
│   │   ├── invite/[token]/            # Public invite acceptance
│   │   └── sign-in/                   # Sign-in & OTP verification
│   └── api/                           # REST API Route Handlers under /api/*
│       ├── activity/                  # User activity streams
│       ├── admin/                     # Admin users, invites, taxonomies, feedback
│       ├── auth/                      # BetterAuth endpoints & OTP verification
│       ├── cheatsheets/               # Cheatsheet CRUD
│       ├── checkout/                  # Stripe checkout sessions & mock confirms
│       ├── contests/                  # Contest list & alert subscriptions
│       ├── cp/                        # CP handle link & profile stats sync
│       ├── cron/                      # Upstash cron workers (contests, alerts)
│       ├── dashboard/                 # Aggregated stats & 365-day heatmaps
│       ├── groups/                    # Subject & Advanced group management
│       ├── oa/                        # Assessments, starts, submissions, reports
│       ├── problems/                  # Problem CRUD, progress, revision flags, notes
│       ├── profile/                   # Profile updates & CP data
│       ├── questions/                 # Flashcard Q&A CRUD
│       ├── subscription/              # User subscription state & customer portal
│       ├── topics/                    # Subject concept notes CRUD
│       ├── upload/                    # Proctoring snapshot uploads
│       ├── webhooks/stripe/           # Stripe subscription webhooks
│       └── workers/email/             # QStash background email worker
├── components/                        # UI Component Library
│   ├── admin/                         # Admin tables, forms, taxonomy editors
│   ├── cheatsheets/                   # Cheatsheet displays
│   ├── dashboard/                     # Recharts trends, heatmaps, streak counters
│   ├── markdown/                      # Editor.tsx & View.tsx
│   ├── oa/                            # ProctorCameraPip.tsx (Dual-Engine Neural HUD)
│   ├── problem/                       # Problem tables, filters, note drawer
│   ├── shell/                         # Navbars, sidebars, footer, breadcrumbs
│   └── ui/                            # Shadcn primitives & Base UI components
├── docs/                              # Comprehensive Technical Documentation
│   ├── PRD.md                         # Product requirements & functional specs
│   ├── README.md                      # Documentation index
│   ├── admin.md                       # Admin panel operation & permissions
│   ├── api.md                         # REST API endpoint specifications
│   ├── architecture.md                # System architecture & wiring
│   ├── deployment.md                  # Vercel, MongoDB, and R2 deployment guide
│   ├── monetization.md                # Pricing tiers, credits, and B2B strategy
│   ├── proctoring.md                  # Enterprise Dual-Engine Neural Proctoring
│   ├── scalability.md                 # Scalability, caching & DB pooling
│   ├── schema.md                      # Mongoose collections & discriminator models
│   ├── security.md                    # Auth, RBAC, anti-cheat & encryption
│   └── setup.md                       # Local development setup guide
├── lib/                               # Core Backend & Utility Libraries
│   ├── api/                           # Typed frontend API clients
│   ├── proctor/                       # Dual-Engine Neural Proctoring Library
│   │   ├── audio/                     # Acoustic & RMS volume analyzer
│   │   ├── vision/                    # BlazeFace, COCO-SSD, optical fallback
│   │   ├── activity-analyzer.ts       # Behavioral forensic report synthesizer
│   │   ├── deterministic-fallback.ts  # Offline mathematical integrity scoring
│   │   ├── llm-client.ts              # Groq (Llama 3.3) & Hugging Face client
│   │   ├── storage.ts                 # Cloudflare R2 AWS SigV4 snapshot uploader
│   │   └── types.ts                   # Biometric & proctoring domain types
│   ├── queries/                       # TanStack Query v5 query factories
│   ├── activity.ts                    # Async activity logger via after()
│   ├── auth.ts                        # BetterAuth server config & role gates
│   ├── cache.ts                       # Upstash Redis caching layer
│   ├── db.ts                          # Mongoose connection pooling
│   ├── email.ts                       # Resend email dispatcher
│   ├── qstash.ts                      # Upstash QStash client
│   └── rate-limit.ts                  # Redis sliding window rate limiter
├── models/                            # Mongoose Schemas (20+ domain entities)
├── emails/                            # React Email transactional templates
└── proxy.ts                           # Next.js Edge Middleware
```

## 12. Observability & Telemetry

- **OpenTelemetry**: Initialized in `instrumentation.ts` to capture system traces and performance metrics.
- **Grafana & Prometheus**: Configured via `docker-compose.telemetry.yml` and provisioned files in `grafana/` for metric visualization.

## 13. State + Cache

- **TanStack Query v5**: Owns server state using centralized `queryOptions()` (`lib/queries/*`).
- **Redis Cache Layer**: `withCache()` in `lib/cache.ts` transparently caches heavy DB query aggregations.
- **Optimistic UI Updates**: Instant checkbox toggling and note saves via mutation `onMutate`.

## 14. Email & Background Jobs

- **QStash Queue**: `enqueueEmail()` in `lib/qstash.ts` publishes jobs to Upstash QStash (3 retries).
- **Worker Verification**: `app/api/workers/email/route.ts` verifies `upstash-signature` headers.
- **Resend SDK**: Renders React Email templates (`Invite.tsx`, `WelcomeConfirmation.tsx`, etc.) to HTML.

