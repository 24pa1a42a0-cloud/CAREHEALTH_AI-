import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, StyleProp } from 'react-native';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  padded?: boolean;
  padding?: number;
  variant?: 'elevated' | 'flat' | 'bordered';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  padded = true,
  padding = 18,
  variant = 'elevated',
}) => {
  const cardStyles: StyleProp<ViewStyle> = [
    styles.card,
    variant === 'elevated' && styles.elevated,
    variant === 'bordered' && styles.bordered,
    variant === 'flat' && styles.flat,
    padded && { padding },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={cardStyles}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    overflow: 'hidden',
  },
  elevated: {
    ...shadows.card,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.03)',
  },
  bordered: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  flat: {
    backgroundColor: colors.surfaceSubtle,
  },
});
