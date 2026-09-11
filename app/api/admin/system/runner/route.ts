import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { withRole } from '@/lib/auth';
import { env } from '@/lib/config';
import { AssessmentSubmission } from '@/models/assessmentSubmission';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return withRole(req, 'admin', async () => {
    await connectDB();

    // 1. Check Docker Piston Code Runner
    const runnerUrl = (env.CODE_RUNNER_URL || 'http://localhost:2000').replace(/\/$/, '');
    let runnerStatus: {
      status: 'online' | 'offline';
      latencyMs: number;
      runtimesCount: number;
      url: string;
      error?: string;
    } = {
      status: 'offline',
      latencyMs: 0,
      runtimesCount: 0,
      url: runnerUrl,
    };

    const runnerStart = Date.now();
    try {
      const res = await fetch(`${runnerUrl}/api/v2/runtimes`, {
        signal: AbortSignal.timeout(3500),
      });
      runnerStatus.latencyMs = Date.now() - runnerStart;
      if (res.ok) {
        const runtimes = await res.json();
        runnerStatus.status = 'online';
        runnerStatus.runtimesCount = Array.isArray(runtimes) ? runtimes.length : 0;
      } else {
        runnerStatus.error = `HTTP ${res.status}`;
      }
    } catch (err: any) {
      runnerStatus.latencyMs = Date.now() - runnerStart;
      runnerStatus.error = err.message || 'Connection refused';
    }

    // 2. Check MongoDB Atlas Latency
    let dbStatus = { status: 'connected', latencyMs: 0 };
    const dbStart = Date.now();
    try {
      if (mongoose.connection.db) {
        await mongoose.connection.db.admin().ping();
        dbStatus.latencyMs = Date.now() - dbStart;
      }
    } catch {
      dbStatus = { status: 'degraded', latencyMs: Date.now() - dbStart };
    }

    // 3. Check Upstash Redis
    let redisStatus = {
      configured: Boolean(env.UPSTASH_REDIS_REST_URL),
      status: env.UPSTASH_REDIS_REST_URL ? 'online' : 'disabled',
    };

    // 4. Compute Execution Telemetry from Assessment Submissions
    const stats = await AssessmentSubmission.aggregate([
      { $unwind: { path: '$problemResults', preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: null,
          totalExecutions: { $sum: 1 },
          acceptedCount: {
            $sum: { $cond: [{ $eq: ['$problemResults.status', 'accepted'] }, 1, 0] },
          },
          wrongAnswerCount: {
            $sum: { $cond: [{ $eq: ['$problemResults.status', 'wrong_answer'] }, 1, 0] },
          },
          tleCount: {
            $sum: { $cond: [{ $eq: ['$problemResults.status', 'time_limit_exceeded'] }, 1, 0] },
          },
          languages: {
            $push: '$problemResults.language',
          },
        },
      },
    ]);

    const execAggregate = stats[0] || {
      totalExecutions: 0,
      acceptedCount: 0,
      wrongAnswerCount: 0,
      tleCount: 0,
      languages: [],
    };

    const languageCounts: Record<string, number> = {};
    for (const lang of execAggregate.languages || []) {
      if (lang) {
        languageCounts[lang] = (languageCounts[lang] || 0) + 1;
      }
    }

    const languageDistribution = Object.entries(languageCounts).map(([language, count]) => ({
      language,
      count,
    }));

    return NextResponse.json({
      runner: runnerStatus,
      database: dbStatus,
      redis: redisStatus,
      stats: {
        totalExecutions: execAggregate.totalExecutions,
        acceptedCount: execAggregate.acceptedCount,
        wrongAnswerCount: execAggregate.wrongAnswerCount,
        tleCount: execAggregate.tleCount,
        languageDistribution,
      },
    });
  });
}

export async function POST(req: NextRequest) {
  return withRole(req, 'admin', async () => {
    const runnerUrl = (env.CODE_RUNNER_URL || 'http://localhost:2000').replace(/\/$/, '');
    const body = await req.json().catch(() => ({}));
    const language = body.language || 'python';
    const code = body.code || 'print("System Diagnostic OK: BigO Container Sandbox Operational")';

    const langMap: Record<string, { language: string; version: string; filename: string }> = {
      python: { language: 'python', version: '3.10.0', filename: 'main.py' },
      cpp: { language: 'c++', version: '10.2.0', filename: 'main.cpp' },
      java: { language: 'java', version: '15.0.2', filename: 'Main.java' },
    };

    const targetLang = langMap[language] || langMap.python;

    const start = Date.now();
    try {
      const res = await fetch(`${runnerUrl}/api/v2/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: targetLang.language,
          version: targetLang.version,
          files: [{ name: targetLang.filename, content: code }],
          run_timeout: 4000,
        }),
        signal: AbortSignal.timeout(8000),
      });

      const elapsed = Date.now() - start;
      if (!res.ok) {
        return NextResponse.json(
          {
            success: false,
            latencyMs: elapsed,
            error: `Runner responded with HTTP ${res.status}: ${await res.text()}`,
          },
          { status: 502 }
        );
      }

      const data = await res.json();
      return NextResponse.json({
        success: true,
        latencyMs: elapsed,
        stdout: data.run?.stdout || '',
        stderr: data.run?.stderr || data.compile?.stderr || '',
        exitCode: data.run?.code ?? 0,
      });
    } catch (err: any) {
      return NextResponse.json(
        {
          success: false,
          latencyMs: Date.now() - start,
          error: err.message || 'Runner connection failed',
        },
        { status: 504 }
      );
    }
  });
}

