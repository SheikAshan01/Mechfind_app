import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../theme/ThemeContext';
import { BRAND_COLORS } from '../../theme/colors';
import { RADIUS } from '../../theme/radius';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Header } from '../../components/ui/Header';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../stores/authStore';
import { useResponsive } from '../../hooks/useResponsive';

const VEHICLE_CATEGORIES = [
  { id: '2W', label: '2-Wheeler (Bikes & Scooters)', icon: 'bicycle-outline' as const },
  { id: '4W', label: '4-Wheeler (Cars & Sedans)', icon: 'car-sport-outline' as const },
  { id: 'CV', label: 'Commercial & Vans', icon: 'bus-outline' as const },
];

const SPECIALTY_OPTIONS = [
  'Battery Jumpstart',
  'Flat Tyre & Puncture',
  'Basic Diagnostics',
  'OBD Scanning',
  'Electrical & Wiring',
  'Engine Overheating',
  'AC & Cooling Service',
  'ECU Specialist',
  'Doorstep Water Wash',
  'Flatbed Towing',
];

export default function MechanicRegisterScreen() {
  const { theme, isDark } = useTheme();
  const { horizontalPadding, isTablet, isDesktop } = useResponsive();
  const loginMechanic = useAuthStore((state) => state.loginMechanic);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Personal
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Step 2: Workshop
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [serviceRadius, setServiceRadius] = useState('15');
  const [is24Hours, setIs24Hours] = useState(true);

  // Step 3: Professional
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>(['2W', '4W']);
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'Battery Jumpstart',
    'Flat Tyre & Puncture',
    'Basic Diagnostics',
  ]);
  const [experienceYears, setExperienceYears] = useState('8');
  const [idDocUri, setIdDocUri] = useState<string | null>(null);
  const [licenseDocUri, setLicenseDocUri] = useState<string | null>(null);

  // Step 4: Verification & Terms
  const [otpCode, setOtpCode] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const handlePickDocument = async (type: 'id' | 'license') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        if (type === 'id') setIdDocUri(result.assets[0].uri);
        if (type === 'license') setLicenseDocUri(result.assets[0].uri);
      }
    } catch {}
  };

  const handleNextStep = () => {
    setErrorMsg(null);

    if (currentStep === 1) {
      if (!fullName.trim() || !phone.trim()) {
        setErrorMsg('Please enter your full name and 10-digit mobile number.');
        return;
      }
      if (phone.replace(/\D/g, '').length < 10) {
        setErrorMsg('Please enter a valid 10-digit mobile number.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!shopName.trim() || !address.trim()) {
        setErrorMsg('Please enter your garage/workshop name and full address.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (selectedServices.length === 0) {
        setErrorMsg('Please select at least one roadside assistance service.');
        return;
      }
      setCurrentStep(4);
    }
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as any);
    }
  };

  const toggleService = (s: string) => {
    if (selectedServices.includes(s)) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter((x) => x !== s));
      }
    } else {
      setSelectedServices([...selectedServices, s]);
    }
  };

  const toggleVehicle = (v: string) => {
    if (selectedVehicles.includes(v)) {
      if (selectedVehicles.length > 1) {
        setSelectedVehicles(selectedVehicles.filter((x) => x !== v));
      }
    } else {
      setSelectedVehicles([...selectedVehicles, v]);
    }
  };

  const handleSubmitRegistration = async () => {
    setErrorMsg(null);

    if (!agreedTerms) {
      setErrorMsg('Please accept the MECHFIND Partner Agreement to proceed.');
      return;
    }

    if (!otpCode || otpCode.length < 4) {
      setErrorMsg('Please enter the 4 or 6-digit phone verification OTP.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Register mechanic with pending verification status
      await loginMechanic(phone, shopName, 'pending');
      setIsCompleted(true);
    } catch {
      setErrorMsg('Failed to submit partner application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCompleted) {
    return (
      <ScreenContainer withPadding={false}>
        <Header title="Application Submitted" showThemeToggle />
        <View
          style={[
            styles.completedWrapper,
            {
              paddingHorizontal: horizontalPadding,
              maxWidth: isTablet ? 520 : undefined,
              alignSelf: isTablet ? 'center' : undefined,
              width: isTablet ? '100%' : undefined,
            },
          ]}
        >
          <View style={styles.successIconCircle}>
            <Ionicons name="checkmark-done" size={44} color="#FFFFFF" />
          </View>
          <Text style={[styles.successTitle, { color: theme.textPrimary }]}>
            Application Under Review
          </Text>
          <Text style={[styles.successSubtitle, { color: theme.textSecondary }]}>
            Thank you, {fullName}. Your workshop registration for {shopName} has been received.
          </Text>

          <Card elevated style={styles.slaCard}>
            <View style={styles.slaRow}>
              <Ionicons name="time" size={20} color={BRAND_COLORS.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.slaTitle, { color: theme.textPrimary }]}>
                  Registration submitted
                </Text>
                <Text style={[styles.slaText, { color: theme.textSecondary }]}>
                  Check your verification status for updates.
                </Text>
              </View>
            </View>
          </Card>

          <Button
            title="Check Verification Status"
            onPress={() => router.replace('/(mechanic)/verification-status')}
            style={{ width: '100%', marginBottom: 12 }}
          />

          <Button
            title="Back to Sign In"
            variant="outline"
            onPress={() => router.replace('/(auth)/mechanic-login')}
            style={{ width: '100%' }}
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable withPadding={false} edges={['top', 'left', 'right']}>
      <Header title="Partner Registration" showBack showThemeToggle />

      <View
        style={[
          styles.containerWrapper,
          {
            paddingHorizontal: horizontalPadding,
            maxWidth: isDesktop ? 680 : isTablet ? 560 : undefined,
            alignSelf: isTablet || isDesktop ? 'center' : undefined,
            width: isTablet || isDesktop ? '100%' : undefined,
          },
        ]}
      >
        {/* Step Progress Header */}
        <View style={styles.progressHeader}>
          <View style={styles.progressTextRow}>
            <Text style={[styles.stepCountText, { color: BRAND_COLORS.primary }]}>
              STEP {currentStep} OF 4
            </Text>
            <Text style={[styles.stepTitleText, { color: theme.textPrimary }]}>
              {currentStep === 1 && 'Personal Information'}
              {currentStep === 2 && 'Workshop Details'}
              {currentStep === 3 && 'Skills & Documents'}
              {currentStep === 4 && 'Account Verification'}
            </Text>
          </View>

          {/* Progress Bar Track */}
          <View style={[styles.progressTrack, { backgroundColor: isDark ? '#222328' : '#E5E6E9' }]}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${(currentStep / 4) * 100}%`,
                  backgroundColor: BRAND_COLORS.primary,
                },
              ]}
            />
          </View>
        </View>

        {/* Error Alert */}
        {errorMsg && (
          <View style={[styles.errorBanner, { backgroundColor: theme.errorBg }]}>
            <Ionicons name="alert-circle" size={18} color={theme.error} />
            <Text style={[styles.errorBannerText, { color: theme.error }]}>
              {errorMsg}
            </Text>
          </View>
        )}

        {/* STEP 1: PERSONAL INFORMATION */}
        {currentStep === 1 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
              Provide your direct contact details. This will be used to verify your partner identity.
            </Text>

            <Input
              label="Full Name *"
              placeholder="e.g. Rajesh Sharma"
              value={fullName}
              onChangeText={setFullName}
              leftIcon={<Ionicons name="person-outline" size={20} color={theme.textSecondary} />}
            />

            <Input
              label="Mobile Number (for Dispatch SMS) *"
              placeholder="Enter 10-digit mobile number"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={10}
              leftIcon={<Ionicons name="call-outline" size={20} color={theme.textSecondary} />}
            />

            <Input
              label="Email Address (Optional)"
              placeholder="e.g. contact@apexgarage.in"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              leftIcon={<Ionicons name="mail-outline" size={20} color={theme.textSecondary} />}
            />
          </View>
        )}

        {/* STEP 2: WORKSHOP DETAILS */}
        {currentStep === 2 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
              Provide your garage or mobile assistance unit details so customers nearby can find you.
            </Text>

            <Input
              label="Garage / Workshop Name *"
              placeholder="e.g. Apex Speed Garage & Roadside Care"
              value={shopName}
              onChangeText={setShopName}
              leftIcon={<Ionicons name="construct-outline" size={20} color={theme.textSecondary} />}
            />

            <Input
              label="Physical Address / Garage Location *"
              placeholder="Shop number, street name, locality"
              value={address}
              onChangeText={setAddress}
              leftIcon={<Ionicons name="location-outline" size={20} color={theme.textSecondary} />}
            />

            <Input
              label="Landmark (Optional)"
              placeholder="e.g. Near Metro Station / Sea Link Plaza"
              value={landmark}
              onChangeText={setLandmark}
              leftIcon={<Ionicons name="navigate-outline" size={20} color={theme.textSecondary} />}
            />

            <View style={styles.fieldBlock}>
              <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>
                Roadside Service Dispatch Radius
              </Text>
              <View style={styles.radiusPillsRow}>
                {['5', '10', '15', '25'].map((r) => {
                  const isSel = serviceRadius === r;
                  return (
                    <Pressable
                      key={r}
                      onPress={() => setServiceRadius(r)}
                      style={[
                        styles.radiusPill,
                        {
                          backgroundColor: isSel ? BRAND_COLORS.primary : theme.card,
                          borderColor: isSel ? BRAND_COLORS.primary : theme.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.radiusPillText,
                          { color: isSel ? '#FFFFFF' : theme.textPrimary, fontWeight: isSel ? '700' : '500' },
                        ]}
                      >
                        {r} km
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* STEP 3: SKILLS & DOCUMENTS */}
        {currentStep === 3 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
              Select vehicle classes and roadside services you are equipped to support.
            </Text>

            {/* Vehicle Classes */}
            <View style={styles.fieldBlock}>
              <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>
                Vehicle Categories Supported
              </Text>
              <View style={styles.chipsRow}>
                {VEHICLE_CATEGORIES.map((v) => {
                  const isSel = selectedVehicles.includes(v.id);
                  return (
                    <Pressable
                      key={v.id}
                      onPress={() => toggleVehicle(v.id)}
                      style={[
                        styles.selectChip,
                        {
                          backgroundColor: isSel
                            ? isDark
                              ? 'rgba(23, 105, 245, 0.25)'
                              : '#FFF3CC'
                            : theme.card,
                          borderColor: isSel ? BRAND_COLORS.primary : theme.border,
                        },
                      ]}
                    >
                      <Ionicons
                        name={v.icon}
                        size={17}
                        color={isSel ? BRAND_COLORS.primary : theme.textSecondary}
                      />
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color: isSel ? BRAND_COLORS.primary : theme.textPrimary,
                            fontWeight: isSel ? '700' : '500',
                          },
                        ]}
                      >
                        {v.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Roadside Services Offered */}
            <View style={styles.fieldBlock}>
              <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>
                Roadside Assistance Services Offered ({selectedServices.length})
              </Text>
              <View style={styles.chipsRow}>
                {SPECIALTY_OPTIONS.map((s) => {
                  const isSel = selectedServices.includes(s);
                  return (
                    <Pressable
                      key={s}
                      onPress={() => toggleService(s)}
                      style={[
                        styles.selectChip,
                        {
                          backgroundColor: isSel
                            ? isDark
                              ? 'rgba(23, 105, 245, 0.25)'
                              : '#FFF3CC'
                            : theme.card,
                          borderColor: isSel ? BRAND_COLORS.primary : theme.border,
                        },
                      ]}
                    >
                      <Ionicons
                        name={isSel ? 'checkmark-circle' : 'add-circle-outline'}
                        size={15}
                        color={isSel ? BRAND_COLORS.primary : theme.textSecondary}
                      />
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color: isSel ? BRAND_COLORS.primary : theme.textPrimary,
                            fontWeight: isSel ? '700' : '500',
                          },
                        ]}
                      >
                        {s}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Document Verification Uploads */}
            <View style={styles.fieldBlock}>
              <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>
                Verification Documents
              </Text>
              <View style={styles.docUploadsRow}>
                <Pressable
                  onPress={() => handlePickDocument('id')}
                  style={[
                    styles.docBox,
                    {
                      backgroundColor: theme.card,
                      borderColor: idDocUri ? BRAND_COLORS.success : theme.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={idDocUri ? 'checkmark-circle' : 'cloud-upload-outline'}
                    size={24}
                    color={idDocUri ? BRAND_COLORS.success : BRAND_COLORS.primary}
                  />
                  <Text style={[styles.docBoxText, { color: theme.textPrimary }]}>
                    {idDocUri ? 'ID Document Attached' : 'Aadhaar / Gov ID'}
                  </Text>
                  <Text style={[styles.docBoxSub, { color: theme.textSecondary }]}>
                    Tap to upload photo
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handlePickDocument('license')}
                  style={[
                    styles.docBox,
                    {
                      backgroundColor: theme.card,
                      borderColor: licenseDocUri ? BRAND_COLORS.success : theme.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={licenseDocUri ? 'checkmark-circle' : 'document-text-outline'}
                    size={24}
                    color={licenseDocUri ? BRAND_COLORS.success : BRAND_COLORS.primary}
                  />
                  <Text style={[styles.docBoxText, { color: theme.textPrimary }]}>
                    {licenseDocUri ? 'License Attached' : 'Trade License / GST'}
                  </Text>
                  <Text style={[styles.docBoxSub, { color: theme.textSecondary }]}>
                    Tap to upload proof
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* STEP 4: ACCOUNT VERIFICATION */}
        {currentStep === 4 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
              We sent a verification code to +91 {phone || 'your phone number'}. Enter it to finalize your registration.
            </Text>

            <Input
              label="SMS Verification Code *"
              placeholder="e.g. 1234"
              keyboardType="number-pad"
              value={otpCode}
              onChangeText={setOtpCode}
              maxLength={6}
              leftIcon={<Ionicons name="key-outline" size={20} color={theme.textSecondary} />}
            />

            {/* Terms Checkbox */}
            <Pressable
              onPress={() => setAgreedTerms((prev) => !prev)}
              style={styles.termsRow}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: agreedTerms ? BRAND_COLORS.primary : theme.card,
                    borderColor: agreedTerms ? BRAND_COLORS.primary : theme.border,
                  },
                ]}
              >
                {agreedTerms && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </View>
              <Text style={[styles.termsText, { color: theme.textSecondary }]}>
                I accept the MECHFIND Partner Terms of Service and agree to provide prompt, fair roadside assistance with authorized launch payouts.
              </Text>
            </Pressable>
          </View>
        )}

        {/* Bottom Navigation Buttons */}
        <View style={styles.navButtonsRow}>
          {currentStep > 1 && (
            <Button
              title="Back"
              variant="outline"
              onPress={handlePrevStep}
              style={{ flex: 1 }}
            />
          )}

          {currentStep < 4 ? (
            <Button
              title="Next Step"
              onPress={handleNextStep}
              style={{ flex: 1.5 }}
            />
          ) : (
            <Button
              title="Submit Application"
              onPress={handleSubmitRegistration}
              loading={isSubmitting}
              style={{ flex: 2 }}
            />
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  progressHeader: {
    marginBottom: SPACING.lg,
  },
  progressTextRow: {
    marginBottom: SPACING.xs,
  },
  stepCountText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stepTitleText: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  stepContainer: {
    gap: SPACING.xs,
  },
  stepDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  fieldBlock: {
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  radiusPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  radiusPill: {
    flex: 1,
    height: 40,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radiusPillText: {
    fontSize: 13,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12.5,
  },
  docUploadsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  docBox: {
    flex: 1,
    padding: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  docBoxText: {
    fontSize: 12.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  docBoxSub: {
    fontSize: 10.5,
    textAlign: 'center',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: SPACING.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  navButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: SPACING.xl,
    paddingTop: SPACING.md,
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
  completedWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: BRAND_COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  slaCard: {
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    width: '100%',
  },
  slaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  slaTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  slaText: {
    fontSize: 12,
    lineHeight: 17,
  },
});
