import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuthStore } from '../../../stores/authStore';
import { useMechanicStore } from '../../../stores/mechanicStore';
import { MechanicUser } from '../../../types/auth';
import { useResponsive } from '../../../hooks/useResponsive';
import { BRAND_COLORS } from '../../../theme/colors';
import { RADIUS } from '../../../theme/radius';
import { SPACING } from '../../../theme/spacing';

export default function MechanicDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme } = useTheme();
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

  const getServiceThumb = (category: string) => {
    switch (category) {
      case 'battery_jumpstart':
        return require('../../../../assets/images/service-battery-thumb.png');
      case 'oil_change':
        return require('../../../../assets/images/thumb-oil-service.png');
      case 'flat_tyre':
        return require('../../../../assets/images/thumb-tyre-service.png');
      default:
        return require('../../../../assets/images/thumb-general-service.png');
    }
  };

  const newRequest = incomingRequests[0];

  return (
    <View style={[styles.screen, { backgroundColor: isDark ? '#101114' : '#F1F2F4' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView
        style={[styles.scrollView, { backgroundColor: isDark ? '#101114' : '#F1F2F4' }]}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + SPACING.sm,
            paddingBottom: insets.bottom + 80,
            paddingHorizontal: horizontalPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.container,
            {
              maxWidth: isDesktop ? 1080 : isTablet ? 720 : undefined,
              alignSelf: isTablet || isDesktop ? 'center' : undefined,
              width: isTablet || isDesktop ? '100%' : undefined,
            },
          ]}
        >
          {/* 1. Header with MECHFIND Logo, Theme Toggle, Notification Bell and Profile Avatar */}
          <View style={styles.headerRow}>
            <Image
              source={require('../../../../assets/images/mechfind-header-logo.png')}
              style={styles.mechfindLogo}
              resizeMode="contain"
              accessibilityLabel="MECHFIND"
            />

            <View style={styles.headerRightActions}>
              {/* Theme Toggle Button */}
              <Pressable
                style={[
                  styles.iconCircleBtn,
                  {
                    backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                    borderColor: isDark ? '#2D3139' : '#E5E7EB',
                  },
                ]}
                hitSlop={8}
                onPress={toggleTheme}
                accessibilityLabel="Toggle Dark / Light Theme"
              >
                <Ionicons
                  name={isDark ? 'moon' : 'sunny'}
                  size={19}
                  color={isDark ? '#FFFFFF' : '#101114'}
                />
              </Pressable>

              {/* Notification Bell */}
              <Pressable
                style={[
                  styles.iconCircleBtn,
                  {
                    backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                    borderColor: isDark ? '#2D3139' : '#E5E7EB',
                  },
                ]}
                hitSlop={8}
                onPress={() => router.push('/(mechanic)/(tabs)/requests')}
                accessibilityLabel="Notifications"
              >
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={isDark ? '#FFFFFF' : '#101114'}
                />
                <View style={styles.yellowNotificationDot} />
              </Pressable>

              {/* Profile Avatar */}
              <Pressable
                style={styles.profileAvatarBtn}
                hitSlop={8}
                onPress={() => router.push('/(mechanic)/(tabs)/profile')}
                accessibilityLabel="My Profile"
              >
                <Ionicons
                  name="person-circle"
                  size={32}
                  color={isDark ? '#FFFFFF' : '#101114'}
                />
              </Pressable>
            </View>
          </View>

          {/* 2. Welcome Title & Subtitle */}
          <View style={styles.welcomeSection}>
            <Text
              style={[
                styles.welcomeTitle,
                { color: isDark ? '#FFFFFF' : '#101114' },
              ]}
            >
              Welcome, {user?.shopName || 'Workshop Partner'} 👋
            </Text>
            <Text
              style={[
                styles.welcomeSubtitle,
                { color: isDark ? '#9CA3AF' : '#6B7280' },
              ]}
            >
              Manage your jobs, earnings and workshop
            </Text>
          </View>

          {/* 3. Workshop Partner Availability Card */}
          <View
            style={[
              styles.workshopCard,
              {
                backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                borderColor: isDark ? '#2D3139' : 'transparent',
                borderWidth: isDark ? 1 : 0,
              },
            ]}
          >
            <View style={styles.workshopCardContent}>
              <Image
                source={require('../../../../assets/images/workshop-gear-badge.png')}
                style={styles.workshopGearBadge}
                resizeMode="cover"
              />

              <View style={styles.workshopInfoCol}>
                <View style={styles.workshopTitleRow}>
                  <Text
                    style={[
                      styles.workshopPartnerName,
                      { color: isDark ? '#FFFFFF' : '#101114' },
                    ]}
                    numberOfLines={1}
                  >
                    {user?.shopName || 'Workshop Partner'}
                  </Text>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={BRAND_COLORS.successGreen}
                    style={{ marginLeft: 5 }}
                  />
                </View>
                <Text
                  style={[
                    styles.workshopStatusText,
                    { color: isDark ? '#9CA3AF' : '#6B7280' },
                  ]}
                >
                  {isOnline
                    ? 'Online • Ready to receive requests'
                    : 'Offline • Toggle to receive jobs'}
                </Text>
              </View>

              <Switch
                value={isOnline}
                onValueChange={toggleOnlineStatus}
                trackColor={{ false: '#D1D5DB', true: BRAND_COLORS.successGreen }}
                thumbColor="#FFFFFF"
                style={styles.switchControl}
              />
            </View>
          </View>

          {/* 4. Statistics Row: Active Jobs, This Week, Rating */}
          <View style={styles.statsRow}>
            {/* Active Jobs */}
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                  borderColor: isDark ? '#2D3139' : '#E5E7EB',
                },
              ]}
            >
              <View style={styles.statIconWrap}>
                <Ionicons name="briefcase" size={18} color="#FFC400" />
              </View>
              <Text
                style={[
                  styles.statValue,
                  { color: isDark ? '#FFFFFF' : '#101114' },
                ]}
              >
                {activeJob ? 1 : 0}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: isDark ? '#9CA3AF' : '#6B7280' },
                ]}
              >
                Active Jobs
              </Text>
            </View>

            {/* This Week */}
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                  borderColor: isDark ? '#2D3139' : '#E5E7EB',
                },
              ]}
            >
              <View style={styles.statIconWrap}>
                <Ionicons name="wallet" size={18} color="#FFC400" />
              </View>
              <Text
                style={[
                  styles.statValue,
                  { color: isDark ? '#FFFFFF' : '#101114' },
                ]}
              >
                ₹{(earnings.week || 0).toLocaleString()}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: isDark ? '#9CA3AF' : '#6B7280' },
                ]}
              >
                This Week
              </Text>
            </View>

            {/* Rating */}
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                  borderColor: isDark ? '#2D3139' : '#E5E7EB',
                },
              ]}
            >
              <View style={styles.statIconWrap}>
                <Ionicons name="star" size={18} color="#FFC400" />
              </View>
              <Text
                style={[
                  styles.statValue,
                  { color: isDark ? '#FFFFFF' : '#101114' },
                ]}
              >
                {user?.rating || 4.9}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: isDark ? '#9CA3AF' : '#6B7280' },
                ]}
              >
                ({user?.reviewCount || 0} Reviews)
              </Text>
            </View>
          </View>

          {/* 5. Live Dispatches Hero Card */}
          <View style={styles.dispatchHeroCard}>
            <View style={styles.yellowCornerPennant}>
              <View style={styles.pennantBody} />
              <View style={styles.pennantPoint} />
            </View>

            <View style={styles.dispatchContentCol}>
              <View style={styles.dispatchBadgeRow}>
                <Text style={styles.dispatchBadgeText}>
                  LIVE DISPATCHES (((•)))
                </Text>
              </View>

              <Text style={styles.dispatchHeading}>
                Ready for{'\n'}
                <Text style={styles.dispatchHeadingHighlight}>
                  Live Dispatches
                </Text>
              </Text>

              <Text style={styles.dispatchDescription}>
                You are online. Incoming breakdown assistance requests from motorists
                within your {user?.serviceRadiusKm || 15} km service radius will appear here.
              </Text>
            </View>

            <Image
              source={require('../../../../assets/images/mechanic-hero-crop.png')}
              style={styles.mechanicHeroImg}
              resizeMode="contain"
            />
          </View>

          {/* 6. Quick Action Cards (4 horizontally) */}
          <View style={styles.quickActionsRow}>
            {/* Manage Services */}
            <Pressable
              style={[
                styles.quickActionCard,
                {
                  backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                  borderColor: isDark ? '#2D3139' : '#E5E7EB',
                },
              ]}
              onPress={() => router.push('/(mechanic)/services-pricing')}
              accessibilityRole="button"
            >
              <View
                style={[
                  styles.quickActionIconBox,
                  { backgroundColor: isDark ? 'rgba(255, 196, 0, 0.15)' : '#FEF3C7' },
                ]}
              >
                <Ionicons
                  name="build"
                  size={19}
                  color={isDark ? '#FFC400' : '#101114'}
                />
              </View>
              <Text
                style={[
                  styles.quickActionLabel,
                  { color: isDark ? '#FFFFFF' : '#101114' },
                ]}
              >
                Manage{'\n'}Services
              </Text>
            </Pressable>

            {/* Set Availability */}
            <Pressable
              style={[
                styles.quickActionCard,
                {
                  backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                  borderColor: isDark ? '#2D3139' : '#E5E7EB',
                },
              ]}
              onPress={toggleOnlineStatus}
              accessibilityRole="button"
            >
              <View
                style={[
                  styles.quickActionIconBox,
                  { backgroundColor: isDark ? 'rgba(255, 196, 0, 0.15)' : '#FEF3C7' },
                ]}
              >
                <Ionicons
                  name="calendar"
                  size={19}
                  color={isDark ? '#FFC400' : '#101114'}
                />
              </View>
              <Text
                style={[
                  styles.quickActionLabel,
                  { color: isDark ? '#FFFFFF' : '#101114' },
                ]}
              >
                Set{'\n'}Availability
              </Text>
            </Pressable>

            {/* View Earnings */}
            <Pressable
              style={[
                styles.quickActionCard,
                {
                  backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                  borderColor: isDark ? '#2D3139' : '#E5E7EB',
                },
              ]}
              onPress={() => router.push('/(mechanic)/(tabs)/earnings')}
              accessibilityRole="button"
            >
              <View
                style={[
                  styles.quickActionIconBox,
                  { backgroundColor: isDark ? 'rgba(255, 196, 0, 0.15)' : '#FEF3C7' },
                ]}
              >
                <Ionicons
                  name="bar-chart"
                  size={19}
                  color={isDark ? '#FFC400' : '#101114'}
                />
              </View>
              <Text
                style={[
                  styles.quickActionLabel,
                  { color: isDark ? '#FFFFFF' : '#101114' },
                ]}
              >
                View{'\n'}Earnings
              </Text>
            </Pressable>

            {/* My Workshop */}
            <Pressable
              style={[
                styles.quickActionCard,
                {
                  backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                  borderColor: isDark ? '#2D3139' : '#E5E7EB',
                },
              ]}
              onPress={() => router.push('/(mechanic)/(tabs)/profile')}
              accessibilityRole="button"
            >
              <View
                style={[
                  styles.quickActionIconBox,
                  { backgroundColor: isDark ? 'rgba(255, 196, 0, 0.15)' : '#FEF3C7' },
                ]}
              >
                <Ionicons
                  name="storefront"
                  size={19}
                  color={isDark ? '#FFC400' : '#101114'}
                />
              </View>
              <Text
                style={[
                  styles.quickActionLabel,
                  { color: isDark ? '#FFFFFF' : '#101114' },
                ]}
              >
                My{'\n'}Workshop
              </Text>
            </Pressable>
          </View>

          {/* 7. Active Job (if currently attending one) */}
          {activeJob && (
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeaderRow}>
                <Text
                  style={[
                    styles.sectionHeading,
                    { color: isDark ? '#FFFFFF' : '#101114' },
                  ]}
                >
                  Active Job
                </Text>
                <Pressable onPress={() => router.push('/(mechanic)/(tabs)/requests')}>
                  <Text style={styles.viewAllText}>View All ›</Text>
                </Pressable>
              </View>

              <Pressable
                style={[
                  styles.jobCardWhite,
                  {
                    backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                    borderColor: isDark ? '#2D3139' : '#E5E7EB',
                    borderWidth: isDark ? 1 : 0,
                  },
                ]}
                onPress={() =>
                  router.push({
                    pathname: '/(mechanic)/job-details/[id]',
                    params: { id: activeJob.id },
                  })
                }
              >
                <View style={styles.jobTopRow}>
                  <Image
                    source={getServiceThumb(activeJob.category)}
                    style={styles.serviceThumbImg}
                    resizeMode="cover"
                  />
                  <View style={styles.jobHeaderCol}>
                    <Text
                      style={[
                        styles.jobTitleText,
                        { color: isDark ? '#FFFFFF' : '#101114' },
                      ]}
                      numberOfLines={1}
                    >
                      {activeJob.categoryName || 'Oil Change Service'}
                    </Text>
                    <Text
                      style={[
                        styles.jobIdText,
                        { color: isDark ? '#9CA3AF' : '#6B7280' },
                      ]}
                    >
                      #MF{activeJob.id.replace(/[^0-9]/g, '').slice(-5) || '10236'}
                    </Text>
                  </View>
                  <View style={styles.activePillBadge}>
                    <Text style={styles.activePillText}>▷ Active</Text>
                  </View>
                </View>

                <View style={styles.locationRow}>
                  <Ionicons
                    name="location-outline"
                    size={15}
                    color={isDark ? '#9CA3AF' : '#6B7280'}
                  />
                  <Text
                    style={[
                      styles.locationText,
                      { color: isDark ? '#9CA3AF' : '#6B7280' },
                    ]}
                    numberOfLines={1}
                  >
                    {activeJob.location.address || 'Ward 4, Dindigul'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.metaRow,
                    { borderBottomColor: isDark ? '#2D3139' : '#F3F4F6' },
                  ]}
                >
                  <View style={styles.metaTimeBox}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={isDark ? '#9CA3AF' : '#6B7280'}
                    />
                    <Text
                      style={[
                        styles.metaTimeText,
                        { color: isDark ? '#9CA3AF' : '#6B7280' },
                      ]}
                    >
                      Today, 09:10 AM
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.distanceText,
                      { color: isDark ? '#FFFFFF' : '#101114' },
                    ]}
                  >
                    3.8 km
                  </Text>
                </View>

                <View
                  style={[
                    styles.viewDetailsBtn,
                    {
                      backgroundColor: isDark ? '#222328' : '#F3F4F6',
                      borderColor: isDark ? '#2D3139' : '#E5E7EB',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.viewDetailsText,
                      { color: isDark ? '#FFFFFF' : '#101114' },
                    ]}
                  >
                    View Details  ›
                  </Text>
                </View>
              </Pressable>
            </View>
          )}

          {/* 8. Incoming Job Request (if any pending) */}
          {newRequest && (
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeaderRow}>
                <Text
                  style={[
                    styles.sectionHeading,
                    { color: isDark ? '#FFFFFF' : '#101114' },
                  ]}
                >
                  Incoming Request ({incomingRequests.length})
                </Text>
                <Pressable onPress={() => router.push('/(mechanic)/(tabs)/requests')}>
                  <Text style={styles.viewAllText}>View All ›</Text>
                </Pressable>
              </View>

              <View
                style={[
                  styles.jobCardWhite,
                  {
                    backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                    borderColor: isDark ? '#2D3139' : '#E5E7EB',
                    borderWidth: isDark ? 1 : 0,
                  },
                ]}
              >
                <View style={styles.jobTopRow}>
                  <Image
                    source={getServiceThumb(newRequest.category)}
                    style={styles.serviceThumbImg}
                    resizeMode="cover"
                  />
                  <View style={styles.jobHeaderCol}>
                    <Text
                      style={[
                        styles.jobTitleText,
                        { color: isDark ? '#FFFFFF' : '#101114' },
                      ]}
                      numberOfLines={1}
                    >
                      {newRequest.categoryName || 'Battery Jumpstart'}
                    </Text>
                    <Text
                      style={[
                        styles.jobIdText,
                        { color: isDark ? '#9CA3AF' : '#6B7280' },
                      ]}
                    >
                      #MF{newRequest.id.replace(/[^0-9]/g, '').slice(-5) || '10254'}
                    </Text>
                  </View>
                  <View style={styles.incomingPillBadge}>
                    <Text style={styles.incomingPillText}>▷ Incoming</Text>
                  </View>
                </View>

                <View style={styles.locationRow}>
                  <Ionicons
                    name="location-outline"
                    size={15}
                    color={isDark ? '#9CA3AF' : '#6B7280'}
                  />
                  <Text
                    style={[
                      styles.locationText,
                      { color: isDark ? '#9CA3AF' : '#6B7280' },
                    ]}
                    numberOfLines={1}
                  >
                    {newRequest.location.address || 'SV Road, Near Bus Stand, Dindigul'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.metaRow,
                    { borderBottomColor: isDark ? '#2D3139' : '#F3F4F6' },
                  ]}
                >
                  <View style={styles.metaTimeBox}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={isDark ? '#9CA3AF' : '#6B7280'}
                    />
                    <Text
                      style={[
                        styles.metaTimeText,
                        { color: isDark ? '#9CA3AF' : '#6B7280' },
                      ]}
                    >
                      Today, 10:24 AM
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.distanceText,
                      { color: isDark ? '#FFFFFF' : '#101114' },
                    ]}
                  >
                    2.4 km
                  </Text>
                </View>

                <View style={styles.incomingActionsRow}>
                  <Pressable
                    style={[
                      styles.declineBtn,
                      {
                        backgroundColor: isDark ? '#222328' : '#F3F4F6',
                        borderColor: isDark ? '#2D3139' : '#E5E7EB',
                      },
                    ]}
                    onPress={() => handleDecline(newRequest.id)}
                    hitSlop={4}
                  >
                    <Text
                      style={[
                        styles.declineBtnText,
                        { color: isDark ? '#FFFFFF' : '#101114' },
                      ]}
                    >
                      Decline
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.acceptBtn}
                    onPress={() => handleAccept(newRequest.id)}
                    hitSlop={4}
                  >
                    <Text style={styles.acceptBtnText}>✓ Accept Job</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  container: {
    width: '100%',
  },
  // 1. Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingTop: 4,
  },
  mechfindLogo: {
    width: 140,
    height: 38,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  yellowNotificationDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FFC400',
  },
  profileAvatarBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 2. Welcome
  welcomeSection: {
    marginBottom: SPACING.md,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
  // 3. Workshop Availability Card
  workshopCard: {
    borderRadius: 16,
    marginBottom: SPACING.md,
    borderRightWidth: 5,
    borderRightColor: '#FFC400',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  workshopCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  workshopGearBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  workshopInfoCol: {
    flex: 1,
    minWidth: 0,
  },
  workshopTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  workshopPartnerName: {
    fontSize: 15.5,
    fontWeight: '700',
    flexShrink: 1,
  },
  workshopStatusText: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  switchControl: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  // 4. Statistics Row
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconWrap: {
    marginBottom: 6,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  // 5. Live Dispatches Hero Card
  dispatchHeroCard: {
    backgroundColor: '#1A1B1F',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2D3139',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: SPACING.md,
    minHeight: 180,
  },
  yellowCornerPennant: {
    position: 'absolute',
    top: 0,
    right: 28,
    width: 22,
    alignItems: 'center',
    zIndex: 2,
  },
  pennantBody: {
    width: 22,
    height: 24,
    backgroundColor: '#FFC400',
  },
  pennantPoint: {
    width: 0,
    height: 0,
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFC400',
  },
  dispatchContentCol: {
    flex: 1.25,
    paddingRight: 6,
    zIndex: 1,
  },
  dispatchBadgeRow: {
    marginBottom: 8,
  },
  dispatchBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFC400',
    letterSpacing: 1,
  },
  dispatchHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 8,
  },
  dispatchHeadingHighlight: {
    color: '#FFC400',
  },
  dispatchDescription: {
    fontSize: 11.5,
    color: '#9CA3AF',
    lineHeight: 16,
  },
  mechanicHeroImg: {
    width: 130,
    height: 180,
    position: 'absolute',
    right: -4,
    bottom: -10,
    zIndex: 0,
  },
  // 6. Quick Action Cards
  quickActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.lg,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 14,
  },
  // Section Headers
  sectionWrap: {
    marginBottom: SPACING.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFC400',
  },
  // Job Card
  jobCardWhite: {
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  jobTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  serviceThumbImg: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
  },
  jobHeaderCol: {
    flex: 1,
    minWidth: 0,
  },
  jobTitleText: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  jobIdText: {
    fontSize: 12,
    fontWeight: '500',
  },
  incomingPillBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  incomingPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  activePillBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 12.5,
    fontWeight: '500',
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  metaTimeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaTimeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  distanceText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  // Actions
  incomingActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  declineBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  acceptBtn: {
    flex: 1.3,
    height: 42,
    backgroundColor: '#FFC400',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#101114',
  },
  viewDetailsBtn: {
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
