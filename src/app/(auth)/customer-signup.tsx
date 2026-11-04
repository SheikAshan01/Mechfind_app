import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
import { customerSignupSchema } from '../../schemas/authSchemas';
import { useResponsive } from '../../hooks/useResponsive';

export default function CustomerSignupScreen() {
  const { theme, isDark } = useTheme();
  const { horizontalPadding, isTablet, isDesktop } = useResponsive();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async () => {
    setErrors({});
    const validation = customerSignupSchema.safeParse({
      fullName,
      phoneNumber: phone,
      email,
      password,
    });

    if (!validation.success) {
      const fieldErrors: { [k: string]: string } = {};
      validation.error.issues.forEach((err) => {
        fieldErrors[String(err.path[0])] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      setTimeout(() => {
        setIsSubmitting(false);
        router.push({
          pathname: '/(auth)/customer-otp',
          params: { phone, fullName },
        });
      }, 600);
    } catch {
      setIsSubmitting(false);
      setErrors({ general: 'Registration failed. Please try again.' });
    }
  };

  return (
    <ScreenContainer scrollable withPadding={false}>
      <Header title="Create Account" showBack showThemeToggle />

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
            Join MECHFIND
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Create your motorist profile to request instant roadside breakdown assistance anytime.
          </Text>
        </View>

        {errors.general ? (
          <View style={[styles.errorBanner, { backgroundColor: theme.errorBg }]}>
            <Ionicons name="alert-circle" size={18} color={theme.error} />
            <Text style={[styles.errorBannerText, { color: theme.error }]}>
              {errors.general}
            </Text>
          </View>
        ) : null}

        <Input
          label="Full Name"
          placeholder="e.g. Arjun Kapoor"
          value={fullName}
          onChangeText={setFullName}
          error={errors.fullName}
          autoCapitalize="words"
          leftIcon={<Ionicons name="person-outline" size={20} color={theme.textSecondary} />}
        />

        <Input
          label="Mobile Number"
          placeholder="Enter 10-digit mobile number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          error={errors.phoneNumber}
          leftIcon={<Ionicons name="call-outline" size={20} color={theme.textSecondary} />}
          maxLength={10}
        />

        <Input
          label="Email Address"
          placeholder="name@domain.com"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          leftIcon={<Ionicons name="mail-outline" size={20} color={theme.textSecondary} />}
        />

        <Input
          label="Password"
          placeholder="Create password (min 8 chars)"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} />}
        />

        <Button
          title="Create Account & Verify"
          onPress={handleSignup}
          loading={isSubmitting}
          style={styles.submitBtn}
        />

        <View style={styles.loginRow}>
          <Text style={{ color: theme.textSecondary }}>Already have an account? </Text>
          <Pressable onPress={() => router.push('/(auth)/customer-login')} hitSlop={8} accessibilityRole="button">
            <Text style={[styles.loginLink, { color: isDark ? BRAND_COLORS.brandYellow : '#B45309' }]}>
              Sign In
            </Text>
          </Pressable>
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
  submitBtn: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  loginLink: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '700',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  errorBannerText: {
    ...TYPOGRAPHY.bodySmall,
    flex: 1,
  },
});
