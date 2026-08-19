import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import React from 'react';

interface PasswordResetEmailProps {
  userName?: string;
  resetUrl: string;
  expiresInMinutes?: number;
  appName?: string;
}

export function PasswordResetEmail({
  userName = 'User',
  resetUrl = 'http://localhost:3000/reset-password?token=sample',
  expiresInMinutes = 60,
  appName = 'BigO',
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`Password reset request for ${appName}`}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          {/* Top Brand Bar */}
          <Section style={topBrandSection}>
            <Text style={brandLabel}>
              <span style={redDotStyle}>●</span> {appName.toUpperCase()} &nbsp;•&nbsp; SECURITY
            </Text>
            <Text style={badgeStyle}>RESET</Text>
          </Section>

          {/* Heading */}
          <Heading style={headingStyle}>
            Reset your password
          </Heading>

          <Text style={paragraphStyle}>
            Hello {userName}, we received a request to reset the password for your {appName} account. Click below to specify a new password.
          </Text>

          {/* Primary Action */}
          <Section style={actionSection}>
            <Button href={resetUrl} style={primaryButtonStyle}>
              Reset password &nbsp;→
            </Button>
          </Section>

          {/* Red Accent Security Note */}
          <Section style={accentBlockSection}>
            <Text style={noteTextStyle}>
              Link expires in {expiresInMinutes} minutes. If you did not request this change, no action is required and your password remains unchanged.
            </Text>
          </Section>

          <Hr style={dividerStyle} />

          {/* Direct Link Section */}
          <Text style={fallbackLabel}>Direct Link</Text>
          <Section style={codeBlockStyle}>
            <Text style={codeTextStyle}>{resetUrl}</Text>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerTextStyle}>
              {appName} Security &nbsp;•&nbsp; Account Protection
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default PasswordResetEmail;

// --- Minimalist Red Accent Styles ---
const mainStyle: React.CSSProperties = {
  backgroundColor: '#fafafa',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: '48px 16px',
  margin: 0,
};

const containerStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '20px',
  maxWidth: '520px',
  margin: '0 auto',
  padding: '40px 36px',
};

const topBrandSection: React.CSSProperties = {
  marginBottom: '32px',
};

const brandLabel: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.14em',
  color: '#71717a',
  margin: 0,
  display: 'inline-block',
};

const redDotStyle: React.CSSProperties = {
  color: '#e11d48',
  fontSize: '12px',
  marginRight: '4px',
};

const badgeStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  color: '#e11d48',
  backgroundColor: '#fff1f2',
  padding: '3px 9px',
  borderRadius: '9999px',
  display: 'inline-block',
  float: 'right',
};

const headingStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 700,
  color: '#09090b',
  lineHeight: '1.25',
  letterSpacing: '-0.03em',
  margin: '0 0 20px 0',
};

const paragraphStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#52525b',
  lineHeight: '1.7',
  margin: '0 0 24px 0',
};

const actionSection: React.CSSProperties = {
  margin: '28px 0 24px 0',
};

const primaryButtonStyle: React.CSSProperties = {
  backgroundColor: '#e11d48',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: 600,
  letterSpacing: '-0.01em',
  padding: '12px 26px',
  borderRadius: '9999px',
  textDecoration: 'none',
  display: 'inline-block',
  boxShadow: '0 4px 14px rgba(225, 29, 72, 0.2)',
};

const accentBlockSection: React.CSSProperties = {
  margin: '24px 0 28px 0',
  borderLeft: '2px solid #e11d48',
  paddingLeft: '14px',
};

const noteTextStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#71717a',
  lineHeight: '1.6',
  margin: 0,
};

const dividerStyle: React.CSSProperties = {
  borderColor: '#f4f4f5',
  margin: '24px 0',
};

const fallbackLabel: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.05em',
  color: '#a1a1aa',
  textTransform: 'uppercase' as const,
  margin: '0 0 8px 0',
};

const codeBlockStyle: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  borderRadius: '8px',
  padding: '12px 14px',
  margin: '0 0 28px 0',
};

const codeTextStyle: React.CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontSize: '12px',
  color: '#e11d48',
  wordBreak: 'break-all',
  margin: 0,
};

const footerSection: React.CSSProperties = {
  marginTop: '20px',
};

const footerTextStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#a1a1aa',
  margin: 0,
};
