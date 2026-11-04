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
import { useAuthStore } from '../../stores/authStore';
import { useResponsive } from '../../hooks/useResponsive';

export default function CustomerOtpScreen() {
  const { theme, isDark } = useTheme();
  const { isSmallDevice, horizontalPadding, isTablet, isDesktop } = useResponsive();
  const params = useLocalSearchParams<{ phone?: string; fullName?: string }>();
  const phone = params.phone || '9876543210';
  const fullName = params.fullName || 'Arjun Kapoor';

  const loginCustomer = useAuthStore((state) => state.loginCustomer);

  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(45);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    setError(null);
    const validation = otpSchema.safeParse(otp);
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setIsVerifying(true);
    try {
      await loginCustomer(phone, fullName);
      router.replace('/(customer)/(tabs)');
    } catch {
      setError('Verification code is invalid or expired. Please retry.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    if (timer > 0) return;
    setTimer(45);
    setError(null);
  };

  return (
    <ScreenContainer scrollable withPadding={false}>
      <Header title="Verify Phone" showBack showThemeToggle />

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
          <View style={[styles.iconCircle, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF' }]}>
            <Ionicons name="shield-checkmark" size={32} color={BRAND_COLORS.primaryBlue} />
          </View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Enter 6-Digit OTP
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            A verification code was sent via SMS to{' '}
            <Text style={{ fontWeight: '700', color: theme.textPrimary }}>
              +91 {phone}
            </Text>
          </Text>
        </View>

        <Input
          label="Verification Code"
          placeholder="000000"
          value={otp}
          onChangeText={(val) => {
            setOtp(val);
            if (val.length === 6) {
              setError(null);
            }
          }}
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
            For local testing/sandbox, enter any 6 digits (e.g. 123456).
          </Text>
        </View>

        <Button
          title="Verify & Continue"
          onPress={handleVerify}
          loading={isVerifying}
          disabled={otp.length !== 6}
          style={styles.verifyBtn}
        />

        <View style={styles.resendArea}>
          {timer > 0 ? (
            <Text style={[styles.timerText, { color: theme.textSecondary }]}>
              Resend code in <Text style={{ fontWeight: '700' }}>{timer}s</Text>
            </Text>
          ) : (
            <Pressable onPress={handleResend} hitSlop={8} accessibilityRole="button">
              <Text style={[styles.resendLink, { color: isDark ? BRAND_COLORS.brandYellow : '#B45309' }]}>
                Resend Verification Code
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
    width: 64,
    height: 64,
    borderRadius: 32,
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
    lineHeight: 20,
    maxWidth: 320,
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
    flex: 1,
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
