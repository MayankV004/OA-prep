import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import {
  sendInviteEmail,
  sendWelcomeEmail,
  sendInviteAcceptedEmail,
  sendPasswordResetEmail,
} from '../lib/email';

async function main() {
  const args = process.argv.slice(2);
  let recipient = 'test@example.com';
  let type = 'invite';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--to' && args[i + 1]) {
      recipient = args[i + 1];
      i++;
    } else if (args[i] === '--type' && args[i + 1]) {
      type = args[i + 1];
      i++;
    }
  }

  console.log('✉️  Sending test email...');
  console.log(`Target Recipient: ${recipient}`);
  console.log(`Template Type:    ${type}`);
  console.log(`RESEND_API_KEY:   ${process.env.RESEND_API_KEY ? (process.env.RESEND_API_KEY.startsWith('re_dummy') ? 'NO (Dummy Key)' : 'YES') : 'NO'}`);

  try {
    let result;
    switch (type.toLowerCase()) {
      case 'welcome':
        result = await sendWelcomeEmail({
          to: recipient,
          userName: 'Mayank Verma',
        });
        break;

      case 'accepted':
        result = await sendInviteAcceptedEmail({
          to: recipient,
          adminName: 'Lead Admin',
          invitedEmail: 'candidate.user@gmail.com',
          invitedName: 'Candidate User',
          role: 'Admin',
        });
        break;

      case 'reset':
        result = await sendPasswordResetEmail({
          to: recipient,
          userName: 'Mayank Verma',
          resetToken: 'sample-password-reset-token-998877',
          expiresInMinutes: 60,
        });
        break;

      case 'contest_alert': {
        const { sendContestAlertEmail } = await import('../lib/email');
        const { generateGoogleCalendarUrl } = await import('../lib/contests/calendar');
        const calUrl = generateGoogleCalendarUrl({
          title: 'LeetCode Weekly Contest 438',
          description: 'Weekly contest on LeetCode',
          url: 'https://leetcode.com/contest/weekly-contest-438',
          startTime: new Date(Date.now() + 2 * 3600 * 1000),
          endTime: new Date(Date.now() + 3.5 * 3600 * 1000),
          platform: 'leetcode',
        });

        result = await sendContestAlertEmail({
          to: recipient,
          userName: 'Mayank Verma',
          platform: 'leetcode',
          contestName: 'LeetCode Weekly Contest 438',
          contestUrl: 'https://leetcode.com/contest/weekly-contest-438',
          startTimeFormatted: 'Saturday, Oct 24, 2026 at 8:00 PM (IST)',
          startTimeUtc: '2:30 PM UTC',
          durationFormatted: '1 hour 30 mins',
          startsInLabel: 'Starts in 2 hours',
          googleCalendarUrl: calUrl,
          unsubscribeUrl: 'http://localhost:3000/api/contests/unsubscribe?token=sample-test-token',
          preferencesUrl: 'http://localhost:3000/cp/contests',
          practiceUrl: 'http://localhost:3000/cp',
        });
        break;
      }

      case 'contest_digest': {
        const { sendWeeklyContestDigestEmail } = await import('../lib/email');
        result = await sendWeeklyContestDigestEmail({
          to: recipient,
          userName: 'Mayank Verma',
          weekRangeLabel: 'Monday, Oct 20 - Sunday, Oct 26',
          contests: [
            {
              platform: 'leetcode',
              name: 'LeetCode Weekly Contest 438',
              url: 'https://leetcode.com/contest/weekly-contest-438',
              dayTimeFormatted: 'Saturday, Oct 24 at 8:00 PM IST',
              duration: '1h 30m',
              googleCalendarUrl: 'https://calendar.google.com',
            },
            {
              platform: 'codeforces',
              name: 'Codeforces Round 1002 (Div. 2)',
              url: 'https://codeforces.com/contest/2070',
              dayTimeFormatted: 'Sunday, Oct 25 at 8:05 PM IST',
              duration: '2h',
              googleCalendarUrl: 'https://calendar.google.com',
            },
            {
              platform: 'codechef',
              name: 'CodeChef Starters 175',
              url: 'https://codechef.com/START175',
              dayTimeFormatted: 'Wednesday, Oct 22 at 8:00 PM IST',
              duration: '2h',
              googleCalendarUrl: 'https://calendar.google.com',
            },
          ],
          contestsHubUrl: 'http://localhost:3000/cp/contests',
          unsubscribeUrl: 'http://localhost:3000/api/contests/unsubscribe?token=sample-test-token',
          preferencesUrl: 'http://localhost:3000/cp/contests',
        });
        break;
      }

      case 'invite':
      default:
        result = await sendInviteEmail({
          to: recipient,
          inviterName: 'Lead Admin',
          role: 'Admin',
          token: 'sample-test-token-12345',
          expiresInHours: 168,
        });
        break;
    }

    console.log('Result:', result);
    console.log('✅ Test email invocation complete.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test email failed:', error);
    process.exit(1);
  }
}

main();
