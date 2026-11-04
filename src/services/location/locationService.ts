import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { DEFAULT_COORDINATES, calculateDistanceKm, calculateEtaMinutes } from '../../utils/geoUtils';

export { DEFAULT_COORDINATES, calculateDistanceKm, calculateEtaMinutes };

export interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  address?: string;
}

export class LocationService {
  /**
   * Request location permissions across Web, Android and iOS
   */
  async requestForegroundPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
          return true;
        }
        return false;
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * Get device's actual GPS position with reverse geocoded street address
   */
  async getCurrentLocation(): Promise<LocationResult> {
    // 1. Browser Geolocation on Web
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            let address = 'Current Breakdown Location';

            try {
              // Real reverse geocode via OpenStreetMap Nominatim
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                {
                  headers: {
                    'Accept-Language': 'en',
                    'User-Agent': 'MechFind-Roadside-App/1.0',
                  },
                }
              );
              if (res.ok) {
                const data = await res.json();
                if (data && data.display_name) {
                  const parts = data.display_name.split(', ');
                  address = parts.slice(0, 3).join(', ');
                }
              }
            } catch {
              address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            }

            resolve({
              latitude,
              longitude,
              accuracy,
              address,
            });
          },
          (err) => {
            // Permission denied or timeout
            resolve(DEFAULT_COORDINATES);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          }
        );
      });
    }

    // 2. Native Android / iOS Location via Expo Location
    try {
      const hasPermission = await this.requestForegroundPermissions();
      if (!hasPermission) {
        return DEFAULT_COORDINATES;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude, accuracy } = position.coords;
      let address = 'Current Breakdown Location';

      try {
        const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (reverse && reverse.length > 0) {
          const item = reverse[0];
          const parts = [item.name, item.street, item.subregion || item.city].filter(Boolean);
          if (parts.length > 0) {
            address = parts.join(', ');
          }
        }
      } catch {
        address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      }

      return {
        latitude,
        longitude,
        accuracy,
        address,
      };
    } catch {
      return DEFAULT_COORDINATES;
    }
  }
}

export const locationService = new LocationService();
