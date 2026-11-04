import React, { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { BRAND_COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { TYPOGRAPHY } from '../theme/typography';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../stores/authStore';
import { useResponsive } from '../hooks/useResponsive';

interface OnboardingSlide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge: string;
  title: string;
  description: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: 'slide_1',
    icon: 'location-outline',
    badge: 'INSTANT DISCOVERY',
    title: 'Find Nearby Mechanics',
    description:
      'Locate verified automotive mechanics and 24/7 breakdown garages within minutes from your exact breakdown spot.',
  },
  {
    id: 'slide_2',
    icon: 'construct-outline',
    badge: 'RAPID DISPATCH',
    title: 'Request Breakdown Help',
    description:
      'Puncture, dead battery, engine overheating or towing — select your issue and dispatch immediate professional roadside help.',
  },
  {
    id: 'slide_3',
    icon: 'navigate-outline',
    badge: 'LIVE GPS TRACKING',
    title: 'Track in Real Time',
    description:
      'Watch your assigned mechanic travel to your location on the map with accurate live ETA, route updates, and direct call support.',
  },
];

export default function OnboardingScreen() {
  const { theme, isDark } = useTheme();
  const { isSmallDevice, isShortDevice, isTablet, isDesktop, horizontalPadding, scaleFont } = useResponsive();
  const setOnboardingCompleted = useAuthStore((state) => state.setOnboardingCompleted);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleFinish = async () => {
    try {
      await setOnboardingCompleted(true);
    } catch {
      // fallback
    }
    router.replace('/(auth)/role-select');
  };

  const goToSlide = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= SLIDES.length) return;
    setCurrentIndex(nextIndex);
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      goToSlide(currentIndex + 1);
    } else {
      handleFinish();
    }
  };

  const isLast = currentIndex === SLIDES.length - 1;
  const currentSlide = SLIDES[currentIndex];
  const iconContainerSize = isShortDevice || isSmallDevice ? 90 : 120;
  const iconGlyphSize = isShortDevice || isSmallDevice ? 44 : 54;
  const titleFontSize = isShortDevice ? 20 : scaleFont(23, 0.9, 1.1);

  return (
    <SafeAreaView style={[styles.outerContainer, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.responsiveWrapper,
          {
            maxWidth: isTablet || isDesktop ? 480 : undefined,
            width: isTablet || isDesktop ? 480 : '100%',
            alignSelf: isTablet || isDesktop ? 'center' : undefined,
            paddingHorizontal: isTablet || isDesktop ? SPACING.lg : horizontalPadding,
          },
        ]}
      >
        {/* Top Header with Brand Logo & Skip */}
        <View style={styles.topBar}>
          <View style={styles.brandGroup}>
            <Image
              source={require('../../assets/images/mechfind_logo.png')}
              style={styles.headerLogo}
              resizeMode="contain"
              accessibilityLabel="MECHFIND"
            />
            <View style={styles.brandPill}>
              <Text style={styles.brandText}>MECHFIND</Text>
            </View>
          </View>

          {!isLast ? (
            <Pressable
              onPress={handleFinish}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }, styles.skipButton]}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Skip onboarding"
            >
              <Text style={[styles.skipText, { color: theme.textSecondary }]}>Skip</Text>
            </Pressable>
          ) : (
            <View style={{ width: 44 }} />
          )}
        </View>

        {/* Slide Content View */}
        <View style={styles.slideCenter}>
          <View
            style={[
              styles.iconContainer,
              {
                width: iconContainerSize,
                height: iconContainerSize,
                borderRadius: iconContainerSize / 2,
                marginBottom: isShortDevice ? SPACING.md : SPACING.lg,
                backgroundColor: isDark ? '#1E293B' : 'rgba(23, 105, 245, 0.08)',
                borderColor: BRAND_COLORS.primaryBlue,
              },
            ]}
          >
            <Ionicons
              name={currentSlide.icon}
              size={iconGlyphSize}
              color={BRAND_COLORS.primaryBlue}
            />
          </View>

          <View style={styles.badgeWrapper}>
            <Text style={styles.badgeText}>{currentSlide.badge}</Text>
          </View>

          <Text
            style={[
              styles.title,
              { color: theme.textPrimary, fontSize: titleFontSize },
            ]}
          >
            {currentSlide.title}
          </Text>

          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {currentSlide.description}
          </Text>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomSection}>
          {/* Pagination Dots */}
          <View style={styles.dotsRow}>
            {SLIDES.map((_, idx) => (
              <Pressable
                key={idx}
                onPress={() => goToSlide(idx)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Go to slide ${idx + 1}`}
              >
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        idx === currentIndex
                          ? BRAND_COLORS.primaryBlue
                          : isDark
                          ? '#1E2D42'
                          : '#E2E8F0',
                      width: idx === currentIndex ? 24 : 8,
                    },
                  ]}
                />
              </Pressable>
            ))}
          </View>

          {/* Action Button */}
          <Button
            title={isLast ? 'Get Started' : 'Next'}
            onPress={handleNext}
            variant="primary"
            size="lg"
            icon={
              <Ionicons
                name={isLast ? 'arrow-forward-circle' : 'arrow-forward'}
                size={20}
                color="#FFFFFF"
              />
            }
            iconPosition="right"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  responsiveWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    minHeight: 48,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: {
    width: 32,
    height: 32,
  },
  brandPill: {
    backgroundColor: BRAND_COLORS.secondaryNavy,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  brandText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  skipButton: {
    padding: SPACING.sm,
  },
  skipText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
  },
  slideCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  badgeWrapper: {
    backgroundColor: 'rgba(23, 105, 245, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
    marginBottom: SPACING.xs,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: BRAND_COLORS.primaryBlue,
    letterSpacing: 0.8,
  },
  title: {
    ...TYPOGRAPHY.h2,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  description: {
    ...TYPOGRAPHY.bodySmall,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 340,
  },
  bottomSection: {
    paddingBottom: SPACING.lg,
    gap: SPACING.md,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
