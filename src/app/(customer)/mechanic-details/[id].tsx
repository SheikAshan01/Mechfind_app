import React from 'react';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';
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
import { useCustomerStore } from '../../../stores/customerStore';
import { useResponsive } from '../../../hooks/useResponsive';
import { ResponsiveNav } from '../../../components/navigation/ResponsiveNav';

export default function MechanicDetailsScreen() {
  const { theme, isDark } = useTheme();
  const { isSmallDevice, horizontalPadding, isTablet } = useResponsive();
  const { id } = useLocalSearchParams<{ id: string }>();
  const nearbyMechanics = useCustomerStore((state) => state.nearbyMechanics);

  const mechanic = nearbyMechanics.find((m) => m.id === id) || nearbyMechanics[0];

  const handleCall = () => {
    Linking.openURL(`tel:${mechanic.phoneNumber}`);
  };

  const handleBookAssistance = () => {
    router.push('/(customer)/breakdown-request');
  };

  return (
    <ScreenContainer scrollable withPadding={false}>
      {Platform.OS === 'web' ? <ResponsiveNav /> : <Header title="Mechanic Profile" showBack showThemeToggle />}

      <View
        style={[
          styles.content,
          {
            paddingHorizontal: horizontalPadding,
            maxWidth: isTablet ? 560 : undefined,
            alignSelf: isTablet ? 'center' : undefined,
            width: isTablet ? '100%' : undefined,
          },
        ]}
      >
        {/* Profile Top Banner */}
        <Card elevated>
          <View style={styles.profileHeader}>
            <View
              style={[
                styles.avatarCircle,
                { backgroundColor: isDark ? '#1D3048' : 'rgba(20, 184, 166, 0.12)' },
              ]}
            >
              <Ionicons
                name="construct"
                size={32}
                color={isDark ? BRAND_COLORS.accentTeal : BRAND_COLORS.primaryNavy}
              />
            </View>

            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={styles.titleRow}>
                <Text style={[styles.shopName, { color: theme.textPrimary }]} numberOfLines={1}>
                  {mechanic.shopName}
                </Text>
              </View>

              <Text style={[styles.ownerName, { color: theme.textSecondary }]} numberOfLines={1}>
                {mechanic.fullName} • Owner / Lead Technician
              </Text>

              <View style={styles.badgesRow}>
                {mechanic.isVerified ? (
                  <Badge label="VERIFIED GARAGE" variant="verified" size="sm" />
                ) : (
                  <Badge label="UNVERIFIED" variant="neutral" size="sm" />
                )}
                <Badge
                  label={mechanic.isOnline ? 'AVAILABLE NOW' : 'OFFLINE'}
                  variant={mechanic.isOnline ? 'success' : 'neutral'}
                  size="sm"
                />
              </View>
            </View>
          </View>
        </Card>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View
            style={[
              styles.statBox,
              isSmallDevice && styles.statBoxSmall,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Ionicons name="star" size={18} color="#F59E0B" />
            <Text style={[styles.statVal, { color: theme.textPrimary }]}>{mechanic.rating}</Text>
            <Text style={[styles.statLbl, { color: theme.textSecondary }]} numberOfLines={1}>
              {mechanic.reviewCount} Ratings
            </Text>
          </View>

          <View
            style={[
              styles.statBox,
              isSmallDevice && styles.statBoxSmall,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Ionicons name="location" size={18} color={BRAND_COLORS.accentTeal} />
            <Text style={[styles.statVal, { color: theme.textPrimary }]}>{mechanic.distanceKm} km</Text>
            <Text style={[styles.statLbl, { color: theme.textSecondary }]} numberOfLines={1}>Distance</Text>
          </View>

          <View
            style={[
              styles.statBox,
              isSmallDevice && styles.statBoxSmall,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Ionicons name="ribbon" size={18} color="#FFC400" />
            <Text style={[styles.statVal, { color: theme.textPrimary }]}>
              {mechanic.yearsOfExperience} Yrs
            </Text>
            <Text style={[styles.statLbl, { color: theme.textSecondary }]} numberOfLines={1}>Experience</Text>
          </View>

          <View
            style={[
              styles.statBox,
              isSmallDevice && styles.statBoxSmall,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Ionicons name="checkmark-done" size={18} color={BRAND_COLORS.success} />
            <Text style={[styles.statVal, { color: theme.textPrimary }]}>
              {mechanic.completedJobsCount}+
            </Text>
            <Text style={[styles.statLbl, { color: theme.textSecondary }]} numberOfLines={1}>Fixed Cars</Text>
          </View>
        </View>

        {/* Workshop & Contact Info */}
        <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
          Workshop Information
        </Text>
        <Card>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color={theme.textSecondary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Workshop Address</Text>
              <Text style={[styles.infoValue, { color: theme.textPrimary }]}>{mechanic.shopAddress}</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color={theme.textSecondary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Operating Hours</Text>
              <Text style={[styles.infoValue, { color: theme.textPrimary }]}>{mechanic.workingHours}</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={18} color={theme.textSecondary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Inspection & Breakdown Rate</Text>
              <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
                Starts at ₹{mechanic.pricingStartingAt}
              </Text>
            </View>
          </View>
        </Card>

        {/* Specializations & Skills */}
        <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
          Specializations & Capabilities
        </Text>
        <View style={styles.tagsContainer}>
          {mechanic.specializations.map((spec, idx) => (
            <View
              key={idx}
              style={[
                styles.specChip,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Ionicons name="checkmark" size={13} color={BRAND_COLORS.success} />
              <Text style={[styles.specChipText, { color: theme.textPrimary }]}>{spec}</Text>
            </View>
          ))}
        </View>

        {/* Real Customer Reviews */}
        <Text style={[styles.sectionHeading, { color: theme.textPrimary, marginTop: SPACING.xs }]}>
          Customer Reviews ({mechanic.reviews?.length || 0})
        </Text>

        {mechanic.reviews && mechanic.reviews.length > 0 ? (
          mechanic.reviews.map((rev) => (
            <Card key={rev.id}>
              <View style={styles.reviewHeader}>
                <View>
                  <Text style={[styles.reviewerName, { color: theme.textPrimary }]}>
                    {rev.customerName}
                  </Text>
                  <Text style={[styles.reviewDate, { color: theme.textTertiary }]}>
                    {rev.createdAt}
                  </Text>
                </View>

                <View style={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Ionicons
                      key={s}
                      name={s <= rev.rating ? 'star' : 'star-outline'}
                      size={13}
                      color="#F59E0B"
                    />
                  ))}
                </View>
              </View>
              <Text style={[styles.reviewComment, { color: theme.textSecondary }]}>
                {'“'}{rev.comment}{'”'}
              </Text>
            </Card>
          ))
        ) : (
          <Text style={[styles.noReviews, { color: theme.textTertiary }]}>
            No written reviews yet.
          </Text>
        )}

        {/* Action Buttons */}
        <View style={[styles.actionRow, isSmallDevice && { flexDirection: 'column' }]}>
          <Button
            title="Call Workshop"
            onPress={handleCall}
            variant="outline"
            size="lg"
            icon={<Ionicons name="call-outline" size={18} color={theme.textPrimary} />}
            style={{ flex: 1 }}
          />

          <Button
            title="Request Assistance"
            onPress={handleBookAssistance}
            variant="primary"
            size="lg"
            icon={<Ionicons name="flash" size={18} color={isDark ? BRAND_COLORS.primaryNavy : '#FFFFFF'} />}
            style={{ flex: 1.4 }}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.huge,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  avatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopName: {
    ...TYPOGRAPHY.h4,
    fontSize: 16,
  },
  ownerName: {
    ...TYPOGRAPHY.caption,
    marginTop: 1,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 5,
    marginTop: SPACING.xs,
    flexWrap: 'wrap',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginVertical: SPACING.sm,
  },
  statBox: {
    flex: 1,
    padding: SPACING.xs + 2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  statBoxSmall: {
    padding: 4,
  },
  statVal: {
    ...TYPOGRAPHY.h4,
    fontSize: 13,
    marginTop: 2,
  },
  statLbl: {
    fontSize: 9.5,
    marginTop: 1,
    textAlign: 'center',
  },
  sectionHeading: {
    ...TYPOGRAPHY.h4,
    fontSize: 14,
    marginBottom: SPACING.xs,
    marginTop: SPACING.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    paddingVertical: SPACING.xxs,
  },
  infoLabel: {
    ...TYPOGRAPHY.caption,
  },
  infoValue: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    marginTop: 1,
  },
  divider: {
    height: 1,
    marginVertical: SPACING.xs,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  specChipText: {
    fontSize: 11,
    fontWeight: '500',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  reviewerName: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
  },
  reviewDate: {
    ...TYPOGRAPHY.caption,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    ...TYPOGRAPHY.bodySmall,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  noReviews: {
    ...TYPOGRAPHY.caption,
    marginBottom: SPACING.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
});
