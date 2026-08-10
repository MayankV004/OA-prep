# Security

The threat model: a public-internet app that holds hundreds of hours of study notes, allows admins to view any user's data, ships user-authored Markdown to other users' browsers via admin content admin, and sends email on behalf of a real domain. Enough surface to take seriously.

## 1. Auth

- BetterAuth with the MongoDB adapter. Email + password only in v1.
- Password hashing is BetterAuth's default (argon2id). Do not swap.
- Session cookie: `HttpOnly`, `Secure`, `SameSite=Lax`. BetterAuth sets these; do not override.
- Session lifetime: 30 days sliding.
- No self-serve sign-up. Two ways to create a user: seed bootstrap (once) and admin invite (thereafter).
- Disabled users (`users.disabled = true`) cannot sign in — BetterAuth's `signIn` hook rejects them.

## 2. Roles and route gates

Two helpers in `lib/auth.ts`:

```ts
export async function withAuth<T>(
  req: Request,
  fn: (ctx: { userId: string; role: "admin" | "user" }) => Promise<T>,
): Promise<Response> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) return jsonError(401, "UNAUTHORIZED");
  if ((session.user as any).disabled) return jsonError(403, "DISABLED");
  return fn({ userId: session.user.id, role: (session.user as any).role });
}

export function withRole<T>(
  req: Request,
  role: "admin",
  fn: (ctx: { userId: string; role: "admin" }) => Promise<T>,
) {
  return withAuth(req, async (ctx) => {
    if (ctx.role !== role) return jsonError(403, "FORBIDDEN");
    return fn(ctx as any);
  });
}
```

Rules encoded in the service layer, not the route handler:

- Every service function takes `actor: { userId, role }` as its first argument.
- Any read of another user's data requires `actor.role === "admin"`. Same for writes.
- The last admin cannot be demoted or disabled (service checks `role: "admin", disabled: false` count > 1 before allowing).
- Users cannot delete themselves via `DELETE /api/admin/users/:id` — that endpoint refuses `id === actor.userId`.

## 3. Invite tokens

- Token is 32 random bytes, base64url encoded. Only the SHA-256 hash lands in `invites.tokenHash`.
- Raw token appears once: in the outgoing email link.
- Expiry: `INVITE_TOKEN_TTL_HOURS` (default 168, seven days). Expired invites are refused; the admin sees "expired" status and can resend.
- Accept flow: `POST /api/invites/:token/accept` looks up the invite by `sha256(token)`, checks `status = "pending"` and `expiresAt > now`, then hands off to `auth.api.signUpEmail` with the email from the invite and the password from the request body. On success flips `status` to `"accepted"` and stamps `acceptedAt`.
- Revoke: admin sets `status = "revoked"`. The hash stays for audit.
- Reuse: the accept route is idempotent by token — a used token returns 410 Gone.

## 4. Markdown XSS containment

The biggest attack surface. Notes are user-authored Markdown and get rendered as HTML in both the author's browser and the admin's content-admin view. A hostile note authored by one user must not execute in an admin's session.

Rules:
- Never use `react-markdown` without `rehype-sanitize`.
- Never enable `dangerouslyAllowHtml` on `@uiw/react-md-editor`'s preview.
- Never call `dangerouslySetInnerHTML` on any Markdown-derived string.

Sanitizer schema (`lib/markdown/sanitize.ts`):

```ts
import { defaultSchema } from "rehype-sanitize";

export const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), ["className", /^language-/]],
    span: [...(defaultSchema.attributes?.span ?? []), ["className", /^hljs-/]],
    a: [
      ...(defaultSchema.attributes?.a ?? []),
      ["target", "_blank"],
      ["rel", "noopener noreferrer nofollow"],
    ],
  },
  tagNames: (defaultSchema.tagNames ?? []).filter(
    (t) => !["iframe", "object", "embed", "style", "link", "form", "input", "button"].includes(t),
  ),
  protocols: {
    href: ["http", "https", "mailto"],
    src: ["http", "https"],
  },
};
```

Same schema powers the editor's preview and the read-only render, so a hostile note behaves identically wherever it renders.

Test fixtures in `tests/sanitize.fixture.md` cover:
- `<script>alert(1)</script>`
- `[click](javascript:alert(1))`
- `<img src=x onerror=alert(1)>`
- `<svg><use href="data:...">`
- `<iframe src="https://evil">`

Snapshot test fails closed on any sanitizer regression.

## 5. Content Security Policy

Set in `next.config.js` via headers:

```
default-src 'self';
img-src 'self' data: https:;
style-src 'self' 'unsafe-inline';
script-src 'self' 'unsafe-inline';
connect-src 'self';
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

`frame-ancestors 'none'` blocks clickjacking. The `'unsafe-inline'` on `script-src` is a Next-in-dev concession — swap to a nonce middleware in prod if you want to tighten further.

## 6. Rate limiting

`@upstash/ratelimit` with Upstash Redis (free tier). Applied via `middleware.ts` scoped to the sensitive paths only:

| Path | Limit | Key |
| --- | --- | --- |
| `POST /api/auth/sign-in` | 5 / minute | IP |
| `POST /api/admin/invites` | 10 / hour | admin userId |
| `POST /api/invites/:token/accept` | 5 / hour | IP (mitigates token guessing) |
| `GET  /api/admin/export` | 3 / hour | admin userId |
| `GET  /api/export` | 6 / hour | user userId |

Everything else unrestricted.

## 7. Activity log privacy

- Users see their own activity only via `/api/activity?scope=me`. `scope=all` on that route returns 403 for non-admins.
- Admin sees all activity via `/api/admin/activity`.
- `activities.ip` is included on the admin filter view. Regular users never see the IP field.
- Admin actions on another user's content generate rows with `actorId != targetUserId` — those show up in the target user's dashboard feed with a "by admin: <name>" prefix so the user knows their content was touched.

## 8. Secrets handling

- All secrets in `.env.local` (dev) and Vercel Env Vars (prod). Never committed.
- `.env.example` checked in with empty values.
- `BETTER_AUTH_SECRET`, `RESEND_API_KEY`, `MONGODB_URI` differ across dev / preview / prod.
- Rotating `BETTER_AUTH_SECRET` invalidates all sessions. Do it if you suspect leakage.
- `RESEND_API_KEY` is scoped to `emails.send` only. Rotate quarterly.
- `MONGODB_URI` credentials are per-environment DB users with read/write on `placementdeck` only, no cluster admin.

## 9. Backups and data-loss prevention

Covered in deployment.md §5. Summary: daily admin JSON export archived off-Atlas plus Vercel deploy history for code rollback.

Additional guardrails:
- Delete endpoints commit inside a Mongoose transaction and only return 204 after commit.
- `DELETE /api/admin/users/:id` requires `?wipe=true` to purge; the default is soft delete (`disabled: true`).
- `DELETE /api/admin/taxonomies/:id` is soft when any content references the value (`archived: true` instead of remove).
- Every mutation writes Mongoose's `__v` version key; concurrent writes from two tabs surface a version conflict rather than silently overwriting.

## 10. Email deliverability + safety

- SPF + DKIM + DMARC are prerequisites — see deployment.md §1.
- Invite emails link to `https://<domain>/invite/<token>`. Short, single-purpose. No tracking pixels.
- No user-authored content lands in outgoing email. Templates only interpolate the invitee's name (sanitized to plain text, no HTML injection).
- If an admin's email leaks and someone floods the invite endpoint, per-admin rate limit above caps damage at 10 invites / hour.

## 11. What is intentionally not done

- No 2FA. May revisit for admin accounts if the threat model warrants.
- No OAuth. Password + invite is fewer moving parts.
- No WAF. Vercel's default protections cover the traffic profile.
- No PII scrubbing on export. Data belongs to the tenant.
- No admin action approval flow. Every admin has full trust — invite carefully.
