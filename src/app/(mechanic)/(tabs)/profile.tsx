import React, { useState } from 'react';
import { Image, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { BRAND_COLORS } from '../../../theme/colors';
import { RADIUS } from '../../../theme/radius';
import { SPACING } from '../../../theme/spacing';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { Header } from '../../../components/ui/Header';
import { Card } from '../../../components/ui/Card';
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';
import { useAuthStore } from '../../../stores/authStore';
import { MechanicUser } from '../../../types/auth';
import { useResponsive } from '../../../hooks/useResponsive';

export default function MechanicProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { horizontalPadding, isTablet, isDesktop } = useResponsive();
  const { user, logout } = useAuthStore();
  const mechanic = user as MechanicUser | null;

  const [isSignOutModalVisible, setIsSignOutModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirmLogout = async () => {
    setIsProcessing(true);
    try {
      await logout();
      setIsSignOutModalVisible(false);
      router.replace('/(auth)/role-select');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsProcessing(true);
    try {
      await logout();
      setIsDeleteModalVisible(false);
      router.replace('/(auth)/role-select');
    } finally {
      setIsProcessing(false);
    }
  };

  const shopName =
    mechanic?.shopName || 'Apex Speed Garage & Roadside Care';
  const ownerName = mechanic?.fullName || 'Rajesh Sharma';
  const address =
    mechanic?.shopAddress || 'Shop 4, Linking Road, Bandra West';
  const radius = mechanic?.serviceRadiusKm || 15;

  return (
    <ScreenContainer scrollable withPadding={false} edges={['top', 'left', 'right']}>
      <Header title="Workshop Profile" showBack showThemeToggle />

      <View
        style={[
          styles.containerWrapper,
          {
            paddingHorizontal: horizontalPadding,
            maxWidth: isDesktop ? 1280 : isTablet ? 840 : undefined,
            alignSelf: isTablet || isDesktop ? 'center' : undefined,
            width: isTablet || isDesktop ? '100%' : undefined,
          },
        ]}
      >
        {/* 1. Workshop Banner Card */}
        <Card style={styles.bannerCard}>
          <View
            style={[
              styles.bannerImageBox,
              { backgroundColor: isDark ? '#1E293B' : '#EFF6FF' },
            ]}
          >
            <Image
              source={require('../../../../assets/images/mechfind_logo.png')}
              style={styles.bannerLogo}
              resizeMode="contain"
              accessibilityLabel="MECHFIND Official Logo"
            />
          </View>

          <View style={styles.bannerInfo}>
            <View style={styles.nameRow}>
              <Text
                style={[styles.shopTitle, { color: theme.textPrimary }]}
                numberOfLines={1}
              >
                {shopName}
              </Text>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={BRAND_COLORS.successGreen}
                style={{ marginLeft: 5 }}
              />
            </View>

            <Text style={[styles.ownerName, { color: BRAND_COLORS.primaryBlue }]}>
              {ownerName}
            </Text>
          </View>
        </Card>

        {/* 2. Workshop Details Section */}
        <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
          Workshop Details
        </Text>

        <Card style={styles.detailsCard}>
          {/* Address */}
          <View style={styles.detailRow}>
            <Ionicons
              name="location-outline"
              size={18}
              color={theme.textSecondary}
              style={{ marginRight: 12 }}
            />
            <Text
              style={[styles.detailText, { color: theme.textPrimary }]}
              numberOfLines={2}
            >
              {address}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          {/* Operating Hours */}
          <View style={styles.detailRow}>
            <Ionicons
              name="time-outline"
              size={18}
              color={theme.textSecondary}
              style={{ marginRight: 12 }}
            />
            <Text style={[styles.detailText, { color: theme.textPrimary }]}>
              7:00 AM - 11:00 PM
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          {/* Service Radius */}
          <View style={styles.detailRow}>
            <Ionicons
              name="navigate-circle-outline"
              size={18}
              color={theme.textSecondary}
              style={{ marginRight: 12 }}
            />
            <Text style={[styles.detailText, { color: theme.textPrimary }]}>
              Service Radius {radius} km
            </Text>
          </View>
        </Card>

        {/* 3. Manage Section */}
        <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
          Manage
        </Text>

        <Card style={styles.manageCard}>
          {/* Services & Pricing */}
          <Pressable
            onPress={() => router.push('/(mechanic)/services-pricing')}
            style={styles.manageRow}
            hitSlop={6}
          >
            <View style={styles.manageLeft}>
              <Ionicons
                name="build-outline"
                size={18}
                color={theme.textSecondary}
                style={{ marginRight: 12 }}
              />
              <Text style={[styles.manageTitle, { color: theme.textPrimary }]}>
                Services & Pricing
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color={theme.textTertiary} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          {/* Documents & Verification */}
          <Pressable
            onPress={() => router.push('/(mechanic)/verification-status')}
            style={styles.manageRow}
            hitSlop={6}
          >
            <View style={styles.manageLeft}>
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color={theme.textSecondary}
                style={{ marginRight: 12 }}
              />
              <Text style={[styles.manageTitle, { color: theme.textPrimary }]}>
                Documents & Verification
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color={theme.textTertiary} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          {/* Appearance (Light/Dark Mode) */}
          <Pressable onPress={toggleTheme} style={styles.manageRow} hitSlop={6}>
            <View style={styles.manageLeft}>
              <Ionicons
                name={isDark ? 'moon-outline' : 'sunny-outline'}
                size={18}
                color={theme.textSecondary}
                style={{ marginRight: 12 }}
              />
              <Text style={[styles.manageTitle, { color: theme.textPrimary }]}>
                Appearance ({isDark ? 'Dark Mode' : 'Light Mode'})
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color={theme.textTertiary} />
          </Pressable>

          {Platform.OS === 'web' && (
            <>
              <View style={[styles.divider, { backgroundColor: theme.divider }]} />
              <Pressable
                onPress={() => {
                  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
                  if (/android/i.test(ua)) {
                    Linking.openURL('https://github.com/mechfind/app/releases/latest/download/mechfind.apk');
                  } else if (/iphone|ipad|ipod/i.test(ua)) {
                    Linking.openURL('https://apps.apple.com/app/mechfind-roadside/id6400000000');
                  } else {
                    Linking.openURL('https://github.com/mechfind/app/releases/latest/download/mechfind.apk');
                  }
                }}
                style={styles.manageRow}
                hitSlop={6}
              >
                <View style={styles.manageLeft}>
                  <Ionicons
                    name="download-outline"
                    size={18}
                    color={BRAND_COLORS.primaryBlue}
                    style={{ marginRight: 12 }}
                  />
                  <Text style={[styles.manageTitle, { color: BRAND_COLORS.primaryBlue, fontWeight: '700' }]}>
                    Download Mobile App (Android APK / iOS)
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={17} color={BRAND_COLORS.primaryBlue} />
              </Pressable>
            </>
          )}

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          {/* Logout */}
          <Pressable
            onPress={() => setIsSignOutModalVisible(true)}
            style={styles.manageRow}
            hitSlop={6}
          >
            <View style={styles.manageLeft}>
              <Ionicons
                name="log-out-outline"
                size={18}
                color={BRAND_COLORS.error}
                style={{ marginRight: 12 }}
              />
              <Text style={[styles.manageTitle, { color: BRAND_COLORS.error }]}>
                Sign Out
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color={BRAND_COLORS.error} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          {/* Delete Account */}
          <Pressable
            onPress={() => setIsDeleteModalVisible(true)}
            style={styles.manageRow}
            hitSlop={6}
          >
            <View style={styles.manageLeft}>
              <Ionicons
                name="trash-outline"
                size={18}
                color={BRAND_COLORS.error}
                style={{ marginRight: 12 }}
              />
              <Text style={[styles.manageTitle, { color: BRAND_COLORS.error }]}>
                Delete Workshop Account
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color={BRAND_COLORS.error} />
          </Pressable>
        </Card>
      </View>

      {/* Sign Out Modal */}
      <ConfirmationModal
        visible={isSignOutModalVisible}
        title="Sign Out"
        message="Are you sure you want to sign out of your partner mechanic session?"
        confirmText="Sign Out"
        cancelText="Stay Signed In"
        isDestructive
        isLoading={isProcessing}
        onConfirm={handleConfirmLogout}
        onCancel={() => setIsSignOutModalVisible(false)}
      />

      {/* Delete Account Modal */}
      <ConfirmationModal
        visible={isDeleteModalVisible}
        title="Delete Workshop Account"
        message="This action is permanent and cannot be undone. All active jobs, documents, and historical payouts will be permanently wiped from local cache and cloud storage."
        confirmText="Delete Account Permanently"
        cancelText="Keep Account"
        isDestructive
        isLoading={isProcessing}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    paddingVertical: SPACING.md,
  },
  bannerCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  bannerImageBox: {
    height: 120,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerLogo: {
    width: 80,
    height: 80,
  },
  bannerInfo: {
    padding: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  shopTitle: {
    fontSize: 16,
    fontWeight: '700',
    flexShrink: 1,
  },
  ownerName: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  detailsCard: {
    paddingVertical: 4,
    paddingHorizontal: 14,
    marginBottom: SPACING.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailText: {
    fontSize: 13.5,
    fontWeight: '500',
    flex: 1,
  },
  divider: {
    height: 1,
  },
  manageCard: {
    paddingVertical: 4,
    paddingHorizontal: 14,
    marginBottom: SPACING.xl,
  },
  manageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
  },
  manageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  manageTitle: {
    fontSize: 13.5,
    fontWeight: '600',
  },
});
