import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  TrendingUp,
  Wallet,
  ArrowUpRight,
  Percent,
  Users,
} from 'lucide-react-native';
import { usePrestago } from '@/context/PrestagoContext';
import { BrandColors, Colors, BorderRadius, Shadows, MaxContentWidth } from '@/constants/theme';
import { HeaderBar } from '@/components/HeaderBar';
import { GraficoProyeccion } from '@/components/GraficoProyeccion';
import { formatCurrency } from '@/utils/finance';

export default function AnalyticsScreen() {
  const { clientes, historialPagos, metricas, isDarkMode, toggleTheme } = usePrestago();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  // Cálculos de modalidades
  const totalAmortizado = clientes.filter((c) => c.modalidad === 'Amortizado').length;
  const totalSoloIntereses = clientes.filter((c) => c.modalidad === 'Solo Intereses').length;

  // Semáforo de salud de cartera
  const countAlDia = clientes.filter((c) => c.estadoMora === 'al_dia').length;
  const countMora1 = clientes.filter((c) => c.estadoMora === 'mora_1').length;
  const countMora2 = clientes.filter((c) => c.estadoMora === 'mora_2').length;
  const countMora3 = clientes.filter((c) => c.estadoMora === 'mora_3').length;
  const countPazYSalvo = clientes.filter((c) => c.estadoMora === 'paz_y_salvo').length;

  // Estimado mensual de recaudo de intereses
  const interesEstimadoMes = clientes.reduce((acc, c) => {
    if (c.estadoMora !== 'paz_y_salvo') {
      return acc + Math.round(c.monto * (c.tasaInteres / 100));
    }
    return acc;
  }, 0);

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
        {/* Encabezado */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.title, { color: theme.text }]}>
            Tablero de Rendimiento Financiero
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Monitoreo en tiempo real de capital, utilidades y proyecciones
          </Text>
        </View>

        {/* 4 Tarjetas Métricas Principales */}
        <View style={styles.metricsGrid}>
          {/* 1. Capital en la Calle */}
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
              Shadows.sm,
            ]}>
            <View style={styles.metricTop}>
              <View
                style={[
                  styles.metricIconWrap,
                  { backgroundColor: isDarkMode ? '#132E21' : '#E8F8F0' },
                ]}>
                <Wallet size={18} color={BrandColors.primary} />
              </View>
              <ArrowUpRight size={16} color={BrandColors.primary} />
            </View>
            <Text style={[styles.metricLabel, { color: theme.textMuted }]}>
              Capital en la Calle
            </Text>
            <Text style={[styles.metricValue, { color: BrandColors.primary }]}>
              {formatCurrency(metricas.capitalEnLaCalle)}
            </Text>
            <Text style={[styles.metricFooterText, { color: theme.textSecondary }]}>
              Saldo neto por amortizar
            </Text>
          </View>

          {/* 2. Dinero Recuperado */}
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
              Shadows.sm,
            ]}>
            <View style={styles.metricTop}>
              <View
                style={[
                  styles.metricIconWrap,
                  { backgroundColor: isDarkMode ? '#1A2A38' : '#EFF6FF' },
                ]}>
                <TrendingUp size={18} color="#3B82F6" />
              </View>
              <ArrowUpRight size={16} color="#3B82F6" />
            </View>
            <Text style={[styles.metricLabel, { color: theme.textMuted }]}>
              Dinero Recuperado
            </Text>
            <Text style={[styles.metricValue, { color: isDarkMode ? '#60A5FA' : '#2563EB' }]}>
              {formatCurrency(metricas.dineroRecuperado)}
            </Text>
            <Text style={[styles.metricFooterText, { color: theme.textSecondary }]}>
              {historialPagos.length} pagos recibidos
            </Text>
          </View>

          {/* 3. Ganancias Reales de Intereses */}
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
              Shadows.sm,
            ]}>
            <View style={styles.metricTop}>
              <View
                style={[
                  styles.metricIconWrap,
                  { backgroundColor: isDarkMode ? '#332711' : '#FEF3C7' },
                ]}>
                <Percent size={18} color="#F59E0B" />
              </View>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#F59E0B' }}>
                Utilidad
              </Text>
            </View>
            <Text style={[styles.metricLabel, { color: theme.textMuted }]}>
              Ganancia de Intereses
            </Text>
            <Text style={[styles.metricValue, { color: isDarkMode ? '#FBBF24' : '#D97706' }]}>
              {formatCurrency(metricas.gananciasIntereses)}
            </Text>
            <Text style={[styles.metricFooterText, { color: theme.textSecondary }]}>
              Margen de utilidad cobrada
            </Text>
          </View>

          {/* 4. Clientes Activos */}
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
              Shadows.sm,
            ]}>
            <View style={styles.metricTop}>
              <View
                style={[
                  styles.metricIconWrap,
                  { backgroundColor: isDarkMode ? '#241D35' : '#F5F3FF' },
                ]}>
                <Users size={18} color="#8B5CF6" />
              </View>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#8B5CF6' }}>
                Total: {metricas.totalClientes}
              </Text>
            </View>
            <Text style={[styles.metricLabel, { color: theme.textMuted }]}>
              Clientes Activos
            </Text>
            <Text style={[styles.metricValue, { color: isDarkMode ? '#A78BFA' : '#7C3AED' }]}>
              {metricas.clientesActivos}
            </Text>
            <Text style={[styles.metricFooterText, { color: theme.textSecondary }]}>
              {metricas.clientesEnMora} en mora pendiente
            </Text>
          </View>
        </View>

        {/* GRÁFICO INTERACTIVO DE PROYECCIÓN (6 MESES) */}
        <GraficoProyeccion
          isDarkMode={isDarkMode}
          capitalEnCalle={metricas.capitalEnLaCalle}
          interesEstimadoMes={interesEstimadoMes}
        />

        {/* Semáforo de Riesgo y Cartera */}
        <View
          style={[
            styles.riskCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}>
          <Text style={[styles.riskTitle, { color: theme.text }]}>
            Semáforo de Salud de la Cartera
          </Text>
          <Text style={[styles.riskSub, { color: theme.textSecondary }]}>
            Distribución de la cartera según días de mora
          </Text>

          {/* Barra Multitono de Cartera */}
          <View style={styles.multiBar}>
            <View
              style={[
                styles.multiSegment,
                {
                  flex: countAlDia + countPazYSalvo || 1,
                  backgroundColor: '#1AA965',
                },
              ]}
            />
            {countMora1 > 0 && (
              <View
                style={[
                  styles.multiSegment,
                  { flex: countMora1, backgroundColor: '#F59E0B' },
                ]}
              />
            )}
            {countMora2 > 0 && (
              <View
                style={[
                  styles.multiSegment,
                  { flex: countMora2, backgroundColor: '#F97316' },
                ]}
              />
            )}
            {countMora3 > 0 && (
              <View
                style={[
                  styles.multiSegment,
                  { flex: countMora3, backgroundColor: '#EF4444' },
                ]}
              />
            )}
          </View>

          {/* Leyenda Semáforo */}
          <View style={styles.riskLegend}>
            <View style={styles.riskItem}>
              <View style={[styles.riskDot, { backgroundColor: '#1AA965' }]} />
              <Text style={[styles.riskItemText, { color: theme.text }]}>
                Al Día / Paz y Salvo ({countAlDia + countPazYSalvo})
              </Text>
            </View>

            <View style={styles.riskItem}>
              <View style={[styles.riskDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={[styles.riskItemText, { color: theme.text }]}>
                1 Mes Mora ({countMora1})
              </Text>
            </View>

            <View style={styles.riskItem}>
              <View style={[styles.riskDot, { backgroundColor: '#F97316' }]} />
              <Text style={[styles.riskItemText, { color: theme.text }]}>
                2 Meses Mora ({countMora2})
              </Text>
            </View>

            <View style={styles.riskItem}>
              <View style={[styles.riskDot, { backgroundColor: '#EF4444' }]} />
              <Text style={[styles.riskItemText, { color: theme.text }]}>
                3+ Meses Crítico ({countMora3})
              </Text>
            </View>
          </View>
        </View>

        {/* Desglose por Modalidad de Crédito */}
        <View
          style={[
            styles.modalidadCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}>
          <Text style={[styles.riskTitle, { color: theme.text }]}>
            Modalidades de Financiación Activas
          </Text>

          <View style={styles.modalidadList}>
            <View style={styles.modalidadRowItem}>
              <View>
                <Text style={[styles.modName, { color: theme.text }]}>
                  Amortizado (Capital + Interés)
                </Text>
                <Text style={[styles.modDesc, { color: theme.textSecondary }]}>
                  Cuota fija dividida entre el plazo pactado
                </Text>
              </View>
              <Text style={[styles.modCount, { color: BrandColors.primary }]}>
                {totalAmortizado} créditos
              </Text>
            </View>

            <View
              style={[styles.modDivider, { backgroundColor: theme.border }]}
            />

            <View style={styles.modalidadRowItem}>
              <View>
                <Text style={[styles.modName, { color: theme.text }]}>
                  Solo Intereses (Capital al Final)
                </Text>
                <Text style={[styles.modDesc, { color: theme.textSecondary }]}>
                  Cuota fija mensual de interés; capital intacto
                </Text>
              </View>
              <Text style={[styles.modCount, { color: BrandColors.primary }]}>
                {totalSoloIntereses} créditos
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
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
  sectionHeader: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flexBasis: '47%',
    flexGrow: 1,
    minWidth: 150,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: 14,
  },
  metricTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricIconWrap: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  metricFooterText: {
    fontSize: 11,
  },
  riskCard: {
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
  },
  riskTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  riskSub: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 14,
  },
  multiBar: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 14,
  },
  multiSegment: {
    height: '100%',
  },
  riskLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  riskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexBasis: '46%',
    flexGrow: 1,
    minWidth: 140,
  },
  riskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  riskItemText: {
    fontSize: 11,
    fontWeight: '600',
  },
  modalidadCard: {
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
  },
  modalidadList: {
    marginTop: 12,
  },
  modalidadRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modName: {
    fontSize: 14,
    fontWeight: '700',
  },
  modDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  modCount: {
    fontSize: 15,
    fontWeight: '800',
  },
  modDivider: {
    height: 1,
    marginVertical: 12,
  },
});

