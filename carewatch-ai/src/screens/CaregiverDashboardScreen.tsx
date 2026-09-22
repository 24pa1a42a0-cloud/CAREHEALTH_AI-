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
import { Button } from '../components/Button';
import { BaselineChart } from '../components/BaselineChart';
import { RootStackScreenProps } from '../navigation/types';

interface PatientSignal {
  id: string;
  label: string;
  icon: string;
  abs: number;
  dir: string;
  evidence: string;
}

type PatientStatus = 'Normal' | 'Watch' | 'Alert' | 'Escalated' | 'Reviewed';

interface CaregiverPatient {
  id: string;
  name: string;
  age: number;
  condition: string;
  status: PatientStatus;
  score: number;
  historyData: number[];
  signals: PatientSignal[];
  details: string;
}

const seedPatients: CaregiverPatient[] = [
  {
    id: 'p1',
    name: 'Eleanor Vance',
    age: 78,
    condition: 'Post-Op Cardiac Surgery',
    status: 'Alert',
    score: 82,
    historyData: [20, 24, 30, 48, 62, 75, 82],
    signals: [
      { id: 'activity', label: 'Activity', icon: 'walk-outline', abs: 58, dir: 'Reduced (↓58%)', evidence: 'Activity changed by 58%, indicating a significant deviation from normal mobility patterns.' },
      { id: 'sleep', label: 'Sleep', icon: 'moon-outline', abs: 24, dir: 'Reduced (↓24%)', evidence: 'Sleep metrics shifted by 24%, suggesting potential disruptions in circadian rhythms or nocturnal restlessness.' },
      { id: 'voice', label: 'Voice', icon: 'mic-outline', abs: 12, dir: '↓12%', evidence: 'Acoustic clarity deviated by 12%, which can be an early indicator of respiratory fatigue or cognitive load.' },
      { id: 'movement', label: 'Movement', icon: 'body-outline', abs: 35, dir: 'Reduced (↓35%)', evidence: 'Gait velocity and movement altered by 35%, potentially increasing fall risk and requiring supervision.' }
    ],
    details: 'Critical clinical alert: sustained deviation across 3 consecutive days.'
  },
  {
    id: 'p2',
    name: 'Marcus Thorne',
    age: 82,
    condition: 'Stroke Rehab',
    status: 'Normal',
    score: 18,
    historyData: [15, 12, 18, 14, 20, 19, 18],
    signals: [
      { id: 'activity', label: 'Activity', icon: 'walk-outline', abs: 4, dir: 'Stable', evidence: 'Activity is consistent and within expected rehab parameters.' },
      { id: 'sleep', label: 'Sleep', icon: 'moon-outline', abs: 2, dir: 'Stable', evidence: 'Nocturnal rest is undisrupted and efficient.' },
      { id: 'voice', label: 'Voice', icon: 'mic-outline', abs: 1, dir: 'Stable', evidence: 'Vocal biomarkers are steady.' },
      { id: 'movement', label: 'Movement', icon: 'body-outline', abs: 5, dir: 'Stable', evidence: 'Motor recovery trajectory remains positive.' }
    ],
    details: 'All biomarkers are operating within normal baseline ranges.'
  }
];

const getStatusColor = (status: PatientStatus) => {
  switch (status) {
    case 'Normal': return colors.primary;
    case 'Watch': return '#F4A261';
    case 'Alert': return colors.alertAccent;
    case 'Escalated': return '#D62828';
    case 'Reviewed': return colors.textSecondary;
    default: return colors.primary;
  }
};

export const CaregiverDashboardScreen: React.FC<RootStackScreenProps<'CaregiverDashboard'>> = ({ navigation }) => {
  const [patients, setPatients] = useState<CaregiverPatient[]>(seedPatients);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [expandedSignal, setExpandedSignal] = useState<string | null>(null);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const updateStatus = (id: string, newStatus: PatientStatus) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  const renderList = () => (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerCategory}>Caregiver Dashboard</Text>
        <Text style={styles.headerTitle}>Monitored Cohort</Text>
        <Text style={styles.headerSubtitle}>
          Real-time triage and patient status overview.
        </Text>
      </View>

      {patients.map(patient => {
        const statusColor = getStatusColor(patient.status);
        return (
          <TouchableOpacity 
            key={patient.id} 
            activeOpacity={0.8} 
            onPress={() => setSelectedPatientId(patient.id)}
          >
            <Card style={[styles.patientCard, { borderLeftColor: statusColor, borderLeftWidth: 4 }]}>
              <View style={styles.patientCardRow}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitials}>{patient.name.substring(0, 2).toUpperCase()}</Text>
                </View>
                <View style={styles.patientInfo}>
                  <Text style={styles.patientName}>{patient.name}</Text>
                  <Text style={styles.patientMeta}>{patient.age} yrs • {patient.condition}</Text>
                </View>
                <View style={styles.patientStatusBlock}>
                  <Text style={[styles.patientScore, { color: statusColor }]}>{patient.score}</Text>
                  <View style={[styles.chip, { backgroundColor: statusColor + '20' }]}>
                    <Text style={[styles.chipText, { color: statusColor }]}>{patient.status.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderDetail = (patient: CaregiverPatient) => {
    const isCritical = patient.score >= 70;
    const isWarning = patient.score >= 40 && patient.score < 70;
    const badgeColor = getStatusColor(patient.status);

    return (
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.detailHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedPatientId(null)}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            <Text style={styles.backText}>Cohort</Text>
          </TouchableOpacity>
          <Text style={styles.detailTitle}>{patient.name}</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Status Actions */}
        <View style={styles.statusActionRow}>
          <Button 
            title="Mark Reviewed" 
            onPress={() => updateStatus(patient.id, 'Reviewed')} 
            variant={patient.status === 'Reviewed' ? 'primary' : 'outline'} 
            size="small" 
            style={{ flex: 1, marginRight: 8 }} 
          />
          <Button 
            title="Escalate" 
            onPress={() => updateStatus(patient.id, 'Escalated')} 
            variant={patient.status === 'Escalated' ? 'alert' : 'outline'} 
            size="small" 
            style={{ flex: 1, marginLeft: 8 }} 
          />
        </View>

        {/* Score Badge */}
        <View style={styles.scoreContainer}>
          <View style={[styles.scoreBadge, { borderColor: badgeColor }]}>
            <Text style={[styles.scoreValue, { color: badgeColor }]}>{patient.score}</Text>
            <Text style={styles.scoreMax}>/ 100</Text>
          </View>
          <Text style={styles.scoreSubtitle}>Personal Deviation Score</Text>
          <Text style={styles.scoreDescription}>{patient.details}</Text>
          <View style={{ marginTop: 12 }}>
            <Badge label={`STATUS: ${patient.status.toUpperCase()}`} variant="neutral" />
          </View>
        </View>

        {/* Trend Chart */}
        <Text style={styles.sectionTitle}>7-Day Score Trajectory</Text>
        <Card style={styles.chartCard}>
          <BaselineChart 
            data={patient.historyData} 
            mean={30} 
            stddev={10} 
            height={160} 
          />
        </Card>

        {/* Signal Breakdowns */}
        <Text style={styles.sectionTitle}>Biometric Breakdown</Text>
        <View style={styles.signalGrid}>
          {patient.signals.map((sig) => (
            <Card key={sig.id} style={styles.signalCard}>
              <View style={styles.signalCardHeader}>
                <Ionicons name={sig.icon as any} size={18} color={colors.primary} />
                <Text style={styles.signalLabel}>{sig.label}</Text>
              </View>
              <Text style={[
                styles.signalDirection, 
                sig.abs >= 20 ? { color: colors.alertAccent } : { color: colors.primary }
              ]}>
                {sig.dir}
              </Text>
            </Card>
          ))}
        </View>

        {/* Expandable Reasons List */}
        <Text style={styles.sectionTitle}>Why was this alert generated?</Text>
        <Card style={styles.reasonsCard}>
          {patient.signals.map((sig, index) => {
            const isExpanded = expandedSignal === sig.id;
            return (
              <View key={sig.id}>
                <TouchableOpacity 
                  style={styles.reasonRow} 
                  onPress={() => setExpandedSignal(isExpanded ? null : sig.id)}
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
                    <Text style={styles.evidenceText}>{sig.evidence}</Text>
                  </View>
                )}
                
                {index < patient.signals.length - 1 && <View style={styles.divider} />}
              </View>
            );
          })}
        </Card>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.homeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Clinical Portal</Text>
        <View style={{ width: 36 }} />
      </View>
      
      {selectedPatient ? renderDetail(selectedPatient) : renderList()}
      
      {selectedPatient && (
        <View style={styles.disclaimerBanner}>
          <Ionicons name="information-circle" size={16} color={colors.white} style={{ marginRight: 6 }} />
          <Text style={styles.disclaimerText}>Early-warning signal, not a diagnosis.</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  homeButton: {
    padding: 6,
  },
  topBarTitle: {
    fontFamily: fonts.inter.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  header: {
    marginBottom: 24,
  },
  headerCategory: {
    fontFamily: fonts.inter.medium,
    fontSize: 13,
    color: colors.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontFamily: fonts.inter.bold,
    fontSize: 28,
    color: colors.textPrimary,
    marginTop: 2,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontFamily: fonts.inter.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  patientCard: {
    marginBottom: 16,
    padding: 16,
  },
  patientCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarInitials: {
    fontFamily: fonts.inter.bold,
    fontSize: 18,
    color: colors.primary,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontFamily: fonts.inter.bold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  patientMeta: {
    fontFamily: fonts.inter.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  patientStatusBlock: {
    alignItems: 'flex-end',
  },
  patientScore: {
    fontFamily: fonts.inter.bold,
    fontSize: 22,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  chipText: {
    fontFamily: fonts.inter.bold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontFamily: fonts.inter.medium,
    fontSize: 15,
    color: colors.textPrimary,
    marginLeft: 4,
  },
  detailTitle: {
    fontFamily: fonts.inter.bold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  statusActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
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
    fontFamily: fonts.inter.bold,
    fontSize: 48,
  },
  scoreMax: {
    fontFamily: fonts.inter.medium,
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: 20,
    marginLeft: 4,
  },
  scoreSubtitle: {
    fontFamily: fonts.inter.bold,
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
    fontFamily: fonts.inter.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 14,
  },
  chartCard: {
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
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
