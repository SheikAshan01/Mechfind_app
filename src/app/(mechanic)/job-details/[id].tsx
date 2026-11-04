import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { BRAND_COLORS } from '../../../theme/colors';
import { RADIUS } from '../../../theme/radius';
import { SPACING } from '../../../theme/spacing';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { Header } from '../../../components/ui/Header';
import { Card } from '../../../components/ui/Card';
import { useMechanicStore } from '../../../stores/mechanicStore';
import { useResponsive } from '../../../hooks/useResponsive';

export default function MechanicJobDetailsScreen() {
  const { theme, isDark } = useTheme();
  const { horizontalPadding, isTablet, isDesktop } = useResponsive();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { incomingRequests, activeJob, completedJobs, updateJobStatus } =
    useMechanicStore();

  const allJobs = [
    ...(activeJob ? [activeJob] : []),
    ...incomingRequests,
    ...completedJobs,
  ];

  const job = allJobs.find((j) => j.id === id) || allJobs[0];

  const handleCallCustomer = () => {
    if (job?.customerPhone) {
      Linking.openURL(`tel:${job.customerPhone}`);
    } else {
      Linking.openURL('tel:+919876543210');
    }
  };

  const handleWhatsApp = () => {
    const phone = job?.customerPhone?.replace(/[^0-9]/g, '') || '919876543210';
    Linking.openURL(`https://wa.me/${phone}?text=Hello%20Arjun%2C%20I%20am%20your%20MECHFIND%20breakdown%20mechanic`);
  };

  const handleStartNavigation = () => {
    if (job) {
      router.push({
        pathname: '/(mechanic)/job-navigation/[id]',
        params: { id: job.id },
      });
    }
  };

  const handleMarkAsArrived = () => {
    if (job) {
      updateJobStatus(job.id, 'arrived');
      router.push({
        pathname: '/(mechanic)/job-navigation/[id]',
        params: { id: job.id },
      });
    }
  };

  const customerName = job?.customerName || 'Arjun Kapoor';
  const serviceTitle = job?.categoryName || 'Battery Jumpstart';
  const vehicleDesc = job?.vehicle
    ? `${job.vehicle.make} ${job.vehicle.model}${
        job.vehicle.licensePlate ? ` (${job.vehicle.licensePlate})` : ''
      }`
    : 'Hyundai Creta SX (MH 02 EE 4092)';
  const locationAddress =
    job?.location?.address || 'SV Road, Near Bandra Station West';
  const estimateCost = job?.estimatedCost || 400;

  const renderCustomerCard = () => (
    <Card style={styles.customerCard}>
      <View style={styles.customerRow}>
        {/* Avatar Circle */}
        <View
          style={[
            styles.avatarCircle,
            { backgroundColor: isDark ? '#1E293B' : '#EFF6FF' },
          ]}
        >
          <Ionicons name="person" size={24} color={BRAND_COLORS.primaryBlue} />
        </View>

        {/* Customer Name */}
        <Text
          style={[styles.customerName, { color: theme.textPrimary }]}
          numberOfLines={1}
        >
          {customerName}
        </Text>

        {/* Quick Actions: Call & WhatsApp */}
        <View style={styles.actionsGroup}>
          <Pressable
            onPress={handleCallCustomer}
            style={[styles.actionCircleBtn, { backgroundColor: '#ECFDF5' }]}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Call Customer"
          >
            <Ionicons name="call" size={18} color={BRAND_COLORS.successGreen} />
          </Pressable>

          <Pressable
            onPress={handleWhatsApp}
            style={[styles.actionCircleBtn, { backgroundColor: '#ECFDF5' }]}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="WhatsApp Customer"
          >
            <Ionicons name="logo-whatsapp" size={18} color={BRAND_COLORS.successGreen} />
          </Pressable>
        </View>
      </View>
    </Card>
  );

  const renderDetailsList = () => (
    <View style={styles.detailsList}>
      {/* Service */}
      <View style={styles.fieldItem}>
        <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
          Service
        </Text>
        <Text style={[styles.fieldValue, { color: theme.textPrimary }]}>
          {serviceTitle}
        </Text>
      </View>

      {/* Vehicle */}
      <View style={styles.fieldItem}>
        <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
          Vehicle
        </Text>
        <Text style={[styles.fieldValue, { color: theme.textPrimary }]}>
          {vehicleDesc}
        </Text>
      </View>

      {/* Location */}
      <View style={styles.fieldItem}>
        <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
          Location
        </Text>
        <Text style={[styles.fieldValue, { color: theme.textPrimary }]}>
          {locationAddress}
        </Text>
      </View>

      {/* Mechanic Authorized Payout */}
      <View style={styles.fieldItem}>
        <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
          Mechanic Payout (Your Earnings)
        </Text>
        <Text style={[styles.estimateValue, { color: BRAND_COLORS.successGreen }]}>
          ₹{estimateCost}
        </Text>
      </View>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.bottomButtonsWrap}>
      {/* Start Navigation (Outline) */}
      <Pressable
        onPress={handleStartNavigation}
        style={({ pressed }) => [
          styles.navButton,
          {
            borderColor: theme.border,
            backgroundColor: theme.card,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Start Navigation"
      >
        <Ionicons
          name="navigate-outline"
          size={18}
          color={theme.textPrimary}
          style={{ marginRight: 8 }}
        />
        <Text style={[styles.navButtonText, { color: theme.textPrimary }]}>
          Start Navigation
        </Text>
      </Pressable>

      {/* Mark as Arrived (Solid Green) */}
      <Pressable
        onPress={handleMarkAsArrived}
        style={({ pressed }) => [
          styles.arriveButton,
          {
            backgroundColor: BRAND_COLORS.successGreen,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Mark as Arrived"
      >
        <Text style={styles.arriveButtonText}>Mark as Arrived</Text>
      </Pressable>
    </View>
  );

  return (
    <ScreenContainer scrollable withPadding={false} edges={['top', 'left', 'right']}>
      {/* Top Header with Active Badge */}
      <Header
        title="Job Details"
        showBack
        showThemeToggle
        rightAction={
          <View style={styles.activeHeaderBadge}>
            <Text style={styles.activeBadgeText}>Active</Text>
          </View>
        }
      />

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
        {isDesktop ? (
          <View style={styles.desktopRow}>
            <View style={styles.desktopLeftCol}>
              {renderCustomerCard()}
              <Card style={{ padding: 14, marginTop: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Ionicons name="location" size={18} color={BRAND_COLORS.primaryBlue} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: theme.textPrimary }}>
                    Customer Spot
                  </Text>
                </View>
                <Text style={{ fontSize: 13, color: theme.textSecondary }}>
                  {locationAddress}
                </Text>
              </Card>
            </View>
            <View style={styles.desktopRightCol}>
              {renderDetailsList()}
              {renderActionButtons()}
            </View>
          </View>
        ) : (
          <>
            {renderCustomerCard()}
            {renderDetailsList()}
            {renderActionButtons()}
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    paddingVertical: SPACING.md,
  },
  activeHeaderBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: BRAND_COLORS.successGreen,
  },
  customerCard: {
    padding: 14,
    marginBottom: SPACING.lg,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    minWidth: 0,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsList: {
    gap: 18,
    marginBottom: SPACING.xl,
  },
  fieldItem: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  estimateValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  bottomButtonsWrap: {
    gap: 12,
    marginTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  navButton: {
    flexDirection: 'row',
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  arriveButton: {
    height: 50,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arriveButtonText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '700',
  },
  desktopRow: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start',
    width: '100%',
  },
  desktopLeftCol: {
    flex: 0.9,
    minWidth: 380,
  },
  desktopRightCol: {
    flex: 1.1,
    minWidth: 420,
  },
});
