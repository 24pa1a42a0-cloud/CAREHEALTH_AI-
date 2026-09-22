import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  computeSignalDeviation,
  computeDailyDeviation,
  analyzeRollingWindow,
  generateMockDataset,
  DEFAULT_PATIENT_BASELINE,
} from '../src/engine/deviationEngine.ts';
import type { PatientBaseline, DailyReading } from '../src/engine/deviationEngine.ts';

describe('CareWatch AI - Deviation Engine', () => {
  const mockBaseline: PatientBaseline = {
    activity: { mean: 4000, stddev: 500, weight: 0.25 },
    sleep: { mean: 8.0, stddev: 1.0, weight: 0.25 },
    voice: { mean: 90.0, stddev: 5.0, weight: 0.20 },
    movement: { mean: 1.0, stddev: 0.1, weight: 0.30 },
  };

  describe('Signal Deviation Calculations', () => {
    it('returns 0% deviation and 0 score when reading matches baseline mean', () => {
      const dev = computeSignalDeviation('activity', 4000, mockBaseline.activity, 0.25);
      assert.strictEqual(dev.percentDeviation, 0);
      assert.strictEqual(dev.absolutePercentDeviation, 0);
      assert.strictEqual(dev.zScore, 0);
      assert.strictEqual(dev.signalScore, 0);
      assert.strictEqual(dev.weightedScore, 0);
    });

    it('accurately computes positive and negative percentage deviations', () => {
      // 4600 is +15% above 4000
      const positiveDev = computeSignalDeviation('activity', 4600, mockBaseline.activity, 0.25);
      assert.strictEqual(positiveDev.percentDeviation, 15);
      assert.strictEqual(positiveDev.absolutePercentDeviation, 15);
      assert.strictEqual(positiveDev.zScore, 1.2); // (4600 - 4000) / 500 = 1.2

      // 3000 is -25% below 4000
      const negativeDev = computeSignalDeviation('activity', 3000, mockBaseline.activity, 0.25);
      assert.strictEqual(negativeDev.percentDeviation, -25);
      assert.strictEqual(negativeDev.absolutePercentDeviation, 25);
      assert.strictEqual(negativeDev.zScore, -2); // (3000 - 4000) / 500 = -2
      assert.strictEqual(negativeDev.signalScore, 50); // |z| * 25 = 2 * 25 = 50
    });

    it('clamps signalScore to 100 on extreme outliers', () => {
      // 1000 is 6 standard deviations below mean
      const extremeDev = computeSignalDeviation('activity', 1000, mockBaseline.activity, 0.25);
      assert.strictEqual(extremeDev.signalScore, 100);
    });
  });

  describe('Daily Composite Scoring', () => {
    it('produces a Personal Deviation Score of 0.0 when all readings are on baseline', () => {
      const perfectDay: DailyReading = {
        date: '2026-09-01',
        readings: {
          activity: 4000,
          sleep: 8.0,
          voice: 90.0,
          movement: 1.0,
        },
      };

      const result = computeDailyDeviation(perfectDay, mockBaseline);
      assert.strictEqual(result.personalDeviationScore, 0.0);
      assert.strictEqual(result.exceedsThreshold, false);
    });

    it('correctly weighs signals to compute composite score', () => {
      // Set all signals to exactly 2 standard deviations away (|z| = 2 -> signalScore = 50)
      const dayAt2Stddev: DailyReading = {
        date: '2026-09-02',
        readings: {
          activity: 3000, // 4000 - 2*500
          sleep: 6.0,    // 8.0 - 2*1.0
          voice: 80.0,   // 90.0 - 2*5.0
          movement: 0.8, // 1.0 - 2*0.1
        },
      };

      const result = computeDailyDeviation(dayAt2Stddev, mockBaseline);
      // All signals score 50. Since weights sum to 1, composite score should be 50.0.
      assert.strictEqual(result.personalDeviationScore, 50.0);
      assert.strictEqual(result.exceedsThreshold, true); // default threshold is 40
    });

    it('respects custom threshold in configuration', () => {
      const dayResult = computeDailyDeviation(
        {
          date: '2026-09-03',
          readings: { activity: 3400, sleep: 7.2, voice: 86.0, movement: 0.92 },
        },
        mockBaseline,
        { threshold: 60 }
      );

      assert.strictEqual(dayResult.thresholdUsed, 60);
      assert.strictEqual(dayResult.exceedsThreshold, dayResult.personalDeviationScore >= 60);
    });
  });

  describe('Persistence Check (2+ Consecutive Days Rule)', () => {
    it('does NOT trigger an alert on a single-day deviation spike', () => {
      const readings: DailyReading[] = [
        { date: '2026-09-10', readings: { activity: 4000, sleep: 8.0, voice: 90.0, movement: 1.0 } }, // PDS = 0
        { date: '2026-09-11', readings: { activity: 2000, sleep: 4.0, voice: 70.0, movement: 0.5 } }, // PDS = 95+ (Spike!)
        { date: '2026-09-12', readings: { activity: 3900, sleep: 7.9, voice: 89.0, movement: 0.98 } }, // PDS < 10 (Recovered)
      ];

      const analysis = analyzeRollingWindow(readings, mockBaseline, { threshold: 40, minConsecutiveDays: 2 });
      assert.strictEqual(analysis.persistenceAlert.triggered, false);
      assert.strictEqual(analysis.persistenceAlert.alertLevel, 'none');
      assert.ok(analysis.dailyResults[1].exceedsThreshold);
      assert.ok(!analysis.dailyResults[2].exceedsThreshold);
    });

    it('does NOT trigger when threshold breaches are non-consecutive', () => {
      const readings: DailyReading[] = [
        { date: '2026-09-10', readings: { activity: 2500, sleep: 5.5, voice: 75.0, movement: 0.7 } }, // Breach 1
        { date: '2026-09-11', readings: { activity: 4000, sleep: 8.0, voice: 90.0, movement: 1.0 } }, // Normal (resets counter)
        { date: '2026-09-12', readings: { activity: 2500, sleep: 5.5, voice: 75.0, movement: 0.7 } }, // Breach 2
      ];

      const analysis = analyzeRollingWindow(readings, mockBaseline, { threshold: 40, minConsecutiveDays: 2 });
      assert.strictEqual(analysis.persistenceAlert.triggered, false);
    });

    it('TRIGGERS an alert when threshold is exceeded for 2 consecutive days', () => {
      const readings: DailyReading[] = [
        { date: '2026-09-10', readings: { activity: 4000, sleep: 8.0, voice: 90.0, movement: 1.0 } }, // Day 0: normal
        { date: '2026-09-11', readings: { activity: 2800, sleep: 6.0, voice: 78.0, movement: 0.75 } }, // Day 1: breach (Score ~55)
        { date: '2026-09-12', readings: { activity: 2700, sleep: 5.8, voice: 76.0, movement: 0.72 } }, // Day 2: breach (Score ~60)
      ];

      const analysis = analyzeRollingWindow(readings, mockBaseline, { threshold: 40, minConsecutiveDays: 2 });
      assert.strictEqual(analysis.persistenceAlert.triggered, true);
      assert.strictEqual(analysis.persistenceAlert.triggerDate, '2026-09-12');
      assert.strictEqual(analysis.persistenceAlert.alertLevel, 'warning');
    });

    it('escalates to critical alert when breach persists for 3+ consecutive days', () => {
      const readings: DailyReading[] = [
        { date: '2026-09-10', readings: { activity: 4000, sleep: 8.0, voice: 90.0, movement: 1.0 } }, // Day 0: normal
        { date: '2026-09-11', readings: { activity: 2800, sleep: 6.0, voice: 78.0, movement: 0.75 } }, // Day 1
        { date: '2026-09-12', readings: { activity: 2700, sleep: 5.8, voice: 76.0, movement: 0.72 } }, // Day 2
        { date: '2026-09-13', readings: { activity: 2200, sleep: 5.0, voice: 72.0, movement: 0.65 } }, // Day 3
      ];

      const analysis = analyzeRollingWindow(readings, mockBaseline, { threshold: 40, minConsecutiveDays: 2 });
      assert.strictEqual(analysis.persistenceAlert.triggered, true);
      assert.strictEqual(analysis.persistenceAlert.alertLevel, 'critical');
    });
  });

  describe('Mock Data Generator', () => {
    it('generates a 7-day "normal week" that produces 0 persistence alerts', () => {
      const normalWeek = generateMockDataset('normal');
      assert.strictEqual(normalWeek.length, 7);

      const analysis = analyzeRollingWindow(normalWeek, DEFAULT_PATIENT_BASELINE, { threshold: 40 });
      assert.strictEqual(analysis.persistenceAlert.triggered, false);
      assert.strictEqual(analysis.persistenceAlert.alertLevel, 'none');

      // Ensure all daily scores in normal week remain low
      for (const day of analysis.dailyResults) {
        assert.ok(
          day.personalDeviationScore < 40,
          `Day ${day.date} score ${day.personalDeviationScore} unexpectedly exceeded threshold`
        );
      }
    });

    it('generates a 7-day "declining week" that triggers persistence alert on day 5 and critical alert by day 6', () => {
      const decliningWeek = generateMockDataset('declining');
      assert.strictEqual(decliningWeek.length, 7);

      const analysis = analyzeRollingWindow(decliningWeek, DEFAULT_PATIENT_BASELINE, { threshold: 40 });

      // First two days should not exceed threshold
      assert.strictEqual(analysis.dailyResults[0].exceedsThreshold, false);
      assert.strictEqual(analysis.dailyResults[1].exceedsThreshold, false);

      // Days 3, 4, 5, 6 should exhibit sustained decline
      assert.strictEqual(analysis.dailyResults[3].exceedsThreshold, true); // breach day 1
      assert.strictEqual(analysis.dailyResults[4].exceedsThreshold, true); // breach day 2 -> alert triggers

      assert.strictEqual(analysis.persistenceAlert.triggered, true);
      assert.strictEqual(analysis.persistenceAlert.alertLevel, 'critical');
      assert.ok(analysis.latestScore >= 70, `Expected latestScore >= 70, got ${analysis.latestScore}`);
    });
  });
});
