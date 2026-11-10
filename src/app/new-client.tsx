import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Switch,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
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
  CheckCircle2,
  Sparkles,
  FileSpreadsheet,
  BookUser,
  Navigation,
  Crosshair,
} from 'lucide-react-native';
import { usePrestago } from '@/context/PrestagoContext';
import { ModalidadCredito } from '@/types';
import { BrandColors, Colors, BorderRadius, Shadows, MaxContentWidth } from '@/constants/theme';
import {
  calcularCuota,
  formatCurrency,
  PLAZO_INDEFINIDO_CUOTAS,
} from '@/utils/finance';
import {
  ContactPickerModal,
  ContactoSeleccionado,
} from '@/components/ContactPickerModal';
import {
  LocationPickerModal,
  UbicacionSeleccionada,
} from '@/components/LocationPickerModal';
import { buscarMunicipiosColombia } from '@/constants/colombiaLocations';

export default function NewClientScreen() {
  const insets = useSafeAreaInsets();
  const { isDarkMode, agregarCliente, clientes, renovarPrestamo } = usePrestago();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const params = useLocalSearchParams();
  const renovarClienteId = params.renovarClienteId as string | undefined;
  const clienteARenovar = renovarClienteId
    ? clientes.find((c) => c.id === renovarClienteId)
    : undefined;

  // Estados del Formulario
  const [esMigrado, setEsMigrado] = useState<boolean>(false);
  const [nombre, setNombre] = useState<string>(clienteARenovar?.nombre || '');
  const [documento, setDocumento] = useState<string>(clienteARenovar?.documento || '');
  const [celular, setCelular] = useState<string>(clienteARenovar?.celular || '');
  const [ubicacion, setUbicacion] = useState<string>(clienteARenovar?.ubicacion || 'Medellín');

  // Estados para Contactos y Ubicación GPS
  const [modalContactosVisible, setModalContactosVisible] = useState<boolean>(false);
  const [modalMapaVisible, setModalMapaVisible] = useState<boolean>(false);
  const [coordenadas, setCoordenadas] = useState<{ lat: number; lng: number } | undefined>(
    clienteARenovar?.coordenadas
  );
  const [direccionDetalle, setDireccionDetalle] = useState<string | undefined>(
    clienteARenovar?.direccionDetalle
  );
  const [mostrarSugerenciasUbicacion, setMostrarSugerenciasUbicacion] = useState<boolean>(false);

  const handleContactSelected = (contacto: ContactoSeleccionado) => {
    setCelular(contacto.celular);
    if (!nombre.trim()) {
      setNombre(contacto.nombre);
    }
  };

  const handleUbicacionConfirmed = (loc: UbicacionSeleccionada) => {
    setUbicacion(loc.direccionCompleta);
    setCoordenadas(loc.coordenadas);
    setDireccionDetalle(loc.direccionDetalle);
    setMostrarSugerenciasUbicacion(false);
  };

  const [modalidad, setModalidad] = useState<ModalidadCredito>(
    clienteARenovar?.modalidad || 'Amortizado'
  );
  const [esIndefinido, setEsIndefinido] = useState<boolean>(
    clienteARenovar?.cuotasTotales === PLAZO_INDEFINIDO_CUOTAS || false
  );
  const [monto, setMonto] = useState<string>(
    clienteARenovar ? clienteARenovar.monto.toString() : '2000000'
  );
  const [tasaInteres, setTasaInteres] = useState<string>(
    clienteARenovar ? clienteARenovar.tasaInteres.toString() : '10'
  );
  const [plazoMeses, setPlazoMeses] = useState<string>('6');
  const [notas, setNotas] = useState<string>(clienteARenovar?.notas || '');

  // Campos específicos si es Migrado
  const [capitalPendienteMigrado, setCapitalPendienteMigrado] = useState<string>('');
  const [interesPendienteMigrado, setInteresPendienteMigrado] = useState<string>('');
  const [cuotasPagadasMigrado, setCuotasPagadasMigrado] = useState<string>('0');

  const numMonto = parseFloat(monto) || 0;
  const numTasa = parseFloat(tasaInteres) || 0;
  const numPlazo = esIndefinido
    ? PLAZO_INDEFINIDO_CUOTAS
    : parseInt(plazoMeses, 10) || 6;

  // Cálculo en vivo
  const calculo = calcularCuota({
    monto: numMonto,
    tasaInteres: numTasa,
    cuotasTotales: numPlazo,
    modalidad,
  });

  const CIUDADES_SUGERIDAS = [
    'Medellín',
    'Bello',
    'Envigado',
    'Itagüí',
    'Sabaneta',
    'Bogotá',
    'Cali',
  ];

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      showAlert('Campo requerido', 'Por favor ingresa el nombre del cliente.');
      return;
    }
    if (!documento.trim()) {
      showAlert('Campo requerido', 'Por favor ingresa el documento de identidad.');
      return;
    }
    if (!celular.trim()) {
      showAlert('Campo requerido', 'Por favor ingresa el celular para cobros de WhatsApp.');
      return;
    }
    if (numMonto <= 0) {
      showAlert('Monto inválido', 'El monto del préstamo debe ser mayor a 0.');
      return;
    }

    if (clienteARenovar) {
      // Renovar préstamo existente
      await renovarPrestamo({
        clienteId: clienteARenovar.id,
        nuevoMonto: numMonto,
        tasaInteres: numTasa,
        cuotasTotales: numPlazo,
        modalidad,
      });
      showAlert('¡Préstamo Renovado!', `Se ha renovado el préstamo a ${nombre} con éxito.`, () => {
        router.back();
      });
      return;
    }

    // Fecha actual y próximo cobro a 30 días
    const today = new Date().toISOString().split('T')[0];
    const prox = new Date();
    prox.setDate(prox.getDate() + 30);
    const proximoCobro = prox.toISOString().split('T')[0];

    const capPend = esMigrado && capitalPendienteMigrado
      ? parseFloat(capitalPendienteMigrado) || numMonto
      : undefined;

    const intPend = esMigrado && interesPendienteMigrado
      ? parseFloat(interesPendienteMigrado) || 0
      : undefined;

    const cuotasPag = esMigrado
      ? parseInt(cuotasPagadasMigrado, 10) || 0
      : 0;

    await agregarCliente({
      nombre: nombre.trim(),
      documento: documento.trim(),
      celular: celular.trim(),
      ubicacion: ubicacion.trim(),
      coordenadas,
      direccionDetalle,
      modalidad,
      monto: numMonto,
      tasaInteres: numTasa,
      cuota: calculo.cuota,
      cuotasTotales: numPlazo,
      fechaInicio: today,
      proximoCobro,
      esMigrado,
      notas: notas.trim() || undefined,
      capitalPendiente: capPend,
      interesPendiente: intPend,
      cuotasPagadas: cuotasPag,
    });

    showAlert('¡Cliente Registrado!', `El préstamo para ${nombre} ha sido creado exitosamente.`, () => {
      router.back();
    });
  };

  const showAlert = (title: string, msg: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${msg}`);
      if (onOk) onOk();
    } else {
      Alert.alert(title, msg, [{ text: 'OK', onPress: onOk }]);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      {/* Header Modal */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: theme.card,
            borderBottomColor: theme.border,
            paddingTop: Math.max(insets.top, 16) + 4,
          },
        ]}>
        <View style={styles.headerInnerRow}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              {clienteARenovar ? 'Renovar Préstamo' : 'Registrar Nuevo Préstamo'}
            </Text>
            <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
              {clienteARenovar
                ? `Cliente preaprobado: ${clienteARenovar.nombre}`
                : 'Configuración de crédito y condiciones'}
            </Text>
          </View>

          <Pressable
            onPress={() => router.back()}
            style={[
              styles.closeBtn,
              { backgroundColor: isDarkMode ? '#1E2636' : '#F1F5F9' },
            ]}>
            <X size={20} color={theme.text} />
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={true}
          contentContainerStyle={styles.scrollContent}>
        {/* Switch Préstamo Nuevo vs Migrado */}
        {!clienteARenovar && (
          <View
            style={[
              styles.switchCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}>
            <View style={styles.switchLeft}>
              <FileSpreadsheet
                size={20}
                color={esMigrado ? '#8B5CF6' : BrandColors.primary}
              />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={[styles.switchTitle, { color: theme.text }]}>
                  {esMigrado ? 'Préstamo Antiguo Migrado' : 'Préstamo Nuevo'}
                </Text>
                <Text style={[styles.switchSub, { color: theme.textSecondary }]}>
                  {esMigrado
                    ? 'Permite conciliar saldos pendientes y cuotas previas pagadas'
                    : 'Crédito que inicia desde cero hoy'}
                </Text>
              </View>
            </View>

            <Switch
              value={esMigrado}
              onValueChange={setEsMigrado}
              trackColor={{ false: '#CBD5E1', true: '#8B5CF6' }}
              thumbColor="#FFFFFF"
            />
          </View>
        )}

        {/* Datos Personales del Cliente */}
        <View style={styles.formSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Datos del Cliente
          </Text>

          {/* Nombre */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Nombre Completo:
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}>
              <User size={18} color={BrandColors.primary} />
              <TextInput
                value={nombre}
                onChangeText={setNombre}
                placeholder="Ej. Juan Carlos Pérez"
                placeholderTextColor={theme.textMuted}
                style={[styles.input, { color: theme.text }]}
              />
            </View>
          </View>

          {/* Documento y Celular */}
          <View style={styles.rowInputs}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Cédula / Documento:
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  },
                ]}>
                <CreditCard size={18} color={BrandColors.primary} />
                <TextInput
                  value={documento}
                  onChangeText={setDocumento}
                  keyboardType="numeric"
                  placeholder="Ej. 10203040"
                  placeholderTextColor={theme.textMuted}
                  style={[styles.input, { color: theme.text }]}
                />
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <View style={styles.labelHeaderRow}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>
                  Celular / WhatsApp:
                </Text>
                <Pressable
                  onPress={() => setModalContactosVisible(true)}
                  style={styles.importContactLink}>
                  <BookUser size={13} color={BrandColors.primary} />
                  <Text style={[styles.importContactText, { color: BrandColors.primary }]}>
                    Contactos
                  </Text>
                </Pressable>
              </View>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  },
                ]}>
                <Phone size={18} color={BrandColors.primary} />
                <TextInput
                  value={celular}
                  onChangeText={setCelular}
                  keyboardType="phone-pad"
                  placeholder="+57 300 000 0000"
                  placeholderTextColor={theme.textMuted}
                  style={[styles.input, { color: theme.text }]}
                />
                <Pressable
                  onPress={() => setModalContactosVisible(true)}
                  style={styles.contactBtnMini}
                  hitSlop={8}>
                  <BookUser size={18} color={BrandColors.primary} />
                </Pressable>
              </View>
            </View>
          </View>

          {/* Ubicación / Ciudad en Colombia */}
          <View style={styles.inputGroup}>
            <View style={styles.labelHeaderRow}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Ciudad / Dirección en Colombia:
              </Text>
              <Pressable
                onPress={() => setModalMapaVisible(true)}
                style={styles.mapQuickLink}>
                <Navigation size={13} color={BrandColors.primary} />
                <Text style={[styles.mapQuickText, { color: BrandColors.primary }]}>
                  Abrir Mapa GPS
                </Text>
              </Pressable>
            </View>

            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}>
              <MapPin size={18} color={BrandColors.primary} />
              <TextInput
                value={ubicacion}
                onFocus={() => setMostrarSugerenciasUbicacion(true)}
                onChangeText={(t) => {
                  setUbicacion(t);
                  setMostrarSugerenciasUbicacion(true);
                }}
                placeholder="Escribe municipio o dirección..."
                placeholderTextColor={theme.textMuted}
                style={[styles.input, { color: theme.text }]}
              />

              <Pressable
                onPress={() => setModalMapaVisible(true)}
                style={styles.mapPinActionBtn}>
                <LinearGradient
                  colors={[BrandColors.primary, BrandColors.primaryDark]}
                  style={styles.mapPinGradient}>
                  <Navigation size={12} color="#FFFFFF" />
                  <Text style={styles.mapPinActionText}>Mapa</Text>
                </LinearGradient>
              </Pressable>
            </View>

            {/* Desplegable en vivo de municipios de Colombia */}
            {mostrarSugerenciasUbicacion && ubicacion.trim().length > 0 && (
              <View
                style={[
                  styles.colombiaDropdown,
                  {
                    backgroundColor: isDarkMode ? '#17202D' : '#FFFFFF',
                    borderColor: theme.border,
                  },
                  Shadows.md,
                ]}>
                {buscarMunicipiosColombia(ubicacion, 5).map((m) => (
                  <Pressable
                    key={m.id}
                    onPress={() => {
                      setUbicacion(`${m.ciudad}, ${m.departamento}`);
                      setCoordenadas({ lat: m.lat, lng: m.lng });
                      setMostrarSugerenciasUbicacion(false);
                    }}
                    style={({ pressed }) => [
                      styles.colombiaDropdownItem,
                      {
                        backgroundColor: pressed
                          ? isDarkMode
                            ? '#222E3F'
                            : '#F1F5F9'
                          : 'transparent',
                        borderBottomColor: theme.border,
                      },
                    ]}>
                    <MapPin size={14} color={BrandColors.primary} />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={[styles.colombiaDropCity, { color: theme.text }]}>
                        {m.ciudad}
                      </Text>
                      <Text
                        style={[
                          styles.colombiaDropDepto,
                          { color: theme.textSecondary },
                        ]}>
                        {m.departamento} · Colombia
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Badge de coordenadas GPS fijadas */}
            {coordenadas && (
              <View style={styles.gpsActiveBadge}>
                <Crosshair size={13} color={BrandColors.primary} />
                <Text style={styles.gpsActiveText}>
                  GPS fijado: {coordenadas.lat.toFixed(4)}° N, {coordenadas.lng.toFixed(4)}° W
                </Text>
              </View>
            )}

            {/* Chips de Ciudades Frecuentes */}
            <View style={styles.chipsRow}>
              {CIUDADES_SUGERIDAS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => {
                    setUbicacion(c);
                    setMostrarSugerenciasUbicacion(false);
                  }}
                  style={[
                    styles.cityChip,
                    {
                      backgroundColor:
                        ubicacion.startsWith(c)
                          ? isDarkMode
                            ? '#1E3A2F'
                            : '#E8F8F0'
                          : isDarkMode
                          ? '#161D27'
                          : '#F1F5F9',
                      borderColor: ubicacion.startsWith(c) ? BrandColors.primary : theme.border,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.cityChipText,
                      {
                        color: ubicacion.startsWith(c) ? BrandColors.primary : theme.textSecondary,
                      },
                    ]}>
                    {c}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* CONDICIONES FINANCIERAS */}
        <View style={styles.formSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Modalidad y Condiciones Financieras
          </Text>

          {/* Modalidad de Cobro */}
          <View style={styles.modalidadSelector}>
            <Pressable
              onPress={() => setModalidad('Amortizado')}
              style={[
                styles.modBtn,
                modalidad === 'Amortizado' && styles.modBtnActive,
                {
                  backgroundColor:
                    modalidad === 'Amortizado'
                      ? BrandColors.primary
                      : theme.card,
                  borderColor:
                    modalidad === 'Amortizado'
                      ? BrandColors.primary
                      : theme.border,
                },
              ]}>
              <Text
                style={[
                  styles.modBtnTitle,
                  { color: modalidad === 'Amortizado' ? '#FFFFFF' : theme.text },
                ]}>
                Amortizado (Cap + Int)
              </Text>
              <Text
                style={[
                  styles.modBtnSub,
                  {
                    color:
                      modalidad === 'Amortizado'
                        ? 'rgba(255,255,255,0.85)'
                        : theme.textSecondary,
                  },
                ]}>
                La cuota mensual paga tanto intereses como abono al capital
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setModalidad('Solo Intereses')}
              style={[
                styles.modBtn,
                modalidad === 'Solo Intereses' && styles.modBtnActive,
                {
                  backgroundColor:
                    modalidad === 'Solo Intereses'
                      ? BrandColors.primary
                      : theme.card,
                  borderColor:
                    modalidad === 'Solo Intereses'
                      ? BrandColors.primary
                      : theme.border,
                },
              ]}>
              <Text
                style={[
                  styles.modBtnTitle,
                  { color: modalidad === 'Solo Intereses' ? '#FFFFFF' : theme.text },
                ]}>
                Solo Intereses (Al final)
              </Text>
              <Text
                style={[
                  styles.modBtnSub,
                  {
                    color:
                      modalidad === 'Solo Intereses'
                        ? 'rgba(255,255,255,0.85)'
                        : theme.textSecondary,
                  },
                ]}>
                La cuota equivale al interés mensual; el capital queda intacto
              </Text>
            </Pressable>
          </View>

          {/* Monto y Tasa */}
          <View style={styles.rowInputs}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Monto del Préstamo:
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  },
                ]}>
                <DollarSign size={18} color={BrandColors.primary} />
                <TextInput
                  value={monto}
                  onChangeText={setMonto}
                  keyboardType="numeric"
                  placeholder="2000000"
                  placeholderTextColor={theme.textMuted}
                  style={[styles.input, { color: theme.text }]}
                />
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Tasa Mensual (%):
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.card,
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

          {/* Plazo vs Plazo Indefinido (Mes a Mes) */}
          <View style={styles.inputGroup}>
            <View style={styles.indefinidoRow}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Plazo de Devolución:
              </Text>

              {/* Casilla Plazo Indefinido (999) */}
              <Pressable
                onPress={() => setEsIndefinido(!esIndefinido)}
                style={[
                  styles.indefinidoBox,
                  {
                    backgroundColor: esIndefinido
                      ? BrandColors.primaryLight
                      : isDarkMode
                      ? '#161D27'
                      : '#F1F5F9',
                    borderColor: esIndefinido ? BrandColors.primary : theme.border,
                  },
                ]}>
                <Text
                  style={[
                    styles.indefinidoText,
                    {
                      color: esIndefinido
                        ? BrandColors.primaryDark
                        : theme.textSecondary,
                    },
                  ]}>
                  {esIndefinido
                    ? '✓ Plazo Indefinido (Mes a Mes / 999)'
                    : 'Activar Plazo Indefinido'}
                </Text>
              </Pressable>
            </View>

            {!esIndefinido ? (
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  },
                ]}>
                <Calendar size={18} color={BrandColors.primary} />
                <TextInput
                  value={plazoMeses}
                  onChangeText={setPlazoMeses}
                  keyboardType="numeric"
                  placeholder="6"
                  placeholderTextColor={theme.textMuted}
                  style={[styles.input, { color: theme.text }]}
                />
                <Text style={{ color: theme.textSecondary, marginRight: 6 }}>
                  meses
                </Text>
              </View>
            ) : (
              <View
                style={[
                  styles.indefinidoNotice,
                  {
                    backgroundColor: isDarkMode ? '#13231B' : '#E8F8F0',
                    borderColor: BrandColors.primary,
                  },
                ]}>
                <Text style={[styles.indefinidoNoticeText, { color: BrandColors.primaryDark }]}>
                  📌 Registrado con código 999: El cliente pagará una cuota mensual fija equivalente al interés pactado ({numTasa}%) hasta que realice abonos a capital o liquide el total.
                </Text>
              </View>
            )}
          </View>

          {/* Campos adicionales si es migrado */}
          {esMigrado && (
            <View
              style={[
                styles.migradoSection,
                {
                  backgroundColor: isDarkMode ? '#1B1728' : '#F5F3FF',
                  borderColor: '#8B5CF6',
                },
              ]}>
              <Text style={[styles.migradoTitle, { color: isDarkMode ? '#DDD6FE' : '#6D28D9' }]}>
                Saldos de Conciliación de Migración
              </Text>

              <View style={styles.rowInputs}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>
                    Capital Pendiente:
                  </Text>
                  <TextInput
                    value={capitalPendienteMigrado}
                    onChangeText={setCapitalPendienteMigrado}
                    keyboardType="numeric"
                    placeholder={`Por defecto: ${monto}`}
                    placeholderTextColor={theme.textMuted}
                    style={[
                      styles.migradoInput,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                        color: theme.text,
                      },
                    ]}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>
                    Cuotas Pagadas:
                  </Text>
                  <TextInput
                    value={cuotasPagadasMigrado}
                    onChangeText={setCuotasPagadasMigrado}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={theme.textMuted}
                    style={[
                      styles.migradoInput,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                        color: theme.text,
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={{ marginTop: 10 }}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>
                  Interés Pendiente Acumulado:
                </Text>
                <TextInput
                  value={interesPendienteMigrado}
                  onChangeText={setInteresPendienteMigrado}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={theme.textMuted}
                  style={[
                    styles.migradoInput,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Notas */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Notas adicionales del cliente:
            </Text>
            <TextInput
              value={notas}
              onChangeText={setNotas}
              placeholder="Ej. Recomendado por don Mario, negocio de abarrotes..."
              placeholderTextColor={theme.textMuted}
              style={[
                styles.textArea,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* RESUMEN DE LIQUIDACIÓN EN TIEMPO REAL */}
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: isDarkMode ? '#13231B' : '#E8F8F0',
              borderColor: BrandColors.primary,
            },
          ]}>
          <View style={styles.summaryTop}>
            <Sparkles size={18} color={BrandColors.primary} />
            <Text style={[styles.summaryTitle, { color: BrandColors.primaryDark }]}>
              Resumen del Crédito Calculado
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Cuota Fija Mensual:
            </Text>
            <Text style={[styles.summaryValueBig, { color: isDarkMode ? '#2EE28B' : '#0E7A46' }]}>
              {formatCurrency(calculo.cuota)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              {esIndefinido ? 'Interés Mensual Base:' : 'Interés Total del Plazo:'}
            </Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>
              {formatCurrency(calculo.interesTotal)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              {esIndefinido ? 'Capital a Devolver al Final:' : 'Total a Recaudar:'}
            </Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>
              {formatCurrency(calculo.totalAPagar)}
            </Text>
          </View>

          {!esIndefinido && modalidad === 'Amortizado' && (
            <View
              style={[
                styles.summaryBreakdownRow,
                { borderTopColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' },
              ]}>
              <View style={styles.summaryBreakdownItem}>
                <Text style={[styles.summaryBreakdownLabel, { color: theme.textSecondary }]}>
                  Abono a Capital:
                </Text>
                <Text style={[styles.summaryBreakdownVal, { color: theme.text }]}>
                  {formatCurrency(calculo.abonoCapitalPorCuota)} / cuota
                </Text>
              </View>
              <View style={styles.summaryBreakdownItem}>
                <Text style={[styles.summaryBreakdownLabel, { color: theme.textSecondary }]}>
                  Abono a Interés:
                </Text>
                <Text style={[styles.summaryBreakdownVal, { color: BrandColors.primary }]}>
                  {formatCurrency(calculo.abonoInteresPorCuota)} / cuota
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Botón Guardar */}
        <Pressable
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.submitBtn,
            { opacity: pressed ? 0.85 : 1 },
            Shadows.glowGreen,
          ]}>
          <LinearGradient
            colors={[BrandColors.primary, BrandColors.primaryDark]}
            style={styles.submitGradient}>
            <CheckCircle2 size={20} color="#FFFFFF" />
            <Text style={styles.submitText}>
              {clienteARenovar ? 'Confirmar Renovación' : 'Registrar y Activar Préstamo'}
            </Text>
          </LinearGradient>
        </Pressable>

          <View style={{ height: Math.max(insets.bottom, 20) + 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* MODAL IMPORTADOR DE CONTACTOS */}
      <ContactPickerModal
        visible={modalContactosVisible}
        isDarkMode={isDarkMode}
        onClose={() => setModalContactosVisible(false)}
        onSelectContact={handleContactSelected}
      />

      {/* MODAL MAPA GPS & UBICACIÓN EXACTA EN COLOMBIA */}
      <LocationPickerModal
        visible={modalMapaVisible}
        isDarkMode={isDarkMode}
        initialUbicacion={ubicacion}
        onClose={() => setModalMapaVisible(false)}
        onConfirm={handleUbicacionConfirmed}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerBar: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerInnerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSub: {
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
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  switchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: 20,
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  switchSub: {
    fontSize: 11,
    marginTop: 2,
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  labelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  importContactLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(26, 169, 101, 0.1)',
  },
  importContactText: {
    fontSize: 11,
    fontWeight: '700',
  },
  contactBtnMini: {
    padding: 6,
    marginLeft: 4,
  },
  mapQuickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(26, 169, 101, 0.1)',
  },
  mapQuickText: {
    fontSize: 11,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  mapPinActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  colombiaDropdown: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: 4,
    overflow: 'hidden',
    zIndex: 10,
  },
  colombiaDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
  },
  colombiaDropCity: {
    fontSize: 13,
    fontWeight: '700',
  },
  colombiaDropDepto: {
    fontSize: 11,
    marginTop: 1,
  },
  gpsActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(26, 169, 101, 0.12)',
    alignSelf: 'flex-start',
  },
  gpsActiveText: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.primaryDark,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  cityChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  cityChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  modalidadSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  modBtn: {
    flex: 1,
    padding: 12,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  modBtnActive: {},
  modBtnTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  modBtnSub: {
    fontSize: 11,
    lineHeight: 15,
  },
  indefinidoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  indefinidoBox: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  indefinidoText: {
    fontSize: 11,
    fontWeight: '700',
  },
  indefinidoNotice: {
    padding: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  indefinidoNoticeText: {
    fontSize: 12,
    lineHeight: 18,
  },
  migradoSection: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  migradoTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  migradoInput: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 42,
    fontSize: 13,
    fontWeight: '600',
  },
  textArea: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    height: 70,
    textAlignVertical: 'top',
  },
  summaryCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 20,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  summaryValueBig: {
    fontSize: 20,
    fontWeight: '900',
  },
  summaryBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 6,
    borderTopWidth: 1,
  },
  summaryBreakdownItem: {
    flex: 1,
  },
  summaryBreakdownLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  summaryBreakdownVal: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  submitBtn: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});

