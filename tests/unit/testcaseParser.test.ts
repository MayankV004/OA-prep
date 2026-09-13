import { describe, it, expect } from 'vitest';
import { parseTestCasesFromText } from '@/lib/cp/testcaseParser';

describe('Competitive Programming Testcase Parser (lib/cp/testcaseParser.ts)', () => {
  it('returns empty array and warning when given empty text', () => {
    const result = parseTestCasesFromText('');
    expect(result.cases).toHaveLength(0);
    expect(result.warnings).toContain('Input text is empty.');
  });

  it('correctly parses standard === CASE === format with sample and hidden tags', () => {
    const raw = `
=== CASE 1 ===
[SAMPLE]
--- INPUT ---
5
1 2 3 4 5
--- OUTPUT ---
15
--- EXPLANATION ---
Sum of first 5 numbers

=== CASE 2 ===
[HIDDEN]
--- INPUT ---
3
10 20 30
--- OUTPUT ---
60
`;

    const { cases, warnings } = parseTestCasesFromText(raw);

    expect(warnings).toHaveLength(0);
    expect(cases).toHaveLength(2);

    expect(cases[0].input).toBe('5\n1 2 3 4 5');
    expect(cases[0].expectedOutput).toBe('15');
    expect(cases[0].isHidden).toBe(false);
    expect(cases[0].explanation).toBe('Sum of first 5 numbers');

    expect(cases[1].input).toBe('3\n10 20 30');
    expect(cases[1].expectedOutput).toBe('60');
    expect(cases[1].isHidden).toBe(true);
  });

  it('handles simplified >>> format cleanly', () => {
    const raw = `
>>> INPUT [SAMPLE]
4 7
>>> OUTPUT
11
`;
    const { cases } = parseTestCasesFromText(raw);
    expect(cases).toHaveLength(1);
    expect(cases[0].input).toBe('4 7');
    expect(cases[0].expectedOutput).toBe('11');
    expect(cases[0].isHidden).toBe(false);
  });
});
