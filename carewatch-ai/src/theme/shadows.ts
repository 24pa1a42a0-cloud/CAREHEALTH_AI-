import { ViewStyle } from 'react-native';

export const shadows: Record<string, ViewStyle> = {
  soft: {
    shadowColor: '#1B1B1B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  card: {
    shadowColor: '#1B1B1B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
  },
  subtle: {
    shadowColor: '#1B1B1B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  floating: {
    shadowColor: '#1B1B1B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
};
