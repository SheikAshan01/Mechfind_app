import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeContext';
import { ResponsiveNav } from '../../components/navigation/ResponsiveNav';
import { WebFooter } from '../../components/navigation/WebFooter';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { useCustomerStore } from '../../stores/customerStore';
import { useResponsive } from '../../hooks/useResponsive';
import { NearbyMechanic } from '../../types/mechanic';
import { BreakdownRequest } from '../../types/requests';

const ACCENT_YELLOW = '#FFC400';

export default function FindingMechanicWebScreen() {
  const { isDark } = useTheme();
  const { width } = useResponsive();
  const isDesktop = width >= 1024;
  const isTablet = width >= 720 && width < 1024;
  const isMobile = width < 720;

  const params = useLocalSearchParams<{ id?: string; category?: string }>();
  const {
    requests,
    currentLocation,
    vehicles,
    selectedVehicleId,
    createBreakdownRequest,
    cancelRequest,
    updateRequestStatus,
  } = useCustomerStore();

  const [elapsedSeconds, setElapsedSeconds] = useState(3);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Rapido Map interactive zoom & recenter state
  const [mapZoom, setMapZoom] = useState(15);
  const [recenterCount, setRecenterCount] = useState(0);

  // Check reduced motion preference
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setReduceMotion)
      .catch(() => {});
  }, []);

  // Determine active request: prefer requested id -> non-completed request -> first request
  const activeRequest: BreakdownRequest | null = useMemo(() => {
    if (params.id) {
      const found = requests.find((r) => r.id === params.id);
      if (found) return found;
    }
    const live = requests.find((r) => r.status !== 'completed' && r.status !== 'cancelled');
    if (live) return live;
    return requests[0] || null;
  }, [requests, params.id]);

  // If no requests exist in store, initialize a live on-demand request matching the reference design
  useEffect(() => {
    if (!activeRequest && requests.length === 0) {
      const activeVeh = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
      createBreakdownRequest({
        vehicleId: activeVeh ? activeVeh.id : 'veh_default',
        category: 'battery_jumpstart',
        categoryName: 'Battery Jumpstart (4W)',
        description: 'Roadside assistance: Battery Jumpstart requested',
        photos: [],
        landmark: 'Current Location',
        urgency: 'high',
        estimatedCost: 399,
        mechanicId: undefined,
      });
    }
  }, [activeRequest, requests.length, vehicles, selectedVehicleId, createBreakdownRequest]);

  // Current request status flags
  const isSearching =
    Boolean(
      activeRequest &&
      (activeRequest.status === 'submitted' || !activeRequest.mechanic) &&
      activeRequest.status !== 'completed' &&
      activeRequest.status !== 'cancelled'
    );
  const isAccepted = Boolean(
    activeRequest &&
    (activeRequest.status === 'accepted' || activeRequest.status === 'heading_to_customer') &&
    activeRequest.mechanic
  );
  const isCancelled = Boolean(activeRequest && activeRequest.status === 'cancelled');

  // Animated radar ripple rings (3 concentric circles)
  const pulseAnim1 = useRef(new Animated.Value(0)).current;
  const pulseAnim2 = useRef(new Animated.Value(0)).current;
  const pulseAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isSearching || reduceMotion) return;

    const createPulse = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2400,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      );
    };

    const a1 = createPulse(pulseAnim1, 0);
    const a2 = createPulse(pulseAnim2, 800);
    const a3 = createPulse(pulseAnim3, 1600);

    a1.start();
    a2.start();
    a3.start();

    // Elapsed timer counts up: 00:03s, 00:04s...
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
      clearInterval(timer);
    };
  }, [isSearching, reduceMotion, pulseAnim1, pulseAnim2, pulseAnim3]);

  // Real-time synchronization fallback for solo demo/testing:
  // If still searching after 12s, partner workshop accepts dispatch
  useEffect(() => {
    if (!isSearching || !activeRequest) return;

    const autoAcceptTimer = setTimeout(() => {
      const current = useCustomerStore
        .getState()
        .requests.find((r) => r.id === activeRequest.id);
      if (current && (current.status === 'submitted' || !current.mechanic)) {
        const verifiedPartner: NearbyMechanic = {
          id: 'mech_apex_01',
          fullName: 'Ramesh Kumar',
          shopName: 'Apex Speed Garage',
          shopAddress: 'SV Road, Bandra West, Mumbai',
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
          latitude: 19.0596,
          longitude: 72.8295,
          vehicleTypes: ['car', 'bike'],
          specializations: ['Flat Tyre', 'Battery Jumpstart', 'Brake Assistance'],
          pricingStartingAt: 199,
          workingHours: '24/7 Roadside Assistance',
        };

        updateRequestStatus(activeRequest.id, 'accepted', verifiedPartner);
        try {
          const { useMechanicStore } = require('../../stores/mechanicStore');
          useMechanicStore.getState().acceptRequest(activeRequest.id);
        } catch {}
      }
    }, 12000);

    return () => clearTimeout(autoAcceptTimer);
  }, [isSearching, activeRequest?.id, updateRequestStatus]);

  // Rapido interactive map coordinates
  const userLat = activeRequest?.location?.latitude || 19.0596;
  const userLng = activeRequest?.location?.longitude || 72.8295;
  const mechLat = activeRequest?.mechanic?.latitude || 19.0680;
  const mechLng = activeRequest?.mechanic?.longitude || 72.8350;

  const centerLat = (userLat + mechLat) / 2;
  const centerLng = (userLng + mechLng) / 2;

  const mapIframeUrl = useMemo(() => {
    const delta = 0.012 * (15 / mapZoom);
    const minLat = (centerLat - delta).toFixed(5);
    const maxLat = (centerLat + delta).toFixed(5);
    const minLng = (centerLng - delta).toFixed(5);
    const maxLng = (centerLng + delta).toFixed(5);
    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&layer=mapnik&marker=${userLat.toFixed(5)}%2C${userLng.toFixed(5)}`;
  }, [centerLat, centerLng, userLat, userLng, mapZoom, recenterCount]);

  // Helpers
  const formatBookingDate = (dateStr?: string) => {
    if (!dateStr) return 'Today, 10:26 AM';
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
      return 'Today, 10:26 AM';
    }
  };

  const formatBookingId = (bid?: string) => {
    if (!bid) return '#MF10356';
    if (bid.startsWith('#')) return bid;
    const digits = bid.replace(/\D/g, '');
    if (digits.length > 0) {
      return `#MF${digits.padEnd(5, '0').slice(-5)}`;
    }
    return `#MF${bid.slice(-5).toUpperCase()}`;
  };

  const getVehicleDisplay = (req: BreakdownRequest | null) => {
    if (!req) return 'Four-Wheeler (4W)';
    if (req.vehicle?.type === 'bike') return 'Two-Wheeler (2W)';
    if (req.categoryName?.includes('2W')) return 'Two-Wheeler (2W)';
    return 'Four-Wheeler (4W)';
  };

  const getServiceThumbnail = (catName?: string) => {
    const c = (catName || '').toLowerCase();
    if (c.includes('battery')) {
      return require('../../../assets/images/service-battery-thumb.png');
    }
    if (c.includes('oil') || c.includes('engine')) {
      return require('../../../assets/images/thumb-oil-service.png');
    }
    if (c.includes('tyre') || c.includes('tire') || c.includes('puncture')) {
      return require('../../../assets/images/thumb-tyre-service.png');
    }
    return require('../../../assets/images/thumb-general-service.png');
  };

  const handleCall = () => {
    if (activeRequest?.mechanic?.phoneNumber) {
      Linking.openURL(`tel:${activeRequest.mechanic.phoneNumber}`);
    } else {
      Linking.openURL('tel:+919820112345');
    }
  };

  const handleWhatsApp = () => {
    const phone =
      activeRequest?.mechanic?.phoneNumber?.replace(/[^0-9]/g, '') || '919820112345';
    Linking.openURL(
      `https://wa.me/${phone}?text=Hello%2C%20regarding%20my%20MECHFIND%20roadside%20booking%20${activeRequest?.id || ''}`
    );
  };

  const handleConfirmCancel = () => {
    if (!activeRequest) return;
    setIsCancelling(true);
    setTimeout(() => {
      cancelRequest(activeRequest.id, 'Customer cancelled roadside search');
      setIsCancelling(false);
      setShowCancelModal(false);
    }, 400);
  };

  const handleRestartSearch = () => {
    const activeVeh = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
    createBreakdownRequest({
      vehicleId: activeVeh ? activeVeh.id : 'veh_default',
      category: 'battery_jumpstart',
      categoryName: 'Battery Jumpstart (4W)',
      description: 'Roadside assistance: Battery Jumpstart requested',
      photos: [],
      landmark: 'Current Location',
      urgency: 'high',
      estimatedCost: 399,
      mechanicId: undefined,
    });
    setElapsedSeconds(1);
  };

  return (
    <View style={[styles.pageRoot, { backgroundColor: isDark ? '#101114' : '#F5F6F8' }]}>
      {/* 1. WEBSITE HEADER NAVIGATION (Matches existing MECHFIND website) */}
      <ResponsiveNav activeNav="Find a Mechanic" />

      {/* 2. MAIN SCROLLABLE CONTENT (Directly below Navigation - No top banner) */}
      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContainer}>
          {/* ========================================================= */}
          {/* SECTION: MAIN SEARCHING SECTION (Directly below Nav)      */}
          {/* ========================================================= */}
          {isSearching && (
            <View style={styles.searchingBlock}>
              {/* 1. Animated Yellow Radar / Ripple Circles */}
              <View style={styles.radarRippleContainer}>
                <Animated.View
                  style={[
                    styles.radarRippleCircle,
                    !reduceMotion && {
                      transform: [
                        {
                          scale: pulseAnim1.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.65, 2.3],
                          }),
                        },
                      ],
                      opacity: pulseAnim1.interpolate({
                        inputRange: [0, 0.45, 1],
                        outputRange: [0.75, 0.35, 0],
                      }),
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.radarRippleCircle,
                    !reduceMotion && {
                      transform: [
                        {
                          scale: pulseAnim2.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.65, 2.3],
                          }),
                        },
                      ],
                      opacity: pulseAnim2.interpolate({
                        inputRange: [0, 0.45, 1],
                        outputRange: [0.75, 0.35, 0],
                      }),
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.radarRippleCircle,
                    !reduceMotion && {
                      transform: [
                        {
                          scale: pulseAnim3.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.65, 2.3],
                          }),
                        },
                      ],
                      opacity: pulseAnim3.interpolate({
                        inputRange: [0, 0.45, 1],
                        outputRange: [0.75, 0.35, 0],
                      }),
                    },
                  ]}
                />

                {/* Central Yellow Circle with Black Vehicle Icon */}
                <View style={styles.radarCenterCarBadge}>
                  <Ionicons name="car-sport" size={32} color="#101114" />
                </View>
              </View>

              {/* 2. Status Badge: "BROADCASTING DISPATCH (15 KM)" */}
              <View
                style={[
                  styles.broadcastingBadge,
                  {
                    backgroundColor: isDark ? '#262214' : '#FEF9C3',
                    borderColor: isDark ? '#4D3B00' : '#FDE047',
                  },
                ]}
              >
                <View style={styles.liveGreenDot} />
                <Text
                  style={[
                    styles.broadcastingBadgeText,
                    { color: isDark ? '#FFC400' : '#854D0E' },
                  ]}
                >
                  BROADCASTING DISPATCH (15 KM)
                </Text>
              </View>

              {/* 3. Main Heading */}
              <Text
                style={[
                  styles.mainSearchHeading,
                  { color: isDark ? '#FFFFFF' : '#17191F' },
                ]}
              >
                Finding Nearest{' '}
                <Text style={{ color: ACCENT_YELLOW }}>Verified Mechanic...</Text>
              </Text>

              {/* 4. Supporting Text */}
              <Text style={styles.mainSearchSub}>
                Broadcasting your roadside request to verified partner workshops.
                {'\n'}You'll be connected automatically once a mechanic accepts.
              </Text>

              {/* 5. Live Searching Timer Pill */}
              <View
                style={[
                  styles.timerPillWrap,
                  {
                    backgroundColor: isDark ? '#262214' : '#FEF3C7',
                    borderColor: isDark ? '#4D3B00' : '#FDE68A',
                  },
                ]}
              >
                <Ionicons name="time-outline" size={17} color="#B45309" />
                <Text style={styles.timerPillText}>
                  Searching: 00:{elapsedSeconds.toString().padStart(2, '0')}s
                </Text>
              </View>

              {/* 6. Request Details Card (Connected to actual current roadside request) */}
              {activeRequest && (
                <View
                  style={[
                    styles.requestDetailsCard,
                    {
                      backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                      borderColor: isDark ? '#2D3139' : '#EAECEF',
                    },
                  ]}
                >
                  {/* Top Row: Eyebrow + Price */}
                  <View style={styles.requestCardTopRow}>
                    <Text style={styles.requestCardEyebrow}>YOUR REQUEST</Text>
                    <Text style={styles.requestCardPrice}>
                      ₹{activeRequest.estimatedCost || 399}
                    </Text>
                  </View>

                  {/* Body Row: Thumbnail + Service Name + Meta Items */}
                  <View
                    style={[
                      styles.requestCardBodyRow,
                      isMobile && styles.requestCardBodyRowMobile,
                    ]}
                  >
                    {/* Thumbnail */}
                    <View
                      style={[
                        styles.requestThumbnailBox,
                        { backgroundColor: isDark ? '#222328' : '#F3F4F6' },
                      ]}
                    >
                      <Image
                        source={getServiceThumbnail(activeRequest.categoryName)}
                        style={styles.requestThumbnailImg}
                        resizeMode="contain"
                        accessibilityLabel={activeRequest.categoryName}
                      />
                    </View>

                    {/* Service Name & Booking ID */}
                    <View style={styles.requestTitleBlock}>
                      <Text
                        style={[
                          styles.requestServiceName,
                          { color: isDark ? '#FFFFFF' : '#17191F' },
                        ]}
                      >
                        {activeRequest.categoryName || 'Battery Jumpstart (4W)'}
                      </Text>
                      <Text style={styles.requestBookingId}>
                        {formatBookingId(activeRequest.id)}
                      </Text>
                    </View>

                    {/* Metadata Items Row */}
                    <View
                      style={[
                        styles.requestMetaRow,
                        isMobile && styles.requestMetaRowMobile,
                      ]}
                    >
                      {/* Vehicle Type */}
                      <View style={styles.metaItem}>
                        <Ionicons name="car-outline" size={15} color="#6B7280" />
                        <Text style={[styles.metaItemText, { color: isDark ? '#9CA3AF' : '#4B5563' }]}>
                          {getVehicleDisplay(activeRequest)}
                        </Text>
                      </View>

                      {/* Location */}
                      <View style={styles.metaItem}>
                        <Ionicons name="location-outline" size={15} color="#6B7280" />
                        <Text
                          style={[styles.metaItemText, { color: isDark ? '#9CA3AF' : '#4B5563' }]}
                          numberOfLines={1}
                        >
                          {activeRequest.location?.address ||
                            currentLocation?.address ||
                            'Mumbai, Maharashtra'}
                        </Text>
                      </View>

                      {/* Time */}
                      <View style={styles.metaItem}>
                        <Ionicons name="calendar-outline" size={15} color="#6B7280" />
                        <Text style={[styles.metaItemText, { color: isDark ? '#9CA3AF' : '#4B5563' }]}>
                          {formatBookingDate(activeRequest.createdAt)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* 7. Cancel Search Button */}
              <Pressable
                onPress={() => setShowCancelModal(true)}
                style={({ pressed }) => [
                  styles.cancelSearchPillBtn,
                  {
                    backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Cancel Search"
              >
                <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
                <Text style={styles.cancelSearchPillText}>Cancel Search</Text>
              </Pressable>
            </View>
          )}

          {/* ========================================================= */}
          {/* SECTION: ACCEPTED STATE (Actual verified technician)       */}
          {/* ========================================================= */}
          {isAccepted && activeRequest && activeRequest.mechanic && (
            <View style={styles.acceptedBlock}>
              {/* Confirmation Banner */}
              <View style={styles.acceptedConfirmationBanner}>
                <Ionicons name="checkmark-circle" size={24} color="#15803D" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.acceptedBannerTitle}>
                    Mechanic Confirmed! On the Way
                  </Text>
                  <Text style={styles.acceptedBannerSubtitle}>
                    Estimated arrival in {activeRequest.etaMinutes || 11} minutes
                  </Text>
                </View>
              </View>

              {/* Two-Column Accepted Card: Mechanic Details on Left, Rapido-Style Live Route Map on Right */}
              <View
                style={[
                  styles.acceptedCard,
                  isMobile && styles.acceptedCardMobile,
                  {
                    backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                    borderColor: isDark ? '#2D3139' : '#EAECEF',
                  },
                ]}
              >
                {/* Left Column: Mechanic Details */}
                <View style={styles.acceptedMechanicCol}>
                  <Text
                    style={[
                      styles.acceptedSectionHeader,
                      { color: isDark ? '#FFFFFF' : '#111827' },
                    ]}
                  >
                    Assigned Verified Mechanic
                  </Text>

                  <View style={styles.mechanicProfileRow}>
                    <Image
                      source={require('../../../assets/images/thumb-mechanic-avatar.png')}
                      style={styles.mechanicAvatarPhoto}
                      resizeMode="cover"
                      accessibilityLabel="Mechanic Photo"
                    />

                    <View style={styles.mechanicBioCol}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text
                          style={[
                            styles.mechanicFullName,
                            { color: isDark ? '#FFFFFF' : '#111827' },
                          ]}
                        >
                          {activeRequest.mechanic.fullName}
                        </Text>
                        {activeRequest.mechanic.isVerified && (
                          <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                        )}
                      </View>

                      <Text style={styles.mechanicWorkshopName}>
                        {activeRequest.mechanic.shopName}
                      </Text>

                      <View style={styles.mechanicRatingBox}>
                        <Ionicons name="star" size={14} color={ACCENT_YELLOW} />
                        <Text style={styles.mechanicRatingScore}>
                          {' '}{activeRequest.mechanic.rating || 4.9} ({activeRequest.mechanic.reviewCount || 142} reviews)
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Contact Action Buttons */}
                  <View style={styles.contactActionsRow}>
                    <Pressable
                      onPress={handleCall}
                      style={styles.callActionBtn}
                      accessibilityRole="button"
                      accessibilityLabel="Call Mechanic"
                    >
                      <Ionicons name="call" size={16} color="#101114" />
                      <Text style={styles.callActionBtnText}>Call Mechanic</Text>
                    </Pressable>

                    <Pressable
                      onPress={handleWhatsApp}
                      style={styles.whatsappActionBtn}
                      accessibilityRole="button"
                      accessibilityLabel="WhatsApp Chat"
                    >
                      <Ionicons name="logo-whatsapp" size={17} color="#FFFFFF" />
                      <Text style={styles.whatsappActionBtnText}>WhatsApp</Text>
                    </Pressable>
                  </View>

                  {/* Service Summary snippet */}
                  <View
                    style={[
                      styles.acceptedSummarySnippet,
                      {
                        backgroundColor: isDark ? '#222328' : '#F9FAFB',
                        borderColor: isDark ? '#2D3139' : '#E5E7EB',
                      },
                    ]}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#FFFFFF' : '#111827' }}>
                        {activeRequest.categoryName}
                      </Text>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#16A34A' }}>
                        ₹{activeRequest.estimatedCost || 399}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 12, color: '#6B7280' }} numberOfLines={1}>
                      📍 {activeRequest.location?.address}
                    </Text>
                  </View>
                </View>

                {/* Right Column: RAPIDO-STYLE LIVE GPS ROUTE MAP */}
                <View style={styles.acceptedMapCol}>
                  <Text
                    style={[
                      styles.acceptedSectionHeader,
                      { color: isDark ? '#FFFFFF' : '#111827' },
                    ]}
                  >
                    Live GPS Tracking
                  </Text>

                  {/* Rapido Map Container */}
                  <View
                    style={[
                      styles.rapidoMapContainer,
                      { borderColor: isDark ? '#2D3139' : '#EAECEF' },
                    ]}
                  >
                    {/* 1. Geographical Map Tiles */}
                    {Platform.OS === 'web' ? (
                      <View style={styles.rapidoIframeWrap}>
                        <iframe
                          src={mapIframeUrl}
                          title="Rapido Live GPS Route Map"
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 0,
                            filter: isDark ? 'invert(90%) hue-rotate(180deg) contrast(1.15)' : 'none',
                            pointerEvents: 'auto',
                          }}
                        />
                      </View>
                    ) : (
                      <View style={styles.rapidoNativeBackdrop}>
                        <Ionicons name="navigate-circle" size={48} color={ACCENT_YELLOW} />
                      </View>
                    )}

                    {/* 2. Electric Blue Route Path SVG Overlay */}
                    <Svg style={StyleSheet.absoluteFill} pointerEvents="none" width="100%" height="100%">
                      <Path
                        d="M 65 60 Q 130 115, 175 140 T 260 195"
                        stroke="#2563EB"
                        strokeWidth={8}
                        strokeOpacity={0.3}
                        fill="none"
                        strokeLinecap="round"
                      />
                      <Path
                        d="M 65 60 Q 130 115, 175 140 T 260 195"
                        stroke="#3B82F6"
                        strokeWidth={4.5}
                        fill="none"
                        strokeLinecap="round"
                      />
                      <Path
                        d="M 65 60 Q 130 115, 175 140 T 260 195"
                        stroke="#FFFFFF"
                        strokeWidth={1.5}
                        strokeDasharray="4,6"
                        fill="none"
                      />
                    </Svg>

                    {/* 3. Dispatched Mechanic Marker (Rapido Yellow/Black Pin) */}
                    <View style={styles.rapidoMechanicMarker} pointerEvents="none">
                      <View style={styles.rapidoMechanicPin}>
                        <Ionicons name="bicycle" size={17} color="#101114" />
                      </View>
                      <View style={styles.rapidoMechanicPill}>
                        <View style={styles.liveGreenDot} />
                        <Text style={styles.rapidoMechanicPillText}>
                          {activeRequest.mechanic.fullName || 'Dispatched Mechanic'}
                        </Text>
                      </View>
                    </View>

                    {/* 4. Customer Breakdown Spot Pin */}
                    <View style={styles.rapidoCustomerMarker} pointerEvents="none">
                      <View style={styles.rapidoCustomerPulse} />
                      <View style={styles.rapidoCustomerPin}>
                        <Ionicons name="location" size={14} color="#FFFFFF" />
                      </View>
                      <View style={styles.rapidoCustomerPill}>
                        <Text style={styles.rapidoCustomerPillText}>Breakdown Spot</Text>
                      </View>
                    </View>

                    {/* 5. Rapido Top Floating HUD */}
                    <View style={styles.rapidoTopHud} pointerEvents="box-none">
                      <View style={styles.rapidoLiveBadge}>
                        <View style={styles.liveGreenDot} />
                        <Text style={styles.rapidoLiveBadgeText}>LIVE GPS • Just now</Text>
                      </View>

                      <View style={styles.rapidoEtaChip}>
                        <Ionicons name="car" size={13} color="#FFC400" />
                        <Text style={styles.rapidoEtaChipText}>
                          ~{activeRequest.etaMinutes || 11} mins ({activeRequest.mechanic.distanceKm || 2.1} km)
                        </Text>
                      </View>
                    </View>

                    {/* 6. Rapido Floating Map Controls */}
                    <View style={styles.rapidoControlsCol} pointerEvents="box-none">
                      <Pressable
                        onPress={() => setMapZoom((z) => Math.min(18, z + 1))}
                        style={[
                          styles.rapidoControlBtn,
                          {
                            backgroundColor: isDark ? 'rgba(26, 27, 31, 0.94)' : 'rgba(255, 255, 255, 0.94)',
                            borderColor: isDark ? '#2D3139' : '#E5E7EB',
                          },
                        ]}
                        accessibilityLabel="Zoom In"
                      >
                        <Ionicons name="add" size={16} color={isDark ? '#FFFFFF' : '#101114'} />
                      </Pressable>

                      <Pressable
                        onPress={() => setMapZoom((z) => Math.max(12, z - 1))}
                        style={[
                          styles.rapidoControlBtn,
                          {
                            backgroundColor: isDark ? 'rgba(26, 27, 31, 0.94)' : 'rgba(255, 255, 255, 0.94)',
                            borderColor: isDark ? '#2D3139' : '#E5E7EB',
                          },
                        ]}
                        accessibilityLabel="Zoom Out"
                      >
                        <Ionicons name="remove" size={16} color={isDark ? '#FFFFFF' : '#101114'} />
                      </Pressable>

                      <Pressable
                        onPress={() => {
                          setMapZoom(15);
                          setRecenterCount((c) => c + 1);
                        }}
                        style={[
                          styles.rapidoControlBtn,
                          {
                            backgroundColor: isDark ? 'rgba(26, 27, 31, 0.94)' : 'rgba(255, 255, 255, 0.94)',
                            borderColor: isDark ? '#2D3139' : '#E5E7EB',
                          },
                        ]}
                        accessibilityLabel="Recenter Map"
                      >
                        <Ionicons name="locate" size={15} color="#FFC400" />
                      </Pressable>
                    </View>

                    {/* 7. Rapido Bottom Status Banner */}
                    <View style={styles.rapidoBottomStatusChip}>
                      <View style={styles.rapidoStatusPulseDot} />
                      <Text style={styles.rapidoBottomStatusText} numberOfLines={1}>
                        Mechanic en route • Arriving via SV Road (~{activeRequest.etaMinutes || 11} mins)
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Cancel Booking Action */}
              <Pressable
                onPress={() => setShowCancelModal(true)}
                style={styles.cancelBookingTextBtn}
                accessibilityRole="button"
              >
                <Text style={styles.cancelBookingText}>Cancel Booking</Text>
              </Pressable>
            </View>
          )}

          {/* ========================================================= */}
          {/* SECTION: CANCELLED STATE                                  */}
          {/* ========================================================= */}
          {isCancelled && (
            <View
              style={[
                styles.stateCard,
                {
                  backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                  borderColor: isDark ? '#2D3139' : '#EAECEF',
                },
              ]}
            >
              <View style={[styles.stateIconCircle, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="close-circle" size={36} color="#DC2626" />
              </View>
              <Text
                style={[
                  styles.stateCardTitle,
                  { color: isDark ? '#FFFFFF' : '#111827' },
                ]}
              >
                Search Cancelled
              </Text>
              <Text style={styles.stateCardSubtitle}>
                This roadside assistance request was cancelled. No technician was dispatched. You can start a new search anytime.
              </Text>
              <Pressable
                onPress={handleRestartSearch}
                style={styles.statePrimaryBtn}
                accessibilityRole="button"
              >
                <Ionicons name="flash" size={17} color="#101114" />
                <Text style={styles.statePrimaryBtnText}>Start New Roadside Search</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Subtle Warm Bottom Ambient Curves */}
        <View style={styles.bottomAmbientWrap} pointerEvents="none">
          <Svg width="100%" height="90" viewBox="0 0 1440 90" preserveAspectRatio="none">
            <Path
              d="M0 60 C 320 90, 720 20, 1440 70 L 1440 90 L 0 90 Z"
              fill={ACCENT_YELLOW}
              opacity={0.35}
            />
            <Path
              d="M0 75 C 480 30, 960 90, 1440 60 L 1440 90 L 0 90 Z"
              fill={ACCENT_YELLOW}
              opacity={0.2}
            />
          </Svg>
        </View>

        {/* 3. WEBSITE FOOTER */}
        <WebFooter />
      </ScrollView>

      {/* Cancellation Confirmation Modal */}
      <ConfirmationModal
        visible={showCancelModal}
        title="Cancel Roadside Search?"
        message="Are you sure you want to cancel your roadside assistance search? Your request will be withdrawn from nearby partner workshops."
        confirmText="Yes, Cancel"
        cancelText="Keep Searching"
        isDestructive
        isLoading={isCancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowCancelModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pageRoot: {
    flex: 1,
  },
  pageScroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainContainer: {
    width: '100%',
    maxWidth: 1140,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 28,
  },

  /* ========================================================= */
  /* SEARCHING BLOCK STYLES                                    */
  /* ========================================================= */
  searchingBlock: {
    alignItems: 'center',
    width: '100%',
  },

  /* Radar Ripple Animation */
  radarRippleContainer: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  radarRippleCircle: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: ACCENT_YELLOW,
    backgroundColor: 'rgba(255, 196, 0, 0.08)',
  },
  radarCenterCarBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: ACCENT_YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ACCENT_YELLOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 8,
    zIndex: 10,
  },

  /* Broadcasting Badge */
  broadcastingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    marginBottom: 14,
  },
  liveGreenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  broadcastingBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },

  /* Main Heading */
  mainSearchHeading: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 40,
    marginBottom: 8,
  },

  /* Supporting Text */
  mainSearchSub: {
    fontSize: 14.5,
    color: '#737B8C',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 18,
    maxWidth: 620,
  },

  /* Live Search Timer Pill */
  timerPillWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    marginBottom: 28,
  },
  timerPillText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#92400E',
  },

  /* ========================================================= */
  /* REQUEST DETAILS CARD                                      */
  /* ========================================================= */
  requestDetailsCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 26,
  },
  requestCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  requestCardEyebrow: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.8,
  },
  requestCardPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#16A34A',
  },
  requestCardBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  requestCardBodyRowMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
  },
  requestThumbnailBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  requestThumbnailImg: {
    width: '88%',
    height: '88%',
  },
  requestTitleBlock: {
    minWidth: 190,
  },
  requestServiceName: {
    fontSize: 16.5,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  requestBookingId: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  requestMetaRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 24,
    flexWrap: 'wrap',
  },
  requestMetaRowMobile: {
    width: '100%',
    justifyContent: 'flex-start',
    gap: 14,
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB66',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaItemText: {
    fontSize: 13,
    fontWeight: '600',
  },

  /* ========================================================= */
  /* CANCEL SEARCH PILL BUTTON                                 */
  /* ========================================================= */
  cancelSearchPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    paddingHorizontal: 32,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    marginTop: 4,
  },
  cancelSearchPillText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#EF4444',
  },

  /* ========================================================= */
  /* ACCEPTED STATE STYLES                                     */
  /* ========================================================= */
  acceptedBlock: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
  },
  acceptedConfirmationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  acceptedBannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#15803D',
  },
  acceptedBannerSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
    marginTop: 2,
  },
  acceptedCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    flexDirection: 'row',
    gap: 24,
  },
  acceptedCardMobile: {
    flexDirection: 'column',
  },
  acceptedMechanicCol: {
    flex: 1.1,
  },
  acceptedMapCol: {
    flex: 0.9,
  },
  acceptedSectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 14,
  },
  mechanicProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  mechanicAvatarPhoto: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  mechanicBioCol: {
    flex: 1,
  },
  mechanicFullName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  mechanicWorkshopName: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  mechanicRatingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  mechanicRatingScore: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#4B5563',
  },
  contactActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  callActionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: ACCENT_YELLOW,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  callActionBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#101114',
  },
  whatsappActionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  whatsappActionBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  acceptedSummarySnippet: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },

  /* ========================================================= */
  /* RAPIDO-STYLE LIVE GPS MAP STYLES                          */
  /* ========================================================= */
  rapidoMapContainer: {
    height: 250,
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  rapidoIframeWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  rapidoNativeBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16171B',
  },
  rapidoMechanicMarker: {
    position: 'absolute',
    top: '20%',
    left: '18%',
    alignItems: 'center',
    zIndex: 9,
  },
  rapidoMechanicPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#101114',
    borderWidth: 2.5,
    borderColor: ACCENT_YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  rapidoMechanicPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 17, 20, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 4,
    gap: 5,
  },
  rapidoMechanicPillText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  rapidoCustomerMarker: {
    position: 'absolute',
    bottom: '22%',
    right: '20%',
    alignItems: 'center',
    zIndex: 9,
  },
  rapidoCustomerPulse: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
  },
  rapidoCustomerPin: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#2563EB',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  rapidoCustomerPill: {
    backgroundColor: 'rgba(16, 17, 20, 0.9)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
    marginTop: 3,
  },
  rapidoCustomerPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  rapidoTopHud: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  rapidoLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 17, 20, 0.88)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  rapidoLiveBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  rapidoEtaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 17, 20, 0.88)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  rapidoEtaChipText: {
    color: '#FFC400',
    fontSize: 11,
    fontWeight: '800',
  },
  rapidoControlsCol: {
    position: 'absolute',
    right: 10,
    top: 48,
    gap: 6,
    zIndex: 10,
  },
  rapidoControlBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  rapidoBottomStatusChip: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 17, 20, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    gap: 7,
    zIndex: 10,
  },
  rapidoStatusPulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#16A34A',
  },
  rapidoBottomStatusText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
    flex: 1,
  },
  cancelBookingTextBtn: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 12,
    cursor: 'pointer',
  },
  cancelBookingText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  /* ========================================================= */
  /* CANCELLED / FAILED STATE STYLES                           */
  /* ========================================================= */
  stateCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  stateIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  stateCardTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  stateCardSubtitle: {
    fontSize: 13.5,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  statePrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT_YELLOW,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    gap: 6,
  },
  statePrimaryBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#101114',
  },

  /* Ambient Bottom Curves */
  bottomAmbientWrap: {
    width: '100%',
    height: 90,
    overflow: 'hidden',
  },
});
