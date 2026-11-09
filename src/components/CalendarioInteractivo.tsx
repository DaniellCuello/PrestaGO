import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react-native';
import { Cliente } from '@/types';
import { BrandColors, Colors, BorderRadius } from '@/constants/theme';
import { getInfoEstadoMora } from '@/utils/finance';

interface CalendarioInteractivoProps {
  clientes: Cliente[];
  isDarkMode: boolean;
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
}

export const CalendarioInteractivo: React.FC<CalendarioInteractivoProps> = ({
  clientes,
  isDarkMode,
  selectedDate,
  onSelectDate,
}) => {
  const theme = isDarkMode ? Colors.dark : Colors.light;

  // Fecha base: tomamos el mes de la fecha seleccionada o actual
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const [year, month] = selectedDate.split('-').map(Number);
    return new Date(year, month - 1, 1);
  });

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); // 0-indexed

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  // Mapear clientes por fecha de cobro (YYYY-MM-DD o solo día del mes)
  const cobrosPorFecha: { [key: string]: Cliente[] } = {};
  clientes.forEach((c) => {
    if (c.estadoMora !== 'paz_y_salvo' && c.proximoCobro) {
      if (!cobrosPorFecha[c.proximoCobro]) {
        cobrosPorFecha[c.proximoCobro] = [];
      }
      cobrosPorFecha[c.proximoCobro].push(c);
    }
  });

  // Generar cuadrícula de días
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  // Ajustar a semana iniciando en Lunes (0 = Lun, 6 = Dom)
  const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  const dayHeaders = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}>
      {/* Navegación del Mes */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <CalendarIcon size={18} color={BrandColors.primary} />
          <Text style={[styles.monthTitle, { color: theme.text }]}>
            {monthNames[month]} {year}
          </Text>
        </View>

        <View style={styles.navControls}>
          <Pressable
            onPress={handlePrevMonth}
            style={[
              styles.navBtn,
              { backgroundColor: isDarkMode ? '#1E2636' : '#F1F5F9' },
            ]}>
            <ChevronLeft size={16} color={theme.text} />
          </Pressable>
          <Pressable
            onPress={handleNextMonth}
            style={[
              styles.navBtn,
              { backgroundColor: isDarkMode ? '#1E2636' : '#F1F5F9' },
            ]}>
            <ChevronRight size={16} color={theme.text} />
          </Pressable>
        </View>
      </View>

      {/* Días de la semana */}
      <View style={styles.weekHeader}>
        {dayHeaders.map((dh, idx) => (
          <Text
            key={idx}
            style={[styles.weekDayText, { color: theme.textMuted }]}>
            {dh}
          </Text>
        ))}
      </View>

      {/* Cuadrícula de Días */}
      <View style={styles.grid}>
        {daysArray.map((day, index) => {
          if (day === null) {
            return <View key={`empty-${index}`} style={styles.dayCellEmpty} />;
          }

          const dayStr = day < 10 ? `0${day}` : `${day}`;
          const monthStr = month + 1 < 10 ? `0${month + 1}` : `${month + 1}`;
          const fullDateStr = `${year}-${monthStr}-${dayStr}`;

          const isSelected = selectedDate === fullDateStr;
          const cobrosDelDia = cobrosPorFecha[fullDateStr] || [];

          return (
            <Pressable
              key={`day-${day}`}
              onPress={() => onSelectDate(fullDateStr)}
              style={[
                styles.dayCell,
                isSelected && [
                  styles.dayCellSelected,
                  { backgroundColor: BrandColors.primary },
                ],
              ]}>
              <Text
                style={[
                  styles.dayNumber,
                  {
                    color: isSelected
                      ? '#FFFFFF'
                      : cobrosDelDia.length > 0
                      ? theme.text
                      : theme.textSecondary,
                    fontWeight: isSelected || cobrosDelDia.length > 0 ? '700' : '500',
                  },
                ]}>
                {day}
              </Text>

              {/* Indicadores de Semáforo de Cobros */}
              {cobrosDelDia.length > 0 && (
                <View style={styles.markersRow}>
                  {cobrosDelDia.slice(0, 3).map((cli) => {
                    const info = getInfoEstadoMora(cli.estadoMora);
                    return (
                      <View
                        key={cli.id}
                        style={[
                          styles.dotMarker,
                          {
                            backgroundColor: isSelected
                              ? '#FFFFFF'
                              : info.color,
                          },
                        ]}
                      />
                    );
                  })}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Leyenda de Semáforo */}
      <View
        style={[
          styles.legendRow,
          {
            borderTopColor: theme.border,
          },
        ]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#1AA965' }]} />
          <Text style={[styles.legendText, { color: theme.textSecondary }]}>
            Al Día
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={[styles.legendText, { color: theme.textSecondary }]}>
            Mora 1 Mes
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
          <Text style={[styles.legendText, { color: theme.textSecondary }]}>
            Mora 2 Meses
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={[styles.legendText, { color: theme.textSecondary }]}>
            Mora 3+ Meses
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  navControls: {
    flexDirection: 'row',
    gap: 6,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCellEmpty: {
    width: '14.28%',
    height: 44,
  },
  dayCell: {
    width: '14.28%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    position: 'relative',
  },
  dayCellSelected: {},
  dayNumber: {
    fontSize: 14,
  },
  markersRow: {
    flexDirection: 'row',
    gap: 2,
    position: 'absolute',
    bottom: 4,
  },
  dotMarker: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '600',
  },
});

