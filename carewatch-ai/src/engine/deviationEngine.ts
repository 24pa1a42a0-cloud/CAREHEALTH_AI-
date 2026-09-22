/**
 * CareWatch AI - Physiological Baseline Deviation Engine
 * Pure TypeScript module for computing multi-signal biometric deviation,
 * composite Personal Deviation Score (0-100), and 2+ day persistence alerting.
 */

export type SignalType = 'activity' | 'sleep' | 'voice' | 'movement';

export interface SignalBaseline {
  mean: number;
  stddev: number;
  /** Clinical weight in composite score (optional, defaults to clinical weights) */
  weight?: number;
}

export type PatientBaseline = Record<SignalType, SignalBaseline>;

export interface DailyReading {
  /** ISO date string or date label, e.g. '2026-09-20' or 'Day 1' */
  date: string;
  readings: Record<SignalType, number>;
}

export interface SignalDeviation {
  signal: SignalType;
  value: number;
  baselineMean: number;
  baselineStddev: number;
  /** Directional % deviation: ((value - mean) / mean) * 100 */
  percentDeviation: number;
  /** Absolute % deviation: |value - mean| / mean * 100 */
  absolutePercentDeviation: number;
  /** Standard deviation distance: (value - mean) / stddev */
  zScore: number;
  /** Signal risk score scaled 0-100 based on standard deviations */
  signalScore: number;
  /** Effective weight used */
  weight: number;
  /** Weighted contribution to Personal Deviation Score */
  weightedScore: number;
}

export interface DailyScoreResult {
  date: string;
  personalDeviationScore: number;
  signalDeviations: Record<SignalType, SignalDeviation>;
  exceedsThreshold: boolean;
  thresholdUsed: number;
}

export interface PersistenceAlert {
  triggered: boolean;
  consecutiveDaysExceeded: number;
  triggerDate: string | null;
  alertLevel: 'none' | 'warning' | 'critical';
  details: string;
}

export interface EngineConfig {
  /** Score threshold above which a day is considered in deviation (0-100, default: 40) */
  threshold?: number;
  /** Minimum consecutive days required to flag an alert (default: 2) */
  minConsecutiveDays?: number;
  /** Custom weights per signal (defaults: activity 0.25, sleep 0.25, voice 0.20, movement 0.30) */
  weights?: Partial<Record<SignalType, number>>;
}

export interface DeviationAnalysisResult {
  dailyResults: DailyScoreResult[];
  latestScore: number;
  persistenceAlert: PersistenceAlert;
  baselineUsed: PatientBaseline;
  config: Required<EngineConfig>;
}

/** Standard clinical weights reflecting fall risk and physiological deterioration */
export const DEFAULT_WEIGHTS: Record<SignalType, number> = {
  activity: 0.25,
  sleep: 0.25,
  voice: 0.20,
  movement: 0.30,
};

/** Default normative baseline for demo / elder monitoring */
export const DEFAULT_PATIENT_BASELINE: PatientBaseline = {
  activity: { mean: 4000, stddev: 600, weight: 0.25 }, // daily step count
  sleep: { mean: 7.8, stddev: 0.8, weight: 0.25 },     // nocturnal hours
  voice: { mean: 94.0, stddev: 3.5, weight: 0.20 },    // acoustic clarity %
  movement: { mean: 0.98, stddev: 0.12, weight: 0.30 }, // gait velocity (m/s)
};

/**
 * Computes deviation metrics for a single signal reading against baseline.
 */
export function computeSignalDeviation(
  signal: SignalType,
  value: number,
  baseline: SignalBaseline,
  weight: number
): SignalDeviation {
  const { mean, stddev } = baseline;

  // Protect against division by zero
  const safeMean = mean === 0 ? 0.0001 : mean;
  const safeStddev = stddev <= 0 ? 1 : stddev;

  const percentDeviation = ((value - safeMean) / safeMean) * 100;
  const absolutePercentDeviation = Math.abs(percentDeviation);
  const zScore = (value - safeMean) / safeStddev;

  // Signal risk score: map absolute z-score to 0-100 scale.
  // z = 0 -> 0 pts
  // z = 1 (1 stddev) -> 25 pts
  // z = 2 (2 stddev) -> 50 pts
  // z = 3 (3 stddev) -> 75 pts
  // z >= 4 (4+ stddev) -> 100 pts (clamped)
  const signalScore = Math.min(100, Math.max(0, Math.abs(zScore) * 25));
  const weightedScore = signalScore * weight;

  return {
    signal,
    value,
    baselineMean: mean,
    baselineStddev: stddev,
    percentDeviation: Number(percentDeviation.toFixed(2)),
    absolutePercentDeviation: Number(absolutePercentDeviation.toFixed(2)),
    zScore: Number(zScore.toFixed(3)),
    signalScore: Number(signalScore.toFixed(2)),
    weight,
    weightedScore: Number(weightedScore.toFixed(2)),
  };
}

/**
 * Computes the composite Personal Deviation Score (0-100) for a single day.
 */
export function computeDailyDeviation(
  reading: DailyReading,
  baseline: PatientBaseline,
  config?: EngineConfig
): DailyScoreResult {
  const threshold = config?.threshold ?? 40;

  // Calculate normalized weights
  const rawWeights: Record<SignalType, number> = {
    activity: config?.weights?.activity ?? baseline.activity.weight ?? DEFAULT_WEIGHTS.activity,
    sleep: config?.weights?.sleep ?? baseline.sleep.weight ?? DEFAULT_WEIGHTS.sleep,
    voice: config?.weights?.voice ?? baseline.voice.weight ?? DEFAULT_WEIGHTS.voice,
    movement: config?.weights?.movement ?? baseline.movement.weight ?? DEFAULT_WEIGHTS.movement,
  };

  const totalWeight =
    rawWeights.activity + rawWeights.sleep + rawWeights.voice + rawWeights.movement;
  const normalizedWeights: Record<SignalType, number> = {
    activity: rawWeights.activity / totalWeight,
    sleep: rawWeights.sleep / totalWeight,
    voice: rawWeights.voice / totalWeight,
    movement: rawWeights.movement / totalWeight,
  };

  const signalDeviations: Record<SignalType, SignalDeviation> = {
    activity: computeSignalDeviation(
      'activity',
      reading.readings.activity,
      baseline.activity,
      normalizedWeights.activity
    ),
    sleep: computeSignalDeviation(
      'sleep',
      reading.readings.sleep,
      baseline.sleep,
      normalizedWeights.sleep
    ),
    voice: computeSignalDeviation(
      'voice',
      reading.readings.voice,
      baseline.voice,
      normalizedWeights.voice
    ),
    movement: computeSignalDeviation(
      'movement',
      reading.readings.movement,
      baseline.movement,
      normalizedWeights.movement
    ),
  };

  const rawSum =
    signalDeviations.activity.weightedScore +
    signalDeviations.sleep.weightedScore +
    signalDeviations.voice.weightedScore +
    signalDeviations.movement.weightedScore;

  // Clamp strictly between 0 and 100
  const personalDeviationScore = Number(Math.min(100, Math.max(0, rawSum)).toFixed(1));
  const exceedsThreshold = personalDeviationScore >= threshold;

  return {
    date: reading.date,
    personalDeviationScore,
    signalDeviations,
    exceedsThreshold,
    thresholdUsed: threshold,
  };
}

/**
 * Evaluates a rolling window of daily readings, computes per-day Personal Deviation Scores,
 * and performs a persistence check: flags an alert ONLY if deviation exceeds threshold
 * for 2+ consecutive days.
 */
export function analyzeRollingWindow(
  dailyReadings: DailyReading[],
  baseline: PatientBaseline = DEFAULT_PATIENT_BASELINE,
  config?: EngineConfig
): DeviationAnalysisResult {
  const threshold = config?.threshold ?? 40;
  const minConsecutiveDays = config?.minConsecutiveDays ?? 2;

  const resolvedConfig: Required<EngineConfig> = {
    threshold,
    minConsecutiveDays,
    weights: {
      activity: config?.weights?.activity ?? DEFAULT_WEIGHTS.activity,
      sleep: config?.weights?.sleep ?? DEFAULT_WEIGHTS.sleep,
      voice: config?.weights?.voice ?? DEFAULT_WEIGHTS.voice,
      movement: config?.weights?.movement ?? DEFAULT_WEIGHTS.movement,
    },
  };

  const dailyResults: DailyScoreResult[] = dailyReadings.map((reading) =>
    computeDailyDeviation(reading, baseline, resolvedConfig)
  );

  // Persistence check across chronological window
  let consecutiveDays = 0;
  let alertTriggered = false;
  let triggerDate: string | null = null;
  let maxConsecutiveBreach = 0;

  for (const day of dailyResults) {
    if (day.exceedsThreshold) {
      consecutiveDays += 1;
      if (consecutiveDays > maxConsecutiveBreach) {
        maxConsecutiveBreach = consecutiveDays;
      }
      if (consecutiveDays >= minConsecutiveDays && !alertTriggered) {
        alertTriggered = true;
        triggerDate = day.date;
      }
    } else {
      // Reset counter on a non-exceeding day
      consecutiveDays = 0;
    }
  }

  const latestScore =
    dailyResults.length > 0
      ? dailyResults[dailyResults.length - 1].personalDeviationScore
      : 0;

  // Determine alert level
  let alertLevel: 'none' | 'warning' | 'critical' = 'none';
  let details = 'All readings within normal variance or transient.';

  if (alertTriggered) {
    if (maxConsecutiveBreach >= 3 || latestScore >= 70) {
      alertLevel = 'critical';
      details = `Critical clinical alert: sustained deviation across ${maxConsecutiveBreach} consecutive days (Score: ${latestScore}/100). Immediate caregiver check-in recommended.`;
    } else {
      alertLevel = 'warning';
      details = `Persistent deviation alert: exceeded threshold of ${threshold} for ${maxConsecutiveBreach} consecutive days, beginning on ${triggerDate}.`;
    }
  } else if (consecutiveDays === 1) {
    details = `Single-day deviation spike detected (${latestScore}/100). Suppressing alert pending persistence confirmation (Day 1 of ${minConsecutiveDays}).`;
  }

  const persistenceAlert: PersistenceAlert = {
    triggered: alertTriggered,
    consecutiveDaysExceeded: consecutiveDays,
    triggerDate,
    alertLevel,
    details,
  };

  return {
    dailyResults,
    latestScore,
    persistenceAlert,
    baselineUsed: baseline,
    config: resolvedConfig,
  };
}

/**
 * Mock Data Generator
 * Produces demo datasets:
 * - 'normal': 7 days with realistic minor oscillations within normal bounds.
 * - 'declining': 7 days showing progressive multi-signal deterioration triggering 2+ day persistence.
 */
export function generateMockDataset(
  type: 'normal' | 'declining',
  options?: {
    startDate?: string;
    baseline?: PatientBaseline;
  }
): DailyReading[] {
  const base = options?.baseline ?? DEFAULT_PATIENT_BASELINE;
  const startDate = options?.startDate ?? '2026-09-15';
  const start = new Date(startDate);

  const dataset: DailyReading[] = [];

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];

    if (type === 'normal') {
      // Normal week: variations strictly within +/- 0.8 stddev (natural variance)
      // Jitter multipliers: slight predictable oscillation
      const oscillation = Math.sin(i * 1.2) * 0.4;
      const stepJitter = (Math.cos(i * 0.8) * 0.3) * base.activity.stddev;
      const sleepJitter = (Math.sin(i * 1.5) * 0.3) * base.sleep.stddev;
      const voiceJitter = (Math.cos(i * 1.1) * 0.25) * base.voice.stddev;
      const moveJitter = (Math.sin(i * 0.9) * 0.3) * base.movement.stddev;

      dataset.push({
        date: dateStr,
        readings: {
          activity: Math.round(base.activity.mean + stepJitter),
          sleep: Number((base.sleep.mean + sleepJitter).toFixed(1)),
          voice: Number((base.voice.mean + voiceJitter).toFixed(1)),
          movement: Number((base.movement.mean + moveJitter).toFixed(2)),
        },
      });
    } else {
      // Declining week:
      // Day 0 & 1: Baseline / near-normal (PDS < 30)
      // Day 2: Mild deviation (PDS ~35, near threshold)
      // Day 3: Exceeds threshold (PDS ~48, Day 1 of breach)
      // Day 4: Exceeds threshold (PDS ~62, Day 2 of breach -> PERSISTENCE ALERT TRIGGERS)
      // Day 5 & 6: Severe sustained deterioration (PDS ~75-82 -> CRITICAL ALERT)
      const declineStage = i; // 0 to 6

      let activityVal = base.activity.mean;
      let sleepVal = base.sleep.mean;
      let voiceVal = base.voice.mean;
      let moveVal = base.movement.mean;

      if (declineStage === 0) {
        // Normal
        activityVal = base.activity.mean - 100;
        sleepVal = base.sleep.mean - 0.2;
        voiceVal = base.voice.mean - 0.5;
        moveVal = base.movement.mean - 0.02;
      } else if (declineStage === 1) {
        // Slight dip
        activityVal = base.activity.mean - 400;
        sleepVal = base.sleep.mean - 0.5;
        voiceVal = base.voice.mean - 1.2;
        moveVal = base.movement.mean - 0.04;
      } else if (declineStage === 2) {
        // Borderline
        activityVal = base.activity.mean - 900;
        sleepVal = base.sleep.mean - 1.2;
        voiceVal = base.voice.mean - 2.8;
        moveVal = base.movement.mean - 0.12;
      } else if (declineStage === 3) {
        // Day 1 breach (Score ~48)
        activityVal = base.activity.mean - 1400;
        sleepVal = base.sleep.mean - 2.0;
        voiceVal = base.voice.mean - 5.5;
        moveVal = base.movement.mean - 0.22;
      } else if (declineStage === 4) {
        // Day 2 breach (Score ~62 -> Alert triggers!)
        activityVal = base.activity.mean - 2000;
        sleepVal = base.sleep.mean - 2.8;
        voiceVal = base.voice.mean - 8.0;
        moveVal = base.movement.mean - 0.32;
      } else if (declineStage === 5) {
        // Day 3 breach (Score ~74 -> Critical alert!)
        activityVal = base.activity.mean - 2600;
        sleepVal = base.sleep.mean - 3.4;
        voiceVal = base.voice.mean - 11.0;
        moveVal = base.movement.mean - 0.42;
      } else {
        // Day 4 breach (Score ~84 -> Critical alert continues)
        activityVal = base.activity.mean - 3000;
        sleepVal = base.sleep.mean - 4.0;
        voiceVal = base.voice.mean - 13.0;
        moveVal = base.movement.mean - 0.50;
      }

      dataset.push({
        date: dateStr,
        readings: {
          activity: Math.max(0, Math.round(activityVal)),
          sleep: Math.max(0, Number(sleepVal.toFixed(1))),
          voice: Math.max(0, Number(voiceVal.toFixed(1))),
          movement: Math.max(0.1, Number(moveVal.toFixed(2))),
        },
      });
    }
  }

  return dataset;
}
