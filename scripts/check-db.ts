import * as dotenv from 'dotenv';
import * as path from 'path';
import mongoose from 'mongoose';
import { Pattern } from '../models/pattern';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI is missing');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const count = await Pattern.countDocuments();
  console.log(`Total DSA Patterns in DB: ${count}`);

  const patterns = await Pattern.find().select('title slug variations').lean();
  let totalVariations = 0;
  let totalProblems = 0;

  for (const p of patterns) {
    totalVariations += (p.variations || []).length;
    for (const v of (p.variations || [])) {
      totalProblems += (v.problems || []).length;
    }
    console.log(`- ${p.title} (${p.slug}): ${(p.variations || []).length} variations`);
  }

  console.log(`\nTotal Variations: ${totalVariations}`);
  console.log(`Total Problems: ${totalProblems}`);

  process.exit(0);
}

main().catch(console.error);
