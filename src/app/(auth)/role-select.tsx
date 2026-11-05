import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BRAND_COLORS } from '../../theme/colors';
import { useAuthStore } from '../../stores/authStore';
import { useResponsive } from '../../hooks/useResponsive';
import {
  AuthCarHeader,
  BottomLeftYellowGlow,
} from '../../components/auth/AuthCarHeader';

export default function RoleSelectScreen() {
  const insets = useSafeAreaInsets();
  const { width, isTablet, isDesktop } = useResponsive();
  const setRole = useAuthStore((state) => state.setRole);

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  const handleSelectCustomer = () => {
    setRole('customer');
    if (activeTab === 'signup') {
      router.push('/(auth)/customer-signup');
    } else {
      router.push('/(auth)/customer-login');
    }
  };

  const handleSelectMechanic = () => {
    setRole('mechanic');
    router.push('/(auth)/mechanic-login');
  };

  const isWide = isTablet || isDesktop;

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <ScrollView
        bounces={false}
        contentContainerStyle={[
          styles.scrollContainer,
          isWide && styles.scrollContainerWide,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={isWide ? styles.desktopCardBox : styles.mobileBox}>
          {/* Top Dark Hero with Sleek Sports Car & MECHFIND Emblem */}
          <AuthCarHeader variant="welcome" showBack={false} />

          {/* Bottom Curved White Sheet */}
          <View
            style={[
              styles.bottomSheet,
              isWide && styles.bottomSheetWide,
              { paddingBottom: Math.max(insets.bottom, 24) + 16 },
            ]}
          >
            <View style={styles.sheetContent}>
              {/* Heading & Subtitle */}
              <Text style={styles.heading}>Welcome to MechFind</Text>
              <Text style={styles.subtitle}>
                Book vehicle service, find trusted mechanics and get roadside support anytime.
              </Text>

            {/* Segmented Pill Switcher: Login vs Sign Up */}
            <View style={styles.segmentedContainer}>
              <Pressable
                onPress={() => setActiveTab('login')}
                style={[
                  styles.segmentButton,
                  activeTab === 'login' && styles.segmentButtonActive,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Switch to Login"
              >
                <Text
                  style={[
                    styles.segmentText,
                    activeTab === 'login'
                      ? styles.segmentTextActive
                      : styles.segmentTextInactive,
                  ]}
                >
                  Login
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setActiveTab('signup');
                  router.push('/(auth)/customer-signup');
                }}
                style={[
                  styles.segmentButton,
                  activeTab === 'signup' && styles.segmentButtonActive,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Switch to Sign Up"
              >
                <Text
                  style={[
                    styles.segmentText,
                    activeTab === 'signup'
                      ? styles.segmentTextActive
                      : styles.segmentTextInactive,
                  ]}
                >
                  Sign Up
                </Text>
              </Pressable>
            </View>

            {/* Role Cards List */}
            <View style={styles.cardsList}>
              {/* Card 1: I'm a Customer */}
              <Pressable
                onPress={handleSelectCustomer}
                style={({ pressed }) => [
                  styles.roleCard,
                  styles.customerCard,
                  {
                    transform: [{ scale: pressed ? 0.985 : 1 }],
                    opacity: pressed ? 0.94 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="I'm a Customer: Find and book mechanics near you"
              >
                <View style={styles.customerIconWrapper}>
                  <Ionicons name="people" size={24} color="#111827" />
                </View>

                <View style={styles.cardInfo}>
                  <Text style={styles.roleTitle}>I'm a Customer</Text>
                  <Text style={styles.roleDesc}>
                    Find and book mechanics near you
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#111827" />
              </Pressable>

              {/* Card 2: I'm a Mechanic */}
              <Pressable
                onPress={handleSelectMechanic}
                style={({ pressed }) => [
                  styles.roleCard,
                  styles.mechanicCard,
                  {
                    transform: [{ scale: pressed ? 0.985 : 1 }],
                    opacity: pressed ? 0.94 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="I'm a Mechanic: Receive service requests and grow your business"
              >
                <View style={styles.mechanicIconWrapper}>
                  <Ionicons name="build" size={22} color="#111827" />
                </View>

                <View style={styles.cardInfo}>
                  <Text style={styles.roleTitle}>I'm a Mechanic</Text>
                  <Text style={styles.roleDesc}>
                    Receive service requests and grow your business
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </Pressable>
            </View>
          </View>
        </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#101114',
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#101114',
  },
  scrollContainerWide: {
    minHeight: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
    backgroundColor: '#090A0C',
  },
  desktopCardBox: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#101114',
    borderWidth: 1,
    borderColor: '#23252B',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 32,
    elevation: 16,
  },
  mobileBox: {
    width: '100%',
    flex: 1,
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -24,
    paddingTop: 28,
    paddingHorizontal: 22,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  bottomSheetWide: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginTop: 0,
    marginBottom: 0,
    paddingHorizontal: 28,
    borderRadius: 0,
    maxWidth: '100%',
  },
  sheetContent: {
    width: '100%',
    zIndex: 2,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 22,
    paddingHorizontal: 12,
  },
  segmentedContainer: {
    height: 48,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    flexDirection: 'row',
    padding: 4,
    marginBottom: 20,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#18181B',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: BRAND_COLORS.brandYellow,
    fontWeight: '700',
  },
  segmentTextInactive: {
    color: '#6B7280',
  },
  cardsList: {
    gap: 14,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1.5,
  },
  customerCard: {
    backgroundColor: '#FFFDF5',
    borderColor: '#FACC15',
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  mechanicCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  customerIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF08A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mechanicIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.2,
  },
  roleDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
});
