import React from 'react';
import { BrandColors, Colors } from '@/constants/theme';
import { usePrestago } from '@/context/PrestagoContext';
import { Tabs } from 'expo-router';
import {
  BarChart3,
  Bot,
  Calendar,
  User,
  Users,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { isDarkMode } = usePrestago();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: BrandColors.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.tabBarBorder,
          borderTopWidth: 1,
          height: 56 + Math.max(insets.bottom, 10),
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 6,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Clientes',
          tabBarIcon: ({ color, size }) => (
            <Users size={size || 22} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendario',
          tabBarIcon: ({ color, size }) => (
            <Calendar size={size || 22} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Análisis',
          tabBarIcon: ({ color, size }) => (
            <BarChart3 size={size || 22} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: 'Asistente IA',
          tabBarIcon: ({ color, size }) => (
            <Bot size={size || 22} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <User size={size || 22} color={String(color)} />
          ),
        }}
      />
    </Tabs>
  );
}
