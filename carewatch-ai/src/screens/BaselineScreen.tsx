import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { TabScreenProps } from '../navigation/types';
import { useCareWatch } from '../context/CareWatchContext';
import { BaselineChart } from '../components/BaselineChart';
import { SignalType } from '../engine/deviationEngine';

export const BaselineScreen: React.FC<TabScreenProps<'Baseline'>> = () => {
  const { patient, analysisResult } = useCareWatch();
  const [activeTab, setActiveTab] = useState<SignalType>('activity');

  const tabs: { key: SignalType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'activity', label: 'Activity', icon: 'walk-outline' },
    { key: 'sleep', label: 'Sleep', icon: 'moon-outline' },
    { key: 'voice', label: 'Voice', icon: 'mic-outline' },
    { key: 'movement', label: 'Movement', icon: 'body-outline' },
  ];

  if (!analysisResult) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No baseline data available yet. Please complete onboarding.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const signalBaseline = analysisResult.baselineUsed[activeTab];
  const chartData = analysisResult.dailyResults.map((r) => r.signalDeviations[activeTab].value);
  const todayDeviation = analysisResult.dailyResults[analysisResult.dailyResults.length - 1].signalDeviations[activeTab];

  const isAbove = todayDeviation.percentDeviation > 0;
  const absPct = todayDeviation.absolutePercentDeviation;
  const captionText = `Your ${activeTab} today is ${absPct}% ${isAbove ? 'above' : 'below'} your usual range.`;
  
  const isDeviationSignificant = absPct > 15; // arbitrary threshold for UI highlight

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerCategory}>AI Health Baseline</Text>
          {/* Space Grotesk for Headings */}
          <Text style={styles.headerTitle}>Personalized Norms</Text>
          <Text style={styles.headerSubtitle}>
            Adaptive biometric boundaries calibrated for {patient.name} under the {patient.dischargeCondition} recovery protocol.
          </Text>
        </View>

        {/* Tab Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContainer}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Ionicons
                  name={tab.icon}
                  size={16}
                  color={isActive ? colors.white : colors.textSecondary}
                  style={styles.tabIcon}
                />
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Chart Card */}
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              {/* Space Grotesk Heading */}
              <Text style={styles.chartTitle}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Trend</Text>
              <Text style={styles.chartSubtitle}>7-Day Trajectory vs. Normal Range</Text>
            </View>
            <Badge 
              label={isDeviationSignificant ? 'DEVIATION' : 'STABLE'} 
              variant={isDeviationSignificant ? 'alert' : 'success'} 
            />
          </View>

          <View style={styles.chartWrapper}>
            <BaselineChart
              data={chartData}
              mean={signalBaseline.mean}
              stddev={signalBaseline.stddev}
              height={200}
            />
          </View>

          <View style={styles.captionContainer}>
            <Ionicons 
              name={isDeviationSignificant ? 'alert-circle' : 'information-circle'} 
              size={18} 
              color={isDeviationSignificant ? colors.alertAccent : colors.primary} 
              style={{ marginTop: 2 }}
            />
            <Text style={styles.captionText}>{captionText}</Text>
          </View>
        </Card>

        {/* Signal Stats Breakdown */}
        <Text style={[styles.sectionTitle, { fontFamily: fonts.spaceGrotesk.bold }]}>Baseline Metrics</Text>
        <Card style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Established Mean</Text>
            <Text style={styles.statValue}>{signalBaseline.mean}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Standard Deviation (1σ)</Text>
            <Text style={styles.statValue}>± {signalBaseline.stddev}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Today's Value</Text>
            <Text style={styles.statValueHighlight}>{todayDeviation.value}</Text>
          </View>
        </Card>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontFamily: fonts.inter.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  header: {
    marginBottom: 20,
  },
  headerCategory: {
    fontFamily: fonts.spaceGrotesk.medium,
    fontSize: 13,
    color: colors.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontFamily: fonts.spaceGrotesk.bold,
    fontSize: 32,
    color: colors.textPrimary,
    marginTop: 2,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontFamily: fonts.inter.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingVertical: 4,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 999,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontFamily: fonts.inter.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.white,
  },
  chartCard: {
    padding: 16,
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  chartTitle: {
    fontFamily: fonts.spaceGrotesk.bold,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  chartSubtitle: {
    fontFamily: fonts.inter.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  chartWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  captionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  captionText: {
    fontFamily: fonts.inter.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textPrimary,
    marginLeft: 8,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: 14,
  },
  statsCard: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  statLabel: {
    fontFamily: fonts.inter.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  statValue: {
    fontFamily: fonts.spaceGrotesk.medium,
    fontSize: 16,
    color: colors.textPrimary,
  },
  statValueHighlight: {
    fontFamily: fonts.spaceGrotesk.bold,
    fontSize: 18,
    color: colors.primary,
  },
  bottomSpacer: {
    height: 30,
  },
});
