import { Resend } from 'resend';
import { render } from '@react-email/render';
import { InviteEmail } from '@/emails/Invite';
import { WelcomeConfirmationEmail } from '@/emails/WelcomeConfirmation';
import { InviteAcceptedEmail } from '@/emails/InviteAccepted';
import { PasswordResetEmail } from '@/emails/PasswordReset';
import React from 'react';

function getResendClient() {
  const resendApiKey = process.env.RESEND_API_KEY;
  const isDummyKey = !resendApiKey || resendApiKey === 're_dummy' || resendApiKey.startsWith('re_dummy');
  return resendApiKey && !isDummyKey ? new Resend(resendApiKey) : null;
}

const APP_NAME = 'BigO';

function sanitizeHeaderValue(val?: string): string {
  if (!val) return '';
  return val.replace(/[\r\n\t]/g, ' ').trim();
}

function getEmailHeaders() {
  const fromEmail = process.env.EMAIL_FROM || 'BigO <no-reply@bigoprep.tech>';
  const replyTo = process.env.EMAIL_REPLY_TO || 'BigO Support <support@bigoprep.tech>';
  return { fromEmail, replyTo };
}

/**
 * 1. Send User / Admin Invitation Email
 */
export async function sendInviteEmail(args: {
  to: string;
  inviterName: string;
  role?: string;
  token: string;
  expiresInHours: number;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = `${appUrl}/invite/${args.token}`;
  const role = args.role || 'User';
  const cleanInviterName = sanitizeHeaderValue(args.inviterName) || 'Admin';

  const html = await render(
    React.createElement(InviteEmail, {
      inviterName: cleanInviterName,
      role,
      appName: APP_NAME,
      url,
      expiresInHours: args.expiresInHours,
    })
  );

  const { fromEmail, replyTo } = getEmailHeaders();
  const subject = `${cleanInviterName} invited you to join ${APP_NAME}`;
  const resend = getResendClient();

  if (!resend) {
    console.log('\n----------------------------------------------------');
    console.log('[DEV EMAIL MOCK] Invite Email Triggered');
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
    console.error('Failed to send invite email via Resend API:', error);
    console.log(`Fallback Invite Link: ${url}`);
    throw error;
  }
}

/**
 * 2. Send Signup Welcome & Confirmation Email
 */
export async function sendWelcomeEmail(args: {
  to: string;
  userName: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const dashboardUrl = `${appUrl}/dashboard`;

  const html = await render(
    React.createElement(WelcomeConfirmationEmail, {
      userName: args.userName,
      userEmail: args.to,
      appName: APP_NAME,
      dashboardUrl,
    })
  );

  const { fromEmail, replyTo } = getEmailHeaders();
  const subject = `Welcome to ${APP_NAME}! Your account is ready`;
  const resend = getResendClient();

  if (!resend) {
    console.log('\n----------------------------------------------------');
    console.log('[DEV EMAIL MOCK] Welcome Email Triggered');
    console.log(`To: ${args.to}`);
    console.log(`From: ${fromEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Dashboard URL: ${dashboardUrl}`);
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
    console.error('Failed to send welcome email via Resend API:', error);
    throw error;
  }
}

/**
 * 3. Send Invite Accepted Notification Email to Admin/Inviter
 */
export async function sendInviteAcceptedEmail(args: {
  to: string;
  adminName: string;
  invitedEmail: string;
  invitedName?: string;
  role: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const adminUsersUrl = `${appUrl}/admin/users`;

  const html = await render(
    React.createElement(InviteAcceptedEmail, {
      adminName: args.adminName,
      invitedEmail: args.invitedEmail,
      invitedName: args.invitedName,
      role: args.role,
      acceptedAt: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      appName: APP_NAME,
      adminUsersUrl,
    })
  );

  const { fromEmail, replyTo } = getEmailHeaders();
  const subject = `Invitation Accepted: ${args.invitedName || args.invitedEmail} joined ${APP_NAME}`;
  const resend = getResendClient();

  if (!resend) {
    console.log('\n----------------------------------------------------');
    console.log('[DEV EMAIL MOCK] Invite Accepted Email Triggered');
    console.log(`To: ${args.to}`);
    console.log(`From: ${fromEmail}`);
    console.log(`Subject: ${subject}`);
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
    console.error('Failed to send invite accepted notification via Resend API:', error);
    throw error;
  }
}

/**
 * 4. Send Password Reset Email
 */
export async function sendPasswordResetEmail(args: {
  to: string;
  userName?: string;
  resetToken: string;
  expiresInMinutes?: number;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetUrl = `${appUrl}/reset-password?token=${args.resetToken}`;
  const expiresInMinutes = args.expiresInMinutes || 60;

  const html = await render(
    React.createElement(PasswordResetEmail, {
      userName: args.userName,
      resetUrl,
      expiresInMinutes,
      appName: APP_NAME,
    })
  );

  const { fromEmail, replyTo } = getEmailHeaders();
  const subject = `Reset your ${APP_NAME} password`;
  const resend = getResendClient();

  if (!resend) {
    console.log('\n----------------------------------------------------');
    console.log('[DEV EMAIL MOCK] Password Reset Email Triggered');
    console.log(`To: ${args.to}`);
    console.log(`From: ${fromEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Reset URL: ${resetUrl}`);
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
    console.error('Failed to send password reset email via Resend API:', error);
    throw error;
  }
}
