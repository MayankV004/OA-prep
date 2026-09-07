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
| `assessments` | Shared (company OA templates and problems) |
| `assessment_submissions` | Per user (`userId` + `assessmentId`) with proctoring audit logs |
| `subscription` | Per user (`userId` unique) with Stripe metadata & AI quotas |
| `user_cp_profiles` | Per user (`userId` unique) with multi-platform CP stats |
| `user_contest_histories` | Per user (`userId` + platform rating history) |
| `contests` | Shared (global programming contest index) |
| `contest_subscriptions` | Per user (contest notification alert preferences) |
| `contest_alert_logs` | System (dispatched contest notification tracking) |
| `feedbacks` | Per user (`userId` optional) with admin moderation |

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
| `_id` | ObjectId | |
| `title` | string | Assessment title (e.g. "Google L4 Software Engineer OA") |
| `slug` | string | Unique URL slug (indexed) |
| `company` | string | Company tag (e.g. "Google", "Amazon", "Uber") |
| `role` | string | Role name (e.g. "SDE 2", "Frontend Engineer") |
| `description` | string | Candidate briefing and overview |
| `durationMinutes` | number | Exam time limit (e.g. 90) |
| `difficulty` | `"Easy" \| "Medium" \| "Hard"` | |
| `instructions` | string[] | Bullet-point rules and guidelines |
| `problems` | Subdocument array | Nested `IAssessmentProblem` documents (title, slug, starterCode, testCases) |
| `allowedLanguages` | string[] | Enabled languages: `["cpp", "python", "java", "javascript"]` |
| `isPublished` | boolean | Availability flag |
| `proctoringConfig` | Object | Enabled proctoring rules (camera, audio, faceDetection, deviceDetection, etc.) |
| `createdBy` | ObjectId | ref `users` (admin author) |

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

### `feedbacks` (`models/feedback.ts`)

In-app user feedback, bug reports, and moderation workflows.

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | |
| `userId` | ObjectId? | ref `users` (optional for anonymous submissions) |
| `category` | `"bug" \| "feature" \| "content" \| "other"` | Feedback category |
| `message` | string | Feedback details / description |
| `rating` | number? | 1–5 star rating |
| `status` | `"pending" \| "in_progress" \| "resolved" \| "archived"` | Admin moderation state |
| `adminNotes` | string? | Internal administrative notes |

