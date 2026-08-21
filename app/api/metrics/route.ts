import { NextRequest, NextResponse } from 'next/server';
import { getMetricsSnapshot } from '@/lib/telemetry/metrics';
import { getPrometheusMetricsText } from '@/lib/telemetry/prometheus';
import { withRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  return withRole(req, 'admin', async () => {
    const url = new URL(req.url);
    const format = url.searchParams.get('format');
    const acceptHeader = req.headers.get('accept') || '';

    if (format === 'prometheus' || acceptHeader.includes('text/plain')) {
      const prometheusText = getPrometheusMetricsText();
      return new NextResponse(prometheusText, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }

    const metrics = getMetricsSnapshot();
    return NextResponse.json(
      {
        status: 'ok',
        service: process.env.OTEL_SERVICE_NAME || 'oa-prep',
        metrics,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  });
}
