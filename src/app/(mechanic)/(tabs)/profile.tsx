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
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../../theme/ThemeContext';
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';
import { useAuthStore } from '../../../stores/authStore';
import { MechanicUser } from '../../../types/auth';
import { useResponsive } from '../../../hooks/useResponsive';
import { BRAND_COLORS } from '../../../theme/colors';
import { SPACING } from '../../../theme/spacing';

const ACCENT_YELLOW = '#FFC400';

const RADIUS_OPTIONS = [
  { value: 7, label: '⚡ 7 km (Rapid Area)' },
  { value: 15, label: '15 km (Standard)' },
  { value: 25, label: '25 km (Extended)' },
  { value: 50, label: '50 km (Regional)' },
];

export default function MechanicProfileScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme } = useTheme();
  const { horizontalPadding, isTablet, isDesktop } = useResponsive();
  const { user, logout, updateMechanicProfile } = useAuthStore();
  const mechanic = user as MechanicUser | null;

  const [isSignOutModalVisible, setIsSignOutModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Edit Workshop Profile Modal State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editShopName, setEditShopName] = useState(mechanic?.shopName || 'SR Auto Works');
  const [editFullName, setEditFullName] = useState(mechanic?.fullName || 'Ramesh Kumar');
  const [editPhoneNumber, setEditPhoneNumber] = useState(mechanic?.phoneNumber || '+91 98201 12345');
  const [editShopAddress, setEditShopAddress] = useState(mechanic?.shopAddress || 'SV Road, Dindigul, Tamil Nadu');
  const [editServiceRadiusKm, setEditServiceRadiusKm] = useState(mechanic?.serviceRadiusKm || 15);
  const [isSaving, setIsSaving] = useState(false);
  const [editFeedback, setEditFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const openEditModal = () => {
    setEditShopName(mechanic?.shopName || 'SR Auto Works');
    setEditFullName(mechanic?.fullName || 'Ramesh Kumar');
    setEditPhoneNumber(mechanic?.phoneNumber || '+91 98201 12345');
    setEditShopAddress(mechanic?.shopAddress || 'SV Road, Dindigul, Tamil Nadu');
    setEditServiceRadiusKm(mechanic?.serviceRadiusKm || 15);
    setEditFeedback(null);
    setIsEditModalVisible(true);
  };

  const handleSaveWorkshopProfile = async () => {
    if (!editShopName.trim()) {
      setEditFeedback({ type: 'error', message: 'Workshop name cannot be empty.' });
      return;
    }
    if (!editFullName.trim()) {
      setEditFeedback({ type: 'error', message: 'Owner name cannot be empty.' });
      return;
    }

    setIsSaving(true);
    setEditFeedback(null);

    try {
      await updateMechanicProfile({
        shopName: editShopName.trim(),
        fullName: editFullName.trim(),
        phoneNumber: editPhoneNumber.trim(),
        shopAddress: editShopAddress.trim(),
        serviceRadiusKm: editServiceRadiusKm,
      });

      setEditFeedback({
        type: 'success',
        message: 'Workshop profile updated successfully!',
      });

      setTimeout(() => {
        setIsEditModalVisible(false);
        setIsSaving(false);
        setEditFeedback(null);
      }, 1000);
    } catch {
      setEditFeedback({ type: 'error', message: 'Failed to update workshop profile.' });
      setIsSaving(false);
    }
  };

  const handleConfirmLogout = async () => {
    setIsProcessing(true);
    try {
      await logout();
      setIsSignOutModalVisible(false);
      router.replace('/(auth)/role-select');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsProcessing(true);
    try {
      await logout();
      setIsDeleteModalVisible(false);
      router.replace('/(auth)/role-select');
    } finally {
      setIsProcessing(false);
    }
  };

  const shopName = mechanic?.shopName || 'Workshop Partner';
  const ownerSubtitle = mechanic?.fullName
    ? `${mechanic.fullName} • Partner Technician`
    : 'Partner Technician';
  const address = mechanic?.shopAddress || 'SV Road, Dindigul, Tamil Nadu';
  const radius = mechanic?.serviceRadiusKm || 15;

  return (
    <View style={[styles.screen, { backgroundColor: isDark ? '#101114' : '#F1F2F4' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView
        style={[styles.scrollView, { backgroundColor: isDark ? '#101114' : '#F1F2F4' }]}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + SPACING.sm,
            paddingBottom: insets.bottom + 80,
            paddingHorizontal: horizontalPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.container,
            {
              maxWidth: isDesktop ? 1080 : isTablet ? 720 : undefined,
              alignSelf: isTablet || isDesktop ? 'center' : undefined,
              width: isTablet || isDesktop ? '100%' : undefined,
            },
          ]}
        >
          {/* 1. Header with MECHFIND Logo, Notification Bell and Profile Avatar */}
          <View style={styles.headerRow}>
            <Image
              source={require('../../../../assets/images/mechfind-header-logo.png')}
              style={styles.mechfindLogo}
              resizeMode="contain"
              accessibilityLabel="MECHFIND"
            />

            <View style={styles.headerRightActions}>
              <Pressable
                style={[
                  styles.iconCircleBtn,
                  {
                    backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                    borderColor: isDark ? '#2D3139' : '#E5E7EB',
                  },
                ]}
                hitSlop={8}
                onPress={() => router.push('/(mechanic)/(tabs)/requests')}
                accessibilityLabel="Notifications"
              >
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={isDark ? '#FFFFFF' : '#101114'}
                />
                <View style={styles.yellowNotificationDot} />
              </Pressable>

              <Pressable
                style={styles.profileAvatarBtn}
                hitSlop={8}
                accessibilityLabel="My Profile"
              >
                <Ionicons
                  name="person-circle"
                  size={32}
                  color={isDark ? '#FFFFFF' : '#101114'}
                />
              </Pressable>
            </View>
          </View>

          {/* 2. Title Bar: Back Arrow, "Workshop Profile", Moon / Theme Toggle */}
          <View style={styles.titleBarRow}>
            <View style={styles.titleLeftGroup}>
              <Pressable
                onPress={() => {
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.push('/(mechanic)/(tabs)');
                  }
                }}
                hitSlop={8}
                style={styles.backBtn}
                accessibilityLabel="Go back"
              >
                <Ionicons
                  name="arrow-back"
                  size={22}
                  color={isDark ? '#FFFFFF' : '#101114'}
                />
              </Pressable>
              <Text
                style={[
                  styles.pageTitle,
                  { color: isDark ? '#FFFFFF' : '#101114' },
                ]}
              >
                Workshop Profile
              </Text>
            </View>

            <Pressable
              style={[
                styles.themeToggleBtn,
                {
                  backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                  borderColor: isDark ? '#2D3139' : '#E5E7EB',
                },
              ]}
              onPress={toggleTheme}
              hitSlop={8}
              accessibilityLabel="Toggle Theme"
            >
              <Ionicons
                name={isDark ? 'moon' : 'sunny'}
                size={19}
                color={isDark ? '#FFFFFF' : '#101114'}
              />
            </Pressable>
          </View>

          {/* 3. Workshop Profile Banner Card */}
          <Pressable
            onPress={openEditModal}
            style={({ pressed }) => [
              styles.bannerCardWrap,
              {
                backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                borderColor: isDark ? '#2D3139' : '#E5E7EB',
                borderWidth: isDark ? 1 : 0,
                opacity: pressed ? 0.94 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Edit Workshop Profile"
          >
            <Image
              source={require('../../../../assets/images/workshop-garage-hero.png')}
              style={styles.bannerCoverImg}
              resizeMode="cover"
            />
            <View
              style={[
                styles.bannerInfoBox,
                { backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF' },
              ]}
            >
              <View style={styles.shopNameRow}>
                <Text
                  style={[
                    styles.shopNameText,
                    { color: isDark ? '#FFFFFF' : '#101114' },
                  ]}
                  numberOfLines={1}
                >
                  {shopName}
                </Text>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={BRAND_COLORS.successGreen}
                  style={{ marginLeft: 6 }}
                />
                <View style={styles.editPencilBadge}>
                  <Ionicons name="create" size={13} color="#101114" />
                </View>
              </View>
              <Text
                style={[
                  styles.partnerRoleText,
                  { color: isDark ? '#9CA3AF' : '#747B87' },
                ]}
              >
                {ownerSubtitle}
              </Text>
            </View>
          </Pressable>

          {/* 4. Workshop Details Section */}
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeaderBetween}>
              <Text
                style={[
                  styles.sectionHeading,
                  { color: isDark ? '#FFFFFF' : '#101114' },
                ]}
              >
                Workshop Details
              </Text>
              <Pressable
                onPress={openEditModal}
                style={styles.editDetailsPill}
                accessibilityRole="button"
                accessibilityLabel="Edit Workshop Details"
              >
                <Ionicons name="create-outline" size={13} color="#101114" />
                <Text style={styles.editDetailsPillText}>Edit Details</Text>
              </Pressable>
            </View>

            <View
              style={[
                styles.cardWhite,
                {
                  backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                  borderColor: isDark ? '#2D3139' : '#E5E7EB',
                  borderWidth: isDark ? 1 : 0,
                },
              ]}
            >
              {/* Workshop Location */}
              <Pressable
                style={styles.detailRow}
                onPress={openEditModal}
                accessibilityRole="button"
              >
                <View
                  style={[
                    styles.detailIconBox,
                    { backgroundColor: isDark ? '#222328' : '#F3F4F6' },
                  ]}
                >
                  <Ionicons
                    name="location-outline"
                    size={19}
                    color={isDark ? '#FFC400' : '#101114'}
                  />
                </View>
                <View style={styles.detailInfoCol}>
                  <Text
                    style={[
                      styles.detailTitleText,
                      { color: isDark ? '#FFFFFF' : '#101114' },
                    ]}
                  >
                    Workshop Location
                  </Text>
                  <Text
                    style={[
                      styles.detailSubtitleText,
                      { color: isDark ? '#9CA3AF' : '#747B87' },
                    ]}
                    numberOfLines={2}
                  >
                    {address}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={isDark ? '#9CA3AF' : '#9CA3AF'}
                />
              </Pressable>

              <View
                style={[
                  styles.cardDivider,
                  { backgroundColor: isDark ? '#2D3139' : '#F3F4F6' },
                ]}
              />

              {/* Operating Hours */}
              <View style={styles.detailRow}>
                <View
                  style={[
                    styles.detailIconBox,
                    { backgroundColor: isDark ? '#222328' : '#F3F4F6' },
                  ]}
                >
                  <Ionicons
                    name="time-outline"
                    size={19}
                    color={isDark ? '#FFC400' : '#101114'}
                  />
                </View>
                <View style={styles.detailInfoCol}>
                  <Text
                    style={[
                      styles.detailTitleText,
                      { color: isDark ? '#FFFFFF' : '#101114' },
                    ]}
                  >
                    Operating Hours
                  </Text>
                  <Text
                    style={[
                      styles.detailSubtitleText,
                      { color: isDark ? '#9CA3AF' : '#747B87' },
                    ]}
                  >
                    Mon – Sat, 9:00 AM – 7:00 PM
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={isDark ? '#9CA3AF' : '#9CA3AF'}
                />
              </View>

              <View
                style={[
                  styles.cardDivider,
                  { backgroundColor: isDark ? '#2D3139' : '#F3F4F6' },
                ]}
              />

              {/* Service Radius */}
              <Pressable
                style={styles.detailRow}
                onPress={openEditModal}
                accessibilityRole="button"
              >
                <View
                  style={[
                    styles.detailIconBox,
                    { backgroundColor: isDark ? '#222328' : '#F3F4F6' },
                  ]}
                >
                  <Ionicons
                    name="navigate-outline"
                    size={19}
                    color={isDark ? '#FFC400' : '#101114'}
                  />
                </View>
                <View style={styles.detailInfoCol}>
                  <Text
                    style={[
                      styles.detailTitleText,
                      { color: isDark ? '#FFFFFF' : '#101114' },
                    ]}
                  >
                    Service Radius
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {radius <= 7 && (
                    <View style={styles.badge7Km}>
                      <Text style={styles.badge7KmText}>⚡ 7 km</Text>
                    </View>
                  )}
                  <Text
                    style={[
                      styles.radiusValueText,
                      { color: isDark ? '#9CA3AF' : '#747B87' },
                    ]}
                  >
                    {radius} km
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={isDark ? '#9CA3AF' : '#9CA3AF'}
                  />
                </View>
              </Pressable>
            </View>
          </View>

          {/* 5. Manage Section */}
          <View style={styles.sectionWrap}>
            <Text
              style={[
                styles.sectionHeading,
                { color: isDark ? '#FFFFFF' : '#101114' },
              ]}
            >
              Manage
            </Text>

            <View
              style={[
                styles.cardWhite,
                {
                  backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                  borderColor: isDark ? '#2D3139' : '#E5E7EB',
                  borderWidth: isDark ? 1 : 0,
                },
              ]}
            >
              {/* Edit Workshop Profile & Radius */}
              <Pressable
                style={styles.manageRow}
                onPress={openEditModal}
                hitSlop={4}
                accessibilityRole="button"
                accessibilityLabel="Edit Workshop Profile and Service Radius"
              >
                <View style={styles.manageLeftGroup}>
                  <View
                    style={[
                      styles.manageIconBox,
                      { backgroundColor: isDark ? '#222328' : '#F3F4F6' },
                    ]}
                  >
                    <Ionicons
                      name="create-outline"
                      size={18}
                      color={ACCENT_YELLOW}
                    />
                  </View>
                  <Text
                    style={[
                      styles.manageTitleText,
                      { color: isDark ? '#FFFFFF' : '#101114' },
                    ]}
                  >
                    Edit Workshop Profile & Radius
                  </Text>
                </View>
                <View style={styles.appearanceRightRow}>
                  <Text
                    style={[
                      styles.appearanceModeText,
                      { color: isDark ? '#9CA3AF' : '#747B87' },
                    ]}
                  >
                    {radius} km
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={isDark ? '#9CA3AF' : '#9CA3AF'}
                  />
                </View>
              </Pressable>

              <View
                style={[
                  styles.cardDivider,
                  { backgroundColor: isDark ? '#2D3139' : '#F3F4F6' },
                ]}
              />

              {/* Services & Pricing */}
              <Pressable
                style={styles.manageRow}
                onPress={() => router.push('/(mechanic)/services-pricing')}
                hitSlop={4}
              >
                <View style={styles.manageLeftGroup}>
                  <View
                    style={[
                      styles.manageIconBox,
                      { backgroundColor: isDark ? '#222328' : '#F3F4F6' },
                    ]}
                  >
                    <Ionicons
                      name="build-outline"
                      size={18}
                      color={isDark ? '#FFC400' : '#101114'}
                    />
                  </View>
                  <Text
                    style={[
                      styles.manageTitleText,
                      { color: isDark ? '#FFFFFF' : '#101114' },
                    ]}
                  >
                    Services & Pricing
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={isDark ? '#9CA3AF' : '#9CA3AF'}
                />
              </Pressable>

              <View
                style={[
                  styles.cardDivider,
                  { backgroundColor: isDark ? '#2D3139' : '#F3F4F6' },
                ]}
              />

              {/* Documents & Verification */}
              <Pressable
                style={styles.manageRow}
                onPress={() => router.push('/(mechanic)/verification-status')}
                hitSlop={4}
              >
                <View style={styles.manageLeftGroup}>
                  <View
                    style={[
                      styles.manageIconBox,
                      { backgroundColor: isDark ? '#222328' : '#F3F4F6' },
                    ]}
                  >
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={18}
                      color={isDark ? '#FFC400' : '#101114'}
                    />
                  </View>
                  <Text
                    style={[
                      styles.manageTitleText,
                      { color: isDark ? '#FFFFFF' : '#101114' },
                    ]}
                  >
                    Documents & Verification
                  </Text>
                </View>
                <View style={styles.verifiedBadgeRow}>
                  <View style={styles.verifiedPill}>
                    <Text style={styles.verifiedPillText}>Verified</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={isDark ? '#9CA3AF' : '#9CA3AF'}
                  />
                </View>
              </Pressable>

              <View
                style={[
                  styles.cardDivider,
                  { backgroundColor: isDark ? '#2D3139' : '#F3F4F6' },
                ]}
              />

              {/* Appearance */}
              <Pressable
                style={styles.manageRow}
                onPress={toggleTheme}
                hitSlop={4}
              >
                <View style={styles.manageLeftGroup}>
                  <View
                    style={[
                      styles.manageIconBox,
                      { backgroundColor: isDark ? '#222328' : '#F3F4F6' },
                    ]}
                  >
                    <Ionicons
                      name={isDark ? 'moon-outline' : 'sunny-outline'}
                      size={18}
                      color={isDark ? '#FFC400' : '#101114'}
                    />
                  </View>
                  <Text
                    style={[
                      styles.manageTitleText,
                      { color: isDark ? '#FFFFFF' : '#101114' },
                    ]}
                  >
                    Appearance
                  </Text>
                </View>
                <View style={styles.appearanceRightRow}>
                  <Text
                    style={[
                      styles.appearanceModeText,
                      { color: isDark ? '#9CA3AF' : '#747B87' },
                    ]}
                  >
                    {isDark ? 'Dark Mode' : 'Light Mode'}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={isDark ? '#9CA3AF' : '#9CA3AF'}
                  />
                </View>
              </Pressable>

              <View
                style={[
                  styles.cardDivider,
                  { backgroundColor: isDark ? '#2D3139' : '#F3F4F6' },
                ]}
              />

              {/* Sign Out (Red) */}
              <Pressable
                style={styles.manageRow}
                onPress={() => setIsSignOutModalVisible(true)}
                hitSlop={4}
              >
                <View style={styles.manageLeftGroup}>
                  <View style={styles.manageIconBoxRed}>
                    <Ionicons name="log-out-outline" size={19} color="#DC2626" />
                  </View>
                  <Text style={styles.signOutTitleText}>Sign Out</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#DC2626" />
              </Pressable>

              <View
                style={[
                  styles.cardDivider,
                  { backgroundColor: isDark ? '#2D3139' : '#F3F4F6' },
                ]}
              />

              {/* Delete Workshop Account (Red) */}
              <Pressable
                style={styles.manageRow}
                onPress={() => setIsDeleteModalVisible(true)}
                hitSlop={4}
              >
                <View style={styles.manageLeftGroup}>
                  <View style={styles.manageIconBoxRed}>
                    <Ionicons name="trash-outline" size={19} color="#DC2626" />
                  </View>
                  <Text style={styles.deleteTitleText}>
                    Delete Workshop Account
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#DC2626" />
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Edit Workshop Profile & Service Radius Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setIsEditModalVisible(false)}
          />

          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                borderColor: isDark ? '#2D3139' : '#E5E7EB',
                maxHeight: '90%',
              },
            ]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeaderRow}>
              <View>
                <Text
                  style={[
                    styles.modalTitleText,
                    { color: isDark ? '#FFFFFF' : '#101114' },
                  ]}
                >
                  Edit Workshop Profile
                </Text>
                <Text style={styles.modalSubtitleText}>
                  Update garage info, contact & service radius
                </Text>
              </View>

              <Pressable
                onPress={() => setIsEditModalVisible(false)}
                hitSlop={8}
                style={styles.modalCloseBtn}
                accessibilityLabel="Close"
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={isDark ? '#9CA3AF' : '#6B7280'}
                />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              {/* Feedback Alert if any */}
              {editFeedback && (
                <View
                  style={[
                    styles.feedbackBanner,
                    editFeedback.type === 'success'
                      ? styles.feedbackBannerSuccess
                      : styles.feedbackBannerError,
                  ]}
                >
                  <Ionicons
                    name={
                      editFeedback.type === 'success'
                        ? 'checkmark-circle'
                        : 'alert-circle'
                    }
                    size={18}
                    color={
                      editFeedback.type === 'success' ? '#16A34A' : '#DC2626'
                    }
                  />
                  <Text
                    style={[
                      styles.feedbackBannerText,
                      {
                        color:
                          editFeedback.type === 'success' ? '#16A34A' : '#DC2626',
                      },
                    ]}
                  >
                    {editFeedback.message}
                  </Text>
                </View>
              )}

              {/* 1. Workshop Name */}
              <Text
                style={[
                  styles.formLabel,
                  { color: isDark ? '#E5E7EB' : '#374151' },
                ]}
              >
                Workshop / Business Name
              </Text>
              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: isDark ? '#24262D' : '#F9FAFB',
                    borderColor: isDark ? '#373A43' : '#E5E7EB',
                    color: isDark ? '#FFFFFF' : '#101114',
                  },
                ]}
                placeholder="e.g. SR Auto Works"
                placeholderTextColor="#9CA3AF"
                value={editShopName}
                onChangeText={setEditShopName}
              />

              {/* 2. Owner / Lead Technician Name */}
              <Text
                style={[
                  styles.formLabel,
                  { color: isDark ? '#E5E7EB' : '#374151', marginTop: 14 },
                ]}
              >
                Owner / Lead Technician Name
              </Text>
              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: isDark ? '#24262D' : '#F9FAFB',
                    borderColor: isDark ? '#373A43' : '#E5E7EB',
                    color: isDark ? '#FFFFFF' : '#101114',
                  },
                ]}
                placeholder="e.g. Ramesh Kumar"
                placeholderTextColor="#9CA3AF"
                value={editFullName}
                onChangeText={setEditFullName}
              />

              {/* 3. Phone Number */}
              <Text
                style={[
                  styles.formLabel,
                  { color: isDark ? '#E5E7EB' : '#374151', marginTop: 14 },
                ]}
              >
                Workshop Phone Number
              </Text>
              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: isDark ? '#24262D' : '#F9FAFB',
                    borderColor: isDark ? '#373A43' : '#E5E7EB',
                    color: isDark ? '#FFFFFF' : '#101114',
                  },
                ]}
                placeholder="+91 98201 12345"
                placeholderTextColor="#9CA3AF"
                value={editPhoneNumber}
                onChangeText={setEditPhoneNumber}
                keyboardType="phone-pad"
              />

              {/* 4. Workshop Address */}
              <Text
                style={[
                  styles.formLabel,
                  { color: isDark ? '#E5E7EB' : '#374151', marginTop: 14 },
                ]}
              >
                Workshop Address
              </Text>
              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: isDark ? '#24262D' : '#F9FAFB',
                    borderColor: isDark ? '#373A43' : '#E5E7EB',
                    color: isDark ? '#FFFFFF' : '#101114',
                  },
                ]}
                placeholder="e.g. SV Road, Dindigul, Tamil Nadu"
                placeholderTextColor="#9CA3AF"
                value={editShopAddress}
                onChangeText={setEditShopAddress}
              />

              {/* 5. Service Radius Selection */}
              <Text
                style={[
                  styles.formLabel,
                  { color: isDark ? '#E5E7EB' : '#374151', marginTop: 14 },
                ]}
              >
                Roadside Dispatch Radius
              </Text>
              <View style={styles.radiusOptionsGrid}>
                {RADIUS_OPTIONS.map((opt) => {
                  const isSelected = editServiceRadiusKm === opt.value;
                  return (
                    <Pressable
                      key={`radius-${opt.value}`}
                      onPress={() => setEditServiceRadiusKm(opt.value)}
                      style={[
                        styles.radiusChipBtn,
                        {
                          backgroundColor: isSelected
                            ? ACCENT_YELLOW
                            : isDark
                            ? '#24262D'
                            : '#F3F4F6',
                          borderColor: isSelected
                            ? ACCENT_YELLOW
                            : isDark
                            ? '#373A43'
                            : '#E5E7EB',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.radiusChipText,
                          {
                            color: isSelected
                              ? '#101114'
                              : isDark
                              ? '#E5E7EB'
                              : '#1F2937',
                            fontWeight: isSelected ? '700' : '600',
                          },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Modal Action Buttons */}
              <View style={styles.modalActionsRow}>
                <Pressable
                  onPress={() => setIsEditModalVisible(false)}
                  style={[
                    styles.modalCancelBtn,
                    {
                      borderColor: isDark ? '#373A43' : '#E5E7EB',
                    },
                  ]}
                  disabled={isSaving}
                >
                  <Text
                    style={[
                      styles.modalCancelBtnText,
                      { color: isDark ? '#9CA3AF' : '#6B7280' },
                    ]}
                  >
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleSaveWorkshopProfile}
                  style={styles.modalSaveBtn}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#101114" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-sharp" size={17} color="#101114" />
                      <Text style={styles.modalSaveBtnText}>Save Changes</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Sign Out Modal */}
      <ConfirmationModal
        visible={isSignOutModalVisible}
        title="Sign Out"
        message="Are you sure you want to sign out of your partner mechanic session?"
        confirmText="Sign Out"
        cancelText="Stay Signed In"
        isDestructive
        isLoading={isProcessing}
        onConfirm={handleConfirmLogout}
        onCancel={() => setIsSignOutModalVisible(false)}
      />

      {/* Delete Account Modal */}
      <ConfirmationModal
        visible={isDeleteModalVisible}
        title="Delete Workshop Account"
        message="This action is permanent and cannot be undone. All active jobs, documents, and historical payouts will be permanently wiped from local cache and cloud storage."
        confirmText="Delete Account Permanently"
        cancelText="Keep Account"
        isDestructive
        isLoading={isProcessing}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  container: {
    width: '100%',
  },
  // 1. Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingTop: 4,
  },
  mechfindLogo: {
    width: 140,
    height: 38,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  yellowNotificationDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FFC400',
  },
  profileAvatarBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 2. Title Bar
  titleBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  titleLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  themeToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  // 3. Workshop Banner Card
  bannerCardWrap: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  bannerCoverImg: {
    width: '100%',
    height: 135,
  },
  bannerInfoBox: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  shopNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  shopNameText: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  partnerRoleText: {
    fontSize: 13,
    fontWeight: '500',
  },
  // 4. Section Wrappers
  sectionWrap: {
    marginBottom: SPACING.lg,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: SPACING.sm,
  },
  cardWhite: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  // Detail Row
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  detailIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailInfoCol: {
    flex: 1,
    minWidth: 0,
  },
  detailTitleText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  detailSubtitleText: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  radiusValueText: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardDivider: {
    height: 1,
  },
  // Manage Row
  manageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  manageLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  manageIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageIconBoxRed: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
  },
  manageTitleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  verifiedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifiedPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
  },
  verifiedPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  appearanceRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appearanceModeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  signOutTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  deleteTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },

  /* WORKSHOP EDIT BADGE & PILLS */
  editPencilBadge: {
    backgroundColor: ACCENT_YELLOW,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  editDetailsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: ACCENT_YELLOW,
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  editDetailsPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#101114',
  },
  badge7Km: {
    backgroundColor: ACCENT_YELLOW,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badge7KmText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#101114',
  },

  /* EDIT WORKSHOP MODAL */
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    paddingHorizontal: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 14,
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
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScrollContent: {
    paddingTop: 14,
    paddingBottom: 20,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  feedbackBannerSuccess: {
    backgroundColor: '#DCFCE7',
  },
  feedbackBannerError: {
    backgroundColor: '#FEE2E2',
  },
  feedbackBannerText: {
    fontSize: 12.5,
    fontWeight: '600',
    flex: 1,
  },
  formLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  modalInput: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  radiusOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radiusChipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  radiusChipText: {
    fontSize: 12,
  },
  modalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 22,
  },
  modalCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalSaveBtn: {
    flex: 1.6,
    height: 48,
    borderRadius: 14,
    backgroundColor: ACCENT_YELLOW,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  modalSaveBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#101114',
  },
});
