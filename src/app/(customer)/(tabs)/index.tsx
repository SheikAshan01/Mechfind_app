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
    : 'Dindigul West';

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
            <View style={styles.heroSection}>
              <Text style={[styles.heroHeading, { color: theme.textPrimary }]}>
                Need vehicle assistance?
              </Text>
              <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
                Find a verified mechanic, anytime, anywhere.
              </Text>

              {/* Clean Vector Car with Hazard Warning Cone */}
              <View style={styles.illustrationWrap}>
                <CarBreakdownIllustration height={135} isDark={isDark} />
              </View>

              {/* Primary Blue "Find Mechanic" Button (STAYS ON HOME SCREEN) */}
              <Pressable
                onPress={() => handleFindMechanics()}
                disabled={isSearching}
                style={({ pressed }) => [
                  styles.findMechanicButton,
                  {
                    backgroundColor: BRAND_COLORS.primaryBlue,
                    opacity: pressed || isSearching ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.99 : 1 }],
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Find Mechanic"
              >
                {isSearching ? (
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                ) : (
                  <Ionicons name="search" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                )}
                <Text style={styles.findMechanicText}>
                  {isSearching ? 'Searching Garages...' : 'Find Mechanic'}
                </Text>
              </Pressable>
            </View>

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
  },
  illustrationWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
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
