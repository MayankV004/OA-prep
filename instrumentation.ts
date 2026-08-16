export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initOpenTelemetry } = await import('./lib/telemetry');
    initOpenTelemetry();
  }
}
