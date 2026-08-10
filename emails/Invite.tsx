import { Body, Button, Container, Head, Html, Preview, Section, Text } from '@react-email/components';

export function InviteEmail({
  inviterName,
  appName = 'PlacementDeck',
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
      <Body style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8fafc', padding: 24 }}>
        <Container style={{ maxWidth: 480, background: 'white', padding: 32, borderRadius: 8 }}>
          <Text style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>{appName}</Text>
          <Text>{inviterName} invited you to join {appName}.</Text>
          <Text>
            Set your password and start tracking your prep. The link expires in {expiresInHours} hours.
          </Text>
          <Section style={{ margin: '24px 0' }}>
            <Button
              href={url}
              style={{
                background: '#111827',
                color: 'white',
                padding: '10px 20px',
                borderRadius: 6,
                textDecoration: 'none',
              }}
            >
              Accept invite
            </Button>
          </Section>
          <Text style={{ fontSize: 12, color: '#6b7280' }}>
            If the button does not open, paste this link into your browser:
          </Text>
          <Text style={{ fontSize: 12, color: '#6b7280', wordBreak: 'break-all' }}>{url}</Text>
        </Container>
      </Body>
    </Html>
  );
}
