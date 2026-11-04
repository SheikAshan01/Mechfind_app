import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';

export default function MechanicLayout() {
  const { role, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    // Strict RBAC: Mechanic portal requires authenticated mechanic session
    if (!isAuthenticated) {
      router.replace('/(auth)/mechanic-login');
    } else if (role !== 'mechanic') {
      router.replace('/(customer)/(tabs)');
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
      <Stack.Screen name="verification-status" options={{ headerShown: false }} />
      <Stack.Screen name="job-details/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="job-navigation/[id]" options={{ presentation: 'card' }} />
    </Stack>
  );
}

