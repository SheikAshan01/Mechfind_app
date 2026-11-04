import React, { useState } from 'react';
import {
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { BRAND_COLORS } from '../../theme/colors';
import { RADIUS } from '../../theme/radius';
import { SPACING } from '../../theme/spacing';
import { useResponsive } from '../../hooks/useResponsive';
import { useCustomerStore } from '../../stores/customerStore';
import { useAuthStore } from '../../stores/authStore';
import { locationService } from '../../services/location/locationService';

interface ResponsiveNavProps {
  mode?: 'customer' | 'mechanic';
}

export const ResponsiveNav: React.FC<ResponsiveNavProps> = ({ mode = 'customer' }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { width, isMobile } = useResponsive();
  const pathname = usePathname();
  const { currentLocation, setCurrentLocation } = useCustomerStore();
  const { role, isAuthenticated } = useAuthStore();
  const [isLocating, setIsLocating] = useState(false);

  const handlePortalSwitch = () => {
    if (mode === 'customer') {
      if (role === 'mechanic' && isAuthenticated) {
        router.push('/(mechanic)/(tabs)');
      } else {
        router.push('/(auth)/mechanic-login');
      }
    } else {
      router.push('/(customer)/(tabs)');
    }
  };

  // Hide top web nav on mobile native/small mobile screens where bottom tabs are used
  if (isMobile && Platform.OS !== 'web') {
    return null;
  }

  const handleRefreshLocation = async () => {
    setIsLocating(true);
    try {
      const loc = await locationService.getCurrentLocation();
      setCurrentLocation({
        latitude: loc.latitude,
        longitude: loc.longitude,
        address: loc.address,
      });
    } finally {
      setIsLocating(false);
    }
  };

  const handleSOSCall = () => {
    Linking.openURL('tel:18006324346');
  };

  const displayLocation = currentLocation.address
    ? currentLocation.address.split(',')[0].trim()
    : 'Dindigul West';

  const customerLinks = [
    { label: 'Home', path: '/(customer)/(tabs)' },
    { label: 'Find Mechanics', path: '/(customer)/nearby-mechanics' },
    { label: 'Book Assistance', path: '/(customer)/breakdown-request' },
    { label: 'My Bookings', path: '/(customer)/(tabs)/requests' },
    { label: 'My Garage', path: '/(customer)/(tabs)/vehicles' },
    { label: 'Profile', path: '/(customer)/(tabs)/profile' },
  ];

  const mechanicLinks = [
    { label: 'Dashboard', path: '/(mechanic)/(tabs)' },
    { label: 'Jobs & Requests', path: '/(mechanic)/(tabs)/requests' },
    { label: 'Earnings', path: '/(mechanic)/(tabs)/earnings' },
    { label: 'Workshop Profile', path: '/(mechanic)/(tabs)/profile' },
    { label: 'Verification', path: '/(mechanic)/verification-status' },
  ];

  const links = mode === 'mechanic' ? mechanicLinks : customerLinks;

  return (
    <View
      style={[
        styles.navContainer,
        {
          backgroundColor: theme.surface,
          borderBottomColor: theme.divider,
        },
      ]}
    >
      <View style={styles.navInner}>
        {/* Left: Brand Identity & Location */}
        <View style={styles.brandGroup}>
          <Pressable
            onPress={() =>
              router.push(mode === 'mechanic' ? '/(mechanic)/(tabs)' : '/(customer)/(tabs)')
            }
            style={styles.logoPressable}
            accessibilityRole="link"
            accessibilityLabel="MECHFIND Home"
          >
            <Image
              source={require('../../../assets/images/mechfind_logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
              accessibilityLabel="MECHFIND Official Emblem"
            />
            <View>
              <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>
                MECH<Text style={{ color: BRAND_COLORS.primaryBlue }}>FIND</Text>
              </Text>
              <Text style={[styles.brandSubtitle, { color: theme.textSecondary }]}>
                {mode === 'mechanic' ? 'Partner Portal' : 'Roadside Assistance'}
              </Text>
            </View>
          </Pressable>

          {/* Location Selector (for customer mode) */}
          {mode === 'customer' && width >= 860 && (
            <Pressable
              onPress={handleRefreshLocation}
              style={[
                styles.locationPill,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                  borderColor: theme.border,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Refresh GPS Location"
            >
              <Ionicons
                name="location-sharp"
                size={14}
                color={BRAND_COLORS.primaryBlue}
              />
              <Text style={[styles.locationText, { color: theme.textPrimary }]} numberOfLines={1}>
                {isLocating ? 'Locating...' : displayLocation}
              </Text>
              <Ionicons name="chevron-down" size={12} color={theme.textSecondary} />
            </Pressable>
          )}
        </View>

        {/* Center: Navigation Links */}
        <View style={styles.linksRow}>
          {links.map((link) => {
            const isActive =
              pathname === link.path ||
              (link.path === '/(customer)/(tabs)' &&
                (pathname === '/(customer)/(tabs)' || pathname === '/(customer)' || pathname === '/'));

            return (
              <Pressable
                key={link.path}
                onPress={() => router.push(link.path as any)}
                style={[
                  styles.navLink,
                  isActive && {
                    backgroundColor: isDark ? 'rgba(23, 105, 232, 0.2)' : '#EFF6FF',
                  },
                ]}
                accessibilityRole="link"
              >
                <Text
                  style={[
                    styles.navLinkText,
                    {
                      color: isActive ? BRAND_COLORS.primaryBlue : theme.textSecondary,
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                >
                  {link.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Right: Actions (Portal Switch, SOS Call, Theme Toggle, CTA) */}
        <View style={styles.actionsGroup}>
          {/* Portal Switcher Button */}
          <Pressable
            onPress={handlePortalSwitch}
            style={[
              styles.portalSwitchBtn,
              {
                backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                borderColor: theme.border,
              },
            ]}
            accessibilityRole="button"
          >
            <Ionicons
              name={mode === 'mechanic' ? 'person-circle-outline' : 'construct-outline'}
              size={15}
              color={mode === 'mechanic' ? BRAND_COLORS.primaryBlue : BRAND_COLORS.successGreen}
            />
            <Text
              style={[
                styles.portalSwitchText,
                {
                  color: mode === 'mechanic' ? BRAND_COLORS.primaryBlue : BRAND_COLORS.successGreen,
                },
              ]}
            >
              {mode === 'mechanic' ? 'Customer App' : 'Mechanic Portal'}
            </Text>
          </Pressable>

          {/* SOS Hotline */}
          <Pressable
            onPress={handleSOSCall}
            style={styles.sosButton}
            accessibilityRole="button"
            accessibilityLabel="Call 24/7 Roadside Hotline"
          >
            <Ionicons name="call" size={13} color="#DC2626" />
            <Text style={styles.sosText}>1800-MECH-FIND</Text>
          </Pressable>

          {/* Theme Toggle */}
          <Pressable
            onPress={toggleTheme}
            style={[
              styles.iconBtn,
              {
                backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                borderColor: theme.border,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Toggle Theme"
          >
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={16}
              color={isDark ? '#F59E0B' : theme.textPrimary}
            />
          </Pressable>

          {/* Primary Quick CTA (Only on Customer mode) */}
          {mode === 'customer' && (
            <Pressable
              onPress={() => router.push('/(customer)/breakdown-request')}
              style={styles.bookCtaBtn}
              accessibilityRole="button"
            >
              <Ionicons name="flash" size={14} color="#FFFFFF" />
              <Text style={styles.bookCtaText}>Book Fix</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    width: '100%',
    borderBottomWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    zIndex: 50,
  },
  navInner: {
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logoPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoImage: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
    lineHeight: 18,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 12,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    maxWidth: 180,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  navLink: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  navLinkText: {
    fontSize: 13,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  portalSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  portalSwitchText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.25)',
  },
  sosText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '700',
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  bookCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: BRAND_COLORS.primaryBlue,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.md,
  },
  bookCtaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});

