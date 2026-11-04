import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { BRAND_COLORS } from '../../../theme/colors';
import { RADIUS } from '../../../theme/radius';
import { SPACING } from '../../../theme/spacing';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { Header } from '../../../components/ui/Header';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useMechanicStore } from '../../../stores/mechanicStore';
import { useResponsive } from '../../../hooks/useResponsive';

type RequestTab = 'all' | 'incoming' | 'active' | 'completed';

export default function MechanicRequestsScreen() {
  const { theme, isDark } = useTheme();
  const { horizontalPadding, isTablet } = useResponsive();
  const { incomingRequests, activeJob, completedJobs, acceptRequest, rejectRequest } =
    useMechanicStore();

  const [activeTab, setActiveTab] = useState<RequestTab>('all');

  const allJobs = [
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

  return (
    <ScreenContainer withPadding={false} edges={['top', 'left', 'right']}>
      <Header title="Assigned Jobs" showThemeToggle />

      <View
        style={[
          styles.containerWrapper,
          {
            paddingHorizontal: horizontalPadding,
            maxWidth: isTablet ? 560 : undefined,
            alignSelf: isTablet ? 'center' : undefined,
            width: isTablet ? '100%' : undefined,
          },
        ]}
      >
        {/* Filter Pills */}
        <View style={styles.filterPillsRow}>
          {(['all', 'incoming', 'active', 'completed'] as RequestTab[]).map((tab) => {
            const isSelected = activeTab === tab;
            const label =
              tab === 'all'
                ? 'All'
                : tab === 'incoming'
                ? 'Incoming'
                : tab === 'active'
                ? 'Active'
                : 'Completed';

            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.filterPill,
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
                    styles.filterPillText,
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

        <FlatList
          data={filteredJobs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="clipboard-outline"
              title="No Jobs Found"
              description="Incoming breakdown assistance requests and your job history will appear here."
            />
          }
          renderItem={({ item }) => {
            const isIncoming = item.status === 'submitted';
            const isActive =
              item.status !== 'submitted' &&
              item.status !== 'completed' &&
              item.status !== 'cancelled';
            const isCompleted = item.status === 'completed';

            const badgeBg = isIncoming
              ? '#DCFCE7'
              : isActive
              ? '#EFF6FF'
              : isDark
              ? '#1E293B'
              : '#F1F5F9';

            const badgeTextColor = isIncoming
              ? BRAND_COLORS.successGreen
              : isActive
              ? BRAND_COLORS.primaryBlue
              : theme.textSecondary;

            const badgeText = isIncoming
              ? 'New Request'
              : isActive
              ? 'Active Job'
              : 'Completed';

            return (
              <Card
                onPress={() => {
                  router.push({
                    pathname: '/(mechanic)/job-details/[id]',
                    params: { id: item.id },
                  });
                }}
                style={styles.jobCard}
              >
                <View style={styles.jobRow}>
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
                    ]}
                  >
                    <Ionicons
                      name={item.vehicle?.type === 'bike' ? 'bicycle' : 'car'}
                      size={22}
                      color={BRAND_COLORS.primaryBlue}
                    />
                  </View>

                  <View style={styles.jobInfoCol}>
                    <View style={styles.jobHeaderRow}>
                      <Text
                        style={[styles.jobTitle, { color: theme.textPrimary }]}
                        numberOfLines={1}
                      >
                        {item.categoryName}
                      </Text>
                      <View style={[styles.badgePill, { backgroundColor: badgeBg }]}>
                        <Text style={[styles.badgeText, { color: badgeTextColor }]}>
                          {badgeText}
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.jobVehicle, { color: theme.textSecondary }]}>
                      {item.customerName} • {item.vehicle?.make || 'Vehicle'}{' '}
                      {item.vehicle?.model || ''}
                    </Text>

                    <Text style={[styles.jobMeta, { color: theme.textSecondary }]}>
                      Estimate: ₹{item.estimatedCost} •{' '}
                      {item.location.address || 'Roadside spot'}
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={17} color={theme.textTertiary} />
                </View>

                {isIncoming && (
                  <View style={styles.incomingActionsRow}>
                    <Pressable
                      onPress={() => rejectRequest(item.id)}
                      style={[styles.declineBtn, { borderColor: theme.border }]}
                      hitSlop={6}
                    >
                      <Text style={[styles.declineText, { color: theme.textPrimary }]}>
                        Decline
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => {
                        acceptRequest(item.id);
                        router.push({
                          pathname: '/(mechanic)/job-details/[id]',
                          params: { id: item.id },
                        });
                      }}
                      style={[
                        styles.acceptBtn,
                        { backgroundColor: BRAND_COLORS.successGreen },
                      ]}
                      hitSlop={6}
                    >
                      <Text style={styles.acceptText}>Accept</Text>
                    </Pressable>
                  </View>
                )}
              </Card>
            );
          }}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    flex: 1,
    paddingTop: SPACING.xs,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
  },
  filterPill: {
    flex: 1,
    height: 38,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillText: {
    fontSize: 13,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  jobCard: {
    padding: 14,
    marginBottom: SPACING.sm + 2,
  },
  jobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobInfoCol: {
    flex: 1,
    minWidth: 0,
  },
  jobHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  jobTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    flexShrink: 1,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  jobVehicle: {
    fontSize: 12.5,
    marginBottom: 3,
  },
  jobMeta: {
    fontSize: 12,
  },
  incomingActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  declineBtn: {
    flex: 1,
    height: 38,
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
    height: 38,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
