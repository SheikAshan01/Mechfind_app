import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../../theme/ThemeContext';
import { BRAND_COLORS } from '../../../theme/colors';
import { useResponsive } from '../../../hooks/useResponsive';
import { useAuthStore } from '../../../stores/authStore';
import { useCustomerStore } from '../../../stores/customerStore';
import { locationService } from '../../../services/location/locationService';
import { mechanicSearchService } from '../../../services/mechanic/mechanicSearchService';
import { pricingService } from '../../../services/pricing/pricingService';
import { NearbyMechanic } from '../../../types/mechanic';
import {
  GeneralServiceIcon,
  BatteryServiceIcon,
  TyreServiceIcon,
  OilChangeIcon,
  BreakdownSupportIcon,
  ACServiceIcon,
  CarCareIcon,
  MoreServicesIcon,
} from '../../../components/home/ServiceIcons';

const ACCENT_YELLOW = '#FFC400';

export default function CustomerDashboardScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, isTablet, isDesktop } = useResponsive();

  const user = useAuthStore((state) => state.user);
  const {
    vehicles,
    selectedVehicleId,
    requests,
    currentLocation,
    setCurrentLocation,
    nearbyMechanics: storeMechanics,
    initializeStore,
  } = useCustomerStore();

  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mechanics, setMechanics] = useState<NearbyMechanic[]>([]);

  // Entrance animation
  const entrance = useSharedValue(0);
  useEffect(() => {
    entrance.value = withDelay(
      60,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
  }, [entrance]);

  const entranceStyle = useAnimatedStyle(() => ({
    opacity: entrance.value,
    transform: [{ translateY: (1 - entrance.value) * 16 }],
  }));

  // Initialize store and load initial data
  useEffect(() => {
    initializeStore();
  }, []);

  // Sync mechanics with store or fetch
  useEffect(() => {
    if (storeMechanics && storeMechanics.length > 0) {
      setMechanics(storeMechanics);
    }
  }, [storeMechanics]);

  // Find active booking
  const activeRequest = useMemo(() => {
    return (
      requests.find(
        (r) =>
          (!user || r.customerId === user.id) &&
          r.status !== 'completed' &&
          r.status !== 'cancelled'
      ) || requests[0] || null
    );
  }, [requests, user]);

  // Refresh current GPS location
  const refreshLocation = async () => {
    setIsLocating(true);
    try {
      const location = await locationService.getCurrentLocation();
      setCurrentLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
      });
    } catch {
      // Graceful fallback to default address
    } finally {
      setIsLocating(false);
    }
  };

  // Find nearby mechanics
  const findMechanics = async () => {
    setIsSearching(true);
    try {
      const loc = currentLocation;
      const res = await mechanicSearchService.searchNearby({
        latitude: loc.latitude,
        longitude: loc.longitude,
        radiusKm: 15,
        vehicleType: 'all',
      });
      if (res.mechanics.length > 0) {
        setMechanics(res.mechanics);
      }
      router.push('/(customer)/nearby-mechanics');
    } catch {
      router.push('/(customer)/nearby-mechanics');
    } finally {
      setIsSearching(false);
    }
  };

  const customerName = user?.fullName?.split(' ')[0] || 'Ashan';
  const displayLocation = isLocating
    ? 'Detecting location…'
    : currentLocation.address && !currentLocation.address.startsWith('Mumbai,')
      ? currentLocation.address.split(',').slice(0, 2).join(', ')
      : 'Dindigul West, Dindigul';

  // Calculate timeline progress index for active booking
  const getTimelineStepIndex = (status?: string) => {
    if (!status) return 1;
    switch (status) {
      case 'searching':
      case 'pending':
      case 'accepted':
        return 0; // Confirmed
      case 'assigned':
      case 'heading_to_customer':
        return 1; // On the Way
      case 'arrived':
      case 'diagnosing':
      case 'quote_sent':
      case 'work_in_progress':
        return 2; // In Service
      case 'work_completed':
      case 'completed':
        return 3; // Completed
      default:
        return 1;
    }
  };

  const currentStep = getTimelineStepIndex(activeRequest?.status);

  // Status badge label
  const getStatusBadgeLabel = (status?: string) => {
    if (!status || status === 'heading_to_customer') return 'Heading to Customer';
    if (status === 'assigned') return 'Mechanic Assigned';
    if (status === 'arrived') return 'Mechanic Arrived';
    if (status === 'work_in_progress') return 'In Service';
    if (status === 'completed') return 'Completed';
    return status.replaceAll('_', ' ');
  };

  // 8 Service category shortcuts
  const serviceCategories = [
    {
      id: 'general',
      name: 'General\nService',
      icon: <GeneralServiceIcon size={34} />,
      onPress: () =>
        router.push({
          pathname: '/(customer)/breakdown-request',
          params: { category: 'general_diagnostics' },
        }),
    },
    {
      id: 'battery',
      name: 'Battery\nService',
      icon: <BatteryServiceIcon size={34} />,
      onPress: () =>
        router.push({
          pathname: '/(customer)/breakdown-request',
          params: { category: 'battery_jumpstart' },
        }),
    },
    {
      id: 'tyre',
      name: 'Tyre\nService',
      icon: <TyreServiceIcon size={34} />,
      onPress: () =>
        router.push({
          pathname: '/(customer)/breakdown-request',
          params: { category: 'flat_tyre' },
        }),
    },
    {
      id: 'oil',
      name: 'Oil\nChange',
      icon: <OilChangeIcon size={34} />,
      onPress: () =>
        router.push({
          pathname: '/(customer)/breakdown-request',
          params: { category: 'engine_overheating' },
        }),
    },
    {
      id: 'breakdown',
      name: 'Breakdown\nSupport',
      icon: <BreakdownSupportIcon size={34} />,
      onPress: () => router.push('/(customer)/breakdown-request'),
    },
    {
      id: 'ac',
      name: 'AC\nService',
      icon: <ACServiceIcon size={34} />,
      onPress: () =>
        router.push({
          pathname: '/(customer)/breakdown-request',
          params: { category: 'ac_service' },
        }),
    },
    {
      id: 'care',
      name: 'Car Care\n(Wash & Clean)',
      icon: <CarCareIcon size={34} />,
      onPress: () =>
        router.push({
          pathname: '/(customer)/breakdown-request',
          params: { category: 'car_care' },
        }),
    },
    {
      id: 'more',
      name: 'More\nServices',
      icon: <MoreServicesIcon size={34} />,
      onPress: () => router.push('/(customer)/services-pricing'),
    },
  ];

  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 20);
  const isCenteredScreen = isTablet || isDesktop;

  return (
    <View style={[styles.screen, { backgroundColor: isDark ? '#101114' : '#F1F2F4' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView
        bounces={false}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: isDark ? '#101114' : '#F1F2F4' }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.mainWrapper,
            isCenteredScreen && styles.centeredWrapper,
            entranceStyle,
          ]}
        >
          {/* ========================================================= */}
          {/* A. HEADER (Dark Metallic Section)                         */}
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
                {/* Theme Toggle Button (Dark / Light Mode) */}
                <Pressable
                  onPress={toggleTheme}
                  style={({ pressed }) => [
                    styles.iconCircleButton,
                    { opacity: pressed ? 0.75 : 1 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  <Ionicons
                    name={isDark ? 'sunny-outline' : 'moon-outline'}
                    size={20}
                    color={isDark ? ACCENT_YELLOW : '#FFFFFF'}
                  />
                </Pressable>

                {/* Notification Bell with Yellow Unread Badge */}
                <Pressable
                  onPress={() => router.push('/(customer)/(tabs)/requests')}
                  style={({ pressed }) => [
                    styles.iconCircleButton,
                    { opacity: pressed ? 0.75 : 1 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Notifications"
                >
                  <Ionicons name="notifications-outline" size={21} color="#FFFFFF" />
                  <View style={styles.notificationDot} />
                </Pressable>

                {/* Profile Avatar Button */}
                <Pressable
                  onPress={() => router.push('/(customer)/(tabs)/profile')}
                  style={({ pressed }) => [
                    styles.profileAvatarButton,
                    { opacity: pressed ? 0.75 : 1 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Open customer profile"
                >
                  <Ionicons name="person" size={17} color="#101114" />
                </Pressable>
              </View>
            </View>

            {/* Greeting: Hello, Name 👋 + Subtitle */}
            <View style={styles.greetingArea}>
              <Text style={styles.greetingTitle}>Hello, {customerName} 👋</Text>
              <Text style={styles.greetingSubtitle}>Need vehicle help today?</Text>
            </View>

            {/* ========================================================= */}
            {/* B. LOCATION SELECTOR PILL                                 */}
            {/* ========================================================= */}
            <Pressable
              onPress={refreshLocation}
              style={({ pressed }) => [
                styles.locationPill,
                { opacity: pressed ? 0.85 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Current location: ${displayLocation}. Tap to refresh.`}
            >
              <Ionicons name="location" size={18} color={ACCENT_YELLOW} />
              <Text style={styles.locationText} numberOfLines={1}>
                {displayLocation}
              </Text>
              {isLocating ? (
                <ActivityIndicator size="small" color={ACCENT_YELLOW} />
              ) : (
                <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
              )}
            </Pressable>

            {/* ========================================================= */}
            {/* C. MAIN HERO BANNER (Roadside Assistance)                 */}
            {/* ========================================================= */}
            <View style={styles.heroCard}>
              {/* Corner yellow diagonal accent slash */}
              <View pointerEvents="none" style={styles.heroDiagonalAccent}>
                <Svg width={90} height={90} viewBox="0 0 90 90">
                  <Path d="M40 -15 L105 50 L90 65 L25 0 Z" fill={ACCENT_YELLOW} />
                </Svg>
              </View>

              {/* Left Content Area */}
              <View style={styles.heroLeftContent}>
                <View style={styles.heroTagRow}>
                  <Text style={styles.heroEyebrow}>ROADSIDE ASSISTANCE • 7 KM RADIUS</Text>
                  <View style={styles.heroTagLine} />
                </View>

                <Text style={styles.heroHeading}>
                  Find a Mechanic{'\n'}
                  <Text style={{ color: ACCENT_YELLOW }}>Near You</Text>
                </Text>

                <Text style={styles.heroDescription}>
                  Book service, breakdown help and more — anytime, anywhere.
                </Text>

                {/* Primary Yellow CTA Button */}
                <Pressable
                  onPress={findMechanics}
                  disabled={isSearching}
                  style={({ pressed }) => [
                    styles.heroFindButton,
                    { opacity: pressed || isSearching ? 0.88 : 1 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Find a Mechanic"
                >
                  {isSearching ? (
                    <ActivityIndicator size="small" color="#101114" />
                  ) : (
                    <>
                      <Ionicons name="search" size={16} color="#101114" />
                      <Text style={styles.heroFindButtonText}>Find a Mechanic</Text>
                      <Ionicons name="arrow-forward" size={15} color="#101114" />
                    </>
                  )}
                </Pressable>
              </View>

              {/* Right Image: Mechanic working under car hood */}
              <Image
                source={require('../../../../assets/images/customer-hero-mechanic.png')}
                style={styles.heroMechanicImage}
                resizeMode="contain"
                accessibilityLabel="MechFind Professional Mechanic"
              />
            </View>
          </View>

          {/* ========================================================= */}
          {/* CURVED BODY SECTION (Light #F1F2F4 or Dark #101114)        */}
          {/* ========================================================= */}
          <View
            style={[
              styles.curvedBodySection,
              {
                backgroundColor: isDark ? '#101114' : '#F1F2F4',
              },
            ]}
          >
            {/* ========================================================= */}
            {/* D. SERVICE CATEGORIES (8 Grid Shortcuts)                  */}
            {/* ========================================================= */}
            <View style={styles.serviceGrid}>
              {serviceCategories.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={item.onPress}
                  style={({ pressed }) => [
                    styles.serviceCard,
                    {
                      backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                      borderColor: isDark ? '#2A2B30' : '#EAECEF',
                      transform: [{ scale: pressed ? 0.96 : 1 }],
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={item.name.replace('\n', ' ')}
                >
                  <View style={styles.serviceIconWrapper}>{item.icon}</View>
                  <Text
                    style={[
                      styles.serviceTitle,
                      { color: isDark ? '#FFFFFF' : '#111827' },
                    ]}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* ========================================================= */}
            {/* E. YOUR ACTIVE BOOKING SECTION                            */}
            {/* ========================================================= */}
            <View style={styles.sectionHeaderRow}>
              <Text
                style={[
                  styles.sectionTitleText,
                  { color: isDark ? '#FFFFFF' : '#111827' },
                ]}
              >
                Your Active Booking
              </Text>
              <Pressable
                onPress={() => router.push('/(customer)/(tabs)/requests')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="link"
              >
                <Text style={styles.viewAllText}>View All →</Text>
              </Pressable>
            </View>

            {activeRequest ? (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/(customer)/live-tracking/[id]',
                    params: { id: activeRequest.id },
                  })
                }
                style={({ pressed }) => [
                  styles.activeBookingCard,
                  {
                    backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                    borderColor: isDark ? '#2A2B30' : '#EAECEF',
                    opacity: pressed ? 0.95 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Active booking: ${activeRequest.categoryName}. Status: ${getStatusBadgeLabel(activeRequest.status)}`}
              >
                {/* Top Info Row */}
                <View style={styles.bookingTopRow}>
                  {/* Service Thumbnail */}
                  <Image
                    source={require('../../../../assets/images/service-battery-thumb.png')}
                    style={styles.bookingThumbImage}
                    resizeMode="contain"
                    accessibilityLabel="Service thumbnail"
                  />

                  {/* Service Name & Location */}
                  <View style={styles.bookingDetails}>
                    <Text
                      style={[
                        styles.bookingServiceName,
                        { color: isDark ? '#FFFFFF' : '#111827' },
                      ]}
                      numberOfLines={1}
                    >
                      {activeRequest.categoryName || 'Battery Jumpstart'}
                    </Text>
                    <View style={styles.bookingLocationRow}>
                      <Ionicons name="location-outline" size={13} color="#9CA3AF" />
                      <Text style={styles.bookingLocationText} numberOfLines={1}>
                        {activeRequest.location.address || 'SV Road, Near Bus Stand, Dindigul'}
                      </Text>
                    </View>
                  </View>

                  {/* Status Pill Badge */}
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: isDark ? '#362B14' : '#FEF3C7',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        { color: isDark ? '#FCD34D' : '#B45309' },
                      ]}
                    >
                      {getStatusBadgeLabel(activeRequest.status)}
                    </Text>
                  </View>
                </View>

                {/* Progress Stepper Timeline */}
                <View style={styles.stepperContainer}>
                  {/* Step 1: Confirmed */}
                  <View style={styles.stepperNode}>
                    <View
                      style={[
                        styles.stepperCircle,
                        styles.stepperCircleActive,
                      ]}
                    >
                      <Ionicons name="checkmark" size={13} color="#101114" />
                    </View>
                    <Text
                      style={[
                        styles.stepperLabel,
                        styles.stepperLabelActive,
                        { color: isDark ? '#FFFFFF' : '#111827' },
                      ]}
                    >
                      Confirmed
                    </Text>
                  </View>

                  {/* Connector Line 1-2 */}
                  <View
                    style={[
                      styles.stepperTrack,
                      currentStep >= 1
                        ? styles.stepperTrackActive
                        : styles.stepperTrackInactive,
                    ]}
                  />

                  {/* Step 2: On the Way */}
                  <View style={styles.stepperNode}>
                    <View
                      style={[
                        styles.stepperCircle,
                        currentStep >= 1
                          ? styles.stepperCircleActive
                          : styles.stepperCircleInactive,
                      ]}
                    >
                      {currentStep >= 1 ? (
                        <Ionicons name="car" size={13} color="#101114" />
                      ) : (
                        <View style={styles.stepperDot} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.stepperLabel,
                        currentStep >= 1 && styles.stepperLabelActive,
                        { color: currentStep >= 1 ? (isDark ? '#FFFFFF' : '#111827') : '#9CA3AF' },
                      ]}
                    >
                      On the Way
                    </Text>
                  </View>

                  {/* Connector Line 2-3 */}
                  <View
                    style={[
                      styles.stepperTrack,
                      currentStep >= 2
                        ? styles.stepperTrackActive
                        : styles.stepperTrackInactive,
                    ]}
                  />

                  {/* Step 3: In Service */}
                  <View style={styles.stepperNode}>
                    <View
                      style={[
                        styles.stepperCircle,
                        currentStep >= 2
                          ? styles.stepperCircleActive
                          : styles.stepperCircleInactive,
                      ]}
                    >
                      {currentStep >= 2 ? (
                        <Ionicons name="build" size={12} color="#101114" />
                      ) : (
                        <View style={styles.stepperDot} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.stepperLabel,
                        currentStep >= 2 && styles.stepperLabelActive,
                        { color: currentStep >= 2 ? (isDark ? '#FFFFFF' : '#111827') : '#9CA3AF' },
                      ]}
                    >
                      In Service
                    </Text>
                  </View>

                  {/* Connector Line 3-4 */}
                  <View
                    style={[
                      styles.stepperTrack,
                      currentStep >= 3
                        ? styles.stepperTrackActive
                        : styles.stepperTrackInactive,
                    ]}
                  />

                  {/* Step 4: Completed */}
                  <View style={styles.stepperNode}>
                    <View
                      style={[
                        styles.stepperCircle,
                        currentStep >= 3
                          ? styles.stepperCircleActive
                          : styles.stepperCircleInactive,
                      ]}
                    >
                      <View style={styles.stepperDot} />
                    </View>
                    <Text
                      style={[
                        styles.stepperLabel,
                        currentStep >= 3 && styles.stepperLabelActive,
                        { color: currentStep >= 3 ? (isDark ? '#FFFFFF' : '#111827') : '#9CA3AF' },
                      ]}
                    >
                      Completed
                    </Text>
                  </View>
                </View>
              </Pressable>
            ) : (
              /* Clean Empty State when no active booking */
              <View
                style={[
                  styles.activeBookingCard,
                  styles.emptyBookingCard,
                  {
                    backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                    borderColor: isDark ? '#2A2B30' : '#EAECEF',
                  },
                ]}
              >
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="calendar-outline" size={24} color={ACCENT_YELLOW} />
                </View>
                <Text
                  style={[
                    styles.emptyTitle,
                    { color: isDark ? '#FFFFFF' : '#111827' },
                  ]}
                >
                  No Active Booking Right Now
                </Text>
                <Text style={styles.emptySubtitle}>
                  Need breakdown help, battery service, or towing?
                </Text>
                <Pressable
                  onPress={() => router.push('/(customer)/breakdown-request')}
                  style={styles.emptyCtaButton}
                  accessibilityRole="button"
                >
                  <Text style={styles.emptyCtaText}>Book a Service →</Text>
                </Pressable>
              </View>
            )}

            {/* ========================================================= */}
            {/* F. NEARBY MECHANICS SECTION (Within 7 km Radius)          */}
            {/* ========================================================= */}
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleWithBadge}>
                <Text
                  style={[
                    styles.sectionTitleText,
                    { color: isDark ? '#FFFFFF' : '#111827' },
                  ]}
                >
                  Nearby Mechanics
                </Text>
                <View style={styles.radiusPillBadge}>
                  <Text style={styles.radiusPillBadgeText}>⚡ Within 7 km</Text>
                </View>
              </View>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/(customer)/nearby-mechanics',
                    params: { filter: 'within_7km' },
                  })
                }
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="link"
              >
                <Text style={styles.viewAllText}>View All →</Text>
              </Pressable>
            </View>

            <View style={styles.mechanicsList}>
              {mechanics.slice(0, 2).map((mech, index) => (
                <Pressable
                  key={mech.id || `mech-${index}`}
                  onPress={() =>
                    router.push({
                      pathname: '/(customer)/mechanic-details/[id]',
                      params: { id: mech.id },
                    })
                  }
                  style={({ pressed }) => [
                    styles.mechanicCard,
                    {
                      backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                      borderColor: isDark ? '#2A2B30' : '#EAECEF',
                      transform: [{ scale: pressed ? 0.985 : 1 }],
                      opacity: pressed ? 0.94 : 1,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${mech.shopName}. Rating: ${mech.rating}. Distance: ${mech.distanceKm} km`}
                >
                  {/* Workshop Photo */}
                  <Image
                    source={
                      index === 0
                        ? require('../../../../assets/images/workshop-sr-auto.png')
                        : require('../../../../assets/images/roadside-hero.png')
                    }
                    style={styles.workshopImage}
                    resizeMode="cover"
                    accessibilityLabel={`${mech.shopName} workshop`}
                  />

                  {/* Workshop Info */}
                  <View style={styles.mechanicInfo}>
                    <View style={styles.workshopNameRow}>
                      <Text
                        style={[
                          styles.workshopName,
                          { color: isDark ? '#FFFFFF' : '#111827' },
                        ]}
                        numberOfLines={1}
                      >
                        {mech.shopName || 'SR Auto Works'}
                      </Text>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={ACCENT_YELLOW}
                        style={{ marginLeft: 4 }}
                      />
                      {mech.distanceKm <= 7 && (
                        <View style={styles.radiusCardBadge}>
                          <Text style={styles.radiusCardBadgeText}>⚡ 7 km</Text>
                        </View>
                      )}
                    </View>

                    {/* Rating & Distance */}
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={14} color={ACCENT_YELLOW} />
                      <Text style={styles.ratingText}>
                        {' '}{mech.rating || 4.8} ({mech.reviewCount || 120}) • {mech.distanceKm || 2.4} km
                      </Text>
                    </View>

                    {/* Available Status Pill */}
                    <View style={styles.availablePill}>
                      <Text style={styles.availablePillText}>Available</Text>
                    </View>
                  </View>

                  {/* Navigation Arrow */}
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={isDark ? '#FFFFFF' : '#111827'}
                  />
                </Pressable>
              ))}
            </View>

            {/* Bottom Safe Area Spacer */}
            <View style={{ height: Math.max(insets.bottom, 16) + 20 }} />
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#101114',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#101114',
  },
  mainWrapper: {
    width: '100%',
  },
  centeredWrapper: {
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },

  /* A. HEADER */
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
  greetingArea: {
    marginBottom: 14,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  greetingSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },

  /* B. LOCATION SELECTOR */
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1D21',
    borderRadius: 22,
    height: 44,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  locationText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '600',
    marginLeft: 8,
    marginRight: 6,
  },

  /* C. MAIN HERO BANNER */
  heroCard: {
    backgroundColor: '#16171B',
    borderRadius: 24,
    height: 215,
    position: 'relative',
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroDiagonalAccent: {
    position: 'absolute',
    top: -5,
    right: -5,
    zIndex: 1,
  },
  heroLeftContent: {
    flex: 1,
    zIndex: 2,
    justifyContent: 'center',
  },
  heroTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  heroEyebrow: {
    fontSize: 10.5,
    fontWeight: '800',
    color: ACCENT_YELLOW,
    letterSpacing: 1.1,
  },
  heroTagLine: {
    width: 22,
    height: 2,
    backgroundColor: ACCENT_YELLOW,
    borderRadius: 1,
  },
  heroHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 27,
    letterSpacing: -0.4,
  },
  heroDescription: {
    fontSize: 11.5,
    lineHeight: 16,
    color: '#9CA3AF',
    marginTop: 6,
    marginBottom: 14,
    maxWidth: 195,
  },
  heroFindButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT_YELLOW,
    borderRadius: 20,
    height: 40,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
    gap: 6,
  },
  heroFindButtonText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#101114',
  },
  heroMechanicImage: {
    position: 'absolute',
    right: -10,
    bottom: -8,
    width: 180,
    height: 195,
    zIndex: 1,
  },

  /* D. CURVED BODY & SERVICE GRID */
  curvedBodySection: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 18,
    marginTop: 4,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    marginBottom: 24,
  },
  serviceCard: {
    width: '23%',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    minHeight: 90,
  },
  serviceIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    marginBottom: 6,
  },
  serviceTitle: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 13.5,
  },

  /* SECTION HEADINGS */
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  viewAllText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: ACCENT_YELLOW,
  },

  /* E. ACTIVE BOOKING */
  activeBookingCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  bookingTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bookingThumbImage: {
    width: 44,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  bookingDetails: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  bookingServiceName: {
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  bookingLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 3,
  },
  bookingLocationText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  statusPill: {
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },

  /* TIMELINE STEPPER */
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingHorizontal: 6,
  },
  stepperNode: {
    alignItems: 'center',
    width: 62,
  },
  stepperCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepperCircleActive: {
    backgroundColor: ACCENT_YELLOW,
  },
  stepperCircleInactive: {
    backgroundColor: '#E5E7EB',
  },
  stepperDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
  },
  stepperTrack: {
    flex: 1,
    height: 2.5,
    marginBottom: 22,
    marginHorizontal: -4,
  },
  stepperTrackActive: {
    backgroundColor: ACCENT_YELLOW,
  },
  stepperTrackInactive: {
    backgroundColor: '#E5E7EB',
  },
  stepperLabel: {
    fontSize: 10.5,
    fontWeight: '500',
    textAlign: 'center',
  },
  stepperLabelActive: {
    fontWeight: '700',
  },

  /* EMPTY BOOKING CARD */
  emptyBookingCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 15.5,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 14,
  },
  emptyCtaButton: {
    backgroundColor: ACCENT_YELLOW,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  emptyCtaText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#101114',
  },

  /* F. NEARBY MECHANICS */
  mechanicsList: {
    gap: 12,
  },
  mechanicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  workshopImage: {
    width: 86,
    height: 70,
    borderRadius: 12,
  },
  mechanicInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 6,
  },
  workshopNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workshopName: {
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  ratingText: {
    fontSize: 12.5,
    color: '#6B7280',
  },
  availablePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 6,
  },
  availablePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  sectionTitleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radiusPillBadge: {
    backgroundColor: '#FFC400',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  radiusPillBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#101114',
  },
  radiusCardBadge: {
    backgroundColor: '#FFC400',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 6,
  },
  radiusCardBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#101114',
  },
});
