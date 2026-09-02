# BigO — Documentation

Personal placement-prep tracker + knowledge base. Multi-user, invite-only, admin-controlled taxonomies and content, per-user dashboards, activity tracking.

**Stack:** Next.js 16 (App Router) + TypeScript · BetterAuth · MongoDB Atlas + Mongoose 9 · TanStack Query v5 · `@uiw/react-md-editor` · Tailwind CSS v4 + Base UI / shadcn · Recharts · Resend + React Email · OpenTelemetry · Vercel.

## Docs Index

| File | What's Inside |
| --- | --- |
| [PRD.md](./PRD.md) | Goals, user roles, per-section functional requirements, non-goals, success criteria |
| [architecture.md](./architecture.md) | Stack wiring, trackable-entity discriminator pattern, proxy/middleware, telemetry, folder structure |
| [api.md](./api.md) | Every REST route: content CRUD, dashboard stats, activity, admin routes, invite accept |
| [schema.md](./schema.md) | Mongoose collections, pattern schemas, user progress, discriminators, indexes |
| [setup.md](./setup.md) | Prerequisites, local run, env vars, Atlas + Resend + BetterAuth wiring, seed scripts |
| [deployment.md](./deployment.md) | Vercel + Atlas + Resend prod path, first-admin bootstrap, backups, smoke test |
| [security.md](./security.md) | Auth, role gate, invite tokens, Markdown XSS containment, CSP, rate limits |
| [admin.md](./admin.md) | Permission matrix, admin panel UX, user dashboard components, activity event catalogue |
| [monetization.md](./monetization.md) | Monetization strategy, tier matrix, OA simulator, AI engine, and B2B campus rollout |

Start with **[PRD.md](./PRD.md)**. Then **[architecture.md](./architecture.md)** for the architectural shape. Use **[schema.md](./schema.md)** and **[api.md](./api.md)** as reference while developing. For commercialization, see **[monetization.md](./monetization.md)**.
