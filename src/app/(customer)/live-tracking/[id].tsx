import React, { useEffect, useState } from 'react';
import {
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeContext';
import { BRAND_COLORS } from '../../../theme/colors';
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';
import { useCustomerStore } from '../../../stores/customerStore';
import { useResponsive } from '../../../hooks/useResponsive';

const ACCENT_YELLOW = '#FFC400';

export default function BookingDetailsScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { isTablet, isDesktop } = useResponsive();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { requests, cancelRequest, respondToQuote } = useCustomerStore();

  const request = requests.find((r) => r.id === id) || requests[0];
  const [eta, setEta] = useState(request?.etaMinutes || 12);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (!request || request.status === 'completed' || request.status === 'cancelled') return;
    const interval = setInterval(() => {
      setEta((prev) => Math.max(1, prev - 1));
    }, 20000);
    return () => clearInterval(interval);
  }, [request]);

  const handleCallMechanic = () => {
    if (request?.mechanic?.phoneNumber) {
      Linking.openURL(`tel:${request.mechanic.phoneNumber}`);
    } else {
      Linking.openURL('tel:+919820112345');
    }
  };

  const handleWhatsApp = () => {
    const phone =
      request?.mechanic?.phoneNumber?.replace(/[^0-9]/g, '') || '919820112345';
    Linking.openURL(
      `https://wa.me/${phone}?text=Hello%2C%20regarding%20my%20MECHFIND%20breakdown%20booking%20${request?.id || ''}`
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Tracking my MECHFIND roadside assistance: ${request?.categoryName || 'Service'} at ${request?.location?.address || 'Current Location'}. Booking ID: ${request?.id || ''}`,
      });
    } catch {
      // Ignored
    }
  };

  const handleConfirmCancel = () => {
    if (request) {
      cancelRequest(request.id, 'Customer cancelled assistance');
    }
    setShowCancelModal(false);
    router.replace('/(customer)/(tabs)/requests');
  };

  if (!request) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Booking Details</Text>
        </View>
        <View style={styles.notFoundContainer}>
          <Text style={{ color: '#FFFFFF', fontSize: 16 }}>
            Booking details not found.
          </Text>
        </View>
      </View>
    );
  }

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

  // Status mapping
  const isActive = request.status !== 'completed' && request.status !== 'cancelled';
  const isCompleted = request.status === 'completed';
  const isCancelled = request.status === 'cancelled';

  // Timeline step active index
  const getTimelineStepIndex = (status?: string) => {
    if (!status) return 2;
    switch (status) {
      case 'searching':
      case 'pending':
        return 0; // Confirmed
      case 'accepted':
        return 1; // Mechanic Accepted
      case 'assigned':
      case 'heading_to_customer':
        return 2; // On the Way
      case 'arrived':
      case 'diagnosing':
      case 'quote_sent':
      case 'work_in_progress':
        return 3; // In Service
      case 'work_completed':
      case 'completed':
        return 4; // Completed
      default:
        return 2;
    }
  };

  const activeStep = getTimelineStepIndex(request.status);
  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 20);
  const isCenteredScreen = isTablet || isDesktop;

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {/* ========================================================= */}
      {/* A. HEADER (Dark Section)                                  */}
      {/* ========================================================= */}
      <View style={[styles.headerSection, { paddingTop: topPadding + 6 }]}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>

          <Text style={styles.headerTitle}>Booking Details</Text>

          <Pressable
            onPress={handleShare}
            style={({ pressed }) => [
              styles.shareButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Share booking details"
          >
            <Ionicons name="share-social-outline" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      {/* ========================================================= */}
      {/* B. SCROLLABLE CONTENT BODY                                */}
      {/* ========================================================= */}
      <ScrollView
        bounces={false}
        contentContainerStyle={[
          styles.scrollContent,
          { backgroundColor: isDark ? '#101114' : '#F1F2F4' },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.bodyWrapper,
            isCenteredScreen && styles.centeredWrapper,
          ]}
        >
          {/* ========================================================= */}
          {/* 1. BOOKING SUMMARY CARD                                   */}
          {/* ========================================================= */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                borderColor: isDark ? '#2A2B30' : '#EAECEF',
              },
            ]}
          >
            {/* Top Row: Thumbnail + Service Name & ID + Status Badge */}
            <View style={styles.summaryTopRow}>
              <Image
                source={getServiceThumbnail(request.categoryName || request.category)}
                style={styles.summaryThumbImage}
                resizeMode="contain"
                accessibilityLabel={request.categoryName}
              />

              <View style={styles.summaryTitleCol}>
                <Text
                  style={[
                    styles.summaryServiceName,
                    { color: isDark ? '#FFFFFF' : '#111827' },
                  ]}
                  numberOfLines={1}
                >
                  {request.categoryName || 'Battery Jumpstart'}
                </Text>
                <Text style={styles.summaryBookingId}>
                  {formatBookingId(request.id)}
                </Text>
              </View>

              {/* Status Badge */}
              {isActive && (
                <View style={styles.activeStatusPill}>
                  <Ionicons name="car" size={13} color="#B45309" />
                  <Text style={styles.activeStatusText}>
                    {request.status === 'heading_to_customer'
                      ? 'On the Way'
                      : request.status.replaceAll('_', ' ')}
                  </Text>
                </View>
              )}
              {isCompleted && (
                <View style={styles.completedStatusPill}>
                  <Ionicons name="checkmark" size={13} color="#15803D" />
                  <Text style={styles.completedStatusText}>Completed</Text>
                </View>
              )}
              {isCancelled && (
                <View style={styles.cancelledStatusPill}>
                  <Ionicons name="close" size={13} color="#374151" />
                  <Text style={styles.cancelledStatusText}>Cancelled</Text>
                </View>
              )}
            </View>

            {/* Middle Row: Location */}
            <View style={styles.summaryLocationRow}>
              <Ionicons name="location-outline" size={17} color="#374151" />
              <Text
                style={[
                  styles.summaryInfoText,
                  { color: isDark ? '#E5E7EB' : '#374151' },
                ]}
                numberOfLines={1}
              >
                {request.location?.address || 'SV Road, Near Bus Stand, Dindigul'}
              </Text>
            </View>

            {/* Bottom Row: Date & Time */}
            <View style={styles.summaryDateRow}>
              <Ionicons name="calendar-outline" size={16} color="#374151" />
              <Text
                style={[
                  styles.summaryInfoText,
                  { color: isDark ? '#E5E7EB' : '#374151' },
                ]}
              >
                {formatBookingDate(request.createdAt)}
              </Text>
            </View>
          </View>

          {/* ========================================================= */}
          {/* 2. SERVICE PROGRESS & LIVE ROUTE SECTION                  */}
          {/* ========================================================= */}
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? '#FFFFFF' : '#111827' },
            ]}
          >
            Service Progress
          </Text>

          <View
            style={[
              styles.card,
              styles.progressCard,
              {
                backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                borderColor: isDark ? '#2A2B30' : '#EAECEF',
              },
            ]}
          >
            {/* Left Column: Vertical Timeline Stepper */}
            <View style={styles.timelineColumn}>
              {/* Step 1: Booking Confirmed */}
              <View style={styles.timelineStepRow}>
                <View style={[styles.timelineNode, styles.timelineNodeGreen]}>
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
                <View style={styles.timelineTextGroup}>
                  <Text
                    style={[
                      styles.timelineStepTitle,
                      { color: isDark ? '#FFFFFF' : '#111827' },
                    ]}
                  >
                    Booking Confirmed
                  </Text>
                  <Text style={styles.timelineTimestamp}>10:24 AM</Text>
                </View>
              </View>

              {/* Connector 1-2 */}
              <View style={[styles.timelineConnector, styles.timelineConnectorGreen]} />

              {/* Step 2: Mechanic Accepted */}
              <View style={styles.timelineStepRow}>
                <View
                  style={[
                    styles.timelineNode,
                    activeStep >= 1
                      ? styles.timelineNodeGreen
                      : styles.timelineNodeInactive,
                  ]}
                >
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
                <View style={styles.timelineTextGroup}>
                  <Text
                    style={[
                      styles.timelineStepTitle,
                      { color: isDark ? '#FFFFFF' : '#111827' },
                    ]}
                  >
                    Mechanic Accepted
                  </Text>
                  <Text style={styles.timelineTimestamp}>10:26 AM</Text>
                </View>
              </View>

              {/* Connector 2-3 */}
              <View
                style={[
                  styles.timelineConnector,
                  activeStep >= 2
                    ? styles.timelineConnectorYellow
                    : styles.timelineConnectorInactive,
                ]}
              />

              {/* Step 3: On the Way */}
              <View style={styles.timelineStepRow}>
                <View
                  style={[
                    styles.timelineNode,
                    activeStep >= 2
                      ? styles.timelineNodeYellow
                      : styles.timelineNodeInactive,
                  ]}
                >
                  {activeStep >= 2 ? (
                    <Ionicons name="car" size={13} color="#101114" />
                  ) : (
                    <View style={styles.timelineDot} />
                  )}
                </View>
                <View style={styles.timelineTextGroup}>
                  <Text
                    style={[
                      styles.timelineStepTitle,
                      styles.timelineStepTitleBold,
                      { color: isDark ? '#FFFFFF' : '#111827' },
                    ]}
                  >
                    On the Way
                  </Text>
                  <Text style={styles.timelineEtaText}>
                    ETA: {eta} mins
                  </Text>
                </View>
              </View>

              {/* Connector 3-4 */}
              <View
                style={[
                  styles.timelineConnector,
                  activeStep >= 3
                    ? styles.timelineConnectorYellow
                    : styles.timelineConnectorInactive,
                ]}
              />

              {/* Step 4: In Service */}
              <View style={styles.timelineStepRow}>
                <View
                  style={[
                    styles.timelineNode,
                    activeStep >= 3
                      ? styles.timelineNodeYellow
                      : styles.timelineNodeInactive,
                  ]}
                >
                  <View style={styles.timelineDot} />
                </View>
                <View style={styles.timelineTextGroup}>
                  <Text
                    style={[
                      styles.timelineStepTitle,
                      {
                        color:
                          activeStep >= 3
                            ? isDark
                              ? '#FFFFFF'
                              : '#111827'
                            : '#9CA3AF',
                      },
                    ]}
                  >
                    In Service
                  </Text>
                </View>
              </View>

              {/* Connector 4-5 */}
              <View
                style={[
                  styles.timelineConnector,
                  activeStep >= 4
                    ? styles.timelineConnectorYellow
                    : styles.timelineConnectorInactive,
                ]}
              />

              {/* Step 5: Completed */}
              <View style={styles.timelineStepRow}>
                <View
                  style={[
                    styles.timelineNode,
                    activeStep >= 4
                      ? styles.timelineNodeYellow
                      : styles.timelineNodeInactive,
                  ]}
                >
                  <View style={styles.timelineDot} />
                </View>
                <View style={styles.timelineTextGroup}>
                  <Text
                    style={[
                      styles.timelineStepTitle,
                      {
                        color:
                          activeStep >= 4
                            ? isDark
                              ? '#FFFFFF'
                              : '#111827'
                            : '#9CA3AF',
                      },
                    ]}
                  >
                    Completed
                  </Text>
                </View>
              </View>
            </View>

            {/* Right Column: Live Map Preview */}
            <View style={styles.mapColumn}>
              <Image
                source={require('../../../../assets/images/preview-route-map.png')}
                style={styles.mapPreviewImage}
                resizeMode="cover"
                accessibilityLabel="Live route to customer"
              />
            </View>
          </View>

          {/* ========================================================= */}
          {/* 3. MECHANIC DETAILS CARD                                  */}
          {/* ========================================================= */}
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? '#FFFFFF' : '#111827', marginTop: 20 },
            ]}
          >
            Mechanic Details
          </Text>

          <View
            style={[
              styles.card,
              styles.mechanicCard,
              {
                backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                borderColor: isDark ? '#2A2B30' : '#EAECEF',
              },
            ]}
          >
            {/* Mechanic Photo */}
            <Image
              source={require('../../../../assets/images/thumb-mechanic-avatar.png')}
              style={styles.mechanicPhoto}
              resizeMode="cover"
              accessibilityLabel="Mechanic photo"
            />

            {/* Mechanic Info */}
            <View style={styles.mechanicInfoCol}>
              <Text
                style={[
                  styles.mechanicNameText,
                  { color: isDark ? '#FFFFFF' : '#111827' },
                ]}
                numberOfLines={1}
              >
                {request.mechanic?.fullName || 'Ramesh Kumar'}
              </Text>

              <Text style={styles.mechanicShopText} numberOfLines={1}>
                {request.mechanic?.shopName?.split('&')[0].trim() || 'SR Auto Works'}
              </Text>

              <View style={styles.mechanicRatingRow}>
                <Ionicons name="star" size={14} color={ACCENT_YELLOW} />
                <Text style={styles.mechanicRatingText}>
                  {' '}{request.mechanic?.rating || 4.8} ({request.mechanic?.reviewCount || 120})
                </Text>
              </View>
            </View>

            {/* Call & Chat Action Icons */}
            <View style={styles.mechanicActionsRow}>
              {/* Phone Call */}
              <Pressable
                onPress={handleCallMechanic}
                style={({ pressed }) => [
                  styles.actionCircleButton,
                  { opacity: pressed ? 0.75 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Call mechanic"
              >
                <Ionicons name="call" size={18} color="#111827" />
              </Pressable>

              {/* Chat Message / WhatsApp */}
              <Pressable
                onPress={handleWhatsApp}
                style={({ pressed }) => [
                  styles.actionCircleButton,
                  { opacity: pressed ? 0.75 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Chat with mechanic"
              >
                <Ionicons
                  name="chatbubble-ellipses"
                  size={18}
                  color="#111827"
                />
              </Pressable>
            </View>
          </View>

          {/* Safe Bottom Spacing so content is not hidden by fixed action bar */}
          <View style={{ height: 110 }} />
        </View>
      </ScrollView>

      {/* ========================================================= */}
      {/* 4. FIXED BOTTOM ACTIONS                                    */}
      {/* ========================================================= */}
      <View
        style={[
          styles.bottomActionBar,
          {
            paddingBottom: Math.max(insets.bottom, 12) + 8,
            backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
            borderTopColor: isDark ? '#2A2B30' : '#EAECEF',
          },
        ]}
      >
        <View
          style={[
            styles.bottomActionInner,
            isCenteredScreen && styles.centeredWrapper,
          ]}
        >
          {/* Cancel Booking Action */}
          <Pressable
            onPress={() => setShowCancelModal(true)}
            style={({ pressed }) => [
              styles.cancelButton,
              {
                backgroundColor: isDark ? '#222328' : '#FFFFFF',
                borderColor: isDark ? '#374151' : '#E5E7EB',
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Cancel Booking"
          >
            <Text
              style={[
                styles.cancelButtonText,
                { color: isDark ? '#FFFFFF' : '#111827' },
              ]}
            >
              Cancel Booking
            </Text>
          </Pressable>

          {/* Contact Mechanic Action */}
          <Pressable
            onPress={handleCallMechanic}
            style={({ pressed }) => [
              styles.contactButton,
              { opacity: pressed ? 0.88 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Contact Mechanic"
          >
            <Ionicons name="call" size={17} color="#101114" />
            <Text style={styles.contactButtonText}>Contact Mechanic</Text>
          </Pressable>
        </View>
      </View>

      {/* Cancellation Confirmation Modal */}
      <ConfirmationModal
        visible={showCancelModal}
        title="Cancel This Booking?"
        message="Are you sure you want to cancel roadside assistance? A cancellation notice will be sent to the assigned mechanic."
        confirmText="Yes, Cancel"
        cancelText="Keep Booking"
        isDestructive
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowCancelModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#101114',
  },
  headerSection: {
    backgroundColor: '#101114',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  shareButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  /* BODY */
  scrollContent: {
    flexGrow: 1,
  },
  bodyWrapper: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  centeredWrapper: {
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
    paddingHorizontal: 4,
    letterSpacing: -0.3,
  },

  /* 1. SUMMARY CARD */
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  summaryThumbImage: {
    width: 52,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
  },
  summaryTitleCol: {
    flex: 1,
    marginLeft: 12,
    marginRight: 6,
  },
  summaryServiceName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  summaryBookingId: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  activeStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    paddingVertical: 4,
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
    paddingVertical: 4,
    gap: 4,
  },
  cancelledStatusText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#374151',
  },
  summaryLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  summaryDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryInfoText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },

  /* 2. SERVICE PROGRESS & MAP */
  progressCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  timelineColumn: {
    flex: 1.15,
    justifyContent: 'center',
  },
  timelineStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineNode: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineNodeGreen: {
    backgroundColor: '#16A34A',
  },
  timelineNodeYellow: {
    backgroundColor: ACCENT_YELLOW,
  },
  timelineNodeInactive: {
    backgroundColor: '#E5E7EB',
  },
  timelineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
  },
  timelineTextGroup: {
    marginLeft: 10,
    flex: 1,
  },
  timelineStepTitle: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  timelineStepTitleBold: {
    fontWeight: '800',
  },
  timelineTimestamp: {
    fontSize: 10.5,
    color: '#9CA3AF',
    marginTop: 1,
  },
  timelineEtaText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
    marginTop: 1,
  },
  timelineConnector: {
    width: 2.5,
    height: 20,
    marginLeft: 10,
  },
  timelineConnectorGreen: {
    backgroundColor: '#16A34A',
  },
  timelineConnectorYellow: {
    backgroundColor: ACCENT_YELLOW,
  },
  timelineConnectorInactive: {
    backgroundColor: '#E5E7EB',
  },
  mapColumn: {
    flex: 0.95,
    marginLeft: 10,
    borderRadius: 16,
    overflow: 'hidden',
    height: 215,
  },
  mapPreviewImage: {
    width: '100%',
    height: '100%',
  },

  /* 3. MECHANIC DETAILS */
  mechanicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  mechanicPhoto: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
  },
  mechanicInfoCol: {
    flex: 1,
    marginLeft: 12,
    marginRight: 6,
  },
  mechanicNameText: {
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  mechanicShopText: {
    fontSize: 12.5,
    color: '#6B7280',
    marginTop: 2,
  },
  mechanicRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  mechanicRatingText: {
    fontSize: 12,
    color: '#4B5563',
  },
  mechanicActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionCircleButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* 4. BOTTOM FIXED ACTIONS */
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  bottomActionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    width: '42%',
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  contactButton: {
    width: '54%',
    height: 50,
    borderRadius: 16,
    backgroundColor: ACCENT_YELLOW,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: ACCENT_YELLOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  contactButtonText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#101114',
  },
});
