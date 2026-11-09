import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Calendar } from 'lucide-react-native';
import { BrandColors, Colors, BorderRadius } from '@/constants/theme';
import { formatCurrency } from '@/utils/finance';

interface ProyeccionItem {
  mes: string;
  capital: number;
  interes: number;
  total: number;
}

interface GraficoProyeccionProps {
  isDarkMode: boolean;
  capitalEnCalle: number;
  interesEstimadoMes: number;
}

export const GraficoProyeccion: React.FC<GraficoProyeccionProps> = ({
  isDarkMode,
  capitalEnCalle,
  interesEstimadoMes,
}) => {
  const theme = isDarkMode ? Colors.dark : Colors.light;

  // Proyección calculada para los próximos 6 meses
  const nombresMeses = ['Oct 2026', 'Nov 2026', 'Dic 2026', 'Ene 2027', 'Feb 2027', 'Mar 2027'];
  const baseCapRecaudo = Math.round(capitalEnCalle * 0.18);
  const baseIntRecaudo = Math.max(interesEstimadoMes, Math.round(capitalEnCalle * 0.09));

  const proyecciones: ProyeccionItem[] = nombresMeses.map((mes, idx) => {
    // Variación estacional realista (Dic más alto por primas)
    const factor = idx === 2 ? 1.35 : idx === 3 ? 0.9 : 1.0 + idx * 0.05;
    const capital = Math.round(baseCapRecaudo * factor);
    const interes = Math.round(baseIntRecaudo * factor);
    return {
      mes,
      capital,
      interes,
      total: capital + interes,
    };
  });

  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const selected = proyecciones[selectedIdx];

  const maxTotal = Math.max(...proyecciones.map((p) => p.total), 1);

  return (
    <View
      style={[
        styles.chartCard,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}>
      {/* Encabezado */}
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: theme.text }]}>
            Proyección de Recaudos (6 Meses)
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Estimación de capital amortizado e ingresos por interés
          </Text>
        </View>

        <View
          style={[
            styles.growthBadge,
            { backgroundColor: isDarkMode ? '#132E21' : '#E8F8F0' },
          ]}>
          <TrendingUp size={14} color={BrandColors.primary} />
          <Text style={[styles.growthText, { color: BrandColors.primary }]}>
            +12.4% Est.
          </Text>
        </View>
      </View>

      {/* Gráfico de Barras */}
      <View style={styles.barsContainer}>
        {proyecciones.map((item, idx) => {
          const heightPct = Math.max(20, Math.round((item.total / maxTotal) * 100));
          const isSelected = selectedIdx === idx;

          return (
            <Pressable
              key={item.mes}
              onPress={() => setSelectedIdx(idx)}
              style={styles.barColumn}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${heightPct}%`,
                      backgroundColor: isSelected
                        ? BrandColors.primary
                        : isDarkMode
                        ? '#223042'
                        : '#CBD5E1',
                    },
                  ]}>
                  {isSelected && (
                    <LinearGradient
                      colors={[BrandColors.primary, '#0E7A46']}
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                </View>
              </View>

              <Text
                style={[
                  styles.barLabel,
                  {
                    color: isSelected ? BrandColors.primary : theme.textMuted,
                    fontWeight: isSelected ? '800' : '600',
                  },
                ]}>
                {item.mes.split(' ')[0]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Detalle del Mes Seleccionado */}
      <View
        style={[
          styles.detailPanel,
          {
            backgroundColor: isDarkMode ? '#121722' : '#F8FAFC',
            borderColor: theme.border,
          },
        ]}>
        <View style={styles.detailHeader}>
          <View style={styles.monthBadge}>
            <Calendar size={13} color={BrandColors.primary} />
            <Text style={[styles.monthBadgeText, { color: theme.text }]}>
              {selected.mes}
            </Text>
          </View>
          <Text style={[styles.detailTotal, { color: BrandColors.primary }]}>
            Total: {formatCurrency(selected.total)}
          </Text>
        </View>

        <View style={styles.breakdownRow}>
          <View style={styles.breakdownItem}>
            <View style={[styles.legendDot, { backgroundColor: BrandColors.primary }]} />
            <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>
              Retorno Capital:
            </Text>
            <Text style={[styles.legendVal, { color: theme.text }]}>
              {formatCurrency(selected.capital)}
            </Text>
          </View>

          <View style={styles.breakdownItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>
              Ganancia Interés:
            </Text>
            <Text style={[styles.legendVal, { color: theme.text }]}>
              {formatCurrency(selected.interes)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartCard: {
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  titleBlock: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  growthText: {
    fontSize: 11,
    fontWeight: '700',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 150,
    marginBottom: 16,
    paddingHorizontal: 6,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 28,
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barFill: {
    width: '100%',
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  barLabel: {
    fontSize: 11,
    marginTop: 6,
  },
  detailPanel: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: 12,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  monthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  monthBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  detailTotal: {
    fontSize: 15,
    fontWeight: '800',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 11,
  },
  legendVal: {
    fontSize: 12,
    fontWeight: '700',
  },
});

