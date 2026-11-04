import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { backendConfig } from './backendConfig';

let client: SupabaseClient | null = null;

if (backendConfig.isSupabaseConfigured && backendConfig.supabaseUrl) {
  client = createClient(backendConfig.supabaseUrl, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

export const getSupabaseClient = (): SupabaseClient | null => client;

