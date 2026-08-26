import { trace } from '@opentelemetry/api';
import { LogLevel, LogMeta } from '@/types/telemetry';

export type { LogLevel, LogMeta };

function getTraceContext() {
  const activeSpan = trace.getActiveSpan();
  if (!activeSpan) return {};
  const spanContext = activeSpan.spanContext();
  return {
    traceId: spanContext.traceId,
    spanId: spanContext.spanId,
  };
}

export function log(level: LogLevel, message: string, meta?: LogMeta) {
  const traceCtx = getTraceContext();
  const timestamp = new Date().toISOString();

  const logPayload = {
    timestamp,
    level,
    message,
    ...traceCtx,
    ...meta,
  };

  const outputStr = JSON.stringify(logPayload);

  switch (level) {
    case 'error':
      console.error(outputStr);
      break;
    case 'warn':
      console.warn(outputStr);
      break;
    case 'debug':
      console.debug(outputStr);
      break;
    case 'info':
    default:
      console.log(outputStr);
      break;
  }
}

export const logger = {
  debug: (message: string, meta?: LogMeta) => log('debug', message, meta),
  info: (message: string, meta?: LogMeta) => log('info', message, meta),
  warn: (message: string, meta?: LogMeta) => log('warn', message, meta),
  error: (message: string, meta?: LogMeta) => log('error', message, meta),
};
