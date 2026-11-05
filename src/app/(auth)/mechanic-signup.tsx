import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { mechanicSignupSchema } from '../../schemas/authSchemas';
import { useResponsive } from '../../hooks/useResponsive';

export default function MechanicSignupScreen() {
  const { theme, isDark } = useTheme();
  const { horizontalPadding, isTablet } = useResponsive();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [shopName, setShopName] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = () => {
    setErrors({});
    const validation = mechanicSignupSchema.safeParse({
      fullName,
      phoneNumber: phone,
      email,
      shopName,
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
    setTimeout(() => {
      setIsSubmitting(false);
      router.push({
        pathname: '/(auth)/mechanic-otp',
        params: { phone, shopName, fullName },
      });
    }, 600);
  };

  return (
    <ScreenContainer scrollable withPadding={false}>
      <Header title="Mechanic Partner Signup" showBack showThemeToggle />

      <View
        style={[
          styles.content,
          {
            paddingHorizontal: horizontalPadding,
            maxWidth: isTablet ? 480 : undefined,
            alignSelf: isTablet ? 'center' : undefined,
            width: isTablet ? '100%' : undefined,
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={styles.headerArea}>
          <Image source={require('../../../assets/images/app-emblem.png')} style={styles.logoImage} resizeMode="contain" accessibilityLabel="MECHFIND app emblem" />
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Partner With MECHFIND
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Create a mechanic account and add your workshop details to get started.
          </Text>
        </View>

        <Input
          label="Your Full Name"
          placeholder="e.g. Rajesh Sharma"
          value={fullName}
          onChangeText={setFullName}
          error={errors.fullName}
          autoCapitalize="words"
          leftIcon={<Ionicons name="person-outline" size={20} color={theme.textSecondary} />}
        />

        <Input
          label="Workshop / Garage Name"
          placeholder="e.g. Apex Speed Garage & Repairs"
          value={shopName}
          onChangeText={setShopName}
          error={errors.shopName}
          leftIcon={<Ionicons name="business-outline" size={20} color={theme.textSecondary} />}
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
          placeholder="contact@workshop.com"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          leftIcon={<Ionicons name="mail-outline" size={20} color={theme.textSecondary} />}
        />

        <Input
          label="Password"
          placeholder="Min 8 characters"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} />}
        />

        <Button
          title="Continue to Phone Verification"
          onPress={handleSignup}
          loading={isSubmitting}
          style={styles.submitBtn}
        />

        <View style={styles.loginRow}>
          <Text style={{ color: theme.textSecondary }}>Already a registered partner? </Text>
          <Pressable onPress={() => router.push('/(auth)/mechanic-login')} hitSlop={8} accessibilityRole="button">
            <Text style={[styles.loginLink, { color: isDark ? BRAND_COLORS.brandYellow : '#B45309' }]}>
              Log In
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
    width: 60,
    height: 60,
    marginBottom: SPACING.sm,
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
  submitBtn: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
    flexWrap: 'wrap',
  },
  loginLink: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '700',
  },
});
