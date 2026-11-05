import React, { useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '../../hooks/useResponsive';
import { MechfindLogo } from '../ui/MechfindLogo';

export const WebFooter: React.FC = () => {
  const { width } = useResponsive();
  const isDesktop = width >= 1024;
  const isTablet = width >= 680 && width < 1024;
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (email.trim() && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const navTo = (route: string) => {
    router.push(route as never);
  };

  return (
    <View style={styles.footerWrapper}>
      <View style={styles.footerContainer}>
        {/* Top 5 Columns */}
        <View style={[styles.columnsGrid, isDesktop ? styles.grid5Col : isTablet ? styles.grid2Col : styles.grid1Col]}>
          {/* Col 1: Brand Info & Socials */}
          <View style={styles.brandCol}>
            <MechfindLogo isDark={true} width={140} height={40} style={{ marginBottom: 14 }} />
            <Text style={styles.brandTagline}>
              On-demand vehicle service and roadside assistance, anytime, anywhere.
            </Text>
            <View style={styles.socialIconsRow}>
              <Pressable
                style={styles.socialBtn}
                onPress={() => Linking.openURL('https://instagram.com')}
                accessibilityLabel="Instagram"
              >
                <Ionicons name="logo-instagram" size={17} color="#C7C9CE" />
              </Pressable>
              <Pressable
                style={styles.socialBtn}
                onPress={() => Linking.openURL('https://youtube.com')}
                accessibilityLabel="YouTube"
              >
                <Ionicons name="logo-youtube" size={17} color="#C7C9CE" />
              </Pressable>
              <Pressable
                style={styles.socialBtn}
                onPress={() => Linking.openURL('https://facebook.com')}
                accessibilityLabel="Facebook"
              >
                <Ionicons name="logo-facebook" size={17} color="#C7C9CE" />
              </Pressable>
              <Pressable
                style={styles.socialBtn}
                onPress={() => Linking.openURL('https://linkedin.com')}
                accessibilityLabel="LinkedIn"
              >
                <Ionicons name="logo-linkedin" size={17} color="#C7C9CE" />
              </Pressable>
            </View>
          </View>

          {/* Col 2: Quick Links */}
          <View style={styles.linksCol}>
            <Text style={styles.colHeader}>Quick Links</Text>
            <Pressable onPress={() => navTo('/(customer)/(tabs)')} style={styles.linkItem}>
              <Text style={styles.linkText}>Home</Text>
            </Pressable>
            <Pressable onPress={() => navTo('/(customer)/services-pricing')} style={styles.linkItem}>
              <Text style={styles.linkText}>Services</Text>
            </Pressable>
            <Pressable onPress={() => navTo('/(customer)/nearby-mechanics')} style={styles.linkItem}>
              <Text style={styles.linkText}>Find a Mechanic</Text>
            </Pressable>
            <Pressable onPress={() => navTo('/(customer)/(tabs)/requests')} style={styles.linkItem}>
              <Text style={styles.linkText}>Bookings</Text>
            </Pressable>
            <Pressable onPress={() => navTo('/(customer)/(tabs)/vehicles')} style={styles.linkItem}>
              <Text style={styles.linkText}>My Vehicles</Text>
            </Pressable>
          </View>

          {/* Col 3: For Mechanics */}
          <View style={styles.linksCol}>
            <Text style={styles.colHeader}>For Mechanics</Text>
            <Pressable onPress={() => navTo('/(customer)/become-mechanic')} style={styles.linkItem}>
              <Text style={styles.linkText}>Become a Mechanic</Text>
            </Pressable>
            <Pressable onPress={() => navTo('/(auth)/mechanic-login')} style={styles.linkItem}>
              <Text style={styles.linkText}>Mechanic Login</Text>
            </Pressable>
            <Pressable onPress={() => navTo('/(customer)/become-mechanic')} style={styles.linkItem}>
              <Text style={styles.linkText}>Partner Benefits</Text>
            </Pressable>
          </View>

          {/* Col 4: Company */}
          <View style={styles.linksCol}>
            <Text style={styles.colHeader}>Company</Text>
            <Pressable onPress={() => navTo('/(customer)/about')} style={styles.linkItem}>
              <Text style={styles.linkText}>About Us</Text>
            </Pressable>
            <Pressable onPress={() => navTo('/(customer)/contact')} style={styles.linkItem}>
              <Text style={styles.linkText}>Contact Us</Text>
            </Pressable>
            <Pressable onPress={() => navTo('/(customer)/about')} style={styles.linkItem}>
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Pressable>
            <Pressable onPress={() => navTo('/(customer)/about')} style={styles.linkItem}>
              <Text style={styles.linkText}>Terms & Conditions</Text>
            </Pressable>
            <Pressable onPress={() => navTo('/(customer)/contact')} style={styles.linkItem}>
              <Text style={styles.linkText}>Support</Text>
            </Pressable>
          </View>

          {/* Col 5: Stay Updated Newsletter */}
          <View style={styles.newsletterCol}>
            <Text style={styles.colHeader}>Stay Updated</Text>
            <Text style={styles.newsletterDesc}>
              Get service updates, offers and more from MECHFIND.
            </Text>

            {subscribed ? (
              <View style={styles.subscribedMsg}>
                <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                <Text style={styles.subscribedText}>Thank you for subscribing!</Text>
              </View>
            ) : (
              <View style={styles.newsletterInputRow}>
                <TextInput
                  style={styles.newsletterInput}
                  placeholder="Enter your email"
                  placeholderTextColor="#747B87"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <Pressable
                  onPress={handleSubscribe}
                  style={styles.newsletterSubmitBtn}
                  accessibilityLabel="Subscribe"
                >
                  <Ionicons name="arrow-forward" size={17} color="#101114" />
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* Bottom Copyright & Love */}
        <View style={styles.footerBottomRow}>
          <Text style={styles.copyrightText}>
            © {new Date().getFullYear()} MECHFIND. All rights reserved.
          </Text>
          <Text style={styles.madeWithText}>
            Made with <Text style={{ color: '#EF4444' }}>❤️</Text> for car owners
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footerWrapper: {
    width: '100%',
    backgroundColor: '#101114',
    borderTopWidth: 1,
    borderTopColor: '#1F2024',
    paddingTop: 54,
    paddingBottom: 28,
  },
  footerContainer: {
    maxWidth: 1320,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
  columnsGrid: {
    gap: 36,
    paddingBottom: 44,
  },
  grid5Col: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  grid2Col: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  grid1Col: {
    flexDirection: 'column',
    gap: 28,
  },
  brandCol: {
    maxWidth: 290,
  },
  footerLogo: {
    width: 140,
    height: 38,
    marginBottom: 14,
  },
  brandTagline: {
    fontSize: 13,
    lineHeight: 20,
    color: '#9CA3AF',
    marginBottom: 18,
  },
  socialIconsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1A1B1F',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2D3139',
  },
  linksCol: {
    minWidth: 130,
  },
  colHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  linkItem: {
    paddingVertical: 6,
  },
  linkText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  newsletterCol: {
    maxWidth: 280,
    width: '100%',
  },
  newsletterDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: '#9CA3AF',
    marginBottom: 14,
  },
  newsletterInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1B1F',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D3139',
    overflow: 'hidden',
    height: 44,
  },
  newsletterInput: {
    flex: 1,
    paddingHorizontal: 14,
    fontSize: 13,
    color: '#FFFFFF',
    height: '100%',
  },
  newsletterSubmitBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#FFC400',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribedMsg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  subscribedText: {
    color: '#16A34A',
    fontSize: 13,
    fontWeight: '600',
  },
  footerBottomRow: {
    borderTopWidth: 1,
    borderTopColor: '#1F2024',
    paddingTop: 22,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  copyrightText: {
    fontSize: 12.5,
    color: '#747B87',
  },
  madeWithText: {
    fontSize: 12.5,
    color: '#747B87',
  },
});
