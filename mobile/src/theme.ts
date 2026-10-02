import { Platform } from 'react-native';

export const colors = {
  background: '#F6F7F4',
  surface: '#FFFFFF',
  border: '#E3E6DF',
  text: '#1B1F1A',
  textMuted: '#6B7266',
  primary: '#2F9E5B',
  primaryDark: '#237A45',
  onPrimary: '#FFFFFF',
  danger: '#D64545',
  streak: '#F28C28',
  xp: '#7C5CE0',
  // One color per macro, used for rings/bars so they stay consistent across screens.
  calories: '#2F9E5B',
  protein: '#3B82F6',
  carbs: '#F2A93B',
  fat: '#E86A92',
  track: '#E8EBE4',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
};

export const fonts = {
  regular: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
  medium: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' }),
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 28,
    xxl: 36,
  },
  weights: {
    regular: '400' as const,
    medium: '600' as const,
    bold: '700' as const,
  },
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
};

export const theme = { colors, spacing, radius, fonts, shadow };
export type Theme = typeof theme;
