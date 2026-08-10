import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function debug() {
  await mongoose.connect(process.env.MONGODB_URI!, { dbName: process.env.MONGODB_DB });
  const { User } = require('../models/user');
  const { Problem } = require('../models/problem');
  
  const users = await User.find();
  console.log('Users:');
  for (const u of users) {
    console.log(` - ${u.email} : ${u._id}`);
  }

  const problems = await Problem.find({ kind: 'pattern' }).limit(5);
  console.log('Sample problems:');
  for (const p of problems) {
    console.log(` - ${p.title} (pattern: ${p.pattern}) for user: ${p.userId}`);
  }
  
  process.exit(0);
}

debug().catch(console.error);
