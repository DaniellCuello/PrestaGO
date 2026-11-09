import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
} from 'react-native';
import { Calculator, DollarSign, Percent, Sparkles } from 'lucide-react-native';
import { ModalidadCredito } from '@/types';
import { BrandColors, Colors, BorderRadius, Shadows } from '@/constants/theme';
import {
  calcularCuota,
  formatCurrency,
  PLAZO_INDEFINIDO_CUOTAS,
} from '@/utils/finance';

interface CalculadoraRapidaProps {
  isDarkMode: boolean;
}

export const CalculadoraRapida: React.FC<CalculadoraRapidaProps> = ({ isDarkMode }) => {
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [monto, setMonto] = useState<string>('2000000');
  const [tasa, setTasa] = useState<string>('10');
  const [modalidad, setModalidad] = useState<ModalidadCredito>('Amortizado');
  const [esIndefinido, setEsIndefinido] = useState<boolean>(false);
  const [plazoMeses, setPlazoMeses] = useState<number>(6);

  const numMonto = parseFloat(monto) || 0;
  const numTasa = parseFloat(tasa) || 0;
  const cuotasTotales = esIndefinido ? PLAZO_INDEFINIDO_CUOTAS : plazoMeses;

  const resultado = calcularCuota({
    monto: numMonto,
    tasaInteres: numTasa,
    cuotasTotales,
    modalidad,
  });

  const PLAZOS_SUGERIDOS = [3, 6, 10, 12, 18, 24];

  return (
    <View
      style={[
        styles.calcCard,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
        Shadows.md,
      ]}>
      {/* Encabezado */}
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <Calculator size={18} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.title, { color: theme.text }]}>
            Calculadora Rápida de Créditos
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Simula cuotas exactas según la modalidad pactada
          </Text>
        </View>
      </View>

      {/* Selectores de Modalidad */}
      <View style={styles.modalidadRow}>
        <Pressable
          onPress={() => setModalidad('Amortizado')}
          style={[
            styles.modalidadTab,
            modalidad === 'Amortizado' && styles.modalidadTabActive,
            {
              backgroundColor:
                modalidad === 'Amortizado'
                  ? BrandColors.primary
                  : isDarkMode
                  ? '#1A2230'
                  : '#F1F5F9',
            },
          ]}>
          <Text
            style={[
              styles.modalidadTabText,
              { color: modalidad === 'Amortizado' ? '#FFFFFF' : theme.textSecondary },
            ]}>
            Amortizado (Cap + Int)
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setModalidad('Solo Intereses')}
          style={[
            styles.modalidadTab,
            modalidad === 'Solo Intereses' && styles.modalidadTabActive,
            {
              backgroundColor:
                modalidad === 'Solo Intereses'
                  ? BrandColors.primary
                  : isDarkMode
                  ? '#1A2230'
                  : '#F1F5F9',
            },
          ]}>
          <Text
            style={[
              styles.modalidadTabText,
              { color: modalidad === 'Solo Intereses' ? '#FFFFFF' : theme.textSecondary },
            ]}>
            Solo Intereses
          </Text>
        </Pressable>
      </View>

      {/* Inputs Numéricos */}
      <View style={styles.inputsGrid}>
        <View style={styles.inputCol}>
          <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
            Monto a Prestar
          </Text>
          <View
            style={[
              styles.inputBox,
              {
                backgroundColor: isDarkMode ? '#0D1117' : '#F8FAFC',
                borderColor: theme.border,
              },
            ]}>
            <DollarSign size={16} color={BrandColors.primary} />
            <TextInput
              keyboardType="numeric"
              value={monto}
              onChangeText={setMonto}
              style={[styles.inputField, { color: theme.text }]}
            />
          </View>
        </View>

        <View style={styles.inputCol}>
          <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
            Tasa Mensual (%)
          </Text>
          <View
            style={[
              styles.inputBox,
              {
                backgroundColor: isDarkMode ? '#0D1117' : '#F8FAFC',
                borderColor: theme.border,
              },
            ]}>
            <Percent size={16} color={BrandColors.primary} />
            <TextInput
              keyboardType="numeric"
              value={tasa}
              onChangeText={setTasa}
              style={[styles.inputField, { color: theme.text }]}
            />
          </View>
        </View>
      </View>

      {/* Selector de Plazo vs Indefinido */}
      <View style={styles.plazoSection}>
        <View style={styles.plazoHeader}>
          <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
            Plazo de Financiación:
          </Text>
          <Pressable
            onPress={() => setEsIndefinido(!esIndefinido)}
            style={[
              styles.indefinidoToggle,
              {
                backgroundColor: esIndefinido
                  ? BrandColors.primaryLight
                  : isDarkMode
                  ? '#21262D'
                  : '#F1F5F9',
                borderColor: esIndefinido ? BrandColors.primary : theme.border,
              },
            ]}>
            <Text
              style={[
                styles.indefinidoText,
                { color: esIndefinido ? BrandColors.primaryDark : theme.textSecondary },
              ]}>
              {esIndefinido ? '✓ Plazo Indefinido (999)' : 'Mes a Mes Indefinido'}
            </Text>
          </Pressable>
        </View>

        {!esIndefinido && (
          <View style={styles.plazosRow}>
            {PLAZOS_SUGERIDOS.map((m) => (
              <Pressable
                key={m}
                onPress={() => setPlazoMeses(m)}
                style={[
                  styles.plazoPill,
                  plazoMeses === m && styles.plazoPillActive,
                  {
                    backgroundColor:
                      plazoMeses === m
                        ? BrandColors.primary
                        : isDarkMode
                        ? '#161D27'
                        : '#F1F5F9',
                    borderColor: plazoMeses === m ? BrandColors.primary : theme.border,
                  },
                ]}>
                <Text
                  style={[
                    styles.plazoPillText,
                    { color: plazoMeses === m ? '#FFFFFF' : theme.textSecondary },
                  ]}>
                  {m} meses
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Tarjeta de Resultados */}
      <View
        style={[
          styles.resultCard,
          {
            backgroundColor: isDarkMode ? '#13231B' : '#E8F8F0',
            borderColor: BrandColors.primary,
          },
        ]}>
        <View style={styles.resultMainRow}>
          <View>
            <Text style={[styles.resultLabel, { color: BrandColors.primaryDark }]}>
              Cuota Mensual Fija
            </Text>
            <Text style={[styles.resultValue, { color: isDarkMode ? '#2EE28B' : '#0E7A46' }]}>
              {formatCurrency(resultado.cuota)}
            </Text>
          </View>

          <View style={styles.resultBadge}>
            <Sparkles size={14} color="#FFFFFF" />
            <Text style={styles.resultBadgeText}>
              {esIndefinido
                ? 'Mes a Mes'
                : `${plazoMeses} cuotas`}
            </Text>
          </View>
        </View>

        <View style={styles.resultDivider} />

        <View style={styles.resultSubGrid}>
          <View>
            <Text style={[styles.subLabel, { color: BrandColors.primaryDark }]}>
              {esIndefinido ? 'Interés / Mes' : 'Interés Total'}
            </Text>
            <Text style={[styles.subValue, { color: theme.text }]}>
              {formatCurrency(resultado.interesTotal)}
            </Text>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.subLabel, { color: BrandColors.primaryDark }]}>
              {esIndefinido ? 'Capital al Cancelar' : 'Total a Recaudar'}
            </Text>
            <Text style={[styles.subValue, { color: theme.text }]}>
              {formatCurrency(resultado.totalAPagar)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  calcCard: {
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BrandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  modalidadRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  modalidadTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  modalidadTabActive: {},
  modalidadTabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  inputsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  inputCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
  },
  plazoSection: {
    marginBottom: 16,
  },
  plazoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  indefinidoToggle: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  indefinidoText: {
    fontSize: 11,
    fontWeight: '700',
  },
  plazosRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  plazoPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  plazoPillActive: {},
  plazoPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  resultCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    padding: 14,
  },
  resultMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  resultLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  resultValue: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: BrandColors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  resultBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  resultDivider: {
    height: 1,
    backgroundColor: 'rgba(26, 169, 101, 0.25)',
    marginVertical: 10,
  },
  resultSubGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  subValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
});

