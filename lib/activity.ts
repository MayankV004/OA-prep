import { after } from 'next/server';
import dbConnect from '@/lib/db';
import { RecordActivityArgs } from '@/types/activity';

/**
 * Schedules an activity log write to run AFTER the response is sent.
 *
 * Intentionally synchronous (not async) — callers MUST NOT await this.
 * The write is fire-and-forget via next/server `after()`.
 * Errors are swallowed so they never break the calling route.
 */
export function recordActivity(args: RecordActivityArgs): void {
  after(async () => {
    try {
      await dbConnect();
      const { Activity } = await import('@/models');
      await Activity.create({
        actorId: args.actorId,
        targetUserId: args.targetUserId,
        kind: args.kind,
        entity: args.entity,
        metadata: args.metadata || {},
        ip: args.ip,
      });
    } catch (err) {
      console.error('Failed to record activity:', err);
      // Never throw — activity logging must not break the main transaction
    }
  });
}
