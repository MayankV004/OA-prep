import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { checkRateLimit } from '@/lib/rate-limit';
import { executeTestCases } from '@/lib/runner/judge0';
import { SupportedLanguage, ExecutionTestCase } from '@/lib/runner/types';
import { z } from 'zod';

const executeSchema = z.object({
  problemId: z.string().min(1),
  language: z.enum(['cpp', 'python', 'java']),
  code: z.string().min(1, 'Source code cannot be empty'),
  testCases: z
    .array(
      z.object({
        input: z.string(),
        expectedOutput: z.string(),
        isHidden: z.boolean().optional().default(false),
        explanation: z.string().optional(),
      })
    )
    .min(1, 'At least one testcase is required'),
  patternTag: z.string().optional().default(''),
  starterCode: z.string().optional().default(''),
});

export async function POST(req: Request) {
  try {
    // 1. Session authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Please log in to run code.' },
        { status: 401 }
      );
    }

    // 2. Sliding window rate limiting: max 12 runs per minute (1 run per 5 seconds avg)
    const rateLimit = await checkRateLimit(req, {
      keyPrefix: `oa-exec:${session.user.id}`,
      max: 12,
      windowMs: 60_000,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Rate limit exceeded. Please wait a few seconds before executing again.',
          resetInMs: rateLimit.resetInMs,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(rateLimit.resetInMs / 1000)) },
        }
      );
    }

    // 3. Body validation
    const rawBody = await req.json();
    const parseResult = executeSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid execution payload',
          errors: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { language, code, testCases, patternTag, starterCode } = parseResult.data;

    // Filter to only visible test cases for safety if isHidden is passed
    const visibleCases: ExecutionTestCase[] = testCases.filter((tc) => !tc.isHidden);
    const casesToRun = visibleCases.length > 0 ? visibleCases : testCases.slice(0, 3);

    // 4. Run testcases via Judge0 (or fallback)
    const executionResponse = await executeTestCases(
      code,
      language as SupportedLanguage,
      casesToRun,
      patternTag,
      starterCode
    );

    return NextResponse.json(executionResponse);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Execution error';
    console.error('Error in /api/oa/execute:', err);
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
