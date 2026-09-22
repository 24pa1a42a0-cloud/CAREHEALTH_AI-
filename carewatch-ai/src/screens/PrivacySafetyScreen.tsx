import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { Card } from '../components/Card';
import { RootStackScreenProps } from '../navigation/types';

export const PrivacySafetyScreen: React.FC<RootStackScreenProps<'PrivacySafety'>> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Privacy & Safety</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Core Philosophy */}
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={48} color={colors.primary} style={{ marginBottom: 12 }} />
          <Text style={styles.headerTitle}>Your Data, Your Rules</Text>
          <Text style={styles.headerSubtitle}>
            CareWatch AI is built on a privacy-first architecture. We process sensitive telemetry locally and only share what you authorize.
          </Text>
        </View>

        {/* On-Device vs Shared */}
        <Text style={styles.sectionTitle}>Data Architecture</Text>
        <Card style={styles.dataCard}>
          <View style={styles.dataSection}>
            <View style={styles.dataHeader}>
              <Ionicons name="hardware-chip" size={20} color={colors.primary} />
              <Text style={styles.dataTitle}>Stays On-Device</Text>
            </View>
            <Text style={styles.dataText}>• Raw microphone audio samples</Text>
            <Text style={styles.dataText}>• Exact GPS coordinates</Text>
            <Text style={styles.dataText}>• Continuous accelerometer streams</Text>
            <Text style={styles.dataText}>• Baseline model training weights</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.dataSection}>
            <View style={styles.dataHeader}>
              <Ionicons name="cloud-upload" size={20} color={colors.alertAccent} />
              <Text style={styles.dataTitle}>Shared with Caregiver</Text>
            </View>
            <Text style={styles.dataText}>• Anonymized Personal Deviation Score (0-100)</Text>
            <Text style={styles.dataText}>• Aggregated daily variances (e.g. Activity ↓ 15%)</Text>
            <Text style={styles.dataText}>• System persistence alerts</Text>
            <Text style={styles.dataText}>• Fall detection triggers</Text>
          </View>
        </Card>

        {/* Medical Disclaimer */}
        <Text style={styles.sectionTitle}>Medical Disclaimer</Text>
        <Card style={[styles.dataCard, { borderLeftWidth: 4, borderLeftColor: '#F4A261' }]}>
          <Text style={styles.disclaimerBold}>Not a Diagnostic System</Text>
          <Text style={styles.disclaimerText}>
            CareWatch AI is an early-warning telemetry system designed to flag biometric deviations for caregiver review. It is NOT a medical device, nor is it intended to diagnose, treat, cure, or prevent any disease. 
            {'\n\n'}
            In the event of a medical emergency, do not rely on CareWatch AI. Call emergency services immediately.
          </Text>
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
  closeButton: {
    padding: 6,
  },
  topBarTitle: {
    fontFamily: fonts.fraunces.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontFamily: fonts.fraunces.bold,
    fontSize: 26,
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontFamily: fonts.inter.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontFamily: fonts.inter.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  dataCard: {
    padding: 20,
    marginBottom: 24,
  },
  dataSection: {
    marginBottom: 8,
  },
  dataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dataTitle: {
    fontFamily: fonts.inter.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 8,
  },
  dataText: {
    fontFamily: fonts.inter.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
    paddingLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  disclaimerBold: {
    fontFamily: fonts.inter.bold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  disclaimerText: {
    fontFamily: fonts.inter.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  bottomSpacer: {
    height: 40,
  },
});
