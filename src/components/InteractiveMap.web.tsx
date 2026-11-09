import React, { useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  ActivityIndicator,
} from 'react-native';
import {
  Maximize2,
  Minimize2,
  Crosshair,
  Sparkles,
} from 'lucide-react-native';
import { BrandColors, Colors, BorderRadius, Shadows } from '@/constants/theme';
import { InteractiveMapProps } from './InteractiveMap';

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
  const theme = isDarkMode ? Colors.dark : Colors.light;

  // Escuchar mensajes provenientes del iframe de Leaflet
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'PRESTAGO_MAP_CLICK') {
        const { lat, lng } = event.data;
        if (typeof lat === 'number' && typeof lng === 'number') {
          onCoordinateChange({ lat, lng });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onCoordinateChange]);

  // Generar HTML interactivo con Leaflet para OpenStreetMap
  const mapHtml = useMemo(() => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body, html, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #e5e7eb; }
          .leaflet-control-attribution { font-size: 9px !important; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var lat = ${latitude};
          var lng = ${longitude};
          var map = L.map('map', { zoomControl: false }).setView([lat, lng], 16);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
          }).addTo(map);

          L.control.zoom({ position: 'bottomright' }).addTo(map);

          var marker = L.marker([lat, lng], { draggable: true }).addTo(map);

          function notifyParent(newLat, newLng) {
            window.parent.postMessage({ type: 'PRESTAGO_MAP_CLICK', lat: newLat, lng: newLng }, '*');
          }

          map.on('click', function(e) {
            marker.setLatLng(e.latlng);
            notifyParent(e.latlng.lat, e.latlng.lng);
          });

          marker.on('dragend', function() {
            var pos = marker.getLatLng();
            notifyParent(pos.lat, pos.lng);
          });
        </script>
      </body>
      </html>
    `;
  }, [latitude, longitude]);

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
      {/* Iframe web interactivo con Leaflet */}
      <iframe
        title="Mapa de Cobro"
        srcDoc={mapHtml}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
      />

      {/* Banner flotante de instrucción */}
      <View style={styles.instructionPill}>
        <Sparkles size={12} color={BrandColors.primary} />
        <Text style={styles.instructionText}>
          Haz clic o arrastra el pin para fijar el cobro
        </Text>
      </View>

      {/* Botón de Extensión / Reducir */}
      <Pressable
        onPress={onToggleExpand}
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
    pointerEvents: 'none',
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
});

