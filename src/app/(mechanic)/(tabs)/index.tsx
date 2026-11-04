import React from 'react';
import { Image, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { BRAND_COLORS } from '../../../theme/colors';
import { RADIUS } from '../../../theme/radius';
import { SPACING } from '../../../theme/spacing';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { Card } from '../../../components/ui/Card';
import { useAuthStore } from '../../../stores/authStore';
import { useMechanicStore } from '../../../stores/mechanicStore';
import { MechanicUser } from '../../../types/auth';
import { useResponsive } from '../../../hooks/useResponsive';

export default function MechanicDashboardScreen() {
  const { theme, isDark } = useTheme();
  const { horizontalPadding, isTablet, isDesktop } = useResponsive();
  const user = useAuthStore((state) => state.user) as MechanicUser | null;
  const {
    isOnline,
    toggleOnlineStatus,
    activeJob,
    incomingRequests,
    acceptRequest,
    rejectRequest,
    earnings,
    completedJobs,
  } = useMechanicStore();

  const handleAccept = (requestId: string) => {
    acceptRequest(requestId);
    router.push({
      pathname: '/(mechanic)/job-details/[id]',
      params: { id: requestId },
    });
  };

  const handleDecline = (requestId: string) => {
    rejectRequest(requestId);
  };

  const newRequest = incomingRequests[0];

  const renderWorkshopHeader = () => (
    <Card style={styles.workshopHeaderCard}>
      <View style={styles.workshopHeaderRow}>
        {/* Workshop Photo / Official Logo */}
        <Image
          source={require('../../../../assets/images/mechfind_logo.png')}
          style={styles.workshopLogoImage}
          resizeMode="contain"
          accessibilityLabel="MECHFIND Official Logo"
        />

        {/* Workshop Name & Online Info */}
        <View style={styles.workshopTitleCol}>
          <View style={styles.shopNameRow}>
            <Text
              style={[styles.shopName, { color: theme.textPrimary }]}
              numberOfLines={1}
            >
              {user?.shopName || 'Apex Speed Garage'}
            </Text>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={BRAND_COLORS.successGreen}
              style={{ marginLeft: 4 }}
            />
          </View>

          <Text style={[styles.onlineStatusText, { color: theme.textSecondary }]}>
            {isOnline ? 'Online • Ready to receive requests' : 'Offline • Toggle to receive jobs'}
          </Text>
        </View>

        {/* Green Switch */}
        <Switch
          value={isOnline}
          onValueChange={toggleOnlineStatus}
          trackColor={{ false: '#CBD5E1', true: BRAND_COLORS.successGreen }}
          thumbColor="#FFFFFF"
        />
      </View>
    </Card>
  );

  const renderStatsRow = () => (
    <View style={styles.statsRow}>
      {/* Active Jobs */}
      <View
        style={[
          styles.statBox,
          { backgroundColor: isDark ? '#1E293B' : '#142235' },
        ]}
      >
        <Text style={styles.statNumber}>
          {activeJob ? 2 : 1}
        </Text>
        <Text style={styles.statLabel}>Active Jobs</Text>
      </View>

      {/* This Week */}
      <View
        style={[
          styles.statBox,
          { backgroundColor: isDark ? '#1E293B' : '#142235' },
        ]}
      >
        <Text style={styles.statNumber}>
          ₹{(earnings.week || 4200).toLocaleString()}
        </Text>
        <Text style={styles.statLabel}>This Week</Text>
      </View>

      {/* Rating */}
      <View
        style={[
          styles.statBox,
          { backgroundColor: isDark ? '#1E293B' : '#142235' },
        ]}
      >
        <Text style={styles.statNumber}>★ 4.9</Text>
        <Text style={styles.statLabel}>(142 Reviews)</Text>
      </View>
    </View>
  );

  const renderNewRequests = () =>
    newRequest ? (
      <View style={styles.sectionWrap}>
        <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
          New Requests ({incomingRequests.length})
        </Text>

        <Card style={styles.requestCard}>
          <View style={styles.reqTopRow}>
            <View
              style={[
                styles.reqIconBox,
                { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
              ]}
            >
              <Ionicons name="bicycle" size={22} color={BRAND_COLORS.primaryBlue} />
            </View>

            <View style={styles.reqInfoCol}>
              <View style={styles.reqTitleRow}>
                <Text
                  style={[styles.reqTitle, { color: theme.textPrimary }]}
                  numberOfLines={1}
                >
                  {newRequest.categoryName || 'Flat Tyre & Puncture'}
                </Text>
                <View style={styles.justNowBadge}>
                  <Text style={styles.justNowText}>Just now</Text>
                </View>
              </View>

              <Text style={[styles.reqVehicle, { color: theme.textSecondary }]}>
                {newRequest.vehicle?.make} {newRequest.vehicle?.model || 'Honda City ZX'} • {newRequest.vehicle?.licensePlate || 'MH 02 CZ 1044'}
              </Text>

              <Text style={[styles.reqLocation, { color: theme.textSecondary }]} numberOfLines={1}>
                📍 {newRequest.location?.address || 'Near Bandra Sea Link Toll'}
              </Text>

              <Text style={[styles.reqDistancePrice, { color: BRAND_COLORS.successGreen }]}>
                ~1.2 km away • Authorized Payout: ₹{newRequest.estimatedCost || 350}
              </Text>
            </View>
          </View>

          {/* Action Buttons: Decline & Accept */}
          <View style={styles.reqActionsRow}>
            <Pressable
              onPress={() => handleDecline(newRequest.id)}
              style={[
                styles.declineBtn,
                { borderColor: theme.border },
              ]}
              hitSlop={6}
            >
              <Text style={[styles.declineText, { color: theme.textPrimary }]}>
                Decline
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleAccept(newRequest.id)}
              style={[
                styles.acceptBtn,
                { backgroundColor: BRAND_COLORS.successGreen },
              ]}
              hitSlop={6}
            >
              <Text style={styles.acceptText}>Accept</Text>
            </Pressable>
          </View>
        </Card>
      </View>
    ) : null;

  const renderActiveJob = () =>
    activeJob ? (
      <View style={styles.sectionWrap}>
        <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
          Active Job
        </Text>

        <Card
          onPress={() =>
            router.push({
              pathname: '/(mechanic)/job-details/[id]',
              params: { id: activeJob.id },
            })
          }
          style={styles.activeJobCard}
        >
          <View style={styles.activeJobRow}>
            <View
              style={[
                styles.activeJobIconBox,
                { backgroundColor: isDark ? '#1E293B' : '#EFF6FF' },
              ]}
            >
              <Ionicons name="car" size={24} color={BRAND_COLORS.primaryBlue} />
            </View>

            <View style={styles.activeJobInfoCol}>
              <View style={styles.activeJobTitleRow}>
                <Text
                  style={[styles.activeJobTitle, { color: theme.textPrimary }]}
                  numberOfLines={1}
                >
                  {activeJob.categoryName || 'Battery Jumpstart'}
                </Text>
                <View style={styles.onTheWayBadge}>
                  <Text style={styles.onTheWayText}>On the way</Text>
                </View>
              </View>

              <Text style={[styles.activeJobVehicle, { color: theme.textSecondary }]}>
                {activeJob.vehicle?.make || 'Hyundai'} {activeJob.vehicle?.model || 'Creta SX'}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
          </View>
        </Card>
      </View>
    ) : null;

  return (
    <ScreenContainer scrollable withPadding={false} edges={['top', 'left', 'right']}>
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
              {renderWorkshopHeader()}
              {renderStatsRow()}
              {renderActiveJob()}
            </View>
            <View style={styles.desktopRightCol}>
              {renderNewRequests()}
            </View>
          </View>
        ) : (
          <>
            {renderWorkshopHeader()}
            {renderStatsRow()}
            {renderNewRequests()}
            {renderActiveJob()}
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
  workshopHeaderCard: {
    padding: 14,
    marginBottom: SPACING.md,
  },
  workshopHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  workshopAvatar: {
    width: 52,
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workshopLogoImage: {
    width: 52,
    height: 52,
    borderRadius: 10,
  },
  workshopTitleCol: {
    flex: 1,
    minWidth: 0,
  },
  shopNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '700',
    flexShrink: 1,
  },
  onlineStatusText: {
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.lg,
  },
  statBox: {
    flex: 1,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
  sectionWrap: {
    marginBottom: SPACING.lg,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  requestCard: {
    padding: 14,
  },
  reqTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  reqIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reqInfoCol: {
    flex: 1,
    minWidth: 0,
  },
  reqTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  reqTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    flexShrink: 1,
  },
  justNowBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  justNowText: {
    fontSize: 11,
    fontWeight: '700',
    color: BRAND_COLORS.successGreen,
  },
  reqVehicle: {
    fontSize: 12.5,
    marginBottom: 2,
  },
  reqLocation: {
    fontSize: 11.5,
    marginBottom: 3,
  },
  reqDistancePrice: {
    fontSize: 12,
  },
  reqActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  declineBtn: {
    flex: 1,
    height: 40,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineText: {
    fontSize: 13,
    fontWeight: '600',
  },
  acceptBtn: {
    flex: 1,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  activeJobCard: {
    padding: 14,
  },
  activeJobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activeJobIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeJobInfoCol: {
    flex: 1,
    minWidth: 0,
  },
  activeJobTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  activeJobTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    flexShrink: 1,
  },
  onTheWayBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  onTheWayText: {
    fontSize: 11,
    fontWeight: '700',
    color: BRAND_COLORS.primaryBlue,
  },
  activeJobVehicle: {
    fontSize: 12.5,
  },
  desktopRow: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start',
    width: '100%',
  },
  desktopLeftCol: {
    flex: 1.15,
    minWidth: 440,
  },
  desktopRightCol: {
    flex: 0.85,
    minWidth: 380,
  },
});
