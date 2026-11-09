import { Platform } from 'react-native';

export const BrandColors = {
  primary: '#1AA965',
  primaryDark: '#0E7A46',
  primaryLight: '#E8F8F0',
  primaryHover: '#169357',
  accent: '#10B981',
  secondary: '#3B82F6',
  warning: '#F59E0B',
  orange: '#F97316',
  danger: '#EF4444',
  success: '#1AA965',
  gradientPrimary: ['#1AA965', '#0E7A46'] as [string, string],
  gradientCardDark: ['#1F242C', '#14181E'] as [string, string],
  gradientGold: ['#F59E0B', '#D97706'] as [string, string],
  gradientDanger: ['#EF4444', '#DC2626'] as [string, string],
};

export const Colors = {
  light: {
    primary: BrandColors.primary,
    primaryDark: BrandColors.primaryDark,
    primaryLight: BrandColors.primaryLight,
    background: '#F8FAFC',
    card: '#FFFFFF',
    cardSecondary: '#F1F5F9',
    surface: '#FFFFFF',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    icon: '#64748B',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E2E8F0',
    statusAlDia: '#1AA965',
    statusMora1: '#F59E0B',
    statusMora2: '#F97316',
    statusMora3: '#EF4444',
    statusPazYSalvo: '#10B981',
    badgeAlDiaBg: '#E8F8F0',
    badgeMora1Bg: '#FEF3C7',
    badgeMora2Bg: '#FFEDD5',
    badgeMora3Bg: '#FEE2E2',
    badgePazYSalvoBg: '#D1FAE5',
  },
  dark: {
    primary: BrandColors.primary,
    primaryDark: BrandColors.primaryDark,
    primaryLight: 'rgba(26, 169, 101, 0.15)',
    background: '#0B0F17',
    card: '#151B26',
    cardSecondary: '#1E2636',
    surface: '#151B26',
    border: '#232D3F',
    borderLight: '#1B2332',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    icon: '#94A3B8',
    tabBar: '#121722',
    tabBarBorder: '#232D3F',
    statusAlDia: '#1AA965',
    statusMora1: '#F59E0B',
    statusMora2: '#F97316',
    statusMora3: '#EF4444',
    statusPazYSalvo: '#10B981',
    badgeAlDiaBg: 'rgba(26, 169, 101, 0.16)',
    badgeMora1Bg: 'rgba(245, 158, 11, 0.16)',
    badgeMora2Bg: 'rgba(249, 115, 22, 0.16)',
    badgeMora3Bg: 'rgba(239, 68, 68, 0.16)',
    badgePazYSalvoBg: 'rgba(16, 185, 129, 0.16)',
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export const Shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.12,
      shadowRadius: 2,
    },
    android: { elevation: 2 },
    default: { boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
    },
    android: { elevation: 4 },
    default: { boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.2,
      shadowRadius: 15,
    },
    android: { elevation: 8 },
    default: { boxShadow: '0 10px 15px -3px rgba(0,0,0,0.15)' },
  }),
  glowGreen: Platform.select({
    ios: {
      shadowColor: '#1AA965',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
    },
    android: { elevation: 6 },
    default: { boxShadow: '0 4px 14px rgba(26, 169, 101, 0.35)' },
  }),
};

export const MaxContentWidth = 840;
