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
  ArrowLeft,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react-native';
import { usePrestago } from '@/context/PrestagoContext';
import { BrandColors, Colors, BorderRadius, Shadows, MaxContentWidth } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { recuperarContrasena, isDarkMode } = usePrestago();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Ingresa un correo electrónico válido.');
      return;
    }

    setLoading(true);
    try {
      const res = await recuperarContrasena(email);
      if (res.success) {
        setSuccessMessage(res.message);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err) {
      setErrorMessage('No se pudo procesar la solicitud. Intenta nuevamente.');
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
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.mainWrapper, { maxWidth: MaxContentWidth }]}>
          {/* Botón de Regresar */}
          <Pressable
            onPress={() => router.back()}
            style={[
              styles.backBtn,
              {
                backgroundColor: isDarkMode ? '#1E2636' : '#EDF2F7',
                borderColor: theme.border,
              },
            ]}
            hitSlop={8}
          >
            <ArrowLeft size={20} color={theme.text} />
          </Pressable>

          {/* Encabezado */}
          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: BrandColors.primaryLight }]}>
              <KeyRound size={26} color={BrandColors.primary} />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>Recuperar Contraseña</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Ingresa el correo electrónico asociado a tu cuenta de administrador PrestaGo
            </Text>
          </View>

          {/* Tarjeta del Formulario o Estado de Éxito */}
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
            {successMessage ? (
              <View style={styles.successBlock}>
                <View style={[styles.successIconCircle, { backgroundColor: BrandColors.primaryLight }]}>
                  <CheckCircle2 size={42} color={BrandColors.primary} />
                </View>
                <Text style={[styles.successTitle, { color: theme.text }]}>
                  ¡Instrucciones Enviadas!
                </Text>
                <Text style={[styles.successDesc, { color: theme.textSecondary }]}>
                  {successMessage}
                </Text>

                <Pressable
                  onPress={() => router.replace('/(auth)/login' as any)}
                  style={({ pressed }) => [
                    styles.submitBtn,
                    { marginTop: 24 },
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <LinearGradient
                    colors={BrandColors.gradientPrimary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitGradient}
                  >
                    <Text style={styles.submitText}>Volver a Iniciar Sesión</Text>
                    <ArrowRight size={18} color="#FFFFFF" />
                  </LinearGradient>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setSuccessMessage(null);
                    setEmail('');
                  }}
                  style={styles.resendBtn}
                  hitSlop={8}
                >
                  <Text style={[styles.resendText, { color: BrandColors.primary }]}>
                    ¿No lo recibiste? Intentar con otro correo
                  </Text>
                </Pressable>
              </View>
            ) : (
              <>
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

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>
                    Correo Electrónico Registrado
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
                    <Mail size={19} color={theme.icon} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: theme.text }]}
                      placeholder="ej. admin@prestago.co"
                      placeholderTextColor={theme.textMuted}
                      value={email}
                      onChangeText={(val) => {
                        setEmail(val);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {/* Botón: Enviar Instrucciones */}
                <Pressable
                  onPress={handleSubmit}
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
                      <Text style={styles.submitText}>Enviar Instrucciones</Text>
                    )}
                  </LinearGradient>
                </Pressable>
              </>
            )}
          </View>

          {/* Enlace para volver */}
          {!successMessage && (
            <View style={styles.footerRow}>
              <Pressable onPress={() => router.back()} hitSlop={8}>
                <Text style={[styles.footerLink, { color: BrandColors.primary }]}>
                  ← Volver a Iniciar Sesión
                </Text>
              </Pressable>
            </View>
          )}
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  header: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    padding: 24,
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  submitBtn: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  successBlock: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  successDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  resendBtn: {
    marginTop: 16,
  },
  resendText: {
    fontSize: 13,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});

