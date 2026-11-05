import React, { useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useAuthStore } from '../../stores/authStore';
import { useMechanicStore } from '../../stores/mechanicStore';
import { MechanicUser } from '../../types/auth';
import { useResponsive } from '../../hooks/useResponsive';
import { MechfindLogo } from '../ui/MechfindLogo';

const ACCENT_YELLOW = '#FFC400';

interface MechanicPortalShellProps {
  children: React.ReactNode;
}

export const MechanicPortalShell: React.FC<MechanicPortalShellProps> = ({ children }) => {
  const { isDark, toggleTheme } = useTheme();
  const { width } = useResponsive();
  const pathname = usePathname();

  const isDesktop = width >= 1180;
  const isTablet = width >= 768 && width < 1180;
  const isMobile = width < 768;

  const user = useAuthStore((state) => state.user) as MechanicUser | null;
  const logout = useAuthStore((state) => state.logout);

  const incomingRequests = useMechanicStore((state) => state.incomingRequests);
  const isOnline = useMechanicStore((state) => state.isOnline);
  const toggleOnlineStatus = useMechanicStore((state) => state.toggleOnlineStatus);

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  // Determine active tab
  const getActiveTab = (): 'index' | 'requests' | 'earnings' | 'profile' | 'services-pricing' => {
    const p = (pathname || '').toLowerCase();
    if (p.includes('services-pricing') || p.includes('services')) return 'services-pricing';
    if (p.includes('requests') || p.includes('dispatch')) return 'requests';
    if (p.includes('earnings')) return 'earnings';
    if (p.includes('profile') || p.includes('workshop')) return 'profile';
    return 'index';
  };

  const activeTab = getActiveTab();

  const handleNavClick = (tabKey: 'index' | 'requests' | 'earnings' | 'profile' | 'services-pricing') => {
    setMobileDrawerOpen(false);
    switch (tabKey) {
      case 'index':
        router.push('/(mechanic)/(tabs)' as any);
        break;
      case 'requests':
        router.push('/(mechanic)/(tabs)/requests' as any);
        break;
      case 'earnings':
        router.push('/(mechanic)/(tabs)/earnings' as any);
        break;
      case 'profile':
        router.push('/(mechanic)/(tabs)/profile' as any);
        break;
      case 'services-pricing':
        router.push('/(mechanic)/(tabs)/services-pricing' as any);
        break;
    }
  };

  const handleConfirmLogout = async () => {
    setLogoutModalVisible(false);
    try {
      await logout();
      router.replace('/(auth)/role-select');
    } catch {
      router.replace('/(auth)/role-select');
    }
  };

  const workshopName = user?.shopName || 'Partner Workshop';

  const navItems = [
    {
      key: 'index' as const,
      label: 'Dashboard',
      icon: 'speedometer' as const,
      badge: 0,
    },
    {
      key: 'requests' as const,
      label: 'Dispatches',
      icon: 'flash' as const,
      badge: incomingRequests?.length || 2,
    },
    {
      key: 'earnings' as const,
      label: 'Earnings',
      icon: 'bar-chart' as const,
      badge: 0,
    },
    {
      key: 'profile' as const,
      label: 'Workshop',
      icon: 'business' as const,
      badge: 0,
    },
    {
      key: 'services-pricing' as const,
      label: 'Services & Pricing',
      icon: 'construct' as const,
      badge: 0,
    },
  ];

  // Render Sidebar
  const renderSidebarContent = (isDrawer = false) => (
    <View
      style={[
        styles.sidebarContainer,
        isDrawer ? styles.sidebarDrawer : styles.sidebarFixed,
      ]}
    >
      {/* 1. MECHFIND Logo */}
      <View style={styles.sidebarLogoRow}>
        <MechfindLogo isDark={true} width={148} height={44} />
        {isDrawer && (
          <Pressable
            onPress={() => setMobileDrawerOpen(false)}
            style={styles.drawerCloseBtn}
            hitSlop={8}
          >
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </Pressable>
        )}
      </View>

      {/* 2. Navigation items */}
      <View style={styles.sidebarNavList}>
        {navItems.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => handleNavClick(item.key)}
              style={({ hovered }: any) => [
                styles.sidebarNavItem,
                isActive && styles.sidebarNavItemActive,
                !isActive && hovered && styles.sidebarNavItemHovered,
              ]}
            >
              <Ionicons
                name={item.icon}
                size={18}
                color={isActive ? '#101114' : '#A1A5B7'}
                style={{ marginRight: 12 }}
              />
              <Text
                style={[
                  styles.sidebarNavText,
                  isActive && styles.sidebarNavTextActive,
                ]}
              >
                {item.label}
              </Text>
              {item.badge > 0 && (
                <View
                  style={[
                    styles.sidebarBadge,
                    isActive ? styles.sidebarBadgeInverted : styles.sidebarBadgeNormal,
                  ]}
                >
                  <Text
                    style={[
                      styles.sidebarBadgeText,
                      isActive ? styles.sidebarBadgeTextInverted : styles.sidebarBadgeTextNormal,
                    ]}
                  >
                    {item.badge}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* 3. Bottom Sports Car Visual & Secondary Nav */}
      <View style={styles.sidebarBottomSection}>
        {/* Sports Car Thumbnail */}
        <View style={styles.sidebarCarCard}>
          <Image
            source={require('../../../assets/images/auth-sports-car.jpg')}
            style={styles.sidebarCarImage}
            resizeMode="cover"
          />
          <View style={styles.sidebarCarOverlay} />
        </View>

        {/* Help & Support */}
        <Pressable
          onPress={() => setSupportModalOpen(true)}
          style={({ hovered }: any) => [
            styles.sidebarBottomLink,
            hovered && styles.sidebarBottomLinkHovered,
          ]}
        >
          <Ionicons name="headset-outline" size={18} color="#A1A5B7" style={{ marginRight: 10 }} />
          <Text style={styles.sidebarBottomText}>Help & Support</Text>
        </Pressable>

        {/* Logout */}
        <Pressable
          onPress={() => setLogoutModalVisible(true)}
          style={({ hovered }: any) => [
            styles.sidebarBottomLink,
            hovered && styles.sidebarBottomLinkHovered,
          ]}
        >
          <Ionicons name="log-out-outline" size={18} color="#EF4444" style={{ marginRight: 10 }} />
          <Text style={[styles.sidebarBottomText, { color: '#EF4444' }]}>Logout</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={[styles.rootContainer, { backgroundColor: isDark ? '#101114' : '#F5F6F8' }]}>
      {/* Fixed Left Sidebar (Desktop Only) */}
      {isDesktop && renderSidebarContent(false)}

      {/* Main Column */}
      <View style={styles.mainColumn}>
        {/* Persistent Top Header */}
        <View
          style={[
            styles.topHeader,
            width < 600 && { paddingHorizontal: 12 },
            {
              backgroundColor: isDark ? '#101114' : '#FFFFFF',
              borderBottomColor: isDark ? '#1F2024' : '#E5E7EB',
            },
          ]}
        >
          {/* Header Left: Drawer toggle (mobile/tablet) + Title / Subtitle */}
          <View style={styles.headerLeft}>
            {!isDesktop && (
              <Pressable
                onPress={() => setMobileDrawerOpen(true)}
                style={styles.hamburgerBtn}
                hitSlop={8}
              >
                <Ionicons name="menu" size={24} color={isDark ? '#FFFFFF' : '#101114'} />
              </Pressable>
            )}
            <View>
              <Text
                style={[
                  styles.headerTitle,
                  { color: isDark ? '#FFFFFF' : '#101114' },
                  width < 420 && { fontSize: 15 },
                ]}
              >
                Mechanic Portal
              </Text>
              {width >= 420 && (
                <Text style={styles.headerSubtitle}>Workshop Partner Dashboard</Text>
              )}
            </View>
          </View>

          {/* Header Right: Theme Toggle + Bell + Workshop Avatar */}
          <View style={styles.headerRight}>
            {/* Theme Toggle */}
            <Pressable
              onPress={toggleTheme}
              style={[
                styles.iconCircleBtn,
                {
                  backgroundColor: isDark ? '#1A1B1F' : '#F1F2F4',
                  borderColor: isDark ? '#2B2C32' : '#E5E7EB',
                },
              ]}
              accessibilityLabel="Toggle Theme"
            >
              <Ionicons
                name={isDark ? 'sunny-outline' : 'moon-outline'}
                size={18}
                color={isDark ? '#FFC400' : '#101114'}
              />
            </Pressable>

            {/* Notification Bell */}
            <Pressable
              onPress={() => setNotificationsOpen(!notificationsOpen)}
              style={[
                styles.iconCircleBtn,
                {
                  backgroundColor: isDark ? '#1A1B1F' : '#F1F2F4',
                  borderColor: isDark ? '#2B2C32' : '#E5E7EB',
                },
              ]}
              accessibilityLabel="Notifications"
            >
              <Ionicons name="notifications-outline" size={18} color={isDark ? '#FFFFFF' : '#101114'} />
              {/* Yellow indicator dot */}
              <View style={styles.notificationDot} />
            </Pressable>

            {/* Notifications Popover */}
            {notificationsOpen && (
              <View
                style={[
                  styles.notificationsPopover,
                  {
                    backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                    borderColor: isDark ? '#2B2C32' : '#E5E7EB',
                  },
                ]}
              >
                <View style={styles.notificationsHeader}>
                  <Text style={[styles.notificationsTitle, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                    Dispatches & Alerts
                  </Text>
                  <Pressable onPress={() => setNotificationsOpen(false)}>
                    <Ionicons name="close" size={18} color="#747B87" />
                  </Pressable>
                </View>
                <View style={styles.notificationItem}>
                  <Ionicons name="flash" size={16} color={ACCENT_YELLOW} style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.notificationText, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                      2 Incoming breakdown requests nearby
                    </Text>
                    <Text style={styles.notificationTime}>Just now</Text>
                  </View>
                </View>
                <View style={styles.notificationItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#16A34A" style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.notificationText, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                      Earnings payout scheduled for Friday
                    </Text>
                    <Text style={styles.notificationTime}>2 hours ago</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Workshop Avatar & Dropdown Pill */}
            <Pressable
              onPress={() => setProfileDropdownOpen(!profileDropdownOpen)}
              style={[
                styles.profilePill,
                width < 600 && { paddingHorizontal: 6, gap: 4 },
                {
                  backgroundColor: isDark ? '#16171B' : '#F8FAFC',
                  borderColor: isDark ? '#23242A' : '#E2E8F0',
                },
              ]}
            >
              {/* Golden gear badge image */}
              <Image
                source={require('../../../assets/images/workshop-gear-badge.png')}
                style={styles.profileBadgeImage}
                resizeMode="contain"
              />
              {width >= 600 && (
                <View style={styles.profileTextCol}>
                  <Text
                    style={[styles.profileShopName, { color: isDark ? '#FFFFFF' : '#101114' }]}
                    numberOfLines={1}
                  >
                    {workshopName}
                  </Text>
                  <Text style={styles.profileRoleText}>Workshop Partner</Text>
                </View>
              )}
              <Ionicons
                name="chevron-down"
                size={14}
                color={isDark ? '#9CA3AF' : '#64748B'}
                style={{ marginLeft: width < 600 ? 2 : 6 }}
              />
            </Pressable>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <View
                style={[
                  styles.profileDropdownMenu,
                  {
                    backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF',
                    borderColor: isDark ? '#2B2C32' : '#E5E7EB',
                  },
                ]}
              >
                <Pressable
                  onPress={() => {
                    setProfileDropdownOpen(false);
                    router.push('/(mechanic)/(tabs)/profile' as any);
                  }}
                  style={styles.dropdownMenuItem}
                >
                  <Ionicons name="business-outline" size={16} color={isDark ? '#FFFFFF' : '#101114'} />
                  <Text style={[styles.dropdownMenuText, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                    My Workshop
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setProfileDropdownOpen(false);
                    toggleOnlineStatus();
                  }}
                  style={styles.dropdownMenuItem}
                >
                  <Ionicons
                    name={isOnline ? 'radio-button-on' : 'radio-button-off'}
                    size={16}
                    color={isOnline ? '#16A34A' : '#DC2626'}
                  />
                  <Text style={[styles.dropdownMenuText, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                    Status: {isOnline ? 'Online (Accepting)' : 'Offline (Busy)'}
                  </Text>
                </Pressable>
                <View style={styles.dropdownDivider} />
                <Pressable
                  onPress={() => {
                    setProfileDropdownOpen(false);
                    setLogoutModalVisible(true);
                  }}
                  style={styles.dropdownMenuItem}
                >
                  <Ionicons name="log-out-outline" size={16} color="#EF4444" />
                  <Text style={[styles.dropdownMenuText, { color: '#EF4444' }]}>Sign Out</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.contentArea}>
          {children}
        </View>
      </View>

      {/* Mobile Drawer (Tablet & Mobile) */}
      {!isDesktop && (
        <Modal
          visible={mobileDrawerOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setMobileDrawerOpen(false)}
        >
          <View style={styles.drawerBackdrop}>
            <Pressable
              style={styles.drawerBackdropPress}
              onPress={() => setMobileDrawerOpen(false)}
            />
            {renderSidebarContent(true)}
          </View>
        </Modal>
      )}

      {/* Logout Confirmation Modal */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalDialog,
              { backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF' },
            ]}
          >
            <View style={styles.modalIconWrap}>
              <Ionicons name="log-out-outline" size={32} color="#EF4444" />
            </View>
            <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#101114' }]}>
              Sign Out from Mechanic Portal?
            </Text>
            <Text style={styles.modalMessage}>
              You will be marked as offline and will stop receiving live breakdown dispatch requests.
            </Text>
            <View style={styles.modalBtnRow}>
              <Pressable
                onPress={() => setLogoutModalVisible(false)}
                style={[
                  styles.modalCancelBtn,
                  { backgroundColor: isDark ? '#23242A' : '#F1F2F4' },
                ]}
              >
                <Text style={[styles.modalCancelText, { color: isDark ? '#FFFFFF' : '#101114' }]}>
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

      {/* Support Modal */}
      <Modal
        visible={supportModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSupportModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalDialog,
              { backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF' },
            ]}
          >
            <View style={[styles.modalIconWrap, { backgroundColor: '#FEF9C3' }]}>
              <Ionicons name="headset" size={32} color="#CA8A04" />
            </View>
            <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#101114' }]}>
              Partner Support Hotline
            </Text>
            <Text style={styles.modalMessage}>
              Contact our 24/7 dedicated workshop partner emergency line for dispatch updates or technical assistance:
            </Text>
            <View style={styles.supportBox}>
              <Ionicons name="call" size={18} color="#FFC400" style={{ marginRight: 8 }} />
              <Text style={{ fontWeight: '700', fontSize: 16, color: isDark ? '#FFFFFF' : '#101114' }}>
                +91 98765 43210 / 1800-MECHFIND
              </Text>
            </View>
            <Pressable
              onPress={() => setSupportModalOpen(false)}
              style={[styles.modalLogoutBtn, { width: '100%', marginTop: 12 }]}
            >
              <Text style={styles.modalLogoutText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
    width: '100%',
    ...(Platform.OS === 'web' ? { minHeight: '100vh' } : {}),
  },
  // Sidebar
  sidebarContainer: {
    backgroundColor: '#101114',
    borderRightWidth: 1,
    borderRightColor: '#1F2024',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
    justifyContent: 'space-between',
    zIndex: 100,
  },
  sidebarFixed: {
    width: 250,
    height: '100%',
  },
  sidebarDrawer: {
    width: 270,
    height: '100%',
    elevation: 16,
  },
  sidebarLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 28,
  },
  drawerCloseBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#1A1B1F',
  },
  sidebarNavList: {
    gap: 8,
  },
  sidebarNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  sidebarNavItemActive: {
    backgroundColor: ACCENT_YELLOW,
  },
  sidebarNavItemHovered: {
    backgroundColor: '#18191E',
  },
  sidebarNavText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A1A5B7',
    flex: 1,
  },
  sidebarNavTextActive: {
    color: '#101114',
    fontWeight: '800',
  },
  sidebarBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
  },
  sidebarBadgeNormal: {
    backgroundColor: ACCENT_YELLOW,
  },
  sidebarBadgeInverted: {
    backgroundColor: '#101114',
  },
  sidebarBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  sidebarBadgeTextNormal: {
    color: '#101114',
  },
  sidebarBadgeTextInverted: {
    color: ACCENT_YELLOW,
  },
  sidebarBottomSection: {
    marginTop: 'auto',
    paddingTop: 16,
    gap: 12,
  },
  sidebarCarCard: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 8,
  },
  sidebarCarImage: {
    width: '100%',
    height: '100%',
  },
  sidebarCarOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(16, 17, 20, 0.45)',
  },
  sidebarBottomLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  sidebarBottomLinkHovered: {
    backgroundColor: '#18191E',
  },
  sidebarBottomText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A1A5B7',
  },
  // Main Column
  mainColumn: {
    flex: 1,
    flexDirection: 'column',
    height: '100%',
    minWidth: 0,
  },
  // Persistent Top Header
  topHeader: {
    height: 70,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    zIndex: 50,
    position: 'relative',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hamburgerBtn: {
    padding: 6,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#747B87',
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    position: 'relative',
  },
  iconCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ACCENT_YELLOW,
    position: 'absolute',
    top: 7,
    right: 7,
  },
  notificationsPopover: {
    position: 'absolute',
    top: 50,
    right: 170,
    width: 300,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 1000,
  },
  notificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2B2C32',
  },
  notificationsTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  notificationText: {
    fontSize: 12,
    fontWeight: '600',
  },
  notificationTime: {
    fontSize: 11,
    color: '#747B87',
    marginTop: 2,
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 30,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 8,
  },
  profileBadgeImage: {
    width: 32,
    height: 32,
  },
  profileTextCol: {
    maxWidth: 130,
  },
  profileShopName: {
    fontSize: 13,
    fontWeight: '700',
  },
  profileRoleText: {
    fontSize: 11,
    color: '#747B87',
    fontWeight: '500',
  },
  profileDropdownMenu: {
    position: 'absolute',
    top: 50,
    right: 0,
    width: 220,
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 1000,
  },
  dropdownMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 10,
  },
  dropdownMenuText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#2B2C32',
    marginVertical: 4,
  },
  contentArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  // Drawers & Modals
  drawerBackdrop: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  drawerBackdropPress: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalDialog: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
  },
  modalIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 13,
    color: '#747B87',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 19,
  },
  modalBtnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    fontWeight: '700',
    fontSize: 14,
  },
  modalLogoutBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: ACCENT_YELLOW,
  },
  modalLogoutText: {
    color: '#101114',
    fontWeight: '800',
    fontSize: 14,
  },
  supportBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 196, 0, 0.12)',
    marginVertical: 12,
  },
});
