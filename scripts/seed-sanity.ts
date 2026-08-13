import { createClient } from 'next-sanity';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Setup Sanity client with a write token
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-08-11',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function main() {
  if (!process.env.SANITY_API_TOKEN) {
    console.error('Error: SANITY_API_TOKEN is missing in .env.local');
    process.exit(1);
  }

  if (process.env.SANITY_API_TOKEN === 'your_sanity_token_here') {
    console.error('Error: Please replace "your_sanity_token_here" with a real token in .env.local');
    process.exit(1);
  }

  // Use dynamic import or require to get the patterns data
  // Since scripts run via ts-node often have issues with next aliases, we use relative paths
  console.log('Loading patterns data...');
  const allPatterns = require('../data/patterns');

  for (const key in allPatterns) {
    const pattern = allPatterns[key];
    console.log(`Migrating pattern: ${pattern.title}...`);

    try {
      const doc = {
        _type: 'pattern',
        title: pattern.title,
        slug: { _type: 'slug', current: pattern.slug },
        description: pattern.description || '',
        timeComplexity: pattern.timeComplexity || '',
        spaceComplexity: pattern.spaceComplexity || '',
        useCases: pattern.useCases || [],
        concept: pattern.concept || '',
        templateCode: pattern.templateCode || '',
        explanation: pattern.explanation || '',
        variations: (pattern.variations || []).map((v: any) => ({
          _key: v.id || Math.random().toString(36).substring(7),
          _type: 'variation',
          id: v.id,
          title: v.title,
          concept: v.concept || '',
          templateCode: v.templateCode || ''
        }))
      };

      // Use a custom ID based on slug to avoid duplicates on re-runs
      const docId = `pattern-${pattern.slug}`;
      await client.createOrReplace({ ...doc, _id: docId });

      console.log(`✅ Created/Updated: ${pattern.title}`);
    } catch (err) {
      console.error(`❌ Error migrating ${pattern.title}:`, err);
    }
  }

  console.log('Migration complete!');
}

main().catch(console.error);
