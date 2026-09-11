# Production Deployment Guide

This document covers deploying BigO to Vercel with MongoDB Atlas, Upstash Redis, Upstash QStash, Resend, Cloudflare R2, Stripe, GitHub Actions Crons, and containerized Code Runners.

## 1. Production Setup

### MongoDB Atlas
1. Provision a MongoDB Atlas cluster (`placementdeck-prod`).
2. Create a database user with read/write access to the target database.
3. Configure IP Network Access (allow Vercel egress IP ranges or `0.0.0.0/0` with strong password authentication).
4. Obtain the connection string (`MONGODB_URI`).

### Upstash Redis (Caching & Rate Limiting)
1. Create a Redis database in Upstash Console ([console.upstash.com](https://console.upstash.com)).
2. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

### Upstash QStash (Async Email Job Queue)
1. Create a QStash instance in Upstash Console.
2. Copy `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, and `QSTASH_NEXT_SIGNING_KEY`.

### Cloudflare R2 (Proctoring Snapshot Vault)
1. Create an R2 bucket in Cloudflare Dashboard (e.g. `bigo-proctor-snapshots`).
2. Generate an S3-compatible API Token with Object Read & Write permissions.
3. Configure `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, and `R2_PUBLIC_URL`.

### Stripe (Payments & Webhooks)
1. Retrieve live API Keys from the Stripe Dashboard (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`).
2. Configure webhook endpoint targeting `https://<domain>/api/webhooks/stripe` listening for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
3. Copy signing secret into `STRIPE_WEBHOOK_SECRET`.

### Code Execution Runner (Piston / Judge0)
- **Option A (Self-Hosted Docker Piston)**: Deploy `docker-compose.runner.yml` to an unprivileged Linux VPS or VM (Fly.io, Railway, EC2), exposing port 2000, and set `CODE_RUNNER_URL="http://<runner-ip>:2000"`.
- **Option B (RapidAPI Judge0 CE)**: Set `JUDGE0_RAPIDAPI_KEY="rapidapi_key"` and `JUDGE0_RAPIDAPI_HOST="judge0-ce.p.rapidapi.com"`.

### Resend Email
1. Add and verify your sending domain (configure SPF, DKIM, and DMARC DNS records).
2. Generate a production API key (`RESEND_API_KEY`).
3. Set `EMAIL_FROM` to an address on your verified domain (e.g. `BigO <no-reply@bigoprep.tech>`).

### Vercel Deployment
1. Import GitHub repository into Vercel. Next.js App Router preset is auto-detected.
2. Configure environment variables matching `.env.example`:
   - `MONGODB_URI`, `MONGODB_DB`
   - `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
   - `NEXT_PUBLIC_APP_URL`
   - `CRON_SECRET`
   - `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`
   - `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
   - `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY`
   - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `CODE_RUNNER_URL` (or `JUDGE0_RAPIDAPI_KEY`)
   - `ADMIN_BOOTSTRAP_EMAIL`, `ADMIN_BOOTSTRAP_PASSWORD` (Initial deploy only)
3. Deploy `main` branch.

### GitHub Actions Cron Runner (15-Minute Contest Alerts)
Vercel Hobby plan restricts crons to a maximum of once per day. To ensure 15-minute contest alert evaluations (24h, 2h, 30m prior):
1. In your GitHub repository settings, navigate to **Secrets and variables > Actions**.
2. Add repository secrets:
   - `APP_URL`: Production application URL (e.g. `https://bigoprep.tech`).
   - `CRON_SECRET`: Matching the `CRON_SECRET` variable configured in Vercel.
3. The workflow in `.github/workflows/contest-alerts-cron.yml` will automatically trigger `/api/cron/contest-alerts` every 15 minutes.
4. Daily aggregator tasks run via Vercel Crons (`vercel.json`):
   - `/api/cron/contests-sync` (daily at 00:00 UTC)
   - `/api/cron/user-contests-sync` (daily at 02:00 UTC)

## 2. Bootstrapping Admin Account

1. Set `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD` in Vercel environment variables.
2. On initial deployment, log in using the bootstrap credentials.
3. Remove `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD` from Vercel environment variables after initial login.

Alternatively, run the admin promotion script against the production database:

```bash
MONGODB_URI="<production-mongodb-uri>" npx tsx scripts/promote-admin.ts --email user@example.com
```

## 3. Database Maintenance & Seeding

Run database seeding scripts against production to populate patterns, advanced topics, and company assessments:

```bash
MONGODB_URI="<prod-uri>" MONGODB_DB="placementdeck" npx tsx scripts/seed-mongo-patterns.ts
MONGODB_URI="<prod-uri>" MONGODB_DB="placementdeck" npx tsx scripts/seed-advanced-topics.ts
MONGODB_URI="<prod-uri>" MONGODB_DB="placementdeck" npx tsx scripts/seed-assessments.ts
```

## 4. Post-Deployment Verification

1. **Auth & Invites**: Log in as administrator, issue a test invite from `/admin/invites`, verify email delivery in Resend and QStash, and complete registration in incognito window.
2. **Assessment Runner**: Open `/oa` and start an assessment. Verify Monaco editor, run test cases via `/api/oa/execute`, and submit to verify Judge0 evaluation and scorecard generation.
3. **Billing**: Visit `/pricing` and verify plans loaded dynamically via `/api/pricing`. Test promo code validation using `/api/promo/validate`.
4. **Contests & Alerts**: Visit `/cp/contests` to confirm contests synced and verify alert preference updates.
5. **Admin Billing**: Visit `/admin/billing` to ensure financial charts and subscriber counts render correctly.
