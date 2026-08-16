import { NodeSDK } from '@opentelemetry/sdk-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

let sdk: NodeSDK | null = null;

export function initOpenTelemetry() {
  if (sdk) return;

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'oa-prep',
    [ATTR_SERVICE_VERSION]: '0.1.0',
    environment: process.env.NODE_ENV || 'development',
  });

  sdk = new NodeSDK({
    resource,
  });

  try {
    sdk.start();
    console.log('⚡ OpenTelemetry telemetry engine active.');
  } catch (error) {
    console.error('❌ Failed to initialize OpenTelemetry SDK:', error);
  }

  // Gracefully shutdown OpenTelemetry on process exit
  process.on('SIGTERM', async () => {
    try {
      await sdk?.shutdown();
      console.log('OpenTelemetry SDK shut down cleanly.');
    } catch (err) {
      console.error('Error shutting down OpenTelemetry SDK:', err);
    }
  });
}
