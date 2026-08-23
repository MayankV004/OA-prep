import {
  Body,
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

interface OTPEmailProps {
  userName?: string;
  otp: string;
  expiresInMinutes?: number;
  appName?: string;
}

export function OTPEmail({
  userName = 'User',
  otp = '482910',
  expiresInMinutes = 10,
  appName = 'BigO',
}: OTPEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`${otp} is your ${appName} verification code`}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          {/* Top Brand Bar */}
          <Section style={topBrandSection}>
            <Text style={brandLabel}>
              <span style={redDotStyle}>●</span> {appName.toUpperCase()} &nbsp;•&nbsp; VERIFICATION
            </Text>
            <Text style={badgeStyle}>ONE-TIME OTP</Text>
          </Section>

          {/* Heading */}
          <Heading style={headingStyle}>
            Verify your email address
          </Heading>

          <Text style={paragraphStyle}>
            Hello {userName}, use the 6-digit verification code below to complete your sign-in to {appName}.
          </Text>

          {/* OTP Code Display Box */}
          <Section style={otpCardStyle}>
            <Text style={otpTextStyle}>{otp}</Text>
          </Section>

          {/* Security Note */}
          <Section style={accentBlockSection}>
            <Text style={noteTextStyle}>
              This code will expire in <strong>{expiresInMinutes} minutes</strong>. Do not share this code with anyone. If you did not request this code, you can safely ignore this email.
            </Text>
          </Section>

          <Hr style={dividerStyle} />

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

export default OTPEmail;

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

const otpCardStyle: React.CSSProperties = {
  backgroundColor: '#fff1f2',
  border: '1px solid #fecdd3',
  borderRadius: '16px',
  padding: '24px',
  textAlign: 'center',
  margin: '24px 0',
};

const otpTextStyle: React.CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontSize: '36px',
  fontWeight: 800,
  letterSpacing: '0.25em',
  color: '#e11d48',
  margin: 0,
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

const footerSection: React.CSSProperties = {
  marginTop: '20px',
};

const footerTextStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#a1a1aa',
  margin: 0,
};
