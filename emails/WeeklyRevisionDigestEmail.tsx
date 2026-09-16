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
import { WeeklyRevisionDigestEmailProps } from '@/types/email';
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

const diffStyles: Record<string, { bg: string; color: string }> = {
  Easy: { bg: '#ecfdf5', color: '#059669' },
  Medium: { bg: '#fffbeb', color: '#d97706' },
  Hard: { bg: '#fef2f2', color: '#dc2626' },
};

export function WeeklyRevisionDigestEmail({
  userName = 'Coder',
  weekLabel = 'This Week',
  totalRevisionCount = 0,
  problems = [],
  practiceHubUrl = 'https://bigoprep.tech/dsa',
  appName = 'BigO',
}: WeeklyRevisionDigestEmailProps) {
  const topProblems = problems.slice(0, 5);

  return (
    <Html>
      <Head />
      <Preview>{`⭐ Weekly Problem Revision Radar: ${totalRevisionCount} problems due for review`}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          {/* Top Brand Bar */}
          <Section style={topBrandSection}>
            <Text style={brandLabel}>
              <span style={redDotStyle}>●</span> {appName.toUpperCase()} &nbsp;•&nbsp; REVISION RADAR
            </Text>
            <Text style={{ ...badgeStyle, color: '#d97706', backgroundColor: '#fffbeb' }}>
              WEEKLY DIGEST
            </Text>
          </Section>

          {/* Headline */}
          <Heading style={headingStyle}>
            Beat the forgetting curve, {userName}.
          </Heading>

          <Text style={paragraphStyle}>
            You have <strong style={{ color: '#09090b' }}>{totalRevisionCount} problem{totalRevisionCount !== 1 ? 's' : ''}</strong> marked for revision. Revisiting your tricky edge cases and key pattern invariants today builds permanent muscle memory for your upcoming technical rounds.
          </Text>

          <Hr style={dividerStyle} />

          {/* Problem Cards */}
          <Section>
            <Text style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: '#71717a', margin: '0 0 16px 0', textTransform: 'uppercase' }}>
              🎯 Priority Problems For {weekLabel.toUpperCase()}
            </Text>

            {topProblems.map((p, idx) => {
              const diff = diffStyles[p.difficulty] || diffStyles.Medium;
              return (
                <div
                  key={p.problemId || idx}
                  style={{
                    backgroundColor: '#fafafa',
                    border: '1px solid #e4e4e7',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '12px',
                  }}
                >
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '6px',
                                backgroundColor: diff.bg,
                                color: diff.color,
                                textTransform: 'uppercase',
                              }}
                            >
                              {p.difficulty}
                            </span>
                            <span
                              style={{
                                fontSize: '11px',
                                color: '#71717a',
                                fontWeight: 500,
                                marginLeft: '6px',
                              }}
                            >
                              {p.patternTitle}
                            </span>
                          </div>
                          <Text
                            style={{
                              fontSize: '15px',
                              fontWeight: 600,
                              color: '#09090b',
                              margin: '4px 0 6px 0',
                            }}
                          >
                            {p.title}
                          </Text>

                          {p.userNotesExcerpt && (
                            <div
                              style={{
                                backgroundColor: '#f4f4f5',
                                borderLeft: '3px solid #e11d48',
                                padding: '6px 10px',
                                borderRadius: '0 6px 6px 0',
                                margin: '8px 0',
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: '12px',
                                  color: '#3f3f46',
                                  margin: 0,
                                  fontStyle: 'italic',
                                }}
                              >
                                💡 Note: &ldquo;{p.userNotesExcerpt}&rdquo;
                              </Text>
                            </div>
                          )}
                        </td>
                        <td style={{ textAlign: 'right', verticalAlign: 'middle', width: '110px' }}>
                          <Button
                            href={p.practiceUrl}
                            style={{
                              backgroundColor: '#09090b',
                              color: '#ffffff',
                              fontSize: '12px',
                              fontWeight: 600,
                              padding: '8px 14px',
                              borderRadius: '8px',
                              textDecoration: 'none',
                              display: 'inline-block',
                            }}
                          >
                            Revise →
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </Section>

          {/* CTA Section */}
          <Section style={{ ...actionSection, textAlign: 'center' }}>
            <Button href={practiceHubUrl} style={primaryButtonStyle}>
              Practice All Revision Problems ({totalRevisionCount})
            </Button>
          </Section>

          <Hr style={dividerStyle} />

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerTextStyle}>
              You received this reminder because you starred problems for revision on {appName}.
              Mark problems as &ldquo;Revised&rdquo; on the practice page to clear them from your weekly radar.
            </Text>
            <Text style={{ ...footerTextStyle, marginTop: '8px' }}>
              <Link href={practiceHubUrl} style={{ color: '#71717a', textDecoration: 'underline' }}>
                Open Practice Hub
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default WeeklyRevisionDigestEmail;
