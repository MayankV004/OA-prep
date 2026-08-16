import * as dotenv from 'dotenv';
import * as path from 'path';
import mongoose from 'mongoose';
import { Group } from '../models/group';
import { Topic } from '../models/topic';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function clearAdvanced() {
  if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI is missing');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB || 'placementdeck',
  });

  const advancedGroups = await Group.find({ kind: 'advanced' });
  const groupIds = advancedGroups.map((g) => g._id);

  const topicsDeleted = await Topic.deleteMany({ groupId: { $in: groupIds } });
  const groupsDeleted = await Group.deleteMany({ kind: 'advanced' });

  console.log(`Cleared ${groupsDeleted.deletedCount} advanced tracks and ${topicsDeleted.deletedCount} topic notes.`);
  process.exit(0);
}

clearAdvanced().catch((err) => {
  console.error(err);
  process.exit(1);
});
