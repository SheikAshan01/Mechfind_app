import React, { useState } from 'react';
import { Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { BRAND_COLORS } from '../../../theme/colors';
import { RADIUS } from '../../../theme/radius';
import { SPACING } from '../../../theme/spacing';
import { TYPOGRAPHY } from '../../../theme/typography';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { Header } from '../../../components/ui/Header';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';
import { MapFallback } from '../../../components/ui/MapFallback';
import { StatusStepper } from '../../../components/ui/StatusStepper';
import { useMechanicStore } from '../../../stores/mechanicStore';
import { JobStatus } from '../../../types/requests';
import { useResponsive } from '../../../hooks/useResponsive';

export default function MechanicJobNavigationScreen() {
  const { theme, isDark } = useTheme();
  const { isSmallDevice, horizontalPadding, isTablet, isDesktop } = useResponsive();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeJob, updateJobStatus, completeJob } = useMechanicStore();

  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [completedAmount, setCompletedAmount] = useState(0);
  const [finalBillAmount, setFinalBillAmount] = useState(
    String(activeJob?.estimatedCost || 400)
  );

  const job = activeJob;

  if (!job) {
    return (
      <ScreenContainer>
        <Header title="Job Navigation" showBack />
        <View style={{ padding: SPACING.lg }}>
          <Text style={{ color: theme.textPrimary, marginBottom: SPACING.md }}>
            No active breakdown job currently assigned.
          </Text>
          <Button
            title="Return to Dashboard"
            onPress={() => router.replace('/(mechanic)/(tabs)')}
          />
        </View>
      </ScreenContainer>
    );
  }

  const handleCallCustomer = () => {
    Linking.openURL(`tel:${job.customerPhone}`);
  };

  const getNextStatusAction = (): { title: string; nextStatus: JobStatus; icon: any } => {
    switch (job.status) {
      case 'accepted':
        return {
          title: 'Start Trip: Heading to Customer',
          nextStatus: 'heading_to_customer',
          icon: 'car-sport',
        };
      case 'heading_to_customer':
        return {
          title: 'Mark Arrived at Breakdown Spot',
          nextStatus: 'arrived',
          icon: 'location',
        };
      case 'arrived':
        return {
          title: 'Start Vehicle Inspection',
          nextStatus: 'inspection',
          icon: 'search',
        };
      case 'inspection':
        return {
          title: 'Submit Quotation to Customer',
          nextStatus: 'quote_submitted',
          icon: 'document-text',
        };
      case 'quote_submitted':
        return {
          title: 'Customer Approved – Begin Repair',
          nextStatus: 'work_in_progress',
          icon: 'construct',
        };
      case 'work_in_progress':
        return {
          title: 'Finish Repair & Settle Payment',
          nextStatus: 'completed',
          icon: 'checkmark-circle',
        };
      default:
        return {
          title: 'Job Completed',
          nextStatus: 'completed',
          icon: 'checkmark-circle',
        };
    }
  };

  const nextAction = getNextStatusAction();

  const handleAdvanceStep = () => {
    if (job.status === 'work_in_progress') {
      setPaymentModalVisible(true);
      return;
    }
    updateJobStatus(job.id, nextAction.nextStatus);
  };

  const handleConfirmCompletion = () => {
    const cost = parseInt(finalBillAmount, 10) || job.estimatedCost;
    completeJob(job.id, cost);
    setPaymentModalVisible(false);
    setCompletedAmount(cost);
    setSuccessModalVisible(true);
  };

  const handleFinishAndReturn = () => {
    setSuccessModalVisible(false);
    router.replace('/(mechanic)/(tabs)');
  };

  const mapHeight = isSmallDevice ? 200 : 260;

  return (
    <ScreenContainer scrollable withPadding={false}>
      <Header
        title="Turn-by-Turn Navigation"
        showBack
        showThemeToggle
        onBackPress={() => router.replace('/(mechanic)/(tabs)')}
      />

      <View
        style={[
          styles.content,
          {
            paddingHorizontal: horizontalPadding,
            maxWidth: isTablet || isDesktop ? 600 : undefined,
            alignSelf: isTablet || isDesktop ? 'center' : undefined,
            width: isTablet || isDesktop ? '100%' : undefined,
          },
        ]}
      >
        {/* Vector GPS Navigation Map Canvas */}
        <MapFallback
          height={mapHeight}
          userLocation={job.location}
          mechanicLocation={{
            latitude: job.location.latitude + 0.008,
            longitude: job.location.longitude + 0.006,
          }}
          etaMinutes={job.etaMinutes || 10}
          distanceKm={1.8}
        />

        {/* Step Progress Stepper */}
        <Card elevated style={{ marginTop: SPACING.xs }}>
          <View style={styles.stepHeader}>
            <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>
              Current Breakdown Phase
            </Text>
            <Badge label={job.status.replace(/_/g, ' ').toUpperCase()} variant="brand" size="sm" />
          </View>

          <StatusStepper currentStatus={job.status} />
        </Card>

        {/* Customer & Destination Card */}
        <Card>
          <View style={styles.customerRow}>
            <View style={[styles.custAvatar, { backgroundColor: isDark ? '#222328' : '#FFF3CC' }]}>
              <Ionicons name="person" size={22} color={BRAND_COLORS.primaryBlue} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[styles.custName, { color: theme.textPrimary }]} numberOfLines={1}>
                {job.customerName}
              </Text>
              <Text style={[styles.custVehicle, { color: theme.textSecondary }]} numberOfLines={1}>
                {job.vehicle.make} {job.vehicle.model} • {job.vehicle.licensePlate}
              </Text>
            </View>

            <Pressable
              onPress={handleCallCustomer}
              style={[styles.callBtn, { backgroundColor: BRAND_COLORS.successGreen }]}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Call Customer"
            >
              <Ionicons name="call" size={17} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          <View style={styles.addressRow}>
            <Ionicons name="navigate-circle" size={20} color={BRAND_COLORS.primaryBlue} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.addressText, { color: theme.textPrimary }]} numberOfLines={1}>
                {job.location.address || 'Breakdown Coordinates'}
              </Text>
              <Text style={[styles.landmarkText, { color: theme.textSecondary }]} numberOfLines={1}>
                Landmark: {job.location.landmark}
              </Text>
            </View>
          </View>
        </Card>

        {/* Action Button to advance workflow */}
        <Button
          title={nextAction.title}
          onPress={handleAdvanceStep}
          variant="primary"
          size="lg"
          icon={<Ionicons name={nextAction.icon} size={18} color="#FFFFFF" />}
          style={{ marginTop: SPACING.md }}
        />
      </View>

      {/* Settle Job & Final Invoice Modal */}
      <Modal visible={paymentModalVisible} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <View
            style={[
              styles.modalBox,
              {
                backgroundColor: theme.surface,
                maxWidth: isTablet || isDesktop ? 480 : undefined,
                alignSelf: isTablet || isDesktop ? 'center' : undefined,
                width: isTablet || isDesktop ? '100%' : undefined,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                Complete Service & Invoice
              </Text>
              <Pressable onPress={() => setPaymentModalVisible(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color={theme.textPrimary} />
              </Pressable>
            </View>

            <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
              Enter final amount collected from customer {job.customerName}.
            </Text>

            <Input
              label="Final Collected Amount (₹)"
              placeholder="400"
              keyboardType="number-pad"
              value={finalBillAmount}
              onChangeText={setFinalBillAmount}
              leftIcon={<Ionicons name="cash-outline" size={18} color={BRAND_COLORS.successGreen} />}
            />

            <Button
              title="Confirm Payment & Close Job"
              onPress={handleConfirmCompletion}
              style={{ marginTop: SPACING.md }}
            />
          </View>
        </View>
      </Modal>

      {/* Success Confirmation Modal */}
      <ConfirmationModal
        visible={successModalVisible}
        title="Job Completed Successfully"
        message={`Assistance closed and ₹${completedAmount} has been credited to your earnings wallet.`}
        confirmText="Go to Dashboard"
        isDestructive={false}
        onConfirm={handleFinishAndReturn}
        onCancel={handleFinishAndReturn}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.huge,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xxs,
  },
  stepTitle: {
    ...TYPOGRAPHY.h4,
    fontSize: 14,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  custAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  custName: {
    ...TYPOGRAPHY.h4,
    fontSize: 14.5,
  },
  custVehicle: {
    ...TYPOGRAPHY.caption,
    marginTop: 1,
  },
  callBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    marginVertical: SPACING.sm,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs + 2,
  },
  addressText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
  },
  landmarkText: {
    ...TYPOGRAPHY.caption,
    marginTop: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBox: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING.huge,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  modalTitle: {
    ...TYPOGRAPHY.h3,
  },
  modalSub: {
    ...TYPOGRAPHY.bodySmall,
    marginBottom: SPACING.md,
  },
});
