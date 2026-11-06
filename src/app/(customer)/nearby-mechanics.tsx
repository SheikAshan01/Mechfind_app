import React, { useMemo, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
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
import { useCustomerStore } from '../../stores/customerStore';
import { useResponsive } from '../../hooks/useResponsive';
import { ResponsiveNav } from '../../components/navigation/ResponsiveNav';
import { WebFooter } from '../../components/navigation/WebFooter';
import { locationService } from '../../services/location/locationService';

const ACCENT_YELLOW = '#FFC400';

interface ServiceOption {
  id: string;
  category: 'battery_jumpstart' | 'flat_tyre' | 'general_diagnostics' | 'engine_overheating' | 'brake_failure' | 'fuel_delivery';
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  price2W: number;
  price4W: number;
  desc: string;
}

const SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: 'battery',
    category: 'battery_jumpstart',
    title: 'Battery Jumpstart',
    icon: 'battery-charging',
    price2W: 199,
    price4W: 399,
    desc: 'Jumpstart cables & voltage test',
  },
  {
    id: 'tyre',
    category: 'flat_tyre',
    title: 'Flat Tyre & Puncture',
    icon: 'disc',
    price2W: 149,
    price4W: 299,
    desc: 'Puncture repair & stepney change',
  },
  {
    id: 'breakdown',
    category: 'general_diagnostics',
    title: 'Breakdown Diagnostics',
    icon: 'construct',
    price2W: 249,
    price4W: 499,
    desc: 'On-spot engine & electrical check',
  },
  {
    id: 'oil',
    category: 'engine_overheating',
    title: 'Engine & Oil Check',
    icon: 'water',
    price2W: 199,
    price4W: 399,
    desc: 'Coolant & engine oil inspection',
  },
  {
    id: 'brake',
    category: 'brake_failure',
    title: 'Brake Assistance',
    icon: 'speedometer',
    price2W: 199,
    price4W: 399,
    desc: 'Brake pads, fluid & pedal check',
  },
  {
    id: 'fuel',
    category: 'fuel_delivery',
    title: 'Emergency Fuel / Tow',
    icon: 'car',
    price2W: 299,
    price4W: 599,
    desc: 'Emergency fuel or flatbed towing',
  },
];

export default function NearbyMechanicsScreen() {
  const { theme, isDark } = useTheme();
  const { horizontalPadding, isTablet, isDesktop } = useResponsive();
  const {
    currentLocation,
    setCurrentLocation,
    vehicles,
    selectedVehicleId,
    createBreakdownRequest,
  } = useCustomerStore();

  const [vehicleType, setVehicleType] = useState<'2W' | '4W'>('4W');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('battery');
  const [addressInput, setAddressInput] = useState<string>(
    currentLocation?.address || 'SV Road, Near Bus Stand, Dindigul'
  );
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedService = useMemo(
    () => SERVICE_OPTIONS.find((s) => s.id === selectedServiceId) || SERVICE_OPTIONS[0],
    [selectedServiceId]
  );

  const currentPrice = vehicleType === '2W' ? selectedService.price2W : selectedService.price4W;

  const handleDetectLocation = async () => {
    setIsLocating(true);
    try {
      const loc = await locationService.getCurrentLocation();
      if (loc && loc.address) {
        setAddressInput(loc.address);
        setCurrentLocation({
          latitude: loc.latitude,
          longitude: loc.longitude,
          address: loc.address,
        });
      }
    } catch {
      // Fallback
    } finally {
      setIsLocating(false);
    }
  };

  const handleInstantDispatch = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const activeVeh =
        vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

      const newRequest = createBreakdownRequest({
        vehicleId: activeVeh ? activeVeh.id : 'veh_default',
        category: selectedService.category,
        categoryName: `${selectedService.title} (${vehicleType})`,
        description: `On-demand roadside assistance: ${selectedService.title} requested at ${addressInput}`,
        photos: [],
        landmark: 'Breakdown Spot',
        urgency: 'high',
        estimatedCost: currentPrice,
        mechanicId: undefined, // Rapido on-demand: broadcasted, not pre-assigned!
      });

      setIsSubmitting(false);
      router.replace({
        pathname: '/(customer)/live-tracking/[id]',
        params: { id: newRequest.id },
      });
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer withPadding={false} edges={['top', 'left', 'right']}>
      {Platform.OS === 'web' ? (
        <ResponsiveNav />
      ) : (
        <Header
          title="Find a Mechanic (Instant Dispatch)"
          showBack
          showThemeToggle
        />
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: horizontalPadding,
            maxWidth: isDesktop ? 1200 : isTablet ? 840 : undefined,
            alignSelf: isTablet || isDesktop ? 'center' : undefined,
            width: isTablet || isDesktop ? '100%' : undefined,
          },
        ]}
      >
        {/* ========================================================= */}
        {/* 1. TOP DISPATCH RADAR BANNER                              */}
        {/* ========================================================= */}
        <View
          style={[
            styles.radarBanner,
            {
              backgroundColor: isDark ? '#16171B' : '#101114',
              borderColor: isDark ? '#2D3139' : '#1F2024',
            },
          ]}
        >
          <View style={styles.radarBannerHeader}>
            <View style={styles.liveNetworkBadge}>
              <View style={styles.pulsingDot} />
              <Text style={styles.liveNetworkBadgeText}>LIVE DISPATCH NETWORK</Text>
            </View>
            <View style={styles.radiusPill}>
              <Ionicons name="flash" size={13} color="#101114" />
              <Text style={styles.radiusPillText}>15 km Coverage</Text>
            </View>
          </View>

          <Text style={styles.radarBannerTitle}>
            On-Demand Roadside Assistance
          </Text>
          <Text style={styles.radarBannerSub}>
            Broadcasting to verified workshops and mobile mechanics near you. Like Rapido, your technician will be assigned live upon dispatch.
          </Text>
        </View>

        {/* ========================================================= */}
        {/* 2. LOCATION BAR                                           */}
        {/* ========================================================= */}
        <Card
          style={[
            styles.locationCard,
            {
              backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
              borderColor: isDark ? '#2D3139' : '#E5E7EB',
            },
          ]}
        >
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={22} color={ACCENT_YELLOW} />
            <TextInput
              style={[
                styles.locationInput,
                { color: isDark ? '#FFFFFF' : '#101114' },
              ]}
              value={addressInput}
              onChangeText={setAddressInput}
              placeholder="Enter your breakdown location..."
              placeholderTextColor="#9CA3AF"
            />
            <Pressable
              onPress={handleDetectLocation}
              style={styles.detectBtn}
              hitSlop={6}
              accessibilityLabel="Detect GPS"
            >
              <Ionicons
                name="locate-outline"
                size={20}
                color={isLocating ? ACCENT_YELLOW : isDark ? '#9CA3AF' : '#6B7280'}
              />
            </Pressable>
          </View>
        </Card>

        {/* ========================================================= */}
        {/* 3. VEHICLE TYPE TOGGLE (2W vs 4W)                         */}
        {/* ========================================================= */}
        <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#101114' }]}>
          Vehicle Type
        </Text>
        <View style={styles.vehicleToggleRow}>
          <Pressable
            onPress={() => setVehicleType('2W')}
            style={[
              styles.vehicleTypeBtn,
              {
                backgroundColor:
                  vehicleType === '2W'
                    ? ACCENT_YELLOW
                    : isDark
                    ? '#1A1B1F'
                    : '#FFFFFF',
                borderColor:
                  vehicleType === '2W'
                    ? ACCENT_YELLOW
                    : isDark
                    ? '#2D3139'
                    : '#E5E7EB',
              },
            ]}
          >
            <Ionicons
              name="bicycle"
              size={18}
              color={vehicleType === '2W' ? '#101114' : isDark ? '#FFFFFF' : '#101114'}
            />
            <Text
              style={[
                styles.vehicleTypeBtnText,
                {
                  color: vehicleType === '2W' ? '#101114' : isDark ? '#FFFFFF' : '#101114',
                  fontWeight: vehicleType === '2W' ? '800' : '600',
                },
              ]}
            >
              Two-Wheeler (2W)
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setVehicleType('4W')}
            style={[
              styles.vehicleTypeBtn,
              {
                backgroundColor:
                  vehicleType === '4W'
                    ? ACCENT_YELLOW
                    : isDark
                    ? '#1A1B1F'
                    : '#FFFFFF',
                borderColor:
                  vehicleType === '4W'
                    ? ACCENT_YELLOW
                    : isDark
                    ? '#2D3139'
                    : '#E5E7EB',
              },
            ]}
          >
            <Ionicons
              name="car-sport"
              size={18}
              color={vehicleType === '4W' ? '#101114' : isDark ? '#FFFFFF' : '#101114'}
            />
            <Text
              style={[
                styles.vehicleTypeBtnText,
                {
                  color: vehicleType === '4W' ? '#101114' : isDark ? '#FFFFFF' : '#101114',
                  fontWeight: vehicleType === '4W' ? '800' : '600',
                },
              ]}
            >
              Four-Wheeler (4W)
            </Text>
          </Pressable>
        </View>

        {/* ========================================================= */}
        {/* 4. SERVICE CATEGORIES GRID                                */}
        {/* ========================================================= */}
        <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#101114', marginTop: 18 }]}>
          Select Roadside Service
        </Text>
        <View style={styles.servicesGrid}>
          {SERVICE_OPTIONS.map((svc) => {
            const isSelected = selectedServiceId === svc.id;
            const price = vehicleType === '2W' ? svc.price2W : svc.price4W;

            return (
              <Pressable
                key={svc.id}
                onPress={() => setSelectedServiceId(svc.id)}
                style={[
                  styles.serviceGridCard,
                  {
                    backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                    borderColor: isSelected
                      ? ACCENT_YELLOW
                      : isDark
                      ? '#2D3139'
                      : '#E5E7EB',
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
              >
                <View style={styles.serviceTopRow}>
                  <View
                    style={[
                      styles.serviceIconCircle,
                      {
                        backgroundColor: isSelected
                          ? ACCENT_YELLOW
                          : isDark
                          ? '#2A2B30'
                          : '#F3F4F6',
                      },
                    ]}
                  >
                    <Ionicons
                      name={svc.icon}
                      size={20}
                      color={isSelected ? '#101114' : isDark ? '#FFFFFF' : '#101114'}
                    />
                  </View>
                  <Text style={styles.servicePriceText}>₹{price}</Text>
                </View>

                <Text
                  style={[
                    styles.serviceCardTitle,
                    { color: isDark ? '#FFFFFF' : '#101114' },
                  ]}
                >
                  {svc.title}
                </Text>
                <Text style={styles.serviceCardDesc} numberOfLines={2}>
                  {svc.desc}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ========================================================= */}
        {/* 5. LIVE COVERAGE MAP PREVIEW                              */}
        {/* ========================================================= */}
        <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#101114', marginTop: 18 }]}>
          Live Broadcast Area (15 km)
        </Text>
        <View style={styles.mapContainer}>
          <MapFallback
            height={180}
            userLocation={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
          />
          <View style={styles.mapOverlayPill}>
            <Ionicons name="radio" size={14} color="#16A34A" />
            <Text style={styles.mapOverlayPillText}>
              Broadcast Active: 15 km Radius
            </Text>
          </View>
        </View>

        {/* ========================================================= */}
        {/* 6. RAPIDO-STYLE INSTANT DISPATCH CTA                      */}
        {/* ========================================================= */}
        <View style={styles.ctaBottomWrap}>
          <Pressable
            onPress={handleInstantDispatch}
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.dispatchCtaBtn,
              { opacity: pressed || isSubmitting ? 0.9 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Find Mechanic Instant Dispatch"
          >
            <Ionicons name="flash" size={20} color="#101114" />
            <Text style={styles.dispatchCtaBtnText}>
              ⚡ Find Mechanic (Instant Dispatch) • ₹{currentPrice}
            </Text>
          </Pressable>
          <Text style={styles.ctaFootnote}>
            No dummy listings • Real-time technician assignment with live GPS route
          </Text>
        </View>
      </ScrollView>

      {Platform.OS === 'web' && <WebFooter />}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  radarBanner: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  radarBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  liveNetworkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  liveNetworkBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#16A34A',
    letterSpacing: 0.5,
  },
  radiusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT_YELLOW,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 4,
  },
  radiusPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#101114',
  },
  radarBannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  radarBannerSub: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
    marginTop: 4,
  },
  locationCard: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 2,
  },
  detectBtn: {
    padding: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 10,
  },
  vehicleToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  vehicleTypeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
  },
  vehicleTypeBtnText: {
    fontSize: 13.5,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceGridCard: {
    width: '48.5%',
    borderRadius: 16,
    padding: 12,
    justifyContent: 'space-between',
  },
  serviceTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  serviceIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servicePriceText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#16A34A',
  },
  serviceCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  serviceCardDesc: {
    fontSize: 11.5,
    color: '#6B7280',
    lineHeight: 15,
  },
  mapContainer: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB33',
    position: 'relative',
    marginBottom: 20,
  },
  mapOverlayPill: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 17, 20, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 6,
  },
  mapOverlayPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ctaBottomWrap: {
    marginTop: 6,
    marginBottom: 24,
    alignItems: 'center',
  },
  dispatchCtaBtn: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    backgroundColor: ACCENT_YELLOW,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: ACCENT_YELLOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  dispatchCtaBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#101114',
  },
  ctaFootnote: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
});
