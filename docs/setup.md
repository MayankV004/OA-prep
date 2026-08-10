# Setup

## 1. Prerequisites

- Node.js 20 LTS or newer
- pnpm 9 (or npm 10 / yarn 4; commands below use pnpm)
- A MongoDB Atlas account (M0 free cluster is enough for dev)
- A Resend account (free tier — 3,000 emails/month, 100 emails/day)
- Git

## 2. First-time install

```bash
git clone <your-repo-url> placementdeck
cd placementdeck
pnpm install
cp .env.example .env.local
```

Fill in `.env.local` using the table in section 4.

## 3. Run locally

```bash
# dev server
pnpm dev              # http://localhost:3000

# type-check + lint
pnpm typecheck
pnpm lint

# unit + integration tests
pnpm test

# end-to-end (Playwright)
pnpm test:e2e

# seed database + create the first admin
pnpm seed
```

The first `pnpm dev` also creates the text indexes on the collections; they run once and are cheap to re-run.

## 4. Environment variables

| Variable | Purpose | Required | Secret | Example |
| --- | --- | --- | --- | --- |
| `MONGODB_URI` | Atlas connection string | Yes | Yes | `mongodb+srv://user:pass@cluster0.xxxx.mongodb.net/placementdeck` |
| `MONGODB_DB` | Database name inside the cluster | Yes | No | `placementdeck` |
| `BETTER_AUTH_SECRET` | Signing key for BetterAuth sessions (32+ random bytes, base64) | Yes | Yes | `openssl rand -base64 32` output |
| `BETTER_AUTH_URL` | Public origin of the app | Yes | No | `http://localhost:3000` or `https://placementdeck.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | Same origin, exposed to the client | Yes | No | `http://localhost:3000` |
| `RESEND_API_KEY` | API key for the Resend account | Yes | Yes | `re_xxx` |
| `EMAIL_FROM` | Verified sender address on your Resend domain | Yes | No | `PlacementDeck <no-reply@placementdeck.app>` |
| `EMAIL_REPLY_TO` | Reply-to header on outgoing mail | No | No | `you@yourdomain.com` |
| `INVITE_TOKEN_TTL_HOURS` | How long an invite link stays valid | No | No | `168` (default 7 days) |
| `ADMIN_BOOTSTRAP_EMAIL` | Email that becomes the first admin on `pnpm seed` | Only on first seed | No | `you@example.com` |
| `ADMIN_BOOTSTRAP_PASSWORD` | Password for the bootstrap admin | Only on first seed | Yes | strong random string |
| `NODE_ENV` | Standard Node flag | Auto | No | `development` |

Notes:
- Everything prefixed `NEXT_PUBLIC_` ships in the client bundle. Nothing sensitive belongs there.
- After the first seed run, unset `ADMIN_BOOTSTRAP_*`. The seed script refuses to overwrite an existing admin.
- `EMAIL_FROM` must be a verified sender on the Resend domain — Resend rejects unverified from-addresses.

## 5. Atlas setup (one-time)

1. Create a free M0 cluster in a region close to Vercel's default (typically `us-east-1`).
2. Under Network Access, allow `0.0.0.0/0` for now (revisit in deployment.md).
3. Create a database user with read/write on the `placementdeck` database.
4. Copy the SRV connection string into `MONGODB_URI`.
5. First `pnpm dev` run creates the collections and their indexes.

## 6. Resend setup (one-time)

1. Sign up at resend.com.
2. Add and verify a domain you own (DNS records: SPF, DKIM, and DMARC — Resend gives you exact values).
3. Create an API key with `emails.send` scope. Paste into `RESEND_API_KEY`.
4. Set `EMAIL_FROM` to an address on the verified domain (`no-reply@yourdomain.com` is fine).
5. For local dev, Resend's sandbox mode delivers to your own account inbox regardless of `to` — safe for testing invite emails without spamming real addresses.

## 7. BetterAuth setup

BetterAuth is wired in `lib/auth.ts`:

```ts
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getMongoClient } from "./db";

export const auth = betterAuth({
  database: mongodbAdapter(getMongoClient().db(process.env.MONGODB_DB!)),
  emailAndPassword: { enabled: true, autoSignIn: true },
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "user", input: false },
      disabled: { type: "boolean", defaultValue: false, input: false },
      lastSeenAt: { type: "date", required: false, input: false },
      invitedBy: { type: "string", required: false, input: false },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
});
```

Self-serve sign-up is disabled in the UI. The only way to create a user is either the seed bootstrap or the admin invite flow (which calls `auth.api.signUpEmail` from the accept handler with the invite's email and the password the user picks).

## 8. Seed script

`pnpm seed` runs `scripts/seed.ts`:

1. If no user with `role = admin` exists, creates one from `ADMIN_BOOTSTRAP_EMAIL` + `ADMIN_BOOTSTRAP_PASSWORD` via `auth.api.signUpEmail`, then flips their role to `admin`. Refuses to overwrite an existing admin.
2. Seeds the `taxonomies` collection with defaults:
   - **pattern**: Sliding Window, Two Pointers, Binary Search, Backtracking, DP, Graphs, Trees, Greedy, Heap, Trie, Segment Tree, Bit Manipulation
   - **bucket**: Ad-hoc, Constructive, Math
   - **platform**: Codeforces, LeetCode Contest, AtCoder, CodeChef
   - **subject**: OS, DBMS, CN, OOP
   - **advanced**: DevOps, Docker, Kubernetes, GenAI, System Design
   - **difficulty**: Easy, Medium, Hard
3. Creates corresponding `groups` rows for each `subject` and `advanced` taxonomy entry so topics can attach.
4. No sample content — users add their own.

The script is idempotent: rerunning it never creates duplicates and never modifies existing rows.

## 9. Emergency admin promotion

If every admin loses access (forgotten password, disabled by accident), run:

```bash
pnpm promote-admin -- --email you@example.com
```

The script directly updates the user's `role` in Mongo. Requires prod `MONGODB_URI` in the shell env.

## 10. Common local issues

- **`ECONNREFUSED` on first request** — Atlas IP allowlist rejected your IP. Add your current IP to Network Access.
- **`MongooseServerSelectionError`** — cluster paused (M0 pauses after inactivity). Open Atlas and resume.
- **BetterAuth "invalid secret"** — `BETTER_AUTH_SECRET` changed between restarts. Sign in again.
- **Invite email never arrives** — check Resend dashboard for the send; sandbox mode routes everything to your Resend account's inbox regardless of the target address.
- **Markdown editor blank on first render** — `@uiw/react-md-editor` needs `"use client"`. The wrapper in `components/markdown/Editor.tsx` sets it.
