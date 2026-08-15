import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { Pattern } from '@/models';
import dbConnect from '@/lib/db';

/**
 * DELETE /api/admin/content/patterns/wipe
 * ⚠️  DANGER: Deletes ALL patterns from the database.
 * Requires admin role + explicit confirmation header.
 */
export async function DELETE(req: NextRequest) {
  return withAuth(req, async ({ role }) => {
    if (role !== 'admin') throw { status: 403, message: 'Forbidden' };

    // Extra safety: require explicit confirmation header
    const confirm = req.headers.get('x-confirm-wipe');
    if (confirm !== 'DELETE_ALL_PATTERNS') {
      throw { status: 400, message: 'Missing confirmation header x-confirm-wipe: DELETE_ALL_PATTERNS' };
    }

    await dbConnect();
    const result = await Pattern.deleteMany({});

    return {
      success: true,
      deletedCount: result.deletedCount,
      message: `Deleted ${result.deletedCount} pattern(s) from the database.`,
    };
  });
}
