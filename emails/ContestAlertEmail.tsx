import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import React from 'react';
import { ContestAlertEmailProps } from '@/types/email';
import {
  mainStyle,
  containerStyle,
  topBrandSection,
  brandLabel,
  redDotStyle,
  badgeStyle,
  paragraphStyle,
  actionSection,
  primaryButtonStyle,
  dividerStyle,
  footerSection,
  footerTextStyle,
} from '@/emails/styles/common.styles';

const platformThemes: Record<string, { label: string; bg: string; color: string; border: string }> = {
  leetcode: { label: 'LEETCODE', bg: '#fff7ed', color: '#ea580c', border: '#ffedd5' },
  codeforces: { label: 'CODEFORCES', bg: '#eff6ff', color: '#2563eb', border: '#dbeafe' },
  codechef: { label: 'CODECHEF', bg: '#fef2f2', color: '#dc2626', border: '#fee2e2' },
  atcoder: { label: 'ATCODER', bg: '#f4f4f5', color: '#18181b', border: '#e4e4e7' },
  hackerearth: { label: 'HACKEREARTH', bg: '#f0fdf4', color: '#16a34a', border: '#dcfce7' },
};

export function ContestAlertEmail({
  userName = 'Coder',
  platform = 'leetcode',
  contestName = 'Weekly Contest 438',
  contestUrl = 'https://leetcode.com/contest/weekly-contest-438',
  startTimeFormatted = 'Saturday, Oct 24, 2026 at 8:00 PM IST',
  startTimeUtc = '2:30 PM UTC',
  durationFormatted = '1 hour 30 mins',
  startsInLabel = 'Starts in 2 hours',
  googleCalendarUrl = 'https://calendar.google.com',
  practiceUrl = 'https://bigoprep.tech/cp',
  unsubscribeUrl = 'https://bigoprep.tech/api/contests/unsubscribe?token=sample',
  preferencesUrl = 'https://bigoprep.tech/cp/contests',
  appName = 'BigO',
}: ContestAlertEmailProps) {
  const normPlatform = platform.toLowerCase();
  const theme = platformThemes[normPlatform] || {
    label: platform.toUpperCase(),
    bg: '#faf5ff',
    color: '#9333ea',
    border: '#f3e8ff',
  };

  const previewText = `🚨 [${theme.label}] ${contestName} ${startsInLabel}! (${startTimeFormatted})`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          {/* Top Brand Bar */}
          <Section style={topBrandSection}>
            <Text style={brandLabel}>
              <span style={redDotStyle}>●</span> {appName.toUpperCase()} &nbsp;•&nbsp; CONTEST RADAR
            </Text>
            <Text
              style={{
                ...badgeStyle,
                color: theme.color,
                backgroundColor: theme.bg,
                border: `1px solid ${theme.border}`,
              }}
            >
              {theme.label}
            </Text>
          </Section>

          {/* Alert Header */}
          <Section
            style={{
              backgroundColor: '#09090b',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              textAlign: 'center',
            }}
          >
            <Text
              style={{
                color: '#fb7185',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                margin: '0 0 6px 0',
              }}
            >
              ⏰ {startsInLabel}
            </Text>
            <Heading
              style={{
                color: '#ffffff',
                fontSize: '22px',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: '1.3',
                margin: '0',
              }}
            >
              {contestName}
            </Heading>
          </Section>

          {/* Greeting */}
          <Text style={paragraphStyle}>
            Hi <strong>{userName}</strong>, here is your quick contest reminder. Get your environment setup, drink
            some water, and review your templates!
          </Text>

          {/* Key Details Box */}
          <Section
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '18px 20px',
              margin: '20px 0',
            }}
          >
            <Text style={{ fontSize: '13px', color: '#475569', margin: '0 0 8px 0', lineHeight: '1.5' }}>
              <strong>🗓️ Date & Time:</strong> {startTimeFormatted}
            </Text>
            <Text style={{ fontSize: '12px', color: '#64748b', margin: '0 0 8px 0', lineHeight: '1.5' }}>
              <strong>🌐 UTC Time:</strong> {startTimeUtc}
            </Text>
            <Text style={{ fontSize: '13px', color: '#475569', margin: '0 0 8px 0', lineHeight: '1.5' }}>
              <strong>⏱️ Duration:</strong> {durationFormatted}
            </Text>
            <Text style={{ fontSize: '13px', color: '#475569', margin: '0', lineHeight: '1.5' }}>
              <strong>🏛️ Platform:</strong> {theme.label}
            </Text>
          </Section>

          {/* Action CTAs */}
          <Section style={{ ...actionSection, textAlign: 'center' }}>
            <Button href={contestUrl} style={primaryButtonStyle}>
              Open Contest & Register ↗
            </Button>
            <div style={{ marginTop: '14px' }}>
              <Link
                href={googleCalendarUrl}
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#2563eb',
                  textDecoration: 'none',
                  display: 'inline-block',
                  marginRight: '16px',
                }}
              >
                + Add to Google Calendar
              </Link>
              {practiceUrl && (
                <Link
                  href={practiceUrl}
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#e11d48',
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
                >
                  Solve Past Contests on BigO →
                </Link>
              )}
            </div>
          </Section>

          <Hr style={dividerStyle} />

          {/* Footer & Preferences */}
          <Section style={footerSection}>
            <Text style={footerTextStyle}>
              You received this alert because you subscribed to {theme.label} contest notifications on {appName}.
            </Text>
            <Text style={{ ...footerTextStyle, marginTop: '8px' }}>
              <Link href={preferencesUrl} style={{ color: '#71717a', textDecoration: 'underline' }}>
                Manage alert preferences
              </Link>
              {'  '}•{'  '}
              <Link href={unsubscribeUrl} style={{ color: '#ef4444', textDecoration: 'underline' }}>
                Unsubscribe from contest alerts
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default ContestAlertEmail;
