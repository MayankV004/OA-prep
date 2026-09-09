export interface CPTestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  explanation?: string;
}

export interface ParseResult {
  cases: CPTestCase[];
  warnings: string[];
}

/**
 * Normalizes line endings to \n and trims leading/trailing empty lines
 */
function cleanContent(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
}

/**
 * Parses a competitive programming testcase text file (.txt).
 *
 * Supported formats:
 *
 * 1. Standard Delimited Format:
 * =============================
 * === CASE 1 ===
 * [SAMPLE]
 * --- INPUT ---
 * 5
 * 1 2 3 4 5
 * --- OUTPUT ---
 * 15
 * --- EXPLANATION ---
 * Sum of first 5 natural numbers
 *
 * === CASE 2 ===
 * [HIDDEN]
 * --- INPUT ---
 * 3
 * 10 20 30
 * --- OUTPUT ---
 * 60
 *
 * 2. Simplified Arrow Format:
 * ===========================
 * >>> INPUT [SAMPLE]
 * 5
 * 1 2 3 4 5
 * >>> OUTPUT
 * 15
 *
 * 3. Minimal Section Format:
 * ==========================
 * --- INPUT ---
 * 5
 * 1 2 3 4 5
 * --- OUTPUT ---
 * 15
 */
export function parseTestCasesFromText(rawText: string): ParseResult {
  const warnings: string[] = [];
  const cases: CPTestCase[] = [];

  if (!rawText || !rawText.trim()) {
    return { cases: [], warnings: ['Input text is empty.'] };
  }

  const normalized = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Check if standard "=== CASE" delimiter is used
  if (/^===\s*CASE/im.test(normalized)) {
    const rawChunks = normalized.split(/^===\s*CASE\s*.*$/im);

    // Index 0 is preamble/comments before the first === CASE === delimiter
    for (let i = 1; i < rawChunks.length; i++) {
      const chunk = rawChunks[i].trim();
      if (!chunk) continue;

      const isSample = /\[\s*(SAMPLE|VISIBLE|SAMPLE TEST)\s*\]/i.test(chunk);
      const isExplicitHidden = /\[\s*HIDDEN\s*\]/i.test(chunk);

      // Extract input
      let input = '';
      let output = '';
      let explanation = '';

      const inputMatch = chunk.match(/---\s*INPUT\s*---([\s\S]*?)(?=---\s*(?:OUTPUT|EXPECTED|EXPLANATION)\s*---|$)/i);
      const outputMatch = chunk.match(/---\s*(?:OUTPUT|EXPECTED)\s*---([\s\S]*?)(?=---\s*EXPLANATION\s*---|$)/i);
      const expMatch = chunk.match(/---\s*EXPLANATION\s*---([\s\S]*)$/i);

      if (inputMatch) {
        input = cleanContent(inputMatch[1]);
      }
      if (outputMatch) {
        output = cleanContent(outputMatch[1]);
      }
      if (expMatch) {
        explanation = cleanContent(expMatch[1]);
      }

      if (!input && !output) {
        warnings.push(`Case chunk #${i} did not contain valid --- INPUT --- or --- OUTPUT --- sections.`);
        continue;
      }

      // Determine visibility: if explicitly marked, honor it; otherwise default first 2 to visible sample
      let isHidden = true;
      if (isSample) {
        isHidden = false;
      } else if (isExplicitHidden) {
        isHidden = true;
      } else {
        isHidden = cases.length >= 2;
      }

      cases.push({
        input,
        expectedOutput: output,
        isHidden,
        explanation: explanation || undefined,
      });
    }
  } else if (/>>>\s*(?:INPUT|OUTPUT)/i.test(normalized)) {
    // Arrow-delimited format (>>> INPUT ... >>> OUTPUT)
    const blocks = normalized.split(/(?=>>>\s*INPUT)/i);

    for (const block of blocks) {
      const trimmed = block.trim();
      if (!trimmed) continue;

      const isSample = /\[\s*(SAMPLE|VISIBLE)\s*\]/i.test(trimmed);
      const isExplicitHidden = /\[\s*HIDDEN\s*\]/i.test(trimmed);

      const parts = trimmed.split(/>>>\s*(?:OUTPUT|EXPECTED)/i);
      if (parts.length >= 2) {
        const inputPart = parts[0].replace(/>>>\s*INPUT(\s*\[[^\]]+\])?/i, '');
        const outputPart = parts[1];

        const input = cleanContent(inputPart);
        const output = cleanContent(outputPart);

        let isHidden = true;
        if (isSample) isHidden = false;
        else if (isExplicitHidden) isHidden = true;
        else isHidden = cases.length >= 2;

        cases.push({
          input,
          expectedOutput: output,
          isHidden,
        });
      }
    }
  } else if (/---\s*INPUT\s*---/i.test(normalized)) {
    // Minimal section format
    const blocks = normalized.split(/(?=---\s*INPUT\s*---)/i);

    for (const block of blocks) {
      const trimmed = block.trim();
      if (!trimmed) continue;

      const isSample = /\[\s*(SAMPLE|VISIBLE)\s*\]/i.test(trimmed);
      const isExplicitHidden = /\[\s*HIDDEN\s*\]/i.test(trimmed);

      const parts = trimmed.split(/---\s*(?:OUTPUT|EXPECTED)\s*---/i);
      if (parts.length >= 2) {
        const inputPart = parts[0].replace(/---\s*INPUT\s*---(\s*\[[^\]]+\])?/i, '');
        const outputPart = parts[1];

        const input = cleanContent(inputPart);
        const output = cleanContent(outputPart);

        let isHidden = true;
        if (isSample) isHidden = false;
        else if (isExplicitHidden) isHidden = true;
        else isHidden = cases.length >= 2;

        cases.push({
          input,
          expectedOutput: output,
          isHidden,
        });
      }
    }
  } else {
    warnings.push('No recognized CP delimiters found (=== CASE, >>> INPUT, or --- INPUT ---).');
  }

  return { cases, warnings };
}

/**
 * Formats an array of testcases into standard Competitive Programming .txt format.
 */
export function formatTestCasesToText(cases: CPTestCase[]): string {
  if (!cases || cases.length === 0) {
    return `# Competitive Programming Test Suite File (.txt)\n# Add test cases using the format below:\n\n=== CASE 1 ===\n[SAMPLE]\n--- INPUT ---\n5\n1 2 3 4 5\n--- OUTPUT ---\n15\n\n=== CASE 2 ===\n[HIDDEN]\n--- INPUT ---\n3\n10 20 30\n--- OUTPUT ---\n60\n`;
  }

  const sections: string[] = [
    '# =========================================================',
    `# CP Assessment Test Suite (${cases.length} Total Cases)`,
    '# Delimiters: === CASE N ===, [SAMPLE] or [HIDDEN]',
    '# =========================================================\n',
  ];

  cases.forEach((tc, idx) => {
    const caseNum = idx + 1;
    const tag = tc.isHidden ? '[HIDDEN]' : '[SAMPLE]';

    let caseBlock = `=== CASE ${caseNum} ===\n${tag}\n--- INPUT ---\n${tc.input || ''}\n--- OUTPUT ---\n${tc.expectedOutput || ''}`;

    if (tc.explanation && tc.explanation.trim()) {
      caseBlock += `\n--- EXPLANATION ---\n${tc.explanation.trim()}`;
    }

    sections.push(caseBlock);
  });

  return sections.join('\n\n') + '\n';
}

/**
 * Triggers a browser download of a text file.
 */
export function downloadTextFile(content: string, filename: string): void {
  if (typeof window === 'undefined') return;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.txt') ? filename : `${filename}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
