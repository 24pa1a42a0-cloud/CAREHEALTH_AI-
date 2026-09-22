# Hackathon Completion Plan: Auth, Camera, and Dynamic Submission

We've already successfully built out the core scaffold, the Deviation Engine, the Dashboards, and the settings (covering the equivalent of your Prompts 1, 3, and parts of 6). To complete the remaining items in your master plan, we need to implement the Auth Stack, the Camera Module, and the Dynamic Submit Flow.

## Proposed Changes

### 1. Authentication Stack (Prompt 2)
- **State Management**: Add `isAuthenticated` and `login(role)` / `logout()` methods to `CareWatchContext`.
- **Routing**: Update `RootNavigator.tsx` to conditionally render an Auth Stack (`LoginScreen`, `SignupScreen`) if the user is not authenticated.
- **Login Screen**: Build `LoginScreen.tsx` featuring:
  - Patient / Caregiver role toggle at the top (Fraunces heading).
  - Email/password inputs with inline validation (Inter font).
  - "Continue with OTP" mock toggle.
  - On submit, updates the global context and routes to the correct dashboard.

### 2. Camera Integration (Prompt 4)
- **Dependency**: Run `npx expo install expo-camera`.
- **Component**: Build `src/components/CameraCapture.tsx`.
  - On mount, requests permissions and explains why ("We use this to analyze daily physical changes...").
  - Handles denied permissions gracefully with a "Skip photo" fallback.
  - Features a live preview, shutter button, and a Retake/Confirm review step that passes the local photo URI back to the parent.

### 3. Submit Screen & Engine Wiring (Prompts 5 & 6)
- **Screen**: Build `SubmitScreen.tsx`.
  - A scrollable form consolidating 4 steps: Voice recording (10s mock), Activity Slider, Sleep Quality select (Good/Fair/Poor), and the `CameraCapture` component.
  - A final "Review & Submit" state.
- **Engine Wiring**: Update `CareWatchContext.tsx` to include an `appendDailyCheckIn(data)` function.
  - Instead of replacing all data with a mock scenario, this will inject the user's live inputs into the 7-day array, shifting older data out.
  - The `deviationEngine` will recalculate the Personal Deviation Score instantly.
  - If the user submits 2 declining days in a row, the `AlertsScreen` and `CaregiverDashboard` will automatically reflect the triggered persistence alert.

## Verification Plan
1. **Build Verification**: Run `npx tsc --noEmit` to ensure type safety across the new Auth and Camera modules.
2. **End-to-End Flow**: Verify the routing constraint (Login -> Patient Dashboard -> Submit Check-In -> Dashboard Updates -> Trigger Alert).
3. **Visual QA**: Sweep the new screens to ensure Fraunces and Inter fonts are used exactly as requested.

## User Review Required
> [!IMPORTANT]
> Adding `expo-camera` will require an Expo server restart and installing native modules. Once you approve this plan, I will handle the installation, build the screens, and wire the entire end-to-end data flow automatically.
