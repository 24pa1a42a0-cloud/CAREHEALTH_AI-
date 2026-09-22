import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { CameraCapture } from '../components/CameraCapture';
import { RootStackScreenProps } from '../navigation/types';
import { useCareWatch } from '../context/CareWatchContext';
import { DEFAULT_PATIENT_BASELINE } from '../engine/deviationEngine';

export const SubmitScreen: React.FC<RootStackScreenProps<'Submit'>> = ({ navigation }) => {
  const { appendDailyCheckIn } = useCareWatch();

  const [step, setStep] = useState<'form' | 'review' | 'success'>('form');

  // Form State
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(10);
  const [voiceRecorded, setVoiceRecorded] = useState(false);

  const [activityLevel, setActivityLevel] = useState(5);
  const [sleepQuality, setSleepQuality] = useState<'Good' | 'Fair' | 'Poor' | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // Voice Recording Mock Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (isRecording && timer === 0) {
      setIsRecording(false);
      setVoiceRecorded(true);
    }
    return () => clearInterval(interval);
  }, [isRecording, timer]);

  const handleStartVoice = () => {
    setIsRecording(true);
    setTimer(10);
    setVoiceRecorded(false);
  };

  const handleReview = () => {
    setStep('review');
  };

  const handleSubmit = () => {
    // Generate a new dynamic data point based on inputs
    // Activity: map 0-10 slider to rough steps (e.g., 5 = baseline, 0 = low, 10 = high)
    const baseActivity = DEFAULT_PATIENT_BASELINE.activity.mean;
    const mappedActivity = Math.round(baseActivity * (activityLevel / 5));

    // Sleep: map to hours (Good: +0.5, Fair: baseline, Poor: -2.0)
    const baseSleep = DEFAULT_PATIENT_BASELINE.sleep.mean;
    const mappedSleep = sleepQuality === 'Good' ? baseSleep + 0.5 : sleepQuality === 'Poor' ? baseSleep - 2.0 : baseSleep;

    // Voice: mock stability based on whether they recorded it (if recorded, good; if skipped, slightly worse)
    const mappedVoice = voiceRecorded ? DEFAULT_PATIENT_BASELINE.voice.mean : DEFAULT_PATIENT_BASELINE.voice.mean - 2.0;

    // Movement: randomize slightly based on activity
    const mappedMovement = DEFAULT_PATIENT_BASELINE.movement.mean * (activityLevel / 5);

    const newReading = {
      date: new Date().toISOString().split('T')[0],
      readings: {
        activity: mappedActivity,
        sleep: Number(mappedSleep.toFixed(1)),
        voice: Number(mappedVoice.toFixed(1)),
        movement: Number(mappedMovement.toFixed(2)),
      },
    };

    appendDailyCheckIn(newReading);
    setStep('success');
  };

  if (step === 'success') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={80} color={colors.primary} style={{ marginBottom: 20 }} />
          <Text style={styles.successTitle}>Check-in Logged</Text>
          <Text style={styles.successSubtitle}>Thanks for your daily update. Your data has been synced to the deviation engine.</Text>
          <Button title="Back to Dashboard" onPress={() => navigation.goBack()} style={{ marginTop: 32, width: '80%' }} />
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'review') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Review Check-In</Text>
          
          <Card style={styles.reviewCard}>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Voice Sample</Text>
              <Text style={styles.reviewValue}>{voiceRecorded ? 'Recorded' : 'Skipped'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Activity Level</Text>
              <Text style={styles.reviewValue}>{activityLevel}/10</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Sleep Quality</Text>
              <Text style={styles.reviewValue}>{sleepQuality ?? 'Not Answered'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Daily Photo</Text>
              <Text style={styles.reviewValue}>{photoUri ? 'Attached' : 'Skipped'}</Text>
            </View>
          </Card>

          <Button title="Submit Data" onPress={handleSubmit} style={{ marginBottom: 16 }} />
          <Button title="Edit Answers" variant="outline" onPress={() => setStep('form')} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Daily Check-In</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Step 1: Voice */}
        <Text style={styles.sectionTitle}>1. Voice Check-In</Text>
        <Card style={styles.card}>
          <Text style={styles.promptText}>Please read the phrase out loud: "The sun is shining brightly today."</Text>
          <View style={styles.voiceContainer}>
            {!isRecording && !voiceRecorded ? (
              <TouchableOpacity style={styles.recordBtn} onPress={handleStartVoice}>
                <Ionicons name="mic" size={32} color={colors.white} />
              </TouchableOpacity>
            ) : isRecording ? (
              <View style={[styles.recordBtn, { backgroundColor: colors.alertAccent }]}>
                <Text style={styles.timerText}>0:{timer.toString().padStart(2, '0')}</Text>
              </View>
            ) : (
              <View style={[styles.recordBtn, { backgroundColor: colors.primary }]}>
                <Ionicons name="checkmark" size={32} color={colors.white} />
              </View>
            )}
            <Text style={styles.voiceStatus}>
              {!isRecording && !voiceRecorded ? 'Tap to start' : isRecording ? 'Recording...' : 'Recorded Successfully'}
            </Text>
          </View>
        </Card>

        {/* Step 2: Activity */}
        <Text style={styles.sectionTitle}>2. Activity Level</Text>
        <Card style={styles.card}>
          <Text style={styles.promptText}>How active have you felt today?</Text>
          <Text style={styles.sliderValue}>{activityLevel} / 10</Text>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0}
            maximumValue={10}
            step={1}
            value={activityLevel}
            onValueChange={setActivityLevel}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>Resting</Text>
            <Text style={styles.sliderLabelText}>Very Active</Text>
          </View>
        </Card>

        {/* Step 3: Sleep */}
        <Text style={styles.sectionTitle}>3. Sleep Quality</Text>
        <Card style={styles.card}>
          <Text style={styles.promptText}>How well did you sleep last night?</Text>
          <View style={styles.sleepRow}>
            {['Good', 'Fair', 'Poor'].map((opt) => (
              <TouchableOpacity 
                key={opt} 
                style={[styles.sleepBtn, sleepQuality === opt && styles.sleepBtnActive]}
                onPress={() => setSleepQuality(opt as any)}
              >
                <Text style={[styles.sleepBtnText, sleepQuality === opt && styles.sleepBtnTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Step 4: Camera */}
        <Text style={styles.sectionTitle}>4. Daily Photo</Text>
        <CameraCapture 
          onConfirm={(uri) => { setPhotoUri(uri); }} 
          onSkip={() => { setPhotoUri(null); }} 
        />
        {photoUri && (
          <Text style={styles.photoAttachedText}>Photo attached successfully.</Text>
        )}

        <View style={{ height: 32 }} />
        <Button 
          title="Review & Submit" 
          onPress={handleReview} 
          disabled={sleepQuality === null}
        />
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
  backButton: {
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
    paddingBottom: 40,
  },
  title: {
    fontFamily: fonts.fraunces.bold,
    fontSize: 28,
    color: colors.textPrimary,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: fonts.inter.bold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },
  card: {
    padding: 16,
    marginBottom: 20,
  },
  promptText: {
    fontFamily: fonts.inter.regular,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  voiceContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  recordBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  timerText: {
    fontFamily: fonts.spaceGrotesk.bold,
    fontSize: 16,
    color: colors.white,
  },
  voiceStatus: {
    fontFamily: fonts.inter.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  sliderValue: {
    fontFamily: fonts.spaceGrotesk.bold,
    fontSize: 20,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 4,
  },
  sliderLabelText: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  sleepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sleepBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  sleepBtnActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  sleepBtnText: {
    fontFamily: fonts.inter.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  sleepBtnTextActive: {
    color: colors.primary,
    fontFamily: fonts.inter.bold,
  },
  photoAttachedText: {
    fontFamily: fonts.inter.medium,
    fontSize: 14,
    color: colors.primary,
    textAlign: 'center',
    marginTop: 12,
  },
  reviewCard: {
    padding: 20,
    marginBottom: 24,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  reviewLabel: {
    fontFamily: fonts.inter.medium,
    fontSize: 15,
    color: colors.textSecondary,
  },
  reviewValue: {
    fontFamily: fonts.inter.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successTitle: {
    fontFamily: fonts.fraunces.bold,
    fontSize: 28,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  successSubtitle: {
    fontFamily: fonts.inter.regular,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomSpacer: {
    height: 30,
  },
});
