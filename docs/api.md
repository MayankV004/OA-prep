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
