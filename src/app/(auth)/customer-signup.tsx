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
import { BRAND_COLORS } from '../../theme/colors';
import { useResponsive } from '../../hooks/useResponsive';
import { AuthCarHeader } from '../../components/auth/AuthCarHeader';

export default function CustomerSignupScreen() {
  const insets = useSafeAreaInsets();
  const { isTablet, isDesktop } = useResponsive();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<{ [k: string]: string | undefined }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async () => {
    setErrors({});
    const newErrors: { [k: string]: string } = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = 'Please enter your full name';
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      setTimeout(() => {
        setIsSubmitting(false);
        router.push({
          pathname: '/(auth)/customer-otp',
          params: { phone: cleanPhone, fullName: fullName.trim() },
        });
      }, 500);
    } catch {
      setIsSubmitting(false);
      setErrors({ general: 'Registration failed. Please try again.' });
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
        contentContainerStyle={[
          styles.scrollContainer,
          isWide && styles.scrollContainerWide,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={isWide ? styles.desktopCardBox : styles.mobileBox}>
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
            <View style={styles.sheetContent}>
              <Text style={styles.heading}>Create Customer Account</Text>
              <Text style={styles.subtitle}>
                Book mechanics anytime, anywhere.
              </Text>

            {errors.general ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color="#DC2626" />
                <Text style={styles.errorText}>{errors.general}</Text>
              </View>
            ) : null}

            {/* Input 1: Full Name */}
            <View
              style={[
                styles.inputWrapper,
                errors.fullName ? styles.inputWrapperError : undefined,
              ]}
            >
              <Ionicons name="person-outline" size={20} color="#6B7280" />
              <TextInput
                style={styles.textInput}
                placeholder="Full Name"
                placeholderTextColor="#9CA3AF"
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                }}
                autoCapitalize="words"
              />
            </View>
            {errors.fullName ? (
              <Text style={styles.fieldErrorText}>{errors.fullName}</Text>
            ) : null}

            {/* Input 2: Mobile Number */}
            <View
              style={[
                styles.inputWrapper,
                { marginTop: 12 },
                errors.phone ? styles.inputWrapperError : undefined,
              ]}
            >
              <Ionicons name="call-outline" size={20} color="#6B7280" />
              <TextInput
                style={styles.textInput}
                placeholder="Mobile Number"
                placeholderTextColor="#9CA3AF"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
            {errors.phone ? (
              <Text style={styles.fieldErrorText}>{errors.phone}</Text>
            ) : null}

            {/* Input 3: Email (Optional) */}
            <View
              style={[
                styles.inputWrapper,
                { marginTop: 12 },
                errors.email ? styles.inputWrapperError : undefined,
              ]}
            >
              <Ionicons name="mail-outline" size={20} color="#6B7280" />
              <TextInput
                style={styles.textInput}
                placeholder="Email (Optional)"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email ? (
              <Text style={styles.fieldErrorText}>{errors.email}</Text>
            ) : null}

            {/* Input 4: Password */}
            <View
              style={[
                styles.inputWrapper,
                { marginTop: 12 },
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

            {/* Input 5: Confirm Password */}
            <View
              style={[
                styles.inputWrapper,
                { marginTop: 12 },
                errors.confirmPassword ? styles.inputWrapperError : undefined,
              ]}
            >
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
              <TextInput
                style={styles.textInput}
                placeholder="Confirm Password"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword)
                    setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#6B7280"
                />
              </Pressable>
            </View>
            {errors.confirmPassword ? (
              <Text style={styles.fieldErrorText}>{errors.confirmPassword}</Text>
            ) : null}

            {/* Primary Create Account Button */}
            <Pressable
              onPress={handleSignup}
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.createButton,
                { opacity: pressed || isSubmitting ? 0.9 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Create Customer Account"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#111827" size="small" />
              ) : (
                <Text style={styles.createButtonText}>Create Account</Text>
              )}
            </Pressable>

            {/* Footer */}
            <View style={styles.footerRow}>
              <Text style={styles.footerPrompt}>Already have an account? </Text>
              <Pressable
                onPress={() => router.push('/(auth)/customer-login')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="link"
              >
                <Text style={styles.footerLink}>Login</Text>
              </Pressable>
            </View>
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
  scrollContainerWide: {
    minHeight: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
    backgroundColor: '#090A0C',
  },
  desktopCardBox: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#101114',
    borderWidth: 1,
    borderColor: '#23252B',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 32,
    elevation: 16,
  },
  mobileBox: {
    width: '100%',
    flex: 1,
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
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginTop: 0,
    marginBottom: 0,
    paddingHorizontal: 28,
    borderRadius: 0,
    maxWidth: '100%',
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
    marginBottom: 20,
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
    height: 50,
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
  createButton: {
    height: 52,
    backgroundColor: BRAND_COLORS.brandYellow,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: BRAND_COLORS.brandYellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
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
