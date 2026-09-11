# BigO ⚡

> **Personal Placement-Prep Tracker, Online Assessment (OA) Simulator & Core CS Knowledge Base**

**BigO** is an enterprise-ready, invite-only placement preparation ecosystem and technical assessment simulator designed for software engineering candidates preparing for high-stakes technical interviews, timed Online Assessments (OAs), and core CS rounds at top tier tech companies (Google, Amazon, Meta, Uber, etc.).

Unlike traditional problem trackers, BigO integrates **pattern-oriented DSA tracking**, **core computer science subject revision**, **system design deep-dives**, **competitive programming profile synchronization**, **automated contest alerts**, and a **client-side, dual-engine neural proctoring engine** powered by TensorFlow.js, Google BlazeFace, and COCO-SSD.

---

## ✨ Key Capabilities

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       BigO Placement Platform                                     │
├──────────────────────────────┬──────────────────────────────┬────────────────────────────────────┤
│   🧩 Pattern DSA Tracker     │    💻 OA Simulator & Runner  │    🛡️ Dual-Engine Neural Proctor   │
│   - 12+ Core DSA Patterns    │    - Real-time Monaco IDE    │    - Google BlazeFace (180ms)      │
│   - Curated Sub-Variations   │    - Judge0 / Piston Engine  │    - COCO-SSD Object Detector      │
│   - Markdown Note Drawers    │    - Visible & Hidden Tests  │    - Real-Time SVG Landmark HUD    │
│   - 1-Click ⭐ Revision Book │    - Live Execution (12/min) │    - Groq Llama-3 Forensic Audit   │
├──────────────────────────────┼──────────────────────────────┼────────────────────────────────────┤
│   🏆 Multi-Platform CP Sync  │    📅 Global Contest Alerts  │    💳 Dynamic Billing & Promos     │
│   - Codeforces, LeetCode     │    - Automated Scraping Cron │    - Dynamic Database Pricing Plans│
│   - CodeChef, AtCoder Sync   │    - 15-Min GitHub Crons     │    - Promo Codes & Discounts       │
│   - Normalized 0-100 Rating  │    - QStash + Resend Emails  │    - MRR/ARR Financial Analytics   │
└──────────────────────────────┴──────────────────────────────┴────────────────────────────────────┘
```

---

### 🛡️ 1. Enterprise Dual-Engine Neural Proctoring
*Engineered from the ground up for high-integrity assessments without native desktop downloads or intrusive kernel drivers.*

- **Browser-Accelerated Client Inference**: All biometric and computer vision computations execute **100% client-side** using **WebGL** via TensorFlow.js. Zero raw webcam feeds are streamed to external servers, protecting candidate privacy while eliminating server streaming costs.
- **Dual-Loop Execution Pipeline**:
  - **Fast Biometrics Loop (180ms / ~6 FPS)**: Google BlazeFace model tracks facial presence, 6 3D keypoints, geometric head pose ($Yaw$ and $Pitch$ angular deviations), eye-distance scale, and multiple person presence in $<30\text{ms}$.
  - **Throttled Object Detection Loop (450ms / ~2 FPS)**: COCO-SSD (MobileNet-v2) inference identifies unauthorized mobile devices (`cell phone`, angled `remote` alias), physical textbooks (`book`), secondary monitors (`laptop`, `tv`), and peripheral persons.
- **Spatial Multi-Zone Optical Fallback (`device-analyzer.ts`)**:
  - Dynamically calculates a spatial exclusion bounding box around candidate head and torso ($x \pm 75\%$, $y \pm 85\%$) so hair, eyeglasses, and dark clothing are never mistaken for phone bezels.
  - Independently scans Left, Right, and Lower-desk zones for dense rectangular items with smartphone aspect ratios ($1.25$ to $2.6$).
- **Anti-False-Positive Face Presence Guard**: Prohibited device analysis is strictly contingent on active candidate presence (`faceStatus === 'verified'`). If a candidate leaves their desk, device warnings caused by room furniture, high-back chairs, or shadows are completely suppressed.
- **2.2-Second UI Alert Debounce**: Flashing visual alerts are eliminated via persistent debounce timers that hold warning states for a minimum of 2200ms before decaying.
- **Acoustic Speech & Whisper Detection (`acoustic-analyzer.ts`)**: Native Web Audio API 256-point FFT frequency analyzer tracking normalized Root-Mean-Square (RMS) audio energy to flag third-party prompting or background speech.
- **Draggable Interactive HUD Overlay**: Floating Picture-in-Picture window featuring a live SVG biometric landmark wireframe, visual gaze tracking vectors, 0–100% facial confidence gauges, and real-time status badges.
- **Tamper-Proof Evidence Vault (`storage.ts`)**: Infraction snapshots are compressed to ultra-lightweight WebP files ($<25\text{ KB}$) and uploaded directly to **Cloudflare R2** using zero-dependency signed AWS SigV4 PUT requests.
- **Automated Behavioral LLM Forensic Audit (`activity-analyzer.ts`)**: Post-assessment chronological telemetry (gaze deviations, tab blurs, blocked copy-paste bursts, audio anomalies, face absences) is synthesized into an executive integrity report with risk score (0–100) and verdict (`CLEAN`, `SUSPICIOUS`, `FLAGGED`) using **Groq Llama-3.3-70B**, **Hugging Face**, or a deterministic fallback engine.

*(For full technical specifications, see [docs/proctoring.md](./docs/proctoring.md))*

---

### 💻 2. Online Assessment (OA) Simulator & Code Execution Harness
*Realistic technical interview simulation recreating corporate OA platforms (HackerRank, Codility, CodeSignal).*

- **Company-Specific Exam Catalog**: Practice verified OA problem sets tailored to top employers (Google L4, Amazon SDE 2, Uber, Meta, Microsoft) with realistic time limits.
- **Embedded Monaco Editor**: Full-featured code editor with syntax highlighting, language selection (C++, Python, Java), bracket matching, and indentation controls.
- **Multi-Engine Execution Architecture**: Evaluates candidate code using containerized **Docker Piston** (`docker-compose.runner.yml`), cloud **Judge0**, or deterministic offline heuristics.
- **Competitive Programming Testcase Parser**: Deserializes complex parameter strings (`target = 7, nums = [2,3,1,2,4,3]`) and standard multi-line competitive programming stdin streams.
- **Interactive Test Execution (`/api/oa/execute`)**: Enforces sliding-window rate limiting (12 runs/min) and tests code against visible sample cases or custom inputs before submitting.
- **Automated Hidden Grading**: On submission (`/api/oa/assessments/[slug]/submit`), candidate code is evaluated against complete hidden testcase suites with Time Limit Exceeded (TLE) and Wrong Answer (WA) diagnostics.
- **Fullscreen & Focus Lockdown**: Enforces HTML5 fullscreen mode. Window blur, Alt-Tab switching, and background navigation are detected and logged as integrity violations.
- **External Paste Interception**: Pasting code from external clipboards is actively blocked, with violations recorded in the forensic timeline.
- **Comprehensive Candidate Reports (`/oa/[slug]/report/[id]`)**: Generates problem pass rates, runtime performance percentiles, pattern diagnostic breakdowns, and proctoring telemetry audit streams.

---

### 🏆 3. Multi-Platform Competitive Programming (CP) Sync
*Unified competitive programming performance tracker and analytics dashboard.*

- **Multi-Platform Rating Scraper**: Connects candidate handles across **Codeforces**, **LeetCode**, **CodeChef**, and **AtCoder**.
- **Composite Placement Score**: Algorithmically computes a normalized 0–100 placement readiness index based on active rating percentiles, peak ratings, and total problems solved.
- **Interactive Performance Charts**: Rating progression graphs and global rank analytics powered by Recharts.
- **Automated Background Rating Refresh**: Scheduled cron workers keep candidate statistics and contest rating changes constantly up to date.

---

### 📅 4. Global Contest Alerts Engine
*Never miss a competitive programming contest again.*

- **Cross-Platform Contest Index**: Automated scrapers discover and track upcoming and ongoing contests across Codeforces, LeetCode, CodeChef, and AtCoder.
- **Hybrid Cron Scheduling**: Runs a 15-minute GitHub Actions workflow (`.github/workflows/contest-alerts-cron.yml`) to evaluate notification windows (24h, 2h, 30m prior) and daily Vercel crons for aggregator syncing.
- **Customizable Alert Schedules**: Candidates choose when to receive notifications (e.g. 24 hours prior, 1 hour prior).
- **QStash & Resend Email Delivery**: Transactional email notifications dispatched asynchronously with zero impact on application latency.
- **One-Click Unsubscribe**: Cryptographically signed unsubscribe tokens for seamless alert preference management.

---

### 💳 5. Monetization, Dynamic Billing & Promo Codes
*Production-ready commercialization architecture with flexible pricing tiers and financial dashboards.*

- **Tier Matrix**:
  - **Free Tier**: Access to core DSA pattern tracker, basic topic notes, and 1 practice assessment.
  - **Pro Monthly / Pro Annual**: Unlimited pattern variations, complete system design modules, advanced interview flashcards, and full contest sync.
  - **OA Single-Pass**: Standalone token providing access to full enterprise-proctored OA simulations with detailed LLM behavioral reports.
- **Dynamic Pricing Configuration (`pricing_plans`)**: MongoDB-stored plans allowing administrators to change prices, badges, and features without code redeployment.
- **Promo Code System (`promo_codes`)**: Generate percentage or fixed dollar discount codes with plan applicability, maximum redemption caps, and expiration tracking (`/api/promo/validate`).
- **Administrative Billing Dashboard (`/admin/billing`)**: Real-time MRR, ARR, active subscriber breakdowns, 6-month historical revenue charts (`RevenueTrendChart.tsx`), and manual plan grant/revocation.
- **Stripe Checkout & Billing Portal**: Seamless session redirection, customer management, and self-serve subscription cancellation.
- **Cryptographic Webhook Verification**: `/api/webhooks/stripe` handles `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted`.
- **Dev-Mode Mock Simulator**: Zero-friction local development bypass (`/api/checkout/mock-confirm`) enabling instant tier upgrades and quota resets without Stripe API credentials.
- **AI Quota Accounting**: Enforces limits on automated behavioral forensic reviews and assessment attempts per billing period.

---

### 🧩 6. Pattern-Based DSA Tracker & Problem Base
- **12+ Core Patterns**: Sliding Window, Two Pointers, Binary Search, Backtracking, Dynamic Programming, Graphs, Trees, Monotonic Stack, Overlapping Intervals, Prefix Sum, Segment Tree, and Greedy.
- **Pattern Variations**: Problems are grouped by fundamental variation rather than isolated questions, allowing candidates to master underlying solution patterns.
- **Rich Problem Metadata**: Difficulty tiers (`Easy`, `Medium`, `Hard`), platform links (LeetCode, Codeforces, AtCoder), priority rankings, and company tags.
- **Personal Notes & Revision Bookmarks**: Per-problem Markdown notes editor with live preview and one-click revision bookmarks (`⭐`).
- **Non-Standard & Custom DSA**: Discriminator-backed tracking for ad-hoc algorithm challenges and personal problem buckets.

---

### 📚 7. Core CS Subjects & Advanced Topics
- **Core CS Modules**: Comprehensive concept notes and interview revision for Operating Systems (OS), Database Management Systems (DBMS), Computer Networks (CN), and Object-Oriented Programming (OOP).
- **Advanced Topics & System Design**: Deep dives into DevOps, Docker, Kubernetes, Distributed Systems, API Gateways, and Generative AI.
- **Markdown Editor**: Integrated `@uiw/react-md-editor` with sanitization, auto-saving, and syntax highlighting via Shiki.
- **Interview Q&A Flashcards**: Quick-flip interview question lists grouped by subject for rapid pre-interview revision.
- **Cheat Sheets**: Topic-wise reference sheets with code snippets, formula summaries, and quick commands.

---

### 📊 8. Personal Profile & LeetCode-Style Heatmap
- **User Profile Dashboard (`/profile`)**: Personal stats overview, avatar/name editing, overall completion progress, difficulty mix (`Easy`, `Medium`, `Hard`), starred revision items (⭐), and Markdown notes count (📝).
- **LeetCode Monthwise Activity Heatmap**: 12-month block activity graph (`Aug` – `Aug`) matching LeetCode's exact layout, featuring active streak counters, 60s/1yr timefilters, and palette toggles (🟢 LeetCode Emerald / 🔴 BigO Rose).
- **Pattern Mastery Grid**: Interactive per-pattern progress bars tracking DSA variation completion.

---

### 🛡️ 9. Security, RBAC & Mandatory OTP Verification
- **Mandatory OTP Verification**: 6-digit One-Time Password (OTP) dispatched via Resend (`BigO <no-reply@bigoprep.tech>`) on signup and unverified logins. Protected routes strictly require `emailVerified: true`.
- **User Management & Invites**: Admin controls to view user progress, manage roles (`admin` / `user`), issue invite tokens, or reset credentials.
- **Taxonomy & Content Management**: Dynamic admin editor for managing patterns, variations, curated problems, subjects, platforms, and difficulty tiers.
- **Audit Activity Feed**: Global activity log recording user achievements, administrative actions, and proctoring events.

---

### 🏛️ 10. Enterprise Campus & Institutional B2B Suite
- **SuperAdmin Campus Hub (`/admin/institutions`)**: Contract lifecycle and student seat license provisioning with university domain constraints (e.g. `@iitb.ac.in`).
- **Nationwide Placement Drive Radar (`/admin/institutions/live-drives`)**: Real-time cross-university telemetry tracking active candidate concurrency, scheduled placement windows, and emergency controls.
- **Candidate Incident Desk (`/admin/proctoring`)**: Centralized AI forensic review queue with second-by-second timeline scrubbing, Cloudflare R2 infraction snapshots, and Groq LLM behavioral narratives.
- **Isolated TPC Campus Portal (`/portal/*`)**: Dedicated institutional control room strictly walled off from SuperAdmin views, empowering college Training & Placement Cells (TPC Head, Coordinators, Invigilators) to schedule drives, invigilate students live, and export placement scorecards (RFC 4180 CSV).
- **Code Runner & Telemetry Operations Center (`/admin/system/runner`)**: Live Docker Piston runner health monitor, round-trip cluster latency gauges (MongoDB Atlas, Upstash Redis), submission throughput charts, and live container sandbox diagnostics.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose & Description |
| --- | --- | --- |
| **Framework** | Next.js 16 (App Router) + React 19 | Server Components, Server Actions, Route Handlers with `after()` post-response background writes |
| **Language** | TypeScript (Strict) | End-to-end type safety across domain types (`types/`), proctoring types (`lib/proctor/types.ts`), and runner types |
| **Code Execution Engine** | Docker Piston / Judge0 | Isolated container runner (`docker-compose.runner.yml`) or RapidAPI Judge0 with deterministic heuristic fallback |
| **Client-Side AI & CV** | TensorFlow.js (WebGL Backend) | Hardware-accelerated browser neural inference engine running BlazeFace and COCO-SSD |
| **Biometric Face Tracking** | Google BlazeFace | Sub-30ms landmark detection (6 3D keypoints), multiple face detection, and geometric head pose estimation |
| **Object Detection** | COCO-SSD (MobileNet-v2) | Real-time classification of unauthorized hardware devices (`cell phone`, `remote`, `laptop`, `book`) |
| **Audio Telemetry** | Web Audio API | Client-side 256-point FFT frequency node tracking normalized RMS volume and vocal speech anomalies |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`) | Full desktop-grade IDE experience with multi-language syntax highlighting and autocompletion |
| **Reader Layout** | `ReaderLayout` Subsystem | Immersive distraction-free reading experience for CS subjects and cheatsheets with dynamic table of contents |
| **Evidence Storage** | Cloudflare R2 | S3-compatible, ultra-low-cost private object storage via native Node.js crypto AWS SigV4 signed PUT uploads |
| **Behavioral LLM Forensics**| Groq (Llama-3.3-70B) / Hugging Face | Sub-second telemetry evaluation and integrity report generation with deterministic offline fallbacks |
| **Payment Gateway & Promos**| Stripe + Dynamic Pricing Models | Dynamic MongoDB pricing plans, promotional discount codes, Checkout Sessions, Customer Portal, and Webhooks |
| **Authentication** | Better Auth | MongoDB adapter with session tokens, RBAC (`admin` / `user`), and database-backed rate limiting |
| **Database & ODM** | MongoDB Atlas + Mongoose 9 | Document database with discriminators for `Problem` and `Group` entities, pool size capped at 3 for M0 |
| **Caching & CDN Headers** | Multi-Tier (Memory + Redis + CDN) | L1 memory cache + L2 Upstash Redis (`lib/cache.ts`) + `CDN-Cache-Control` / `Vercel-CDN-Cache-Control` edge headers |
| **Async Task Queue & Crons**| Upstash QStash + GitHub Actions | Decoupled background task queue for email dispatch plus 15-minute GitHub Actions contest alert crons |
| **Styling** | Tailwind CSS v4 + Base UI + Shadcn | Modern UI primitives, dark mode, custom color ramps, and micro-animations |
| **Charts** | Recharts | Responsive completion trend charts, difficulty mix charts, CP rating graphs, and 6-month revenue trends |
| **Email Service** | Resend + React Email | Transactional emails with React Email templates dispatched asynchronously via QStash |
| **Observability** | OpenTelemetry | Distributed tracing, instrumentation, Prometheus & Grafana support |

---

## 📁 Repository Structure

```
.
├── .github/workflows/                 # CI/CD & Automated Crons
│   └── contest-alerts-cron.yml        # 15-minute CP contest alert & aggregator triggers
├── app/                               # Next.js 16 App Router
│   ├── (admin)/admin/                 # Protected Admin Management Panel
│   │   ├── activity/                  # Global cross-user audit feed
│   │   ├── billing/                   # Financial MRR/ARR, trends & promo code manager
│   │   ├── content/                   # Content tables (Assessments, Problems, Topics)
│   │   ├── feedback/                  # User feedback review & moderation
│   │   ├── invites/                   # Invite manager & token issuance
│   │   ├── settings/                  # Feature flags & system settings
│   │   ├── taxonomies/                # Category taxonomy editor
│   │   └── users/                     # User management & read-only dashboards
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
│       ├── admin/                     # Admin assessments, billing, promos, pricing
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
│   ├── runner/                        # Isolated Code Execution Runner (harness, judge0)
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

---

## 🔑 Environment Variables Reference

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

| Variable | Description | Required | Example |
| --- | --- | --- | --- |
| `MONGODB_URI` | MongoDB connection URI string | Yes | `mongodb+srv://...` |
| `MONGODB_DB` | Database name | Yes | `bigo` |
| `BETTER_AUTH_SECRET` | 32-byte Base64 key for session signing | Yes | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Base application URL for BetterAuth | Yes | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | Frontend origin URL exposed to browser | Yes | `http://localhost:3000` |
| `RESEND_API_KEY` | Resend API key for transactional emails | Yes | `re_xxx` (or `re_dummy` in dev) |
| `EMAIL_FROM` | Sender address verified on Resend domain | Yes | `BigO <no-reply@bigoprep.tech>` |
| `STRIPE_SECRET_KEY` | Stripe secret API key | Optional (Dev) | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Optional (Dev) | `whsec_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`| Stripe publishable API key | Optional (Dev) | `pk_test_...` |
| `PAYMENT_PROVIDER` | Active payment processor (`stripe` / `lemonsqueezy`) | Optional | `stripe` |
| `CODE_RUNNER_URL` | Sandboxed code execution endpoint (Piston) | Optional (Dev) | `http://localhost:2000/api/v2/execute` |
| `JUDGE0_API_URL` | Production Judge0 fallback code execution endpoint | Optional | `https://judge0-ce.p.rapidapi.com` |
| `JUDGE0_API_KEY` | Judge0 RapidAPI or authentication key | Optional | `xxx...` |
| `CRON_SECRET` | Bearer authorization token for cron triggers | Optional | `openssl rand -hex 32` |
| `R2_ACCOUNT_ID` | Cloudflare R2 Account ID | Optional (Dev) | `xxx...` |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 Access Key ID | Optional (Dev) | `xxx...` |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 Secret Access Key | Optional (Dev) | `xxx...` |
| `R2_BUCKET_NAME` | Cloudflare R2 Bucket Name | Optional (Dev) | `bigo-proctor-snapshots` |
| `R2_PUBLIC_URL` | Cloudflare R2 Custom Public Domain URL | Optional (Dev) | `https://cdn.bigoprep.tech` |
| `GROQ_API_KEY` | Groq API Key for Llama-3.3 forensic reports | Optional (Dev) | `gsk_...` |
| `HUGGINGFACE_API_KEY` | Hugging Face fallback API Key | Optional (Dev) | `hf_...` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL | Optional (Dev) | `https://xxx.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST Token | Optional (Dev) | `Axxx...` |
| `QSTASH_TOKEN` | Upstash QStash Token | Optional (Dev) | `eyxxx...` |

---

## 🚀 Getting Started & Local Development

### 1. Prerequisites
- **Node.js**: v20 LTS or higher
- **npm**: v10 or higher
- **MongoDB**: MongoDB Atlas instance or local MongoDB instance
- **Docker** *(Optional)*: For running the local sandboxed Piston code runner

### 2. Installation
```bash
# Clone repository
git clone https://github.com/MayankV004/OA-prep.git bigo
cd bigo

# Install project dependencies
npm install

# Setup environment variables
cp .env.example .env.local
```

### 3. Launch Sandboxed Code Runner (Optional)
To test code execution locally without third-party API quotas:
```bash
docker compose -f docker-compose.runner.yml up -d
```
*(Runs Piston API on `http://localhost:2000`)*

### 4. Seed Database
Run the database seed scripts to populate curated DSA patterns, variations, advanced CS topics, and company assessments:
```bash
# Seed 12+ Core DSA Patterns & Variations into MongoDB
npx tsx scripts/seed-mongo-patterns.ts

# Seed System Design & Advanced CS Topic Groups
npx tsx scripts/seed-advanced-topics.ts

# Seed Curated Company OA Assessments & Testcases
npx tsx scripts/seed-assessments.ts
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ CLI Utilities & Maintenance Scripts

BigO includes dedicated CLI helper scripts in `scripts/`:

- **Seed Patterns**: `npx tsx scripts/seed-mongo-patterns.ts` — Upserts curated DSA patterns and variations into MongoDB from `data/pattern-dsa/`.
- **Seed Advanced Topics**: `npx tsx scripts/seed-advanced-topics.ts` — Seeds System Design, DevOps, Docker, Kubernetes, and GenAI content.
- **Seed Assessments**: `npx tsx scripts/seed-assessments.ts` — Seeds curated company OA challenges, boilerplate code, and testcases.
- **Promote Admin**: `npx tsx scripts/promote-admin.ts --email user@example.com` — Grants `admin` role to a registered user account directly in MongoDB.
- **Test Email Dispatch**: `npx tsx scripts/test-email.ts --to user@example.com` — Tests invite email rendering and Resend API/dev-mock dispatch.
- **Benchmark Email Capacity**: `npx tsx scripts/benchmark-email-capacity.ts` — Measures email throughput (RPS), latency percentiles (P50/P90/P99), and rate limits.
- **Clear Advanced Data**: `npx tsx scripts/clear-advanced-data.ts` — Resets advanced topic categories and cheatsheet collections.
- **Flush Database**: `npx tsx scripts/flush_data.ts` — Resets non-user MongoDB collections during local environment resets.
- **Check Contrast**: `python3 scripts/check-contrast.py` — Evaluates WCAG AA/AAA color contrast ratios across UI theme tokens.

---

## 🔒 Security & Data Integrity

- **Client-Side Biometric Privacy**: Video feeds remain inside the candidate's browser runtime. Zero continuous video streams are stored or transmitted.
- **Hardware-Accelerated Anti-Cheat**: Real-time multi-person, prohibited device, and gaze deviation tracking backed by TensorFlow.js WebGL.
- **Encrypted Snapshot Vault**: Infraction snapshots are uploaded to private Cloudflare R2 storage using native AWS SigV4 signatures.
- **Sandboxed Code Execution**: Multi-tier isolated runner harness (Docker Piston container / Judge0 CE) with memory, execution time, and syscall isolation.
- **Middleware Route Protection**: `proxy.ts` guards protected routes and applies sliding-window rate limiting to API endpoints.
- **Sanitized Markdown Rendering**: `rehype-sanitize` strips unsafe tags (`<script>`, `<iframe>`, `<form>`) while preserving syntax highlighting and safe links.
- **Role-Based Access Control**: `withAuth` and `withRole('admin')` helpers gate API route handlers. Service layers enforce strict resource ownership checks (`userId === actorUserId`).
- **Encrypted Invite Tokens**: Raw 32-byte invite tokens exist only in email links; database stores SHA-256 token hashes (`tokenHash`).

---

## 📚 Complete Documentation Index

For in-depth architectural specifications and subsystem guides, refer to the [`docs/`](./docs) directory:

| Document | Description |
| --- | --- |
| 📖 **[PRD](./docs/PRD.md)** | Product requirements, user personas, functional specifications (Code Runner, Contests, Dynamic Billing, ReaderLayout), system scope, and non-goals. |
| 🏗️ **[Architecture](./docs/architecture.md)** | Technical stack wiring, sandboxed code execution, dual-loop proctoring pipeline, dynamic billing, ReaderLayout, multi-tier CDN caching, proxy/middleware, and complete directory tree. |
| 🛡️ **[Neural Proctoring](./docs/proctoring.md)** | **Enterprise Dual-Engine Neural Proctoring**: BlazeFace biometrics, COCO-SSD device detection, optical fallback, HUD, R2 storage, and LLM forensics. |
| 🔌 **[API Specification](./docs/api.md)** | REST API endpoint documentation, parameter schemas, request/response bodies, dynamic billing, and HTTP status codes. |
| 🗄️ **[Schema](./docs/schema.md)** | MongoDB collection schemas, Mongoose models (`Assessment`, `AssessmentSubmission`, `PricingPlan`, `PromoCode`, `Subscription`, `UserCpProfile`, `Contest`, `Pattern`, `Feedback`, etc.), and indexes. |
| 💳 **[Monetization](./docs/monetization.md)** | Commercialization strategy, dynamic pricing tiers (`pricing_plans`), promo codes engine (`promo_codes`), and admin MRR/ARR analytics. |
| 🔒 **[Security](./docs/security.md)** | Authentication mechanisms, sandboxed code isolation, anti-cheat client protection, session cookies, RBAC, Markdown XSS containment, and CSP headers. |
| 🛠️ **[Setup Guide](./docs/setup.md)** | Complete guide for local development, Docker code runner setup, MongoDB setup, Resend email configuration, and environment reference. |
| 🚀 **[Deployment Guide](./docs/deployment.md)** | Step-by-step production deployment guide for Vercel, MongoDB Atlas, Cloudflare R2, GitHub Actions 15-minute contest crons, Stripe Webhooks, and post-deploy verification. |
| 🛡️ **[Admin Panel](./docs/admin.md)** | Administrative features, user management, invite token workflows, company assessment editor, billing analytics dashboard, feedback moderation, dynamic taxonomies, and audit logging. |
| 📈 **[Scalability](./docs/scalability.md)** | Scalability architecture, Upstash Redis caching, connection pooling, and database optimization. |
| 💡 **[Novelty](./docs/novelity.md)** | Core novelty angles: failure forensics, high-fidelity OA simulation environment, reasoning capture, and post-OA replay debriefs. |

---

## 📄 License

Private Repository / All Rights Reserved © BigO.
