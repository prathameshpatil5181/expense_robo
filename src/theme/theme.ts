/**
 * CRED-inspired Design System
 * Dark theme with bold typography, gradient accents, and premium fintech aesthetic.
 */

export const Colors = {
  // Backgrounds
  background: '#0B0B0F',
  cardSurface: '#17171C',
  cardSurfaceLight: '#1E1E25',
  inputBackground: '#12121A',
  
  // Borders
  border: '#2A2A35',
  borderLight: '#3A3A48',
  borderFocus: '#4A4A5A',
  
  // Accent - Income (Neon Green)
  incomeGreen: '#3DDC97',
  incomeGreenDim: '#2BA872',
  incomeGreenGlow: 'rgba(61, 220, 151, 0.15)',
  incomeGreenSoft: 'rgba(61, 220, 151, 0.08)',
  
  // Accent - Expense (Coral Red)
  expenseRed: '#FF5C5C',
  expenseRedDim: '#CC4A4A',
  expenseRedGlow: 'rgba(255, 92, 92, 0.15)',
  expenseRedSoft: 'rgba(255, 92, 92, 0.08)',
  
  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0B0',
  textTertiary: '#6B6B7B',
  textMuted: '#4A4A58',
  
  // Status badges
  statusPaidBg: 'rgba(61, 220, 151, 0.12)',
  statusPaidText: '#3DDC97',
  statusPendingBg: 'rgba(255, 183, 77, 0.12)',
  statusPendingText: '#FFB74D',
  
  // FAB gradient
  fabGradientStart: '#6C63FF',
  fabGradientEnd: '#4ECDC4',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.6)',
  
  // Danger
  danger: '#FF4757',
  dangerDim: '#CC3945',
  dangerSoft: 'rgba(255, 71, 87, 0.12)',
  
  // White with opacity
  white05: 'rgba(255, 255, 255, 0.05)',
  white08: 'rgba(255, 255, 255, 0.08)',
  white10: 'rgba(255, 255, 255, 0.10)',
  white15: 'rgba(255, 255, 255, 0.15)',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 999,
} as const;

export const FontFamily = {
  heading: 'Poppins-Bold',
  headingSemiBold: 'Poppins-SemiBold',
  headingMedium: 'Poppins-Medium',
  body: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  bodySemiBold: 'Inter-SemiBold',
  mono: 'Inter-SemiBold', // Used for tabular numbers / amounts
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 44,
} as const;

export const Shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  fab: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 6,
  },
} as const;

export const Theme = {
  colors: Colors,
  spacing: Spacing,
  radii: Radii,
  fontFamily: FontFamily,
  fontSize: FontSize,
  shadows: Shadows,
} as const;

export default Theme;
