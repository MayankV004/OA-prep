# Admin Panel + User Dashboard

This document details administrative capabilities, user management, billing dashboards, assessment authoring, feedback moderation, and system analytics.

## 1. Permission Matrix

| Action | User | SuperAdmin |
| --- | --- | --- |
| Read own problems / notes / cheatsheets | Yes | Yes |
| Access SuperAdmin Command Center (`/admin/*`) | No | Yes |
| Author & Curate Company OA Mock Assessments | No | Yes |
| Adjudicate AI Proctoring Incidents & Verdicts | No | Yes |
| Docker Runner Telemetry & Benchmark Sandbox | No | Yes |
| View Billing KPIs (MRR, ARR, pricing plans) | No | Yes |

## 2. Command Center Structure

### I. Command & Control
- `/admin` — High-Level Enterprise Dashboard & User Directory
- `/admin/proctoring` — Proctoring Incident Desk (AI forensic reviews, timeline scrubber, dispute adjudication)
- `/admin/proctoring/[id]` — Candidate Forensic Audit Timeline (Cloudflare R2 snapshots, 6-gauge biometric triggers, Groq LLM narrative)
- `/admin/feedback` — User Feedback & Bug Moderation Queue

### II. Assessment Simulator
- `/admin/content/assessments` — Company Assessment & Coding Suite Authoring

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

## 9. Code Runner & System Operations Center (`/admin/system/runner`)

Managed via `GET/POST /api/admin/system/runner`:
- **Docker Piston Container Status**: Live ping and round-trip latency to isolated execution container (`docker-compose.runner.yml`), verifying loaded language runtimes (Python, C++, Java).
- **Cluster Latency Gauges**: Real-time health chips for MongoDB Atlas replica sets, Upstash Redis distributed caches, and Cloudflare R2 evidence storage.
- **Throughput & Language Breakdown**: Recharts visualizations of candidate submission volume across programming languages and pass/fail/TLE ratios.
- **Interactive Sandbox Benchmark Terminal**: In-browser diagnostic terminal to execute test payloads directly in the container sandbox to measure live compiler performance.

## 10. Interview Flashcards & Question Studio (`/admin/content/questions`)

Managed via `GET /api/questions`, `POST /api/questions`, and `PATCH/DELETE /api/questions/:id`:
- **Subject-Partitioned Question Directory**: Filter questions across core CS domains (Operating Systems, Database Management Systems, Computer Networks, Object-Oriented Programming).
- **System-Curated Content Publishing**: Administrators can publish questions with `isSystem: true`, making them universally accessible across candidate flashcard decks.
- **Rich Question Authoring**: Author question prompts, formatted Markdown answer guides, quick bullet-point takeaways (`keyPoints`), company tags (Google, Amazon, Meta, Uber, etc.), and difficulty tiers (`Easy`, `Medium`, `Hard`).
- **Full-Text Search & Filtration**: Real-time filtering across question titles, Markdown answers, and tags.
- **Automated Seeding Integration**: CLI utility `npx tsx scripts/seed-interview-questions.ts` provides bulk seeding of 100+ curated industry-standard interview cards.

## 11. Non-Standard DSA & Dynamic Buckets Studio (`/admin/content/non-standard`)

Managed via `/api/admin/content/non-standard`:
- **Canonical Buckets & Custom Buckets**: Supports 9 canonical problem categories (Bit Manipulation, Binary Search Invariants, Math & Number Theory, Monotonic Stack/Queue, Constructive & Ad-Hoc, Two Pointers/Sliding Window Invariants, Coordinate Compression, Interval Scheduling, Probability & Game Theory) plus dynamic on-the-fly bucket creation.
- **Pedagogical Rationales**: Enforces the "Why Non-Standard?" educational rationale for each problem, highlighting algorithmic intuition that transcends cookie-cutter patterns.
- **Starter Code & Company Metadata**: Configure starter code templates (C++, Python, Java) and employer tagging for each challenge.

## 12. Pattern DSA & Variation Hierarchy (`/admin/content/patterns`)

Managed via `/api/admin/content/patterns`:
- **12+ Core Patterns**: Sliding Window, Two Pointers, Fast & Slow Pointers, Linked List, Cyclic Sort, Heap & Priority Queue, Trie, Bit Manipulation, Math & Number Theory, etc.
- **Nested Variation Trees**: Manage sub-variations under each pattern, complete with concept explanations, time/space complexity notes, and curated practice problem links.
- **Practice Deep Linking**: Direct synchronization between administrative variations and candidate practice pages (`/dsa/[pattern]/[variation]/practice`).

