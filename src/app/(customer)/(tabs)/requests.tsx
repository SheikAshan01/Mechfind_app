import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeContext';
import { BRAND_COLORS } from '../../../theme/colors';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';
import { useCustomerStore } from '../../../stores/customerStore';
import { BreakdownRequest } from '../../../types/requests';
import { useResponsive } from '../../../hooks/useResponsive';

const ACCENT_YELLOW = '#FFC400';

type FilterTab = 'all' | 'active' | 'completed' | 'cancelled';

export default function CustomerRequestsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, isTablet, isDesktop } = useResponsive();
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

  const activeCount = requests.filter(
    (r) => r.status !== 'completed' && r.status !== 'cancelled'
  ).length;
  const completedCount = requests.filter((r) => r.status === 'completed').length;
  const cancelledCount = requests.filter((r) => r.status === 'cancelled').length;

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

  const formatBookingDate = (dateStr?: string) => {
    if (!dateStr) return 'Today, 10:24 AM';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[d.getMonth()];
      const day = d.getDate();
      let hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;

      if (isToday) {
        return `Today, ${hours}:${minutes} ${ampm}`;
      }
      return `${day} ${month}, ${hours}:${minutes} ${ampm}`;
    } catch {
      return 'Today, 10:24 AM';
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

  const getServiceThumbnail = (category?: string) => {
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

  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 20);
  const isCenteredScreen = isTablet || isDesktop;

  return (
    <View style={[styles.screen, { backgroundColor: isDark ? '#101114' : '#F1F2F4' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View
        style={[
          styles.mainWrapper,
          isCenteredScreen && styles.centeredWrapper,
        ]}
      >
        {/* ========================================================= */}
        {/* HEADER (Dark Metallic Section)                            */}
        {/* ========================================================= */}
        <View style={[styles.headerSection, { paddingTop: topPadding + 6 }]}>
          {/* Top Bar: MECHFIND Logo on Left, Theme Toggle, Notification & Profile on Right */}
          <View style={styles.topBarRow}>
            <Image
              source={require('../../../../assets/images/mechfind-header-logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
              accessibilityLabel="MECHFIND"
            />

            <View style={styles.topBarActions}>
              <Pressable
                onPress={toggleTheme}
                style={styles.iconCircleButton}
                accessibilityRole="button"
                accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <Ionicons
                  name={isDark ? 'sunny-outline' : 'moon-outline'}
                  size={20}
                  color={isDark ? ACCENT_YELLOW : '#FFFFFF'}
                />
              </Pressable>

              <Pressable
                onPress={() => {}}
                style={styles.iconCircleButton}
                accessibilityRole="button"
                accessibilityLabel="Notifications"
              >
                <Ionicons name="notifications-outline" size={21} color="#FFFFFF" />
                <View style={styles.notificationDot} />
              </Pressable>

              <Pressable
                onPress={() => router.push('/(customer)/(tabs)/profile')}
                style={styles.profileAvatarButton}
                accessibilityRole="button"
                accessibilityLabel="Open profile"
              >
                <Ionicons name="person" size={17} color="#101114" />
              </Pressable>
            </View>
          </View>

          {/* Titles */}
          <View style={styles.headerTitleArea}>
            <Text style={styles.headingTitle}>My Bookings</Text>
            <Text style={styles.headingSubtitle}>
              Track and manage your service requests
            </Text>
          </View>

          {/* Filter Pills: All | Active | Completed | Cancelled */}
          <View style={styles.filterPillsRow}>
            {(
              [
                { id: 'all', label: `All (${requests.length})` },
                { id: 'active', label: `Active (${activeCount})` },
                { id: 'completed', label: 'Completed' },
                { id: 'cancelled', label: 'Cancelled' },
              ] as const
            ).map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  style={[
                    styles.filterPill,
                    isSelected
                      ? styles.filterPillActive
                      : styles.filterPillInactive,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={tab.label}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      isSelected
                        ? styles.filterPillTextActive
                        : styles.filterPillTextInactive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ========================================================= */}
        {/* CURVED BODY SECTION (Booking Cards List)                  */}
        {/* ========================================================= */}
        <View
          style={[
            styles.curvedBodySection,
            { backgroundColor: isDark ? '#101114' : '#F1F2F4' },
          ]}
        >
          <FlatList
            data={filteredRequests}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: Math.max(insets.bottom, 16) + 32 },
            ]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <EmptyState
                icon="calendar-outline"
                title="No Bookings Found"
                description="You have no service requests in this category."
                actionTitle="Book a Service"
                onActionPress={() => router.push('/(customer)/breakdown-request')}
              />
            }
            renderItem={({ item }) => {
              const isActive =
                item.status !== 'completed' && item.status !== 'cancelled';
              const isCompleted = item.status === 'completed';
              const isCancelled = item.status === 'cancelled';

              const thumbnail = getServiceThumbnail(item.categoryName || item.category);

              return (
                <Pressable
                  onPress={() => {
                    router.push({
                      pathname: '/(customer)/live-tracking/[id]',
                      params: { id: item.id },
                    });
                  }}
                  style={({ pressed }) => [
                    styles.bookingCard,
                    {
                      backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                      borderColor: isDark ? '#2A2B30' : '#EAECEF',
                      transform: [{ scale: pressed ? 0.985 : 1 }],
                      opacity: pressed ? 0.94 : 1,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.categoryName}. Status: ${item.status}`}
                >
                  {/* Top Content Row */}
                  <View style={styles.cardTopRow}>
                    {/* Service Image */}
                    <Image
                      source={thumbnail}
                      style={styles.serviceImage}
                      resizeMode="contain"
                      accessibilityLabel={item.categoryName}
                    />

                    {/* Service Details */}
                    <View style={styles.cardDetails}>
                      <Text
                        style={[
                          styles.serviceTitleText,
                          { color: isDark ? '#FFFFFF' : '#111827' },
                        ]}
                        numberOfLines={1}
                      >
                        {item.categoryName || 'Roadside Assistance'}
                      </Text>

                      <Text
                        style={styles.locationText}
                        numberOfLines={1}
                      >
                        {item.location?.address || 'SV Road, Near Bus Stand, Dindigul'}
                      </Text>

                      {/* Status Badge */}
                      <View style={styles.statusBadgeRow}>
                        {isActive && (
                          <View style={styles.activeStatusPill}>
                            <Ionicons name="car" size={13} color="#B45309" />
                            <Text style={styles.activeStatusText}>
                              {item.status === 'heading_to_customer'
                                ? 'On the Way'
                                : item.status.replaceAll('_', ' ')}
                            </Text>
                          </View>
                        )}
                        {isCompleted && (
                          <View style={styles.completedStatusPill}>
                            <Ionicons
                              name="checkmark"
                              size={13}
                              color="#15803D"
                            />
                            <Text style={styles.completedStatusText}>
                              Completed
                            </Text>
                          </View>
                        )}
                        {isCancelled && (
                          <View style={styles.cancelledStatusPill}>
                            <Ionicons name="close" size={13} color="#374151" />
                            <Text style={styles.cancelledStatusText}>
                              Cancelled
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Navigation Chevron */}
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={isDark ? '#FFFFFF' : '#111827'}
                    />
                  </View>

                  {/* Card Bottom Row: Date & Booking ID */}
                  <View style={styles.cardBottomRow}>
                    <View style={styles.dateRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={15}
                        color="#4B5563"
                      />
                      <Text style={styles.dateText}>
                        {formatBookingDate(item.createdAt)}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.bookingIdText,
                        { color: isDark ? '#FFFFFF' : '#111827' },
                      ]}
                    >
                      {formatBookingId(item.id)}
                    </Text>
                  </View>
                </Pressable>
              );
            }}
          />
        </View>
      </View>

      {/* Delete / Cancel Confirmation Modal */}
      <ConfirmationModal
        visible={!!deleteTarget}
        title="Remove Booking?"
        message="Are you sure you want to remove this booking from your history?"
        confirmText="Remove"
        cancelText="Keep"
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Mechanic Rating & Review Modal */}
      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF' },
            ]}
          >
            <Text
              style={[
                styles.modalTitle,
                { color: isDark ? '#FFFFFF' : '#111827' },
              ]}
            >
              Rate Your Experience
            </Text>
            <Text style={styles.modalSubtitle}>
              How was the service provided by {selectedJobForReview?.mechanic?.fullName || 'the mechanic'}?
            </Text>

            {/* Star Rating Row */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starTouch}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={32}
                    color={ACCENT_YELLOW}
                  />
                </Pressable>
              ))}
            </View>

            <TextInput
              style={[
                styles.commentInput,
                {
                  backgroundColor: isDark ? '#222328' : '#F9FAFB',
                  color: isDark ? '#FFFFFF' : '#111827',
                  borderColor: isDark ? '#374151' : '#E5E7EB',
                },
              ]}
              placeholder="Leave a short comment (optional)..."
              placeholderTextColor="#9CA3AF"
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActionsRow}>
              <Pressable
                onPress={() => setReviewModalVisible(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={submitReview}
                style={styles.modalSubmitBtn}
              >
                <Text style={styles.modalSubmitText}>Submit Review</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#101114',
  },
  mainWrapper: {
    flex: 1,
    width: '100%',
  },
  centeredWrapper: {
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
  },

  /* HEADER */
  headerSection: {
    backgroundColor: '#101114',
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  logoImage: {
    width: 130,
    height: 44,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1C1D21',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: ACCENT_YELLOW,
  },
  profileAvatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleArea: {
    marginBottom: 16,
  },
  headingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  headingSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 3,
  },

  /* FILTER TABS */
  filterPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: ACCENT_YELLOW,
  },
  filterPillInactive: {
    backgroundColor: '#222328',
  },
  filterPillText: {
    fontSize: 13.5,
  },
  filterPillTextActive: {
    fontWeight: '700',
    color: '#101114',
  },
  filterPillTextInactive: {
    fontWeight: '600',
    color: '#FFFFFF',
  },

  /* CURVED BODY & BOOKINGS LIST */
  curvedBodySection: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 18,
    marginTop: 4,
  },
  listContent: {
    gap: 12,
  },
  bookingCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceImage: {
    width: 52,
    height: 52,
    borderRadius: 12,
  },
  cardDetails: {
    flex: 1,
    marginLeft: 14,
    marginRight: 6,
  },
  serviceTitleText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  locationText: {
    fontSize: 12.5,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  activeStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  activeStatusText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#B45309',
  },
  completedStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  completedStatusText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#15803D',
  },
  cancelledStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  cancelledStatusText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#374151',
  },

  /* CARD BOTTOM ROW */
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12.5,
    color: '#4B5563',
  },
  bookingIdText: {
    fontSize: 13,
    fontWeight: '700',
  },

  /* REVIEW MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13.5,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  starTouch: {
    padding: 4,
  },
  commentInput: {
    height: 80,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 14,
    marginBottom: 20,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  modalSubmitBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: ACCENT_YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#101114',
  },
});
