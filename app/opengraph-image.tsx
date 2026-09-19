import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'BigO - Master DSA Patterns & Technical Online Assessments';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundColor: '#080B0F',
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.15), transparent 45%), radial-gradient(circle at 80% 80%, rgba(13, 148, 136, 0.1), transparent 50%)',
          padding: '64px 80px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Specular Top Border Glow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, transparent, #10B981, transparent)',
          }}
        />

        {/* Top Header: Brand Logo & Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 24px rgba(16, 185, 129, 0.4)',
              }}
            >
              <span
                style={{
                  fontSize: '28px',
                  fontWeight: 900,
                  color: '#041E15',
                  fontFamily: 'monospace',
                }}
              >
                O
              </span>
            </div>
            <span
              style={{
                fontSize: '34px',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                color: '#FFFFFF',
              }}
            >
              BigO
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '9999px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '9999px',
                backgroundColor: '#10B981',
              }}
            />
            <span
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#34D399',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Placement Prep Platform
            </span>
          </div>
        </div>

        {/* Center: Headline & Subtitle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '980px' }}>
          <h1
            style={{
              fontSize: '56px',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.035em',
              color: '#FFFFFF',
              margin: 0,
            }}
          >
            Master DSA Patterns &{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #10B981, #34D399, #6EE7B7)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Technical Online Assessments
            </span>
          </h1>

          <p
            style={{
              fontSize: '23px',
              color: '#94A3B8',
              lineHeight: 1.45,
              margin: 0,
              fontWeight: 400,
            }}
          >
            Zero-distraction roadmaps, timed Tier-1 company OA simulations, and multi-language code execution.
          </p>
        </div>

        {/* Bottom Bar: Feature Pills & Domain */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '28px',
          }}
        >
          <div style={{ display: 'flex', gap: '12px' }}>
            <div
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#E2E8F0',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              90+ Algorithmic Patterns
            </div>
            <div
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#E2E8F0',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Proctored OA Engine
            </div>
            <div
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#E2E8F0',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              C++ • Java • Python
            </div>
          </div>

          <span
            style={{
              fontSize: '18px',
              fontWeight: 700,
              fontFamily: 'monospace',
              color: '#10B981',
            }}
          >
            bigoprep.tech
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
