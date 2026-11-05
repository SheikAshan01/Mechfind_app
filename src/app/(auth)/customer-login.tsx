import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { BRAND_COLORS } from '../../theme/colors';
import { useAuthStore } from '../../stores/authStore';
import { useResponsive } from '../../hooks/useResponsive';
import {
  AuthCarHeader,
  BottomLeftYellowGlow,
} from '../../components/auth/AuthCarHeader';

const GoogleIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <Path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <Path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <Path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </Svg>
);

export default function CustomerLoginScreen() {
  const insets = useSafeAreaInsets();
  const { isTablet, isDesktop } = useResponsive();
  const loginCustomer = useAuthStore((state) => state.loginCustomer);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setErrors({});
    if (!identifier.trim()) {
      setErrors({ identifier: 'Please enter your email or mobile number' });
      return;
    }
    if (!password || password.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' });
      return;
    }

    try {
      setIsSubmitting(true);
      await loginCustomer(identifier, 'Customer');
      router.replace('/(customer)/(tabs)');
    } catch {
      setErrors({ general: 'Invalid credentials. Please verify your details.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider: 'Google' | 'Apple') => {
    try {
      setIsSubmitting(true);
      await loginCustomer(`user_${provider.toLowerCase()}@mechfind.com`, `${provider} User`);
      router.replace('/(customer)/(tabs)');
    } catch {
      setErrors({ general: `${provider} sign in failed. Please try again.` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isWide = isTablet || isDesktop;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <StatusBar style="light" />

      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Dark Automotive Header with Back Arrow & MECHFIND Emblem */}
        <AuthCarHeader variant="compact" showBack onBack={() => router.replace('/(auth)/role-select')} />

        {/* Curved White Bottom Card */}
        <View
          style={[
            styles.bottomSheet,
            isWide && styles.bottomSheetWide,
            { paddingBottom: Math.max(insets.bottom, 24) + 16 },
          ]}
        >
          {/* Subtle bottom-left corner accent */}
          <BottomLeftYellowGlow />

          <View style={styles.sheetContent}>
            <Text style={styles.heading}>Customer Login</Text>
            <Text style={styles.subtitle}>
              Welcome back! Please sign in to your account.
            </Text>

            {errors.general ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color="#DC2626" />
                <Text style={styles.errorText}>{errors.general}</Text>
              </View>
            ) : null}

            {/* Input 1: Email or Mobile Number */}
            <View
              style={[
                styles.inputWrapper,
                errors.identifier ? styles.inputWrapperError : undefined,
              ]}
            >
              <Ionicons name="person-outline" size={20} color="#6B7280" />
              <TextInput
                style={styles.textInput}
                placeholder="Email or Mobile Number"
                placeholderTextColor="#9CA3AF"
                value={identifier}
                onChangeText={(text) => {
                  setIdentifier(text);
                  if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: undefined }));
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {errors.identifier ? (
              <Text style={styles.fieldErrorText}>{errors.identifier}</Text>
            ) : null}

            {/* Input 2: Password */}
            <View
              style={[
                styles.inputWrapper,
                { marginTop: 14 },
                errors.password ? styles.inputWrapperError : undefined,
              ]}
            >
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
              <TextInput
                style={styles.textInput}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#6B7280"
                />
              </Pressable>
            </View>
            {errors.password ? (
              <Text style={styles.fieldErrorText}>{errors.password}</Text>
            ) : null}

            {/* Forgot Password Link */}
            <Pressable
              onPress={() => router.push('/(auth)/forgot-password')}
              style={styles.forgotPasswordButton}
              accessibilityRole="link"
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </Pressable>

            {/* Primary Login Button */}
            <Pressable
              onPress={handleLogin}
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.loginButton,
                { opacity: pressed || isSubmitting ? 0.9 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Login to customer account"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#111827" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </Pressable>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Logins */}
            <View style={styles.socialButtonsList}>
              {/* Google Button */}
              <Pressable
                onPress={() => handleSocialLogin('Google')}
                style={({ pressed }) => [
                  styles.socialButton,
                  { opacity: pressed ? 0.9 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Continue with Google"
              >
                <GoogleIcon size={20} />
                <Text style={styles.socialButtonText}>Continue with Google</Text>
              </Pressable>

              {/* Apple Button */}
              <Pressable
                onPress={() => handleSocialLogin('Apple')}
                style={({ pressed }) => [
                  styles.socialButton,
                  { opacity: pressed ? 0.9 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Continue with Apple"
              >
                <Ionicons name="logo-apple" size={22} color="#000000" />
                <Text style={styles.socialButtonText}>Continue with Apple</Text>
              </Pressable>
            </View>

            {/* Footer */}
            <View style={styles.footerRow}>
              <Text style={styles.footerPrompt}>Don't have an account? </Text>
              <Pressable
                onPress={() => router.push('/(auth)/customer-signup')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="link"
              >
                <Text style={styles.footerLink}>Sign Up</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#101114',
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#101114',
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -16,
    paddingTop: 28,
    paddingHorizontal: 22,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  bottomSheetWide: {
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    borderRadius: 32,
    marginTop: 0,
    marginBottom: 32,
  },
  sheetContent: {
    width: '100%',
    zIndex: 2,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    flex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  inputWrapperError: {
    borderColor: '#DC2626',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    marginLeft: 12,
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 4,
  },
  fieldErrorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
    marginLeft: 4,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
  },
  loginButton: {
    height: 52,
    backgroundColor: BRAND_COLORS.brandYellow,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BRAND_COLORS.brandYellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginHorizontal: 12,
  },
  socialButtonsList: {
    gap: 12,
  },
  socialButton: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerPrompt: {
    fontSize: 14,
    color: '#6B7280',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D97706',
  },
});
