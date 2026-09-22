import { colors } from './colors';
import { fonts, typography } from './typography';
import { shadows } from './shadows';

export const theme = {
  colors,
  fonts,
  typography,
  shadows,
  borderRadius: {
    card: 16,
    sm: 8,
    md: 12,
    lg: 16,
    pill: 9999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
};

export type Theme = typeof theme;
export * from './colors';
export * from './typography';
export * from './shadows';
