# Technology Stack & System Architecture Specification — BigO

> Comprehensive architectural reference detailing every technology, framework, cloud service, and library powering the BigO Online Assessment (OA) simulator, pattern-based DSA tracker, and core CS placement preparation platform.

---

## 1. Architectural Landscape & Stack Overview

BigO is designed as a high-performance, resilient, and cost-effective preparation ecosystem. It combines client-side WebGL neural inference, serverless Next.js 16 App Router handlers, multi-tier distributed caching, decoupled queue workers, and sandboxed container code execution.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     BIG-O TECHNOLOGY TOPOLOGY                                    │
├──────────────────────────────┬──────────────────────────────┬────────────────────────────────────┤
│   🌐 Client & Presentation   │   ⚡ API & Compute Layer     │   🧠 Neural & CV Inferences        │
│   - Next.js 16 (React 19)    │   - Vercel Serverless (Node) │   - TensorFlow.js (WebGL)          │
│   - TypeScript 5.8+ (Strict) │   - Next.js Edge proxy.ts    │   - Google BlazeFace Biometrics    │
│   - Tailwind CSS v4          │   - Next.js 16 after() async │   - COCO-SSD MobileNet-v2          │
│   - TanStack Query v5        │   - Upstash QStash Queue     │   - NVIDIA NIM & Groq Llama-3.3    │
│   - Monaco Editor & Recharts │   - Docker Piston & Judge0   │   - Web Audio API (FFT / RMS)      │
├──────────────────────────────┼──────────────────────────────┼────────────────────────────────────┤
│   💾 Data & Persistence      │   🛡️ Security & Identity     │   📈 Monetization & Telemetry      │
│   - MongoDB Atlas + Mongoose │   - BetterAuth (MongoAdapter)│   - Stripe Checkout & Portal       │
│   - Upstash Redis (L2 Cache) │   - Mandatory 6-Digit OTP    │   - Dynamic Database Pricing Plans │
│   - Cloudflare R2 (SigV4)    │   - Sliding-Window Limits    │   - OpenTelemetry & Prometheus     │
│   - Edge CDN Caching Headers │   - rehype-sanitize XSS Guard│   - GA4, PostHog & Cookie Consent  │
└──────────────────────────────┴──────────────────────────────┴────────────────────────────────────┘
```

---

## 2. Technology Selection Matrix

| Layer / Domain | Technology | Version / Spec | Architectural Purpose | Why Chosen & Key Trade-offs |
|---|---|---|---|---|
| **Core Framework** | Next.js App Router | `16.0.0` (Canary / Stable) | Fullstack framework, SSR, RSC streaming, Server Actions, Route Handlers | Unified TypeScript frontend/backend with zero API gateway latency; utilizes Next.js 16 `after()` for non-blocking writes. |
| **UI Library** | React | `19.0.0` | Declarative UI rendering, hooks, suspense boundaries | React 19 Server Components provide streaming HTML to cut Largest Contentful Paint (LCP). |
| **Language** | TypeScript | `5.8.x` (Strict) | End-to-end type safety across domain entities, proctoring events, and runner schemas | Eliminates runtime type errors; shared schemas between frontend forms and backend validators. |
| **Styling & Design** | Tailwind CSS | `v4.0.0` | Utility-first CSS, CSS custom properties, micro-animations | Zero runtime CSS overhead, built-in dark mode support, rapid UI assembly. |
| **UI Primitives** | Base UI + shadcn | Latest | Accessible dialogs, dropdowns, popovers, tabs, and tooltips | Unstyled, fully accessible WAI-ARIA compliant foundations customized to the BigO design system. |
| **Client State / Cache**| TanStack Query | `v5.66.0` | Asynchronous server-state management, cache deduplication, refetching | Eliminates manual `useEffect` fetches; standardized with `queryOptions()` and centralized `STALE_TIMES`. |
| **Code Editor** | Monaco Editor | `@monaco-editor/react` | Browser-based IDE for proctored exams and OA problem testing | Exact editor powering VS Code; multi-language syntax highlighting, line numbers, and indentation control. |
| **Markdown Authoring** | `@uiw/react-md-editor` | `v4.0.5` | In-browser Markdown editor with live preview for notes & solutions | Split-pane editing, GitHub-flavored Markdown support, seamless keyboard navigation. |
| **Markdown Sanitizer** | `rehype-sanitize` + `remark-gfm` | Latest | Safe HTML sanitization of candidate notes, cheat sheets, and LLM output | Strips malicious `<script>`, `<iframe>`, and event handler attributes to eliminate stored XSS. |
| **Charts & Graphs** | Recharts | `v2.15.1` | LeetCode activity heatmaps, completion velocity charts, CP rating graphs | Highly customizable SVG-based chart library lazy-loaded via `next/dynamic` to protect bundle size. |
| **Authentication** | BetterAuth | `v1.1.21` | Session token lifecycle, password hashing, RBAC (`admin`/`user`) | Flexible MongoDB adapter, secure `HttpOnly` `SameSite=Lax` cookies, database-level rate limiting. |
| **Primary Database** | MongoDB Atlas | MongoDB 7.0+ | Document database storing users, patterns, submissions, and telemetry | Flexible document model with Mongoose 9 discriminators for polymorphic problem and group schemas. |
| **ODM / Data Layer** | Mongoose | `v9.0.0` | Schema validation, type hooks, indexing, discriminator inheritance | Enforces schema boundaries and indexes at application startup; supports connection pooling (size=3 for M0). |
| **Distributed Cache** | Upstash Redis | REST API via `@upstash/redis` | L2 distributed caching and sliding-window rate limiting | Serverless HTTP-based Redis with sub-15ms latency; no persistent TCP connection pool required on serverless. |
| **Task Queue / Crons** | Upstash QStash | `@upstash/qstash` | Asynchronous background message queue with retry backoff | Decouples transactional email dispatch and heavy crons from user HTTP request cycles. |
| **Biometric Computer Vision** | Google BlazeFace | TensorFlow.js `@tensorflow-models/blazeface` | Sub-30ms client facial tracking, 6 3D keypoints, head pose estimation | 100% client-side inference via WebGL; zero raw video streamed to servers; candidate privacy preserved. |
| **Object Detection** | COCO-SSD | TensorFlow.js `@tensorflow-models/coco-ssd` | Real-time classification of unauthorized devices (`cell phone`, `laptop`, `book`) | Runs throttled MobileNet-v2 loop (~450ms) in browser; spatial exclusion zones prevent hair/desk false positives. |
| **Audio Forensics** | Web Audio API | Native Browser API | 256-point Fast Fourier Transform (FFT) analysis, normalized RMS metering | Detects whispering and unauthorized background assistance without uploading raw audio files. |
| **Evidence Storage** | Cloudflare R2 | S3-Compatible API via AWS SigV4 | Private object storage for compressed WebP infraction snapshots | Zero egress fees; ultra-low-cost private storage; direct PUT uploads signed via zero-dependency Node crypto. |
| **Code Runner Engine** | Docker Piston / Judge0 | Isolated containers / RapidAPI CE | Sandboxed compilation and testcase execution for C++, Python, Java | Hard execution timeouts (TLE), memory bounding (256MB), no host filesystem access, multi-language parity. |
| **AI LLM Inference** | NVIDIA NIM + Groq Cloud | Nemotron-3-Ultra-550B, Llama-3.3-70B | AI revision notes generation and post-exam forensic integrity auditing | Sub-second inference latency (~1.98s for multi-language solutions); deterministic synthesizer failover. |
| **Transactional Email** | Resend + React Email | `resend` + `@react-email/components` | OTP verification, contest alerts, weekly revision digests, invites | Type-safe React email templates rendered to HTML and dispatched via QStash queue. |
| **Observability** | OpenTelemetry | `@opentelemetry/sdk-node` | Distributed tracing, performance spans, Prometheus metrics | Vendor-neutral instrumentation compatible with Grafana, Datadog, or standalone collector. |
| **Analytics & Privacy** | Google Analytics 4 + PostHog | Client-side SDKs | Engagement tracking, funnel conversion, and user retention metrics | Privacy-respecting wrapper (`AnalyticsProvider`) strictly gated behind granular `CookieConsentBanner`. |

---

## 3. Frontend & Presentation Subsystems

### 3.1 Next.js 16 App Router & Server Components
- **Architecture**: Leverages React Server Components (RSC) to render static content, documentation, and metadata on the server, streaming dynamic widgets via Suspense.
- **Routing Structure**:
  - `(auth)`: Unauthenticated onboarding, sign-in, OTP verification, and invite acceptance.
  - `(app)`: Authenticated candidate workspace (DSA tracker, OA exam engine, CP sync, interview flashcards, profile).
  - `(admin)`: Protected SuperAdmin operations desk (incidents, runner health, billing, content taxonomies).
- **Navigation & Mobile Polish**:
  - `MobileStickyCta`: High-conversion floating action trigger for small viewports.
  - Hardened input styling: Enforces minimum `16px` font size on inputs to prevent iOS Safari automatic viewport zooming.

### 3.2 Dynamic Interactive Components
- **Monaco Code Editor (`@monaco-editor/react`)**:
  - Provides a desktop-grade IDE environment within the browser.
  - Integrated with keydown event interceptors to prevent unauthorized code pasting from external clipboards during proctored exams.
- **3D Flip Card Deck (`components/interview/FlashcardDeck.tsx`)**:
  - Hardware-accelerated CSS 3D card flipping (`transform: rotateY(180deg)`).
  - Full keyboard accessibility: `Space` flips card, `1`–`4` records confidence score, arrow keys navigate deck.
- **Enriched Markdown Reader (`components/markdown/View.tsx`)**:
  - Syntax highlighted code blocks with language badges and one-click copy buttons.
  - Multi-language solution tabs: Consecutive code blocks (`cpp`, `java`, `python`) automatically group into interactive tabbed switchers matching LeetCode's official UI patterns.

---

## 4. Backend & Runtime Architecture

### 4.1 Edge Middleware Interceptor (`proxy.ts`)
Incoming requests traverse `proxy.ts` prior to reaching Route Handlers:
1. **Route Classification**: Identifies protected application routes, admin portals, and public assets.
2. **Sliding-Window Rate Limiting**: Interacts with Upstash Redis to enforce abuse boundaries (`12 runs/min` on code execution, `15 req/min` on promo validation).
3. **Session Authentication Gate**: Inspects session cookies; redirects unauthenticated candidate traffic to `/sign-in` while returning JSON error payloads on unauthorized API calls.

### 4.2 Non-Blocking Background Operations (`after()`)
- Route Handlers leverage Next.js 16 `after()` to dispatch background side effects (audit logging in `recordActivity()`, telemetry recording, streak updates) after sending the HTTP response, cutting server response times to `<25ms`.

### 4.3 Task Queuing with Upstash QStash
- **Decoupled Job Dispatch**: Email jobs (OTP codes, contest alerts, weekly revision digests) are not sent synchronously within user requests.
- **Retry Resilience**: QStash executes automated retry schedules (up to 3 exponential backoff attempts) with cryptographic signature validation (`QSTASH_CURRENT_SIGNING_KEY`).

---

## 5. Data Persistence & Caching Hierarchy

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         MULTI-TIER CACHING TOPOLOGY                              │
├────────────────────────────────┬─────────────────┬───────────────────────────────┤
│ Tier                           │ Latency         │ Scope                         │
├────────────────────────────────┼─────────────────┼───────────────────────────────┤
│ 1. L1 In-Memory Cache          │ < 1ms           │ Node.js process local memory  │
│ 2. L2 Upstash Redis            │ 8 – 15ms        │ Shared distributed cache      │
│ 3. Edge CDN Caching Headers    │ 0 – 5ms         │ Vercel Edge / Cloudflare CDN  │
│ 4. MongoDB Atlas (M0/M10)      │ 25 – 45ms       │ Authoritative database source │
└────────────────────────────────┴─────────────────┴───────────────────────────────┘
```

- **Mongoose 9 Discriminators**:
  - `Problem` base model specializes into `PatternProblem` (`pattern`, `variation`), `NonStandardProblem` (`bucket`, `whyNonStandard`), and `CpProblem` (`platform`, `contest`, `rating`).
  - `Group` base model specializes into `Subject` (OS, DBMS, CN, OOP) and `AdvancedTopicGroup` (DevOps, System Design).
- **Index Optimization**:
  - Compound uniqueness indexes: `{ userId: 1, problemId: 1 }` on `UserProgress`, `{ userId: 1, questionId: 1 }` on `UserQuestionProgress`.
  - Overdue revision compound queries: `{ userId: 1, revision: 1, nextReviewAt: 1 }`.
  - TTL automatic index: `expiresAt` with `expireAfterSeconds: 0` on `OTPVerification`.

---

## 6. Client-Side AI & Neural Proctoring Subsystem

```
                         Webcam Video Stream (HTML5 Video Element)
                                            │
                       ┌────────────────────┴────────────────────┐
                       │                                         │
                 [Every 180ms]                             [Every 450ms]
                       ▼                                         ▼
            Google BlazeFace Model                     COCO-SSD Object Model
            (Landmarks, Pose, Yaw/Pitch)              (MobileNet-v2 Detection)
                       │                                         │
                       │ [face verified]                         │
                       ▼                                         ▼
           Spatial Exclusion Bounding Box        Filter Non-Permitted Classes
           (Eliminates hair / desk false alarms) (cell phone, laptop, book, etc.)
                       │                                         │
                       └────────────────────┬────────────────────┘
                                            │
                                            ▼
                               Anti-False-Positive Filter
                              (2.2s Persistent UI Debounce)
                                            │
                         ┌──────────────────┴──────────────────┐
                         │                                     │
                         ▼                                     ▼
                Interactive SVG HUD                 Tamper-Evident Vault
               (Wireframe Overlays)               (SigV4 WebP Upload to R2)
```

- **TensorFlow.js WebGL Backend**: Hardware-accelerated browser neural inference running entirely on client GPUs.
- **BlazeFace Biometrics (180ms loop)**: Sub-30ms landmark tracking, 6 3D facial keypoints, yaw/pitch angular deviations, eye-distance scale, and multiple person presence.
- **COCO-SSD Object Classification (450ms loop)**: Identifies unauthorized mobile devices (`cell phone`), physical textbooks (`book`), and secondary monitors (`laptop`, `tv`).
- **Spatial Exclusion Guard**: Masks the candidate's torso and head ($x \pm 75\%$, $y \pm 85\%$) so glasses, clothing folds, or hair are never falsely flagged as cell phones.
- **Zero-Dependency AWS SigV4 Vault (`lib/proctor/storage.ts`)**: Infraction snapshots are converted to WebP ($<25\text{ KB}$) and uploaded directly to Cloudflare R2 using native Node.js `crypto`, avoiding **40MB** of `@aws-sdk/client-s3` dependencies.

---

## 7. AI Revision Notes & Spaced Repetition Engine

- **Multi-Model LLM Failover Architecture**:
  1. **NVIDIA NIM API**: Calls high-throughput models (`nvidia/nemotron-3-ultra-550b-a55b`, `nvidia/llama-3.1-nemotron-70b-instruct`, `nvidia/nemotron-4-340b-instruct`) via `NVIDIA_API_KEY`.
  2. **Groq Cloud API**: Calls ultra-fast inference models (`llama-3.3-70b-versatile`, `qwen/qwen3.8-27b`) via `GROQ_API_KEY`.
  3. **Hugging Face Inference**: Third-tier failover via `HUGGINGFACE_API_KEY`.
  4. **Deterministic Synthesizer**: Zero-downtime offline fallback providing clean structure, edge cases, and boilerplates if external APIs are unreachable.
- **Gated Monetization**: Access to `POST /api/problems/ai-notes` is strictly verified against active BigO Pro subscription entitlements (`getUserEntitlement(userId)`).
- **Spaced Repetition Scheduler (`models/progress.ts`)**:
  - `struggled`: Reschedules in **2 days**.
  - `good`: Reschedules in **7 days**.
  - `mastered`: Reschedules in **30 days**.
- **Automated Weekly Email Digest**: Scheduled Sunday cron (`0 18 * * 0`) queries overdue items and dispatches customized email cards via QStash and Resend.

---

## 8. Sandboxed Code Execution Subsystem

```
                    Candidate Solution (C++, Python, Java)
                                      │
                                      ▼
                        Language Harness Synthesizer
                        (Injects IO wrapper & Parser)
                                      │
                ┌─────────────────────┴─────────────────────┐
                ▼                                           ▼
      Container Sandbox (Piston)                   Cloud Sandbox (Judge0)
     `docker-compose.runner.yml`                    RapidAPI CE / Private
     - Time limit: 2000ms                          - Time limit: 2000ms
     - Memory limit: 256MB                         - Memory limit: 256MB
     - Restricted syscalls                         - Sandboxed execution
                │                                           │
                └─────────────────────┬─────────────────────┘
                                      │
                                      ▼
                        Deterministic Mock Heuristic
                       (Zero-dependency local fallback)
```

- **Parameter Deserializer (`lib/cp/testcaseParser.ts`)**: Parses competitive programming parameter strings (`target = 7, nums = [2,3,1,2,4,3]`), matrices (`[[1,2],[3,4]]`), and stdin streams.
- **Sliding-Window Rate Limiting**: Max 12 executions per minute per candidate on `POST /api/oa/execute`.
- **Automated Hidden Grading**: On submission (`/api/oa/assessments/[slug]/submit`), candidate code is evaluated against complete hidden test suites with Time Limit Exceeded (TLE) and Wrong Answer (WA) diagnostics.

---

## 9. Generative Engine Optimization (GEO) & SEO Subsystem

- **Machine-Readable LLM Manifests**:
  - `GET /llms.txt`: Curated Markdown summary of platform learning paths, DSA patterns, and system design curricula for AI search agents (Perplexity, ChatGPT, Claude).
  - `GET /llms-full.txt`: Full comprehensive educational export and curriculum specification for LLM ingestion.
- **Dynamic XML Sitemap & Robots**:
  - Dynamic `app/sitemap.ts` (`/sitemap.xml`) indexing all public patterns, variations, subjects, cheatsheets, and interview questions under `bigoprep.tech`.
  - Dynamic `app/robots.ts` (`/robots.txt`) with custom rules for AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.) and security exclusions for admin/auth routes.
- **Schema.org Structured Data**: Rich JSON-LD microdata across public pages (`Course`, `SoftwareApplication`, `EducationalOrganization`, `FAQPage`, `BreadcrumbList`).

---

## 10. Observability, Telemetry & Compliance

- **Distributed Tracing**: Configured via OpenTelemetry (`instrumentation.ts` + `docker-compose.telemetry.yml`) capturing HTTP spans, database query latencies, and runner round-trip metrics.
- **Privacy & Cookie Consent**:
  - `CookieConsentBanner` halts tracking scripts until explicit user opt-in.
  - Candidate IP addresses are hashed and zero biometric video feeds touch external analytics.
- **Testing Infrastructure**:
  - **Vitest 4**: Sub-3-second full test execution (8 test files, 32 passed, ~2.2s runtime).
  - `@testing-library/react` + `jsdom`: Unit and component DOM verification.
