import { Receiver } from '@upstash/qstash';
import { dispatchEmail, type EmailJob } from '@/lib/qstash';
import { env } from '@/lib/config';

/**
 * POST /api/workers/email
 *
 * QStash callback endpoint. QStash POSTs here after receiving a job from
 * enqueueEmail(). On failure this endpoint should throw (non-2xx) so QStash
 * retries up to the configured limit.
 *
 * Security: in production, the upstash-signature header is verified to prevent
 * arbitrary callers from triggering email sends.
 */
export async function POST(req: Request) {
  const bodyText = await req.text();

  // Verify QStash signature in production
  if (env.QSTASH_CURRENT_SIGNING_KEY) {
    const receiver = new Receiver({
      currentSigningKey: env.QSTASH_CURRENT_SIGNING_KEY,
      nextSigningKey: env.QSTASH_NEXT_SIGNING_KEY,
    });

    const isValid = await receiver
      .verify({
        signature: req.headers.get('upstash-signature') ?? '',
        body: bodyText,
      })
      .catch(() => false);

    if (!isValid) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  let job: EmailJob;
  try {
    job = JSON.parse(bodyText);
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Throws on Resend failure → QStash will retry
  await dispatchEmail(job);

  return Response.json({ ok: true });
}
