# BigO Documentation Index & Architecture Maps

Welcome to the technical documentation for **BigO**, an enterprise-ready placement-prep ecosystem, Online Assessment (OA) simulator, and client-side dual-engine neural proctoring platform.

---

## 🗺️ Interactive System Architecture & Process Diagrams

These interactive diagrams are generated using [Archify](https://github.com/tt-a1i/archify). Each diagram is a self-contained, standalone HTML document that includes light/dark themes, live motion tracing, pan/zoom, and source-code navigation:

| Interactive Diagram | Type | Scope & Subsystems | Link |
| --- | --- | --- | --- |
| 🌐 **System Architecture** | `architecture` | Next.js 16, `proxy.ts` Edge Gateway, MongoDB Atlas, Upstash Redis, Docker Piston sandbox, Cloudflare R2, Upstash QStash, Groq LLM | [**Open Diagram**](./diagrams/system-architecture.html) |
| 🛡️ **Neural Proctoring Pipeline** | `workflow` | WebGL BlazeFace (180ms), COCO-SSD (450ms), Web Audio FFT, spatial torso exclusion, 2.2s alert debounce, SigV4 WebP vault | [**Open Diagram**](./diagrams/proctoring-pipeline.html) |
| 💻 **OA Execution & Grading Sequence** | `sequence` | Monaco Editor, sliding rate limit (12/min), Judge0 execution, hidden test grading, and Groq Llama-3 behavioral audit | [**Open Diagram**](./diagrams/oa-execution-sequence.html) |

---

## 📚 Technical Specifications

| Document | Focus Area |
| --- | --- |
| 🏗️ **[Architecture](./architecture.md)** | Technical stack wiring, multi-tier caching (L1/L2), Edge rate limiting, execution runner, and directory structure. |
| 🛡️ **[Neural Proctoring](./proctoring.md)** | Dual-loop biometric & hardware anti-cheat pipeline, optical fallbacks, SVG HUD, R2 storage, and LLM forensic reports. |
| 🔌 **[API Specification](./api.md)** | REST endpoint documentation, schemas, parameter definitions, and status codes. |
| 🗄️ **[Database Schema](./schema.md)** | MongoDB collection definitions, Mongoose schemas, discriminators, and indexes. |
| 💳 **[Monetization & Billing](./monetization.md)** | Dynamic pricing configuration (`pricing_plans`), promo codes (`promo_codes`), and admin MRR/ARR analytics. |
| 🔒 **[Security Architecture](./security.md)** | Authentication mechanisms, sandboxed code execution, CSRF/XSS containment, and CSP headers. |
| 🛠️ **[Setup Guide](./setup.md)** | Local development environment setup, Docker runners, MongoDB, and secrets. |
| 🚀 **[Deployment Guide](./deployment.md)** | Production deployment on Vercel, MongoDB Atlas, Cloudflare R2, and GitHub Actions cron workers. |
| 🛡️ **[Admin Panel](./admin.md)** | Administrative features, user management, assessment creation, and financial audit logs. |
| 📈 **[Scalability](./scalability.md)** | Connection pooling, Upstash Redis rate limiting, and performance tuning. |
| 💡 **[Platform Novelty](./novelity.md)** | Core differentiators: failure forensics, high-fidelity OA simulator, and LLM debriefs. |
| 📋 **[Production Audit](./production-audit.md)** | Launch verification checklist, trust-breaking audit, and quality playbook. |
