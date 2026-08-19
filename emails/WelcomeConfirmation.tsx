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

interface WelcomeEmailProps {
  userName: string;
  userEmail: string;
  appName?: string;
  dashboardUrl: string;
}

export function WelcomeConfirmationEmail({
  userName = 'Developer',
  userEmail = 'user@example.com',
  appName = 'BigO',
  dashboardUrl = 'http://localhost:3000/dashboard',
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`Welcome to ${appName}, ${userName}`}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          {/* Top Brand Bar */}
          <Section style={topBrandSection}>
            <Text style={brandLabel}>
              <span style={redDotStyle}>●</span> {appName.toUpperCase()} &nbsp;•&nbsp; ONBOARDING
            </Text>
            <Text style={badgeStyle}>CONFIRMED</Text>
          </Section>

          {/* Heading */}
          <Heading style={headingStyle}>
            Welcome, {userName}.
          </Heading>

          {/* Core Body Text */}
          <Text style={paragraphStyle}>
            Your account (<strong style={{ color: '#e11d48' }}>{userEmail}</strong>) has been verified. You now have access to the complete placement preparation workspace.
          </Text>

          {/* Red Accent Borderless List */}
          <Section style={accentListSection}>
            <Section style={listItemStyle}>
              <Text style={listHeadingStyle}>01 / DSA Pattern Decks</Text>
              <Text style={listBodyStyle}>Study core algorithmic patterns designed for speed and clarity.</Text>
            </Section>
            <Section style={listItemStyle}>
              <Text style={listHeadingStyle}>02 / Company Question Banks</Text>
              <Text style={listBodyStyle}>Filter high-frequency questions by tier-1 tech companies.</Text>
            </Section>
            <Section style={listItemStyle}>
              <Text style={listHeadingStyle}>03 / Timed OA Assessments</Text>
              <Text style={listBodyStyle}>Practice under real online assessment time limits.</Text>
            </Section>
          </Section>

          {/* Primary Action */}
          <Section style={actionSection}>
            <Button href={dashboardUrl} style={primaryButtonStyle}>
              Launch Dashboard &nbsp;→
            </Button>
          </Section>

          <Hr style={dividerStyle} />

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerTextStyle}>
              {appName} Workspace &nbsp;•&nbsp; Placement Preparation &amp; Analytics
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default WelcomeConfirmationEmail;

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
  margin: '0 0 16px 0',
};

const accentListSection: React.CSSProperties = {
  margin: '28px 0',
  borderLeft: '2px solid #e11d48',
  paddingLeft: '16px',
};

const listItemStyle: React.CSSProperties = {
  marginBottom: '14px',
};

const listHeadingStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#09090b',
  margin: '0 0 2px 0',
};

const listBodyStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#71717a',
  margin: 0,
};

const actionSection: React.CSSProperties = {
  margin: '32px 0 24px 0',
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

const dividerStyle: React.CSSProperties = {
  borderColor: '#f4f4f5',
  margin: '28px 0 20px 0',
};

const footerSection: React.CSSProperties = {
  marginTop: '0px',
};

const footerTextStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#a1a1aa',
  margin: 0,
};
