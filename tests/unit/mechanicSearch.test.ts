import { mechanicSearchService } from '../../src/services/mechanic/mechanicSearchService';

describe('MechanicSearchService Spatial & Filter Engine', () => {
  const mumbaiCoords = {
    latitude: 19.076,
    longitude: 72.8777,
  };

  test('searches nearby verified mechanics within 15 km', async () => {
    const result = await mechanicSearchService.searchNearby({
      latitude: mumbaiCoords.latitude,
      longitude: mumbaiCoords.longitude,
      radiusKm: 15,
      vehicleType: 'all',
      sortBy: 'distance',
    });

    expect(result.mechanics.length).toBeGreaterThan(0);
    expect(result.searchRadiusKm).toBe(15);
    // Verified that first result is nearest
    for (let i = 0; i < result.mechanics.length - 1; i++) {
      expect(result.mechanics[i].distanceKm).toBeLessThanOrEqual(result.mechanics[i + 1].distanceKm);
    }
  });

  test('filters mechanics by vehicle type (bike)', async () => {
    const result = await mechanicSearchService.searchNearby({
      latitude: mumbaiCoords.latitude,
      longitude: mumbaiCoords.longitude,
      radiusKm: 15,
      vehicleType: 'bike',
    });

    expect(result.mechanics.length).toBeGreaterThan(0);
    result.mechanics.forEach((m) => {
      expect(m.vehicleTypes).toContain('bike');
    });
  });

  test('sorts mechanics by rating descending', async () => {
    const result = await mechanicSearchService.searchNearby({
      latitude: mumbaiCoords.latitude,
      longitude: mumbaiCoords.longitude,
      radiusKm: 15,
      sortBy: 'rating',
    });

    for (let i = 0; i < result.mechanics.length - 1; i++) {
      expect(result.mechanics[i].rating).toBeGreaterThanOrEqual(result.mechanics[i + 1].rating);
    }
  });

  test('returns 0 mechanics when searching far outside zone (e.g. 0.1 km)', async () => {
    const result = await mechanicSearchService.searchNearby({
      latitude: mumbaiCoords.latitude,
      longitude: mumbaiCoords.longitude,
      radiusKm: 0.1,
    });

    expect(result.mechanics.length).toBe(0);
  });

  test('throws error when invalid GPS coordinates are passed', async () => {
    await expect(
      mechanicSearchService.searchNearby({
        latitude: NaN,
        longitude: NaN,
      })
    ).rejects.toThrow('Invalid GPS coordinates');
  });
});

