const fs = require('fs');
const path = require('path');

const dir = 'content/patterns';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'));

const outDir = 'data/patterns';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

let exportsList = [];

files.forEach(file => {
  const content = fs.readFileSync(path.join(dir, file), 'utf-8');
  const slug = file.replace('.mdx', '');
  
  const metaMatch = content.match(/export const metadata = (\{[\s\S]*?\});/);
  if (!metaMatch) return;
  
  let metadata;
  try {
    metadata = eval('(' + metaMatch[1] + ')');
  } catch (e) {
    console.error("Eval failed for", slug);
    return;
  }
  
  const conceptMatch = content.match(/## Concept\n+([\s\S]*?)(?=## Template)/);
  const concept = conceptMatch ? conceptMatch[1].trim() : '';
  
  const explMatch = content.match(/## When to Use\n+([\s\S]*?)(?=## |\Z)/);
  const explanation = explMatch ? explMatch[1].trim() : '';
  
  const tempMatch = content.match(/## Template\n+([\s\S]*?)(?=## When to Use)/);
  const templatesStr = tempMatch ? tempMatch[1] : '';
  
  const sections = templatesStr.split('### ').filter(s => s.trim());
  
  const baseCodeMatch = sections.length > 0 ? sections[0].match(/```(java|python)\n([\s\S]*?)```/) : null;
  const baseTemplateCode = baseCodeMatch ? baseCodeMatch[2].trim() : '';
  
  const variations = (metadata.variations || []).map(v => {
    let code = '';
    for (let i = 1; i < sections.length; i++) {
      const secTitle = sections[i].split('\n')[0].toLowerCase();
      const vWords = v.title.toLowerCase().split(/[ \/]+/);
      if (vWords.some(w => w.length > 3 && secTitle.includes(w))) {
        const m = sections[i].match(/```(java|python)\n([\s\S]*?)```/);
        if (m) code = m[2].trim();
        break;
      }
    }
    if (!code) {
       if (sections.length > 1) {
           const m = sections[1].match(/```(java|python)\n([\s\S]*?)```/);
           if (m) code = m[2].trim();
       } else {
           code = baseTemplateCode;
       }
    }
    
    return {
      id: v.id,
      title: v.title,
      concept: v.description,
      templateCode: code
    };
  });
  
  const patternData = {
    slug,
    title: metadata.title,
    description: metadata.description,
    timeComplexity: metadata.timeComplexity,
    spaceComplexity: metadata.spaceComplexity,
    useCases: metadata.useCases || [],
    concept,
    templateCode: baseTemplateCode,
    explanation,
    variations
  };
  
  const tsCode = `import { PatternData } from '@/types/pattern';\n\nexport const ${slug.replace(/-/g, '_')}: PatternData = ${JSON.stringify(patternData, null, 2)};\n`;
  
  fs.writeFileSync(path.join(outDir, `${slug}.ts`), tsCode);
  exportsList.push(`export * from './${slug}';`);
});

fs.writeFileSync(path.join(outDir, 'index.ts'), exportsList.join('\n') + '\n');
console.log("Done");
