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

async function main() {
  try {
    console.log('--- STARTING FLUSH ---');
    await flushMongo();
    console.log('--- FLUSH SUCCESSFULLY FINISHED ---');
  } catch (error) {
    console.error('Error during flush:', error);
    process.exit(1);
  }
}

main();
