# Enterprise Dual-Engine Neural Proctoring Architecture

> Comprehensive specification for BigO's client-side, real-time multimodal exam proctoring, neural biometric tracking, computer vision anti-cheat pipeline, and automated behavioral forensic analysis.

---

## 1. Architectural Overview

BigO incorporates an enterprise-grade proctoring subsystem engineered specifically for algorithmic technical interviews and timed Online Assessments (OAs). The system guarantees exam integrity without requiring intrusive native desktop installations or kernel-level drivers.

All biometric and computer vision inferences execute **strictly client-side** using browser-accelerated hardware engines (**WebGL / WebAssembly** via TensorFlow.js), maintaining candidate privacy and ultra-low latency while eliminating heavy video streaming costs.

```
                               ┌────────────────────────────────────────────────┐
                               │             Webcam Video Stream                │
                               │          (30 FPS / 640x480 Raw Feed)           │
                               └───────────────────────┬────────────────────────┘
                                                       │
                               ┌───────────────────────▼────────────────────────┐
                               │           Hidden Analysis Canvas               │
                               │              (320x240 Resampled)               │
                               └───────────┬────────────────────────┬───────────┘
                                           │                        │
               ┌───────────────────────────▼───────────┐            │
               │        Fast Biometrics Loop           │            │
               │            (Every 180ms)              │            │
               │  Google BlazeFace (WebGL Inference)   │            │
               │  - Face Presence & Count              │            │
               │  - 6 3D Facial Landmarks              │            │
               │  - Geometric Head Pose (Yaw / Pitch)  │            │
               │  - Eye-Distance Scale Analysis        │            │
               │  - Gaze Vector & Screen Centering     │            │
               └───────────────────┬───────────────────┘            │
                                   │                                │
                                   │ [Candidate Verified]           │
                                   │                                │
                                   │            ┌───────────────────▼───────────┐
                                   │            │     Throttled Object Loop     │
                                   │            │         (Every 450ms)         │
                                   │            │  COCO-SSD MobileNet-v2 (TFJS) │
                                   │            │  - Prohibited Mobile Phones   │
                                   │            │  - Physical Books & Notes     │
                                   │            │  - Secondary Monitors/Screens │
                                   │            │  - Peripheral Person Count    │
                                   │            └───────────────────┬───────────┘
                                   │                                │
                                   ├────────────────────────────────┘
                                   │
               ┌───────────────────▼────────────────────────────────────────────┐
               │                Proctoring Fusion State Engine                  │
               │  - Strict Face-Presence Guards (Empty frame false-alarm block) │
               │  - Multi-Zone Spatial Clustering Exclusion                     │
               │  - 2.2-Second Debounce & Violation Persistence                 │
               │  - Web Audio API Decibel & Acoustic Analysis                   │
               │  - Tab Switch / Focus / Fullscreen Blur Interceptors           │
               └───────────┬────────────────────────────────────────┬───────────┘
                           │                                        │
             ┌─────────────▼───────────────┐          ┌─────────────▼───────────────┐
             │       Interactive HUD       │          │   Tamper-Evident Evidence   │
             │   - SVG Biometric Mesh      │          │   - Cloudflare R2 Uploads   │
             │   - Real-time Alert Badges  │          │   - Chronological Timeline  │
             │   - Face Confidence Gauge   │          │   - Audit Telemetry Events  │
             │   - Acoustic Decibel Meter  │          │   - Automated LLM Forensic  │
             └─────────────────────────────┘          └─────────────────────────────┘
```

---

## 2. Dual-Loop Execution Pipeline

To maintain a fluid 60 FPS user interface while running complex deep-learning models in the browser, BigO divides visual inspection into two independent, asynchronously scheduled loops:

### 2.1 The Fast Biometrics Loop (180ms Interval ~5-6 FPS)
- **Engine**: Google BlazeFace (Lightweight SSD-like architecture with 6 3D keypoints).
- **Target**: Candidate presence, facial count, head pose, and eye gaze tracking.
- **Latency**: Sub-30ms execution on standard integrated GPUs (Intel Iris, Apple Silicon, AMD Radeon).
- **Output**: Real-time bounding box, head yaw/pitch angles, in-screen bounding percentage, and landmark coordinates (`rightEye`, `leftEye`, `noseTip`, `mouthCenter`, `rightEar`, `leftEar`).

### 2.2 The Throttled Object Loop (450ms Interval ~2 FPS)
- **Engine**: COCO-SSD (Single Shot MultiBox Detector with MobileNet-v2 backbone).
- **Target**: Prohibited hardware devices and physical cheating materials:
  - `cell phone` (smartphones, handheld displays)
  - `remote` (high-frequency alias for angled mobile devices)
  - `book` (printed cheat sheets, physical textbooks, revision notebooks)
  - `person` (secondary individuals standing or seated in background)
  - `laptop` / `tv` (unauthorized secondary displays)
- **Resource Optimization**: Yields CPU/GPU cycles between evaluations, ensuring that candidate code compilation, typing in Monaco Editor, and test execution never experience frame drops.

---

## 3. Computer Vision Engines & Algorithms

### 3.1 Google BlazeFace Facial Biometrics (`neural-face-detector.ts`)

BlazeFace is trained specifically for mobile and front-facing cameras. It produces 6 distinct 3D landmarks for every detected face:
- Landmark 0: Right Eye
- Landmark 1: Left Eye
- Landmark 2: Nose Tip
- Landmark 3: Mouth Center
- Landmark 4: Right Ear Tragus
- Landmark 5: Left Ear Tragus

#### Head Yaw & Pitch Geometric Pose Estimation:
Rather than relying on inaccurate heuristic color thresholds, BigO calculates mathematical spatial ratios between the detected eye coordinates and nose tip:
$$\text{midEyeX} = \frac{x_{\text{rightEye}} + x_{\text{leftEye}}}{2}, \quad \text{midEyeY} = \frac{y_{\text{rightEye}} + y_{\text{leftEye}}}{2}$$
$$\text{eyeDistance} = \sqrt{(x_{\text{leftEye}} - x_{\text{rightEye}})^2 + (y_{\text{leftEye}} - y_{\text{rightEye}})^2}$$
$$\text{YawRatio} = \frac{x_{\text{nose}} - \text{midEyeX}}{\text{eyeDistance}}$$
$$\text{PitchRatio} = \frac{y_{\text{nose}} - \text{midEyeY}}{\text{eyeDistance}}$$

- **Yaw Threshold ($|\text{YawRatio}| > 0.46$)**: Triggered when the candidate turns their head left or right away from the coding surface.
- **Pitch Threshold ($\text{PitchRatio} > 0.88$ or $< 0.12$)**: Triggered when the candidate tilts their head down toward their lap (classic phone concealment posture) or looks upward.
- **Occlusion/Hand Detection**: If a significant skin pixel cluster is detected across the center canvas but BlazeFace yields zero facial landmarks, the candidate is flagged for covering their face or camera.

### 3.2 COCO-SSD Prohibited Device Detection (`neural-device-detector.ts`)

- Detects 80 everyday object classes.
- **Tilted Phone Compensation**: Handheld smartphones tilted away from the camera can produce lower neural activation. BigO evaluates predictions down to $0.20$ confidence, while applying class-specific calibrated gating:
  - `cell phone` $\ge 0.32$ confidence $\rightarrow$ Prohibited Phone violation.
  - `remote` $\ge 0.42$ confidence $\rightarrow$ Angled mobile phone alias.
  - `book` $\ge 0.40$ confidence $\rightarrow$ Unauthorized physical study material.
  - `person` $\ge 0.50$ confidence (Count $\ge 2$) $\rightarrow$ Multiple people in assessment room.

### 3.3 Spatial Multi-Zone Optical Fallback (`device-analyzer.ts`)

For devices without WebGL support or low-powered hardware, BigO includes a custom optical fallback engine running at $160 \times 120$ resolution:
- **Head & Torso Exclusion Zone**: Dynamically creates an exclusion bounding box around the candidate's verified head and collar coordinates ($x \pm 75\%$, $y \pm 85\%$). This completely prevents candidate hair, dark clothing, glasses, or beards from registering as dark phone bezels.
- **Peripheral Multi-Zone Partitioning**: Divides peripheral space into three independent analysis clusters:
  1. *Left Peripheral Zone* ($x < \text{candidateLeft}$)
  2. *Right Peripheral Zone* ($x > \text{candidateRight}$)
  3. *Lower Chest / Desk Zone* ($y > \text{candidateBottom}$)
- **Aspect Ratio & Density Verification**: Only flagged if a dense rectangular cluster matches standard smartphone aspect ratios ($1.25$ to $2.6$) with fill density $> 35\%$.

---

## 4. Edge Case Handling & Anti-False-Positive Guards

Real-world proctoring environments suffer from frequent false positives (e.g., high-back office chairs mistaken for phones, candidate walking away triggering device alerts). BigO implements strict mitigation logic:

| Challenge | Root Cause | BigO Solution |
| --- | --- | --- |
| **Empty Frame Phone Alert** | Candidate leaves desk; shadows or empty chair bezels look like rectangular devices. | **Strict Face-Presence Guard**: Object analysis is strictly contingent on active candidate presence (`faceStatus === 'verified'`). If no face is detected, phone detection is immediately bypassed. |
| **Notification Flashing** | Borderline neural scores fluctuating frame-by-frame ($0.29 \leftrightarrow 0.33$). | **2.2-Second Alert Persistence Timer**: Once a violation is triggered, the HUD warning state locks for a minimum of 2200ms before decaying. |
| **Eyeglasses / Hair Flagging** | Dark rim glasses or long dark hair classified as dark phone casing. | **Spatial Exclusion Radius**: Geometric exclusion zone dynamically calculated from BlazeFace eye coordinates suppresses all optical checks inside candidate facial boundary. |
| **React Strict Mode Leak** | Duplicate mounting in dev causes multiple WebGL model instances, crashing browser GPU context. | **Singleton Promise Pattern**: `initNeuralFaceModel()` and `initNeuralDeviceModel()` share cached singleton promises across component re-renders. |
| **Memory / Tensor Bloat** | Uncollected WebGL tensors from canvas drawing leaking VRAM. | Explicit execution wrappers disposing intermediary memory buffers. |

---

## 5. Acoustic & Environmental Audio Analysis (`acoustic-analyzer.ts`)

Visual tracking is paired with acoustic telemetry using the native browser **Web Audio API**:
- **FFT Audio Frequency Node**: Resamples microphone input into 256 frequency bins.
- **Root-Mean-Square (RMS) Energy**:
  $$\text{RMS} = \sqrt{\frac{1}{N} \sum_{i=0}^{N-1} A[i]^2}$$
- **Voice Interruption Trigger**: Ambient background baseline is calibrated during session onboarding. Sustained RMS volume spikes above threshold ($> 35\%$) trigger `voice_detected` telemetry events, capturing potential third-party prompting or dictation.

---

## 6. Real-Time HUD (Heads-Up Display) Interface

The candidate camera window (`components/oa/ProctorCameraPip.tsx`) features an interactive, draggable Picture-in-Picture display with real-time feedback:

- **Biometric Landmark Mesh Overlay**: Dynamic SVG wireframe highlighting the candidate's eyes, nose bridge, jawline, and gaze vector in real time.
- **Confidence Gauge**: 0–100% biometric visual confidence bar indicating whether the candidate is properly framed within the camera aperture.
- **State Indicators**:
  - 🟢 **Optimal / Centered**: Face verified, gaze centered, single individual.
  - 🟡 **Gaze Diverted**: Candidate looking away from monitor for $> 3$ seconds.
  - 🟠 **Low Light / Partial**: Camera obstructed, poor lighting, or candidate too far from lens.
  - 🔴 **Multiple Faces**: Secondary individual detected in webcam view.
  - 🚨 **Prohibited Material**: Smartphone or textbook detected in candidate's hands.
  - ⚠️ **Missing Face**: Candidate has stepped away from testing station.

---

## 7. Storage, Evidence Vault & Cloudflare R2 Integration (`storage.ts`)

When critical infractions occur (e.g. secondary person appears, smartphone detected, fullscreen exited), the system captures an encrypted visual frame:

1. **Lightweight WebP Compression**: Canvas captures are converted to high-efficiency WebP binaries ($< 25\text{ KB}$ per frame).
2. **Native AWS SigV4 Zero-Dependency Upload**:
   - Direct PUT requests to **Cloudflare R2** object storage.
   - Built with native Node.js `crypto` (`createHmac`, `createHash`), eliminating heavy AWS SDK bundle size.
   - Preserves tamper-evident timestamp and submission ID in object key:
     `proctor/{submissionId}/{timestamp}_{eventType}.webp`
3. **Graceful Local Fallback**: In development or offline mode without R2 keys, snapshots degrade gracefully to base64 data URIs stored in MongoDB.

---

## 8. Automated LLM Behavioral Forensic Analysis (`activity-analyzer.ts`)

Upon assessment completion, BigO synthesizes all chronological telemetry events into a comprehensive audit report.

### 8.1 LLM Forensic Engine (`llm-client.ts`)
- **Model**: Llama-3.3-70B via Groq (sub-second response) or Mistral-7B via Hugging Face.
- **Telemetry Payload**:
  - Total time away from screen
  - Tab switches and window blur counts
  - Blocked paste attempts and typing velocity
  - Visual infractions (face absence, secondary people, gaze diversion)
  - Audio spikes and vocal interruptions
  - Problem-solving performance and test pass rates

### 8.2 Deterministic Behavioral Synthesizer (`deterministic-fallback.ts`)
If external cloud AI providers are unavailable, BigO's deterministic engine computes an exact mathematical risk score:
$$\text{RiskScore} = \min(100, \, 25 \times N_{\text{multiFace}} + 30 \times N_{\text{phone}} + 10 \times N_{\text{away}} + 8 \times N_{\text{tab}} + 5 \times N_{\text{paste}})$$

### 8.3 Verdict Categories
- **`CLEAN` (Risk $< 25\%$)**: Honest session with normal developer behavior.
- **`SUSPICIOUS` (Risk $25\% - 65\%$)**: Notable anomalies (frequent tab switches, prolonged gaze diversion). Manual reviewer flagged.
- **`FLAGGED` (Risk $> 65\%$)**: Severe infractions (clear phone usage, secondary person present, unauthorized copy-paste bursts). Candidate disqualified.

---

## 9. Security & Browser Anti-Tampering Measures

- **Fullscreen Enforcement**: Tests require HTML5 Fullscreen mode. Exiting triggers an immediate telemetry event and countdown warning.
- **Clipboard Lockdown**: Paste events into the code editor are intercepted and blocked; large external paste payloads trigger forensic flags.
- **Page Visibility & Focus API**: Intercepts `visibilitychange` and `blur` events to track window minimize, Alt-Tab, or dual-monitor switching.
- **Tamper Resistance**: Inference and event dispatch timers run in background-shielded loops, verifying client timestamps against server clock deltas.
