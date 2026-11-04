import React, { useEffect } from 'react';
import { ActivityIndicator, Image, Platform, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BRAND_COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { TYPOGRAPHY } from '../theme/typography';
import { useAuthStore } from '../stores/authStore';
import { useResponsive } from '../hooks/useResponsive';

export default function SplashScreen() {
  const { width, height, isShortDevice } = useResponsive();
  const { isLoading, isAuthenticated, role, isOnboardingCompleted } = useAuthStore();

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.92);

  const logoSize = Math.min(width * 0.55, height * 0.26, 220);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 750 });
    scale.value = withSpring(1, { damping: 14, stiffness: 90 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    if (isLoading) return;

    // On Web, immediately load the responsive app without stalling on splash/mobile onboarding
    if (Platform.OS === 'web') {
      if (role === 'mechanic') {
        router.replace('/(mechanic)/(tabs)');
      } else {
        router.replace('/(customer)/(tabs)');
      }
      return;
    }

    // On native iOS/Android, run standard brand splash & onboarding check
    const timer = setTimeout(() => {
      if (!isOnboardingCompleted) {
        router.replace('/onboarding');
      } else if (isAuthenticated && role === 'customer') {
        router.replace('/(customer)/(tabs)');
      } else if (isAuthenticated && role === 'mechanic') {
        router.replace('/(mechanic)/(tabs)');
      } else {
        router.replace('/(auth)/role-select');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, role, isOnboardingCompleted]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <Image
          source={require('../../assets/images/mechfind_logo.png')}
          style={{ width: logoSize, height: logoSize }}
          resizeMode="contain"
          accessibilityLabel="MECHFIND Official Logo"
        />

        <Text style={[styles.tagline, isShortDevice && { marginTop: SPACING.sm }]}>
          Your Mechanic, Just Around the Corner.
        </Text>
      </Animated.View>

      <View style={[styles.footer, isShortDevice && { paddingBottom: SPACING.sm }]}>
        <ActivityIndicator size="small" color={BRAND_COLORS.accentTeal} />
        <Text style={styles.loadingText}>Initializing Roadside Assistance...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.primaryBlack,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xl,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    width: '100%',
  },
  tagline: {
    ...TYPOGRAPHY.bodyMedium,
    color: '#D1D5DB',
    textAlign: 'center',
    marginTop: SPACING.lg,
    fontWeight: '500',
    letterSpacing: 0.3,
    maxWidth: 280,
  },
  footer: {
    alignItems: 'center',
    gap: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  loadingText: {
    ...TYPOGRAPHY.caption,
    color: '#8A8A8A',
  },
});
