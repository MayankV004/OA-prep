export interface FeedbackNotificationEmailProps {
  type: 'bug' | 'feedback';
  title: string;
  description: string;
  reporterEmail: string;
  reporterName?: string;
  category?: string;
  severity?: string;
  pageUrl?: string;
  submittedAt: string;
  appName?: string;
  adminFeedbackUrl: string;
}

export interface InviteEmailProps {
  inviterName?: string;
  role?: string;
  appName?: string;
  url?: string;
  expiresInHours?: number;
}

export interface InviteAcceptedEmailProps {
  adminName?: string;
  invitedEmail?: string;
  invitedName?: string;
  role?: string;
  acceptedAt?: string;
  appName?: string;
  adminUsersUrl?: string;
}

export interface OTPEmailProps {
  userName?: string;
  otp?: string;
  expiresInMinutes?: number;
  appName?: string;
}

export interface PasswordResetEmailProps {
  userName?: string;
  resetUrl?: string;
  expiresInMinutes?: number;
  appName?: string;
}

export interface WelcomeConfirmationEmailProps {
  userName?: string;
  userEmail?: string;
  appName?: string;
  dashboardUrl?: string;
}
