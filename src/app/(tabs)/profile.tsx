import React, { useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import {
  Shield,
  Phone,
  CreditCard,
  Moon,
  Sun,
  CheckCircle2,
  Camera,
  Image as ImageIcon,
  Trash2,
  X,
  Edit3,
  Mail,
  LogOut,
} from 'lucide-react-native';
import { usePrestago } from '@/context/PrestagoContext';
import { BrandColors, Colors, BorderRadius, Shadows, MaxContentWidth } from '@/constants/theme';
import { HeaderBar } from '@/components/HeaderBar';
import { AdminModalEdit } from '@/components/AdminModalEdit';

export default function ProfileScreen() {
  const {
    admin,
    clientes,
    historialPagos,
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
          <View style={styles.settingsItem}>
            <View style={styles.settingsItemLeft}>
              {isDarkMode ? (
                <Moon size={20} color={BrandColors.primary} />
              ) : (
                <Sun size={20} color="#F59E0B" />
              )}
              <View>
                <Text style={[styles.settingsTitle, { color: theme.text }]}>
                  Modo Oscuro
                </Text>
                <Text style={[styles.settingsSub, { color: theme.textSecondary }]}>
                  {isDarkMode ? 'Activado (Fondo elegante)' : 'Desactivado (Fondo claro)'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#CBD5E1', true: BrandColors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
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
    padding: 14,
    marginBottom: 20,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  settingsSub: {
    fontSize: 11,
    marginTop: 2,
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
});
