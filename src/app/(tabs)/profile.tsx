import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  Platform,
  Modal,
  Linking,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import {
  Shield,
  Phone,
  CreditCard,
  Camera,
  Image as ImageIcon,
  Trash2,
  X,
  Edit3,
  Mail,
  LogOut,
  Bell,
  FileText,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react-native';
import { usePrestago } from '@/context/PrestagoContext';
import { BrandColors, Colors, BorderRadius, Shadows, MaxContentWidth } from '@/constants/theme';
import { HeaderBar } from '@/components/HeaderBar';
import { AdminModalEdit } from '@/components/AdminModalEdit';

export default function ProfileScreen() {
  const {
    admin,
    isDarkMode,
    toggleTheme,
    metricas,
    actualizarFotoAdmin,
    actualizarAdmin,
    cerrarSesion,
  } = usePrestago();

  const theme = isDarkMode ? Colors.dark : Colors.light;
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [editAdminModalVisible, setEditAdminModalVisible] = useState(false);
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [notificacionesCobro, setNotificacionesCobro] = useState(true);
  const [terminosModalVisible, setTerminosModalVisible] = useState(false);
  const [privacidadModalVisible, setPrivacidadModalVisible] = useState(false);

  useEffect(() => {
    const cargarPreferenciaNotif = async () => {
      try {
        const valor = await AsyncStorage.getItem('@prestago_notificaciones_activas');
        if (valor !== null) {
          setNotificacionesCobro(valor === 'true');
        }
      } catch (e) {
        console.warn('Error al cargar preferencia de notificaciones:', e);
      }
    };
    cargarPreferenciaNotif();
  }, []);

  const handleToggleNotificaciones = async (val: boolean) => {
    setNotificacionesCobro(val);
    try {
      await AsyncStorage.setItem('@prestago_notificaciones_activas', val ? 'true' : 'false');
    } catch (e) {
      console.warn('Error al guardar preferencia de notificaciones:', e);
    }
  };

  // Manejar captura con Cámara (solicitando permisos explícitos)
  const handleTomarFotoCamara = async () => {
    try {
      setLoadingPhoto(true);
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        setLoadingPhoto(false);
        if (Platform.OS === 'web') {
          alert('PrestaGo necesita acceso a tu cámara para capturar tu foto de perfil.');
        } else {
          Alert.alert(
            'Permiso de Cámara Requerido',
            'PrestaGo necesita acceso a tu cámara para capturar tu foto de perfil de administrador. Habilítalo en los ajustes del dispositivo.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Abrir Ajustes', onPress: () => Linking.openSettings() },
            ]
          );
        }
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await actualizarFotoAdmin(result.assets[0].uri);
        setPhotoModalVisible(false);
      }
    } catch (err) {
      console.warn('Error al abrir la cámara:', err);
      Alert.alert('Error', 'No se pudo iniciar la cámara en este dispositivo.');
    } finally {
      setLoadingPhoto(false);
    }
  };

  // Manejar selección desde Galería (solicitando permisos explícitos)
  const handleElegirDeGaleria = async () => {
    try {
      setLoadingPhoto(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        setLoadingPhoto(false);
        if (Platform.OS === 'web') {
          alert('PrestaGo necesita acceso a tu galería para seleccionar tu foto de perfil.');
        } else {
          Alert.alert(
            'Permiso de Galería Requerido',
            'PrestaGo necesita acceso a tu galería de fotos para seleccionar tu foto de perfil de administrador. Habilítalo en los ajustes del dispositivo.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Abrir Ajustes', onPress: () => Linking.openSettings() },
            ]
          );
        }
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await actualizarFotoAdmin(result.assets[0].uri);
        setPhotoModalVisible(false);
      }
    } catch (err) {
      console.warn('Error al abrir galería:', err);
      Alert.alert('Error', 'No se pudo abrir la galería de fotos.');
    } finally {
      setLoadingPhoto(false);
    }
  };

  // Restaurar foto original por defecto
  const handleRestaurarFoto = async () => {
    await actualizarFotoAdmin('');
    setPhotoModalVisible(false);
  };

  const handleCerrarSesion = () => {
    const executeLogout = async () => {
      await cerrarSesion();
    };

    if (Platform.OS === 'web') {
      if (window.confirm('¿Deseas cerrar tu sesión en PrestaGo?')) {
        executeLogout();
      }
    } else {
      Alert.alert(
        'Cerrar Sesión',
        '¿Estás seguro de que deseas salir de tu cuenta? Tendrás que ingresar tus credenciales para volver a entrar.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Cerrar Sesión', style: 'destructive', onPress: executeLogout },
        ]
      );
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <HeaderBar
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        capitalEnLaCalle={metricas.capitalEnLaCalle}
        clientesActivos={metricas.clientesActivos}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Tarjeta de Perfil del Administrador */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
            Shadows.md,
          ]}>
          {/* Avatar interactivo con badge para cambiar foto */}
          <Pressable
            onPress={() => setPhotoModalVisible(true)}
            accessibilityLabel="Cambiar foto de perfil"
            style={styles.avatarTouchable}>
            {admin.fotoPerfil ? (
              <Image
                source={{ uri: admin.fotoPerfil }}
                style={styles.avatarLargeImage}
                contentFit="cover"
                transition={300}
              />
            ) : (
              <LinearGradient
                colors={[BrandColors.primary, BrandColors.primaryDark]}
                style={styles.avatarLarge}>
                <Text style={styles.avatarLargeText}>
                  {admin.nombres.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </Text>
              </LinearGradient>
            )}

            <View style={[styles.cameraBadge, Shadows.glowGreen]}>
              <Camera size={14} color="#FFFFFF" />
            </View>
          </Pressable>

          <Text style={[styles.adminName, { color: theme.text }]}>
            {admin.nombres}
          </Text>
          <Text style={[styles.adminRole, { color: BrandColors.primary }]}>
            Administrador Master & Prestamista
          </Text>
          <Text style={[styles.businessText, { color: theme.textSecondary }]}>
            {admin.negocio}
          </Text>

          {/* Datos Personales en Lista */}
          <View
            style={[
              styles.infoBox,
              {
                backgroundColor: isDarkMode ? '#121722' : '#F8FAFC',
                borderColor: theme.border,
              },
            ]}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelGroup}>
                <CreditCard size={15} color={theme.textMuted} />
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                  Documento:
                </Text>
              </View>
              <Text style={[styles.infoVal, { color: theme.text }]}>
                {admin.documento}
              </Text>
            </View>

            <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />

            <View style={styles.infoRow}>
              <View style={styles.infoLabelGroup}>
                <Phone size={15} color={theme.textMuted} />
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                  Celular:
                </Text>
              </View>
              <Text style={[styles.infoVal, { color: theme.text }]}>
                {admin.celular}
              </Text>
            </View>

            {admin.email ? (
              <>
                <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />
                <View style={styles.infoRow}>
                  <View style={styles.infoLabelGroup}>
                    <Mail size={15} color={theme.textMuted} />
                    <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                      Email:
                    </Text>
                  </View>
                  <Text style={[styles.infoVal, { color: theme.text }]}>
                    {admin.email}
                  </Text>
                </View>
              </>
            ) : null}

            <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />

            <View style={styles.infoRow}>
              <View style={styles.infoLabelGroup}>
                <Shield size={15} color={theme.textMuted} />
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                  UID Firestore:
                </Text>
              </View>
              <Text style={[styles.infoVal, { color: BrandColors.primary }]}>
                {admin.uid}
              </Text>
            </View>
          </View>

          {/* Botón para Editar Información Personal */}
          <Pressable
            onPress={() => setEditAdminModalVisible(true)}
            style={({ pressed }) => [
              styles.editAdminBtn,
              {
                borderColor: BrandColors.primary,
                backgroundColor: pressed
                  ? 'rgba(26, 169, 101, 0.15)'
                  : 'rgba(26, 169, 101, 0.08)',
              },
            ]}>
            <Edit3 size={15} color={BrandColors.primary} />
            <Text style={[styles.editAdminBtnText, { color: BrandColors.primary }]}>
              Editar Información Personal
            </Text>
          </Pressable>
        </View>

        {/* Sección: Configuración Visual y del Sistema */}
        <View style={styles.sectionHeading}>
          <Text style={[styles.headingText, { color: theme.textSecondary }]}>
            Preferencias de la Aplicación
          </Text>
        </View>

        <View
          style={[
            styles.settingsGroup,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
            Shadows.sm,
          ]}>
          {/* Ajuste de Notificaciones */}
          <View style={styles.prefRow}>
            <View style={styles.prefRowLeft}>
              <View style={[styles.prefIconBox, { backgroundColor: isDarkMode ? '#13231B' : '#E8F8F0' }]}>
                <Bell size={18} color={BrandColors.primary} />
              </View>
              <View style={styles.prefTextCol}>
                <View style={styles.prefTitleWithBadge}>
                  <Text style={[styles.prefTitle, { color: theme.text }]} numberOfLines={1}>
                    Notificaciones de Cobro
                  </Text>
                  <View
                    style={[
                      styles.prefStatusBadge,
                      {
                        backgroundColor: notificacionesCobro
                          ? (isDarkMode ? '#132E21' : '#E8F8F0')
                          : (isDarkMode ? '#222834' : '#F1F5F9'),
                      },
                    ]}>
                    <Text
                      style={[
                        styles.prefStatusText,
                        {
                          color: notificacionesCobro ? BrandColors.primary : theme.textMuted,
                        },
                      ]}>
                      {notificacionesCobro ? 'Activo' : 'Pausado'}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.prefSub, { color: theme.textSecondary }]}>
                  {notificacionesCobro
                    ? 'Alertas y recordatorios automáticos de cuotas'
                    : 'Avisos de cobro y vencimientos desactivados'}
                </Text>
              </View>
            </View>
            <View style={styles.prefSwitchContainer}>
              <Switch
                value={notificacionesCobro}
                onValueChange={handleToggleNotificaciones}
                trackColor={{ false: '#CBD5E1', true: BrandColors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          <View style={[styles.settingsDivider, { backgroundColor: theme.border }]} />

          {/* Términos y Condiciones */}
          <Pressable
            onPress={() => setTerminosModalVisible(true)}
            style={({ pressed }) => [
              styles.prefRow,
              pressed && { opacity: 0.75 },
            ]}>
            <View style={styles.prefRowLeft}>
              <View style={[styles.prefIconBox, { backgroundColor: isDarkMode ? '#162238' : '#EFF6FF' }]}>
                <FileText size={18} color="#3B82F6" />
              </View>
              <View style={styles.prefTextCol}>
                <Text style={[styles.prefTitle, { color: theme.text }]}>
                  Términos y Condiciones
                </Text>
                <Text style={[styles.prefSub, { color: theme.textSecondary }]}>
                  Reglas de microcrédito, tasas y uso legal
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={theme.textMuted} />
          </Pressable>

          <View style={[styles.settingsDivider, { backgroundColor: theme.border }]} />

          {/* Política de Privacidad */}
          <Pressable
            onPress={() => setPrivacidadModalVisible(true)}
            style={({ pressed }) => [
              styles.prefRow,
              pressed && { opacity: 0.75 },
            ]}>
            <View style={styles.prefRowLeft}>
              <View style={[styles.prefIconBox, { backgroundColor: isDarkMode ? '#221938' : '#F5F3FF' }]}>
                <ShieldCheck size={18} color="#8B5CF6" />
              </View>
              <View style={styles.prefTextCol}>
                <Text style={[styles.prefTitle, { color: theme.text }]}>
                  Política de Privacidad
                </Text>
                <Text style={[styles.prefSub, { color: theme.textSecondary }]}>
                  Protección de datos personales (Habeas Data Ley 1581)
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={theme.textMuted} />
          </Pressable>
        </View>

        {/* Botón de Cerrar Sesión */}
        <Pressable
          onPress={handleCerrarSesion}
          style={({ pressed }) => [
            styles.logoutBtn,
            {
              backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.12)' : '#FEF2F2',
              borderColor: isDarkMode ? 'rgba(239, 68, 68, 0.35)' : '#FECACA',
            },
            pressed && { opacity: 0.8, transform: [{ scale: 0.99 }] },
          ]}>
          <LogOut size={18} color="#EF4444" />
          <Text style={styles.logoutBtnText}>Cerrar Sesión</Text>
        </Pressable>

        {/* Acerca de PrestaGo */}
        <View
          style={[
            styles.aboutCard,
            {
              backgroundColor: isDarkMode ? '#121722' : '#F8FAFC',
              borderColor: theme.border,
            },
          ]}>
          <Text style={[styles.aboutTitle, { color: theme.text }]}>
            PrestaGo Mobile App v1.1.1
          </Text>
          <Text style={[styles.aboutDesc, { color: theme.textSecondary }]}>
            Desarrollado con Expo Go SDK 58 (React 19 & React Native 0.88), Expo Router, TypeScript, Asistente Financiero con Inteligencia Artificial, sincronización en vivo con Firebase Cloud Firestore y diseño responsivo Material 3.
          </Text>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Modal para Seleccionar Foto de Perfil (Cámara o Galería) */}
      <Modal
        visible={photoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPhotoModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setPhotoModalVisible(false)}
          />
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
              Shadows.lg,
            ]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  Foto de Perfil
                </Text>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                  Personaliza tu avatar de administrador
                </Text>
              </View>
              <Pressable
                onPress={() => setPhotoModalVisible(false)}
                style={[
                  styles.modalCloseBtn,
                  { backgroundColor: isDarkMode ? '#1E2636' : '#F1F5F9' },
                ]}>
                <X size={18} color={theme.text} />
              </Pressable>
            </View>

            {loadingPhoto ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={BrandColors.primary} />
                <Text style={[styles.modalLoadingText, { color: theme.textSecondary }]}>
                  Procesando imagen...
                </Text>
              </View>
            ) : (
              <View style={styles.modalOptions}>
                {/* Opción Cámara */}
                <Pressable
                  onPress={handleTomarFotoCamara}
                  style={({ pressed }) => [
                    styles.optionBtn,
                    {
                      backgroundColor: isDarkMode ? '#131A24' : '#F8FAFC',
                      borderColor: theme.border,
                      opacity: pressed ? 0.75 : 1,
                    },
                  ]}>
                  <View style={[styles.optionIconBox, { backgroundColor: 'rgba(26, 169, 101, 0.15)' }]}>
                    <Camera size={20} color={BrandColors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optionTitle, { color: theme.text }]}>
                      Tomar Foto con la Cámara
                    </Text>
                    <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>
                      Captura una foto al instante con tu dispositivo
                    </Text>
                  </View>
                </Pressable>

                {/* Opción Galería */}
                <Pressable
                  onPress={handleElegirDeGaleria}
                  style={({ pressed }) => [
                    styles.optionBtn,
                    {
                      backgroundColor: isDarkMode ? '#131A24' : '#F8FAFC',
                      borderColor: theme.border,
                      opacity: pressed ? 0.75 : 1,
                    },
                  ]}>
                  <View style={[styles.optionIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                    <ImageIcon size={20} color="#3B82F6" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optionTitle, { color: theme.text }]}>
                      Elegir de la Galería
                    </Text>
                    <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>
                      Selecciona una imagen de tu carrete o álbum
                    </Text>
                  </View>
                </Pressable>

                {/* Restaurar imagen predeterminada */}
                {admin.fotoPerfil ? (
                  <Pressable
                    onPress={handleRestaurarFoto}
                    style={({ pressed }) => [
                      styles.optionBtn,
                      {
                        backgroundColor: isDarkMode ? '#131A24' : '#F8FAFC',
                        borderColor: theme.border,
                        opacity: pressed ? 0.75 : 1,
                      },
                    ]}>
                    <View style={[styles.optionIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                      <Trash2 size={20} color="#EF4444" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.optionTitle, { color: '#EF4444' }]}>
                        Restaurar Avatar por Defecto
                      </Text>
                      <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>
                        Usa las iniciales de tu nombre
                      </Text>
                    </View>
                  </Pressable>
                ) : null}
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal para Editar Información del Administrador */}
      <AdminModalEdit
        visible={editAdminModalVisible}
        admin={admin}
        isDarkMode={isDarkMode}
        onClose={() => setEditAdminModalVisible(false)}
        onSave={async (data) => {
          await actualizarAdmin(data);
          if (Platform.OS === 'web') {
            alert('Perfil de administrador actualizado correctamente.');
          } else {
            Alert.alert('Éxito', 'Perfil de administrador actualizado correctamente.');
          }
        }}
      />

      {/* Modal: Términos y Condiciones */}
      <Modal
        visible={terminosModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTerminosModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setTerminosModalVisible(false)}
          />
          <View
            style={[
              styles.modalLegalSheet,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
              Shadows.lg,
            ]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  Términos y Condiciones
                </Text>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                  PrestaGo Mobile App v1.1.1 · Uso Profesional
                </Text>
              </View>
              <Pressable
                onPress={() => setTerminosModalVisible(false)}
                style={[
                  styles.modalCloseBtn,
                  { backgroundColor: isDarkMode ? '#1E2636' : '#F1F5F9' },
                ]}>
                <X size={18} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.legalScroll}>
              <View style={[styles.legalCard, { backgroundColor: isDarkMode ? '#121722' : '#F8FAFC', borderColor: theme.border }]}>
                <Text style={[styles.legalSectionTitle, { color: BrandColors.primary }]}>
                  1. Objeto y Alcance de PrestaGo
                </Text>
                <Text style={[styles.legalBody, { color: theme.textSecondary }]}>
                  PrestaGo es un software especializado de asistencia y registro financiero para administradores, prestamistas y gestores de microcrédito. Su finalidad es el control contable de saldos, cálculo automático de amortizaciones de capital e interés y calendarización de cobros.
                </Text>

                <Text style={[styles.legalSectionTitle, { color: BrandColors.primary, marginTop: 14 }]}>
                  2. Cumplimiento de Tasas de Usura y Normativa
                </Text>
                <Text style={[styles.legalBody, { color: theme.textSecondary }]}>
                  El administrador se compromete expresamente a fijar tasas de interés conforme a los topes máximos certificados por la Superintendencia Financiera de Colombia. PrestaGo no intermedia fondos ni presta dinero; es una herramienta tecnológica independiente para la gestión del prestamista.
                </Text>

                <Text style={[styles.legalSectionTitle, { color: BrandColors.primary, marginTop: 14 }]}>
                  3. Cobro Respetuoso y Ley 2300 de 2023
                </Text>
                <Text style={[styles.legalBody, { color: theme.textSecondary }]}>
                  El envío de mensajes de cobro o recordatorios redactados mediante el Asistente IA (WhatsApp / SMS) debe realizarse dentro de horarios comerciales reglamentarios (Ley &apos;Dejen de Fregar&apos;) y manteniendo un trato ético y respetuoso hacia el deudor.
                </Text>

                <Text style={[styles.legalSectionTitle, { color: BrandColors.primary, marginTop: 14 }]}>
                  4. Respaldo y Sincronización en la Nube
                </Text>
                <Text style={[styles.legalBody, { color: theme.textSecondary }]}>
                  Todos los registros de clientes, cuotas y abonos se sincronizan en tiempo real mediante Firebase Cloud Firestore. Cada administrador es responsable de la exactitud de los montos ingresados y de mantener la confidencialidad de sus credenciales maestras.
                </Text>
              </View>

              <Pressable
                onPress={() => setTerminosModalVisible(false)}
                style={[styles.legalConfirmBtn, Shadows.glowGreen]}>
                <LinearGradient
                  colors={[BrandColors.primary, BrandColors.primaryDark]}
                  style={styles.legalConfirmGradient}>
                  <Text style={styles.legalConfirmText}>He leído y acepto los términos</Text>
                </LinearGradient>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal: Política de Privacidad */}
      <Modal
        visible={privacidadModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPrivacidadModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setPrivacidadModalVisible(false)}
          />
          <View
            style={[
              styles.modalLegalSheet,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
              Shadows.lg,
            ]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  Política de Privacidad
                </Text>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                  Habeas Data · Ley 1581 de 2012 (Colombia)
                </Text>
              </View>
              <Pressable
                onPress={() => setPrivacidadModalVisible(false)}
                style={[
                  styles.modalCloseBtn,
                  { backgroundColor: isDarkMode ? '#1E2636' : '#F1F5F9' },
                ]}>
                <X size={18} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.legalScroll}>
              <View style={[styles.legalCard, { backgroundColor: isDarkMode ? '#121722' : '#F8FAFC', borderColor: theme.border }]}>
                <Text style={[styles.legalSectionTitle, { color: '#8B5CF6' }]}>
                  1. Responsable del Tratamiento
                </Text>
                <Text style={[styles.legalBody, { color: theme.textSecondary }]}>
                  En concordancia con la Ley 1581 de 2012 y el Decreto 1377 de 2013, los datos ingresados en PrestaGo son administrados por el usuario titular bajo estrictas políticas de confidencialidad y reserva financiera.
                </Text>

                <Text style={[styles.legalSectionTitle, { color: '#8B5CF6', marginTop: 14 }]}>
                  2. Datos Personales Recolectados
                </Text>
                <Text style={[styles.legalBody, { color: theme.textSecondary }]}>
                  PrestaGo almacena: (a) Datos del prestamista (nombre, cédula, teléfono, email, negocio); (b) Datos de clientes deudores (nombre completo, número de documento, celular/WhatsApp, ubicación geográfica y registros de amortización).
                </Text>

                <Text style={[styles.legalSectionTitle, { color: '#8B5CF6', marginTop: 14 }]}>
                  3. Finalidad del Tratamiento
                </Text>
                <Text style={[styles.legalBody, { color: theme.textSecondary }]}>
                  La información recolectada se utiliza únicamente para el control contable, cálculo de saldos pendientes, envío de recibos digitales y emisión de alertas de vencimiento autorizadas por el deudor. PrestaGo nunca comercializa ni cede bases de datos a terceros.
                </Text>

                <Text style={[styles.legalSectionTitle, { color: '#8B5CF6', marginTop: 14 }]}>
                  4. Seguridad y Cifrado en Firestore
                </Text>
                <Text style={[styles.legalBody, { color: theme.textSecondary }]}>
                  Los registros se encuentran blindados mediante reglas de seguridad de Google Cloud Firebase Firestore con autenticación por tokens encriptados. Cada administrador solo puede consultar sus propios documentos.
                </Text>

                <Text style={[styles.legalSectionTitle, { color: '#8B5CF6', marginTop: 14 }]}>
                  5. Derechos del Titular (Habeas Data)
                </Text>
                <Text style={[styles.legalBody, { color: theme.textSecondary }]}>
                  Los titulares de los datos tienen derecho a conocer, actualizar, rectificar y solicitar la eliminación de su información en cualquier momento mediante la edición de clientes o contactando al administrador.
                </Text>
              </View>

              <Pressable
                onPress={() => setPrivacidadModalVisible(false)}
                style={[styles.legalConfirmBtn, Shadows.glowGreen]}>
                <LinearGradient
                  colors={['#8B5CF6', '#6D28D9']}
                  style={styles.legalConfirmGradient}>
                  <Text style={styles.legalConfirmText}>Entendido y Conforme</Text>
                </LinearGradient>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  editAdminBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginTop: 14,
    width: '100%',
  },
  editAdminBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  profileCard: {
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarTouchable: {
    position: 'relative',
    alignSelf: 'center',
    marginBottom: 12,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLargeImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2.5,
    borderColor: BrandColors.primary,
  },
  avatarLargeText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BrandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  adminName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  adminRole: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  businessText: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 16,
  },
  infoBox: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoDivider: {
    height: 1,
  },
  sectionHeading: {
    marginBottom: 10,
  },
  headingText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsGroup: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  prefRowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 10,
  },
  prefTextCol: {
    flex: 1,
  },
  prefTitleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  prefTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  prefSub: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  prefStatusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  prefStatusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  prefSwitchContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  prefIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  dbStatusCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  dbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  dbIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(26, 169, 101, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dbTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  dbSub: {
    fontSize: 12,
    marginTop: 2,
  },
  resetToast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F8F0',
    padding: 10,
    borderRadius: BorderRadius.md,
    marginBottom: 12,
  },
  resetToastText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '700',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  resetBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: 20,
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },
  aboutCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  aboutTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  aboutDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    borderWidth: 1,
    padding: 20,
    paddingBottom: 34,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalLoading: {
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalLoadingText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
  },
  modalOptions: {
    gap: 10,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  optionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  optionDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  modalLegalSheet: {
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    borderWidth: 1,
    padding: 20,
    maxHeight: '88%',
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  legalScroll: {
    paddingBottom: 24,
  },
  legalCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  legalSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  legalBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  legalConfirmBtn: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginTop: 4,
  },
  legalConfirmGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legalConfirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
