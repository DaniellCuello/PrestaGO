import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Linking,
  Platform,
  Alert,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Phone,
  MessageCircle,
  ShieldCheck,
  DollarSign,
  Info,
  CheckCircle,
  FileText,
  Edit3,
  Trash2,
  Share2,
} from 'lucide-react-native';
import { Cliente, HistorialPago, TipoPago } from '@/types';
import { Colors, BrandColors, BorderRadius, Shadows } from '@/constants/theme';
import {
  aplicarAbonoACliente,
  formatCurrency,
  formatDate,
  getInfoEstadoMora,
  PLAZO_INDEFINIDO_CUOTAS,
} from '@/utils/finance';
import { ClienteModalEdit } from './ClienteModalEdit';

interface ClienteModalDetailProps {
  visible: boolean;
  cliente: Cliente | null;
  historial: HistorialPago[];
  isDarkMode: boolean;
  onClose: () => void;
  onRegistrarPago: (params: {
    clienteId: string;
    monto: number;
    tipo: TipoPago;
    subtipo?: 'Capital' | 'Interés' | 'Mixto' | 'Cuota';
    nota?: string;
  }) => void;
  onRenovar?: () => void;
  onActualizarCliente?: (id: string, data: Partial<Cliente>) => void;
  onEliminarCliente?: (id: string) => void;
}

interface ClienteModalContentProps {
  cliente: Cliente;
  historial: HistorialPago[];
  isDarkMode: boolean;
  onClose: () => void;
  onRegistrarPago: (params: {
    clienteId: string;
    monto: number;
    tipo: TipoPago;
    subtipo?: 'Capital' | 'Interés' | 'Mixto' | 'Cuota';
    nota?: string;
  }) => void;
  onRenovar?: () => void;
  onActualizarCliente?: (id: string, data: Partial<Cliente>) => void;
  onEliminarCliente?: (id: string) => void;
}

const ClienteModalDetailContent: React.FC<ClienteModalContentProps> = ({
  cliente,
  historial,
  isDarkMode,
  onClose,
  onRegistrarPago,
  onRenovar,
  onActualizarCliente,
  onEliminarCliente,
}) => {
  const insets = useSafeAreaInsets();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const statusInfo = getInfoEstadoMora(cliente.estadoMora);
  const isPazYSalvo = cliente.estadoMora === 'paz_y_salvo';
  const esIndefinido = cliente.cuotasTotales === PLAZO_INDEFINIDO_CUOTAS;

  const [showEditModal, setShowEditModal] = useState(false);

  // Estado del simulador de abonos inicializado limpiamente con el cliente activo
  const [tipoSeleccionado, setTipoSeleccionado] = useState<'Cuota' | 'Capital' | 'Interés' | 'Total'>('Cuota');
  const [montoInput, setMontoInput] = useState<string>(cliente.cuota.toString());
  const [notaPago, setNotaPago] = useState<string>('');

  // Seleccionar tipo de pago y actualizar sugerencia de monto
  const handleSelectTipo = (tipo: 'Cuota' | 'Capital' | 'Interés' | 'Total') => {
    setTipoSeleccionado(tipo);
    if (tipo === 'Cuota') {
      setMontoInput(cliente.cuota.toString());
    } else if (tipo === 'Capital') {
      setMontoInput(Math.min(500000, cliente.capitalPendiente).toString());
    } else if (tipo === 'Interés') {
      setMontoInput(Math.min(cliente.cuota, cliente.interesPendiente || cliente.cuota).toString());
    } else if (tipo === 'Total') {
      setMontoInput(cliente.totalPendiente.toString());
    }
  };

  const parsedMonto = parseFloat(montoInput) || 0;

  // Cálculo en tiempo real de la simulación de abono
  const subtipoSimulado =
    tipoSeleccionado === 'Capital'
      ? 'Capital'
      : tipoSeleccionado === 'Interés'
      ? 'Interés'
      : tipoSeleccionado === 'Total'
      ? 'Mixto'
      : 'Cuota';

  const proyeccion = aplicarAbonoACliente(cliente, parsedMonto, subtipoSimulado);

  const handleLlamar = () => {
    const tel = cliente.celular.replace(/\s+/g, '');
    Linking.openURL(`tel:${tel}`).catch(() => {});
  };

  const handleWhatsApp = () => {
    const cleanNumber = cliente.celular.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `Hola ${cliente.nombre}, le escribo de PrestaGo para recordarle el estado de su crédito. Saldo pendiente: ${formatCurrency(
        cliente.totalPendiente
      )}, valor de la cuota: ${formatCurrency(cliente.cuota)}.`
    );
    Linking.openURL(`https://wa.me/${cleanNumber}?text=${msg}`).catch(() => {});
  };

  const handleEnviarEstadoWhatsApp = () => {
    const cleanNumber = cliente.celular.replace(/[^0-9]/g, '');
    const cuotasTxt = esIndefinido
      ? `${cliente.cuotasPagadas} (Plazo Indefinido - Mes a Mes)`
      : `${cliente.cuotasPagadas} de ${cliente.cuotasTotales}`;

    const mensaje = [
      `📋 *ESTADO DE CUENTA - PRESTAGO*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `👤 *Cliente:* ${cliente.nombre}`,
      `🪪 *Documento:* ${cliente.documento}`,
      `📍 *Ubicación:* ${cliente.ubicacion}`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `💰 *Monto Inicial:* ${formatCurrency(cliente.monto)}`,
      `📊 *Modalidad:* ${cliente.modalidad} (${cliente.tasaInteres}% mensual)`,
      `💵 *Cuota Acordada:* ${formatCurrency(cliente.cuota)}`,
      `📅 *Próximo Cobro:* ${formatDate(cliente.proximoCobro)}`,
      `🔄 *Cuotas Pagadas:* ${cuotasTxt}`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `📉 *Capital Pendiente:* ${formatCurrency(cliente.capitalPendiente)}`,
      `📈 *Interés Pendiente:* ${formatCurrency(cliente.interesPendiente)}`,
      `🔴 *TOTAL PENDIENTE:* ${formatCurrency(cliente.totalPendiente)}`,
      `📌 *Estado Actual:* ${statusInfo.label} (${statusInfo.badge})`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `_Agradecemos su puntualidad y confianza en nuestro servicio._`,
      `_PrestaGo · Control Financiero Inteligente_`,
    ].join('\n');

    const encoded = encodeURIComponent(mensaje);
    Linking.openURL(`https://wa.me/${cleanNumber}?text=${encoded}`).catch(() => {
      Alert.alert('Error', 'No se pudo abrir WhatsApp en este dispositivo.');
    });
  };

  const handleEliminarCliente = () => {
    const confirmarEliminacion = () => {
      onEliminarCliente?.(cliente.id);
      onClose();
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`¿Estás seguro de eliminar a ${cliente.nombre}? Esta acción eliminará al cliente y todos sus registros de pago.`)) {
        confirmarEliminacion();
      }
    } else {
      Alert.alert(
        'Eliminar Cliente',
        `¿Deseas eliminar permanentemente a "${cliente.nombre}"?\n\nEsta acción no se puede deshacer y borrará todos los pagos e historial registrados.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: confirmarEliminacion },
        ]
      );
    }
  };

  const handleConfirmarPago = () => {
    if (parsedMonto <= 0) {
      if (Platform.OS === 'web') {
        alert('Por favor ingrese un monto válido para el abono.');
      } else {
        Alert.alert('Monto Inválido', 'Por favor ingrese un monto mayor a cero.');
      }
      return;
    }

    const tipoFinal: TipoPago =
      tipoSeleccionado === 'Capital'
        ? 'Abono Capital'
        : tipoSeleccionado === 'Interés'
        ? 'Abono Interés'
        : tipoSeleccionado === 'Total'
        ? 'Pago Total'
        : 'Cuota';

    onRegistrarPago({
      clienteId: cliente.id,
      monto: parsedMonto,
      tipo: tipoFinal,
      subtipo: subtipoSimulado,
      nota: notaPago.trim() || undefined,
    });

    onClose();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.overlay}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => {
          Keyboard.dismiss();
          onClose();
        }}
      />
      <View
        style={[
          styles.sheetContainer,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            paddingBottom: Math.max(insets.bottom, 14),
            maxWidth: 680,
            width: '100%',
            alignSelf: 'center',
          },
        ]}>
          {/* Header del BottomSheet */}
          <View style={styles.sheetHeader}>
            <View style={styles.dragHandle} />
            <View style={styles.headerRow}>
              <View style={styles.headerTitleGroup}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>
                  Detalles del Préstamo
                </Text>
                <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                  {cliente.documento} · {cliente.ubicacion}
                </Text>
              </View>
              <View style={styles.headerActions}>
                <Pressable
                  onPress={() => setShowEditModal(true)}
                  accessibilityLabel="Editar información del cliente"
                  style={[
                    styles.headerIconBtn,
                    { backgroundColor: isDarkMode ? '#1E2636' : '#F1F5F9' },
                  ]}>
                  <Edit3 size={17} color={BrandColors.primary} />
                </Pressable>

                <Pressable
                  onPress={handleEliminarCliente}
                  accessibilityLabel="Eliminar cliente"
                  style={[
                    styles.headerIconBtn,
                    { backgroundColor: isDarkMode ? '#2D1517' : '#FEE2E2' },
                  ]}>
                  <Trash2 size={17} color="#EF4444" />
                </Pressable>

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
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={true}
            contentContainerStyle={styles.scrollContent}>
            {/* Tarjeta de Identidad y Contacto Directo */}
            <View
              style={[
                styles.identityCard,
                {
                  backgroundColor: isDarkMode ? '#121722' : '#F8FAFC',
                  borderColor: theme.border,
                },
              ]}>
              <View style={styles.identityLeft}>
                <View
                  style={[
                    styles.avatarCircle,
                    { backgroundColor: `${statusInfo.color}25` },
                  ]}>
                  <Text style={[styles.avatarText, { color: statusInfo.color }]}>
                    {cliente.nombre.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.nameBlock}>
                  <Text style={[styles.nameText, { color: theme.text }]}>
                    {cliente.nombre}
                  </Text>
                  <View style={styles.phoneRow}>
                    <Text style={[styles.phoneText, { color: theme.textSecondary }]}>
                      {cliente.celular}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.contactActions}>
                <Pressable
                  onPress={handleLlamar}
                  style={[styles.callBtn, Shadows.glowGreen]}>
                  <LinearGradient
                    colors={[BrandColors.primary, BrandColors.primaryDark]}
                    style={styles.actionGradient}>
                    <Phone size={16} color="#FFFFFF" />
                    <Text style={styles.actionBtnText}>Llamar</Text>
                  </LinearGradient>
                </Pressable>

                <Pressable
                  onPress={handleWhatsApp}
                  style={[styles.waBtn, { borderColor: '#1AA965' }]}>
                  <MessageCircle size={16} color={BrandColors.primary} />
                  <Text style={[styles.waBtnText, { color: BrandColors.primary }]}>
                    WhatsApp
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Botón Destacado: Enviar Estado de Cuenta por WhatsApp */}
            <Pressable
              onPress={handleEnviarEstadoWhatsApp}
              style={({ pressed }) => [
                styles.estadoCuentaBtn,
                { opacity: pressed ? 0.88 : 1 },
                Shadows.sm,
              ]}>
              <LinearGradient
                colors={['#25D366', '#128C7E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.estadoCuentaGradient}>
                <MessageCircle size={20} color="#FFFFFF" />
                <View style={{ flex: 1, marginLeft: 4 }}>
                  <Text style={styles.estadoCuentaTitle}>
                    Enviar Estado de Cuenta por WhatsApp
                  </Text>
                  <Text style={styles.estadoCuentaSub}>
                    Reporte formal con saldo, cuota y fecha de cobro
                  </Text>
                </View>
                <Share2 size={16} color="#FFFFFF" />
              </LinearGradient>
            </Pressable>

            {/* Semáforo y Estado de Mora */}
            <View
              style={[
                styles.statusBanner,
                {
                  backgroundColor: isDarkMode ? `${statusInfo.color}15` : statusInfo.bgColor,
                  borderColor: `${statusInfo.color}50`,
                },
              ]}>
              <View
                style={[
                  styles.statusDotLarge,
                  { backgroundColor: statusInfo.color },
                ]}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.statusTitle, { color: statusInfo.color }]}>
                  {statusInfo.label} ({statusInfo.badge})
                </Text>
                <Text style={[styles.statusDesc, { color: theme.textSecondary }]}>
                  {statusInfo.descripcion} {cliente.diasMora > 0 ? `· ${cliente.diasMora} días en mora` : ''}
                </Text>
              </View>
            </View>

            {/* Desglose de Parámetros Financieros */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Condiciones del Crédito
              </Text>
            </View>

            <View
              style={[
                styles.metricsGrid,
                {
                  backgroundColor: isDarkMode ? '#121722' : '#FFFFFF',
                  borderColor: theme.border,
                },
              ]}>
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: theme.textMuted }]}>
                  Capital Inicial
                </Text>
                <Text style={[styles.metricValue, { color: theme.text }]}>
                  {formatCurrency(cliente.monto)}
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: theme.textMuted }]}>
                  Modalidad
                </Text>
                <Text style={[styles.metricValue, { color: theme.text }]}>
                  {cliente.modalidad}
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: theme.textMuted }]}>
                  Tasa Mensual
                </Text>
                <Text style={[styles.metricValue, { color: BrandColors.primary }]}>
                  {cliente.tasaInteres}%
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: theme.textMuted }]}>
                  Plazo
                </Text>
                <Text style={[styles.metricValue, { color: theme.text }]}>
                  {esIndefinido
                    ? 'Mes a Mes (Indefinido)'
                    : `${cliente.cuotasPagadas} / ${cliente.cuotasTotales} cuotas`}
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: theme.textMuted }]}>
                  Capital Pendiente
                </Text>
                <Text style={[styles.metricValue, { color: theme.text }]}>
                  {formatCurrency(cliente.capitalPendiente)}
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: theme.textMuted }]}>
                  Interés Pendiente
                </Text>
                <Text style={[styles.metricValue, { color: theme.text }]}>
                  {formatCurrency(cliente.interesPendiente)}
                </Text>
              </View>
            </View>

            {/* Total Pendiente y Cuota Fija */}
            <View
              style={[
                styles.highlightCard,
                {
                  backgroundColor: isDarkMode ? '#172722' : '#E8F8F0',
                  borderColor: BrandColors.primary,
                },
              ]}>
              <View>
                <Text style={[styles.hlLabel, { color: BrandColors.primaryDark }]}>
                  Deuda Total Pendiente
                </Text>
                <Text style={[styles.hlAmount, { color: isDarkMode ? '#2EE28B' : '#0E7A46' }]}>
                  {formatCurrency(cliente.totalPendiente)}
                </Text>
              </View>

              <View style={styles.hlCuotaBox}>
                <Text style={[styles.hlCuotaLabel, { color: BrandColors.primaryDark }]}>
                  Cuota Mensual Fija
                </Text>
                <Text style={[styles.hlCuotaValue, { color: isDarkMode ? '#FFFFFF' : '#0F172A' }]}>
                  {formatCurrency(cliente.cuota)}
                </Text>
              </View>
            </View>

            {/* REGLA DE ORO BANNER */}
            <View
              style={[
                styles.ruleNotice,
                {
                  backgroundColor: isDarkMode ? '#1B2332' : '#F1F5F9',
                  borderColor: theme.border,
                },
              ]}>
              <Info size={16} color={BrandColors.primary} style={{ marginTop: 2 }} />
              <Text style={[styles.ruleNoticeText, { color: theme.textSecondary }]}>
                <Text style={{ fontWeight: '700', color: theme.text }}>
                  Regla de Cuota Fija:{' '}
                </Text>
                Los abonos libres a capital o interés amortizan la deuda de inmediato, pero la cuota mensual pactada se mantiene constante e inalterada hasta la cancelación completa del crédito.
              </Text>
            </View>

            {/* SIMULADOR INTERACTIVO DE ABONO */}
            {!isPazYSalvo ? (
              <View
                style={[
                  styles.simulatorBox,
                  {
                    backgroundColor: isDarkMode ? '#151B26' : '#FFFFFF',
                    borderColor: theme.border,
                  },
                ]}>
                <Text style={[styles.simulatorTitle, { color: theme.text }]}>
                  Simulador de Abonos & Registro de Pago
                </Text>
                <Text style={[styles.simulatorSub, { color: theme.textSecondary }]}>
                  Selecciona la modalidad de abono y visualiza la reducción de deuda:
                </Text>

                {/* Selector de Tipo */}
                <View style={styles.typeSelectorRow}>
                  <Pressable
                    onPress={() => handleSelectTipo('Cuota')}
                    style={[
                      styles.typePill,
                      tipoSeleccionado === 'Cuota' && styles.typePillActive,
                      {
                        backgroundColor:
                          tipoSeleccionado === 'Cuota'
                            ? BrandColors.primary
                            : isDarkMode
                            ? '#21262D'
                            : '#F1F5F9',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.typePillText,
                        {
                          color:
                            tipoSeleccionado === 'Cuota' ? '#FFFFFF' : theme.textSecondary,
                        },
                      ]}>
                      Cuota ({formatCurrency(cliente.cuota)})
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleSelectTipo('Capital')}
                    style={[
                      styles.typePill,
                      tipoSeleccionado === 'Capital' && styles.typePillActive,
                      {
                        backgroundColor:
                          tipoSeleccionado === 'Capital'
                            ? BrandColors.primary
                            : isDarkMode
                            ? '#21262D'
                            : '#F1F5F9',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.typePillText,
                        {
                          color:
                            tipoSeleccionado === 'Capital' ? '#FFFFFF' : theme.textSecondary,
                        },
                      ]}>
                      Abono a Capital
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleSelectTipo('Interés')}
                    style={[
                      styles.typePill,
                      tipoSeleccionado === 'Interés' && styles.typePillActive,
                      {
                        backgroundColor:
                          tipoSeleccionado === 'Interés'
                            ? BrandColors.primary
                            : isDarkMode
                            ? '#21262D'
                            : '#F1F5F9',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.typePillText,
                        {
                          color:
                            tipoSeleccionado === 'Interés' ? '#FFFFFF' : theme.textSecondary,
                        },
                      ]}>
                      Abono a Interés
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleSelectTipo('Total')}
                    style={[
                      styles.typePill,
                      tipoSeleccionado === 'Total' && styles.typePillActive,
                      {
                        backgroundColor:
                          tipoSeleccionado === 'Total'
                            ? '#059669'
                            : isDarkMode
                            ? '#21262D'
                            : '#F1F5F9',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.typePillText,
                        {
                          color:
                            tipoSeleccionado === 'Total' ? '#FFFFFF' : theme.textSecondary,
                        },
                      ]}>
                      Liquidar Total
                    </Text>
                  </Pressable>
                </View>

                {/* Input de Monto */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                    Monto a Pagar ($ COP):
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: isDarkMode ? '#0D1117' : '#F8FAFC',
                        borderColor: theme.border,
                      },
                    ]}>
                    <DollarSign size={18} color={BrandColors.primary} />
                    <TextInput
                      keyboardType="numeric"
                      value={montoInput}
                      onChangeText={setMontoInput}
                      placeholder="0"
                      placeholderTextColor={theme.textMuted}
                      style={[styles.numericInput, { color: theme.text }]}
                    />
                  </View>
                </View>

                {/* Input Nota de Pago */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                    Nota o Comprobante (Opcional):
                  </Text>
                  <TextInput
                    value={notaPago}
                    onChangeText={setNotaPago}
                    placeholder="Ej. Transferencia Nequi, recibo físico #402..."
                    placeholderTextColor={theme.textMuted}
                    style={[
                      styles.textInputRegular,
                      {
                        backgroundColor: isDarkMode ? '#0D1117' : '#F8FAFC',
                        borderColor: theme.border,
                        color: theme.text,
                      },
                    ]}
                  />
                </View>

                {/* Proyección Simulada */}
                <View
                  style={[
                    styles.proyeccionCard,
                    {
                      backgroundColor: isDarkMode ? '#1A2332' : '#F8FAFC',
                      borderColor: proyeccion.nuevoTotalPendiente <= 0 ? '#10B981' : theme.border,
                    },
                  ]}>
                  <Text style={[styles.proyTitle, { color: theme.text }]}>
                    Resultado Proyectado tras el Abono:
                  </Text>
                  <View style={styles.proyRow}>
                    <Text style={[styles.proyLabel, { color: theme.textSecondary }]}>
                      Nuevo Capital Pendiente:
                    </Text>
                    <Text style={[styles.proyVal, { color: theme.text }]}>
                      {formatCurrency(proyeccion.nuevoCapitalPendiente)}
                    </Text>
                  </View>
                  <View style={styles.proyRow}>
                    <Text style={[styles.proyLabel, { color: theme.textSecondary }]}>
                      Nuevo Interés Pendiente:
                    </Text>
                    <Text style={[styles.proyVal, { color: theme.text }]}>
                      {formatCurrency(proyeccion.nuevoInteresPendiente)}
                    </Text>
                  </View>
                  <View style={styles.proyRowHighlight}>
                    <Text style={[styles.proyLabelHighlight, { color: BrandColors.primary }]}>
                      Total Deuda Resultante:
                    </Text>
                    <Text style={[styles.proyValHighlight, { color: BrandColors.primary }]}>
                      {formatCurrency(proyeccion.nuevoTotalPendiente)}
                    </Text>
                  </View>

                  {proyeccion.nuevoTotalPendiente <= 0 && (
                    <View style={styles.pazYSalvoAlert}>
                      <ShieldCheck size={18} color="#10B981" />
                      <Text style={styles.pazYSalvoAlertText}>
                        ¡Este pago liquidará el 100% de la deuda! El cliente pasará a Paz y Salvo.
                      </Text>
                    </View>
                  )}
                </View>

                {/* Botón de Confirmación */}
                <Pressable
                  onPress={handleConfirmarPago}
                  style={({ pressed }) => [
                    styles.confirmPaymentBtn,
                    { opacity: pressed ? 0.9 : 1 },
                    Shadows.glowGreen,
                  ]}>
                  <LinearGradient
                    colors={[BrandColors.primary, BrandColors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.confirmGradient}>
                    <CheckCircle size={18} color="#FFFFFF" />
                    <Text style={styles.confirmBtnText}>
                      Confirmar y Registrar Pago ({formatCurrency(parsedMonto)})
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            ) : (
              /* Bloque cuando el cliente ya está a Paz y Salvo */
              <View
                style={[
                  styles.renovacionCard,
                  {
                    backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9',
                    borderColor: '#475569',
                  },
                ]}>
                <ShieldCheck size={36} color="#475569" />
                <Text style={[styles.renovacionTitle, { color: isDarkMode ? '#F8FAFC' : '#1E293B' }]}>
                  ¡Cliente a Paz y Salvo!
                </Text>
                <Text style={[styles.renovacionSub, { color: isDarkMode ? '#94A3B8' : '#475569' }]}>
                  Este cliente no tiene saldos pendientes. Su historial es intachable y califica para una renovación inmediata.
                </Text>

                {onRenovar && (
                  <Pressable
                    onPress={onRenovar}
                    style={[styles.renovarBtn, Shadows.glowGreen]}>
                    <LinearGradient
                      colors={['#10B981', '#059669']}
                      style={styles.renovarGradient}>
                      <Text style={styles.renovarBtnText}>
                        Renovar Préstamo a {cliente.nombre.split(' ')[0]}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                )}
              </View>
            )}

            {/* Historial de Pagos Recientes */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Historial de Pagos ({historial.length})
              </Text>
            </View>

            {historial.length === 0 ? (
              <View
                style={[
                  styles.emptyHistorial,
                  {
                    backgroundColor: isDarkMode ? '#121722' : '#F8FAFC',
                    borderColor: theme.border,
                  },
                ]}>
                <FileText size={24} color={theme.textMuted} />
                <Text style={[styles.emptyHistText, { color: theme.textSecondary }]}>
                  Aún no se han registrado abonos para este crédito.
                </Text>
              </View>
            ) : (
              historial.map((p) => (
                <View
                  key={p.id}
                  style={[
                    styles.historialItem,
                    {
                      backgroundColor: isDarkMode ? '#121722' : '#FFFFFF',
                      borderColor: theme.border,
                    },
                  ]}>
                  <View style={styles.histLeft}>
                    <Text style={[styles.histTipo, { color: theme.text }]}>
                      {p.tipo}
                    </Text>
                    <Text style={[styles.histFecha, { color: theme.textSecondary }]}>
                      {formatDate(p.fechaPago)} · Cuota #{p.numeroCuota}
                    </Text>
                    {p.nota && (
                      <Text style={[styles.histNota, { color: theme.textMuted }]}>
                        {p.nota}
                      </Text>
                    )}
                  </View>
                  <View style={styles.histRight}>
                    <Text style={[styles.histMonto, { color: BrandColors.primary }]}>
                      +{formatCurrency(p.monto)}
                    </Text>
                    <Text style={[styles.histDesglose, { color: theme.textMuted }]}>
                      Cap: {formatCurrency(p.abonoCapital)} · Int: {formatCurrency(p.abonoInteres)}
                    </Text>
                  </View>
                </View>
              ))
            )}

            <View style={{ height: Math.max(insets.bottom, 16) + 30 }} />
          </ScrollView>

          <ClienteModalEdit
            visible={showEditModal}
            cliente={cliente}
            isDarkMode={isDarkMode}
            onClose={() => setShowEditModal(false)}
            onSave={(id, data) => {
              onActualizarCliente?.(id, data);
              setShowEditModal(false);
            }}
          />
        </View>
      </KeyboardAvoidingView>
  );
};

export const ClienteModalDetail: React.FC<ClienteModalDetailProps> = ({
  visible,
  cliente,
  historial,
  isDarkMode,
  onClose,
  onRegistrarPago,
  onRenovar,
  onActualizarCliente,
  onEliminarCliente,
}) => {
  if (!cliente) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <ClienteModalDetailContent
        key={cliente.id}
        cliente={cliente}
        historial={historial}
        isDarkMode={isDarkMode}
        onClose={onClose}
        onRegistrarPago={onRegistrarPago}
        onRenovar={onRenovar}
        onActualizarCliente={onActualizarCliente}
        onEliminarCliente={onEliminarCliente}
      />
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
    maxHeight: '88%',
    flexShrink: 1,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  estadoCuentaBtn: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: 16,
  },
  estadoCuentaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  estadoCuentaTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  estadoCuentaSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    marginTop: 1,
  },
  scrollContent: {
    padding: 20,
  },
  identityCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  identityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
  },
  nameBlock: {
    flex: 1,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
  },
  phoneRow: {
    marginTop: 2,
  },
  phoneText: {
    fontSize: 13,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 10,
  },
  callBtn: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  waBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  waBtnText: {
    fontWeight: '700',
    fontSize: 13,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: 16,
    gap: 10,
  },
  statusDotLarge: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  statusDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
  },
  metricItem: {
    width: '50%',
    padding: 8,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  highlightCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: 14,
  },
  hlLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  hlAmount: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  hlCuotaBox: {
    alignItems: 'flex-end',
  },
  hlCuotaLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  hlCuotaValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  ruleNotice: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: 16,
  },
  ruleNoticeText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  simulatorBox: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  simulatorTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  simulatorSub: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 12,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  typePill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
  },
  typePillActive: {},
  typePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    height: 46,
  },
  numericInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 6,
  },
  textInputRegular: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
  },
  proyeccionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
  },
  proyTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  proyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  proyLabel: {
    fontSize: 12,
  },
  proyVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  proyRowHighlight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.2)',
  },
  proyLabelHighlight: {
    fontSize: 13,
    fontWeight: '700',
  },
  proyValHighlight: {
    fontSize: 15,
    fontWeight: '800',
  },
  pazYSalvoAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F8F0',
    padding: 8,
    borderRadius: BorderRadius.md,
    marginTop: 8,
  },
  pazYSalvoAlertText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  confirmPaymentBtn: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  confirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  renovacionCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  renovacionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  renovacionSub: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  renovarBtn: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    width: '100%',
  },
  renovarGradient: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  renovarBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  emptyHistorial: {
    padding: 18,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  emptyHistText: {
    fontSize: 12,
  },
  historialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: 8,
  },
  histLeft: {
    flex: 1,
  },
  histTipo: {
    fontSize: 13,
    fontWeight: '700',
  },
  histFecha: {
    fontSize: 11,
    marginTop: 2,
  },
  histNota: {
    fontSize: 11,
    marginTop: 2,
    fontStyle: 'italic',
  },
  histRight: {
    alignItems: 'flex-end',
  },
  histMonto: {
    fontSize: 15,
    fontWeight: '800',
  },
  histDesglose: {
    fontSize: 10,
    marginTop: 2,
  },
});

