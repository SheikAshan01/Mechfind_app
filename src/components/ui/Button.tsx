import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { BRAND_COLORS } from '../../theme/colors';
import { RADIUS } from '../../theme/radius';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  testID,
}) => {
  const { theme, isDark } = useTheme();

  // Button sizes with minHeight and vertical padding so text never clips under system font scaling
  const sizeStyles: Record<ButtonSize, ViewStyle> = {
    sm: {
      minHeight: 40,
      paddingVertical: SPACING.xs + 2,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.sm,
    },
    md: {
      minHeight: 46,
      paddingVertical: SPACING.sm + 1,
      paddingHorizontal: SPACING.lg,
      borderRadius: RADIUS.md,
    },
    lg: {
      minHeight: 52,
      paddingVertical: SPACING.md - 1,
      paddingHorizontal: SPACING.xl,
      borderRadius: RADIUS.md,
    },
  };

  // Text sizes
  const textSizeStyles: Record<ButtonSize, TextStyle> = {
    sm: { ...TYPOGRAPHY.buttonSmall },
    md: { ...TYPOGRAPHY.buttonMedium },
    lg: { ...TYPOGRAPHY.buttonLarge },
  };

  // Variant base colors
  let backgroundColor: string = BRAND_COLORS.primaryNavy;
  let textColor: string = BRAND_COLORS.white;
  let borderColor: string = 'transparent';
  let borderWidth = 0;

  switch (variant) {
    case 'primary':
      backgroundColor = isDark ? '#2563EB' : BRAND_COLORS.primaryBlue;
      textColor = BRAND_COLORS.white;
      break;
    case 'success':
      backgroundColor = BRAND_COLORS.successGreen;
      textColor = BRAND_COLORS.white;
      break;
    case 'secondary':
      backgroundColor = isDark ? '#1E293B' : '#0F172A';
      textColor = BRAND_COLORS.white;
      break;
    case 'outline':
      backgroundColor = isDark ? 'transparent' : '#FFFFFF';
      textColor = theme.textPrimary;
      borderColor = isDark ? theme.border : BRAND_COLORS.border;
      borderWidth = 1.5;
      break;
    case 'ghost':
      backgroundColor = 'transparent';
      textColor = theme.textPrimary;
      break;
    case 'danger':
      backgroundColor = BRAND_COLORS.error;
      textColor = BRAND_COLORS.white;
      break;
  }

  if (disabled) {
    backgroundColor = isDark ? '#262626' : '#E5E7EB';
    textColor = isDark ? '#737373' : '#9CA3AF';
    borderColor = 'transparent';
  }

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        {
          backgroundColor,
          borderColor,
          borderWidth,
          opacity: pressed && !disabled && !loading ? 0.85 : 1,
          transform: [{ scale: pressed && !disabled && !loading ? 0.985 : 1 }],
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' ? <>{icon}</> : null}
          <Text
            style={[
              textSizeStyles[size],
              { color: textColor, textAlign: 'center' },
              icon && iconPosition === 'left' ? { marginLeft: SPACING.sm } : undefined,
              icon && iconPosition === 'right' ? { marginRight: SPACING.sm } : undefined,
              textStyle,
            ]}
            numberOfLines={2}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' ? <>{icon}</> : null}
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44, // Meets Android & iOS accessible minimum touch target
  },
});
