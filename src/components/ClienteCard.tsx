import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Phone,
  MessageCircle,
  Calendar,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react-native';
import { Cliente } from '@/types';
import { Colors, BrandColors, BorderRadius, Shadows } from '@/constants/theme';
import {
  formatCurrency,
  formatDate,
  getInfoEstadoMora,
  PLAZO_INDEFINIDO_CUOTAS,
} from '@/utils/finance';

interface ClienteCardProps {
  cliente: Cliente;
  isDarkMode: boolean;
  onPress: () => void;
  onQuickPay: () => void;
}

export const ClienteCard: React.FC<ClienteCardProps> = ({
  cliente,
  isDarkMode,
  onPress,
  onQuickPay,
}) => {
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const statusInfo = getInfoEstadoMora(cliente.estadoMora);

  const handleCall = (e: any) => {
    e.stopPropagation();
    const tel = cliente.celular.replace(/\s+/g, '');
    Linking.openURL(`tel:${tel}`).catch(() => {});
  };

  const handleWhatsApp = (e: any) => {
    e.stopPropagation();
    const cleanNumber = cliente.celular.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `Hola ${cliente.nombre}, te saludo de PrestaGo. Queremos recordarte tu cuota de ${formatCurrency(
        cliente.cuota
      )} programada para el ${formatDate(cliente.proximoCobro)}. ¡Que tengas un excelente día!`
    );
    Linking.openURL(`https://wa.me/${cleanNumber}?text=${msg}`).catch(() => {});
  };

  const isPazYSalvo = cliente.estadoMora === 'paz_y_salvo';
  const esIndefinido = cliente.cuotasTotales === PLAZO_INDEFINIDO_CUOTAS;

  // Cálculo de porcentaje pagado
  const pctPagado =
    cliente.monto > 0
      ? Math.min(100, Math.max(0, Math.round(((cliente.monto - cliente.capitalPendiente) / cliente.monto) * 100)))
      : 100;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.cardContainer,
        {
          backgroundColor: isPazYSalvo
            ? (isDarkMode ? '#111620' : '#F8FAFC')
            : theme.card,
          borderColor: isPazYSalvo
            ? (isDarkMode ? '#334155' : '#CBD5E1')
            : theme.border,
          opacity: pressed ? 0.95 : 1,
        },
        Shadows.md,
      ]}>
      {/* Indicador lateral del semáforo */}
      <View
        style={[
          styles.semaforoIndicator,
          { backgroundColor: statusInfo.color },
        ]}
      />

      <View style={styles.cardContent}>
        {/* Encabezado de la Tarjeta */}
        <View style={styles.cardHeader}>
          <View style={styles.clientMeta}>
            <Text
              style={[styles.clientName, { color: theme.text }]}
              numberOfLines={1}>
              {cliente.nombre}
            </Text>
            <Text style={[styles.clientLocation, { color: theme.textSecondary }]} numberOfLines={1}>
              {cliente.ubicacion}
            </Text>
          </View>

          {/* Badge del Semáforo */}
          <View
            style={[
              styles.badgeContainer,
              {
                backgroundColor: isDarkMode
                  ? `${statusInfo.color}22`
                  : statusInfo.bgColor,
                borderColor: `${statusInfo.color}40`,
              },
            ]}>
            <View
              style={[
                styles.badgeDot,
                { backgroundColor: statusInfo.color },
              ]}
            />
            <Text style={[styles.badgeText, { color: statusInfo.color }]}>
              {statusInfo.badge}
            </Text>
          </View>
        </View>

        {/* Modalidad y Plazo Chips */}
        <View style={styles.chipsRow}>
          <View
            style={[
              styles.chip,
              {
                backgroundColor: isDarkMode ? '#1E2636' : '#F1F5F9',
                borderColor: theme.border,
              },
            ]}>
            <Text style={[styles.chipText, { color: theme.textSecondary }]}>
              {cliente.modalidad === 'Solo Intereses'
                ? 'Solo Intereses (Capital al final)'
                : 'Amortizado (Cap + Int)'}
            </Text>
          </View>

          {esIndefinido ? (
            <View
              style={[
                styles.chip,
                {
                  backgroundColor: isDarkMode ? '#282114' : '#FEF3C7',
                  borderColor: isDarkMode ? '#5E4314' : '#FDE68A',
                },
              ]}>
              <Text
                style={[
                  styles.chipText,
                  { color: isDarkMode ? '#FBBF24' : '#B45309' },
                ]}>
                Mes a Mes (Indefinido)
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.chip,
                {
                  backgroundColor: isPazYSalvo
                    ? (isDarkMode ? '#1E293B' : '#F1F5F9')
                    : (isDarkMode ? '#172722' : '#ECFDF5'),
                  borderColor: isPazYSalvo
                    ? (isDarkMode ? '#475569' : '#CBD5E1')
                    : (isDarkMode ? '#134E35' : '#A7F3D0'),
                },
              ]}>
              <Text
                style={[
                  styles.chipText,
                  {
                    color: isPazYSalvo
                      ? (isDarkMode ? '#94A3B8' : '#475569')
                      : BrandColors.primary,
                  },
                ]}>
                {isPazYSalvo
                  ? `Saldado (${cliente.cuotasPagadas} de ${cliente.cuotasTotales} cuotas)`
                  : `Cuota ${cliente.cuotasPagadas} de ${cliente.cuotasTotales}`}
              </Text>
            </View>
          )}

          {cliente.esMigrado && (
            <View
              style={[
                styles.chip,
                {
                  backgroundColor: isDarkMode ? '#241D35' : '#F5F3FF',
                  borderColor: isDarkMode ? '#4C2882' : '#DDD6FE',
                },
              ]}>
              <Text
                style={[
                  styles.chipText,
                  { color: isDarkMode ? '#A78BFA' : '#7C3AED' },
                ]}>
                Migrado
              </Text>
            </View>
          )}
        </View>

        {/* Resumen Financiero en Grid */}
        <View
          style={[
            styles.financialGrid,
            {
              backgroundColor: isDarkMode ? '#0F141E' : '#F8FAFC',
              borderColor: theme.borderLight,
            },
          ]}>
          <View style={styles.gridColumn}>
            <Text style={[styles.gridLabel, { color: theme.textMuted }]}>
              Cuota Mensual
            </Text>
            <Text
              style={[
                styles.gridValuePrimary,
                {
                  color: isPazYSalvo
                    ? (isDarkMode ? '#94A3B8' : '#475569')
                    : BrandColors.primary,
                },
              ]}>
              {formatCurrency(cliente.cuota)}
            </Text>
            <Text style={[styles.gridSub, { color: theme.textSecondary }]}>
              {cliente.tasaInteres}% interés
            </Text>
          </View>

          <View style={[styles.gridDivider, { backgroundColor: theme.border }]} />

          <View style={styles.gridColumn}>
            <Text style={[styles.gridLabel, { color: theme.textMuted }]}>
              Deuda Pendiente
            </Text>
            <Text
              style={[
                styles.gridValue,
                {
                  color: isPazYSalvo
                    ? (isDarkMode ? '#94A3B8' : '#475569')
                    : cliente.estadoMora === 'mora_3'
                    ? BrandColors.danger
                    : theme.text,
                },
              ]}>
              {isPazYSalvo ? '$0 (Saldado)' : formatCurrency(cliente.totalPendiente)}
            </Text>
            <Text style={[styles.gridSub, { color: theme.textSecondary }]}>
              Cap: {formatCurrency(cliente.capitalPendiente)}
            </Text>
          </View>
        </View>

        {/* Barra de progreso de amortización de capital */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressLabelText, { color: theme.textMuted }]}>
              Capital amortizado: {pctPagado}%
            </Text>
            <View style={styles.dateRow}>
              <Calendar size={13} color={theme.textMuted} />
              <Text style={[styles.dateText, { color: theme.textSecondary }]}>
                Cobro: {formatDate(cliente.proximoCobro)}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.progressBarBg,
              { backgroundColor: isDarkMode ? '#232D3F' : '#E2E8F0' },
            ]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${pctPagado}%`,
                  backgroundColor: statusInfo.color,
                },
              ]}
            />
          </View>
        </View>

        {/* Acciones Rápidas */}
        <View style={styles.actionsFooter}>
          <View style={styles.contactButtons}>
            <Pressable
              onPress={handleCall}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: isDarkMode ? '#1E2636' : '#F1F5F9',
                  borderColor: theme.border,
                },
              ]}>
              <Phone size={16} color={BrandColors.primary} />
            </Pressable>

            <Pressable
              onPress={handleWhatsApp}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: isDarkMode ? '#142E21' : '#E8F8F0',
                  borderColor: isDarkMode ? '#1D5C39' : '#C4F1DA',
                },
              ]}>
              <MessageCircle size={16} color={BrandColors.primary} />
            </Pressable>
          </View>

          <Pressable
            onPress={onQuickPay}
            style={({ pressed }) => [
              styles.payButton,
              { opacity: pressed ? 0.85 : 1 },
              isPazYSalvo ? undefined : Shadows.glowGreen,
            ]}>
            <LinearGradient
              colors={
                isPazYSalvo
                  ? ['#475569', '#334155']
                  : [BrandColors.primary, BrandColors.primaryDark]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.payGradient}>
              {isPazYSalvo ? (
                <>
                  <ShieldCheck size={16} color="#FFFFFF" />
                  <Text style={styles.payButtonText}>Ver Paz y Salvo</Text>
                </>
              ) : (
                <>
                  <TrendingUp size={16} color="#FFFFFF" />
                  <Text style={styles.payButtonText}>Abonar / Pagar</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  semaforoIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderBottomLeftRadius: BorderRadius['2xl'],
  },
  cardContent: {
    padding: 16,
    paddingLeft: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  clientMeta: {
    flex: 1,
    marginRight: 8,
  },
  clientName: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  clientLocation: {
    fontSize: 13,
    marginTop: 2,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 0.5,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  financialGrid: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    padding: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  gridColumn: {
    flex: 1,
  },
  gridDivider: {
    width: 1,
    marginHorizontal: 12,
  },
  gridLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  gridValuePrimary: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  gridValue: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  gridSub: {
    fontSize: 11,
    marginTop: 2,
  },
  progressSection: {
    marginBottom: 14,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabelText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressBarBg: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  actionsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  payGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

