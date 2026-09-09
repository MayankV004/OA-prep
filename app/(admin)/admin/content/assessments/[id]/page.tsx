'use client';

import { use, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  Code2,
  FileCode,
  Layers,
  Plus,
  Save,
  Shield,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Timer,
  BookOpen,
  FileUp,
  FileDown,
  FileText,
  RefreshCw,
  Terminal,
  UploadCloud,
} from 'lucide-react';
import { PageHeading, Text } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  parseTestCasesFromText,
  formatTestCasesToText,
  downloadTextFile,
} from '@/lib/cp/testcaseParser';

interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  explanation?: string;
}

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  score: number;
  patternTag: string;
  starterCode: {
    cpp: string;
    python: string;
    java: string;
  };
  testCases: TestCase[];
}

interface AssessmentFormData {
  title: string;
  slug: string;
  company: string;
  role: string;
  description: string;
  durationMinutes: number;
  passingScore: number;
  isProOnly: boolean;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  companyInstructions: string[];
  problems: Problem[];
}

const DEFAULT_STARTER_CPP = `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

class Solution {
public:
    // Write your algorithmic solution here
};
`;

const DEFAULT_STARTER_PY = `class Solution:
    def solve(self, *args):
        # Write your algorithmic solution here
        pass
`;

const DEFAULT_STARTER_JAVA = `import java.util.*;
import java.io.*;

class Solution {
    // Write your algorithmic solution here
}
`;

export default function AdminAssessmentEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const isNew = id === 'new';

  const [formData, setFormData] = useState<AssessmentFormData>({
    title: '',
    slug: '',
    company: '',
    role: '',
    description: '',
    durationMinutes: 60,
    passingScore: 70,
    isProOnly: true,
    difficulty: 'Medium',
    companyInstructions: [
      'Timed assessment emulating real enterprise interview standards.',
      'Hidden test cases verify edge cases, large bounds, and optimal time complexity.',
      'Code execution runs inside isolated Linux sandbox containers.',
    ],
    problems: [
      {
        id: 'problem-1',
        title: 'Initial Problem Title',
        description: 'Provide detailed problem description, input/output formats, and constraints here.',
        difficulty: 'Medium',
        score: 50,
        patternTag: 'sliding-window',
        starterCode: {
          cpp: DEFAULT_STARTER_CPP,
          python: DEFAULT_STARTER_PY,
          java: DEFAULT_STARTER_JAVA,
        },
        testCases: [
          { input: '5\\n1 2 3 4 5', expectedOutput: '15', isHidden: false, explanation: 'Sample visible testcase' },
          { input: '3\\n10 20 30', expectedOutput: '60', isHidden: true, explanation: 'Hidden boundary testcase' },
        ],
      },
    ],
  });

  const [activeProblemIdx, setActiveProblemIdx] = useState(0);
  const [activeLangTab, setActiveLangTab] = useState<'cpp' | 'python' | 'java'>('cpp');
  const [testSuiteMode, setTestSuiteMode] = useState<'cards' | 'raw_txt'>('cards');
  const [rawTxtInput, setRawTxtInput] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: existingData, isLoading } = useQuery({
    queryKey: ['admin', 'assessment', id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/assessments/${id}`);
      if (!res.ok) throw new Error('Failed to load assessment');
      return res.json();
    },
    enabled: !isNew,
  });

  useEffect(() => {
    if (existingData?.assessment) {
      const a = existingData.assessment;
      setFormData({
        title: a.title || '',
        slug: a.slug || '',
        company: a.company || '',
        role: a.role || '',
        description: a.description || '',
        durationMinutes: a.durationMinutes || 60,
        passingScore: a.passingScore || 70,
        isProOnly: Boolean(a.isProOnly),
        difficulty: a.difficulty || 'Medium',
        companyInstructions: a.companyInstructions?.length ? a.companyInstructions : [],
        problems: a.problems?.length ? a.problems : [],
      });
    }
  }, [existingData]);

  // Synchronize raw text when entering raw_txt mode or switching problem
  useEffect(() => {
    const current = formData.problems[activeProblemIdx];
    if (current && testSuiteMode === 'raw_txt') {
      setRawTxtInput(formatTestCasesToText(current.testCases));
    }
  }, [activeProblemIdx, testSuiteMode]);

  const saveMutation = useMutation({
    mutationFn: async (payload: AssessmentFormData) => {
      const url = isNew ? '/api/admin/assessments' : `/api/admin/assessments/${id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to save assessment');
      return json;
    },
    onSuccess: () => {
      toast.success(isNew ? 'Company OA created successfully!' : 'Company OA updated successfully!');
      router.push('/admin/content/assessments');
    },
    onError: (err: any) => {
      toast.error('Failed to save assessment', { description: err.message });
    },
  });

  const handleAutoSlug = () => {
    if (!formData.company && !formData.title) return;
    const base = `${formData.company}-${formData.title}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setFormData((prev) => ({ ...prev, slug: base }));
  };

  const handleAddInstruction = () => {
    setFormData((prev) => ({
      ...prev,
      companyInstructions: [...prev.companyInstructions, 'New assessment instruction or proctoring guideline.'],
    }));
  };

  const handleRemoveInstruction = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      companyInstructions: prev.companyInstructions.filter((_, i) => i !== idx),
    }));
  };

  const handleAddProblem = () => {
    const newProb: Problem = {
      id: `p-${Date.now()}`,
      title: 'New Problem Title',
      description: '### Problem Description\n\nGiven an array of integers...',
      difficulty: 'Medium',
      score: 50,
      patternTag: 'sliding-window',
      starterCode: {
        cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}',
        python: 'import sys\n\ndef solve():\n    pass\n\nif __name__ == "__main__":\n    solve()',
        java: 'import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n    }\n}',
      },
      testCases: [
        { input: '5\n1 2 3 4 5', expectedOutput: '15', isHidden: false, explanation: 'Sample visible testcase' },
        { input: '3\n10 20 30', expectedOutput: '60', isHidden: true, explanation: 'Hidden boundary testcase' },
      ],
    };
    setFormData((prev) => ({
      ...prev,
      problems: [...prev.problems, newProb],
    }));
    setActiveProblemIdx(formData.problems.length);
  };

  const handleRemoveProblem = (idx: number) => {
    if (formData.problems.length <= 1) {
      toast.error('An assessment must have at least one question.');
      return;
    }
    const nextProblems = formData.problems.filter((_, i) => i !== idx);
    setFormData((prev) => ({ ...prev, problems: nextProblems }));
    setActiveProblemIdx(Math.max(0, idx - 1));
  };

  const currentProblem = formData.problems[activeProblemIdx];

  const updateCurrentProblem = (partial: Partial<Problem>) => {
    setFormData((prev) => {
      const nextProblems = [...prev.problems];
      nextProblems[activeProblemIdx] = {
        ...nextProblems[activeProblemIdx],
        ...partial,
      };
      return { ...prev, problems: nextProblems };
    });
  };

  const handleAddTestCase = () => {
    if (!currentProblem) return;
    const newTestCase: TestCase = {
      input: '',
      expectedOutput: '',
      isHidden: true,
      explanation: '',
    };
    updateCurrentProblem({
      testCases: [...currentProblem.testCases, newTestCase],
    });
  };

  const handleRemoveTestCase = (tcIdx: number) => {
    if (!currentProblem) return;
    updateCurrentProblem({
      testCases: currentProblem.testCases.filter((_, i) => i !== tcIdx),
    });
  };

  // Upload .txt testcases file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentProblem) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      const { cases, warnings } = parseTestCasesFromText(text);
      if (cases.length === 0) {
        toast.error('Could not parse any test cases from file.', {
          description: warnings.join('; ') || 'Please use standard CP format: === CASE 1 ===, --- INPUT ---, --- OUTPUT ---',
        });
        return;
      }
      updateCurrentProblem({ testCases: cases });
      setRawTxtInput(text);
      const samples = cases.filter((c) => !c.isHidden).length;
      const hidden = cases.length - samples;
      toast.success(`Imported ${cases.length} test cases from "${file.name}"!`, {
        description: `${samples} visible samples, ${hidden} hidden evaluation tests.`,
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  // Download testcases as .txt file
  const handleDownloadTxt = () => {
    if (!currentProblem || currentProblem.testCases.length === 0) {
      toast.error('No test cases to export.');
      return;
    }
    const text = formatTestCasesToText(currentProblem.testCases);
    const slug = formData.slug || 'problem';
    downloadTextFile(text, `${slug}_problem_${activeProblemIdx + 1}_testcases.txt`);
    toast.success('Test suite exported as .txt file!');
  };

  // Parse and sync raw text from the raw_txt editor
  const handleSyncRawTxt = () => {
    if (!currentProblem) return;
    const { cases, warnings } = parseTestCasesFromText(rawTxtInput);
    if (cases.length === 0) {
      toast.error('Failed to parse test cases from text.', {
        description: warnings.join('; ') || 'Ensure === CASE 1 ===, --- INPUT ---, --- OUTPUT --- are used.',
      });
      return;
    }
    updateCurrentProblem({ testCases: cases });
    const samples = cases.filter((c) => !c.isHidden).length;
    const hidden = cases.length - samples;
    toast.success(`Synchronized ${cases.length} test cases (${samples} sample, ${hidden} hidden)!`);
  };

  // Inject CP standard I/O starter templates
  const handleLoadCpTemplates = () => {
    if (!currentProblem) return;
    updateCurrentProblem({
      starterCode: {
        cpp: `#include <bits/stdc++.h>
using namespace std;

void solve() {
    // Fast I/O: read from standard input (cin)
    int n;
    if (!(cin >> n)) return;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];

    // Compute answer and write to standard output (cout)
    long long sum = 0;
    for (int x : a) sum += x;
    cout << sum << "\\n";
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    solve();
    return 0;
}`,
        python: `import sys

def solve():
    # Fast I/O: read all tokens from standard input (stdin)
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    nums = [int(x) for x in input_data[1:n+1]]

    # Compute and print standard output (stdout)
    print(sum(nums))

if __name__ == '__main__':
    solve()`,
        java: `import java.io.*;
import java.util.*;

public class Solution {
    public static void main(String[] args) throws Exception {
        // Fast I/O with BufferedReader
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null || line.trim().isEmpty()) return;
        int n = Integer.parseInt(line.trim());

        String[] parts = br.readLine().trim().split("\\\\s+");
        long sum = 0;
        for (int i = 0; i < n; i++) {
            sum += Long.parseLong(parts[i]);
        }
        System.out.println(sum);
    }
}`,
      },
    });
    toast.success('Injected CP standard I/O starter templates (cin/cout, stdin, BufferedReader)!');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.company) {
      toast.error('Please fill in Title, Slug, and Company name.');
      return;
    }
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Loading assessment definition...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/content/assessments"
            className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="size-3.5 mr-1" />
            Back to Company OAs
          </Link>
          <PageHeading
            title={isNew ? 'Create Company Assessment' : `Edit: ${formData.title || 'OA'}`}
            description="Configure assessment metadata, instructions, problem statements, starter codes, and test cases."
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            render={<Link href="/admin/content/assessments" />}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={saveMutation.isPending}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold h-10 px-6 rounded-xl shadow-xs"
          >
            <Save className="size-4 mr-2" />
            {saveMutation.isPending ? 'Saving...' : 'Save Assessment'}
          </Button>
        </div>
      </div>

      {/* ── Top Level Metadata Card ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Timer className="size-4 text-emerald-500" />
            General Information & Target Company
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Target Company *</Label>
              <Input
                placeholder="e.g. Amazon, Google, Uber"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Target Role *</Label>
              <Input
                placeholder="e.g. SDE-1 Campus & Off-Campus"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Assessment Title *</Label>
              <Input
                placeholder="e.g. Amazon SDE-1 Online Assessment Simulation"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">URL Slug *</Label>
                <button
                  type="button"
                  onClick={handleAutoSlug}
                  className="text-2xs text-emerald-600 dark:text-emerald-400 hover:underline font-mono"
                >
                  Generate Slug
                </button>
              </div>
              <Input
                placeholder="e.g. amazon-sde1-oa"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Brief Description</Label>
            <Textarea
              rows={2}
              placeholder="Candidate-facing briefing explaining what topics and formats this OA tests..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Duration (Minutes)</Label>
              <Input
                type="number"
                min={10}
                max={300}
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Passing Score (%)</Label>
              <Input
                type="number"
                min={10}
                max={100}
                value={formData.passingScore}
                onChange={(e) => setFormData({ ...formData, passingScore: Number(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Difficulty</Label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                className="w-full h-10 rounded-lg bg-surface-sunken px-3 text-sm text-foreground outline-none border border-border"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="flex flex-col justify-center space-y-2 pt-4 sm:pt-0">
              <div className="flex items-center space-x-2">
                <Switch
                  id="pro-toggle"
                  checked={formData.isProOnly}
                  onCheckedChange={(checked) => setFormData({ ...formData, isProOnly: checked })}
                />
                <Label htmlFor="pro-toggle" className="text-xs font-semibold cursor-pointer">
                  Pro Tier Only
                </Label>
              </div>
              <span className="text-2xs text-muted-foreground">
                {formData.isProOnly ? 'Locked for Free users' : 'Available on Free tier'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Company Instructions Section ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <BookOpen className="size-4 text-emerald-500" />
            Company Test Rules & Proctoring Notes
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddInstruction}
            className="h-8 text-xs font-semibold"
          >
            <Plus className="size-3.5 mr-1" />
            Add Rule
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.companyInstructions.map((instruction, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground w-6 shrink-0">{idx + 1}.</span>
              <Input
                value={instruction}
                onChange={(e) => {
                  const updated = [...formData.companyInstructions];
                  updated[idx] = e.target.value;
                  setFormData({ ...formData, companyInstructions: updated });
                }}
                className="text-xs"
              />
              <button
                type="button"
                onClick={() => handleRemoveInstruction(idx)}
                className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Assessment Problems Suite Builder ── */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Layers className="size-4 text-emerald-500" />
              Problem Suite ({formData.problems.length} {formData.problems.length === 1 ? 'task' : 'tasks'})
            </CardTitle>
            <Text size="micro" tone="muted">
              Select or add questions included in this timed assessment.
            </Text>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddProblem}
            className="h-8 text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
          >
            <Plus className="size-3.5 mr-1" />
            Add Another Problem
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Problem Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border/50">
            {formData.problems.map((prob, idx) => (
              <div key={idx} className="flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveProblemIdx(idx)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeProblemIdx === idx
                      ? 'bg-emerald-500 text-black shadow-xs'
                      : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Q{idx + 1}: {prob.title || 'Untitled'}
                </button>
                {formData.problems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveProblem(idx)}
                    title="Delete Problem"
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors -ml-1.5"
                  >
                    <Trash2 className="size-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {currentProblem && (
            <div className="space-y-5">
              {/* Problem Metadata Row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs font-semibold">Problem Title *</Label>
                  <Input
                    value={currentProblem.title}
                    onChange={(e) => updateCurrentProblem({ title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Internal ID / Slug *</Label>
                  <Input
                    value={currentProblem.id}
                    onChange={(e) => updateCurrentProblem({ id: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Max Score</Label>
                  <Input
                    type="number"
                    value={currentProblem.score}
                    onChange={(e) => updateCurrentProblem({ score: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Difficulty</Label>
                  <select
                    value={currentProblem.difficulty}
                    onChange={(e) => updateCurrentProblem({ difficulty: e.target.value as any })}
                    className="w-full h-10 rounded-lg bg-surface-sunken px-3 text-sm text-foreground outline-none border border-border"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Pattern Tag</Label>
                  <Input
                    placeholder="e.g. sliding-window, dynamic-programming, graphs"
                    value={currentProblem.patternTag}
                    onChange={(e) => updateCurrentProblem({ patternTag: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Problem Statement (Markdown) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Problem Statement (Markdown Supported)</Label>
                <Textarea
                  rows={6}
                  className="font-mono text-xs leading-relaxed"
                  value={currentProblem.description}
                  onChange={(e) => updateCurrentProblem({ description: e.target.value })}
                  placeholder="Describe problem specifications, inputs, outputs, examples, and constraints..."
                  required
                />
              </div>

              {/* Starter Code Editor Tabs */}
              <div className="space-y-2 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <FileCode className="size-3.5 text-emerald-500" />
                    Starter Code Templates
                  </Label>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleLoadCpTemplates}
                      className="h-7 text-2xs font-mono font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 cursor-pointer"
                    >
                      <Code2 className="size-3 mr-1" />
                      Load CP Standard I/O (cin/stdin)
                    </Button>

                    <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/50">
                      {(['cpp', 'python', 'java'] as const).map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => setActiveLangTab(lang)}
                          className={`px-3 py-1 rounded-md text-2xs font-mono font-bold uppercase transition-all ${
                            activeLangTab === lang
                              ? 'bg-background text-foreground shadow-xs'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {lang === 'cpp' ? 'C++' : lang}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Textarea
                  rows={8}
                  className="font-mono text-xs leading-relaxed bg-[#090D12] text-emerald-300 border-border/80"
                  value={currentProblem.starterCode[activeLangTab]}
                  onChange={(e) => {
                    updateCurrentProblem({
                      starterCode: {
                        ...currentProblem.starterCode,
                        [activeLangTab]: e.target.value,
                      },
                    });
                  }}
                  placeholder={`Provide default ${activeLangTab.toUpperCase()} template with required method signature or standard I/O...`}
                />
              </div>

              {/* Test Cases Manager (CP Environment & .txt File Support) */}
              <div className="space-y-4 pt-4 border-t border-border/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-semibold flex items-center gap-1.5">
                        <Check className="size-3.5 text-emerald-500" />
                        Test Suite ({currentProblem.testCases.length} Cases)
                      </Label>
                      <span className="text-2xs font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {currentProblem.testCases.filter((c) => !c.isHidden).length} Visible Sample
                      </span>
                      <span className="text-2xs font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/50">
                        {currentProblem.testCases.filter((c) => c.isHidden).length} Hidden
                      </span>
                    </div>
                    <p className="text-2xs text-muted-foreground mt-0.5">
                      Support for standard CP plain text files (.txt), input/output blocks, and hidden test suites.
                    </p>
                  </div>

                  <div className="flex items-center flex-wrap gap-2">
                    {/* Hidden file input for uploading .txt file */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-7 text-2xs font-semibold border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-500/10 text-emerald-400 cursor-pointer"
                    >
                      <FileUp className="size-3 mr-1" />
                      Upload .txt File
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadTxt}
                      className="h-7 text-2xs font-semibold cursor-pointer"
                    >
                      <FileDown className="size-3 mr-1" />
                      Download .txt File
                    </Button>

                    {/* Mode Toggle: Cards vs CP Raw Text */}
                    <div className="flex items-center gap-0.5 bg-muted/60 p-0.5 rounded-lg border border-border/50">
                      <button
                        type="button"
                        onClick={() => setTestSuiteMode('cards')}
                        className={`px-2.5 py-1 rounded-md text-2xs font-semibold transition-all ${
                          testSuiteMode === 'cards'
                            ? 'bg-background text-foreground shadow-xs'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Visual Cards
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTestSuiteMode('raw_txt');
                          setRawTxtInput(formatTestCasesToText(currentProblem.testCases));
                        }}
                        className={`px-2.5 py-1 rounded-md text-2xs font-semibold transition-all flex items-center gap-1 ${
                          testSuiteMode === 'raw_txt'
                            ? 'bg-background text-foreground shadow-xs'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <FileText className="size-3 text-emerald-500" />
                        CP Raw Text (.txt)
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── MODE 1: CP RAW TEXT EDITOR (.TXT) ── */}
                {testSuiteMode === 'raw_txt' ? (
                  <div className="space-y-3 p-4 rounded-xl border border-border/70 bg-[#090D12] space-y-3">
                    <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] text-xs space-y-1.5 font-mono">
                      <div className="flex items-center justify-between font-bold text-foreground">
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <Terminal className="size-3.5" />
                          Competitive Programming Format Standard
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setRawTxtInput(
                              formatTestCasesToText([
                                { input: '5\n1 2 3 4 5', expectedOutput: '15', isHidden: false, explanation: 'Sample visible testcase' },
                                { input: '3\n10 20 30', expectedOutput: '60', isHidden: true, explanation: 'Hidden boundary testcase' },
                                { input: '1\n999', expectedOutput: '999', isHidden: true, explanation: 'Single element edge case' },
                              ])
                            );
                          }}
                          className="text-2xs text-muted-foreground hover:text-emerald-400 underline underline-offset-2"
                        >
                          Load Sample Template
                        </button>
                      </div>
                      <p className="text-muted-foreground text-2xs leading-relaxed">
                        Each case begins with <code className="text-emerald-400">=== CASE N ===</code> followed by <code className="text-emerald-400">[SAMPLE]</code> or <code className="text-amber-400">[HIDDEN]</code>, then <code className="text-foreground">--- INPUT ---</code> and <code className="text-foreground">--- OUTPUT ---</code>. Multiline stdin and whitespace are preserved exactly as in CP judges.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-2xs font-mono text-muted-foreground">
                        <span>testcases.txt (Editable Buffer)</span>
                        <span>{rawTxtInput.split('\n').length} lines</span>
                      </div>
                      <Textarea
                        rows={14}
                        value={rawTxtInput}
                        onChange={(e) => setRawTxtInput(e.target.value)}
                        className="font-mono text-xs leading-relaxed bg-[#0c1017] text-emerald-300 border-border/80 selection:bg-emerald-500/20"
                        placeholder="=== CASE 1 ===&#10;[SAMPLE]&#10;--- INPUT ---&#10;5&#10;1 2 3 4 5&#10;--- OUTPUT ---&#10;15&#10;&#10;=== CASE 2 ===&#10;[HIDDEN]&#10;--- INPUT ---&#10;3&#10;10 20 30&#10;--- OUTPUT ---&#10;60"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <p className="text-2xs text-muted-foreground">
                        Click sync to validate and update the problem test suite.
                      </p>
                      <Button
                        type="button"
                        onClick={handleSyncRawTxt}
                        className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs h-8 px-4 rounded-lg shadow-xs cursor-pointer"
                      >
                        <RefreshCw className="size-3.5 mr-1.5" />
                        Parse & Sync into Problem Cases
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* ── MODE 2: VISUAL CARDS ── */
                  <div className="space-y-3">
                    <div className="flex items-center justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddTestCase}
                        className="h-7 text-2xs font-semibold cursor-pointer"
                      >
                        <Plus className="size-3 mr-1" />
                        Add Test Case Card
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {currentProblem.testCases.map((tc, tcIdx) => (
                        <div
                          key={tcIdx}
                          className="p-3.5 rounded-xl border border-border/70 bg-card/50 space-y-3"
                        >
                          <div className="flex items-center justify-between text-2xs">
                            <span className="font-mono font-bold text-foreground">
                              Test Case #{tcIdx + 1}
                            </span>

                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={tc.isHidden}
                                  onChange={(e) => {
                                    const nextCases = [...currentProblem.testCases];
                                    nextCases[tcIdx].isHidden = e.target.checked;
                                    updateCurrentProblem({ testCases: nextCases });
                                  }}
                                  className="rounded border-border text-emerald-500 focus:ring-emerald-500"
                                />
                                {tc.isHidden ? (
                                  <span className="flex items-center gap-1 text-amber-500 font-semibold">
                                    <EyeOff className="size-3" /> Hidden Test
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                                    <Eye className="size-3" /> Visible Sample
                                  </span>
                                )}
                              </label>

                              <button
                                type="button"
                                onClick={() => handleRemoveTestCase(tcIdx)}
                                className="text-muted-foreground hover:text-destructive p-1 transition-colors cursor-pointer"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <span className="text-2xs font-mono text-muted-foreground">Standard Input (stdin):</span>
                              <Textarea
                                rows={2}
                                value={tc.input}
                                onChange={(e) => {
                                  const nextCases = [...currentProblem.testCases];
                                  nextCases[tcIdx].input = e.target.value;
                                  updateCurrentProblem({ testCases: nextCases });
                                }}
                                className="font-mono text-xs"
                                placeholder="Input lines..."
                              />
                            </div>

                            <div className="space-y-1">
                              <span className="text-2xs font-mono text-muted-foreground">Expected Output (stdout):</span>
                              <Textarea
                                rows={2}
                                value={tc.expectedOutput}
                                onChange={(e) => {
                                  const nextCases = [...currentProblem.testCases];
                                  nextCases[tcIdx].expectedOutput = e.target.value;
                                  updateCurrentProblem({ testCases: nextCases });
                                }}
                                className="font-mono text-xs"
                                placeholder="Expected output..."
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </form>
  );
}
