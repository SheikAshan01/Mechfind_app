import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PublicPageFrame } from '../../components/navigation/PublicPageFrame';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useTheme } from '../../theme/ThemeContext';
import { BRAND_COLORS } from '../../theme/colors';

export default function ContactScreen() {
  const { theme } = useTheme();
  const phone = (process.env.EXPO_PUBLIC_EMERGENCY_PHONE || '').replace(/\D/g, '');
  const email = process.env.EXPO_PUBLIC_SUPPORT_EMAIL || '';
  const hasPhone = /^\d{10,15}$/.test(phone);
  const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const hasContact = hasPhone || hasEmail;

  return (
    <PublicPageFrame title="Contact MECHFIND">
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>CONTACT</Text>
        <Text style={[styles.title, { color: theme.textPrimary }]}>How can we help?</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>For roadside assistance, create a request in the app. For other support, use the contact details configured for MECHFIND below.</Text>
      </View>

      {hasContact ? (
        <View style={styles.contactList}>
          {hasPhone ? (
            <Pressable onPress={() => Linking.openURL(`tel:${phone}`)} accessibilityRole="link">
              <Card style={styles.contactCard}>
                <View style={styles.iconWrap}><Ionicons name="call-outline" size={21} color={BRAND_COLORS.primaryBlue} /></View>
                <View style={styles.contactCopy}>
                  <Text style={[styles.contactLabel, { color: theme.textSecondary }]}>Phone</Text>
                  <Text style={[styles.contactValue, { color: theme.textPrimary }]}>{phone}</Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color={theme.textSecondary} />
              </Card>
            </Pressable>
          ) : null}
          {hasEmail ? (
            <Pressable onPress={() => Linking.openURL(`mailto:${email}`)} accessibilityRole="link">
              <Card style={styles.contactCard}>
                <View style={styles.iconWrap}><Ionicons name="mail-outline" size={21} color={BRAND_COLORS.primaryBlue} /></View>
                <View style={styles.contactCopy}>
                  <Text style={[styles.contactLabel, { color: theme.textSecondary }]}>Email</Text>
                  <Text style={[styles.contactValue, { color: theme.textPrimary }]}>{email}</Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color={theme.textSecondary} />
              </Card>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <Card style={styles.emptyCard}>
          <Ionicons name="information-circle-outline" size={22} color={BRAND_COLORS.primaryBlue} />
          <Text style={[styles.contactValue, { color: theme.textPrimary }]}>Support contact details are not configured yet.</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>You can still create a roadside service request through MECHFIND.</Text>
        </Card>
      )}

      <View style={styles.actions}>
        <Button title="Create a service request" onPress={() => router.push('/(customer)/breakdown-request')} />
        <Button title="View services" variant="outline" onPress={() => router.push('/(customer)/services-pricing')} />
      </View>
    </PublicPageFrame>
  );
}

const styles = StyleSheet.create({
  hero: { paddingVertical: 20, gap: 12, maxWidth: 760 },
  eyebrow: { color: '#8A6800', fontSize: 11, fontWeight: '900', letterSpacing: 1.4 },
  title: { fontSize: 36, lineHeight: 43, fontWeight: '900', letterSpacing: -1.2 },
  subtitle: { fontSize: 14, lineHeight: 22 },
  contactList: { maxWidth: 680, width: '100%', gap: 12 },
  contactCard: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  iconWrap: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF3CC' },
  contactCopy: { flex: 1, gap: 3 },
  contactLabel: { fontSize: 11, fontWeight: '700' },
  contactValue: { fontSize: 15, fontWeight: '800' },
  emptyCard: { gap: 12, maxWidth: 680 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
