import React, { useState } from 'react';
import {
  Image,
  Modal,
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
import { SPACING } from '../../../theme/spacing';

type TimeFilter = 'today' | 'week' | 'month';

export default function MechanicEarningsScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme } = useTheme();
  const { horizontalPadding, isTablet, isDesktop } = useResponsive();
  const { earnings, completedJobs } = useMechanicStore();

  const [activeFilter, setActiveFilter] = useState<TimeFilter>('today');
  const [isPayoutModalVisible, setIsPayoutModalVisible] = useState(false);

  const totalEarningsAmount = earnings.total > 0 ? earnings.total : 28400;

  const displayedAmount =
    activeFilter === 'today'
      ? earnings.today
      : activeFilter === 'week'
      ? earnings.week
      : totalEarningsAmount;

  const displayedJobs =
    activeFilter === 'today'
      ? completedJobs.filter((j) => {
          if (!j.completedAt) return false;
          const today = new Date().toISOString().slice(0, 10);
          return j.completedAt.slice(0, 10) === today;
        }).length
      : completedJobs.length;

  const avgPerJob =
    displayedJobs > 0 ? Math.round(displayedAmount / displayedJobs) : 0;

  const filterTabs: { key: TimeFilter; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
  ];

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
          {/* 1. Header with MECHFIND Logo, Notification Bell and Profile Avatar */}
          <View style={styles.headerRow}>
            <Image
              source={require('../../../../assets/images/mechfind-header-logo.png')}
              style={styles.mechfindLogo}
              resizeMode="contain"
              accessibilityLabel="MECHFIND"
            />

            <View style={styles.headerRightActions}>
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

          {/* 2. Page Title Row: Earnings, Subtitle, Moon & Search Icons */}
          <View style={styles.titleRow}>
            <View style={styles.titleCol}>
              <Text
                style={[
                  styles.pageTitle,
                  { color: isDark ? '#FFFFFF' : '#101114' },
                ]}
              >
                Earnings
              </Text>
              <Text
                style={[
                  styles.pageSubtitle,
                  { color: isDark ? '#9CA3AF' : '#6B7280' },
                ]}
              >
                Track your earnings and job performance
              </Text>
            </View>

            <View style={styles.titleActionIcons}>
              <Pressable
                style={[
                  styles.headerActionBtn,
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

              <Pressable
                style={[
                  styles.headerActionBtn,
                  {
                    backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                    borderColor: isDark ? '#2D3139' : '#E5E7EB',
                  },
                ]}
                hitSlop={8}
                accessibilityLabel="Search Earnings"
              >
                <Ionicons
                  name="search-outline"
                  size={19}
                  color={isDark ? '#FFFFFF' : '#101114'}
                />
              </Pressable>
            </View>
          </View>

          {/* 3. Time Filter Tabs: Today / This Week / This Month */}
          <View style={styles.filterPillsRow}>
            {filterTabs.map((tab) => {
              const isSelected = activeFilter === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  onPress={() => setActiveFilter(tab.key)}
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
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* 4. Main Highlighted Earnings Hero Card */}
          <View style={styles.heroEarningsCard}>
            <View style={styles.heroLeftCol}>
              <View style={styles.walletIconBadge}>
                <Ionicons name="wallet-outline" size={18} color="#FFC400" />
              </View>

              <Text style={styles.heroPeriodLabel}>
                {activeFilter === 'today'
                  ? "Today's Earnings"
                  : activeFilter === 'week'
                  ? "This Week's Earnings"
                  : "This Month's Earnings"}
              </Text>

              <Text style={styles.heroAmountText}>
                ₹{displayedAmount.toLocaleString()}
              </Text>
            </View>

            {/* Rising Yellow Bars Graphic + Bottom Glow Wave */}
            <View style={styles.heroGraphicWrap}>
              <View style={styles.barsContainer}>
                <View style={[styles.yellowBar, { height: 16 }]} />
                <View style={[styles.yellowBar, { height: 26 }]} />
                <View style={[styles.yellowBar, { height: 38 }]} />
                <View style={[styles.yellowBar, { height: 52 }]} />
              </View>
              <View style={styles.waveAccentCurve} />
            </View>
          </View>

          {/* 5. Earnings Summary Card */}
          <View
            style={[
              styles.summaryCardWhite,
              {
                backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                borderColor: isDark ? '#2D3139' : '#E5E7EB',
                borderWidth: isDark ? 1 : 0,
              },
            ]}
          >
            {/* Jobs Completed */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryRowLeft}>
                <View
                  style={[
                    styles.summaryIconBox,
                    { backgroundColor: isDark ? '#222328' : '#F3F4F6' },
                  ]}
                >
                  <Ionicons
                    name="briefcase-outline"
                    size={18}
                    color={isDark ? '#FFC400' : '#101114'}
                  />
                </View>
                <Text
                  style={[
                    styles.summaryLabelText,
                    { color: isDark ? '#FFFFFF' : '#101114' },
                  ]}
                >
                  Jobs Completed
                </Text>
              </View>
              <Text
                style={[
                  styles.summaryValueText,
                  { color: isDark ? '#FFFFFF' : '#101114' },
                ]}
              >
                {displayedJobs}
              </Text>
            </View>

            <View
              style={[
                styles.cardDivider,
                { backgroundColor: isDark ? '#2D3139' : '#F3F4F6' },
              ]}
            />

            {/* Avg. per Job */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryRowLeft}>
                <View
                  style={[
                    styles.summaryIconBox,
                    { backgroundColor: isDark ? '#222328' : '#F3F4F6' },
                  ]}
                >
                  <Ionicons
                    name="cash-outline"
                    size={18}
                    color={isDark ? '#FFC400' : '#101114'}
                  />
                </View>
                <Text
                  style={[
                    styles.summaryLabelText,
                    { color: isDark ? '#FFFFFF' : '#101114' },
                  ]}
                >
                  Avg. per Job
                </Text>
              </View>
              <Text
                style={[
                  styles.summaryValueText,
                  { color: isDark ? '#FFFFFF' : '#101114' },
                ]}
              >
                ₹{avgPerJob.toLocaleString()}
              </Text>
            </View>

            <View
              style={[
                styles.cardDivider,
                { backgroundColor: isDark ? '#2D3139' : '#F3F4F6' },
              ]}
            />

            {/* Total Earnings */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryRowLeft}>
                <View
                  style={[
                    styles.summaryIconBox,
                    { backgroundColor: isDark ? '#222328' : '#F3F4F6' },
                  ]}
                >
                  <Ionicons
                    name="wallet-outline"
                    size={18}
                    color={isDark ? '#FFC400' : '#101114'}
                  />
                </View>
                <Text
                  style={[
                    styles.summaryLabelText,
                    { color: isDark ? '#FFFFFF' : '#101114' },
                  ]}
                >
                  Total Earnings
                </Text>
              </View>
              <Text
                style={[
                  styles.summaryValueText,
                  { color: isDark ? '#FFFFFF' : '#101114' },
                ]}
              >
                ₹{totalEarningsAmount.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* 6. Payouts & Bank Settlement Action Card */}
          <Pressable
            style={[
              styles.payoutCardWhite,
              {
                backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                borderColor: isDark ? '#2D3139' : '#E5E7EB',
                borderWidth: isDark ? 1 : 0,
              },
            ]}
            onPress={() => setIsPayoutModalVisible(true)}
            accessibilityRole="button"
          >
            <View style={styles.payoutCardLeft}>
              <View
                style={[
                  styles.payoutIconBox,
                  { backgroundColor: isDark ? '#222328' : '#F3F4F6' },
                ]}
              >
                <Ionicons
                  name="business-outline"
                  size={19}
                  color={isDark ? '#FFC400' : '#101114'}
                />
              </View>
              <Text
                style={[
                  styles.payoutTitleText,
                  { color: isDark ? '#FFFFFF' : '#101114' },
                ]}
              >
                Payouts & Bank Settlement
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={isDark ? '#9CA3AF' : '#6B7280'}
            />
          </Pressable>

          {/* 7. Earnings Insights Section */}
          <View style={styles.insightsSection}>
            <Text
              style={[
                styles.insightsHeading,
                { color: isDark ? '#FFFFFF' : '#101114' },
              ]}
            >
              Earnings Insights
            </Text>

            <View
              style={[
                styles.insightsCardWhite,
                {
                  backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                  borderColor: isDark ? '#2D3139' : '#E5E7EB',
                  borderWidth: isDark ? 1 : 0,
                },
              ]}
            >
              <Image
                source={require('../../../../assets/images/earnings-insights-bars.png')}
                style={styles.insightsIllustration}
                resizeMode="contain"
              />
              <Text
                style={[
                  styles.insightsEmptyTitle,
                  { color: isDark ? '#FFFFFF' : '#101114' },
                ]}
              >
                No earnings yet
              </Text>
              <Text
                style={[
                  styles.insightsEmptySubtitle,
                  { color: isDark ? '#9CA3AF' : '#6B7280' },
                ]}
              >
                Complete jobs to see your earnings insights here.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Payouts & Bank Settlement Modal */}
      <Modal
        visible={isPayoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPayoutModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsPayoutModalVisible(false)}
        >
          <Pressable
            style={[
              styles.payoutModalContainer,
              { backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF' },
            ]}
          >
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="business" size={22} color="#FFC400" />
                <Text
                  style={[
                    styles.modalTitleText,
                    { color: isDark ? '#FFFFFF' : '#101114' },
                  ]}
                >
                  Bank Settlements
                </Text>
              </View>
              <Pressable
                onPress={() => setIsPayoutModalVisible(false)}
                hitSlop={8}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={isDark ? '#FFFFFF' : '#101114'}
                />
              </Pressable>
            </View>

            <View
              style={[
                styles.bankAccountRow,
                { backgroundColor: isDark ? '#222328' : '#F9FAFB' },
              ]}
            >
              <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
              <View style={{ marginLeft: 8 }}>
                <Text
                  style={[
                    styles.bankNameText,
                    { color: isDark ? '#FFFFFF' : '#101114' },
                  ]}
                >
                  Primary Bank Account
                </Text>
                <Text
                  style={[
                    styles.bankDetailsText,
                    { color: isDark ? '#9CA3AF' : '#6B7280' },
                  ]}
                >
                  HDFC Bank •••• 4092 (Auto-settlement verified)
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.settlementScheduleBox,
                { backgroundColor: isDark ? 'rgba(255, 196, 0, 0.15)' : '#FEF3C7' },
              ]}
            >
              <Text
                style={[
                  styles.settlementScheduleLabel,
                  { color: isDark ? '#FFC400' : '#B45309' },
                ]}
              >
                Settlement Cycle
              </Text>
              <Text
                style={[
                  styles.settlementScheduleVal,
                  { color: isDark ? '#FFFFFF' : '#101114' },
                ]}
              >
                Every Monday • Automatic Direct Transfer
              </Text>
            </View>

            <View
              style={[
                styles.settlementAmountBox,
                { backgroundColor: isDark ? '#222328' : '#F3F4F6' },
              ]}
            >
              <Text
                style={[
                  styles.settlementAmountLabel,
                  { color: isDark ? '#9CA3AF' : '#6B7280' },
                ]}
              >
                Available Balance
              </Text>
              <Text
                style={[
                  styles.settlementAmountVal,
                  { color: isDark ? '#FFFFFF' : '#101114' },
                ]}
              >
                ₹{totalEarningsAmount.toLocaleString()}
              </Text>
            </View>

            <Pressable
              style={styles.modalCloseBtn}
              onPress={() => setIsPayoutModalVisible(false)}
            >
              <Text style={styles.modalCloseBtnText}>Done</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
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
  // 2. Title Row
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  titleCol: {
    flex: 1,
    paddingRight: 10,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
  titleActionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  // 3. Filter Pills
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
  },
  filterPill: {
    flex: 1,
    height: 38,
    borderRadius: 19,
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
  // 4. Hero Earnings Card
  heroEarningsCard: {
    backgroundColor: '#1A1B1F',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2D3139',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 140,
  },
  heroLeftCol: {
    flex: 1,
    zIndex: 2,
  },
  walletIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 196, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 196, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  heroPeriodLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 4,
  },
  heroAmountText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  heroGraphicWrap: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    height: '100%',
    position: 'relative',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    zIndex: 2,
    marginBottom: 10,
  },
  yellowBar: {
    width: 8,
    backgroundColor: '#FFC400',
    borderRadius: 4,
  },
  waveAccentCurve: {
    position: 'absolute',
    bottom: -30,
    right: -30,
    width: 140,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 196, 0, 0.15)',
    zIndex: 1,
  },
  // 5. Earnings Summary Card
  summaryCardWhite: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: SPACING.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  summaryRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryValueText: {
    fontSize: 15,
    fontWeight: '800',
  },
  cardDivider: {
    height: 1,
  },
  // 6. Payouts Card
  payoutCardWhite: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  payoutCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  payoutIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payoutTitleText: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  // 7. Earnings Insights
  insightsSection: {
    marginBottom: SPACING.xl,
  },
  insightsHeading: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: SPACING.sm,
  },
  insightsCardWhite: {
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  insightsIllustration: {
    width: 140,
    height: 60,
    marginBottom: 12,
  },
  insightsEmptyTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    marginBottom: 4,
  },
  insightsEmptySubtitle: {
    fontSize: 12.5,
    textAlign: 'center',
    maxWidth: 240,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  payoutModalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 22,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitleText: {
    fontSize: 17,
    fontWeight: '800',
  },
  bankAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  bankNameText: {
    fontSize: 13,
    fontWeight: '700',
  },
  bankDetailsText: {
    fontSize: 11.5,
    marginTop: 1,
  },
  settlementScheduleBox: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  settlementScheduleLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settlementScheduleVal: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  settlementAmountBox: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 18,
  },
  settlementAmountLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  settlementAmountVal: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  modalCloseBtn: {
    backgroundColor: '#FFC400',
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtnText: {
    color: '#101114',
    fontSize: 14,
    fontWeight: '700',
  },
});
