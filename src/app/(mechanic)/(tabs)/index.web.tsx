import React, { useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuthStore } from '../../../stores/authStore';
import { useMechanicStore } from '../../../stores/mechanicStore';
import { MechanicUser } from '../../../types/auth';
import { BreakdownRequest } from '../../../types/requests';
import { useResponsive } from '../../../hooks/useResponsive';

const ACCENT_YELLOW = '#FFC400';

export default function MechanicWebDashboard() {
  const { isDark } = useTheme();
  const { width } = useResponsive();

  const isDesktop = width >= 1180;

  const user = useAuthStore((state) => state.user) as MechanicUser | null;

  const {
    isOnline,
    toggleOnlineStatus,
    activeJob,
    incomingRequests,
    completedJobs,
    acceptRequest,
    rejectRequest,
    earnings,
  } = useMechanicStore();

  const [availabilityNotice, setAvailabilityNotice] = useState<string | null>(null);

  // Statistics computations
  const totalJobsCount = (completedJobs?.length || 0) + (activeJob ? 1 : 0) + (incomingRequests?.length || 0);
  const activeJobsCount = (activeJob ? 1 : 0) + (incomingRequests?.length || 0);
  const completedJobsCount = completedJobs?.length || 3;
  const weekEarnings = earnings?.week ?? 4850;

  const handleAccept = (requestId: string) => {
    acceptRequest(requestId);
  };

  const handleDecline = (requestId: string) => {
    rejectRequest(requestId);
  };

  const handleToggleOnline = () => {
    toggleOnlineStatus();
    setAvailabilityNotice(!isOnline ? 'You are now Online and accepting jobs' : 'You are now Offline');
    setTimeout(() => setAvailabilityNotice(null), 3000);
  };

  const formatJobId = (id: string) => {
    if (id.startsWith('MF')) return `#${id}`;
    if (id.startsWith('#')) return id;
    const digits = id.replace(/\D/g, '');
    if (digits.length > 0) {
      return `#MF${digits.padEnd(5, '0').slice(-5)}`;
    }
    return `#MF${id.slice(-5).toUpperCase()}`;
  };

  const getServiceThumbnail = (category?: string, categoryName?: string) => {
    const cat = `${category || ''} ${categoryName || ''}`.toLowerCase();
    if (cat.includes('battery')) {
      return require('../../../../assets/images/service-battery-thumb.png');
    }
    if (cat.includes('oil') || cat.includes('engine')) {
      return require('../../../../assets/images/thumb-oil-service.png');
    }
    if (cat.includes('tyre') || cat.includes('tire') || cat.includes('puncture')) {
      return require('../../../../assets/images/thumb-tyre-service.png');
    }
    return require('../../../../assets/images/thumb-general-service.png');
  };

  const workshopName = user?.shopName || 'Partner Workshop';
  const workshopLocation = user?.shopAddress || 'Dindigul West, Dindigul';

  return (
    <ScrollView
      style={[styles.bodyScrollView, { backgroundColor: isDark ? '#101114' : '#F5F6F8' }]}
      contentContainerStyle={styles.bodyScrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Toast Notification */}
      {availabilityNotice && (
        <View style={styles.toastNotice}>
          <Ionicons name="information-circle" size={18} color="#101114" style={{ marginRight: 8 }} />
          <Text style={styles.toastNoticeText}>{availabilityNotice}</Text>
        </View>
      )}

      <View style={[styles.mainLayoutGrid, isDesktop ? styles.gridDesktop : styles.gridStacked]}>
        {/* ========================================================= */}
        {/* LEFT / CENTER COLUMN: HERO + STATS + JOBS               */}
        {/* ========================================================= */}
        <View style={[styles.leftContentCol, isDesktop ? { flex: 7 } : { width: '100%' }]}>
          {/* 1. Welcome Banner Card */}
          <View style={styles.welcomeBannerCard}>
            <View style={styles.welcomeBannerTextWrap}>
              <Text style={styles.welcomeTitleLine1}>Welcome,</Text>
              <Text style={styles.welcomeTitleLine2}>
                Workshop Partner <Text style={{ color: '#FFFFFF' }}>👋</Text>
              </Text>
              <Text style={styles.welcomeBannerDesc}>
                Manage your jobs, earnings and workshop, all in one place.
              </Text>
            </View>

            {/* Right Hero Graphic with Yellow Diagonal Slashes */}
            <View style={styles.welcomeGraphicWrap}>
              <Svg
                style={StyleSheet.absoluteFill}
                viewBox="0 0 340 180"
                preserveAspectRatio="none"
              >
                <Path
                  d="M110 0 L155 0 L45 180 L0 180 Z"
                  fill={ACCENT_YELLOW}
                  opacity={0.92}
                />
                <Path
                  d="M170 0 L185 0 L105 180 L90 180 Z"
                  fill={ACCENT_YELLOW}
                  opacity={0.35}
                />
              </Svg>
              <Image
                source={require('../../../../assets/images/web-hero-mechanic.png')}
                style={styles.welcomeHeroImage}
                resizeMode="cover"
              />
            </View>
          </View>

          {/* 2. Four Dashboard Metric Cards */}
          <View style={styles.statsCardsRow}>
            {/* Total Jobs */}
            <View
              style={[
                styles.metricCard,
                {
                  backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                  borderColor: isDark ? '#23252B' : '#F1F2F4',
                },
              ]}
            >
              <View style={[styles.metricIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="briefcase-outline" size={20} color="#B45309" />
              </View>
              <View style={styles.metricTexts}>
                <Text
                  style={[
                    styles.metricValue,
                    { color: isDark ? '#FFFFFF' : '#101114' },
                  ]}
                >
                  {totalJobsCount}
                </Text>
                <Text style={styles.metricLabel}>Total Jobs</Text>
              </View>
            </View>

            {/* Active Jobs */}
            <View
              style={[
                styles.metricCard,
                {
                  backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                  borderColor: isDark ? '#23252B' : '#F1F2F4',
                },
              ]}
            >
              <View style={[styles.metricIconBox, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="play-outline" size={20} color="#1D4ED8" />
              </View>
              <View style={styles.metricTexts}>
                <Text
                  style={[
                    styles.metricValue,
                    { color: isDark ? '#FFFFFF' : '#101114' },
                  ]}
                >
                  {activeJobsCount}
                </Text>
                <Text style={styles.metricLabel}>Active Jobs</Text>
              </View>
            </View>

            {/* Completed */}
            <View
              style={[
                styles.metricCard,
                {
                  backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                  borderColor: isDark ? '#23252B' : '#F1F2F4',
                },
              ]}
            >
              <View style={[styles.metricIconBox, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="checkmark-outline" size={20} color="#15803D" />
              </View>
              <View style={styles.metricTexts}>
                <Text
                  style={[
                    styles.metricValue,
                    { color: isDark ? '#FFFFFF' : '#101114' },
                  ]}
                >
                  {completedJobsCount}
                </Text>
                <Text style={styles.metricLabel}>Completed</Text>
              </View>
            </View>

            {/* This Week Earnings */}
            <View
              style={[
                styles.metricCard,
                {
                  backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                  borderColor: isDark ? '#23252B' : '#F1F2F4',
                },
              ]}
            >
              <View style={[styles.metricIconBox, { backgroundColor: '#F3E8FF' }]}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#7E22CE' }}>
                  ₹
                </Text>
              </View>
              <View style={styles.metricTexts}>
                <Text
                  style={[
                    styles.metricValue,
                    { color: isDark ? '#FFFFFF' : '#101114' },
                  ]}
                >
                  ₹{weekEarnings.toLocaleString()}
                </Text>
                <Text style={styles.metricLabel}>This Week Earnings</Text>
              </View>
            </View>
          </View>

          {/* 3. Active Job Section */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleWithDash}>
                <View style={styles.sectionTitleDash} />
                <Text
                  style={[
                    styles.sectionTitleText,
                    { color: isDark ? '#FFFFFF' : '#101114' },
                  ]}
                >
                  Active Job
                </Text>
              </View>
              <Pressable
                onPress={() => router.push('/(mechanic)/(tabs)/requests' as any)}
                style={styles.viewAllBtn}
              >
                <Text style={styles.viewAllBtnText}>View All</Text>
                <Ionicons name="arrow-forward" size={14} color={ACCENT_YELLOW} />
              </Pressable>
            </View>

            {activeJob ? (
              <View
                style={[
                  styles.jobCardActive,
                  {
                    backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                    borderColor: isDark ? '#3D3310' : '#FDE047',
                  },
                ]}
              >
                <View style={styles.jobCardLeftThumb}>
                  <Image
                    source={getServiceThumbnail(activeJob.category, activeJob.categoryName)}
                    style={styles.jobCardThumbImage}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.jobCardDetails}>
                  <View style={styles.jobCardTopLine}>
                    <Text
                      style={[
                        styles.jobCardTitle,
                        { color: isDark ? '#FFFFFF' : '#101114' },
                      ]}
                    >
                      {activeJob.categoryName || 'Vehicle Service'}
                    </Text>
                    <View style={styles.activeStatusPill}>
                      <Ionicons name="play" size={10} color="#16A34A" style={{ marginRight: 4 }} />
                      <Text style={styles.activeStatusPillText}>Active</Text>
                    </View>
                  </View>

                  <Text style={styles.jobCardSubId}>{formatJobId(activeJob.id)}</Text>

                  <View style={styles.jobCardMetaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="location-outline" size={13} color="#9CA3AF" />
                      <Text style={styles.metaItemText} numberOfLines={1}>
                        {activeJob.location?.address || 'Ward 4, Dindigul'}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar-outline" size={13} color="#9CA3AF" />
                      <Text style={styles.metaItemText}>Today, 09:10 AM</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="navigate-outline" size={13} color="#9CA3AF" />
                      <Text style={styles.metaItemText}>3.8 km</Text>
                    </View>
                  </View>
                </View>

                <Pressable
                  onPress={() => router.push('/(mechanic)/(tabs)/requests' as any)}
                  style={styles.activeJobChevronBtn}
                >
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </Pressable>
              </View>
            ) : (
              <View
                style={[
                  styles.emptyActiveJobBox,
                  {
                    backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                    borderColor: isDark ? '#23252B' : '#E5E7EB',
                  },
                ]}
              >
                <Ionicons name="car-sport-outline" size={28} color="#9CA3AF" />
                <Text style={styles.emptyActiveText}>
                  No active job right now. Accept an incoming request below!
                </Text>
              </View>
            )}
          </View>

          {/* 4. Incoming Requests Section */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleWithDash}>
                <View style={styles.sectionTitleDash} />
                <Text
                  style={[
                    styles.sectionTitleText,
                    { color: isDark ? '#FFFFFF' : '#101114' },
                  ]}
                >
                  Incoming Requests ({incomingRequests?.length || 0})
                </Text>
              </View>
              <Pressable
                onPress={() => router.push('/(mechanic)/(tabs)/requests' as any)}
                style={styles.viewAllBtn}
              >
                <Text style={styles.viewAllBtnText}>View All</Text>
                <Ionicons name="arrow-forward" size={14} color={ACCENT_YELLOW} />
              </Pressable>
            </View>

            {incomingRequests && incomingRequests.length > 0 ? (
              <View style={styles.requestsStack}>
                {incomingRequests.map((req) => (
                  <View
                    key={req.id}
                    style={[
                      styles.requestCard,
                      {
                        backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                        borderColor: isDark ? '#23252B' : '#F1F2F4',
                      },
                    ]}
                  >
                    <View style={styles.jobCardLeftThumb}>
                      <Image
                        source={getServiceThumbnail(req.category, req.categoryName)}
                        style={styles.jobCardThumbImage}
                        resizeMode="contain"
                      />
                    </View>

                    <View style={styles.jobCardDetails}>
                      <View style={styles.jobCardTopLine}>
                        <Text
                          style={[
                            styles.jobCardTitle,
                            { color: isDark ? '#FFFFFF' : '#101114' },
                          ]}
                        >
                          {req.categoryName || 'Emergency Assistance'}
                        </Text>
                        <View style={styles.incomingStatusPill}>
                          <Ionicons name="play" size={10} color="#CA8A04" style={{ marginRight: 4 }} />
                          <Text style={styles.incomingStatusPillText}>Incoming</Text>
                        </View>
                      </View>

                      <Text style={styles.jobCardSubId}>{formatJobId(req.id)}</Text>

                      <View style={styles.jobCardMetaRow}>
                        <View style={styles.metaItem}>
                          <Ionicons name="location-outline" size={13} color="#9CA3AF" />
                          <Text style={styles.metaItemText} numberOfLines={1}>
                            {req.location?.address || 'SV Road, Dindigul'}
                          </Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Ionicons name="calendar-outline" size={13} color="#9CA3AF" />
                          <Text style={styles.metaItemText}>Today, 10:24 AM</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Ionicons name="navigate-outline" size={13} color="#9CA3AF" />
                          <Text style={styles.metaItemText}>2.4 km</Text>
                        </View>
                      </View>
                    </View>

                    {/* Action Buttons: Decline & Accept */}
                    <View style={styles.requestActionsCol}>
                      <Pressable
                        onPress={() => handleDecline(req.id)}
                        style={[
                          styles.declineBtn,
                          {
                            backgroundColor: isDark ? '#23252B' : '#F3F4F6',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.declineBtnText,
                            { color: isDark ? '#FFFFFF' : '#374151' },
                          ]}
                        >
                          Decline
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() => handleAccept(req.id)}
                        style={styles.acceptBtn}
                      >
                        <Ionicons name="checkmark" size={15} color="#101114" style={{ marginRight: 4 }} />
                        <Text style={styles.acceptBtnText}>Accept</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View
                style={[
                  styles.emptyActiveJobBox,
                  {
                    backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                    borderColor: isDark ? '#23252B' : '#E5E7EB',
                  },
                ]}
              >
                <Ionicons name="checkmark-done-circle-outline" size={28} color="#16A34A" />
                <Text style={styles.emptyActiveText}>
                  All dispatches addressed! You will be alerted when new emergency requests appear.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: WORKSHOP CARD + QUICK ACTIONS + NEED HELP   */}
        {/* ========================================================= */}
        <View style={[styles.rightWidgetsCol, isDesktop ? { flex: 4 } : { width: '100%' }]}>
          {/* 1. Workshop Profile Card with Online Toggle */}
          <View
            style={[
              styles.workshopWidgetCard,
              {
                backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                borderColor: isDark ? '#23252B' : '#F1F2F4',
              },
            ]}
          >
            <View style={styles.workshopWidgetHeaderRow}>
              <Image
                source={require('../../../../assets/images/workshop-gear-badge.png')}
                style={styles.workshopGearAvatar}
                resizeMode="contain"
              />
              <View style={styles.workshopWidgetInfo}>
                <View style={styles.shopNameWithBadge}>
                  <Text
                    style={[
                      styles.workshopWidgetName,
                      { color: isDark ? '#FFFFFF' : '#101114' },
                    ]}
                    numberOfLines={1}
                  >
                    {workshopName}
                  </Text>
                  <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                </View>
                <Text style={styles.workshopWidgetSub}>Verified Workshop</Text>
              </View>
            </View>

            <View style={styles.workshopLocationRow}>
              <Ionicons name="location-outline" size={15} color="#9CA3AF" />
              <Text style={styles.workshopLocationText} numberOfLines={1}>
                {workshopLocation}
              </Text>
            </View>

            <View
              style={[
                styles.availabilityToggleBox,
                {
                  backgroundColor: isDark ? '#1F2025' : '#F8FAFC',
                  borderColor: isDark ? '#2A2C34' : '#E2E8F0',
                },
              ]}
            >
              <View style={styles.availabilityLabelGroup}>
                <View
                  style={[
                    styles.onlineStatusDot,
                    { backgroundColor: isOnline ? '#16A34A' : '#DC2626' },
                  ]}
                />
                <Text
                  style={[
                    styles.availabilityLabelText,
                    { color: isDark ? '#FFFFFF' : '#101114' },
                  ]}
                >
                  {isOnline ? 'Available for New Jobs' : 'Offline (Not Accepting)'}
                </Text>
              </View>

              <Switch
                value={isOnline}
                onValueChange={handleToggleOnline}
                trackColor={{ false: '#9CA3AF', true: '#16A34A' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* 2. Quick Actions 2x2 Grid */}
          <View style={styles.quickActionsBlock}>
            <View style={styles.sectionTitleWithDash}>
              <View style={styles.sectionTitleDash} />
              <Text
                style={[
                  styles.sectionTitleText,
                  { color: isDark ? '#FFFFFF' : '#101114' },
                ]}
              >
                Quick Actions
              </Text>
            </View>

            <View style={styles.quickActionsGrid}>
              {/* Manage Services */}
              <Pressable
                onPress={() => router.push('/(mechanic)/(tabs)/services-pricing' as any)}
                style={[
                  styles.quickActionTile,
                  {
                    backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                    borderColor: isDark ? '#23252B' : '#F1F2F4',
                  },
                ]}
              >
                <View style={[styles.quickActionIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="construct-outline" size={20} color="#B45309" />
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
                onPress={handleToggleOnline}
                style={[
                  styles.quickActionTile,
                  {
                    backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                    borderColor: isDark ? '#23252B' : '#F1F2F4',
                  },
                ]}
              >
                <View style={[styles.quickActionIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="calendar-outline" size={20} color="#B45309" />
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
                onPress={() => router.push('/(mechanic)/(tabs)/earnings' as any)}
                style={[
                  styles.quickActionTile,
                  {
                    backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                    borderColor: isDark ? '#23252B' : '#F1F2F4',
                  },
                ]}
              >
                <View style={[styles.quickActionIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="bar-chart-outline" size={20} color="#B45309" />
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
                onPress={() => router.push('/(mechanic)/(tabs)/profile' as any)}
                style={[
                  styles.quickActionTile,
                  {
                    backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                    borderColor: isDark ? '#23252B' : '#F1F2F4',
                  },
                ]}
              >
                <View style={[styles.quickActionIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="business-outline" size={20} color="#B45309" />
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
          </View>

          {/* 3. Need Help? Card */}
          <Pressable
            onPress={() => router.push('/(customer)/contact')}
            style={[
              styles.needHelpCard,
              {
                backgroundColor: isDark ? '#16171B' : '#FFFBEB',
                borderColor: isDark ? '#3D3310' : '#FDE68A',
              },
            ]}
          >
            <View style={styles.needHelpIconBox}>
              <Ionicons name="headset" size={22} color="#B45309" />
            </View>
            <View style={styles.needHelpTextWrap}>
              <Text
                style={[
                  styles.needHelpTitle,
                  { color: isDark ? '#FFFFFF' : '#101114' },
                ]}
              >
                Need Help?
              </Text>
              <Text style={styles.needHelpSubtitle}>
                Contact our support team for any updates or assistance.
              </Text>
            </View>
            <View style={styles.needHelpArrowBtn}>
              <Ionicons name="chevron-forward" size={16} color="#101114" />
            </View>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bodyScrollView: {
    flex: 1,
  },
  bodyScrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  toastNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT_YELLOW,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  toastNoticeText: {
    color: '#101114',
    fontWeight: '700',
    fontSize: 13,
  },
  mainLayoutGrid: {
    width: '100%',
    gap: 24,
  },
  gridDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  gridStacked: {
    flexDirection: 'column',
  },
  leftContentCol: {
    gap: 24,
  },
  rightWidgetsCol: {
    gap: 24,
  },
  // 1. Welcome Banner Card
  welcomeBannerCard: {
    width: '100%',
    minHeight: 140,
    borderRadius: 18,
    backgroundColor: '#16171B',
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
  },
  welcomeBannerTextWrap: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    zIndex: 2,
  },
  welcomeTitleLine1: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  welcomeTitleLine2: {
    fontSize: 22,
    fontWeight: '900',
    color: ACCENT_YELLOW,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  welcomeBannerDesc: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
    maxWidth: 380,
  },
  welcomeGraphicWrap: {
    width: 280,
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  welcomeHeroImage: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 240,
    height: 160,
  },
  // 2. Metrics Row
  statsCardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  metricCard: {
    flex: 1,
    minWidth: 140,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metricIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricTexts: {
    flex: 1,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  metricLabel: {
    fontSize: 12,
    color: '#747B87',
    fontWeight: '500',
    marginTop: 2,
  },
  // Section Headers
  sectionBlock: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleWithDash: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitleDash: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: ACCENT_YELLOW,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '800',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: ACCENT_YELLOW,
  },
  // Active Job Card
  jobCardActive: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  jobCardLeftThumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  jobCardThumbImage: {
    width: '100%',
    height: '100%',
  },
  jobCardDetails: {
    flex: 1,
  },
  jobCardTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  jobCardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  jobCardSubId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#747B87',
    marginBottom: 6,
  },
  activeStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  activeStatusPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  jobCardMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaItemText: {
    fontSize: 12,
    color: '#747B87',
  },
  activeJobChevronBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyActiveJobBox: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyActiveText: {
    fontSize: 13,
    color: '#747B87',
    textAlign: 'center',
  },
  // Incoming Requests
  requestsStack: {
    gap: 12,
  },
  requestCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  incomingStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  incomingStatusPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  requestActionsCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  declineBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: ACCENT_YELLOW,
  },
  acceptBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#101114',
  },
  // Workshop Widget
  workshopWidgetCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    gap: 14,
  },
  workshopWidgetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  workshopGearAvatar: {
    width: 48,
    height: 48,
  },
  workshopWidgetInfo: {
    flex: 1,
  },
  shopNameWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  workshopWidgetName: {
    fontSize: 15,
    fontWeight: '800',
  },
  workshopWidgetSub: {
    fontSize: 12,
    color: '#747B87',
    marginTop: 2,
  },
  workshopLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  workshopLocationText: {
    fontSize: 12,
    color: '#747B87',
  },
  availabilityToggleBox: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  availabilityLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  onlineStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availabilityLabelText: {
    fontSize: 12,
    fontWeight: '700',
  },
  // Quick Actions Block
  quickActionsBlock: {
    gap: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionTile: {
    width: '47.5%',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  quickActionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
  },
  // Need Help Card
  needHelpCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  needHelpIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  needHelpTextWrap: {
    flex: 1,
  },
  needHelpTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  needHelpSubtitle: {
    fontSize: 11,
    color: '#747B87',
    lineHeight: 15,
  },
  needHelpArrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ACCENT_YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
