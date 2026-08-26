import { Client } from '@upstash/qstash';
import { after } from 'next/server';
import { env } from '@/lib/config';
import { EmailJob } from '@/types/qstash';

export type { EmailJob };

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Enqueues an email job for async delivery via QStash.
 *
 * In production (QSTASH_TOKEN set):
 *   - Publishes to QStash → QStash calls /api/workers/email with up to 3 retries
 *
 * In development (QSTASH_TOKEN absent):
 *   - Falls back to next/server `after()` — email fires after the response is
 *     sent, no retry but no blocking either.
 */
export async function enqueueEmail(job: EmailJob): Promise<void> {
  const token = env.QSTASH_TOKEN;
  const appUrl = env.NEXT_PUBLIC_APP_URL || env.BETTER_AUTH_URL || 'http://localhost:3000';

  if (!token || token.startsWith('qstash_dummy')) {
    // Dev: fire-and-forget after the response is flushed
    after(() => dispatchEmail(job));
    return;
  }

  const client = new Client({ token });
  await client.publishJSON({
    url: `${appUrl}/api/workers/email`,
    body: job,
    retries: 3,
  });
}

/**
 * Executes the email job directly. Called by the /api/workers/email route
 * (production) or by the after() fallback (dev).
 */
export async function dispatchEmail(job: EmailJob): Promise<void> {
  const email = await import('@/lib/email');
  switch (job.type) {
    case 'invite':
      await email.sendInviteEmail(job);
      break;
    case 'welcome':
      await email.sendWelcomeEmail(job);
      break;
    case 'invite_accepted':
      await email.sendInviteAcceptedEmail(job);
      break;
    default: {
      const _exhaustive: never = job;
      throw new Error(`Unknown email job type`);
    }
  }
}
