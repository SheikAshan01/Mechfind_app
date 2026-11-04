import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
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
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';
import { useCustomerStore } from '../../../stores/customerStore';
import { BreakdownRequest } from '../../../types/requests';
import { useResponsive } from '../../../hooks/useResponsive';

type FilterTab = 'all' | 'active' | 'completed' | 'cancelled';

export default function CustomerRequestsScreen() {
  const { theme, isDark } = useTheme();
  const { horizontalPadding, isTablet, isDesktop } = useResponsive();
  const { requests, rateMechanic, deleteBooking, cancelRequest } = useCustomerStore();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedJobForReview, setSelectedJobForReview] = useState<BreakdownRequest | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BreakdownRequest | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteBooking(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active')
      return r.status !== 'completed' && r.status !== 'cancelled';
    if (activeTab === 'completed') return r.status === 'completed';
    if (activeTab === 'cancelled') return r.status === 'cancelled';
    return true;
  });

  const openReviewModal = (job: BreakdownRequest) => {
    setSelectedJobForReview(job);
    setRating(5);
    setReviewComment('');
    setReviewModalVisible(true);
  };

  const submitReview = () => {
    if (selectedJobForReview && selectedJobForReview.mechanicId) {
      rateMechanic(
        selectedJobForReview.mechanicId,
        rating,
        reviewComment || 'Great breakdown service!'
      );
    }
    setReviewModalVisible(false);
  };

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return '25 Oct, 10:55 AM';
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
      return dateStr;
    }
  };

  return (
    <ScreenContainer withPadding={false} edges={['top', 'left', 'right']}>
      <Header title="My Bookings" showThemeToggle />

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
        {/* Filter Pills: All | Active | Completed | Cancelled */}
        <View style={styles.filterPillsRow}>
          {(['all', 'active', 'completed', 'cancelled'] as FilterTab[]).map((tab) => {
            const isSelected = activeTab === tab;
            const label =
              tab === 'all'
                ? 'All'
                : tab === 'active'
                ? 'Active'
                : tab === 'completed'
                ? 'Completed'
                : 'Cancelled';

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

        {/* Bookings List */}
        <FlatList
          data={filteredRequests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="car-outline"
              title="No Bookings Found"
              description="You have no roadside assistance bookings in this category."
              actionTitle="Find Mechanic"
              onActionPress={() => router.push('/(customer)/nearby-mechanics')}
            />
          }
          renderItem={({ item }) => {
            const isActive =
              item.status !== 'completed' && item.status !== 'cancelled';
            const isCompleted = item.status === 'completed';
            const isCancelled = item.status === 'cancelled';

            const badgeBg = isActive
              ? isDark
                ? 'rgba(22, 163, 74, 0.2)'
                : '#DCFCE7'
              : isCompleted
              ? isDark
                ? '#1E293B'
                : '#F1F5F9'
              : isDark
              ? 'rgba(220, 38, 38, 0.2)'
              : '#FEE2E2';

            const badgeTextColor = isActive
              ? BRAND_COLORS.successGreen
              : isCompleted
              ? theme.textSecondary
              : BRAND_COLORS.error;

            const badgeLabel = isActive
              ? 'Active'
              : isCompleted
              ? 'Completed'
              : 'Cancelled';

            const vehicleTitle = item.vehicle
              ? `${item.vehicle.make} ${item.vehicle.model}${
                  item.vehicle.licensePlate ? ` (${item.vehicle.licensePlate})` : ''
                }`
              : 'Hyundai Creta SX (MH 02 EE 4092)';

            return (
              <Card
                onPress={() => {
                  if (isActive) {
                    router.push({
                      pathname: '/(customer)/live-tracking/[id]',
                      params: { id: item.id },
                    });
                  } else if (isCompleted) {
                    openReviewModal(item);
                  }
                }}
                style={styles.bookingCard}
              >
                <View style={styles.bookingRow}>
                  {/* Left Vehicle / Service Icon in Box */}
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
                    ]}
                  >
                    <Ionicons
                      name={item.vehicle?.type === 'bike' ? 'bicycle' : 'car'}
                      size={24}
                      color={BRAND_COLORS.primaryBlue}
                    />
                  </View>

                  {/* Middle Content */}
                  <View style={styles.infoCol}>
                    <View style={styles.topInfoRow}>
                      <Text
                        style={[styles.serviceTitle, { color: theme.textPrimary }]}
                        numberOfLines={1}
                      >
                        {item.categoryName}
                      </Text>

                      {/* Status Badge */}
                      <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
                        <Text style={[styles.statusBadgeText, { color: badgeTextColor }]}>
                          {badgeLabel}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={[styles.vehicleText, { color: theme.textSecondary }]}
                      numberOfLines={1}
                    >
                      {vehicleTitle}
                    </Text>

                    <Text
                      style={[
                        styles.timeEtaText,
                        {
                          color: isActive
                            ? BRAND_COLORS.successGreen
                            : theme.textSecondary,
                          fontWeight: isActive ? '600' : '400',
                        },
                      ]}
                    >
                      {isActive
                        ? `ETA: ~${item.etaMinutes || 10} mins`
                        : formatTimestamp(item.completedAt || item.createdAt)}
                    </Text>
                  </View>

                  {/* Right Actions: Delete for Completed/Cancelled & Chevron for Active */}
                  {!isActive ? (
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(item);
                      }}
                      style={styles.deleteBookingBtn}
                      hitSlop={8}
                      accessibilityLabel="Delete booking from history"
                    >
                      <Ionicons name="trash-outline" size={17} color={BRAND_COLORS.error} />
                    </Pressable>
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
                  )}
                </View>
              </Card>
            );
          }}
        />

        {/* Rating & Review Modal */}
        <Modal
          visible={reviewModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setReviewModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                Rate Your Mechanic
              </Text>
              <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
                {selectedJobForReview?.mechanic?.shopName || 'Apex Speed Garage'}
              </Text>

              {/* Star Rating Selector */}
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Pressable key={s} onPress={() => setRating(s)} hitSlop={6}>
                    <Ionicons
                      name={s <= rating ? 'star' : 'star-outline'}
                      size={28}
                      color="#F59E0B"
                    />
                  </Pressable>
                ))}
              </View>

              <TextInput
                placeholder="Share your feedback..."
                placeholderTextColor={theme.textTertiary}
                value={reviewComment}
                onChangeText={setReviewComment}
                style={[
                  styles.reviewInput,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                    borderColor: theme.border,
                    color: theme.textPrimary,
                  },
                ]}
                multiline
              />

              <View style={styles.modalBtnRow}>
                <Pressable
                  onPress={() => setReviewModalVisible(false)}
                  style={[styles.modalBtnOutline, { borderColor: theme.border }]}
                >
                  <Text style={[styles.btnOutlineText, { color: theme.textPrimary }]}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={submitReview}
                  style={[
                    styles.modalBtnSolid,
                    { backgroundColor: BRAND_COLORS.primaryBlue },
                  ]}
                >
                  <Text style={styles.btnSolidText}>Submit Rating</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
      {/* Permanent Delete Booking Confirmation Modal */}
      <ConfirmationModal
        visible={Boolean(deleteTarget)}
        title="Delete Booking Record"
        message={`Are you sure you want to permanently delete this ${deleteTarget?.categoryName} booking (#${deleteTarget?.id.slice(-4)}) from your history? This action cannot be undone.`}
        confirmText="Delete Record"
        cancelText="Cancel"
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
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
  bookingCard: {
    marginBottom: SPACING.sm + 2,
    padding: 12,
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteBookingBtn: {
    padding: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
    minWidth: 0,
  },
  topInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  serviceTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    flexShrink: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  vehicleText: {
    fontSize: 12.5,
    marginBottom: 3,
  },
  timeEtaText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 13,
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  reviewInput: {
    width: '100%',
    height: 80,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalBtnOutline: {
    flex: 1,
    height: 42,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutlineText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalBtnSolid: {
    flex: 1,
    height: 42,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSolidText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
