import React, { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeContext';
import { ResponsiveNav } from '../../components/navigation/ResponsiveNav';
import { WebFooter } from '../../components/navigation/WebFooter';
import { pricingService, ServicePricingItem } from '../../services/pricing/pricingService';
import { useResponsive } from '../../hooks/useResponsive';

const ACCENT_YELLOW = '#FFC400';

type CategoryFilter =
  | 'all'
  | 'diagnosis'
  | 'battery'
  | 'general'
  | 'electrical'
  | 'tyre'
  | 'ecu'
  | 'wash';

const CATEGORY_TABS: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'All Services' },
  { id: 'diagnosis', label: 'Diagnosis' },
  { id: 'battery', label: 'Battery' },
  { id: 'general', label: 'General' },
  { id: 'electrical', label: 'Electrical' },
  { id: 'tyre', label: 'Tyre' },
  { id: 'ecu', label: 'ECU' },
  { id: 'wash', label: 'Wash' },
];

export default function CustomerServicesPricingWeb() {
  const { isDark } = useTheme();
  const { width } = useResponsive();
  const isDesktop = width >= 1024;
  const isTablet = width >= 720 && width < 1024;

  const [vehicleType, setVehicleType] = useState<'2W' | '4W'>('2W');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch and filter services from the official pricing catalog
  const services = useMemo(() => {
    let list = pricingService.getPricingByVehicle(vehicleType);

    if (selectedCategory !== 'all') {
      list = list.filter((s) => s.category.toLowerCase() === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.serviceName.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          (s.notes && s.notes.toLowerCase().includes(q))
      );
    }

    return list;
  }, [vehicleType, selectedCategory, searchQuery]);

  const handleBookService = (service: ServicePricingItem) => {
    router.push({
      pathname: '/(customer)/breakdown-request',
      params: {
        category: service.serviceName,
        vehicleType,
      },
    });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  // Helper to pick the appropriate automotive icon for service cards
  const getServiceIcon = (category: string, name: string) => {
    const n = name.toLowerCase();
    const c = category.toLowerCase();

    if (n.includes('scanner') || n.includes('ecu') || c.includes('ecu')) {
      return <Ionicons name="hardware-chip-outline" size={24} color="#B45309" />;
    }
    if (n.includes('advanced diagnosis') || n.includes('laptop') || n.includes('diagnostic')) {
      return <Ionicons name="laptop-outline" size={24} color="#B45309" />;
    }
    if (n.includes('diagnosis') || n.includes('inspection') || c.includes('diagnosis')) {
      return <Ionicons name="pulse-outline" size={24} color="#B45309" />;
    }
    if (n.includes('wash') || n.includes('clean') || c.includes('wash')) {
      if (n.includes('waterless') || n.includes('dry')) {
        return <Ionicons name="water-outline" size={24} color="#B45309" />;
      }
      return <Ionicons name="sparkles-outline" size={24} color="#B45309" />;
    }
    if (n.includes('battery') || c.includes('battery')) {
      return <Ionicons name="battery-charging-outline" size={24} color="#B45309" />;
    }
    if (n.includes('tyre') || n.includes('tire') || n.includes('puncture') || c.includes('tyre')) {
      return <Ionicons name="disc-outline" size={24} color="#B45309" />;
    }
    if (n.includes('electrical') || n.includes('fuse') || n.includes('wiring') || c.includes('electrical')) {
      return <Ionicons name="flash-outline" size={24} color="#B45309" />;
    }
    return <Ionicons name="construct-outline" size={24} color="#B45309" />;
  };

  return (
    <View style={[styles.pageRoot, { backgroundColor: isDark ? '#101114' : '#F8F9FA' }]}>
      {/* 1. Header Navigation */}
      <ResponsiveNav />

      {/* 2. Scrollable Body in Natural Document Flow */}
      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContainer}>
          {/* ========================================================= */}
          {/* SECTION A: SERVICES HERO                                  */}
          {/* ========================================================= */}
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                borderColor: isDark ? '#2D3139' : '#EAECEF',
              },
            ]}
          >
            <View style={styles.heroRow}>
              {/* Left Column: Breadcrumb, Headline, Subtitle, Trust Badges */}
              <View style={styles.heroLeftCol}>
                {/* Breadcrumb Navigation */}
                <View style={styles.breadcrumbRow}>
                  <Pressable onPress={() => router.push('/(customer)/(tabs)')}>
                    <Text style={[styles.breadcrumbLink, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      Home
                    </Text>
                  </Pressable>
                  <Text style={[styles.breadcrumbDivider, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
                    {' > '}
                  </Text>
                  <Text style={[styles.breadcrumbActive, { color: isDark ? '#FFC400' : '#101114' }]}>
                    Services
                  </Text>
                </View>

                {/* Main Headline */}
                <Text style={[styles.heroHeadline, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                  Vehicle Services{'\n'}& Pricing
                </Text>

                {/* Subtitle Description */}
                <Text style={[styles.heroSubtitle, { color: isDark ? '#9CA3AF' : '#4B5563' }]}>
                  Choose from a wide range of vehicle services with transparent pricing and doorstep convenience.
                </Text>

                {/* Trust Badges in a Row */}
                <View style={styles.trustBadgesRow}>
                  <View style={styles.trustBadgeItem}>
                    <View style={styles.trustBadgeIconBox}>
                      <Ionicons name="shield-checkmark" size={17} color="#B45309" />
                    </View>
                    <Text style={[styles.trustBadgeText, { color: isDark ? '#E5E7EB' : '#1F2937' }]}>
                      Verified Mechanics
                    </Text>
                  </View>

                  <View style={styles.trustBadgeItem}>
                    <View style={styles.trustBadgeIconBox}>
                      <Ionicons name="receipt" size={17} color="#B45309" />
                    </View>
                    <Text style={[styles.trustBadgeText, { color: isDark ? '#E5E7EB' : '#1F2937' }]}>
                      Transparent Pricing
                    </Text>
                  </View>

                  <View style={styles.trustBadgeItem}>
                    <View style={styles.trustBadgeIconBox}>
                      <Ionicons name="home" size={17} color="#B45309" />
                    </View>
                    <Text style={[styles.trustBadgeText, { color: isDark ? '#E5E7EB' : '#1F2937' }]}>
                      Doorstep Service
                    </Text>
                  </View>
                </View>
              </View>

              {/* Right Column: Hero Visual Graphic with Yellow Diagonal Slash */}
              {isDesktop && (
                <View style={styles.heroRightCol}>
                  <View style={styles.heroImageWrapper}>
                    <Image
                      source={require('../../../assets/images/customer-hero-mechanic.png')}
                      style={styles.heroMechanicImage}
                      resizeMode="cover"
                      accessibilityLabel="MECHFIND Professional Mechanic inspecting car engine"
                    />
                    {/* Corner Yellow Diagonal Slash Accent */}
                    <View pointerEvents="none" style={styles.heroDiagonalAccent}>
                      <Svg width={180} height={180} viewBox="0 0 180 180">
                        <Path d="M70 -30 L210 110 L180 140 L40 0 Z" fill={ACCENT_YELLOW} />
                      </Svg>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* ========================================================= */}
          {/* SECTION B: SERVICE BASE PRICES NOTICE BANNER              */}
          {/* ========================================================= */}
          <View
            style={[
              styles.noticeCard,
              {
                backgroundColor: isDark ? '#221D12' : '#FFFBEB',
                borderColor: isDark ? '#524312' : '#FDE68A',
              },
            ]}
          >
            <View style={styles.noticeIconCircle}>
              <Ionicons name="shield-checkmark" size={20} color="#B45309" />
            </View>
            <View style={styles.noticeTextCol}>
              <Text style={[styles.noticeTitle, { color: isDark ? '#FCD34D' : '#92400E' }]}>
                Service Base Prices
              </Text>
              <Text style={[styles.noticeDescription, { color: isDark ? '#D1D5DB' : '#78350F' }]}>
                The listed amount is the base service price. Distance, peak or late-night charges and parts may change the final estimate. Review and approve any quote before work begins.
              </Text>
            </View>
          </View>

          {/* ========================================================= */}
          {/* SECTION C: 2W VS 4W VEHICLE TYPE SELECTION                */}
          {/* ========================================================= */}
          <View style={styles.vehicleTypeTabsRow}>
            {/* 2W Tab */}
            <Pressable
              onPress={() => {
                setVehicleType('2W');
                setSelectedCategory('all');
              }}
              style={[
                styles.vehicleTabBtn,
                vehicleType === '2W'
                  ? isDark
                    ? styles.vehicleTabActiveDark
                    : styles.vehicleTabActiveLight
                  : isDark
                  ? styles.vehicleTabInactiveDark
                  : styles.vehicleTabInactiveLight,
              ]}
              accessibilityRole="tab"
              accessibilityLabel="Two-Wheelers (2W)"
            >
              <Ionicons
                name="bicycle"
                size={20}
                color={
                  vehicleType === '2W'
                    ? '#FFFFFF'
                    : isDark
                    ? '#9CA3AF'
                    : '#4B5563'
                }
              />
              <Text
                style={[
                  styles.vehicleTabText,
                  {
                    color:
                      vehicleType === '2W'
                        ? '#FFFFFF'
                        : isDark
                        ? '#9CA3AF'
                        : '#4B5563',
                    fontWeight: vehicleType === '2W' ? '700' : '600',
                  },
                ]}
              >
                Two-Wheelers (2W)
              </Text>
            </Pressable>

            {/* 4W Tab */}
            <Pressable
              onPress={() => {
                setVehicleType('4W');
                setSelectedCategory('all');
              }}
              style={[
                styles.vehicleTabBtn,
                vehicleType === '4W'
                  ? isDark
                    ? styles.vehicleTabActiveDark
                    : styles.vehicleTabActiveLight
                  : isDark
                  ? styles.vehicleTabInactiveDark
                  : styles.vehicleTabInactiveLight,
              ]}
              accessibilityRole="tab"
              accessibilityLabel="Four-Wheelers (4W)"
            >
              <Ionicons
                name="car-sport"
                size={20}
                color={
                  vehicleType === '4W'
                    ? '#FFFFFF'
                    : isDark
                    ? '#9CA3AF'
                    : '#4B5563'
                }
              />
              <Text
                style={[
                  styles.vehicleTabText,
                  {
                    color:
                      vehicleType === '4W'
                        ? '#FFFFFF'
                        : isDark
                        ? '#9CA3AF'
                        : '#4B5563',
                    fontWeight: vehicleType === '4W' ? '700' : '600',
                  },
                ]}
              >
                Four-Wheelers (4W)
              </Text>
            </Pressable>
          </View>

          {/* ========================================================= */}
          {/* SECTION D: SERVICE SEARCH BAR                             */}
          {/* ========================================================= */}
          <View
            style={[
              styles.searchBarBox,
              {
                backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                borderColor: isDark ? '#2D3139' : '#E5E7EB',
              },
            ]}
          >
            <Ionicons name="search" size={20} color="#9CA3AF" style={{ marginLeft: 6 }} />
            <TextInput
              style={[
                styles.searchInput,
                { color: isDark ? '#FFFFFF' : '#101114' },
              ]}
              placeholder={`Search ${vehicleType} services (e.g., Puncture, Jumpstart, Towing)...`}
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => setSearchQuery('')}
                hitSlop={8}
                style={{ paddingRight: 8 }}
                accessibilityLabel="Clear search"
              >
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </Pressable>
            )}
          </View>

          {/* ========================================================= */}
          {/* SECTION E: CATEGORY FILTER PILLS                          */}
          {/* ========================================================= */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryPillsScroll}
          >
            {CATEGORY_TABS.map((tab) => {
              const isSelected = selectedCategory === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setSelectedCategory(tab.id)}
                  style={[
                    styles.categoryPill,
                    isSelected
                      ? isDark
                        ? styles.categoryPillActiveDark
                        : styles.categoryPillActiveLight
                      : isDark
                      ? styles.categoryPillInactiveDark
                      : styles.categoryPillInactiveLight,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={tab.label}
                >
                  <Text
                    style={[
                      styles.categoryPillText,
                      {
                        color: isSelected
                          ? isDark
                            ? '#101114'
                            : '#FFFFFF'
                          : isDark
                          ? '#C7C9CE'
                          : '#4B5563',
                        fontWeight: isSelected ? '700' : '600',
                      },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* ========================================================= */}
          {/* SECTION F: SERVICE CARDS LIST                             */}
          {/* ========================================================= */}
          {services.length === 0 ? (
            /* Empty State */
            <View
              style={[
                styles.emptyStateCard,
                {
                  backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                  borderColor: isDark ? '#2D3139' : '#E5E7EB',
                },
              ]}
            >
              <View style={styles.emptyIconCircle}>
                <Ionicons name="search-outline" size={32} color="#9CA3AF" />
              </View>
              <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                No Services Found
              </Text>
              <Text style={styles.emptySubtitle}>
                Try another search term or select a different category filter.
              </Text>
              <Pressable onPress={handleResetFilters} style={styles.resetBtn}>
                <Text style={styles.resetBtnText}>Reset Filters</Text>
              </Pressable>
            </View>
          ) : (
            /* Service Cards Stack */
            <View style={styles.servicesStack}>
              {services.map((item) => {
                const iconElement = getServiceIcon(item.category, item.serviceName);

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.serviceCard,
                      {
                        backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                        borderColor: isDark ? '#2D3139' : '#EAECEF',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.serviceCardRow,
                        !isDesktop && styles.serviceCardRowMobile,
                      ]}
                    >
                      {/* Left: Round Icon Badge */}
                      <View style={styles.serviceIconCircle}>
                        {iconElement}
                      </View>

                      {/* Middle: Details Column */}
                      <View style={styles.serviceDetailsCol}>
                        <Text
                          style={[
                            styles.serviceNameText,
                            { color: isDark ? '#FFFFFF' : '#101114' },
                          ]}
                        >
                          {item.serviceName}
                        </Text>

                        <Text style={styles.serviceCategoryText}>
                          {item.category.toUpperCase()} • {item.vehicleType}
                        </Text>

                        <Text style={styles.serviceDescText}>
                          {item.notes || 'Standard 30 min roadside labor.'}
                        </Text>

                        {/* Standard Labor Duration Tag */}
                        <View style={styles.laborDurationPill}>
                          <Ionicons name="time-outline" size={13} color="#16A34A" />
                          <Text style={styles.laborDurationText}>
                            {item.standardLaborDurationMin} min standard labor
                          </Text>
                        </View>
                      </View>

                      {/* Right: Price Badge & Book Now CTA */}
                      <View
                        style={[
                          styles.serviceActionCol,
                          !isDesktop && styles.serviceActionColMobile,
                        ]}
                      >
                        {/* Price Badge */}
                        <View style={styles.pricePillBadge}>
                          <Text style={styles.pricePillBadgeText}>
                            ₹{item.customerPrice.toLocaleString('en-IN')}
                          </Text>
                        </View>

                        {/* Book Now Button */}
                        <Pressable
                          onPress={() => handleBookService(item)}
                          style={({ pressed }) => [
                            styles.bookNowBtn,
                            { opacity: pressed ? 0.88 : 1 },
                          ]}
                          accessibilityRole="button"
                          accessibilityLabel={`Book ${item.serviceName}`}
                        >
                          <Text style={styles.bookNowBtnText}>Book Now</Text>
                          <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* 3. Footer in Natural Flow (No Overlap) */}
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
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
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
  },
  breadcrumbDivider: {
    fontSize: 13.5,
  },
  breadcrumbActive: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  heroHeadline: {
    fontSize: 38,
    fontWeight: '800',
    lineHeight: 46,
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 23,
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
  trustBadgeIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustBadgeText: {
    fontSize: 13,
    fontWeight: '600',
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

  /* SECTION B: NOTICE */
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  noticeIconCircle: {
    marginTop: 2,
  },
  noticeTextCol: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 3,
  },
  noticeDescription: {
    fontSize: 12.5,
    lineHeight: 18,
  },

  /* SECTION C: 2W vs 4W TABS */
  vehicleTypeTabsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  vehicleTabBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
  },
  vehicleTabActiveLight: {
    backgroundColor: '#101114',
    borderColor: '#101114',
  },
  vehicleTabInactiveLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  vehicleTabActiveDark: {
    backgroundColor: '#FFC400',
    borderColor: '#FFC400',
  },
  vehicleTabInactiveDark: {
    backgroundColor: '#1A1B1F',
    borderColor: '#2D3139',
  },
  vehicleTabText: {
    fontSize: 14.5,
  },

  /* SECTION D: SEARCH BAR */
  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14.5,
    paddingVertical: 0,
  },

  /* SECTION E: CATEGORY PILLS */
  categoryPillsScroll: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  categoryPill: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPillActiveLight: {
    backgroundColor: '#101114',
    borderColor: '#101114',
  },
  categoryPillInactiveLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  categoryPillActiveDark: {
    backgroundColor: '#FFC400',
    borderColor: '#FFC400',
  },
  categoryPillInactiveDark: {
    backgroundColor: '#1A1B1F',
    borderColor: '#2D3139',
  },
  categoryPillText: {
    fontSize: 13,
  },

  /* SECTION F: SERVICE CARDS */
  servicesStack: {
    gap: 14,
  },
  serviceCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  serviceCardRowMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 14,
  },
  serviceIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceDetailsCol: {
    flex: 1,
    minWidth: 260,
  },
  serviceNameText: {
    fontSize: 16.5,
    fontWeight: '700',
    marginBottom: 4,
  },
  serviceCategoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  serviceDescText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 8,
  },
  laborDurationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  laborDurationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
  },
  serviceActionCol: {
    alignItems: 'flex-end',
    gap: 10,
  },
  serviceActionColMobile: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  pricePillBadge: {
    backgroundColor: '#FFC400',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
  },
  pricePillBadgeText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#101114',
  },
  bookNowBtn: {
    backgroundColor: '#101114',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bookNowBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  /* EMPTY STATE */
  emptyStateCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13.5,
    color: '#6B7280',
    textAlign: 'center',
  },
  resetBtn: {
    marginTop: 12,
    backgroundColor: '#FFC400',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  resetBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#101114',
  },
});

