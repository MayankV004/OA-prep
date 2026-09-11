# Architecture

## 1. Stack Summary

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) + TypeScript |
| Middleware | `proxy.ts` (Next.js request interceptor for auth & Edge Redis rate limiting) |
| Auth | BetterAuth (email + password, MongoDB adapter, database rate limiting) |
| Database | MongoDB Atlas (M0 free tier with pool size = 3, M10 optional for prod) |
| ODM | Mongoose 9 |
| Cache & Rate Limiting | Multi-Tier: L1 In-Memory + L2 Upstash Redis (`lib/cache.ts`, `lib/rate-limit.ts`, `proxy.ts`) + Edge CDN Headers (`CDN-Cache-Control`, `Vercel-CDN-Cache-Control`) |
| Code Execution Runner | Docker Piston (`docker-compose.runner.yml`) / RapidAPI Judge0 (`lib/runner/judge0.ts`) with smart regex/heuristic fallback (`lib/runner/mock-fallback.ts`) |
| Async Queue & Crons | Upstash QStash (`lib/qstash.ts`, `app/api/workers/email/route.ts`) + Vercel Cron (`vercel.json`) + GitHub Actions (`.github/workflows/contest-alerts-cron.yml`) |
| Client-Side AI & CV | TensorFlow.js (Google BlazeFace + COCO-SSD MobileNet-v2 via WebGL) |
| Audio Telemetry | Web Audio API (FFT frequency analysis + RMS volume metering) |
| Code Editor | Monaco Editor (`@monaco-editor/react`) with syntax highlighting & language drivers |
| Reader Mode | `ReaderLayout` component for immersive, responsive content consumption |
| Evidence Storage | Cloudflare R2 (S3-compatible, native AWS SigV4 signed uploads via Node crypto) |
| Payment & Billing | Stripe (Checkout Sessions, Customer Portal, Webhooks, mock fallback) + Dynamic Pricing Plans & Promo Codes (`models/pricingPlan.ts`, `models/promoCode.ts`) |
| Behavioral Forensic | Groq (Llama-3.3-70B) / Hugging Face / Deterministic Synthesizer fallback |
| API | Next.js Route Handlers under `app/api/**` + Typed Services in `lib/api/**` |
| Client data | TanStack Query v5 with `queryOptions()` (`lib/queries/**`) & `STALE_TIMES` |
| Domain Types | Centralized interfaces under `types/**`, `lib/proctor/types.ts`, and `lib/runner/types.ts` |
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
4. Sensitive endpoints enforce sliding-window rate limits (e.g. `/api/oa/execute` max 12/min, `/api/promo/validate` max 15/min).
5. Payload parses through a Zod schema shared with the client form.
6. Service function checks multi-tier cache (`lib/cache.ts`: L1 memory -> L2 Redis). On cache miss, it queries MongoDB and caches the result. High-read endpoints emit CDN caching headers (`CDN-Cache-Control`, `Vercel-CDN-Cache-Control`).
7. Code execution requests (`/api/oa/execute`) synthesize harness wrappers and execute in isolated containers (Docker Piston or Judge0) with fallback.
8. Mutating routes schedule background activity writes via Next.js 16 `after()` (non-blocking).
9. Email triggers enqueue a job to Upstash QStash (async with up to 3 retries and signature verification).
10. Global contest alert cron runs every 15 minutes via GitHub Actions schedule, calling `/api/cron/contest-alerts`.

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

## 8. Online Assessment (OA) Simulation & Code Execution Engine

Located under `app/(app)/oa/`, `lib/runner/`, and `lib/cp/`:
- **Real-Time Code Editor**: Monaco Editor integration supporting C++, Python, Java with syntax validation, auto-closing brackets, and custom themes.
- **Multi-Engine Execution Architecture (`lib/runner/judge0.ts`)**:
  - **Local Docker Piston Runner**: High-throughput containerized execution via `docker-compose.runner.yml` (`ghcr.io/engineer-man/piston`) running on port 2000.
  - **RapidAPI / Self-Hosted Judge0**: Cloud runner integration via `JUDGE0_RAPIDAPI_KEY` or `JUDGE0_API_URL`.
  - **Heuristic & Regex Mock Fallback (`lib/runner/mock-fallback.ts`)**: Deterministic offline evaluator providing graceful degradation in local environments without active Docker containers.
- **Execution Harness Generator (`lib/runner/harness.ts`)**: Synthesizes language-specific wrappers around user solution classes (`Solution`), automatically injecting imports, argument deserializers, test runners, and JSON output formatting for C++, Python, and Java.
- **Competitive Programming Testcase Parser (`lib/cp/testcaseParser.ts`)**: Parses complex parameter expressions (`target = 7, nums = [2,3,1,2,4,3]`), matrices, and standard stdin streams.
- **Live Test Execution API (`POST /api/oa/execute`)**: Enforces a sliding-window rate limit (12 runs/min per user) and executes visible or custom test cases during practice.
- **Automated Submission Grading (`POST /api/oa/assessments/[slug]/submit`)**: Evaluates code against the full suite of hidden test cases, detects Time Limit Exceeded (TLE) or Wrong Answer (WA), computes scores, and outputs pattern diagnostics (`mastered`, `needs_practice`, `failed`).
- **Enforced Testing Environment**: HTML5 Fullscreen lockdown, clipboard interception (blocking external paste injections), and tab-blur detection via Page Visibility API.
- **Post-Assessment Performance Analytics**: Automatic generation of problem results, time spent, percentile score, pattern diagnostics, and full proctoring forensic integrity reports (`/oa/[slug]/report/[submissionId]`).

## 9. Reader Layout & Enriched Content Subsystem

Located under `components/reader/ReaderLayout.tsx`:
- **Distraction-Free Reading Mode**: Specialized layout designed for long-form CS core subject notes (`/subjects/[subject]/[topic]`) and cheat sheets (`/cheatsheets/[slug]`).
- **Interactive Navigation & Progress**: Dynamic table of contents with scrollspy active heading highlighting, reading time estimation, and reading progress bar.
- **Deep Route Redirection**: Clean URL normalization handled via `next.config.mjs` and dedicated redirect pages (`/subject` -> `/subjects`, `/cheatsheet` -> `/cheatsheets`, `/report` -> `/feedback`).

## 10. Multi-Platform Competitive Programming (CP) Sync & Contest Crons

Located under `models/userCpProfile.ts`, `models/contest.ts`, `lib/contests/aggregator.ts`, and `.github/workflows/`:
- **Platform Integrations**: Automated profile fetching and rating synchronization for Codeforces, LeetCode, CodeChef, and AtCoder.
- **Composite CP Score**: Algorithmically aggregates candidate multi-platform ratings into a normalized 0–100 placement readiness score.
- **Hybrid Cron Scheduling**:
  - **GitHub Actions Workflow (`.github/workflows/contest-alerts-cron.yml`)**: Runs on a `*/15 * * * *` cron schedule, triggering `/api/cron/contest-alerts` to evaluate notification windows (24h, 2h, 30m prior) and bypass Vercel Hobby tier once-per-day cron limitations.
  - **Vercel Crons (`vercel.json`)**: Executes daily database synchronization for contest discovery (`/api/cron/contests-sync` at midnight) and user rating updates (`/api/cron/user-contests-sync` at 02:00).
  - **Async Email Dispatch**: Enqueues notification emails via Upstash QStash and dispatches React Email templates via Resend.

## 11. Dynamic Pricing, Promo Codes & Billing Subsystem

Located under `models/pricingPlan.ts`, `models/promoCode.ts`, `models/subscription.ts`, `lib/payments/`, and `app/(admin)/admin/billing/`:
- **Dynamic Pricing Plans (`PricingPlan`)**: Allows administrators to adjust plan pricing, feature bullet points, badges, and AI credits dynamically in MongoDB without code redeployments via `getDynamicPlans()`.
- **Promo Code Engine (`PromoCode`)**: Supports percentage or fixed discounts, expiration dates, plan-specific applicability, and maximum redemption caps via `POST /api/promo/validate` (rate-limited to 15 req/min).
- **Stripe Webhook Processing**: Cryptographically verified webhooks (`/api/webhooks/stripe`) handle `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted`.
- **Admin Revenue Dashboard (`/admin/billing`)**:
  - Aggregated financial KPIs: Monthly Recurring Revenue (MRR), Annual Recurring Revenue (ARR), and active subscriber counts broken down by plan (`pro_monthly`, `pro_annual`, `oa_pass`).
  - 6-month historical revenue trend visualization (`components/admin/RevenueTrendChart.tsx`).
  - Manual Plan Management: Admin controls to grant or revoke Pro or OA Pass access for any user with custom duration overrides.
- **Dev-Mode Mock Simulator**: Zero-friction local development pathway (`/api/checkout/mock-confirm`) allowing instant tier upgrades and credit resets without live Stripe API credentials.

## 12. Multi-Tier Caching & Edge CDN Architecture

Located under `lib/cache.ts` and API route headers:
- **Two-Tier Application Cache**:
  - **L1 In-Memory Cache**: Map-based sub-millisecond cache for hot in-process Lambdas.
  - **L2 Distributed Cache**: Upstash Redis HTTP client shared across Vercel serverless functions with explicit TTL and key invalidation (`withCache()`, `invalidateCache()`).
- **Edge CDN Caching Headers**: High-throughput public read endpoints (such as `/api/contests`) supply `Cache-Control`, `CDN-Cache-Control`, and `Vercel-CDN-Cache-Control` headers (e.g. `s-maxage=300`) to prevent edge header stripping and offload traffic to Cloudflare and Vercel Edge networks.

## 13. Proctoring Forensic Incident Desk & Adjudication Engine

Located under `app/(admin)/admin/proctoring/` and `app/api/admin/proctoring/`:
- **Centralized Incident Review Queue (`/admin/proctoring`)**: Triage candidate assessments with risk scores, biometric trigger counts, and integrity verdicts.
- **Forensic Timeline Scrubber (`/admin/proctoring/[id]`)**: Second-by-second chronological telemetry scrubber overlaying candidate baseline verification selfie, 6-gauge biometric infraction counts, tab-switching events, and high-resolution signed Cloudflare R2 snapshots.
- **AI Forensic Narrative**: Generative behavioral narrative synthesized via Groq (Llama-3.3-70B) detailing candidate infractions with timestamped evidence.
- **Adjudication Desk**: SuperAdmin dispute resolution controls to uphold violations or mark false positives with permanent audit logging.

## 14. Enterprise Campus Multi-Tenant B2B Architecture

Located under `models/institution.ts`, `models/institutionMember.ts`, `models/cohortDrive.ts`, `app/(portal)/`, and `lib/auth.ts`:
- **Tenant Sandboxing (`withPortalAuth`)**: Strict institutional isolation ensuring campus coordinators can only query or schedule placement drives for their assigned university.
- **Three-Tier Institutional Hierarchy**:
  - **Head of TPC**: Complete institutional authority to manage student seat quotas, schedule drives, and invite/remove placement coordinators.
  - **Placement Coordinator**: Ability to schedule drives, monitor candidate testing windows, and export scorecard analytics to CSV.
  - **Live Invigilator**: Dedicated proctoring desk observer with real-time candidate concurrency monitoring.
- **Nationwide Placement Drive Radar (`/admin/institutions/live-drives`)**: Real-time cross-campus operations dashboard with live candidate concurrency tracking and emergency controls (pause, force start, +15m extra time).
- **Isolated TPC Campus Portal (`/portal/*`)**: Clean, white-labeled control room completely separated from platform SuperAdmin views, protected on the server by `proxy.ts`.

## 15. Folder Structure

```
.
├── .github/workflows/                 # CI/CD & Automated Crons
│   └── contest-alerts-cron.yml        # 15-minute CP contest alert & aggregator triggers
├── app/                               # Next.js 16 App Router
│   ├── (admin)/admin/                 # Protected SuperAdmin Management Control Hub
│   │   ├── activity/                  # Global cross-user audit feed
│   │   ├── billing/                   # Financial MRR/ARR, trends & promo code manager
│   │   ├── content/                   # Content tables (Assessments, Problems, Topics)
│   │   ├── feedback/                  # User feedback review & moderation
│   │   ├── institutions/              # Campus B2B partner directory & seat licenses
│   │   │   ├── [id]/                  # Single campus governance & TPC roster
│   │   │   └── live-drives/           # Nationwide live drive radar & concurrency
│   │   ├── invites/                   # Invite manager & token issuance
│   │   ├── proctoring/                # Incident Desk & AI biometric audit queue
│   │   │   └── [id]/                  # Forensic audit timeline & R2 evidence scrubber
│   │   ├── settings/                  # Feature flags & system settings
│   │   ├── system/runner/             # Docker Piston runner & container telemetry
│   │   ├── taxonomies/                # Category taxonomy editor
│   │   └── users/                     # User management & read-only dashboards
│   ├── (portal)/portal/               # Isolated Campus TPC Placement Portal
│   │   ├── drives/                    # Placement drive scheduler
│   │   │   └── [id]/                  # Live invigilation monitoring room
│   │   ├── results/                   # Candidate scorecards & 1-click Excel/CSV export
│   │   └── team/                      # Self-serve TPC coordinator management
│   ├── (app)/                         # Main Authenticated Application Pages
│   │   ├── advanced/                  # System Design & Advanced CS modules
│   │   ├── cheatsheets/               # Topic cheat sheets & reader views
│   │   ├── cp/                        # CP profile sync & performance dashboard
│   │   ├── dashboard/                 # Heatmap, completion stats, activity feed
│   │   ├── dsa/                       # 12+ Core DSA pattern tracker & variations
│   │   ├── feedback/                  # Dedicated bug & feedback submission portal
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
│   │   ├── sign-in/                   # Sign-in & OTP verification
│   │   ├── sign-up/                   # Account registration
│   │   └── verify-email/              # 6-digit OTP verification screen
│   ├── contact/                       # Contact & inquiries page
│   ├── privacy/                       # Legal privacy policy (LegalDocumentViewer)
│   ├── terms/                         # Legal terms of service (LegalDocumentViewer)
│   └── api/                           # REST API Route Handlers under /api/*
│       ├── activity/                  # User activity streams
│       ├── admin/                     # Admin assessments, billing, promos, institutions, proctoring, runner
│       ├── auth/                      # BetterAuth endpoints & OTP verification
│       ├── cheatsheets/               # Cheatsheet CRUD
│       ├── checkout/                  # Stripe checkout sessions & mock confirms
│       ├── contests/                  # Contest list & alert subscriptions
│       ├── cp/                        # CP handle link & profile stats sync
│       ├── cron/                      # Background cron workers (contests, alerts)
│       ├── dashboard/                 # Aggregated stats & 365-day heatmaps
│       ├── feedback/                  # User feedback submission API
│       ├── groups/                    # Subject & Advanced group management
│       ├── oa/                        # Assessments, execution harness, submissions
│       │   ├── execute/               # Isolated code execution runner (Judge0/Piston)
│       │   └── submissions/           # Submission records & audit reports
│       ├── portal/                    # Isolated TPC APIs (overview, drives, results, team)
│       ├── pricing/                   # Public dynamic pricing configuration
│       ├── problems/                  # Problem CRUD, progress, revision flags, notes
│       ├── profile/                   # Profile updates & CP data
│       ├── promo/                     # Promo code validation & discounting
│       ├── questions/                 # Flashcard Q&A CRUD
│       ├── subscription/              # User subscription state & customer portal
│       ├── topics/                    # Subject concept notes CRUD
│       ├── upload/                    # Proctoring snapshot uploads
│       ├── webhooks/stripe/           # Stripe subscription webhooks
│       └── workers/email/             # QStash background email worker
├── components/                        # UI Component Library
│   ├── admin/                         # Admin tables, RevenueTrendChart, taxonomy forms
│   ├── cheatsheets/                   # Cheatsheet displays & filter bars
│   ├── dashboard/                     # Recharts trends, heatmaps, streak counters
│   ├── feedback/                      # Global FeedbackModal & feedback forms
│   ├── legal/                         # LegalDocumentViewer component
│   ├── markdown/                      # Editor.tsx & View.tsx
│   ├── oa/                            # ProctorCameraPip.tsx (Dual-Engine Neural HUD)
│   ├── problem/                       # Problem tables, filters, note drawer
│   ├── reader/                        # ReaderLayout distraction-free reading engine
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
│   ├── novelity.md                    # Core product differentiators & novelty angles
│   ├── proctoring.md                  # Enterprise Dual-Engine Neural Proctoring
│   ├── scalability.md                 # Scalability, caching & DB pooling
│   ├── schema.md                      # Mongoose collections & discriminator models
│   ├── security.md                    # Auth, RBAC, anti-cheat & encryption
│   └── setup.md                       # Local development setup guide
├── lib/                               # Core Backend & Utility Libraries
│   ├── api/                           # Typed frontend API clients
│   ├── cp/                            # Testcase parser & platform aggregators
│   ├── payments/                      # Stripe client, mock provider, pricingService
│   ├── proctor/                       # Dual-Engine Neural Proctoring Library
│   │   ├── audio/                     # Acoustic & RMS volume analyzer
│   │   ├── vision/                    # BlazeFace, COCO-SSD, optical fallback
│   │   ├── activity-analyzer.ts       # Behavioral forensic report synthesizer
│   │   ├── deterministic-fallback.ts  # Offline mathematical integrity scoring
│   │   ├── llm-client.ts              # Groq (Llama 3.3) & Hugging Face client
│   │   ├── storage.ts                 # Cloudflare R2 AWS SigV4 snapshot uploader
│   │   └── types.ts                   # Biometric & proctoring domain types
│   ├── runner/                        # Isolated Code Execution Runner
│   │   ├── harness.ts                 # Multi-language solution harness wrapper
│   │   ├── judge0.ts                  # Piston & Judge0 execution coordinator
│   │   ├── mock-fallback.ts           # Offline heuristic code evaluator
│   │   └── types.ts                   # Language IDs, runner types, status enums
│   ├── queries/                       # TanStack Query v5 query factories
│   ├── activity.ts                    # Async activity logger via after()
│   ├── auth.ts                        # BetterAuth server config & role gates
│   ├── cache.ts                       # Multi-tier L1 memory + L2 Upstash Redis
│   ├── db.ts                          # Mongoose connection pooling
│   ├── email.ts                       # Resend email dispatcher
│   ├── qstash.ts                      # Upstash QStash client
│   └── rate-limit.ts                  # Redis sliding window rate limiter
├── models/                            # Mongoose Schemas (PricingPlan, PromoCode, etc.)
├── emails/                            # React Email transactional templates
├── docker-compose.runner.yml          # Local Piston code execution runner container
├── proxy.ts                           # Next.js Edge Middleware
└── vercel.json                        # Vercel daily crons configuration
```

## 14. Observability & Telemetry

- **OpenTelemetry**: Initialized in `instrumentation.ts` to capture system traces and performance metrics.
- **Grafana & Prometheus**: Configured via `docker-compose.telemetry.yml` and provisioned files in `grafana/` for metric visualization.

## 15. State + Cache

- **TanStack Query v5**: Owns server state using centralized `queryOptions()` (`lib/queries/*`).
- **Multi-Tier Cache**: `withCache()` in `lib/cache.ts` transparently caches heavy DB query aggregations across L1 memory and L2 Redis.
- **CDN Edge Headers**: High-throughput public read endpoints supply `CDN-Cache-Control` and `Vercel-CDN-Cache-Control` headers.
- **Optimistic UI Updates**: Instant checkbox toggling and note saves via mutation `onMutate`.

## 16. Email & Background Jobs

- **QStash Queue**: `enqueueEmail()` in `lib/qstash.ts` publishes jobs to Upstash QStash (3 retries).
- **Worker Verification**: `app/api/workers/email/route.ts` verifies `upstash-signature` headers.
- **Resend SDK**: Renders React Email templates (`Invite.tsx`, `WelcomeConfirmation.tsx`, etc.) to HTML.
- **Contest Alert Schedules**: 15-minute GitHub Actions workflow triggers `/api/cron/contest-alerts` to dispatch timely contest notifications.

