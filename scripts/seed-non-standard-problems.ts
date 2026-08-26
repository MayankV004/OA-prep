import * as dotenv from 'dotenv';
import * as path from 'path';
import mongoose from 'mongoose';
import { NonStandardProblem } from '../models/problem';
import { User } from '../models/user';
import {
  getNonStandardCategories,
  parseProblemDifficulty,
  generateProblemUrl,
  formatProblemNotes,
} from '../lib/non-standard-dsa';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI is missing');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB || 'placementdeck',
  });
  console.log('Connected to MongoDB.');

  // Find target user (first admin or user in DB)
  const user = await User.findOne({}).sort({ createdAt: 1 }).lean();
  if (!user) {
    console.warn('⚠️ No user found in database. Seeding aborting until a user exists.');
    process.exit(0);
  }

  const userId = user._id;
  console.log(`Seeding non-standard problems for user ${user.email || userId}...`);

  const categories = getNonStandardCategories();
  let totalInserted = 0;

  for (const cat of categories) {
    console.log(`Processing category: ${cat.category} (${cat.problems.length} problems)...`);

    for (const prob of cat.problems) {
      const title = prob.name;
      const difficulty = parseProblemDifficulty(prob.platform);
      const url = generateProblemUrl(prob.name, prob.source, prob.platform);
      const notes = formatProblemNotes(prob);

      try {
        await NonStandardProblem.findOneAndUpdate(
          { userId, kind: 'nonstandard', title, bucket: cat.category },
          {
            userId,
            kind: 'nonstandard',
            title,
            bucket: cat.category,
            url,
            difficulty,
            notes,
            platform: prob.platform,
            tags: ['nonstandard', cat.slug],
          },
          { upsert: true, new: true }
        );
        totalInserted++;
      } catch (err) {
        console.error(`❌ Error upserting ${prob.name}:`, err);
      }
    }
  }

  console.log(`\n✅ Non-standard problems seed complete! Upserted ${totalInserted} problems.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
