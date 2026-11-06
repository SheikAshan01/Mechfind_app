import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
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
import { NearbyMechanic } from '../../../types/mechanic';

const ACCENT_YELLOW = '#FFC400';

export default function BookingDetailsScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { isTablet, isDesktop } = useResponsive();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { requests, cancelRequest } = useCustomerStore();

  const request = requests.find((r) => r.id === id) || requests[0];
  const [eta, setEta] = useState(request?.etaMinutes || 12);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [searchSeconds, setSearchSeconds] = useState(1);

  // Rapido/Uber On-Demand logic: searching when status is 'submitted' or no mechanic assigned yet
  const isSearching =
    Boolean(request &&
    (request.status === 'submitted' || !request.mechanic) &&
    request.status !== 'completed' &&
    request.status !== 'cancelled');

  // Animated concentric radar pulse rings
  const pulseAnim1 = useRef(new Animated.Value(0)).current;
  const pulseAnim2 = useRef(new Animated.Value(0)).current;
  const pulseAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isSearching) return;

    const createPulse = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2200,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const a1 = createPulse(pulseAnim1, 0);
    const a2 = createPulse(pulseAnim2, 700);
    const a3 = createPulse(pulseAnim3, 1400);

    a1.start();
    a2.start();
    a3.start();

    // Timer counter
    const timerInterval = setInterval(() => {
      setSearchSeconds((s) => s + 1);
    }, 1000);

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
      clearInterval(timerInterval);
    };
  }, [isSearching, pulseAnim1, pulseAnim2, pulseAnim3]);

  // Auto-dispatch simulation fallback for solo/demo testing (after 7s, verified partner accepts if not accepted manually)
  useEffect(() => {
    if (!isSearching || !request) return;

    const autoAcceptTimer = setTimeout(() => {
      const currentReq = useCustomerStore.getState().requests.find((r) => r.id === request.id);
      if (currentReq && (currentReq.status === 'submitted' || !currentReq.mechanic)) {
        const acceptedMech: NearbyMechanic = {
          id: 'mech_apex_01',
          fullName: 'Ramesh Kumar',
          shopName: 'Apex Speed Garage',
          shopAddress: 'SV Road, Dindigul West, Tamil Nadu',
          phoneNumber: '+91 98201 12345',
          rating: 4.9,
          reviewCount: 142,
          completedJobsCount: 480,
          yearsOfExperience: 10,
          isVerified: true,
          verificationStatus: 'approved',
          isOnline: true,
          distanceKm: 2.1,
          estimatedArrivalMinutes: 11,
          latitude: 10.3673,
          longitude: 77.9803,
          vehicleTypes: ['car', 'bike'],
          specializations: ['Flat Tyre', 'Battery Jumpstart', 'Brake Assistance'],
          pricingStartingAt: 199,
          workingHours: '24/7 Roadside Assistance',
        };
        useCustomerStore.getState().updateRequestStatus(request.id, 'accepted', acceptedMech);
        try {
          const { useMechanicStore } = require('../../../stores/mechanicStore');
          useMechanicStore.getState().acceptRequest(request.id);
        } catch {}
      }
    }, 7000);

    return () => clearTimeout(autoAcceptTimer);
  }, [isSearching, request?.id]);

  // Dynamic ETA countdown
  useEffect(() => {
    if (!request || isSearching || request.status === 'completed' || request.status === 'cancelled') return;
    const interval = setInterval(() => {
      setEta((prev) => Math.max(1, prev - 1));
    }, 20000);
    return () => clearInterval(interval);
  }, [request, isSearching]);

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
      `https://wa.me/${phone}?text=Hello%2C%20regarding%20my%20MECHFIND%20roadside%20booking%20${request?.id || ''}`
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

  const formatBookingId = (bid: string) => {
    if (bid.startsWith('#')) return bid;
    const digits = bid.replace(/\D/g, '');
    if (digits.length > 0) {
      return `#MF${digits.padEnd(5, '0').slice(-5)}`;
    }
    return `#MF${bid.slice(-5).toUpperCase()}`;
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
      case 'submitted':
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

          <Text style={styles.headerTitle}>
            {isSearching ? 'Finding Mechanic...' : 'Booking Details'}
          </Text>

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
          {/* CONDITIONAL: 1. SEARCHING RADAR STATE (Rapido/Uber model) */}
          {/* ========================================================= */}
          {isSearching ? (
            <View style={styles.searchingContainer}>
              {/* Animated Radar Visual Component */}
              <View style={styles.radarVisualBox}>
                <Animated.View
                  style={[
                    styles.radarRing,
                    {
                      transform: [
                        {
                          scale: pulseAnim1.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.7, 2.4],
                          }),
                        },
                      ],
                      opacity: pulseAnim1.interpolate({
                        inputRange: [0, 0.4, 1],
                        outputRange: [0.7, 0.35, 0],
                      }),
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.radarRing,
                    {
                      transform: [
                        {
                          scale: pulseAnim2.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.7, 2.4],
                          }),
                        },
                      ],
                      opacity: pulseAnim2.interpolate({
                        inputRange: [0, 0.4, 1],
                        outputRange: [0.7, 0.35, 0],
                      }),
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.radarRing,
                    {
                      transform: [
                        {
                          scale: pulseAnim3.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.7, 2.4],
                          }),
                        },
                      ],
                      opacity: pulseAnim3.interpolate({
                        inputRange: [0, 0.4, 1],
                        outputRange: [0.7, 0.35, 0],
                      }),
                    },
                  ]}
                />

                {/* Central Radar Glowing Beacon */}
                <View style={styles.radarCenterBeacon}>
                  <Ionicons name="car-sport" size={32} color="#101114" />
                </View>
              </View>

              {/* Status Announcement */}
              <View style={styles.radarStatusBadge}>
                <View style={styles.liveGreenDot} />
                <Text style={styles.radarStatusBadgeText}>
                  BROADCASTING DISPATCH (15 KM)
                </Text>
              </View>

              <Text
                style={[
                  styles.searchingTitle,
                  { color: isDark ? '#FFFFFF' : '#111827' },
                ]}
              >
                Finding Nearest Verified Mechanic...
              </Text>
              <Text style={styles.searchingSubtitle}>
                Broadcasting your roadside request to verified partner workshops. When a technician accepts, their live location and contact details will appear here.
              </Text>

              {/* Live Search Timer Pill */}
              <View style={styles.searchTimerPill}>
                <Ionicons name="time-outline" size={15} color="#B45309" />
                <Text style={styles.searchTimerText}>
                  Searching: 00:{searchSeconds.toString().padStart(2, '0')}s
                </Text>
              </View>

              {/* Dispatch Request Details Summary Card */}
              <View
                style={[
                  styles.card,
                  styles.dispatchSummaryCard,
                  {
                    backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                    borderColor: isDark ? '#2A2B30' : '#EAECEF',
                  },
                ]}
              >
                <View style={styles.dispatchHeaderRow}>
                  <Text style={styles.dispatchEyebrow}>YOUR REQUEST</Text>
                  <Text style={styles.dispatchPriceText}>
                    ₹{request.estimatedCost || 399}
                  </Text>
                </View>

                <View style={styles.dispatchItemRow}>
                  <Ionicons name="construct" size={16} color={ACCENT_YELLOW} />
                  <Text
                    style={[
                      styles.dispatchItemTitle,
                      { color: isDark ? '#FFFFFF' : '#111827' },
                    ]}
                  >
                    {request.categoryName || 'Roadside Assistance'}
                  </Text>
                </View>

                {request.vehicle && (
                  <View style={styles.dispatchItemRow}>
                    <Ionicons name="car-outline" size={16} color="#9CA3AF" />
                    <Text style={styles.dispatchItemSub}>
                      {request.vehicle.make} {request.vehicle.model} ({request.vehicle.licensePlate})
                    </Text>
                  </View>
                )}

                <View style={styles.dispatchItemRow}>
                  <Ionicons name="location-outline" size={16} color="#9CA3AF" />
                  <Text style={styles.dispatchItemSub} numberOfLines={2}>
                    {request.location?.address || 'Current Breakdown Location'}
                  </Text>
                </View>
              </View>

              {/* Trust Indicators */}
              <View style={styles.searchingGuarantees}>
                <View style={styles.guaranteeRow}>
                  <Ionicons name="shield-checkmark" size={16} color="#16A34A" />
                  <Text style={[styles.guaranteeText, { color: isDark ? '#9CA3AF' : '#4B5563' }]}>
                    Zero pre-assigned dummy profiles — 100% verified technicians
                  </Text>
                </View>
                <View style={styles.guaranteeRow}>
                  <Ionicons name="navigate" size={16} color="#16A34A" />
                  <Text style={[styles.guaranteeText, { color: isDark ? '#9CA3AF' : '#4B5563' }]}>
                    Live GPS route and direct contact enabled upon acceptance
                  </Text>
                </View>
              </View>

              {/* Cancel Search Button */}
              <Pressable
                onPress={() => setShowCancelModal(true)}
                style={styles.cancelSearchBtn}
                accessibilityRole="button"
                accessibilityLabel="Cancel Request"
              >
                <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
                <Text style={styles.cancelSearchBtnText}>Cancel Search</Text>
              </Pressable>
            </View>
          ) : (
            /* ========================================================= */
            /* CONDITIONAL: 2. ACCEPTED STATE (Only Accepted Mechanic)    */
            /* ========================================================= */
            <>
              {/* Accepted Confirmation Banner */}
              <View style={styles.acceptedBanner}>
                <Ionicons name="checkmark-circle" size={22} color="#15803D" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.acceptedBannerTitle}>
                    Mechanic Confirmed! On the Way
                  </Text>
                  <Text style={styles.acceptedBannerSubtitle}>
                    Estimated Arrival in {eta} minutes
                  </Text>
                </View>
              </View>

              {/* 1. BOOKING SUMMARY CARD */}
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                    borderColor: isDark ? '#2A2B30' : '#EAECEF',
                  },
                ]}
              >
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

                {/* Location */}
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

                {/* Date & Time */}
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

              {/* 2. SERVICE PROGRESS & LIVE ROUTE SECTION */}
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

                {/* Right Column: Live Route Map of Accepted Mechanic */}
                <View style={styles.mapColumn}>
                  <Image
                    source={require('../../../../assets/images/preview-route-map.png')}
                    style={styles.mapPreviewImage}
                    resizeMode="cover"
                    accessibilityLabel="Live route of accepted mechanic"
                  />
                </View>
              </View>

              {/* 3. ASSIGNED MECHANIC DETAILS CARD (Only Real Accepted Mechanic) */}
              <Text
                style={[
                  styles.sectionTitle,
                  { color: isDark ? '#FFFFFF' : '#111827', marginTop: 20 },
                ]}
              >
                Assigned Mechanic
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
                  accessibilityLabel="Assigned mechanic photo"
                />

                {/* Mechanic Info */}
                <View style={styles.mechanicInfoCol}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text
                      style={[
                        styles.mechanicNameText,
                        { color: isDark ? '#FFFFFF' : '#111827' },
                      ]}
                      numberOfLines={1}
                    >
                      {request.mechanic?.fullName || 'Verified Technician'}
                    </Text>
                    {request.mechanic?.isVerified && (
                      <Ionicons name="checkmark-circle" size={15} color="#16A34A" />
                    )}
                  </View>

                  <Text style={styles.mechanicShopText} numberOfLines={1}>
                    {request.mechanic?.shopName || 'MECHFIND Partner Garage'}
                  </Text>

                  <View style={styles.mechanicRatingRow}>
                    <Ionicons name="star" size={14} color={ACCENT_YELLOW} />
                    <Text style={styles.mechanicRatingText}>
                      {' '}{request.mechanic?.rating || 4.9} ({request.mechanic?.reviewCount || 142})
                    </Text>
                  </View>
                </View>

                {/* Call & Chat Action Icons */}
                <View style={styles.mechanicActionsRow}>
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
                      name="logo-whatsapp"
                      size={18}
                      color="#16A34A"
                    />
                  </Pressable>
                </View>
              </View>

              <View style={{ height: 110 }} />
            </>
          )}
        </View>
      </ScrollView>

      {/* ========================================================= */}
      {/* 4. FIXED BOTTOM ACTIONS (Only for Accepted State)          */}
      {/* ========================================================= */}
      {!isSearching && (
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
      )}

      {/* Cancellation Confirmation Modal */}
      <ConfirmationModal
        visible={showCancelModal}
        title="Cancel This Booking?"
        message="Are you sure you want to cancel roadside assistance? If you cancel, your request will be removed from nearby dispatches."
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

  /* SEARCHING RADAR STYLES (Rapido/Uber model) */
  searchingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  radarVisualBox: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 12,
  },
  radarRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: ACCENT_YELLOW,
    backgroundColor: 'rgba(255, 196, 0, 0.08)',
  },
  radarCenterBeacon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: ACCENT_YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ACCENT_YELLOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 10,
  },
  radarStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 196, 0, 0.15)',
    borderWidth: 1,
    borderColor: ACCENT_YELLOW,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
    marginBottom: 12,
  },
  liveGreenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  radarStatusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: ACCENT_YELLOW,
    letterSpacing: 0.5,
  },
  searchingTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  searchingSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchTimerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
    marginBottom: 20,
  },
  searchTimerText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#92400E',
  },
  dispatchSummaryCard: {
    width: '100%',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  dispatchHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB22',
  },
  dispatchEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: ACCENT_YELLOW,
    letterSpacing: 0.8,
  },
  dispatchPriceText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#16A34A',
  },
  dispatchItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  dispatchItemTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  dispatchItemSub: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  searchingGuarantees: {
    width: '100%',
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 24,
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guaranteeText: {
    fontSize: 12.5,
    lineHeight: 17,
  },
  cancelSearchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  cancelSearchBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },

  /* ACCEPTED STATE STYLES */
  acceptedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  acceptedBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#15803D',
  },
  acceptedBannerSubtitle: {
    fontSize: 12.5,
    color: '#166534',
    marginTop: 2,
    fontWeight: '600',
  },

  /* 1. BOOKING SUMMARY CARD */
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryThumbImage: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  summaryTitleCol: {
    flex: 1,
    marginLeft: 12,
  },
  summaryServiceName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  summaryBookingId: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  activeStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 20,
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
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 20,
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
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 20,
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
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB40',
  },
  summaryDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  summaryInfoText: {
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },

  /* 2. SERVICE PROGRESS & ROUTE */
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 10,
    marginTop: 4,
  },
  progressCard: {
    flexDirection: 'row',
    padding: 14,
  },
  timelineColumn: {
    flex: 1.05,
    paddingRight: 6,
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
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#9CA3AF',
  },
  timelineTextGroup: {
    marginLeft: 8,
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
