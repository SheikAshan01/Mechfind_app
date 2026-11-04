import React, { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { BRAND_COLORS } from '../../theme/colors';
import { RADIUS } from '../../theme/radius';
import { SPACING } from '../../theme/spacing';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Header } from '../../components/ui/Header';
import { Card } from '../../components/ui/Card';
import { MapFallback } from '../../components/ui/MapFallback';
import { useCustomerStore } from '../../stores/customerStore';
import { useResponsive } from '../../hooks/useResponsive';
import { NearbyMechanic } from '../../types/mechanic';

type FilterType = 'nearby' | 'rating' | 'price';

export default function NearbyMechanicsScreen() {
  const { theme, isDark } = useTheme();
  const { isSmallDevice, horizontalPadding, isTablet, isDesktop } = useResponsive();
  const { nearbyMechanics, currentLocation } = useCustomerStore();

  const [activeFilter, setActiveFilter] = useState<FilterType>('nearby');

  const filteredAndSorted = useMemo(() => {
    const list = [...nearbyMechanics];
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
    (['nearby', 'rating', 'price'] as FilterType[]).map((filter) => {
      const isSelected = activeFilter === filter;
      const label =
        filter === 'nearby'
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
    });

  const renderMechanicCard = ({ item }: { item: NearbyMechanic }) => (
    <Card
      onPress={() => handleSelectMechanic(item)}
      style={styles.mechanicCard}
    >
      <View style={styles.cardRow}>
        {/* Workshop Thumbnail Icon / Official Emblem */}
        <Image
          source={require('../../../assets/images/mechfind_logo.png')}
          style={styles.shopLogoThumb}
          resizeMode="contain"
          accessibilityLabel="MECHFIND Verified Garage"
        />

        {/* Details Column */}
        <View style={styles.detailsCol}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.shopName, { color: theme.textPrimary }]}
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

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color="#F59E0B" />
            <Text style={[styles.ratingScore, { color: theme.textSecondary }]}>
              {item.rating} ({item.reviewCount || 98})
            </Text>
            <Text style={[styles.dot, { color: theme.textSecondary }]}>•</Text>
            <Text style={[styles.distanceText, { color: theme.textSecondary }]}>
              {item.distanceKm} km
            </Text>
          </View>

          <View style={styles.bottomMetaRow}>
            <Text style={[styles.startingPrice, { color: theme.textPrimary }]}>
              ₹{item.pricingStartingAt || 199} Starting
            </Text>
            <View style={styles.etaContainer}>
              <Ionicons name="time-outline" size={12} color={theme.textSecondary} />
              <Text style={[styles.etaText, { color: theme.textSecondary }]}>
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
      <Header title="Nearby Mechanics" showBack showThemeToggle />

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
        {isDesktop ? (
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
                  <Text style={[styles.desktopMetaText, { color: theme.textPrimary }]}>
                    All {nearbyMechanics.length} garages are verified with genuine spares guarantee and live roadside arrival.
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
    borderColor: '#E2E8F0',
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
    borderColor: '#E2E8F0',
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
});
