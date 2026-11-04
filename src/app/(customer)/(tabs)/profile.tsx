import React, { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { BRAND_COLORS } from '../../../theme/colors';
import { RADIUS } from '../../../theme/radius';
import { SPACING } from '../../../theme/spacing';
import { TYPOGRAPHY } from '../../../theme/typography';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { Header } from '../../../components/ui/Header';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';
import { useAuthStore } from '../../../stores/authStore';
import { useCustomerStore } from '../../../stores/customerStore';
import { backendConfig, getIntegrationNotice } from '../../../services/api/backendConfig';
import { useResponsive } from '../../../hooks/useResponsive';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CustomerProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { horizontalPadding, isTablet, isDesktop } = useResponsive();
  const { user, logout } = useAuthStore();
  const vehicles = useCustomerStore((state) => state.vehicles);

  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    confirmText: string;
    isDestructive: boolean;
    action: () => Promise<void>;
  }>({
    visible: false,
    title: '',
    message: '',
    confirmText: '',
    isDestructive: false,
    action: async () => {},
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePromptLogout = () => {
    setConfirmModal({
      visible: true,
      title: 'Sign Out',
      message: 'Are you sure you want to log out from MECHFIND?',
      confirmText: 'Sign Out',
      isDestructive: false,
      action: async () => {
        await logout();
        router.replace('/(auth)/role-select');
      },
    });
  };

  const handlePromptDeleteAccount = () => {
    setConfirmModal({
      visible: true,
      title: 'Permanently Delete Account',
      message:
        'This will permanently delete your MECHFIND customer account, registered vehicles, saved addresses, and active service requests. This action is irreversible.',
      confirmText: 'Delete Account',
      isDestructive: true,
      action: async () => {
        // Clear all persistent records
        await AsyncStorage.multiRemove([
          '@mechfind_vehicles',
          '@mechfind_requests',
          '@mechfind_saved_addresses',
          '@mechfind_notifications',
          '@mechfind_user_role',
        ]);
        await logout();
        router.replace('/(auth)/role-select');
      },
    });
  };

  const callHelpline = () => {
    Linking.openURL('tel:18001021234');
  };

  return (
    <ScreenContainer scrollable withPadding={false} edges={['top', 'left', 'right']}>
      <Header title="My Profile" showThemeToggle />

      <View
        style={[
          styles.content,
          {
            paddingHorizontal: horizontalPadding,
            maxWidth: isDesktop ? 1280 : isTablet ? 840 : undefined,
            alignSelf: isTablet || isDesktop ? 'center' : undefined,
            width: isTablet || isDesktop ? '100%' : undefined,
          },
        ]}
      >
        {/* User Profile Card */}
        <Card elevated>
          <View style={styles.profileRow}>
            <View
              style={[
                styles.avatarCircle,
                { backgroundColor: isDark ? '#1E293B' : '#EFF6FF' },
              ]}
            >
              <Ionicons
                name="person"
                size={26}
                color={BRAND_COLORS.primaryBlue}
              />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[styles.userName, { color: theme.textPrimary }]} numberOfLines={1}>
                {user?.fullName || 'Motorist User'}
              </Text>
              <Text style={[styles.userContact, { color: theme.textSecondary }]} numberOfLines={1}>
                {user?.phoneNumber || '+91 98765 43210'}
              </Text>
              <Text style={[styles.userEmail, { color: theme.textTertiary }]} numberOfLines={1}>
                {user?.email || 'customer@mechfind.app'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Statistics Pill Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="car-sport" size={20} color={BRAND_COLORS.accentTeal} />
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{vehicles.length}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Saved Vehicles</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="shield-checkmark" size={20} color={BRAND_COLORS.success} />
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>Verified</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Phone Security</Text>
          </View>
        </View>

        {/* Settings Group */}
        <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Settings & App</Text>

        <Card>
          <Pressable onPress={toggleTheme} style={styles.settingItem} hitSlop={6}>
            <View style={styles.settingLeft}>
              <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={19} color={theme.textPrimary} />
              <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>
                Appearance: {isDark ? 'Dark Mode' : 'Light Mode'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          <Pressable onPress={() => router.push('/(customer)/(tabs)/vehicles')} style={styles.settingItem} hitSlop={6}>
            <View style={styles.settingLeft}>
              <Ionicons name="car-outline" size={19} color={theme.textPrimary} />
              <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>
                Manage Vehicles ({vehicles.length})
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          <Pressable onPress={callHelpline} style={styles.settingItem} hitSlop={6}>
            <View style={styles.settingLeft}>
              <Ionicons name="call-outline" size={19} color={BRAND_COLORS.success} />
              <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>
                24/7 Breakdown Helpline
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
          </Pressable>
        </Card>

        {/* Backend & Architecture Diagnostic Banner */}
        <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Integration Status</Text>
        <Card style={{ backgroundColor: isDark ? '#1C1C1C' : '#FFFFFF' }}>
          <View style={styles.diagnosticRow}>
            <Ionicons
              name={backendConfig.isSupabaseConfigured ? 'cloud-done' : 'construct'}
              size={18}
              color={backendConfig.isSupabaseConfigured ? BRAND_COLORS.success : BRAND_COLORS.accentTeal}
            />
            <Text style={[styles.diagnosticText, { color: theme.textPrimary }]}>
              {getIntegrationNotice()}
            </Text>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Log Out of Customer Profile"
            onPress={handlePromptLogout}
            variant="outline"
            icon={<Ionicons name="log-out-outline" size={18} color={theme.textPrimary} />}
          />

          <Pressable onPress={handlePromptDeleteAccount} style={styles.deleteBtn} hitSlop={8}>
            <Text style={[styles.deleteText, { color: theme.error }]}>Delete Account Permanently</Text>
          </Pressable>
        </View>
      </View>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText="Cancel"
        isDestructive={confirmModal.isDestructive}
        isLoading={isProcessing}
        onConfirm={async () => {
          setIsProcessing(true);
          try {
            await confirmModal.action();
          } finally {
            setIsProcessing(false);
            setConfirmModal((prev) => ({ ...prev, visible: false }));
          }
        }}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, visible: false }))}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.huge,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    ...TYPOGRAPHY.h4,
    fontSize: 16,
  },
  userContact: {
    ...TYPOGRAPHY.bodySmall,
    marginTop: 2,
  },
  userEmail: {
    ...TYPOGRAPHY.caption,
    marginTop: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  statBox: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.h4,
    marginTop: 3,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    marginTop: 1,
  },
  sectionHeading: {
    ...TYPOGRAPHY.h4,
    fontSize: 14,
    marginBottom: SPACING.xs,
    marginTop: SPACING.xs,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs + 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  settingLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '500',
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: SPACING.xs,
  },
  diagnosticRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  diagnosticText: {
    ...TYPOGRAPHY.caption,
    flex: 1,
  },
  actions: {
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  deleteBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  deleteText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
});
