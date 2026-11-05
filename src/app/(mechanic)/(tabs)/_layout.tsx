import React from 'react';
import { View, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeContext';
import { ResponsiveNav } from '../../../components/navigation/ResponsiveNav';

export default function MechanicTabsLayout() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const bottomPadding = Math.max(insets.bottom, 6);
  const barHeight = 56 + bottomPadding;

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#101114' : '#F1F2F4' }}>
      {isWeb && <ResponsiveNav mode="mechanic" />}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            display: isWeb ? 'none' : 'flex',
            backgroundColor: isDark ? '#101114' : '#FFFFFF',
            borderTopColor: isDark ? '#1F2024' : '#E5E7EB',
            borderTopWidth: 1,
            height: barHeight,
            paddingBottom: bottomPadding,
            paddingTop: 6,
            elevation: 8,
            shadowColor: '#000000',
            shadowOpacity: isDark ? 0.25 : 0.08,
            shadowRadius: 10,
          },
          tabBarActiveTintColor: '#FFC400',
          tabBarInactiveTintColor: isDark ? '#9CA3AF' : '#70737B',
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
