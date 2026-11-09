import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Phone,
  CheckCircle,
  Clock,
} from 'lucide-react-native';
import { usePrestago } from '@/context/PrestagoContext';
import { Cliente } from '@/types';
import { Colors, BrandColors, BorderRadius, Shadows, MaxContentWidth } from '@/constants/theme';
import { HeaderBar } from '@/components/HeaderBar';
import { CalendarioInteractivo } from '@/components/CalendarioInteractivo';
import { CalculadoraRapida } from '@/components/CalculadoraRapida';
import { ClienteModalDetail } from '@/components/ClienteModalDetail';
import {
  formatCurrency,
  formatDate,
  getInfoEstadoMora,
} from '@/utils/finance';

export default function CalendarScreen() {
  const {
    clientes,
    isDarkMode,
    toggleTheme,
    metricas,
    registrarPago,
    getHistorialByCliente,
  } = usePrestago();

  const theme = isDarkMode ? Colors.dark : Colors.light;

  // Fecha seleccionada por defecto: fecha de hoy en formato YYYY-MM-DD
  const todayStr = '2026-10-15'; // Fecha activa alineada con los cobros del mock
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Clientes con cobro en la fecha seleccionada
  const cobrosDelDia = clientes.filter(
    (c) => c.proximoCobro === selectedDate && c.estadoMora !== 'paz_y_salvo'
  );

  // Total a recaudar esperado en este día
  const totalEsperadoDia = cobrosDelDia.reduce((acc, c) => acc + c.cuota, 0);

  const handleOpenDetail = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setModalVisible(true);
  };

  const handleCall = (cliente: Cliente) => {
    const tel = cliente.celular.replace(/\s+/g, '');
    Linking.openURL(`tel:${tel}`).catch(() => {});
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <HeaderBar
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        capitalEnLaCalle={metricas.capitalEnLaCalle}
        clientesActivos={metricas.clientesActivos}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Título de la Sección */}
        <View style={styles.sectionHeading}>
          <Text style={[styles.headingTitle, { color: theme.text }]}>
            Agenda de Cobros
          </Text>
          <Text style={[styles.headingSub, { color: theme.textSecondary }]}>
            Planifica tus rutas y recaudos diarios
          </Text>
        </View>

        {/* Componente de Calendario Interactivo con Marcadores de Semáforo */}
        <CalendarioInteractivo
          clientes={clientes}
          isDarkMode={isDarkMode}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        {/* Resumen del Día Seleccionado */}
        <View
          style={[
            styles.daySummaryCard,
            {
              backgroundColor: isDarkMode ? '#13231B' : '#E8F8F0',
              borderColor: BrandColors.primary,
            },
          ]}>
          <View style={styles.daySummaryLeft}>
            <Text style={[styles.daySummaryLabel, { color: BrandColors.primaryDark }]}>
              Cobros para el {formatDate(selectedDate)}
            </Text>
            <Text style={[styles.daySummaryTotal, { color: isDarkMode ? '#2EE28B' : '#0E7A46' }]}>
              {formatCurrency(totalEsperadoDia)}
            </Text>
          </View>

          <View style={styles.badgeCount}>
            <Clock size={14} color="#FFFFFF" />
            <Text style={styles.badgeCountText}>
              {cobrosDelDia.length} programado{cobrosDelDia.length === 1 ? '' : 's'}
            </Text>
          </View>
        </View>

        {/* Lista de Clientes con Cobro para el Día */}
        <View style={styles.cobrosListSection}>
          <Text style={[styles.cobrosListTitle, { color: theme.text }]}>
            Detalle de Cobros del Día ({cobrosDelDia.length})
          </Text>

          {cobrosDelDia.length === 0 ? (
            <View
              style={[
                styles.emptyCobros,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}>
              <CheckCircle size={32} color={BrandColors.primary} />
              <Text style={[styles.emptyCobrosTitle, { color: theme.text }]}>
                Sin cobros para esta fecha
              </Text>
              <Text style={[styles.emptyCobrosSub, { color: theme.textSecondary }]}>
                No hay vencimientos de cuotas agendados para el {formatDate(selectedDate)}. Selecciona otro día con puntos de colores en el calendario.
              </Text>
            </View>
          ) : (
            cobrosDelDia.map((cli) => {
              const info = getInfoEstadoMora(cli.estadoMora);
              return (
                <View
                  key={cli.id}
                  style={[
                    styles.cobroItemCard,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                    },
                    Shadows.sm,
                  ]}>
                  {/* Semáforo lateral */}
                  <View
                    style={[
                      styles.itemStatusStrip,
                      { backgroundColor: info.color },
                    ]}
                  />

                  <View style={styles.itemContent}>
                    <View style={styles.itemTopRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.itemClientName, { color: theme.text }]}>
                          {cli.nombre}
                        </Text>
                        <Text
                          style={[styles.itemLocation, { color: theme.textSecondary }]}
                          numberOfLines={1}>
                          {cli.ubicacion}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.statusBadgeSmall,
                          {
                            backgroundColor: isDarkMode
                              ? `${info.color}25`
                              : info.bgColor,
                          },
                        ]}>
                        <Text style={[styles.statusBadgeText, { color: info.color }]}>
                          {info.badge}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.itemFinancialRow}>
                      <View>
                        <Text style={[styles.itemCuotaLabel, { color: theme.textMuted }]}>
                          Cuota a Cobrar
                        </Text>
                        <Text style={[styles.itemCuotaValue, { color: BrandColors.primary }]}>
                          {formatCurrency(cli.cuota)}
                        </Text>
                      </View>

                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.itemCuotaLabel, { color: theme.textMuted }]}>
                          Total Deuda
                        </Text>
                        <Text style={[styles.itemDeudaValue, { color: theme.text }]}>
                          {formatCurrency(cli.totalPendiente)}
                        </Text>
                      </View>
                    </View>

                    {/* Botones de Acción */}
                    <View style={styles.itemActionsRow}>
                      <Pressable
                        onPress={() => handleCall(cli)}
                        style={[
                          styles.callMiniBtn,
                          {
                            backgroundColor: isDarkMode ? '#1E2636' : '#F1F5F9',
                            borderColor: theme.border,
                          },
                        ]}>
                        <Phone size={15} color={BrandColors.primary} />
                        <Text style={[styles.callMiniText, { color: theme.text }]}>
                          Llamar
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() => handleOpenDetail(cli)}
                        style={[styles.payMiniBtn, Shadows.glowGreen]}>
                        <LinearGradient
                          colors={[BrandColors.primary, BrandColors.primaryDark]}
                          style={styles.payMiniGradient}>
                          <CheckCircle size={15} color="#FFFFFF" />
                          <Text style={styles.payMiniText}>Registrar Cobro</Text>
                        </LinearGradient>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* WIDGET INTEGRADO: Calculadora Rápida de Crédito */}
        <View style={styles.widgetHeader}>
          <Text style={[styles.widgetHeading, { color: theme.text }]}>
            Herramienta Financiera Integrada
          </Text>
        </View>

        <CalculadoraRapida isDarkMode={isDarkMode} />

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Modal de Detalle y Registro de Pago */}
      <ClienteModalDetail
        visible={modalVisible}
        cliente={selectedCliente}
        historial={selectedCliente ? getHistorialByCliente(selectedCliente.id) : []}
        isDarkMode={isDarkMode}
        onClose={() => setModalVisible(false)}
        onRegistrarPago={(params) => {
          registrarPago(params);
          if (selectedCliente) {
            const updated = clientes.find((c) => c.id === selectedCliente.id);
            if (updated) setSelectedCliente(updated);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  sectionHeading: {
    marginBottom: 14,
  },
  headingTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headingSub: {
    fontSize: 12,
    marginTop: 2,
  },
  daySummaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    marginBottom: 18,
  },
  daySummaryLeft: {
    flex: 1,
  },
  daySummaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  daySummaryTotal: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  badgeCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: BrandColors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  badgeCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  cobrosListSection: {
    marginBottom: 20,
  },
  cobrosListTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyCobros: {
    padding: 24,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  emptyCobrosTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6,
  },
  emptyCobrosSub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  cobroItemCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  itemStatusStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  itemContent: {
    padding: 14,
    paddingLeft: 18,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  itemClientName: {
    fontSize: 16,
    fontWeight: '700',
  },
  itemLocation: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  itemFinancialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(150,150,150,0.15)',
  },
  itemCuotaLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  itemCuotaValue: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 1,
  },
  itemDeudaValue: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 1,
  },
  itemActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  callMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  callMiniText: {
    fontSize: 12,
    fontWeight: '700',
  },
  payMiniBtn: {
    flex: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  payMiniGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
  },
  payMiniText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  widgetHeader: {
    marginBottom: 10,
  },
  widgetHeading: {
    fontSize: 15,
    fontWeight: '700',
  },
});

