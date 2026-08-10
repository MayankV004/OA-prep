import { Activity } from '@/models';

interface RecordActivityArgs {
  actorId: string;
  targetUserId: string;
  kind: string;
  entity?: {
    type: string;
    id: string;
    title?: string;
  };
  metadata?: Record<string, unknown>;
  ip?: string;
}

export async function recordActivity(args: RecordActivityArgs) {
  try {
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
    // Don't throw - activity logging shouldn't break the main transaction
  }
}
