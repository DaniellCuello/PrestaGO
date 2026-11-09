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
  User,
  CreditCard,
  Phone,
  Briefcase,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react-native';
import { usePrestago } from '@/context/PrestagoContext';
import { BrandColors, Colors, BorderRadius, Shadows, MaxContentWidth } from '@/constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { registrarUsuario, isDarkMode } = usePrestago();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [nombres, setNombres] = useState('');
  const [documento, setDocumento] = useState('');
  const [celular, setCelular] = useState('');
  const [negocio, setNegocio] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    setErrorMessage(null);

    if (!nombres.trim()) {
      setErrorMessage('Ingresa tus nombres y apellidos completos.');
      return;
    }
    if (!documento.trim()) {
      setErrorMessage('Ingresa tu número de documento de identidad.');
      return;
    }
    if (!celular.trim()) {
      setErrorMessage('Ingresa tu número de celular o WhatsApp de contacto.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Ingresa un correo electrónico válido.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas ingresadas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const result = await registrarUsuario({
        nombres,
        documento,
        celular,
        email,
        password,
        negocio: negocio.trim() || undefined,
      });

      if (!result.success) {
        setErrorMessage(result.error || 'No se pudo completar el registro.');
      }
      // Al registrarse exitosamente, isAuthenticated cambia a true y el RootNavigator redirige a (tabs)
    } catch (err) {
      setErrorMessage('Ocurrió un error inesperado al procesar el registro.');
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
            <View style={styles.badgeRow}>
              <View style={[styles.iconCircle, { backgroundColor: BrandColors.primaryLight }]}>
                <ShieldCheck size={26} color={BrandColors.primary} />
              </View>
            </View>
            <Text style={[styles.title, { color: theme.text }]}>Crear Cuenta</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Regístrate como administrador para gestionar préstamos y cobros
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

            {/* Campo: Nombres */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Nombre Completo *
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
                <User size={19} color={theme.icon} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="ej. Juan Carlos Pérez"
                  placeholderTextColor={theme.textMuted}
                  value={nombres}
                  onChangeText={(val) => {
                    setNombres(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Fila: Documento y Teléfono */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>
                  Cédula / Documento *
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
                  <CreditCard size={18} color={theme.icon} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="1020304050"
                    placeholderTextColor={theme.textMuted}
                    value={documento}
                    onChangeText={(val) => {
                      setDocumento(val);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>
                  WhatsApp / Celular *
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
                  <Phone size={18} color={theme.icon} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="+57 300..."
                    placeholderTextColor={theme.textMuted}
                    value={celular}
                    onChangeText={(val) => {
                      setCelular(val);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </View>

            {/* Campo: Negocio (Opcional) */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Nombre de tu Negocio / Empresa (Opcional)
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
                <Briefcase size={19} color={theme.icon} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="ej. Inversiones del Valle S.A.S."
                  placeholderTextColor={theme.textMuted}
                  value={negocio}
                  onChangeText={setNegocio}
                />
              </View>
            </View>

            {/* Campo: Correo Electrónico */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Correo Electrónico *
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
                  placeholder="ejemplo@prestago.co"
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

            {/* Campo: Contraseña */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Contraseña (Mínimo 6 caracteres) *
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
                <Lock size={19} color={theme.icon} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Crea una contraseña segura"
                  placeholderTextColor={theme.textMuted}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  secureTextEntry={!showPassword}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  hitSlop={8}
                >
                  {showPassword ? (
                    <EyeOff size={19} color={theme.icon} />
                  ) : (
                    <Eye size={19} color={theme.icon} />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Campo: Confirmar Contraseña */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Confirmar Contraseña *
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
                <CheckCircle2 size={19} color={theme.icon} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Repite la contraseña"
                  placeholderTextColor={theme.textMuted}
                  value={confirmPassword}
                  onChangeText={(val) => {
                    setConfirmPassword(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  secureTextEntry={!showConfirmPassword}
                />
                <Pressable
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeBtn}
                  hitSlop={8}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} color={theme.icon} />
                  ) : (
                    <Eye size={19} color={theme.icon} />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Botón: Crear Cuenta */}
            <Pressable
              onPress={handleRegister}
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
                  <Text style={styles.submitText}>Crear mi Cuenta PrestaGo</Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>

          {/* Enlace para Iniciar Sesión */}
          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              ¿Ya tienes una cuenta registrada?
            </Text>
            <Pressable onPress={() => router.push('/(auth)/login' as any)} hitSlop={8}>
              <Text style={[styles.footerLink, { color: BrandColors.primary }]}>
                Inicia sesión
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
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
    marginBottom: 16,
  },
  header: {
    marginBottom: 20,
  },
  badgeRow: {
    marginBottom: 10,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    padding: 22,
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
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  eyeBtn: {
    padding: 4,
  },
  submitBtn: {
    marginTop: 10,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  submitGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});

