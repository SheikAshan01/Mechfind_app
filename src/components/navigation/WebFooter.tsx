import React from 'react';
import {
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BRAND_COLORS } from '../../theme/colors';
import { RADIUS } from '../../theme/radius';
import { SPACING } from '../../theme/spacing';
import { useResponsive } from '../../hooks/useResponsive';

export const WebFooter: React.FC = () => {
  const { isDesktop, isTablet, horizontalPadding } = useResponsive();

  const handleDialHelp = () => {
    Linking.openURL('tel:18006324346').catch(() => {
      // fallback
    });
  };

  const handleDownloadAndroid = () => {
    Linking.openURL('https://github.com/mechfind/app/releases/latest/download/mechfind.apk').catch(() => {
      window?.open?.('/downloads/mechfind.apk', '_blank');
    });
  };

  const handleDownloadIOS = () => {
    Linking.openURL('https://apps.apple.com/app/mechfind-roadside/id6400000000').catch(() => {
      alert('MECHFIND iOS is currently in Apple TestFlight preview.');
    });
  };

  return (
    <View style={styles.footerContainer}>
      {/* 1. Main Footer Grid Area */}
      <View
        style={[
          styles.footerInner,
          {
            paddingHorizontal: horizontalPadding,
            maxWidth: 1280,
          },
        ]}
      >
        {/* Top Helpline Ribbon */}
        <View style={styles.helplineRibbon}>
          <View style={styles.helplineTextCol}>
            <View style={styles.emergencyTag}>
              <Ionicons name="shield-checkmark" size={14} color="#16A34A" />
              <Text style={styles.emergencyTagText}>24/7 ROADSIDE EMERGENCY ASSISTANCE</Text>
            </View>
            <Text style={styles.helplineTitle}>Stranded on the road? We are here to help.</Text>
            <Text style={styles.helplineSub}>
              Call our toll-free breakdown dispatch line anytime across India.
            </Text>
          </View>

          <Pressable
            onPress={handleDialHelp}
            style={({ pressed }) => [
              styles.helplineButton,
              { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Call 1800-MECH-FIND Helpline"
          >
            <Ionicons name="call" size={18} color="#FFFFFF" />
            <Text style={styles.helplineButtonText}>1800-MECH-FIND (Toll-Free)</Text>
          </Pressable>
        </View>

        <View style={styles.divider} />

        {/* 4-Column Navigation Layout */}
        <View style={[styles.columnsRow, !isDesktop && styles.columnsRowWrap]}>
          {/* Col 1: Brand & About */}
          <View style={[styles.column, isDesktop ? styles.colBrand : styles.colMobile]}>
            <View style={styles.brandRow}>
              <Image
                source={require('../../../assets/images/mechfind_logo.png')}
                style={styles.brandLogo}
                resizeMode="contain"
                accessibilityLabel="MECHFIND Emblem"
              />
              <View>
                <Text style={styles.brandTitle}>MECHFIND</Text>
                <Text style={styles.brandSubtitle}>Roadside Assistance Network</Text>
              </View>
            </View>

            <Text style={styles.brandDesc}>
              India's fastest growing on-demand roadside assistance platform. Connecting stranded motorists with verified local mechanics in 15–25 minutes with upfront launch pricing.
            </Text>

            {/* App Badges */}
            <View style={styles.appsRow}>
              <Pressable
                onPress={handleDownloadAndroid}
                style={({ pressed }) => [
                  styles.appBadge,
                  { backgroundColor: '#16A34A', opacity: pressed ? 0.85 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Download Android APK"
              >
                <Ionicons name="logo-android" size={16} color="#FFFFFF" />
                <View>
                  <Text style={styles.appBadgeSmall}>DIRECT DOWNLOAD</Text>
                  <Text style={styles.appBadgeBold}>Android APK</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={handleDownloadIOS}
                style={({ pressed }) => [
                  styles.appBadge,
                  { backgroundColor: '#1E293B', opacity: pressed ? 0.85 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Download iOS App"
              >
                <Ionicons name="logo-apple" size={16} color="#FFFFFF" />
                <View>
                  <Text style={styles.appBadgeSmall}>AVAILABLE ON</Text>
                  <Text style={styles.appBadgeBold}>App Store</Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Col 2: Services */}
          <View style={[styles.column, isDesktop ? styles.colNav : styles.colHalf]}>
            <Text style={styles.columnTitle}>ROADSIDE SERVICES</Text>
            <Pressable
              onPress={() => router.push('/(customer)/breakdown-request')}
              style={styles.footerLink}
            >
              <Text style={styles.footerLinkText}>2-Wheeler Breakdown (₹199)</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/(customer)/breakdown-request')}
              style={styles.footerLink}
            >
              <Text style={styles.footerLinkText}>4-Wheeler Assistance (₹299)</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/(customer)/breakdown-request')}
              style={styles.footerLink}
            >
              <Text style={styles.footerLinkText}>Battery Jumpstart (₹299)</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/(customer)/breakdown-request')}
              style={styles.footerLink}
            >
              <Text style={styles.footerLinkText}>Flat Tyre & Puncture (₹199)</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/(customer)/breakdown-request')}
              style={styles.footerLink}
            >
              <Text style={styles.footerLinkText}>Emergency Towing (₹1,200)</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/(customer)/services-pricing')}
              style={styles.footerLink}
            >
              <Text style={[styles.footerLinkText, { color: BRAND_COLORS.primaryBlue }]}>
                View Full Launch Pricing →
              </Text>
            </Pressable>
          </View>

          {/* Col 3: Customer & Partner */}
          <View style={[styles.column, isDesktop ? styles.colNav : styles.colHalf]}>
            <Text style={styles.columnTitle}>QUICK ACCESS</Text>
            <Pressable
              onPress={() => router.push('/(customer)/breakdown-request')}
              style={styles.footerLink}
            >
              <Text style={styles.footerLinkText}>Book Breakdown Request</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/(customer)/nearby-mechanics')}
              style={styles.footerLink}
            >
              <Text style={styles.footerLinkText}>Find Nearby Garages</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/(customer)/(tabs)/requests')}
              style={styles.footerLink}
            >
              <Text style={styles.footerLinkText}>Track Active Job</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/(auth)/mechanic-login')}
              style={styles.footerLink}
            >
              <Text style={styles.footerLinkText}>Partner Workshop Login</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/(auth)/mechanic-register')}
              style={styles.footerLink}
            >
              <Text style={[styles.footerLinkText, { color: BRAND_COLORS.accentTeal }]}>
                Join as Mechanic Partner
              </Text>
            </Pressable>
          </View>

          {/* Col 4: Coverage & Trust */}
          <View style={[styles.column, isDesktop ? styles.colNav : styles.colMobile]}>
            <Text style={styles.columnTitle}>COVERAGE & PROMISE</Text>
            <View style={styles.promiseItem}>
              <Ionicons name="time" size={16} color="#16A34A" />
              <Text style={styles.promiseText}>15–25 Mins Average Dispatch ETA</Text>
            </View>
            <View style={styles.promiseItem}>
              <Ionicons name="cash" size={16} color="#16A34A" />
              <Text style={styles.promiseText}>Fixed Launch Pricing • 0 Surge</Text>
            </View>
            <View style={styles.promiseItem}>
              <Ionicons name="checkmark-done-circle" size={16} color="#16A34A" />
              <Text style={styles.promiseText}>100% Background Verified Mechanics</Text>
            </View>
            <View style={styles.coverageBox}>
              <Text style={styles.coverageTitle}>OPERATING CORRIDORS</Text>
              <Text style={styles.coverageText}>
                Chennai, Coimbatore, Madurai, Dindigul, Trichy, Salem, National & State Highway Corridors.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* 2. Bottom Copyright & Legal Links */}
        <View style={[styles.bottomBar, !isDesktop && styles.bottomBarWrap]}>
          <Text style={styles.copyrightText}>
            © {new Date().getFullYear()} MECHFIND Technologies Private Limited. All rights reserved.
          </Text>

          <View style={styles.legalLinksRow}>
            <Pressable
              onPress={() => router.push('/(customer)/services-pricing')}
              style={styles.legalLink}
            >
              <Text style={styles.legalLinkText}>Pricing Policy</Text>
            </Pressable>
            <Text style={styles.dotSeparator}>•</Text>
            <Pressable
              onPress={() => alert('MECHFIND Terms of Service: Fair service guarantee, zero surge, verified mechanic dispatch.')}
              style={styles.legalLink}
            >
              <Text style={styles.legalLinkText}>Terms of Service</Text>
            </Pressable>
            <Text style={styles.dotSeparator}>•</Text>
            <Pressable
              onPress={() => alert('MECHFIND Privacy Policy: Your GPS location is solely used for roadside assistance dispatch.')}
              style={styles.legalLink}
            >
              <Text style={styles.legalLinkText}>Privacy</Text>
            </Pressable>
            <Text style={styles.dotSeparator}>•</Text>
            <Pressable
              onPress={() => alert('MECHFIND Safety: Dedicated 24/7 SOS helpline and verified identity for every technician.')}
              style={styles.legalLink}
            >
              <Text style={styles.legalLinkText}>Safety</Text>
            </Pressable>
          </View>

          {/* Social Links */}
          <View style={styles.socialRow}>
            <Pressable
              onPress={() => Linking.openURL('https://wa.me/9118006324346')}
              style={styles.socialIcon}
              accessibilityLabel="MECHFIND WhatsApp"
            >
              <Ionicons name="logo-whatsapp" size={17} color="#94A3B8" />
            </Pressable>
            <Pressable
              onPress={() => Linking.openURL('https://twitter.com')}
              style={styles.socialIcon}
              accessibilityLabel="MECHFIND Twitter"
            >
              <Ionicons name="logo-twitter" size={17} color="#94A3B8" />
            </Pressable>
            <Pressable
              onPress={() => Linking.openURL('https://instagram.com')}
              style={styles.socialIcon}
              accessibilityLabel="MECHFIND Instagram"
            >
              <Ionicons name="logo-instagram" size={17} color="#94A3B8" />
            </Pressable>
            <Pressable
              onPress={() => Linking.openURL('https://linkedin.com')}
              style={styles.socialIcon}
              accessibilityLabel="MECHFIND LinkedIn"
            >
              <Ionicons name="logo-linkedin" size={17} color="#94A3B8" />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    width: '100%',
    backgroundColor: '#0B132B',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 40,
    paddingBottom: 32,
    marginTop: 48,
  },
  footerInner: {
    width: '100%',
    alignSelf: 'center',
  },
  helplineRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(23, 105, 245, 0.08)',
    borderColor: 'rgba(23, 105, 245, 0.25)',
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    paddingVertical: 18,
    paddingHorizontal: 22,
    flexWrap: 'wrap',
    gap: 16,
  },
  helplineTextCol: {
    flex: 1,
    minWidth: 260,
  },
  emergencyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  emergencyTagText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  helplineTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  helplineSub: {
    color: '#94A3B8',
    fontSize: 13,
  },
  helplineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#16A34A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
  },
  helplineButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#1E293B',
    marginVertical: 32,
  },
  columnsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 28,
  },
  columnsRowWrap: {
    flexWrap: 'wrap',
  },
  column: {
    gap: 12,
  },
  colBrand: {
    flex: 1.4,
    minWidth: 280,
  },
  colNav: {
    flex: 1,
    minWidth: 180,
  },
  colMobile: {
    width: '100%',
  },
  colHalf: {
    width: '46%',
    minWidth: 160,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandLogo: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  brandDesc: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
  appsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    flexWrap: 'wrap',
  },
  appBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  appBadgeSmall: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 9,
    fontWeight: '700',
  },
  appBadgeBold: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  columnTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  footerLink: {
    paddingVertical: 4,
  },
  footerLinkText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
  promiseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  promiseText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '500',
  },
  coverageBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: RADIUS.sm,
    padding: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  coverageTitle: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  coverageText: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  bottomBarWrap: {
    flexWrap: 'wrap',
  },
  copyrightText: {
    color: '#64748B',
    fontSize: 12,
  },
  legalLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  legalLink: {
    paddingVertical: 2,
  },
  legalLinkText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  dotSeparator: {
    color: '#475569',
    fontSize: 12,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  socialIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
