import { Body, Button, Container, Head, Html, Preview, Section, Text } from '@react-email/components';

export function InviteEmail({
  inviterName,
  appName = 'BigO',
  url,
  expiresInHours,
}: {
  inviterName: string;
  appName?: string;
  url: string;
  expiresInHours: number;
}) {
  return (
    <Html>
      <Head />
      <Preview>{`${inviterName} invited you to ${appName}`}</Preview>
      <Body style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f8fafc', padding: '24px 0' }}>
        <Container style={{ maxWidth: 480, background: '#ffffff', border: '1px solid #e2e8f0', padding: 32, borderRadius: 12, margin: '0 auto' }}>
          <Text style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0', letterSpacing: '-0.02em' }}>
            {appName} 🚀
          </Text>
          <Text style={{ fontSize: 15, color: '#334155', lineHeight: '1.6', margin: '0 0 12px 0' }}>
            Hello,
          </Text>
          <Text style={{ fontSize: 15, color: '#334155', lineHeight: '1.6', margin: '0 0 16px 0' }}>
            <strong>{inviterName}</strong> has invited you to join <strong>{appName}</strong> to track your placement preparation, DSA patterns, core CS subjects, and interview readiness.
          </Text>
          <Text style={{ fontSize: 14, color: '#64748b', lineHeight: '1.5', margin: '0 0 24px 0' }}>
            Accept this invitation to set your password. This link will expire in {expiresInHours} hours.
          </Text>
          <Section style={{ textAlign: 'center', margin: '28px 0' }}>
            <Button
              href={url}
              style={{
                background: '#0f172a',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Accept Invitation
            </Button>
          </Section>
          <Text style={{ fontSize: 12, color: '#94a3b8', margin: '24px 0 4px 0' }}>
            If the button doesn&apos;t work, copy and paste this link into your browser:
          </Text>
          <Text style={{ fontSize: 12, color: '#2563eb', wordBreak: 'break-all', margin: 0 }}>
            {url}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default InviteEmail;
