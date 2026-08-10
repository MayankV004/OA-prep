import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// We must import these after dotenv.config() so that process.env is populated
import { User, Taxonomy, Group } from '../models';
const { auth } = require('../lib/auth');

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI missing');
  
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;

  if (adminEmail && adminPassword) {
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      console.log('No admin found, creating bootstrap admin...');
      
      try {
         // Create the user manually in the DB with a hashed password, OR use better-auth API.
         // Calling auth.api.signUpEmail requires a Request object.
         const headers = new Headers();
         // To bypass requiring a Request for signUpEmail, we can use auth.api.signUpEmail({ body: ... }) 
         // BetterAuth server methods usually take an object with body, etc.
         const req = new Request('http://localhost:3000/api/auth/sign-up/email', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ email: adminEmail, password: adminPassword, name: 'Admin' })
         });
         
         const res = await auth.handler(req);
         if (!res.ok) {
           const err = await res.text();
           throw new Error(`Failed to create admin: ${err}`);
         }
         
         // Now promote them to admin
         await User.findOneAndUpdate({ email: adminEmail }, { role: 'admin' });
         console.log('Bootstrap admin created successfully.');
      } catch (e) {
        console.error('Failed to create admin:', e);
      }
    } else {
      console.log('Admin already exists, skipping bootstrap admin creation.');
    }
  }

  console.log('Seeding taxonomies...');
  const taxonomies = [
    { kind: 'pattern', name: 'Sliding Window', slug: 'sliding-window' },
    { kind: 'pattern', name: 'Two Pointers', slug: 'two-pointers' },
    { kind: 'pattern', name: 'Binary Search', slug: 'binary-search' },
    { kind: 'pattern', name: 'Backtracking', slug: 'backtracking' },
    { kind: 'pattern', name: 'DP', slug: 'dp' },
    { kind: 'pattern', name: 'Graphs', slug: 'graphs' },
    { kind: 'pattern', name: 'Trees', slug: 'trees' },
    { kind: 'pattern', name: 'Greedy', slug: 'greedy' },
    { kind: 'pattern', name: 'Heap', slug: 'heap' },
    { kind: 'pattern', name: 'Trie', slug: 'trie' },
    { kind: 'pattern', name: 'Segment Tree', slug: 'segment-tree' },
    { kind: 'pattern', name: 'Bit Manipulation', slug: 'bit-manipulation' },
    
    { kind: 'bucket', name: 'Ad-hoc', slug: 'ad-hoc' },
    { kind: 'bucket', name: 'Constructive', slug: 'constructive' },
    { kind: 'bucket', name: 'Math', slug: 'math' },

    { kind: 'platform', name: 'Codeforces', slug: 'codeforces' },
    { kind: 'platform', name: 'LeetCode Contest', slug: 'leetcode-contest' },
    { kind: 'platform', name: 'AtCoder', slug: 'atcoder' },
    { kind: 'platform', name: 'CodeChef', slug: 'codechef' },

    { kind: 'subject', name: 'OS', slug: 'os' },
    { kind: 'subject', name: 'DBMS', slug: 'dbms' },
    { kind: 'subject', name: 'CN', slug: 'cn' },
    { kind: 'subject', name: 'OOP', slug: 'oop' },

    { kind: 'advanced', name: 'DevOps', slug: 'devops' },
    { kind: 'advanced', name: 'Docker', slug: 'docker' },
    { kind: 'advanced', name: 'Kubernetes', slug: 'kubernetes' },
    { kind: 'advanced', name: 'GenAI', slug: 'genai' },
    { kind: 'advanced', name: 'System Design', slug: 'system-design' },

    { kind: 'difficulty', name: 'Easy', slug: 'easy' },
    { kind: 'difficulty', name: 'Medium', slug: 'medium' },
    { kind: 'difficulty', name: 'Hard', slug: 'hard' },
  ];

  for (let i = 0; i < taxonomies.length; i++) {
    const item = taxonomies[i];
    await Taxonomy.updateOne(
      { kind: item.kind, slug: item.slug },
      { $set: { name: item.name, order: i } },
      { upsert: true }
    );
  }
  console.log('Taxonomies seeded.');

  console.log('Seeding groups for subjects and advanced topics...');
  const groupsToCreate = taxonomies.filter(t => t.kind === 'subject' || t.kind === 'advanced');
  for (let i = 0; i < groupsToCreate.length; i++) {
    const item = groupsToCreate[i];
    await Group.updateOne(
      { kind: item.kind, slug: item.slug },
      { $set: { name: item.name, order: i } },
      { upsert: true }
    );
  }
  console.log('Groups seeded.');

  console.log('Seed completed successfully.');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
