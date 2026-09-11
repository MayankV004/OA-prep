# API Specification

REST API via Next.js Route Handlers under `/api/*`. Route handlers enforce authentication (`withAuth`) or role restriction (`withRole`). JSON is used for request and response payloads.

## Conventions

- **Base path**: `/api`
- **Content type**: `application/json`
- **Response status codes**:
  - `200`: Success (read/update)
  - `201`: Created
  - `204`: No Content (delete)
  - `400`: Bad Request / Validation error
  - `401`: Unauthorized
  - `403`: Forbidden (insufficient role)
  - `404`: Not Found
  - `500`: Internal Server Error

---

## Authentication

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| ALL | `/api/auth/[...all]` | Public | BetterAuth handler catch-all |
| POST | `/api/auth/otp/send` | Public | Body `{ email, name? }`. Generates 6-digit OTP and emails code |
| POST | `/api/auth/otp/verify` | Public | Body `{ email, otp }`. Validates 6-digit code and marks `emailVerified = true` |
| GET | `/api/invites/:token` | Public | Fetch invite by token (returns email and status) |
| POST | `/api/invites/:token/accept` | Public | Body `{ password }`. Accepts invite and registers user |

---

## User Profile & Notes

| Method | Path | Auth | Body / Query | Description |
| --- | --- | --- | --- | --- |
| GET | `/api/profile` | Auth | — | Fetch user details, 365-day heatmap, and pattern progress stats |
| PATCH | `/api/profile` | Auth | `{ name?, image? }` | Update user display name and avatar URL |
| GET | `/api/problems/notes` | Auth | `?problemId=...` | Get per-problem notes or map of all notes |
| PUT | `/api/problems/notes` | Auth | `{ problemId, userNotes }` | Save per-problem Markdown notes |

---

## Groups (Subjects & Advanced Topics)

| Method | Path | Auth | Body / Query | Description |
| --- | --- | --- | --- | --- |
| GET | `/api/groups` | Auth | `?kind=subject\|advanced` | List groups by kind |
| POST | `/api/groups` | Admin | `{ name, kind, slug? }` | Create new group |
| PATCH | `/api/groups/:id` | Admin | `{ name?, slug? }` | Update existing group |
| DELETE | `/api/groups/:id` | Admin | `?force=true` | Delete group |

---

## Topics (Concept Notes)

| Method | Path | Auth | Body / Query | Description |
| --- | --- | --- | --- | --- |
| GET | `/api/topics` | Auth | `?groupId=...&userId=me` | List topics for group |
| GET | `/api/topics/:id` | Auth | — | Get single topic detail |
| POST | `/api/topics` | Auth | `{ groupId, title, body?, tags? }` | Create topic |
| PATCH | `/api/topics/:id` | Auth | `{ title?, body?, tags? }` | Update topic |
| DELETE | `/api/topics/:id` | Auth | — | Delete topic |

---

## Problems (Patterns, Non-Standard, CP)

| Method | Path | Auth | Body / Query | Description |
| --- | --- | --- | --- | --- |
| GET | `/api/problems` | Auth | `?kind=pattern\|nonstandard\|cp&group=...` | List problems |
| GET | `/api/problems/:id` | Auth | — | Get problem detail |
| POST | `/api/problems` | Auth | Discriminator payload | Create problem |
| PATCH | `/api/problems/:id` | Auth | Partial problem fields | Update problem |
| DELETE | `/api/problems/:id` | Auth | — | Delete problem |
| PATCH | `/api/problems/:id/completion` | Auth | `{ completed: boolean }` | Toggle problem completion |

---

## Questions & Cheat Sheets

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/questions` | Auth | List interview questions (`?subjectId=...`) |
| GET | `/api/questions/:id` | Auth | Get single question details |
| POST | `/api/questions` | Auth | Create interview question |
| PATCH | `/api/questions/:id` | Auth | Update interview question |
| DELETE | `/api/questions/:id` | Auth | Delete interview question |
| GET | `/api/cheatsheets` | Auth | List cheat sheets (`?subjectId=...`) |
| GET | `/api/cheatsheets/:id` | Auth | Get single cheat sheet |
| POST | `/api/cheatsheets` | Auth | Create cheat sheet |
| PATCH | `/api/cheatsheets/:id` | Auth | Update cheat sheet |
| DELETE | `/api/cheatsheets/:id` | Auth | Delete cheat sheet |

---

## Utilities & Search

| Method | Path | Auth | Query / Description |
| --- | --- | --- | --- |
| GET | `/api/tags` | Auth | `?q=prefix` — Returns matching tag strings |
| GET | `/api/search` | Auth | `?q=query&kind=all\|problems\|topics\|cheatsheets\|questions` |
| GET | `/api/activity` | Auth | `?scope=me&limit=30` — Returns user activity stream |
| GET | `/api/dashboard/stats` | Auth | `?userId=me` — Returns completion stats, trends & heatmaps |

---

## Admin Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/admin/users` | Admin | List all registered users |
| GET | `/api/admin/users/:id` | Admin | Get user details and statistics |
| PATCH | `/api/admin/users/:id` | Admin | Update user status or name |
| DELETE | `/api/admin/users/:id` | Admin | Delete user (`?wipe=true` for hard delete) |
| PATCH | `/api/admin/users/:id/role` | Admin | `{ role: "admin" \| "user" }` — Change user role |
| GET | `/api/admin/invites` | Admin | List pending / accepted / revoked invites |
| POST | `/api/admin/invites` | Admin | Create and email invite (`{ email, role?, name? }`) |
| POST | `/api/admin/invites/:id/resend` | Admin | Resend invite email |
| DELETE | `/api/admin/invites/:id` | Admin | Revoke invite |
| GET | `/api/admin/taxonomies` | Admin | List taxonomies (`?kind=...`) |
| POST | `/api/admin/taxonomies` | Admin | Create taxonomy item |
| PATCH | `/api/admin/taxonomies/:id` | Admin | Update taxonomy item |
| DELETE | `/api/admin/taxonomies/:id` | Admin | Archive or delete taxonomy item |
| GET | `/api/admin/activity` | Admin | Query global audit activity log |
| GET | `/api/admin/settings` | Admin | Get application feature flags & settings |
| PATCH | `/api/admin/settings` | Admin | Update application feature flags & settings |
| GET | `/api/admin/content/patterns` | Admin | List full pattern collection with nested variations |
| POST | `/api/admin/content/patterns` | Admin | Create new DSA pattern |
| PATCH | `/api/admin/content/patterns/:slug` | Admin | Update pattern details |
| POST | `/api/admin/content/patterns/:slug/variations` | Admin | Append variation to pattern |
| PATCH | `/api/admin/content/patterns/:slug/variations/:variationId` | Admin | Update specific pattern variation |
| POST | `/api/admin/content/patterns/:slug/variations/:variationId/problems` | Admin | Add curated problem to variation |
| POST | `/api/admin/content/patterns/wipe` | Admin | Reset/wipe pattern collections (requires confirmation) |
| GET | `/api/admin/content/non-standard` | Admin | List non-standard challenges (`?q=...&bucket=...&difficulty=...`) with aggregate metrics |
| POST | `/api/admin/content/non-standard` | Admin | Create new non-standard problem with canonical bucket, reason, companies, starterCode |
| PATCH | `/api/admin/content/non-standard` | Admin | Update non-standard challenge fields (`{ id, title, bucket, difficulty, ... }`) |
| DELETE | `/api/admin/content/non-standard` | Admin | Delete non-standard challenge (`?id=...`) |
| GET | `/api/admin/assessments` | Admin | List all company assessments (`?q=...&company=...&difficulty=...&isProOnly=...`) |
| POST | `/api/admin/assessments` | Admin | Create new assessment with problems, testcases, starter templates |
| GET | `/api/admin/assessments/:id` | Admin | Fetch full assessment document including hidden testcases |
| PATCH | `/api/admin/assessments/:id` | Admin | Update assessment configuration, problems, or duration |
| DELETE | `/api/admin/assessments/:id` | Admin | Delete assessment |
| GET | `/api/admin/billing` | Admin | Aggregated billing KPIs: active subscribers, MRR, ARR, promo stats, 6-month trends |
| POST | `/api/admin/billing` | Admin | Manual grant/revoke of Pro / OA Pass plan with custom duration |
| GET | `/api/admin/pricing` | Admin | List all dynamic pricing plans stored in MongoDB |
| PATCH | `/api/admin/pricing` | Admin | Update plan prices, badges, features, and AI credit quotas |
| GET | `/api/admin/promos` | Admin | List promo codes with redemption counts and limits |
| POST | `/api/admin/promos` | Admin | Create new promo code (`{ code, discountType, discountValue, applicablePlans, expiresAt, maxRedemptions }`) |
| GET | `/api/admin/promos/:id` | Admin | Get specific promo code details |
| PATCH | `/api/admin/promos/:id` | Admin | Update promo code parameters or toggle `isActive` |
| DELETE | `/api/admin/promos/:id` | Admin | Delete promo code |
| GET | `/api/admin/feedback` | Admin | List user feedback & bug items (`?status=...&category=...`) |
| PATCH | `/api/admin/feedback/:id` | Admin | Update feedback status (`pending`, `in_review`, `resolved`, `dismissed`) and admin notes |

---

## Online Assessment (OA) Simulator & Proctoring

| Method | Path | Auth | Body / Query | Description |
| --- | --- | --- | --- | --- |
| GET | `/api/oa/assessments` | Auth | `?company=...&role=...` | List available company OA assessments and difficulty tiers |
| GET | `/api/oa/assessments/:slug` | Auth | — | Fetch single assessment briefing, rules, and problem overview |
| POST | `/api/oa/assessments/:slug/start` | Auth | `{ baselineSelfieUrl? }` | Initialize candidate session, generate submission ID, lock duration |
| POST | `/api/oa/execute` | Auth | `{ problemId, language, code, testCases?, customInput?, patternTag?, starterCode? }` | Execute code against sample or custom testcases via Judge0 / Piston runner (12 runs/min rate limit) |
| POST | `/api/oa/assessments/:slug/submit` | Auth | Detailed submission payload | Submit completed code solutions; runs all test cases (visible & hidden) via Judge0 runner, detects TLE/WA, calculates scores, multi-signal cheating risk, and generates LLM forensic narrative |
| GET | `/api/oa/submissions/:submissionId` | Auth | — | Fetch candidate assessment score, problem breakdowns, and forensic report |
| POST | `/api/upload` | Auth | Multipart/Form-Data | Upload WebP violation snapshots to Cloudflare R2 / local vault |

---

## Competitive Programming (CP) & Ratings

| Method | Path | Auth | Body / Query | Description |
| --- | --- | --- | --- | --- |
| GET | `/api/cp/handles` | Auth | — | Get linked competitive programming handles (CF, LC, CC, AC) |
| POST | `/api/cp/handles` | Auth | `{ platform, handle }` | Link CP handle and immediately trigger profile verification & rating scrape |
| GET | `/api/cp/performance` | Auth | `?platform=...` | Query historical contest rating curves, global ranks, and composite score |

---

## Global Contests & Alert Subscriptions

| Method | Path | Auth | Body / Query | Description |
| --- | --- | --- | --- | --- |
| GET | `/api/contests` | Auth | `?status=UPCOMING\|RUNNING&platform=...` | List upcoming and ongoing programming contests across platforms (emits CDN cache headers) |
| GET | `/api/contests/subscription` | Auth | — | Get user contest notification preferences and alert channels |
| POST | `/api/contests/subscription` | Auth | `{ platforms, alertTiming, emailEnabled }` | Update contest notification alert preferences |
| POST | `/api/contests/unsubscribe` | Public | `?token=...` | One-click unsubscribe from contest email notifications |

---

## Background Cron Workers (QStash / Vercel Cron / GitHub Actions)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET/POST | `/api/cron/contests-sync` | Cron Secret | Daily scrape of upcoming contests from Codeforces, LeetCode, CodeChef, and AtCoder APIs (Vercel Cron) |
| GET/POST | `/api/cron/contest-alerts` | Cron Secret | Evaluates user alert timings (24h, 2h, 30m prior) and enqueues notification emails (GitHub Actions every 15 min) |
| GET/POST | `/api/cron/user-contests-sync` | Cron Secret | Synchronizes linked user CP profiles and updates rating history (Vercel Cron daily) |
| POST | `/api/workers/email` | QStash Sign | Verifies `upstash-signature` and dispatches React Email templates via Resend |

---

## Monetization, Billing & Subscriptions (Stripe)

| Method | Path | Auth | Body / Query | Description |
| --- | --- | --- | --- | --- |
| GET | `/api/pricing` | Public | — | Fetch active dynamic pricing plans (monthly, annual, OA pass) from MongoDB with default fallback |
| POST | `/api/promo/validate` | Public/Auth | `{ code, plan }` | Validate promo code, check expiry/limits, and calculate discount & final price (15 req/min rate limit) |
| GET | `/api/subscription` | Auth | — | Fetch user subscription status, plan tier (`free`, `pro_monthly`, `pro_annual`, `oa_pass`), and remaining AI credits |
| POST | `/api/checkout` | Auth | `{ plan: "pro_monthly" \| "pro_annual" \| "oa_pass" }` | Generate Stripe Checkout Session URL or trigger instant mock confirmation in dev |
| GET | `/api/checkout/verify-session` | Auth | `?session_id=...` | Verify completed Stripe checkout and sync entitlements immediately |
| POST | `/api/checkout/mock-confirm` | Auth | `{ plan }` | Development-only instant upgrade bypass for testing without Stripe credentials |
| POST | `/api/subscription/portal` | Auth | — | Create Stripe Billing Customer Portal session for managing payment methods |
| POST | `/api/webhooks/stripe` | Public | Stripe Webhook Payload | Listens for `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted` |

---

## Problem Revision, Progress & Notes

| Method | Path | Auth | Body / Query | Description |
| --- | --- | --- | --- | --- |
| PATCH | `/api/problems/revision` | Auth | `{ problemId, revision: boolean }` | Toggle one-click star bookmark for pre-interview revision |
| GET | `/api/problems/progress` | Auth | — | Fetch full map of user completion statuses and revision bookmarks |

---

## User Feedback, Metrics & Export

| Method | Path | Auth | Body / Query | Description |
| --- | --- | --- | --- | --- |
| POST | `/api/feedback` | Auth | `{ type: "bug" \| "feedback", title, description, category?, severity?, pageUrl? }` | Submit user feedback, bug reports, or feature requests with severity and URL context |
| GET | `/api/metrics` | Auth | — | System telemetry, database metrics, and OpenTelemetry diagnostic counters |
| GET | `/api/export` | Auth | `?format=json\|csv` | Export complete user revision notes, problem bookmarks, and progress data |

