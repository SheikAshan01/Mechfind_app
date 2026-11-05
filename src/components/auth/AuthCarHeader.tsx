import React from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useResponsive } from '../../hooks/useResponsive';
import { MechfindLogo } from '../ui/MechfindLogo';

export const TopRightYellowStripes = () => (
  <View pointerEvents="none" style={styles.topRightAccents}>
    <Svg width={110} height={110} viewBox="0 0 110 110">
      <Path d="M60 -15 L125 50 L106 69 L41 4 Z" fill="#FFCD00" />
      <Path d="M94 -18 L132 20 L124 28 L86 -10 Z" fill="#F5B800" />
    </Svg>
  </View>
);

export const BottomLeftYellowGlow = () => (
  <View pointerEvents="none" style={styles.bottomLeftAccent}>
    <Svg width={120} height={120} viewBox="0 0 120 120">
      <Path
        d="M -20 140 Q 65 105 35 15 L -35 15 Z"
        fill="#FFCD00"
        opacity={0.32}
      />
    </Svg>
  </View>
);

interface AuthCarHeaderProps {
  variant?: 'welcome' | 'compact';
  showBack?: boolean;
  onBack?: () => void;
}

export const AuthCarHeader: React.FC<AuthCarHeaderProps> = ({
  variant = 'compact',
  showBack = true,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const { width, height, isTablet, isDesktop } = useResponsive();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/role-select');
    }
  };

  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 24);

  if (variant === 'welcome') {
    const isWide = isTablet || isDesktop || width >= 768;
    const heroHeight = isWide ? 260 : Math.min(Math.max(width * 0.72, 260), 340);

    return (
      <View
        style={[
          styles.welcomeContainer,
          {
            height: heroHeight,
            paddingTop: isWide ? 16 : topPadding,
          },
        ]}
      >
        <TopRightYellowStripes />
        <Image
          source={require('../../../assets/images/welcome-hero-car.png')}
          style={styles.welcomeHeroImage}
          resizeMode="cover"
          accessibilityLabel="MechFind luxury sports car header"
        />
      </View>
    );
  }

  // Compact variant for Login and Signup screens
  return (
    <View style={[styles.compactContainer, { paddingTop: topPadding }]}>
      <TopRightYellowStripes />

      <View style={styles.compactRow}>
        {showBack ? (
          <Pressable
            onPress={handleBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={({ pressed }) => [
              styles.backButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
        ) : (
          <View style={styles.backPlaceholder} />
        )}

        <View style={styles.emblemWrapper}>
          <MechfindLogo isDark={true} width={140} height={40} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  welcomeWrapper: {
    width: '100%',
    backgroundColor: '#101114',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeContainer: {
    width: '100%',
    backgroundColor: '#101114',
    position: 'relative',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  welcomeHeroImage: {
    width: '100%',
    height: '100%',
  },
  compactContainer: {
    width: '100%',
    backgroundColor: '#101114',
    paddingBottom: 22,
    position: 'relative',
    overflow: 'hidden',
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 70,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  backPlaceholder: {
    width: 44,
    height: 44,
  },
  emblemWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogoImage: {
    width: 170,
    height: 60,
  },
  topRightAccents: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
  },
  bottomLeftAccent: {
    position: 'absolute',
    bottom: -10,
    left: -10,
    zIndex: 1,
  },
});

