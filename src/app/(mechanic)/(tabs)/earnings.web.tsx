import React, { useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { useMechanicStore } from '../../../stores/mechanicStore';

const ACCENT_YELLOW = '#FFC400';

export default function MechanicWebEarningsScreen() {
  const { isDark } = useTheme();
  const earnings = useMechanicStore((state) => state.earnings);
  const completedJobs = useMechanicStore((state) => state.completedJobs);

  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month'>('week');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const totalEarnings = dateFilter === 'today' ? (earnings?.today ?? 1250) : dateFilter === 'month' ? (earnings?.total ?? 28400) : (earnings?.week ?? 4850);
  const totalJobsCount = dateFilter === 'today' ? 2 : dateFilter === 'month' ? 24 : 6;
  const completedCount = dateFilter === 'today' ? 1 : dateFilter === 'month' ? 19 : 3;
  const avgPerJob = totalJobsCount > 0 ? Math.round(totalEarnings / totalJobsCount) : 808;

  const barData = [
    { day: 'Mon', amount: 600, heightPercent: 30 },
    { day: 'Tue', amount: 900, heightPercent: 45 },
    { day: 'Wed', amount: 1200, heightPercent: 60 },
    { day: 'Thu', amount: 1650, heightPercent: 82.5 },
    { day: 'Fri', amount: 1100, heightPercent: 55 },
    { day: 'Sat', amount: 0, heightPercent: 0 },
    { day: 'Sun', amount: 400, heightPercent: 20 },
  ];

  const recentEarningsList = [
    {
      id: 'mf_10236',
      serviceName: 'Oil Change Service',
      jobId: '#MF10236',
      date: '28 Oct, 09:10 AM',
      amount: '₹699',
      thumb: require('../../../../assets/images/thumb-oil-service.png'),
    },
    {
      id: 'mf_10248',
      serviceName: 'Brake Assistance',
      jobId: '#MF10248',
      date: '27 Oct, 04:25 PM',
      amount: '₹399',
      thumb: require('../../../../assets/images/thumb-general-service.png'),
    },
    {
      id: 'mf_10240',
      serviceName: 'Battery Jumpstart',
      jobId: '#MF10240',
      date: '26 Oct, 11:30 AM',
      amount: '₹199',
      thumb: require('../../../../assets/images/service-battery-thumb.png'),
    },
  ];

  return (
    <ScrollView
      style={[styles.scrollRoot, { backgroundColor: isDark ? '#101114' : '#F5F6F8' }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header Row: Title & Subtitle + Date Dropdown */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.pageTitle, { color: isDark ? '#FFFFFF' : '#101114' }]}>
            Earnings
          </Text>
          <Text style={styles.pageSubtitle}>
            Track your income and payouts
          </Text>
        </View>

        {/* Date Filter Dropdown */}
        <View style={{ position: 'relative' }}>
          <Pressable
            onPress={() => setDropdownOpen(!dropdownOpen)}
            style={[
              styles.dateDropdownBtn,
              {
                backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                borderColor: isDark ? '#23252B' : '#E5E7EB',
              },
            ]}
          >
            <Text style={[styles.dateDropdownText, { color: isDark ? '#FFFFFF' : '#101114' }]}>
              {dateFilter === 'today' ? 'Today' : dateFilter === 'month' ? 'This Month' : 'This Week'}
            </Text>
            <Ionicons
              name={dropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={15}
              color={isDark ? '#9CA3AF' : '#64748B'}
            />
          </Pressable>

          {dropdownOpen && (
            <View
              style={[
                styles.dropdownFlyout,
                {
                  backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                  borderColor: isDark ? '#2B2C32' : '#E5E7EB',
                },
              ]}
            >
              <Pressable
                onPress={() => {
                  setDateFilter('today');
                  setDropdownOpen(false);
                }}
                style={styles.dropdownOption}
              >
                <Text style={[styles.dropdownOptionText, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                  Today
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setDateFilter('week');
                  setDropdownOpen(false);
                }}
                style={styles.dropdownOption}
              >
                <Text style={[styles.dropdownOptionText, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                  This Week
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setDateFilter('month');
                  setDropdownOpen(false);
                }}
                style={styles.dropdownOption}
              >
                <Text style={[styles.dropdownOptionText, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                  This Month
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {/* 2. Four Earnings Metrics Cards */}
      <View style={styles.metricsRow}>
        {/* Total Earnings */}
        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: isDark ? '#16171B' : '#FFFFFF',
              borderColor: isDark ? '#23252B' : '#F1F2F4',
            },
          ]}
        >
          <View style={[styles.metricIconWrap, { backgroundColor: '#FEF3C7' }]}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#B45309' }}>₹</Text>
          </View>
          <View style={styles.metricTexts}>
            <Text style={[styles.metricValue, { color: isDark ? '#FFFFFF' : '#101114' }]}>
              ₹{totalEarnings.toLocaleString()}
            </Text>
            <Text style={styles.metricLabel}>Total Earnings</Text>
          </View>
        </View>

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
          <View style={[styles.metricIconWrap, { backgroundColor: '#FFEDD5' }]}>
            <Ionicons name="briefcase-outline" size={18} color="#C2410C" />
          </View>
          <View style={styles.metricTexts}>
            <Text style={[styles.metricValue, { color: isDark ? '#FFFFFF' : '#101114' }]}>
              {totalJobsCount}
            </Text>
            <Text style={styles.metricLabel}>Total Jobs</Text>
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
          <View style={[styles.metricIconWrap, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="checkmark-outline" size={18} color="#15803D" />
          </View>
          <View style={styles.metricTexts}>
            <Text style={[styles.metricValue, { color: isDark ? '#FFFFFF' : '#101114' }]}>
              {completedCount}
            </Text>
            <Text style={styles.metricLabel}>Completed</Text>
          </View>
        </View>

        {/* Avg. per Job */}
        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: isDark ? '#16171B' : '#FFFFFF',
              borderColor: isDark ? '#23252B' : '#F1F2F4',
            },
          ]}
        >
          <View style={[styles.metricIconWrap, { backgroundColor: '#FEF9C3' }]}>
            <Ionicons name="wallet-outline" size={18} color="#A16207" />
          </View>
          <View style={styles.metricTexts}>
            <Text style={[styles.metricValue, { color: isDark ? '#FFFFFF' : '#101114' }]}>
              ₹{avgPerJob.toLocaleString()}
            </Text>
            <Text style={styles.metricLabel}>Avg. per Job</Text>
          </View>
        </View>
      </View>

      {/* 3. Earnings Overview Bar Chart */}
      <View
        style={[
          styles.chartCard,
          {
            backgroundColor: isDark ? '#16171B' : '#FFFFFF',
            borderColor: isDark ? '#23252B' : '#E5E7EB',
          },
        ]}
      >
        <Text style={[styles.chartCardTitle, { color: isDark ? '#FFFFFF' : '#101114' }]}>
          Earnings Overview
        </Text>

        <View style={styles.chartWrapper}>
          {/* Y Axis Labels */}
          <View style={styles.yAxisCol}>
            <Text style={styles.yAxisLabel}>₹2,000</Text>
            <Text style={styles.yAxisLabel}>₹1,500</Text>
            <Text style={styles.yAxisLabel}>₹1,000</Text>
            <Text style={styles.yAxisLabel}>₹500</Text>
            <Text style={styles.yAxisLabel}>₹0</Text>
          </View>

          {/* Chart Bars Area */}
          <View style={styles.barsArea}>
            {/* Horizontal Grid Lines */}
            <View style={[styles.gridLine, { top: '0%' }]} />
            <View style={[styles.gridLine, { top: '25%' }]} />
            <View style={[styles.gridLine, { top: '50%' }]} />
            <View style={[styles.gridLine, { top: '75%' }]} />
            <View style={[styles.gridLine, { top: '100%' }]} />

            {/* Bars Column */}
            <View style={styles.barsFlexRow}>
              {barData.map((item, idx) => {
                const isHovered = hoveredBar === idx;
                return (
                  <View
                    key={item.day}
                    style={styles.singleBarCol}
                    // Web hover handlers
                    onMouseEnter={() => setHoveredBar(idx)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Tooltip */}
                    {isHovered && (
                      <View style={styles.barTooltip}>
                        <Text style={styles.barTooltipText}>₹{item.amount}</Text>
                      </View>
                    )}

                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${item.heightPercent}%`,
                            backgroundColor: ACCENT_YELLOW,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.barXLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      {item.day}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </View>

      {/* 4. Recent Earnings Section */}
      <View style={styles.recentSection}>
        <View style={styles.recentHeaderRow}>
          <Text style={[styles.recentTitle, { color: isDark ? '#FFFFFF' : '#101114' }]}>
            Recent Earnings
          </Text>
          <Pressable style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="arrow-forward" size={14} color={ACCENT_YELLOW} />
          </Pressable>
        </View>

        <View style={styles.recentList}>
          {recentEarningsList.map((item) => (
            <View
              key={item.id}
              style={[
                styles.recentItemCard,
                {
                  backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                  borderColor: isDark ? '#23252B' : '#E5E7EB',
                },
              ]}
            >
              <View style={styles.recentThumbBox}>
                <Image source={item.thumb} style={styles.recentThumbImage} resizeMode="contain" />
              </View>

              <View style={styles.recentItemInfo}>
                <Text style={[styles.recentItemName, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                  {item.serviceName}
                </Text>
                <Text style={styles.recentItemId}>{item.jobId}</Text>
              </View>

              <View style={styles.recentItemDateCol}>
                <Text style={styles.recentItemDate}>{item.date}</Text>
              </View>

              <View style={styles.recentItemAmountCol}>
                <Text style={[styles.recentItemAmount, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                  {item.amount}
                </Text>
              </View>

              <View style={styles.completedBadgePill}>
                <Ionicons name="checkmark" size={12} color="#15803D" style={{ marginRight: 4 }} />
                <Text style={styles.completedBadgeText}>Completed</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollRoot: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
    gap: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#747B87',
    marginTop: 2,
  },
  dateDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  dateDropdownText: {
    fontSize: 13,
    fontWeight: '700',
  },
  dropdownFlyout: {
    position: 'absolute',
    top: 42,
    right: 0,
    width: 140,
    borderRadius: 10,
    borderWidth: 1,
    padding: 6,
    zIndex: 100,
    elevation: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  dropdownOption: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  dropdownOptionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  metricCard: {
    flex: 1,
    minWidth: 150,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metricIconWrap: {
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
  // Chart Card
  chartCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    gap: 20,
  },
  chartCardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  chartWrapper: {
    flexDirection: 'row',
    height: 220,
    gap: 16,
  },
  yAxisCol: {
    justifyContent: 'space-between',
    paddingBottom: 24,
    alignItems: 'flex-end',
    width: 50,
  },
  yAxisLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  barsArea: {
    flex: 1,
    position: 'relative',
    height: '100%',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(156, 163, 175, 0.15)',
  },
  barsFlexRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingBottom: 24,
  },
  singleBarCol: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    width: 40,
    position: 'relative',
  },
  barTooltip: {
    position: 'absolute',
    top: -24,
    backgroundColor: '#101114',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  barTooltipText: {
    fontSize: 10,
    fontWeight: '800',
    color: ACCENT_YELLOW,
  },
  barTrack: {
    width: 24,
    height: 160,
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  barXLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },
  // Recent Earnings
  recentSection: {
    gap: 14,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: ACCENT_YELLOW,
  },
  recentList: {
    gap: 10,
  },
  recentItemCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  recentThumbBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  recentThumbImage: {
    width: '100%',
    height: '100%',
  },
  recentItemInfo: {
    flex: 2,
    minWidth: 140,
  },
  recentItemName: {
    fontSize: 14,
    fontWeight: '800',
  },
  recentItemId: {
    fontSize: 12,
    color: '#747B87',
    fontWeight: '500',
    marginTop: 2,
  },
  recentItemDateCol: {
    flex: 1,
    minWidth: 120,
  },
  recentItemDate: {
    fontSize: 12,
    color: '#747B87',
  },
  recentItemAmountCol: {
    minWidth: 80,
  },
  recentItemAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  completedBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
});

