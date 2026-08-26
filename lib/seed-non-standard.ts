import { NonStandardProblem } from '@/models';
import {
  getNonStandardCategories,
  parseProblemDifficulty,
  generateProblemUrl,
  formatProblemNotes,
} from './non-standard-dsa';

export async function seedNonStandardForUser(userId: string) {
  const categories = getNonStandardCategories();
  const docsToInsert: any[] = [];

  for (const cat of categories) {
    for (const prob of cat.problems) {
      docsToInsert.push({
        userId,
        kind: 'nonstandard',
        title: prob.name,
        bucket: cat.category,
        url: generateProblemUrl(prob.name, prob.source, prob.platform),
        difficulty: parseProblemDifficulty(prob.platform),
        notes: formatProblemNotes(prob),
        platform: prob.platform,
        tags: ['nonstandard', cat.slug],
        completed: false,
      });
    }
  }

  if (docsToInsert.length > 0) {
    await NonStandardProblem.insertMany(docsToInsert, { ordered: false }).catch(() => {});
  }
}
