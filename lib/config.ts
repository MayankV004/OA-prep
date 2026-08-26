import { z } from 'zod';

const envSchema = z.object({
  // MongoDB Database Configuration
  MONGODB_URI: z.string().default('mongodb://localhost:27017/placementdeck'),
  MONGODB_DB: z.string().default('placementdeck'),

  // Authentication Secrets & URLs
  BETTER_AUTH_SECRET: z.string().default('development_secret_32_bytes_long_key_required'),
  BETTER_AUTH_URL: z.string().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_URL: z.string().default('http://localhost:3000'),

  // Admin Credentials & Bootstrap
  ADMIN_BOOTSTRAP_EMAIL: z.string().default('mayankcocspecial@gmail.com'),
  ADMIN_BOOTSTRAP_PASSWORD: z.string().optional().default(''),
  INVITE_TOKEN_TTL_HOURS: z.coerce.number().default(168),

  // Email Service (Resend)
  RESEND_API_KEY: z.string().optional().default(''),
  EMAIL_FROM: z.string().default('BigO <no-reply@bigoprep.tech>'),
  EMAIL_REPLY_TO: z.string().default('BigO Support <support@bigoprep.tech>'),

  // Upstash Redis (Rate limiting + Caching)
  UPSTASH_REDIS_REST_URL: z.string().optional().default(''),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional().default(''),

  // Upstash QStash (Async email worker queue)
  QSTASH_TOKEN: z.string().optional().default(''),
  QSTASH_CURRENT_SIGNING_KEY: z.string().optional().default(''),
  QSTASH_NEXT_SIGNING_KEY: z.string().optional().default(''),

  // Social OAuth Providers
  GITHUB_CLIENT_ID: z.string().optional().default(''),
  GITHUB_CLIENT_SECRET: z.string().optional().default(''),
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
});

function parseEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.warn('⚠️ Invalid or missing environment variables:', result.error.format());
    // Fallback to unvalidated process.env with defaults
    return envSchema.parse({});
  }

  return result.data;
}

export const env = parseEnv();
export type EnvConfig = z.infer<typeof envSchema>;
