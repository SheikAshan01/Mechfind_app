import React from 'react';
import { Tabs } from 'expo-router';
import { MechanicPortalShell } from '../../../components/mechanic-web/MechanicPortalShell.web';

export default function MechanicTabsLayoutWeb() {
  return (
    <MechanicPortalShell>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="requests" />
        <Tabs.Screen name="earnings" />
        <Tabs.Screen name="profile" />
        <Tabs.Screen name="services-pricing" />
      </Tabs>
    </MechanicPortalShell>
  );
}
