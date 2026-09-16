import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { generateRevisionNotes } from '@/lib/ai/revision-notes';
import { z } from 'zod';

const aiNotesSchema = z.object({
  problemId: z.string().min(1),
  problemTitle: z.string().min(1),
  patternTitle: z.string().optional(),
  difficulty: z.string().optional(),
  existingNotes: z.string().optional(),
});

/** POST /api/problems/ai-notes — generate high-yield AI revision notes */
export async function POST(req: NextRequest) {
  return withAuth(req, async () => {
    const body = await req.json();
    const parsed = aiNotesSchema.parse(body);

    const notes = await generateRevisionNotes({
      problemTitle: parsed.problemTitle,
      patternTitle: parsed.patternTitle,
      difficulty: parsed.difficulty,
      existingNotes: parsed.existingNotes,
    });

    return { problemId: parsed.problemId, notes };
  });
}
