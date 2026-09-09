export type SupportedLanguage = 'cpp' | 'python' | 'java';

/**
 * Standard Judge0 Language IDs
 * (Works across both RapidAPI Judge0 CE and standard self-hosted instances)
 */
export const JUDGE0_LANGUAGE_IDS: Record<SupportedLanguage, number> = {
  cpp: 54, // C++ (GCC 9.2.0) / 105 (GCC 14.1.0)
  python: 71, // Python (3.8.1) / 92 (Python 3.11.2)
  java: 62, // Java (OpenJDK 13.0.1) / 91 (JDK 17)
};

export interface Judge0Status {
  id: number;
  description: string;
}

export interface Judge0SubmissionRequest {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit?: number;
  memory_limit?: number;
  wall_time_limit?: number;
}

export interface Judge0SubmissionResponse {
  token?: string;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string | null; // e.g. "0.012"
  memory: number | null; // in KB
  status: Judge0Status;
}

export interface ExecutionTestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
  explanation?: string;
  isCustom?: boolean;
}

export interface ExecutionResult {
  index: number;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  status: string;
  statusId: number;
  timeMs?: number;
  memoryKb?: number;
  compileOutput?: string;
  stderr?: string;
  isCustom?: boolean;
}

export interface ExecutionBatchResponse {
  success: boolean;
  allPassed: boolean;
  passedCount: number;
  totalCount: number;
  results: ExecutionResult[];
  compileError?: string;
  isFallback?: boolean;
  isCustomRun?: boolean;
}
