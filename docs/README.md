# BigO — Documentation

Personal placement-prep tracker, Online Assessment (OA) simulator, and computer science knowledge base. Features multi-user RBAC, invite-only access, pattern-based DSA tracking, automated CP profile synchronization, contest alert engines, monetization & billing, and client-side enterprise dual-engine neural proctoring.

**Stack:** Next.js 16 (App Router) + TypeScript · BetterAuth · MongoDB Atlas + Mongoose 9 · TanStack Query v5 · TensorFlow.js (BlazeFace + COCO-SSD) · Cloudflare R2 · Stripe · Monaco Editor · `@uiw/react-md-editor` · Tailwind CSS v4 + Base UI / shadcn · Recharts · Resend + React Email · Upstash Redis & QStash · OpenTelemetry · Vercel.

## Docs Index

| File | What's Inside |
| --- | --- |
| [PRD.md](./PRD.md) | Goals, user roles, functional specifications (DSA, OA Simulator, CP Sync, Contests, Billing), non-goals, and success metrics |
| [architecture.md](./architecture.md) | Technical stack wiring, dual-loop proctoring pipeline, request lifecycle, proxy/middleware, telemetry, and repo structure |
| [proctoring.md](./proctoring.md) | **Enterprise Dual-Engine Neural Proctoring**: BlazeFace biometrics, COCO-SSD device detection, optical fallback, HUD, R2 storage, and LLM forensics |
| [api.md](./api.md) | Complete REST route specification: OA assessments, proctoring, CP sync, contests, stripe billing, content CRUD, admin routes |
| [schema.md](./schema.md) | MongoDB collections, Mongoose models (`Assessment`, `AssessmentSubmission`, `Subscription`, `UserCpProfile`, `Contest`, `Pattern`, etc.), and indexes |
| [setup.md](./setup.md) | Prerequisites, local development, environment variables (Stripe, R2, Groq, MongoDB, Resend), seed scripts |
| [deployment.md](./deployment.md) | Production deployment guide for Vercel, MongoDB Atlas, Cloudflare R2, Stripe Webhooks, backups, and verification |
| [security.md](./security.md) | Authentication, session cookies, RBAC, anti-cheat client protection, Markdown XSS containment, CSP, and rate limiting |
| [admin.md](./admin.md) | Administrative control panel, user management, invite token workflows, dynamic taxonomy editing, and audit logging |
| [monetization.md](./monetization.md) | Monetization strategy, pricing tiers (Free / Pro / OA Pass), credits system, and B2B campus rollout |

Start with **[PRD.md](./PRD.md)**. Review **[architecture.md](./architecture.md)** and **[proctoring.md](./proctoring.md)** for system design. Use **[schema.md](./schema.md)** and **[api.md](./api.md)** as reference while developing. For billing and commercialization, see **[monetization.md](./monetization.md)**.

