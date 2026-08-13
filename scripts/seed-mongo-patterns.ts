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
      variations: (data.variations || []).map((v: any) => ({
        variation: v.variation || v.title,
        description: v.description || v.concept || '',
        important_details: v.important_details || [],
        template_code: v.template_code || v.templateCode || '',
        other_relevant_details: v.other_relevant_details || '',
        problems: (v.problems || []).filter((p: any) => p.name).map((p: any) => ({
          name: p.name,
          difficulty: p.difficulty,
          platform: p.platform,
          link: p.link,
          priority: p.priority,
          company_tags: p.company_tags || []
        }))
      }))
    };

    try {
      await Pattern.findOneAndUpdate(
        { slug: patternSlug },
        doc,
        { upsert: true, new: true }
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
