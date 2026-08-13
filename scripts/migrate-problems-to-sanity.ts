import { createClient } from 'next-sanity';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-08-11',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const problemSchema = new mongoose.Schema({
  title: String,
  url: String,
  difficulty: String,
  pattern: String,
  variation: String,
  tags: [String],
  kind: String
}, { collection: 'problems' });

const Problem = mongoose.models.Problem || mongoose.model('Problem', problemSchema);

async function main() {
  await mongoose.connect(process.env.MONGODB_URI as string, {
    dbName: process.env.MONGODB_DB
  });
  
  console.log('Fetching pattern problems from MongoDB...');
  // Since problems are duplicated per user, we can just aggregate by title/url
  // to get the distinct problems.
  const uniqueProblems = await Problem.aggregate([
    { $match: { kind: 'pattern' } },
    {
      $group: {
        _id: { url: '$url' },
        title: { $first: '$title' },
        url: { $first: '$url' },
        difficulty: { $first: '$difficulty' },
        pattern: { $first: '$pattern' },
        variation: { $first: '$variation' },
        tags: { $first: '$tags' }
      }
    }
  ]);
  
  console.log(`Found ${uniqueProblems.length} unique pattern problems to migrate.`);
  
  for (const prob of uniqueProblems) {
    const patternSlug = prob.pattern.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    // We need to fetch the sanity pattern ID first
    const sanityPattern = await client.fetch(`*[_type == "pattern" && slug.current == $slug][0]`, { slug: patternSlug });
    
    if (!sanityPattern) {
      console.warn(`Warning: Pattern '${patternSlug}' not found in Sanity. Skipping problem: ${prob.title}`);
      continue;
    }
    
    const docId = `problem-${Buffer.from(prob.url).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 32)}`;
    
    const doc = {
      _id: docId,
      _type: 'problem',
      title: prob.title,
      url: prob.url,
      difficulty: prob.difficulty,
      pattern: {
        _type: 'reference',
        _ref: sanityPattern._id
      },
      variation: prob.variation || 'General'
    };
    
    await client.createOrReplace(doc);
    console.log(`✅ Migrated Problem: ${prob.title}`);
  }
  
  console.log('Problem migration complete!');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
