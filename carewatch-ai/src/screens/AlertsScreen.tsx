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
import { Button } from '../components/Button';
import { TabScreenProps } from '../navigation/types';
import { useCareWatch } from '../context/CareWatchContext';

export const AlertsScreen: React.FC<TabScreenProps<'Alerts'>> = ({ navigation }) => {
  const { analysisResult } = useCareWatch();
  const [expandedSignal, setExpandedSignal] = useState<string | null>(null);

  const score = analysisResult?.latestScore ?? 0;
  const isCritical = score >= 70;
  const isWarning = score >= 40 && score < 70;
  
  const getBadgeColor = () => {
    if (isCritical) return colors.alertAccent;
    if (isWarning) return '#F4A261';
    return colors.primary;
  };

  const getSignalData = (key: 'activity' | 'sleep' | 'voice' | 'movement') => {
    if (!analysisResult) return { val: 0, dir: 'Stable', abs: 0, evidence: 'No data available.' };
    const latest = analysisResult.dailyResults[analysisResult.dailyResults.length - 1];
    const dev = latest.signalDeviations[key];
    const isDown = dev.percentDeviation < 0;
    const abs = dev.absolutePercentDeviation;
    
    let dir = abs < 5 ? 'Stable' : isDown ? `↓${abs}%` : `↑${abs}%`;
    if (abs >= 20) {
      dir = isDown ? `Reduced (↓${abs}%)` : `Elevated (↑${abs}%)`;
    }

    let evidence = '';
    switch (key) {
      case 'activity':
        evidence = `Activity changed by ${abs}%, indicating a significant deviation from normal mobility patterns.`;
        break;
      case 'sleep':
        evidence = `Sleep metrics shifted by ${abs}%, suggesting potential disruptions in circadian rhythms or nocturnal restlessness.`;
        break;
      case 'voice':
        evidence = `Acoustic clarity deviated by ${abs}%, which can be an early indicator of respiratory fatigue or cognitive load.`;
        break;
      case 'movement':
        evidence = `Gait velocity and movement altered by ${abs}%, potentially increasing fall risk and requiring supervision.`;
        break;
    }

    return { val: dev.value, dir, abs, evidence, isDown };
  };

  const signals = [
    { id: 'activity', label: 'Activity', icon: 'walk-outline', data: getSignalData('activity') },
    { id: 'sleep', label: 'Sleep', icon: 'moon-outline', data: getSignalData('sleep') },
    { id: 'voice', label: 'Voice', icon: 'mic-outline', data: getSignalData('voice') },
    { id: 'movement', label: 'Movement', icon: 'body-outline', data: getSignalData('movement') },
  ];

  const handleNotifyCaregiver = () => {
    // Navigate to the Caregiver Dashboard
    navigation.navigate('CaregiverDashboard');
  };

  const toggleExpand = (id: string) => {
    setExpandedSignal(expandedSignal === id ? null : id);
  };

  if (!analysisResult) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No telemetry data available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerCategory}>Clinical Assessment</Text>
          <Text style={styles.headerTitle}>System Alert</Text>
        </View>

        {/* Large Score Badge */}
        <View style={styles.scoreContainer}>
          <View style={[styles.scoreBadge, { borderColor: getBadgeColor() }]}>
            <Text style={[styles.scoreValue, { color: getBadgeColor() }]}>{score}</Text>
            <Text style={styles.scoreMax}>/ 100</Text>
          </View>
          <Text style={styles.scoreSubtitle}>Personal Deviation Score</Text>
          <Text style={styles.scoreDescription}>
            {isCritical 
              ? 'Critical deviation detected across multiple biomarkers.' 
              : isWarning 
              ? 'Moderate deviation patterns forming. Monitoring recommended.' 
              : 'All biomarkers are operating within normal baseline ranges.'}
          </Text>
        </View>

        {/* Signal Breakdown Cards */}
        <Text style={styles.sectionTitle}>Biometric Breakdown</Text>
        <View style={styles.signalGrid}>
          {signals.map((sig) => (
            <Card key={sig.id} style={styles.signalCard}>
              <View style={styles.signalCardHeader}>
                <Ionicons name={sig.icon as any} size={18} color={colors.primary} />
                <Text style={styles.signalLabel}>{sig.label}</Text>
              </View>
              <Text style={[
                styles.signalDirection, 
                sig.data.abs >= 20 ? { color: colors.alertAccent } : { color: colors.primary }
              ]}>
                {sig.data.dir}
              </Text>
            </Card>
          ))}
        </View>

        {/* Expandable Reasons List */}
        <Text style={styles.sectionTitle}>Why was this alert generated?</Text>
        <Card style={styles.reasonsCard}>
          {signals.map((sig, index) => {
            const isExpanded = expandedSignal === sig.id;
            return (
              <View key={sig.id}>
                <TouchableOpacity 
                  style={styles.reasonRow} 
                  onPress={() => toggleExpand(sig.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.reasonRowLeft}>
                    <Ionicons name={sig.icon as any} size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
                    <Text style={styles.reasonLabel}>{sig.label} Variance</Text>
                  </View>
                  <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
                </TouchableOpacity>
                
                {isExpanded && (
                  <View style={styles.reasonEvidence}>
                    <Text style={styles.evidenceText}>{sig.data.evidence}</Text>
                  </View>
                )}
                
                {index < signals.length - 1 && <View style={styles.divider} />}
              </View>
            );
          })}
        </Card>

        {/* Notify Action */}
        <Button 
          title="Notify Caregiver" 
          onPress={handleNotifyCaregiver} 
          variant={score >= 40 ? 'alert' : 'primary'} 
          style={styles.actionButton}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Persistent Disclaimer Banner */}
      <View style={styles.disclaimerBanner}>
        <Ionicons name="information-circle" size={16} color={colors.white} style={{ marginRight: 6 }} />
        <Text style={styles.disclaimerText}>Early-warning signal, not a diagnosis.</Text>
      </View>
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
    marginBottom: 24,
    alignItems: 'center',
  },
  headerCategory: {
    fontFamily: fonts.spaceGrotesk.medium,
    fontSize: 13,
    color: colors.alertAccent,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontFamily: fonts.fraunces.bold,
    fontSize: 28,
    color: colors.textPrimary,
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  scoreBadge: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.white,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  scoreValue: {
    fontFamily: fonts.spaceGrotesk.bold,
    fontSize: 48,
  },
  scoreMax: {
    fontFamily: fonts.spaceGrotesk.medium,
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: 20,
    marginLeft: 4,
  },
  scoreSubtitle: {
    fontFamily: fonts.spaceGrotesk.bold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  scoreDescription: {
    fontFamily: fonts.inter.regular,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  sectionTitle: {
    fontFamily: fonts.fraunces.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 14,
  },
  signalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  signalCard: {
    width: '48%',
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  signalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  signalLabel: {
    fontFamily: fonts.inter.medium,
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  signalDirection: {
    fontFamily: fonts.spaceGrotesk.bold,
    fontSize: 16,
    textAlign: 'center',
  },
  reasonsCard: {
    padding: 16,
    marginBottom: 24,
  },
  reasonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  reasonRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reasonLabel: {
    fontFamily: fonts.inter.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  reasonEvidence: {
    paddingLeft: 24,
    paddingRight: 10,
    paddingBottom: 16,
  },
  evidenceText: {
    fontFamily: fonts.inter.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  actionButton: {
    marginBottom: 16,
  },
  bottomSpacer: {
    height: 40,
  },
  disclaimerBanner: {
    backgroundColor: colors.textPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  disclaimerText: {
    fontFamily: fonts.inter.medium,
    fontSize: 13,
    color: colors.white,
  },
});
