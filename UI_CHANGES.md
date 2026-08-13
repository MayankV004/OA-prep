# UI/UX Overhaul — Change Log

Frontend-only overhaul of PlacementDeck. **No backend file was modified**: no API
routes, Mongoose models, auth logic, Sanity schemas, Zod schemas, or configs.
Every change is presentation, with two categories of exception noted explicitly
below (frontend bug fixes, and new mutations against endpoints that already
existed).

---

## 1. Design system

### Tokens (`app/globals.css`)

- **Pink accent ramp**, `--accent-50` … `--accent-950`, at the project's
  existing hue (oklch ≈ 340). The brand colour was not re-picked; it was
  extended into a usable scale.
- **Layered surfaces.** Light: `background` off-white → `surface` white →
  `surface-sunken` for recessed regions. Dark: `0.145` base → `0.196` cards →
  `0.238` popovers, rather than an inverted light theme.
- **Borderless hairlines.** `--border` sits at 7% opacity and `--divider` at 5%.
  Because `globals.css` already applied `* { border-border }`, dropping the
  border opacity made every pre-existing bordered component read borderless
  without editing those files.
- **Elevation ramp** `--shadow-e1` … `--shadow-e4` plus `--shadow-glow`, which
  is what separates surfaces now instead of outlines.
- **Status tokens** for success / warning / info / danger, each with a `-muted`
  tint for backgrounds.
- **Type scale** with per-step line-height and letter-spacing, from `2xs` to
  `6xl`.
- **Motion tokens**, a `prefers-reduced-motion` block that neutralises
  animation, smooth scrolling, themed focus rings, and quiet scrollbars.

### Typography

- `components/ui/typography.tsx` — `Heading` (display / page / section / card /
  overline), `Text` (size / tone / weight / numeric), `Metric` for statistics,
  and `PageHeading` for page headers.
- Fonts: **Barlow** retained for UI, **Sora** added as a display face for
  headings, **JetBrains Mono** wired to `--font-mono`, which previously pointed
  at an unloaded variable.
- Numeric values render with tabular figures so table columns align.

### Accessibility — verified, not asserted

`scripts/check-contrast.py` parses the oklch values out of `globals.css`,
converts them to sRGB, and computes WCAG 2.1 contrast for 26 token pairs in
both themes. Run it with `python3 scripts/check-contrast.py`; it exits non-zero
on any failure.

The first run failed **10 pairs, all in the light theme**. Most significantly,
the pink accent at `accent-500` scored 3.49:1 behind white text and 3.40:1 as
link text — both below the 4.5:1 body-text threshold. Light-theme corrections:

| Token | Was | Now | Reason |
|---|---|---|---|
| `--primary`, `--ring`, `--chart-1` | `accent-500` | `accent-600` | 500 fails AA both as a fill behind white text and as link text |
| `--success` | `oklch(0.58 …)` | `oklch(0.538 …)` | 4.01:1 as text |
| `--warning` | `oklch(0.7 …)` | `oklch(0.55 …)` | 2.73:1 as text |
| `--warning-foreground` | dark | near-white | follows the darker fill |
| `--info` | `oklch(0.58 …)` | `oklch(0.563 …)` | 4.31:1 as text |
| `--muted-foreground` | `0.545` | `0.542` | 4.45:1 on sunken surfaces |
| `--chart-3`, `--chart-4` | — | darkened | below 3:1 against cards |

All 26 pairs now pass. The dark theme passed unmodified. Button and switch
hover states moved to `accent-700`, since `accent-600` is now the resting
colour.

Also: focus rings are themed rather than browser-default, decorative icons are
`aria-hidden`, icon-only controls carry `aria-label`, and no state is conveyed
by colour alone — difficulty, role, invite status and completion all pair
colour with a text label or icon.

---

## 2. Primitives

**New** (`components/ui/`): `tabs`, `switch`, `popover`, `alert-dialog` (with
`ConfirmDialog`, which echoes the item name back before a destructive action),
`toast` (provider + viewport + `useToast`), `separator`, `skeleton`, `label`,
`pagination`, `empty-state`, `error-state`.

Base UI (`@base-ui/react`) is not Radix, and the new wrappers follow its actual
API: `Tabs.Tab` / `Tabs.Panel` rather than Trigger / Content, `AlertDialog`
nesting `Portal > Backdrop + Viewport > Popup` with no Positioner, and
`Switch.Root` needing `nativeButton` to render as a button. Base UI ships no
Command component, so the palette is a hand-rolled overlay.

**Reworked borderless**: `card` (ring → surface tone + elevation, optional
hover lift), `input` (filled surface, accent focus ring, no resting outline),
`button` (fills promoted, `outline` demoted to tertiary, new `soft` and
`destructive-solid` variants, `xl` sizes for touch targets, and a `loading`
prop that swaps in a spinner without the button changing width).

---

## 3. Application shell

`components/shell/` — one shell, used by both the app and admin route groups,
driven by a nav config (`nav.ts`).

- **Collapsible sidebar**, 264px → 68px icon rail, persisted to `localStorage`.
  The stored value is read in an effect rather than during render (reading it
  inline would desync server markup), and a `ready` flag suppresses the width
  transition on first paint.
- **Active route** is a shared `layoutId` pill that slides between items,
  including across nav groups.
- **Collapsed rail** shows icon-only nav with tooltips.
- **Mobile drawer**: spring slide-in, blurred backdrop, tap-outside, and
  drag-to-dismiss with both distance and velocity thresholds. Body scroll locks
  while open.
- **Topbar**: breadcrumbs derived from the pathname, with opaque Mongo ids
  collapsing to "Detail" rather than printing 24 hex characters. Elevation
  appears only after scroll. 44px touch targets.
- **Command palette** on ⌘/Ctrl+K: arrow-key navigation, grouped results, theme
  actions, and a free-text fallthrough to `/search`.
- **Route transitions** cross-fade at 180ms — short enough not to delay
  perceived load.
- Sidebar and drawer separate from the page by surface tone and shadow, with no
  edge border anywhere.

---

## 4. Routes touched

### Auth — `app/(auth)/`

| Route | Change |
|---|---|
| `layout.tsx` | **New.** Split-screen shell: branded mesh panel at `lg`+, form column beside it, single column on mobile |
| `/sign-in` | Inline validation, password visibility toggle, banner errors, no-layout-shift loading CTA |
| `/sign-up` | Same, plus a password strength meter. Replaces the glassmorphism card and decorative blobs |
| `/invite/[token]` | Matching layout, skeleton instead of a bare spinner, strength meter |

The better-auth contract is untouched: same `authClient.signIn.email({ email,
password })` and `signUp.email({ email, password, name })`, same field names,
same redirects, same invite API calls.

### Marketing — `app/page.tsx`

Every hardcoded pink class mapped onto the accent ramp; redundant `dark:` twins
removed (tokens already flip per theme); blob stacks replaced by the
`accent-mesh` utility; hero gradient text via `text-gradient-accent`; SVG
gradient stops now read the accent CSS variables so the progress ring follows
the theme.

### App — `app/(app)/`

`/dashboard`, `/dsa`, `/dsa/[pattern]`, `/non-standard`, `/non-standard/[bucket]`,
`/cp`, `/cp/[platform]`, `/subjects`, `/subjects/[subject]`,
`/subjects/[subject]/[topic]`, `/advanced`, `/advanced/[group]`,
`/advanced/[group]/[topic]`, `/interview`, `/interview/[subject]`,
`/cheatsheets`, `/cheatsheets/[slug]`, `/search`.

Highlights: dashboard stat cards use `Metric`; charts read `var(--chart-N)`;
problem tables collapse to stacked cards below `md` so nothing needs
pinch-zoom; completion toggles are 44px on mobile and labelled by problem name;
long-form topic content is constrained to ~72ch while code blocks and tables
stay full-bleed; `/search` honours the `?q=` param the command palette passes.

The DSA index dropped its 7-entry hardcoded colour array rather than swapping in
different hardcoded hues — pattern cards are a homogeneous list scanned by title
and progress, so per-item colour was decoration, not information.

### Admin — `app/(admin)/admin/`

`/admin`, `/admin/users`, `/admin/users/[id]`, `/admin/invites`,
`/admin/activity`, `/admin/taxonomies`, `/admin/content/{problems, topics,
questions, cheatsheets, patterns}`, `/admin/content/patterns/[slug]`, and a new
`/admin/settings`.

Every hand-rolled table now uses `components/admin/DataTable`: sortable
columns, search, pagination, row selection with a bulk action bar, zebra
striping instead of row borders, skeleton / error / empty states, and a card
layout below `md`. Create and edit forms live in `components/admin/SlideOver`
so quick edits skip a page navigation. Native `confirm()` calls are replaced by
`ConfirmDialog`, and every mutation now toasts on success and failure.

The admin layout moved onto the shared shell. **Its client-side role guard is
preserved verbatim** — worth knowing that a `useEffect` redirect remains the
only thing protecting `/admin`; there is no middleware backstop.

### Loading and error boundaries

Added `loading.tsx` for `/dashboard`, `/dsa`, `/non-standard`, `/cp`,
`/subjects`, `/advanced`, `/interview`, `/cheatsheets` and `/admin` — skeletons
mirroring each real layout, never bare spinners.

Added `error.tsx` for the app, admin and auth route groups plus the root, and a
`global-error.tsx`. The global boundary replaces the root layout when it fires,
so it ships its own `html`/`body` with inline styles and cannot depend on the
theme provider or any app component.

---

## 5. Bugs fixed (frontend)

These were live defects found while working, not cosmetic changes:

1. **Charts never rendered in the brand colour.** Every recharts series used
   `hsl(var(--primary))`, but these tokens are raw `oklch()` values, so
   `hsl(oklch(…))` is invalid CSS and silently fell back. Now `var(--chart-N)`.
2. **Invite revoke faked success.** The mutation discarded the fetch response,
   so the 404 from the missing `DELETE /api/admin/invites/[id]` route resolved
   as fulfilled and the success path fired — revoking appeared to work and did
   nothing. Now checks `res.ok` and surfaces the failure.
3. **Invites table was always empty.** `GET /api/admin/invites` returns a bare
   array; the page read `data.data`. Now normalised defensively.
4. **Duplicate ThemeProvider.** `Providers.tsx` nested a second `next-themes`
   provider inside the root layout's, both competing over the `class`
   attribute. Removed.
5. **Invite success notice never shown.** The invite flow redirects to
   `/sign-in?success=Account+created` when auto-sign-in fails after the account
   is created, but sign-in never read the param — users saw a plain login form
   with no idea their account existed.
6. **Dashboard overflowed at 375px.** Chart cards lacked `min-w-0`, and a
   recharts `ResponsiveContainer` inside a CSS grid child will not shrink below
   its content.
7. **Taxonomy edit was unreachable.** `PATCH /api/admin/taxonomies/[id]` was
   fully implemented and the page even imported an `Edit2` icon, but no form
   existed. Now wired, sending only changed fields.
8. **Taxonomy delete was mislabelled** — the endpoint soft-deletes
   (`archived: true`) while the UI called it permanent deletion. Reworded.
9. **Invalid nested anchors.** Several `<Link><Button/></Link>` pairs emitted
   `<a><button>`. Now Base UI `render` props with identical hrefs.
10. **Problems admin page** was a permanently blank table (the endpoint returns
    `[]` by design since content moved to Sanity). Now an empty state pointing
    at `/studio`.
11. **"Add Question" button was inert** — no handler at all.
12. **Advanced topic title read "Loading…" permanently** for `topic === 'new'`.
13. **`ProblemRow` checkbox label** interpolated a frequently-undefined `title`;
    now falls back to `name`.

Also pruned pre-existing unused imports in four files.

---

## 6. Backend TODOs

19 `// TODO: backend` markers are in the code. Grouped:

### Missing endpoints

- **`DELETE /api/admin/invites/[id]`** — the route file does not exist, so
  revoke 404s. The UI now reports the failure honestly.
- **`POST` for topics, questions and cheatsheets** — create forms are built and
  sit behind a disabled submit with an inline notice. Wiring a submit that
  404s would reproduce bug #2, so they are deliberately inert until the
  endpoints exist.
- **`GET`/`PATCH /api/admin/settings`** — `/admin/settings` is interface-only.
  Its save button raises an error toast rather than pretending to persist. The
  expected shape is the `DEFAULTS` object at the top of that page.

### Bulk operations

No endpoint accepts an array of ids, so every bulk action loops client-side
with `Promise.allSettled` and reports "n succeeded, m failed". Real bulk
endpoints would replace those loops — each is marked.

### Pagination

No list endpoint returns a total count, so pagination is client-side over a
capped fetch. `/api/admin/users` and `/api/admin/activity` already return
`nextCursor` (currently unused), so cursor paging is the smaller lift.

### Smaller items

- `/search` ignores `?q=` server-side; the client seeds from it.
- No password reset route — "Forgot password?" is a placeholder link.
- No user preferences route — the menu item points at `/dashboard`.
- The admin signups chart derives from loaded rows, not an aggregate query, and
  says so in its own caption.

---

## 7. Notes for future work

- **Borderless primitives have drifted from upstream.** `input`, `card` and
  `button` were forked away from the `base-nova` defaults. A future
  `shadcn add` will overwrite them unless the changes are reapplied.
- **Shiki is pinned to `github-dark`** (`lib/shiki.ts`), and it emits colours
  inline. Code blocks therefore keep a dark canvas in light mode — the
  Stripe/Linear convention. A dual-theme Shiki config would be the proper fix.
- **`components/ui/accordion.tsx`** still carries `not-last:border-b`, which
  fights the borderless rule; call sites work around it with `border-b-0!`.
- **`/admin` has no middleware protection** — the client-side guard is all
  there is.
- Run `python3 scripts/check-contrast.py` after any token change.
