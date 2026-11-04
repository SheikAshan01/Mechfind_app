import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { BRAND_COLORS } from '../../theme/colors';
import { RADIUS } from '../../theme/radius';
import { SPACING } from '../../theme/spacing';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Header } from '../../components/ui/Header';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { WebFooter } from '../../components/navigation/WebFooter';
import { pricingService, ServicePricingItem } from '../../services/pricing/pricingService';
import { useResponsive } from '../../hooks/useResponsive';

export default function CustomerServicesPricingScreen() {
  const { theme, isDark } = useTheme();
  const { horizontalPadding, isTablet, isDesktop } = useResponsive();

  const [vehicleType, setVehicleType] = useState<'2W' | '4W'>('2W');
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

  const handleBookService = (service: ServicePricingItem) => {
    router.push({
      pathname: '/(customer)/breakdown-request',
      params: {
        category: service.serviceName,
      },
    });
  };

  return (
    <ScreenContainer scrollable withPadding={false} edges={['top', 'left', 'right']}>
      <Header title="Official Launch Pricing" showBack showThemeToggle />

      <View
        style={[
          styles.containerWrapper,
          {
            paddingHorizontal: horizontalPadding,
            maxWidth: isDesktop ? 1200 : isTablet ? 800 : undefined,
            alignSelf: isTablet || isDesktop ? 'center' : undefined,
            width: isTablet || isDesktop ? '100%' : undefined,
          },
        ]}
      >
        {/* Banner with Guarantee */}
        <View style={[styles.guaranteeBanner, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF', borderColor: BRAND_COLORS.primaryBlue }]}>
          <Ionicons name="shield-checkmark" size={24} color={BRAND_COLORS.primaryBlue} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.guaranteeTitle, { color: theme.textPrimary }]}>
              100% Transparent Launch Rates • Zero Surge
            </Text>
            <Text style={[styles.guaranteeSub, { color: theme.textSecondary }]}>
              Fixed official pricing across Tamil Nadu. Verified mechanics, genuine replacement parts, and upfront cost confirmation before work starts.
            </Text>
          </View>
        </View>

        {/* 2W vs 4W Toggle */}
        <View style={[styles.vehicleToggleBar, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
          <Pressable
            onPress={() => {
              setVehicleType('2W');
              setSelectedCategory('all');
            }}
            style={[
              styles.vehicleToggleBtn,
              vehicleType === '2W' && [styles.vehicleToggleBtnActive, { backgroundColor: BRAND_COLORS.primaryBlue }],
            ]}
          >
            <Ionicons
              name="bicycle"
              size={18}
              color={vehicleType === '2W' ? '#FFFFFF' : theme.textSecondary}
            />
            <Text
              style={[
                styles.vehicleToggleBtnText,
                { color: vehicleType === '2W' ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              Two-Wheelers (2W)
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setVehicleType('4W');
              setSelectedCategory('all');
            }}
            style={[
              styles.vehicleToggleBtn,
              vehicleType === '4W' && [styles.vehicleToggleBtnActive, { backgroundColor: BRAND_COLORS.primaryBlue }],
            ]}
          >
            <Ionicons
              name="car"
              size={18}
              color={vehicleType === '4W' ? '#FFFFFF' : theme.textSecondary}
            />
            <Text
              style={[
                styles.vehicleToggleBtnText,
                { color: vehicleType === '4W' ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              Four-Wheelers (4W)
            </Text>
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="search" size={18} color={theme.textSecondary} />
          <TextInput
            placeholder={`Search ${vehicleType} services (e.g. Puncture, Jumpstart, Towing)...`}
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: theme.textPrimary }]}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
            </Pressable>
          )}
        </View>

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const label = cat === 'all' ? 'All Services' : cat.replace('_', ' ').toUpperCase();
            return (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isSelected ? BRAND_COLORS.primaryBlue : theme.card,
                    borderColor: isSelected ? BRAND_COLORS.primaryBlue : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    { color: isSelected ? '#FFFFFF' : theme.textSecondary },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Services List Grid */}
        <View style={styles.servicesGrid}>
          {services.map((item) => (
            <Card key={item.id} style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.serviceTitle, { color: theme.textPrimary }]}>
                    {item.serviceName}
                  </Text>
                  <Text style={[styles.serviceCategory, { color: theme.textSecondary }]}>
                    {item.category.replace('_', ' ').toUpperCase()} • {item.vehicleType}
                  </Text>
                </View>
                <Badge
                  label={`₹${item.customerPrice.toLocaleString('en-IN')}`}
                  variant="verified"
                  size="md"
                />
              </View>

              <Text style={[styles.serviceDesc, { color: theme.textSecondary }]}>
                {item.notes || 'Official transparent launch rate guaranteed across Tamil Nadu with zero surge fee.'}
              </Text>

              <View style={styles.serviceFooterRow}>
                <View style={styles.etaPill}>
                  <Ionicons name="time-outline" size={13} color="#16A34A" />
                  <Text style={styles.etaText}>15–25 mins dispatch</Text>
                </View>

                <Pressable
                  onPress={() => handleBookService(item)}
                  style={({ pressed }) => [
                    styles.bookButton,
                    { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
                  ]}
                >
                  <Text style={styles.bookButtonText}>Book Now</Text>
                  <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
                </Pressable>
              </View>
            </Card>
          ))}
        </View>
      </View>

      {/* Rapido-style Footer */}
      <WebFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  guaranteeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  guaranteeTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  guaranteeSub: {
    fontSize: 12,
    lineHeight: 18,
  },
  vehicleToggleBar: {
    flexDirection: 'row',
    borderRadius: RADIUS.md,
    padding: 4,
    gap: 6,
  },
  vehicleToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
  },
  vehicleToggleBtnActive: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  vehicleToggleBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  categoryScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  servicesGrid: {
    gap: 12,
  },
  serviceCard: {
    padding: SPACING.md,
    gap: 8,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  serviceCategory: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  serviceDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
  serviceFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  etaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  etaText: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '600',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: BRAND_COLORS.primaryBlue,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
