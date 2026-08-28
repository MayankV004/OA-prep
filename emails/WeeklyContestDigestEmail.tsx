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
import { WeeklyContestDigestEmailProps } from '@/types/email';
import {
  mainStyle,
  containerStyle,
  topBrandSection,
  brandLabel,
  redDotStyle,
  badgeStyle,
  headingStyle,
  paragraphStyle,
  actionSection,
  primaryButtonStyle,
  dividerStyle,
  footerSection,
  footerTextStyle,
} from '@/emails/styles/common.styles';

const platformBadgeStyles: Record<string, { label: string; bg: string; color: string }> = {
  leetcode: { label: 'LEETCODE', bg: '#fff7ed', color: '#ea580c' },
  codeforces: { label: 'CODEFORCES', bg: '#eff6ff', color: '#2563eb' },
  codechef: { label: 'CODECHEF', bg: '#fef2f2', color: '#dc2626' },
  atcoder: { label: 'ATCODER', bg: '#f4f4f5', color: '#18181b' },
  hackerearth: { label: 'HACKEREARTH', bg: '#f0fdf4', color: '#16a34a' },
};

export function WeeklyContestDigestEmail({
  userName = 'Coder',
  weekRangeLabel = 'This Week',
  contests = [],
  contestsHubUrl = 'https://bigoprep.tech/cp/contests',
  unsubscribeUrl = 'https://bigoprep.tech/api/contests/unsubscribe?token=sample',
  preferencesUrl = 'https://bigoprep.tech/cp/contests',
  appName = 'BigO',
}: WeeklyContestDigestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`📅 Your Coding Contest Radar for ${weekRangeLabel} (${contests.length} Contests)`}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          {/* Top Brand Bar */}
          <Section style={topBrandSection}>
            <Text style={brandLabel}>
              <span style={redDotStyle}>●</span> {appName.toUpperCase()} &nbsp;•&nbsp; WEEKLY DIGEST
            </Text>
            <Text style={{ ...badgeStyle, color: '#2563eb', backgroundColor: '#eff6ff' }}>
              SCHEDULE
            </Text>
          </Section>

          {/* Heading */}
          <Heading style={headingStyle}>Your Weekly Contest Radar 📅</Heading>
          <Text style={{ ...paragraphStyle, marginBottom: '20px' }}>
            Hi <strong>{userName}</strong>, here is your curated schedule of upcoming coding contests for{' '}
            <strong>{weekRangeLabel}</strong> across your subscribed platforms.
          </Text>

          {/* Contests List */}
          {contests.length === 0 ? (
            <Section
              style={{
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                marginBottom: '20px',
              }}
            >
              <Text style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                No contests scheduled for your selected platforms this week. Check the live radar for updates!
              </Text>
            </Section>
          ) : (
            contests.map((item, idx) => {
              const theme = platformBadgeStyles[item.platform.toLowerCase()] || {
                label: item.platform.toUpperCase(),
                bg: '#faf5ff',
                color: '#9333ea',
              };

              return (
                <Section
                  key={idx}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px 18px',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        color: theme.color,
                        backgroundColor: theme.bg,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                      }}
                    >
                      {theme.label}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
                      ⏱️ {item.duration}
                    </span>
                  </div>

                  <Text
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#0f172a',
                      margin: '4px 0 6px 0',
                      lineHeight: '1.4',
                    }}
                  >
                    {item.name}
                  </Text>

                  <Text style={{ fontSize: '12px', color: '#475569', margin: '0 0 10px 0' }}>
                    🗓️ {item.dayTimeFormatted}
                  </Text>

                  <div style={{ marginTop: '8px' }}>
                    <Link
                      href={item.url}
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#e11d48',
                        textDecoration: 'none',
                        marginRight: '16px',
                      }}
                    >
                      View & Register ↗
                    </Link>
                    <Link
                      href={item.googleCalendarUrl}
                      style={{
                        fontSize: '12px',
                        color: '#2563eb',
                        textDecoration: 'none',
                      }}
                    >
                      + Google Calendar
                    </Link>
                  </div>
                </Section>
              );
            })
          )}

          {/* Action Button */}
          <Section style={{ ...actionSection, textAlign: 'center' }}>
            <Button href={contestsHubUrl} style={primaryButtonStyle}>
              View Live Contest Radar on BigO →
            </Button>
          </Section>

          <Hr style={dividerStyle} />

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerTextStyle}>
              You received this weekly digest because you enabled Contest Alerts on {appName}.
            </Text>
            <Text style={{ ...footerTextStyle, marginTop: '8px' }}>
              <Link href={preferencesUrl} style={{ color: '#71717a', textDecoration: 'underline' }}>
                Manage alert preferences
              </Link>
              {'  '}•{'  '}
              <Link href={unsubscribeUrl} style={{ color: '#ef4444', textDecoration: 'underline' }}>
                Unsubscribe
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default WeeklyContestDigestEmail;
