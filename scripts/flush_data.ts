import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const KEEP_COLLECTIONS = ['user', 'session', 'account', 'verification'];

async function flushMongo() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;
  if (!uri) {
    throw new Error('MONGODB_URI is missing');
  }

  console.log('Connecting to MongoDB...');
  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db(dbName || undefined);
  console.log(`Connected to database: ${db.databaseName}`);

  const collections = await db.collections();
  for (const collection of collections) {
    const colName = collection.collectionName;
    if (KEEP_COLLECTIONS.includes(colName)) {
      console.log(`Keeping collection: ${colName}`);
      continue;
    }
    
    console.log(`Dropping collection: ${colName}...`);
    await collection.drop();
  }

  await client.close();
  console.log('MongoDB flush complete.\n');
}

async function flushSanity() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const token = process.env.SANITY_API_TOKEN;
  
  if (!projectId || !dataset || !token) {
    throw new Error('Sanity environment variables missing');
  }

  const query = encodeURIComponent(`*[_type != "system.group" && _type != "system.retention"]{_id}`);
  const url = `https://${projectId}.api.sanity.io/v2024-08-11/data/query/${dataset}?query=${query}`;
  
  console.log('Fetching documents from Sanity...');
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const json = await res.json();
  if (json.error) {
    throw new Error(`Sanity query error: ${JSON.stringify(json.error)}`);
  }
  
  const documents = json.result;
  console.log(`Found ${documents.length} documents in Sanity.`);
  
  if (documents.length === 0) {
    console.log('Sanity dataset is already empty.\n');
    return;
  }
  
  // Batch delete using Sanity mutate API
  // https://www.sanity.io/docs/http-mutations
  const mutateUrl = `https://${projectId}.api.sanity.io/v2024-08-11/data/mutate/${dataset}`;
  
  const BATCH_SIZE = 100;
  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    const batch = documents.slice(i, i + BATCH_SIZE);
    const mutations = batch.map((doc: any) => ({
      delete: { id: doc._id }
    }));
    
    console.log(`Deleting batch ${i} to ${i + batch.length - 1}...`);
    
    const mutateRes = await fetch(mutateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ mutations })
    });
    
    const mutateJson = await mutateRes.json();
    if (mutateJson.error) {
      throw new Error(`Sanity mutate error: ${JSON.stringify(mutateJson.error)}`);
    }
  }
  
  console.log('Sanity flush complete.\n');
}

async function main() {
  try {
    console.log('--- STARTING FLUSH ---');
    await flushMongo();
    await flushSanity();
    console.log('--- FLUSH SUCCESSFULLY FINISHED ---');
  } catch (error) {
    console.error('Error during flush:', error);
    process.exit(1);
  }
}

main();
