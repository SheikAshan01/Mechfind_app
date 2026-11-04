/**
 * MECHFIND Production Mobility Design System
 * Reference: Mobile-First Rapido/Uber/Ola-inspired Clean Palette
 * - Primary Blue: #1769E8
 * - Secondary Teal: #14B8A6
 * - Success Green: #16A34A
 * - Background: #F8FAFC
 * - Card Background: #FFFFFF
 * - Primary Text: #172338
 * - Secondary Text: #64748B
 * - Border: #E2E8F0
 * - Error: #DC2626
 */

export const BRAND_COLORS = {
  primaryBlue: '#1769F5',
  primary: '#1769F5',
  primaryHover: '#1358C2',
  secondaryNavy: '#17243A',
  secondaryTeal: '#14B8A6',
  accentTeal: '#14B8A6',
  accentTealHover: '#0D9488',
  accentTealMuted: 'rgba(20, 184, 166, 0.12)',
  successGreen: '#16A34A',
  success: '#16A34A',
  successLight: 'rgba(22, 163, 74, 0.10)',
  background: '#F7F9FC',
  cardBackground: '#FFFFFF',
  primaryText: '#17243A',
  secondaryText: '#64748B',
  border: '#E2E8F0',
  error: '#DC2626',
  errorLight: 'rgba(220, 38, 38, 0.10)',
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.10)',
  white: '#FFFFFF',

  // Compatibility aliases
  primaryNavy: '#1769F5',
  primaryBlack: '#17243A',
  secondaryBlack: '#64748B',
  brandYellow: '#1769F5',
  brandYellowHover: '#1358C2',
  brandYellowMuted: 'rgba(23, 105, 245, 0.08)',
  lightBackground: '#F7F9FC',
  borderDark: '#1E293B',
  info: '#1769F5',
  infoLight: 'rgba(23, 105, 245, 0.08)',
} as const;

export interface ThemeColors {
  isDark: boolean;
  background: string;
  surface: string;
  surfaceElevated: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  primary: string;
  primaryNavy: string;
  secondaryNavy: string;
  primaryContrast: string;
  accent: string;
  accentTeal: string;
  success: string;
  successBg: string;
  error: string;
  errorBg: string;
  warning: string;
  warningBg: string;
  info: string;
  infoBg: string;
  inputBg: string;
  divider: string;
  tabBar: string;
  tabBarActive: string;
  tabBarInactive: string;
  badgeBg: string;
  badgeText: string;
  overlay: string;
}

export const lightTheme: ThemeColors = {
  isDark: false,
  background: '#F7F9FC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  card: '#FFFFFF',
  textPrimary: '#17243A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  border: '#E2E8F0',
  primary: '#1769F5',
  primaryNavy: '#1769F5',
  secondaryNavy: '#17243A',
  primaryContrast: '#FFFFFF',
  accent: '#14B8A6',
  accentTeal: '#14B8A6',
  success: '#16A34A',
  successBg: 'rgba(22, 163, 74, 0.10)',
  error: '#DC2626',
  errorBg: 'rgba(220, 38, 38, 0.10)',
  warning: '#F59E0B',
  warningBg: 'rgba(245, 158, 11, 0.10)',
  info: '#1769F5',
  infoBg: 'rgba(23, 105, 245, 0.08)',
  inputBg: '#FFFFFF',
  divider: '#E2E8F0',
  tabBar: '#FFFFFF',
  tabBarActive: '#1769F5',
  tabBarInactive: '#64748B',
  badgeBg: '#F1F5F9',
  badgeText: '#17243A',
  overlay: 'rgba(15, 23, 42, 0.6)',
};

export const darkTheme: ThemeColors = {
  isDark: true,
  background: '#0B111E',
  surface: '#131D2E',
  surfaceElevated: '#1E293B',
  card: '#131D2E',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  border: '#1E293B',
  primary: '#3B82F6',
  primaryNavy: '#3B82F6',
  secondaryNavy: '#1D4ED8',
  primaryContrast: '#FFFFFF',
  accent: '#14B8A6',
  accentTeal: '#14B8A6',
  success: '#16A34A',
  successBg: 'rgba(22, 163, 74, 0.15)',
  error: '#DC2626',
  errorBg: 'rgba(220, 38, 38, 0.15)',
  warning: '#F59E0B',
  warningBg: 'rgba(245, 158, 11, 0.15)',
  info: '#38BDF8',
  infoBg: 'rgba(56, 189, 248, 0.15)',
  inputBg: '#1E293B',
  divider: '#1E293B',
  tabBar: '#0B111E',
  tabBarActive: '#3B82F6',
  tabBarInactive: '#64748B',
  badgeBg: '#1E293B',
  badgeText: '#F8FAFC',
  overlay: 'rgba(11, 17, 30, 0.75)',
};
