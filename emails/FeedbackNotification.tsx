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
import { FeedbackNotificationEmailProps } from '@/types/email';
import {
  mainStyle,
  containerStyle,
  topBrandSection,
  brandLabel,
  redDotStyle,
  badgeStyle,
  headingStyle,
  actionSection,
  primaryButtonStyle,
  dividerStyle,
  footerSection,
  footerTextStyle,
} from '@/emails/styles/common.styles';
import {
  titleStyle,
  accentBlockSection,
  metaRowStyle,
  metaLabelStyle,
  descSection,
  descLabelStyle,
  descTextStyle,
} from '@/emails/styles/feedback.styles';

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
