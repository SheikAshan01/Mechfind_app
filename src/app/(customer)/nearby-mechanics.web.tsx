import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeContext';
import { ResponsiveNav } from '../../components/navigation/ResponsiveNav';
import { WebFooter } from '../../components/navigation/WebFooter';
import { MapFallback } from '../../components/ui/MapFallback';
import { useCustomerStore } from '../../stores/customerStore';
import { useResponsive } from '../../hooks/useResponsive';
import { NearbyMechanic } from '../../types/mechanic';
import { locationService } from '../../services/location/locationService';

const ACCENT_YELLOW = '#FFC400';

type FilterType = 'nearby' | 'rating' | 'price' | 'services' | 'within_7km';
type SortOption = 'nearest' | 'highest_rated' | 'lowest_price';

export default function NearbyMechanicsWeb() {
  const { isDark } = useTheme();
  const { width } = useResponsive();
  const isDesktop = width >= 1024;
  const isTablet = width >= 720 && width < 1024;

  const { nearbyMechanics, currentLocation, setCurrentLocation } = useCustomerStore();
  const params = useLocalSearchParams<{ filter?: string }>();

  const [activeFilter, setActiveFilter] = useState<FilterType>(
    params.filter === 'within_7km' ? 'within_7km' : 'nearby'
  );
  const [selectedSort, setSelectedSort] = useState<SortOption>('nearest');
  const [locationInput, setLocationInput] = useState(
    currentLocation?.address || 'Dindigul West, Dindigul'
  );
  const [isLocating, setIsLocating] = useState(false);
  const [selectedMechanicId, setSelectedMechanicId] = useState<string>(
    nearbyMechanics[0]?.id || ''
  );

  // Sync address changes
  const handleDetectLocation = async () => {
    setIsLocating(true);
    try {
      const loc = await locationService.getCurrentLocation();
      setCurrentLocation({
        latitude: loc.latitude,
        longitude: loc.longitude,
        address: loc.address,
      });
      setLocationInput(loc.address || 'Dindigul West, Dindigul');
    } catch {
      // Fallback
    } finally {
      setIsLocating(false);
    }
  };

  // Filter & sort logic
  const filteredAndSortedMechanics = useMemo(() => {
    let list = [...nearbyMechanics];

    // Filter rules
    if (activeFilter === 'within_7km') {
      list = list.filter((m) => m.distanceKm <= 7);
    }

    // Sort rules
    if (selectedSort === 'highest_rated' || activeFilter === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (selectedSort === 'lowest_price' || activeFilter === 'price') {
      list.sort((a, b) => (a.pricingStartingAt || 199) - (b.pricingStartingAt || 199));
    } else {
      list.sort((a, b) => a.distanceKm - b.distanceKm);
    }

    return list;
  }, [nearbyMechanics, activeFilter, selectedSort]);

  const selectedMechanic = useMemo(() => {
    return (
      filteredAndSortedMechanics.find((m) => m.id === selectedMechanicId) ||
      filteredAndSortedMechanics[0] ||
      null
    );
  }, [filteredAndSortedMechanics, selectedMechanicId]);

  const handleSelectMechanic = (mechanic: NearbyMechanic) => {
    setSelectedMechanicId(mechanic.id);
  };

  const handleBookMechanic = (mechanic: NearbyMechanic) => {
    router.push({
      pathname: '/(customer)/breakdown-request',
      params: { mechanicId: mechanic.id },
    });
  };

  return (
    <View style={[styles.pageRoot, { backgroundColor: isDark ? '#101114' : '#F8F9FA' }]}>
      {/* 1. Website Header Navigation */}
      <ResponsiveNav />

      {/* 2. Scrollable Body in Natural Document Flow */}
      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContainer}>
          {/* ========================================================= */}
          {/* SECTION A: FIND A MECHANIC HERO                           */}
          {/* ========================================================= */}
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: isDark ? '#16171B' : '#101114',
                borderColor: isDark ? '#2D3139' : '#1F2024',
              },
            ]}
          >
            <View style={styles.heroRow}>
              {/* Left Column: Breadcrumb, Headline, Subtitle, Trust Badges */}
              <View style={styles.heroLeftCol}>
                {/* Breadcrumb */}
                <View style={styles.breadcrumbRow}>
                  <Pressable onPress={() => router.push('/(customer)/(tabs)')}>
                    <Text style={styles.breadcrumbLink}>Home</Text>
                  </Pressable>
                  <Text style={styles.breadcrumbDivider}>{' > '}</Text>
                  <Text style={styles.breadcrumbActive}>Find a Mechanic</Text>
                </View>

                {/* Main Headline */}
                <Text style={styles.heroHeadline}>
                  Find a Verified{'\n'}Mechanic{' '}
                  <Text style={{ color: ACCENT_YELLOW }}>Near You</Text>
                </Text>

                {/* Subtitle Description */}
                <Text style={styles.heroSubtitle}>
                  Locate trusted mechanics in your area for quick service, repairs and roadside assistance.
                </Text>

                {/* Trust Badges in a Row */}
                <View style={styles.trustBadgesRow}>
                  <View style={styles.trustBadgeItem}>
                    <Ionicons name="shield-checkmark" size={18} color={ACCENT_YELLOW} />
                    <Text style={styles.trustBadgeText}>Verified Workshops</Text>
                  </View>

                  <View style={styles.trustBadgeItem}>
                    <Ionicons name="flash" size={18} color={ACCENT_YELLOW} />
                    <Text style={styles.trustBadgeText}>Quick Response</Text>
                  </View>

                  <View style={styles.trustBadgeItem}>
                    <Ionicons name="location" size={18} color={ACCENT_YELLOW} />
                    <Text style={styles.trustBadgeText}>Near Your Location</Text>
                  </View>
                </View>
              </View>

              {/* Right Column: Hero Visual Graphic with Yellow Diagonal Slash */}
              {isDesktop && (
                <View style={styles.heroRightCol}>
                  <View style={styles.heroImageWrapper}>
                    <Image
                      source={require('../../../assets/images/web-hero-mechanic.png')}
                      style={styles.heroMechanicImage}
                      resizeMode="contain"
                      accessibilityLabel="MECHFIND Partner Mechanic"
                    />
                    {/* Corner Yellow Diagonal Slash Accent */}
                    <View pointerEvents="none" style={styles.heroDiagonalAccent}>
                      <Svg width={200} height={200} viewBox="0 0 200 200">
                        <Path d="M80 -30 L230 120 L200 150 L50 0 Z" fill={ACCENT_YELLOW} />
                      </Svg>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* ========================================================= */}
          {/* SECTION B: LOCATION SEARCH CARD                           */}
          {/* ========================================================= */}
          <View
            style={[
              styles.locationSearchCard,
              {
                backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                borderColor: isDark ? '#2D3139' : '#E5E7EB',
              },
            ]}
          >
            <View style={styles.locationInputGroup}>
              <Ionicons name="location-sharp" size={20} color={ACCENT_YELLOW} style={{ marginLeft: 8 }} />
              <TextInput
                style={[
                  styles.locationTextInput,
                  { color: isDark ? '#FFFFFF' : '#101114' },
                ]}
                placeholder="Enter city, area or street address..."
                placeholderTextColor="#9CA3AF"
                value={locationInput}
                onChangeText={setLocationInput}
              />
              <Pressable
                onPress={handleDetectLocation}
                hitSlop={8}
                style={styles.detectLocationBtn}
                accessibilityLabel="Detect GPS Location"
              >
                {isLocating ? (
                  <ActivityIndicator size="small" color={ACCENT_YELLOW} />
                ) : (
                  <Ionicons name="locate-outline" size={20} color="#6B7280" />
                )}
              </Pressable>
            </View>

            {/* Big Yellow Search CTA */}
            <Pressable
              onPress={() => {}}
              style={styles.searchSubmitBtn}
              accessibilityRole="button"
            >
              <Ionicons name="search" size={17} color="#101114" />
              <Text style={styles.searchSubmitBtnText}>Search</Text>
            </Pressable>
          </View>

          {/* ========================================================= */}
          {/* SECTION C: FILTER BUTTONS ROW                             */}
          {/* ========================================================= */}
          <View style={styles.filtersRow}>
            {/* Filter: Nearby */}
            <Pressable
              onPress={() => {
                setActiveFilter('nearby');
                setSelectedSort('nearest');
              }}
              style={[
                styles.filterPill,
                activeFilter === 'nearby'
                  ? isDark
                    ? styles.filterPillActiveDark
                    : styles.filterPillActiveLight
                  : isDark
                  ? styles.filterPillInactiveDark
                  : styles.filterPillInactiveLight,
              ]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  {
                    color:
                      activeFilter === 'nearby'
                        ? isDark
                          ? '#101114'
                          : '#FFFFFF'
                        : isDark
                        ? '#C7C9CE'
                        : '#374151',
                    fontWeight: activeFilter === 'nearby' ? '700' : '600',
                  },
                ]}
              >
                Nearby
              </Text>
            </Pressable>

            {/* Filter: Rating */}
            <Pressable
              onPress={() => {
                setActiveFilter('rating');
                setSelectedSort('highest_rated');
              }}
              style={[
                styles.filterPill,
                activeFilter === 'rating'
                  ? isDark
                    ? styles.filterPillActiveDark
                    : styles.filterPillActiveLight
                  : isDark
                  ? styles.filterPillInactiveDark
                  : styles.filterPillInactiveLight,
              ]}
            >
              <Ionicons
                name="star"
                size={14}
                color={activeFilter === 'rating' ? '#101114' : '#F59E0B'}
              />
              <Text
                style={[
                  styles.filterPillText,
                  {
                    color:
                      activeFilter === 'rating'
                        ? isDark
                          ? '#101114'
                          : '#FFFFFF'
                        : isDark
                        ? '#C7C9CE'
                        : '#374151',
                    fontWeight: activeFilter === 'rating' ? '700' : '600',
                  },
                ]}
              >
                Rating
              </Text>
            </Pressable>

            {/* Filter: Price */}
            <Pressable
              onPress={() => {
                setActiveFilter('price');
                setSelectedSort('lowest_price');
              }}
              style={[
                styles.filterPill,
                activeFilter === 'price'
                  ? isDark
                    ? styles.filterPillActiveDark
                    : styles.filterPillActiveLight
                  : isDark
                  ? styles.filterPillInactiveDark
                  : styles.filterPillInactiveLight,
              ]}
            >
              <Ionicons
                name="pricetag-outline"
                size={14}
                color={activeFilter === 'price' ? '#101114' : '#6B7280'}
              />
              <Text
                style={[
                  styles.filterPillText,
                  {
                    color:
                      activeFilter === 'price'
                        ? isDark
                          ? '#101114'
                          : '#FFFFFF'
                        : isDark
                        ? '#C7C9CE'
                        : '#374151',
                    fontWeight: activeFilter === 'price' ? '700' : '600',
                  },
                ]}
              >
                Price
              </Text>
            </Pressable>

            {/* Filter: Services */}
            <Pressable
              onPress={() => {
                setActiveFilter('services');
              }}
              style={[
                styles.filterPill,
                activeFilter === 'services'
                  ? isDark
                    ? styles.filterPillActiveDark
                    : styles.filterPillActiveLight
                  : isDark
                  ? styles.filterPillInactiveDark
                  : styles.filterPillInactiveLight,
              ]}
            >
              <Ionicons
                name="grid-outline"
                size={14}
                color={activeFilter === 'services' ? '#101114' : '#6B7280'}
              />
              <Text
                style={[
                  styles.filterPillText,
                  {
                    color:
                      activeFilter === 'services'
                        ? isDark
                          ? '#101114'
                          : '#FFFFFF'
                        : isDark
                        ? '#C7C9CE'
                        : '#374151',
                    fontWeight: activeFilter === 'services' ? '700' : '600',
                  },
                ]}
              >
                Services
              </Text>
            </Pressable>

            {/* Filter: Within 7 km */}
            <Pressable
              onPress={() => {
                setActiveFilter((prev) => (prev === 'within_7km' ? 'nearby' : 'within_7km'));
              }}
              style={[
                styles.filterPill,
                activeFilter === 'within_7km'
                  ? styles.filterPillActiveYellow
                  : isDark
                  ? styles.filterPillInactiveDark
                  : styles.filterPillInactiveLight,
              ]}
            >
              <Ionicons
                name="flash"
                size={13}
                color={activeFilter === 'within_7km' ? '#101114' : ACCENT_YELLOW}
              />
              <Text
                style={[
                  styles.filterPillText,
                  {
                    color: activeFilter === 'within_7km' ? '#101114' : isDark ? '#FFC400' : '#B45309',
                    fontWeight: '700',
                  },
                ]}
              >
                Within 7 km
              </Text>
            </Pressable>
          </View>

          {/* ========================================================= */}
          {/* SECTION D: TWO-COLUMN DISCOVERY (48% LIST, 52% MAP)       */}
          {/* ========================================================= */}
          {/* Header Row: Count & Sort By */}
          <View style={styles.discoveryHeaderRow}>
            <Text
              style={[
                styles.discoveryCountText,
                { color: isDark ? '#FFFFFF' : '#101114' },
              ]}
            >
              {filteredAndSortedMechanics.length} Mechanics Found
            </Text>

            <View style={styles.sortDropdownRow}>
              <Text style={[styles.sortLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Sort by:
              </Text>
              <Pressable
                onPress={() => {
                  setSelectedSort((prev) =>
                    prev === 'nearest'
                      ? 'highest_rated'
                      : prev === 'highest_rated'
                      ? 'lowest_price'
                      : 'nearest'
                  );
                }}
                style={[
                  styles.sortBtn,
                  {
                    backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                    borderColor: isDark ? '#2D3139' : '#E5E7EB',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sortBtnText,
                    { color: isDark ? '#FFFFFF' : '#101114' },
                  ]}
                >
                  {selectedSort === 'nearest'
                    ? 'Nearest'
                    : selectedSort === 'highest_rated'
                    ? 'Highest Rated'
                    : 'Lowest Price'}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={14}
                  color={isDark ? '#FFFFFF' : '#101114'}
                />
              </Pressable>
            </View>
          </View>

          {/* Two Columns Container */}
          <View
            style={[
              styles.twoColContainer,
              !isDesktop && styles.twoColContainerStacked,
            ]}
          >
            {/* LEFT COLUMN: MECHANIC CARDS LIST (~48%) */}
            <View style={styles.listCol}>
              {filteredAndSortedMechanics.length === 0 ? (
                <View
                  style={[
                    styles.emptyListCard,
                    {
                      backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                      borderColor: isDark ? '#2D3139' : '#E5E7EB',
                    },
                  ]}
                >
                  <Ionicons name="location-outline" size={36} color="#9CA3AF" />
                  <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                    No Mechanics Found Nearby
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    Try changing your location or adjusting your search filters.
                  </Text>
                  <Pressable
                    onPress={() => {
                      setActiveFilter('nearby');
                      setSelectedSort('nearest');
                    }}
                    style={styles.emptyResetBtn}
                  >
                    <Text style={styles.emptyResetBtnText}>Clear Filters</Text>
                  </Pressable>
                </View>
              ) : (
                filteredAndSortedMechanics.map((mech) => {
                  const isSelected = mech.id === selectedMechanic?.id;
                  const tags = mech.specializations || ['General', 'Battery', 'Tyre'];

                  return (
                    <Pressable
                      key={mech.id}
                      onPress={() => handleSelectMechanic(mech)}
                      style={[
                        styles.mechanicCard,
                        {
                          backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                          borderColor: isSelected
                            ? ACCENT_YELLOW
                            : isDark
                            ? '#2D3139'
                            : '#EAECEF',
                          borderWidth: isSelected ? 2 : 1,
                        },
                      ]}
                      accessibilityRole="button"
                    >
                      <View style={styles.cardInnerRow}>
                        {/* Workshop Emblem Thumbnail */}
                        <Image
                          source={require('../../../assets/images/workshop-gear-badge.png')}
                          style={styles.workshopEmblem}
                          resizeMode="contain"
                          accessibilityLabel={mech.shopName}
                        />

                        {/* Details */}
                        <View style={styles.cardDetailsCol}>
                          {/* Workshop Name & Verified Badge */}
                          <View style={styles.shopNameRow}>
                            <Text
                              style={[
                                styles.shopNameText,
                                { color: isDark ? '#FFFFFF' : '#101114' },
                              ]}
                              numberOfLines={1}
                            >
                              {mech.shopName}
                            </Text>
                            {mech.isVerified && (
                              <Ionicons
                                name="checkmark-circle"
                                size={16}
                                color="#16A34A"
                                style={{ marginLeft: 4 }}
                              />
                            )}
                          </View>

                          {/* Rating & Distance */}
                          <View style={styles.ratingDistanceRow}>
                            <Ionicons name="star" size={13} color="#F59E0B" />
                            <Text
                              style={[
                                styles.ratingText,
                                { color: isDark ? '#C7C9CE' : '#4B5563' },
                              ]}
                            >
                              {mech.rating} ({mech.reviewCount || 98})
                            </Text>
                            <Text style={styles.dotSeparator}>•</Text>
                            <Text
                              style={[
                                styles.distanceText,
                                { color: isDark ? '#C7C9CE' : '#4B5563' },
                              ]}
                            >
                              {mech.distanceKm} km
                            </Text>
                            {mech.distanceKm <= 7 && (
                              <View style={styles.radiusPill}>
                                <Text style={styles.radiusPillText}>⚡ 7 km</Text>
                              </View>
                            )}
                          </View>

                          {/* Service Tags */}
                          <View style={styles.serviceTagsRow}>
                            {tags.slice(0, 3).map((tag, idx) => (
                              <View
                                key={`tag-${idx}`}
                                style={[
                                  styles.serviceTagChip,
                                  {
                                    backgroundColor: isDark ? '#24262D' : '#F3F4F6',
                                    borderColor: isDark ? '#373A43' : '#E5E7EB',
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.serviceTagChipText,
                                    { color: isDark ? '#9CA3AF' : '#4B5563' },
                                  ]}
                                >
                                  {tag}
                                </Text>
                              </View>
                            ))}
                            {tags.length > 3 && (
                              <View
                                style={[
                                  styles.serviceTagChip,
                                  {
                                    backgroundColor: isDark ? '#24262D' : '#F3F4F6',
                                    borderColor: isDark ? '#373A43' : '#E5E7EB',
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.serviceTagChipText,
                                    { color: isDark ? '#9CA3AF' : '#4B5563' },
                                  ]}
                                >
                                  +{tags.length - 3}
                                </Text>
                              </View>
                            )}
                          </View>

                          {/* Starting Price */}
                          <Text
                            style={[
                              styles.startingPriceText,
                              { color: isDark ? '#FFFFFF' : '#101114' },
                            ]}
                          >
                            ₹{mech.pricingStartingAt || 199} Starting
                          </Text>
                        </View>

                        {/* Yellow Action Arrow Button */}
                        <Pressable
                          onPress={() => handleBookMechanic(mech)}
                          style={styles.cardArrowBtn}
                          accessibilityLabel="Book this mechanic"
                        >
                          <Ionicons name="arrow-forward" size={17} color="#101114" />
                        </Pressable>
                      </View>
                    </Pressable>
                  );
                })
              )}
            </View>

            {/* RIGHT COLUMN: STICKY LIVE MAP (~52%) */}
            <View style={styles.mapCol}>
              <View
                style={[
                  styles.mapCardWrapper,
                  {
                    backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                    borderColor: isDark ? '#2D3139' : '#EAECEF',
                  },
                ]}
              >
                {/* Real Live Map Embed with Fallback & Overlays */}
                <MapFallback
                  height={560}
                  userLocation={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    label: locationInput,
                  }}
                  mechanicLocation={
                    selectedMechanic
                      ? {
                          latitude: selectedMechanic.latitude,
                          longitude: selectedMechanic.longitude,
                          label: selectedMechanic.shopName,
                        }
                      : undefined
                  }
                  nearbyMechanics={filteredAndSortedMechanics.map((m) => ({
                    latitude: m.latitude,
                    longitude: m.longitude,
                    label: m.shopName,
                  }))}
                />

                {/* Selected Mechanic Floating Info Panel at bottom of map */}
                {selectedMechanic && (
                  <View
                    style={[
                      styles.mapFloatingSelectedCard,
                      {
                        backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                        borderColor: isDark ? '#2D3139' : '#E5E7EB',
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text
                          style={[
                            styles.mapSelectedShopName,
                            { color: isDark ? '#FFFFFF' : '#101114' },
                          ]}
                          numberOfLines={1}
                        >
                          {selectedMechanic.shopName}
                        </Text>
                        <Ionicons name="checkmark-circle" size={15} color="#16A34A" />
                      </View>
                      <Text style={styles.mapSelectedMeta}>
                        ⭐ {selectedMechanic.rating} • {selectedMechanic.distanceKm} km away • ~{selectedMechanic.estimatedArrivalMinutes || 12} mins ETA
                      </Text>
                    </View>

                    <Pressable
                      onPress={() => handleBookMechanic(selectedMechanic)}
                      style={styles.mapBookNowBtn}
                    >
                      <Text style={styles.mapBookNowBtnText}>Book Mechanic</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* 3. Website Footer in Natural Flow (No Overlap) */}
        <WebFooter />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageRoot: {
    flex: 1,
    minHeight: '100%',
  },
  pageScroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainContainer: {
    maxWidth: 1360,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 48,
    gap: 20,
  },

  /* SECTION A: HERO */
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 3,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 32,
  },
  heroLeftCol: {
    flex: 1.2,
    minWidth: 320,
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  breadcrumbLink: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  breadcrumbDivider: {
    fontSize: 13.5,
    color: '#6B7280',
  },
  breadcrumbActive: {
    fontSize: 13.5,
    fontWeight: '700',
    color: ACCENT_YELLOW,
  },
  heroHeadline: {
    fontSize: 38,
    fontWeight: '800',
    lineHeight: 46,
    letterSpacing: -0.5,
    color: '#FFFFFF',
    marginBottom: 14,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: '#9CA3AF',
    marginBottom: 24,
    maxWidth: 580,
  },
  trustBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  trustBadgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trustBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  heroRightCol: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  heroImageWrapper: {
    width: 380,
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1C1D21',
  },
  heroMechanicImage: {
    width: '100%',
    height: '100%',
  },
  heroDiagonalAccent: {
    position: 'absolute',
    top: -40,
    right: -40,
  },

  /* SECTION B: LOCATION SEARCH CARD */
  locationSearchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    padding: 8,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  locationInputGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationTextInput: {
    flex: 1,
    fontSize: 14.5,
    paddingVertical: 8,
  },
  detectLocationBtn: {
    padding: 8,
  },
  searchSubmitBtn: {
    backgroundColor: ACCENT_YELLOW,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 28,
    height: 46,
    borderRadius: 12,
  },
  searchSubmitBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#101114',
  },

  /* SECTION C: FILTERS ROW */
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
  },
  filterPillActiveLight: {
    backgroundColor: '#101114',
    borderColor: '#101114',
  },
  filterPillInactiveLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  filterPillActiveDark: {
    backgroundColor: ACCENT_YELLOW,
    borderColor: ACCENT_YELLOW,
  },
  filterPillInactiveDark: {
    backgroundColor: '#1A1B1F',
    borderColor: '#2D3139',
  },
  filterPillActiveYellow: {
    backgroundColor: ACCENT_YELLOW,
    borderColor: ACCENT_YELLOW,
  },
  filterPillText: {
    fontSize: 13.5,
  },

  /* SECTION D: TWO-COLUMN DISCOVERY */
  discoveryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  discoveryCountText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sortDropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortLabel: {
    fontSize: 13.5,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  sortBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  twoColContainer: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start',
  },
  twoColContainerStacked: {
    flexDirection: 'column-reverse',
  },

  /* LEFT COLUMN: LIST (~48%) */
  listCol: {
    flex: 1,
    minWidth: 420,
    gap: 14,
  },
  mechanicCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  workshopEmblem: {
    width: 62,
    height: 62,
    borderRadius: 12,
  },
  cardDetailsCol: {
    flex: 1,
    minWidth: 200,
  },
  shopNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  shopNameText: {
    fontSize: 16,
    fontWeight: '700',
    flexShrink: 1,
  },
  ratingDistanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  dotSeparator: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  distanceText: {
    fontSize: 12.5,
  },
  radiusPill: {
    backgroundColor: '#FFC400',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    marginLeft: 4,
  },
  radiusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#101114',
  },
  serviceTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  serviceTagChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  serviceTagChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  startingPriceText: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  cardArrowBtn: {
    backgroundColor: ACCENT_YELLOW,
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* RIGHT COLUMN: STICKY MAP (~52%) */
  mapCol: {
    flex: 1.1,
    minWidth: 440,
    position: 'sticky' as any,
    top: 24,
  },
  mapCardWrapper: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  mapFloatingSelectedCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  mapSelectedShopName: {
    fontSize: 14.5,
    fontWeight: '700',
    flexShrink: 1,
  },
  mapSelectedMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  mapBookNowBtn: {
    backgroundColor: ACCENT_YELLOW,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  mapBookNowBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#101114',
  },

  /* EMPTY LIST */
  emptyListCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  emptyResetBtn: {
    backgroundColor: ACCENT_YELLOW,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
    marginTop: 8,
  },
  emptyResetBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#101114',
  },
});
