import * as dotenv from 'dotenv';
import * as path from 'path';
import mongoose from 'mongoose';
import { Assessment } from '../models/assessment';
import { COMPANY_OA_SEEDS } from '../data/assessments/company-oa-seeds';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Error: MONGODB_URI is not defined in .env.local');
    process.exit(1);
  }

  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || 'placementdeck',
  });
  console.log('Connected to MongoDB.');

  console.log(`Seeding ${COMPANY_OA_SEEDS.length} Company OA Simulations...`);

  for (const seed of COMPANY_OA_SEEDS) {
    const result = await Assessment.findOneAndUpdate(
      { slug: seed.slug },
      {
        $set: {
          title: seed.title,
          slug: seed.slug,
          company: seed.company,
          role: seed.role,
          description: seed.description,
          durationMinutes: seed.durationMinutes,
          passingScore: seed.passingScore,
          isProOnly: seed.isProOnly,
          difficulty: seed.difficulty,
          companyInstructions: seed.companyInstructions,
          problems: seed.problems,
        },
      },
      { upsert: true, new: true }
    );
    console.log(`✓ Seeded: ${result.title} (${result.slug}) [${result.isProOnly ? 'PRO' : 'FREE'}]`);
  }

  console.log('Successfully seeded all assessment packs!');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Error seeding assessments:', err);
  process.exit(1);
});
