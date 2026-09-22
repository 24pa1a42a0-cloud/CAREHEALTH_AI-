import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { Card } from '../components/Card';
import { TabScreenProps } from '../navigation/types';
import { useCareWatch } from '../context/CareWatchContext';

export const SettingsScreen: React.FC<TabScreenProps<'Settings'>> = ({ navigation }) => {
  const { role, setRole, resetOnboarding, simulateScenario } = useCareWatch();

  // Mock Notification State
  const [notifyAlerts, setNotifyAlerts] = useState(true);
  const [notifySummary, setNotifySummary] = useState(false);
  const [notifyFall, setNotifyFall] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Profile & Role Management */}
        <Text style={styles.sectionTitle}>App Experience</Text>
        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="person-circle-outline" size={22} color={colors.primary} style={styles.icon} />
              <View>
                <Text style={styles.rowLabel}>Current Role</Text>
                <Text style={styles.rowSubLabel}>
                  {role === 'patient' ? 'Patient Interface' : 'Caregiver Interface'}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.roleToggleContainer}>
            <TouchableOpacity
              style={[styles.roleButton, role === 'patient' && styles.roleButtonActive]}
              onPress={() => setRole('patient')}
            >
              <Text style={[styles.roleButtonText, role === 'patient' && styles.roleButtonTextActive]}>
                Patient
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, role === 'caregiver' && styles.roleButtonActive]}
              onPress={() => setRole('caregiver')}
            >
              <Text style={[styles.roleButtonText, role === 'caregiver' && styles.roleButtonTextActive]}>
                Caregiver
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Notifications (Mock) */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="notifications-outline" size={22} color={colors.textSecondary} style={styles.icon} />
              <Text style={styles.rowLabel}>Push Alerts (Deviation thresholds)</Text>
            </View>
            <Switch
              value={notifyAlerts}
              onValueChange={setNotifyAlerts}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={notifyAlerts ? colors.primary : colors.textSecondary}
            />
          </View>
          
          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="document-text-outline" size={22} color={colors.textSecondary} style={styles.icon} />
              <Text style={styles.rowLabel}>Daily Summary Brief</Text>
            </View>
            <Switch
              value={notifySummary}
              onValueChange={setNotifySummary}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={notifySummary ? colors.primary : colors.textSecondary}
            />
          </View>
          
          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="warning-outline" size={22} color={colors.alertAccent} style={styles.icon} />
              <Text style={styles.rowLabel}>Fall Detection SOS</Text>
            </View>
            <Switch
              value={notifyFall}
              onValueChange={setNotifyFall}
              trackColor={{ false: colors.border, true: colors.alertAccentLight }}
              thumbColor={notifyFall ? colors.alertAccent : colors.textSecondary}
            />
          </View>
        </Card>

        {/* Legal & Safety */}
        <Text style={styles.sectionTitle}>Legal & Privacy</Text>
        <Card style={styles.card}>
          <TouchableOpacity 
            style={styles.actionRow} 
            onPress={() => navigation.navigate('PrivacySafety')}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} style={styles.icon} />
              <Text style={styles.rowLabel}>Privacy & Safety</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        {/* Development Actions */}
        <Text style={styles.sectionTitle}>Development & Demo</Text>
        <Card style={styles.card}>
          <TouchableOpacity 
            style={[styles.actionRow, { marginBottom: 16 }]} 
            onPress={() => simulateScenario('normal')}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="play-outline" size={22} color={colors.primary} style={styles.icon} />
              <Text style={[styles.rowLabel, { color: colors.primary }]}>Simulate Normal Week</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity 
            style={[styles.actionRow, { marginBottom: 16, marginTop: 16 }]} 
            onPress={() => simulateScenario('declining')}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="trending-down-outline" size={22} color={colors.alertAccent} style={styles.icon} />
              <Text style={[styles.rowLabel, { color: colors.alertAccent }]}>Simulate Declining Week</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity 
            style={[styles.actionRow, { marginTop: 16 }]} 
            onPress={() => {
              resetOnboarding();
              navigation.navigate('Onboarding');
            }}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="refresh-outline" size={22} color={colors.textSecondary} style={styles.icon} />
              <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Reset Demo & Data</Text>
            </View>
          </TouchableOpacity>
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
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontFamily: fonts.inter.bold,
    fontSize: 28,
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontFamily: fonts.inter.semiBold,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingLeft: 4,
  },
  card: {
    padding: 16,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 16,
  },
  icon: {
    marginRight: 12,
  },
  rowLabel: {
    fontFamily: fonts.inter.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  rowSubLabel: {
    fontFamily: fonts.inter.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  roleToggleContainer: {
    flexDirection: 'row',
    marginTop: 16,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    padding: 4,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  roleButtonActive: {
    backgroundColor: colors.white,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  roleButtonText: {
    fontFamily: fonts.inter.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  roleButtonTextActive: {
    color: colors.primary,
    fontFamily: fonts.inter.semiBold,
  },
  bottomSpacer: {
    height: 40,
  },
});
