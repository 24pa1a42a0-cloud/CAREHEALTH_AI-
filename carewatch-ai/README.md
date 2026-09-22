# CAREHEALTH AI - CareWatch Prototype
A comprehensive Hackathon prototype built with React Native (Expo) and TypeScript.

This repository contains the complete implementation of the CareWatch AI app, featuring a custom biometric deviation engine, dynamic patient/caregiver dashboards, and role-based authentication flows.

## Core Features Implemented:
1. **Auth & Routing**: Role-based access (Patient/Caregiver) driving conditional navigation stacks.
2. **Patient Dashboard**: Dynamic status, real-time SVG sparklines, and a comprehensive daily check-in flow.
3. **Daily Check-In & Camera**: Integrated Expo camera for physical posture checks, mock voice recorders, and activity sliders.
4. **Deviation Engine**: A pure TypeScript mathematical core that takes baseline biometric profiles (Activity, Sleep, Voice, Movement) and computes a weighted Personal Deviation Score (0-100).
5. **Persistence Alerting**: The engine flags a clinical anomaly *only* if the deviation breaks a threshold for 2+ consecutive days.
6. **Caregiver Portal**: Triage cohort list mapping to individual patient alert details, score trajectories, and escalation workflows.


# Walkthrough: Onboarding Screen & Baseline Learning Sequence

We have built and verified the Onboarding screen featuring an intake form, an animated "Learning your baseline..." sequence with 4 progressively revealed metric cards (Activity, Sleep, Voice, Movement) settling into calibrated ranges, and global state persistence via React Context.

---

## 1. Components & Architecture

### State Management ([CareWatchContext.tsx](file:///c:/Users/anjal/OneDrive/Desktop/IQOO/carewatch-ai/src/context/CareWatchContext.tsx))
Provides app-wide state for:
- `patient`: `{ name: string, age: string, dischargeCondition: string }`
- `baselines`: Baseline metrics for Activity, Sleep, Voice, and Movement.
- `saveBaselineData(profile, customBaselines)`: Updates state and sets `isOnboarded: true`.

### Onboarding Flow ([OnboardingScreen.tsx](file:///c:/Users/anjal/OneDrive/Desktop/IQOO/carewatch-ai/src/screens/OnboardingScreen.tsx))

#### Stage 1: Clinical Intake Form
- **Headings**: Editorial styling with `Fraunces_700Bold` ("Patient Intake Profile").
- **Body & Labels**: Clean styling with `Inter_400Regular` and `Inter_500Medium`.
- **Form Controls**:
  - Name input (e.g. "Eleanor Vance")
  - Age input (numeric keyboard)
  - Discharge condition selector dropdown (modal overlay with 6 recovery conditions, including Post-Op Cardiac Surgery, Joint Replacement, Stroke Rehab, Fall Risk, etc.)
  - Input validation banner for incomplete or invalid entries
  - CTA Button: "Calibrate My Baseline"

#### Stage 2: Animated "Learning your baseline..." Sequence
- **Pulse/Radar Scanner**: Looping scale pulse animation (`Animated.loop`).
- **Headings**: `Fraunces_700Bold` ("Learning your baseline...").
- **Body**: `Inter_400Regular` dynamically referencing the patient name and chosen discharge condition.
- **Progress Bar**: Continuous animated track updating from 0% to 100%.
- **Progressively Revealed Metric Cards**:
  1. **Activity** (at 500ms): Icon `walk-outline`, transitions from analyzing to settled placeholder `"3,200 – 4,800 steps/day"` with `"CALIBRATED"` badge in `#2D6A4F`.
  2. **Sleep** (at 1400ms): Icon `moon-outline`, settles into `"7.2 – 8.5 hrs (92% efficiency)"`.
  3. **Voice** (at 2300ms): Icon `mic-outline`, settles into `"Acoustic stability: 94%"`.
  4. **Movement** (at 3200ms): Icon `body-outline`, settles into `"Gait velocity: 0.90 – 1.05 m/s"`.
- **Completion Banner & CTA**:
  - Displays "Baseline Established" and confirmation banner.
  - "Enter CareWatch AI Dashboard" button saves data to `CareWatchContext` and navigates to `Home`.

---

## 2. Dynamic Integration Across Screens

- **[HomeScreen.tsx](file:///c:/Users/anjal/OneDrive/Desktop/IQOO/carewatch-ai/src/screens/HomeScreen.tsx)**: Displays the calibrated patient name, recovery protocol, and updated baseline status.
- **[BaselineScreen.tsx](file:///c:/Users/anjal/OneDrive/Desktop/IQOO/carewatch-ai/src/screens/BaselineScreen.tsx)**: Automatically references the patient name and discharge condition.
- **[CaregiverDashboardScreen.tsx](file:///c:/Users/anjal/OneDrive/Desktop/IQOO/carewatch-ai/src/screens/CaregiverDashboardScreen.tsx)**: Updates patient name, avatar initials, age, and recovery protocol dynamically.

---

## 3. Verification Results

### TypeScript Type-Checking
```powershell
npx tsc --noEmit
```
- **Result**: Passed with **0 errors**.

### Metro Bundler Compilation
```powershell
npx expo export -p android
```
- **Result**: Bundled successfully with **977 modules** and all Google Fonts without issues.

---

## 4. Deviation Engine Core Logic & Testing

We have built a pure TypeScript algorithmic core for CareWatch AI that assesses a patient's biometric deviations against their established baseline.

### Engine Architecture ([deviationEngine.ts](file:///c:/Users/anjal/OneDrive/Desktop/IQOO/carewatch-ai/src/engine/deviationEngine.ts))
- **Deviation Computation**: Uses z-scores based on `mean` and `stddev` for Activity, Sleep, Voice, and Movement.
- **Weighted Scoring**: Normalizes standard deviations into a `0-100` **Personal Deviation Score**, heavily penalizing deviations over 2σ.
- **Signal Weighting**: Default weights are Activity (35%), Sleep (35%), Movement (20%), and Voice (10%).
- **Persistence Alerting**: Implements a rolling window to check if a patient's deviation score continuously exceeds an alert threshold for 2+ consecutive days, mitigating false positives.

### Mock Data Generator
Included in the engine is a robust mock data generator to simulate app usage:
- `generateMockNormalWeek(baseline)`: Creates 7 days of readings hovering safely around the mean ($\pm1\sigma$).
- `generateMockDecliningWeek(baseline)`: Creates 7 days of readings that progressively deteriorate, simulating sleep disturbances, decreased activity, and compromised gait to eventually trigger an alert.

### Test Suite ([deviationEngine.test.ts](file:///c:/Users/anjal/OneDrive/Desktop/IQOO/carewatch-ai/test/deviationEngine.test.ts))
- Configured Node 24's native `--experimental-strip-types` test runner.
- **12 unit tests** implemented and passing, verifying:
  - Perfect baselines scoring exactly `0`.
  - Negative impact bounds scaling properly to a `0-100` score.
  - Multi-day persistence thresholds accurately returning `alertActive: true` only after 2+ days above the critical threshold.
- Verified test runner executes at high speed (~15ms completion).

---

## 5. UI Integration of the Deviation Engine

We've wired the deviation engine directly into the app's global state and UI surfaces to demonstrate real-time scoring and alerting based on simulated longitudinal data.

### Global State (`CareWatchContext.tsx`)
- Added `analysisResult` to the context to hold the `DeviationAnalysisResult`.
- Exposed a `simulateScenario('normal' | 'declining')` function.
- **Auto-Simulation**: The context now automatically runs a `declining` scenario (7 days of progressively deteriorating metrics) upon completion of the Onboarding flow.

### Home Screen (`HomeScreen.tsx`)
- **Top Status Card**: Dynamically shows "Everything looks normal" or "We noticed a change" based on the engine's persistence output, styled intelligently with success/alert colors.
- **Biometric Signals Grid**: Displays the four core signals (Activity, Sleep, Voice, Movement) using custom-built SVG **Sparklines** (`react-native-svg`) to visualize the patient's 7-day trend from the deviation engine's daily results.
- **Daily Check-In Modal**: A prominent button launches a mock voice recording modal. It features a 10-second countdown timer for voice analysis and an interactive fallback `<Slider>` (`@react-native-community/slider`) to log daily activity manually.

### Baseline Screen (`BaselineScreen.tsx`)
- **Interactive Biometric Tabs**: Implemented an intuitive top-level tab selector (Activity, Sleep, Voice, Movement) allowing caregivers to drill into specific biometric categories.
- **Custom SVG Chart (`BaselineChart.tsx`)**: Built a fully custom React Native SVG line chart that graphically projects the patient's 7-day values relative to a shaded `mean ± 1σ` normative band.
- **Dynamic Captions**: Beneath the chart, a plain-language summary automatically translates complex deviation percentages into readable text (e.g., "Your activity today is 58% below your usual range").
- **Visual Identity**: Extensively implemented the `Space Grotesk` font family for headings across this screen to create a distinct, data-centric visual hierarchy separate from the Home screen.

### Alerts Screen (`AlertsScreen.tsx`)
- **Large Score Badge**: A prominent circular badge visualizes the composite Personal Deviation Score (0-100), using color-coded borders (Critical, Warning, Normal) to instantly communicate the patient's status.
- **Directional Breakdowns**: The four primary metrics (Activity, Sleep, Voice, Movement) are mapped into individual cards showing calculated directional indicators (e.g., `↓58%`, `Elevated`, `Stable`) derived from the engine's real-time standard deviation analysis.
- **Expandable Evidence Accordion**: An interactive "Why was this alert generated?" list translates numeric deviations into plain-language clinical evidence (e.g., "Activity changed by 58%, indicating a significant deviation from normal mobility patterns").
- **Caregiver Integration & Disclaimers**: Features a bold "Notify Caregiver" call-to-action that bridges the patient-facing app to the Caregiver Dashboard, anchored by a persistent medical disclaimer banner ("Early-warning signal, not a diagnosis").
### Caregiver Dashboard (`CaregiverDashboardScreen.tsx`)
- **Triage Cohort List**: Rebuilt to display a multi-patient list (seeded with two mock profiles). Each patient card features colored status chips (Normal, Watch, Alert) tied to their current deviation state.
- **Detailed Clinical View**: Tapping a patient transitions the view into a detailed alert profile (matching the patient's Alert Screen), augmented by a **7-Day Score Trajectory** chart (`BaselineChart.tsx`).
- **Interactive Escalation Workflows**: Added functional "Mark as Reviewed" and "Escalate" buttons at the top of the patient's profile that instantly update their local status state and UI accent colors across the dashboard.
### Settings & App Management (`SettingsScreen.tsx`)
- **Role Toggle Mechanism**: Developed a unified interface to instantly swap the user persona between "Patient" and "Caregiver". This seamlessly rewires the `RootNavigator`'s initial route conditionally via `CareWatchContext`.
- **Demo State Drivers**: Exposed quick-actions to simulate a "Normal Week", simulate a "Declining Week" (to trigger deviations), or completely factory-reset the onboarding flow for seamless demo repeatability.
- **Mock Notifications**: Included functional aesthetic toggles for push alerts, summaries, and SOS fall detection.

### Authentication & Routing (`LoginScreen.tsx` & `RootNavigator.tsx`)
- **Protected Routing**: Implemented an Auth Stack using conditional rendering in `RootNavigator.tsx`. If `isAuthenticated` is false, users are strictly gated to the `LoginScreen`.
- **Login Experience**: Built a dual-mode login supporting both standard email/password and a mock OTP (One-Time Password) entry. The screen leverages the requested typography (Fraunces for branding/headings, Inter for inputs).
- **Role-Based Auth Integration**: The Patient/Caregiver role toggle on the login screen injects the chosen persona directly into `CareWatchContext` on submit, skipping the settings step for a more authentic entry flow.

### Daily Submit Flow & Camera (`SubmitScreen.tsx` & `CameraCapture.tsx`)
- **Dynamic Check-In Form**: Designed a comprehensive scrollable form combining 4 modalities: a mock 10-second voice recorder, an activity slider, sleep quality quick-selects, and a native camera integration.
- **Expo Camera Module**: Built a reusable `CameraCapture` component using `expo-camera`. It natively requests permissions (with plain-language rationale), handles denial states via fallback skips, displays a live preview, and provides a shutter/review/retake loop.
- **Live Engine Wiring**: The Submit flow is natively bound to `appendDailyCheckIn` in the `CareWatchContext`. Instead of static simulations, user inputs are dynamically converted to biometric coordinates, pushed into the 7-day rolling window, and evaluated by the `deviationEngine` in real-time, instantly adjusting the Patient Dashboard and Alert States.

### Typography & Visual QA
- **Strict Font Alignment**: Completed a comprehensive visual sweep. `Fraunces` anchors the editorial-style Home and Alerts views. `Space Grotesk` drives the analytical Baseline view. `Inter` acts as the uniform, clean workhorse across the Caregiver Dashboard, Settings, Privacy, and all body content.
- **Consistent Elevation & Radii**: Unified all interactive surfaces using a global `Card.tsx` wrapper (`16px` border radius, controlled shadows, matching Paddings).
