import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import mongoose from 'mongoose';
import { Pattern } from '../models/pattern';
import { UserProgress } from '../models/progress';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const oldIdToProblemName: Record<string, string> = {
  // Binary Search
  '6a7e0cb9af8af26213113d70': 'Binary Search',
  '6a7e0cb9af8af26213113d71': 'Search Insert Position',
  '6a7e0cb9af8af26213113d72': 'Guess Number Higher or Lower',
  '6a7e0cb9af8af26213113d79': 'Find First and Last Position of Element in Sorted Array',
  '6a7e0cb9af8af26213113d7a': 'Search Insert Position',
  '6a7e0cb9af8af26213113d7b': 'Count of Range Sum',
  '6a7e0cb9af8af26213113d82': 'Split Array Largest Sum',
  '6a7e0cb9af8af26213113d83': 'Capacity To Ship Packages Within D Days',

  // Dynamic Programming
  '6a7e0cb9af8af26213113d04': 'Largest Rectangle after Partition',
  '6a7e0cb9af8af26213113e48': 'Jump Game VI',
  '6a7e0cb9af8af26213113e49': 'Sliding Window Maximum',
  '6a7e0cb9af8af26213113e4a': 'Minimum Cost to Cut a Stick',
  '6a7e0cb9af8af26213113e4b': 'Divide Chocolate',
  '6a7e0cb9af8af26213113e4c': 'Allocate Mailboxes',
  '6a7e0cb9af8af26213113e6f': 'Student Attendance Record II',
  '6a7e0cb9af8af26213113e70': 'Count Vowels Permutation',
  '6a7e0cb9af8af26213113e71': 'Frog Jump',
  '6a7e0cb9af8af26213113e72': 'Minimum Cost to Merge Stones',
  '6a7e0cb9af8af26213113e73': 'Number of Music Playlists',
  '6a7e0cb9af8af26213113e74': 'Strange Printer II',
  '6a7e0cbaaf8af26213114059': 'Frog Jump',
  '6a8c8ad227926620d949f620': 'Maximum Non-Negative Product in a Matrix',

  // Graph Algorithms
  '6a7e0cb9af8af26213113e7a': 'Shortest Path in Binary Matrix',
  '6a7e0cb9af8af26213113e7b': 'Rotten Oranges',
  '6a7e0cb9af8af26213113e7c': 'As Far From Land as Possible',
  '6a7e0cb9af8af26213113e7e': '01 Matrix',
  '6a7e0cb9af8af26213113e7f': 'Pacific Atlantic Water Flow',
  '6a7e0cb9af8af26213113e80': 'Walls and Gates',
  '6a7e0cb9af8af26213113e81': 'Snakes and Ladders',
  '6a7e0cb9af8af26213113e82': 'Minimum Genetic Mutation',
  '6a7e0cb9af8af26213113e83': 'Sliding Puzzle',
  '6a7e0cb9af8af26213113e85': 'Minimum Obstacle Removal to Reach Corner',

  // Trees
  '6a7e0cbaaf8af2621311416a': 'Binary Tree Paths',
  '6a7e0cbaaf8af2621311416b': 'Path Sum II',
  '6a7e0cbaaf8af2621311416c': 'Sum Root to Leaf Numbers',
  '6a7e0cbaaf8af2621311416d': 'Pseudo-Palindromic Paths in a Binary Tree',
  '6a7e0cbaaf8af2621311416e': 'Binary Tree Maximum Path Sum',
  '6a7e0cbaaf8af2621311416f': 'Insufficient Nodes in Root to Leaf Paths',
  '6a7e0cbaaf8af26213114171': 'Lowest Common Ancestor of a Binary Tree',
  '6a7e0cbaaf8af26213114172': 'Lowest Common Ancestor of a Binary Search Tree',
  '6a7e0cbaaf8af26213114173': 'Maximum Difference Between Node and Ancestor',
  '6a7e0cbaaf8af26213114174': 'Lowest Common Ancestor of Deepest Leaves',
  '6a7e0cbaaf8af26213114177': 'Validate Binary Search Tree',
  '6a7e0cbaaf8af26213114178': 'Range Sum of BST',
  '6a7e0cbaaf8af26213114179': 'Minimum Absolute Difference in BST',
  '6a7e0cbaaf8af2621311417a': 'Insert into a Binary Search Tree',
  '6a7e0cbaaf8af2621311417b': 'Delete Node in a BST',
  '6a7e0cbaaf8af2621311417c': 'Kth Smallest Element in a BST',
  '6a7e0cbaaf8af2621311417d': 'Convert BST to Greater Tree',
  '6a7e0cbaaf8af2621311417e': 'Recover Binary Search Tree',
  '6a7e0cbaaf8af26213114180': 'House Robber III',
  '6a7e0cbaaf8af26213114181': 'Binary Tree Cameras'
};

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI is missing');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB || 'placementdeck'
  });
  console.log('Connected to MongoDB.');

  const db = mongoose.connection.db!;
  const rawProgressList = await db.collection('userprogresses').find().toArray();
  console.log(`Found ${rawProgressList.length} UserProgress records.`);

  // 1. Create a local backup of current userprogresses
  const backupDir = path.join(process.cwd(), 'data', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  const backupFile = path.join(backupDir, `userprogress-${Date.now()}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(rawProgressList, null, 2));
  console.log(`✅ Saved backup to ${backupFile}`);

  // 2. Fetch current patterns and index problems by name
  const patterns: any[] = await Pattern.find().lean();
  const probMap = new Map<string, string>();
  for (const pat of patterns) {
    for (const v of (pat.variations || [])) {
      for (const pr of (v.problems || [])) {
        if (!probMap.has(pr.name)) {
          probMap.set(pr.name, pr._id.toString());
        }
      }
    }
  }

  // 3. Remap each progress record
  let remapped = 0;
  let skipped = 0;

  for (const prog of rawProgressList) {
    const probName = oldIdToProblemName[prog.problemId];
    if (probName && probMap.has(probName)) {
      const newProblemId = probMap.get(probName)!;

      if (prog.problemId !== newProblemId) {
        // Check if a document already exists with (userId, newProblemId)
        const existingWithNewId = await db.collection('userprogresses').findOne({
          userId: prog.userId,
          problemId: newProblemId
        });

        if (existingWithNewId) {
          // Merge fields (prioritize completed: true and non-empty notes)
          await db.collection('userprogresses').updateOne(
            { _id: existingWithNewId._id },
            {
              $set: {
                completed: existingWithNewId.completed || prog.completed,
                completedAt: existingWithNewId.completedAt || prog.completedAt,
                revision: existingWithNewId.revision || prog.revision,
                userNotes: existingWithNewId.userNotes || prog.userNotes || prog.notes || '',
                notes: existingWithNewId.notes || prog.notes || ''
              }
            }
          );
          // Remove old duplicate doc
          await db.collection('userprogresses').deleteOne({ _id: prog._id });
        } else {
          // Simply update problemId to newProblemId
          await db.collection('userprogresses').updateOne(
            { _id: prog._id },
            { $set: { problemId: newProblemId } }
          );
        }

        console.log(`✅ Remapped: "${probName}" (${prog.problemId} -> ${newProblemId}) [completed: ${prog.completed}]`);
        remapped++;
      }
    } else {
      skipped++;
    }
  }

  console.log(`\n🎉 Restoration Complete!`);
  console.log(`   Remapped: ${remapped} records`);
  console.log(`   Unchanged / Skipped: ${skipped} records`);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
