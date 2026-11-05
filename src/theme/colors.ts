/**
 * MECHFIND automotive design system.
 * Black, charcoal, silver and white form the base; brand yellow is reserved
 * for primary actions, active states and key status indicators.
 */
export const BRAND_COLORS = {
  primaryBlue: '#101114',
  primary: '#101114',
  primaryHover: '#1A1B1F',
  secondaryNavy: '#1A1B1F',
  secondaryTeal: '#70737B',
  accentTeal: '#FFC400',
  accentTealHover: '#E5AC00',
  accentTealMuted: 'rgba(255, 196, 0, 0.14)',
  successGreen: '#16A36A',
  success: '#16A36A',
  successLight: 'rgba(22, 163, 106, 0.10)',
  background: '#F1F2F4',
  cardBackground: '#FFFFFF',
  primaryText: '#17181C',
  secondaryText: '#70737B',
  border: '#E5E6E9',
  error: '#DC3545',
  errorLight: 'rgba(220, 53, 69, 0.10)',
  warning: '#B98200',
  warningLight: 'rgba(255, 196, 0, 0.18)',
  white: '#FFFFFF',
  obsidian: '#101114',
  carbonNavy: '#1A1B1F',
  electricBlue: '#101114',
  precisionTeal: '#FFC400',
  emergencyAmber: '#FFC400',
  hazardOrange: '#DC3545',
  titanium: '#F1F2F4',
  primaryNavy: '#101114',
  brandYellow: '#FFC400',
  brandYellowHover: '#E5AC00',
  brandYellowMuted: 'rgba(255, 196, 0, 0.14)',
  primaryBlack: '#101114',
  secondaryBlack: '#70737B',
  lightBackground: '#F1F2F4',
  borderDark: '#34363B',
  info: '#4A4C52',
  infoLight: 'rgba(112, 115, 123, 0.12)',
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
  background: '#F1F2F4',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  card: '#FFFFFF',
  textPrimary: '#17181C',
  textSecondary: '#70737B',
  textTertiary: '#92959C',
  border: '#E5E6E9',
  primary: '#101114',
  primaryNavy: '#101114',
  secondaryNavy: '#1A1B1F',
  primaryContrast: '#FFFFFF',
  accent: '#FFC400',
  accentTeal: '#FFC400',
  success: '#16A36A',
  successBg: 'rgba(22, 163, 106, 0.10)',
  error: '#DC3545',
  errorBg: 'rgba(220, 53, 69, 0.10)',
  warning: '#B98200',
  warningBg: 'rgba(255, 196, 0, 0.18)',
  info: '#4A4C52',
  infoBg: 'rgba(112, 115, 123, 0.12)',
  inputBg: '#FFFFFF',
  divider: '#E5E6E9',
  tabBar: '#FFFFFF',
  tabBarActive: '#101114',
  tabBarInactive: '#70737B',
  badgeBg: '#F1F2F4',
  badgeText: '#17181C',
  overlay: 'rgba(16, 17, 20, 0.58)',
};

export const darkTheme: ThemeColors = {
  isDark: true,
  background: '#101114',
  surface: '#1A1B1F',
  surfaceElevated: '#222328',
  card: '#1A1B1F',
  textPrimary: '#FFFFFF',
  textSecondary: '#C7C9CE',
  textTertiary: '#92959C',
  border: '#34363B',
  primary: '#FFC400',
  primaryNavy: '#FFC400',
  secondaryNavy: '#1A1B1F',
  primaryContrast: '#101114',
  accent: '#FFC400',
  accentTeal: '#FFC400',
  success: '#35C986',
  successBg: 'rgba(53, 201, 134, 0.15)',
  error: '#FF6673',
  errorBg: 'rgba(255, 102, 115, 0.15)',
  warning: '#FFD14A',
  warningBg: 'rgba(255, 196, 0, 0.15)',
  info: '#C7C9CE',
  infoBg: 'rgba(199, 201, 206, 0.12)',
  inputBg: '#222328',
  divider: '#34363B',
  tabBar: '#1A1B1F',
  tabBarActive: '#FFC400',
  tabBarInactive: '#92959C',
  badgeBg: '#2A2B30',
  badgeText: '#F1F2F4',
  overlay: 'rgba(0, 0, 0, 0.72)',
};
