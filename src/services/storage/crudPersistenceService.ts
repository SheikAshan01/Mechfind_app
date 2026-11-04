import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vehicle } from '../../types/customer';
import { BreakdownRequest } from '../../types/requests';
import { INITIAL_REQUESTS, INITIAL_VEHICLES } from '../api/mockData';
import { getSupabaseClient } from '../api/supabaseClient';

const STORAGE_KEYS = {
  VEHICLES: '@mechfind_vehicles',
  DELETED_VEHICLE_IDS: '@mechfind_deleted_vehicle_ids',
  REQUESTS: '@mechfind_requests',
  DELETED_REQUEST_IDS: '@mechfind_deleted_request_ids',
  SAVED_ADDRESSES: '@mechfind_saved_addresses',
  NOTIFICATIONS: '@mechfind_notifications',
};

export interface SavedAddress {
  id: string;
  label: string;
  addressText: string;
  landmark?: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'booking' | 'system' | 'payout' | 'alert';
  read: boolean;
  createdAt: string;
}

class CrudPersistenceService {
  // ==================== VEHICLES CRUD ====================

  async getVehicles(): Promise<Vehicle[]> {
    try {
      const deletedIdsRaw = await AsyncStorage.getItem(STORAGE_KEYS.DELETED_VEHICLE_IDS);
      const deletedIds: string[] = deletedIdsRaw ? JSON.parse(deletedIdsRaw) : [];

      // Check Supabase if active
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from('vehicles').select('*');
        if (!error && data && data.length > 0) {
          const mapped: Vehicle[] = data.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            type: row.type || 'car',
            make: row.make,
            model: row.model,
            year: row.year,
            licensePlate: row.license_plate,
            fuelType: row.fuel_type || 'petrol',
            color: row.color,
            isDefault: row.is_default,
            createdAt: row.created_at,
          }));
          return mapped.filter((v) => !deletedIds.includes(v.id));
        }
      }

      // Check Local AsyncStorage
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.VEHICLES);
      if (stored) {
        const parsed: Vehicle[] = JSON.parse(stored);
        return parsed.filter((v) => !deletedIds.includes(v.id));
      }

      // First run: Seed initial vehicles minus deleted
      const initial = INITIAL_VEHICLES.filter((v) => !deletedIds.includes(v.id));
      await AsyncStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(initial));
      return initial;
    } catch {
      return INITIAL_VEHICLES;
    }
  }

  async saveVehicles(vehicles: Vehicle[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
    } catch {}
  }

  async deleteVehicle(id: string, activeRequests: BreakdownRequest[] = []): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. Guard against deleting a vehicle that is currently in an active roadside request
      const activeUsingVehicle = activeRequests.find(
        (r) =>
          r.vehicle?.id === id &&
          r.status !== 'completed' &&
          r.status !== 'cancelled'
      );
      if (activeUsingVehicle) {
        return {
          success: false,
          error: `Cannot delete vehicle (${activeUsingVehicle.vehicle?.make || 'Vehicle'}). It is currently assigned to active breakdown request #${activeUsingVehicle.id.slice(-4)}. Cancel or complete the request first.`,
        };
      }

      // 2. Track in deleted IDs tombstone to guarantee it never resurfaces on reboot
      const deletedIdsRaw = await AsyncStorage.getItem(STORAGE_KEYS.DELETED_VEHICLE_IDS);
      const deletedIds: string[] = deletedIdsRaw ? JSON.parse(deletedIdsRaw) : [];
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        await AsyncStorage.setItem(STORAGE_KEYS.DELETED_VEHICLE_IDS, JSON.stringify(deletedIds));
      }

      // 3. Remove from local stored vehicles
      const current = await this.getVehicles();
      const filtered = current.filter((v) => v.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(filtered));

      // 4. Execute Backend Supabase DELETE if connected
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('vehicles').delete().eq('id', id);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to delete vehicle' };
    }
  }

  // ==================== BOOKINGS / REQUESTS CRUD ====================

  async getRequests(): Promise<BreakdownRequest[]> {
    try {
      const deletedIdsRaw = await AsyncStorage.getItem(STORAGE_KEYS.DELETED_REQUEST_IDS);
      const deletedIds: string[] = deletedIdsRaw ? JSON.parse(deletedIdsRaw) : [];

      const stored = await AsyncStorage.getItem(STORAGE_KEYS.REQUESTS);
      if (stored) {
        const parsed: BreakdownRequest[] = JSON.parse(stored);
        return parsed.filter((r) => !deletedIds.includes(r.id));
      }

      const initial = INITIAL_REQUESTS.filter((r) => !deletedIds.includes(r.id));
      await AsyncStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(initial));
      return initial;
    } catch {
      return INITIAL_REQUESTS;
    }
  }

  async saveRequests(requests: BreakdownRequest[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    } catch {}
  }

  async deleteBooking(requestId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const all = await this.getRequests();
      const target = all.find((r) => r.id === requestId);

      if (target && target.status !== 'completed' && target.status !== 'cancelled') {
        return {
          success: false,
          error: 'Active breakdown requests cannot be permanently deleted. Please cancel the request first.',
        };
      }

      // Add to tombstone
      const deletedIdsRaw = await AsyncStorage.getItem(STORAGE_KEYS.DELETED_REQUEST_IDS);
      const deletedIds: string[] = deletedIdsRaw ? JSON.parse(deletedIdsRaw) : [];
      if (!deletedIds.includes(requestId)) {
        deletedIds.push(requestId);
        await AsyncStorage.setItem(STORAGE_KEYS.DELETED_REQUEST_IDS, JSON.stringify(deletedIds));
      }

      const remaining = all.filter((r) => r.id !== requestId);
      await AsyncStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(remaining));

      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('breakdown_requests').delete().eq('id', requestId);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to delete booking' };
    }
  }

  // ==================== SAVED ADDRESSES CRUD ====================

  async getSavedAddresses(): Promise<SavedAddress[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_ADDRESSES);
      if (stored) return JSON.parse(stored);
      const defaultAddresses: SavedAddress[] = [
        {
          id: 'addr_01',
          label: 'Home',
          addressText: 'Flat 402, Sea Green Apartments, Bandra West, Mumbai',
          landmark: 'Opposite Bandra Talao',
          latitude: 19.0596,
          longitude: 72.8295,
          isDefault: true,
        },
        {
          id: 'addr_02',
          label: 'Office',
          addressText: 'Tech Park B-Wing, BKC, Mumbai',
          landmark: 'Near Diamond Bourse',
          latitude: 19.0657,
          longitude: 72.8682,
        },
      ];
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_ADDRESSES, JSON.stringify(defaultAddresses));
      return defaultAddresses;
    } catch {
      return [];
    }
  }

  async deleteAddress(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const addresses = await this.getSavedAddresses();
      const remaining = addresses.filter((a) => a.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_ADDRESSES, JSON.stringify(remaining));

      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('customer_addresses').delete().eq('id', id);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to delete address' };
    }
  }

  // ==================== NOTIFICATIONS CRUD ====================

  async getNotifications(): Promise<AppNotification[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (stored) return JSON.parse(stored);
      const defaults: AppNotification[] = [
        {
          id: 'notif_01',
          title: 'Mechanic En Route',
          body: 'Rajesh Sharma from Apex Speed Garage is 1.2 km away.',
          type: 'booking',
          read: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'notif_02',
          title: 'PUC Reminder',
          body: 'Your Hyundai Creta PUC expires in 14 days.',
          type: 'alert',
          read: true,
          createdAt: '2 days ago',
        },
      ];
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(defaults));
      return defaults;
    } catch {
      return [];
    }
  }

  async deleteNotification(id: string): Promise<void> {
    try {
      const current = await this.getNotifications();
      const filtered = current.filter((n) => n.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(filtered));
    } catch {}
  }

  async clearAllNotifications(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
    } catch {}
  }
}

export const crudPersistenceService = new CrudPersistenceService();

