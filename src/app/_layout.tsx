import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { PrestagoProvider, usePrestago } from '@/context/PrestagoContext';
import { BrandColors, Colors } from '@/constants/theme';

function AuthGuardLoader({ isDarkMode }: { isDarkMode: boolean }) {
  const theme = isDarkMode ? Colors.dark : Colors.light;

  return (
    <View style={[styles.splashContainer, { backgroundColor: theme.background }]}>
      <Image
        source={require('../../assets/images/PrestaGo.png')}
        style={styles.logoImage}
        contentFit="contain"
      />
      <Text style={[styles.appName, { color: theme.text }]}>
        Presta<Text style={{ color: BrandColors.primary }}>Go</Text>
      </Text>
      <Text style={[styles.appSubtitle, { color: theme.textSecondary }]}>
        Control financiero seguro
      </Text>
      <ActivityIndicator
        size="large"
        color={BrandColors.primary}
        style={{ marginTop: 24 }}
      />
    </View>
  );
}

function RootNavigator() {
  const { isDarkMode, isAuthenticated, isAuthLoading } = usePrestago();
  const segments = useSegments();
  const router = useRouter();

  // Protección de rutas: redirigir a login si no está autenticado
  useEffect(() => {
    if (isAuthLoading) return;

    const inAuthGroup = (segments as string[])[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login' as any);
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)' as any);
    }
  }, [isAuthenticated, isAuthLoading, segments]);

  if (isAuthLoading) {
    return (
      <>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <AuthGuardLoader isDarkMode={isDarkMode} />
      </>
    );
  }

  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="new-client"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PrestagoProvider>
        <RootNavigator />
      </PrestagoProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 22,
    marginBottom: 16,
    shadowColor: BrandColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 14,
    marginTop: 6,
  },
});
