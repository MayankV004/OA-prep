import { env } from '../config';
import {
  SupportedLanguage,
  ExecutionTestCase,
  ExecutionBatchResponse,
  ExecutionResult,
  JUDGE0_LANGUAGE_IDS,
  Judge0SubmissionResponse,
} from './types';
import { buildExecutableSource } from './harness';
import { evaluateWithFallback } from './mock-fallback';

interface PistonExecuteResponse {
  language: string;
  version: string;
  compile?: {
    stdout: string;
    stderr: string;
    code: number;
    output: string;
  };
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
    memory?: number;
    wall_time?: number;
    cpu_time?: number;
  };
  message?: string;
}

const PISTON_CONFIG: Record<
  SupportedLanguage,
  { language: string; version: string; filename: string }
> = {
  python: { language: 'python', version: '3.10.0', filename: 'solution.py' },
  cpp: { language: 'c++', version: '10.2.0', filename: 'solution.cpp' },
  java: { language: 'java', version: '15.0.2', filename: 'Solution.java' },
};

/**
 * Normalizes output string for fair comparison (trims whitespace and trailing line breaks).
 */
function normalizeOutput(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\s+$/, '');
}

/**
 * Executes code using the local Docker Piston runner
 */
async function executeViaDockerRunner(
  userCode: string,
  language: SupportedLanguage,
  testCases: ExecutionTestCase[]
): Promise<ExecutionBatchResponse> {
  const runnerUrl = (env.CODE_RUNNER_URL || 'http://localhost:2000').replace(/\/$/, '');
  const langConfig = PISTON_CONFIG[language];

  let compileError: string | undefined;

  const promises = testCases.map(async (tc, idx) => {
    const wrappedSource = buildExecutableSource(userCode, language, tc.input);

    const res = await fetch(`${runnerUrl}/api/v2/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: langConfig.language,
        version: langConfig.version,
        files: [
          {
            name: langConfig.filename,
            content: wrappedSource,
          },
        ],
        stdin: tc.input,
        run_timeout: 3000,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Docker runner returned ${res.status}: ${errText}`);
    }

    const data = (await res.json()) as PistonExecuteResponse;

    // Check for compilation error
    if (data.compile && data.compile.code !== 0) {
      compileError = data.compile.stderr || data.compile.output || 'Compilation Error';
    }

    const actualOutput = normalizeOutput(data.run?.stdout);
    const expectedOutput = normalizeOutput(tc.expectedOutput);
    const isCompilationFailed = Boolean(data.compile && data.compile.code !== 0);

    let status = 'Accepted';
    let statusId = 3;

    if (tc.isCustom) {
      if (isCompilationFailed) {
        status = 'Compilation Error';
        statusId = 6;
      } else if (data.run?.signal === 'SIGKILL' || data.run?.code === 124) {
        status = 'Time Limit Exceeded';
        statusId = 5;
      } else if (data.run?.code !== 0) {
        status = 'Runtime Error';
        statusId = 11;
      } else {
        status = 'Executed';
        statusId = 3;
      }
    } else {
      if (isCompilationFailed) {
        status = 'Compilation Error';
        statusId = 6;
      } else if (data.run?.signal === 'SIGKILL' || data.run?.code === 124) {
        status = 'Time Limit Exceeded';
        statusId = 5;
      } else if (data.run?.code !== 0) {
        status = 'Runtime Error';
        statusId = 11;
      } else if (actualOutput !== expectedOutput) {
        status = 'Wrong Answer';
        statusId = 4;
      }
    }

    const passed = statusId === 3;
    const timeMs = data.run?.wall_time ?? data.run?.cpu_time ?? undefined;
    const memoryKb = data.run?.memory ? Math.round(data.run.memory / 1024) : undefined;

    const result: ExecutionResult = {
      index: idx + 1,
      input: tc.input,
      expected: tc.expectedOutput,
      actual: actualOutput || data.run?.stderr || status,
      passed,
      status,
      statusId,
      timeMs,
      memoryKb,
      compileOutput: compileError,
      stderr: data.run?.stderr || undefined,
      isCustom: tc.isCustom,
    };

    return result;
  });

  const results = await Promise.all(promises);
  results.sort((a, b) => a.index - b.index);

  const passedCount = results.filter((r) => r.passed).length;

  return {
    success: true,
    allPassed: passedCount === results.length && !compileError,
    passedCount,
    totalCount: results.length,
    results,
    compileError,
    isFallback: false,
    isCustomRun: testCases.some((t) => t.isCustom),
  };
}

/**
 * Execute a single testcase against Judge0 API
 */
async function executeSingleSubmissionJudge0(
  sourceCode: string,
  languageId: number,
  expectedOutput: string
): Promise<Judge0SubmissionResponse> {
  const isRapidApi = Boolean(env.JUDGE0_RAPIDAPI_KEY);
  const baseUrl = env.JUDGE0_API_URL
    ? env.JUDGE0_API_URL.replace(/\/$/, '')
    : `https://${env.JUDGE0_RAPIDAPI_HOST || 'judge0-ce.p.rapidapi.com'}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (isRapidApi) {
    headers['X-RapidAPI-Key'] = env.JUDGE0_RAPIDAPI_KEY;
    headers['X-RapidAPI-Host'] = env.JUDGE0_RAPIDAPI_HOST || 'judge0-ce.p.rapidapi.com';
  }

  const endpoint = `${baseUrl}/submissions?base64_encoded=false&wait=true`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      source_code: sourceCode,
      language_id: languageId,
      expected_output: expectedOutput,
      cpu_time_limit: 2.0,
      wall_time_limit: 5.0,
      memory_limit: 262144,
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Judge0 API error (${response.status}): ${errorText}`);
  }

  return (await response.json()) as Judge0SubmissionResponse;
}

/**
 * Universal Test Case Execution Engine
 * Tries in order:
 * 1. Local Docker Runner (Piston at CODE_RUNNER_URL) -> $0, zero card, instant ms latency
 * 2. Remote Judge0 (if configured)
 * 3. Graceful deterministic fallback
 */
export async function executeTestCases(
  userCode: string,
  language: SupportedLanguage,
  testCases: ExecutionTestCase[],
  patternTag: string = '',
  starterCode: string = ''
): Promise<ExecutionBatchResponse> {
  // 1. Try Docker runner first if available
  if (env.CODE_RUNNER_URL) {
    try {
      const dockerResult = await executeViaDockerRunner(userCode, language, testCases);
      return dockerResult;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[Docker Runner] Failed (${msg}); checking remote or fallback.`);
    }
  }

  // 2. Try Judge0 if credentials provided
  const hasJudge0 = Boolean(env.JUDGE0_RAPIDAPI_KEY || env.JUDGE0_API_URL);
  if (hasJudge0) {
    try {
      const languageId = JUDGE0_LANGUAGE_IDS[language];
      let compileError: string | undefined;

      const promises = testCases.map(async (tc, idx) => {
        const wrappedSource = buildExecutableSource(userCode, language, tc.input);
        const judgeRes = await executeSingleSubmissionJudge0(
          wrappedSource,
          languageId,
          tc.expectedOutput
        );

        if (judgeRes.status?.id === 6 || judgeRes.compile_output) {
          compileError = judgeRes.compile_output || 'Compilation Error';
        }

        const actualOutput = normalizeOutput(judgeRes.stdout);
        const expectedOutput = normalizeOutput(tc.expectedOutput);
        const passed =
          judgeRes.status?.id === 3 ||
          (actualOutput.length > 0 && actualOutput === expectedOutput);

        const timeMs = judgeRes.time ? Math.round(parseFloat(judgeRes.time) * 1000) : undefined;
        const memoryKb = judgeRes.memory ?? undefined;

        const result: ExecutionResult = {
          index: idx + 1,
          input: tc.input,
          expected: tc.expectedOutput,
          actual: actualOutput || judgeRes.stderr || judgeRes.status?.description || 'No output',
          passed,
          status: judgeRes.status?.description || (passed ? 'Accepted' : 'Wrong Answer'),
          statusId: judgeRes.status?.id || (passed ? 3 : 4),
          timeMs,
          memoryKb,
          compileOutput: judgeRes.compile_output || undefined,
          stderr: judgeRes.stderr || undefined,
        };

        return result;
      });

      const results = await Promise.all(promises);
      results.sort((a, b) => a.index - b.index);
      const passedCount = results.filter((r) => r.passed).length;

      return {
        success: true,
        allPassed: passedCount === results.length && !compileError,
        passedCount,
        totalCount: results.length,
        results,
        compileError,
        isFallback: false,
        isCustomRun: testCases.some((t) => t.isCustom),
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[Judge0] Failed (${msg}); falling back to local evaluator.`);
    }
  }

  // 3. Fallback to local heuristic AST simulator
  return evaluateWithFallback(userCode, language, testCases, patternTag, starterCode);
}
