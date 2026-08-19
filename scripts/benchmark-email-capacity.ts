import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { sendInviteEmail } from '../lib/email';

interface BenchmarkResult {
  totalRequests: number;
  concurrency: number;
  successful: number;
  failed: number;
  mockMode: boolean;
  totalTimeMs: number;
  rps: number;
  avgLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  p50LatencyMs: number;
  p90LatencyMs: number;
  p99LatencyMs: number;
  errorsByCode: Record<string, number>;
  resendQuotaInfo?: {
    dailyQuotaRemaining?: string;
    rateLimitRemaining?: string;
  };
}

async function runBenchmark(options: {
  totalRequests: number;
  concurrency: number;
  forceMock?: boolean;
  targetEmail?: string;
}): Promise<BenchmarkResult> {
  const { totalRequests, concurrency, forceMock, targetEmail } = options;

  // Temporarily override RESEND_API_KEY if forceMock is enabled
  const originalApiKey = process.env.RESEND_API_KEY;
  if (forceMock) {
    process.env.RESEND_API_KEY = 're_dummy_benchmark';
  }

  const isMock = !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith('re_dummy');
  const latencies: number[] = [];
  const errorsByCode: Record<string, number> = {};
  let successful = 0;
  let failed = 0;

  let lastDailyQuota: string | undefined;
  let lastRateLimitRemaining: string | undefined;

  console.log(`\n🚀 Starting Capacity Test: ${totalRequests} emails @ Concurrency ${concurrency} (${isMock ? 'MOCK MODE' : 'LIVE RESEND API'})`);

  const startTime = Date.now();

  // Helper to process a single email request
  async function executeSingleRequest(index: number) {
    const reqStart = Date.now();
    const recipient = targetEmail || (isMock ? `capacity_test_${index}_${Date.now()}@example.com` : 'mayank.msverma@gmail.com');
    try {
      const res: any = await sendInviteEmail({
        to: recipient,
        inviterName: 'Capacity Tester',
        role: 'User',
        token: `test-token-${index}-${Date.now()}`,
        expiresInHours: 168,
      });

      const duration = Date.now() - reqStart;
      latencies.push(duration);

      if (res?.error) {
        failed++;
        const code = res.error.statusCode || res.error.name || 'UNKNOWN_ERROR';
        errorsByCode[code] = (errorsByCode[code] || 0) + 1;
      } else {
        successful++;
        if (res?.headers) {
          lastDailyQuota = res.headers['x-resend-daily-quota'];
          lastRateLimitRemaining = res.headers['ratelimit-remaining'];
        }
      }
    } catch (err: any) {
      const duration = Date.now() - reqStart;
      latencies.push(duration);
      failed++;
      const code = err.statusCode || err.name || err.code || 'EXCEPTION';
      errorsByCode[code] = (errorsByCode[code] || 0) + 1;
    }
  }

  // Process requests in concurrent batches
  const queue = Array.from({ length: totalRequests }, (_, i) => i + 1);
  const activeWorkers: Promise<void>[] = [];

  for (let i = 0; i < concurrency; i++) {
    activeWorkers.push(
      (async () => {
        while (queue.length > 0) {
          const item = queue.shift();
          if (item !== undefined) {
            await executeSingleRequest(item);
          }
        }
      })()
    );
  }

  await Promise.all(activeWorkers);
  const totalTimeMs = Date.now() - startTime;

  // Restore API key if overridden
  if (forceMock) {
    process.env.RESEND_API_KEY = originalApiKey;
  }

  // Calculate statistics
  latencies.sort((a, b) => a - b);
  const avgLatencyMs = Math.round(latencies.reduce((acc, val) => acc + val, 0) / (latencies.length || 1));
  const minLatencyMs = latencies[0] || 0;
  const maxLatencyMs = latencies[latencies.length - 1] || 0;
  const p50LatencyMs = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p90LatencyMs = latencies[Math.floor(latencies.length * 0.9)] || 0;
  const p99LatencyMs = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const rps = Number(((totalRequests / (totalTimeMs || 1)) * 1000).toFixed(2));

  return {
    totalRequests,
    concurrency,
    successful,
    failed,
    mockMode: isMock,
    totalTimeMs,
    rps,
    avgLatencyMs,
    minLatencyMs,
    maxLatencyMs,
    p50LatencyMs,
    p90LatencyMs,
    p99LatencyMs,
    errorsByCode,
    resendQuotaInfo: {
      dailyQuotaRemaining: lastDailyQuota,
      rateLimitRemaining: lastRateLimitRemaining,
    },
  };
}

async function main() {
  const args = process.argv.slice(2);
  let totalRequests = 20;
  let concurrency = 5;
  let forceMock = false;
  let targetEmail: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--requests' && args[i + 1]) {
      totalRequests = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--concurrency' && args[i + 1]) {
      concurrency = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--to' && args[i + 1]) {
      targetEmail = args[i + 1];
      i++;
    } else if (args[i] === '--mock') {
      forceMock = true;
    }
  }

  const result = await runBenchmark({ totalRequests, concurrency, forceMock, targetEmail });

  console.log('\n====================================================');
  console.log('📊 CAPACITY BENCHMARK RESULTS');
  console.log('====================================================');
  console.log(`Execution Mode:    ${result.mockMode ? 'Mock Mode (Local Processing)' : 'Live Resend API'}`);
  console.log(`Total Requests:    ${result.totalRequests}`);
  console.log(`Concurrency Level: ${result.concurrency}`);
  console.log(`Successful:        ${result.successful}`);
  console.log(`Failed:            ${result.failed}`);
  console.log(`Total Duration:    ${result.totalTimeMs} ms (${(result.totalTimeMs / 1000).toFixed(2)}s)`);
  console.log(`Throughput (RPS):  ${result.rps} requests/sec`);
  console.log(`Avg Latency:       ${result.avgLatencyMs} ms`);
  console.log(`Min Latency:       ${result.minLatencyMs} ms`);
  console.log(`Max Latency:       ${result.maxLatencyMs} ms`);
  console.log(`P50 Latency:       ${result.p50LatencyMs} ms`);
  console.log(`P90 Latency:       ${result.p90LatencyMs} ms`);
  console.log(`P99 Latency:       ${result.p99LatencyMs} ms`);

  if (Object.keys(result.errorsByCode).length > 0) {
    console.log('\n❌ Error Distribution:');
    for (const [code, count] of Object.entries(result.errorsByCode)) {
      console.log(`  - Status ${code}: ${count} occurrences`);
    }
  }

  if (result.resendQuotaInfo?.rateLimitRemaining || result.resendQuotaInfo?.dailyQuotaRemaining) {
    console.log('\nℹ️ Resend Headers Info:');
    if (result.resendQuotaInfo.rateLimitRemaining) {
      console.log(`  - Rate Limit Remaining: ${result.resendQuotaInfo.rateLimitRemaining}`);
    }
    if (result.resendQuotaInfo.dailyQuotaRemaining) {
      console.log(`  - Resend Daily Quota Used: ${result.resendQuotaInfo.dailyQuotaRemaining}`);
    }
  }

  console.log('====================================================\n');
}

main();
