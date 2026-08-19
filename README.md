# BigO ⚡

> **Personal Placement-Prep Tracker & Core CS Knowledge Base**

**BigO** is a multi-user, invite-only placement preparation tracker and computer science knowledge platform designed for software engineering candidates preparing for technical interviews, coding assessments (OAs), and core CS rounds.

Unlike generic problem trackers, BigO organizes DSA problems by **core pattern variations**, provides deep notes for **Core CS subjects** and **System Design/Advanced Topics**, and offers interactive **Interview Flashcards** and **Cheat Sheets** backed by visual progress analytics and administrative controls.

---

## ✨ Key Features

### 🧩 1. Pattern-Based DSA Tracker
- **12+ Core Patterns**: Structured around Sliding Window, Two Pointers, Binary Search, Backtracking, Dynamic Programming, Graphs, Trees, Monotonic Stack, Overlapping Intervals, Prefix Sum, Segment Tree, and Greedy.
- **Pattern Variations**: Problems are grouped by fundamental variation rather than isolated questions, allowing candidates to master underlying solution patterns.
- **Rich Problem Metadata**: Difficulty tiers (`Easy`, `Medium`, `Hard`), platform links (LeetCode, Codeforces, AtCoder), priority rankings, and company tags.
- **Personal Notes & Revision Bookmarks**: Per-problem Markdown notes editor with live preview and one-click revision bookmarks (`⭐`).

### 📚 2. Core CS Subjects & Advanced Topics
- **Core CS Modules**: Comprehensive concept notes and interview revision for Operating Systems (OS), Database Management Systems (DBMS), Computer Networks (CN), and Object-Oriented Programming (OOP).
- **Advanced Topics & System Design**: Deep dives into DevOps, Docker, Kubernetes, Distributed Systems, API Gateways, and Generative AI.
- **Markdown Editor**: Integrated `@uiw/react-md-editor` with sanitization, auto-saving, and syntax highlighting via Shiki.

### 🃏 3. Interview Q&A Flashcards & Cheat Sheets
- **Flashcards**: Quick-flip interview Q&A lists grouped by subject for rapid pre-interview revision.
- **Cheat Sheets**: Topic-wise reference sheets with code snippets, formula summaries, and quick commands.

### 📊 4. Personal Dashboard & Analytics
- **Activity Heatmap**: 90-day GitHub-style SVG contribution heatmap tracking daily problem completions and note updates.
- **Completion Trends**: Recharts line charts tracking daily completion velocity over time.
- **Difficulty Mix**: Visual stacked bar breakdown of Easy, Medium, and Hard problems solved.
- **Category Progress**: Per-pattern and per-subject progress percentage bars.

### 🛡️ 5. Admin Panel & User Governance
- **Invite-Only Registration & Automated Emails**: Public registration is disabled; admins issue secure invite tokens dispatched via email. Automated welcome emails are sent upon acceptance, and inviter notification emails alert admins when invites are accepted.
- **User Management**: Admin controls to view user progress, change roles (`admin` / `user`), enable/disable accounts, or reset credentials.
- **Taxonomy Management**: Dynamic editor for managing patterns, subjects, platforms, buckets, and difficulty tiers.
- **Audit Activity Feed**: Global activity log recording user achievements, administrative actions, and system events.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| --- | --- | --- |
| **Framework** | Next.js 16 (App Router) | React Server Components, Client Components & Route Handlers |
| **Language** | TypeScript | Strict type safety across frontend and backend API layers |
| **Authentication** | Better Auth | MongoDB adapter with session tokens and role-based access control |
| **Database & ODM** | MongoDB Atlas + Mongoose 9 | Document database with discriminators for `Problem` and `Group` entities |
| **Client State** | TanStack Query v5 | Server state caching with `localStorage` client persistence |
| **Middleware** | `proxy.ts` | Next.js request interceptor for route protection and rate limiting |
| **Styling** | Tailwind CSS v4 + Base UI + Shadcn | Modern UI primitives, dark mode, custom color ramps, and animations |
| **Charts** | Recharts | Responsive completion trend charts and difficulty distribution bars |
| **Email Service** | Resend + React Email | Transactional emails with React Email templates (`Invite`, `WelcomeConfirmation`, `InviteAccepted`, `PasswordReset`) and dev-mode fallback |
| **Observability** | OpenTelemetry | Distributed tracing, instrumentation, Prometheus & Grafana support |
| **Markdown** | React-Markdown + Rehype-Sanitize | Secure Markdown rendering with XSS containment and syntax highlighting |

---

## 📁 Repository Structure

```
.
├── app/                        # Next.js 16 App Router
│   ├── (admin)/admin/          # Protected Admin Management Panel
│   │   ├── activity/           # Cross-user global audit feed
│   │   ├── content/            # Content tables (Problems, Topics, Cheatsheets, Questions)
│   │   ├── invites/            # Pending, accepted, and revoked invite manager
│   │   ├── settings/           # System feature flags and configurations
│   │   ├── taxonomies/         # Taxonomy category editor
│   │   └── users/              # User list and user detail dashboards
│   ├── (app)/                  # Main Application Pages
│   │   ├── advanced/           # Advanced CS Topics & System Design
│   │   ├── cheatsheets/        # Markdown Cheat Sheets
│   │   ├── cp/                 # Competitive Programming tracker
│   │   ├── dashboard/          # Personal Analytics & Heatmap Dashboard
│   │   ├── dsa/                # Pattern-based DSA tracker
│   │   ├── interview/          # Interview Q&A Flashcards
│   │   ├── non-standard/       # Custom & Ad-hoc DSA bucket tracker
│   │   ├── search/             # Multi-entity text search
│   │   └── subjects/           # Core CS Subject notes
│   ├── (auth)/                 # Authentication Routes
│   │   ├── invite/[token]/     # Public invite acceptance page
│   │   └── sign-in/            # Sign-in page
│   └── api/                    # REST API Route Handlers under /api/*
├── components/                 # Component Library
│   ├── admin/                  # Admin panel forms, tables, and taxonomy editors
│   ├── dashboard/              # Recharts components, heatmaps, activity feed
│   ├── markdown/               # Markdown editor (Editor.tsx) and viewer (View.tsx)
│   ├── problem/                # Problem tables, drawer notes, revision toggles
│   ├── shell/                  # Navigation shell, sidebar, header, breadcrumbs
│   └── ui/                     # Reusable Shadcn & Base UI primitives
├── docs/                       # Comprehensive System Architecture & Operations Docs
├── emails/                     # React Email templates (Invite, WelcomeConfirmation, InviteAccepted, PasswordReset)
├── grafana/                    # Grafana dashboards and Prometheus datasource configs
├── lib/                        # Utility Modules
│   ├── activity.ts             # Activity logging service
│   ├── auth.ts                 # Better Auth server configuration and withAuth/withRole gates
│   ├── auth-client.ts          # Better Auth client hooks
│   ├── db.ts                   # Mongoose connection caching
│   ├── email.ts                # Resend email dispatch service & dev mock handler
│   └── zod/                    # Zod validation schemas
├── models/                     # Mongoose Schemas (User, Pattern, UserProgress, Problem, etc.)
├── scripts/                    # Database Seeding & Maintenance CLI Tools
│   ├── benchmark-email-capacity.ts # Email capacity & latency benchmark runner
│   ├── check-contrast.py       # WCAG color contrast audit utility
│   ├── clear-advanced-data.ts  # Advanced topics & cheatsheets reset script
│   ├── flush_data.ts           # Non-user database collection reset
│   ├── promote-admin.ts        # Admin role promotion utility
│   ├── seed-advanced-topics.ts # System Design & Advanced CS topics seeder
│   ├── seed-mongo-patterns.ts  # DSA patterns & variations seeder
│   └── test-email.ts           # Email dispatch testing script
├── proxy.ts                    # Next.js Middleware (Auth check & Rate Limiting)
├── instrumentation.ts          # OpenTelemetry initialization
└── docker-compose.telemetry.yml# Prometheus & Grafana docker telemetry stack
```

---

## 🔑 Environment Variables Reference

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

| Variable | Description | Required | Example |
| --- | --- | --- | --- |
| `MONGODB_URI` | MongoDB Atlas / local connection string | Yes | `mongodb+srv://user:pass@cluster.mongodb.net` |
| `MONGODB_DB` | MongoDB database name | Yes | `bigo` |
| `BETTER_AUTH_SECRET` | Base64 secret key for session signing | Yes | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Base application URL for Auth | Yes | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | Application origin URL exposed to browser | Yes | `http://localhost:3000` |
| `RESEND_API_KEY` | Resend API Key for transactional emails | Yes | `re_xxx` (or `re_dummy` for dev mock) |
| `EMAIL_FROM` | Sender address verified on Resend domain | Yes | `BigO <no-reply@bigo.app>` |
| `EMAIL_REPLY_TO` | Reply-to address for emails | No | `support@yourdomain.com` |
| `INVITE_TOKEN_TTL_HOURS` | Expiration window for invite links | No | `168` (default 7 days) |
| `ADMIN_BOOTSTRAP_EMAIL` | Admin email created on first seed | Initial | `admin@example.com` |
| `ADMIN_BOOTSTRAP_PASSWORD` | Admin password created on first seed | Initial | `strongpassword123` |

---

## 🚀 Getting Started & Local Development

### 1. Prerequisites
- **Node.js**: v20 LTS or higher
- **npm**: v10 or higher
- **MongoDB**: MongoDB Atlas instance or local MongoDB instance

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/MayankV004/OA-prep.git bigo
cd bigo

# Install project dependencies
npm install

# Setup environment variables
cp .env.example .env.local
```

### 3. Seed Database
Run the database seed scripts to populate curated DSA patterns and advanced CS topics:
```bash
# Seed 12+ Core DSA Patterns & Variations into MongoDB
npx tsx scripts/seed-mongo-patterns.ts

# Seed System Design & Advanced CS Topic Groups
npx tsx scripts/seed-advanced-topics.ts
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ CLI Utilities & Maintenance Scripts

BigO includes dedicated CLI helper scripts in `scripts/`:

- **Seed Patterns**: `npx tsx scripts/seed-mongo-patterns.ts` — Upserts curated DSA patterns and variations into MongoDB from `data/pattern-dsa/`.
- **Seed Advanced Topics**: `npx tsx scripts/seed-advanced-topics.ts` — Seeds System Design, DevOps, Docker, Kubernetes, and GenAI content.
- **Promote Admin**: `npx tsx scripts/promote-admin.ts --email user@example.com` — Grants `admin` role to a registered user account directly in MongoDB.
- **Test Email Dispatch**: `npx tsx scripts/test-email.ts --to user@example.com` — Tests invite email rendering and Resend API/dev-mock dispatch.
- **Benchmark Email Capacity**: `npx tsx scripts/benchmark-email-capacity.ts` — Measures email throughput (RPS), latency percentiles (P50/P90/P99), and rate limits (`--requests`, `--concurrency`, `--to`, `--mock`).
- **Clear Advanced Data**: `npx tsx scripts/clear-advanced-data.ts` — Resets advanced topic categories and cheatsheet collections.
- **Flush Database**: `npx tsx scripts/flush_data.ts` — Resets non-user MongoDB collections during local environment resets.
- **Check Contrast**: `python3 scripts/check-contrast.py` — Evaluates WCAG AA/AAA color contrast ratios across UI theme tokens.

---

## 🔒 Security & Data Integrity

- **Middleware Route Protection**: `proxy.ts` guards protected routes and applies rate limiting to API endpoints.
- **Sanitized Markdown Rendering**: `rehype-sanitize` strips unsafe tags (`<script>`, `<iframe>`, `<form>`) while preserving syntax highlighting and safe links.
- **Role-Based Access Control**: `withAuth` and `withRole('admin')` helpers gate API route handlers. Service layers enforce strict resource ownership checks (`userId === actorUserId`).
- **Encrypted Invite Tokens**: Raw 32-byte invite tokens exist only in email links; database stores SHA-256 token hashes (`tokenHash`).

---

## 📚 Complete Documentation Index

For in-depth documentation on architecture, database schemas, and operations, refer to the [`docs/`](./docs) directory:

| Document | Description |
| --- | --- |
| 📖 **[PRD](./docs/PRD.md)** | Product requirements, user personas, functional specifications, system scope, and non-goals. |
| 🏗️ **[Architecture](./docs/architecture.md)** | Technical stack wiring, request lifecycle, `proxy.ts` middleware, OpenTelemetry setup, and complete directory tree. |
| 🗄️ **[Schema](./docs/schema.md)** | MongoDB collection schemas, Mongoose models (`Pattern`, `UserProgress`, `Problem` discriminators, `Topic`, `Question`, `Cheatsheet`, `Activity`, `Invite`, `User`), and indexes. |
| 🔌 **[API Specification](./docs/api.md)** | REST API endpoint documentation, parameter schemas, request/response bodies, and HTTP status codes. |
| 🔒 **[Security](./docs/security.md)** | Authentication mechanisms, session cookies, RBAC, Markdown XSS containment, CSP headers, and rate limiting rules. |
| 🛠️ **[Setup Guide](./docs/setup.md)** | Complete guide for local development, MongoDB setup, Resend email configuration, and environment setup. |
| 🚀 **[Deployment Guide](./docs/deployment.md)** | Step-by-step production deployment guide for Vercel, MongoDB Atlas, production Resend keys, and post-deploy verification. |
| 🛡️ **[Admin Panel](./docs/admin.md)** | Administrative features, user management, invite token workflows, dynamic taxonomy editing, and global activity auditing. |

---

## 📄 License

Private Repository / All Rights Reserved © BigO.
