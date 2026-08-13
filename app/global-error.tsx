'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          background: '#fafafa',
          color: '#18181b',
        }}
      >
        <div style={{ maxWidth: '28rem', padding: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.5rem' }}>
            The application failed to start
          </h1>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#52525b', margin: '0 0 1.5rem' }}>
            This error happened above the app shell, so styling and navigation
            are unavailable. Reloading is the fastest fix.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              height: '2.75rem',
              padding: '0 1.25rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: '#c2185b',
              color: '#fff',
              fontSize: '0.9375rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
          {error?.digest ? (
            <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#71717a', fontFamily: 'ui-monospace, monospace' }}>
              Reference: {error.digest}
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
