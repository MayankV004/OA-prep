# PlacementDeck — Documentation

Personal placement-prep tracker + knowledge base. Multi-user, invite-only, admin-controlled taxonomies and content, per-user dashboards, activity tracking.

**Stack:** Next.js 15 (App Router) + TypeScript · BetterAuth · MongoDB Atlas + Mongoose · TanStack Query · @uiw/react-md-editor · Tailwind + shadcn/ui · Recharts · Resend + React Email · Vercel.

## Docs index

| File | What's inside |
| --- | --- |
| [PRD.md](./PRD.md) | Goals, user roles, per-section functional requirements, non-goals, success criteria |
| [architecture.md](./architecture.md) | Stack wiring, trackable-entity discriminator pattern, role gate, activity middleware, folder structure, testing posture |
| [api.md](./api.md) | Every REST route: content CRUD, dashboard stats, activity, admin routes, invite accept |
| [schema.md](./schema.md) | Mongoose collections, indexes, ownership model, discriminator setup |
| [setup.md](./setup.md) | Prerequisites, local run, env vars, Atlas + Resend + BetterAuth wiring, seed script |
| [deployment.md](./deployment.md) | Vercel + Atlas + Resend prod path, first-admin bootstrap, backups, smoke test |
| [security.md](./security.md) | Auth, role gate, invite tokens, Markdown XSS containment, CSP, rate limits, email deliverability |
| [admin.md](./admin.md) | Permission matrix, admin panel UX, user dashboard components, activity event catalogue, Recharts snippets, invite email template |

Start with **PRD.md**. Then **architecture.md** for the shape. Then **schema.md** and **api.md** as reference while building.
