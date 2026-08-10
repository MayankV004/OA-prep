# API

REST over Next.js Route Handlers. Every route requires an authenticated BetterAuth session cookie unless flagged **Public**. Admin-only routes are flagged **Admin**. JSON in, JSON out. Every request body validates through a Zod schema colocated in `lib/zod/`.

## Conventions

- Base path: `/api`
- Content type: `application/json`
- Success: `200` for read/update, `201` for create, `204` for delete
- Errors: `400` (validation), `401` (unauth), `403` (wrong role), `404` (missing), `409` (conflict), `500` (server)
- Error body: `{ "error": { "code": string, "message": string, "issues"?: ZodIssue[] } }`
- List endpoints paginate: `?limit=50&cursor=<id>`; response includes `nextCursor`.
- Any admin-only route rejects a `user`-role caller with 403.

## Auth

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| ALL | `/api/auth/[...all]` | Public | BetterAuth catch-all |
| GET | `/api/invites/:token` | Public | Fetch an invite by its token (returns email + expiry) |
| POST | `/api/invites/:token/accept` | Public | Body `{ password }`. Creates the user, consumes the invite, signs them in. |

## Groups (Subject / AdvancedTopicGroup)

Groups are cross-user shared taxonomy references. Regular users can list; only admin can write.

| Method | Path | Auth | Body | Returns |
| --- | --- | --- | --- | --- |
| GET | `/api/groups?kind=subject\|advanced` | Auth | — | `Group[]` |
| POST | `/api/groups` | Admin | `{ name, kind, slug? }` | `Group` |
| PATCH | `/api/groups/:id` | Admin | `Partial<{ name, slug }>` | `Group` |
| DELETE | `/api/groups/:id` | Admin | `?force=true` | `204` |

## Topics (concept notes)

| Method | Path | Auth | Body | Returns |
| --- | --- | --- | --- | --- |
| GET | `/api/topics?groupId=...&userId=me` | Auth | — | `Topic[]` (own only unless admin) |
| GET | `/api/topics/:id` | Auth | — | `Topic` |
| POST | `/api/topics` | Auth | `{ groupId, title, body?, tags? }` | `Topic` (owned by caller) |
| PATCH | `/api/topics/:id` | Auth | `Partial<{ title, body, tags }>` | `Topic` (own only unless admin) |
| DELETE | `/api/topics/:id` | Auth | — | `204` |

Admin can pass `?userId=<id>` on any of these to act as that user.

## Problems (Pattern / Non-standard / CP via discriminator)

`kind` required on every write and every list.

| Method | Path | Auth | Body / Query |
| --- | --- | --- | --- |
| GET | `/api/problems?kind=...&group=...&completed=...&difficulty=...&tag=...` | Auth | — |
| GET | `/api/problems/:id` | Auth | — |
| POST | `/api/problems` | Auth | discriminator body (see below) |
| PATCH | `/api/problems/:id` | Auth | any subset of the write body |
| DELETE | `/api/problems/:id` | Auth | — |
| PATCH | `/api/problems/:id/completion` | Auth | `{ completed: boolean }` |

Write body per `kind`:

```jsonc
// pattern
{ "kind": "pattern", "title": "...", "url": "https://...", "difficulty": "Easy|Medium|Hard",
  "pattern": "Sliding Window", "notes": "...", "tags": ["array"] }

// nonstandard
{ "kind": "nonstandard", "title": "...", "url": "...", "difficulty": "...",
  "bucket": "Ad-hoc", "notes": "...", "tags": [] }

// cp
{ "kind": "cp", "title": "...", "url": "...", "difficulty": "...",
  "platform": "Codeforces", "contest": "Round 900 Div 2", "rating": 1500,
  "notes": "...", "tags": [] }
```

Admin may pass `?userId=<id>` on any problems route to act as that user.

## Progress

| Method | Path | Auth | Query | Returns |
| --- | --- | --- | --- | --- |
| GET | `/api/problems/progress` | Auth | `kind=pattern\|nonstandard\|cp&userId=me` | `[{ group, total, completed }]` |

## Interview questions

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/api/questions?subjectId=...&tag=...&userId=me` | Auth |
| GET | `/api/questions/:id` | Auth |
| POST | `/api/questions` | Auth |
| PATCH | `/api/questions/:id` | Auth |
| DELETE | `/api/questions/:id` | Auth |

## Cheat sheets

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/api/cheatsheets?tag=...&subjectId=...&userId=me` | Auth |
| GET | `/api/cheatsheets/:id` | Auth |
| POST | `/api/cheatsheets` | Auth |
| PATCH | `/api/cheatsheets/:id` | Auth |
| DELETE | `/api/cheatsheets/:id` | Auth |

## Tags

| Method | Path | Auth | Query | Returns |
| --- | --- | --- | --- | --- |
| GET | `/api/tags` | Auth | `q=prefix` | `string[]` |

## Search

| Method | Path | Auth | Query | Returns |
| --- | --- | --- | --- | --- |
| GET | `/api/search` | Auth | `q=...&kind=all\|problems\|topics\|cheatsheets\|questions&scope=me\|all&limit=20` | `SearchHit[]` |

`scope=all` requires admin.

## Activity

| Method | Path | Auth | Query | Returns |
| --- | --- | --- | --- | --- |
| GET | `/api/activity` | Auth | `scope=me&limit=30&cursor=...` | `Activity[]` |

`scope=all` on this route rejects with 403 for non-admins; admin should use `/api/admin/activity` instead.

## Dashboard stats

| Method | Path | Auth | Query | Returns |
| --- | --- | --- | --- | --- |
| GET | `/api/dashboard/stats` | Auth | `userId=me` | see shape below |

Response shape:

```jsonc
{
  "totalsByKind": [{ "kind": "pattern", "total": 220, "completed": 84 }, ...],
  "difficultyMix": { "Easy": 40, "Medium": 32, "Hard": 12 },
  "trend": [{ "date": "2026-05-01", "completed": 3 }, ...],       // last 90 days
  "heatmap": [{ "date": "2026-05-01", "count": 5 }, ...],          // last 90 days
  "recent": [/* last 10 Activity rows */]
}
```

Admin passes `?userId=<id>` to fetch another user's stats.

## Export

| Method | Path | Auth | Returns |
| --- | --- | --- | --- |
| GET | `/api/export` | Auth | JSON dump of caller's own data |
| GET | `/api/admin/export` | Admin | JSON dump of every collection |

`Content-Disposition: attachment`. Streams.

## Admin — Users

| Method | Path | Auth | Body / Query | Returns |
| --- | --- | --- | --- | --- |
| GET | `/api/admin/users` | Admin | `q=...&role=...&limit=50&cursor=...` | `User[]` |
| GET | `/api/admin/users/:id` | Admin | — | `User` + counters |
| POST | `/api/admin/users` | Admin | `{ email, role?, name? }` | creates an Invite, sends email, returns `Invite` |
| PATCH | `/api/admin/users/:id` | Admin | `Partial<{ name, disabled }>` | `User` |
| DELETE | `/api/admin/users/:id` | Admin | `?wipe=true` | `204` (soft delete unless `wipe`) |
| PATCH | `/api/admin/users/:id/role` | Admin | `{ role: "admin" \| "user" }` | `User` |

Rules: admin cannot demote themselves if they are the last admin. `DELETE` on self returns 400.

## Admin — Invites

| Method | Path | Auth | Body | Returns |
| --- | --- | --- | --- | --- |
| GET | `/api/admin/invites` | Admin | `status=pending\|accepted\|revoked&limit=50` | `Invite[]` |
| POST | `/api/admin/invites` | Admin | `{ email, role?, name? }` | `Invite` |
| POST | `/api/admin/invites/:id/resend` | Admin | — | `Invite` (updates `sentAt`) |
| DELETE | `/api/admin/invites/:id` | Admin | — | `204` (revokes) |

`POST /api/admin/users` is a convenience alias for `POST /api/admin/invites`.

## Admin — Taxonomies

| Method | Path | Auth | Body | Returns |
| --- | --- | --- | --- | --- |
| GET | `/api/admin/taxonomies?kind=pattern\|bucket\|platform\|subject\|advanced\|difficulty` | Admin | — | `Taxonomy[]` |
| POST | `/api/admin/taxonomies` | Admin | `{ kind, name, slug?, order? }` | `Taxonomy` |
| PATCH | `/api/admin/taxonomies/:id` | Admin | `Partial<{ name, slug, order, archived }>` | `Taxonomy` |
| DELETE | `/api/admin/taxonomies/:id` | Admin | — | `204` (soft delete → `archived: true` if referenced) |

## Admin — Activity

| Method | Path | Auth | Query | Returns |
| --- | --- | --- | --- | --- |
| GET | `/api/admin/activity` | Admin | `actorId=...&targetUserId=...&kind=...&from=...&to=...&limit=100&cursor=...` | `Activity[]` |

## Zod schemas (canonical names)

Every route uses one of these; keep them in `lib/zod/`:
- `groupWriteSchema`, `groupUpdateSchema`
- `topicWriteSchema`, `topicUpdateSchema`
- `problemWriteSchema` (discriminated union on `kind`), `problemUpdateSchema`
- `questionWriteSchema`, `questionUpdateSchema`
- `cheatSheetWriteSchema`, `cheatSheetUpdateSchema`
- `searchQuerySchema`
- `taxonomyWriteSchema`, `taxonomyUpdateSchema`
- `inviteWriteSchema`, `acceptInviteSchema`
- `roleUpdateSchema`

Client forms import the same schema, so a valid form is a valid API call by construction.
