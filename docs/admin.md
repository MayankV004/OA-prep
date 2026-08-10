# Admin Panel + User Dashboard

This doc covers everything that lives behind the admin role and the user-facing dashboard that shares half its wiring. Read after schema.md and api.md.

## 1. Permission matrix

| Action | user | admin |
| --- | --- | --- |
| Read own problems / notes / cheatsheets / questions | Yes | Yes |
| Write own content | Yes | Yes |
| Read another user's content | No | Yes |
| Write another user's content | No | Yes |
| Read own dashboard | Yes | Yes |
| Read another user's dashboard | No | Yes |
| Read own activity feed | Yes | Yes |
| Read cross-user activity | No | Yes |
| List all users | No | Yes |
| Invite a new user | No | Yes |
| Promote / demote / disable / delete a user | No | Yes |
| Edit shared taxonomies (patterns, platforms, etc.) | No | Yes |
| Full-tenant JSON export | No | Yes |
| Own JSON export | Yes | Yes |

Rules enforced in the service layer (see security.md §2). The route gate `withRole('admin')` fronts every `/api/admin/*` endpoint; individual services also re-check role for defense in depth.

## 2. Admin panel layout

Routes live under `/admin/*`. The layout at `app/(admin)/admin/layout.tsx` is a server component that reads the session and hard-redirects to `/` if `role !== "admin"`. The client-side sidebar highlights the current tab.

```
/admin                       Users list (default landing)
/admin/users/:id             User detail (read-only dashboard + role/disable controls)
/admin/invites               Pending / accepted / revoked invites
/admin/content/problems      Cross-user problems table
/admin/content/topics        Cross-user topics table
/admin/content/cheatsheets   Cross-user cheatsheets table
/admin/content/questions     Cross-user questions table
/admin/taxonomies            Taxonomy editor
/admin/activity              Cross-user activity feed
```

### 2.1 Users list (`/admin`)

Table columns:
- Name / email
- Role (badge)
- Status (Active / Disabled)
- Joined
- Last seen
- Problems completed (all-time)
- 7-day activity spark line

Row click → `/admin/users/:id`.

Bulk actions: none in v1. Individual row menu: Promote / Demote, Disable / Enable, Delete (soft), Wipe (hard, confirms twice).

### 2.2 User detail (`/admin/users/:id`)

Two sections:

**Top: metadata + controls**
- Name, email, role, status, joined, last seen.
- Buttons: Promote / Demote, Disable / Enable, Reset password (admin-triggered — issues a new invite-style token to the user's email), Delete, Wipe.

**Bottom: read-only user dashboard**
- Same components as the user's own dashboard, hydrated with `userId=<this user's id>`.
- Every "edit" affordance on notes and problems is present because admin can edit — clicking a note opens the same editor, saving writes with the admin as `actorId` and the user as `targetUserId`.

### 2.3 Invites (`/admin/invites`)

Two panels:

**Send invite** (top): email input, name (optional), role select (default `user`). Submit posts to `POST /api/admin/invites`, which:
1. Rejects duplicates: if a pending invite for the same email exists, resend that one instead of creating a new row.
2. Generates a 32-byte random token, hashes it to `tokenHash`, stores the row with `status: "pending"`, `expiresAt: now + INVITE_TOKEN_TTL_HOURS`.
3. Sends the invite email via Resend using the `Invite.tsx` React Email template, passing the raw token in the link.

**Invite list** (below): filterable by status. Each row shows email, role, invited-by, sent-at, expires-at, status. Row actions: Resend (updates `sentAt`, extends `expiresAt`, re-sends email), Revoke (sets `status: "revoked"`).

### 2.4 Content admin

Four tables at `/admin/content/{problems, topics, cheatsheets, questions}`. Each looks like the user's own version of that section, plus:
- **User** column with the owner's email.
- Filter: user, difficulty, tag, completion state.
- Edit / delete affordances write with `actor.userId = admin.userId`, `targetUserId = row.userId`.

Selection is single-row in v1. Bulk edit is a phase-two feature.

### 2.5 Taxonomies (`/admin/taxonomies`)

Six sub-tabs, one per taxonomy kind (`pattern`, `bucket`, `platform`, `subject`, `advanced`, `difficulty`). Each shows a drag-to-reorder list with name / slug / order / archived state. Add row inline. Edit inline. Delete → confirms and either removes (if no content references the value) or archives (if any does). Archived values stay valid on existing content but hide from write UIs.

Slug is derived from name on create (`slugify` with lowercase + hyphens); admin can override.

### 2.6 Activity (`/admin/activity`)

Live table hitting `GET /api/admin/activity`. Filters:
- Actor (user picker)
- Target user (user picker)
- Kind (multi-select from the event catalogue)
- Date range

Each row: timestamp, actor, target (if different), kind badge, entity title (links to the entity), metadata JSON preview.

## 3. User dashboard (own view)

Route: `/dashboard`. Server-side hydrates from `/api/dashboard/stats?userId=me`.

Five components stacked vertically:

### 3.1 Completion trend — LineChart

Last 90 days of `completedAt` counts, one point per day. Recharts:

```tsx
<LineChart data={trend} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
  <XAxis dataKey="date" tickFormatter={fmtShort} />
  <YAxis allowDecimals={false} />
  <Tooltip />
  <Line type="monotone" dataKey="completed" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
</LineChart>
```

### 3.2 Group progress — BarChart

Horizontal bars, one per pattern / platform / subject depending on active tab. Data is `totalsByKind` rolled up per group:

```tsx
<BarChart data={groups} layout="vertical">
  <XAxis type="number" />
  <YAxis dataKey="name" type="category" width={140} />
  <Tooltip />
  <Bar dataKey="completed" stackId="a" fill="hsl(var(--primary))" />
  <Bar dataKey="remaining" stackId="a" fill="hsl(var(--muted))" />
</BarChart>
```

### 3.3 Difficulty mix — stacked BarChart

Three-segment bar (Easy / Medium / Hard) per group. Same `BarChart` primitive with three `<Bar>` children stacked on `stackId="d"`.

### 3.4 Activity heatmap — custom SVG

90-day grid, seven rows (Sun–Sat), ~13 columns. Each cell colored by `Math.min(count, 4)` mapped to a five-step Tailwind palette. Not a Recharts chart — a small `HeatmapCell` component in `components/dashboard/ActivityHeatmap.tsx`. Hover tooltip shows date + count.

### 3.5 Activity feed

`components/dashboard/ActivityFeed.tsx`. Renders the `recent` array from the stats endpoint. Each row:
- Icon per `kind` (checkbox filled = problem completed, pencil = note edited, plus = created, trash = deleted)
- One-line copy interpolating the entity title
- Relative time via `date-fns`

## 4. Activity event catalogue

Every service function that mutates emits exactly one activity row from `recordActivity`.

| kind | Triggered by | Sample metadata |
| --- | --- | --- |
| `session.signed_in` | Successful sign-in | `{ ip }` |
| `session.signed_out` | Sign-out route | — |
| `problem.created` | POST /api/problems | `{ kind, difficulty, group }` |
| `problem.updated` | PATCH /api/problems/:id | `{ changedFields }` |
| `problem.completed` | PATCH /api/problems/:id/completion → true | `{ difficulty, pattern }` |
| `problem.uncompleted` | PATCH /api/problems/:id/completion → false | — |
| `problem.deleted` | DELETE /api/problems/:id | `{ title }` |
| `note.updated` | PATCH /api/problems/:id or /topics/:id with `notes/body` | `{ len }` |
| `topic.created` | POST /api/topics | `{ groupId }` |
| `topic.updated` | PATCH /api/topics/:id | `{ changedFields }` |
| `topic.deleted` | DELETE /api/topics/:id | `{ title }` |
| `cheatsheet.created` | POST /api/cheatsheets | `{ slug }` |
| `cheatsheet.updated` | PATCH /api/cheatsheets/:id | `{ changedFields }` |
| `cheatsheet.deleted` | DELETE /api/cheatsheets/:id | `{ slug }` |
| `question.created` | POST /api/questions | `{ subjectId }` |
| `question.updated` | PATCH /api/questions/:id | `{ changedFields }` |
| `question.deleted` | DELETE /api/questions/:id | — |
| `admin.user.invited` | POST /api/admin/invites | `{ email, role }` |
| `admin.user.role_changed` | PATCH /api/admin/users/:id/role | `{ from, to }` |
| `admin.user.disabled` | PATCH /api/admin/users/:id `{ disabled: true }` | — |
| `admin.user.enabled` | PATCH /api/admin/users/:id `{ disabled: false }` | — |
| `admin.user.deleted` | DELETE /api/admin/users/:id | `{ wipe }` |
| `admin.taxonomy.created` | POST /api/admin/taxonomies | `{ kind, name }` |
| `admin.taxonomy.updated` | PATCH /api/admin/taxonomies/:id | `{ changedFields }` |
| `admin.taxonomy.archived` | DELETE /api/admin/taxonomies/:id | `{ kind, name }` |

Adding a new mutation? Add a `kind` here first, then wire the `recordActivity` call. That keeps the catalogue authoritative.

## 5. Invite email template

`emails/Invite.tsx` (React Email):

```tsx
import { Body, Button, Container, Head, Html, Preview, Section, Text } from "@react-email/components";

export function InviteEmail({ inviterName, appName = "PlacementDeck", url, expiresInHours }: {
  inviterName: string; appName?: string; url: string; expiresInHours: number;
}) {
  return (
    <Html>
      <Head />
      <Preview>{`${inviterName} invited you to ${appName}`}</Preview>
      <Body style={{ fontFamily: "system-ui, sans-serif", backgroundColor: "#f8fafc", padding: 24 }}>
        <Container style={{ maxWidth: 480, background: "white", padding: 32, borderRadius: 8 }}>
          <Text style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>{appName}</Text>
          <Text>{inviterName} invited you to join {appName}.</Text>
          <Text>Set your password and start tracking your prep. The link expires in {expiresInHours} hours.</Text>
          <Section style={{ margin: "24px 0" }}>
            <Button href={url} style={{ background: "#111827", color: "white", padding: "10px 20px", borderRadius: 6, textDecoration: "none" }}>
              Accept invite
            </Button>
          </Section>
          <Text style={{ fontSize: 12, color: "#6b7280" }}>If the button does not open, paste this link into your browser:</Text>
          <Text style={{ fontSize: 12, color: "#6b7280", wordBreak: "break-all" }}>{url}</Text>
        </Container>
      </Body>
    </Html>
  );
}
```

Rendered and sent via `lib/email.ts`:

```ts
import { Resend } from "resend";
import { render } from "@react-email/render";
import { InviteEmail } from "@/emails/Invite";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendInviteEmail(args: {
  to: string; inviterName: string; token: string; expiresInHours: number;
}) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${args.token}`;
  const html = await render(<InviteEmail
    inviterName={args.inviterName}
    url={url}
    expiresInHours={args.expiresInHours}
  />);
  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    replyTo: process.env.EMAIL_REPLY_TO,
    to: args.to,
    subject: `${args.inviterName} invited you to PlacementDeck`,
    html,
  });
}
```

Send failures do not roll back the invite record — the admin sees "resend" on any invite older than 5 minutes with no accept.
