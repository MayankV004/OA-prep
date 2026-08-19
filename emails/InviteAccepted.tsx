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

interface InviteAcceptedEmailProps {
  adminName: string;
  invitedEmail: string;
  invitedName?: string;
  role: string;
  acceptedAt: string;
  appName?: string;
  adminUsersUrl: string;
}

export function InviteAcceptedEmail({
  adminName = 'Admin',
  invitedEmail = 'candidate@example.com',
  invitedName = 'Candidate Name',
  role = 'User',
  acceptedAt = new Date().toLocaleString(),
  appName = 'BigO',
  adminUsersUrl = 'http://localhost:3000/admin/users',
}: InviteAcceptedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`Invitation accepted by ${invitedName || invitedEmail}`}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          {/* Top Brand Bar */}
          <Section style={topBrandSection}>
            <Text style={brandLabel}>
              <span style={redDotStyle}>●</span> {appName.toUpperCase()} &nbsp;•&nbsp; ADMIN NOTIFICATION
            </Text>
            <Text style={badgeStyle}>ACCEPTED</Text>
          </Section>

          {/* Heading */}
          <Heading style={headingStyle}>
            Invitation accepted
          </Heading>

          <Text style={paragraphStyle}>
            Hello {adminName}, <strong style={{ color: '#09090b' }}>{invitedName || invitedEmail}</strong> has accepted your invitation and completed setup.
          </Text>

          {/* Red Accent Key-Value Block */}
          <Section style={accentBlockSection}>
            <Text style={metaRowStyle}>
              <span style={metaLabelStyle}>Member:</span> {invitedName} ({invitedEmail})
            </Text>
            <Text style={metaRowStyle}>
              <span style={metaLabelStyle}>Role Assigned:</span> <span style={{ color: '#e11d48', fontWeight: 600 }}>{role}</span>
            </Text>
            <Text style={metaRowStyle}>
              <span style={metaLabelStyle}>Timestamp:</span> {acceptedAt}
            </Text>
          </Section>

          {/* Primary Action */}
          <Section style={actionSection}>
            <Button href={adminUsersUrl} style={primaryButtonStyle}>
              View user in admin panel &nbsp;→
            </Button>
          </Section>

          <Hr style={dividerStyle} />

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerTextStyle}>
              {appName} Admin Ops &nbsp;•&nbsp; Team Management
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default InviteAcceptedEmail;

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
  margin: '0 0 20px 0',
};

const accentBlockSection: React.CSSProperties = {
  margin: '24px 0',
  borderLeft: '2px solid #e11d48',
  paddingLeft: '16px',
};

const metaRowStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#3f3f46',
  lineHeight: '1.8',
  margin: 0,
};

const metaLabelStyle: React.CSSProperties = {
  color: '#a1a1aa',
  marginRight: '6px',
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
