import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { RADIUS } from '../../theme/radius';
import { SHADOWS } from '../../theme/shadows';
import { SPACING } from '../../theme/spacing';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  bordered?: boolean;
  highlighted?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  elevated = true,
  bordered = true,
  highlighted = false,
}) => {
  const { theme, isDark } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: elevated ? theme.surfaceElevated : theme.surface,
    borderColor: highlighted
      ? theme.accent
      : bordered
      ? theme.border
      : 'transparent',
    borderWidth: highlighted ? 1.5 : bordered ? 1 : 0,
    borderRadius: RADIUS.md,
    padding: SPACING.md + 2,
    ...(elevated && !isDark ? {
      shadowColor: '#142235',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1,
    } : {}),
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.base,
          cardStyle,
          { opacity: pressed ? 0.9 : 1 },
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[styles.base, cardStyle, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
});

