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

interface FeedbackNotificationEmailProps {
  type: 'bug' | 'feedback';
  title: string;
  description: string;
  reporterEmail: string;
  reporterName?: string;
  category?: string;
  severity?: string;
  pageUrl?: string;
  submittedAt: string;
  appName?: string;
  adminFeedbackUrl: string;
}

export function FeedbackNotificationEmail({
  type = 'bug',
  title = 'Sample Report Title',
  description = 'Detailed description of the bug or feedback.',
  reporterEmail = 'user@example.com',
  reporterName = 'Jane Doe',
  category = 'ui',
  severity = 'medium',
  pageUrl = 'http://localhost:3000/dsa',
  submittedAt = new Date().toLocaleString(),
  appName = 'BigO',
  adminFeedbackUrl = 'http://localhost:3000/admin/feedback',
}: FeedbackNotificationEmailProps) {
  const isBug = type === 'bug';
  const badgeLabel = isBug ? `BUG REPORT (${severity.toUpperCase()})` : 'USER FEEDBACK';
  const badgeColor = isBug ? '#e11d48' : '#2563eb';
  const badgeBg = isBug ? '#fff1f2' : '#eff6ff';

  return (
    <Html>
      <Head />
      <Preview>{`[${type.toUpperCase()}] ${title} from ${reporterEmail}`}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          {/* Top Brand Bar */}
          <Section style={topBrandSection}>
            <Text style={brandLabel}>
              <span style={redDotStyle}>●</span> {appName.toUpperCase()} &nbsp;•&nbsp; ADMIN NOTIFICATION
            </Text>
            <Text style={{ ...badgeStyle, color: badgeColor, backgroundColor: badgeBg }}>
              {badgeLabel}
            </Text>
          </Section>

          {/* Heading */}
          <Heading style={headingStyle}>
            {isBug ? 'New Bug Report' : 'New Feedback Submission'}
          </Heading>

          <Text style={titleStyle}>{title}</Text>

          {/* Red Accent Key-Value Block */}
          <Section style={accentBlockSection}>
            <Text style={metaRowStyle}>
              <span style={metaLabelStyle}>Submitted By:</span>{' '}
              {reporterName ? `${reporterName} (${reporterEmail})` : reporterEmail}
            </Text>
            <Text style={metaRowStyle}>
              <span style={metaLabelStyle}>Category:</span> {category || 'General'}
            </Text>
            {isBug ? (
              <Text style={metaRowStyle}>
                <span style={metaLabelStyle}>Severity:</span>{' '}
                <strong style={{ color: badgeColor }}>{severity}</strong>
              </Text>
            ) : null}
            {pageUrl ? (
              <Text style={metaRowStyle}>
                <span style={metaLabelStyle}>Page URL:</span> {pageUrl}
              </Text>
            ) : null}
            <Text style={metaRowStyle}>
              <span style={metaLabelStyle}>Submitted At:</span> {submittedAt}
            </Text>
          </Section>

          {/* Description Section */}
          <Section style={descSection}>
            <Text style={descLabelStyle}>DESCRIPTION / DETAILS</Text>
            <Text style={descTextStyle}>{description}</Text>
          </Section>

          {/* Primary Action */}
          <Section style={actionSection}>
            <Button href={adminFeedbackUrl} style={primaryButtonStyle}>
              View report in admin panel &nbsp;→
            </Button>
          </Section>

          <Hr style={dividerStyle} />

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerTextStyle}>
              {appName} Admin Ops &nbsp;•&nbsp; Feedback & Bug Reports
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default FeedbackNotificationEmail;

// --- Styles ---
const mainStyle: React.CSSProperties = {
  backgroundColor: '#fafafa',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: '48px 16px',
  margin: 0,
};

const containerStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '20px',
  maxWidth: '560px',
  margin: '0 auto',
  padding: '40px 36px',
};

const topBrandSection: React.CSSProperties = {
  marginBottom: '28px',
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
  padding: '4px 10px',
  borderRadius: '9999px',
  display: 'inline-block',
  float: 'right',
};

const headingStyle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 700,
  color: '#09090b',
  lineHeight: '1.25',
  letterSpacing: '-0.03em',
  margin: '0 0 8px 0',
};

const titleStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 600,
  color: '#27272a',
  margin: '0 0 20px 0',
};

const accentBlockSection: React.CSSProperties = {
  margin: '20px 0',
  borderLeft: '3px solid #e11d48',
  paddingLeft: '16px',
  backgroundColor: '#fcfcfc',
  paddingTop: '10px',
  paddingBottom: '10px',
  borderRadius: '0 8px 8px 0',
};

const metaRowStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#3f3f46',
  lineHeight: '1.7',
  margin: 0,
};

const metaLabelStyle: React.CSSProperties = {
  color: '#71717a',
  fontWeight: 500,
  marginRight: '6px',
};

const descSection: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  borderRadius: '12px',
  padding: '16px 20px',
  margin: '24px 0',
};

const descLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  color: '#71717a',
  letterSpacing: '0.08em',
  margin: '0 0 8px 0',
};

const descTextStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#18181b',
  lineHeight: '1.6',
  margin: 0,
  whiteSpace: 'pre-wrap',
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
