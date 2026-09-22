import React from 'react';
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
import { Sparkline } from '../components/Sparkline';
import { Button } from '../components/Button';
import { TabScreenProps } from '../navigation/types';
import { useCareWatch } from '../context/CareWatchContext';
import { DailyScoreResult } from '../engine/deviationEngine';

export const HomeScreen: React.FC<TabScreenProps<'Home'>> = ({ navigation }) => {
  const { patient, analysisResult, role } = useCareWatch();

  // In a real app we'd fetch this from actual context/API
  const latestDay: DailyScoreResult | null = analysisResult && analysisResult.dailyResults.length > 0 
    ? analysisResult.dailyResults[analysisResult.dailyResults.length - 1] 
    : null;

  const isAlert = analysisResult?.persistenceAlert.triggered;
  const isWarning = analysisResult?.persistenceAlert.consecutiveDaysExceeded === 1;

  // Determine card styling based on alert status
  const cardBorderColor = isAlert ? colors.alertAccent : isWarning ? '#F4A261' : colors.primary;
  const statusColor = isAlert ? colors.alertAccent : isWarning ? '#F4A261' : colors.primary;
  const statusText = isAlert 
    ? 'Deviation Alert Active' 
    : isWarning 
    ? 'We noticed a change' 
    : 'Everything looks normal';

  const descriptionText = isAlert
    ? analysisResult?.persistenceAlert.details
    : isWarning
    ? 'Your biometrics shifted today. We are monitoring for persistence.'
    : 'Your multi-modal signals are tracking smoothly within your established baseline range.';

  // Extract trailing 7 days for the sparklines
  const getSparklineData = (metric: 'activity' | 'sleep' | 'voice' | 'movement'): number[] => {
    if (!analysisResult) return [];
    return analysisResult.dailyResults.map((day) => day.signalDeviations[metric].value);
  };

  const handleNavigateSubmit = () => {
    // Navigate to the Root stack 'Submit' screen
    navigation.getParent()?.navigate('Submit');
  };

  const handleNavigateBaseline = () => {
    navigation.navigate('Baseline');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingSubtitle}>{role === 'patient' ? 'Patient Portal' : 'Caregiver Portal'}</Text>
            <Text style={styles.greetingTitle}>Hello, {patient.name.split(' ')[0]}</Text>
          </View>
          <View style={styles.profileBadge}>
            <Ionicons name="person" size={14} color={colors.primary} />
            <Text style={styles.badgeLabel}>ID: EV-78</Text>
          </View>
        </View>

        {/* Dynamic Hero Card */}
        <Card style={[styles.heroCard, { borderLeftColor: cardBorderColor }]}>
          <View style={styles.heroHeader}>
            <View style={styles.heroHeaderLeft}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={styles.statusTitle}>{statusText}</Text>
            </View>
            <Ionicons 
              name={isAlert ? 'warning' : 'checkmark-circle'} 
              size={20} 
              color={statusColor} 
            />
          </View>
          
          <Text style={styles.heroDescription}>
            {descriptionText}
          </Text>

          <View style={styles.heroFooter}>
            <View style={styles.metaItem}>
              <Ionicons name="pulse-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.metaText}>Score: {analysisResult?.latestScore ?? 0}/100</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.metaText}>Updated Just Now</Text>
            </View>
          </View>
        </Card>

        {/* Submit Check-In Card */}
        {role === 'patient' && (
          <Card style={styles.submitCard} onPress={handleNavigateSubmit}>
            <View style={styles.submitCardContent}>
              <View style={styles.submitIconContainer}>
                <Ionicons name="clipboard-outline" size={28} color={colors.primary} />
              </View>
              <View style={styles.submitTextContainer}>
                <Text style={styles.submitTitle}>Submit Today's Check-In</Text>
                <Text style={styles.submitSubtitle}>Record your daily voice, photo & activity.</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
            </View>
          </Card>
        )}

        {/* Recent Alerts Strip */}
        {isAlert && (
          <TouchableOpacity style={styles.alertsStrip} onPress={() => navigation.navigate('Alerts')}>
            <View style={styles.alertsStripLeft}>
              <Ionicons name="alert-circle" size={20} color={colors.white} />
              <Text style={styles.alertsStripText}>1 Unresolved Alert</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color={colors.white} />
          </TouchableOpacity>
        )}

        <Text style={styles.sectionHeader}>Biometric Signals</Text>

        {/* 4 Signal Tiles */}
        <View style={styles.metricsGrid}>
          {/* Activity */}
          <TouchableOpacity style={styles.metricCardContainer} onPress={handleNavigateBaseline} activeOpacity={0.85}>
            <Card style={styles.metricCard}>
              <View style={styles.metricCardHeader}>
                <Text style={styles.metricLabel}>Activity</Text>
                <Ionicons name="walk-outline" size={16} color={colors.primary} />
              </View>
              <Text style={styles.metricValue}>
                {latestDay?.signalDeviations.activity.value ?? 0} <Text style={styles.metricUnit}>steps</Text>
              </Text>
              <View style={styles.sparklineContainer}>
                <Sparkline data={getSparklineData('activity')} color={colors.primary} width={100} height={35} />
              </View>
            </Card>
          </TouchableOpacity>

          {/* Sleep */}
          <TouchableOpacity style={styles.metricCardContainer} onPress={handleNavigateBaseline} activeOpacity={0.85}>
            <Card style={styles.metricCard}>
              <View style={styles.metricCardHeader}>
                <Text style={styles.metricLabel}>Sleep</Text>
                <Ionicons name="moon-outline" size={16} color={colors.primary} />
              </View>
              <Text style={styles.metricValue}>
                {latestDay?.signalDeviations.sleep.value ?? 0} <Text style={styles.metricUnit}>hrs</Text>
              </Text>
              <View style={styles.sparklineContainer}>
                <Sparkline data={getSparklineData('sleep')} color={colors.primary} width={100} height={35} />
              </View>
            </Card>
          </TouchableOpacity>

          {/* Voice */}
          <TouchableOpacity style={styles.metricCardContainer} onPress={handleNavigateBaseline} activeOpacity={0.85}>
            <Card style={styles.metricCard}>
              <View style={styles.metricCardHeader}>
                <Text style={styles.metricLabel}>Voice</Text>
                <Ionicons name="mic-outline" size={16} color={colors.primary} />
              </View>
              <Text style={styles.metricValue}>
                {latestDay?.signalDeviations.voice.value ?? 0} <Text style={styles.metricUnit}>%</Text>
              </Text>
              <View style={styles.sparklineContainer}>
                <Sparkline data={getSparklineData('voice')} color={colors.primary} width={100} height={35} />
              </View>
            </Card>
          </TouchableOpacity>

          {/* Movement */}
          <TouchableOpacity style={styles.metricCardContainer} onPress={handleNavigateBaseline} activeOpacity={0.85}>
            <Card style={styles.metricCard}>
              <View style={styles.metricCardHeader}>
                <Text style={styles.metricLabel}>Movement</Text>
                <Ionicons name="body-outline" size={16} color={colors.primary} />
              </View>
              <Text style={styles.metricValue}>
                {latestDay?.signalDeviations.movement.value ?? 0} <Text style={styles.metricUnit}>m/s</Text>
              </Text>
              <View style={styles.sparklineContainer}>
                <Sparkline data={getSparklineData('movement')} color={colors.primary} width={100} height={35} />
              </View>
            </Card>
          </TouchableOpacity>
        </View>

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingSubtitle: {
    fontFamily: fonts.inter.medium,
    fontSize: 13,
    color: colors.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  greetingTitle: {
    fontFamily: fonts.fraunces.bold,
    fontSize: 28,
    color: colors.textPrimary,
    marginTop: 2,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9999,
  },
  badgeLabel: {
    fontFamily: fonts.spaceGrotesk.medium,
    fontSize: 12,
    color: colors.primary,
    marginLeft: 6,
  },
  heroCard: {
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  heroHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusTitle: {
    fontFamily: fonts.inter.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  heroDescription: {
    fontFamily: fonts.inter.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontFamily: fonts.spaceGrotesk.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 5,
  },
  submitCard: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.white,
    borderColor: colors.primaryLight,
    borderWidth: 1,
  },
  submitCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  submitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  submitTextContainer: {
    flex: 1,
  },
  submitTitle: {
    fontFamily: fonts.inter.bold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  submitSubtitle: {
    fontFamily: fonts.inter.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  alertsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.alertAccent,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  alertsStripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertsStripText: {
    fontFamily: fonts.inter.semiBold,
    fontSize: 14,
    color: colors.white,
    marginLeft: 8,
  },
  sectionHeader: {
    fontFamily: fonts.fraunces.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 14,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCardContainer: {
    width: '48%',
    marginBottom: 14,
  },
  metricCard: {
    padding: 16,
    width: '100%',
  },
  metricCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontFamily: fonts.inter.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  metricValue: {
    fontFamily: fonts.spaceGrotesk.bold,
    fontSize: 22,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  metricUnit: {
    fontFamily: fonts.spaceGrotesk.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  sparklineContainer: {
    height: 35,
    width: '100%',
    alignItems: 'center',
  },
  bottomSpacer: {
    height: 30,
  },
});
