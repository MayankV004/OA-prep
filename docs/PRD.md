# Product Requirements Document (PRD)

## 1. Product Overview

**BigO** is an invite-only computer science placement preparation application. It combines pattern-oriented Data Structures & Algorithms tracking, Core Computer Science subject revision, system design & advanced CS topics, interview Q&A flashcards, cheat sheets, and analytics dashboards into a unified platform.

---

## 2. Core Functional Requirements

### 2.1 Authentication & Multi-Tenancy
- **Invite-Only Access**: Self-serve registration is disabled. Users join via an admin-issued invite token sent via email.
- **Authentication Engine**: Handled via Better Auth with email and password.
- **Role-Based Access Control (RBAC)**:
  - `user`: Can manage their own problem progress, topic notes, cheat sheets, and view their dashboard.
  - `admin`: Full tenant management, user management, invite issuance, taxonomy editing, and global activity audit logs.

### 2.2 Pattern DSA Tracking
- **Curated Patterns**: Structured collection of 12+ core DSA patterns (Sliding Window, Two Pointers, Backtracking, DP, Graphs, Trees, etc.).
- **Variations & Problem Sets**: Each pattern contains sub-variations with curated LeetCode/Codeforces problems, difficulties, and company tags.
- **Completion & Notes**: Users can toggle problem completion status, bookmark items for revision, and attach per-problem Markdown notes.

### 2.3 Non-Standard DSA & Competitive Programming
- Discriminator-backed tracking for custom DSA problems (bucket-categorized) and Competitive Programming problems (platform/contest-categorized).

### 2.4 Subjects & Advanced CS Topics
- **Subjects**: Structured concept notes and flashcards for Core CS subjects (OS, DBMS, Computer Networks, OOP).
- **Advanced Topics**: Deep dives into DevOps, Docker, Kubernetes, System Design, and Generative AI.
- **ReaderLayout Subsystem**: Distraction-free, responsive reading interface with scrollspy table of contents, progress indicators, and fullscreen reading mode for both topics and cheatsheets.

### 2.5 Cheat Sheets & Q&A Flashcards
- Markdown cheat sheets with syntax highlighting, subject tags, and reader mode rendering.
- Interactive interview Q&A flashcards for rapid revision.

### 2.6 Dashboard & Analytics
- Visual completion statistics (by difficulty mix and category).
- 90-day activity heatmap and completion trend charts powered by Recharts.
- Activity feed detailing problem completion and note updates.

### 2.7 Online Assessment (OA) Simulator & Code Execution Engine
- **Company-Specific Exam Mocking**: Full simulation of technical assessments from top tech employers (Google, Amazon, Uber, Meta, Microsoft) with realistic time constraints.
- **Embedded IDE**: Browser-based Monaco Editor with syntax highlighting, language selection (C++, Python, Java), intelligent indentation, and starter templates.
- **Sandboxed Code Execution Harness**: Multi-tier runner architecture (containerized Docker Piston engine, cloud Judge0, and heuristic fallback) with automated testcase parsing (`lib/cp/testcaseParser.ts`).
- **Live Code Execution**: Safe, rate-limited (12 runs/min) interactive code runs against public and custom testcases via `POST /api/oa/execute`.
- **Automated Submission Grading**: Evaluates full testcase suites (visible + hidden), detects Time Limit Exceeded (TLE) or Wrong Answer (WA), and computes scores with pattern diagnostics (`mastered`, `needs_practice`, `failed`).
- **Comprehensive Assessment Reports**: Instant generation of candidate diagnostic reports including score percentile, time efficiency, pattern strength breakdowns, and proctoring audit trails.

### 2.8 Enterprise Dual-Engine Neural Proctoring
- **Client-Side Hardware Acceleration**: Zero native software downloads; runs TensorFlow.js WebGL directly inside the candidate's browser.
- **Dual-Loop Vision Pipeline**:
  - **Fast Biometrics Loop (180ms)**: Real-time Google BlazeFace landmark detection, multi-face presence counting, and 3D head pose estimation (Yaw/Pitch tracking).
  - **Throttled Object Loop (450ms)**: COCO-SSD MobileNet-v2 inference detecting unauthorized physical materials (mobile phones, secondary screens, textbooks).
- **Anti-False-Positive Guards**: Face-presence gating suppressing empty-frame device warnings, spatial exclusion zones preventing hair/clothing false alarms, and 2.2-second UI debounce timers.
- **Multimodal Telemetry**: Page Visibility API monitoring tab switches, window blur interceptors, clipboard paste blocking, and Web Audio API RMS speech detection.
- **Evidence Vault & AI Forensics**: Direct SigV4 uploads of violation frames to Cloudflare R2 and automated session integrity risk scoring via Groq Llama-3.3-70B and deterministic fallbacks.

### 2.9 Competitive Programming (CP) Sync & Global Contest Alerts
- **Multi-Platform Integration**: Automated profile scraping and rating tracking across Codeforces, LeetCode, CodeChef, and AtCoder.
- **Composite Placement Score**: Proprietary algorithm normalizing competitive ratings into an actionable 0–100 candidate preparedness rating.
- **Hybrid Contest Crons**: Scheduled 15-minute GitHub Actions workflow for real-time alert dispatch (24h, 2h, 30m prior) and daily Vercel crons for aggregator syncing.

### 2.10 Monetization, Dynamic Pricing & Promo Codes
- **Tiered Access Model**: Free Tier, Pro Monthly, Pro Annual, and single-use OA Passes.
- **Dynamic Pricing Configuration**: MongoDB-backed pricing plans (`pricing_plans`) allowing dynamic updates to pricing, badges, and feature lists.
- **Promotional Code Engine**: Support for percentage and fixed dollar discounts, expiration dates, plan applicability rules, and redemption limits (`POST /api/promo/validate`).
- **Stripe Integration**: Secure checkout sessions, billing customer portal, automated subscription lifecycle management via webhooks, and local mock testing bypass.
- **AI Quotas**: Credit accounting for automated behavioral forensic analysis and proctored assessment attempts.

### 2.11 Administrative Management & Financial Analytics
- **User Management**: View users, promote/demote roles, enable/disable accounts.
- **Invites Management**: Issue, resend, or revoke invite tokens via Resend.
- **Assessment Management**: Author and update company assessment suites, problem statements, scoring, starter templates, and hidden testcases (`/admin/content/assessments`).
- **Billing & Revenue Dashboard**: Track Monthly Recurring Revenue (MRR), Annual Recurring Revenue (ARR), active subscriber breakdowns, 6-month historical revenue charts (`RevenueTrendChart.tsx`), promo code creation, and manual plan grant/revocation (`/admin/billing`).
- **Taxonomies & Content**: Dynamically edit pattern titles, variations, curated problems, and categories.
- **Feedback & Bug Moderation**: Review candidate feedback, bug reports with severity tags and URLs, and track resolution status (`/admin/feedback`).
- **Audit Log**: Global activity log capturing administrative and user actions.

---

## 3. Non-Functional Requirements

- **Performance**: High page responsiveness via Next.js 16 App Router and client caching with TanStack Query v5. Sub-30ms client-side inference latency for biometric tracking.
- **Privacy & Security**: Zero raw video streaming to servers. Video feeds stay on the client; only encrypted, compressed WebP frames of flagged violation moments are uploaded to Cloudflare R2.
- **Content Security**: Strict Markdown XSS sanitization via `rehype-sanitize`, security header policies, and sliding-window rate limiting (`proxy.ts`).
- **Observability**: Distributed tracing and metrics collection via OpenTelemetry and Prometheus/Grafana integrations.

