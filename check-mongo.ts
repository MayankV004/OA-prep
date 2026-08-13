import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
mongoose.connect(process.env.MONGODB_URI as string);
const schema = new mongoose.Schema({ title: String, url: String, difficulty: String, pattern: String, variation: String }, { collection: 'problems' });
const Problem = mongoose.model('Problem', schema);
async function run() {
  const problems = await Problem.find({ kind: 'pattern' });
  console.log(`Found ${problems.length} pattern problems`);
  if (problems.length > 0) {
    console.log(problems[0]);
  }
  process.exit(0);
}
run();
