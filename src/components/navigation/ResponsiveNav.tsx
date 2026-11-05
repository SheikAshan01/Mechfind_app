import React, { useRef, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { MechfindLogo } from '../ui/MechfindLogo';

interface ResponsiveNavProps {
  mode?: 'customer' | 'mechanic';
  activeNav?: string;
}

interface NavLinkItem {
  label: string;
  route: string;
  hasDropdown?: boolean;
}

interface ServiceMenuItem {
  id: string;
  name: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  tag?: string;
}

const SERVICE_ITEMS: ServiceMenuItem[] = [
  {
    id: 'general',
    name: 'General Service',
    desc: 'Periodic maintenance, complete multi-point inspection & tune-up',
    icon: 'construct-outline',
    tag: 'Popular',
  },
  {
    id: 'battery',
    name: 'Battery Service',
    desc: 'Quick jumpstart assistance & doorstep battery replacement',
    icon: 'flash-outline',
    tag: 'Quick',
  },
  {
    id: 'tyre',
    name: 'Tyre Service',
    desc: 'Puncture repair, air inflation check & on-spot tyre change',
    icon: 'disc-outline',
  },
  {
    id: 'oil',
    name: 'Oil Change',
    desc: 'Synthetic & mineral engine oil flush with genuine filter replacement',
    icon: 'water-outline',
  },
  {
    id: 'breakdown',
    name: 'Breakdown Support',
    desc: '24/7 on-demand roadside towing and emergency assistance',
    icon: 'car-sport-outline',
    tag: '24/7',
  },
  {
    id: 'ac',
    name: 'AC Service & Repair',
    desc: 'AC cooling check, gas recharge & cabin filter purification',
    icon: 'snow-outline',
  },
  {
    id: 'wash',
    name: 'Car Care (Wash & Clean)',
    desc: 'Eco doorstep foam pressure wash, interior vacuum & polish',
    icon: 'sparkles-outline',
  },
];

export const ResponsiveNav: React.FC<ResponsiveNavProps> = ({ mode = 'customer', activeNav }) => {
  const { isDark, toggleTheme } = useTheme();
  const { width } = useResponsive();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [mobileServicesExpanded, setMobileServicesExpanded] = useState(false);
  const [hoveredServiceId, setHoveredServiceId] = useState<string | null>(null);

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDesktop = width >= 1100;
  const isTablet = width >= 768 && width < 1100;

  const onMechanicPortal = mode === 'mechanic';

  const customerNavLinks: NavLinkItem[] = [
    { label: 'Home', route: '/(customer)/(tabs)' },
    { label: 'Services', route: '/(customer)/services-pricing', hasDropdown: true },
    { label: 'Find a Mechanic', route: '/(customer)/nearby-mechanics' },
    { label: 'Bookings', route: '/(customer)/(tabs)/requests' },
    { label: 'My Vehicles', route: '/(customer)/(tabs)/vehicles' },
    { label: 'About', route: '/(customer)/about' },
    { label: 'Contact', route: '/(customer)/contact' },
  ];

  const mechanicNavLinks: NavLinkItem[] = [
    { label: 'Dashboard', route: '/(mechanic)/(tabs)' },
    { label: 'Dispatches', route: '/(mechanic)/(tabs)/requests' },
    { label: 'Earnings', route: '/(mechanic)/(tabs)/earnings' },
    { label: 'Workshop', route: '/(mechanic)/(tabs)/profile' },
    { label: 'Services & Pricing', route: '/(mechanic)/services-pricing' },
  ];

  const links = onMechanicPortal ? mechanicNavLinks : customerNavLinks;

  const isLinkActive = (route: string, label: string) => {
    if (activeNav) {
      return activeNav.trim().toLowerCase() === label.trim().toLowerCase();
    }

    const current = (pathname || '').toLowerCase().replace(/\/\([^)]+\)/g, '');
    const target = route.toLowerCase().replace(/\/\([^)]+\)/g, '');

    if (label === 'Home') {
      return current === '' || current === '/' || current === '/index';
    }
    if (label === 'Services') {
      return current.includes('services');
    }
    if (label === 'Find a Mechanic') {
      return current.includes('nearby-mechanics') || current.includes('mechanic-details');
    }
    if (label === 'Bookings') {
      return (
        current.includes('requests') ||
        current.includes('booking') ||
        current.includes('live-tracking')
      );
    }
    if (label === 'My Vehicles') {
      return current.includes('vehicles') || current.includes('garage');
    }
    if (label === 'About') {
      return current.includes('about');
    }
    if (label === 'Contact') {
      return current.includes('contact');
    }

    return current === target || current.startsWith(target);
  };

  const handleMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setServicesDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setServicesDropdownOpen(false);
    }, 220);
  };

  const handleSelectService = (id: string) => {
    setServicesDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push('/(customer)/services-pricing');
  };

  return (
    <View
      style={[
        styles.navWrapper,
        {
          backgroundColor: isDark ? '#101114' : '#FFFFFF',
          borderBottomColor: isDark ? '#1F2024' : '#E5E7EB',
        },
      ]}
    >
      <View style={styles.navContainer}>
        {/* Logo with transparent background */}
        <Pressable
          onPress={() => router.push(onMechanicPortal ? '/(mechanic)/(tabs)' : '/(customer)/(tabs)')}
          style={styles.logoBtn}
          accessibilityRole="link"
          accessibilityLabel="MECHFIND Home"
        >
          <MechfindLogo isDark={isDark} width={146} height={42} />
        </Pressable>

        {/* Desktop Center Links */}
        {isDesktop && (
          <View style={styles.centerLinksRow}>
            {links.map((item) => {
              const active = isLinkActive(item.route, item.label);
              const isServices = item.hasDropdown;

              if (isServices) {
                return (
                  <View
                    key={item.label}
                    style={styles.dropdownAnchorWrapper}
                    onPointerEnter={Platform.OS === 'web' ? handleMouseEnter : undefined}
                    onPointerLeave={Platform.OS === 'web' ? handleMouseLeave : undefined}
                  >
                    <Pressable
                      onPress={() => {
                        setServicesDropdownOpen((prev) => !prev);
                      }}
                      onHoverIn={handleMouseEnter}
                      onHoverOut={handleMouseLeave}
                      style={[
                        styles.navPill,
                        (active || servicesDropdownOpen) && styles.navPillActive,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel="Services menu"
                    >
                      <Text
                        style={[
                          styles.navPillText,
                          active || servicesDropdownOpen
                            ? styles.navPillTextActive
                            : { color: isDark ? '#C7C9CE' : '#4B5563' },
                        ]}
                      >
                        {item.label}
                      </Text>
                      <Ionicons
                        name={servicesDropdownOpen ? 'chevron-up' : 'chevron-down'}
                        size={12}
                        color={
                          active || servicesDropdownOpen
                            ? '#101114'
                            : isDark
                            ? '#C7C9CE'
                            : '#4B5563'
                        }
                        style={{ marginLeft: 3 }}
                      />
                    </Pressable>

                    {/* Desktop Dropdown Flyout Menu */}
                    {servicesDropdownOpen && (
                      <View
                        style={[
                          styles.dropdownFlyout,
                          {
                            backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                            borderColor: isDark ? '#2D3139' : '#E5E7EB',
                          },
                        ]}
                        onPointerEnter={Platform.OS === 'web' ? handleMouseEnter : undefined}
                        onPointerLeave={Platform.OS === 'web' ? handleMouseLeave : undefined}
                      >
                        <View style={styles.dropdownHeader}>
                          <Text
                            style={[
                              styles.dropdownHeaderTitle,
                              { color: isDark ? '#FFFFFF' : '#111827' },
                            ]}
                          >
                            All Vehicle Services
                          </Text>
                          <Text
                            style={[
                              styles.dropdownHeaderSubtitle,
                              { color: isDark ? '#9CA3AF' : '#6B7280' },
                            ]}
                          >
                            On-demand doorstep & workshop assistance
                          </Text>
                        </View>

                        <View style={styles.dropdownItemsList}>
                          {SERVICE_ITEMS.map((service) => {
                            const isHovered = hoveredServiceId === service.id;
                            return (
                              <Pressable
                                key={service.id}
                                onPress={() => handleSelectService(service.id)}
                                onHoverIn={() => setHoveredServiceId(service.id)}
                                onHoverOut={() => setHoveredServiceId(null)}
                                style={[
                                  styles.dropdownItemRow,
                                  isHovered && {
                                    backgroundColor: isDark ? '#23252B' : '#F8F9FA',
                                  },
                                ]}
                                accessibilityRole="button"
                              >
                                <View
                                  style={[
                                    styles.serviceIconBox,
                                    {
                                      backgroundColor: isDark ? '#262417' : '#FEF9C3',
                                    },
                                  ]}
                                >
                                  <Ionicons
                                    name={service.icon}
                                    size={18}
                                    color="#B45309"
                                  />
                                </View>

                                <View style={styles.serviceItemTexts}>
                                  <View style={styles.serviceTitleRow}>
                                    <Text
                                      style={[
                                        styles.serviceItemName,
                                        { color: isDark ? '#FFFFFF' : '#111827' },
                                      ]}
                                    >
                                      {service.name}
                                    </Text>
                                    {service.tag && (
                                      <View
                                        style={[
                                          styles.serviceTagBadge,
                                          service.tag === '24/7'
                                            ? styles.serviceTag247
                                            : styles.serviceTagYellow,
                                        ]}
                                      >
                                        <Text
                                          style={[
                                            styles.serviceTagText,
                                            service.tag === '24/7'
                                              ? styles.serviceTag247Text
                                              : styles.serviceTagYellowText,
                                          ]}
                                        >
                                          {service.tag}
                                        </Text>
                                      </View>
                                    )}
                                  </View>
                                  <Text
                                    numberOfLines={1}
                                    style={[
                                      styles.serviceItemDesc,
                                      { color: isDark ? '#9CA3AF' : '#6B7280' },
                                    ]}
                                  >
                                    {service.desc}
                                  </Text>
                                </View>

                                <Ionicons
                                  name="chevron-forward"
                                  size={15}
                                  color={isHovered ? '#FFC400' : isDark ? '#4B5563' : '#D1D5DB'}
                                />
                              </Pressable>
                            );
                          })}
                        </View>

                        <Pressable
                          onPress={() => {
                            setServicesDropdownOpen(false);
                            router.push('/(customer)/services-pricing');
                          }}
                          style={[
                            styles.dropdownFooterCTA,
                            {
                              backgroundColor: isDark ? '#202228' : '#F3F4F6',
                              borderTopColor: isDark ? '#2D3139' : '#E5E7EB',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.dropdownFooterCTAText,
                              { color: isDark ? '#FFFFFF' : '#111827' },
                            ]}
                          >
                            Explore All Services & Pricing
                          </Text>
                          <Ionicons name="arrow-forward" size={14} color="#FFC400" />
                        </Pressable>
                      </View>
                    )}
                  </View>
                );
              }

              return (
                <Pressable
                  key={item.label}
                  onPress={() => {
                    setServicesDropdownOpen(false);
                    router.push(item.route as never);
                  }}
                  style={[
                    styles.navPill,
                    active && styles.navPillActive,
                  ]}
                  accessibilityRole="link"
                >
                  <Text
                    style={[
                      styles.navPillText,
                      active
                        ? styles.navPillTextActive
                        : { color: isDark ? '#C7C9CE' : '#4B5563' },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Right Action Buttons */}
        <View style={styles.rightActionsRow}>
          {/* Theme Toggle */}
          <Pressable
            onPress={toggleTheme}
            style={[
              styles.themeToggleBtn,
              {
                backgroundColor: isDark ? '#1A1B1F' : '#F3F4F6',
                borderColor: isDark ? '#2D3139' : '#E5E7EB',
              },
            ]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Toggle Theme"
          >
            <Ionicons
              name={isDark ? 'moon' : 'sunny'}
              size={18}
              color={isDark ? '#FFFFFF' : '#101114'}
            />
          </Pressable>

          {/* Become a Mechanic / Customer Portal */}
          {isDesktop && (
            <Pressable
              onPress={() =>
                router.push(
                  onMechanicPortal
                    ? '/(customer)/(tabs)'
                    : '/(customer)/become-mechanic'
                )
              }
              style={[
                styles.partnerBtn,
                { borderColor: isDark ? '#2D3139' : '#E5E7EB' },
              ]}
              accessibilityRole="link"
            >
              <Ionicons
                name={onMechanicPortal ? 'person-outline' : 'construct-outline'}
                size={15}
                color={isDark ? '#FFFFFF' : '#101114'}
              />
              <Text
                style={[
                  styles.partnerBtnText,
                  { color: isDark ? '#FFFFFF' : '#101114' },
                ]}
              >
                {onMechanicPortal ? 'Customer App' : 'Become a Mechanic'}
              </Text>
            </Pressable>
          )}

          {/* Get Started Button */}
          {isDesktop && !onMechanicPortal && (
            <Pressable
              onPress={() => router.push('/(auth)/role-select')}
              style={styles.getStartedBtn}
              accessibilityRole="button"
            >
              <Text style={styles.getStartedBtnText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={15} color="#101114" />
            </Pressable>
          )}

          {/* Hamburger Menu Toggle (Tablets & Mobile) */}
          {!isDesktop && (
            <Pressable
              onPress={() => setMobileMenuOpen((prev) => !prev)}
              style={[
                styles.hamburgerBtn,
                {
                  backgroundColor: isDark ? '#1A1B1F' : '#F3F4F6',
                  borderColor: isDark ? '#2D3139' : '#E5E7EB',
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Open Navigation Menu"
            >
              <Ionicons
                name={mobileMenuOpen ? 'close' : 'menu'}
                size={22}
                color={isDark ? '#FFFFFF' : '#101114'}
              />
            </Pressable>
          )}
        </View>
      </View>

      {/* Mobile / Tablet Menu Drawer */}
      {!isDesktop && mobileMenuOpen && (
        <View
          style={[
            styles.mobileDropdownMenu,
            {
              backgroundColor: isDark ? '#101114' : '#FFFFFF',
              borderTopColor: isDark ? '#1F2024' : '#E5E7EB',
            },
          ]}
        >
          {links.map((item) => {
            const active = isLinkActive(item.route, item.label);
            const isServices = item.hasDropdown;

            if (isServices) {
              return (
                <View key={item.label} style={styles.mobileServicesAccordion}>
                  <Pressable
                    onPress={() => setMobileServicesExpanded((prev) => !prev)}
                    style={[
                      styles.mobileMenuItem,
                      active && {
                        backgroundColor: isDark ? '#1A1B1F' : '#F3F4F6',
                      },
                    ]}
                  >
                    <View style={styles.mobileItemRow}>
                      <Text
                        style={[
                          styles.mobileMenuItemText,
                          active
                            ? { color: '#FFC400', fontWeight: '800' }
                            : { color: isDark ? '#FFFFFF' : '#101114' },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </View>
                    <Ionicons
                      name={mobileServicesExpanded ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={active ? '#FFC400' : isDark ? '#6B7280' : '#9CA3AF'}
                    />
                  </Pressable>

                  {mobileServicesExpanded && (
                    <View
                      style={[
                        styles.mobileSubList,
                        {
                          backgroundColor: isDark ? '#16171B' : '#F9FAFB',
                          borderColor: isDark ? '#23252B' : '#E5E7EB',
                        },
                      ]}
                    >
                      {SERVICE_ITEMS.map((service) => (
                        <Pressable
                          key={service.id}
                          onPress={() => handleSelectService(service.id)}
                          style={styles.mobileSubItem}
                        >
                          <Ionicons
                            name={service.icon}
                            size={16}
                            color="#FFC400"
                            style={{ marginRight: 8 }}
                          />
                          <Text
                            style={[
                              styles.mobileSubItemText,
                              { color: isDark ? '#E5E7EB' : '#374151' },
                            ]}
                          >
                            {service.name}
                          </Text>
                          {service.tag && (
                            <View style={styles.serviceTagBadgeSmall}>
                              <Text style={styles.serviceTagTextSmall}>{service.tag}</Text>
                            </View>
                          )}
                        </Pressable>
                      ))}
                      <Pressable
                        onPress={() => {
                          setMobileMenuOpen(false);
                          router.push('/(customer)/services-pricing');
                        }}
                        style={styles.mobileSubAllBtn}
                      >
                        <Text style={styles.mobileSubAllBtnText}>View All Services & Pricing →</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              );
            }

            return (
              <Pressable
                key={item.label}
                onPress={() => {
                  setMobileMenuOpen(false);
                  router.push(item.route as never);
                }}
                style={[
                  styles.mobileMenuItem,
                  active && {
                    backgroundColor: isDark ? '#1A1B1F' : '#F3F4F6',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.mobileMenuItemText,
                    active
                      ? { color: '#FFC400', fontWeight: '800' }
                      : { color: isDark ? '#FFFFFF' : '#101114' },
                  ]}
                >
                  {item.label}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={active ? '#FFC400' : isDark ? '#6B7280' : '#9CA3AF'}
                />
              </Pressable>
            );
          })}

          <View
            style={[
              styles.mobileMenuDivider,
              { backgroundColor: isDark ? '#1F2024' : '#E5E7EB' },
            ]}
          />

          <Pressable
            onPress={() => {
              setMobileMenuOpen(false);
              router.push(
                onMechanicPortal
                  ? '/(customer)/(tabs)'
                  : '/(customer)/become-mechanic'
              );
            }}
            style={styles.mobileMenuItem}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons
                name={onMechanicPortal ? 'person-outline' : 'construct-outline'}
                size={18}
                color="#FFC400"
              />
              <Text
                style={[
                  styles.mobileMenuItemText,
                  { color: isDark ? '#FFFFFF' : '#101114' },
                ]}
              >
                {onMechanicPortal ? 'Customer App' : 'Become a Mechanic'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={isDark ? '#6B7280' : '#9CA3AF'} />
          </Pressable>

          {!onMechanicPortal && (
            <Pressable
              onPress={() => {
                setMobileMenuOpen(false);
                router.push('/(auth)/role-select');
              }}
              style={styles.mobileGetStartedBtn}
            >
              <Text style={styles.getStartedBtnText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={16} color="#101114" />
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  navWrapper: {
    width: '100%',
    borderBottomWidth: 1,
    zIndex: 1000,
    elevation: 8,
    position: 'relative',
  },
  navContainer: {
    maxWidth: 1320,
    width: '100%',
    alignSelf: 'center',
    minHeight: 74,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImg: {
    width: 140,
    height: 44,
  },
  centerLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dropdownAnchorWrapper: {
    position: 'relative',
    zIndex: 1001,
  },
  navPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  navPillActive: {
    backgroundColor: '#FFC400',
  },
  navPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  navPillTextActive: {
    color: '#101114',
    fontWeight: '700',
  },
  dropdownFlyout: {
    position: 'absolute',
    top: 48,
    left: -40,
    width: 440,
    borderRadius: 18,
    borderWidth: 1,
    paddingTop: 16,
    paddingBottom: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 16,
    zIndex: 1002,
  },
  dropdownHeader: {
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  dropdownHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  dropdownHeaderSubtitle: {
    fontSize: 11.5,
    marginTop: 2,
  },
  dropdownItemsList: {
    paddingHorizontal: 8,
    paddingBottom: 6,
  },
  dropdownItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 12,
  },
  serviceIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceItemTexts: {
    flex: 1,
  },
  serviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  serviceItemName: {
    fontSize: 13,
    fontWeight: '700',
  },
  serviceItemDesc: {
    fontSize: 11,
    marginTop: 1,
  },
  serviceTagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  serviceTagText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  serviceTagYellow: {
    backgroundColor: '#FEF3C7',
  },
  serviceTagYellowText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#92400E',
  },
  serviceTag247: {
    backgroundColor: '#DCFCE7',
  },
  serviceTag247Text: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#166534',
  },
  dropdownFooterCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderTopWidth: 1,
    marginTop: 6,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  dropdownFooterCTAText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  rightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  themeToggleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
  },
  partnerBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  getStartedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFC400',
    shadowColor: '#FFC400',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  getStartedBtnText: {
    color: '#101114',
    fontSize: 13,
    fontWeight: '800',
  },
  hamburgerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileDropdownMenu: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    gap: 4,
  },
  mobileServicesAccordion: {
    width: '100%',
  },
  mobileItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mobileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  mobileMenuItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
  mobileSubList: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 4,
    gap: 8,
  },
  mobileSubItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  mobileSubItemText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  serviceTagBadgeSmall: {
    backgroundColor: '#FFC400',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  serviceTagTextSmall: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#101114',
  },
  mobileSubAllBtn: {
    paddingTop: 8,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 4,
  },
  mobileSubAllBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  mobileMenuDivider: {
    height: 1,
    marginVertical: 8,
  },
  mobileGetStartedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFC400',
    marginTop: 8,
    marginBottom: 6,
  },
});
