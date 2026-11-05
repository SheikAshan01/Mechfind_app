import React from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { BRAND_COLORS } from '../../theme/colors';
import { RADIUS } from '../../theme/radius';
import { SPACING } from '../../theme/spacing';

export interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  iconName = 'alert-circle-outline',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const { theme, isDark } = useTheme();

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable
          style={[
            styles.dialogCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Icon Badge */}
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: isDestructive
                  ? isDark
                    ? 'rgba(220, 38, 38, 0.2)'
                    : '#FEE2E2'
                  : isDark
                  ? 'rgba(23, 105, 245, 0.2)'
                  : '#FFF3CC',
              },
            ]}
          >
            <Ionicons
              name={iconName}
              size={28}
              color={isDestructive ? BRAND_COLORS.error : BRAND_COLORS.primary}
            />
          </View>

          {/* Title & Message */}
          <Text style={[styles.dialogTitle, { color: theme.textPrimary }]}>
            {title}
          </Text>
          <Text style={[styles.dialogMessage, { color: theme.textSecondary }]}>
            {message}
          </Text>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <Pressable
              onPress={onCancel}
              disabled={isLoading}
              style={[
                styles.cancelButton,
                {
                  borderColor: theme.border,
                  backgroundColor: isDark ? '#222328' : '#F1F2F4',
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={cancelText}
            >
              <Text style={[styles.cancelButtonText, { color: theme.textPrimary }]}>
                {cancelText}
              </Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              disabled={isLoading}
              style={[
                styles.confirmButton,
                {
                  backgroundColor: isDestructive
                    ? BRAND_COLORS.error
                    : BRAND_COLORS.primary,
                  opacity: isLoading ? 0.7 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={confirmText}
            >
              <Text style={styles.confirmButtonText}>
                {isLoading ? 'Deleting...' : confirmText}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.xl,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  dialogMessage: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

