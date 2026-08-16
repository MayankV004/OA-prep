import { metrics, Counter, Histogram, Meter } from '@opentelemetry/api';

const METER_NAME = 'oa-prep-metrics';

let meter: Meter | null = null;
let httpRequestsCounter: Counter | null = null;
let httpRequestDurationHistogram: Histogram | null = null;
let authAttemptsCounter: Counter | null = null;
let dbQueriesCounter: Counter | null = null;
let dbQueryDurationHistogram: Histogram | null = null;
let rateLimitExceededCounter: Counter | null = null;

const startTime = Date.now();
const snapshot = {
  httpRequests: {
    total: 0,
    byStatus: {} as Record<string, number>,
    totalDurationMs: 0,
    avgDurationMs: 0,
  },
  authAttempts: {
    total: 0,
    successful: 0,
    failed: 0,
    byAction: {
      sign_in: { successful: 0, failed: 0 },
      sign_up: { successful: 0, failed: 0 },
      reset_password: { successful: 0, failed: 0 },
    },
  },
  rateLimitsExceeded: {
    total: 0,
    lastExceededAt: null as string | null,
  },
  dbQueries: {
    total: 0,
    totalDurationMs: 0,
    avgDurationMs: 0,
  },
};

function getMeter(): Meter {
  if (!meter) {
    meter = metrics.getMeter(METER_NAME, '0.1.0');
  }
  return meter;
}

export function recordHttpRequest(method: string, route: string, status: number, durationMs: number) {
  const m = getMeter();
  if (!httpRequestsCounter) {
    httpRequestsCounter = m.createCounter('http_requests_total', {
      description: 'Total number of HTTP requests processed',
    });
  }
  if (!httpRequestDurationHistogram) {
    httpRequestDurationHistogram = m.createHistogram('http_request_duration_ms', {
      description: 'HTTP request duration in milliseconds',
      unit: 'ms',
    });
  }

  const attrs = { method, route, status: status.toString() };
  httpRequestsCounter.add(1, attrs);
  httpRequestDurationHistogram.record(durationMs, attrs);

  // Update snapshot
  snapshot.httpRequests.total += 1;
  snapshot.httpRequests.totalDurationMs += durationMs;
  snapshot.httpRequests.avgDurationMs = Math.round(
    snapshot.httpRequests.totalDurationMs / snapshot.httpRequests.total
  );
  const statusStr = status.toString();
  snapshot.httpRequests.byStatus[statusStr] = (snapshot.httpRequests.byStatus[statusStr] || 0) + 1;
}

export function recordAuthAttempt(action: 'sign_in' | 'sign_up' | 'reset_password', success: boolean) {
  const m = getMeter();
  if (!authAttemptsCounter) {
    authAttemptsCounter = m.createCounter('auth_attempts_total', {
      description: 'Total authentication attempts',
    });
  }
  authAttemptsCounter.add(1, { action, success: success.toString() });

  // Update snapshot
  snapshot.authAttempts.total += 1;
  if (success) {
    snapshot.authAttempts.successful += 1;
    snapshot.authAttempts.byAction[action].successful += 1;
  } else {
    snapshot.authAttempts.failed += 1;
    snapshot.authAttempts.byAction[action].failed += 1;
  }
}

export function recordDbQuery(operation: string, collection: string, durationMs: number) {
  const m = getMeter();
  if (!dbQueriesCounter) {
    dbQueriesCounter = m.createCounter('db_queries_total', {
      description: 'Total database query executions',
    });
  }
  if (!dbQueryDurationHistogram) {
    dbQueryDurationHistogram = m.createHistogram('db_query_duration_ms', {
      description: 'Database query execution duration in milliseconds',
      unit: 'ms',
    });
  }

  const attrs = { operation, collection };
  dbQueriesCounter.add(1, attrs);
  dbQueryDurationHistogram.record(durationMs, attrs);

  snapshot.dbQueries.total += 1;
  snapshot.dbQueries.totalDurationMs += durationMs;
  snapshot.dbQueries.avgDurationMs = Math.round(
    snapshot.dbQueries.totalDurationMs / snapshot.dbQueries.total
  );
}

export function recordRateLimitExceeded(keyPrefix: string, ip: string) {
  const m = getMeter();
  if (!rateLimitExceededCounter) {
    rateLimitExceededCounter = m.createCounter('rate_limit_exceeded_total', {
      description: 'Total rate limit rejections',
    });
  }
  rateLimitExceededCounter.add(1, { keyPrefix, ip });

  snapshot.rateLimitsExceeded.total += 1;
  snapshot.rateLimitsExceeded.lastExceededAt = new Date().toISOString();
}

export function getMetricsSnapshot() {
  return {
    ...snapshot,
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
  };
}
