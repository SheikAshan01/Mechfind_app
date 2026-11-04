import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { BRAND_COLORS } from '../../theme/colors';
import { RADIUS } from '../../theme/radius';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { useAuthStore } from '../../stores/authStore';
import { useResponsive } from '../../hooks/useResponsive';

export default function RoleSelectScreen() {
  const { theme, isDark } = useTheme();
  const { isSmallDevice, isShortDevice, isTablet, isDesktop } = useResponsive();
  const setRole = useAuthStore((state) => state.setRole);

  const handleSelectCustomer = () => {
    setRole('customer');
    router.push('/(auth)/customer-login');
  };

  const handleSelectMechanic = () => {
    setRole('mechanic');
    router.push('/(auth)/mechanic-login');
  };

  const logoSize = isShortDevice || isSmallDevice ? 96 : 130;
  const iconCircleSize = isSmallDevice ? 46 : 54;
  const isCenteredScreen = isTablet || isDesktop;

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      <View style={[styles.mainWrapper, isCenteredScreen && styles.centeredContainer]}>
        <View style={styles.topSection}>
          <Image
            source={require('../../../assets/images/mechfind_logo.png')}
            style={{ width: logoSize, height: logoSize }}
            resizeMode="contain"
            accessibilityLabel="MECHFIND Official Logo"
          />
          <Text style={[styles.heading, { color: theme.textPrimary }]}>
            Welcome to MECHFIND
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Select how you want to continue today
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          {/* Customer Card */}
          <Pressable
            onPress={handleSelectCustomer}
            style={({ pressed }) => [
              styles.roleCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                opacity: pressed ? 0.92 : 1,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Continue as Customer"
          >
            <View
              style={[
                styles.iconCircle,
                {
                  width: iconCircleSize,
                  height: iconCircleSize,
                  borderRadius: iconCircleSize / 2,
                  backgroundColor: isDark ? '#1E293B' : '#EFF6FF',
                },
              ]}
            >
              <Ionicons name="car-sport" size={isSmallDevice ? 24 : 28} color={BRAND_COLORS.primaryBlue} />
            </View>
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={[styles.roleTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                  I Am a Vehicle Owner
                </Text>
                <View style={[styles.popularBadge, { backgroundColor: 'rgba(23, 105, 245, 0.08)' }]}>
                  <Text style={[styles.popularText, { color: BRAND_COLORS.primaryBlue }]}>Customer</Text>
                </View>
              </View>
              <Text style={[styles.roleDesc, { color: theme.textSecondary }]}>
                Emergency breakdown assistance, puncture repair, towing, or find mechanics nearby.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
          </Pressable>

          {/* Mechanic Card */}
          <Pressable
            onPress={handleSelectMechanic}
            style={({ pressed }) => [
              styles.roleCard,
              {
                backgroundColor: theme.card,
                borderColor: BRAND_COLORS.primaryBlue,
                borderWidth: 2,
                opacity: pressed ? 0.92 : 1,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Continue as Mechanic"
          >
            <View
              style={[
                styles.iconCircle,
                {
                  width: iconCircleSize,
                  height: iconCircleSize,
                  borderRadius: iconCircleSize / 2,
                  backgroundColor: BRAND_COLORS.primaryBlue,
                },
              ]}
            >
              <Ionicons
                name="construct"
                size={isSmallDevice ? 24 : 28}
                color="#FFFFFF"
              />
            </View>
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={[styles.roleTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                  I Am a Mechanic / Garage
                </Text>
                <View style={[styles.popularBadge, { backgroundColor: BRAND_COLORS.primaryBlue }]}>
                  <Text style={[styles.popularText, { color: '#FFFFFF' }]}>
                    Partner
                  </Text>
                </View>
              </View>
              <Text style={[styles.roleDesc, { color: theme.textSecondary }]}>
                Receive breakdown jobs, navigate directly to stranded drivers, and grow your service revenue.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={BRAND_COLORS.primaryBlue} />
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textTertiary }]}>
            Protected by MECHFIND Multi-Role Security Architecture
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  mainWrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },
  centeredContainer: {
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  topSection: {
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  heading: {
    ...TYPOGRAPHY.h2,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: 2,
  },
  subtitle: {
    ...TYPOGRAPHY.bodySmall,
    textAlign: 'center',
  },
  cardsContainer: {
    gap: SPACING.md,
    marginVertical: SPACING.md,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
  },
  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  cardContent: {
    flex: 1,
    marginRight: SPACING.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
    flexWrap: 'wrap',
  },
  roleTitle: {
    ...TYPOGRAPHY.h4,
    fontSize: 15,
  },
  popularBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  popularText: {
    fontSize: 9,
    fontWeight: '700',
  },
  roleDesc: {
    ...TYPOGRAPHY.caption,
    lineHeight: 16,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  footerText: {
    ...TYPOGRAPHY.caption,
    textAlign: 'center',
    fontSize: 10,
  },
});
