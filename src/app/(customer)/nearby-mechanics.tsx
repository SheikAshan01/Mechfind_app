import React, { useMemo, useState } from 'react';
import { FlatList, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { BRAND_COLORS } from '../../theme/colors';
import { RADIUS } from '../../theme/radius';
import { SPACING } from '../../theme/spacing';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Header } from '../../components/ui/Header';
import { Card } from '../../components/ui/Card';
import { MapFallback } from '../../components/ui/MapFallback';
import { EmptyState } from '../../components/ui/EmptyState';
import { useCustomerStore } from '../../stores/customerStore';
import { useResponsive } from '../../hooks/useResponsive';
import { NearbyMechanic } from '../../types/mechanic';
import { ResponsiveNav } from '../../components/navigation/ResponsiveNav';
import { WebFooter } from '../../components/navigation/WebFooter';

type FilterType = 'within_7km' | 'nearby' | 'rating' | 'price';

const ACCENT_YELLOW = '#FFC400';

export default function NearbyMechanicsScreen() {
  const { theme, isDark } = useTheme();
  const { isSmallDevice, horizontalPadding, isTablet, isDesktop } = useResponsive();
  const { nearbyMechanics, currentLocation } = useCustomerStore();
  const params = useLocalSearchParams<{ filter?: string }>();

  const [activeFilter, setActiveFilter] = useState<FilterType>(
    params.filter === 'within_7km' ? 'within_7km' : 'nearby'
  );

  const filteredAndSorted = useMemo(() => {
    let list = [...nearbyMechanics];
    if (activeFilter === 'within_7km') {
      list = list.filter((m) => m.distanceKm <= 7);
      return list.sort((a, b) => a.distanceKm - b.distanceKm);
    }
    if (activeFilter === 'rating') {
      return list.sort((a, b) => b.rating - a.rating);
    }
    if (activeFilter === 'price') {
      return list.sort((a, b) => (a.pricingStartingAt || 199) - (b.pricingStartingAt || 199));
    }
    return list.sort((a, b) => a.distanceKm - b.distanceKm);
  }, [nearbyMechanics, activeFilter]);

  const handleSelectMechanic = (mechanic: NearbyMechanic) => {
    router.push({
      pathname: '/(customer)/breakdown-request',
      params: { mechanicId: mechanic.id },
    });
  };

  const mapHeight = isSmallDevice ? 170 : 190;

  const renderFilters = () =>
    (['within_7km', 'nearby', 'rating', 'price'] as FilterType[]).map((filter) => {
      const isSelected = activeFilter === filter;
      const is7Km = filter === 'within_7km';
      const label =
        filter === 'within_7km'
          ? '⚡ Within 7 km'
          : filter === 'nearby'
          ? 'Nearby'
          : filter === 'rating'
          ? 'Rating'
          : 'Price';

      return (
        <Pressable
          key={filter}
          onPress={() => setActiveFilter(filter)}
          style={[
            styles.filterPill,
            {
              backgroundColor: isSelected
                ? is7Km
                  ? ACCENT_YELLOW
                  : isDark
                  ? '#FFFFFF'
                  : '#101114'
                : isDark
                ? '#1A1B1F'
                : '#FFFFFF',
              borderColor: isSelected
                ? is7Km
                  ? ACCENT_YELLOW
                  : isDark
                  ? '#FFFFFF'
                  : '#101114'
                : isDark
                ? '#2D3139'
                : '#E5E7EB',
            },
          ]}
          hitSlop={4}
        >
          <Text
            style={[
              styles.filterPillText,
              {
                color: isSelected
                  ? is7Km
                    ? '#101114'
                    : isDark
                    ? '#101114'
                    : '#FFFFFF'
                  : isDark
                  ? '#E5E7EB'
                  : '#1F2937',
                fontWeight: isSelected ? '700' : '600',
              },
            ]}
          >
            {label}
          </Text>
        </Pressable>
      );
    });

  const renderMechanicCard = ({ item }: { item: NearbyMechanic }) => (
    <Card
      onPress={() => handleSelectMechanic(item)}
      style={[
        styles.mechanicCard,
        {
          backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
          borderColor: isDark ? '#2D3139' : '#E5E7EB',
        },
      ]}
    >
      <View style={styles.cardRow}>
        {/* Workshop Thumbnail Icon / Official Emblem */}
        <Image
          source={require('../../../assets/images/app-emblem.png')}
          style={styles.shopLogoThumb}
          resizeMode="contain"
          accessibilityLabel="MECHFIND Verified Garage"
        />

        {/* Details Column */}
        <View style={styles.detailsCol}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.shopName, { color: isDark ? '#FFFFFF' : '#101114' }]}
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
            {item.distanceKm <= 7 && (
              <View style={styles.within7KmBadge}>
                <Text style={styles.within7KmBadgeText}>Within 7 km</Text>
              </View>
            )}
          </View>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color="#F59E0B" />
            <Text style={[styles.ratingScore, { color: isDark ? '#9CA3AF' : '#747B87' }]}>
              {item.rating} ({item.reviewCount || 98})
            </Text>
            <Text style={[styles.dot, { color: isDark ? '#9CA3AF' : '#747B87' }]}>•</Text>
            <Text style={[styles.distanceText, { color: isDark ? '#9CA3AF' : '#747B87' }]}>
              {item.distanceKm} km
            </Text>
          </View>

          <View style={styles.bottomMetaRow}>
            <Text style={[styles.startingPrice, { color: isDark ? '#FFFFFF' : '#101114' }]}>
              ₹{item.pricingStartingAt || 199} Starting
            </Text>
            <View style={styles.etaContainer}>
              <Ionicons name="time-outline" size={12} color={isDark ? '#9CA3AF' : '#747B87'} />
              <Text style={[styles.etaText, { color: isDark ? '#9CA3AF' : '#747B87' }]}>
                ~{item.estimatedArrivalMinutes || 10} mins
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <ScreenContainer withPadding={false} edges={['top', 'left', 'right']}>
      {Platform.OS === 'web' ? (
        <ResponsiveNav />
      ) : (
        <Header
          title="Verified Mechanics (Within 7 km Radius)"
          showBack
          showThemeToggle
        />
      )}

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
        {/* Radius Title Highlight Banner */}
        <View
          style={[
            styles.radiusBanner,
            {
              backgroundColor: isDark ? '#1C1910' : '#FFFBEB',
              borderColor: isDark ? '#4D3B00' : '#FDE68A',
            },
          ]}
        >
          <Ionicons name="shield-checkmark" size={18} color={ACCENT_YELLOW} />
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.radiusBannerTitle,
                { color: isDark ? '#FFC400' : '#92400E' },
              ]}
            >
              Mechanics within 7 km Radius
            </Text>
            <Text
              style={[
                styles.radiusBannerSub,
                { color: isDark ? '#D1D5DB' : '#78350F' },
              ]}
            >
              Rapid response within 10–15 mins for doorstep & breakdown assistance
            </Text>
          </View>
        </View>

        {filteredAndSorted.length === 0 ? (
          <EmptyState
            icon="location-outline"
            title="No mechanics within 7 km"
            description="No active mechanics found within 7 km right now. Try expanding your search filter to 'Nearby' to see all available workshops."
            actionTitle="Show All Nearby"
            onActionPress={() => setActiveFilter('nearby')}
          />
        ) : isDesktop ? (
          <View style={styles.desktopLayout}>
            {/* Left Column: Filter Pills + Scrollable Mechanic Cards */}
            <View style={styles.desktopListCol}>
              <View style={styles.filterRow}>{renderFilters()}</View>
              <FlatList
                data={filteredAndSorted}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={renderMechanicCard}
              />
            </View>

            {/* Right Column: Large Interactive Map & Live Coverage Info */}
            <View style={styles.desktopMapCol}>
              <View style={styles.mapWrapDesktop}>
                <MapFallback
                  height={520}
                  userLocation={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                  }}
                  nearbyMechanics={nearbyMechanics.map((m) => ({
                    latitude: m.latitude,
                    longitude: m.longitude,
                  }))}
                />
              </View>
              <Card style={styles.desktopMetaCard}>
                <View style={styles.desktopMetaRow}>
                  <Ionicons name="shield-checkmark" size={20} color={BRAND_COLORS.successGreen} />
                  <Text style={[styles.desktopMetaText, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                    All displayed mechanics have verified workshops within your active 7 km service radius.
                  </Text>
                </View>
              </Card>
            </View>
          </View>
        ) : (
          <>
            {/* Top Radar Map View */}
            <View style={styles.mapWrap}>
              <MapFallback
                height={mapHeight}
                userLocation={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                }}
                nearbyMechanics={nearbyMechanics.map((m) => ({
                  latitude: m.latitude,
                  longitude: m.longitude,
                }))}
              />
            </View>

            {/* Filter Pills */}
            <View style={styles.filterRow}>{renderFilters()}</View>

            {/* Mechanic Cards List */}
            <FlatList
              data={filteredAndSorted}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderItem={renderMechanicCard}
            />
          </>
        )}
      </View>
      {Platform.OS === 'web' && <WebFooter />}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    flex: 1,
    paddingTop: SPACING.xs,
  },
  mapWrap: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E6E9',
    marginBottom: SPACING.sm,
  },
  filterRow: {
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
  mechanicCard: {
    marginBottom: SPACING.sm + 2,
    padding: 12,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shopThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopLogoThumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  detailsCol: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  shopName: {
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  ratingScore: {
    fontSize: 12,
    fontWeight: '600',
  },
  dot: {
    fontSize: 12,
  },
  distanceText: {
    fontSize: 12,
  },
  bottomMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  startingPrice: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  etaText: {
    fontSize: 11.5,
  },
  desktopLayout: {
    flexDirection: 'row',
    gap: 24,
    flex: 1,
    alignItems: 'flex-start',
    paddingTop: SPACING.sm,
  },
  desktopListCol: {
    flex: 1.1,
    minWidth: 420,
  },
  desktopMapCol: {
    flex: 1,
    minWidth: 420,
    position: 'sticky' as any,
    top: 20,
  },
  mapWrapDesktop: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E6E9',
    marginBottom: SPACING.md,
  },
  desktopMetaCard: {
    padding: SPACING.md,
  },
  desktopMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  desktopMetaText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
    fontWeight: '500',
  },
  radiusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.sm + 4,
  },
  radiusBannerTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  radiusBannerSub: {
    fontSize: 11.5,
    marginTop: 1,
  },
  within7KmBadge: {
    backgroundColor: '#FFC400',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  within7KmBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#101114',
  },
});
