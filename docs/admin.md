# Admin Panel + User Dashboard

This document details administrative capabilities, user management, billing dashboards, assessment authoring, feedback moderation, and system analytics.

## 1. Permission Matrix

| Action | User | Admin |
| --- | --- | --- |
| Read own problems / notes / cheatsheets / questions | Yes | Yes |
| Write own content | Yes | Yes |
| Read another user's content | No | Yes |
| Write another user's content | No | Yes |
| View own dashboard analytics | Yes | Yes |
| View another user's dashboard | No | Yes |
| Read own activity feed | Yes | Yes |
| Read cross-user activity log | No | Yes |
| List all users | No | Yes |
| Issue user invites | No | Yes |
| Promote / demote / disable / delete users | No | Yes |
| Edit shared taxonomies (patterns, platforms, etc.) | No | Yes |
| Toggle application feature flags | No | Yes |
| Create & edit company assessments & test cases | No | Yes |
| View billing KPIs (MRR, ARR, revenue charts) | No | Yes |
| Manage dynamic pricing plans & promo codes | No | Yes |
| Manually grant or revoke user Pro / OA Pass entitlements | No | Yes |
| Moderate user feedback and bug submissions | No | Yes |

## 2. Admin Navigation & Routes

Routes are organized under `/admin/*` and gated by `withRole("admin")`:

- `/admin` — Users List & Management
- `/admin/users/[id]` — User Detail & Read-only Dashboard view
- `/admin/invites` — Invite Management (Pending, Accepted, Revoked)
- `/admin/billing` — Financial KPIs (MRR, ARR, subscribers), Revenue Charts, Dynamic Pricing, Promo Codes, and Manual Entitlement Overrides
- `/admin/content/assessments` — Company Assessment Editor (multi-problem suites, starter templates, hidden test cases)
- `/admin/content/patterns` — Full DSA pattern editor with variations and curated questions
- `/admin/content/problems` — Cross-user Problems table
- `/admin/content/topics` — Cross-user Topics table
- `/admin/content/cheatsheets` — Cross-user Cheat Sheets table
- `/admin/content/questions` — Cross-user Questions table
- `/admin/taxonomies` — Taxonomy Editor (Patterns, Subjects, Buckets, Platforms)
- `/admin/feedback` — User Feedback & Bug Moderation Queue
- `/admin/activity` — Cross-user Audit Activity Feed
- `/admin/settings` — Admin Feature Flags & Configuration Settings

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
