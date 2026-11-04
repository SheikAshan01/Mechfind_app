import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BRAND_COLORS } from '../../theme/colors';
import { RADIUS } from '../../theme/radius';
import { SPACING } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';

interface RadarSearchAnimationProps {
  onCancel?: () => void;
  radiusKm?: number;
}

const SEARCH_STATUS_MESSAGES = [
  'Getting current location...',
  'Finding nearby mechanics...',
  'Checking mechanic availability...',
  'Finding the nearest verified mechanic...',
  'Mechanics found!',
];

export const RadarSearchAnimation: React.FC<RadarSearchAnimationProps> = ({
  onCancel,
  radiusKm = 15,
}) => {
  const { theme, isDark } = useTheme();
  const [messageIndex, setMessageIndex] = useState(0);

  // Animated values for 3 concentric radar ripple rings
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const ring3 = useRef(new Animated.Value(0)).current;

  // Pulse value for center pin
  const centerPulse = useRef(new Animated.Value(1)).current;

  // Rotation for radar sweep beam
  const sweepRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Message rotation progressing through the 5 specified search states
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev < SEARCH_STATUS_MESSAGES.length - 1 ? prev + 1 : prev));
    }, 1200);

    // Ripple animation loop
    const createRingAnimation = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(anim, {
              toValue: 1,
              duration: 2000,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = createRingAnimation(ring1, 0);
    const anim2 = createRingAnimation(ring2, 600);
    const anim3 = createRingAnimation(ring3, 1200);

    // Center pulse
    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(centerPulse, {
          toValue: 1.15,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(centerPulse, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Sweep rotation
    const sweepAnim = Animated.loop(
      Animated.timing(sweepRotate, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    anim1.start();
    anim2.start();
    anim3.start();
    pulseAnim.start();
    sweepAnim.start();

    return () => {
      clearInterval(messageInterval);
      anim1.stop();
      anim2.stop();
      anim3.stop();
      pulseAnim.stop();
      sweepAnim.stop();
    };
  }, []);

  const sweepInterpolation = sweepRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getRingStyle = (anim: Animated.Value) => {
    return {
      transform: [
        {
          scale: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1.8],
          }),
        },
      ],
      opacity: anim.interpolate({
        inputRange: [0, 0.4, 1],
        outputRange: [0.7, 0.4, 0],
      }),
    };
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#131D2E' : '#FFFFFF',
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.radarWrapper}>
        {/* Animated Concentric Radar Rings */}
        <Animated.View
          style={[
            styles.radarRing,
            getRingStyle(ring1),
            { borderColor: BRAND_COLORS.primary },
          ]}
        />
        <Animated.View
          style={[
            styles.radarRing,
            getRingStyle(ring2),
            { borderColor: BRAND_COLORS.accentTeal },
          ]}
        />
        <Animated.View
          style={[
            styles.radarRing,
            getRingStyle(ring3),
            { borderColor: BRAND_COLORS.primary },
          ]}
        />

        {/* Rotating Radar Sweep Line */}
        <Animated.View
          style={[
            styles.sweepBeam,
            {
              transform: [{ rotate: sweepInterpolation }],
            },
          ]}
        />

        {/* Floating Mechanic Ping Markers */}
        <View style={[styles.pingMarker, { top: 25, right: 40 }]}>
          <Ionicons name="construct" size={14} color={BRAND_COLORS.primary} />
        </View>
        <View style={[styles.pingMarker, { bottom: 30, left: 45 }]}>
          <Ionicons name="car" size={14} color={BRAND_COLORS.success} />
        </View>
        <View style={[styles.pingMarker, { top: 75, left: 30 }]}>
          <Ionicons name="flash" size={14} color="#F59E0B" />
        </View>

        {/* Center Pulsing GPS Pin */}
        <Animated.View
          style={[
            styles.centerBeacon,
            {
              transform: [{ scale: centerPulse }],
            },
          ]}
        >
          <View style={styles.centerGlow}>
            <Ionicons name="location" size={24} color="#FFFFFF" />
          </View>
        </Animated.View>
      </View>

      {/* Dynamic Status Text & Subtitle */}
      <View style={styles.statusTextWrap}>
        <Text style={[styles.mainStatusText, { color: theme.textPrimary }]}>
          {SEARCH_STATUS_MESSAGES[messageIndex]}
        </Text>
        <Text style={[styles.subStatusText, { color: theme.textSecondary }]}>
          Scanning verified garages within {radiusKm} km radius
        </Text>
      </View>

      {/* Cancel Search Button */}
      {onCancel && (
        <Pressable
          onPress={onCancel}
          style={[
            styles.cancelBtn,
            {
              borderColor: theme.border,
              backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
            },
          ]}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Cancel search"
        >
          <Ionicons name="close-circle-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>
            Cancel Search
          </Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.md,
    overflow: 'hidden',
    shadowColor: BRAND_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  radarWrapper: {
    width: 200,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  radarRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
  },
  sweepBeam: {
    position: 'absolute',
    width: 140,
    height: 2,
    backgroundColor: 'rgba(23, 105, 245, 0.4)',
    transformOrigin: 'center center' as any,
  },
  centerBeacon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(23, 105, 245, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerGlow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BRAND_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pingMarker: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  statusTextWrap: {
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  mainStatusText: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  subStatusText: {
    fontSize: 12,
    textAlign: 'center',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginTop: SPACING.md,
  },
  cancelBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
});
