import { useWindowDimensions } from 'react-native';

export interface ResponsiveInfo {
  width: number;
  height: number;
  fontScale: number;
  scale: number;
  isSmallDevice: boolean;
  isMediumDevice: boolean;
  isLargeDevice: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  isShortDevice: boolean;
  isLandscape: boolean;
  horizontalPadding: number;
  maxContentWidth: number;
  scaleFont: (size: number, minRatio?: number, maxRatio?: number) => number;
  moderateScale: (size: number, factor?: number) => number;
  getColumnWidth: (numColumns: number, gap?: number, containerPadding?: number) => number;
}

export function useResponsive(): ResponsiveInfo {
  const { width, height, fontScale, scale } = useWindowDimensions();

  // Screen classification
  const isSmallDevice = width < 375;
  const isMediumDevice = width >= 375 && width < 414;
  const isLargeDevice = width >= 414 && width < 768;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const isLargeDesktop = width >= 1440;
  const isShortDevice = height < 680;
  const isLandscape = width > height;

  // Responsive horizontal padding
  const horizontalPadding = width < 360 ? 12 : isDesktop ? 32 : isTablet ? 24 : 16;

  // Standard max content width for tablets / desktop web
  const maxContentWidth = isLargeDesktop ? 1440 : isDesktop ? 1280 : isTablet ? 880 : width;

  // Clamped font scaling to prevent extreme shrinking on small screens or huge blowout
  const scaleFont = (size: number, minRatio = 0.88, maxRatio = 1.15): number => {
    const baseWidth = 390; // Standard reference width (iPhone 14 / modern Android)
    const ratio = width / baseWidth;
    const clampedRatio = Math.min(Math.max(ratio, minRatio), maxRatio);
    return Math.round(size * clampedRatio);
  };

  // Moderate scale with factor
  const moderateScale = (size: number, factor = 0.5): number => {
    const baseWidth = 390;
    const ratio = width / baseWidth;
    return Math.round(size + (size * ratio - size) * factor);
  };

  // Dynamic grid column width calculation
  const getColumnWidth = (numColumns: number, gap = 12, containerPadding = horizontalPadding * 2): number => {
    const effectiveWidth = Math.min(width, maxContentWidth);
    const availableWidth = effectiveWidth - containerPadding - gap * (numColumns - 1);
    return Math.max(0, Math.floor(availableWidth / numColumns));
  };

  return {
    width,
    height,
    fontScale,
    scale,
    isSmallDevice,
    isMediumDevice,
    isLargeDevice,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isShortDevice,
    isLandscape,
    horizontalPadding,
    maxContentWidth,
    scaleFont,
    moderateScale,
    getColumnWidth,
  };
}

