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
