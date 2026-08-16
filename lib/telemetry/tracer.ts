import { trace, Span, SpanStatusCode, Tracer } from '@opentelemetry/api';

const TRACER_NAME = 'oa-prep-tracer';

export function getTracer(): Tracer {
  return trace.getTracer(TRACER_NAME);
}

export async function traceSpan<T>(
  spanName: string,
  fn: (span: Span) => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  const tracer = getTracer();
  return tracer.startActiveSpan(spanName, async (span) => {
    if (attributes) {
      span.setAttributes(attributes);
    }
    try {
      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error: any) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error?.message || 'Error executing span',
      });
      if (error instanceof Error) {
        span.recordException(error);
      }
      throw error;
    } finally {
      span.end();
    }
  });
}
