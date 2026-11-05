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
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuthStore } from '../../../stores/authStore';
import { useCustomerStore } from '../../../stores/customerStore';
import { useResponsive } from '../../../hooks/useResponsive';
import { WebFooter } from '../../../components/navigation/WebFooter';

const ACCENT_YELLOW = '#FFC400';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=200&q=80',
];

export default function CustomerProfileWebScreen() {
  const { isDark, toggleTheme } = useTheme();
  const { width } = useResponsive();
  const isDesktop = width >= 1024;
  const isMobile = width < 768;

  const { user, logout, updateCustomerProfile, updateCustomerPassword } = useAuthStore();
  const vehicles = useCustomerStore((state) => state.vehicles);
  const requests = useCustomerStore((state) => state.requests);
  const activeBookingsCount = requests?.filter((r) => r.status !== 'completed' && r.status !== 'cancelled').length || 0;

  // Edit Profile Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(user?.fullName || 'Customer');
  const [editPhone, setEditPhone] = useState(user?.phoneNumber || '+91 98765 43210');
  const [editAvatarUrl, setEditAvatarUrl] = useState(user?.avatarUrl || '');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPickingPhoto, setIsPickingPhoto] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Confirmation Modals
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const handlePickLocalPhoto = async () => {
    try {
      setIsPickingPhoto(true);
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        alert('Permission needed to access photo library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const localUri = result.assets[0].uri;
        setEditAvatarUrl(localUri);
        await updateCustomerProfile({ avatarUrl: localUri });
        setFeedbackMsg({ type: 'success', text: 'Profile photo updated successfully!' });
        setTimeout(() => setFeedbackMsg(null), 3500);
      }
    } catch {
      alert('Could not pick image.');
    } finally {
      setIsPickingPhoto(false);
    }
  };

  const handleOpenEdit = () => {
    setEditName(user?.fullName || 'Customer');
    setEditPhone(user?.phoneNumber || '+91 98765 43210');
    setEditAvatarUrl(user?.avatarUrl || '');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordSection(false);
    setFeedbackMsg(null);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Name cannot be empty.' });
      return;
    }

    if (showPasswordSection && newPassword) {
      if (newPassword.length < 6) {
        setFeedbackMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
        return;
      }
      if (newPassword !== confirmPassword) {
        setFeedbackMsg({ type: 'error', text: 'Passwords do not match.' });
        return;
      }
    }

    setIsSaving(true);
    try {
      await updateCustomerProfile({
        fullName: editName.trim(),
        phoneNumber: editPhone.trim(),
        avatarUrl: editAvatarUrl ? editAvatarUrl.trim() : undefined,
      });

      if (showPasswordSection && newPassword) {
        const passRes = await updateCustomerPassword(newPassword);
        if (!passRes.success) {
          setFeedbackMsg({ type: 'error', text: passRes.message });
          setIsSaving(false);
          return;
        }
      }

      setFeedbackMsg({ type: 'success', text: 'Profile changes saved successfully!' });
      setTimeout(() => {
        setIsEditModalOpen(false);
        setFeedbackMsg(null);
      }, 1500);
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmLogout = async () => {
    setLogoutModalOpen(false);
    await logout();
    router.replace('/(auth)/role-select');
  };

  return (
    <ScrollView
      style={[styles.pageRoot, { backgroundColor: isDark ? '#101114' : '#F5F6F8' }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Main Container */}
      <View style={styles.contentContainer}>
        {/* Toast Feedback */}
        {feedbackMsg && (
          <View
            style={[
              styles.feedbackBanner,
              feedbackMsg.type === 'success' ? styles.feedbackSuccess : styles.feedbackError,
            ]}
          >
            <Ionicons
              name={feedbackMsg.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
              size={18}
              color={feedbackMsg.type === 'success' ? '#15803D' : '#DC2626'}
              style={{ marginRight: 8 }}
            />
            <Text
              style={[
                styles.feedbackText,
                { color: feedbackMsg.type === 'success' ? '#15803D' : '#DC2626' },
              ]}
            >
              {feedbackMsg.text}
            </Text>
          </View>
        )}

        {/* Page Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.pageTitle, { color: isDark ? '#FFFFFF' : '#101114' }]}>
              My Profile & Account
            </Text>
            <Text style={styles.pageSubtitle}>
              Manage your personal information, vehicles, bookings, and password security.
            </Text>
          </View>

          <Pressable onPress={handleOpenEdit} style={styles.editProfileBtn}>
            <Ionicons name="pencil" size={15} color="#101114" style={{ marginRight: 6 }} />
            <Text style={styles.editProfileBtnText}>Edit Profile</Text>
          </Pressable>
        </View>

        {/* Main Grid: User Profile Card + Quick Summary */}
        <View style={[styles.profileLayoutGrid, isDesktop ? styles.gridRow : styles.gridCol]}>
          {/* Left: User Profile Hero Card */}
          <View
            style={[
              styles.userProfileCard,
              {
                backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                borderColor: isDark ? '#23252B' : '#E5E7EB',
                flex: isDesktop ? 6 : 1,
              },
            ]}
          >
            <View style={styles.userAvatarRow}>
              {/* Profile Avatar with Photo Picker Button */}
              <View style={styles.avatarWrap}>
                {user?.avatarUrl ? (
                  <Image source={{ uri: user.avatarUrl }} style={styles.avatarImg} resizeMode="cover" />
                ) : (
                  <Image
                    source={require('../../../../assets/images/customer-profile-avatar.png')}
                    style={styles.avatarImg}
                    resizeMode="cover"
                  />
                )}
                <Pressable
                  onPress={handlePickLocalPhoto}
                  style={styles.cameraBadgeBtn}
                  accessibilityLabel="Upload local photo"
                >
                  {isPickingPhoto ? (
                    <ActivityIndicator size="small" color="#101114" />
                  ) : (
                    <Ionicons name="camera" size={14} color="#101114" />
                  )}
                </Pressable>
              </View>

              <View style={styles.userInfoCol}>
                <View style={styles.nameVerifiedRow}>
                  <Text style={[styles.userName, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                    {user?.fullName || 'Ashan Kumar'}
                  </Text>
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="shield-checkmark" size={12} color="#15803D" style={{ marginRight: 4 }} />
                    <Text style={styles.verifiedBadgeText}>Verified Customer</Text>
                  </View>
                </View>
                <Text style={styles.userEmail}>{user?.email || 'customer@mechfind.app'}</Text>
                <Text style={styles.userPhone}>{user?.phoneNumber || '+91 98765 43210'}</Text>

                <Pressable onPress={handlePickLocalPhoto} style={styles.uploadPhotoLink}>
                  <Ionicons name="cloud-upload-outline" size={14} color={ACCENT_YELLOW} style={{ marginRight: 4 }} />
                  <Text style={styles.uploadPhotoLinkText}>Upload Photo from Device</Text>
                </Pressable>
              </View>
            </View>

            {/* Quick Details List */}
            <View style={styles.cardDivider} />
            <View style={styles.detailsList}>
              <View style={styles.detailItem}>
                <Ionicons name="person-outline" size={16} color="#9CA3AF" style={{ marginRight: 10 }} />
                <Text style={styles.detailLabel}>Account Role:</Text>
                <Text style={[styles.detailValue, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                  MECHFIND Customer
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={16} color="#9CA3AF" style={{ marginRight: 10 }} />
                <Text style={styles.detailLabel}>Default City:</Text>
                <Text style={[styles.detailValue, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                  Dindigul / Tamil Nadu
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="call-outline" size={16} color="#9CA3AF" style={{ marginRight: 10 }} />
                <Text style={styles.detailLabel}>Emergency Contact:</Text>
                <Text style={[styles.detailValue, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                  +91 98765 43210
                </Text>
              </View>
            </View>
          </View>

          {/* Right: Quick Stats & Shortcuts */}
          <View style={[styles.quickStatsCol, { flex: isDesktop ? 4 : 1 }]}>
            {/* Registered Vehicles */}
            <Pressable
              onPress={() => router.push('/(customer)/(tabs)/vehicles')}
              style={[
                styles.summaryCard,
                {
                  backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                  borderColor: isDark ? '#23252B' : '#E5E7EB',
                },
              ]}
            >
              <View style={[styles.summaryIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="car-sport" size={20} color="#B45309" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryLabel}>Registered Vehicles</Text>
                <Text style={[styles.summaryCount, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                  {vehicles?.length || 3} Vehicles
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </Pressable>

            {/* Service Bookings */}
            <Pressable
              onPress={() => router.push('/(customer)/(tabs)/requests')}
              style={[
                styles.summaryCard,
                {
                  backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                  borderColor: isDark ? '#23252B' : '#E5E7EB',
                },
              ]}
            >
              <View style={[styles.summaryIconBox, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="calendar" size={20} color="#1D4ED8" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryLabel}>Service Bookings</Text>
                <Text style={[styles.summaryCount, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                  {activeBookingsCount > 0 ? `${activeBookingsCount} Active` : '3 Total Bookings'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </Pressable>

            {/* Account Sign Out Action */}
            <Pressable
              onPress={() => setLogoutModalOpen(true)}
              style={[
                styles.summaryCard,
                {
                  backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                  borderColor: 'rgba(239, 68, 68, 0.25)',
                },
              ]}
            >
              <View style={[styles.summaryIconBox, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="log-out-outline" size={20} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.summaryLabel, { color: '#DC2626' }]}>Account Session</Text>
                <Text style={[styles.summaryCount, { color: '#DC2626', fontSize: 14 }]}>
                  Sign Out from Customer App
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={18} color="#DC2626" />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Edit Profile & Password Modal */}
      {isEditModalOpen && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={() => setIsEditModalOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.modalCard,
                { backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF' },
              ]}
            >
              <View style={styles.modalHeaderRow}>
                <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                  Edit Profile & Password
                </Text>
                <Pressable onPress={() => setIsEditModalOpen(false)}>
                  <Ionicons name="close" size={20} color="#747B87" />
                </Pressable>
              </View>

              {/* Photo Upload Section */}
              <View style={styles.modalPhotoRow}>
                <View style={styles.modalAvatarBox}>
                  {editAvatarUrl ? (
                    <Image source={{ uri: editAvatarUrl }} style={styles.modalAvatarImg} resizeMode="cover" />
                  ) : (
                    <Image
                      source={require('../../../../assets/images/customer-profile-avatar.png')}
                      style={styles.modalAvatarImg}
                      resizeMode="cover"
                    />
                  )}
                </View>

                <View style={{ flex: 1, gap: 8 }}>
                  <Pressable onPress={handlePickLocalPhoto} style={styles.pickPhotoBtn}>
                    <Ionicons name="camera-outline" size={16} color="#101114" style={{ marginRight: 6 }} />
                    <Text style={styles.pickPhotoBtnText}>Upload Local Photo</Text>
                  </Pressable>
                  <Text style={styles.presetLabel}>Or pick avatar:</Text>
                  <View style={styles.presetsRow}>
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <Pressable
                        key={idx}
                        onPress={() => setEditAvatarUrl(preset)}
                        style={[
                          styles.presetCircle,
                          editAvatarUrl === preset && styles.presetCircleSelected,
                        ]}
                      >
                        <Image source={{ uri: preset }} style={styles.presetImg} />
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>

              {/* Name & Phone Fields */}
              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? '#FFFFFF' : '#101114' }]}>Full Name</Text>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: isDark ? '#16171B' : '#F9FAFB',
                      borderColor: isDark ? '#2B2D35' : '#E5E7EB',
                      color: isDark ? '#FFFFFF' : '#101114',
                    },
                  ]}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? '#FFFFFF' : '#101114' }]}>Phone Number</Text>
                <TextInput
                  value={editPhone}
                  onChangeText={setEditPhone}
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: isDark ? '#16171B' : '#F9FAFB',
                      borderColor: isDark ? '#2B2D35' : '#E5E7EB',
                      color: isDark ? '#FFFFFF' : '#101114',
                    },
                  ]}
                />
              </View>

              {/* Change Password Toggle */}
              <Pressable
                onPress={() => setShowPasswordSection(!showPasswordSection)}
                style={styles.passwordToggleRow}
              >
                <Ionicons
                  name={showPasswordSection ? 'checkbox' : 'square-outline'}
                  size={18}
                  color={ACCENT_YELLOW}
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.passwordToggleText, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                  Change Account Password
                </Text>
              </Pressable>

              {showPasswordSection && (
                <View style={styles.passwordFieldsBox}>
                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                      New Password
                    </Text>
                    <TextInput
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry
                      placeholder="At least 6 characters"
                      placeholderTextColor="#9CA3AF"
                      style={[
                        styles.formInput,
                        {
                          backgroundColor: isDark ? '#16171B' : '#F9FAFB',
                          borderColor: isDark ? '#2B2D35' : '#E5E7EB',
                          color: isDark ? '#FFFFFF' : '#101114',
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                      Confirm New Password
                    </Text>
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                      placeholder="Re-enter password"
                      placeholderTextColor="#9CA3AF"
                      style={[
                        styles.formInput,
                        {
                          backgroundColor: isDark ? '#16171B' : '#F9FAFB',
                          borderColor: isDark ? '#2B2D35' : '#E5E7EB',
                          color: isDark ? '#FFFFFF' : '#101114',
                        },
                      ]}
                    />
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.modalBtnRow}>
                <Pressable
                  onPress={() => setIsEditModalOpen(false)}
                  style={[
                    styles.modalCancelBtn,
                    { backgroundColor: isDark ? '#23252B' : '#F3F4F6' },
                  ]}
                >
                  <Text style={[styles.modalCancelText, { color: isDark ? '#FFFFFF' : '#374151' }]}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleSaveProfile}
                  disabled={isSaving}
                  style={[styles.modalSaveBtn, isSaving && { opacity: 0.7 }]}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#101114" />
                  ) : (
                    <Text style={styles.modalSaveText}>Save Changes</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Logout Modal */}
      {logoutModalOpen && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={() => setLogoutModalOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.modalCard,
                { backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF', maxWidth: 400 },
              ]}
            >
              <View style={[styles.modalIconWrap, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="log-out-outline" size={28} color="#DC2626" />
              </View>
              <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#101114', textAlign: 'center' }]}>
                Sign Out from Customer App?
              </Text>
              <Text style={styles.modalMessage}>
                You will be redirected to the role selection screen. Your registered vehicles and booking history will remain safe.
              </Text>
              <View style={styles.modalBtnRow}>
                <Pressable
                  onPress={() => setLogoutModalOpen(false)}
                  style={[
                    styles.modalCancelBtn,
                    { backgroundColor: isDark ? '#23252B' : '#F3F4F6' },
                  ]}
                >
                  <Text style={[styles.modalCancelText, { color: isDark ? '#FFFFFF' : '#374151' }]}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable onPress={handleConfirmLogout} style={styles.modalLogoutBtn}>
                  <Text style={styles.modalLogoutText}>Yes, Sign Out</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      <WebFooter />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pageRoot: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    maxWidth: 1320,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 60,
    gap: 24,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  feedbackSuccess: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  feedbackError: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: '700',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#747B87',
    marginTop: 4,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT_YELLOW,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  editProfileBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#101114',
  },
  profileLayoutGrid: {
    width: '100%',
    gap: 20,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  gridCol: {
    flexDirection: 'column',
  },
  // User Profile Card
  userProfileCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
    gap: 18,
  },
  userAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    flexWrap: 'wrap',
  },
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    position: 'relative',
  },
  avatarImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  cameraBadgeBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: ACCENT_YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userInfoCol: {
    flex: 1,
    minWidth: 200,
    gap: 4,
  },
  nameVerifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  userName: {
    fontSize: 20,
    fontWeight: '900',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  verifiedBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  userEmail: {
    fontSize: 13,
    color: '#747B87',
  },
  userPhone: {
    fontSize: 13,
    color: '#747B87',
  },
  uploadPhotoLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  uploadPhotoLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: ACCENT_YELLOW,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(156, 163, 175, 0.15)',
  },
  detailsList: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: '#747B87',
    width: 140,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  // Quick Stats Column
  quickStatsCol: {
    gap: 14,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  summaryIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#747B87',
  },
  summaryCount: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 20,
    padding: 24,
    gap: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalPhotoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 6,
  },
  modalAvatarBox: {
    width: 68,
    height: 68,
    borderRadius: 34,
    overflow: 'hidden',
  },
  modalAvatarImg: {
    width: '100%',
    height: '100%',
  },
  pickPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT_YELLOW,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  pickPhotoBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#101114',
  },
  presetLabel: {
    fontSize: 11,
    color: '#747B87',
    fontWeight: '600',
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetCircleSelected: {
    borderColor: ACCENT_YELLOW,
  },
  presetImg: {
    width: '100%',
    height: '100%',
  },
  formGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    outlineStyle: 'none' as any,
  },
  passwordToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  passwordToggleText: {
    fontSize: 13,
    fontWeight: '700',
  },
  passwordFieldsBox: {
    gap: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 196, 0, 0.06)',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalSaveBtn: {
    flex: 1,
    backgroundColor: ACCENT_YELLOW,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#101114',
  },
  modalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 13,
    color: '#747B87',
    textAlign: 'center',
    lineHeight: 18,
  },
  modalLogoutBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: ACCENT_YELLOW,
  },
  modalLogoutText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#101114',
  },
});
