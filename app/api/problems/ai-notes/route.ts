import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { generateRevisionNotes } from '@/lib/ai/revision-notes';
import { getUserEntitlement } from '@/lib/entitlements';
import { z } from 'zod';

const aiNotesSchema = z.object({
  problemId: z.string().min(1),
  problemTitle: z.string().min(1),
  patternTitle: z.string().optional(),
  difficulty: z.string().optional(),
  existingNotes: z.string().optional(),
  language: z.string().optional(),
});

/** POST /api/problems/ai-notes — generate high-yield AI revision notes (Pro exclusive) */
export async function POST(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    // Pro subscription gate
    const entitlement = await getUserEntitlement(userId);
    if (!entitlement.isPro && !entitlement.isAdmin) {
      return Response.json(
        {
          error: {
            code: 'UPGRADE_REQUIRED',
            message: 'AI Revision Notes are exclusive to BigO Pro subscribers. Upgrade to unlock.',
          },
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = aiNotesSchema.parse(body);

    const notes = await generateRevisionNotes({
      problemTitle: parsed.problemTitle,
      patternTitle: parsed.patternTitle,
      difficulty: parsed.difficulty,
      existingNotes: parsed.existingNotes,
      language: parsed.language,
    });

    return { problemId: parsed.problemId, notes };
  });
}
