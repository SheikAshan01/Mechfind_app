import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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

type TimeFilter = 'today' | 'week' | 'month';

export default function MechanicEarningsScreen() {
  const { theme, isDark } = useTheme();
  const { horizontalPadding, isTablet, isDesktop } = useResponsive();
  const { earnings, completedJobs } = useMechanicStore();

  const [activeFilter, setActiveFilter] = useState<TimeFilter>('today');

  const displayedAmount =
    activeFilter === 'today'
      ? earnings.today || 850
      : activeFilter === 'week'
      ? earnings.week || 4200
      : 18500;

  const displayedJobs =
    activeFilter === 'today'
      ? completedJobs.length || 1
      : activeFilter === 'week'
      ? 5
      : 24;

  const avgPerJob = Math.round(displayedAmount / (displayedJobs || 1));

  return (
    <ScreenContainer scrollable withPadding={false} edges={['top', 'left', 'right']}>
      <Header
        title="Earnings"
        showThemeToggle
        rightAction={
          <Pressable
            style={[
              styles.filterIconBtn,
              { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderColor: theme.border },
            ]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Search Earnings"
          >
            <Ionicons name="search" size={18} color={theme.textPrimary} />
          </Pressable>
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
        {/* Time Period Filter Pills */}
        <View style={styles.periodPillsRow}>
          {(['today', 'week', 'month'] as TimeFilter[]).map((period) => {
            const isSelected = activeFilter === period;
            const label =
              period === 'today'
                ? 'Today'
                : period === 'week'
                ? 'This Week'
                : 'This Month';

            return (
              <Pressable
                key={period}
                onPress={() => setActiveFilter(period)}
                style={[
                  styles.periodPill,
                  {
                    backgroundColor: isSelected
                      ? BRAND_COLORS.primaryBlue
                      : theme.card,
                    borderColor: isSelected
                      ? BRAND_COLORS.primaryBlue
                      : theme.border,
                  },
                ]}
                hitSlop={4}
              >
                <Text
                  style={[
                    styles.periodPillText,
                    {
                      color: isSelected ? '#FFFFFF' : theme.textPrimary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Large Hero Earnings Card */}
        <Card style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={[styles.earningsNumber, { color: theme.textPrimary }]}>
                ₹{displayedAmount.toLocaleString()}
              </Text>
              <Text style={[styles.earningsLabel, { color: theme.textSecondary }]}>
                {activeFilter === 'today'
                  ? "Today's Earnings"
                  : activeFilter === 'week'
                  ? "This Week's Earnings"
                  : "This Month's Earnings"}
              </Text>
            </View>

            {/* Green Wallet Container */}
            <View style={styles.walletBox}>
              <Ionicons name="wallet-outline" size={26} color={BRAND_COLORS.successGreen} />
            </View>
          </View>
        </Card>

        {/* Metric Rows Card */}
        <Card style={styles.breakdownCard}>
          {/* Jobs Completed */}
          <View style={styles.metricRow}>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
              Jobs Completed
            </Text>
            <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
              {displayedJobs}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          {/* Avg. per Job */}
          <View style={styles.metricRow}>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
              Avg. per Job
            </Text>
            <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
              ₹{avgPerJob.toLocaleString()}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          {/* Total Earnings */}
          <View style={styles.metricRow}>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
              Total Earnings
            </Text>
            <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
              ₹{(earnings.total || 28400).toLocaleString()}
            </Text>
          </View>
        </Card>

        {/* Payouts & Bank Settlement Action */}
        <Card style={styles.settlementCard}>
          <Pressable style={styles.settlementRow} hitSlop={6}>
            <Text style={[styles.settlementText, { color: theme.textPrimary }]}>
              Payouts & Bank Settlement
            </Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
          </Pressable>
        </Card>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    paddingVertical: SPACING.md,
  },
  filterIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
  },
  periodPill: {
    flex: 1,
    height: 38,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodPillText: {
    fontSize: 13,
  },
  heroCard: {
    padding: 18,
    marginBottom: SPACING.md,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  earningsNumber: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  earningsLabel: {
    fontSize: 13.5,
    fontWeight: '500',
  },
  walletBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakdownCard: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: SPACING.md,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  metricLabel: {
    fontSize: 13.5,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  divider: {
    height: 1,
  },
  settlementCard: {
    padding: 16,
  },
  settlementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settlementText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
