import React from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { RADIUS } from '../../theme/radius';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';

export type BadgeVariant =
  | 'verified'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'brand'
  | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  icon,
  size = 'md',
}) => {
  const { theme, isDark } = useTheme();

  let bgColor = theme.badgeBg;
  let textColor = theme.badgeText;
  let borderColor = 'transparent';

  switch (variant) {
    case 'verified':
      bgColor = isDark ? 'rgba(22, 163, 74, 0.20)' : 'rgba(22, 163, 74, 0.12)';
      textColor = '#16A34A';
      borderColor = isDark ? 'rgba(22, 163, 74, 0.4)' : 'rgba(22, 163, 74, 0.3)';
      break;
    case 'brand':
      bgColor = isDark ? 'rgba(255, 196, 0, 0.18)' : 'rgba(255, 196, 0, 0.24)';
      textColor = isDark ? '#FFD54F' : '#17181C';
      borderColor = isDark ? 'rgba(255, 196, 0, 0.42)' : 'rgba(229, 172, 0, 0.45)';
      break;
    case 'success':
      bgColor = theme.successBg;
      textColor = theme.success;
      break;
    case 'warning':
      bgColor = theme.warningBg;
      textColor = theme.warning;
      break;
    case 'error':
      bgColor = theme.errorBg;
      textColor = theme.error;
      break;
    case 'info':
      bgColor = theme.infoBg;
      textColor = theme.info;
      break;
    case 'neutral':
    default:
      bgColor = isDark ? '#262626' : '#F3F4F6';
      textColor = theme.textSecondary;
      break;
  }

  const containerStyle: ViewStyle = {
    backgroundColor: bgColor,
    borderColor,
    borderWidth: variant === 'verified' || variant === 'brand' ? 1 : 0,
    paddingHorizontal: size === 'sm' ? SPACING.xs + 2 : SPACING.sm + 2,
    paddingVertical: size === 'sm' ? SPACING.xxs : SPACING.xs,
    borderRadius: RADIUS.full,
  };

  const textStyle: TextStyle = {
    color: textColor,
    fontSize: size === 'sm' ? 10 : 12,
    fontWeight: '600',
  };

  return (
    <View style={[styles.badge, containerStyle]}>
      {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
      <Text style={[styles.text, textStyle]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  iconContainer: {
    marginRight: SPACING.xxs + 2,
  },
  text: {
    ...TYPOGRAPHY.caption,
  },
});

