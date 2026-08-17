# Admin Panel + User Dashboard

This document details administrative capabilities, user management, and dashboard analytics.

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

## 2. Admin Navigation & Routes

Routes are organized under `/admin/*` and gated by `withRole("admin")`:

- `/admin` — Users List & Management
- `/admin/users/[id]` — User Detail & Read-only Dashboard view
- `/admin/invites` — Invite Management (Pending, Accepted, Revoked)
- `/admin/content/problems` — Cross-user Problems table
- `/admin/content/topics` — Cross-user Topics table
- `/admin/content/cheatsheets` — Cross-user Cheat Sheets table
- `/admin/content/questions` — Cross-user Questions table
- `/admin/taxonomies` — Taxonomy Editor (Patterns, Subjects, Buckets, Platforms)
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
