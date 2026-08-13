import { createClient } from 'next-sanity';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Setup Sanity client with a write token
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-08-11',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function main() {
  if (!process.env.SANITY_API_TOKEN) {
    console.error('Error: SANITY_API_TOKEN is missing in .env.local');
    process.exit(1);
  }

  const dsaDir = path.join(process.cwd(), 'dsa');
  const files = fs.readdirSync(dsaDir).filter(f => f.endsWith('.json') && !f.startsWith('_') && f !== 'index.json' && f !== 'all-problems.json');

  console.log(`Found ${files.length} JSON files in dsa/ directory.`);

  for (const file of files) {
    const patternSlug = file.replace('.json', '');
    console.log(`\nProcessing pattern: ${patternSlug}`);

    // Fetch the pattern from Sanity
    const sanityPattern = await client.fetch(`*[_type == "pattern" && slug.current == $slug][0]`, { slug: patternSlug });

    if (!sanityPattern) {
      console.warn(`⚠️ Pattern '${patternSlug}' not found in Sanity. Skipping file: ${file}`);
      continue;
    }

    const filePath = path.join(dsaDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    if (!data.variations || !Array.isArray(data.variations)) {
      console.warn(`⚠️ No variations found in ${file}. Skipping.`);
      continue;
    }

    let count = 0;
    const updatedVariations = sanityPattern.variations ? [...sanityPattern.variations] : [];

    for (const variation of data.variations) {
      const problemsToMigrate = [];
      if (variation.problems && Array.isArray(variation.problems)) {
        problemsToMigrate.push(...variation.problems);
      }
      if (variation.solved && Array.isArray(variation.solved)) {
        problemsToMigrate.push(...variation.solved);
      }

      if (problemsToMigrate.length === 0) continue;

      const problemRefs = [];

      for (const prob of problemsToMigrate) {
        const title = prob.title || prob.name;
        const url = prob.url || prob.link;

        if (!title || !url) {
          console.warn(`⚠️ Problem missing title or url in ${file}. Skipping.`, prob);
          continue;
        }

        const docId = `problem-${Buffer.from(url).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 32)}`;

        const patchSet: any = {
          title: title,
          url: url,
          difficulty: prob.difficulty || 'Medium',
          problemType: 'DSA',
        };

        if (prob.company_tags) {
          patchSet.companyTags = Array.isArray(prob.company_tags) ? prob.company_tags : [prob.company_tags];
        }

        await client.transaction()
          .createIfNotExists({ _id: docId, _type: 'problem' })
          .patch(docId, p => p.set(patchSet))
          .commit();
        problemRefs.push({ _type: 'reference', _key: docId, _ref: docId });
        count++;
      }

      const targetVarId = variation.id || variation.name;
      const sanityVarIndex = updatedVariations.findIndex((v: any) => v.id === targetVarId || v.title === targetVarId);

      if (sanityVarIndex !== -1) {
        updatedVariations[sanityVarIndex] = {
          ...updatedVariations[sanityVarIndex],
          problems: problemRefs
        };
      }
    }

    if (count > 0) {
      await client.patch(sanityPattern._id).set({ variations: updatedVariations }).commit();
      console.log(`✅ Migrated ${count} problems and patched pattern: ${sanityPattern.title}`);
    }
  }

  console.log('\n🎉 Problem migration complete!');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
