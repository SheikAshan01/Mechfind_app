import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

export default function MechanicServicesPricingRedirect() {
  useEffect(() => {
    router.replace('/(mechanic)/(tabs)/services-pricing' as any);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#101114' }}>
      <ActivityIndicator size="large" color="#FFC400" />
    </View>
  );
}

