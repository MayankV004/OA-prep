import { SupportedLanguage } from './types';

interface ParsedArg {
  name: string;
  rawValue: string;
}

/**
 * Splits an input string like:
 * 'target = 7, nums = [2,3,1,2,4,3]' or 'numCourses = 2, prerequisites = [[1,0]]'
 * respecting nested brackets and quotes.
 */
function parseInputAssignments(inputStr: string): ParsedArg[] {
  const trimmed = inputStr.trim();
  if (!trimmed) return [];

  const parts: string[] = [];
  let current = '';
  let bracketDepth = 0;
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];

    if ((char === '"' || char === "'") && (i === 0 || trimmed[i - 1] !== '\\')) {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (stringChar === char) {
        inString = false;
      }
    }

    if (!inString) {
      if (char === '[' || char === '{' || char === '(') bracketDepth++;
      else if (char === ']' || char === '}' || char === ')') bracketDepth--;
    }

    if (char === ',' && bracketDepth === 0 && !inString) {
      if (current.trim()) parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    parts.push(current.trim());
  }

  const results: ParsedArg[] = [];
  for (const part of parts) {
    const eqIdx = part.indexOf('=');
    if (eqIdx !== -1) {
      const name = part.slice(0, eqIdx).trim();
      const rawValue = part.slice(eqIdx + 1).trim();
      results.push({ name, rawValue });
    } else {
      // Unnamed argument, use fallback name
      results.push({ name: `arg${results.length + 1}`, rawValue: part.trim() });
    }
  }

  return results;
}

/**
 * Injects a runner harness around user solution code for Judge0 execution.
 */
export function buildExecutableSource(
  userCode: string,
  language: SupportedLanguage,
  inputStr: string
): string {
  const parsedArgs = parseInputAssignments(inputStr);

  switch (language) {
    case 'python':
      return buildPythonHarness(userCode, parsedArgs);
    case 'cpp':
      return buildCppHarness(userCode, parsedArgs);
    case 'java':
      return buildJavaHarness(userCode, parsedArgs);
    default:
      return userCode;
  }
}

function buildPythonHarness(userCode: string, args: ParsedArg[]): string {
  // If user already wrote top-level input reading or __main__, run as is
  if (userCode.includes('if __name__ ==') || userCode.includes('sys.stdin.read')) {
    return userCode;
  }

  // Extract function name
  const fnMatch = userCode.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
  if (!fnMatch) {
    return userCode;
  }

  const fnName = fnMatch[1];
  const assignments = args.map((a) => `${a.name} = ${a.rawValue}`).join('\n');
  const callArgs = args.map((a) => a.name).join(', ');

  return `
import sys, json, math, collections, heapq, bisect
from typing import List, Dict, Optional, Tuple, Set

# --- Candidate Solution ---
${userCode}

# --- Automated Judge Driver ---
if __name__ == '__main__':
    try:
${assignments.split('\n').map((l) => '        ' + l).join('\n')}
        result = ${fnName}(${callArgs})
        if isinstance(result, bool):
            print(str(result).lower())
        elif isinstance(result, (list, tuple)):
            print(json.dumps(list(result)).replace(" ", ""))
        elif isinstance(result, dict):
            print(json.dumps(result).replace(" ", ""))
        else:
            print(result)
    except Exception as e:
        import traceback
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)
`.trim();
}

function buildCppHarness(userCode: string, args: ParsedArg[]): string {
  if (userCode.includes('int main(') || userCode.includes('int main ()')) {
    return userCode;
  }

  // Extract function name (excluding keywords)
  const fnMatches = Array.from(
    userCode.matchAll(/\b([a-zA-Z0-9_]+)\s*\([^)]*\)\s*\{/g)
  );
  let fnName = '';
  for (const match of fnMatches) {
    const candidate = match[1];
    if (!['if', 'while', 'for', 'switch', 'catch'].includes(candidate)) {
      fnName = candidate;
      break;
    }
  }

  if (!fnName) {
    return userCode;
  }

  // Convert Python/JSON style inputs to strongly-typed C++ variables
  const assignments: string[] = [];
  const callArgs: string[] = [];

  for (const a of args) {
    const raw = a.rawValue.trim();
    if (raw.startsWith('[[')) {
      const cppValue = raw.replace(/\[/g, '{').replace(/\]/g, '}');
      assignments.push(`vector<vector<int>> ${a.name} = ${cppValue};`);
    } else if (raw.startsWith('[')) {
      const isStringList = raw.includes('"') || raw.includes("'");
      const cppValue = raw.replace(/\[/g, '{').replace(/\]/g, '}');
      assignments.push(
        isStringList
          ? `vector<string> ${a.name} = ${cppValue};`
          : `vector<int> ${a.name} = ${cppValue};`
      );
    } else if (raw.startsWith('"') || raw.startsWith("'")) {
      assignments.push(`string ${a.name} = ${raw};`);
    } else if (raw === 'true' || raw === 'false') {
      assignments.push(`bool ${a.name} = ${raw};`);
    } else if (/^-?\d+\.\d+$/.test(raw)) {
      assignments.push(`double ${a.name} = ${raw};`);
    } else if (/^-?\d+$/.test(raw)) {
      assignments.push(`int ${a.name} = ${raw};`);
    }
    callArgs.push(a.name);
  }

  const hasSolutionClass = /\b(class|struct)\s+Solution\b/.test(userCode);

  return `
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <cmath>
#include <map>
#include <unordered_map>
#include <set>
#include <unordered_set>
#include <queue>
#include <stack>
#include <climits>
#include <sstream>

using namespace std;

// --- Candidate Solution ---
${userCode}

// --- Automated Judge Driver Helpers ---
template<typename T>
void printResult(const T& val) {
    cout << boolalpha << val;
}

template<typename T>
void printResult(const vector<T>& vec) {
    cout << "[";
    for (size_t i = 0; i < vec.size(); ++i) {
        if (i > 0) cout << ",";
        printResult(vec[i]);
    }
    cout << "]";
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    try {
        ${assignments.join('\n        ')}
        ${hasSolutionClass ? `Solution solver;\n        auto ans = solver.${fnName}(${callArgs.join(', ')});` : `auto ans = ${fnName}(${callArgs.join(', ')});`}
        printResult(ans);
        cout << "\\n";
    } catch (...) {
        return 1;
    }
    return 0;
}
`.trim();
}

function buildJavaHarness(userCode: string, args: ParsedArg[]): string {
  if (userCode.includes('public static void main')) {
    return userCode;
  }

  // Find method name inside Solution
  const methodMatches = Array.from(
    userCode.matchAll(/(?:public\s+|protected\s+|private\s+)?(?:static\s+)?(?:final\s+)?[\w<>\[\],\s]+\s+([a-zA-Z0-9_]+)\s*\([^)]*\)\s*\{/g)
  );
  let methodName = '';
  for (const match of methodMatches) {
    const candidate = match[1];
    if (!['if', 'while', 'for', 'switch', 'catch', 'Solution', 'Main', 'class', 'interface'].includes(candidate)) {
      methodName = candidate;
      break;
    }
  }

  if (!methodName) {
    return userCode;
  }

  // Convert Python/JSON arrays to Java array initializers
  const assignments: string[] = [];
  const callArgs: string[] = [];

  for (const a of args) {
    const raw = a.rawValue.trim();
    if (raw.startsWith('[[')) {
      const javaVal = raw.replace(/\[/g, '{').replace(/\]/g, '}');
      assignments.push(`int[][] ${a.name} = new int[][]${javaVal};`);
    } else if (raw.startsWith('[')) {
      const isStringList = raw.includes('"') || raw.includes("'");
      const javaVal = raw.replace(/\[/g, '{').replace(/\]/g, '}');
      assignments.push(
        isStringList
          ? `String[] ${a.name} = new String[]${javaVal};`
          : `int[] ${a.name} = new int[]${javaVal};`
      );
    } else if (raw.startsWith('"') || raw.startsWith("'")) {
      assignments.push(`String ${a.name} = ${raw};`);
    } else if (raw === 'true' || raw === 'false') {
      assignments.push(`boolean ${a.name} = ${raw};`);
    } else if (/^-?\d+\.\d+$/.test(raw)) {
      assignments.push(`double ${a.name} = ${raw};`);
    } else if (/^-?\d+$/.test(raw)) {
      assignments.push(`int ${a.name} = ${raw};`);
    } else {
      assignments.push(`var ${a.name} = ${raw};`);
    }
    callArgs.push(a.name);
  }

  const driver = `
    // --- Automated Judge Driver with BufferedReader ---
    private static void printValue(Object obj) {
        if (obj == null) {
            System.out.print("null");
        } else if (obj instanceof int[]) {
            System.out.print(Arrays.toString((int[]) obj).replace(" ", ""));
        } else if (obj instanceof long[]) {
            System.out.print(Arrays.toString((long[]) obj).replace(" ", ""));
        } else if (obj instanceof double[]) {
            System.out.print(Arrays.toString((double[]) obj).replace(" ", ""));
        } else if (obj instanceof boolean[]) {
            System.out.print(Arrays.toString((boolean[]) obj).replace(" ", ""));
        } else if (obj instanceof Object[]) {
            System.out.print(Arrays.deepToString((Object[]) obj).replace(" ", ""));
        } else {
            System.out.print(obj.toString());
        }
    }

    public static void main(String[] args) {
        try {
            BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(System.in));
            Solution sol = new Solution();
            ${assignments.join('\n            ')}
            var result = sol.${methodName}(${callArgs.join(', ')});
            printValue(result);
            System.out.println();
        } catch (Exception e) {
            e.printStackTrace(System.err);
            System.exit(1);
        }
    }
`;

  // Inject main inside Solution class to prevent Piston class-loader errors
  const lastBraceIdx = userCode.lastIndexOf('}');
  if (userCode.includes('class Solution') && lastBraceIdx !== -1) {
    const classBody = userCode.slice(0, lastBraceIdx);
    const after = userCode.slice(lastBraceIdx + 1);

    return `
import java.util.*;
import java.io.*;

${classBody}
${driver}
}
${after}
`.trim();
  }

  return `
import java.util.*;
import java.io.*;

public class Solution {
${userCode}
${driver}
}
`.trim();
}
