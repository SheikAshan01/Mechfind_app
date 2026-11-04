/**
 * Pure mathematical utilities for coordinates, distance, and ETAs.
 * Decoupled from native hardware APIs for performance and testability.
 */

export const DEFAULT_COORDINATES = {
  latitude: 19.076,
  longitude: 72.8777,
  address: 'Mumbai, Maharashtra',
};

/**
 * Haversine formula to compute distance between two GPS coordinates in Kilometers
 */
export const calculateDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
};

/**
 * Calculates estimated travel time in minutes based on urban breakdown response speed (avg 25 km/h)
 */
export const calculateEtaMinutes = (distanceKm: number): number => {
  const avgSpeedKmh = 25;
  const hours = distanceKm / avgSpeedKmh;
  const minutes = Math.round(hours * 60) + 4; // 4 mins dispatch buffer
  return Math.max(5, minutes);
};

