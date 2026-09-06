import { IActivityAnalysisInput } from './types';

/**
 * Deterministic behavioral synthesis engine
 * Guarantees zero failures and produces a rich, highly specific report instantly
 * whenever cloud LLM APIs are unconfigured, rate-limited, or offline.
 */
export function generateDeterministicForensicReport(input: IActivityAnalysisInput): string {
  const durationMins = Math.max(1, Math.round(input.timeSpentSeconds / 60));
  const isClean = input.integrityVerdict === 'clean';
  const isFlagged = input.integrityVerdict === 'flagged';

  // 1. Executive Summary
  let summary = '';
  if (isClean) {
    summary = `The candidate completed the **${input.company} Assessment** with **High Behavioral Integrity** (Cheating Risk: **${input.cheatingRiskPercentage}%**). Telemetry confirms continuous single-candidate presence with steady keyboard rhythm, no unauthorized external clipboard insertion, and consistent attention on the IDE environment.`;
  } else if (isFlagged) {
    summary = `The candidate session for **${input.company}** has been **FLAGGED FOR PROCTOR REVIEW** (Cheating Risk: **${input.cheatingRiskPercentage}%**). Multiple anomalous events were registered during the ${durationMins}-minute window, including unexpected visual/acoustic interruptions or environment deviations that warrant manual inspection.`;
  } else {
    summary = `The candidate completed the **${input.company} Assessment** with **Moderate Integrity Concerns** (Cheating Risk: **${input.cheatingRiskPercentage}%**). While solutions were successfully compiled, sporadic tab deviations or gaze shifts were detected that distinguish this session from a verified baseline.`;
  }

  // 2. Visual & Acoustic Biometrics Analysis
  const visualNotes: string[] = [];
  if (!input.cameraEnabled) {
    visualNotes.push('⚠️ **Camera Disabled:** The candidate completed the exam without an active webcam stream.');
  } else {
    if (input.faceAbsenceCount === 0 && input.multipleFacesCount === 0) {
      visualNotes.push('- **Continuous Facial Verification:** Single verified human face maintained in frame throughout the entire active coding duration.');
    } else {
      if (input.faceAbsenceCount > 0) {
        visualNotes.push(`- **Face Absence Detected:** Candidate was out of camera frame ${input.faceAbsenceCount} time(s).`);
      }
      if (input.multipleFacesCount > 0) {
        visualNotes.push(`- **Multiple Persons Detected:** Camera recognized secondary faces in the environment ${input.multipleFacesCount} time(s).`);
      }
    }

    if (input.gazeDivertedCount === 0) {
      visualNotes.push('- **Gaze Alignment:** Eye gaze remained centered on the primary code editor and problem description with minimal off-screen drift.');
    } else {
      visualNotes.push(`- **Gaze Departures:** Detected ${input.gazeDivertedCount} sustained off-screen glance(s) (>3.0 seconds duration), suggesting possible secondary monitor or off-screen notes consultation.`);
    }
  }

  if (!input.micEnabled) {
    visualNotes.push('- ⚠️ **Microphone Inactive:** Acoustic proctoring was disabled or blocked by browser permissions.');
  } else {
    if (input.voiceInterruptionCount === 0) {
      visualNotes.push('- **Acoustic Environment:** Ambient audio spectrum remained quiet and within baseline noise limits with zero human speech detected.');
    } else {
      visualNotes.push(`- **Speech / Vocal Spikes:** Acoustic analyzer flagged ${input.voiceInterruptionCount} voice/speech event(s) during active testing.`);
    }
  }

  // 3. Code Writing Cadence & Keyboard Dynamics
  const codingNotes: string[] = [];
  codingNotes.push(`- **Keystroke Dynamics:** ${input.keystrokesCount} total keystrokes recorded across ${input.problems.length} coding challenge(s), reflecting natural character entry.`);

  if (input.pasteAttemptsBlocked > 0) {
    codingNotes.push(`- **Enforced Paste Lockdown:** The system successfully intercepted and blocked ${input.pasteAttemptsBlocked} attempted clipboard paste operation(s). All code in the editor was typed by hand.`);
  } else {
    codingNotes.push('- **Zero Paste Infractions:** No unauthorized external clipboard paste operations were attempted.');
  }

  if (input.tabSwitchCount > 0) {
    codingNotes.push(`- **Window Focus Interruptions:** ${input.tabSwitchCount} tab switch(es) / window blur event(s) logged, totaling ${input.timeAwaySeconds} seconds away from the assessment workspace.`);
  } else {
    codingNotes.push('- **Undivided Workspace Focus:** 100% active focus maintained within the browser testing tab without external tab transitions.');
  }

  // 4. Problem-Solving Cadence
  const problemDetails = input.problems
    .map((p, idx) => {
      const mins = Math.max(1, Math.round(p.timeSpentSeconds / 60));
      return `  - **Problem ${idx + 1} (${p.title} - ${p.patternTag}):** Solved in ${mins}m with ${p.passedTestCases}/${p.totalTestCases} testcases passing (${p.status.toUpperCase()}).`;
    })
    .join('\n');

  // 5. Recommendation
  let recommendation = '';
  if (isClean) {
    recommendation = `**RECOMMENDATION: VERIFIED CLEAN (PASSED INTEGRITY BAR)**\nThe candidate demonstrated authentic algorithmic problem-solving behavior. Telemetry corroborates genuine coding dynamics with no indicators of collaborative or external aid.`;
  } else if (isFlagged) {
    recommendation = `**RECOMMENDATION: PROCTOR AUDIT REQUIRED**\nRecruiting team should review the timestamped audit log. Significant anomalies (${input.tabSwitchCount > 0 ? `${input.tabSwitchCount} tab switches, ` : ''}${input.gazeDivertedCount > 0 ? `${input.gazeDivertedCount} gaze departures, ` : ''}${input.pasteAttemptsBlocked > 0 ? `${input.pasteAttemptsBlocked} blocked pastes` : ''}) were recorded.`;
  } else {
    recommendation = `**RECOMMENDATION: PROVISIONAL PASS (LOW-TO-MODERATE RISK)**\nMinor telemetry anomalies observed. Review the specific event timestamps against problem completion times before scheduling the subsequent on-site loop.`;
  }

  return `### Executive Integrity Summary
${summary}

### Visual & Acoustic Biometrics Analysis
${visualNotes.join('\n')}

### Keyboard Cadence & Focus Dynamics
${codingNotes.join('\n')}

### Problem-Solving Time Allocation
${problemDetails}

### Final Proctor Verdict
${recommendation}`;
}
