import React, { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../../theme/ThemeContext';
import { WebFooter } from '../../../components/navigation/WebFooter';
import { useCustomerStore } from '../../../stores/customerStore';
import { BreakdownRequest } from '../../../types/requests';
import { useResponsive } from '../../../hooks/useResponsive';

const ACCENT_YELLOW = '#FFC400';

type FilterTab = 'all' | 'active' | 'completed' | 'cancelled';

export default function CustomerRequestsWeb() {
  const { isDark } = useTheme();
  const { width } = useResponsive();
  const isDesktop = width >= 1024;
  const isTablet = width >= 720 && width < 1024;

  const { requests } = useCustomerStore();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Statistics
  const activeCount = useMemo(
    () =>
      requests.filter(
        (r) => r.status !== 'completed' && r.status !== 'cancelled'
      ).length,
    [requests]
  );

  const completedCount = useMemo(
    () => requests.filter((r) => r.status === 'completed').length,
    [requests]
  );

  const cancelledCount = useMemo(
    () => requests.filter((r) => r.status === 'cancelled').length,
    [requests]
  );

  // Filtered requests
  const filteredRequests = useMemo(() => {
    let list = requests.filter((r) => {
      if (activeTab === 'all') return true;
      if (activeTab === 'active')
        return r.status !== 'completed' && r.status !== 'cancelled';
      if (activeTab === 'completed') return r.status === 'completed';
      if (activeTab === 'cancelled') return r.status === 'cancelled';
      return true;
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          (r.categoryName && r.categoryName.toLowerCase().includes(q)) ||
          (r.location.address && r.location.address.toLowerCase().includes(q)) ||
          (r.mechanic?.shopName && r.mechanic.shopName.toLowerCase().includes(q))
      );
    }

    return list;
  }, [requests, activeTab, searchQuery]);

  // Thumbnail selector
  const getThumbnail = (category?: string) => {
    const cat = (category || '').toLowerCase();
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

  const formatBookingDate = (dateStr?: string) => {
    if (!dateStr) return '2 Nov, 10:10 PM';
    try {
      const d = new Date(dateStr);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[d.getMonth()];
      const day = d.getDate();
      let hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${day} ${month}, ${hours}:${minutes} ${ampm}`;
    } catch {
      return '2 Nov, 10:10 PM';
    }
  };

  const formatBookingId = (id: string) => {
    if (id.startsWith('#')) return id;
    const digits = id.replace(/\D/g, '');
    if (digits.length > 0) {
      return `#MF${digits.padEnd(5, '0').slice(-5)}`;
    }
    return `#MF${id.slice(-5).toUpperCase()}`;
  };

  const handleBookingClick = (booking: BreakdownRequest) => {
    router.push({
      pathname: '/(customer)/live-tracking/[id]',
      params: { id: booking.id },
    });
  };

  return (
    <View style={[styles.pageRoot, { backgroundColor: isDark ? '#101114' : '#F8F9FA' }]}>
      {/* 1. Scrollable Body in Natural Document Flow (Navbar provided by tabs _layout) */}
      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContainer}>
          {/* ========================================================= */}
          {/* SECTION A: BOOKINGS HERO                                  */}
          {/* ========================================================= */}
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: isDark ? '#16171B' : '#101114',
                borderColor: isDark ? '#2D3139' : '#1F2024',
              },
            ]}
          >
            <View style={styles.heroRow}>
              {/* Left Column: Label, Heading, Description, Stats */}
              <View style={styles.heroLeftCol}>
                <View style={styles.heroLabelRow}>
                  <Text style={styles.heroLabelText}>MY BOOKINGS</Text>
                  <View style={styles.heroLabelBar} />
                </View>

                <Text style={styles.heroHeadline}>My Bookings</Text>

                <Text style={styles.heroSubtitle}>
                  Track and manage your service requests, all in one place.
                </Text>

                {/* 3 Summary Statistic Cards */}
                <View style={styles.statsRow}>
                  {/* Stat 1: Total Bookings */}
                  <View style={styles.statGlassCard}>
                    <View style={styles.statIconBox}>
                      <Ionicons name="calendar-outline" size={17} color={ACCENT_YELLOW} />
                    </View>
                    <View>
                      <Text style={styles.statValueText}>{requests.length}</Text>
                      <Text style={styles.statLabelText}>Total Bookings</Text>
                    </View>
                  </View>

                  {/* Stat 2: Active */}
                  <View style={styles.statGlassCard}>
                    <View style={styles.statIconBox}>
                      <Ionicons name="time-outline" size={17} color={ACCENT_YELLOW} />
                    </View>
                    <View>
                      <Text style={styles.statValueText}>{activeCount}</Text>
                      <Text style={styles.statLabelText}>Active</Text>
                    </View>
                  </View>

                  {/* Stat 3: Completed */}
                  <View style={styles.statGlassCard}>
                    <View style={styles.statIconBox}>
                      <Ionicons name="checkmark-circle-outline" size={17} color={ACCENT_YELLOW} />
                    </View>
                    <View>
                      <Text style={styles.statValueText}>{completedCount}</Text>
                      <Text style={styles.statLabelText}>Completed</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Right Column: Hero Visual Graphic with Yellow Diagonal Slash */}
              {isDesktop && (
                <View style={styles.heroRightCol}>
                  <View style={styles.heroImageWrapper}>
                    <Image
                      source={require('../../../../assets/images/auth-sports-car.jpg')}
                      style={styles.heroCarImage}
                      resizeMode="cover"
                      accessibilityLabel="MECHFIND Roadside Service"
                    />
                    {/* Corner Yellow Diagonal Slash Accent */}
                    <View pointerEvents="none" style={styles.heroDiagonalAccent}>
                      <Svg width={200} height={200} viewBox="0 0 200 200">
                        <Path d="M80 -30 L230 120 L200 150 L50 0 Z" fill={ACCENT_YELLOW} />
                      </Svg>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* ========================================================= */}
          {/* SECTION B: FILTER TABS & SEARCH TOOLBAR                   */}
          {/* ========================================================= */}
          <View style={[styles.toolbarRow, !isDesktop && styles.toolbarRowMobile]}>
            {/* Filter Pills */}
            <View style={styles.filterPillsGroup}>
              {/* All */}
              <Pressable
                onPress={() => setActiveTab('all')}
                style={[
                  styles.filterPill,
                  activeTab === 'all'
                    ? styles.filterPillActiveYellow
                    : isDark
                    ? styles.filterPillInactiveDark
                    : styles.filterPillInactiveLight,
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    {
                      color: activeTab === 'all' ? '#101114' : isDark ? '#E5E7EB' : '#374151',
                      fontWeight: activeTab === 'all' ? '800' : '600',
                    },
                  ]}
                >
                  All ({requests.length})
                </Text>
              </Pressable>

              {/* Active */}
              <Pressable
                onPress={() => setActiveTab('active')}
                style={[
                  styles.filterPill,
                  activeTab === 'active'
                    ? styles.filterPillActiveYellow
                    : isDark
                    ? styles.filterPillInactiveDark
                    : styles.filterPillInactiveLight,
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    {
                      color: activeTab === 'active' ? '#101114' : isDark ? '#E5E7EB' : '#374151',
                      fontWeight: activeTab === 'active' ? '800' : '600',
                    },
                  ]}
                >
                  Active ({activeCount})
                </Text>
              </Pressable>

              {/* Completed */}
              <Pressable
                onPress={() => setActiveTab('completed')}
                style={[
                  styles.filterPill,
                  activeTab === 'completed'
                    ? styles.filterPillActiveYellow
                    : isDark
                    ? styles.filterPillInactiveDark
                    : styles.filterPillInactiveLight,
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    {
                      color: activeTab === 'completed' ? '#101114' : isDark ? '#E5E7EB' : '#374151',
                      fontWeight: activeTab === 'completed' ? '800' : '600',
                    },
                  ]}
                >
                  Completed ({completedCount})
                </Text>
              </Pressable>

              {/* Cancelled */}
              <Pressable
                onPress={() => setActiveTab('cancelled')}
                style={[
                  styles.filterPill,
                  activeTab === 'cancelled'
                    ? styles.filterPillActiveYellow
                    : isDark
                    ? styles.filterPillInactiveDark
                    : styles.filterPillInactiveLight,
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    {
                      color: activeTab === 'cancelled' ? '#101114' : isDark ? '#E5E7EB' : '#374151',
                      fontWeight: activeTab === 'cancelled' ? '800' : '600',
                    },
                  ]}
                >
                  Cancelled ({cancelledCount})
                </Text>
              </Pressable>
            </View>

            {/* Search Input Box */}
            <View
              style={[
                styles.searchBox,
                {
                  backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                  borderColor: isDark ? '#2D3139' : '#E5E7EB',
                },
              ]}
            >
              <Ionicons name="search" size={17} color="#9CA3AF" style={{ marginLeft: 6 }} />
              <TextInput
                style={[
                  styles.searchInput,
                  { color: isDark ? '#FFFFFF' : '#101114' },
                ]}
                placeholder="Search booking (e.g. MF10100)"
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                </Pressable>
              )}
            </View>
          </View>

          {/* ========================================================= */}
          {/* SECTION C: BOOKINGS CARDS STACK                           */}
          {/* ========================================================= */}
          {filteredRequests.length === 0 ? (
            /* Empty State */
            <View
              style={[
                styles.emptyCard,
                {
                  backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                  borderColor: isDark ? '#2D3139' : '#E5E7EB',
                },
              ]}
            >
              <Ionicons name="calendar-outline" size={40} color="#9CA3AF" />
              <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                No Bookings Yet
              </Text>
              <Text style={styles.emptySubtitle}>
                Your vehicle service bookings will appear here once you make your first request.
              </Text>
              <Pressable
                onPress={() => router.push('/(customer)/nearby-mechanics')}
                style={styles.emptyCtaBtn}
              >
                <Text style={styles.emptyCtaBtnText}>Find a Mechanic</Text>
              </Pressable>
            </View>
          ) : (
            /* Booking Cards Stack */
            <View style={styles.cardsStack}>
              {filteredRequests.map((item) => {
                const isActive = item.status !== 'completed' && item.status !== 'cancelled';
                const isCompleted = item.status === 'completed';
                const isCancelled = item.status === 'cancelled';
                const thumbnail = getThumbnail(item.categoryName || item.category);

                return (
                  <Pressable
                    key={item.id}
                    onPress={() => handleBookingClick(item)}
                    style={({ pressed }) => [
                      styles.bookingCard,
                      {
                        backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                        borderColor: isActive
                          ? ACCENT_YELLOW
                          : isDark
                          ? '#2D3139'
                          : '#EAECEF',
                        borderWidth: isActive ? 1.5 : 1,
                        opacity: pressed ? 0.94 : 1,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Booking for ${item.categoryName || 'Service'}`}
                  >
                    <View style={styles.cardInnerRow}>
                      {/* Left: Service Image */}
                      <Image
                        source={thumbnail}
                        style={styles.serviceThumbnail}
                        resizeMode="contain"
                      />

                      {/* Center: Details */}
                      <View style={styles.cardDetailsCol}>
                        {/* Service Title */}
                        <Text
                          style={[
                            styles.serviceTitleText,
                            { color: isDark ? '#FFFFFF' : '#101114' },
                          ]}
                          numberOfLines={1}
                        >
                          {item.categoryName || 'Battery Jumpstart'}
                        </Text>

                        {/* Location */}
                        <View style={styles.locationRow}>
                          <Ionicons name="location" size={13} color="#9CA3AF" />
                          <Text style={styles.locationText} numberOfLines={1}>
                            {item.location.address || 'SV Road, Near Bandra Station West'}
                          </Text>
                        </View>

                        {/* Status Badge Pill */}
                        <View style={styles.statusPillRow}>
                          {isActive && (
                            <View style={styles.statusPillActive}>
                              <Ionicons name="car" size={12} color="#B45309" />
                              <Text style={styles.statusPillActiveText}>On the Way</Text>
                            </View>
                          )}
                          {isCompleted && (
                            <View style={styles.statusPillCompleted}>
                              <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
                              <Text style={styles.statusPillCompletedText}>Completed</Text>
                            </View>
                          )}
                          {isCancelled && (
                            <View style={styles.statusPillCancelled}>
                              <Ionicons name="close-circle" size={12} color="#DC2626" />
                              <Text style={styles.statusPillCancelledText}>Cancelled</Text>
                            </View>
                          )}
                        </View>

                        {/* Meta: Date & Booking ID */}
                        <View style={styles.metaRow}>
                          <Ionicons name="calendar-outline" size={13} color="#9CA3AF" />
                          <Text style={styles.metaDateText}>
                            {formatBookingDate(item.createdAt)}
                          </Text>
                          <Text style={styles.metaDivider}>|</Text>
                          <Text
                            style={[
                              styles.metaBookingIdText,
                              { color: isDark ? '#FFFFFF' : '#101114' },
                            ]}
                          >
                            {formatBookingId(item.id)}
                          </Text>
                        </View>
                      </View>

                      {/* Right: Chevron Arrow */}
                      <Ionicons
                        name="chevron-forward"
                        size={22}
                        color={isDark ? '#FFFFFF' : '#101114'}
                      />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* ========================================================= */}
          {/* SECTION D: SUPPORT BANNER                                 */}
          {/* ========================================================= */}
          <View
            style={[
              styles.supportBanner,
              {
                backgroundColor: isDark ? '#221E12' : '#FFFBEB',
                borderColor: isDark ? '#4D3F00' : '#FDE68A',
              },
            ]}
          >
            <View style={styles.supportLeftGroup}>
              <View style={styles.supportIconCircle}>
                <Ionicons name="information" size={18} color="#101114" />
              </View>
              <View>
                <Text
                  style={[
                    styles.supportTitleText,
                    { color: isDark ? '#FFFFFF' : '#101114' },
                  ]}
                >
                  Need help with a booking?
                </Text>
                <Text style={styles.supportDescText}>
                  Contact our support team for any updates or assistance.
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => router.push('/(customer)/contact')}
              style={styles.supportContactBtn}
              accessibilityRole="button"
            >
              <Ionicons name="headset" size={15} color="#FFFFFF" />
              <Text style={styles.supportContactBtnText}>Contact Support</Text>
            </Pressable>
          </View>
        </View>

        {/* 3. Website Footer in Natural Flow (No Overlap) */}
        <WebFooter />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageRoot: {
    flex: 1,
    minHeight: '100%',
  },
  pageScroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainContainer: {
    maxWidth: 1360,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 48,
    gap: 20,
  },

  /* SECTION A: HERO */
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 3,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 32,
  },
  heroLeftCol: {
    flex: 1.3,
    minWidth: 320,
  },
  heroLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  heroLabelText: {
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: ACCENT_YELLOW,
  },
  heroLabelBar: {
    width: 28,
    height: 2,
    backgroundColor: ACCENT_YELLOW,
    borderRadius: 1,
  },
  heroHeadline: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#9CA3AF',
    marginBottom: 24,
    maxWidth: 540,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  statGlassCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    minWidth: 140,
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 196, 0, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValueText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  statLabelText: {
    fontSize: 11.5,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  heroRightCol: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  heroImageWrapper: {
    width: 380,
    height: 210,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1C1D21',
  },
  heroCarImage: {
    width: '100%',
    height: '100%',
  },
  heroDiagonalAccent: {
    position: 'absolute',
    top: -40,
    right: -40,
  },

  /* SECTION B: TOOLBAR */
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  toolbarRowMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  filterPillsGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillActiveYellow: {
    backgroundColor: ACCENT_YELLOW,
    borderColor: ACCENT_YELLOW,
  },
  filterPillInactiveLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  filterPillInactiveDark: {
    backgroundColor: '#1A1B1F',
    borderColor: '#2D3139',
  },
  filterPillText: {
    fontSize: 13,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 6,
    minWidth: 280,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    paddingVertical: 0,
  },

  /* SECTION C: CARDS STACK */
  cardsStack: {
    gap: 14,
  },
  bookingCard: {
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  serviceThumbnail: {
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
  },
  cardDetailsCol: {
    flex: 1,
    minWidth: 240,
  },
  serviceTitleText: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 13,
    color: '#6B7280',
  },
  statusPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusPillActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusPillActiveText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#B45309',
  },
  statusPillCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusPillCompletedText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#16A34A',
  },
  statusPillCancelled: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusPillCancelledText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaDateText: {
    fontSize: 12.5,
    color: '#6B7280',
    fontWeight: '500',
  },
  metaDivider: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  metaBookingIdText: {
    fontSize: 12.5,
    fontWeight: '700',
  },

  /* EMPTY STATE */
  emptyCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13.5,
    color: '#6B7280',
    textAlign: 'center',
  },
  emptyCtaBtn: {
    backgroundColor: ACCENT_YELLOW,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  emptyCtaBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#101114',
  },

  /* SECTION D: SUPPORT BANNER */
  supportBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 16,
    flexWrap: 'wrap',
  },
  supportLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 280,
  },
  supportIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFC400',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportTitleText: {
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  supportDescText: {
    fontSize: 12.5,
    color: '#6B7280',
  },
  supportContactBtn: {
    backgroundColor: '#101114',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    height: 42,
    borderRadius: 12,
  },
  supportContactBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

