# Database Schema

MongoDB via Mongoose. Every user-owned collection carries `userId`. Cross-user reads and writes are gated in the service layer by role.

Timestamps (`createdAt`, `updatedAt`) come from Mongoose's built-in `timestamps: true` on every schema and are omitted from the field tables below.

## Ownership model

| Collection | Scope |
| --- | --- |
| `users` | System |
| `taxonomies` | Shared (admin-writable, everyone reads) |
| `groups` | Shared (admin-writable, everyone reads) |
| `topics` | Per user (`userId` required) |
| `problems` | Per user |
| `questions` | Per user |
| `cheatsheets` | Per user |
| `activities` | Per user (both `actorId` and `targetUserId`) |
| `invites` | System (admin-managed) |

## Collections

### `users`

Managed by BetterAuth's MongoDB adapter. Extended with the fields below via the `additionalFields` config in `lib/auth.ts`.

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | BetterAuth default |
| `email` | string | BetterAuth default, unique |
| `emailVerified` | boolean | BetterAuth default |
| `name` | string | BetterAuth default |
| `image` | string? | BetterAuth default |
| `role` | `"admin" \| "user"` | default `"user"`; first user via bootstrap is `"admin"` |
| `disabled` | boolean | default `false`; disabled users cannot sign in |
| `lastSeenAt` | Date? | updated on session issue |
| `invitedBy` | ObjectId? | ref `users` — who invited them |

Indexes:
- `{ email: 1 }` unique (BetterAuth default)
- `{ role: 1 }`
- `{ disabled: 1 }`

### `taxonomies`

Admin-editable list values that used to live in seed constants.

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | |
| `kind` | `"pattern" \| "bucket" \| "platform" \| "subject" \| "advanced" \| "difficulty"` | required |
| `name` | string | required, 1–80 chars |
| `slug` | string | required, unique within kind |
| `order` | number | manual sort within kind |
| `archived` | boolean | default `false`; content referencing an archived value stays valid but the value hides from write UIs |

Indexes:
- `{ kind: 1, slug: 1 }` unique
- `{ kind: 1, order: 1 }`
- `{ kind: 1, archived: 1 }`

### `groups`

Concrete Subject and AdvancedTopicGroup rows, distinct from the underlying taxonomy label because each Group carries content (topics, questions).

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | |
| `kind` | `"subject" \| "advanced"` | required |
| `name` | string | required |
| `slug` | string | required, unique within kind |
| `order` | number | |

Indexes:
- `{ kind: 1, slug: 1 }` unique
- `{ kind: 1, order: 1 }`

### `topics`

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | |
| `userId` | ObjectId | ref `users` |
| `groupId` | ObjectId | ref `groups` |
| `title` | string | required |
| `body` | string | Markdown |
| `tags` | string[] | |

Indexes:
- `{ userId: 1, groupId: 1 }`
- Text index `{ title: "text", body: "text" }` weights `{ title: 5, body: 1 }`

### `problems`

Base collection with three discriminators.

Base fields:

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | |
| `userId` | ObjectId | ref `users` |
| `kind` | `"pattern" \| "nonstandard" \| "cp"` | discriminator |
| `title` | string | required |
| `url` | string | required, URL-validated |
| `difficulty` | `"Easy" \| "Medium" \| "Hard"` | validated against `taxonomies` where `kind = "difficulty"` |
| `completed` | boolean | default `false` |
| `completedAt` | Date? | set on true, cleared on false |
| `notes` | string | Markdown |
| `tags` | string[] | |

Discriminator additions:

| `kind` | Extra fields |
| --- | --- |
| `pattern` | `pattern: string` (validated against `taxonomies` kind `pattern`) |
| `nonstandard` | `bucket: string` (validated against kind `bucket`) |
| `cp` | `platform: string` (validated against kind `platform`), `contest?: string`, `rating?: number` |

Indexes:
- `{ userId: 1, kind: 1, pattern: 1 }` partial: `kind: "pattern"`
- `{ userId: 1, kind: 1, bucket: 1 }` partial: `kind: "nonstandard"`
- `{ userId: 1, kind: 1, platform: 1, contest: 1 }` partial: `kind: "cp"`
- `{ userId: 1, kind: 1, completed: 1 }`
- `{ userId: 1, completedAt: -1 }` — for dashboard trend / heatmap
- `{ userId: 1, difficulty: 1 }`
- `{ userId: 1, tags: 1 }` (multikey)
- Text index `{ title: "text", notes: "text" }` weights `{ title: 5, notes: 1 }`

### `questions`

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | |
| `userId` | ObjectId | |
| `subjectId` | ObjectId | ref `groups` where `kind = "subject"` |
| `question` | string | required |
| `answer` | string | Markdown |
| `tags` | string[] | |

Indexes:
- `{ userId: 1, subjectId: 1 }`
- Text index `{ question: "text", answer: "text" }`

### `cheatsheets`

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | |
| `userId` | ObjectId | |
| `title` | string | required |
| `slug` | string | unique per user |
| `body` | string | Markdown |
| `subjectId` | ObjectId? | optional ref |
| `tags` | string[] | |

Indexes:
- `{ userId: 1, slug: 1 }` unique
- `{ userId: 1, tags: 1 }`
- Text index `{ title: "text", body: "text" }`

### `activities`

Single append-only stream for user + admin actions.

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | |
| `actorId` | ObjectId | ref `users` — who did it |
| `targetUserId` | ObjectId | ref `users` — whose data was touched (equal to `actorId` when a user acts on themselves) |
| `kind` | string | see the event catalogue in admin.md |
| `entity` | `{ type: string, id: ObjectId, title?: string }` | optional |
| `metadata` | Record<string, unknown> | small JSON payload (e.g. `{ difficulty, pattern }`) |
| `ip` | string? | request IP, kept for security review only |

Indexes:
- `{ targetUserId: 1, createdAt: -1 }` — user dashboard feed + admin drilldown
- `{ actorId: 1, createdAt: -1 }` — "everything I did"
- `{ kind: 1, createdAt: -1 }` — admin filter
- TTL: none. Activity is small and cheap; keep it.

### `invites`

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | |
| `email` | string | required, lowercase |
| `name` | string? | pre-fill on accept |
| `role` | `"admin" \| "user"` | default `"user"` |
| `tokenHash` | string | SHA-256 of the invite token; raw token only shipped in the email |
| `invitedBy` | ObjectId | ref `users` |
| `status` | `"pending" \| "accepted" \| "revoked" \| "expired"` | default `"pending"` |
| `sentAt` | Date | updated by resend |
| `expiresAt` | Date | 7 days after `sentAt` |
| `acceptedAt` | Date? | |

Indexes:
- `{ email: 1, status: 1 }` — reject duplicate pending invites
- `{ tokenHash: 1 }` unique
- `{ expiresAt: 1 }` — cleanup query

## Relationships

```
users 1 ── * topics
users 1 ── * problems       (discriminated on kind)
users 1 ── * questions
users 1 ── * cheatsheets
users 1 ── * activities     (as actorId AND targetUserId)
users 1 ── * invites        (as invitedBy)

groups 1 ── * topics
groups (kind=subject) 1 ── * questions
groups (kind=subject) 1 ── ? cheatsheets

taxonomies (kind=pattern) ── name-ref ── problems.pattern
taxonomies (kind=bucket)  ── name-ref ── problems.bucket
taxonomies (kind=platform)── name-ref ── problems.platform
taxonomies (kind=difficulty)── name-ref ── problems.difficulty
```

No hard foreign keys — Mongoose refs only. Cascade on user delete (`?wipe=true`) lives in the service layer; a soft delete flips `users.disabled = true` and leaves data in place.

## Text search strategy

MongoDB caps one text index per collection. Four collections have their own; `/api/search` fans out parallel queries and merges by `textScore`. Query is always scoped by `userId` unless the caller is admin and passed `scope=all`.

## Mongoose model files

```
models/
├─ index.ts
├─ user.ts
├─ group.ts
├─ topic.ts
├─ problem.ts        # base + three discriminators
├─ question.ts
├─ cheatsheet.ts
├─ taxonomy.ts
├─ activity.ts
└─ invite.ts
```

`problem.ts` sketch:

```ts
const problemSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
  completed: { type: Boolean, default: false, index: true },
  completedAt: Date,
  notes: String,
  tags: [String],
}, { timestamps: true, discriminatorKey: "kind" });

export const Problem = model("Problem", problemSchema);
export const PatternProblem = Problem.discriminator("pattern",
  new Schema({ pattern: { type: String, required: true } }));
export const NonStandardProblem = Problem.discriminator("nonstandard",
  new Schema({ bucket: { type: String, required: true } }));
export const CpProblem = Problem.discriminator("cp",
  new Schema({ platform: String, contest: String, rating: Number }));
```
