import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { BRAND_COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Header } from '../../components/ui/Header';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { phoneSchema } from '../../schemas/authSchemas';
import { useResponsive } from '../../hooks/useResponsive';

export default function ForgotPasswordScreen() {
  const { theme } = useTheme();
  const { horizontalPadding, isTablet, isDesktop } = useResponsive();

  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendReset = () => {
    setError(null);
    const valid = phoneSchema.safeParse(phone);
    if (!valid.success) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSent(true);
    }, 600);
  };

  return (
    <ScreenContainer scrollable withPadding={false}>
      <Header title="Account Recovery" showBack showThemeToggle />

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
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Reset Your Password
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Enter your registered mobile number. We will send a secure OTP to verify your identity and set a new password.
          </Text>
        </View>

        {isSent ? (
          <View style={[styles.successBox, { backgroundColor: theme.successBg }]}>
            <Ionicons name="checkmark-circle" size={32} color={BRAND_COLORS.success} />
            <Text style={[styles.successTitle, { color: theme.textPrimary }]}>
              OTP Sent Successfully
            </Text>
            <Text style={[styles.successDesc, { color: theme.textSecondary }]}>
              Verification instructions have been sent via SMS to +91 {phone}.
            </Text>
            <Button
              title="Return to Login"
              onPress={() => router.back()}
              style={{ marginTop: SPACING.lg, width: '100%' }}
            />
          </View>
        ) : (
          <>
            <Input
              label="Registered Mobile Number"
              placeholder="10-digit number"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              error={error || undefined}
              leftIcon={<Ionicons name="call-outline" size={20} color={theme.textSecondary} />}
              maxLength={10}
            />

            <Button
              title="Send Recovery OTP"
              onPress={handleSendReset}
              loading={loading}
              style={{ marginTop: SPACING.md }}
            />
          </>
        )}
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
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h2,
    marginBottom: SPACING.xxs,
  },
  subtitle: {
    ...TYPOGRAPHY.bodySmall,
    lineHeight: 20,
  },
  successBox: {
    padding: SPACING.xl,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  successTitle: {
    ...TYPOGRAPHY.h3,
    marginTop: SPACING.sm,
  },
  successDesc: {
    ...TYPOGRAPHY.bodySmall,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});
