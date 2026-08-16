import { getMetricsSnapshot } from '@/lib/telemetry/metrics';

export function getPrometheusMetricsText(): string {
  const snapshot = getMetricsSnapshot();
  const lines: string[] = [];

  // 1. HTTP Requests Total
  lines.push('# HELP http_requests_total Total number of HTTP requests processed');
  lines.push('# TYPE http_requests_total counter');
  lines.push(`http_requests_total ${snapshot.httpRequests.total}`);

  // HTTP Requests by Status
  for (const [status, count] of Object.entries(snapshot.httpRequests.byStatus)) {
    lines.push(`http_requests_by_status{status="${status}"} ${count}`);
  }

  // HTTP Request Duration Avg
  lines.push('# HELP http_request_duration_ms_avg Average HTTP request duration in ms');
  lines.push('# TYPE http_request_duration_ms_avg gauge');
  lines.push(`http_request_duration_ms_avg ${snapshot.httpRequests.avgDurationMs}`);

  // 2. Auth Attempts Total
  lines.push('# HELP auth_attempts_total Total authentication attempts');
  lines.push('# TYPE auth_attempts_total counter');
  lines.push(`auth_attempts_total{result="successful"} ${snapshot.authAttempts.successful}`);
  lines.push(`auth_attempts_total{result="failed"} ${snapshot.authAttempts.failed}`);

  for (const [action, data] of Object.entries(snapshot.authAttempts.byAction)) {
    lines.push(`auth_attempts_by_action{action="${action}",result="successful"} ${data.successful}`);
    lines.push(`auth_attempts_by_action{action="${action}",result="failed"} ${data.failed}`);
  }

  // 3. Rate Limit Exceeded
  lines.push('# HELP rate_limit_exceeded_total Total rate limit rejections');
  lines.push('# TYPE rate_limit_exceeded_total counter');
  lines.push(`rate_limit_exceeded_total ${snapshot.rateLimitsExceeded.total}`);

  // 4. DB Queries Total & Duration
  lines.push('# HELP db_queries_total Total database queries');
  lines.push('# TYPE db_queries_total counter');
  lines.push(`db_queries_total ${snapshot.dbQueries.total}`);

  lines.push('# HELP db_query_duration_ms_avg Average database query duration in ms');
  lines.push('# TYPE db_query_duration_ms_avg gauge');
  lines.push(`db_query_duration_ms_avg ${snapshot.dbQueries.avgDurationMs}`);

  // 5. Uptime
  lines.push('# HELP app_uptime_seconds Application uptime in seconds');
  lines.push('# TYPE app_uptime_seconds gauge');
  lines.push(`app_uptime_seconds ${snapshot.uptimeSeconds}`);

  return lines.join('\n') + '\n';
}
