import { Resend } from 'resend';
import { render } from '@react-email/render';
import { InviteEmail } from '@/emails/Invite';
import React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendInviteEmail(args: {
  to: string;
  inviterName: string;
  token: string;
  expiresInHours: number;
}) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${args.token}`;
  const html = await render(
    React.createElement(InviteEmail, {
      inviterName: args.inviterName,
      url,
      expiresInHours: args.expiresInHours,
    })
  );
  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    replyTo: process.env.EMAIL_REPLY_TO,
    to: args.to,
    subject: `${args.inviterName} invited you to BigO`,
    html,
  });
}
