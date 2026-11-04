import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { BRAND_COLORS } from '../../../theme/colors';
import { RADIUS } from '../../../theme/radius';
import { SPACING } from '../../../theme/spacing';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { CarBreakdownIllustration } from '../../../components/ui/CarBreakdownIllustration';
import { RadarSearchAnimation } from '../../../components/ui/RadarSearchAnimation';
import { useAuthStore } from '../../../stores/authStore';
import { useCustomerStore } from '../../../stores/customerStore';
import { locationService } from '../../../services/location/locationService';
import { mechanicSearchService } from '../../../services/mechanic/mechanicSearchService';
import { ProblemCategory } from '../../../types/requests';
import { NearbyMechanic } from '../../../types/mechanic';
import { useResponsive } from '../../../hooks/useResponsive';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { WebFooter } from '../../../components/navigation/WebFooter';

interface QuickService {
  id: string;
  title: string;
  startingPrice: string;
  icon: keyof typeof Ionicons.glyphMap;
  category: ProblemCategory;
  vehicleType?: 'car' | 'bike';
}

const QUICK_SERVICES: QuickService[] = [
  {
    id: 'bike_repair',
    title: 'Bike Repair',
    startingPrice: 'From ₹199',
    icon: 'bicycle-outline',
    category: 'general_diagnostics',
    vehicleType: 'bike',
  },
  {
    id: 'car_repair',
    title: 'Car Repair',
    startingPrice: 'From ₹399',
    icon: 'car-outline',
    category: 'general_diagnostics',
    vehicleType: 'car',
  },
  {
    id: 'battery',
    title: 'Battery Jumpstart',
    startingPrice: 'From ₹299',
    icon: 'flash-outline',
    category: 'battery_jumpstart',
  },
  {
    id: 'tyre_repair',
    title: 'Tyre Repair',
    startingPrice: 'From ₹199',
    icon: 'disc-outline',
    category: 'flat_tyre',
  },
  {
    id: 'towing',
    title: 'Towing',
    startingPrice: 'From ₹1,200',
    icon: 'car-sport-outline',
    category: 'towing_service',
  },
  {
    id: 'emergency',
    title: 'Roadside Visit',
    startingPrice: 'From ₹399',
    icon: 'warning-outline',
    category: 'engine_overheating',
  },
];

interface FeaturedLaunchService {
  id: string;
  title: string;
  price: number;
  icon: keyof typeof Ionicons.glyphMap;
  category: ProblemCategory;
}

const FEATURED_2W_SERVICES: FeaturedLaunchService[] = [
  { id: '2w_diag', title: 'Basic Diagnosis', price: 199, icon: 'search-outline', category: 'general_diagnostics' },
  { id: '2w_jump', title: 'Battery Jumpstart', price: 299, icon: 'flash-outline', category: 'battery_jumpstart' },
  { id: '2w_tube', title: 'Tube Puncture Repair', price: 199, icon: 'disc-outline', category: 'flat_tyre' },
  { id: '2w_tubeless', title: 'Tubeless Puncture Repair', price: 249, icon: 'build-outline', category: 'flat_tyre' },
];

const FEATURED_4W_SERVICES: FeaturedLaunchService[] = [
  { id: '4w_diag', title: 'Visual Diagnosis', price: 399, icon: 'search-outline', category: 'general_diagnostics' },
  { id: '4w_jump', title: 'Battery Jumpstart', price: 499, icon: 'flash-outline', category: 'battery_jumpstart' },
  { id: '4w_tyre', title: 'Tyre Puncture Repair', price: 299, icon: 'disc-outline', category: 'flat_tyre' },
  { id: '4w_tow', title: 'Emergency Towing', price: 1200, icon: 'car-sport-outline', category: 'towing_service' },
];

export default function CustomerDashboardScreen() {
  const { theme, isDark } = useTheme();
  const { isSmallDevice, isTablet, isDesktop, width, horizontalPadding } = useResponsive();
  const user = useAuthStore((state) => state.user);
  const {
    vehicles,
    selectedVehicleId,
    requests,
    nearbyMechanics,
    currentLocation,
    setCurrentLocation,
  } = useCustomerStore();

  const [pricingVehicleType, setPricingVehicleType] = useState<'2W' | '4W'>('2W');
  const heroOpacity = useSharedValue(0);
  const heroTranslateY = useSharedValue(14);
  const pulseOpacity = useSharedValue(0.4);

  useEffect(() => {
    heroOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    heroTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.35, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedHeroStyle = useAnimatedStyle(() => ({
    opacity: heroOpacity.value,
    transform: [{ translateY: heroTranslateY.value }],
  }));

  const animatedPulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchRadius, setSearchRadius] = useState(15);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'nearby' | 'rating' | 'price'>('nearby');
  const [vehicleFilter, setVehicleFilter] = useState<'all' | 'car' | 'bike'>('all');
  const [selectedCategory, setSelectedCategory] = useState<ProblemCategory | 'all'>('all');
  const [hasSearched, setHasSearched] = useState(false);
  const [liveMechanics, setLiveMechanics] = useState<NearbyMechanic[]>(nearbyMechanics);

  // Active breakdown request: only display if one exists for the authenticated customer
  const activeRequest = requests.find(
    (r) =>
      (!user || r.customerId === user.id) &&
      r.status !== 'completed' &&
      r.status !== 'cancelled'
  );

  const currentVehicle =
    vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  const fetchLiveGPS = async () => {
    setIsLocating(true);
    try {
      const loc = await locationService.getCurrentLocation();
      setCurrentLocation({
        latitude: loc.latitude,
        longitude: loc.longitude,
        address: loc.address,
      });
      return loc;
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    fetchLiveGPS();
  }, []);

  // STEP 3 & 4: Core Find Mechanic function on SAME Home Screen
  const handleFindMechanics = async (
    customRadius?: number,
    cat?: ProblemCategory | 'all',
    vType?: 'all' | 'car' | 'bike'
  ) => {
    setIsSearching(true);
    setSearchError(null);
    const targetRadius = customRadius || searchRadius;
    const targetCategory = cat !== undefined ? cat : selectedCategory;
    const targetVType = vType !== undefined ? vType : vehicleFilter;

    try {
      // 1. Refresh live GPS position
      const loc = await locationService.getCurrentLocation();
      setCurrentLocation({
        latitude: loc.latitude,
        longitude: loc.longitude,
        address: loc.address,
      });

      // 2. Perform actual spatial/backend search
      const result = await mechanicSearchService.searchNearby({
        latitude: loc.latitude,
        longitude: loc.longitude,
        radiusKm: targetRadius,
        vehicleType: targetVType,
        category: targetCategory,
        sortBy: activeFilter === 'nearby' ? 'distance' : activeFilter,
      });

      setLiveMechanics(result.mechanics);
      setHasSearched(true);
      setSearchRadius(targetRadius);
    } catch (err: any) {
      setSearchError(err?.message || 'Unable to scan nearby mechanics. Please check GPS and try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickServicePress = (service: QuickService) => {
    setSelectedCategory(service.category);
    if (service.vehicleType) {
      setVehicleFilter(service.vehicleType);
    }
    // Instantly trigger search for this service on the home screen
    handleFindMechanics(searchRadius, service.category, service.vehicleType || 'all');
  };

  const handleBookMechanic = (mechanic: NearbyMechanic) => {
    router.push({
      pathname: '/(customer)/breakdown-request',
      params: {
        mechanicId: mechanic.id,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
      },
    });
  };

  const handleViewProfile = (mechanic: NearbyMechanic) => {
    router.push({
      pathname: '/(customer)/mechanic-details/[id]',
      params: { id: mechanic.id },
    });
  };

  const filteredAndSortedMechanics = useMemo(() => {
    let list = [...liveMechanics];

    // Filter by vehicle
    if (vehicleFilter !== 'all') {
      list = list.filter((m) => m.vehicleTypes?.includes(vehicleFilter));
    }

    // Sort
    if (activeFilter === 'rating') {
      return list.sort((a, b) => b.rating - a.rating);
    }
    if (activeFilter === 'price') {
      return list.sort((a, b) => (a.pricingStartingAt || 350) - (b.pricingStartingAt || 350));
    }
    return list.sort((a, b) => a.distanceKm - b.distanceKm);
  }, [liveMechanics, activeFilter, vehicleFilter]);

  const displayLocation = currentLocation.address
    ? currentLocation.address.split(',')[0].trim()
    : 'Current Location';

  const renderMechanicCardsList = () => {
    if (filteredAndSortedMechanics.length === 0 && hasSearched && !isSearching) {
      return (
        <Card style={styles.emptyStateCard}>
          <Ionicons name="search-outline" size={36} color={BRAND_COLORS.secondaryText} />
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
            No Garages Found Within {searchRadius} km
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            No verified workshops are currently online within your search zone.
          </Text>
          <Pressable
            onPress={() => handleFindMechanics(25)}
            style={[styles.expandRadiusBtn, { backgroundColor: BRAND_COLORS.primaryBlue }]}
          >
            <Text style={styles.expandRadiusText}>Expand Search to 25 km</Text>
          </Pressable>
        </Card>
      );
    }

    return (
      <View style={{ gap: SPACING.sm }}>
        {filteredAndSortedMechanics.map((item) => (
          <Card
            key={item.id}
            onPress={() => handleBookMechanic(item)}
            style={styles.mechanicCard}
          >
            <View style={styles.cardMainRow}>
              {/* Workshop Thumbnail Icon */}
              <View
                style={[
                  styles.shopThumb,
                  { backgroundColor: isDark ? '#1E293B' : '#EFF6FF' },
                ]}
              >
                <Ionicons name="construct" size={24} color={BRAND_COLORS.primaryBlue} />
              </View>

              {/* Workshop Information */}
              <View style={styles.shopInfoCol}>
                <View style={styles.shopNameRow}>
                  <Text
                    style={[styles.shopNameText, { color: theme.textPrimary }]}
                    numberOfLines={1}
                  >
                    {item.shopName}
                  </Text>
                  <Ionicons
                    name="checkmark-circle"
                    size={15}
                    color={BRAND_COLORS.successGreen}
                    style={{ marginLeft: 4 }}
                  />
                </View>

                <View style={styles.ratingDistanceRow}>
                  <Ionicons name="star" size={13} color="#F59E0B" />
                  <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
                    {item.rating} ({item.reviewCount || 98})
                  </Text>
                  <Text style={[styles.bulletDot, { color: theme.textSecondary }]}>•</Text>
                  <Text style={[styles.distanceText, { color: theme.textSecondary }]}>
                    {item.distanceKm} km
                  </Text>
                </View>

                <View style={styles.priceEtaRow}>
                  <Text style={[styles.priceTag, { color: theme.textPrimary }]}>
                    ₹{item.pricingStartingAt || 350} Starting
                  </Text>
                  <View style={styles.etaBadgeWrap}>
                    <Ionicons name="time-outline" size={12} color={theme.textSecondary} />
                    <Text style={[styles.etaTag, { color: theme.textSecondary }]}>
                      ~{item.estimatedArrivalMinutes || 10} mins
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Action Buttons: View Profile & Book Now */}
            <View style={styles.cardActionsRow}>
              <Pressable
                onPress={() => handleViewProfile(item)}
                style={[
                  styles.viewProfileBtn,
                  { borderColor: theme.border },
                ]}
                hitSlop={4}
              >
                <Text style={[styles.viewProfileText, { color: theme.textPrimary }]}>
                  View Profile
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleBookMechanic(item)}
                style={[
                  styles.bookNowBtn,
                  { backgroundColor: BRAND_COLORS.primaryBlue },
                ]}
                hitSlop={4}
              >
                <Text style={styles.bookNowText}>Book Now</Text>
              </Pressable>
            </View>
          </Card>
        ))}
      </View>
    );
  };

  return (
    <ScreenContainer scrollable withPadding={false} edges={['top', 'left', 'right']}>
      {/* 1. Header Bar: Location Selector & Action Icons (Mobile only, hidden on Desktop where ResponsiveNav displays) */}
      {!isDesktop && (
        <View
          style={[
            styles.headerBar,
            {
              backgroundColor: theme.surface,
              borderBottomColor: theme.divider,
              paddingHorizontal: horizontalPadding,
            },
          ]}
        >
          <View style={styles.headerLeftGroup}>
            <Image
              source={require('../../../../assets/images/mechfind_logo.png')}
              style={styles.headerLogoImage}
              resizeMode="contain"
              accessibilityLabel="MECHFIND"
            />
            <Pressable
              onPress={fetchLiveGPS}
              style={styles.locationSelector}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Select Location"
            >
              <Ionicons name="location-sharp" size={16} color={BRAND_COLORS.primaryBlue} />
              <Text
                style={[styles.locationText, { color: theme.textPrimary }]}
                numberOfLines={1}
              >
                {isLocating ? 'Locating...' : displayLocation}
              </Text>
              <Ionicons name="chevron-down" size={14} color={theme.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.headerRightActions}>
            <Pressable
              onPress={() => router.push('/(customer)/(tabs)/requests')}
              style={[
                styles.iconBtn,
                { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderColor: theme.border },
              ]}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
            >
              <Ionicons name="notifications-outline" size={19} color={theme.textPrimary} />
              <View style={styles.notificationDot} />
            </Pressable>

            <Pressable
              onPress={() => router.push('/(customer)/(tabs)/profile')}
              style={[
                styles.avatarBtn,
                { backgroundColor: isDark ? '#1E293B' : '#E2E8F0', borderColor: theme.border },
              ]}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Customer Profile"
            >
              <Ionicons name="person" size={17} color={BRAND_COLORS.primaryBlue} />
            </Pressable>
          </View>
        </View>
      )}

      <View
        style={[
          styles.mainContent,
          {
            paddingHorizontal: horizontalPadding,
            maxWidth: isDesktop ? 1280 : isTablet ? 840 : undefined,
            alignSelf: isTablet || isDesktop ? 'center' : undefined,
            width: isTablet || isDesktop ? '100%' : undefined,
            paddingTop: isDesktop ? SPACING.lg : 0,
          },
        ]}
      >
        <View style={isDesktop ? styles.desktopColumnsRow : undefined}>
          {/* Left Column (Desktop) / Top Flow (Mobile) */}
          <View style={isDesktop ? styles.desktopLeftCol : undefined}>
            {/* 2. Hero Section: Heading, Subtitle & Professional Illustration */}
            <Animated.View style={[styles.heroSection, animatedHeroStyle]}>
              {/* Standby Pulse Badge */}
              <View style={[styles.standbyBadge, { backgroundColor: isDark ? 'rgba(22, 163, 74, 0.15)' : '#F0FDF4', borderColor: isDark ? '#166534' : '#BBF7D0' }]}>
                <Animated.View style={[styles.standbyDot, animatedPulseStyle]} />
                <Text style={styles.standbyText}>
                  120+ Verified Mechanics Online • 15–25 Mins Average ETA
                </Text>
              </View>

              <Text style={[styles.heroHeading, { color: theme.textPrimary }]}>
                24/7 Roadside Breakdown Assistance
              </Text>
              <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
                Instant GPS mechanic dispatch to your breakdown spot. Official launch pricing with zero hidden charges.
              </Text>

              {/* Clean Vector Car with Hazard Warning Cone */}
              <View style={styles.illustrationWrap}>
                <CarBreakdownIllustration height={135} isDark={isDark} />
              </View>

              {/* Dual Action Hero Buttons */}
              <View style={styles.heroActionsRow}>
                <Pressable
                  onPress={() => handleFindMechanics()}
                  disabled={isSearching}
                  style={({ pressed }) => [
                    styles.primaryHeroBtn,
                    {
                      backgroundColor: BRAND_COLORS.primaryBlue,
                      opacity: pressed || isSearching ? 0.9 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Find Nearby Mechanics"
                >
                  {isSearching ? (
                    <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                  ) : (
                    <Ionicons name="search" size={19} color="#FFFFFF" style={{ marginRight: 8 }} />
                  )}
                  <Text style={styles.primaryHeroBtnText}>
                    {isSearching ? 'Scanning Garages...' : 'Find Nearby Mechanics'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => router.push('/(customer)/breakdown-request')}
                  style={({ pressed }) => [
                    styles.secondaryHeroBtn,
                    {
                      borderColor: BRAND_COLORS.primaryBlue,
                      backgroundColor: isDark ? 'rgba(23, 105, 245, 0.1)' : '#EFF6FF',
                      opacity: pressed ? 0.85 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Instant Breakdown Request"
                >
                  <Ionicons name="flash" size={18} color={BRAND_COLORS.primaryBlue} style={{ marginRight: 6 }} />
                  <Text style={[styles.secondaryHeroBtnText, { color: BRAND_COLORS.primaryBlue }]}>
                    Instant Request
                  </Text>
                </Pressable>
              </View>
            </Animated.View>

            {/* In-Home Radar Search Animation when searching */}
            {isSearching && (
              <RadarSearchAnimation
                radiusKm={searchRadius}
                onCancel={() => setIsSearching(false)}
              />
            )}

            {/* Search Error State */}
            {searchError ? (
              <Card style={[styles.errorCard, { backgroundColor: isDark ? '#2D1515' : '#FEF2F2' }]}>
                <Ionicons name="alert-circle" size={20} color={BRAND_COLORS.error} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.errorTitle, { color: BRAND_COLORS.error }]}>
                    Location Search Issue
                  </Text>
                  <Text style={[styles.errorMsg, { color: theme.textSecondary }]}>
                    {searchError}
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleFindMechanics()}
                  style={styles.retryBtn}
                >
                  <Text style={styles.retryText}>Retry</Text>
                </Pressable>
              </Card>
            ) : null}

            {/* 3. Quick Services (6 Cards Grid) */}
            <View style={styles.quickServicesContainer}>
              <View style={styles.quickServicesGrid}>
                {QUICK_SERVICES.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => handleQuickServicePress(item)}
                    style={({ pressed }) => [
                      styles.quickServiceItem,
                      {
                        backgroundColor: theme.card,
                        borderColor: selectedCategory === item.category ? BRAND_COLORS.primaryBlue : theme.border,
                        borderWidth: selectedCategory === item.category ? 1.5 : 1,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={item.title}
                  >
                    <View
                      style={[
                        styles.quickIconCircle,
                        {
                          backgroundColor:
                            selectedCategory === item.category
                              ? isDark ? 'rgba(23, 105, 232, 0.25)' : '#EFF6FF'
                              : isDark ? '#1E293B' : '#F1F5F9',
                        },
                      ]}
                    >
                      <Ionicons name={item.icon} size={22} color={BRAND_COLORS.primaryBlue} />
                    </View>
                    <Text
                      style={[
                        styles.quickServiceTitle,
                        {
                          color: selectedCategory === item.category ? BRAND_COLORS.primaryBlue : theme.textPrimary,
                          fontWeight: selectedCategory === item.category ? '700' : '600',
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={[
                        styles.quickServicePrice,
                        {
                          color: selectedCategory === item.category ? BRAND_COLORS.primaryBlue : theme.textSecondary,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {item.startingPrice}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Selected Vehicle Card */}
            {currentVehicle ? (
              <Pressable
                onPress={() => router.push('/(customer)/(tabs)/vehicles')}
                style={[
                  styles.vehicleBar,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.vehicleIconCircle,
                    { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
                  ]}
                >
                  <Ionicons
                    name={currentVehicle.type === 'bike' ? 'bicycle' : 'car'}
                    size={18}
                    color={BRAND_COLORS.primaryBlue}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.vehicleLabel, { color: theme.textSecondary }]}>
                    ACTIVE VEHICLE
                  </Text>
                  <Text
                    style={[styles.vehicleName, { color: theme.textPrimary }]}
                    numberOfLines={1}
                  >
                    {currentVehicle.make} {currentVehicle.model} ({currentVehicle.licensePlate})
                  </Text>
                </View>
                <Text style={[styles.vehicleChangeText, { color: BRAND_COLORS.primaryBlue }]}>
                  Change
                </Text>
              </Pressable>
            ) : null}

            {/* Launch Pricing Interactive Showcase (2W & 4W) */}
            <View style={styles.pricingShowcaseSection}>
              <View style={styles.pricingSectionHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.pricingSectionTitle, { color: theme.textPrimary }]}>
                    Official Launch Pricing
                  </Text>
                  <Text style={[styles.pricingSectionSub, { color: theme.textSecondary }]}>
                    Fixed rates from our official price book • Zero surge
                  </Text>
                </View>

                {/* 2W vs 4W Segmented Switcher */}
                <View style={[styles.pricingSegmentWrap, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                  <Pressable
                    onPress={() => setPricingVehicleType('2W')}
                    style={[
                      styles.pricingSegmentBtn,
                      pricingVehicleType === '2W' && [styles.pricingSegmentActive, { backgroundColor: BRAND_COLORS.primaryBlue }],
                    ]}
                  >
                    <Ionicons
                      name="bicycle"
                      size={14}
                      color={pricingVehicleType === '2W' ? '#FFFFFF' : theme.textSecondary}
                    />
                    <Text
                      style={[
                        styles.pricingSegmentText,
                        { color: pricingVehicleType === '2W' ? '#FFFFFF' : theme.textSecondary },
                      ]}
                    >
                      2W
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setPricingVehicleType('4W')}
                    style={[
                      styles.pricingSegmentBtn,
                      pricingVehicleType === '4W' && [styles.pricingSegmentActive, { backgroundColor: BRAND_COLORS.primaryBlue }],
                    ]}
                  >
                    <Ionicons
                      name="car"
                      size={14}
                      color={pricingVehicleType === '4W' ? '#FFFFFF' : theme.textSecondary}
                    />
                    <Text
                      style={[
                        styles.pricingSegmentText,
                        { color: pricingVehicleType === '4W' ? '#FFFFFF' : theme.textSecondary },
                      ]}
                    >
                      4W
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Pricing Cards Grid */}
              <View style={styles.pricingCardsGrid}>
                {(pricingVehicleType === '2W' ? FEATURED_2W_SERVICES : FEATURED_4W_SERVICES).map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() =>
                      router.push({
                        pathname: '/(customer)/breakdown-request',
                        params: { category: item.title },
                      })
                    }
                    style={({ pressed }) => [
                      styles.pricingCard,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                        opacity: pressed ? 0.9 : 1,
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                      },
                    ]}
                  >
                    <View style={styles.pricingCardTop}>
                      <View style={[styles.pricingIconWrap, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF' }]}>
                        <Ionicons name={item.icon} size={17} color={BRAND_COLORS.primaryBlue} />
                      </View>
                      <Text style={[styles.pricingCardAmount, { color: BRAND_COLORS.primaryBlue }]}>
                        ₹{item.price}
                      </Text>
                    </View>
                    <Text style={[styles.pricingCardTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View style={styles.pricingCardBottom}>
                      <Text style={[styles.pricingCardAction, { color: BRAND_COLORS.primaryBlue }]}>
                        Book Now →
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>

              <Pressable
                onPress={() => router.push('/(customer)/services-pricing')}
                style={styles.viewAllPricingBtn}
              >
                <Text style={styles.viewAllPricingText}>
                  Explore Full {pricingVehicleType} Launch Price List →
                </Text>
              </Pressable>
            </View>

            {/* How MECHFIND Works (Rapido Style 3-Step) */}
            <View style={[styles.howItWorksCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: theme.border }]}>
              <Text style={[styles.howItWorksHeading, { color: theme.textPrimary }]}>
                How MECHFIND Works
              </Text>
              <View style={styles.stepsRow}>
                <View style={styles.stepItem}>
                  <View style={[styles.stepNum, { backgroundColor: BRAND_COLORS.primaryBlue }]}>
                    <Text style={styles.stepNumText}>1</Text>
                  </View>
                  <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Choose Issue</Text>
                  <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>
                    Select 2W/4W breakdown service with fixed launch price.
                  </Text>
                </View>

                <View style={styles.stepItem}>
                  <View style={[styles.stepNum, { backgroundColor: BRAND_COLORS.accentTeal }]}>
                    <Text style={styles.stepNumText}>2</Text>
                  </View>
                  <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>15–25m Dispatch</Text>
                  <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>
                    Nearest verified mechanic arrives at your GPS location.
                  </Text>
                </View>

                <View style={styles.stepItem}>
                  <View style={[styles.stepNum, { backgroundColor: '#16A34A' }]}>
                    <Text style={styles.stepNumText}>3</Text>
                  </View>
                  <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Fixed Payout</Text>
                  <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>
                    Pay the official verified rate via UPI or Cash. Zero surge fee.
                  </Text>
                </View>
              </View>
            </View>

            {/* Trust & Safety Pillars */}
            <View style={styles.trustGrid}>
              <View style={[styles.trustItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="shield-checkmark" size={20} color="#16A34A" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.trustTitle, { color: theme.textPrimary }]}>100% Verified Garages</Text>
                  <Text style={[styles.trustSub, { color: theme.textSecondary }]}>Skills & ID background checked</Text>
                </View>
              </View>

              <View style={[styles.trustItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="speedometer" size={20} color={BRAND_COLORS.primaryBlue} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.trustTitle, { color: theme.textPrimary }]}>15–25m Rapid Arrival</Text>
                  <Text style={[styles.trustSub, { color: theme.textSecondary }]}>Hyper-local GPS routing</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Right Column (Desktop) / Bottom Feed (Mobile) */}
          <View style={isDesktop ? styles.desktopRightCol : undefined}>
            {/* Active Emergency Request Banner (Only shown if user has active breakdown) */}
            {activeRequest ? (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/(customer)/live-tracking/[id]',
                    params: { id: activeRequest.id },
                  })
                }
                style={[
                  styles.activeRequestCard,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#EFF6FF',
                    borderColor: BRAND_COLORS.primaryBlue,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="View active request live tracking"
              >
                <View style={styles.activePulse}>
                  <View style={styles.activePulseCore} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.activeRow}>
                    <Text style={[styles.activeTitle, { color: theme.textPrimary }]}>
                      Mechanic Dispatched
                    </Text>
                    <Badge label="ACTIVE" variant="verified" size="sm" />
                  </View>
                  <Text style={[styles.activeSub, { color: theme.textSecondary }]}>
                    {activeRequest.categoryName} • {activeRequest.mechanic?.shopName || 'Apex Speed Garage'}
                  </Text>
                  <Text style={styles.activeEta}>
                    ETA: ~{activeRequest.etaMinutes || 10} mins • Tap to track live
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={BRAND_COLORS.primaryBlue} />
              </Pressable>
            ) : null}

            {/* 4. Nearby Verified Mechanics Section (Directly on SAME Screen) */}
            <View style={styles.mechanicsSection}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
                    Nearby Verified Mechanics
                  </Text>
                  <Text style={[styles.sectionSubheading, { color: theme.textSecondary }]}>
                    {filteredAndSortedMechanics.length} garages ready for instant roadside dispatch
                  </Text>
                </View>

                <Pressable
                  onPress={() => handleFindMechanics()}
                  style={[styles.refreshPill, { borderColor: theme.border }]}
                >
                  <Ionicons name="refresh" size={13} color={BRAND_COLORS.primaryBlue} />
                  <Text style={[styles.refreshPillText, { color: BRAND_COLORS.primaryBlue }]}>
                    Scan
                  </Text>
                </Pressable>
              </View>

              {/* Filter Pills Row */}
              <View style={styles.filterPillsRow}>
                {/* Sort filters */}
                {(['nearby', 'rating', 'price'] as const).map((filter) => {
                  const isSelected = activeFilter === filter;
                  const label =
                    filter === 'nearby' ? 'Nearest' : filter === 'rating' ? '★ Top Rated' : '₹ Lowest Price';
                  return (
                    <Pressable
                      key={filter}
                      onPress={() => setActiveFilter(filter)}
                      style={[
                        styles.filterPill,
                        {
                          backgroundColor: isSelected ? BRAND_COLORS.primaryBlue : theme.card,
                          borderColor: isSelected ? BRAND_COLORS.primaryBlue : theme.border,
                        },
                      ]}
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

                {/* Vehicle filter */}
                <Pressable
                  onPress={() =>
                    setVehicleFilter((prev) => (prev === 'all' ? 'car' : prev === 'car' ? 'bike' : 'all'))
                  }
                  style={[
                    styles.filterPill,
                    {
                      backgroundColor: vehicleFilter !== 'all' ? BRAND_COLORS.accentTeal : theme.card,
                      borderColor: vehicleFilter !== 'all' ? BRAND_COLORS.accentTeal : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      {
                        color: vehicleFilter !== 'all' ? '#FFFFFF' : theme.textPrimary,
                        fontWeight: vehicleFilter !== 'all' ? '700' : '500',
                      },
                    ]}
                  >
                    {vehicleFilter === 'all' ? 'All Vehicles' : vehicleFilter === 'car' ? 'Cars Only' : 'Bikes Only'}
                  </Text>
                </Pressable>
              </View>

              {/* Mechanic Cards List */}
              {renderMechanicCardsList()}
            </View>
          </View>
        </View>
      </View>

      {/* 5. Rapido-Style Professional Web Footer */}
      <WebFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: '68%',
  },
  headerLogoImage: {
    width: 34,
    height: 34,
    borderRadius: 6,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '65%',
  },
  locationText: {
    fontSize: 15,
    fontWeight: '700',
    marginHorizontal: 5,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: BRAND_COLORS.error,
  },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContent: {
    paddingVertical: SPACING.sm,
  },
  heroSection: {
    marginBottom: SPACING.md,
  },
  standbyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginBottom: 10,
  },
  standbyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  standbyText: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  heroHeading: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13.5,
    fontWeight: '400',
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  illustrationWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  heroActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  primaryHeroBtn: {
    flex: 1.2,
    minWidth: 200,
    height: 48,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BRAND_COLORS.primaryBlue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryHeroBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
  secondaryHeroBtn: {
    flex: 0.9,
    minWidth: 150,
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryHeroBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  findMechanicButton: {
    height: 50,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: BRAND_COLORS.primaryBlue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  findMechanicText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    marginVertical: SPACING.sm,
    borderColor: '#FECACA',
    borderWidth: 1,
  },
  errorTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  errorMsg: {
    fontSize: 12,
    marginTop: 2,
  },
  retryBtn: {
    backgroundColor: BRAND_COLORS.primaryBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  quickServicesContainer: {
    marginBottom: SPACING.md,
  },
  quickServicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  quickServiceItem: {
    width: '31.5%',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickServiceTitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  quickServicePrice: {
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  vehicleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
    gap: 12,
  },
  vehicleIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  vehicleName: {
    fontSize: 13.5,
    fontWeight: '700',
    marginTop: 2,
  },
  vehicleChangeText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  activeRequestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    marginBottom: SPACING.md,
    gap: 12,
  },
  activePulse: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(23, 105, 232, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePulseCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BRAND_COLORS.primaryBlue,
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  activeTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  activeSub: {
    fontSize: 12.5,
    marginBottom: 2,
  },
  activeEta: {
    fontSize: 11.5,
    fontWeight: '700',
    color: BRAND_COLORS.primaryBlue,
  },
  mechanicsSection: {
    marginBottom: SPACING.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
  },
  sectionSubheading: {
    fontSize: 12,
    marginTop: 2,
  },
  refreshPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  refreshPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 11.5,
  },
  emptyStateCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12.5,
    textAlign: 'center',
  },
  expandRadiusBtn: {
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
  },
  expandRadiusText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  mechanicCard: {
    padding: 12,
    marginBottom: 10,
  },
  cardMainRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  shopThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopInfoCol: {
    flex: 1,
    minWidth: 0,
  },
  shopNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  shopNameText: {
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
  },
  ratingDistanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bulletDot: {
    fontSize: 12,
  },
  distanceText: {
    fontSize: 12,
  },
  priceEtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  priceTag: {
    fontSize: 12,
    fontWeight: '700',
  },
  etaBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  etaTag: {
    fontSize: 11,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  viewProfileBtn: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewProfileText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  bookNowBtn: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookNowText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pricingShowcaseSection: {
    marginTop: 16,
    marginBottom: 16,
    gap: 10,
  },
  pricingSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  pricingSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  pricingSectionSub: {
    fontSize: 12,
  },
  pricingSegmentWrap: {
    flexDirection: 'row',
    borderRadius: RADIUS.sm,
    padding: 3,
    gap: 4,
  },
  pricingSegmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.xs,
  },
  pricingSegmentActive: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 1,
  },
  pricingSegmentText: {
    fontSize: 12,
    fontWeight: '700',
  },
  pricingCardsGrid: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  pricingCard: {
    flex: 1,
    minWidth: 135,
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: 6,
  },
  pricingCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pricingIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pricingCardAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  pricingCardTitle: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  pricingCardBottom: {
    marginTop: 2,
  },
  pricingCardAction: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  viewAllPricingBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  viewAllPricingText: {
    color: BRAND_COLORS.primaryBlue,
    fontSize: 12.5,
    fontWeight: '700',
  },
  howItWorksCard: {
    padding: 16,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginVertical: 8,
    gap: 12,
  },
  howItWorksHeading: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  stepsRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  stepItem: {
    flex: 1,
    minWidth: 120,
    gap: 4,
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepNumText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  stepDesc: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  trustGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  trustItem: {
    flex: 1,
    minWidth: 180,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  trustTitle: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  trustSub: {
    fontSize: 11,
  },
  desktopColumnsRow: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start',
    width: '100%',
  },
  desktopLeftCol: {
    flex: 1.15,
    minWidth: 460,
  },
  desktopRightCol: {
    flex: 0.85,
    minWidth: 380,
  },
});
