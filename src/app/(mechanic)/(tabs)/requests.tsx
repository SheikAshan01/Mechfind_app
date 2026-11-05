import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../../theme/ThemeContext';
import { useMechanicStore } from '../../../stores/mechanicStore';
import { useResponsive } from '../../../hooks/useResponsive';
import { BreakdownRequest } from '../../../types/requests';
import { SPACING } from '../../../theme/spacing';

type RequestTab = 'all' | 'incoming' | 'active' | 'completed';

export default function MechanicRequestsScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme } = useTheme();
  const { horizontalPadding, isTablet, isDesktop } = useResponsive();
  const { incomingRequests, activeJob, completedJobs, acceptRequest, rejectRequest } =
    useMechanicStore();

  const [activeTab, setActiveTab] = useState<RequestTab>('all');

  const allJobs: BreakdownRequest[] = [
    ...incomingRequests,
    ...(activeJob ? [activeJob] : []),
    ...completedJobs,
  ];

  const filteredJobs = allJobs.filter((job) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'incoming') return job.status === 'submitted';
    if (activeTab === 'active')
      return (
        job.status !== 'submitted' &&
        job.status !== 'completed' &&
        job.status !== 'cancelled'
      );
    if (activeTab === 'completed') return job.status === 'completed';
    return true;
  });

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

  const getFormattedTime = (item: BreakdownRequest, index: number) => {
    if (item.status === 'submitted') {
      return index === 0 ? 'Today, 10:24 AM' : 'Today, 10:15 AM';
    }
    if (item.status === 'completed') {
      if (item.completedAt && !item.completedAt.includes('2026-11')) {
        const d = new Date(item.completedAt);
        return `${d.getDate()} Oct, 02:10 PM`;
      }
      return index === 0 ? '12 Nov, 04:30 PM' : '28 Oct, 02:10 PM';
    }
    return 'Today, 09:10 AM';
  };

  const getDistanceText = (item: BreakdownRequest, index: number) => {
    if (item.status === 'submitted') {
      return index === 0 ? '2.4 km' : '1.8 km';
    }
    if (item.status === 'completed') {
      return index === 0 ? '5.1 km' : index === 1 ? '4.2 km' : '6.0 km';
    }
    return '3.8 km';
  };

  const tabs: { key: RequestTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: allJobs.length },
    { key: 'incoming', label: 'Incoming', count: incomingRequests.length },
    { key: 'active', label: 'Active', count: activeJob ? 1 : 0 },
    { key: 'completed', label: 'Completed', count: completedJobs.length },
  ];

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

  const handleViewDetails = (requestId: string) => {
    router.push({
      pathname: '/(mechanic)/job-details/[id]',
      params: { id: requestId },
    });
  };

  return (
    <View style={[styles.screen, { backgroundColor: isDark ? '#101114' : '#F1F2F4' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View
        style={[
          styles.headerContainer,
          {
            paddingTop: insets.top + SPACING.sm,
            paddingHorizontal: horizontalPadding,
            backgroundColor: isDark ? '#101114' : '#F1F2F4',
          },
        ]}
      >
        <View style={styles.headerTopRow}>
          <View style={styles.headerTitlesCol}>
            <Text
              style={[
                styles.pageTitle,
                { color: isDark ? '#FFFFFF' : '#101114' },
              ]}
            >
              Assigned Jobs
            </Text>
            <Text
              style={[
                styles.pageSubtitle,
                { color: isDark ? '#9CA3AF' : '#6B7280' },
              ]}
            >
              Manage and track your service requests
            </Text>
          </View>

          <View style={styles.headerRightActions}>
            {/* Theme Toggle */}
            <Pressable
              style={[
                styles.iconCircleBtn,
                {
                  backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                  borderColor: isDark ? '#2D3139' : '#E5E7EB',
                },
              ]}
              onPress={toggleTheme}
              hitSlop={8}
              accessibilityLabel="Toggle Theme"
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

        {/* Filter Tabs Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillsScroll}
          style={styles.filterScrollView}
        >
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[
                  styles.filterPill,
                  isSelected
                    ? styles.filterPillActive
                    : [
                        styles.filterPillInactive,
                        {
                          backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                          borderColor: isDark ? '#2D3139' : '#E5E7EB',
                        },
                      ],
                ]}
                hitSlop={4}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isSelected
                      ? styles.filterPillTextActive
                      : [
                          styles.filterPillTextInactive,
                          { color: isDark ? '#FFFFFF' : '#101114' },
                        ],
                  ]}
                >
                  {tab.label} ({tab.count})
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Jobs FlatList */}
      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingHorizontal: horizontalPadding,
            paddingBottom: insets.bottom + 90,
          },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="clipboard-outline"
              size={48}
              color={isDark ? '#4B5563' : '#9CA3AF'}
            />
            <Text
              style={[
                styles.emptyTitle,
                { color: isDark ? '#FFFFFF' : '#101114' },
              ]}
            >
              No Jobs Found
            </Text>
            <Text
              style={[
                styles.emptySubtitle,
                { color: isDark ? '#9CA3AF' : '#6B7280' },
              ]}
            >
              No service requests match the selected filter at this moment.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const isIncoming = item.status === 'submitted';
          const isActive =
            item.status !== 'submitted' &&
            item.status !== 'completed' &&
            item.status !== 'cancelled';
          const isCompleted = item.status === 'completed';

          const formattedId =
            '#MF' + (item.id.replace(/[^0-9]/g, '').slice(-5) || '10254');
          const timeText = getFormattedTime(item, index);
          const distText = getDistanceText(item, index);

          return (
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
              {/* Top Row: Thumbnail + Title/ID + Status Badge */}
              <View style={styles.jobTopRow}>
                <Image
                  source={getServiceThumb(item.category)}
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
                    {item.categoryName || 'Breakdown Service'}
                  </Text>
                  <Text
                    style={[
                      styles.jobIdText,
                      { color: isDark ? '#9CA3AF' : '#6B7280' },
                    ]}
                  >
                    {formattedId}
                  </Text>
                </View>

                {isIncoming && (
                  <View style={styles.incomingPillBadge}>
                    <Text style={styles.incomingPillText}>▷ Incoming</Text>
                  </View>
                )}

                {isActive && (
                  <View style={styles.activePillBadge}>
                    <Text style={styles.activePillText}>▷ Active</Text>
                  </View>
                )}

                {isCompleted && (
                  <View
                    style={[
                      styles.completedPillBadge,
                      {
                        backgroundColor: isDark ? '#2A2B30' : '#F3F4F6',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.completedPillText,
                        { color: isDark ? '#C7C9CE' : '#4B5563' },
                      ]}
                    >
                      ✓ Completed
                    </Text>
                  </View>
                )}
              </View>

              {/* Location Row */}
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
                  {item.location.address || 'Dindigul Central'}
                </Text>
              </View>

              {/* Meta Row: Time & Distance */}
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
                    {timeText}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.distanceText,
                    { color: isDark ? '#FFFFFF' : '#101114' },
                  ]}
                >
                  {distText}
                </Text>
              </View>

              {/* Actions */}
              {isIncoming ? (
                <View style={styles.incomingActionsRow}>
                  <Pressable
                    style={[
                      styles.declineBtn,
                      {
                        backgroundColor: isDark ? '#222328' : '#F3F4F6',
                        borderColor: isDark ? '#2D3139' : '#E5E7EB',
                      },
                    ]}
                    onPress={() => handleDecline(item.id)}
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
                    onPress={() => handleAccept(item.id)}
                    hitSlop={4}
                  >
                    <Text style={styles.acceptBtnText}>✓ Accept Job</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={[
                    styles.viewDetailsBtn,
                    {
                      backgroundColor: isDark ? '#222328' : '#F3F4F6',
                      borderColor: isDark ? '#2D3139' : '#E5E7EB',
                    },
                  ]}
                  onPress={() => handleViewDetails(item.id)}
                  hitSlop={4}
                >
                  <Text
                    style={[
                      styles.viewDetailsText,
                      { color: isDark ? '#FFFFFF' : '#101114' },
                    ]}
                  >
                    View Details  ›
                  </Text>
                </Pressable>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerContainer: {
    paddingBottom: SPACING.sm,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  headerTitlesCol: {
    flex: 1,
    paddingRight: 12,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 13,
    fontWeight: '400',
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
  // Filter Pills
  filterScrollView: {
    marginBottom: 4,
  },
  filterPillsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: '#FFC400',
  },
  filterPillInactive: {
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 13,
  },
  filterPillTextActive: {
    color: '#101114',
    fontWeight: '700',
  },
  filterPillTextInactive: {
    fontWeight: '600',
  },
  // List Content
  listContent: {
    paddingTop: SPACING.sm,
  },
  jobCardWhite: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
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
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
  },
  jobHeaderCol: {
    flex: 1,
    minWidth: 0,
  },
  jobTitleText: {
    fontSize: 15.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  jobIdText: {
    fontSize: 12,
    fontWeight: '500',
  },
  incomingPillBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  incomingPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  activePillBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  completedPillBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  completedPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  metaTimeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaTimeText: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  distanceText: {
    fontSize: 13,
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
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '700',
  },
  // Empty State
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 280,
  },
});
