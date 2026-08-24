import { NextRequest } from 'next/server';
import { withRole } from '@/lib/auth';
import { User } from '@/models';
import { roleUpdateSchema } from '@/lib/zod';
import { recordActivity } from '@/lib/activity';
import dbConnect from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRole(req, 'admin', async ({ userId: actorId }) => {
    await dbConnect();
    const { id } = await params;
    const user = await User.findById(id);
    if (!user) throw { status: 404, message: 'User not found' };

    const { role } = roleUpdateSchema.parse(await req.json());
    const fromRole = user.role;

    // Cannot demote yourself if last admin
    if (role === 'user' && user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', disabled: false });
      if (adminCount <= 1) throw { status: 400, message: 'Cannot demote the last admin' };
    }

    user.role = role;
    await user.save();

    recordActivity({
      actorId,
      targetUserId: id,
      kind: 'admin.user.role_changed',
      metadata: { from: fromRole, to: role },
    });
    return user;
  });
}
