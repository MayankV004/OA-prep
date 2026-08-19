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
