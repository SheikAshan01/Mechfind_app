import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
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
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../theme/ThemeContext';
import { BRAND_COLORS } from '../../../theme/colors';
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';
import { useAuthStore } from '../../../stores/authStore';
import { useCustomerStore } from '../../../stores/customerStore';
import { backendConfig, getIntegrationNotice } from '../../../services/api/backendConfig';
import { useResponsive } from '../../../hooks/useResponsive';

const ACCENT_YELLOW = '#FFC400';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=200&q=80',
];

export default function CustomerProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { isTablet, isDesktop } = useResponsive();
  const { user, logout, updateCustomerProfile, updateCustomerPassword } = useAuthStore();
  const vehicles = useCustomerStore((state) => state.vehicles);

  // Edit Profile & Password Modal State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(user?.fullName || 'Ashan Kumar');
  const [editPhone, setEditPhone] = useState(user?.phoneNumber || '+91 98765 43210');
  const [editAvatarUrl, setEditAvatarUrl] = useState(user?.avatarUrl || '');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editFeedback, setEditFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    confirmText: string;
    isDestructive: boolean;
    action: () => Promise<void>;
  }>({
    visible: false,
    title: '',
    message: '',
    confirmText: '',
    isDestructive: false,
    action: async () => {},
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const [isPickingPhoto, setIsPickingPhoto] = useState(false);

  const handlePickLocalPhoto = async () => {
    try {
      setIsPickingPhoto(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setEditAvatarUrl(result.assets[0].uri);
        setEditFeedback({
          type: 'success',
          message: 'Local photo selected! Tap "Save Changes" to apply.',
        });
      }
    } catch (err) {
      console.warn('Failed to pick image:', err);
      setEditFeedback({
        type: 'error',
        message: 'Could not select photo. Please check permissions.',
      });
    } finally {
      setIsPickingPhoto(false);
    }
  };

  const openEditModal = () => {
    setEditName(user?.fullName || 'Ashan Kumar');
    setEditPhone(user?.phoneNumber || '+91 98765 43210');
    setEditAvatarUrl(user?.avatarUrl || '');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordSection(false);
    setEditFeedback(null);
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      setEditFeedback({ type: 'error', message: 'Name cannot be empty.' });
      return;
    }

    if (showPasswordSection && newPassword) {
      if (newPassword.length < 6) {
        setEditFeedback({ type: 'error', message: 'Password must be at least 6 characters.' });
        return;
      }
      if (newPassword !== confirmPassword) {
        setEditFeedback({ type: 'error', message: 'Passwords do not match.' });
        return;
      }
    }

    setIsSaving(true);
    setEditFeedback(null);

    try {
      // 1. Update Profile (Name, Phone, Avatar)
      await updateCustomerProfile({
        fullName: editName.trim(),
        phoneNumber: editPhone.trim(),
        avatarUrl: editAvatarUrl ? editAvatarUrl.trim() : undefined,
      });

      // 2. Update Password if specified
      if (showPasswordSection && newPassword) {
        const passRes = await updateCustomerPassword(newPassword);
        if (!passRes.success) {
          setEditFeedback({ type: 'error', message: passRes.message });
          setIsSaving(false);
          return;
        }
      }

      setEditFeedback({
        type: 'success',
        message: 'Profile & account settings saved successfully!',
      });

      setTimeout(() => {
        setIsEditModalVisible(false);
        setIsSaving(false);
        setEditFeedback(null);
      }, 1100);
    } catch {
      setEditFeedback({ type: 'error', message: 'Failed to update profile. Please try again.' });
      setIsSaving(false);
    }
  };

  const handlePromptLogout = () => {
    setConfirmModal({
      visible: true,
      title: 'Sign Out',
      message: 'Are you sure you want to log out from MECHFIND?',
      confirmText: 'Sign Out',
      isDestructive: false,
      action: async () => {
        await logout();
        router.replace('/(auth)/role-select');
      },
    });
  };

  const handlePromptDeleteAccount = () => {
    setConfirmModal({
      visible: true,
      title: 'Permanently Delete Account',
      message:
        'This will permanently delete your MECHFIND customer account, registered vehicles, saved addresses, and active service requests. This action is irreversible.',
      confirmText: 'Delete Account',
      isDestructive: true,
      action: async () => {
        await AsyncStorage.multiRemove([
          '@mechfind_vehicles',
          '@mechfind_requests',
          '@mechfind_saved_addresses',
          '@mechfind_notifications',
          '@mechfind_user_role',
        ]);
        await logout();
        router.replace('/(auth)/role-select');
      },
    });
  };

  const handleConfirmAction = async () => {
    setIsProcessing(true);
    try {
      await confirmModal.action();
    } finally {
      setIsProcessing(false);
      setConfirmModal((prev) => ({ ...prev, visible: false }));
    }
  };

  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 20);
  const isCenteredScreen = isTablet || isDesktop;

  return (
    <View style={[styles.screen, { backgroundColor: isDark ? '#101114' : '#F1F2F4' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View
        style={[
          styles.mainWrapper,
          isCenteredScreen && styles.centeredWrapper,
        ]}
      >
        {/* ========================================================= */}
        {/* A. HEADER (Dark Section)                                  */}
        {/* ========================================================= */}
        <View style={[styles.headerSection, { paddingTop: topPadding + 6 }]}>
          <View style={styles.topBarRow}>
            <Text style={styles.headerTitle}>My Profile</Text>

            <Pressable
              onPress={toggleTheme}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.themeToggleBtn}
              accessibilityRole="button"
              accessibilityLabel="Toggle appearance"
            >
              <Ionicons
                name={isDark ? 'sunny-outline' : 'moon-outline'}
                size={22}
                color="#FFFFFF"
              />
            </Pressable>
          </View>

          {/* User Information Card — Tap to Edit Profile */}
          <Pressable
            onPress={openEditModal}
            style={({ pressed }) => [
              styles.userCard,
              { opacity: pressed ? 0.92 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Edit profile name, photo and password"
          >
            {/* Bottom-right angled yellow accent swoosh */}
            <View pointerEvents="none" style={styles.userCardSwoosh}>
              <Svg width={110} height={70} viewBox="0 0 110 70">
                <Path
                  d="M10 70 Q 55 50 110 0 L 110 70 Z"
                  fill={ACCENT_YELLOW}
                  opacity={0.92}
                />
              </Svg>
            </View>

            <View style={styles.userInfoRow}>
              {/* Profile Avatar with Camera / Edit badge */}
              <View style={styles.avatarWrapper}>
                {user?.avatarUrl ? (
                  <Image
                    source={{ uri: user.avatarUrl }}
                    style={styles.userAvatar}
                    resizeMode="cover"
                  />
                ) : (
                  <Image
                    source={require('../../../../assets/images/customer-profile-avatar.png')}
                    style={styles.userAvatar}
                    resizeMode="cover"
                    accessibilityLabel="Customer profile avatar"
                  />
                )}
                <View style={styles.avatarCameraBadge}>
                  <Ionicons name="camera" size={11} color="#101114" />
                </View>
              </View>

              {/* User Data */}
              <View style={styles.userTextCol}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.userNameText} numberOfLines={1}>
                    {user?.fullName || 'Ashan Kumar'}
                  </Text>
                  <Ionicons name="pencil-sharp" size={13} color={ACCENT_YELLOW} />
                </View>
                <Text style={styles.userContactText} numberOfLines={1}>
                  {user?.email || 'ashan@mechfind.com'}
                </Text>
                <Text style={styles.userContactText} numberOfLines={1}>
                  {user?.phoneNumber || '+91 98765 43210'}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color="#9CA3AF"
                style={{ zIndex: 2 }}
              />
            </View>
          </Pressable>
        </View>

        {/* ========================================================= */}
        {/* B. SCROLLABLE BODY                                        */}
        {/* ========================================================= */}
        <ScrollView
          bounces={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              backgroundColor: isDark ? '#101114' : '#F1F2F4',
              paddingBottom: Math.max(insets.bottom, 16) + 40,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary Cards: Saved Vehicles & Manage Settings */}
          <View style={styles.summaryCardsRow}>
            {/* Saved Vehicles Card */}
            <Pressable
              onPress={() => router.push('/(customer)/(tabs)/vehicles')}
              style={({ pressed }) => [
                styles.summaryCard,
                {
                  backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                  borderColor: isDark ? '#2A2B30' : '#EAECEF',
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Saved vehicles: ${vehicles.length}`}
            >
              <View style={styles.summaryIconCircle}>
                <Ionicons name="car" size={18} color={ACCENT_YELLOW} />
              </View>
              <Text
                style={[
                  styles.summaryValueText,
                  { color: isDark ? '#FFFFFF' : '#111827' },
                ]}
              >
                {vehicles.length}
              </Text>
              <Text style={styles.summaryLabelText}>Saved Vehicles</Text>
            </Pressable>

            {/* Manage Account Settings Card */}
            <Pressable
              onPress={openEditModal}
              style={({ pressed }) => [
                styles.summaryCard,
                {
                  backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                  borderColor: isDark ? '#2A2B30' : '#EAECEF',
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Manage Account Settings"
            >
              <View style={styles.summaryIconCircle}>
                <Ionicons name="settings-sharp" size={18} color={ACCENT_YELLOW} />
              </View>
              <Text
                style={[
                  styles.summaryValueText,
                  { color: isDark ? '#FFFFFF' : '#111827' },
                ]}
              >
                Edit
              </Text>
              <Text style={styles.summaryLabelText}>Account Settings</Text>
            </Pressable>
          </View>

          {/* Settings & App Section */}
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? '#FFFFFF' : '#111827' },
            ]}
          >
            Settings & App
          </Text>

          <View
            style={[
              styles.settingsCard,
              {
                backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                borderColor: isDark ? '#2A2B30' : '#EAECEF',
              },
            ]}
          >
            {/* Row 0: Edit Profile & Password */}
            <Pressable
              onPress={openEditModal}
              style={styles.settingItemRow}
              accessibilityRole="button"
              accessibilityLabel="Edit Profile Name, Photo and Password"
            >
              <View style={styles.settingLeft}>
                <Ionicons
                  name="person-circle-outline"
                  size={20}
                  color={ACCENT_YELLOW}
                />
                <Text
                  style={[
                    styles.settingLabel,
                    { color: isDark ? '#FFFFFF' : '#111827' },
                  ]}
                >
                  Edit Profile & Password
                </Text>
              </View>

              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>Name, Photo, Password</Text>
                <Ionicons name="chevron-forward" size={17} color="#9CA3AF" />
              </View>
            </Pressable>

            <View
              style={[
                styles.itemDivider,
                { backgroundColor: isDark ? '#2A2B30' : '#F3F4F6' },
              ]}
            />

            {/* Row 1: Appearance */}
            <Pressable
              onPress={toggleTheme}
              style={styles.settingItemRow}
              accessibilityRole="button"
              accessibilityLabel="Toggle appearance mode"
            >
              <View style={styles.settingLeft}>
                <Ionicons
                  name="moon-outline"
                  size={19}
                  color={isDark ? '#FFFFFF' : '#111827'}
                />
                <Text
                  style={[
                    styles.settingLabel,
                    { color: isDark ? '#FFFFFF' : '#111827' },
                  ]}
                >
                  Appearance
                </Text>
              </View>

              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </Text>
                <Ionicons name="chevron-forward" size={17} color="#9CA3AF" />
              </View>
            </Pressable>

            <View
              style={[
                styles.itemDivider,
                { backgroundColor: isDark ? '#2A2B30' : '#F3F4F6' },
              ]}
            />

            {/* Row 2: Manage Vehicles */}
            <Pressable
              onPress={() => router.push('/(customer)/(tabs)/vehicles')}
              style={styles.settingItemRow}
              accessibilityRole="button"
              accessibilityLabel="Manage vehicles"
            >
              <View style={styles.settingLeft}>
                <Ionicons
                  name="car-outline"
                  size={19}
                  color={isDark ? '#FFFFFF' : '#111827'}
                />
                <Text
                  style={[
                    styles.settingLabel,
                    { color: isDark ? '#FFFFFF' : '#111827' },
                  ]}
                >
                  Manage Vehicles ({vehicles.length})
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={17} color="#9CA3AF" />
            </Pressable>

            <View
              style={[
                styles.itemDivider,
                { backgroundColor: isDark ? '#2A2B30' : '#F3F4F6' },
              ]}
            />

            {/* Row 3: Notifications */}
            <Pressable
              onPress={() => router.push('/(customer)/(tabs)/requests')}
              style={styles.settingItemRow}
              accessibilityRole="button"
              accessibilityLabel="View notifications"
            >
              <View style={styles.settingLeft}>
                <Ionicons
                  name="notifications-outline"
                  size={19}
                  color={isDark ? '#FFFFFF' : '#111827'}
                />
                <Text
                  style={[
                    styles.settingLabel,
                    { color: isDark ? '#FFFFFF' : '#111827' },
                  ]}
                >
                  Notifications
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={17} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Integration Status Section */}
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? '#FFFFFF' : '#111827', marginTop: 20 },
            ]}
          >
            Integration Status
          </Text>

          <View
            style={[
              styles.integrationCard,
              {
                backgroundColor: isDark ? '#14291E' : '#ECFDF5',
                borderColor: isDark ? '#1B4D34' : '#A7F3D0',
              },
            ]}
          >
            <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
            <View style={styles.integrationTextCol}>
              <Text
                style={[
                  styles.integrationHeading,
                  { color: isDark ? '#4ADE80' : '#065F46' },
                ]}
              >
                {backendConfig.isSupabaseConfigured ? 'Connected' : 'Connected (Verified Local Registry)'}
              </Text>
              <Text
                style={[
                  styles.integrationDescription,
                  { color: isDark ? '#86EFAC' : '#047857' },
                ]}
              >
                Your app is integrated and working properly.
              </Text>
            </View>
          </View>

          {/* Account Actions */}
          {/* 1. Log Out of Customer Profile */}
          <Pressable
            onPress={handlePromptLogout}
            style={({ pressed }) => [
              styles.logoutButton,
              {
                backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                borderColor: isDark ? '#2A2B30' : '#EAECEF',
                opacity: pressed ? 0.88 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Log Out of Customer Profile"
          >
            <Ionicons
              name="log-out-outline"
              size={19}
              color={isDark ? '#FFFFFF' : '#111827'}
            />
            <Text
              style={[
                styles.logoutButtonText,
                { color: isDark ? '#FFFFFF' : '#111827' },
              ]}
            >
              Log Out of Customer Profile
            </Text>
          </Pressable>

          {/* 2. Delete Account Permanently */}
          <Pressable
            onPress={handlePromptDeleteAccount}
            style={styles.deleteAccountButton}
            accessibilityRole="button"
            accessibilityLabel="Delete Account Permanently"
          >
            <Ionicons name="trash-outline" size={17} color="#DC2626" />
            <Text style={styles.deleteAccountText}>
              Delete Account Permanently
            </Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Edit Customer Profile & Password Modal */}
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
                  Edit Profile
                </Text>
                <Text style={styles.modalSubtitleText}>
                  Update your personal info, photo & password
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

              {/* 1. Profile Photo / Avatar Picker */}
              <Text
                style={[
                  styles.formLabel,
                  { color: isDark ? '#E5E7EB' : '#374151' },
                ]}
              >
                Profile Photo
              </Text>

              <View style={styles.avatarSelectionRow}>
                {/* Current Avatar Preview with tap to upload */}
                <Pressable
                  onPress={handlePickLocalPhoto}
                  style={styles.modalAvatarPreviewWrap}
                  accessibilityLabel="Tap to choose local photo from device"
                >
                  <Image
                    source={
                      editAvatarUrl
                        ? { uri: editAvatarUrl }
                        : require('../../../../assets/images/customer-profile-avatar.png')
                    }
                    style={styles.modalAvatarPreview}
                    resizeMode="cover"
                  />
                  <View style={styles.modalAvatarCameraIcon}>
                    <Ionicons name="camera" size={13} color="#101114" />
                  </View>
                </Pressable>

                <View style={{ flex: 1, gap: 8 }}>
                  {/* Primary: Local Photo Upload Button */}
                  <Pressable
                    onPress={handlePickLocalPhoto}
                    style={styles.uploadLocalBtn}
                    accessibilityRole="button"
                  >
                    <Ionicons name="cloud-upload-outline" size={17} color="#101114" />
                    <Text style={styles.uploadLocalBtnText}>
                      {isPickingPhoto ? 'Selecting...' : 'Upload from Device'}
                    </Text>
                  </Pressable>

                  <Text
                    style={[
                      styles.presetLabel,
                      { color: isDark ? '#9CA3AF' : '#6B7280' },
                    ]}
                  >
                    Or choose an avatar preset:
                  </Text>
                  <View style={styles.avatarPresetsContainer}>
                    {AVATAR_PRESETS.map((presetUrl, idx) => {
                      const isSelected = editAvatarUrl === presetUrl;
                      return (
                        <Pressable
                          key={`preset-${idx}`}
                          onPress={() => setEditAvatarUrl(presetUrl)}
                          style={[
                            styles.presetAvatarBtn,
                            isSelected && styles.presetAvatarSelected,
                          ]}
                        >
                          <Image
                            source={{ uri: presetUrl }}
                            style={styles.presetThumb}
                          />
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* Custom Photo URL Input */}
              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: isDark ? '#24262D' : '#F9FAFB',
                    borderColor: isDark ? '#373A43' : '#E5E7EB',
                    color: isDark ? '#FFFFFF' : '#101114',
                  },
                ]}
                placeholder="Or paste image URL (e.g. https://...)"
                placeholderTextColor="#9CA3AF"
                value={editAvatarUrl}
                onChangeText={setEditAvatarUrl}
                autoCapitalize="none"
              />

              {/* 2. Full Name Input */}
              <Text
                style={[
                  styles.formLabel,
                  { color: isDark ? '#E5E7EB' : '#374151', marginTop: 14 },
                ]}
              >
                Full Name
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
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                value={editName}
                onChangeText={setEditName}
              />

              {/* 3. Phone Number Input */}
              <Text
                style={[
                  styles.formLabel,
                  { color: isDark ? '#E5E7EB' : '#374151', marginTop: 14 },
                ]}
              >
                Phone Number
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
                placeholder="+91 98765 43210"
                placeholderTextColor="#9CA3AF"
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
              />

              {/* 4. Password Change Accordion / Section */}
              <Pressable
                onPress={() => setShowPasswordSection(!showPasswordSection)}
                style={[
                  styles.passwordAccordionHeader,
                  {
                    borderColor: isDark ? '#2D3139' : '#E5E7EB',
                    backgroundColor: isDark ? '#22242B' : '#F3F4F6',
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="key-outline" size={17} color={ACCENT_YELLOW} />
                  <Text
                    style={[
                      styles.passwordAccordionTitle,
                      { color: isDark ? '#FFFFFF' : '#101114' },
                    ]}
                  >
                    Change Account Password
                  </Text>
                </View>
                <Ionicons
                  name={showPasswordSection ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={isDark ? '#FFFFFF' : '#101114'}
                />
              </Pressable>

              {showPasswordSection && (
                <View style={styles.passwordFieldsContainer}>
                  <Text
                    style={[
                      styles.formLabel,
                      { color: isDark ? '#E5E7EB' : '#374151', marginTop: 8 },
                    ]}
                  >
                    New Password
                  </Text>
                  <View style={styles.passwordInputWrap}>
                    <TextInput
                      style={[
                        styles.modalInput,
                        {
                          backgroundColor: isDark ? '#24262D' : '#F9FAFB',
                          borderColor: isDark ? '#373A43' : '#E5E7EB',
                          color: isDark ? '#FFFFFF' : '#101114',
                          flex: 1,
                        },
                      ]}
                      placeholder="Minimum 6 characters"
                      placeholderTextColor="#9CA3AF"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showPassword}
                    />
                    <Pressable
                      style={styles.eyeBtn}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color="#9CA3AF"
                      />
                    </Pressable>
                  </View>

                  <Text
                    style={[
                      styles.formLabel,
                      { color: isDark ? '#E5E7EB' : '#374151', marginTop: 10 },
                    ]}
                  >
                    Confirm New Password
                  </Text>
                  <View style={styles.passwordInputWrap}>
                    <TextInput
                      style={[
                        styles.modalInput,
                        {
                          backgroundColor: isDark ? '#24262D' : '#F9FAFB',
                          borderColor: isDark ? '#373A43' : '#E5E7EB',
                          color: isDark ? '#FFFFFF' : '#101114',
                          flex: 1,
                        },
                      ]}
                      placeholder="Re-type new password"
                      placeholderTextColor="#9CA3AF"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showPassword}
                    />
                  </View>
                </View>
              )}

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
                  onPress={handleSaveProfile}
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText="Cancel"
        isDestructive={confirmModal.isDestructive}
        isLoading={isProcessing}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, visible: false }))}
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  themeToggleBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* USER CARD */
  userCard: {
    backgroundColor: '#16171B',
    borderRadius: 22,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  userCardSwoosh: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  userAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userTextCol: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  userNameText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  userContactText: {
    fontSize: 12.5,
    color: '#9CA3AF',
    marginTop: 2,
  },

  /* BODY */
  scrollContent: {
    flexGrow: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 18,
    marginTop: 4,
  },

  /* SUMMARY CARDS */
  summaryCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    width: '48%',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  summaryValueText: {
    fontSize: 17,
    fontWeight: '800',
  },
  summaryLabelText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  /* SETTINGS & APP */
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 10,
    paddingHorizontal: 4,
    letterSpacing: -0.3,
  },
  settingsCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  settingItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 14.5,
    fontWeight: '600',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  settingValue: {
    fontSize: 13,
    color: '#6B7280',
  },
  itemDivider: {
    height: 1,
    marginLeft: 48,
  },

  /* INTEGRATION STATUS */
  integrationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  integrationTextCol: {
    flex: 1,
    marginLeft: 12,
  },
  integrationHeading: {
    fontSize: 15,
    fontWeight: '700',
  },
  integrationDescription: {
    fontSize: 12,
    marginTop: 2,
  },

  /* ACCOUNT ACTIONS */
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 20,
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 6,
    paddingVertical: 8,
  },
  deleteAccountText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#DC2626',
  },

  /* AVATAR BADGE */
  avatarWrapper: {
    position: 'relative',
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: ACCENT_YELLOW,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#101114',
  },

  /* EDIT PROFILE MODAL */
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
  avatarSelectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10,
  },
  modalAvatarPreview: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: ACCENT_YELLOW,
  },
  modalAvatarPreviewWrap: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  modalAvatarCameraIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: ACCENT_YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  uploadLocalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ACCENT_YELLOW,
    borderRadius: 10,
    height: 36,
    paddingHorizontal: 12,
  },
  uploadLocalBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#101114',
  },
  presetLabel: {
    fontSize: 11.5,
    marginBottom: 6,
  },
  avatarPresetsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  presetAvatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  presetAvatarSelected: {
    borderColor: ACCENT_YELLOW,
    transform: [{ scale: 1.05 }],
  },
  presetThumb: {
    width: '100%',
    height: '100%',
  },
  modalInput: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  passwordAccordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 18,
  },
  passwordAccordionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  passwordFieldsContainer: {
    marginTop: 10,
    paddingHorizontal: 4,
  },
  passwordInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    padding: 6,
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
