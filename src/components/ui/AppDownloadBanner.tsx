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
import { Ionicons } from '@expo/vector-icons';
import { BRAND_COLORS } from '../../theme/colors';
import { RADIUS } from '../../theme/radius';
import { SPACING } from '../../theme/spacing';

export const AppDownloadBanner: React.FC = () => {
  // Only render on Web browsers
  if (Platform.OS !== 'web') {
    return null;
  }

  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  // Detect client platform via userAgent on web
  let isAndroid = false;
  let isIOS = false;
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    const ua = navigator.userAgent || '';
    isAndroid = /android/i.test(ua);
    isIOS = /iphone|ipad|ipod/i.test(ua);
  }

  const handleDownloadAndroid = () => {
    // Direct link to the compiled Android APK release or store
    Linking.openURL('https://github.com/mechfind/app/releases/latest/download/mechfind.apk').catch(() => {
      window?.open?.('/downloads/mechfind.apk', '_blank');
    });
  };

  const handleDownloadIOS = () => {
    // Link to Apple App Store
    Linking.openURL('https://apps.apple.com/app/mechfind-roadside/id6400000000').catch(() => {
      alert('MECHFIND iOS is currently in Apple TestFlight preview.');
    });
  };

  return (
    <View style={styles.bannerContainer}>
      <View style={styles.bannerInner}>
        {/* Device-Specific Message & Action */}
        {isAndroid ? (
          <View style={styles.contentRow}>
            <View style={styles.deviceIconBox}>
              <Ionicons name="logo-android" size={20} color="#16A34A" />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.bannerTitle}>
                Android Device Detected
              </Text>
              <Text style={styles.bannerSub}>
                Get faster GPS tracking and 24/7 instant dispatch with the MECHFIND Android APK.
              </Text>
            </View>
            <Pressable
              onPress={handleDownloadAndroid}
              style={[styles.downloadBtn, { backgroundColor: '#16A34A' }]}
              accessibilityRole="button"
              accessibilityLabel="Download Android APK"
            >
              <Ionicons name="download-outline" size={16} color="#FFFFFF" />
              <Text style={styles.downloadBtnText}>Download APK</Text>
            </Pressable>
          </View>
        ) : isIOS ? (
          <View style={styles.contentRow}>
            <View style={styles.deviceIconBox}>
              <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.bannerTitle}>
                iPhone / iPad Detected
              </Text>
              <Text style={styles.bannerSub}>
                Install MECHFIND from the Apple App Store for roadside notifications.
              </Text>
            </View>
            <Pressable
              onPress={handleDownloadIOS}
              style={[styles.downloadBtn, { backgroundColor: '#17243A' }]}
              accessibilityRole="button"
              accessibilityLabel="Download on Apple App Store"
            >
              <Ionicons name="logo-apple-appstore" size={16} color="#FFFFFF" />
              <Text style={styles.downloadBtnText}>App Store</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.contentRow}>
            <Image
              source={require('../../../assets/images/mechfind_logo.png')}
              style={styles.logoBadge}
              resizeMode="contain"
            />
            <View style={styles.textCol}>
              <Text style={styles.bannerTitle}>
                Experience MECHFIND on Mobile
              </Text>
              <Text style={styles.bannerSub}>
                Available for Android APK & iOS. Real-time GPS mechanics dispatch on your phone.
              </Text>
            </View>
            <View style={styles.dualButtonsRow}>
              <Pressable
                onPress={handleDownloadAndroid}
                style={[styles.smallBtn, { backgroundColor: '#16A34A' }]}
                accessibilityRole="button"
                accessibilityLabel="Download Android APK"
              >
                <Ionicons name="logo-android" size={15} color="#FFFFFF" />
                <Text style={styles.smallBtnText}>Android APK</Text>
              </Pressable>
              <Pressable
                onPress={handleDownloadIOS}
                style={[styles.smallBtn, { backgroundColor: '#17243A' }]}
                accessibilityRole="button"
                accessibilityLabel="Download iOS App"
              >
                <Ionicons name="logo-apple" size={15} color="#FFFFFF" />
                <Text style={styles.smallBtnText}>iOS App</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Dismiss Button */}
        <Pressable
          onPress={() => setIsDismissed(true)}
          style={styles.closeBtn}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Dismiss App Download Banner"
        >
          <Ionicons name="close" size={18} color="#64748B" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    zIndex: 100,
  },
  bannerInner: {
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  deviceIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  textCol: {
    flex: 1,
    minWidth: 200,
  },
  bannerTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  bannerSub: {
    color: '#94A3B8',
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 1,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.md,
  },
  downloadBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  dualButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  smallBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
    marginLeft: 6,
  },
});

