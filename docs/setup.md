# Local Development Setup

## 1. Prerequisites

- **Node.js**: v20 LTS or newer
- **Package Manager**: `npm` 10+
- **Docker & Docker Compose**: For local sandboxed code execution runner (optional for offline mock runner)
- **MongoDB**: MongoDB Atlas cluster or local MongoDB instance (`mongodb://localhost:27017`)
- **Resend Account**: Account for email dispatch (optional for offline dev)
- **Upstash Account**: Account for Redis caching and QStash job queue (optional for dev — app falls back to in-memory/after() processing)
- **Git**

## 2. Setup Procedure

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
   ```bash
   cp .env.example .env.local
   ```
   Fill in `.env.local` using the environment variables table below.

4. **Start the Local Code Execution Runner (Optional):**
   Launch the containerized Piston engine to execute C++, Python, and Java testcases locally:
   ```bash
   docker compose -f docker-compose.runner.yml up -d
   ```
   *(If skipped, BigO automatically falls back to its deterministic heuristic/regex mock runner).*

5. **Seed Database:**
   Seed initial DSA patterns, advanced CS topics, and company assessments:
   ```bash
   npx tsx scripts/seed-mongo-patterns.ts
   npx tsx scripts/seed-advanced-topics.ts
   npx tsx scripts/seed-assessments.ts
   ```

6. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Navigate to [http://localhost:3000](http://localhost:3000).

## 3. Environment Variables

| Variable | Description | Required | Example |
| --- | --- | --- | --- |
| `MONGODB_URI` | MongoDB connection string | Yes | `mongodb+srv://user:pass@cluster.mongodb.net` |
| `MONGODB_DB` | MongoDB database name | Yes | `placementdeck` |
| `BETTER_AUTH_SECRET` | Base64 random string for session signing | Yes | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Base application URL | Yes | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | Application URL exposed to client | Yes | `http://localhost:3000` |
| `ADMIN_BOOTSTRAP_EMAIL` | Bootstrap admin email address | First run | `admin@example.com` |
| `ADMIN_BOOTSTRAP_PASSWORD` | Bootstrap admin password | First run | `strongpassword123` |
| `INVITE_TOKEN_TTL_HOURS` | Invite token validity window in hours | No | `168` (default 7 days) |
| `CODE_RUNNER_URL` | Local Piston code execution runner URL | No | `http://localhost:2000` |
| `JUDGE0_RAPIDAPI_KEY` | RapidAPI key for cloud Judge0 CE | No | `rapidapi_xxx` |
| `JUDGE0_RAPIDAPI_HOST` | RapidAPI Judge0 host | No | `judge0-ce.p.rapidapi.com` |
| `JUDGE0_API_URL` | Self-hosted Judge0 API endpoint | No | `https://judge.example.com` |
| `RESEND_API_KEY` | Resend email API key | No (Dev) | `re_xxx` |
| `EMAIL_FROM` | Verified sender email address | No (Dev) | `BigO <no-reply@bigoprep.tech>` |
| `EMAIL_REPLY_TO` | Reply-to email address | No | `BigO Support <support@bigoprep.tech>` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL (rate limit & caching) | Optional (Dev) | `https://xxx.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST Token | Optional (Dev) | `Axxx...` |
| `QSTASH_TOKEN` | Upstash QStash Access Token (async email queue) | Optional (Dev) | `eyxxx...` |
| `QSTASH_CURRENT_SIGNING_KEY` | Upstash QStash Signature Key | Optional (Dev) | `sig_xxx` |
| `QSTASH_NEXT_SIGNING_KEY` | Upstash QStash Next Signature Key | Optional (Dev) | `sig_yyy` |
| `CRON_SECRET` | Bearer token securing cron endpoints | No (Dev) | `cron_secret_key` |
| `STRIPE_SECRET_KEY` | Stripe API Secret Key | No (Dev) | `sk_test_xxx` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Signing Secret | No (Dev) | `whsec_xxx` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Publishable Key | No (Dev) | `pk_test_xxx` |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | Stripe Price ID for Monthly Pro | No | `price_xxx` |
| `STRIPE_PRO_ANNUAL_PRICE_ID` | Stripe Price ID for Annual Pro | No | `price_yyy` |
| `STRIPE_OA_PASS_PRICE_ID` | Stripe Price ID for OA Pass | No | `price_zzz` |
| `PAYMENT_PROVIDER` | Payment gateway mode (`stripe` or `mock`) | No | `stripe` (default in prod) |
| `R2_ACCOUNT_ID` | Cloudflare R2 Account ID | No (Dev) | `cf_account_id` |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 Access Key ID | No (Dev) | `r2_access_key` |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 Secret Access Key | No (Dev) | `r2_secret_key` |
| `R2_BUCKET_NAME` | Cloudflare R2 Bucket Name | No (Dev) | `bigo-proctor-snapshots` |
| `R2_PUBLIC_URL` | Cloudflare R2 Public CDN URL | No (Dev) | `https://r2.bigoprep.tech` |
| `GROQ_API_KEY` | Groq API Key for Llama-3.3 forensic report synthesis | No (Dev) | `gsk_xxx` |
| `HUGGINGFACE_API_KEY` | Hugging Face fallback API Key | No (Dev) | `hf_xxx` |
| `NEXT_PUBLIC_ALLOW_COPY_PASTE` | Development flag to allow clipboard paste in Monaco | No | `false` |

## 4. Emergency Admin Promotion

To promote an existing user account to an `admin` role from the terminal:

```bash
npx tsx scripts/promote-admin.ts --email user@example.com
```
