import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { BRAND_COLORS } from '../../theme/colors';
import { RADIUS } from '../../theme/radius';
import { SPACING } from '../../theme/spacing';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Header } from '../../components/ui/Header';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { pricingService, ServicePricingItem } from '../../services/pricing/pricingService';
import { useResponsive } from '../../hooks/useResponsive';

export default function MechanicServicesPricingScreen() {
  const { theme, isDark } = useTheme();
  const { horizontalPadding, isTablet, isDesktop } = useResponsive();

  const [vehicleType, setVehicleType] = useState<'2W' | '4W'>('4W');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const services = useMemo(() => {
    let list = pricingService.getPricingByVehicle(vehicleType);
    if (selectedCategory !== 'all') {
      list = list.filter((s) => s.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.serviceName.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [vehicleType, selectedCategory, searchQuery]);

  const categories = useMemo(() => {
    const all = pricingService.getPricingByVehicle(vehicleType);
    const cats = new Set(all.map((s) => s.category));
    return ['all', ...Array.from(cats)];
  }, [vehicleType]);

  return (
    <ScreenContainer scrollable withPadding={false} edges={['top', 'left', 'right']}>
      <Header title="Services & Payouts" showBack showThemeToggle />

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
        {/* Top Info Banner */}
        <Card style={styles.infoBanner}>
          <View style={styles.infoBannerRow}>
            <Ionicons name="information-circle" size={20} color={BRAND_COLORS.primaryBlue} />
            <Text style={[styles.infoBannerText, { color: theme.textSecondary }]}>
              Official MECHFIND Launch Payout Rates. Payouts are credited to your bank account after job completion.
            </Text>
          </View>
        </Card>

        {/* 2W vs 4W Toggle */}
        <View style={styles.toggleRow}>
          <Pressable
            onPress={() => {
              setVehicleType('4W');
              setSelectedCategory('all');
            }}
            style={[
              styles.toggleBtn,
              {
                backgroundColor:
                  vehicleType === '4W'
                    ? BRAND_COLORS.primaryBlue
                    : theme.card,
                borderColor:
                  vehicleType === '4W' ? BRAND_COLORS.primaryBlue : theme.border,
              },
            ]}
            hitSlop={4}
          >
            <Ionicons
              name="car-outline"
              size={18}
              color={vehicleType === '4W' ? '#FFFFFF' : theme.textPrimary}
            />
            <Text
              style={[
                styles.toggleBtnText,
                { color: vehicleType === '4W' ? '#FFFFFF' : theme.textPrimary },
              ]}
            >
              Four-Wheeler (4W)
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setVehicleType('2W');
              setSelectedCategory('all');
            }}
            style={[
              styles.toggleBtn,
              {
                backgroundColor:
                  vehicleType === '2W'
                    ? BRAND_COLORS.primaryBlue
                    : theme.card,
                borderColor:
                  vehicleType === '2W' ? BRAND_COLORS.primaryBlue : theme.border,
              },
            ]}
            hitSlop={4}
          >
            <Ionicons
              name="bicycle-outline"
              size={18}
              color={vehicleType === '2W' ? '#FFFFFF' : theme.textPrimary}
            />
            <Text
              style={[
                styles.toggleBtnText,
                { color: vehicleType === '2W' ? '#FFFFFF' : theme.textPrimary },
              ]}
            >
              Two-Wheeler (2W)
            </Text>
          </Pressable>
        </View>

        {/* Search Input */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Ionicons name="search" size={18} color={theme.textSecondary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search service name..."
            placeholderTextColor={theme.textTertiary}
            style={[styles.searchInput, { color: theme.textPrimary }]}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={6}>
              <Ionicons name="close-circle" size={16} color={theme.textTertiary} />
            </Pressable>
          )}
        </View>

        {/* Category Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryPillsRow}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const label =
              cat === 'all'
                ? 'All Services'
                : cat.charAt(0).toUpperCase() + cat.slice(1);
            return (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.categoryPill,
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
                    styles.categoryPillText,
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
        </ScrollView>

        {/* Services List */}
        <View style={styles.servicesList}>
          {services.map((item: ServicePricingItem) => (
            <Card key={item.id} style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.serviceTitle, { color: theme.textPrimary }]}
                    numberOfLines={2}
                  >
                    {item.serviceName}
                  </Text>
                  <Text
                    style={[styles.categoryBadge, { color: BRAND_COLORS.primaryBlue }]}
                  >
                    {item.category.toUpperCase()} • ~{item.standardLaborDurationMin} MINS
                  </Text>
                </View>

                {item.isQuoteFirst && (
                  <Badge label="Quote First" variant="warning" size="sm" />
                )}
              </View>

              <View style={[styles.pricingRow, { borderTopColor: theme.divider }]}>
                {/* Mechanic Payout */}
                <View style={styles.priceCol}>
                  <Text style={[styles.priceColLabel, { color: theme.textSecondary }]}>
                    Your Payout
                  </Text>
                  <Text style={[styles.payoutValue, { color: BRAND_COLORS.successGreen }]}>
                    ₹{item.mechanicPayout}
                  </Text>
                </View>

                {/* Customer Price */}
                <View style={styles.priceCol}>
                  <Text style={[styles.priceColLabel, { color: theme.textSecondary }]}>
                    Customer Price
                  </Text>
                  <Text style={[styles.customerValue, { color: theme.textPrimary }]}>
                    ₹{item.customerPrice}
                  </Text>
                </View>

                {/* MechFind Margin */}
                <View style={styles.priceCol}>
                  <Text style={[styles.priceColLabel, { color: theme.textSecondary }]}>
                    MechFind Fee
                  </Text>
                  <Text style={[styles.marginValue, { color: theme.textSecondary }]}>
                    ₹{item.platformMargin}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    paddingVertical: SPACING.md,
  },
  infoBanner: {
    padding: 12,
    marginBottom: SPACING.md,
    backgroundColor: 'rgba(23, 105, 245, 0.06)',
    borderColor: 'rgba(23, 105, 245, 0.2)',
  },
  infoBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoBannerText: {
    fontSize: 12.5,
    lineHeight: 18,
    flex: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: SPACING.md,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13.5,
  },
  categoryPillsRow: {
    gap: 8,
    paddingBottom: SPACING.md,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 12.5,
  },
  servicesList: {
    gap: 10,
    paddingBottom: SPACING.xl,
  },
  serviceCard: {
    padding: 14,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  serviceTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  categoryBadge: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  priceCol: {
    alignItems: 'flex-start',
  },
  priceColLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  payoutValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  customerValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  marginValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});

