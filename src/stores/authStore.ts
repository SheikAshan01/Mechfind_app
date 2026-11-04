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
  updateMechanicVerification: (status: VerificationStatus, reason?: string) => void;
  updateMechanicOnlineStatus: (isOnline: boolean) => void;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

const DEFAULT_CUSTOMER: CustomerUser = {
  id: 'cust_01',
  email: 'customer@mechfind.app',
  phoneNumber: '+91 98765 43210',
  fullName: 'Arjun Kapoor',
  role: 'customer',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEFAULT_MECHANIC: MechanicUser = {
  id: 'mech_01',
  email: 'rajesh@apexgagarge.com',
  phoneNumber: '+91 98201 12345',
  fullName: 'Rajesh Sharma',
  role: 'mechanic',
  shopName: 'Apex Speed Garage & Roadside Care',
  shopAddress: 'Shop 4, Linking Road, Bandra West, Mumbai',
  yearsOfExperience: 12,
  verificationStatus: 'approved',
  isOnline: true,
  serviceRadiusKm: 15,
  vehicleTypes: ['car', 'bike'],
  specializations: ['Flat Tyre', 'Battery Jumpstart', 'Engine Overheating'],
  documents: {
    idProofUrl: 'verified_id_doc.pdf',
    tradeLicenseUrl: 'verified_trade_license.pdf',
  },
  rating: 4.9,
  reviewCount: 142,
  completedJobsCount: 480,
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
      fullName: fullName || DEFAULT_CUSTOMER.fullName,
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
      shopName: shopName || DEFAULT_MECHANIC.shopName,
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
        user = role === 'mechanic' ? DEFAULT_MECHANIC : DEFAULT_CUSTOMER;
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

