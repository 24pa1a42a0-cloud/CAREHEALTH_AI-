import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { RootStackScreenProps } from '../navigation/types';
import { useCareWatch } from '../context/CareWatchContext';

const DISCHARGE_CONDITIONS = [
  'Post-Op Cardiac Surgery',
  'Hip / Knee Joint Replacement',
  'Stroke Rehabilitation & Neuro',
  'General Fall Risk & Frailty',
  'Pulmonary / Respiratory (COPD)',
  'Cognitive Care & Memory Support',
];

interface MetricCardState {
  title: string;
  category: string;
  icon: keyof typeof Ionicons.glyphMap;
  placeholderRange: string;
  detail: string;
}

const METRIC_CARDS: MetricCardState[] = [
  {
    title: 'Activity',
    category: 'Daily Cadence',
    icon: 'walk-outline',
    placeholderRange: '3,200 – 4,800 steps/day',
    detail: 'Autonomous exertion & stride threshold model',
  },
  {
    title: 'Sleep',
    category: 'Circadian Rest',
    icon: 'moon-outline',
    placeholderRange: '7.2 – 8.5 hrs (92% efficiency)',
    detail: 'Nocturnal architecture & waking frequency limit',
  },
  {
    title: 'Voice',
    category: 'Acoustic Biomarkers',
    icon: 'mic-outline',
    placeholderRange: 'Acoustic stability: 94%',
    detail: 'Vocal pitch variance & respiratory breath cadence',
  },
  {
    title: 'Movement',
    category: 'Gait & Postural Sway',
    icon: 'body-outline',
    placeholderRange: 'Gait velocity: 0.90 – 1.05 m/s',
    detail: 'Bilateral symmetry & micro-stumble deceleration',
  },
];

export const OnboardingScreen: React.FC<RootStackScreenProps<'Onboarding'>> = ({
  navigation,
}) => {
  const { patient, saveBaselineData } = useCareWatch();

  // Phase control: 'form' | 'learning' | 'completed'
  const [phase, setPhase] = useState<'form' | 'learning' | 'completed'>('form');

  // Form Fields
  const [name, setName] = useState(patient.name || 'Eleanor Vance');
  const [age, setAge] = useState(patient.age || '78');
  const [condition, setCondition] = useState(
    patient.dischargeCondition || DISCHARGE_CONDITIONS[0]
  );
  const [conditionPickerOpen, setConditionPickerOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Animated revelation states for 4 cards
  const [revealedCount, setRevealedCount] = useState(0);
  const [settledCount, setSettledCount] = useState(0);

  // Animation values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Staggered card animation values [fade, translateY]
  const cardAnims = useRef(
    METRIC_CARDS.map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(28),
      scale: new Animated.Value(0.96),
    }))
  ).current;

  // Pulse animation for scanner
  useEffect(() => {
    if (phase === 'learning') {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();
      return () => pulseLoop.stop();
    }
  }, [phase]);

  // Handle Form Submission -> Start Learning Sequence
  const handleStartLearning = () => {
    if (!name.trim()) {
      setFormError('Please enter the patient or wearer name.');
      return;
    }
    if (!age.trim() || isNaN(Number(age)) || Number(age) <= 0) {
      setFormError('Please enter a valid age.');
      return;
    }

    setFormError(null);
    setPhase('learning');
    setRevealedCount(0);
    setSettledCount(0);

    // Reset card animation values
    cardAnims.forEach((anim) => {
      anim.opacity.setValue(0);
      anim.translateY.setValue(28);
      anim.scale.setValue(0.96);
    });

    // Animate overall progress bar over 4.5s
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 4400,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();

    // Sequence timetable for the 4 cards:
    // Card 0 (Activity): reveal at 500ms, settle at 1200ms
    // Card 1 (Sleep): reveal at 1400ms, settle at 2100ms
    // Card 2 (Voice): reveal at 2300ms, settle at 3000ms
    // Card 3 (Movement): reveal at 3200ms, settle at 3900ms
    // Finished at 4300ms

    const timers: ReturnType<typeof setTimeout>[] = [];

    METRIC_CARDS.forEach((_, index) => {
      const revealDelay = 500 + index * 900;
      const settleDelay = revealDelay + 700;

      // Reveal card
      timers.push(
        setTimeout(() => {
          setRevealedCount(index + 1);
          Animated.parallel([
            Animated.timing(cardAnims[index].opacity, {
              toValue: 1,
              duration: 450,
              useNativeDriver: true,
            }),
            Animated.timing(cardAnims[index].translateY, {
              toValue: 0,
              duration: 450,
              easing: Easing.out(Easing.back(1.4)),
              useNativeDriver: true,
            }),
            Animated.timing(cardAnims[index].scale, {
              toValue: 1,
              duration: 450,
              useNativeDriver: true,
            }),
          ]).start();
        }, revealDelay)
      );

      // Settle into range
      timers.push(
        setTimeout(() => {
          setSettledCount((prev) => Math.max(prev, index + 1));
        }, settleDelay)
      );
    });

    // Complete sequence
    timers.push(
      setTimeout(() => {
        setPhase('completed');
      }, 4300)
    );
  };

  // Finish Onboarding & Save
  const handleFinish = () => {
    saveBaselineData({
      name: name.trim(),
      age: age.trim(),
      dischargeCondition: condition,
    });
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top App Header */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => {
              if (phase === 'learning') {
                setPhase('form');
              } else {
                navigation.goBack();
              }
            }}
            style={styles.navButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.brandTitle}>CareWatch AI</Text>

          <TouchableOpacity
            onPress={handleFinish}
            style={styles.navButton}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ================= STAGE 1: INTAKE FORM ================= */}
          {phase === 'form' && (
            <View style={styles.formContainer}>
              <View style={styles.headerSection}>
                <View style={styles.pillBadge}>
                  <Ionicons name="clipboard-outline" size={14} color={colors.primary} />
                  <Text style={styles.pillText}>Stage 1 • Clinical Intake</Text>
                </View>
                <Text style={styles.headingTitle}>Patient Intake Profile</Text>
                <Text style={styles.bodyDescription}>
                  Configure baseline biometric modeling parameters based on medical discharge status.
                </Text>
              </View>

              {formError && (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={18} color={colors.alertAccent} />
                  <Text style={styles.errorBannerText}>{formError}</Text>
                </View>
              )}

              <Card style={styles.formCard}>
                {/* Full Name Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Patient Full Name</Text>
                  <View style={styles.textInputWrapper}>
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={colors.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={name}
                      onChangeText={(val) => {
                        setName(val);
                        if (formError) setFormError(null);
                      }}
                      placeholder="e.g. Eleanor Vance"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>
                </View>

                {/* Age Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Age</Text>
                  <View style={styles.textInputWrapper}>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color={colors.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={age}
                      onChangeText={(val) => {
                        setAge(val);
                        if (formError) setFormError(null);
                      }}
                      placeholder="e.g. 78"
                      keyboardType="numeric"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>
                </View>

                {/* Discharge Condition Dropdown Selector */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Discharge Condition</Text>
                  <TouchableOpacity
                    style={styles.dropdownTrigger}
                    activeOpacity={0.8}
                    onPress={() => setConditionPickerOpen(true)}
                  >
                    <View style={styles.dropdownLeft}>
                      <Ionicons
                        name="medkit-outline"
                        size={20}
                        color={colors.primary}
                        style={styles.inputIcon}
                      />
                      <Text style={styles.dropdownValue}>{condition}</Text>
                    </View>
                    <Ionicons
                      name="chevron-down"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                  <Text style={styles.helperText}>
                    Select primary clinical recovery focus for algorithm sensitivity.
                  </Text>
                </View>
              </Card>

              {/* Protocol Highlights */}
              <View style={styles.highlightsBox}>
                <View style={styles.highlightItem}>
                  <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
                  <Text style={styles.highlightText}>
                    HIPAA compliant on-device biometric learning
                  </Text>
                </View>
                <View style={styles.highlightItem}>
                  <Ionicons name="sparkles" size={18} color={colors.primary} />
                  <Text style={styles.highlightText}>
                    Passive calibration with zero user calibration burden
                  </Text>
                </View>
              </View>

              <Button
                title="Calibrate My Baseline"
                onPress={handleStartLearning}
                size="large"
                icon={<Ionicons name="analytics" size={20} color={colors.white} />}
                style={styles.submitButton}
              />
            </View>
          )}

          {/* ============ STAGE 2: ANIMATED BASELINE SEQUENCE ============ */}
          {(phase === 'learning' || phase === 'completed') && (
            <View style={styles.learningContainer}>
              {/* Header */}
              <View style={styles.headerSection}>
                <Animated.View
                  style={[
                    styles.radarCircle,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                >
                  <Ionicons
                    name={phase === 'completed' ? 'checkmark-circle' : 'pulse'}
                    size={36}
                    color={phase === 'completed' ? colors.primary : colors.alertAccent}
                  />
                </Animated.View>

                <Text style={styles.headingTitle}>
                  {phase === 'completed'
                    ? 'Baseline Established'
                    : 'Learning your baseline...'}
                </Text>
                <Text style={styles.bodyDescription}>
                  {phase === 'completed'
                    ? `Personalized biometric thresholds successfully calibrated for ${name}.`
                    : `Synthesizing bio-telemetry algorithms against ${condition} recovery protocols.`}
                </Text>
              </View>

              {/* Real-time Progress bar */}
              <View style={styles.progressSection}>
                <View style={styles.progressMeta}>
                  <Text style={styles.progressLabel}>
                    {phase === 'completed'
                      ? 'Model 100% Calibrated'
                      : `Calibrating Parameters (${revealedCount}/4)...`}
                  </Text>
                  <Text style={styles.progressPercent}>
                    {Math.min(settledCount * 25, 100)}%
                  </Text>
                </View>
                <View style={styles.progressBarTrack}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: progressAnim.interpolate({
                          inputRange: [0, 100],
                          outputRange: ['0%', '100%'],
                        }),
                        backgroundColor:
                          phase === 'completed' ? colors.primary : colors.primary,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Progressively Revealed Metric Cards */}
              <View style={styles.cardsStack}>
                {METRIC_CARDS.map((card, index) => {
                  const isRevealed = revealedCount > index;
                  const isSettled = settledCount > index;

                  if (!isRevealed) {
                    return null;
                  }

                  return (
                    <Animated.View
                      key={card.title}
                      style={[
                        styles.animatedCardWrapper,
                        {
                          opacity: cardAnims[index].opacity,
                          transform: [
                            { translateY: cardAnims[index].translateY },
                            { scale: cardAnims[index].scale },
                          ],
                        },
                      ]}
                    >
                      <Card
                        style={[
                          styles.metricCard,
                          isSettled && styles.metricCardSettled,
                        ]}
                      >
                        <View style={styles.cardHeader}>
                          <View style={styles.cardHeaderLeft}>
                            <View
                              style={[
                                styles.cardIconCircle,
                                {
                                  backgroundColor: isSettled
                                    ? colors.primaryLight
                                    : colors.alertAccentLight,
                                },
                              ]}
                            >
                              <Ionicons
                                name={card.icon}
                                size={20}
                                color={
                                  isSettled ? colors.primary : colors.alertAccent
                                }
                              />
                            </View>
                            <View>
                              <Text style={styles.cardTitle}>{card.title}</Text>
                              <Text style={styles.cardCategory}>
                                {card.category}
                              </Text>
                            </View>
                          </View>

                          <Badge
                            label={isSettled ? 'CALIBRATED' : 'ANALYZING...'}
                            variant={isSettled ? 'success' : 'alert'}
                          />
                        </View>

                        {/* Metric Range Settling Area */}
                        <View style={styles.rangeContainer}>
                          <Text style={styles.rangeSubLabel}>
                            {isSettled
                              ? 'Normative Range Target'
                              : 'Analyzing Sensor Stream...'}
                          </Text>
                          <Text
                            style={[
                              styles.rangeValue,
                              isSettled
                                ? styles.rangeValueSettled
                                : styles.rangeValueScanning,
                            ]}
                          >
                            {isSettled
                              ? card.placeholderRange
                              : 'Computing variance bounds...'}
                          </Text>
                        </View>

                        <Text style={styles.cardDetailText}>{card.detail}</Text>
                      </Card>
                    </Animated.View>
                  );
                })}
              </View>

              {/* Completion Banner & Action Button */}
              {phase === 'completed' && (
                <View style={styles.completionSection}>
                  <Card style={styles.completionBanner}>
                    <View style={styles.completionBannerContent}>
                      <Ionicons
                        name="checkmark-done-circle"
                        size={32}
                        color={colors.primary}
                      />
                      <View style={styles.completionTextContainer}>
                        <Text style={styles.completionTitle}>
                          Ready for Continuous Monitoring
                        </Text>
                        <Text style={styles.completionSubtitle}>
                          All 4 recovery baselines are active. Live telemetry will continuously adjust as Eleanor stabilizes.
                        </Text>
                      </View>
                    </View>
                  </Card>

                  <Button
                    title="Enter CareWatch AI Dashboard"
                    onPress={handleFinish}
                    size="large"
                    icon={
                      <Ionicons
                        name="arrow-forward"
                        size={20}
                        color={colors.white}
                      />
                    }
                    style={styles.finishButton}
                  />
                </View>
              )}
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Condition Picker Modal */}
        <Modal
          visible={conditionPickerOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setConditionPickerOpen(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setConditionPickerOpen(false)}
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Discharge Condition</Text>
                <TouchableOpacity
                  onPress={() => setConditionPickerOpen(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalOptionsList}>
                {DISCHARGE_CONDITIONS.map((cond) => {
                  const isSelected = cond === condition;
                  return (
                    <TouchableOpacity
                      key={cond}
                      style={[
                        styles.conditionOption,
                        isSelected && styles.conditionOptionSelected,
                      ]}
                      onPress={() => {
                        setCondition(cond);
                        setConditionPickerOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.conditionOptionText,
                          isSelected && styles.conditionOptionTextSelected,
                        ]}
                      >
                        {cond}
                      </Text>
                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color={colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
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
  navButton: {
    padding: 6,
  },
  brandTitle: {
    fontFamily: fonts.fraunces.bold,
    fontSize: 18,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  skipText: {
    fontFamily: fonts.inter.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
  },

  /* Header Section */
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 9999,
    marginBottom: 12,
  },
  pillText: {
    fontFamily: fonts.spaceGrotesk.medium,
    fontSize: 12,
    color: colors.primary,
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  headingTitle: {
    fontFamily: fonts.fraunces.bold,
    fontSize: 28,
    lineHeight: 34,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  bodyDescription: {
    fontFamily: fonts.inter.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 12,
  },

  /* Form Stage */
  formContainer: {
    width: '100%',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.alertAccentLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(224, 122, 95, 0.3)',
  },
  errorBannerText: {
    fontFamily: fonts.inter.medium,
    fontSize: 13,
    color: colors.alertAccent,
    marginLeft: 8,
    flex: 1,
  },
  formCard: {
    marginBottom: 20,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontFamily: fonts.inter.semiBold,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  textInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontFamily: fonts.inter.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    height: 52,
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  dropdownValue: {
    fontFamily: fonts.inter.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  helperText: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
    marginLeft: 2,
  },
  highlightsBox: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  highlightText: {
    fontFamily: fonts.inter.regular,
    fontSize: 13,
    color: colors.textPrimary,
    marginLeft: 10,
  },
  submitButton: {
    width: '100%',
  },

  /* Learning Stage */
  learningContainer: {
    width: '100%',
  },
  radarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(45, 106, 79, 0.2)',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontFamily: fonts.inter.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  progressPercent: {
    fontFamily: fonts.spaceGrotesk.bold,
    fontSize: 13,
    color: colors.primary,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  cardsStack: {
    marginBottom: 20,
  },
  animatedCardWrapper: {
    marginBottom: 14,
  },
  metricCard: {
    padding: 18,
    borderLeftWidth: 4,
    borderLeftColor: colors.alertAccent,
  },
  metricCardSettled: {
    borderLeftColor: colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontFamily: fonts.fraunces.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  cardCategory: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  rangeContainer: {
    backgroundColor: colors.surfaceSubtle,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  rangeSubLabel: {
    fontFamily: fonts.inter.medium,
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  rangeValue: {
    fontFamily: fonts.spaceGrotesk.bold,
    fontSize: 16,
  },
  rangeValueSettled: {
    color: colors.primary,
  },
  rangeValueScanning: {
    color: colors.alertAccent,
  },
  cardDetailText: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },

  /* Completion Section */
  completionSection: {
    marginTop: 8,
  },
  completionBanner: {
    marginBottom: 20,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: 'rgba(45, 106, 79, 0.25)',
  },
  completionBannerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  completionTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  completionTitle: {
    fontFamily: fonts.fraunces.bold,
    fontSize: 16,
    color: colors.primary,
    marginBottom: 4,
  },
  completionSubtitle: {
    fontFamily: fonts.inter.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textPrimary,
  },
  finishButton: {
    width: '100%',
  },

  /* Modal Dropdown */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxHeight: '70%',
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontFamily: fonts.fraunces.bold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalOptionsList: {
    maxHeight: 340,
  },
  conditionOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  conditionOptionSelected: {
    backgroundColor: colors.primaryLight,
  },
  conditionOptionText: {
    fontFamily: fonts.inter.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  conditionOptionTextSelected: {
    color: colors.primary,
    fontFamily: fonts.inter.semiBold,
  },

  bottomSpacer: {
    height: 40,
  },
});
