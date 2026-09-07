# Security

BigO handles private study notes, user progress, admin management, and email notifications. This document outlines the security controls, request sanitization, and authentication mechanisms in place.

## 1. Authentication

- **Better Auth** with MongoDB adapter.
- Session cookie attributes: `HttpOnly`, `Secure`, `SameSite=Lax`.
- Session lifetime: 30 days sliding expiry.
- **Mandatory OTP Email Verification**: 6-digit One-Time Password (OTP) code dispatched via Resend (`BigO <no-reply@bigoprep.tech>`) on signup and unverified login attempts.
- **Route & API Gate (`EMAIL_NOT_VERIFIED`)**: Accounts with `emailVerified: false` are restricted from accessing protected app routes (`/dashboard`, `/dsa`, `/profile`, etc.) until verified via OTP code.
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
- Credentials (`MONGODB_URI`, `BETTER_AUTH_SECRET`, `RESEND_API_KEY`, `STRIPE_SECRET_KEY`, `R2_*`, `GROQ_API_KEY`) are kept out of source control (`.gitignore`).
- `.env.example` provides template placeholders.

## 7. Online Assessment & Anti-Cheat Integrity Controls

The proctoring system enforces exam integrity while preserving candidate privacy:

- **Client-Side Compute Privacy**: Continuous video streams are never transmitted or saved to external servers. All facial recognition (BlazeFace) and prohibited object detection (COCO-SSD) execute locally within the candidate's browser sandbox via WebGL.
- **Evidence Vault Encryption**: Only brief WebP snapshot frames captured during detected infractions are uploaded. These uploads target private Cloudflare R2 buckets using signed AWS SigV4 authentication.
- **Fullscreen & Focus Containment**: Assessments require HTML5 Fullscreen mode. Exiting fullscreen triggers visual countdown warnings and immediate telemetry event dispatch. The Page Visibility API monitors background tab switches, window minimizations, and screen changes.
- **Clipboard Restriction**: Pasting external code snippets into the Monaco Editor is blocked; repeated paste attempts generate high-severity telemetry events.
- **Tamper-Evident Chronological Telemetry**: Each telemetry record includes UTC timestamps, event severity, client metrics, and optional snapshot references evaluated by automated behavioral forensic analyzers.

## 8. Payment Security & Webhook Verification

- **Stripe Cryptographic Signature Validation**: All incoming requests to `/api/webhooks/stripe` must provide a valid `stripe-signature` header verified against `STRIPE_WEBHOOK_SECRET`.
- **Server-Side Entitlement Authority**: Client applications cannot declare or upgrade their own tiers. All subscription state, credits, and expiry timestamps are written strictly by server-side webhook handlers.
- **PCI-DSS Compliance**: No raw credit card details or payment credentials touch BigO servers. All checkout and payment method management is delegated to Stripe Checkout and Stripe Customer Portal.

