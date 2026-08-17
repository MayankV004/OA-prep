# Security

BigO handles private study notes, user progress, admin management, and email notifications. This document outlines the security controls, request sanitization, and authentication mechanisms in place.

## 1. Authentication

- **Better Auth** with MongoDB adapter.
- Session cookie attributes: `HttpOnly`, `Secure`, `SameSite=Lax`.
- Session lifetime: 30 days sliding expiry.
- Sign-up mechanism: Public sign-up is disabled. Account creation requires an admin invite token or initial seed bootstrap.
- Disabled user control: Accounts marked `disabled: true` are rejected at authentication.

## 2. Role Gates & Authorization

Implemented via `proxy.ts` middleware and helper functions in `lib/auth.ts`:

- `withAuth(req, fn)`: Verifies an active session cookie.
- `withRole(req, "admin", fn)`: Enforces `admin` role restriction for administrative endpoints under `/api/admin/*`.

Service functions validate resource ownership:
- Non-admin users can only query or mutate resources where `userId === actorUserId`.
- Admin users are authorized to inspect or manage user resources.

## 3. Middleware & Proxy (`proxy.ts`)

`proxy.ts` serves as the Next.js request interceptor for rate limiting and route protection:
- Intercepts requests under protected route prefixes (`/dashboard`, `/dsa`, `/admin`, `/api/*`, etc.).
- Enforces sliding-window rate limiting on API endpoints to prevent abuse.
- Redirects unauthenticated requests targeting protected UI routes to `/sign-in`.

## 4. Markdown XSS Mitigation

User notes, cheat sheets, and topic content are rendered via Markdown.

To prevent XSS:
- `react-markdown` is used alongside `rehype-sanitize` and `remark-gfm`.
- `@uiw/react-md-editor` preview uses sanitized rendering.
- `dangerouslySetInnerHTML` is avoided.

Sanitizer configuration allows standard formatting, links with `rel="noopener noreferrer nofollow"`, and code syntax highlighting while stripping dangerous tags (`<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>`, `<input>`).

## 5. Security Headers & CSP

Set in `next.config.mjs`:
- `frame-ancestors 'none'` to mitigate clickjacking.
- `X-Content-Type-Options: nosniff`.
- Content Security Policy restricting script and object sources.

## 6. Secrets Management

- Secrets are configured via environment variables (`.env.local` locally, Vercel Environment Variables in production).
- Credentials (`MONGODB_URI`, `BETTER_AUTH_SECRET`, `RESEND_API_KEY`) are kept out of source control (`.gitignore`).
- `.env.example` provides template placeholders.
