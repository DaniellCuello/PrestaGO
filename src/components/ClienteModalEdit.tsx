import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  User,
  CreditCard,
  Phone,
  MapPin,
  DollarSign,
  Percent,
  Calendar,
  FileText,
  Save,
  Building,
  BookUser,
  Navigation,
  Crosshair,
} from 'lucide-react-native';
import { Cliente, ModalidadCredito } from '@/types';
import { BrandColors, Colors, BorderRadius, Shadows } from '@/constants/theme';
import {
  buscarMunicipiosColombia,
  MunicipioColombia,
} from '@/constants/colombiaLocations';
import {
  ContactPickerModal,
  ContactoSeleccionado,
  normalizarCelularColombia,
} from './ContactPickerModal';
import {
  LocationPickerModal,
  UbicacionSeleccionada,
} from './LocationPickerModal';

export interface ClienteModalEditProps {
  visible: boolean;
  cliente: Cliente | null;
  isDarkMode: boolean;
  onClose: () => void;
  onSave: (id: string, data: Partial<Cliente>) => void | Promise<void>;
}

interface EditContentProps {
  cliente: Cliente;
  isDarkMode: boolean;
  onClose: () => void;
  onSave: (id: string, data: Partial<Cliente>) => void | Promise<void>;
}

const ClienteModalEditContent: React.FC<EditContentProps> = ({
  cliente,
  isDarkMode,
  onClose,
  onSave,
}) => {
  const insets = useSafeAreaInsets();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  // Estados locales inicializados directamente con los datos del cliente
  const [nombre, setNombre] = useState(cliente.nombre);
  const [documento, setDocumento] = useState(cliente.documento);
  const [celular, setCelular] = useState(cliente.celular);
  const [ubicacion, setUbicacion] = useState(cliente.ubicacion);
  const [coordenadas, setCoordenadas] = useState<{ lat: number; lng: number } | undefined>(
    cliente.coordenadas
  );
  const [direccionDetalle, setDireccionDetalle] = useState<string | undefined>(
    cliente.direccionDetalle
  );
  const [modalidad, setModalidad] = useState<ModalidadCredito>(cliente.modalidad);
  const [tasaInteres, setTasaInteres] = useState(cliente.tasaInteres.toString());
  const [cuota, setCuota] = useState(cliente.cuota.toString());
  const [capitalPendiente, setCapitalPendiente] = useState(cliente.capitalPendiente.toString());
  const [interesPendiente, setInteresPendiente] = useState(cliente.interesPendiente.toString());
  const [proximoCobro, setProximoCobro] = useState(cliente.proximoCobro);
  const [notas, setNotas] = useState(cliente.notas || '');

  // Modales de selector de contactos y mapa GPS
  const [modalContactosVisible, setModalContactosVisible] = useState(false);
  const [modalMapaVisible, setModalMapaVisible] = useState(false);

  // Autocompletado de municipios de Colombia
  const [mostrarSugerenciasUbicacion, setMostrarSugerenciasUbicacion] = useState(false);
  const sugerenciasUbicacion = buscarMunicipiosColombia(ubicacion, 4);

  const handleSeleccionarMunicipio = (mun: MunicipioColombia) => {
    setUbicacion(`${mun.ciudad}, ${mun.departamento}`);
    setCoordenadas({ lat: mun.lat, lng: mun.lng });
    setMostrarSugerenciasUbicacion(false);
  };

  const handleContactSelected = (contacto: ContactoSeleccionado) => {
    setCelular(contacto.celular);
    if (!nombre.trim() && contacto.nombre) {
      setNombre(contacto.nombre);
    }
    setModalContactosVisible(false);
  };

  const handleUbicacionConfirmed = (loc: UbicacionSeleccionada) => {
    setUbicacion(loc.direccionCompleta);
    setCoordenadas(loc.coordenadas);
    setDireccionDetalle(loc.direccionDetalle);
    setMostrarSugerenciasUbicacion(false);
    setModalMapaVisible(false);
  };

  const handleGuardar = () => {
    if (!nombre.trim()) {
      const msg = 'El nombre del cliente no puede estar vacío.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Campo Requerido', msg);
      return;
    }

    if (!documento.trim()) {
      const msg = 'El documento de identidad es obligatorio.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Campo Requerido', msg);
      return;
    }

    if (!celular.trim()) {
      const msg = 'El número de celular o WhatsApp es obligatorio.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Campo Requerido', msg);
      return;
    }

    const parsedTasa = parseFloat(tasaInteres) || 0;
    const parsedCuota = parseFloat(cuota) || 0;
    const parsedCapital = parseFloat(capitalPendiente) || 0;
    const parsedInteres = parseFloat(interesPendiente) || 0;
    const nuevoTotal = parsedCapital + parsedInteres;

    const dataActualizada: Partial<Cliente> = {
      nombre: nombre.trim(),
      documento: documento.trim(),
      celular: normalizarCelularColombia(celular) || celular.trim(),
      ubicacion: ubicacion.trim() || 'Colombia',
      coordenadas,
      direccionDetalle,
      modalidad,
      tasaInteres: parsedTasa,
      cuota: parsedCuota,
      capitalPendiente: parsedCapital,
      interesPendiente: parsedInteres,
      totalPendiente: nuevoTotal,
      proximoCobro: proximoCobro.trim() || cliente.proximoCobro,
      notas: notas.trim() || undefined,
      estadoMora: nuevoTotal <= 0 ? 'paz_y_salvo' : cliente.estadoMora === 'paz_y_salvo' ? 'al_dia' : cliente.estadoMora,
    };

    onSave(cliente.id, dataActualizada);
    onClose();
  };

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
            <View>
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                Editar Información del Cliente
              </Text>
              <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                Modifica los datos del cliente y condiciones del crédito
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
          {/* Nombre */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
              Nombre Completo *
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: isDarkMode ? '#131A24' : '#F8FAFC',
                  borderColor: theme.border,
                },
              ]}>
              <User size={18} color={BrandColors.primary} />
              <TextInput
                value={nombre}
                onChangeText={setNombre}
                placeholder="Nombre del cliente"
                placeholderTextColor={theme.textMuted}
                style={[styles.input, { color: theme.text }]}
              />
            </View>
          </View>

          {/* Fila: Documento y Celular */}
          <View style={styles.formRow}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                Documento (C.C.) *
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: isDarkMode ? '#131A24' : '#F8FAFC',
                    borderColor: theme.border,
                  },
                ]}>
                <CreditCard size={18} color={BrandColors.primary} />
                <TextInput
                  value={documento}
                  onChangeText={setDocumento}
                  keyboardType="numeric"
                  placeholder="Número de cédula"
                  placeholderTextColor={theme.textMuted}
                  style={[styles.input, { color: theme.text }]}
                />
              </View>
            </View>

            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                Celular / WhatsApp *
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: isDarkMode ? '#131A24' : '#F8FAFC',
                    borderColor: theme.border,
                  },
                ]}>
                <Phone size={18} color={BrandColors.primary} />
                <TextInput
                  value={celular}
                  onChangeText={setCelular}
                  keyboardType="phone-pad"
                  placeholder="3XXXXXXXXX"
                  placeholderTextColor={theme.textMuted}
                  style={[styles.input, { color: theme.text }]}
                />
                <Pressable
                  onPress={() => setModalContactosVisible(true)}
                  accessibilityLabel="Importar contacto desde el dispositivo"
                  style={styles.contactBtnMini}
                  hitSlop={8}>
                  <BookUser size={18} color={BrandColors.primary} />
                </Pressable>
              </View>
            </View>
          </View>

          {/* Ubicación / Ciudad con autocompletado y mapa GPS */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelHeaderRow}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                Ciudad o Dirección en Colombia
              </Text>
              <Pressable
                onPress={() => setModalMapaVisible(true)}
                accessibilityLabel="Abrir mapa interactivo GPS"
                style={styles.mapQuickLink}>
                <Navigation size={12} color={BrandColors.primary} />
                <Text style={[styles.mapQuickText, { color: BrandColors.primary }]}>
                  Abrir Mapa GPS
                </Text>
              </Pressable>
            </View>

            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: isDarkMode ? '#131A24' : '#F8FAFC',
                  borderColor: theme.border,
                },
              ]}>
              <MapPin size={18} color={BrandColors.primary} />
              <TextInput
                value={ubicacion}
                onChangeText={(text) => {
                  setUbicacion(text);
                  setMostrarSugerenciasUbicacion(text.length >= 2);
                }}
                onFocus={() => {
                  if (ubicacion.length >= 2) setMostrarSugerenciasUbicacion(true);
                }}
                placeholder="Ej. Medellín, Envigado, Bogotá..."
                placeholderTextColor={theme.textMuted}
                style={[styles.input, { color: theme.text }]}
              />

              <Pressable
                onPress={() => setModalMapaVisible(true)}
                accessibilityLabel="Fijar ubicación en mapa"
                style={styles.mapPinActionBtn}>
                <LinearGradient
                  colors={[BrandColors.primary, BrandColors.primaryDark]}
                  style={styles.mapPinGradient}>
                  <Navigation size={11} color="#FFFFFF" />
                  <Text style={styles.mapPinActionText}>Mapa</Text>
                </LinearGradient>
              </Pressable>
            </View>

            {/* Badge de coordenadas GPS fijadas */}
            {coordenadas && (
              <View
                style={[
                  styles.gpsActiveBadge,
                  {
                    backgroundColor: isDarkMode ? '#13231B' : '#E8F8F0',
                    borderColor: BrandColors.primary,
                  },
                ]}>
                <Crosshair size={12} color={BrandColors.primary} />
                <Text style={[styles.gpsActiveText, { color: BrandColors.primaryDark }]}>
                  GPS fijado: {coordenadas.lat.toFixed(4)}° N, {coordenadas.lng.toFixed(4)}° W
                </Text>
              </View>
            )}

            {mostrarSugerenciasUbicacion && sugerenciasUbicacion.length > 0 && (
              <View
                style={[
                  styles.suggestionsBox,
                  {
                    backgroundColor: isDarkMode ? '#1A2332' : '#FFFFFF',
                    borderColor: theme.border,
                  },
                  Shadows.md,
                ]}>
                {sugerenciasUbicacion.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => handleSeleccionarMunicipio(item)}
                    style={({ pressed }) => [
                      styles.suggestionItem,
                      {
                        borderBottomColor: theme.border,
                        backgroundColor: pressed
                          ? isDarkMode
                            ? '#243044'
                            : '#F1F5F9'
                          : 'transparent',
                      },
                    ]}>
                    <Building size={14} color={BrandColors.primary} />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={[styles.suggestionCity, { color: theme.text }]}>
                        {item.ciudad}
                      </Text>
                      <Text style={[styles.suggestionDept, { color: theme.textSecondary }]}>
                        {item.departamento}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Modalidad de Cobro */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
              Modalidad de Crédito
            </Text>
            <View style={styles.modalidadPills}>
              <Pressable
                onPress={() => setModalidad('Amortizado')}
                style={[
                  styles.modalidadPill,
                  {
                    backgroundColor:
                      modalidad === 'Amortizado'
                        ? BrandColors.primary
                        : isDarkMode
                        ? '#161D27'
                        : '#F1F5F9',
                    borderColor:
                      modalidad === 'Amortizado' ? BrandColors.primary : theme.border,
                  },
                ]}>
                <Text
                  style={[
                    styles.modalidadText,
                    {
                      color: modalidad === 'Amortizado' ? '#FFFFFF' : theme.text,
                      fontWeight: modalidad === 'Amortizado' ? '800' : '600',
                    },
                  ]}>
                  Amortizado (Capital + Interés)
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setModalidad('Solo Intereses')}
                style={[
                  styles.modalidadPill,
                  {
                    backgroundColor:
                      modalidad === 'Solo Intereses'
                        ? BrandColors.primary
                        : isDarkMode
                        ? '#161D27'
                        : '#F1F5F9',
                    borderColor:
                      modalidad === 'Solo Intereses' ? BrandColors.primary : theme.border,
                  },
                ]}>
                <Text
                  style={[
                    styles.modalidadText,
                    {
                      color: modalidad === 'Solo Intereses' ? '#FFFFFF' : theme.text,
                      fontWeight: modalidad === 'Solo Intereses' ? '800' : '600',
                    },
                  ]}>
                  Solo Intereses (Mes a Mes)
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Fila: Cuota Mensual y Tasa de Interés */}
          <View style={styles.formRow}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                Cuota Mensual ($ COP) *
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: isDarkMode ? '#131A24' : '#F8FAFC',
                    borderColor: theme.border,
                  },
                ]}>
                <DollarSign size={18} color={BrandColors.primary} />
                <TextInput
                  value={cuota}
                  onChangeText={setCuota}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={theme.textMuted}
                  style={[styles.input, { color: theme.text }]}
                />
              </View>
            </View>

            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                Tasa Interés (%) *
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: isDarkMode ? '#131A24' : '#F8FAFC',
                    borderColor: theme.border,
                  },
                ]}>
                <Percent size={18} color={BrandColors.primary} />
                <TextInput
                  value={tasaInteres}
                  onChangeText={setTasaInteres}
                  keyboardType="numeric"
                  placeholder="10"
                  placeholderTextColor={theme.textMuted}
                  style={[styles.input, { color: theme.text }]}
                />
              </View>
            </View>
          </View>

          {/* Fila: Capital Pendiente e Interés Pendiente */}
          <View style={styles.formRow}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                Capital Pendiente ($)
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: isDarkMode ? '#131A24' : '#F8FAFC',
                    borderColor: theme.border,
                  },
                ]}>
                <DollarSign size={18} color="#3B82F6" />
                <TextInput
                  value={capitalPendiente}
                  onChangeText={setCapitalPendiente}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={theme.textMuted}
                  style={[styles.input, { color: theme.text }]}
                />
              </View>
            </View>

            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                Interés Pendiente ($)
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: isDarkMode ? '#131A24' : '#F8FAFC',
                    borderColor: theme.border,
                  },
                ]}>
                <DollarSign size={18} color="#F59E0B" />
                <TextInput
                  value={interesPendiente}
                  onChangeText={setInteresPendiente}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={theme.textMuted}
                  style={[styles.input, { color: theme.text }]}
                />
              </View>
            </View>
          </View>

          {/* Próximo Cobro */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
              Fecha Próximo Cobro (AAAA-MM-DD)
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: isDarkMode ? '#131A24' : '#F8FAFC',
                  borderColor: theme.border,
                },
              ]}>
              <Calendar size={18} color={BrandColors.primary} />
              <TextInput
                value={proximoCobro}
                onChangeText={setProximoCobro}
                placeholder="2026-10-25"
                placeholderTextColor={theme.textMuted}
                style={[styles.input, { color: theme.text }]}
              />
            </View>
          </View>

          {/* Notas */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
              Notas y Observaciones
            </Text>
            <View
              style={[
                styles.textAreaWrapper,
                {
                  backgroundColor: isDarkMode ? '#131A24' : '#F8FAFC',
                  borderColor: theme.border,
                },
              ]}>
              <FileText size={18} color={theme.textMuted} style={{ marginTop: 2 }} />
              <TextInput
                value={notas}
                onChangeText={setNotas}
                multiline
                numberOfLines={3}
                placeholder="Detalles del cliente, lugar de cobro..."
                placeholderTextColor={theme.textMuted}
                style={[styles.textArea, { color: theme.text }]}
              />
            </View>
          </View>

          {/* Botones de Acción */}
          <View style={styles.actionButtons}>
            <Pressable
              onPress={onClose}
              style={[
                styles.cancelBtn,
                {
                  backgroundColor: isDarkMode ? '#1E2636' : '#F1F5F9',
                  borderColor: theme.border,
                },
              ]}>
              <Text style={[styles.cancelBtnText, { color: theme.text }]}>
                Cancelar
              </Text>
            </Pressable>

            <Pressable
              onPress={handleGuardar}
              style={[styles.saveBtn, Shadows.glowGreen]}>
              <LinearGradient
                colors={[BrandColors.primary, BrandColors.primaryDark]}
                style={styles.saveGradient}>
                <Save size={18} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>Guardar Cambios</Text>
              </LinearGradient>
            </Pressable>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Modal Selector de Contactos */}
        <ContactPickerModal
          visible={modalContactosVisible}
          isDarkMode={isDarkMode}
          onClose={() => setModalContactosVisible(false)}
          onSelectContact={handleContactSelected}
        />

        {/* Modal Selector de Ubicación con Mapa GPS */}
        <LocationPickerModal
          visible={modalMapaVisible}
          isDarkMode={isDarkMode}
          initialUbicacion={ubicacion}
          onClose={() => setModalMapaVisible(false)}
          onConfirm={handleUbicacionConfirmed}
        />
      </View>
    </View>
  );
};

export const ClienteModalEdit: React.FC<ClienteModalEditProps> = ({
  visible,
  cliente,
  ...props
}) => {
  if (!visible || !cliente) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={props.onClose}>
      <ClienteModalEditContent cliente={cliente} {...props} />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    borderWidth: 1,
    maxHeight: '92%',
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  sheetHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
  },
  dragHandle: {
    width: 38,
    height: 4,
    backgroundColor: 'rgba(150, 150, 150, 0.4)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
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
  fieldGroup: {
    gap: 6,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    height: 46,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  textAreaWrapper: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  textArea: {
    flex: 1,
    fontSize: 13,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  suggestionsBox: {
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
  suggestionCity: {
    fontSize: 13,
    fontWeight: '700',
  },
  suggestionDept: {
    fontSize: 11,
    marginTop: 1,
  },
  modalidadPills: {
    flexDirection: 'row',
    gap: 8,
  },
  modalidadPill: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalidadText: {
    fontSize: 12,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 2,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  contactBtnMini: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  labelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  mapQuickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mapQuickText: {
    fontSize: 12,
    fontWeight: '700',
  },
  mapPinActionBtn: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginLeft: 6,
  },
  mapPinGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  mapPinActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  gpsActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  gpsActiveText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

