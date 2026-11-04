import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const KEYS = {
  ACCESS_TOKEN: 'mechfind_access_token',
  REFRESH_TOKEN: 'mechfind_refresh_token',
  USER_DATA: 'mechfind_user_data',
  USER_ROLE: 'mechfind_user_role',
  ONBOARDING_COMPLETED: 'mechfind_onboarding_completed',
  OFFLINE_QUEUE: 'mechfind_offline_queue',
};

class StorageService {
  private isNativeSecureAvailable = Platform.OS === 'ios' || Platform.OS === 'android';

  async setSecureItem(key: string, value: string): Promise<void> {
    try {
      if (this.isNativeSecureAvailable) {
        await SecureStore.setItemAsync(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch {
      await AsyncStorage.setItem(key, value);
    }
  }

  async getSecureItem(key: string): Promise<string | null> {
    try {
      if (this.isNativeSecureAvailable) {
        const item = await SecureStore.getItemAsync(key);
        if (item) return item;
      }
      return await AsyncStorage.getItem(key);
    } catch {
      return await AsyncStorage.getItem(key);
    }
  }

  async removeSecureItem(key: string): Promise<void> {
    try {
      if (this.isNativeSecureAvailable) {
        await SecureStore.deleteItemAsync(key);
      }
      await AsyncStorage.removeItem(key);
    } catch {
      await AsyncStorage.removeItem(key);
    }
  }

  // Token management
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      this.setSecureItem(KEYS.ACCESS_TOKEN, accessToken),
      this.setSecureItem(KEYS.REFRESH_TOKEN, refreshToken),
    ]);
  }

  async getAccessToken(): Promise<string | null> {
    return this.getSecureItem(KEYS.ACCESS_TOKEN);
  }

  async getRefreshToken(): Promise<string | null> {
    return this.getSecureItem(KEYS.REFRESH_TOKEN);
  }

  async clearTokens(): Promise<void> {
    await Promise.all([
      this.removeSecureItem(KEYS.ACCESS_TOKEN),
      this.removeSecureItem(KEYS.REFRESH_TOKEN),
      this.removeSecureItem(KEYS.USER_DATA),
      this.removeSecureItem(KEYS.USER_ROLE),
    ]);
  }

  // Onboarding
  async setOnboardingCompleted(completed: boolean): Promise<void> {
    await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETED, JSON.stringify(completed));
  }

  async isOnboardingCompleted(): Promise<boolean> {
    const val = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETED);
    return val ? JSON.parse(val) : false;
  }
}

export const secureStorage = new StorageService();

