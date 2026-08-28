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

export interface ContestAlertEmailProps {
  userName?: string;
  platform: 'leetcode' | 'codeforces' | 'codechef' | 'atcoder' | 'hackerearth' | string;
  contestName: string;
  contestUrl: string;
  startTimeFormatted: string;
  startTimeUtc: string;
  durationFormatted: string;
  startsInLabel: string; // e.g. "Starts in 2 hours", "Starts in 30 minutes", "Starts tomorrow"
  googleCalendarUrl: string;
  practiceUrl?: string;
  unsubscribeUrl: string;
  preferencesUrl: string;
  appName?: string;
}

export interface WeeklyContestItem {
  platform: string;
  name: string;
  url: string;
  dayTimeFormatted: string;
  duration: string;
  googleCalendarUrl: string;
}

export interface WeeklyContestDigestEmailProps {
  userName?: string;
  weekRangeLabel: string; // e.g., "Monday, Mar 2 - Sunday, Mar 8"
  contests: WeeklyContestItem[];
  contestsHubUrl: string;
  unsubscribeUrl: string;
  preferencesUrl: string;
  appName?: string;
}
