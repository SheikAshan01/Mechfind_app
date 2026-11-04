import React from 'react';
import { View, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeContext';
import { BRAND_COLORS } from '../../../theme/colors';
import { useResponsive } from '../../../hooks/useResponsive';
import { ResponsiveNav } from '../../../components/navigation/ResponsiveNav';

export default function MechanicTabsLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, isMobile } = useResponsive();

  const isWebDesktop = !isMobile || (Platform.OS === 'web' && width >= 768);
  const bottomPadding = Math.max(insets.bottom, 6);
  const barHeight = 56 + bottomPadding;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {isWebDesktop && <ResponsiveNav mode="mechanic" />}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            display: isWebDesktop ? 'none' : 'flex',
            backgroundColor: theme.tabBar,
            borderTopColor: theme.divider,
            borderTopWidth: 1,
            height: barHeight,
            paddingBottom: bottomPadding,
            paddingTop: 6,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarActiveTintColor: BRAND_COLORS.primaryBlue,
          tabBarInactiveTintColor: theme.tabBarInactive,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'speedometer' : 'speedometer-outline'} size={22} color={color as string} />
            ),
          }}
        />
        <Tabs.Screen
          name="requests"
          options={{
            title: 'Dispatches',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'flash' : 'flash-outline'} size={22} color={color as string} />
            ),
          }}
        />
        <Tabs.Screen
          name="earnings"
          options={{
            title: 'Earnings',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'wallet' : 'wallet-outline'} size={22} color={color as string} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Workshop',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'business' : 'business-outline'} size={22} color={color as string} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
