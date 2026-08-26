import { Resend } from 'resend';
import { render } from '@react-email/render';
import { InviteEmail } from '@/emails/Invite';
import { WelcomeConfirmationEmail } from '@/emails/WelcomeConfirmation';
import { InviteAcceptedEmail } from '@/emails/InviteAccepted';
import { PasswordResetEmail } from '@/emails/PasswordReset';
import { OTPEmail } from '@/emails/OTPEmail';
import { FeedbackNotificationEmail } from '@/emails/FeedbackNotification';
import React from 'react';
import { env } from '@/lib/config';

function getResendClient() {
  const resendApiKey = env.RESEND_API_KEY;
  const isDummyKey = !resendApiKey || resendApiKey === 're_dummy' || resendApiKey.startsWith('re_dummy');
  return resendApiKey && !isDummyKey ? new Resend(resendApiKey) : null;
}

const APP_NAME = 'BigO';

function sanitizeHeaderValue(val?: string): string {
  if (!val) return '';
  return val.replace(/[\r\n\t]/g, ' ').trim();
}

function getEmailHeaders() {
  const fromEmail = env.EMAIL_FROM;
  const replyTo = env.EMAIL_REPLY_TO;
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
  const appUrl = env.NEXT_PUBLIC_APP_URL;
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
  const appUrl = env.NEXT_PUBLIC_APP_URL;
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
  const appUrl = env.NEXT_PUBLIC_APP_URL;
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
  const appUrl = env.NEXT_PUBLIC_APP_URL;
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

/**
 * 5. Send 6-Digit OTP Email Verification
 */
export async function sendOTPEmail(args: {
  to: string;
  userName?: string;
  otp: string;
  expiresInMinutes?: number;
}) {
  const expiresInMinutes = args.expiresInMinutes || 10;

  const html = await render(
    React.createElement(OTPEmail, {
      userName: args.userName || 'User',
      otp: args.otp,
      expiresInMinutes,
      appName: APP_NAME,
    })
  );

  const { fromEmail, replyTo } = getEmailHeaders();
  const subject = `${args.otp} is your ${APP_NAME} verification code`;
  const resend = getResendClient();

  if (!resend) {
    console.log('\n----------------------------------------------------');
    console.log('[DEV EMAIL MOCK] OTP Verification Email Triggered');
    console.log(`To: ${args.to}`);
    console.log(`From: ${fromEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`OTP Code: ${args.otp}`);
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
    console.error('Failed to send OTP email via Resend API:', error);
    throw error;
  }
}

/**
 * 6. Send Feedback / Bug Report Admin Notification Email
 */
export async function sendFeedbackNotificationEmail(args: {
  type: 'bug' | 'feedback';
  title: string;
  description: string;
  reporterEmail: string;
  reporterName?: string;
  category?: string;
  severity?: string;
  pageUrl?: string;
}) {
  const adminEmail =
    process.env.ADMIN_BOOTSTRAP_EMAIL ||
    process.env.EMAIL_REPLY_TO ||
    'mayankcocspecial@gmail.com';
  const appUrl = env.NEXT_PUBLIC_APP_URL;
  const adminFeedbackUrl = `${appUrl}/admin/feedback`;
  const submittedAt = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  const html = await render(
    React.createElement(FeedbackNotificationEmail, {
      type: args.type,
      title: args.title,
      description: args.description,
      reporterEmail: args.reporterEmail,
      reporterName: args.reporterName,
      category: args.category,
      severity: args.severity,
      pageUrl: args.pageUrl,
      submittedAt,
      appName: APP_NAME,
      adminFeedbackUrl,
    })
  );

  const { fromEmail } = getEmailHeaders();
  const subject = `[${args.type.toUpperCase()}] ${args.title}`;
  const resend = getResendClient();

  if (!resend) {
    console.log('\n----------------------------------------------------');
    console.log('[DEV EMAIL MOCK] Feedback Notification Email Triggered');
    console.log(`To Admin: ${adminEmail}`);
    console.log(`From: ${fromEmail}`);
    console.log(`Type: ${args.type.toUpperCase()}`);
    console.log(`Title: ${args.title}`);
    console.log(`Reporter: ${args.reporterEmail}`);
    console.log(`Details: ${args.description}`);
    console.log('----------------------------------------------------\n');
    return { id: 'mock_email_id', mock: true };
  }

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      replyTo: args.reporterEmail,
      subject,
      html,
    });
    return data;
  } catch (error) {
    console.error('Failed to send feedback notification email via Resend API:', error);
    // Don't throw — keep submission successful even if email fails
    return null;
  }
}

