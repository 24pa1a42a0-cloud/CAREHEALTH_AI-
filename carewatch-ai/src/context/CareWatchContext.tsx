import React, { createContext, useContext, useState } from 'react';
import { 
  analyzeRollingWindow, 
  generateMockDataset, 
  DeviationAnalysisResult,
  DEFAULT_PATIENT_BASELINE,
  DailyReading
} from '../engine/deviationEngine';

export interface PatientProfile {
  name: string;
  age: string;
  dischargeCondition: string;
}

export interface BaselineMetricData {
  title: string;
  category: string;
  range: string;
  unit: string;
  confidence: number;
  status: 'calibrated' | 'analyzing' | 'drift';
  icon: string;
}

export type AppRole = 'patient' | 'caregiver';

export interface CareWatchContextType {
  patient: PatientProfile;
  baselines: {
    activity: BaselineMetricData;
    sleep: BaselineMetricData;
    voice: BaselineMetricData;
    movement: BaselineMetricData;
  };
  isOnboarded: boolean;
  isAuthenticated: boolean;
  role: AppRole;
  analysisResult: DeviationAnalysisResult | null;
  rawReadings: DailyReading[];
  login: (selectedRole: AppRole, userName?: string) => void;
  logout: () => void;
  setRole: (r: AppRole) => void;
  saveBaselineData: (
    profile: PatientProfile,
    customBaselines?: Partial<CareWatchContextType['baselines']>
  ) => void;
  resetOnboarding: () => void;
  simulateScenario: (scenario: 'normal' | 'declining') => void;
  appendDailyCheckIn: (reading: DailyReading) => void;
}

const defaultBaselines: CareWatchContextType['baselines'] = {
  activity: {
    title: 'Activity',
    category: 'Daily Cadence',
    range: '3,200 - 4,800 steps/day',
    unit: 'steps/day',
    confidence: 96,
    status: 'calibrated',
    icon: 'walk-outline',
  },
  sleep: {
    title: 'Sleep',
    category: 'Circadian Architecture',
    range: '7.2 - 8.5 hrs (92% efficiency)',
    unit: 'hrs/night',
    confidence: 93,
    status: 'calibrated',
    icon: 'moon-outline',
  },
  voice: {
    title: 'Voice',
    category: 'Acoustic Biomarkers',
    range: 'Acoustic clarity 94% (jitter < 1.2%)',
    unit: 'stability',
    confidence: 91,
    status: 'calibrated',
    icon: 'mic-outline',
  },
  movement: {
    title: 'Movement',
    category: 'Gait & Posture Balance',
    range: 'Gait velocity 0.90 - 1.05 m/s',
    unit: 'velocity',
    confidence: 95,
    status: 'calibrated',
    icon: 'body-outline',
  },
};

const defaultProfile: PatientProfile = {
  name: 'Eleanor Vance',
  age: '78',
  dischargeCondition: 'Post-Op Cardiac Surgery',
};

const CareWatchContext = createContext<CareWatchContextType | undefined>(undefined);

export const CareWatchProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [patient, setPatient] = useState<PatientProfile>(defaultProfile);
  const [baselines, setBaselines] = useState(defaultBaselines);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<AppRole>('patient');
  
  const [rawReadings, setRawReadings] = useState<DailyReading[]>([]);
  const [analysisResult, setAnalysisResult] = useState<DeviationAnalysisResult | null>(null);

  const login = (selectedRole: AppRole, userName?: string) => {
    setRole(selectedRole);
    if (userName && userName.trim().length > 0) {
      setPatient(prev => ({ ...prev, name: userName.trim() }));
    }
    setIsAuthenticated(true);
    if (!analysisResult) {
      simulateScenario('normal');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const simulateScenario = (scenario: 'normal' | 'declining') => {
    const dataset = generateMockDataset(scenario, { baseline: DEFAULT_PATIENT_BASELINE });
    setRawReadings(dataset);
    const result = analyzeRollingWindow(dataset, DEFAULT_PATIENT_BASELINE);
    setAnalysisResult(result);
  };

  const appendDailyCheckIn = (reading: DailyReading) => {
    setRawReadings((prev) => {
      // Keep a rolling 7-day window
      const updated = [...prev, reading];
      if (updated.length > 7) {
        updated.shift();
      }
      // Re-run the engine
      const result = analyzeRollingWindow(updated, DEFAULT_PATIENT_BASELINE);
      setAnalysisResult(result);
      return updated;
    });
  };

  const saveBaselineData = (
    profile: PatientProfile,
    customBaselines?: Partial<CareWatchContextType['baselines']>
  ) => {
    setPatient(profile);
    if (customBaselines) {
      setBaselines((prev) => ({ ...prev, ...customBaselines }));
    }
    setIsOnboarded(true);
    simulateScenario('declining'); // As per earlier prompts, trigger declining on onboard completion for demo
  };

  const resetOnboarding = () => {
    setIsOnboarded(false);
    setAnalysisResult(null);
    setRawReadings([]);
  };

  return (
    <CareWatchContext.Provider
      value={{
        patient,
        baselines,
        isOnboarded,
        isAuthenticated,
        role,
        analysisResult,
        rawReadings,
        login,
        logout,
        setRole,
        saveBaselineData,
        resetOnboarding,
        simulateScenario,
        appendDailyCheckIn,
      }}
    >
      {children}
    </CareWatchContext.Provider>
  );
};

export const useCareWatch = (): CareWatchContextType => {
  const context = useContext(CareWatchContext);
  if (!context) {
    throw new Error('useCareWatch must be used within a CareWatchProvider');
  }
  return context;
};

