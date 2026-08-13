import { createClient } from 'next-sanity';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-08-11',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function main() {
  if (!process.env.SANITY_API_TOKEN) {
    console.error('Error: SANITY_API_TOKEN is missing');
    process.exit(1);
  }

  console.log('Fetching documents to delete...');
  const docs = await client.fetch(`*[_type in ["pattern", "variation", "problem"]][]._id`);
  
  console.log(`Found ${docs.length} documents. Deleting...`);
  
  const batchSize = 100;
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = docs.slice(i, i + batchSize);
    let tx = client.transaction();
    for (const id of batch) {
      tx = tx.delete(id);
    }
    await tx.commit();
    console.log(`Deleted batch ${i / batchSize + 1}`);
  }
  
  console.log('Sanity clearing complete!');
}

main().catch(console.error);
