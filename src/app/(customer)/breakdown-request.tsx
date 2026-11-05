import React, { useMemo, useState } from 'react';
import {
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
import { Badge } from '../../components/ui/Badge';
import { useCustomerStore } from '../../stores/customerStore';
import { ProblemCategory } from '../../types/requests';
import { useResponsive } from '../../hooks/useResponsive';
import { pricingService, ServicePricingItem } from '../../services/pricing/pricingService';

function mapServiceCategoryToProblemCategory(cat: string): ProblemCategory {
  switch (cat) {
    case 'battery':
      return 'battery_jumpstart';
    case 'tyre':
      return 'flat_tyre';
    case 'ac':
      return 'engine_overheating';
    case 'wash':
    case 'ecu':
    case 'electrical':
    case 'diagnosis':
    default:
      return 'general_diagnostics';
  }
}

export default function BookAssistanceScreen() {
  const { theme, isDark } = useTheme();
  const { horizontalPadding, isTablet, isDesktop } = useResponsive();
  const params = useLocalSearchParams<{ category?: string; mechanicId?: string; vehicleType?: string }>();
  const {
    vehicles,
    selectedVehicleId,
    nearbyMechanics,
    currentLocation,
    createBreakdownRequest,
  } = useCustomerStore();

  const activeVehicle =
    vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  // Selected vehicle type: 2W (Two-Wheeler) or 4W (Four-Wheeler)
  const initialVehicleType: '2W' | '4W' =
    params.vehicleType === '2W' || params.vehicleType === '4W'
      ? params.vehicleType
      : activeVehicle?.type === 'bike'
      ? '2W'
      : '4W';

  const [vehicleType, setVehicleType] = useState<'2W' | '4W'>(initialVehicleType);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');

  const selectedMechanic =
    nearbyMechanics.find((m) => m.id === params.mechanicId) || nearbyMechanics[0];

  // Available official services from Pricing Service for selected vehicle type
  const availableServices = useMemo(() => {
    const list = pricingService.getPricingByVehicle(vehicleType);
    if (selectedCategoryTab === 'all') return list;
    return list.filter((s) => s.category === selectedCategoryTab);
  }, [vehicleType, selectedCategoryTab]);

  // Selected service option
  const [selectedServiceId, setSelectedServiceId] = useState<string>(() => {
    if (params.category) {
      const match = pricingService
        .getPricingByVehicle(initialVehicleType)
        .find((s) => s.category === params.category || s.id.includes(params.category!));
      if (match) return match.id;
    }
    return initialVehicleType === '2W'
      ? '2w_battery_jumpstart'
      : '4w_battery_jumpstart';
  });

  const [customIssueText, setCustomIssueText] = useState('');
  const [landmarkText, setLandmarkText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active service object
  const selectedService: ServicePricingItem =
    availableServices.find((s) => s.id === selectedServiceId) ||
    pricingService.getPricingByVehicle(vehicleType)[0];

  // Categories available for current vehicle type
  const categoryTabs = useMemo(() => {
    const cats = new Set(pricingService.getPricingByVehicle(vehicleType).map((s) => s.category));
    return ['all', ...Array.from(cats)];
  }, [vehicleType]);

  const handleConfirmBooking = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const activeVeh =
        vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

      if (!activeVeh) {
        setIsSubmitting(false);
        router.push('/(customer)/vehicle-form');
        return;
      }

      const problemCategory = mapServiceCategoryToProblemCategory(selectedService.category);

      const newRequest = createBreakdownRequest({
        vehicleId: activeVeh.id,
        category: problemCategory,
        categoryName: selectedService.serviceName,
        description:
          customIssueText || `${selectedService.serviceName} (${selectedService.vehicleType}) requested roadside`,
        photos: [],
        landmark: landmarkText || 'Breakdown location',
        urgency: 'high',
        estimatedCost: selectedService.customerPrice,
        mechanicId: selectedMechanic?.id,
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

  const renderWorkshopCard = () => (
    <Card style={styles.workshopCard}>
      <View style={styles.workshopRow}>
        <View style={[styles.workshopThumbLogo, { alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#222328' : '#FFF3CC', borderRadius: 12 }]}>
          <Ionicons name={selectedMechanic ? 'construct-outline' : 'search-outline'} size={20} color={BRAND_COLORS.primaryBlue} />
        </View>
        <View style={styles.workshopInfo}>
          <Text style={[styles.workshopName, { color: theme.textPrimary }]} numberOfLines={1}>
            {selectedMechanic?.shopName || 'No mechanic selected'}
          </Text>
          {selectedMechanic ? (
            <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
              {selectedMechanic.distanceKm} km away · Estimated {selectedMechanic.estimatedArrivalMinutes} min
            </Text>
          ) : (
            <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
              A mechanic has not been assigned to this request.
            </Text>
          )}
        </View>
      </View>
    </Card>
  );

  const renderVehicleSelector = () => (
    <Card style={styles.vehicleSummaryCard}>
      <View style={styles.vehicleTypeToggleRow}>
        <Pressable
          onPress={() => {
            setVehicleType('2W');
            const first2W = pricingService.getPricingByVehicle('2W')[0];
            setSelectedServiceId(first2W.id);
          }}
          style={[
            styles.vehicleToggleBtn,
            {
              backgroundColor:
                vehicleType === '2W'
                  ? BRAND_COLORS.primaryBlue
                  : isDark
                  ? '#222328'
                  : '#F1F2F4',
              borderColor:
                vehicleType === '2W' ? BRAND_COLORS.primaryBlue : theme.border,
            },
          ]}
          hitSlop={4}
        >
          <Ionicons
            name="bicycle-outline"
            size={16}
            color={vehicleType === '2W' ? '#FFFFFF' : theme.textPrimary}
          />
          <Text
            style={[
              styles.vehicleToggleText,
              { color: vehicleType === '2W' ? '#FFFFFF' : theme.textPrimary },
            ]}
          >
            Two-Wheeler (2W)
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            setVehicleType('4W');
            const first4W = pricingService.getPricingByVehicle('4W')[0];
            setSelectedServiceId(first4W.id);
          }}
          style={[
            styles.vehicleToggleBtn,
            {
              backgroundColor:
                vehicleType === '4W'
                  ? BRAND_COLORS.primaryBlue
                  : isDark
                  ? '#222328'
                  : '#F1F2F4',
              borderColor:
                vehicleType === '4W' ? BRAND_COLORS.primaryBlue : theme.border,
            },
          ]}
          hitSlop={4}
        >
          <Ionicons
            name="car-outline"
            size={16}
            color={vehicleType === '4W' ? '#FFFFFF' : theme.textPrimary}
          />
          <Text
            style={[
              styles.vehicleToggleText,
              { color: vehicleType === '4W' ? '#FFFFFF' : theme.textPrimary },
            ]}
          >
            Four-Wheeler (4W)
          </Text>
        </Pressable>
      </View>

      {activeVehicle ? (
        <View style={styles.vehicleSummaryRow}>
          <Ionicons
            name={activeVehicle.type === 'bike' ? 'bicycle' : 'car-sport'}
            size={20}
            color={BRAND_COLORS.primaryBlue}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.vehicleModelText, { color: theme.textPrimary }]}>
              {activeVehicle.make} {activeVehicle.model}
            </Text>
            <Text style={[styles.vehiclePlateText, { color: theme.textSecondary }]}>
              {activeVehicle.licensePlate} • {activeVehicle.fuelType?.toUpperCase()}
            </Text>
          </View>
          <Pressable onPress={() => router.push('/(customer)/(tabs)/vehicles')}>
            <Text style={{ color: BRAND_COLORS.primaryBlue, fontSize: 12.5, fontWeight: '600' }}>
              Change
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.vehicleSummaryRow}>
          <Ionicons name="alert-circle-outline" size={20} color={BRAND_COLORS.warning} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.vehicleModelText, { color: theme.textPrimary }]}>
              No Vehicle Added
            </Text>
            <Text style={[styles.vehiclePlateText, { color: theme.textSecondary }]}>
              Add your vehicle details to request roadside help
            </Text>
          </View>
          <Pressable onPress={() => router.push('/(customer)/vehicle-form')}>
            <Text style={{ color: BRAND_COLORS.primaryBlue, fontSize: 12.5, fontWeight: '700' }}>
              + Add Vehicle
            </Text>
          </Pressable>
        </View>
      )}
    </Card>
  );

  const renderCategoryFilterTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryTabsContainer}
    >
      {categoryTabs.map((cat) => {
        const isSelected = selectedCategoryTab === cat;
        const label =
          cat === 'all'
            ? 'All Services'
            : cat.charAt(0).toUpperCase() + cat.slice(1);

        return (
          <Pressable
            key={cat}
            onPress={() => setSelectedCategoryTab(cat)}
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
                { color: isSelected ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );

  const renderServicesList = () => (
    <View style={styles.serviceList}>
      {availableServices.map((item) => {
        const isSelected = selectedServiceId === item.id;
        return (
          <Pressable
            key={item.id}
            onPress={() => setSelectedServiceId(item.id)}
            style={[
              styles.serviceCard,
              {
                backgroundColor: theme.card,
                borderColor: isSelected
                  ? BRAND_COLORS.primaryBlue
                  : theme.border,
                borderWidth: isSelected ? 1.5 : 1,
              },
            ]}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
          >
            <View style={styles.radioAndTitleRow}>
              {/* Custom Radio Button */}
              <View
                style={[
                  styles.radioCircle,
                  {
                    borderColor: isSelected
                      ? BRAND_COLORS.primaryBlue
                      : '#92959C',
                  },
                ]}
              >
                {isSelected && (
                  <View
                    style={[
                      styles.radioInner,
                      { backgroundColor: BRAND_COLORS.primaryBlue },
                    ]}
                  />
                )}
              </View>

              <View style={{ flex: 1, paddingRight: 8 }}>
                <View style={styles.serviceTitleRow}>
                  <Text style={[styles.serviceTitle, { color: theme.textPrimary }]}>
                    {item.serviceName}
                  </Text>
                  {item.isQuoteFirst && (
                    <View style={styles.quoteFirstBadge}>
                      <Text style={styles.quoteFirstText}>Quote First</Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.serviceSubtitle, { color: theme.textSecondary }]}>
                  {item.standardLaborDurationMin} min labor included • {item.notes}
                </Text>
              </View>
            </View>

            <View style={styles.priceRow}>
              <Text
                style={[
                  styles.priceText,
                  {
                    color: isSelected
                      ? BRAND_COLORS.primaryBlue
                      : theme.textPrimary,
                    fontWeight: '700',
                  },
                ]}
              >
                ₹{item.customerPrice}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );

  const renderOfficialPricingPolicyCard = () => (
    <Card style={styles.policyCard}>
      <View style={styles.policyHeader}>
        <Ionicons name="shield-checkmark" size={18} color={BRAND_COLORS.primaryBlue} />
        <Text style={[styles.policyTitle, { color: theme.textPrimary }]}>
          Official MECHFIND Launch Pricing Rules
        </Text>
      </View>
      <View style={styles.policyItem}>
        <Ionicons name="checkmark-circle" size={14} color={BRAND_COLORS.successGreen} />
        <Text style={[styles.policyText, { color: theme.textSecondary }]}>
          <Text style={{ fontWeight: '700', color: theme.textPrimary }}>Base Radius:</Text> 0–5 km travel included. Standard disclosed distance fee applies beyond 5 km.
        </Text>
      </View>
      <View style={styles.policyItem}>
        <Ionicons name="checkmark-circle" size={14} color={BRAND_COLORS.successGreen} />
        <Text style={[styles.policyText, { color: theme.textSecondary }]}>
          <Text style={{ fontWeight: '700', color: theme.textPrimary }}>Parts & Consumables:</Text> Extra; quoted and approved by you in-app before mechanic commences repair.
        </Text>
      </View>
      <View style={styles.policyItem}>
        <Ionicons name="checkmark-circle" size={14} color={BRAND_COLORS.successGreen} />
        <Text style={[styles.policyText, { color: theme.textSecondary }]}>
          <Text style={{ fontWeight: '700', color: theme.textPrimary }}>Inspection Guarantee:</Text> Standard diagnosis fee remains payable even if repair is declined.
        </Text>
      </View>
    </Card>
  );

  const renderLocationAndLandmark = () => (
    <View style={styles.landmarkWrap}>
      <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
        Breakdown Location / Landmark
      </Text>
      <View
        style={[
          styles.locationInputBox,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <Ionicons name="location-outline" size={17} color={BRAND_COLORS.primaryBlue} />
        <TextInput
          placeholder={currentLocation.address || 'e.g. Near Petrol Pump / Highway Toll'}
          placeholderTextColor={theme.textTertiary}
          value={landmarkText}
          onChangeText={setLandmarkText}
          style={[styles.landmarkInput, { color: theme.textPrimary }]}
        />
      </View>
    </View>
  );

  return (
    <ScreenContainer scrollable withPadding={false} edges={['top', 'left', 'right']}>
      <Header title="Book Assistance" showBack showThemeToggle />

      <View
        style={[
          styles.contentWrapper,
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
            {/* Left Column: Workshop Info + Vehicle + Landmark + Policy */}
            <View style={styles.desktopLeftCol}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Assigned Verified Workshop
              </Text>
              {renderWorkshopCard()}

              <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: SPACING.md }]}>
                Vehicle Selection & Category
              </Text>
              {renderVehicleSelector()}

              <View style={{ marginTop: SPACING.md }}>
                {renderLocationAndLandmark()}
              </View>

              {renderOfficialPricingPolicyCard()}
            </View>

            {/* Right Column: Service Selection + Pricing + CTA */}
            <View style={styles.desktopRightCol}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginBottom: 0 }]}>
                  Select Service ({vehicleType})
                </Text>
                <Badge
                  label={`${availableServices.length} Services`}
                  variant="info"
                  size="sm"
                />
              </View>

              {renderCategoryFilterTabs()}
              {renderServicesList()}

              <View style={styles.otherInputWrap}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                  Additional Breakdown Notes (Optional)
                </Text>
                <TextInput
                  placeholder="Describe any symptoms, noises, or emergency requests..."
                  placeholderTextColor={theme.textTertiary}
                  value={customIssueText}
                  onChangeText={setCustomIssueText}
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                      color: theme.textPrimary,
                    },
                  ]}
                  multiline
                />
              </View>

              <View style={styles.bottomActionWrap}>
                <Pressable
                  onPress={handleConfirmBooking}
                  disabled={isSubmitting}
                  style={({ pressed }: { pressed: boolean }) => [
                    styles.confirmButton,
                    {
                      backgroundColor: BRAND_COLORS.primaryBlue,
                      opacity: pressed || isSubmitting ? 0.9 : 1,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Confirm Booking"
                >
                  <Text style={styles.confirmButtonText}>
                    Confirm Booking (₹{selectedService ? selectedService.customerPrice : 0})
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : (
          <>
            {/* Mobile Stacked Flow */}
            {renderWorkshopCard()}

            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Vehicle & Type
            </Text>
            {renderVehicleSelector()}

            <View style={[styles.sectionHeaderRow, { marginTop: SPACING.md }]}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginBottom: 0 }]}>
                Select Service ({vehicleType})
              </Text>
              <Badge
                label={`${availableServices.length} Available`}
                variant="info"
                size="sm"
              />
            </View>

            {renderCategoryFilterTabs()}
            {renderServicesList()}

            <View style={styles.otherInputWrap}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                Additional Breakdown Notes (Optional)
              </Text>
              <TextInput
                placeholder="Describe any symptoms, noises, or emergency requests..."
                placeholderTextColor={theme.textTertiary}
                value={customIssueText}
                onChangeText={setCustomIssueText}
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    color: theme.textPrimary,
                  },
                ]}
                multiline
              />
            </View>

            {renderLocationAndLandmark()}
            {renderOfficialPricingPolicyCard()}

            <View style={styles.bottomActionWrap}>
              <Pressable
                onPress={handleConfirmBooking}
                disabled={isSubmitting}
                style={({ pressed }: { pressed: boolean }) => [
                  styles.confirmButton,
                  {
                    backgroundColor: BRAND_COLORS.primaryBlue,
                    opacity: pressed || isSubmitting ? 0.9 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Confirm Booking"
              >
                <Text style={styles.confirmButtonText}>
                  Confirm Booking (₹{selectedService ? selectedService.customerPrice : 0})
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  contentWrapper: {
    paddingVertical: SPACING.md,
  },
  workshopCard: {
    padding: 12,
    marginBottom: SPACING.md,
  },
  workshopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  workshopThumbLogo: {
    width: 52,
    height: 52,
    borderRadius: 10,
  },
  workshopInfo: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  workshopName: {
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  ratingText: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  bulletDot: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  categoryTabsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: SPACING.sm,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  serviceList: {
    gap: 8,
    marginBottom: SPACING.md,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: RADIUS.md,
  },
  radioAndTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  serviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  serviceSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  quoteFirstBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  quoteFirstText: {
    color: '#92400E',
    fontSize: 10,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  priceText: {
    fontSize: 15,
  },
  policyCard: {
    padding: 14,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: 'rgba(23, 105, 232, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(23, 105, 232, 0.15)',
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  policyTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 4,
  },
  policyText: {
    fontSize: 11.5,
    flex: 1,
    lineHeight: 16,
  },
  otherInputWrap: {
    marginBottom: SPACING.md,
  },
  textInput: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    minHeight: 65,
    textAlignVertical: 'top',
  },
  landmarkWrap: {
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  locationInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  landmarkInput: {
    flex: 1,
    fontSize: 13,
  },
  bottomActionWrap: {
    marginTop: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  confirmButton: {
    height: 50,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: BRAND_COLORS.primaryBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  desktopLayout: {
    flexDirection: 'row',
    gap: 32,
    alignItems: 'flex-start',
    width: '100%',
  },
  desktopLeftCol: {
    flex: 0.95,
    minWidth: 380,
  },
  desktopRightCol: {
    flex: 1.05,
    minWidth: 420,
  },
  vehicleSummaryCard: {
    padding: 12,
    marginBottom: SPACING.md,
  },
  vehicleTypeToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  vehicleToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  vehicleToggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  vehicleSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vehicleModelText: {
    fontSize: 14,
    fontWeight: '700',
  },
  vehiclePlateText: {
    fontSize: 12,
    marginTop: 2,
  },
});
