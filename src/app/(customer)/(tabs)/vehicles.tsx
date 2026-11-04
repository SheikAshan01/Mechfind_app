import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { BRAND_COLORS } from '../../../theme/colors';
import { RADIUS } from '../../../theme/radius';
import { SPACING } from '../../../theme/spacing';
import { TYPOGRAPHY } from '../../../theme/typography';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { Header } from '../../../components/ui/Header';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';
import { useCustomerStore } from '../../../stores/customerStore';
import { useResponsive } from '../../../hooks/useResponsive';

export default function CustomerVehiclesScreen() {
  const { theme, isDark } = useTheme();
  const { horizontalPadding, isTablet, isDesktop } = useResponsive();
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

  return (
    <ScreenContainer withPadding={false} edges={['top', 'left', 'right']}>
      <Header
        title="My Garage & Vehicles"
        showThemeToggle
        rightAction={
          <Pressable
            onPress={() => router.push('/(customer)/vehicle-form')}
            style={[styles.addBtn, { backgroundColor: BRAND_COLORS.primary }]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Add Vehicle"
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </Pressable>
        }
      />

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
        {/* Feedback Banner */}
        {feedback && (
          <View
            style={[
              styles.feedbackBanner,
              {
                backgroundColor:
                  feedback.type === 'success'
                    ? isDark
                      ? 'rgba(22, 163, 74, 0.15)'
                      : '#ECFDF5'
                    : isDark
                    ? 'rgba(220, 38, 38, 0.15)'
                    : '#FEF2F2',
                borderColor:
                  feedback.type === 'success'
                    ? BRAND_COLORS.success
                    : BRAND_COLORS.error,
              },
            ]}
          >
            <Ionicons
              name={feedback.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
              size={18}
              color={feedback.type === 'success' ? BRAND_COLORS.success : BRAND_COLORS.error}
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
              <Ionicons name="close" size={16} color={theme.textSecondary} />
            </Pressable>
          </View>
        )}

        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            vehicles.length > 0 ? (
              <View style={{ marginBottom: SPACING.md }}>
                <Card
                  style={{
                    backgroundColor: isDark ? '#141E2F' : '#EFF6FF',
                    borderColor: isDark ? '#1E293B' : '#BFDBFE',
                    borderWidth: 1,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Ionicons name="shield-checkmark" size={18} color={BRAND_COLORS.primary} />
                    <Text style={{ fontSize: 14, fontWeight: '700', color: theme.textPrimary }}>
                      Registered Vehicles ({vehicles.length})
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 18 }}>
                    Select your active vehicle for 1-tap breakdown assistance. Deleted vehicles are permanently removed from your account.
                  </Text>
                </Card>
              </View>
            ) : undefined
          }
          ListEmptyComponent={
            <EmptyState
              icon="car-outline"
              title="No Saved Vehicles"
              description="Add your car or motorcycle to request quick breakdown assistance without re-entering details."
              actionTitle="Add First Vehicle"
              onActionPress={() => router.push('/(customer)/vehicle-form')}
            />
          }
          renderItem={({ item }) => {
            const isSelected = selectedVehicleId === item.id;
            return (
              <Card elevated style={styles.vehicleCard}>
                <View style={styles.cardTop}>
                  <View
                    style={[
                      styles.iconCircle,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? 'rgba(23, 105, 245, 0.25)'
                            : '#EFF6FF'
                          : isDark
                          ? '#1E293B'
                          : '#F1F5F9',
                      },
                    ]}
                  >
                    <Ionicons
                      name={item.type === 'bike' ? 'bicycle' : 'car-sport'}
                      size={22}
                      color={isSelected ? BRAND_COLORS.primary : theme.textPrimary}
                    />
                  </View>

                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={styles.titleRow}>
                      <Text style={[styles.vehicleMake, { color: theme.textPrimary }]} numberOfLines={1}>
                        {item.make} {item.model}
                      </Text>
                      {isSelected ? (
                        <Badge label="ACTIVE" variant="brand" size="sm" />
                      ) : null}
                    </View>
                    <Text style={[styles.vehiclePlate, { color: theme.textSecondary }]}>
                      {item.licensePlate}
                    </Text>
                    <Text style={[styles.vehicleYear, { color: theme.textTertiary }]} numberOfLines={1}>
                      {item.year} • {item.fuelType?.toUpperCase()} • {item.color || 'Standard'}
                    </Text>
                  </View>
                </View>

                <View style={[styles.actionsRow, { borderTopColor: theme.divider }]}>
                  {!isSelected ? (
                    <Button
                      title="Set as Active"
                      onPress={() => setSelectedVehicleId(item.id)}
                      variant="ghost"
                      size="sm"
                    />
                  ) : (
                    <Text style={[styles.activeStatusText, { color: BRAND_COLORS.success }]}>
                      ✓ Default for Breakdown Requests
                    </Text>
                  )}

                  <View style={styles.iconActions}>
                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname: '/(customer)/vehicle-form',
                          params: { vehicleId: item.id },
                        })
                      }
                      style={styles.iconActionBtn}
                      hitSlop={8}
                      accessibilityLabel="Edit vehicle"
                    >
                      <Ionicons name="create-outline" size={19} color={theme.textSecondary} />
                    </Pressable>

                    <Pressable
                      onPress={() => handlePromptDelete(item.id, `${item.make} ${item.model}`)}
                      style={[styles.iconActionBtn, styles.deleteBtn]}
                      hitSlop={8}
                      accessibilityLabel="Delete vehicle"
                    >
                      <Ionicons name="trash-outline" size={19} color={BRAND_COLORS.error} />
                    </Pressable>
                  </View>
                </View>
              </Card>
            );
          }}
        />
      </View>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={Boolean(deleteTarget)}
        title="Delete Vehicle"
        message={`Are you sure you want to permanently remove "${deleteTarget?.name}" from your garage? This action cannot be undone.`}
        confirmText="Delete Vehicle"
        cancelText="Cancel"
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    flex: 1,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  feedbackText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: SPACING.sm,
    paddingBottom: SPACING.xxl,
  },
  vehicleCard: {
    marginBottom: SPACING.md,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.xs,
  },
  vehicleMake: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  vehiclePlate: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  vehicleYear: {
    fontSize: 12,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
  },
  activeStatusText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  iconActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconActionBtn: {
    padding: 6,
    borderRadius: RADIUS.sm,
  },
  deleteBtn: {
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
  },
});
