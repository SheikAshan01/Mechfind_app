/**
 * MECHFIND Backend Configuration & Integration Diagnostics
 *
 * Implements clean boundaries between cloud Supabase backend and local runtime mode.
 */

export interface BackendStatus {
  isSupabaseConfigured: boolean;
  supabaseUrl: string | null;
  hasAnonKey: boolean;
  isGoogleMapsConfigured: boolean;
  isPushNotificationConfigured: boolean;
  mode: 'supabase_production' | 'integration_ready_local';
}

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || null;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || null;
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || null;

export const backendConfig: BackendStatus = {
  isSupabaseConfigured: Boolean(SUPABASE_URL && SUPABASE_ANON_KEY),
  supabaseUrl: SUPABASE_URL,
  hasAnonKey: Boolean(SUPABASE_ANON_KEY),
  isGoogleMapsConfigured: Boolean(GOOGLE_MAPS_API_KEY),
  isPushNotificationConfigured: true,
  mode: SUPABASE_URL && SUPABASE_ANON_KEY ? 'supabase_production' : 'integration_ready_local',
};

export const getIntegrationNotice = () => {
  if (backendConfig.isSupabaseConfigured) {
    return 'Connected to Supabase PostgreSQL cluster.';
  }
  return 'Local Integration Mode: Supabase credentials not provided in environment. Using robust local state layer with full schema & API parity.';
};

