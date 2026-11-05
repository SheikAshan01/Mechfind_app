import { create } from 'zustand';
import { Platform } from 'react-native';
import { AuthUser, CustomerUser, MechanicUser, UserRole, VerificationStatus } from '../types/auth';
import { secureStorage } from '../services/storage/secureStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  role: UserRole | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboardingCompleted: boolean;
  setRole: (role: UserRole) => void;
  setOnboardingCompleted: (val: boolean) => Promise<void>;
  loginCustomer: (phone: string, fullName?: string) => Promise<void>;
  loginMechanic: (phone: string, shopName?: string, status?: VerificationStatus) => Promise<void>;
  updateCustomerProfile: (data: Partial<CustomerUser>) => Promise<void>;
  updateCustomerPassword: (newPassword: string) => Promise<{ success: boolean; message: string }>;
  updateMechanicProfile: (data: Partial<MechanicUser>) => Promise<void>;
  updateMechanicVerification: (status: VerificationStatus, reason?: string) => void;
  updateMechanicOnlineStatus: (isOnline: boolean) => void;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

const DEFAULT_CUSTOMER: CustomerUser = {
  id: 'cust_01',
  email: 'customer@mechfind.app',
  phoneNumber: '',
  fullName: 'Customer',
  role: 'customer',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEFAULT_MECHANIC: MechanicUser = {
  id: 'mech_01',
  email: 'partner@mechfind.app',
  phoneNumber: '',
  fullName: 'Partner Technician',
  role: 'mechanic',
  shopName: 'Partner Workshop',
  shopAddress: 'Workshop Location',
  yearsOfExperience: 5,
  verificationStatus: 'approved',
  isOnline: true,
  serviceRadiusKm: 15,
  vehicleTypes: ['car', 'bike'],
  specializations: ['Flat Tyre', 'Battery Jumpstart', 'Engine Diagnostics'],
  documents: {
    idProofUrl: 'verified_id_doc.pdf',
    tradeLicenseUrl: 'verified_trade_license.pdf',
  },
  rating: 4.9,
  reviewCount: 0,
  completedJobsCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const useAuthStore = create<AuthState>((set, get) => ({
  role: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isOnboardingCompleted: false,

  setRole: (role) => {
    set({ role });
    AsyncStorage.setItem('@mechfind_user_role', role);
  },

  setOnboardingCompleted: async (completed) => {
    await secureStorage.setOnboardingCompleted(completed);
    set({ isOnboardingCompleted: completed });
  },

  loginCustomer: async (phone: string, fullName?: string) => {
    const customerUser: CustomerUser = {
      ...DEFAULT_CUSTOMER,
      phoneNumber: phone,
      fullName: fullName && fullName.trim() ? fullName.trim() : 'Customer',
    };
    await secureStorage.saveTokens('mock_jwt_customer_token', 'mock_refresh_token');
    await AsyncStorage.setItem('@mechfind_user_role', 'customer');
    set({
      role: 'customer',
      user: customerUser,
      isAuthenticated: true,
    });
  },

  loginMechanic: async (phone: string, shopName?: string, status: VerificationStatus = 'approved') => {
    const mechanicUser: MechanicUser = {
      ...DEFAULT_MECHANIC,
      phoneNumber: phone,
      shopName: shopName && shopName.trim() ? shopName.trim() : 'Partner Workshop',
      verificationStatus: status,
    };
    await secureStorage.saveTokens('mock_jwt_mechanic_token', 'mock_refresh_token');
    await AsyncStorage.setItem('@mechfind_user_role', 'mechanic');
    set({
      role: 'mechanic',
      user: mechanicUser,
      isAuthenticated: true,
    });
  },

  updateCustomerProfile: async (data: Partial<CustomerUser>) => {
    const current = get().user;
    if (current && current.role === 'customer') {
      const updated: CustomerUser = {
        ...current,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      set({ user: updated });
      await AsyncStorage.setItem('@mechfind_customer_profile', JSON.stringify(updated));

      // Sync with Supabase if connected
      try {
        const { getSupabaseClient } = require('../services/api/supabaseClient');
        const supabase = getSupabaseClient();
        if (supabase) {
          await supabase.from('profiles').update({
            full_name: updated.fullName,
            email: updated.email,
            phone_number: updated.phoneNumber,
            avatar_url: updated.avatarUrl,
            updated_at: updated.updatedAt,
          }).eq('id', updated.id);
        }
      } catch {}
    }
  },

  updateCustomerPassword: async (newPassword: string) => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }
    await AsyncStorage.setItem('@mechfind_user_password_timestamp', new Date().toISOString());

    // Sync with Supabase Auth if connected
    try {
      const { getSupabaseClient } = require('../services/api/supabaseClient');
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          return { success: false, message: error.message };
        }
      }
    } catch {}

    return { success: true, message: 'Password successfully updated.' };
  },

  updateMechanicProfile: async (data: Partial<MechanicUser>) => {
    const current = get().user;
    if (current && current.role === 'mechanic') {
      const updated: MechanicUser = {
        ...current,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      set({ user: updated });
      await AsyncStorage.setItem('@mechfind_mechanic_profile', JSON.stringify(updated));

      // Sync with Supabase if connected
      try {
        const { getSupabaseClient } = require('../services/api/supabaseClient');
        const supabase = getSupabaseClient();
        if (supabase) {
          await supabase.from('profiles').update({
            full_name: updated.fullName,
            phone_number: updated.phoneNumber,
            avatar_url: updated.avatarUrl,
            updated_at: updated.updatedAt,
          }).eq('id', updated.id);

          await supabase.from('mechanic_profiles').update({
            shop_name: updated.shopName,
            shop_address: updated.shopAddress,
            service_radius_km: updated.serviceRadiusKm,
          }).eq('user_id', updated.id);
        }
      } catch {}
    }
  },

  updateMechanicVerification: (status: VerificationStatus, reason?: string) => {
    const current = get().user;
    if (current && current.role === 'mechanic') {
      const updated: MechanicUser = {
        ...current,
        verificationStatus: status,
        verificationReason: reason,
      };
      set({ user: updated });
    }
  },

  updateMechanicOnlineStatus: (isOnline: boolean) => {
    const current = get().user;
    if (current && current.role === 'mechanic') {
      const updated: MechanicUser = {
        ...current,
        isOnline,
      };
      set({ user: updated });
    }
  },

  logout: async () => {
    await secureStorage.clearTokens();
    await AsyncStorage.removeItem('@mechfind_user_role');
    set({
      role: null,
      user: null,
      isAuthenticated: false,
    });
  },

  initializeAuth: async () => {
    try {
      const [onboardingCompleted, savedRole, token] = await Promise.all([
        secureStorage.isOnboardingCompleted(),
        AsyncStorage.getItem('@mechfind_user_role'),
        secureStorage.getAccessToken(),
      ]);

      const isWeb = Platform.OS === 'web';
      const role = (savedRole as UserRole) || (isWeb ? 'customer' : null);
      const isAuthenticated = Boolean(token && role) || isWeb;

      let user: AuthUser | null = null;
      if (isAuthenticated) {
        if (role === 'mechanic') {
          const savedMech = await AsyncStorage.getItem('@mechfind_mechanic_profile');
          user = savedMech ? { ...DEFAULT_MECHANIC, ...JSON.parse(savedMech) } : DEFAULT_MECHANIC;
        } else {
          const savedCust = await AsyncStorage.getItem('@mechfind_customer_profile');
          user = savedCust ? { ...DEFAULT_CUSTOMER, ...JSON.parse(savedCust) } : DEFAULT_CUSTOMER;
        }
      }

      set({
        isOnboardingCompleted: isWeb ? true : onboardingCompleted,
        role: role || (isWeb ? 'customer' : null),
        user,
        isAuthenticated,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },
}));

