export type EmailJob =
  | {
      type: 'invite';
      to: string;
      inviterName: string;
      role: string;
      token: string;
      expiresInHours: number;
    }
  | {
      type: 'welcome';
      to: string;
      userName: string;
    }
  | {
      type: 'invite_accepted';
      to: string;
      adminName: string;
      invitedEmail: string;
      invitedName?: string;
      role: string;
    };
