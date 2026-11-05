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
import { phoneSchema } from '../../schemas/authSchemas';
import { useAuthStore } from '../../stores/authStore';
import { useResponsive } from '../../hooks/useResponsive';

type LoginMode = 'password' | 'otp';

export default function MechanicLoginScreen() {
  const { theme, isDark } = useTheme();
  const { horizontalPadding, isTablet, isDesktop } = useResponsive();
  const loginMechanic = useAuthStore((state) => state.loginMechanic);

  const [loginMode, setLoginMode] = useState<LoginMode>('password');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setErrors({});

    const phoneValid = phoneSchema.safeParse(phone);
    if (!phoneValid.success) {
      setErrors({ phone: phoneValid.error.issues[0].message });
      return;
    }

    if (loginMode === 'password') {
      if (!password || password.length < 6) {
        setErrors({ password: 'Password must be at least 6 characters' });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (loginMode === 'otp') {
        router.push({
          pathname: '/(auth)/mechanic-otp',
          params: { phone },
        });
        return;
      }

      await loginMechanic(phone, 'Workshop Partner', 'approved');
      router.replace('/(mechanic)/(tabs)');
    } catch {
      setErrors({ general: 'Invalid mechanic login credentials. Please verify your details.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer scrollable withPadding={false}>
      <Header title="Mechanic Partner Portal" showBack showThemeToggle />

      <View
        style={[
          styles.content,
          {
            paddingHorizontal: horizontalPadding,
            maxWidth: isTablet || isDesktop ? 480 : undefined,
            alignSelf: isTablet || isDesktop ? 'center' : undefined,
            width: isTablet || isDesktop ? '100%' : undefined,
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={styles.headerArea}>
          <Image
            source={require('../../../assets/images/app-emblem.png')}
            style={styles.logoImage}
            resizeMode="contain"
            accessibilityLabel="MECHFIND Partner Logo"
          />
          <View style={styles.partnerBadge}><Text style={styles.partnerBadgeText}>MECHFIND PARTNER</Text></View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Partner Sign In
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Sign in to manage your workshop, services and service requests.
          </Text>
        </View>

        {/* Tab Switcher: Password vs OTP */}
        <View style={[styles.modeTabsRow, { backgroundColor: isDark ? '#222328' : '#F1F2F4' }]}>
          <Pressable
            onPress={() => {
              setLoginMode('password');
              setErrors({});
            }}
            style={[
              styles.modeTab,
              loginMode === 'password' && [
                styles.modeTabActive,
                { backgroundColor: theme.accent },
              ],
            ]}
          >
            <Text
              style={[
                styles.modeTabText,
                {
                  color:
                    loginMode === 'password'
                      ? '#17181C'
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
                { backgroundColor: theme.accent },
              ],
            ]}
          >
            <Text
              style={[
                styles.modeTabText,
                {
                  color:
                    loginMode === 'otp'
                      ? '#17181C'
                      : theme.textSecondary,
                  fontWeight: loginMode === 'otp' ? '700' : '500',
                },
              ]}
            >
              OTP Login
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
          label="Registered Mobile Number"
          placeholder="Enter registered mobile number"
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
              placeholder="Enter your partner password"
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
              <Pressable onPress={() => router.push('/(auth)/forgot-password')} hitSlop={8} accessibilityRole="button">
                <Text style={[styles.forgotText, { color: BRAND_COLORS.primary }]}>
                  Forgot Password?
                </Text>
              </Pressable>
            </View>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isSubmitting}
              style={styles.actionBtn}
            />
          </>
        ) : (
          <Button
            title="Send OTP"
            onPress={handleLogin}
            loading={isSubmitting}
            style={styles.actionBtn}
            icon={<Ionicons name="chatbubble-ellipses-outline" size={18} color="#17181C" />}
          />
        )}

        <View style={styles.signupRow}>
          <Text style={{ color: theme.textSecondary }}>Want to partner with MECHFIND? </Text>
          <Pressable onPress={() => router.push('/(auth)/mechanic-register')} hitSlop={8} accessibilityRole="button">
            <Text style={[styles.signupLink, { color: BRAND_COLORS.primary }]}>
              Register Workshop
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderRadius: 24,
  },
  headerArea: {
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  logoImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    alignSelf: 'center',
  },
  partnerBadge: {
    alignSelf: 'center',
    backgroundColor: '#FFF3CC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: SPACING.xs,
  },
  partnerBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#17181C',
    letterSpacing: 0.5,
  },
  title: {
    ...TYPOGRAPHY.h2,
    marginBottom: SPACING.xxs,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.bodySmall,
    lineHeight: 20,
    textAlign: 'center',
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
