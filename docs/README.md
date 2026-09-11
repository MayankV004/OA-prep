# BigO — Documentation

Personal placement-prep tracker, Online Assessment (OA) simulator, and computer science knowledge base. Features multi-user RBAC, invite-only access, pattern-based DSA tracking, automated CP profile synchronization, contest alert engines, dynamic monetization & promo codes, sandboxed code execution harness (Judge0 / Piston), ReaderLayout for deep reading, and client-side enterprise dual-engine neural proctoring.

**Stack:** Next.js 16 (App Router) + TypeScript · BetterAuth · MongoDB Atlas + Mongoose 9 · TanStack Query v5 · Judge0 / Docker Piston Runner · TensorFlow.js (BlazeFace + COCO-SSD) · Cloudflare R2 · Stripe · Monaco Editor · `@uiw/react-md-editor` · Tailwind CSS v4 + Base UI / shadcn · Recharts · Resend + React Email · Upstash Redis & QStash · GitHub Actions Crons · OpenTelemetry · Vercel.

## Docs Index

| File | What's Inside |
| --- | --- |
| [PRD.md](./PRD.md) | Goals, user roles, functional specifications (DSA, OA Simulator, Code Runner, CP Sync, Contests, Billing), non-goals, and success metrics |
| [architecture.md](./architecture.md) | Technical stack wiring, code execution harness, dual-loop proctoring pipeline, dynamic billing, ReaderLayout, multi-tier CDN caching, proxy/middleware, telemetry, and repo structure |
| [proctoring.md](./proctoring.md) | **Enterprise Dual-Engine Neural Proctoring**: BlazeFace biometrics, COCO-SSD device detection, optical fallback, HUD, R2 storage, and LLM forensics |
| [api.md](./api.md) | Complete REST route specification: OA assessments, code execution (`/api/oa/execute`), dynamic pricing & promos, proctoring, CP sync, contests, stripe billing, content CRUD, admin routes |
| [schema.md](./schema.md) | MongoDB collections, Mongoose models (`Assessment`, `AssessmentSubmission`, `PricingPlan`, `PromoCode`, `Subscription`, `UserCpProfile`, `Contest`, `Pattern`, `Feedback`, etc.), and indexes |
| [setup.md](./setup.md) | Prerequisites, local development, Docker code runner (`docker-compose.runner.yml`), environment variables (Stripe, R2, Groq, MongoDB, Resend, Judge0), seed scripts |
| [deployment.md](./deployment.md) | Production deployment guide for Vercel, MongoDB Atlas, Cloudflare R2, GitHub Actions Crons (`contest-alerts-cron.yml`), Code Runner, Stripe Webhooks, backups, and verification |
| [security.md](./security.md) | Authentication, session cookies, RBAC, anti-cheat client protection, sandboxed code execution, Markdown XSS containment, CSP hardening, and sliding-window rate limiting |
| [admin.md](./admin.md) | Administrative control panel, user management, invite token workflows, assessment editor, billing dashboard (MRR/ARR & promo codes), feedback moderation, dynamic taxonomies, and audit logging |
| [monetization.md](./monetization.md) | Monetization architecture, dynamic pricing plans (`pricing_plans`), promo code validation (`promo_codes`), revenue analytics, and B2B campus rollout |
| [scalability.md](./scalability.md) | Scalable architecture plan for 2,000+ DAU target on MongoDB M0/M10, multi-tier caching (L1 + L2 Redis + Edge CDN), connection pooling, and QStash worker offload |
| [novelity.md](./novelity.md) | Core novelty angles: failure forensics, high-fidelity OA simulation environment, reasoning capture, and post-OA replay debriefs |

Start with **[PRD.md](./PRD.md)**. Review **[architecture.md](./architecture.md)** and **[proctoring.md](./proctoring.md)** for system design. Use **[schema.md](./schema.md)** and **[api.md](./api.md)** as reference while developing. For billing, see **[monetization.md](./monetization.md)**, and for operations, see **[setup.md](./setup.md)**, **[deployment.md](./deployment.md)**, and **[admin.md](./admin.md)**.


