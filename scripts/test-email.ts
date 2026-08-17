import * as dotenv from 'dotenv';
import * as path from 'path';
import { sendInviteEmail } from '../lib/email';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const args = process.argv.slice(2);
  let recipient = 'test@example.com';
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--to' && args[i + 1]) {
      recipient = args[i + 1];
      i++;
    }
  }

  console.log('Sending test invite email...');
  console.log(`Target Recipient: ${recipient}`);
  console.log(`RESEND_API_KEY Configured: ${process.env.RESEND_API_KEY ? (process.env.RESEND_API_KEY.startsWith('re_dummy') ? 'NO (Dummy Key)' : 'YES') : 'NO'}`);

  try {
    const result = await sendInviteEmail({
      to: recipient,
      inviterName: 'Admin Test',
      token: 'sample-test-token-12345',
      expiresInHours: 168,
    });
    console.log('Result:', result);
    console.log('✅ Test email invocation complete.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test email failed:', error);
    process.exit(1);
  }
}

main();
