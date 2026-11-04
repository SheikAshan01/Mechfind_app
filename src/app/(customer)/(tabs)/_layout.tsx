import React from 'react';
import { View, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeContext';
import { useResponsive } from '../../../hooks/useResponsive';
import { ResponsiveNav } from '../../../components/navigation/ResponsiveNav';

export default function CustomerTabsLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, isMobile } = useResponsive();

  const isWebDesktop = !isMobile || (Platform.OS === 'web' && width >= 768);
  const bottomPadding = Math.max(insets.bottom, 6);
  const barHeight = 56 + bottomPadding;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {isWebDesktop && <ResponsiveNav mode="customer" />}
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
          tabBarActiveTintColor: theme.tabBarActive,
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
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color as string} />
            ),
          }}
        />
        <Tabs.Screen
          name="requests"
          options={{
            title: 'Bookings',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={22} color={color as string} />
            ),
          }}
        />
        <Tabs.Screen
          name="vehicles"
          options={{
            title: 'My Vehicles',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'car' : 'car-outline'} size={22} color={color as string} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color as string} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
