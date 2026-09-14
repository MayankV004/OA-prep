import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import mongoose from 'mongoose';
import { Pattern } from '../models/pattern';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI is missing');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB || 'placementdeck'
  });
  console.log('Connected to MongoDB.');

  const dsaDir = path.join(process.cwd(), 'data', 'pattern-dsa');
  const files = fs.readdirSync(dsaDir).filter(f => f.endsWith('.json') && !f.startsWith('_'));

  console.log(`Found ${files.length} JSON files. Seeding...`);
  
  for (const file of files) {
    const patternSlug = file.replace('.json', '');
    const filePath = path.join(dsaDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    console.log(`Processing pattern: ${data.pattern}...`);
    
    // Fetch existing pattern to preserve subdocument _ids and protect user progress
    const existingPattern: any = await Pattern.findOne({ slug: patternSlug }).lean();
    const existingVarMap = new Map<string, mongoose.Types.ObjectId>();
    const existingProbMap = new Map<string, mongoose.Types.ObjectId>();

    if (existingPattern && existingPattern.variations) {
      for (const ev of existingPattern.variations) {
        const vName = ev.variation || ev.title;
        if (vName && ev._id) {
          existingVarMap.set(vName, ev._id);
        }
        for (const ep of (ev.problems || [])) {
          if (ep.name && ep._id) {
            existingProbMap.set(`${vName}:::${ep.name}`, ep._id);
            if (!existingProbMap.has(ep.name)) {
              existingProbMap.set(ep.name, ep._id);
            }
          }
        }
      }
    }

    const doc = {
      title: data.pattern,
      slug: patternSlug,
      description: data.description || '',
      timeComplexity: data.timeComplexity || '',
      spaceComplexity: data.spaceComplexity || '',
      useCases: data.useCases || [],
      concept: data.concept || '',
      templateCode: data.templateCode || '',
      explanation: data.explanation || '',
      important_details: data.important_details || [],
      other_relevant_details: data.other_relevant_details || '',
      variations: (data.variations || []).map((v: any) => {
        const varTitle = v.variation || v.title;
        const existingVarId = existingVarMap.get(varTitle);
        return {
          ...(existingVarId ? { _id: existingVarId } : {}),
          variation: varTitle,
          description: v.description || v.concept || '',
          important_details: v.important_details || [],
          template_code: v.template_code || v.templateCode || '',
          other_relevant_details: v.other_relevant_details || '',
          problems: (v.problems || []).filter((p: any) => p.name).map((p: any) => {
            const existingProbId = existingProbMap.get(`${varTitle}:::${p.name}`) || existingProbMap.get(p.name);
            return {
              ...(existingProbId ? { _id: existingProbId } : {}),
              name: p.name,
              difficulty: p.difficulty,
              platform: p.platform,
              link: p.link,
              priority: p.priority,
              company_tags: p.company_tags || []
            };
          })
        };
      })
    };

    try {
      await Pattern.findOneAndUpdate(
        { slug: patternSlug },
        doc,
        { upsert: true, returnDocument: 'after' }
      );
      console.log(`✅ Upserted Pattern: ${data.pattern}`);
    } catch (err) {
      console.error(`❌ Error migrating ${data.pattern}:`, err);
    }
  }
  
  console.log('MongoDB Seed complete!');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
