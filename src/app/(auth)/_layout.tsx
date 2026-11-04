import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="role-select" />
      <Stack.Screen name="customer-login" />
      <Stack.Screen name="customer-signup" />
      <Stack.Screen name="customer-otp" />
      <Stack.Screen name="mechanic-login" />
      <Stack.Screen name="mechanic-signup" />
      <Stack.Screen name="mechanic-otp" />
      <Stack.Screen name="mechanic-register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}

