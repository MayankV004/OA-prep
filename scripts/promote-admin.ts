import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { User } from '../models';

dotenv.config({ path: '.env.local' });

async function promoteAdmin() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI missing');

  const args = process.argv.slice(2);
  const emailArgIndex = args.indexOf('--email');
  if (emailArgIndex === -1 || !args[emailArgIndex + 1]) {
    throw new Error('Please provide an email with --email');
  }
  const email = args[emailArgIndex + 1].toLowerCase();

  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB });
  console.log('Connected to MongoDB');

  const user = await User.findOne({ email });
  if (!user) {
    console.error(`User with email ${email} not found.`);
    process.exit(1);
  }

  user.role = 'admin';
  await user.save();
  console.log(`Successfully promoted ${email} to admin.`);
  
  process.exit(0);
}

promoteAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
