# Admin Panel + User Dashboard

This document details administrative capabilities, user management, billing dashboards, assessment authoring, feedback moderation, and system analytics.

## 1. Permission Matrix

| Action | User | TPC Head | TPC Coord | Invigilator | SuperAdmin |
| --- | --- | --- | --- | --- | --- |
| Read own problems / notes / cheatsheets | Yes | Yes | Yes | Yes | Yes |
| Access SuperAdmin Command Center (`/admin/*`) | No | No | No | No | Yes |
| Access Isolated Campus Portal (`/portal/*`) | No | Yes | Yes | Yes | Observer |
| Provision Partner Campuses & Seat Licenses | No | No | No | No | Yes |
| Schedule Placement Drives | No | Yes | Yes | No | Yes |
| Enter Live Invigilation Room & Monitor Feeds | No | Yes | Yes | Yes | Yes |
| Export Candidate Placement Scorecards (CSV) | No | Yes | Yes | No | Yes |
| Manage TPC Coordinators & Invigilators | No | Yes | No | No | Yes |
| Adjudicate AI Proctoring Incidents & Verdicts | No | No | No | No | Yes |
| Docker Runner Telemetry & Benchmark Sandbox | No | No | No | No | Yes |
| View Billing KPIs (MRR, ARR, pricing plans) | No | No | No | No | Yes |

## 2. Admin Navigation & 6 Semantic Pillars

Routes under `/admin/*` are strictly gated by `withRole("admin")` and partitioned into 6 operational pillars:

### I. Command & Control
- `/admin` — High-Level Enterprise Dashboard & User Directory
- `/admin/proctoring` — Proctoring Incident Desk (AI forensic reviews, timeline scrubber, dispute adjudication)
- `/admin/proctoring/[id]` — Candidate Forensic Audit Timeline (Cloudflare R2 snapshots, 6-gauge biometric triggers, Groq LLM narrative)
- `/admin/feedback` — User Feedback & Bug Moderation Queue

### II. Assessment & Campus (Institutional B2B)
- `/admin/content/assessments` — Company Assessment & Coding Suite Authoring
- `/admin/institutions` — Partner Campuses & University Directory (Seat licenses, contract validity)
- `/admin/institutions/[id]` — Campus Governance & TPC Leadership Roster (Seat capacity slider, observer mode launch)
- `/admin/institutions/live-drives` — Nationwide Placement Drive Radar (Live concurrency, emergency pause/extend)

### III. Knowledge Engine
- `/admin/content/patterns` — Curated DSA Patterns & Variations Editor
- `/admin/content/non-standard` — Non-Standard DSA & Quant Puzzle Studio (9 Canonical Buckets, 'Why Non-Standard?' rationales)
- `/admin/content/problems` — Multi-platform Problems Management
- `/admin/content/topics` — Core CS Subject Concept Notes
- `/admin/content/cheatsheets` — Topic Cheat Sheets & Revision Guides
- `/admin/content/questions` — Interview Flashcards & Behavioral Q&A

### IV. Billing & Growth
- `/admin/billing` — Financial MRR/ARR, 6-Month Trend Visualizations, Entitlement Overrides
- `/admin/billing/pricing` — Dynamic Pricing Plan Tier Management
- `/admin/billing/promos` — Promotional Discount Codes & Lifecycle Governance

### V. Identity & Access
- `/admin/users` — Global User Directory & Role Controls
- `/admin/invites` — Token-based Invite Dispatch & Acceptance Tracking
- `/admin/taxonomies` — Category Taxonomies (Patterns, Platforms, Subjects)

### VI. System & Infra Operations
- `/admin/system/runner` — Docker Piston & Container Sandbox Telemetry Center
- `/admin/activity` — Cross-tenant Audit Feed & System Logs
- `/admin/settings` — System Configuration & Security Feature Flags

## 3. Invite Workflow

1. **Send Invite**: Admin submits invite form (`POST /api/admin/invites`) with email, name, and role.
2. **Token Generation**: Generates 32-byte cryptographically secure token, hashes with SHA-256 (`tokenHash`), and sets status `pending`.
3. **Email Dispatch**: Sends invite email via Resend (`emails/Invite.tsx`).
4. **Acceptance**: Invitee visits `/invite/[token]`, submits password (`POST /api/invites/[token]/accept`), creating account and completing sign-in.

## 4. Feature Flags (`/admin/settings`)

Managed via `GET /api/admin/settings` and `PATCH /api/admin/settings`:
- **Invite only**: Restricts account registration strictly to token holders.
- **Data export**: Allows users to download their progress from account menu.

## 5. Billing & Revenue Dashboard (`/admin/billing`)

Managed via `GET /api/admin/billing`, `POST /api/admin/billing`, `/api/admin/pricing`, and `/api/admin/promos`:
- **Financial Analytics**: Displays real-time Monthly Recurring Revenue (MRR), Annual Recurring Revenue (ARR), total active subscribers broken down by plan (`pro_monthly`, `pro_annual`, `oa_pass`), and cumulative revenue.
- **Revenue Trend Visualization**: Historical 6-month revenue chart (`components/admin/RevenueTrendChart.tsx`) broken down by subscription plan.
- **Dynamic Pricing Editor**: Modify tier prices, highlight badges, feature bullet points, and AI credit quotas stored in MongoDB (`pricing_plans`) without code deployments.
- **Promo Code Generator & Lifecycle**: Create promo codes with percentage or fixed dollar discounts, expiration dates, plan applicability constraints, and maximum redemption caps.
- **Manual Subscription Overrides**: Instantly grant or revoke Pro or OA Pass access for any user with customizable day durations directly from the admin UI.

## 6. Company Assessment Management (`/admin/content/assessments`)

Managed via `GET /api/admin/assessments` and `POST /api/admin/assessments`:
- **Assessment Authoring**: Define company name, target role, unique slug, exam duration, passing cutoff score, and `isProOnly` access gates.
- **Problem & Starter Code Suites**: Add multi-problem challenges with custom problem descriptions, point allocations, pattern tags, and starter code templates for C++, Python, and Java.
- **Testcase Configuration**: Specify visible sample test cases with explanations and hidden edge-case suites executed securely by the Judge0 / Piston runner.

## 7. Feedback & Bug Report Moderation (`/admin/feedback`)

Managed via `GET /api/admin/feedback` and `PATCH /api/admin/feedback/:id`:
- **Categorized Queue**: Filter bug reports and feature requests by severity (`low`, `medium`, `high`, `critical`) and status (`pending`, `in_review`, `resolved`, `dismissed`).
- **Context Inspection**: View user details, offending page URLs, browser user agents, and IP records.
- **Resolution Tracking**: Add internal admin notes and mark issues as resolved or dismissed.

## 8. Candidate Incident Desk & AI Proctoring Auditing (`/admin/proctoring`)

Managed via `GET /api/admin/proctoring` and `GET/PATCH /api/admin/proctoring/:id`:
- **Incident Queue**: Prioritized list of all candidate test submissions with risk badges (`Clean`, `Suspicious`, `Flagged`), cheat risk %, and biometric infractions count.
- **Forensic Timeline Scrubber**: Chronological second-by-second playback of test sessions correlating webcam snapshots, tab-switching events, multi-face detections, and background noise spikes.
- **Evidence Modal Popup**: High-resolution signed Cloudflare R2 snapshots captured at exact infraction timestamps.
- **Groq LLM Narrative**: Behavioral forensic narrative generated by Llama 3.3 synthesizing biometric telemetry into clear evidence summaries.
- **Adjudication Desk**: SuperAdmin decisions to confirm violations (`Flagged as Violation`), clear suspicions (`Cleared — False Positive`), or adjust candidate scores with audit notes.

## 9. SuperAdmin Campus Control Hub (`/admin/institutions`)

Managed via `app/api/admin/institutions/*`:
- **Partner Campus Provisioning**: Create institutional tenants with academic domain filtering (e.g. `@iitb.ac.in`), seat licenses, and contract expiration dates.
- **Capacity & Seat Burn**: Real-time meters tracking contracted seats vs active students assessed.
- **TPC Leadership Governance**: Designate campus staff roles (`Head of TPC`, `Placement Coordinator`, `Invigilator`).
- **Nationwide Placement Radar (`/admin/institutions/live-drives`)**: Real-time telemetry monitoring simultaneous live cohort drives across all university partners, with emergency pause, force-start, and extra-time controls.
- **Observer Impersonation Mode**: One-click launcher allowing SuperAdmins to enter any partner's portal in read/audit observer mode.

## 10. Isolated TPC Campus Portal (`/portal/*`)

Dedicated institutional control room for college training & placement cells (TPC) completely walled off from platform administration:
- **Tenant Sandboxing**: TPC users only see drives, test questions, and student scorecards belonging to their university.
- **Placement Drive Scheduler**: Schedule custom testing windows for student batches, linking with platform assessment modules.
- **Live Invigilation Room (`/portal/drives/:id`)**: Real-time candidate roster monitoring in-progress tests, elapsed durations, and live AI cheating risk alerts with 8-second polling.
- **Scorecard Leaderboards & Excel Export (`/portal/results`)**: Comprehensive candidate ranking table with one-click RFC 4180 CSV export for institutional placement records.
- **Self-Serve Team Management (`/portal/team`)**: TPC Heads can invite, promote, and remove departmental placement coordinators and invigilators without contacting platform support.

## 11. Code Runner & System Operations Center (`/admin/system/runner`)

Managed via `GET/POST /api/admin/system/runner`:
- **Docker Piston Container Status**: Live ping and round-trip latency to isolated execution container (`docker-compose.runner.yml`), verifying loaded language runtimes (Python, C++, Java).
- **Cluster Latency Gauges**: Real-time health chips for MongoDB Atlas replica sets, Upstash Redis distributed caches, and Cloudflare R2 evidence storage.
- **Throughput & Language Breakdown**: Recharts visualizations of candidate submission volume across programming languages and pass/fail/TLE ratios.
- **Interactive Sandbox Benchmark Terminal**: In-browser diagnostic terminal to execute test payloads directly in the container sandbox to measure live compiler performance.
