import React, { useEffect, useMemo, useState } from 'react';
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
import { MapFallback } from '../../../components/ui/MapFallback';
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';
import { useCustomerStore } from '../../../stores/customerStore';
import { useResponsive } from '../../../hooks/useResponsive';

export default function LiveTrackingScreen() {
  const { theme, isDark } = useTheme();
  const { isSmallDevice, horizontalPadding, isTablet, isDesktop } = useResponsive();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { requests, cancelRequest, respondToQuote } = useCustomerStore();

  const request = requests.find((r) => r.id === id) || requests[0];
  const [eta, setEta] = useState(request?.etaMinutes || 10);

  useEffect(() => {
    if (!request || request.status === 'completed' || request.status === 'cancelled') return;
    const interval = setInterval(() => {
      setEta((prev) => Math.max(1, prev - 1));
    }, 15000);
    return () => clearInterval(interval);
  }, [request]);

  const handleCallMechanic = () => {
    if (request?.mechanic?.phoneNumber) {
      Linking.openURL(`tel:${request.mechanic.phoneNumber}`);
    } else {
      Linking.openURL('tel:+919820112345');
    }
  };

  const handleWhatsApp = () => {
    const phone = request?.mechanic?.phoneNumber?.replace(/[^0-9]/g, '') || '919820112345';
    Linking.openURL(`https://wa.me/${phone}?text=Hello%2C%20regarding%20my%20vehicle%20breakdown%20assistance`);
  };

  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleCancelRequest = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    if (request) {
      cancelRequest(request.id, 'Customer cancelled assistance');
    }
    setShowCancelModal(false);
    router.replace('/(customer)/(tabs)/requests');
  };

  if (!request) {
    return (
      <ScreenContainer>
        <Header title="Live Tracking" showBack />
        <Text style={{ color: theme.textPrimary, padding: SPACING.lg }}>
          Breakdown request not found.
        </Text>
      </ScreenContainer>
    );
  }

  const mechanicName = request.mechanic?.fullName || 'Rajesh Kumar';
  const shopName = request.mechanic?.shopName?.split('&')[0].trim() || 'Apex Speed Garage';
  const rating = request.mechanic?.rating || 4.9;
  const distance = request.mechanic?.distanceKm || 1.2;

  const mapHeight = isSmallDevice ? 320 : 380;

  const statusHeadline = useMemo(() => {
    switch (request.status) {
      case 'submitted':
        return 'Dispatching Nearest Mechanic...';
      case 'accepted':
        return 'Mechanic Accepted Your Request';
      case 'heading_to_customer':
        return 'Mechanic is on the way';
      case 'arrived':
        return 'Mechanic has arrived at your spot';
      case 'inspection':
        return 'Vehicle inspection underway';
      case 'work_in_progress':
        return 'Repair work in progress';
      case 'completed':
        return 'Roadside repair completed';
      default:
        return 'Mechanic is on the way';
    }
  }, [request.status]);

  const renderStatusHeader = () => (
    <View style={styles.topStatusHeader}>
      <Text style={[styles.statusMainText, { color: theme.textPrimary }]}>
        {statusHeadline}
      </Text>
      <Text style={[styles.statusEtaText, { color: theme.textSecondary }]}>
        ETA: ~{eta} mins ({distance} km)
      </Text>
    </View>
  );

  const renderMap = (height: number) => (
    <View style={styles.mapContainer}>
      <MapFallback
        height={height}
        userLocation={request.location}
        mechanicLocation={
          request.mechanic
            ? {
                latitude: request.mechanic.latitude,
                longitude: request.mechanic.longitude,
              }
            : { latitude: 19.065, longitude: 72.83 }
        }
        etaMinutes={eta}
        distanceKm={distance}
      />
    </View>
  );

  const renderMechanicCard = () => (
    <Card style={styles.mechanicCard}>
      <View style={styles.mechanicRow}>
        {/* Driver Avatar */}
        <View
          style={[
            styles.avatarCircle,
            { backgroundColor: isDark ? '#1E293B' : '#DBEAFE' },
          ]}
        >
          <Ionicons name="person" size={26} color={BRAND_COLORS.primaryBlue} />
        </View>

        {/* Driver Info */}
        <View style={styles.driverInfoCol}>
          <Text
            style={[styles.driverName, { color: theme.textPrimary }]}
            numberOfLines={1}
          >
            {mechanicName}
          </Text>
          <View style={styles.ratingShopRow}>
            <Ionicons name="star" size={13} color="#F59E0B" />
            <Text style={[styles.ratingSubText, { color: theme.textSecondary }]}>
              {rating} • {shopName}
            </Text>
          </View>
        </View>

        {/* Quick Actions: Call & WhatsApp */}
        <View style={styles.actionButtonsCol}>
          <Pressable
            onPress={handleCallMechanic}
            style={[styles.circleActionBtn, { backgroundColor: '#ECFDF5' }]}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Call Mechanic"
          >
            <Ionicons name="call" size={18} color={BRAND_COLORS.successGreen} />
          </Pressable>

          <Pressable
            onPress={handleWhatsApp}
            style={[styles.circleActionBtn, { backgroundColor: '#ECFDF5' }]}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="WhatsApp Mechanic"
          >
            <Ionicons name="logo-whatsapp" size={18} color={BRAND_COLORS.successGreen} />
          </Pressable>
        </View>
      </View>

      {/* Status Sub-Pill at bottom of card */}
      <View
        style={[
          styles.statusPill,
          { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
        ]}
      >
        <Ionicons name="bicycle" size={16} color={BRAND_COLORS.primaryBlue} />
        <Text style={[styles.statusPillText, { color: theme.textPrimary }]}>
          On the way to your location
        </Text>
      </View>
    </Card>
  );

  const renderJobDetailsCard = () => (
    <Card style={styles.jobSummaryCard}>
      <View style={styles.jobDetailItem}>
        <Ionicons name="build-outline" size={16} color={BRAND_COLORS.primaryBlue} />
        <Text style={[styles.jobDetailLabel, { color: theme.textSecondary }]}>Service:</Text>
        <Text style={[styles.jobDetailVal, { color: theme.textPrimary }]}>
          {request.categoryName || 'Roadside Assistance'}
        </Text>
      </View>
      <View style={styles.jobDetailItem}>
        <Ionicons name="navigate-outline" size={16} color={BRAND_COLORS.primaryBlue} />
        <Text style={[styles.jobDetailLabel, { color: theme.textSecondary }]}>Location:</Text>
        <Text style={[styles.jobDetailVal, { color: theme.textPrimary }]} numberOfLines={1}>
          {request.location?.landmark || request.location?.address || 'Current Breakdown Spot'}
        </Text>
      </View>
      <View style={styles.jobDetailItem}>
        <Ionicons name="cash-outline" size={16} color={BRAND_COLORS.primaryBlue} />
        <Text style={[styles.jobDetailLabel, { color: theme.textSecondary }]}>Estimate:</Text>
        <Text style={[styles.jobDetailVal, { color: BRAND_COLORS.successGreen, fontWeight: '700' }]}>
          ₹{request.estimatedCost || 350}
        </Text>
      </View>
    </Card>
  );

  const renderCancelButton = () => (
    <Pressable
      onPress={handleCancelRequest}
      style={styles.cancelBtnWrap}
      hitSlop={8}
    >
      <Text style={[styles.cancelText, { color: BRAND_COLORS.error }]}>
        Cancel Assistance
      </Text>
    </Pressable>
  );

  return (
    <ScreenContainer scrollable withPadding={false} edges={['top', 'left', 'right']}>
      <Header
        title="Live Tracking"
        showBack
        showThemeToggle
        onBackPress={() => router.replace('/(customer)/(tabs)')}
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
          <View style={styles.desktopLayout}>
            <View style={styles.desktopMapCol}>
              {renderMap(520)}
            </View>
            <View style={styles.desktopInfoCol}>
              {renderStatusHeader()}
              {renderMechanicCard()}
              {renderJobDetailsCard()}
              {renderCancelButton()}
            </View>
          </View>
        ) : (
          <>
            {renderStatusHeader()}
            {renderMap(mapHeight)}
            {renderMechanicCard()}
            {renderCancelButton()}
          </>
        )}
      </View>

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        visible={showCancelModal}
        title="Cancel Breakdown Assistance"
        message="Are you sure you want to cancel? The dispatched technician is currently en route to your coordinates."
        confirmText="Cancel Dispatch"
        cancelText="Keep Assistance"
        isDestructive
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowCancelModal(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    paddingVertical: SPACING.xs,
  },
  topStatusHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  statusMainText: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  statusEtaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  mapContainer: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: SPACING.md,
  },
  mechanicCard: {
    padding: 14,
    marginBottom: SPACING.md,
  },
  mechanicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverInfoCol: {
    flex: 1,
    minWidth: 0,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  ratingShopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingSubText: {
    fontSize: 12.5,
  },
  actionButtonsCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circleActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    borderRadius: RADIUS.md,
    marginTop: 12,
    gap: 8,
  },
  statusPillText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  cancelBtnWrap: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '600',
  },
  desktopLayout: {
    flexDirection: 'row',
    gap: 28,
    alignItems: 'flex-start',
    width: '100%',
  },
  desktopMapCol: {
    flex: 1.15,
    minWidth: 440,
  },
  desktopInfoCol: {
    flex: 0.85,
    minWidth: 360,
  },
  jobSummaryCard: {
    padding: 14,
    marginBottom: SPACING.md,
    gap: 10,
  },
  jobDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  jobDetailLabel: {
    fontSize: 13,
    width: 65,
  },
  jobDetailVal: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});
