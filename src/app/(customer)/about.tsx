import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PublicPageFrame } from '../../components/navigation/PublicPageFrame';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useTheme } from '../../theme/ThemeContext';
import { BRAND_COLORS } from '../../theme/colors';

const steps = [
  { icon: 'search-outline' as const, title: 'Explore services', text: 'Review the available service categories and the pricing information currently shown in the catalogue.' },
  { icon: 'location-outline' as const, title: 'Share request details', text: 'Choose a vehicle, describe the issue and provide the service location when creating a request.' },
  { icon: 'list-outline' as const, title: 'Follow request status', text: 'Use Bookings to review saved requests and open tracking when mechanic and route details are available.' },
];

export default function AboutScreen() {
  const { theme } = useTheme();

  return (
    <PublicPageFrame title="About MECHFIND">
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>ABOUT MECHFIND</Text>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Roadside service information, in one place.</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>MECHFIND helps vehicle owners explore service options, submit a roadside assistance request and follow its status through the app.</Text>
      </View>

      <View style={styles.grid}>
        {steps.map((step) => (
          <Card key={step.title} style={styles.card}>
            <View style={styles.iconWrap}>
              <Ionicons name={step.icon} size={22} color={BRAND_COLORS.primaryBlue} />
            </View>
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{step.title}</Text>
            <Text style={[styles.cardText, { color: theme.textSecondary }]}>{step.text}</Text>
          </Card>
        ))}
      </View>

      <Card style={styles.noteCard}>
        <Text style={[styles.noteTitle, { color: theme.textPrimary }]}>Service details can vary</Text>
        <Text style={[styles.cardText, { color: theme.textSecondary }]}>Availability depends on the active service area. Check the service catalogue and review any estimate or quote before approving work.</Text>
      </Card>

      <View style={styles.actions}>
        <Button title="Browse services" onPress={() => router.push('/(customer)/services-pricing')} />
        <Button title="Find a mechanic" variant="outline" onPress={() => router.push('/(customer)/nearby-mechanics')} />
      </View>
    </PublicPageFrame>
  );
}

const styles = StyleSheet.create({
  hero: { paddingVertical: 20, gap: 12, maxWidth: 760 },
  eyebrow: { color: '#8A6800', fontSize: 11, fontWeight: '900', letterSpacing: 1.4 },
  title: { fontSize: 36, lineHeight: 43, fontWeight: '900', letterSpacing: -1.2 },
  subtitle: { fontSize: 15, lineHeight: 24, maxWidth: 700 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  card: { flexGrow: 1, flexBasis: 230, gap: 10, minHeight: 178 },
  iconWrap: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF3CC' },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  cardText: { fontSize: 13, lineHeight: 20 },
  noteCard: { gap: 8, backgroundColor: '#FFF9E7', borderColor: '#F1DEA3' },
  noteTitle: { fontSize: 15, fontWeight: '800' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
