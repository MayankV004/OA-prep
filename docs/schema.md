# Database Schema

MongoDB via Mongoose 9. User-owned collections carry `userId`. Cross-user reads and writes are gated in the service layer by role.

Timestamps (`createdAt`, `updatedAt`) are managed by Mongoose's `timestamps: true` option on schemas.

## Ownership Model

| Collection | Scope |
| --- | --- |
| `users` | System |
| `patterns` | Shared (DSA patterns, variations, and curated problems) |
| `taxonomies` | Shared (admin-writable, everyone reads) |
| `groups` | Shared (admin-writable, everyone reads) |
| `topics` | Per user (`userId` required) |
| `problems` | Per user |
| `userprogress` | Per user (`userId` + `problemId`) |
| `questions` | Per user |
| `cheatsheets` | Per user |
| `activities` | Per user (both `actorId` and `targetUserId`) |
| `invites` | System (admin-managed) |
| `otpverifications` | System (OTP codes with TTL auto-deletion) |
| `assessments` | Shared (company OA templates, starter code, test suites) |
| `assessment_submissions` | Per user (`userId` + `assessmentId`) with proctoring audit logs |
| `subscription` | Per user (`userId` unique) with Stripe metadata & AI quotas |
| `pricing_plans` | Shared (dynamic pricing tier definitions & features) |
| `promo_codes` | Shared (promotional discount codes & redemption limits) |
| `user_cp_profiles` | Per user (`userId` unique) with multi-platform CP stats |
| `user_contest_histories` | Per user (`userId` + platform rating history) |
| `contests` | Shared (global programming contest index) |
| `contest_subscriptions` | Per user (contest notification alert preferences) |
| `contest_alert_logs` | System (dispatched contest notification tracking) |
| `feedbacks` | Per user (`userId` optional) with admin moderation |
| `institutions` | Institutional Partner Tenant (seats, validUntil, domain) |
| `institution_members` | Campus TPC Roster (`institutionId` + `userId`, role: head/coord/invigilator) |
| `cohort_drives` | Campus Testing Drive (`institutionId` + `assessmentId`, status, dates) |

## Collections

### `otpverifications` (`models/otp.ts`)

Stores temporary 6-digit OTP verification codes with 10-minute TTL expiration.

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | Auto-generated |
| `email` | string | User email address (indexed) |
| `otpHash` | string | SHA-256 hashed 6-digit OTP code |
| `expiresAt` | Date | MongoDB TTL index (`expireAfterSeconds: 0`) |
| `attempts` | number | Failed verification count (max 5) |

### `users`

Managed by BetterAuth's MongoDB adapter. Extended with custom fields via `additionalFields` in `lib/auth.ts`.

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | BetterAuth default |
| `email` | string | BetterAuth default, unique |
| `emailVerified` | boolean | BetterAuth default |
| `name` | string | BetterAuth default |
| `image` | string? | BetterAuth default |
| `role` | `"admin" \| "user"` | default `"user"`; bootstrap user is `"admin"` |
| `disabled` | boolean | default `false`; disabled users cannot sign in |
| `lastSeenAt` | Date? | updated on session issue |
| `invitedBy` | ObjectId? | ref `users` |

### `patterns` (`models/pattern.ts`)

Curated DSA patterns containing variations and problem sets.

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | |
| `title` | string | required |
| `slug` | string | required, unique |
| `description` | string | |
| `timeComplexity` | string | |
| `spaceComplexity` | string | |
| `useCases` | string[] | |
| `concept` | string | |
| `templateCode` | string | |
| `explanation` | string | |
| `variations` | `IVariation[]` | array of variation subdocuments |

Subdocument `IVariation`:
- `variation`: string
- `description`: string
- `important_details`: string[]
- `template_code`: string
- `other_relevant_details`: string
- `problems`: `IProblem[]` (`name`, `difficulty`, `platform`, `link`, `priority`, `company_tags`)

### `userprogress` (`models/progress.ts`)

Tracks individual user completion state, bookmarks, and notes per problem.

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | |
| `userId` | ObjectId | ref `User`, required, indexed |
| `problemId` | string | required, indexed |
| `completed` | boolean | default `false` |
| `completedAt` | Date? | timestamp when completed |
| `notes` | string | default `''` |
| `revision` | boolean | default `false` (bookmark for revision) |
| `userNotes` | string | Markdown notes per problem |

Indexes:
- `{ userId: 1, problemId: 1 }` unique

### `taxonomies`

Admin-editable taxonomy values.

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | |
| `kind` | `"pattern" \| "bucket" \| "platform" \| "subject" \| "advanced" \| "difficulty"` | required |
| `name` | string | required |
| `slug` | string | required, unique within kind |
| `order` | number | manual sort order |
| `archived` | boolean | default `false` |

### `groups`

Concrete Subject and AdvancedTopicGroup rows.

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | |
| `kind` | `"subject" \| "advanced"` | required |
| `name` | string | required |
| `slug` | string | required, unique within kind |
| `order` | number | |

### `topics`

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | |
| `userId` | ObjectId | ref `users` |
| `groupId` | ObjectId | ref `groups` |
| `title` | string | required |
| `body` | string | Markdown |
| `tags` | string[] | |

### `problems` (`models/problem.ts`)

Base collection with three discriminators (`PatternProblem`, `NonStandardProblem`, `CpProblem`).

Base fields:

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | |
| `userId` | ObjectId | ref `users` |
| `kind` | `"pattern" \| "nonstandard" \| "cp"` | discriminator key |
| `title` | string | required |
| `url` | string | required |
| `difficulty` | `"Easy" \| "Medium" \| "Hard"` | required |
| `completed` | boolean | default `false` |
| `completedAt` | Date? | |
| `notes` | string | Markdown |
| `revision` | boolean | default `false` |
| `userNotes` | string | Markdown |
| `tags` | string[] | |

Discriminator additions:
- `pattern`: `{ pattern: string, variation?: string }`
- `nonstandard`: `{ bucket: string }`
- `cp`: `{ platform?: string, contest?: string, rating?: number }`

### `questions`

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | |
| `userId` | ObjectId | ref `users` |
| `subjectId` | ObjectId | ref `groups` |
| `question` | string | required |
| `answer` | string | Markdown |
| `tags` | string[] | |

### `cheatsheets`

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | |
| `userId` | ObjectId | ref `users` |
| `title` | string | required |
| `slug` | string | unique per user |
| `body` | string | Markdown |
| `subjectId` | ObjectId? | ref `groups` |
| `tags` | string[] | |

### `activities`

Append-only log for user and admin actions.

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | |
| `actorId` | ObjectId | ref `users` |
| `targetUserId` | ObjectId | ref `users` |
| `kind` | string | action type (e.g. `problem.completed`) |
| `entity` | `{ type: string, id: ObjectId, title?: string }` | |
| `metadata` | Record<string, unknown> | JSON payload |
| `ip` | string? | client IP address |

### `invites`

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | |
| `email` | string | required |
| `name` | string? | |
| `role` | `"admin" \| "user"` | default `"user"` |
| `tokenHash` | string | SHA-256 hash of invite token |
| `invitedBy` | ObjectId | ref `users` |
| `status` | `"pending" \| "accepted" \| "revoked" \| "expired"` | default `"pending"` |
| `sentAt` | Date | timestamp sent |
| `expiresAt` | Date | token expiration date |
| `acceptedAt` | Date? | |

### `assessments` (`models/assessment.ts`)

Curated company Online Assessment templates with timed constraints, multi-language starter code, test suites, and proctoring rules.

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | Auto-generated |
| `title` | string | Assessment title (e.g. "Google L4 Software Engineer OA") |
| `slug` | string | Unique URL slug (indexed) |
| `company` | string | Company tag (e.g. "Google", "Amazon", "Uber") |
| `role` | string | Role name (e.g. "SDE 2", "Frontend Engineer") |
| `description` | string | Candidate briefing and overview |
| `durationMinutes` | number | Exam time limit (default 60) |
| `passingScore` | number | Minimum passing percentage score (default 70) |
| `isProOnly` | boolean | Entitlement gate flag (default true) |
| `difficulty` | `"Easy" \| "Medium" \| "Hard"` | Assessment difficulty tier |
| `companyInstructions` | string[] | Bullet-point rules and guidelines |
| `problems` | Subdocument array | Array of `IAssessmentProblem` documents |

Subdocument `IAssessmentProblem`:
- `id`: string (unique problem identifier)
- `title`: string
- `description`: string (Markdown problem statement, constraints, examples)
- `difficulty`: `"Easy" | "Medium" | "Hard"`
- `score`: number (points awarded, default 50)
- `patternTag`: string (e.g. "Sliding Window", "Dynamic Programming")
- `starterCode`: `{ cpp: string, python: string, java: string }`
- `testCases`: Array of `{ input: string, expectedOutput: string, isHidden: boolean, explanation?: string }`

### `assessment_submissions` (`models/assessmentSubmission.ts`)

Candidate test runs, code submissions, pass/fail test diagnostics, proctoring telemetry timelines, and AI behavioral forensic reports.

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | Unique submission identifier |
| `assessmentId` | ObjectId | ref `assessments` (indexed) |
| `userId` | ObjectId | ref `users` (indexed) |
| `startedAt` | Date | Session start timestamp |
| `submittedAt` | Date? | Session completion timestamp |
| `timeSpentSeconds` | number | Elapsed test duration |
| `status` | `"in_progress" \| "submitted" \| "abandoned" \| "flagged"` | Default `"in_progress"` |
| `problemResults` | Subdocument array | Code solutions, language, test cases passed, runtime ms, memory kb |
| `totalScore` | number | Earned test points |
| `maxScore` | number | Maximum possible test points |
| `percentile` | number | Calculated candidate performance percentile |
| `patternDiagnostics` | Subdocument array | Pattern mastery breakdown (e.g. Two Pointers: 100%, DP: 40%) |
| `telemetryEvents` | Subdocument array | Chronological event stream (`type`, `timestamp`, `severity`, `details`, `snapshotUrl`) |
| `forensicReport` | Subdocument | Integrity audit (`riskScore`, `verdict`, `summary`, `integrityFlags`, `generatedBy`) |
| `baselineSelfieUrl` | string? | Onboarding reference selfie URL (Cloudflare R2) |

### `subscription` (`models/subscription.ts`)

User commercial plan entitlements, Stripe subscription metadata, and AI evaluation quotas.

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | |
| `userId` | ObjectId | ref `users` (unique index) |
| `tier` | `"free" \| "pro_monthly" \| "pro_annual" \| "oa_pass"` | Plan level |
| `status` | `"active" \| "past_due" \| "canceled" \| "incomplete" \| "trialing"` | Stripe status |
| `stripeCustomerId` | string? | Stripe Customer ID (`cus_...`) |
| `stripeSubscriptionId` | string? | Stripe Subscription ID (`sub_...`) |
| `stripePriceId` | string? | Current active Stripe Price ID |
| `currentPeriodStart` | Date? | Billing cycle start |
| `currentPeriodEnd` | Date? | Billing cycle renewal date |
| `cancelAtPeriodEnd` | boolean | Cancellation state |
| `credits` | `{ aiTotal, aiUsed, oaTotal, oaUsed }` | Monthly / pass credits tracking |

### `user_cp_profiles` (`models/userCpProfile.ts`)

Multi-platform competitive programming ratings and synchronization stats.

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | |
| `userId` | ObjectId | ref `users` (unique index) |
| `handles` | Object | Linked handles (`codeforces`, `leetcode`, `codechef`, `atcoder`) |
| `ratings` | Object | Current and peak ratings per platform |
| `compositeScore` | number | Normalized 0–100 placement readiness index |
| `globalRank` | number? | Aggregated platform ranking |
| `totalSolved` | number | Cumulative count of solved problems across platforms |
| `streak` | number | Daily active problem-solving streak |
| `badges` | string[] | Earned competitive achievements |
| `lastSyncedAt` | Date | Last successful automated API scrape |

### `contests` (`models/contest.ts`)

Global programming contests indexed from Codeforces, LeetCode, CodeChef, and AtCoder.

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | |
| `platform` | `"codeforces" \| "leetcode" \| "codechef" \| "atcoder"` | Contest source |
| `contestId` | string | External platform contest identifier (compound index with platform) |
| `title` | string | Contest name (e.g. "Weekly Contest 438") |
| `url` | string | Direct link to participate |
| `startTime` | Date | Scheduled contest start time (indexed) |
| `endTime` | Date | Scheduled contest end time |
| `durationSeconds` | number | Length of contest in seconds |
| `status` | `"UPCOMING" \| "RUNNING" \| "FINISHED"` | Current state |
| `type` | string? | Contest classification (e.g. "Div. 2", "Biweekly") |

### `contest_subscriptions` (`models/contestSubscription.ts`)

User notification preferences for upcoming competitive programming contests.

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | |
| `userId` | ObjectId | ref `users` (unique index) |
| `email` | string | Notification recipient email |
| `platforms` | string[] | Platforms to alert (`["codeforces", "leetcode", ...]`) |
| `alertTiming` | number[] | Alert offsets in minutes before start (e.g. `[60, 1440]`) |
| `emailEnabled` | boolean | Master alert toggle |
| `unsubscribeToken` | string | Cryptographically secure token for one-click email unsubscribe |

### `pricing_plans` (`models/pricingPlan.ts`)

Dynamic subscription and checkout pricing plans managed by administrators without requiring code redeployments.

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | Auto-generated |
| `planKey` | `"pro_monthly" \| "pro_annual" \| "oa_pass"` | Plan identifier (unique index) |
| `name` | string | Display title (e.g. "BigO Pro Monthly") |
| `badge` | string? | Highlight badge (e.g. "MOST POPULAR", "SAVE 40%") |
| `priceUsd` | number | Plan price in USD |
| `period` | `"month" \| "year" \| "75_days"` | Billing frequency |
| `mode` | `"subscription" \| "payment"` | Recurring Stripe subscription vs one-time payment |
| `description` | string | Subtitle / target persona description |
| `features` | string[] | Array of feature bullet points |
| `aiCredits` | number | Behavioral analysis forensic credits (default 100) |
| `isActive` | boolean | Availability flag (indexed) |
| `stripePriceId` | string? | Associated Stripe Price ID (`price_...`) |

### `promo_codes` (`models/promoCode.ts`)

Administrative discount codes with plan applicability, percentage/fixed calculations, and redemption caps.

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | Auto-generated |
| `code` | string | Promotional code string (unique, uppercase, indexed) |
| `description` | string? | Internal campaign note |
| `discountType` | `"percentage" \| "fixed"` | Percentage discount vs flat USD amount off |
| `discountValue` | number | Percentage (e.g. 25 for 25%) or USD fixed amount (e.g. 10) |
| `applicablePlans` | string[] | Allowed plans (`["all"]` or specific array like `["pro_annual"]`) |
| `maxRedemptions` | number? | Maximum allowed redemptions (null for unlimited) |
| `redemptionCount` | number | Cumulative successful checkout redemptions |
| `expiresAt` | Date? | Expiration date |
| `isActive` | boolean | Active toggle (compound index with `code`) |
| `createdBy` | ObjectId? | ref `users` (admin who issued code) |

### `feedbacks` (`models/feedback.ts`)

User bug reports, feature suggestions, and administrative resolution workflows.

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | Auto-generated |
| `userId` | ObjectId? | ref `users` (optional for unauthenticated feedback) |
| `email` | string | User contact email |
| `name` | string? | Submitter name |
| `type` | `"bug" \| "feedback"` | Feedback type |
| `title` | string | Short summary title |
| `description` | string | Detailed issue or feedback description |
| `category` | string | Tag (e.g. "dsa", "oa", "ui", "other") |
| `severity` | `"low" \| "medium" \| "high" \| "critical"` | Bug severity (default "medium") |
| `pageUrl` | string? | URL where the issue occurred |
| `userAgent` | string? | Browser and OS user agent string |
| `ip` | string? | Submitter IP address (indexed with createdAt) |
| `status` | `"pending" \| "in_review" \| "resolved" \| "dismissed"` | Admin workflow status (indexed) |
| `adminNotes` | string? | Internal notes from administrator |

### `institutions` (`models/institution.ts`)

Campus and university partner tenants governing enterprise B2B licensing, seat allocations, and domain filtering.

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | Auto-generated |
| `name` | string | University / Campus name (e.g. "IIT Bombay") |
| `slug` | string | URL identifier (e.g. "iit-bombay", unique, indexed) |
| `domain` | string | Optional email domain restriction (e.g. "iitb.ac.in") |
| `logoUrl` | string? | Campus insignia image |
| `totalSeats` | number | Contracted candidate license capacity |
| `usedSeats` | number | Current students assessed against quota |
| `licenseValidUntil` | Date | Contract validity expiration date (indexed) |
| `status` | `"active" \| "suspended" \| "expired"` | Tenant status (indexed) |
| `createdById` | ObjectId? | ref `users` (SuperAdmin who provisioned tenant) |

### `institution_members` (`models/institutionMember.ts`)

Authorized college training & placement cell (TPC) staff roster with granular permissions. Compound unique index on `{ institutionId: 1, userId: 1 }`.

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | Auto-generated |
| `institutionId` | ObjectId | ref `institutions` (indexed) |
| `userId` | ObjectId | ref `users` (indexed) |
| `role` | `"head" \| "coordinator" \| "invigilator"` | TPC permission hierarchy |
| `department` | string? | Academic department (e.g. "Computer Science") |
| `status` | `"active" \| "invited" \| "revoked"` | Member access state (indexed) |
| `invitedBy` | ObjectId? | ref `users` (Head of TPC or SuperAdmin) |

### `cohort_drives` (`models/cohortDrive.ts`)

Campus placement testing drives connecting an assessment module to a student cohort testing window.

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | Auto-generated |
| `institutionId` | ObjectId | ref `institutions` (indexed) |
| `assessmentId` | ObjectId | ref `assessments` (company OA module, indexed) |
| `title` | string | Drive title (e.g. "2026 Batch - Technical Round 1") |
| `description` | string? | Candidate instructions |
| `startsAt` | Date | Drive testing window opening (indexed) |
| `endsAt` | Date | Drive testing window closing (indexed) |
| `durationMinutes` | number | Time limit per candidate session (default 90) |
| `strictProctoring` | boolean | Enforces dual-engine neural proctoring + tab lock |
| `allowedEmailDomains` | string[] | Array of authorized email suffixes |
| `accessCode` | string? | Passcode for student entry |
| `status` | `"scheduled" \| "live" \| "completed" \| "cancelled"` | Drive execution status (indexed) |
| `createdById` | ObjectId? | ref `users` (TPC Coordinator who scheduled drive) |

