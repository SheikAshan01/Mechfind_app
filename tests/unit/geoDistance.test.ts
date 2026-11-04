import {
  calculateDistanceKm,
  calculateEtaMinutes,
} from '../../src/utils/geoUtils';

describe('MECHFIND Geolocation & Distance Calculations', () => {
  it('returns 0 km for identical coordinates', () => {
    const distance = calculateDistanceKm(19.076, 72.8777, 19.076, 72.8777);
    expect(distance).toBe(0);
  });

  it('correctly computes distance between Bandra and Santacruz (approx 2.5-3.5 km)', () => {
    const latBandra = 19.0596;
    const lonBandra = 72.8295;
    const latSantacruz = 19.0815;
    const lonSantacruz = 72.8423;

    const distance = calculateDistanceKm(latBandra, lonBandra, latSantacruz, lonSantacruz);
    expect(distance).toBeGreaterThan(2);
    expect(distance).toBeLessThan(4);
  });

  it('calculates reasonable ETA minutes for breakdown response', () => {
    const eta = calculateEtaMinutes(5);
    expect(eta).toBe(16);

    const minEta = calculateEtaMinutes(0.1);
    expect(minEta).toBeGreaterThanOrEqual(5);
  });
});
