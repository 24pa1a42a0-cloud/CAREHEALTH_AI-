import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { Button } from '../components/Button';
import { useCareWatch, AppRole } from '../context/CareWatchContext';

export const LoginScreen: React.FC = () => {
  const { login } = useCareWatch();
  const [role, setRole] = useState<AppRole>('patient');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState('');
  
  const [error, setError] = useState('');

  const validateEmail = (val: string) => {
    return /\S+@\S+\.\S+/.test(val);
  };

  const handleSubmit = () => {
    setError('');
    
    if (otpMode) {
      if (otp.length < 4) {
        setError('Please enter a valid 4-digit code.');
        return;
      }
      login(role, name);
      return;
    }

    if (!email || !password) {
      setError('Email and password cannot be empty.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Mock auth success
    login(role, name);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.title}>CareWatch AI</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.roleToggle}>
          <TouchableOpacity 
            style={[styles.roleBtn, role === 'patient' && styles.roleBtnActive]}
            onPress={() => setRole('patient')}
          >
            <Text style={[styles.roleText, role === 'patient' && styles.roleTextActive]}>Patient</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.roleBtn, role === 'caregiver' && styles.roleBtnActive]}
            onPress={() => setRole('caregiver')}
          >
            <Text style={[styles.roleText, role === 'caregiver' && styles.roleTextActive]}>Caregiver</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
            />
          </View>
          
          {otpMode ? (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>One-Time Password (OTP)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 4-digit code"
                keyboardType="numeric"
                maxLength={4}
                value={otp}
                onChangeText={setOtp}
              />
            </View>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email or Phone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </>
          )}

          <Button 
            title={otpMode ? "Verify & Log In" : "Log In"} 
            onPress={handleSubmit} 
            style={{ marginTop: 12 }}
          />

          {!otpMode && (
            <Button 
              title="Continue with OTP instead" 
              variant="outline" 
              onPress={() => {
                setOtpMode(true);
                setError('');
              }} 
              style={{ marginTop: 16 }}
            />
          )}

          {otpMode && (
            <TouchableOpacity onPress={() => { setOtpMode(false); setError(''); }} style={styles.linkButton}>
              <Text style={styles.linkText}>Back to password login</Text>
            </TouchableOpacity>
          )}

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity>
              <Text style={styles.signupText}> Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontFamily: fonts.fraunces.bold,
    fontSize: 32,
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.inter.regular,
    fontSize: 16,
    color: colors.textSecondary,
  },
  roleToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    padding: 4,
    marginBottom: 32,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  roleBtnActive: {
    backgroundColor: colors.white,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  roleText: {
    fontFamily: fonts.inter.medium,
    fontSize: 15,
    color: colors.textSecondary,
  },
  roleTextActive: {
    fontFamily: fonts.inter.bold,
    color: colors.primary,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: fonts.inter.medium,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    fontFamily: fonts.inter.regular,
    fontSize: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.textPrimary,
  },
  errorText: {
    fontFamily: fonts.inter.medium,
    fontSize: 14,
    color: colors.alertAccent,
    marginBottom: 16,
    textAlign: 'center',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    fontFamily: fonts.inter.medium,
    fontSize: 14,
    color: colors.primary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontFamily: fonts.inter.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  signupText: {
    fontFamily: fonts.inter.bold,
    fontSize: 14,
    color: colors.primary,
  },
});
