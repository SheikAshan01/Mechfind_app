import React, { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BRAND_COLORS } from '../../theme/colors';
import { RADIUS } from '../../theme/radius';
import { useTheme } from '../../theme/ThemeContext';
import { calculateDistanceKm, calculateEtaMinutes } from '../../utils/geoUtils';
import { routingService, RouteCoordinates } from '../../services/maps/routingService';

export interface MapPoint {
  latitude: number;
  longitude: number;
  label?: string;
}

interface MapFallbackProps {
  userLocation?: MapPoint;
  mechanicLocation?: MapPoint;
  nearbyMechanics?: MapPoint[];
  height?: number;
  etaMinutes?: number;
  distanceKm?: number;
  interactive?: boolean;
  onSelectMechanic?: (index: number) => void;
}

export const MapFallback: React.FC<MapFallbackProps> = ({
  userLocation = { latitude: 19.0596, longitude: 72.8295, label: 'Bandra West, Mumbai' },
  mechanicLocation,
  nearbyMechanics = [],
  height = 280,
  etaMinutes,
  distanceKm,
}) => {
  const { theme, isDark } = useTheme();

  const [zoomLevel, setZoomLevel] = useState(15);
  const [routePolyline, setRoutePolyline] = useState<RouteCoordinates[]>([]);
  const [calculatedDistance, setCalculatedDistance] = useState<number>(distanceKm || 1.2);
  const [calculatedEta, setCalculatedEta] = useState<number>(etaMinutes || 10);
  const [lastPingTime, setLastPingTime] = useState<string>('Just now');
  const [isRecenterTriggered, setIsRecenterTriggered] = useState(0);

  // Fetch real road polyline from OSRM when user & mechanic locations are present
  useEffect(() => {
    let isMounted = true;
    if (mechanicLocation && userLocation) {
      routingService
        .getDrivingRoute(
          { latitude: mechanicLocation.latitude, longitude: mechanicLocation.longitude },
          { latitude: userLocation.latitude, longitude: userLocation.longitude }
        )
        .then((res) => {
          if (isMounted) {
            setRoutePolyline(res.polyline);
            if (!distanceKm) setCalculatedDistance(res.distanceKm);
            if (!etaMinutes) setCalculatedEta(res.durationMinutes);
            setLastPingTime('Just now');
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [mechanicLocation?.latitude, mechanicLocation?.longitude, userLocation?.latitude, userLocation?.longitude]);

  // Center coordinates
  const mapCenter = useMemo(() => {
    if (mechanicLocation && userLocation) {
      return {
        latitude: (userLocation.latitude + mechanicLocation.latitude) / 2,
        longitude: (userLocation.longitude + mechanicLocation.longitude) / 2,
      };
    }
    return userLocation;
  }, [userLocation, mechanicLocation]);

  // Web interactive Leaflet / OpenStreetMap source
  const webMapHtml = useMemo(() => {
    const delta = 0.012 * (15 / zoomLevel);
    const minLat = (mapCenter.latitude - delta).toFixed(5);
    const maxLat = (mapCenter.latitude + delta).toFixed(5);
    const minLng = (mapCenter.longitude - delta).toFixed(5);
    const maxLng = (mapCenter.longitude + delta).toFixed(5);

    const markerLat = userLocation.latitude.toFixed(5);
    const markerLng = userLocation.longitude.toFixed(5);

    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&layer=mapnik&marker=${markerLat}%2C${markerLng}`;
  }, [mapCenter, userLocation, zoomLevel, isRecenterTriggered]);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(18, z + 1));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(12, z - 1));
  const handleRecenter = () => {
    setZoomLevel(15);
    setIsRecenterTriggered((t) => t + 1);
  };

  return (
    <View
      style={[
        styles.container,
        {
          height,
          backgroundColor: isDark ? '#0B111E' : '#F1F5F9',
          borderColor: theme.border,
        },
      ]}
    >
      {/* 1. Real Geographical Map Tiles */}
      {Platform.OS === 'web' ? (
        <View style={styles.webFill}>
          <iframe
            src={webMapHtml}
            title="Live GPS Roadside Tracking Map"
            style={{
              width: '100%',
              height: '100%',
              border: 0,
              filter: isDark ? 'invert(90%) hue-rotate(180deg) contrast(1.15)' : 'none',
              borderRadius: RADIUS.md,
            }}
            loading="lazy"
          />
        </View>
      ) : (
        <View style={styles.nativeMapBackdrop}>
          <Ionicons name="map" size={54} color={isDark ? '#334155' : '#CBD5E1'} />
          <Text style={[styles.nativeCoordsText, { color: theme.textSecondary }]}>
            GPS: {userLocation.latitude.toFixed(4)}° N, {userLocation.longitude.toFixed(4)}° E
          </Text>
        </View>
      )}

      {/* 2. Top Status Badge (Live GPS Tracking & ETA) */}
      <View style={styles.topOverlayRow}>
        <View style={styles.liveGpsBadge}>
          <View style={styles.liveGpsPulse} />
          <Text style={styles.liveGpsText}>LIVE GPS • {lastPingTime}</Text>
        </View>

        {mechanicLocation && (
          <View style={styles.etaBadge}>
            <Ionicons name="car" size={13} color="#FFFFFF" />
            <Text style={styles.etaText}>
              ~{calculatedEta} mins ({calculatedDistance} km)
            </Text>
          </View>
        )}
      </View>

      {/* 3. Floating Overlay Markers */}
      {mechanicLocation && (
        <View style={styles.mechanicMarkerOverlay}>
          <View style={styles.mechanicMarkerPin}>
            <Ionicons name="bicycle" size={16} color="#FFFFFF" />
          </View>
          <View style={styles.mechanicMarkerLabel}>
            <Text style={styles.mechanicMarkerText}>Dispatched Mechanic</Text>
          </View>
        </View>
      )}

      {/* 4. Customer Location Marker */}
      <View style={styles.customerMarkerOverlay}>
        <View style={styles.customerBeaconPulse} />
        <View style={styles.customerMarkerCore} />
      </View>

      {/* 5. Floating Zoom & Recenter Controls */}
      <View style={styles.controlsCol}>
        <Pressable
          onPress={handleZoomIn}
          style={[styles.mapControlBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          hitSlop={4}
          accessibilityLabel="Zoom In"
        >
          <Ionicons name="add" size={18} color={theme.textPrimary} />
        </Pressable>

        <Pressable
          onPress={handleZoomOut}
          style={[styles.mapControlBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          hitSlop={4}
          accessibilityLabel="Zoom Out"
        >
          <Ionicons name="remove" size={18} color={theme.textPrimary} />
        </Pressable>

        <Pressable
          onPress={handleRecenter}
          style={[styles.mapControlBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          hitSlop={4}
          accessibilityLabel="Recenter Location"
        >
          <Ionicons name="locate" size={17} color={BRAND_COLORS.primary} />
        </Pressable>
      </View>

      {/* 6. Bottom Coordinates / Address Bar */}
      <View
        style={[
          styles.bottomInfoBar,
          {
            backgroundColor: isDark ? 'rgba(19, 29, 46, 0.94)' : 'rgba(255, 255, 255, 0.94)',
            borderTopColor: theme.border,
          },
        ]}
      >
        <Ionicons name="navigate-circle" size={16} color={BRAND_COLORS.primary} />
        <Text style={[styles.addressText, { color: theme.textPrimary }]} numberOfLines={1}>
          {userLocation.label || `Lat: ${userLocation.latitude.toFixed(4)}, Lng: ${userLocation.longitude.toFixed(4)}`}
        </Text>
        <Text style={[styles.accuracyTag, { color: BRAND_COLORS.success }]}>
          High Accuracy (3m)
        </Text>
      </View>
    </View>
  );
};

export const LiveGpsMap = MapFallback;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  webFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  nativeMapBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeCoordsText: {
    fontSize: 12,
    marginTop: 6,
  },
  topOverlayRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  liveGpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(23, 36, 58, 0.88)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  liveGpsPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  liveGpsText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND_COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    gap: 5,
  },
  etaText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  mechanicMarkerOverlay: {
    position: 'absolute',
    top: '26%',
    left: '26%',
    alignItems: 'center',
    zIndex: 9,
  },
  mechanicMarkerPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BRAND_COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  mechanicMarkerLabel: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 3,
  },
  mechanicMarkerText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
  },
  customerMarkerOverlay: {
    position: 'absolute',
    top: '52%',
    left: '52%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9,
  },
  customerBeaconPulse: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(23, 105, 245, 0.25)',
    position: 'absolute',
  },
  customerMarkerCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: BRAND_COLORS.primary,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  controlsCol: {
    position: 'absolute',
    right: 12,
    bottom: 52,
    gap: 6,
    zIndex: 10,
  },
  mapControlBtn: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  bottomInfoBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderTopWidth: 1,
    gap: 8,
    zIndex: 10,
  },
  addressText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  accuracyTag: {
    fontSize: 11,
    fontWeight: '700',
  },
});
