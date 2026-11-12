import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  Moon,
  Sun,
  ShieldCheck,
} from 'lucide-react-native';
import { BrandColors, Colors, BorderRadius, MaxContentWidth } from '@/constants/theme';
import { formatCurrency } from '@/utils/finance';

interface HeaderBarProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  capitalEnLaCalle: number;
  clientesActivos: number;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  isDarkMode,
  onToggleTheme,
  capitalEnLaCalle,
  clientesActivos,
}) => {
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          borderBottomColor: theme.border,
          paddingTop: Math.max(insets.top, 16) + 4,
        },
      ]}>
      <View style={styles.innerWrapper}>
        {/* Fila Principal */}
        <View style={styles.topRow}>
          <View style={styles.brandRow}>
            <Image
              source={require('../../assets/images/PrestaGo.png')}
              style={styles.logoImage}
              contentFit="contain"
            />
            <View style={{ flexShrink: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <Text style={[styles.brandTitle, { color: theme.text }]}>
                  Presta<Text style={{ color: BrandColors.primary }}>Go</Text>
                </Text>
                <View style={styles.proTag}>
                  <Text style={styles.proTagText}>PRO</Text>
                </View>
              </View>
              <Text
                style={[styles.brandSubtitle, { color: theme.textSecondary }]}
                numberOfLines={1}>
                Control Financiero Inteligente
              </Text>
            </View>
          </View>

          {/* Botón Cambio de Tema */}
          <Pressable
            onPress={onToggleTheme}
            accessibilityLabel="Cambiar tema oscuro/claro"
            style={[
              styles.themeToggle,
              {
                backgroundColor: isDarkMode ? '#1E2636' : '#F1F5F9',
                borderColor: theme.border,
              },
            ]}>
            {isDarkMode ? (
              <Sun size={18} color="#FBBF24" />
            ) : (
              <Moon size={18} color="#6366F1" />
            )}
          </Pressable>
        </View>

        {/* Banner Resumen Rápido */}
        <View
          style={[
            styles.quickSummaryBanner,
            {
              backgroundColor: isDarkMode ? '#151B26' : '#FFFFFF',
              borderColor: theme.border,
            },
          ]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>
              Capital Colocado
            </Text>
            <Text
              style={[styles.summaryAmount, { color: BrandColors.primary }]}
              numberOfLines={1}
              adjustsFontSizeToFit>
              {formatCurrency(capitalEnLaCalle)}
            </Text>
          </View>

          <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />

          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>
              Cartera Activa
            </Text>
            <View style={styles.clientsCountRow}>
              <ShieldCheck size={14} color={BrandColors.primary} />
              <Text style={[styles.clientsCountText, { color: theme.text }]}>
                {clientesActivos} clientes
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  innerWrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 44,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 12,
  },
  logoImage: {
    width: 38,
    height: 38,
    borderRadius: 10,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  proTag: {
    backgroundColor: '#10B981',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  proTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  brandSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  themeToggle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  quickSummaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 28,
    marginHorizontal: 14,
  },
  clientsCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  clientsCountText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
