import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Pattern, UserProgress } from './models/index.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB });

  const uid = new mongoose.Types.ObjectId('6a7a0ea8d0497daed76370c2'); // arbitrary user
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const patterns = await Pattern.find().lean();
  
  // Extract all problems into a map for fast lookup
  const problemMap = new Map();
  let totalPatternProblems = 0;
  
  patterns.forEach((p: any) => {
    p.variations?.forEach((v: any) => {
      v.problems?.forEach((prob: any) => {
        if (prob._id) {
          problemMap.set(prob._id.toString(), prob);
          totalPatternProblems++;
        }
      });
    });
  });
  
  const userProgress = await UserProgress.find({ userId: uid, completed: true }).lean();
  
  let completedPatternProblems = 0;
  const difficultyMix: any = { Easy: 0, Medium: 0, Hard: 0 };
  
  userProgress.forEach((up: any) => {
    const prob = problemMap.get(up.problemId);
    if (prob) {
      completedPatternProblems++;
      if (prob.difficulty) {
        difficultyMix[prob.difficulty] = (difficultyMix[prob.difficulty] || 0) + 1;
      }
    }
  });
  
  const totalsByKind = [
    { kind: 'pattern', total: totalPatternProblems, completed: completedPatternProblems }
  ];
  
  const trend = await UserProgress.aggregate([
    { $match: { userId: uid, completed: true, completedAt: { $gte: ninetyDaysAgo } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } }, completed: { $sum: 1 } } },
    { $project: { date: '$_id', completed: 1, _id: 0 } },
    { $sort: { date: 1 } }
  ]);

  console.log({ totalsByKind, difficultyMix, trend });
  process.exit(0);
}
run();
