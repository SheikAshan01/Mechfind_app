'use client';

import { useState, useEffect } from 'react';

export type DeviceOS = 'android' | 'ios' | 'desktop';

export interface DeviceInfo {
  os: DeviceOS;
  isAndroid: boolean;
  isIOS: boolean;
  isMobile: boolean;
  storeName: string;
  downloadUrl: string;
  downloadLabel: string;
  badgeSubtext: string;
}

// Download destinations (Google Play Store, Apple App Store, or direct APK download fallback)
export const APP_DOWNLOAD_LINKS = {
  android: 'https://play.google.com/store/apps/details?id=com.mechfind.app',
  androidApk: '/downloads/mechfind-release.apk',
  ios: 'https://apps.apple.com/app/mechfind-roadside-assistance/id6478901234',
};

export function useDeviceOS(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    os: 'desktop',
    isAndroid: false,
    isIOS: false,
    isMobile: false,
    storeName: 'Google Play & App Store',
    downloadUrl: APP_DOWNLOAD_LINKS.android,
    downloadLabel: 'Download Mobile App',
    badgeSubtext: 'Available for Android & iOS',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = window.navigator.userAgent.toLowerCase();
    const isAndroid = /android/.test(ua);
    const isIOS =
      /iphone|ipad|ipod/.test(ua) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);

    if (isAndroid) {
      setDeviceInfo({
        os: 'android',
        isAndroid: true,
        isIOS: false,
        isMobile: true,
        storeName: 'Google Play',
        downloadUrl: APP_DOWNLOAD_LINKS.android,
        downloadLabel: 'Download for Android',
        badgeSubtext: 'Get it on Google Play',
      });
    } else if (isIOS) {
      setDeviceInfo({
        os: 'ios',
        isAndroid: false,
        isIOS: true,
        isMobile: true,
        storeName: 'App Store',
        downloadUrl: APP_DOWNLOAD_LINKS.ios,
        downloadLabel: 'Download on App Store',
        badgeSubtext: 'Download on the Apple App Store',
      });
    } else {
      setDeviceInfo({
        os: 'desktop',
        isAndroid: false,
        isIOS: false,
        isMobile: false,
        storeName: 'Google Play & App Store',
        downloadUrl: APP_DOWNLOAD_LINKS.android,
        downloadLabel: 'Download Mobile App',
        badgeSubtext: 'Available for Android & iOS',
      });
    }
  }, []);

  return deviceInfo;
}

