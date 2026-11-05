import React, { useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuthStore } from '../../../stores/authStore';
import { useMechanicStore } from '../../../stores/mechanicStore';
import { MechanicUser } from '../../../types/auth';

const ACCENT_YELLOW = '#FFC400';

export default function MechanicWebWorkshopScreen() {
  const { isDark } = useTheme();
  const user = useAuthStore((state) => state.user) as MechanicUser | null;
  const updateMechanicProfile = useAuthStore((state) => state.updateMechanicProfile);

  const isOnline = useMechanicStore((state) => state.isOnline);
  const toggleOnlineStatus = useMechanicStore((state) => state.toggleOnlineStatus);

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'team' | 'timing' | 'documents'>('overview');
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Form states
  const [shopName, setShopName] = useState(user?.shopName || 'Partner Workshop');
  const [phone, setPhone] = useState(user?.phoneNumber || '+91 98765 43210');
  const [address, setAddress] = useState(user?.shopAddress || 'Dindigul West, Dindigul');
  const [radius, setRadius] = useState(`${user?.serviceRadiusKm || 15} km`);
  const [saveToast, setSaveToast] = useState(false);

  const handleSaveWorkshop = async () => {
    if (updateMechanicProfile && user) {
      await updateMechanicProfile({
        shopName,
        phoneNumber: phone,
        shopAddress: address,
        serviceRadiusKm: parseInt(radius.replace(/\D/g, ''), 10) || 15,
      });
    }
    setEditModalOpen(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  return (
    <ScrollView
      style={[styles.scrollRoot, { backgroundColor: isDark ? '#101114' : '#F5F6F8' }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Toast Notice */}
      {saveToast && (
        <View style={styles.toastBanner}>
          <Ionicons name="checkmark-circle" size={18} color="#15803D" style={{ marginRight: 8 }} />
          <Text style={styles.toastBannerText}>Workshop details successfully updated!</Text>
        </View>
      )}

      {/* 1. Header: Title & Subtitle + Edit Workshop Button */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.pageTitle, { color: isDark ? '#FFFFFF' : '#101114' }]}>
            My Workshop
          </Text>
          <Text style={styles.pageSubtitle}>
            Manage your workshop information, availability and team.
          </Text>
        </View>

        <Pressable
          onPress={() => setEditModalOpen(true)}
          style={styles.editWorkshopBtn}
        >
          <Ionicons name="pencil" size={14} color="#101114" style={{ marginRight: 6 }} />
          <Text style={styles.editWorkshopBtnText}>Edit Workshop</Text>
        </Pressable>
      </View>

      {/* 2. Workshop Hero Card with Avatar, Verification & Online Switch */}
      <View
        style={[
          styles.workshopHeroCard,
          {
            backgroundColor: isDark ? '#16171B' : '#FFFFFF',
            borderColor: isDark ? '#23252B' : '#E5E7EB',
          },
        ]}
      >
        <Image
          source={require('../../../../assets/images/workshop-gear-badge.png')}
          style={styles.workshopGearImg}
          resizeMode="contain"
        />

        <View style={styles.workshopHeroInfo}>
          <View style={styles.heroNameRow}>
            <Text style={[styles.heroShopName, { color: isDark ? '#FFFFFF' : '#101114' }]}>
              {shopName}
            </Text>
            <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
          </View>
          <Text style={styles.heroVerifiedSub}>Verified Workshop</Text>
          <View style={styles.heroLocRow}>
            <Ionicons name="location-outline" size={14} color="#9CA3AF" />
            <Text style={styles.heroLocText}>{address}</Text>
          </View>
        </View>

        <View
          style={[
            styles.heroToggleWrap,
            {
              backgroundColor: isDark ? '#1F2025' : '#F8FAFC',
              borderColor: isDark ? '#2B2D35' : '#E2E8F0',
            },
          ]}
        >
          <View style={styles.onlineDotRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isOnline ? '#16A34A' : '#DC2626' },
              ]}
            />
            <Text style={[styles.toggleText, { color: isDark ? '#FFFFFF' : '#101114' }]}>
              {isOnline ? 'Available for New Jobs' : 'Offline (Busy)'}
            </Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={toggleOnlineStatus}
            trackColor={{ false: '#9CA3AF', true: '#16A34A' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* 3. Sub Tabs: Overview, Team, Timing, Documents */}
      <View style={styles.subTabsRow}>
        <Pressable
          onPress={() => setActiveSubTab('overview')}
          style={[
            styles.subTabPill,
            activeSubTab === 'overview' && styles.subTabPillActive,
            activeSubTab !== 'overview' && {
              backgroundColor: isDark ? '#16171B' : '#FFFFFF',
              borderColor: isDark ? '#23252B' : '#E5E7EB',
            },
          ]}
        >
          <Text
            style={[
              styles.subTabText,
              activeSubTab === 'overview'
                ? styles.subTabTextActive
                : { color: isDark ? '#9CA3AF' : '#6B7280' },
            ]}
          >
            Overview
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveSubTab('team')}
          style={[
            styles.subTabPill,
            activeSubTab === 'team' && styles.subTabPillActive,
            activeSubTab !== 'team' && {
              backgroundColor: isDark ? '#16171B' : '#FFFFFF',
              borderColor: isDark ? '#23252B' : '#E5E7EB',
            },
          ]}
        >
          <Text
            style={[
              styles.subTabText,
              activeSubTab === 'team'
                ? styles.subTabTextActive
                : { color: isDark ? '#9CA3AF' : '#6B7280' },
            ]}
          >
            Team
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveSubTab('timing')}
          style={[
            styles.subTabPill,
            activeSubTab === 'timing' && styles.subTabPillActive,
            activeSubTab !== 'timing' && {
              backgroundColor: isDark ? '#16171B' : '#FFFFFF',
              borderColor: isDark ? '#23252B' : '#E5E7EB',
            },
          ]}
        >
          <Text
            style={[
              styles.subTabText,
              activeSubTab === 'timing'
                ? styles.subTabTextActive
                : { color: isDark ? '#9CA3AF' : '#6B7280' },
            ]}
          >
            Timing
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveSubTab('documents')}
          style={[
            styles.subTabPill,
            activeSubTab === 'documents' && styles.subTabPillActive,
            activeSubTab !== 'documents' && {
              backgroundColor: isDark ? '#16171B' : '#FFFFFF',
              borderColor: isDark ? '#23252B' : '#E5E7EB',
            },
          ]}
        >
          <Text
            style={[
              styles.subTabText,
              activeSubTab === 'documents'
                ? styles.subTabTextActive
                : { color: isDark ? '#9CA3AF' : '#6B7280' },
            ]}
          >
            Documents
          </Text>
        </Pressable>
      </View>

      {/* 4. Tab Contents */}
      {activeSubTab === 'overview' && (
        <View style={styles.tabContentBlock}>
          {/* 2x2 Details Grid */}
          <View style={styles.detailsGrid}>
            {/* Workshop Type */}
            <View
              style={[
                styles.detailTile,
                {
                  backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                  borderColor: isDark ? '#23252B' : '#E5E7EB',
                },
              ]}
            >
              <View style={[styles.detailIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="briefcase-outline" size={20} color="#B45309" />
              </View>
              <View style={styles.detailTexts}>
                <Text style={styles.detailLabel}>Workshop Type</Text>
                <Text style={[styles.detailValue, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                  Garage / Service Center
                </Text>
              </View>
            </View>

            {/* Service Radius */}
            <View
              style={[
                styles.detailTile,
                {
                  backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                  borderColor: isDark ? '#23252B' : '#E5E7EB',
                },
              ]}
            >
              <View style={[styles.detailIconBox, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="compass-outline" size={20} color="#1D4ED8" />
              </View>
              <View style={styles.detailTexts}>
                <Text style={styles.detailLabel}>Service Radius</Text>
                <Text style={[styles.detailValue, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                  {radius}
                </Text>
              </View>
            </View>

            {/* Contact Number */}
            <View
              style={[
                styles.detailTile,
                {
                  backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                  borderColor: isDark ? '#23252B' : '#E5E7EB',
                },
              ]}
            >
              <View style={[styles.detailIconBox, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="call-outline" size={20} color="#15803D" />
              </View>
              <View style={styles.detailTexts}>
                <Text style={styles.detailLabel}>Contact Number</Text>
                <Text style={[styles.detailValue, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                  {phone}
                </Text>
              </View>
            </View>

            {/* Address */}
            <View
              style={[
                styles.detailTile,
                {
                  backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                  borderColor: isDark ? '#23252B' : '#E5E7EB',
                },
              ]}
            >
              <View style={[styles.detailIconBox, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="location-outline" size={20} color="#B91C1C" />
              </View>
              <View style={styles.detailTexts}>
                <Text style={styles.detailLabel}>Address</Text>
                <Text style={[styles.detailValue, { color: isDark ? '#FFFFFF' : '#101114' }]} numberOfLines={1}>
                  {address}
                </Text>
              </View>
            </View>
          </View>

          {/* Workshop Images Section */}
          <View style={styles.imagesSection}>
            <Text style={[styles.imagesSectionTitle, { color: isDark ? '#FFFFFF' : '#101114' }]}>
              Workshop Images
            </Text>

            <View style={styles.imagesRow}>
              {/* Photo 1 */}
              <View style={styles.workshopPhotoCard}>
                <Image
                  source={require('../../../../assets/images/workshop-garage-hero.png')}
                  style={styles.workshopPhotoImg}
                  resizeMode="cover"
                />
              </View>

              {/* Photo 2 */}
              <View style={styles.workshopPhotoCard}>
                <Image
                  source={require('../../../../assets/images/workshop-garage-banner.png')}
                  style={styles.workshopPhotoImg}
                  resizeMode="cover"
                />
              </View>

              {/* Photo 3 */}
              <View style={styles.workshopPhotoCard}>
                <Image
                  source={require('../../../../assets/images/workshop-sr-auto.png')}
                  style={styles.workshopPhotoImg}
                  resizeMode="cover"
                />
              </View>

              {/* Add Photo Card */}
              <Pressable
                onPress={() => alert('Photo upload dialog opened for workshop gallery.')}
                style={[
                  styles.addPhotoDashedCard,
                  {
                    backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                    borderColor: isDark ? '#2E313A' : '#D1D5DB',
                  },
                ]}
              >
                <Ionicons name="add" size={28} color="#9CA3AF" />
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {activeSubTab === 'team' && (
        <View style={styles.tabContentBlock}>
          <View style={styles.teamList}>
            <View
              style={[
                styles.teamMemberCard,
                {
                  backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                  borderColor: isDark ? '#23252B' : '#E5E7EB',
                },
              ]}
            >
              <View style={styles.teamAvatarBox}>
                <Ionicons name="person" size={20} color={ACCENT_YELLOW} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.teamName, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                  Murugan S.
                </Text>
                <Text style={styles.teamRole}>Lead Diagnostic Specialist • 8 yrs exp</Text>
              </View>
              <View style={styles.teamStatusBadge}>
                <Text style={styles.teamStatusText}>Active on Duty</Text>
              </View>
            </View>

            <View
              style={[
                styles.teamMemberCard,
                {
                  backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                  borderColor: isDark ? '#23252B' : '#E5E7EB',
                },
              ]}
            >
              <View style={styles.teamAvatarBox}>
                <Ionicons name="person" size={20} color={ACCENT_YELLOW} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.teamName, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                  Arun Kumar
                </Text>
                <Text style={styles.teamRole}>Roadside Recovery Expert • 5 yrs exp</Text>
              </View>
              <View style={styles.teamStatusBadge}>
                <Text style={styles.teamStatusText}>Active on Duty</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {activeSubTab === 'timing' && (
        <View style={styles.tabContentBlock}>
          <View
            style={[
              styles.timingCard,
              {
                backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                borderColor: isDark ? '#23252B' : '#E5E7EB',
              },
            ]}
          >
            <View style={styles.timingRow}>
              <Text style={[styles.timingDay, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                Monday – Saturday
              </Text>
              <Text style={styles.timingHours}>09:00 AM – 07:00 PM</Text>
            </View>
            <View style={styles.timingDivider} />
            <View style={styles.timingRow}>
              <Text style={[styles.timingDay, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                Sunday
              </Text>
              <Text style={[styles.timingHours, { color: ACCENT_YELLOW, fontWeight: '700' }]}>
                Emergency Breakdown On-Call Only
              </Text>
            </View>
          </View>
        </View>
      )}

      {activeSubTab === 'documents' && (
        <View style={styles.tabContentBlock}>
          <View style={styles.docList}>
            <View
              style={[
                styles.docCard,
                {
                  backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                  borderColor: isDark ? '#23252B' : '#E5E7EB',
                },
              ]}
            >
              <Ionicons name="shield-checkmark" size={22} color="#16A34A" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.docTitle, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                  GST Registration Certificate
                </Text>
                <Text style={styles.docSub}>GSTIN: 33AAAAA0000A1Z5 • Verified</Text>
              </View>
              <View style={styles.docVerifiedPill}>
                <Text style={styles.docVerifiedText}>Verified</Text>
              </View>
            </View>

            <View
              style={[
                styles.docCard,
                {
                  backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                  borderColor: isDark ? '#23252B' : '#E5E7EB',
                },
              ]}
            >
              <Ionicons name="document-text" size={22} color="#16A34A" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.docTitle, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                  Automotive Trade & Workshop License
                </Text>
                <Text style={styles.docSub}>License No: DGL/MCH/2024/8892 • Valid till 2029</Text>
              </View>
              <View style={styles.docVerifiedPill}>
                <Text style={styles.docVerifiedText}>Verified</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Edit Workshop Modal */}
      {editModalOpen && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={() => setEditModalOpen(false)}
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
                  Edit Workshop Profile
                </Text>
                <Pressable onPress={() => setEditModalOpen(false)}>
                  <Ionicons name="close" size={20} color="#747B87" />
                </Pressable>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                  Workshop Name
                </Text>
                <TextInput
                  value={shopName}
                  onChangeText={setShopName}
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
                  Contact Phone Number
                </Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
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
                  Workshop Address & City
                </Text>
                <TextInput
                  value={address}
                  onChangeText={setAddress}
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
                  Service Radius (km)
                </Text>
                <TextInput
                  value={radius}
                  onChangeText={setRadius}
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

              <View style={styles.modalBtnRow}>
                <Pressable
                  onPress={() => setEditModalOpen(false)}
                  style={[
                    styles.modalCancelBtn,
                    { backgroundColor: isDark ? '#23252B' : '#F3F4F6' },
                  ]}
                >
                  <Text style={[styles.modalCancelText, { color: isDark ? '#FFFFFF' : '#374151' }]}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable onPress={handleSaveWorkshop} style={styles.modalSaveBtn}>
                  <Text style={styles.modalSaveText}>Save Changes</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollRoot: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
    gap: 20,
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  toastBannerText: {
    color: '#15803D',
    fontWeight: '700',
    fontSize: 13,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#747B87',
    marginTop: 2,
  },
  editWorkshopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT_YELLOW,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  editWorkshopBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#101114',
  },
  workshopHeroCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  workshopGearImg: {
    width: 60,
    height: 60,
  },
  workshopHeroInfo: {
    flex: 1,
    minWidth: 200,
  },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroShopName: {
    fontSize: 18,
    fontWeight: '900',
  },
  heroVerifiedSub: {
    fontSize: 12,
    color: '#747B87',
    marginTop: 2,
  },
  heroLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  heroLocText: {
    fontSize: 12,
    color: '#747B87',
  },
  heroToggleWrap: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  onlineDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '700',
  },
  subTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  subTabPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  subTabPillActive: {
    backgroundColor: '#101114',
    borderColor: '#101114',
  },
  subTabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  subTabTextActive: {
    color: ACCENT_YELLOW,
  },
  tabContentBlock: {
    gap: 20,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  detailTile: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  detailIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTexts: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#747B87',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  imagesSection: {
    gap: 14,
  },
  imagesSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  imagesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  workshopPhotoCard: {
    width: 180,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
  },
  workshopPhotoImg: {
    width: '100%',
    height: '100%',
  },
  addPhotoDashedCard: {
    width: 140,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addPhotoText: {
    fontSize: 12,
    color: '#747B87',
    fontWeight: '700',
  },
  // Team
  teamList: {
    gap: 10,
  },
  teamMemberCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  teamAvatarBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F2024',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamName: {
    fontSize: 14,
    fontWeight: '800',
  },
  teamRole: {
    fontSize: 12,
    color: '#747B87',
    marginTop: 2,
  },
  teamStatusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  teamStatusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  // Timing
  timingCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 20,
    gap: 12,
  },
  timingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timingDay: {
    fontSize: 14,
    fontWeight: '700',
  },
  timingHours: {
    fontSize: 13,
    color: '#747B87',
  },
  timingDivider: {
    height: 1,
    backgroundColor: 'rgba(156, 163, 175, 0.15)',
  },
  // Documents
  docList: {
    gap: 10,
  },
  docCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  docTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  docSub: {
    fontSize: 12,
    color: '#747B87',
    marginTop: 2,
  },
  docVerifiedPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  docVerifiedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
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
    maxWidth: 480,
    borderRadius: 16,
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
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
});
