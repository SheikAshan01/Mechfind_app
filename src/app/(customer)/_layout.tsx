import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';

export default function CustomerLayout() {
  const { role, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;
    
    // Strict RBAC: If authenticated as mechanic, prevent customer portal access
    if (isAuthenticated && role === 'mechanic') {
      router.replace('/(mechanic)/(tabs)');
    }
  }, [role, isAuthenticated, isLoading]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="breakdown-request" options={{ presentation: 'card' }} />
      <Stack.Screen name="nearby-mechanics" options={{ presentation: 'card' }} />
      <Stack.Screen name="mechanic-details/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="live-tracking/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="vehicle-form" options={{ presentation: 'modal' }} />
      <Stack.Screen name="about" options={{ presentation: 'card' }} />
      <Stack.Screen name="contact" options={{ presentation: 'card' }} />
      <Stack.Screen name="become-mechanic" options={{ presentation: 'card' }} />
    </Stack>
  );
}

