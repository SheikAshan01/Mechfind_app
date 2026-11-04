import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { BRAND_COLORS } from '../../theme/colors';
import { RADIUS } from '../../theme/radius';
import { SPACING } from '../../theme/spacing';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Header } from '../../components/ui/Header';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { MechanicUser, VerificationStatus } from '../../types/auth';
import { useResponsive } from '../../hooks/useResponsive';

export default function VerificationStatusScreen() {
  const { theme, isDark } = useTheme();
  const { isSmallDevice, isShortDevice, horizontalPadding, isTablet, isDesktop } = useResponsive();
  const { user, updateMechanicVerification, logout } = useAuthStore();

  const mechanic = user as MechanicUser | null;
  const status: VerificationStatus = mechanic?.verificationStatus || 'approved';
  const reason =
    mechanic?.verificationReason ||
    'The uploaded trade license copy was blurred or unreadable. Please upload a clear photo or PDF.';

  const handleEnterDashboard = () => {
    router.replace('/(mechanic)/(tabs)');
  };

  const handleResubmit = () => {
    updateMechanicVerification('pending');
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/role-select');
  };

  const iconCircleSize = isShortDevice || isSmallDevice ? 72 : 88;
  const iconGlyphSize = isShortDevice || isSmallDevice ? 40 : 50;

  return (
    <ScreenContainer scrollable withPadding={false}>
      <Header
        title="Documents & Verification"
        showBack
        showThemeToggle
        rightAction={
          <Pressable onPress={handleLogout} style={styles.logoutBtn} hitSlop={8}>
            <Ionicons name="log-out-outline" size={20} color={BRAND_COLORS.error} />
          </Pressable>
        }
      />

      <View
        style={[
          styles.content,
          {
            paddingHorizontal: horizontalPadding,
            maxWidth: isTablet || isDesktop ? 540 : undefined,
            alignSelf: isTablet || isDesktop ? 'center' : undefined,
            width: isTablet || isDesktop ? '100%' : undefined,
          },
        ]}
      >
        {/* Main Status Graphic & Details */}
        {status === 'approved' ? (
          <View style={styles.statusBox}>
            <View
              style={[
                styles.iconCircle,
                {
                  width: iconCircleSize,
                  height: iconCircleSize,
                  borderRadius: iconCircleSize / 2,
                  backgroundColor: 'rgba(22, 163, 74, 0.1)',
                },
              ]}
            >
              <Ionicons name="checkmark-circle" size={iconGlyphSize} color={BRAND_COLORS.successGreen} />
            </View>
            <Badge label="APPROVED & VERIFIED" variant="success" size="md" />
            <Text style={[styles.statusTitle, { color: theme.textPrimary }]}>
              Workshop Verified & Active
            </Text>
            <Text style={[styles.statusDesc, { color: theme.textSecondary }]}>
              Your workshop license, Aadhaar credentials, and garage photos have been approved by the MECHFIND Partner Operations team. You are eligible to receive live breakdown dispatches.
            </Text>

            <Card style={styles.auditCard}>
              <View style={styles.auditRow}>
                <Ionicons name="checkmark-circle" size={17} color={BRAND_COLORS.successGreen} />
                <Text style={[styles.auditText, { color: theme.textPrimary }]}>
                  Phone & SMS Authenticated
                </Text>
              </View>
              <View style={styles.auditRow}>
                <Ionicons name="checkmark-circle" size={17} color={BRAND_COLORS.successGreen} />
                <Text style={[styles.auditText, { color: theme.textPrimary }]}>
                  Workshop Location Registered
                </Text>
              </View>
              <View style={styles.auditRow}>
                <Ionicons name="checkmark-circle" size={17} color={BRAND_COLORS.successGreen} />
                <Text style={[styles.auditText, { color: theme.textPrimary }]}>
                  Trade License Verified
                </Text>
              </View>
              <View style={styles.auditRow}>
                <Ionicons name="checkmark-circle" size={17} color={BRAND_COLORS.successGreen} />
                <Text style={[styles.auditText, { color: theme.textPrimary }]}>
                  Bank Account Linked for Direct Settlement
                </Text>
              </View>
            </Card>

            <Button
              title="Enter Mechanic Dashboard"
              onPress={handleEnterDashboard}
              style={{ marginTop: SPACING.md, width: '100%' }}
              icon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
            />
          </View>
        ) : status === 'pending' ? (
          <View style={styles.statusBox}>
            <View
              style={[
                styles.iconCircle,
                {
                  width: iconCircleSize,
                  height: iconCircleSize,
                  borderRadius: iconCircleSize / 2,
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                },
              ]}
            >
              <Ionicons name="time" size={iconGlyphSize} color={BRAND_COLORS.warning} />
            </View>
            <Badge label="UNDER AUDIT REVIEW" variant="warning" size="md" />
            <Text style={[styles.statusTitle, { color: theme.textPrimary }]}>
              Verification In Progress
            </Text>
            <Text style={[styles.statusDesc, { color: theme.textSecondary }]}>
              Our compliance team is auditing your workshop license and technician ID.
              Verification typically completes within 2 to 24 business hours.
            </Text>

            <Card style={styles.auditCard}>
              <View style={styles.auditRow}>
                <Ionicons name="checkmark-circle" size={16} color={BRAND_COLORS.successGreen} />
                <Text style={[styles.auditText, { color: theme.textPrimary }]}>
                  Phone & SMS Authenticated
                </Text>
              </View>
              <View style={styles.auditRow}>
                <Ionicons name="checkmark-circle" size={16} color={BRAND_COLORS.successGreen} />
                <Text style={[styles.auditText, { color: theme.textPrimary }]}>
                  Workshop Location Registered
                </Text>
              </View>
              <View style={styles.auditRow}>
                <Ionicons name="hourglass-outline" size={16} color={BRAND_COLORS.warning} />
                <Text style={[styles.auditText, { color: theme.textSecondary }]}>
                  Trade License Document Under Review
                </Text>
              </View>
            </Card>
          </View>
        ) : (
          <View style={styles.statusBox}>
            <View
              style={[
                styles.iconCircle,
                {
                  width: iconCircleSize,
                  height: iconCircleSize,
                  borderRadius: iconCircleSize / 2,
                  backgroundColor: 'rgba(220, 38, 38, 0.1)',
                },
              ]}
            >
              <Ionicons name="close-circle" size={iconGlyphSize} color={BRAND_COLORS.error} />
            </View>
            <Badge label="DOCUMENT REJECTED" variant="error" size="md" />
            <Text style={[styles.statusTitle, { color: theme.textPrimary }]}>
              Verification Action Required
            </Text>
            <Text style={[styles.statusDesc, { color: theme.textSecondary }]}>
              Your registration submission was not approved for the following reason:
            </Text>

            <View style={[styles.reasonBox, { backgroundColor: 'rgba(220, 38, 38, 0.08)', borderColor: BRAND_COLORS.error }]}>
              <Text style={[styles.reasonText, { color: BRAND_COLORS.error }]}>{reason}</Text>
            </View>

            <Button
              title="Resubmit Clear Documents"
              onPress={handleResubmit}
              style={{ marginTop: SPACING.md, width: '100%' }}
            />
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.huge,
  },
  logoutBtn: {
    padding: SPACING.xs,
  },
  statusBox: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  statusDesc: {
    fontSize: 13.5,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  auditCard: {
    width: '100%',
    padding: SPACING.md,
    gap: 12,
  },
  auditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  auditText: {
    fontSize: 13.5,
    fontWeight: '500',
  },
  reasonBox: {
    width: '100%',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  reasonText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
