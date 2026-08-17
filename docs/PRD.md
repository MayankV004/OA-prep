# Product Requirements Document (PRD)

## 1. Product Overview

**PlacementDeck** is an invite-only computer science placement preparation application. It combines pattern-oriented Data Structures & Algorithms tracking, Core Computer Science subject revision, system design & advanced CS topics, interview Q&A flashcards, cheat sheets, and analytics dashboards into a unified platform.

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

### 2.5 Cheat Sheets & Q&A Flashcards
- Markdown cheat sheets with syntax highlighting and subject tags.
- Interactive interview Q&A flashcards for rapid revision.

### 2.6 Dashboard & Analytics
- Visual completion statistics (by difficulty mix and category).
- 90-day activity heatmap and completion trend charts powered by Recharts.
- Activity feed detailing problem completion and note updates.

### 2.7 Admin Panel
- **User Management**: View users, promote/demote roles, enable/disable accounts.
- **Invites Management**: Issue, resend, or revoke invite tokens via Resend.
- **Taxonomies**: Dynamically edit pattern titles, platforms, buckets, and subjects.
- **Audit Log**: Global activity log capturing administrative and user actions.

---

## 3. Non-Functional Requirements

- **Performance**: High page responsiveness via Next.js 16 App Router and client caching with TanStack Query v5.
- **Security**: Strict Markdown XSS sanitization via `rehype-sanitize`, security header policies, and sliding-window rate limiting (`proxy.ts`).
- **Observability**: Distributed tracing and metrics collection via OpenTelemetry.
