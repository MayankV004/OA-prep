# BigO 🚀

**BigO** is a multi-user, invite-only placement preparation tracker and computer science knowledge base. It provides pattern-based Data Structures & Algorithms tracking, Core CS subject notes, system design & advanced topic guides, interview Q&A flashcards, cheat sheets, and per-user progress analytics.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Authentication**: [Better Auth](https://better-auth.com/) with MongoDB Adapter
- **Database & ODM**: [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose 9](https://mongoosejs.com/)
- **State & Client Query**: [TanStack Query v5](https://tanstack.com/query) with `localStorage` persistence
- **Styling & UI**: [Tailwind CSS v4](https://tailwindcss.com/), [Base UI](https://base-ui.com/), [Shadcn UI](https://ui.shadcn.com/)
- **Charts & Visualizations**: [Recharts](https://recharts.org/)
- **Email Service**: [Resend](https://resend.com/) with `@react-email/components`
- **Observability**: [OpenTelemetry](https://opentelemetry.io/) with Grafana & Prometheus support
- **Markdown Editing & Rendering**: `@uiw/react-md-editor`, `react-markdown`, `remark-gfm`, `rehype-sanitize`

---

## 📁 Repository Structure

```
.
├── app/                      # Next.js 16 App Router (pages, layouts, API routes)
│   ├── (admin)/admin/        # Protected admin management panel
│   ├── (app)/                # User-facing application routes (dashboard, dsa, subjects, etc.)
│   ├── (auth)/               # Sign-in and invite acceptance routes
│   └── api/                  # REST API Route Handlers
├── components/               # UI components, shell navigation, charts, forms
├── docs/                     # Comprehensive architecture and operations documentation
├── emails/                   # React Email templates (Invite emails)
├── grafana/                  # Grafana provisioning configurations for telemetry
├── lib/                      # Database connection, auth client/server, utilities, email helpers
├── models/                   # Mongoose schemas (User, Problem, Pattern, UserProgress, etc.)
├── public/                   # Static assets
├── scripts/                  # DB seeding, admin promotion, and maintenance scripts
├── proxy.ts                  # Next.js middleware (rate limiting & route authentication)
├── instrumentation.ts        # OpenTelemetry initialization
└── docker-compose.telemetry.yml # Telemetry stack (Prometheus + Grafana)
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v20+ LTS
- **Package Manager**: `npm` v10+
- **MongoDB**: MongoDB Atlas instance or local MongoDB server

### Installation & Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MayankV004/OA-prep.git bigo
   cd bigo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env.local` and configure your credentials:
   ```bash
   cp .env.example .env.local
   ```

4. **Seed Database:**
   Seed initial DSA patterns and advanced CS topics:
   ```bash
   npx tsx scripts/seed-mongo-patterns.ts
   npx tsx scripts/seed-advanced-topics.ts
   ```

5. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available NPM Scripts

- `npm run dev` — Starts the Next.js development server.
- `npm run build` — Builds the application for production.
- `npm run start` — Starts the production build server.
- `npm run lint` — Runs ESLint checks across the project.

---

## 📚 Documentation Index

Detailed documentation is available in the [`docs/`](./docs) directory:

- 📖 **[PRD](./docs/PRD.md)** — Project requirements, functional goals, and user roles.
- 🏗️ **[Architecture](./docs/architecture.md)** — System architecture, stack wiring, middleware, telemetry, and folder tree.
- 🗄️ **[Schema](./docs/schema.md)** — MongoDB collections, Mongoose schemas, discriminators, and indexing.
- 🔌 **[API Specification](./docs/api.md)** — REST API route handlers, parameters, and payloads.
- 🔒 **[Security](./docs/security.md)** — Auth gates, rate limiting, Markdown XSS sanitization, and CSP headers.
- 🛠️ **[Setup Guide](./docs/setup.md)** — Step-by-step local development setup and environment configuration.
- 🚀 **[Deployment Guide](./docs/deployment.md)** — Vercel deployment, MongoDB Atlas configuration, and admin bootstrap.
- 🛡️ **[Admin Panel](./docs/admin.md)** — Permission matrix, content management, invite flows, and activity logs.

---

## 📄 License
Private Repository / All Rights Reserved.
