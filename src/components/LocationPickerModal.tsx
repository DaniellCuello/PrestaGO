import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  MapPin,
  Compass,
  CheckCircle2,
  Building,
  Home,
  FileText,
  Crosshair,
  ShieldAlert,
} from 'lucide-react-native';
import * as Location from 'expo-location';
import { BrandColors, Colors, BorderRadius, Shadows } from '@/constants/theme';
import {
  buscarMunicipiosColombia,
  MunicipioColombia,
  MUNICIPIOS_COLOMBIA,
} from '@/constants/colombiaLocations';
import { InteractiveMap } from '@/components/InteractiveMap';

export interface UbicacionSeleccionada {
  direccionCompleta: string;
  ciudad: string;
  departamento: string;
  coordenadas?: { lat: number; lng: number };
  direccionDetalle?: string;
}

interface LocationPickerModalProps {
  visible: boolean;
  isDarkMode: boolean;
  initialUbicacion?: string;
  onClose: () => void;
  onConfirm: (ubicacion: UbicacionSeleccionada) => void;
}

const LocationPickerContent: React.FC<Omit<LocationPickerModalProps, 'visible'>> = ({
  isDarkMode,
  initialUbicacion = '',
  onClose,
  onConfirm,
}) => {
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const [loadingGps, setLoadingGps] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Intentar deducir municipio previo del texto inicial
  const initialMatched = initialUbicacion
    ? MUNICIPIOS_COLOMBIA.find((m) =>
        initialUbicacion.toLowerCase().includes(m.ciudad.toLowerCase())
      )
    : null;

  // Estados de Ubicación
  const [selectedMunicipio, setSelectedMunicipio] = useState<MunicipioColombia>(
    initialMatched || MUNICIPIOS_COLOMBIA[0] // Medellín por defecto
  );
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: initialMatched ? initialMatched.lat : 6.2442,
    lng: initialMatched ? initialMatched.lng : -75.5812,
  });
  const [direccionExacta, setDireccionExacta] = useState<string>(initialUbicacion);
  const [barrioSector, setBarrioSector] = useState<string>('');
  const [referencia, setReferencia] = useState<string>('');

  // Búsqueda de Municipio
  const [busquedaMunicipio, setBusquedaMunicipio] = useState<string>('');
  const [mostrarSugerencias, setMostrarSugerencias] = useState<boolean>(false);
  const [isMapExpanded, setIsMapExpanded] = useState<boolean>(false);

  // Actualizar coordenadas y realizar geocodificación inversa
  const handleCoordinateChange = async (coords: { lat: number; lng: number }) => {
    setCurrentCoords(coords);

    try {
      const reverseResults = await Location.reverseGeocodeAsync({
        latitude: coords.lat,
        longitude: coords.lng,
      });

      if (reverseResults && reverseResults.length > 0) {
        const first = reverseResults[0];
        const calle = first.street
          ? `${first.street} ${first.streetNumber || ''}`.trim()
          : first.name || '';
        const distrito = first.district || first.subregion || '';
        const ciudad = first.city || '';

        if (calle) setDireccionExacta(calle);
        if (distrito) setBarrioSector(distrito);

        if (ciudad) {
          const matched = MUNICIPIOS_COLOMBIA.find(
            (m) => m.ciudad.toLowerCase() === ciudad.toLowerCase()
          );
          if (matched) {
            setSelectedMunicipio(matched);
          }
        }
      }
    } catch (revErr) {
      console.warn('Geocodificación inversa no disponible:', revErr);
    }
  };

  // Capturar coordenadas por GPS actual del dispositivo
  const handleObtenerGpsActual = async () => {
    setLoadingGps(true);
    setGpsError(null);

    try {
      if (Platform.OS === 'web') {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const coords = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              };
              await handleCoordinateChange(coords);
              setLoadingGps(false);
            },
            () => {
              setGpsError('No se pudo obtener la ubicación GPS en el navegador.');
              setLoadingGps(false);
            }
          );
          return;
        }
      }

      // 1. Solicitar permisos de localización en primer plano
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setGpsError('Permiso de GPS denegado. Habilítalo en los ajustes de tu dispositivo.');
        setLoadingGps(false);
        return;
      }

      // 2. Obtener posición GPS actual
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };

      await handleCoordinateChange(coords);
    } catch (err: any) {
      console.warn('Error al obtener GPS:', err);
      setGpsError(err?.message || 'Error al conectar con el sensor GPS.');
    } finally {
      setLoadingGps(false);
    }
  };

  const handleSeleccionarMunicipio = (mun: MunicipioColombia) => {
    setSelectedMunicipio(mun);
    setCurrentCoords({ lat: mun.lat, lng: mun.lng });
    setBusquedaMunicipio('');
    setMostrarSugerencias(false);
  };

  const handleConfirmar = () => {
    const partes: string[] = [];
    if (direccionExacta.trim()) partes.push(direccionExacta.trim());
    if (barrioSector.trim()) partes.push(`B. ${barrioSector.trim()}`);
    partes.push(`${selectedMunicipio.ciudad}, ${selectedMunicipio.departamento}`);

    const direccionFinal = partes.join(' - ');

    const detalleExtra = referencia.trim() ? `Ref: ${referencia.trim()}` : undefined;

    onConfirm({
      direccionCompleta: direccionFinal,
      ciudad: selectedMunicipio.ciudad,
      departamento: selectedMunicipio.departamento,
      coordenadas: currentCoords,
      direccionDetalle: detalleExtra,
    });

    onClose();
  };

  const municipiosSugeridos = buscarMunicipiosColombia(busquedaMunicipio, 6);

  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.dragHandle} />
            <View style={styles.headerRow}>
              <View style={styles.headerTitleGroup}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>
                  Ubicación Exacta de Cobro
                </Text>
                <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                  Mapa y coordenadas GPS en Colombia
                </Text>
              </View>

              <Pressable
                onPress={onClose}
                style={[
                  styles.closeBtn,
                  { backgroundColor: isDarkMode ? '#1E2636' : '#F1F5F9' },
                ]}>
                <X size={20} color={theme.text} />
              </Pressable>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {/* BOTÓN GPS RÁPIDO */}
            <Pressable
              onPress={handleObtenerGpsActual}
              disabled={loadingGps}
              style={({ pressed }) => [
                styles.gpsQuickBtn,
                { opacity: pressed || loadingGps ? 0.8 : 1 },
                Shadows.glowGreen,
              ]}>
              <LinearGradient
                colors={['#1AA965', '#0E7A46']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gpsGradient}>
                {loadingGps ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Crosshair size={20} color="#FFFFFF" />
                )}
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.gpsBtnTitle}>
                    {loadingGps ? 'Obteniendo GPS...' : 'Usar mi Ubicación GPS Actual'}
                  </Text>
                  <Text style={styles.gpsBtnSub}>
                    Detecta automáticamente calle, barrio y ciudad
                  </Text>
                </View>
              </LinearGradient>
            </Pressable>

            {gpsError && (
              <View style={styles.errorBanner}>
                <ShieldAlert size={16} color="#EF4444" />
                <Text style={styles.errorText}>{gpsError}</Text>
              </View>
            )}

            {/* MAPA REAL INTERACTIVO CON EXTENSIÓN Y FIJACIÓN DE COORDENADAS */}
            <InteractiveMap
              latitude={currentCoords.lat}
              longitude={currentCoords.lng}
              isDarkMode={isDarkMode}
              isExpanded={isMapExpanded}
              onToggleExpand={() => setIsMapExpanded((prev) => !prev)}
              onCoordinateChange={handleCoordinateChange}
              onGpsPress={handleObtenerGpsActual}
              loadingGps={loadingGps}
            />

            {/* BARRA INFORMATIVA INFERIOR DE COORDENADAS Y MUNICIPIO */}
            <View
              style={[
                styles.mapInfoBar,
                {
                  backgroundColor: isDarkMode ? '#1A2332' : '#FFFFFF',
                  borderColor: theme.border,
                },
                Shadows.sm,
              ]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.mapPlaceName, { color: theme.text }]}>
                  {selectedMunicipio.ciudad}, {selectedMunicipio.departamento}
                </Text>
                <Text style={[styles.mapCoordsText, { color: BrandColors.primary }]}>
                  GPS: {currentCoords.lat.toFixed(5)}° N, {currentCoords.lng.toFixed(5)}° W
                </Text>
              </View>

              <View style={styles.colombiaBadge}>
                <Text style={styles.colombiaBadgeText}>🇨🇴 Colombia</Text>
              </View>
            </View>

            {/* SELECCIÓN Y BÚSQUEDA DE MUNICIPIO EN COLOMBIA */}
            <View style={styles.inputSection}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Ciudad / Municipio de Colombia:
              </Text>

              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  },
                ]}>
                <Compass size={18} color={BrandColors.primary} />
                <TextInput
                  value={
                    mostrarSugerencias
                      ? busquedaMunicipio
                      : `${selectedMunicipio.ciudad} (${selectedMunicipio.departamento})`
                  }
                  onFocus={() => {
                    setMostrarSugerencias(true);
                    setBusquedaMunicipio('');
                  }}
                  onChangeText={(t) => {
                    setBusquedaMunicipio(t);
                    setMostrarSugerencias(true);
                  }}
                  placeholder="Escribe para buscar ciudad o municipio..."
                  placeholderTextColor={theme.textMuted}
                  style={[styles.textInput, { color: theme.text }]}
                />
              </View>

              {/* Lista desplegable de sugerencias */}
              {mostrarSugerencias && (
                <View
                  style={[
                    styles.suggestionsDropdown,
                    {
                      backgroundColor: isDarkMode ? '#1E2636' : '#FFFFFF',
                      borderColor: theme.border,
                    },
                    Shadows.md,
                  ]}>
                  {municipiosSugeridos.map((mun) => (
                    <Pressable
                      key={mun.id}
                      onPress={() => handleSeleccionarMunicipio(mun)}
                      style={({ pressed }) => [
                        styles.suggestionItem,
                        {
                          backgroundColor: pressed
                            ? isDarkMode
                              ? '#273244'
                              : '#F1F5F9'
                            : 'transparent',
                          borderBottomColor: theme.border,
                        },
                      ]}>
                      <MapPin size={16} color={BrandColors.primary} />
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={[styles.suggCity, { color: theme.text }]}>
                          {mun.ciudad}
                        </Text>
                        <Text style={[styles.suggDept, { color: theme.textSecondary }]}>
                          {mun.departamento} · GPS: {mun.lat.toFixed(2)}, {mun.lng.toFixed(2)}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* DETALLES DE DIRECCIÓN */}
            <View style={styles.inputSection}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Dirección exacta (Calle / Carrera / Número):
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  },
                ]}>
                <Home size={18} color={BrandColors.primary} />
                <TextInput
                  value={direccionExacta}
                  onChangeText={setDireccionExacta}
                  placeholder="Ej. Calle 10 # 43E-20, Carrera 7 # 32-16"
                  placeholderTextColor={theme.textMuted}
                  style={[styles.textInput, { color: theme.text }]}
                />
              </View>
            </View>

            <View style={styles.inputSection}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Barrio, Comuna o Sector:
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  },
                ]}>
                <Building size={18} color={BrandColors.primary} />
                <TextInput
                  value={barrioSector}
                  onChangeText={setBarrioSector}
                  placeholder="Ej. El Poblado, Laureles, Chapinero..."
                  placeholderTextColor={theme.textMuted}
                  style={[styles.textInput, { color: theme.text }]}
                />
              </View>
            </View>

            <View style={styles.inputSection}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Referencia adicional de cobro:
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  },
                ]}>
                <FileText size={18} color={BrandColors.primary} />
                <TextInput
                  value={referencia}
                  onChangeText={setReferencia}
                  placeholder="Ej. Apto 302, frente a la panadería..."
                  placeholderTextColor={theme.textMuted}
                  style={[styles.textInput, { color: theme.text }]}
                />
              </View>
            </View>

            {/* BOTÓN CONFIRMAR */}
            <Pressable
              onPress={handleConfirmar}
              style={({ pressed }) => [
                styles.confirmBtn,
                { opacity: pressed ? 0.85 : 1 },
                Shadows.glowGreen,
              ]}>
              <LinearGradient
                colors={[BrandColors.primary, BrandColors.primaryDark]}
                style={styles.confirmGradient}>
                <CheckCircle2 size={20} color="#FFFFFF" />
                <Text style={styles.confirmBtnText}>Fijar y Confirmar Ubicación</Text>
              </LinearGradient>
            </Pressable>

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
  );
};

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  visible,
  ...props
}) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={props.onClose}>
      <LocationPickerContent {...props} />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    borderWidth: 1,
    maxHeight: '90%',
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  sheetHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.15)',
  },
  dragHandle: {
    width: 38,
    height: 4,
    backgroundColor: 'rgba(150,150,150,0.4)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleGroup: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  gpsQuickBtn: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  gpsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  gpsBtnTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  gpsBtnSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    marginTop: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 10,
    borderRadius: BorderRadius.md,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  mapInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    marginBottom: 6,
  },
  mapPlaceName: {
    fontSize: 14,
    fontWeight: '800',
  },
  mapCoordsText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  colombiaBadge: {
    backgroundColor: 'rgba(26, 169, 101, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  colombiaBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.primaryDark,
  },
  inputSection: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionsDropdown: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
  },
  suggCity: {
    fontSize: 13,
    fontWeight: '700',
  },
  suggDept: {
    fontSize: 11,
    marginTop: 1,
  },
  confirmBtn: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginTop: 8,
  },
  confirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});

