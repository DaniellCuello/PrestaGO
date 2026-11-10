import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sun,
  Moon,
  AlertCircle,
} from 'lucide-react-native';
import { usePrestago } from '@/context/PrestagoContext';
import { BrandColors, Colors, BorderRadius, Shadows, MaxContentWidth } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { iniciarSesion, isDarkMode, toggleTheme } = usePrestago();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [identificador, setIdentificador] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (idParam?: string, passParam?: string) => {
    const idToUse = idParam ?? identificador;
    const passToUse = passParam ?? contrasena;

    setErrorMessage(null);
    if (!idToUse.trim()) {
      setErrorMessage('Ingresa tu correo electrónico o número de documento.');
      return;
    }
    if (!passToUse) {
      setErrorMessage('Ingresa tu contraseña de acceso.');
      return;
    }

    setLoading(true);
    try {
      const result = await iniciarSesion(idToUse, passToUse);
      if (!result.success) {
        setErrorMessage(result.error || 'Credenciales inválidas.');
      }
      // Si fue exitoso, el RootNavigator en _layout detectará isAuthenticated y navegará a (tabs)
    } catch (err) {
      setErrorMessage('Ocurrió un error de conexión al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.mainWrapper, { maxWidth: MaxContentWidth }]}>
          {/* Barra superior con selector de tema */}
          <View style={styles.topActions}>
            <Pressable
              onPress={toggleTheme}
              style={[
                styles.themeBtn,
                {
                  backgroundColor: isDarkMode ? '#1E2636' : '#EDF2F7',
                  borderColor: theme.border,
                },
              ]}
              hitSlop={8}
            >
              {isDarkMode ? (
                <Sun size={18} color="#F59E0B" />
              ) : (
                <Moon size={18} color="#64748B" />
              )}
            </Pressable>
          </View>

          {/* Logo y Encabezado de Marca */}
          <View style={styles.brandHeader}>
            <LinearGradient
              colors={BrandColors.gradientPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBadge}
            >
              <ShieldCheck size={36} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.appName, { color: theme.text }]}>
              Presta<Text style={{ color: BrandColors.primary }}>Go</Text>
            </Text>
            <Text style={[styles.appTagline, { color: theme.textSecondary }]}>
              Gestión inteligente y control financiero de créditos
            </Text>
          </View>

          {/* Tarjeta del Formulario */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
              Shadows.md,
            ]}
          >
            <Text style={[styles.cardTitle, { color: theme.text }]}>Iniciar Sesión</Text>
            <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
              Ingresa tus credenciales para acceder a tu panel
            </Text>

            {/* Mensaje de error si existe */}
            {errorMessage && (
              <View
                style={[
                  styles.errorAlert,
                  {
                    backgroundColor: isDarkMode
                      ? 'rgba(239, 68, 68, 0.15)'
                      : '#FEF2F2',
                    borderColor: BrandColors.danger,
                  },
                ]}
              >
                <AlertCircle size={18} color={BrandColors.danger} />
                <Text style={[styles.errorText, { color: BrandColors.danger }]}>
                  {errorMessage}
                </Text>
              </View>
            )}

            {/* Campo: Correo o Documento */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Correo o Cédula / Documento
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: isDarkMode ? '#1E2636' : '#F8FAFC',
                    borderColor: theme.border,
                  },
                ]}
              >
                <Mail size={20} color={theme.icon} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="ej. admin@prestago.co o 1098..."
                  placeholderTextColor={theme.textMuted}
                  value={identificador}
                  onChangeText={(val) => {
                    setIdentificador(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Campo: Contraseña */}
            <View style={styles.inputGroup}>
              <View style={styles.passwordLabelRow}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>
                  Contraseña
                </Text>
                <Pressable
                  onPress={() => router.push('/(auth)/forgot-password' as any)}
                  hitSlop={6}
                >
                  <Text style={[styles.forgotLink, { color: BrandColors.primary }]}>
                    ¿La olvidaste?
                  </Text>
                </Pressable>
              </View>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: isDarkMode ? '#1E2636' : '#F8FAFC',
                    borderColor: theme.border,
                  },
                ]}
              >
                <Lock size={20} color={theme.icon} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Ingresa tu contraseña"
                  placeholderTextColor={theme.textMuted}
                  value={contrasena}
                  onChangeText={(val) => {
                    setContrasena(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  secureTextEntry={!showPassword}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  hitSlop={10}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={theme.icon} />
                  ) : (
                    <Eye size={20} color={theme.icon} />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Botón Principal: Iniciar Sesión */}
            <Pressable
              onPress={() => handleLogin()}
              disabled={loading}
              style={({ pressed }) => [
                styles.submitBtn,
                pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
                loading && { opacity: 0.7 },
              ]}
            >
              <LinearGradient
                colors={BrandColors.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.submitText}>Entrar al Sistema</Text>
                    <ArrowRight size={18} color="#FFFFFF" />
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </View>

          {/* Enlace para Registrarse */}
          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              ¿No tienes una cuenta aún?
            </Text>
            <Pressable onPress={() => router.push('/(auth)/register' as any)} hitSlop={8}>
              <Text style={[styles.footerLink, { color: BrandColors.primary }]}>
                Regístrate aquí
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  mainWrapper: {
    width: '100%',
    alignSelf: 'center',
  },
  topActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  themeBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 70,
    height: 70,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: BrandColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
    maxWidth: 290,
  },
  card: {
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    padding: 24,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    marginBottom: 20,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotLink: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  eyeBtn: {
    padding: 4,
  },
  submitBtn: {
    marginTop: 8,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    paddingHorizontal: 10,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  demoTextCol: {
    flex: 1,
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  demoSub: {
    fontSize: 11,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});

