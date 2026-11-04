import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { BRAND_COLORS } from '../../theme/colors';
import { RADIUS } from '../../theme/radius';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Header } from '../../components/ui/Header';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { customerLoginSchema } from '../../schemas/authSchemas';
import { useAuthStore } from '../../stores/authStore';
import { useResponsive } from '../../hooks/useResponsive';

type LoginMode = 'password' | 'otp';

export default function CustomerLoginScreen() {
  const { theme, isDark } = useTheme();
  const { horizontalPadding, isTablet, isDesktop } = useResponsive();
  const loginCustomer = useAuthStore((state) => state.loginCustomer);

  const [loginMode, setLoginMode] = useState<LoginMode>('password');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setErrors({});

    if (loginMode === 'otp') {
      if (!phone || phone.replace(/\D/g, '').length < 10) {
        setErrors({ phone: 'Please enter a valid 10-digit mobile number' });
        return;
      }
      router.push({
        pathname: '/(auth)/customer-otp',
        params: { phone },
      });
      return;
    }

    const validation = customerLoginSchema.safeParse({
      phoneNumber: phone,
      password: password,
    });

    if (!validation.success) {
      const fieldErrors: { phone?: string; password?: string } = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0] === 'phoneNumber') fieldErrors.phone = err.message;
        if (err.path[0] === 'password') fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await loginCustomer(phone, 'Customer');
      router.replace('/(customer)/(tabs)');
    } catch {
      setErrors({ general: 'Invalid credentials. Please verify your phone number and password.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestOtp = () => {
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setErrors({ phone: 'Please enter a valid 10-digit mobile number first' });
      return;
    }
    router.push({
      pathname: '/(auth)/customer-otp',
      params: { phone },
    });
  };

  return (
    <ScreenContainer scrollable withPadding={false}>
      <Header title="Customer Login" showBack showThemeToggle />

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
          <Image
            source={require('../../../assets/images/mechfind_logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
            accessibilityLabel="MECHFIND Official Logo"
          />
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Welcome Back
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Log in to manage your vehicles and access 24/7 on-demand breakdown assistance.
          </Text>
        </View>

        {/* Tab Switcher: Password vs OTP Login */}
        <View style={[styles.modeTabsRow, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
          <Pressable
            onPress={() => {
              setLoginMode('password');
              setErrors({});
            }}
            style={[
              styles.modeTab,
              loginMode === 'password' && [
                styles.modeTabActive,
                { backgroundColor: theme.card },
              ],
            ]}
          >
            <Text
              style={[
                styles.modeTabText,
                {
                  color:
                    loginMode === 'password'
                      ? BRAND_COLORS.primary
                      : theme.textSecondary,
                  fontWeight: loginMode === 'password' ? '700' : '500',
                },
              ]}
            >
              Password Login
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setLoginMode('otp');
              setErrors({});
            }}
            style={[
              styles.modeTab,
              loginMode === 'otp' && [
                styles.modeTabActive,
                { backgroundColor: theme.card },
              ],
            ]}
          >
            <Text
              style={[
                styles.modeTabText,
                {
                  color:
                    loginMode === 'otp'
                      ? BRAND_COLORS.primary
                      : theme.textSecondary,
                  fontWeight: loginMode === 'otp' ? '700' : '500',
                },
              ]}
            >
              Instant OTP Login
            </Text>
          </Pressable>
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
          label="Mobile Number"
          placeholder="Enter 10-digit mobile number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          error={errors.phone}
          leftIcon={<Ionicons name="call-outline" size={20} color={theme.textSecondary} />}
          maxLength={10}
        />

        {loginMode === 'password' ? (
          <>
            <Input
              label="Password"
              placeholder="Enter your account password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} />}
              rightIcon={
                <Pressable onPress={() => setShowPassword((prev) => !prev)} hitSlop={8}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={theme.textSecondary}
                  />
                </Pressable>
              }
            />

            <View style={styles.forgotRow}>
              <Pressable
                onPress={() => router.push('/(auth)/forgot-password')}
                hitSlop={8}
                accessibilityRole="button"
              >
                <Text style={[styles.forgotText, { color: BRAND_COLORS.primary }]}>
                  Forgot Password?
                </Text>
              </Pressable>
            </View>

            <Button
              title="Sign In with Password"
              onPress={handleLogin}
              loading={isSubmitting}
              style={styles.actionBtn}
            />
          </>
        ) : (
          <Button
            title="Request Instant SMS OTP"
            onPress={handleRequestOtp}
            loading={isSubmitting}
            style={styles.actionBtn}
            icon={<Ionicons name="chatbubble-ellipses-outline" size={18} color="#FFFFFF" />}
          />
        )}

        <View style={styles.signupRow}>
          <Text style={{ color: theme.textSecondary }}>Don't have an account? </Text>
          <Pressable
            onPress={() => router.push('/(auth)/customer-signup')}
            hitSlop={8}
            accessibilityRole="button"
          >
            <Text style={[styles.signupLink, { color: BRAND_COLORS.primary }]}>
              Create Customer Account
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
  logoImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.h2,
    marginBottom: SPACING.xxs,
  },
  subtitle: {
    ...TYPOGRAPHY.bodySmall,
    lineHeight: 20,
  },
  modeTabsRow: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
    gap: 4,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeTabActive: {
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modeTabText: {
    fontSize: 13,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginBottom: SPACING.md,
  },
  forgotText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
  },
  actionBtn: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
    flexWrap: 'wrap',
  },
  signupLink: {
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
