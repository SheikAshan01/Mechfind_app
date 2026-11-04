import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../theme/ThemeContext';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';
import { useResponsive } from '../../hooks/useResponsive';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  showThemeToggle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  rightAction,
  showThemeToggle = false,
}) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { isSmallDevice, scaleFont, horizontalPadding, isDesktop, isTablet } = useResponsive();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  const titleFontSize = isSmallDevice ? 16 : scaleFont(18, 0.9, 1.1);

  return (
    <View
      style={[
        styles.outerContainer,
        {
          borderBottomColor: theme.divider,
        },
      ]}
    >
      <View
        style={[
          styles.container,
          {
            paddingHorizontal: horizontalPadding,
            maxWidth: isDesktop ? 1280 : isTablet ? 840 : undefined,
            alignSelf: 'center',
            width: '100%',
          },
        ]}
      >
        <View style={styles.leftRow}>
        {showBack ? (
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: isDark ? '#262626' : '#F3F4F6', opacity: pressed ? 0.7 : 1 },
            ]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={20} color={theme.textPrimary} />
          </Pressable>
        ) : null}

        <View style={styles.titleColumn}>
          <Text
            style={[styles.title, { color: theme.textPrimary, fontSize: titleFontSize }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[styles.subtitle, { color: theme.textSecondary }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.rightRow}>
        {showThemeToggle ? (
          <Pressable
            onPress={toggleTheme}
            style={({ pressed }) => [
              styles.iconBtn,
              { backgroundColor: isDark ? '#262626' : '#F3F4F6', opacity: pressed ? 0.7 : 1 },
            ]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Toggle dark and light theme"
          >
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={18}
              color={isDark ? '#FFD400' : theme.textPrimary}
            />
          </Pressable>
        ) : null}
        {rightAction}
      </View>
    </View>
  </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    borderBottomWidth: 1,
  },
  container: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  titleColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    marginTop: 1,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
