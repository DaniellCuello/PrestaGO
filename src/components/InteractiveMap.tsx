import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import {
  Maximize2,
  Minimize2,
  Plus,
  Minus,
  Crosshair,
  MapPin,
  Sparkles,
} from 'lucide-react-native';
import { BrandColors, Colors, BorderRadius, Shadows } from '@/constants/theme';

export interface InteractiveMapProps {
  latitude: number;
  longitude: number;
  isDarkMode: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onCoordinateChange: (coords: { lat: number; lng: number }) => void;
  onGpsPress: () => void;
  loadingGps?: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  latitude,
  longitude,
  isDarkMode,
  isExpanded,
  onToggleExpand,
  onCoordinateChange,
  onGpsPress,
  loadingGps = false,
}) => {
  const mapRef = useRef<MapView | null>(null);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  // Animar hacia las coordenadas cuando cambian
  useEffect(() => {
    if (mapRef.current && typeof latitude === 'number' && typeof longitude === 'number') {
      mapRef.current.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: 0.007,
          longitudeDelta: 0.007,
        },
        500
      );
    }
  }, [latitude, longitude]);

  const handleMapPress = (e: any) => {
    const coords = e?.nativeEvent?.coordinate;
    if (coords && typeof coords.latitude === 'number' && typeof coords.longitude === 'number') {
      onCoordinateChange({ lat: coords.latitude, lng: coords.longitude });
    }
  };

  const handleZoom = (deltaMultiplier: number) => {
    if (mapRef.current) {
      mapRef.current.getCamera().then((cam) => {
        if (cam) {
          const newAlt = deltaMultiplier > 1 ? (cam.altitude || 1000) * 1.6 : (cam.altitude || 1000) * 0.6;
          mapRef.current?.animateCamera({ altitude: newAlt, center: { latitude, longitude } }, { duration: 300 });
        }
      }).catch(() => {
        // Fallback usando animateToRegion
        mapRef.current?.animateToRegion(
          {
            latitude,
            longitude,
            latitudeDelta: 0.007 * deltaMultiplier,
            longitudeDelta: 0.007 * deltaMultiplier,
          },
          300
        );
      });
    }
  };

  return (
    <View
      style={[
        styles.mapContainer,
        {
          height: isExpanded ? 380 : 220,
          borderColor: isExpanded ? BrandColors.primary : theme.border,
          backgroundColor: isDarkMode ? '#0F172A' : '#E2E8F0',
        },
        Shadows.md,
      ]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.007,
          longitudeDelta: 0.007,
        }}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
        toolbarEnabled={false}
        userInterfaceStyle={isDarkMode ? 'dark' : 'light'}>
        <Marker
          coordinate={{ latitude, longitude }}
          draggable
          onDragEnd={(e) => {
            const coords = e?.nativeEvent?.coordinate;
            if (coords) {
              onCoordinateChange({ lat: coords.latitude, lng: coords.longitude });
            }
          }}
          title="Ubicación de Cobro"
          description="Toca o arrastra para ajustar punto exacto">
          <View style={styles.customPinContainer}>
            <View style={styles.pinShadow} />
            <View style={styles.pinBody}>
              <MapPin size={22} color="#FFFFFF" />
            </View>
            <View style={styles.pinTip} />
          </View>
        </Marker>
      </MapView>

      {/* Banner flotante de instrucción */}
      <View style={styles.instructionPill}>
        <Sparkles size={12} color={BrandColors.primary} />
        <Text style={styles.instructionText}>
          Toca en cualquier parte del mapa para marcar el cobro
        </Text>
      </View>

      {/* Botón de Extensión / Pantalla completa */}
      <Pressable
        onPress={onToggleExpand}
        accessibilityLabel="Extensión de mapa"
        style={({ pressed }) => [
          styles.actionBtn,
          styles.expandBtn,
          {
            backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: isExpanded ? BrandColors.primary : theme.border,
            opacity: pressed ? 0.8 : 1,
          },
          Shadows.sm,
        ]}>
        {isExpanded ? (
          <Minimize2 size={16} color={BrandColors.primary} />
        ) : (
          <Maximize2 size={16} color={theme.text} />
        )}
        <Text
          style={[
            styles.expandBtnText,
            { color: isExpanded ? BrandColors.primary : theme.text },
          ]}>
          {isExpanded ? 'Reducir' : 'Extensión'}
        </Text>
      </Pressable>

      {/* Botón Mi Ubicación GPS flotante */}
      <Pressable
        onPress={onGpsPress}
        disabled={loadingGps}
        accessibilityLabel="Centrar en mi GPS"
        style={({ pressed }) => [
          styles.gpsFloatingBtn,
          {
            backgroundColor: BrandColors.primary,
            opacity: pressed || loadingGps ? 0.8 : 1,
          },
          Shadows.glowGreen,
        ]}>
        {loadingGps ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Crosshair size={18} color="#FFFFFF" />
        )}
      </Pressable>

      {/* Controles de Zoom vertical (+ / -) */}
      <View
        style={[
          styles.zoomControls,
          {
            backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: theme.border,
          },
          Shadows.sm,
        ]}>
        <Pressable
          onPress={() => handleZoom(0.5)}
          style={({ pressed }) => [
            styles.zoomBtn,
            { opacity: pressed ? 0.6 : 1 },
          ]}>
          <Plus size={16} color={theme.text} />
        </Pressable>
        <View style={[styles.zoomDivider, { backgroundColor: theme.border }]} />
        <Pressable
          onPress={() => handleZoom(2.0)}
          style={({ pressed }) => [
            styles.zoomBtn,
            { opacity: pressed ? 0.6 : 1 },
          ]}>
          <Minus size={16} color={theme.text} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 6,
  },
  customPinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinBody: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    ...Shadows.sm,
  },
  pinTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#EF4444',
    marginTop: -2,
  },
  pinShadow: {
    position: 'absolute',
    bottom: -4,
    width: 14,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  instructionPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    maxWidth: '65%',
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  actionBtn: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  expandBtn: {
    top: 10,
    right: 10,
  },
  expandBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  gpsFloatingBtn: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomControls: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  zoomBtn: {
    width: 34,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomDivider: {
    height: 1,
    width: '100%',
  },
});

