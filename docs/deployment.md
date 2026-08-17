# Production Deployment Guide

This document covers deploying PlacementDeck to Vercel with MongoDB Atlas and Resend.

## 1. Production Setup

### MongoDB Atlas
1. Provision a MongoDB Atlas cluster (`placementdeck-prod`).
2. Create a database user with read/write access to the target database.
3. Configure IP Network Access (allow Vercel egress IP ranges or cloud provider region).
4. Obtain the connection string (`MONGODB_URI`).

### Resend Email
1. Add and verify your sending domain (configure SPF, DKIM, and DMARC DNS records).
2. Generate a production API key (`RESEND_API_KEY`).
3. Set `EMAIL_FROM` to an address on your verified domain (e.g. `no-reply@placementdeck.app`).

### Vercel
1. Import GitHub repository into Vercel. Next.js App Router preset is auto-detected.
2. Add environment variables in Vercel Project Settings matching `.env.example`:
   - `MONGODB_URI`, `MONGODB_DB`
   - `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
   - `NEXT_PUBLIC_APP_URL`
   - `RESEND_API_KEY`, `EMAIL_FROM`
   - `ADMIN_BOOTSTRAP_EMAIL`, `ADMIN_BOOTSTRAP_PASSWORD` (Initial deploy only)
3. Deploy `main` branch.

## 2. Bootstrapping Admin Account

1. Set `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD` in Vercel environment variables.
2. On initial deployment, log in using the bootstrap credentials.
3. Remove `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD` from Vercel environment variables after initial login.

Alternatively, run the admin promotion script against the production database:

```bash
MONGODB_URI="<production-mongodb-uri>" npx tsx scripts/promote-admin.ts --email user@example.com
```

## 3. Database Maintenance & Seeding

Run database seeding scripts against production if needed:

```bash
MONGODB_URI="<prod-uri>" MONGODB_DB="placementdeck" npx tsx scripts/seed-mongo-patterns.ts
MONGODB_URI="<prod-uri>" MONGODB_DB="placementdeck" npx tsx scripts/seed-advanced-topics.ts
```

## 4. Post-Deployment Verification

1. Log in as an administrator.
2. Issue a test invite to a throwaway email from `/admin/invites`.
3. Verify receipt of the email in Resend dashboard.
4. Accept the invite in an incognito browser window, complete account creation, and verify login.
5. Remove the test user account from `/admin`.
