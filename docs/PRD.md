# Product Requirements Document — PlacementDeck

> Working name: **PlacementDeck**. Alternates if you want something else: *Prepbook*, *Runway*.
> Everything below assumes a single Markdown file per doc; treat this as the contract the rest of the docs implement.

## 1. Goal

One web app that replaces the scatter of Notion pages, GitHub gists, browser bookmarks, and half-finished Google Docs used for campus placement prep. It tracks what has been solved, holds the notes written while solving it, and stores the concept material to be revised the night before an interview. Owner (admin) can invite friends or juniors to use the same instance and watch their progress from one panel.

## 2. Users and roles

Two roles:

| Role | Capabilities |
| --- | --- |
| `admin` | Full access to own content, plus: invite users, promote/demote users, edit any user's content, edit shared taxonomies, view every user's dashboard. |
| `user` | Full access to own content only. Sees own dashboard. Cannot see other users' data. |

First user is created by the seed script from `ADMIN_BOOTSTRAP_EMAIL` and gets `role = admin`. Every additional user is created by an admin sending an invite email; the invitee sets their password from the invite link and lands with `role = user`. An admin can promote any user to admin later.

## 3. In-scope features

### 3.1 Pattern-wise DSA practice
- Problems grouped by pattern (Sliding Window, Two Pointers, Binary Search, Backtracking, DP, Graphs, Trees, Greedy, Heap, Trie, Segment Tree, Bit Manipulation). Pattern list is admin-editable, not hardcoded.
- Each problem row: title, external URL, difficulty, completed checkbox, Markdown notes.
- Per-pattern progress bar (completed / total).

### 3.2 Non-standard DSA problems
- Same row shape as 3.1. Grouped by admin-editable "bucket" names.

### 3.3 Competitive programming problems
- Same row shape as 3.1. Grouped by admin-editable platform names, with an optional numeric rating.

### 3.4 Core subjects prep
- Subjects: OS, DBMS, CN, OOP, SE (extendable by admin from the taxonomies editor).
- Each subject holds topics; each topic holds one Markdown concept note.

### 3.5 Advanced tech topics
- Same shape as 3.4. Groups: DevOps, Docker, Kubernetes, GenAI, System Design, Cloud (admin-editable).

### 3.6 Interview questions
- Grouped by subject. Each entry: question text + Markdown answer.

### 3.7 Last-minute cheat sheets
- One Markdown document per cheat sheet, tagged by subject or topic.

### 3.8 Non-standard DSA and CP progress
- Same trackable-row shape as 3.1 — checkbox + notes + external link.

### 3.9 User dashboard (every user's own view)
- Completion trend over time (line chart).
- Per-pattern / per-platform / per-subject progress (grouped bar).
- Difficulty mix of completed problems (stacked bar).
- 90-day activity heatmap.
- Recent activity feed (last 30 events).

### 3.10 Admin panel (admin only)
- **Users tab** — list of every user with role, join date, last-seen, aggregate progress. Click a user to see their dashboard read-only. Promote / demote / disable / delete.
- **Invite** — email + role picker → sends invite email via Resend. Pending invites are listed with resend / revoke.
- **Content admin** — cross-user tables for problems / topics / cheatsheets / questions with filter by user, difficulty, tag, completed. Same edit and delete affordances the user has.
- **Taxonomies** — editor for patterns, non-standard buckets, CP platforms, subjects, advanced groups, difficulty tiers. Deletes are soft: entity stays flagged `archived` if any content references it.
- **Activity log** — every action across every user, filterable by actor, kind, date.

### 3.11 Cross-cutting
- GitHub-style Edit / Preview toggle on every Markdown field.
- Global search across the caller's own content.
- Tag filter chips (difficulty, pattern, subject, completion state).
- Auto-save on the Markdown editor (debounced, 800ms).
- Every meaningful action writes an ActivityLog row.

## 4. Non-goals

- No online judge, no code runner, no test-case execution. External links only.
- No public read view. Every route requires a session.
- No real-time collaboration, no comments, no presence indicators.
- No mobile app. Responsive web is enough.
- No spaced-repetition scheduler (may revisit later; not in v1).
- No OAuth providers in v1. Email + password only.
- No self-serve sign-up. Invite only.

## 5. Non-functional requirements

| Area | Requirement |
| --- | --- |
| Performance | Any list view renders in under 300ms on a 500-row seed. Notes editor first paint under 1s. Dashboard first paint under 1.5s with charts hydrated. |
| Durability | MongoDB Atlas daily snapshot. Manual JSON export endpoint per user; admin has a whole-tenant export. |
| Offline | Read-only cache of the last-viewed pages via TanStack Query's persister. No offline writes in v1. |
| Auth | BetterAuth email + password. Session cookie, HTTP-only, 30-day sliding. |
| Portability | Every note exportable as raw Markdown. |
| Accessibility | Keyboard-navigable list rows, focus rings on all interactive elements, chart data available in a table view for screen readers. |

## 6. Success criteria

- 300+ DSA problems and their notes migrated in from scattered sources within week 1.
- Search returns a match in under 200ms on a 500-row dataset.
- Zero data loss across 30 days of daily use (validated by the JSON export diff).
- Cheat sheet render matches GitHub's GFM output for the same input.
- Admin can invite a new user, that user signs in from the email link, and lands on their empty dashboard in under 60 seconds end-to-end.
- Admin sees a freshly-marked-complete problem reflected in the target user's dashboard heatmap on the next reload.

## 7. Explicit deferrals

Items considered and pushed to a later phase, not to be built now:
- Spaced repetition on interview questions.
- Attempt log per problem (multiple attempts with timestamps).
- Import from CSV / LeetCode's user profile scrape.
- Public share link for a single cheat sheet.
- OAuth providers (Google / GitHub sign-in).
- Password reset by user (admin resets manually for now).
