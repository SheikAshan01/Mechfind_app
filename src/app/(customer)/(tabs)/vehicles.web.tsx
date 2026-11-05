import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../../theme/ThemeContext';
import { WebFooter } from '../../../components/navigation/WebFooter';
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';
import { useCustomerStore } from '../../../stores/customerStore';
import { Vehicle, VehicleType, FuelType } from '../../../types/customer';
import { useResponsive } from '../../../hooks/useResponsive';

const ACCENT_YELLOW = '#FFC400';

export default function CustomerVehiclesWeb() {
  const { isDark } = useTheme();
  const { width } = useResponsive();
  const isDesktop = width >= 1024;
  const isTablet = width >= 720 && width < 1024;

  const {
    vehicles,
    selectedVehicleId,
    setSelectedVehicleId,
    addVehicle,
    updateVehicle,
    deleteVehicle,
  } = useCustomerStore();

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form fields state
  const [formType, setFormType] = useState<VehicleType>('car');
  const [formMake, setFormMake] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formPlate, setFormPlate] = useState('');
  const [formYear, setFormYear] = useState('2023');
  const [formFuel, setFormFuel] = useState<FuelType>('petrol');
  const [formColor, setFormColor] = useState('Polar White');

  const openAddModal = () => {
    setFormType('car');
    setFormMake('');
    setFormModel('');
    setFormPlate('');
    setFormYear('2023');
    setFormFuel('petrol');
    setFormColor('Polar White');
    setFeedback(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormType(vehicle.type || 'car');
    setFormMake(vehicle.make);
    setFormModel(vehicle.model);
    setFormPlate(vehicle.licensePlate);
    setFormYear(vehicle.year ? String(vehicle.year) : '2022');
    setFormFuel(vehicle.fuelType || 'petrol');
    setFormColor(vehicle.color || 'Polar White');
    setFeedback(null);
  };

  const handleSaveAddVehicle = async () => {
    if (!formMake.trim() || !formModel.trim() || !formPlate.trim()) {
      setFeedback({ type: 'error', message: 'Please fill in make, model, and registration number.' });
      return;
    }

    setIsProcessing(true);
    setFeedback(null);

    try {
      await addVehicle({
        type: formType,
        make: formMake.trim(),
        model: formModel.trim(),
        licensePlate: formPlate.trim().toUpperCase(),
        year: parseInt(formYear, 10) || 2023,
        fuelType: formFuel,
        color: formColor.trim(),
        isDefault: vehicles.length === 0,
      });

      setFeedback({ type: 'success', message: 'Vehicle added to your garage successfully!' });
      setTimeout(() => {
        setIsAddModalOpen(false);
        setIsProcessing(false);
        setFeedback(null);
      }, 900);
    } catch {
      setFeedback({ type: 'error', message: 'Failed to add vehicle. Please try again.' });
      setIsProcessing(false);
    }
  };

  const handleSaveEditVehicle = async () => {
    if (!editingVehicle) return;
    if (!formMake.trim() || !formModel.trim() || !formPlate.trim()) {
      setFeedback({ type: 'error', message: 'Please fill in make, model, and registration number.' });
      return;
    }

    setIsProcessing(true);
    setFeedback(null);

    try {
      await updateVehicle(editingVehicle.id, {
        type: formType,
        make: formMake.trim(),
        model: formModel.trim(),
        licensePlate: formPlate.trim().toUpperCase(),
        year: parseInt(formYear, 10) || 2023,
        fuelType: formFuel,
        color: formColor.trim(),
      });

      setFeedback({ type: 'success', message: 'Vehicle details updated successfully!' });
      setTimeout(() => {
        setEditingVehicle(null);
        setIsProcessing(false);
        setFeedback(null);
      }, 900);
    } catch {
      setFeedback({ type: 'error', message: 'Failed to update vehicle.' });
      setIsProcessing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingVehicle) return;
    setIsProcessing(true);

    try {
      const res = await deleteVehicle(deletingVehicle.id);
      if (res.success) {
        setDeletingVehicle(null);
      } else {
        alert(res.error || 'Failed to delete vehicle.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetDefault = (vehicle: Vehicle) => {
    setSelectedVehicleId(vehicle.id);
  };

  return (
    <View style={[styles.pageRoot, { backgroundColor: isDark ? '#101114' : '#F8F9FA' }]}>
      {/* 1. Scrollable Body in Natural Document Flow (Navbar provided by tabs _layout) */}
      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContainer}>
          {/* ========================================================= */}
          {/* SECTION A: GARAGE HERO                                    */}
          {/* ========================================================= */}
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: isDark ? '#16171B' : '#101114',
                borderColor: isDark ? '#2D3139' : '#1F2024',
              },
            ]}
          >
            <View style={styles.heroRow}>
              {/* Left Column: Label, Heading, Description, Highlights */}
              <View style={styles.heroLeftCol}>
                <View style={styles.heroLabelRow}>
                  <Text style={styles.heroLabelText}>MY GARAGE</Text>
                  <View style={styles.heroLabelBar} />
                </View>

                <Text style={styles.heroHeadline}>My Garage & Vehicles</Text>

                <Text style={styles.heroSubtitle}>
                  Manage your vehicles and keep them ready for any roadside help.
                </Text>

                {/* 3 Feature Highlights in a Row */}
                <View style={styles.highlightsRow}>
                  <View style={styles.highlightItem}>
                    <Ionicons name="car" size={18} color={ACCENT_YELLOW} />
                    <Text style={styles.highlightText}>Add & Manage Vehicles</Text>
                  </View>

                  <View style={styles.highlightItem}>
                    <Ionicons name="shield-checkmark" size={18} color={ACCENT_YELLOW} />
                    <Text style={styles.highlightText}>Set Default Vehicle</Text>
                  </View>

                  <View style={styles.highlightItem}>
                    <Ionicons name="flash" size={18} color={ACCENT_YELLOW} />
                    <Text style={styles.highlightText}>Quick Breakdown Request</Text>
                  </View>
                </View>
              </View>

              {/* Right Column: Hero Visual Graphic with Yellow Diagonal Slash */}
              {isDesktop && (
                <View style={styles.heroRightCol}>
                  <View style={styles.heroImageWrapper}>
                    <Image
                      source={require('../../../../assets/images/garage-suv-banner.png')}
                      style={styles.heroCarImage}
                      resizeMode="contain"
                      accessibilityLabel="MECHFIND Registered SUV in Garage"
                    />
                    {/* Corner Yellow Diagonal Slash Accent */}
                    <View pointerEvents="none" style={styles.heroDiagonalAccent}>
                      <Svg width={200} height={200} viewBox="0 0 200 200">
                        <Path d="M80 -30 L230 120 L200 150 L50 0 Z" fill={ACCENT_YELLOW} />
                      </Svg>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* ========================================================= */}
          {/* SECTION B: REGISTERED VEHICLES SECTION HEADER             */}
          {/* ========================================================= */}
          <View
            style={[
              styles.sectionHeaderCard,
              {
                backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                borderColor: isDark ? '#2D3139' : '#EAECEF',
              },
            ]}
          >
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.carIconBox}>
                <Ionicons name="car" size={20} color="#B45309" />
              </View>
              <View>
                <Text
                  style={[
                    styles.sectionHeaderTitle,
                    { color: isDark ? '#FFFFFF' : '#101114' },
                  ]}
                >
                  Registered Vehicles ({vehicles.length})
                </Text>
                <Text style={styles.sectionHeaderSub}>
                  Select your active vehicle for 1-tap breakdown assistance.
                </Text>
              </View>
            </View>

            {/* + Add Vehicle Primary Button */}
            <Pressable
              onPress={openAddModal}
              style={styles.addVehicleBtn}
              accessibilityRole="button"
              accessibilityLabel="Add Vehicle"
            >
              <Ionicons name="add" size={18} color="#101114" />
              <Text style={styles.addVehicleBtnText}>+ Add Vehicle</Text>
            </Pressable>
          </View>

          {/* ========================================================= */}
          {/* SECTION C: VEHICLE CARDS STACK                            */}
          {/* ========================================================= */}
          {vehicles.length === 0 ? (
            /* Empty State */
            <View
              style={[
                styles.emptyCard,
                {
                  backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                  borderColor: isDark ? '#2D3139' : '#E5E7EB',
                },
              ]}
            >
              <Ionicons name="car-outline" size={44} color="#9CA3AF" />
              <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                Your Garage is Empty
              </Text>
              <Text style={styles.emptySubtitle}>
                Add your first vehicle to make service bookings and roadside assistance easier.
              </Text>
              <Pressable onPress={openAddModal} style={styles.emptyAddBtn}>
                <Text style={styles.emptyAddBtnText}>+ Add Your First Vehicle</Text>
              </Pressable>
            </View>
          ) : (
            /* Vehicle Cards Stack */
            <View style={styles.vehiclesStack}>
              {vehicles.map((v) => {
                const isDefault = v.id === selectedVehicleId || (v.isDefault && !selectedVehicleId);
                const isBike = v.type === 'bike';

                return (
                  <View
                    key={v.id}
                    style={[
                      styles.vehicleCard,
                      {
                        backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                        borderColor: isDefault
                          ? ACCENT_YELLOW
                          : isDark
                          ? '#2D3139'
                          : '#EAECEF',
                        borderWidth: isDefault ? 1.5 : 1,
                      },
                    ]}
                  >
                    <View style={[styles.vehicleCardRow, !isDesktop && styles.vehicleCardRowMobile]}>
                      {/* Left: Vehicle Image */}
                      <View style={styles.vehicleThumbWrapper}>
                        <Image
                          source={
                            isBike
                              ? require('../../../../assets/images/app-emblem.png')
                              : require('../../../../assets/images/vehicle-creta-thumb.png')
                          }
                          style={styles.vehicleThumbImg}
                          resizeMode="contain"
                          accessibilityLabel={`${v.make} ${v.model}`}
                        />
                      </View>

                      {/* Center: Vehicle Details */}
                      <View style={styles.vehicleDetailsCol}>
                        {/* Make & Model + ACTIVE Badge */}
                        <View style={styles.titleRow}>
                          <Text
                            style={[
                              styles.makeModelText,
                              { color: isDark ? '#FFFFFF' : '#101114' },
                            ]}
                          >
                            {v.make} {v.model}
                          </Text>
                          {isDefault && (
                            <View style={styles.activeBadge}>
                              <Text style={styles.activeBadgeText}>ACTIVE</Text>
                            </View>
                          )}
                        </View>

                        {/* Registration License Plate */}
                        <Text
                          style={[
                            styles.licensePlateText,
                            { color: isDark ? '#FFFFFF' : '#101114' },
                          ]}
                        >
                          {v.licensePlate}
                        </Text>

                        {/* Specs Meta */}
                        <Text style={styles.specsText}>
                          {v.year || 2022} • {(v.fuelType || 'petrol').toUpperCase()} • {v.color || 'Polar White'}
                        </Text>

                        {/* Default Status / Set as Default Action */}
                        <View style={styles.defaultActionRow}>
                          {isDefault ? (
                            <View style={styles.defaultIndicatorPill}>
                              <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                              <Text style={styles.defaultIndicatorText}>
                                Default for Breakdown Requests
                              </Text>
                            </View>
                          ) : (
                            <Pressable
                              onPress={() => handleSetDefault(v)}
                              style={[
                                styles.setDefaultBtn,
                                {
                                  backgroundColor: isDark ? '#24262D' : '#F3F4F6',
                                  borderColor: isDark ? '#373A43' : '#E5E7EB',
                                },
                              ]}
                              accessibilityRole="button"
                              accessibilityLabel={`Set ${v.make} as default vehicle`}
                            >
                              <Ionicons name="checkmark-circle-outline" size={14} color="#6B7280" />
                              <Text style={[styles.setDefaultBtnText, { color: isDark ? '#D1D5DB' : '#4B5563' }]}>
                                Set as Default
                              </Text>
                            </Pressable>
                          )}
                        </View>
                      </View>

                      {/* Right: Edit & Delete Action Buttons */}
                      <View style={styles.actionsGroup}>
                        {/* Edit Button */}
                        <Pressable
                          onPress={() => openEditModal(v)}
                          style={[
                            styles.actionIconBtn,
                            {
                              backgroundColor: isDark ? '#24262D' : '#F9FAFB',
                              borderColor: isDark ? '#373A43' : '#E5E7EB',
                            },
                          ]}
                          accessibilityLabel="Edit vehicle"
                        >
                          <Ionicons name="create-outline" size={17} color={isDark ? '#E5E7EB' : '#374151'} />
                        </Pressable>

                        {/* Delete Button */}
                        <Pressable
                          onPress={() => setDeletingVehicle(v)}
                          style={[
                            styles.actionIconBtn,
                            styles.deleteIconBtn,
                          ]}
                          accessibilityLabel="Delete vehicle"
                        >
                          <Ionicons name="trash-outline" size={17} color="#DC2626" />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* 3. Website Footer in Natural Flow (No Overlap) */}
        <WebFooter />
      </ScrollView>

      {/* ========================================================= */}
      {/* ADD VEHICLE MODAL                                         */}
      {/* ========================================================= */}
      <Modal
        visible={isAddModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsAddModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setIsAddModalOpen(false)} />
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                borderColor: isDark ? '#2D3139' : '#E5E7EB',
              },
            ]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={[styles.modalTitleText, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                  Add New Vehicle
                </Text>
                <Text style={styles.modalSubtitleText}>
                  Register your vehicle for fast roadside assistance
                </Text>
              </View>
              <Pressable onPress={() => setIsAddModalOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color="#9CA3AF" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalBody}>
              {feedback && (
                <View style={[styles.feedbackBox, feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError]}>
                  <Text style={[styles.feedbackText, { color: feedback.type === 'success' ? '#16A34A' : '#DC2626' }]}>
                    {feedback.message}
                  </Text>
                </View>
              )}

              {/* 2W vs 4W */}
              <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#374151' }]}>Vehicle Type</Text>
              <View style={styles.typeToggleRow}>
                <Pressable
                  onPress={() => setFormType('car')}
                  style={[styles.typeOptionBtn, formType === 'car' ? styles.typeOptionActive : styles.typeOptionInactive]}
                >
                  <Ionicons name="car-sport" size={16} color={formType === 'car' ? '#101114' : '#6B7280'} />
                  <Text style={[styles.typeOptionText, { color: formType === 'car' ? '#101114' : '#6B7280' }]}>
                    Car (4W)
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setFormType('bike')}
                  style={[styles.typeOptionBtn, formType === 'bike' ? styles.typeOptionActive : styles.typeOptionInactive]}
                >
                  <Ionicons name="bicycle" size={16} color={formType === 'bike' ? '#101114' : '#6B7280'} />
                  <Text style={[styles.typeOptionText, { color: formType === 'bike' ? '#101114' : '#6B7280' }]}>
                    Bike (2W)
                  </Text>
                </Pressable>
              </View>

              {/* Make */}
              <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#374151' }]}>Make / Brand</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: isDark ? '#24262D' : '#F9FAFB', borderColor: isDark ? '#373A43' : '#E5E7EB', color: isDark ? '#FFFFFF' : '#101114' }]}
                placeholder="e.g. Hyundai, Honda, Royal Enfield"
                placeholderTextColor="#9CA3AF"
                value={formMake}
                onChangeText={setFormMake}
              />

              {/* Model */}
              <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#374151' }]}>Model</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: isDark ? '#24262D' : '#F9FAFB', borderColor: isDark ? '#373A43' : '#E5E7EB', color: isDark ? '#FFFFFF' : '#101114' }]}
                placeholder="e.g. Creta SX (O), City ZX, Classic 350"
                placeholderTextColor="#9CA3AF"
                value={formModel}
                onChangeText={setFormModel}
              />

              {/* License Plate */}
              <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#374151' }]}>Registration Number (Number Plate)</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: isDark ? '#24262D' : '#F9FAFB', borderColor: isDark ? '#373A43' : '#E5E7EB', color: isDark ? '#FFFFFF' : '#101114' }]}
                placeholder="e.g. MH 02 EE 4092"
                placeholderTextColor="#9CA3AF"
                value={formPlate}
                onChangeText={setFormPlate}
                autoCapitalize="characters"
              />

              {/* Year & Fuel */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#374151' }]}>Year</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: isDark ? '#24262D' : '#F9FAFB', borderColor: isDark ? '#373A43' : '#E5E7EB', color: isDark ? '#FFFFFF' : '#101114' }]}
                    placeholder="2023"
                    placeholderTextColor="#9CA3AF"
                    value={formYear}
                    onChangeText={setFormYear}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#374151' }]}>Color</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: isDark ? '#24262D' : '#F9FAFB', borderColor: isDark ? '#373A43' : '#E5E7EB', color: isDark ? '#FFFFFF' : '#101114' }]}
                    placeholder="Polar White"
                    placeholderTextColor="#9CA3AF"
                    value={formColor}
                    onChangeText={setFormColor}
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActionsRow}>
                <Pressable onPress={() => setIsAddModalOpen(false)} style={styles.modalCancelBtn} disabled={isProcessing}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleSaveAddVehicle} style={styles.modalSaveBtn} disabled={isProcessing}>
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#101114" />
                  ) : (
                    <Text style={styles.modalSaveBtnText}>Save Vehicle</Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* EDIT VEHICLE MODAL                                        */}
      {/* ========================================================= */}
      <Modal
        visible={Boolean(editingVehicle)}
        animationType="slide"
        transparent
        onRequestClose={() => setEditingVehicle(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setEditingVehicle(null)} />
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                borderColor: isDark ? '#2D3139' : '#E5E7EB',
              },
            ]}
          >
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={[styles.modalTitleText, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                  Edit Vehicle Details
                </Text>
                <Text style={styles.modalSubtitleText}>
                  Update registration or vehicle specs
                </Text>
              </View>
              <Pressable onPress={() => setEditingVehicle(null)} hitSlop={8}>
                <Ionicons name="close" size={22} color="#9CA3AF" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalBody}>
              {feedback && (
                <View style={[styles.feedbackBox, feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError]}>
                  <Text style={[styles.feedbackText, { color: feedback.type === 'success' ? '#16A34A' : '#DC2626' }]}>
                    {feedback.message}
                  </Text>
                </View>
              )}

              <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#374151' }]}>Make / Brand</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: isDark ? '#24262D' : '#F9FAFB', borderColor: isDark ? '#373A43' : '#E5E7EB', color: isDark ? '#FFFFFF' : '#101114' }]}
                value={formMake}
                onChangeText={setFormMake}
              />

              <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#374151' }]}>Model</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: isDark ? '#24262D' : '#F9FAFB', borderColor: isDark ? '#373A43' : '#E5E7EB', color: isDark ? '#FFFFFF' : '#101114' }]}
                value={formModel}
                onChangeText={setFormModel}
              />

              <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#374151' }]}>Registration Number</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: isDark ? '#24262D' : '#F9FAFB', borderColor: isDark ? '#373A43' : '#E5E7EB', color: isDark ? '#FFFFFF' : '#101114' }]}
                value={formPlate}
                onChangeText={setFormPlate}
                autoCapitalize="characters"
              />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#374151' }]}>Year</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: isDark ? '#24262D' : '#F9FAFB', borderColor: isDark ? '#373A43' : '#E5E7EB', color: isDark ? '#FFFFFF' : '#101114' }]}
                    value={formYear}
                    onChangeText={setFormYear}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#374151' }]}>Color</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: isDark ? '#24262D' : '#F9FAFB', borderColor: isDark ? '#373A43' : '#E5E7EB', color: isDark ? '#FFFFFF' : '#101114' }]}
                    value={formColor}
                    onChangeText={setFormColor}
                  />
                </View>
              </View>

              <View style={styles.modalActionsRow}>
                <Pressable onPress={() => setEditingVehicle(null)} style={styles.modalCancelBtn} disabled={isProcessing}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleSaveEditVehicle} style={styles.modalSaveBtn} disabled={isProcessing}>
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#101114" />
                  ) : (
                    <Text style={styles.modalSaveBtnText}>Save Changes</Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* DELETE CONFIRMATION DIALOG                                */}
      {/* ========================================================= */}
      <ConfirmationModal
        visible={Boolean(deletingVehicle)}
        title="Delete Vehicle"
        message={`Are you sure you want to remove ${deletingVehicle?.make} ${deletingVehicle?.model} (${deletingVehicle?.licensePlate}) from your garage? This action cannot be undone.`}
        confirmText="Delete Vehicle"
        cancelText="Cancel"
        isDestructive
        isLoading={isProcessing}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingVehicle(null)}
      />
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
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 3,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 32,
  },
  heroLeftCol: {
    flex: 1.3,
    minWidth: 320,
  },
  heroLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  heroLabelText: {
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: ACCENT_YELLOW,
  },
  heroLabelBar: {
    width: 28,
    height: 2,
    backgroundColor: ACCENT_YELLOW,
    borderRadius: 1,
  },
  heroHeadline: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#9CA3AF',
    marginBottom: 24,
    maxWidth: 540,
  },
  highlightsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  highlightText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  heroRightCol: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  heroImageWrapper: {
    width: 380,
    height: 210,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1C1D21',
  },
  heroCarImage: {
    width: '100%',
    height: '100%',
  },
  heroDiagonalAccent: {
    position: 'absolute',
    top: -40,
    right: -40,
  },

  /* SECTION B: REGISTERED VEHICLES SECTION HEADER */
  sectionHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
    flexWrap: 'wrap',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
    minWidth: 280,
  },
  carIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderTitle: {
    fontSize: 17.5,
    fontWeight: '800',
    marginBottom: 2,
  },
  sectionHeaderSub: {
    fontSize: 12.5,
    color: '#6B7280',
  },
  addVehicleBtn: {
    backgroundColor: ACCENT_YELLOW,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 22,
    height: 44,
    borderRadius: 12,
  },
  addVehicleBtnText: {
    color: '#101114',
    fontSize: 14,
    fontWeight: '800',
  },

  /* SECTION C: VEHICLES STACK */
  vehiclesStack: {
    gap: 14,
  },
  vehicleCard: {
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  vehicleCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  vehicleCardRowMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
  },
  vehicleThumbWrapper: {
    width: 100,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleThumbImg: {
    width: '90%',
    height: '90%',
  },
  vehicleDetailsCol: {
    flex: 1,
    minWidth: 260,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  makeModelText: {
    fontSize: 17,
    fontWeight: '700',
  },
  activeBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#B45309',
  },
  licensePlateText: {
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 4,
  },
  specsText: {
    fontSize: 12.5,
    color: '#6B7280',
    marginBottom: 8,
  },
  defaultActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  defaultIndicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  defaultIndicatorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
  },
  setDefaultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  setDefaultBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIconBtn: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },

  /* EMPTY STATE */
  emptyCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
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
  emptyAddBtn: {
    backgroundColor: ACCENT_YELLOW,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  emptyAddBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#101114',
  },

  /* MODALS */
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    padding: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalSheet: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    maxHeight: '90%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(156, 163, 175, 0.2)',
  },
  modalTitleText: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitleText: {
    fontSize: 12.5,
    color: '#9CA3AF',
    marginTop: 2,
  },
  modalBody: {
    paddingTop: 16,
    paddingBottom: 8,
    gap: 10,
  },
  feedbackBox: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
  },
  feedbackSuccess: {
    backgroundColor: '#DCFCE7',
  },
  feedbackError: {
    backgroundColor: '#FEE2E2',
  },
  feedbackText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  typeToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  typeOptionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
  },
  typeOptionActive: {
    backgroundColor: ACCENT_YELLOW,
    borderColor: ACCENT_YELLOW,
  },
  typeOptionInactive: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  typeOptionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  modalCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalSaveBtn: {
    flex: 1.5,
    height: 46,
    borderRadius: 12,
    backgroundColor: ACCENT_YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#101114',
  },
});
