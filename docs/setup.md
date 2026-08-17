# Local Development Setup

## 1. Prerequisites

- **Node.js**: v20 LTS or newer
- **Package Manager**: `npm` 10+
- **MongoDB**: MongoDB Atlas cluster or local MongoDB instance
- **Resend Account**: Account for email dispatch (optional for offline dev)
- **Git**

## 2. Setup Procedure

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MayankV004/OA-prep.git placementdeck
   cd placementdeck
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

4. **Seed Database:**
   Seed initial DSA patterns and advanced topic groups:
   ```bash
   npx tsx scripts/seed-mongo-patterns.ts
   npx tsx scripts/seed-advanced-topics.ts
   ```

5. **Run Development Server:**
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
| `RESEND_API_KEY` | Resend email API key | Yes | `re_xxx` |
| `EMAIL_FROM` | Verified sender email address | Yes | `PlacementDeck <no-reply@domain.com>` |
| `EMAIL_REPLY_TO` | Reply-to email address | No | `support@domain.com` |
| `INVITE_TOKEN_TTL_HOURS` | Invite token validity window in hours | No | `168` (default 7 days) |
| `ADMIN_BOOTSTRAP_EMAIL` | Bootstrap admin email address | First run | `admin@example.com` |
| `ADMIN_BOOTSTRAP_PASSWORD` | Bootstrap admin password | First run | `strongpassword123` |

## 4. Emergency Admin Promotion

To promote an existing user account to an `admin` role from the terminal:

```bash
npx tsx scripts/promote-admin.ts --email user@example.com
```
