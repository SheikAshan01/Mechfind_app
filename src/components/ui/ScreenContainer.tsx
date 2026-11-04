import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../theme/ThemeContext';
import { SPACING } from '../../theme/spacing';
import { useResponsive } from '../../hooks/useResponsive';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  withPadding?: boolean;
  edges?: readonly Edge[];
  constrainTablet?: boolean;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  withPadding = true,
  edges,
  constrainTablet = true,
}) => {
  const { theme, isDark } = useTheme();
  const { isTablet, isDesktop, maxContentWidth, horizontalPadding } = useResponsive();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.background,
  };

  const innerPaddingStyle: ViewStyle = withPadding
    ? {
        paddingHorizontal: horizontalPadding,
        paddingBottom: SPACING.xl,
      }
    : {};

  const tabletWrapperStyle: ViewStyle =
    (isTablet || isDesktop) && constrainTablet
      ? {
          maxWidth: maxContentWidth,
          width: '100%',
          alignSelf: 'center',
          flex: scrollable ? undefined : 1,
        }
      : {
          flex: scrollable ? undefined : 1,
        };

  return (
    <SafeAreaView style={[containerStyle, style]} edges={edges}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      >
        {scrollable ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              innerPaddingStyle,
              contentContainerStyle,
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={tabletWrapperStyle}>{children}</View>
          </ScrollView>
        ) : (
          <View style={[styles.staticView, innerPaddingStyle, contentContainerStyle]}>
            <View style={tabletWrapperStyle}>{children}</View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  staticView: {
    flex: 1,
  },
});
