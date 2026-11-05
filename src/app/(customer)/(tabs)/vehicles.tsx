import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeContext';
import { BRAND_COLORS } from '../../../theme/colors';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';
import { useCustomerStore } from '../../../stores/customerStore';
import { useResponsive } from '../../../hooks/useResponsive';

const ACCENT_YELLOW = '#FFC400';

export default function CustomerVehiclesScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { isTablet, isDesktop } = useResponsive();
  const {
    vehicles,
    selectedVehicleId,
    setSelectedVehicleId,
    deleteVehicle,
  } = useCustomerStore();

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handlePromptDelete = (id: string, name: string) => {
    setFeedback(null);
    setDeleteTarget({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const res = await deleteVehicle(deleteTarget.id);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `${deleteTarget.name} was permanently removed from your garage.`,
        });
        setDeleteTarget(null);
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to delete vehicle. Please try again.',
        });
        setDeleteTarget(null);
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'An unexpected error occurred while deleting vehicle.',
      });
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 20);
  const isCenteredScreen = isTablet || isDesktop;

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <View
        style={[
          styles.mainWrapper,
          isCenteredScreen && styles.centeredWrapper,
        ]}
      >
        {/* ========================================================= */}
        {/* A. HEADER (Dark Metallic Section)                         */}
        {/* ========================================================= */}
        <View style={[styles.headerSection, { paddingTop: topPadding + 6 }]}>
          {/* Top Bar: Back Arrow, Title, Theme Toggle & Add (+) Button */}
          <View style={styles.topBarRow}>
            <View style={styles.titleGroup}>
              <Pressable
                onPress={() => router.back()}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={styles.backButton}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </Pressable>
              <Text style={styles.headerTitle}>My Garage & Vehicles</Text>
            </View>

            <View style={styles.headerActions}>
              {/* Theme Toggle */}
              <Pressable
                onPress={toggleTheme}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.themeToggleBtn}
                accessibilityRole="button"
                accessibilityLabel="Toggle appearance"
              >
                <Ionicons
                  name={isDark ? 'sunny-outline' : 'moon-outline'}
                  size={20}
                  color="#FFFFFF"
                />
              </Pressable>

              {/* Add Vehicle (+) Button */}
              <Pressable
                onPress={() => router.push('/(customer)/vehicle-form')}
                style={styles.addCircleButton}
                accessibilityRole="button"
                accessibilityLabel="Add new vehicle"
              >
                <Ionicons name="add" size={22} color="#101114" />
              </Pressable>
            </View>
          </View>

          {/* Garage Banner */}
          <View style={styles.garageBanner}>
            <View style={styles.bannerLeft}>
              <Text style={styles.bannerTitle}>
                Your <Text style={{ color: ACCENT_YELLOW }}>Garage</Text>
              </Text>
              <Text style={styles.bannerSubtitle}>
                Manage your vehicles and keep them ready for any roadside help.
              </Text>
            </View>

            <Image
              source={require('../../../../assets/images/garage-suv-banner.png')}
              style={styles.bannerSuvImage}
              resizeMode="contain"
              accessibilityLabel="Garage vehicle visual"
            />
          </View>
        </View>

        {/* ========================================================= */}
        {/* B. CURVED BODY SECTION                                    */}
        {/* ========================================================= */}
        <View
          style={[
            styles.curvedBodySection,
            { backgroundColor: isDark ? '#101114' : '#F1F2F4' },
          ]}
        >
          {/* Feedback Banner */}
          {feedback && (
            <View
              style={[
                styles.feedbackBanner,
                {
                  backgroundColor:
                    feedback.type === 'success'
                      ? isDark
                        ? 'rgba(22, 163, 74, 0.2)'
                        : '#ECFDF5'
                      : isDark
                      ? 'rgba(220, 38, 38, 0.2)'
                      : '#FEF2F2',
                  borderColor:
                    feedback.type === 'success' ? '#16A34A' : '#DC2626',
                },
              ]}
            >
              <Ionicons
                name={
                  feedback.type === 'success'
                    ? 'checkmark-circle'
                    : 'alert-circle'
                }
                size={18}
                color={feedback.type === 'success' ? '#16A34A' : '#DC2626'}
              />
              <Text
                style={[
                  styles.feedbackText,
                  {
                    color:
                      feedback.type === 'success'
                        ? isDark
                          ? '#4ADE80'
                          : '#15803D'
                        : isDark
                        ? '#F87171'
                        : '#B91C1C',
                  },
                ]}
              >
                {feedback.message}
              </Text>
              <Pressable onPress={() => setFeedback(null)} hitSlop={6}>
                <Ionicons name="close" size={16} color="#6B7280" />
              </Pressable>
            </View>
          )}

          <FlatList
            data={vehicles}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: Math.max(insets.bottom, 16) + 40 },
            ]}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              vehicles.length > 0 ? (
                /* Registered Vehicles Highlight Banner */
                <View style={styles.registeredNoticeBanner}>
                  <Ionicons
                    name="shield-checkmark"
                    size={20}
                    color="#111827"
                    style={{ marginTop: 1 }}
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.registeredNoticeTitle}>
                      Registered Vehicles ({vehicles.length})
                    </Text>
                    <Text style={styles.registeredNoticeSubtitle}>
                      Select your active vehicle for 1-tap breakdown assistance.
                    </Text>
                  </View>
                </View>
              ) : undefined
            }
            ListEmptyComponent={
              <EmptyState
                icon="car-outline"
                title="No Saved Vehicles"
                description="Add your car or motorcycle to request quick breakdown assistance without re-entering details."
                actionTitle="Add Vehicle"
                onActionPress={() => router.push('/(customer)/vehicle-form')}
              />
            }
            renderItem={({ item }) => {
              const isSelected = selectedVehicleId === item.id || item.isDefault;

              return (
                <View
                  style={[
                    styles.vehicleCard,
                    {
                      backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                      borderColor: isDark ? '#2A2B30' : '#EAECEF',
                    },
                  ]}
                >
                  {/* Top Section: Vehicle Image + Specs + Active Badge */}
                  <View style={styles.cardTopRow}>
                    <Image
                      source={require('../../../../assets/images/vehicle-creta-thumb.png')}
                      style={styles.vehicleThumbnail}
                      resizeMode="contain"
                      accessibilityLabel={`${item.make} ${item.model}`}
                    />

                    <View style={styles.cardDetailsCol}>
                      <Text
                        style={[
                          styles.vehicleModelText,
                          { color: isDark ? '#FFFFFF' : '#111827' },
                        ]}
                        numberOfLines={1}
                      >
                        {item.make} {item.model}
                      </Text>
                      <Text
                        style={[
                          styles.licensePlateText,
                          { color: isDark ? '#E5E7EB' : '#111827' },
                        ]}
                      >
                        {item.licensePlate || 'MH 02 EE 4092'}
                      </Text>
                      <Text style={styles.specsText}>
                        {item.year || 2022} • {(item.fuelType || 'petrol').toUpperCase()} • {item.color || 'Polar White'}
                      </Text>
                    </View>

                    {isSelected && (
                      <View style={styles.activeBadgePill}>
                        <Text style={styles.activeBadgeText}>ACTIVE</Text>
                      </View>
                    )}
                  </View>

                  {/* Divider Line */}
                  <View
                    style={[
                      styles.cardDivider,
                      { backgroundColor: isDark ? '#2A2B30' : '#F3F4F6' },
                    ]}
                  />

                  {/* Bottom Action Row */}
                  <View style={styles.cardActionRow}>
                    {/* Default Status Pill / Button */}
                    <Pressable
                      onPress={() => setSelectedVehicleId(item.id)}
                      style={[
                        styles.defaultStatusPill,
                        isSelected && styles.defaultStatusPillActive,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel="Set as default vehicle"
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={15}
                        color={isSelected ? '#16A34A' : '#9CA3AF'}
                      />
                      <Text
                        style={[
                          styles.defaultStatusText,
                          isSelected && styles.defaultStatusTextActive,
                        ]}
                      >
                        {isSelected
                          ? 'Default for Breakdown Requests'
                          : 'Set as Default'}
                      </Text>
                    </Pressable>

                    {/* Edit & Delete Actions */}
                    <View style={styles.iconActions}>
                      <Pressable
                        onPress={() =>
                          router.push({
                            pathname: '/(customer)/vehicle-form',
                            params: { id: item.id },
                          })
                        }
                        style={[
                          styles.iconActionSquare,
                          {
                            backgroundColor: isDark ? '#26282E' : '#F3F4F6',
                          },
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel="Edit vehicle"
                      >
                        <Ionicons
                          name="create-outline"
                          size={17}
                          color={isDark ? '#FFFFFF' : '#111827'}
                        />
                      </Pressable>

                      <Pressable
                        onPress={() =>
                          handlePromptDelete(
                            item.id,
                            `${item.make} ${item.model}`
                          )
                        }
                        style={[
                          styles.iconActionSquare,
                          styles.deleteActionSquare,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel="Delete vehicle"
                      >
                        <Ionicons
                          name="trash-outline"
                          size={17}
                          color="#DC2626"
                        />
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            }}
            ListFooterComponent={
              /* Add More Vehicles Section */
              <View style={styles.addMoreSection}>
                <Image
                  source={require('../../../../assets/images/add-vehicle-illustration.png')}
                  style={styles.addIllustration}
                  resizeMode="contain"
                  accessibilityLabel="Add vehicle illustration"
                />

                <Text
                  style={[
                    styles.addMoreTitle,
                    { color: isDark ? '#FFFFFF' : '#111827' },
                  ]}
                >
                  Add More Vehicles
                </Text>
                <Text style={styles.addMoreSubtitle}>
                  Keep all your vehicles in one place for faster service booking.
                </Text>

                <Pressable
                  onPress={() => router.push('/(customer)/vehicle-form')}
                  style={({ pressed }) => [
                    styles.addVehicleButton,
                    { opacity: pressed ? 0.88 : 1 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Add Vehicle"
                >
                  <Ionicons name="add" size={18} color="#101114" />
                  <Text style={styles.addVehicleButtonText}>Add Vehicle</Text>
                </Pressable>
              </View>
            }
          />
        </View>
      </View>

      {/* Delete Vehicle Confirmation Dialog */}
      <ConfirmationModal
        visible={!!deleteTarget}
        title="Remove Vehicle?"
        message={`Are you sure you want to delete ${deleteTarget?.name || 'this vehicle'} from your garage? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Keep"
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#101114',
  },
  mainWrapper: {
    flex: 1,
    width: '100%',
  },
  centeredWrapper: {
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
  },

  /* HEADER */
  headerSection: {
    backgroundColor: '#101114',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  themeToggleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1C1D21',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCircleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ACCENT_YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* GARAGE BANNER */
  garageBanner: {
    backgroundColor: '#16171B',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
  },
  bannerLeft: {
    flex: 1,
    zIndex: 2,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  bannerSubtitle: {
    fontSize: 12.5,
    lineHeight: 17,
    color: '#9CA3AF',
    marginTop: 6,
    maxWidth: 180,
  },
  bannerSuvImage: {
    width: 155,
    height: 105,
    position: 'absolute',
    right: 2,
    bottom: 4,
    zIndex: 1,
  },

  /* BODY */
  curvedBodySection: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 16,
    marginTop: 4,
  },
  listContent: {
    gap: 12,
  },

  /* REGISTERED VEHICLES NOTICE */
  registeredNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9C3',
    borderColor: '#FDE047',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 4,
  },
  registeredNoticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  registeredNoticeSubtitle: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },

  /* VEHICLE CARD */
  vehicleCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleThumbnail: {
    width: 76,
    height: 52,
  },
  cardDetailsCol: {
    flex: 1,
    marginLeft: 12,
    marginRight: 6,
  },
  vehicleModelText: {
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  licensePlateText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  specsText: {
    fontSize: 11.5,
    color: '#9CA3AF',
    marginTop: 2,
  },
  activeBadgePill: {
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  cardDivider: {
    height: 1,
    marginVertical: 12,
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  defaultStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
  },
  defaultStatusPillActive: {
    backgroundColor: '#DCFCE7',
  },
  defaultStatusText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#4B5563',
  },
  defaultStatusTextActive: {
    color: '#15803D',
    fontWeight: '700',
  },
  iconActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconActionSquare: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteActionSquare: {
    backgroundColor: '#FEE2E2',
  },

  /* ADD MORE VEHICLES SECTION */
  addMoreSection: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 24,
  },
  addIllustration: {
    width: 80,
    height: 52,
    marginBottom: 8,
  },
  addMoreTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  addMoreSubtitle: {
    fontSize: 12.5,
    color: '#6B7280',
    marginTop: 3,
    marginBottom: 14,
  },
  addVehicleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT_YELLOW,
    borderRadius: 22,
    height: 44,
    paddingHorizontal: 22,
    gap: 6,
    shadowColor: ACCENT_YELLOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  addVehicleButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#101114',
  },

  /* FEEDBACK BANNER */
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  feedbackText: {
    fontSize: 12.5,
    fontWeight: '600',
    flex: 1,
  },
});
