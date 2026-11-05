import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PublicPageFrame } from '../../components/navigation/PublicPageFrame';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useTheme } from '../../theme/ThemeContext';
import { BRAND_COLORS } from '../../theme/colors';
import { useResponsive } from '../../hooks/useResponsive';

const features = [
  { icon: 'business-outline' as const, title: 'Set up your workshop', text: 'Add your workshop information and service area through the partner registration flow.' },
  { icon: 'construct-outline' as const, title: 'Choose your services', text: 'Manage the services and pricing available from your mechanic profile.' },
  { icon: 'clipboard-outline' as const, title: 'Manage requests', text: 'Review incoming service requests and update job progress in the mechanic app.' },
];

export default function BecomeMechanicScreen() {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();

  return (
    <PublicPageFrame title="Become a MECHFIND mechanic">
      <View style={[styles.hero, !isMobile && styles.heroWide, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>MECHFIND MECHANIC PARTNERS</Text>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Bring your workshop to MECHFIND.</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Create a mechanic account to set up your workshop, configure services and handle requests in the partner app.</Text>
          <View style={styles.actions}>
            <Button title="Start partner registration" onPress={() => router.push('/(auth)/mechanic-register')} />
            <Button title="Partner sign in" variant="outline" onPress={() => router.push('/(auth)/mechanic-login')} />
          </View>
        </View>
        <Image source={require('../../../assets/images/mechanic-partner.png')} style={[styles.heroImage, !isMobile && styles.heroImageWide]} resizeMode="cover" accessibilityLabel="Mechanic in a workshop" />
      </View>

      <View style={styles.grid}>
        {features.map((feature) => (
          <Card key={feature.title} style={styles.card}>
            <View style={styles.iconWrap}><Ionicons name={feature.icon} size={22} color={BRAND_COLORS.primaryBlue} /></View>
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{feature.title}</Text>
            <Text style={[styles.cardText, { color: theme.textSecondary }]}>{feature.text}</Text>
          </Card>
        ))}
      </View>
      <Text style={[styles.note, { color: theme.textSecondary }]}>Registration and verification details are shown in the existing partner flow. Service availability depends on the active service area.</Text>
    </PublicPageFrame>
  );
}

const styles = StyleSheet.create({
  hero: { padding: 18, borderWidth: 1, borderRadius: 24, gap: 20 },
  heroWide: { padding: 28, flexDirection: 'row', alignItems: 'center', gap: 28, minHeight: 370 },
  heroCopy: { gap: 14, flex: 1 },
  heroImage: { width: '100%', height: 290, borderRadius: 18 },
  heroImageWide: { width: 360, height: 310 },
  eyebrow: { color: '#8A6800', fontSize: 11, fontWeight: '900', letterSpacing: 1.4 },
  title: { fontSize: 36, lineHeight: 43, fontWeight: '900', letterSpacing: -1.2 },
  subtitle: { fontSize: 15, lineHeight: 24, maxWidth: 700 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  card: { flexGrow: 1, flexBasis: 230, gap: 10, minHeight: 178 },
  iconWrap: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF3CC' },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  cardText: { fontSize: 13, lineHeight: 20 },
  note: { fontSize: 12, lineHeight: 19 },
});
