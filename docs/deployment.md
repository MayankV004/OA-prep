# Deployment

Vercel for the app, MongoDB Atlas for the database, Resend for email. All three have free tiers that cover a personal instance with room to spare.

## 1. One-time prod setup

### Atlas
1. Create a second cluster (M0 is fine; M10 if you want dedicated resources and daily backup out of the box). Name it `placementdeck-prod`.
2. Create a dedicated DB user for prod — different password from dev.
3. Under Network Access, remove `0.0.0.0/0` and add Vercel's egress IP ranges (Atlas has a "Cloud Provider" preset for AWS `us-east-1` that matches Vercel's default region). Alternative: enable Atlas Private Endpoint if you upgrade to M10.
4. Under Backup, confirm daily snapshots are on (default on M10; on M0 use the manual export cron in section 5).

### Resend (prod)
1. Verify the production domain if not already done. DNS records: SPF (`v=spf1 include:_spf.resend.com ~all`), DKIM (Resend gives two CNAMEs), DMARC (`v=DMARC1; p=none; rua=mailto:you@yourdomain.com`).
2. Create a **separate** API key scoped to `emails.send` for the prod Vercel project. Do not reuse the dev key.
3. Move out of sandbox mode by verifying the sender domain — sandbox routes to your own inbox regardless of the `to` address; prod invites need to reach the actual invitees.
4. Set `EMAIL_FROM` on Vercel to an address on the verified domain.

### Vercel
1. Import the GitHub repo. Framework preset auto-detects Next.js.
2. Under Project → Settings → Environment Variables, add every row from `setup.md` table 4 with prod values. Fresh `BETTER_AUTH_SECRET`, prod `MONGODB_URI`, `BETTER_AUTH_URL=https://<your-domain>`, prod `RESEND_API_KEY`, prod `EMAIL_FROM`.
3. Set `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD` **only** for the first deploy.
4. Deploy `main`. First deploy provisions everything and runs the build.
5. After the first deploy, open the app, sign in with the bootstrap credentials once, then in Vercel remove `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD`. Redeploy so the values are truly gone.

### Domain (optional but recommended for email deliverability)
Add a custom domain in Vercel → Settings → Domains. Vercel manages the TLS cert. Update `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to the new domain and redeploy. Match `EMAIL_FROM` to the same apex so SPF/DKIM alignment stays clean.

## 2. Bootstrap the first admin in prod

Two options; pick one.

**Option A — env-driven (default)**. Set `ADMIN_BOOTSTRAP_EMAIL` + `ADMIN_BOOTSTRAP_PASSWORD` for the first deploy, run the seed via a one-off Vercel CLI command:

```bash
vercel env pull .env.production.local     # from repo root, targets prod
pnpm seed --env=production
```

Unset the two env vars in Vercel immediately after.

**Option B — script-driven (safer)**. Deploy first without any admin env vars, then run locally against the prod DB:

```bash
MONGODB_URI="<prod uri>" pnpm promote-admin -- --email you@example.com --create --password "<pick one>"
```

Rotates cleanly — the password never lands in Vercel's env store.

## 3. Deploy loop

`main` is the deployable branch. Every push to `main` triggers a Vercel production deploy. PRs get preview deploys automatically. Preview deploys point at prod by default; if that worries you, provision a third Atlas cluster (`placementdeck-preview`) and scope `MONGODB_URI` to Preview environment only. Preview emails also stay in Resend sandbox mode using a separate API key.

## 4. Migrations

MongoDB is schemaless, but this app relies on indexes and discriminators.

1. Schema changes ship in `models/`. Mongoose creates missing indexes on first connection after deploy. Idempotent.
2. Data backfills (rename a field, populate a new one) live in `scripts/migrations/YYYYMMDD-<name>.ts`. Each records its name in a `migrations` collection after success.
3. Run migrations manually against prod:

   ```bash
   MONGODB_URI="<prod uri>" pnpm migrate:up
   ```

4. Never run migrations from Vercel build hooks — the build environment is ephemeral and unauth'd for long-running writes.

## 5. Backups

M0 has no automatic backup. Options in order of preference:

1. **Manual JSON dump via admin export** — `/api/admin/export` returns a full-tenant dump (every collection). Set a GitHub Actions scheduled workflow that hits the endpoint with an admin session cookie once a day and stores the JSON as an artifact.
2. **`mongodump`** — against the prod URI on a laptop. Encrypted BSON archive.
3. **Upgrade to M10** — daily snapshots with 7-day retention. Roughly $60/month.

GitHub Actions workflow for option 1:

```yaml
# .github/workflows/backup.yml
name: Nightly export
on:
  schedule: [{ cron: "0 20 * * *" }]
jobs:
  export:
    runs-on: ubuntu-latest
    steps:
      - env:
          APP_URL: ${{ secrets.APP_URL }}
          SESSION_COOKIE: ${{ secrets.ADMIN_SESSION_COOKIE }}
        run: |
          curl -sS -H "Cookie: $SESSION_COOKIE" "$APP_URL/api/admin/export" \
            -o "backup-$(date -u +%Y%m%d).json"
      - uses: actions/upload-artifact@v4
        with:
          name: placementdeck-backup
          path: backup-*.json
          retention-days: 90
```

The admin session cookie is a long-lived BetterAuth session issued to a dedicated service admin account (its own email, its own password, `role = admin`, `disabled = false`). Rotate every 90 days.

## 6. Runtime settings on Vercel

- Region: `iad1` (US East) or `bom1` (Mumbai) — whichever is closer to you.
- Node runtime for `/api/**`. Edge runtime is not used because Mongoose needs Node.
- Function memory: default 1024 MB.
- Function timeout: default 10s. Bump `/api/admin/export` to 60s via `export const maxDuration = 60`.

## 7. Rollback

Vercel keeps deploy history. If a prod deploy is bad, use "Promote to Production" on the previous good deploy from the Deployments tab. Database migrations that already ran do not roll back automatically — write every migration to be forward-only and reversible by a small manual script if the schema breaks.

## 8. Post-deploy smoke test

After every prod deploy:

1. Sign in as admin.
2. From the admin panel, invite a throwaway email. Confirm the invite arrives (check Resend logs).
3. Accept the invite from an incognito window. Set a password. Confirm sign-in.
4. Delete the throwaway user via the admin panel (`DELETE /api/admin/users/:id?wipe=true`).
5. Confirm the dashboard renders your own progress correctly.

Two minutes; catches every deploy-breaking regression the tests missed.
