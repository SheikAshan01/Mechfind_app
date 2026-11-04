import { Platform, TextStyle } from 'react-native';

export const FONT_FAMILY = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

// Centralized Mobile-First Typography Tokens
// Follows recommended mobile scale:
// - Main screen title: 26–32
// - Section title: 20–24
// - Card title: 16–19
// - Body: 14–16
// - Secondary text: 12–14
// - Button text: 15–17
// - Input text: 15–17
// - Small labels: 11–13
export const TYPOGRAPHY: Record<string, TextStyle> = {
  h1: {
    fontFamily: FONT_FAMILY,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  h2: {
    fontFamily: FONT_FAMILY,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  h4: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  bodyLarge: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodyMedium: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  bodySmall: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '400',
  },
  buttonLarge: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  buttonMedium: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  buttonSmall: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  caption: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  label: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  mono: {
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
};
