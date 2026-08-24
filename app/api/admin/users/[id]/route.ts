import { NextRequest } from 'next/server';
import { withRole } from '@/lib/auth';
import { User, Activity, Topic, Cheatsheet, Question, UserProgress } from '@/models';
import { userUpdateSchema } from '@/lib/zod';
import { recordActivity } from '@/lib/activity';
import dbConnect from '@/lib/db';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  return withRole(req, 'admin', async () => {
    await dbConnect();
    const { id } = await params;
    const user = await User.findById(id).select('-hashedPassword -__v -password -secret -token');
    if (!user) throw { status: 404, message: 'User not found' };

    const [totalProblems, completedProblems] = await Promise.all([
      UserProgress.countDocuments({ userId: id }),
      UserProgress.countDocuments({ userId: id, completed: true }),
    ]);

    const userObj = user.toObject();
    delete userObj.hashedPassword;
    delete userObj.password;
    delete userObj.__v;

    return { ...userObj, totalProblems, completedProblems };
  });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  return withRole(req, 'admin', async ({ userId: actorId }) => {
    await dbConnect();
    const { id } = await params;
    const user = await User.findById(id);
    if (!user) throw { status: 404, message: 'User not found' };

    const parsed = userUpdateSchema.parse(await req.json());
    const wasDisabled = user.disabled;
    Object.assign(user, parsed);
    await user.save();

    if (parsed.disabled !== undefined && parsed.disabled !== wasDisabled) {
      recordActivity({
        actorId,
        targetUserId: id,
        kind: parsed.disabled ? 'admin.user.disabled' : 'admin.user.enabled',
      });
    }
    const userObj = user.toObject();
    delete userObj.hashedPassword;
    delete userObj.password;
    delete userObj.__v;
    return userObj;
  });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  return withRole(req, 'admin', async ({ userId: actorId }) => {
    await dbConnect();
    const { id } = await params;
    if (id === actorId) throw { status: 400, message: 'Cannot delete yourself' };

    const user = await User.findById(id);
    if (!user) throw { status: 404, message: 'User not found' };

    const wipe = new URL(req.url).searchParams.get('wipe') === 'true';
    if (wipe) {
      await User.findByIdAndDelete(id);
    } else {
      user.disabled = true;
      await user.save();
    }

    recordActivity({
      actorId,
      targetUserId: id,
      kind: 'admin.user.deleted',
      metadata: { wipe },
    });
    return new Response(null, { status: 204 });
  });
}
