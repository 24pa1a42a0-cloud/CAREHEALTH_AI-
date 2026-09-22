import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export interface BadgeProps {
  label: string;
  variant?: 'alert' | 'primary' | 'neutral' | 'success';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  style,
}) => {
  return (
    <View style={[styles.badge, styles[variant], style]}>
      <Text style={[styles.text, styles[`${variant}Text`]]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: fonts.spaceGrotesk.medium,
    fontSize: 12,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  alert: {
    backgroundColor: colors.alertAccentLight,
    borderWidth: 1,
    borderColor: 'rgba(224, 122, 95, 0.25)',
  },
  alertText: {
    color: colors.alertAccent,
  },
  primary: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: 'rgba(45, 106, 79, 0.2)',
  },
  primaryText: {
    color: colors.primary,
  },
  neutral: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  neutralText: {
    color: colors.textSecondary,
  },
  success: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: 'rgba(45, 106, 79, 0.25)',
  },
  successText: {
    color: colors.primary,
  },
});
