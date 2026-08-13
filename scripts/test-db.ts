import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import dbConnect from '../lib/db';
import { Pattern } from '../models/pattern';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  await dbConnect();
  console.log('Connected to MongoDB via lib/db.ts.');

  const count = await Pattern.countDocuments();
  console.log(`Total DSA Patterns via lib/db: ${count}`);

  process.exit(0);
}

main().catch(console.error);
