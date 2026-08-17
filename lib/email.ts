import { Resend } from 'resend';
import { render } from '@react-email/render';
import { InviteEmail } from '@/emails/Invite';
import React from 'react';

const resendApiKey = process.env.RESEND_API_KEY;
const isDummyKey = !resendApiKey || resendApiKey === 're_dummy' || resendApiKey.startsWith('re_dummy');
const resend = resendApiKey && !isDummyKey ? new Resend(resendApiKey) : null;

export async function sendInviteEmail(args: {
  to: string;
  inviterName: string;
  token: string;
  expiresInHours: number;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = `${appUrl}/invite/${args.token}`;
  const appName = 'BigO';

  const html = await render(
    React.createElement(InviteEmail, {
      inviterName: args.inviterName,
      appName,
      url,
      expiresInHours: args.expiresInHours,
    })
  );

  const fromEmail = process.env.EMAIL_FROM || 'BigO <no-reply@bigo.app>';
  const replyTo = process.env.EMAIL_REPLY_TO;
  const subject = `${args.inviterName} invited you to ${appName}`;

  // Development mode fallback when RESEND_API_KEY is not configured with a live key
  if (!resend) {
    console.log('\n----------------------------------------------------');
    console.log('✉️  [DEV EMAIL MOCK] Invite Email Triggered');
    console.log(`To: ${args.to}`);
    console.log(`From: ${fromEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Invite Link: ${url}`);
    console.log('----------------------------------------------------\n');
    return { id: 'mock_email_id', mock: true };
  }

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      replyTo: replyTo || undefined,
      to: args.to,
      subject,
      html,
    });
    return data;
  } catch (error) {
    console.error('❌ Failed to send email via Resend API:', error);
    console.log(`⚠️ Fallback Invite Link: ${url}`);
    throw error;
  }
}
