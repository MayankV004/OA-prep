export interface RateLimitOptions {
  windowMs?: number; // Time window in ms (default: 60_000)
  max?: number;      // Max requests per window (default: 60)
  keyPrefix?: string;
}

export interface RateLimitCheckResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetInMs: number;
  response?: Response;
}
