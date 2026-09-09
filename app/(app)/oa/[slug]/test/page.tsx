'use client';

import React, { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Timer,
  ShieldAlert,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Maximize2,
  Minimize2,
  ChevronRight,
  Send,
  Loader2,
  Terminal,
  Copy,
  FileDown,
  FileUp,
  FileText,
  Code2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProctorCameraPip, type ProctorViolationEvent } from '@/components/oa/ProctorCameraPip';
import { MarkdownView } from '@/components/markdown/View';
import { toast } from 'sonner';
import { downloadTextFile } from '@/lib/cp/testcaseParser';

// Dynamically import Monaco Editor to ensure zero SSR canvas issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-[#0c0c0e] flex items-center justify-center font-mono text-xs text-muted-foreground">
      Loading Monaco Code Engine...
    </div>
  ),
});

interface TestCase {
  input: string;
  expectedOutput: string;
  explanation?: string;
}

interface AssessmentProblem {
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
  visibleTestCases: TestCase[];
  totalTestCaseCount: number;
}

interface AssessmentData {
  id: string;
  title: string;
  slug: string;
  company: string;
  role: string;
  durationMinutes: number;
  passingScore: number;
  problems: AssessmentProblem[];
}

export default function AssessmentTestRunnerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();

  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeProblemIdx, setActiveProblemIdx] = useState(0);

  // Per-problem user code state: { [problemId]: { cpp: '...', python: '...', java: '...' } }
  const [userCodes, setUserCodes] = useState<Record<string, Record<string, string>>>({});
  const [languages, setLanguages] = useState<Record<string, 'cpp' | 'python' | 'java'>>({});

  // Countdown timer in seconds
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60 * 60);

  // Proctor Telemetry state
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [timeAwaySeconds, setTimeAwaySeconds] = useState(0);
  const [pasteCount, setPasteCount] = useState(0);
  const [largePasteDetected, setLargePasteDetected] = useState(false);
  const [pasteAttemptsBlocked, setPasteAttemptsBlocked] = useState(0);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [faceAbsenceCount, setFaceAbsenceCount] = useState(0);
  const [multipleFacesCount, setMultipleFacesCount] = useState(0);
  const [gazeDivertedCount, setGazeDivertedCount] = useState(0);
  const [voiceInterruptionCount, setVoiceInterruptionCount] = useState(0);
  const [keystrokesCount, setKeystrokesCount] = useState(0);
  const [telemetryTimeline, setTelemetryTimeline] = useState<any[]>([]);
  const [proctorWarning, setProctorWarning] = useState<string | null>(null);

  // Code test execution state
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<any[] | null>(null);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [runCooldown, setRunCooldown] = useState<number>(0);

  // Custom CP testcase execution state
  const [consoleTab, setConsoleTab] = useState<'tests' | 'custom'>('tests');
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);
  const [customInputText, setCustomInputText] = useState<string>('');
  const [customExecutionResult, setCustomExecutionResult] = useState<any | null>(null);
  const [isRunningCustom, setIsRunningCustom] = useState<boolean>(false);
  const customFileInputRef = useRef<HTMLInputElement>(null);

  // Final submission state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const blurTimeRef = useRef<number | null>(null);
  const isSubmittedRef = useRef(false);

  // 1. Initialize assessment session
  useEffect(() => {
    fetch(`/api/oa/assessments/${slug}/start`, { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        if (data.alreadyCompleted) {
          isSubmittedRef.current = true;
          router.replace(`/oa/${slug}/report/${data.submissionId}`);
          return;
        }

        if (data.success) {
          setAssessment(data.assessment);
          setSubmissionId(data.submissionId);

          // Calculate remaining seconds based on server startedAt + durationMinutes
          const startTime = new Date(data.startedAt).getTime();
          const totalDurationMs = data.durationMinutes * 60 * 1000;
          const elapsedSecs = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
          const remaining = Math.max(0, data.durationMinutes * 60 - elapsedSecs);
          setSecondsRemaining(remaining);

          // Initialize starter codes, restoring drafts from localStorage or server if available
          const initialCodes: Record<string, Record<string, string>> = {};
          const initialLangs: Record<string, 'cpp' | 'python' | 'java'> = {};

          data.assessment.problems.forEach((p: AssessmentProblem) => {
            let draftCpp: string | null = null;
            let draftPy: string | null = null;
            let draftJava: string | null = null;
            try {
              draftCpp = localStorage.getItem(`oa_draft_${slug}_${p.id}_cpp`);
              draftPy = localStorage.getItem(`oa_draft_${slug}_${p.id}_python`);
              draftJava = localStorage.getItem(`oa_draft_${slug}_${p.id}_java`);
            } catch {}

            const serverSaved = data.savedCodes?.[p.id];

            initialCodes[p.id] = {
              cpp: draftCpp ?? (serverSaved?.language === 'cpp' ? serverSaved.code : p.starterCode?.cpp || ''),
              python: draftPy ?? (serverSaved?.language === 'python' ? serverSaved.code : p.starterCode?.python || ''),
              java: draftJava ?? (serverSaved?.language === 'java' ? serverSaved.code : p.starterCode?.java || ''),
            };
            initialLangs[p.id] = (serverSaved?.language as 'cpp' | 'python' | 'java') || 'cpp';
          });

          setUserCodes(initialCodes);
          setLanguages(initialLangs);
        } else {
          router.replace(`/oa/${slug}`);
        }
      })
      .catch((err) => {
        console.error('Failed to init test runner:', err);
        router.replace(`/oa/${slug}`);
      })
      .finally(() => setLoading(false));
  }, [slug, router]);

  // 1b. Navigation & Gesture Lock: Trap back button, gestures, and beforeunload
  useEffect(() => {
    if (loading) return;

    // Push dummy history entry so back button/gesture triggers popstate instead of exiting
    window.history.pushState({ assessmentSession: slug }, '', window.location.href);

    const handlePopState = () => {
      if (isSubmittedRef.current) return;
      // Re-trap history immediately
      window.history.pushState({ assessmentSession: slug }, '', window.location.href);
      setProctorWarning(
        'Navigation Locked: Leaving the test room during an active assessment is strictly prohibited.'
      );
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isSubmittedRef.current) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [loading, slug]);

  // 2. Countdown Timer with auto-submit on timeout
  useEffect(() => {
    if (loading || secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerFinalSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, secondsRemaining]);

  // 3. Proctoring Telemetry Listeners (Window blur & tab visibility)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        blurTimeRef.current = Date.now();
        setTabSwitchCount((prev) => prev + 1);
        setTelemetryTimeline((prev) => [
          ...prev,
          {
            timestamp: new Date(),
            type: 'tab_switch',
            details: 'Browser tab lost focus / switched window',
          },
        ]);
        setProctorWarning('Proctor Alert: Tab switch detected. This event is logged in your integrity audit.');
      } else {
        if (blurTimeRef.current) {
          const awayDurationSecs = Math.round((Date.now() - blurTimeRef.current) / 1000);
          setTimeAwaySeconds((prev) => prev + awayDurationSecs);
          blurTimeRef.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Dismiss proctor warning banner after 6 seconds
  useEffect(() => {
    if (!proctorWarning) return;
    const timeout = setTimeout(() => setProctorWarning(null), 6000);
    return () => clearTimeout(timeout);
  }, [proctorWarning]);

  // 4. Active problem & code accessors
  const currentProblem = assessment?.problems[activeProblemIdx];
  const currentLanguage = currentProblem ? languages[currentProblem.id] || 'cpp' : 'cpp';
  const currentCode = currentProblem ? userCodes[currentProblem.id]?.[currentLanguage] || '' : '';

  const handleCodeChange = (newCode: string) => {
    if (!currentProblem) return;
    setKeystrokesCount((prev) => prev + 1);
    setUserCodes((prev) => ({
      ...prev,
      [currentProblem.id]: {
        ...prev[currentProblem.id],
        [currentLanguage]: newCode,
      },
    }));

    // Local draft auto-save so browser refresh or crash never loses candidate code
    try {
      localStorage.setItem(`oa_draft_${slug}_${currentProblem.id}_${currentLanguage}`, newCode);
    } catch {}
  };

  // 5. Biometric Proctoring Violation Callback
  const handleProctorViolation = (event: ProctorViolationEvent) => {
    setTelemetryTimeline((prev) => [
      ...prev,
      {
        timestamp: new Date(),
        type: event.type,
        details: event.details,
      },
    ]);

    if (event.type === 'prohibited_object_detected') {
      setProctorWarning(`Proctor Alert: Prohibited device detected (${event.details})! Remove it immediately.`);
    } else if (event.type === 'no_face_detected') {
      setFaceAbsenceCount((prev) => prev + 1);
      const isCovered =
        event.details.toLowerCase().includes('cover') ||
        event.details.toLowerCase().includes('occlud');
      setProctorWarning(
        isCovered
          ? 'Proctor Alert: Face is covered or occluded! Keep your face uncovered and fully visible.'
          : 'Proctor Alert: Face not detected. Please remain facing the webcam.'
      );
    } else if (event.type === 'multiple_faces') {
      setMultipleFacesCount((prev) => prev + 1);
      setProctorWarning('Proctor Alert: Multiple people detected in camera feed.');
    } else if (event.type === 'gaze_diverted') {
      setGazeDivertedCount((prev) => prev + 1);
      setProctorWarning('Proctor Alert: Eye gaze away from screen. Maintain focus on the assessment.');
    } else if (event.type === 'voice_detected') {
      setVoiceInterruptionCount((prev) => prev + 1);
      setProctorWarning('Proctor Alert: Voice or speech detected. Assessment must be completed in silence.');
    } else if (event.type === 'camera_disabled') {
      setCameraEnabled(false);
      setProctorWarning('Proctor Warning: Webcam stream is disconnected or unverified.');
    }
  };

  // 6. Monaco Editor mount setup with STRICT COPY-PASTE BLOCKING (Bypassable if NEXT_PUBLIC_ALLOW_COPY_PASTE is true)
  const allowCopyPaste = process.env.NEXT_PUBLIC_ALLOW_COPY_PASTE === 'true';

  const handleEditorMount = (editor: any) => {
    // If copy-pasting is explicitly toggled on for testing/development, do not restrict clipboard
    if (allowCopyPaste) {
      return;
    }

    // Intercept keyboard paste shortcuts (Ctrl+V, Cmd+V, Shift+Insert)
    editor.onKeyDown((e: any) => {
      // KeyCode 52 is 'V', KeyCode 45 is 'Insert'
      const isPasteCombo =
        ((e.ctrlKey || e.metaKey) && e.keyCode === 52) ||
        (e.shiftKey && e.keyCode === 45);

      if (isPasteCombo) {
        e.preventDefault();
        e.stopPropagation();
        setPasteAttemptsBlocked((prev) => prev + 1);
        setTelemetryTimeline((prev) => [
          ...prev,
          {
            timestamp: new Date(),
            type: 'attempted_paste_blocked',
            details: `Keyboard paste shortcut blocked in Question ${activeProblemIdx + 1}`,
          },
        ]);
        setProctorWarning('Clipboard Locked: Copy-pasting is strictly prohibited during this assessment. All code must be typed manually.');
      }
    });

    // Safety catch: Context-menu / drag-and-drop paste
    editor.onDidPaste(() => {
      editor.trigger('keyboard', 'undo', null);
      setPasteAttemptsBlocked((prev) => prev + 1);
      setTelemetryTimeline((prev) => [
        ...prev,
        {
          timestamp: new Date(),
          type: 'attempted_paste_blocked',
          details: `Context-menu / drag-drop paste intercepted and reverted in Question ${activeProblemIdx + 1}`,
        },
      ]);
      setProctorWarning('Clipboard Locked: External code insertion is prohibited. Paste has been reverted.');
    });
  };

  // 6. Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // 7. Live Code Execution via Judge0 API
  const handleRunTests = async () => {
    if (!currentProblem || isRunningTests || runCooldown > 0) return;
    setIsRunningTests(true);
    setIsConsoleOpen(true);
    setConsoleTab('tests');
    setTestResults(null);
    setCompileError(null);

    try {
      const payload = {
        problemId: currentProblem.id,
        language: currentLanguage,
        code: currentCode,
        testCases: currentProblem.visibleTestCases || [],
        patternTag: currentProblem.patternTag,
        starterCode: currentProblem.starterCode?.[currentLanguage] || '',
      };

      const res = await fetch('/api/oa/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setProctorWarning(data.message || 'Execution rate limit exceeded. Please wait a few seconds.');
        } else {
          setProctorWarning(data.message || 'Code execution error occurred.');
        }
        setIsRunningTests(false);
        return;
      }

      if (data.compileError) {
        setCompileError(data.compileError);
      }

      setTestResults(data.results || []);

      // 4-second cooldown to preserve RapidAPI free tier quota
      setRunCooldown(4);
      const interval = setInterval(() => {
        setRunCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Run tests error:', err);
      setProctorWarning('Failed to connect to code execution service.');
    } finally {
      setIsRunningTests(false);
    }
  };

  // 7b. Run against Custom Input (Competitive Programming standard I/O)
  const handleRunCustomInput = async () => {
    if (!currentProblem || isRunningCustom || runCooldown > 0) return;
    setIsRunningCustom(true);
    setIsConsoleOpen(true);
    setConsoleTab('custom');
    setCustomExecutionResult(null);
    setCompileError(null);

    try {
      const payload = {
        problemId: currentProblem.id,
        language: currentLanguage,
        code: currentCode,
        customInput: customInputText,
        patternTag: currentProblem.patternTag,
        starterCode: currentProblem.starterCode?.[currentLanguage] || '',
      };

      const res = await fetch('/api/oa/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Execution error');
        setIsRunningCustom(false);
        return;
      }

      if (data.compileError) {
        setCompileError(data.compileError);
      }

      if (data.results?.[0]) {
        setCustomExecutionResult(data.results[0]);
      }

      setRunCooldown(3);
      const interval = setInterval(() => {
        setRunCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Run custom input error:', err);
      toast.error('Failed to execute code with custom input.');
    } finally {
      setIsRunningCustom(false);
    }
  };

  // Upload custom input.txt file
  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text !== undefined) {
        setCustomInputText(text);
        setIsConsoleOpen(true);
        setConsoleTab('custom');
        toast.success(`Loaded "${file.name}" into custom stdin!`);
      }
      if (customFileInputRef.current) customFileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  // Copy standard input to clipboard
  const handleCopyStdin = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Input copied to clipboard!');
  };

  // Download individual sample input as .txt
  const handleDownloadSampleTxt = (text: string, index: number) => {
    downloadTextFile(text, `${slug}_problem_${activeProblemIdx + 1}_sample_${index + 1}_input.txt`);
    toast.success(`Downloaded sample #${index + 1} input.txt!`);
  };

  // Download all sample test cases as a .txt file
  const handleDownloadAllSamples = () => {
    if (!currentProblem || !currentProblem.visibleTestCases.length) return;
    const content = currentProblem.visibleTestCases
      .map(
        (tc, idx) =>
          `=== SAMPLE CASE ${idx + 1} ===\n--- INPUT ---\n${tc.input}\n--- EXPECTED OUTPUT ---\n${tc.expectedOutput}\n`
      )
      .join('\n');
    downloadTextFile(content, `${slug}_problem_${activeProblemIdx + 1}_all_samples.txt`);
    toast.success('Downloaded all sample testcases (.txt)!');
  };

  // 8. Final Submission
  const triggerFinalSubmit = async (isAutoTimeout = false) => {
    if (isSubmitting || !assessment) return;
    setIsSubmitting(true);

    try {
      const solutions = assessment.problems.map((prob) => {
        const lang = languages[prob.id] || 'cpp';
        return {
          problemId: prob.id,
          code: userCodes[prob.id]?.[lang] || '',
          language: lang,
          timeSpentSeconds: Math.round(assessment.durationMinutes * 60 - secondsRemaining),
        };
      });

      const payload = {
        submissionId,
        solutions,
        telemetry: {
          tabSwitchCount,
          timeAwaySeconds,
          pasteCount: 0,
          largePasteDetected: false,
          pasteAttemptsBlocked,
          keystrokesCount,
          cameraEnabled,
          micEnabled,
          faceAbsenceCount,
          multipleFacesCount,
          gazeDivertedCount,
          voiceInterruptionCount,
          timeline: telemetryTimeline,
        },
      };

      const res = await fetch(`/api/oa/assessments/${slug}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        isSubmittedRef.current = true;
        // Clear local drafts for this assessment
        try {
          assessment.problems.forEach((p: AssessmentProblem) => {
            (['cpp', 'python', 'java'] as const).forEach((l) => {
              localStorage.removeItem(`oa_draft_${slug}_${p.id}_${l}`);
            });
          });
        } catch {}

        router.replace(`/oa/${slug}/report/${data.submissionId}`);
      } else {
        alert(data.message || 'Submission failed');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Error submitting assessment:', err);
      setIsSubmitting(false);
    }
  };

  // Format seconds to HH:MM:SS
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#09090b] flex items-center justify-center text-foreground">
        <div className="flex items-center gap-3">
          <Loader2 className="size-6 animate-spin text-primary" />
          <span className="text-sm font-mono font-medium">Entering Proctored Assessment Room...</span>
        </div>
      </div>
    );
  }

  if (!assessment || !currentProblem) {
    return null;
  }

  const isTimeCritical = secondsRemaining < 5 * 60;
  const isTimeWarning = secondsRemaining < 15 * 60;

  // Map language key to Monaco language identifier
  const monacoLang = currentLanguage === 'cpp' ? 'cpp' : currentLanguage === 'python' ? 'python' : 'java';

  return (
    <div
      className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden select-none font-sans overscroll-none touch-pan-y"
      style={{ overscrollBehavior: 'none' }}
    >
      {/* ── COMPACT PROCTOR FLOATING NOTIFICATION ───────── */}
      {proctorWarning && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 max-w-lg px-3.5 py-1 rounded-full bg-card/95 border border-amber-500/40 text-amber-300 text-2xs font-mono flex items-center gap-2 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150">
          <AlertTriangle className="size-3 shrink-0 text-amber-400" />
          <span className="truncate">{proctorWarning}</span>
          <button
            onClick={() => setProctorWarning(null)}
            className="text-muted-foreground hover:text-foreground font-bold ml-1 px-1 cursor-pointer bg-transparent border-0 text-3xs"
            title="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── STICKY PROCTOR TOP BAR ───────────────────────── */}
      <header className="h-14 border-b border-border/80 bg-card/70 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 z-30">
        {/* Left: Brand & Question Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 pr-3 border-r border-border/60">
            <span className="text-sm font-mono font-black tracking-tight text-foreground">
              {assessment.company}
            </span>
            <span className="text-2xs font-mono text-muted-foreground uppercase hidden sm:inline">
              • OA Simulator
            </span>
          </div>

          {/* Question Nav Pills */}
          <div className="flex items-center gap-1.5">
            {assessment.problems.map((prob, idx) => (
              <button
                key={prob.id}
                onClick={() => {
                  setActiveProblemIdx(idx);
                  setTestResults(null);
                  setCompileError(null);
                }}
                className={cn(
                  'px-3.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border-0',
                  activeProblemIdx === idx
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                Q{idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Timer, Proctor Violation Counter, Fullscreen & Submit */}
        <div className="flex items-center gap-3">
          {/* Live Countdown Timer */}
          <div
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1 rounded-xl text-xs font-mono font-bold transition-colors border',
              isTimeCritical
                ? 'bg-red-500/10 text-red-500 border-red-500/30 animate-pulse'
                : isTimeWarning
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-card text-foreground border-border'
            )}
          >
            <Timer className="size-3.5" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          {/* Proctor Violation Count Badge */}
          <div
            className={cn(
              'hidden sm:flex items-center gap-1.5 px-3.5 py-1 rounded-xl text-2xs font-mono font-semibold border',
              tabSwitchCount > 0
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-card text-muted-foreground border-border/60'
            )}
            title="Tab switches and focus loss are logged"
          >
            <ShieldAlert className="size-3 text-amber-400" />
            <span>Violations: {tabSwitchCount}</span>
          </div>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer border-0 bg-transparent hidden md:block"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>

          {/* Submit Assessment Button */}
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-2xs border-0"
          >
            <Send className="size-3" />
            <span>Finish Test</span>
          </button>
        </div>
      </header>

      {/* ── MAIN WORKSPACE: SPLIT PANE ───────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Problem Statement & Constraints (45%) */}
        <div className="w-full lg:w-[45%] border-r border-border/70 flex flex-col overflow-y-auto bg-card/10">
          <div className="p-6 space-y-6">
            {/* Header info */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-2xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  Problem {activeProblemIdx + 1} of {assessment.problems.length}
                </span>
                <span
                  className={cn(
                    'px-2.5 py-0.5 rounded-md text-2xs font-bold uppercase font-mono',
                    currentProblem.difficulty === 'Easy' && 'text-emerald-400 bg-emerald-500/10',
                    currentProblem.difficulty === 'Medium' && 'text-amber-400 bg-amber-500/10',
                    currentProblem.difficulty === 'Hard' && 'text-red-400 bg-red-500/10'
                  )}
                >
                  {currentProblem.difficulty} • {currentProblem.score} pts
                </span>
              </div>
              <h2 className="text-xl font-bold text-foreground">{currentProblem.title}</h2>
              <div className="text-xs font-mono text-primary font-medium">{currentProblem.patternTag}</div>
            </div>

            {/* Markdown Problem Description */}
            <div className="text-foreground/90 leading-relaxed font-normal">
              <MarkdownView content={currentProblem.description} variant="exam" allowCopy={false} />
            </div>

            {/* Visible Testcases (CP Standard I/O) */}
            <div className="space-y-3 pt-4 border-t border-border/40">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Terminal className="size-3.5 text-primary" />
                  Sample Test Cases ({currentProblem.visibleTestCases.length} Visible)
                </h4>
                {currentProblem.visibleTestCases.length > 0 && (
                  <button
                    type="button"
                    onClick={handleDownloadAllSamples}
                    className="inline-flex items-center gap-1 text-2xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <FileDown className="size-3" />
                    Download All (.txt)
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {currentProblem.visibleTestCases.map((tc, i) => (
                  <div key={i} className="rounded-xl bg-card border border-border/70 overflow-hidden text-xs shadow-2xs font-mono">
                    <div className="px-3.5 py-2 bg-card/80 border-b border-border/50 flex items-center justify-between text-2xs">
                      <span className="font-bold text-foreground">Sample #{i + 1}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyStdin(tc.input)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title="Copy standard input"
                        >
                          <Copy className="size-2.5" />
                          Copy Stdin
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadSampleTxt(tc.input, i)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title="Download as input.txt"
                        >
                          <FileDown className="size-2.5" />
                          .txt
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 space-y-2.5">
                      <div className="space-y-1">
                        <div className="text-2xs text-muted-foreground uppercase font-semibold">Standard Input (stdin):</div>
                        <pre className="p-2 rounded-lg bg-[#090D12] text-foreground font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed border border-border/40">
                          {tc.input}
                        </pre>
                      </div>

                      <div className="space-y-1">
                        <div className="text-2xs text-muted-foreground uppercase font-semibold">Standard Output (stdout):</div>
                        <pre className="p-2 rounded-lg bg-[#090D12] text-primary font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed border border-border/40">
                          {tc.expectedOutput}
                        </pre>
                      </div>

                      {tc.explanation && (
                        <div className="text-2xs text-muted-foreground italic pt-1 border-t border-border/30">
                          <span className="font-semibold text-foreground/80 not-italic">Note: </span>
                          {tc.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Monaco Code Editor & Execution Console (55%) */}
        <div className="hidden lg:flex flex-1 flex-col bg-[#0c0c0e] overflow-hidden">
          {/* Editor Header: Language Switcher */}
          <div className="h-10 border-b border-border/80 px-4 flex items-center justify-between bg-card/40 shrink-0">
            <div className="flex items-center gap-1">
              {(['cpp', 'python', 'java'] as const).map((langKey) => (
                <button
                  key={langKey}
                  onClick={() => {
                    if (currentProblem) {
                      setLanguages((prev) => ({ ...prev, [currentProblem.id]: langKey }));
                    }
                  }}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-mono uppercase font-semibold transition-all cursor-pointer border-0',
                    currentLanguage === langKey
                      ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground bg-transparent'
                  )}
                >
                  {langKey === 'cpp' ? 'C++20' : langKey === 'python' ? 'Python 3' : 'Java 21'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {allowCopyPaste ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-2xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Paste Allowed (Test Mode)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-2xs font-mono font-medium bg-muted text-muted-foreground border border-border/60">
                  Clipboard Locked
                </span>
              )}

              <span className="text-2xs font-mono text-muted-foreground hidden sm:inline">
                VS Code Monaco Engine
              </span>
            </div>
          </div>

          {/* Monaco Code Editor Area with syntax highlighting and line numbers */}
          <div className="flex-1 relative overflow-hidden">
            <MonacoEditor
              height="100%"
              language={monacoLang}
              value={currentCode}
              theme="vs-dark"
              onChange={(val) => handleCodeChange(val || '')}
              onMount={handleEditorMount}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                readOnly: false,
                automaticLayout: true,
                tabSize: 4,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                bracketPairColorization: { enabled: true },
                formatOnPaste: true,
                wordWrap: 'on',
              }}
            />
          </div>

          {/* Testcase Output Console Tray (Dual-Tab: Sample Tests + CP Custom Input) */}
          {(isConsoleOpen || testResults || compileError || customExecutionResult) && (
            <div className="h-64 border-t border-border/80 bg-[#090D12]/95 backdrop-blur-md overflow-hidden flex flex-col font-mono text-xs shrink-0 shadow-lg">
              {/* Console Header / Tabs */}
              <div className="h-9 border-b border-border/70 px-4 flex items-center justify-between bg-card/60 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/50">
                    <button
                      type="button"
                      onClick={() => setConsoleTab('tests')}
                      className={cn(
                        'px-3 py-1 rounded-md text-2xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer',
                        consoleTab === 'tests'
                          ? 'bg-background text-foreground shadow-xs font-bold'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Terminal className="size-3 text-primary" />
                      <span>Sample Tests</span>
                      {testResults && (
                        <span
                          className={cn(
                            'text-2xs px-1.5 py-0.2 rounded-full font-bold',
                            testResults.every((r) => r.passed)
                              ? 'bg-primary/20 text-primary'
                              : 'bg-red-500/20 text-red-400'
                          )}
                        >
                          {testResults.filter((r) => r.passed).length}/{testResults.length}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setConsoleTab('custom')}
                      className={cn(
                        'px-3 py-1 rounded-md text-2xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer',
                        consoleTab === 'custom'
                          ? 'bg-background text-foreground shadow-xs font-bold'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <FileText className="size-3 text-emerald-400" />
                      <span>Custom Input (CP)</span>
                      {customExecutionResult && (
                        <span className="text-2xs px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                          {customExecutionResult.status}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {consoleTab === 'custom' && (
                    <>
                      {/* Hidden file input for uploading input.txt */}
                      <input
                        type="file"
                        ref={customFileInputRef}
                        accept=".txt"
                        onChange={handleCustomFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => customFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-mono text-muted-foreground hover:text-foreground border border-border/50 hover:bg-muted transition-colors cursor-pointer"
                        title="Upload a .txt file as standard input"
                      >
                        <FileUp className="size-2.5 text-emerald-400" />
                        Upload input.txt
                      </button>
                      {customInputText && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomInputText('');
                            setCustomExecutionResult(null);
                          }}
                          className="text-2xs font-mono text-muted-foreground hover:text-red-400 px-1.5 py-0.5 cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsConsoleOpen(false)}
                    className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors cursor-pointer"
                    title="Collapse console"
                  >
                    <Minimize2 className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Console Body */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {/* ── TAB 1: SAMPLE TESTS ── */}
                {consoleTab === 'tests' && (
                  <div className="space-y-2">
                    {/* Compilation Error Banner */}
                    {compileError && (
                      <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/[0.06] text-red-400 space-y-1.5 font-mono text-xs">
                        <div className="flex items-center gap-1.5 font-bold uppercase text-2xs text-red-400">
                          <AlertTriangle className="size-3.5" />
                          <span>Compilation / Syntax Error</span>
                        </div>
                        <pre className="whitespace-pre-wrap text-2xs leading-relaxed max-h-28 overflow-y-auto text-red-300">
                          {compileError}
                        </pre>
                      </div>
                    )}

                    {/* Individual Test Cases */}
                    {testResults && testResults.length > 0 ? (
                      <div className="space-y-1.5">
                        {testResults.map((r) => (
                          <div
                            key={r.index}
                            className={cn(
                              'flex items-center justify-between p-2.5 rounded-lg border text-xs gap-3',
                              r.passed
                                ? 'bg-primary/[0.04] border-primary/20 text-foreground'
                                : 'bg-red-500/[0.04] border-red-500/20 text-foreground'
                            )}
                          >
                            <div className="flex items-center gap-2 overflow-hidden truncate">
                              {r.passed ? (
                                <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                              ) : (
                                <XCircle className="size-3.5 text-red-400 shrink-0" />
                              )}
                              <span className="font-bold shrink-0">Case {r.index}:</span>
                              <span className="text-muted-foreground truncate font-mono text-2xs">{r.input}</span>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              {r.timeMs !== undefined && (
                                <span className="text-2xs text-muted-foreground font-mono hidden sm:inline">
                                  ⚡ {r.timeMs}ms
                                </span>
                              )}
                              {r.memoryKb !== undefined && (
                                <span className="text-2xs text-muted-foreground font-mono hidden sm:inline">
                                  💾 {(r.memoryKb / 1024).toFixed(1)}MB
                                </span>
                              )}
                              {!r.passed && (
                                <span className="text-2xs text-muted-foreground">
                                  Output: <span className="text-red-400">{r.actual}</span> | Expected:{' '}
                                  <span className="text-foreground">{r.expected}</span>
                                </span>
                              )}
                              <span className={cn('font-bold text-2xs', r.passed ? 'text-primary' : 'text-red-400')}>
                                {r.status || (r.passed ? 'Accepted' : 'Wrong Answer')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      !compileError && (
                        <div className="py-6 text-center text-xs text-muted-foreground">
                          Click <span className="text-primary font-semibold">"Run Visible Testcases"</span> to compile and test against sample cases.
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* ── TAB 2: CUSTOM INPUT (CP MODE) ── */}
                {consoleTab === 'custom' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between text-2xs text-muted-foreground font-bold uppercase">
                        <span>Standard Input (stdin):</span>
                        <span>{customInputText ? `${customInputText.split('\n').length} lines` : 'Empty'}</span>
                      </div>
                      <textarea
                        rows={4}
                        value={customInputText}
                        onChange={(e) => setCustomInputText(e.target.value)}
                        placeholder="Paste standard input or click 'Upload input.txt' above..."
                        className="flex-1 min-h-[100px] w-full p-2.5 rounded-lg bg-[#0c1017] border border-border/80 text-foreground font-mono text-xs focus:outline-none focus:border-primary/50 resize-none leading-relaxed"
                      />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between text-2xs text-muted-foreground font-bold uppercase">
                        <span>Standard Output (stdout):</span>
                        {customExecutionResult && (
                          <div className="flex items-center gap-2">
                            {customExecutionResult.timeMs !== undefined && (
                              <span className="text-primary">⚡ {customExecutionResult.timeMs}ms</span>
                            )}
                            {customExecutionResult.memoryKb !== undefined && (
                              <span>💾 {(customExecutionResult.memoryKb / 1024).toFixed(1)}MB</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-h-[100px] p-2.5 rounded-lg bg-[#0c1017] border border-border/80 font-mono text-xs overflow-y-auto whitespace-pre-wrap leading-relaxed">
                        {isRunningCustom ? (
                          <div className="h-full flex items-center justify-center gap-2 text-muted-foreground">
                            <Loader2 className="size-3.5 animate-spin text-primary" />
                            <span>Executing code with custom input...</span>
                          </div>
                        ) : customExecutionResult ? (
                          <div className="space-y-2">
                            <pre className="text-foreground">{customExecutionResult.actual || 'No output produced.'}</pre>
                            {customExecutionResult.stderr && (
                              <div className="pt-2 border-t border-red-500/20 text-red-400 text-2xs">
                                <div className="font-bold">Standard Error:</div>
                                <pre className="whitespace-pre-wrap">{customExecutionResult.stderr}</pre>
                              </div>
                            )}
                          </div>
                        ) : compileError ? (
                          <pre className="text-red-400">{compileError}</pre>
                        ) : (
                          <span className="text-muted-foreground/60 italic">
                            Output will appear here after clicking "Run with Custom Input".
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Editor Action Footer */}
          <div className="h-12 border-t border-border/80 px-4 flex items-center justify-between bg-card/40 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={handleRunTests}
                disabled={isRunningTests || isRunningCustom || runCooldown > 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-all cursor-pointer border border-border/80 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
              >
                <Play className={cn('size-3.5 text-primary', isRunningTests && 'animate-spin')} />
                <span>
                  {isRunningTests
                    ? 'Compiling & Running...'
                    : runCooldown > 0
                    ? `Cooldown (${runCooldown}s)`
                    : 'Run Visible Testcases'}
                </span>
              </button>

              <button
                onClick={handleRunCustomInput}
                disabled={isRunningTests || isRunningCustom || runCooldown > 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
              >
                <FileText className={cn('size-3.5', isRunningCustom && 'animate-spin')} />
                <span>{isRunningCustom ? 'Running Custom...' : 'Run Custom Stdin'}</span>
              </button>

              <button
                onClick={() => setIsConsoleOpen((prev) => !prev)}
                className={cn(
                  'p-1.5 rounded-xl border transition-colors cursor-pointer text-xs flex items-center gap-1',
                  isConsoleOpen
                    ? 'bg-card border-primary/40 text-foreground'
                    : 'bg-muted/50 border-border/60 text-muted-foreground hover:text-foreground'
                )}
                title="Toggle Console Tray"
              >
                <Terminal className="size-3.5 text-primary" />
                <span className="text-2xs font-mono hidden md:inline">Console</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {activeProblemIdx < assessment.problems.length - 1 ? (
                <button
                  onClick={() => {
                    setActiveProblemIdx((prev) => prev + 1);
                    setTestResults(null);
                  }}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-card border border-border text-foreground hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <span>Next Question</span>
                  <ChevronRight className="size-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-2xs border-0"
                >
                  <Send className="size-3.5" />
                  <span>Submit Entire Assessment</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── FINAL SUBMISSION CONFIRMATION MODAL ───────────── */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border p-6 rounded-3xl space-y-5 shadow-2xl">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">Submit Online Assessment?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Once submitted, your code will be evaluated against hidden test suites and an integrity diagnostic report will be generated.
              </p>
            </div>

            {/* Assessment Telemetry Audit Summary */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/40 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Time Remaining:</span>
                <span className="font-bold text-foreground">{formatTime(secondsRemaining)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Questions Completed:</span>
                <span className="font-bold text-foreground">
                  {assessment.problems.length}/{assessment.problems.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tab Switches Logged:</span>
                <span className={cn('font-bold', tabSwitchCount > 0 ? 'text-amber-400' : 'text-primary')}>
                  {tabSwitchCount}
                </span>
              </div>
              {largePasteDetected && (
                <div className="text-amber-400 text-2xs pt-1 border-t border-border/40">
                  ⚠️ Large paste operations detected.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer border border-border bg-card"
              >
                Back to Test
              </button>

              <button
                onClick={() => triggerFinalSubmit(false)}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-xs border-0"
              >
                {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                <span>{isSubmitting ? 'Grading Test...' : 'Confirm Submission'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Multi-Modal Proctoring PIP Widget */}
      <ProctorCameraPip
        onViolation={handleProctorViolation}
        onMediaStateChange={({ camera, mic }) => {
          setCameraEnabled(camera);
          setMicEnabled(mic);
        }}
      />
    </div>
  );
}
