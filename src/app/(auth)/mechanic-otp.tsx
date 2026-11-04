import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { BRAND_COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Header } from '../../components/ui/Header';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { otpSchema } from '../../schemas/authSchemas';
import { useResponsive } from '../../hooks/useResponsive';

export default function MechanicOtpScreen() {
  const { theme, isDark } = useTheme();
  const { isSmallDevice, horizontalPadding, isTablet, isDesktop } = useResponsive();
  const params = useLocalSearchParams<{ phone?: string; shopName?: string; fullName?: string }>();
  const phone = params.phone || '';
  const shopName = params.shopName || 'Partner Workshop';
  const fullName = params.fullName || 'Partner Technician';

  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(45);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = () => {
    setError(null);
    const validation = otpSchema.safeParse(otp);
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      router.replace({
        pathname: '/(auth)/mechanic-register',
        params: { phone, shopName, fullName },
      });
    }, 600);
  };

  return (
    <ScreenContainer scrollable withPadding={false}>
      <Header title="Verify Mobile" showBack showThemeToggle />

      <View
        style={[
          styles.content,
          {
            paddingHorizontal: horizontalPadding,
            maxWidth: isTablet || isDesktop ? 480 : undefined,
            alignSelf: isTablet || isDesktop ? 'center' : undefined,
            width: isTablet || isDesktop ? '100%' : undefined,
          },
        ]}
      >
        <View style={styles.headerArea}>
          <View style={[styles.iconCircle, { backgroundColor: BRAND_COLORS.primaryBlue }]}>
            <Ionicons name="construct" size={28} color="#FFFFFF" />
          </View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Mechanic Verification
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Enter 6-digit code sent to +91 {phone}
          </Text>
        </View>

        <Input
          label="Verification Code"
          placeholder="000000"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          error={error || undefined}
          inputStyle={[
            styles.otpInput,
            {
              fontSize: isSmallDevice ? 20 : 23,
              letterSpacing: isSmallDevice ? 6 : 9,
            },
          ]}
        />

        <View style={styles.tipBox}>
          <Ionicons name="information-circle-outline" size={15} color={theme.textSecondary} />
          <Text style={[styles.tipText, { color: theme.textSecondary }]}>
            Sandbox code: 123456 (or any 6 digits)
          </Text>
        </View>

        <Button
          title="Verify & Setup Workshop"
          onPress={handleVerify}
          loading={isVerifying}
          disabled={otp.length !== 6}
          style={styles.verifyBtn}
        />

        <View style={styles.resendArea}>
          {timer > 0 ? (
            <Text style={[styles.timerText, { color: theme.textSecondary }]}>
              Resend code in {timer}s
            </Text>
          ) : (
            <Pressable onPress={() => setTimer(45)} hitSlop={8} accessibilityRole="button">
              <Text style={[styles.resendLink, { color: isDark ? BRAND_COLORS.brandYellow : '#B45309' }]}>
                Resend Code
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h2,
    textAlign: 'center',
    marginBottom: SPACING.xxs,
  },
  subtitle: {
    ...TYPOGRAPHY.bodySmall,
    textAlign: 'center',
  },
  otpInput: {
    textAlign: 'center',
    fontWeight: '700',
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.xxs,
    marginBottom: SPACING.md,
  },
  tipText: {
    ...TYPOGRAPHY.caption,
  },
  verifyBtn: {
    marginTop: SPACING.xs,
  },
  resendArea: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  timerText: {
    ...TYPOGRAPHY.bodySmall,
  },
  resendLink: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
  },
});
