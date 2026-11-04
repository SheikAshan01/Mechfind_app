import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { BRAND_COLORS } from '../../theme/colors';
import { RADIUS } from '../../theme/radius';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Header } from '../../components/ui/Header';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useCustomerStore } from '../../stores/customerStore';
import { vehicleSchema } from '../../schemas/authSchemas';
import { FuelType, VehicleType } from '../../types/customer';
import { useResponsive } from '../../hooks/useResponsive';

const FUEL_TYPES: FuelType[] = ['petrol', 'diesel', 'electric', 'cng', 'hybrid'];

export default function VehicleFormScreen() {
  const { theme, isDark } = useTheme();
  const { isSmallDevice, horizontalPadding, isTablet, isDesktop } = useResponsive();
  const { vehicleId } = useLocalSearchParams<{ vehicleId?: string }>();
  const { vehicles, addVehicle, updateVehicle } = useCustomerStore();

  const existingVehicle = vehicleId ? vehicles.find((v) => v.id === vehicleId) : null;

  const [type, setType] = useState<VehicleType>(existingVehicle?.type || 'car');
  const [make, setMake] = useState(existingVehicle?.make || '');
  const [model, setModel] = useState(existingVehicle?.model || '');
  const [year, setYear] = useState(String(existingVehicle?.year || 2022));
  const [licensePlate, setLicensePlate] = useState(existingVehicle?.licensePlate || '');
  const [fuelType, setFuelType] = useState<FuelType>(existingVehicle?.fuelType || 'petrol');
  const [color, setColor] = useState(existingVehicle?.color || '');
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setErrors({});
    const validation = vehicleSchema.safeParse({
      type,
      make,
      model,
      year: parseInt(year, 10) || 2022,
      licensePlate: licensePlate.toUpperCase().trim(),
      fuelType,
      color,
    });

    if (!validation.success) {
      const fieldErrors: { [k: string]: string } = {};
      validation.error.issues.forEach((err) => {
        fieldErrors[String(err.path[0])] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSaving(true);
    try {
      if (existingVehicle) {
        await updateVehicle(existingVehicle.id, {
          type,
          make,
          model,
          year: parseInt(year, 10),
          licensePlate: licensePlate.toUpperCase().trim(),
          fuelType,
          color,
        });
      } else {
        await addVehicle({
          type,
          make,
          model,
          year: parseInt(year, 10),
          licensePlate: licensePlate.toUpperCase().trim(),
          fuelType,
          color,
          isDefault: vehicles.length === 0,
        });
      }
      router.back();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer scrollable withPadding={false}>
      <Header
        title={existingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
        showBack
        showThemeToggle
      />

      <View
        style={[
          styles.content,
          {
            paddingHorizontal: horizontalPadding,
            maxWidth: isTablet || isDesktop ? 520 : undefined,
            alignSelf: isTablet || isDesktop ? 'center' : undefined,
            width: isTablet || isDesktop ? '100%' : undefined,
          },
        ]}
      >
        {/* Vehicle Category Selector */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          Vehicle Category
        </Text>
        <View style={styles.typeRow}>
          <Pressable
            onPress={() => setType('car')}
            style={[
              styles.typeBtn,
              {
                backgroundColor:
                  type === 'car'
                    ? isDark
                      ? '#1D3048'
                      : 'rgba(20, 184, 166, 0.12)'
                    : theme.surface,
                borderColor: type === 'car' ? BRAND_COLORS.accentTeal : theme.border,
              },
            ]}
          >
            <Ionicons
              name="car-sport"
              size={22}
              color={type === 'car' ? BRAND_COLORS.accentTeal : theme.textSecondary}
            />
            <Text
              style={[
                styles.typeBtnText,
                { color: type === 'car' ? theme.textPrimary : theme.textSecondary },
              ]}
            >
              Car / SUV
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setType('bike')}
            style={[
              styles.typeBtn,
              {
                backgroundColor:
                  type === 'bike'
                    ? isDark
                      ? '#1D3048'
                      : 'rgba(20, 184, 166, 0.12)'
                    : theme.surface,
                borderColor: type === 'bike' ? BRAND_COLORS.accentTeal : theme.border,
              },
            ]}
          >
            <Ionicons
              name="bicycle"
              size={22}
              color={type === 'bike' ? BRAND_COLORS.accentTeal : theme.textSecondary}
            />
            <Text
              style={[
                styles.typeBtnText,
                { color: type === 'bike' ? theme.textPrimary : theme.textSecondary },
              ]}
            >
              Motorcycle
            </Text>
          </Pressable>
        </View>

        <Input
          label="Make / Brand"
          placeholder="e.g. Hyundai, Honda, Toyota, Royal Enfield"
          value={make}
          onChangeText={setMake}
          error={errors.make}
          autoCapitalize="words"
          leftIcon={<Ionicons name="pricetag-outline" size={20} color={theme.textSecondary} />}
        />

        <Input
          label="Model"
          placeholder="e.g. Creta SX, Classic 350, City"
          value={model}
          onChangeText={setModel}
          error={errors.model}
          autoCapitalize="words"
          leftIcon={<Ionicons name="car-outline" size={20} color={theme.textSecondary} />}
        />

        <View style={[styles.twoCols, isSmallDevice && { flexDirection: 'column' }]}>
          <View style={{ flex: 1, marginRight: isSmallDevice ? 0 : SPACING.sm }}>
            <Input
              label="Registration / Number Plate"
              placeholder="MH 02 EE 4092"
              value={licensePlate}
              onChangeText={setLicensePlate}
              error={errors.licensePlate}
              autoCapitalize="characters"
            />
          </View>
          <View style={{ flex: isSmallDevice ? 1 : 0.7 }}>
            <Input
              label="Model Year"
              placeholder="2022"
              keyboardType="number-pad"
              value={year}
              onChangeText={setYear}
              error={errors.year}
              maxLength={4}
            />
          </View>
        </View>

        {/* Fuel Type Pills */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: SPACING.xs }]}>
          Fuel Type
        </Text>
        <View style={styles.fuelRow}>
          {FUEL_TYPES.map((f) => {
            const isSelected = fuelType === f;
            return (
              <Pressable
                key={f}
                onPress={() => setFuelType(f)}
                style={[
                  styles.fuelPill,
                  {
                    backgroundColor: isSelected
                      ? isDark
                        ? BRAND_COLORS.accentTeal
                        : BRAND_COLORS.primaryNavy
                      : theme.surface,
                    borderColor: isSelected
                      ? isDark
                        ? BRAND_COLORS.accentTeal
                        : BRAND_COLORS.primaryNavy
                      : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.fuelPillText,
                    {
                      color: isSelected
                        ? isDark
                          ? BRAND_COLORS.primaryNavy
                          : '#FFFFFF'
                        : theme.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {f.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Input
          label="Vehicle Color (Optional)"
          placeholder="e.g. Polar White, Stealth Black"
          value={color}
          onChangeText={setColor}
          containerStyle={{ marginTop: SPACING.sm }}
        />

        <Button
          title={existingVehicle ? 'Save Changes' : 'Add Vehicle to Garage'}
          onPress={handleSave}
          loading={isSaving}
          style={{ marginTop: SPACING.md }}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.huge,
  },
  sectionLabel: {
    ...TYPOGRAPHY.label,
    marginBottom: SPACING.xs,
  },
  typeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
  },
  typeBtnText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
  },
  twoCols: {
    flexDirection: 'row',
  },
  fuelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs + 2,
    marginBottom: SPACING.xs,
  },
  fuelPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  fuelPillText: {
    fontSize: 11,
  },
});
