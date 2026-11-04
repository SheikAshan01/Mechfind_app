import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { BRAND_COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';
import { JobStatus } from '../../types/requests';
import { useResponsive } from '../../hooks/useResponsive';

interface StatusStepperProps {
  currentStatus: JobStatus;
}

const STEPS: { key: JobStatus; label: string }[] = [
  { key: 'submitted', label: 'Requested' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'heading_to_customer', label: 'On Way' },
  { key: 'arrived', label: 'Arrived' },
  { key: 'work_in_progress', label: 'Repairing' },
  { key: 'completed', label: 'Done' },
];

export const StatusStepper: React.FC<StatusStepperProps> = ({ currentStatus }) => {
  const { theme, isDark } = useTheme();
  const { isSmallDevice } = useResponsive();

  const getStepIndex = (status: JobStatus): number => {
    switch (status) {
      case 'submitted':
        return 0;
      case 'accepted':
        return 1;
      case 'heading_to_customer':
        return 2;
      case 'arrived':
      case 'inspection':
        return 3;
      case 'work_in_progress':
        return 4;
      case 'completed':
        return 5;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const activeIdx = getStepIndex(currentStatus);

  if (currentStatus === 'cancelled') {
    return (
      <View style={[styles.cancelledBanner, { backgroundColor: theme.errorBg }]}>
        <Ionicons name="close-circle" size={18} color={theme.error} />
        <Text style={[styles.cancelledText, { color: theme.error }]}>
          This assistance request was cancelled
        </Text>
      </View>
    );
  }

  const circleSize = isSmallDevice ? 20 : 24;
  const labelFontSize = isSmallDevice ? 9 : 10.5;

  return (
    <View style={styles.container}>
      <View style={styles.stepRow}>
        {STEPS.map((step, idx) => {
          const isPassed = idx < activeIdx;
          const isCurrent = idx === activeIdx;

          const circleColor = isPassed
            ? BRAND_COLORS.success
            : isCurrent
            ? BRAND_COLORS.accentTeal
            : isDark
            ? '#1E2D42'
            : '#E6E9EF';

          const textColor = isPassed
            ? theme.textSecondary
            : isCurrent
            ? theme.textPrimary
            : theme.textTertiary;

          return (
            <React.Fragment key={step.key}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.circle,
                    {
                      width: circleSize,
                      height: circleSize,
                      borderRadius: circleSize / 2,
                      backgroundColor: circleColor,
                    },
                  ]}
                >
                  {isPassed ? (
                    <Ionicons name="checkmark" size={isSmallDevice ? 10 : 12} color="#FFFFFF" />
                  ) : (
                    <Text
                      style={[
                        styles.circleNumber,
                        {
                          fontSize: isSmallDevice ? 10 : 11,
                          color: isCurrent ? '#FFFFFF' : theme.textSecondary,
                        },
                      ]}
                    >
                      {idx + 1}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    {
                      color: textColor,
                      fontSize: labelFontSize,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {step.label}
                </Text>
              </View>

              {idx < STEPS.length - 1 ? (
                <View
                  style={[
                    styles.connector,
                    {
                      backgroundColor:
                        idx < activeIdx ? BRAND_COLORS.success : isDark ? '#262626' : '#E5E7EB',
                      marginTop: -(circleSize / 2 + 10),
                    },
                  ]}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
    width: '100%',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  circleNumber: {
    fontWeight: '700',
  },
  stepLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
  connector: {
    flex: 0.8,
    height: 2,
    marginHorizontal: 1,
  },
  cancelledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: 8,
    marginVertical: SPACING.sm,
  },
  cancelledText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
  },
});
