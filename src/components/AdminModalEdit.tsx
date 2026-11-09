import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  User,
  CreditCard,
  Phone,
  Briefcase,
  Mail,
  Save,
} from 'lucide-react-native';
import { Administrador } from '@/types';
import { BrandColors, Colors, BorderRadius, Shadows } from '@/constants/theme';
import { normalizarCelularColombia } from './ContactPickerModal';

export interface AdminModalEditProps {
  visible: boolean;
  admin: Administrador;
  isDarkMode: boolean;
  onClose: () => void;
  onSave: (data: Partial<Administrador>) => Promise<void> | void;
}

interface AdminModalEditContentProps {
  admin: Administrador;
  isDarkMode: boolean;
  onClose: () => void;
  onSave: (data: Partial<Administrador>) => Promise<void> | void;
}

const AdminModalEditContent: React.FC<AdminModalEditContentProps> = ({
  admin,
  isDarkMode,
  onClose,
  onSave,
}) => {
  const insets = useSafeAreaInsets();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [nombres, setNombres] = useState(admin.nombres || '');
  const [negocio, setNegocio] = useState(admin.negocio || '');
  const [documento, setDocumento] = useState(admin.documento || '');
  const [celular, setCelular] = useState(admin.celular || '');
  const [email, setEmail] = useState(admin.email || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleGuardar = async () => {
    if (!nombres.trim()) {
      const msg = 'El nombre del administrador es obligatorio.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Campo Requerido', msg);
      return;
    }

    if (!documento.trim()) {
      const msg = 'El documento de identidad es obligatorio.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Campo Requerido', msg);
      return;
    }

    if (!celular.trim()) {
      const msg = 'El número de celular o WhatsApp es obligatorio.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Campo Requerido', msg);
      return;
    }

    try {
      setIsSaving(true);
      const dataActualizada: Partial<Administrador> = {
        nombres: nombres.trim(),
        negocio: negocio.trim() || 'PrestaGo Soluciones',
        documento: documento.trim(),
        celular: normalizarCelularColombia(celular) || celular.trim(),
        email: email.trim() || undefined,
      };

      await onSave(dataActualizada);
      onClose();
    } catch (err) {
      console.warn('Error al guardar datos de administrador:', err);
      Alert.alert('Error', 'No se pudieron guardar los cambios.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View
        style={[
          styles.sheetContainer,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}>
        {/* Header */}
        <View style={styles.sheetHeader}>
          <View style={styles.dragHandle} />
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                Editar Perfil de Administrador
              </Text>
              <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                Actualiza tu información personal y comercial
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={[
                styles.closeBtn,
                { backgroundColor: isDarkMode ? '#1E2636' : '#F1F5F9' },
              ]}>
              <X size={20} color={theme.text} />
            </Pressable>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* Nombres */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
              Nombre y Apellidos *
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: isDarkMode ? '#131A24' : '#F8FAFC',
                  borderColor: theme.border,
                },
              ]}>
              <User size={18} color={BrandColors.primary} />
              <TextInput
                value={nombres}
                onChangeText={setNombres}
                placeholder="Nombre del administrador"
                placeholderTextColor={theme.textMuted}
                style={[styles.input, { color: theme.text }]}
              />
            </View>
          </View>

          {/* Negocio / Empresa */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
              Nombre del Negocio o Razón Social
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: isDarkMode ? '#131A24' : '#F8FAFC',
                  borderColor: theme.border,
                },
              ]}>
              <Briefcase size={18} color={BrandColors.primary} />
              <TextInput
                value={negocio}
                onChangeText={setNegocio}
                placeholder="Ej. PrestaGo Finanzas / Inversiones JP"
                placeholderTextColor={theme.textMuted}
                style={[styles.input, { color: theme.text }]}
              />
            </View>
          </View>

          {/* Fila: Documento y Celular */}
          <View style={styles.formRow}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                Documento (C.C. / NIT) *
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: isDarkMode ? '#131A24' : '#F8FAFC',
                    borderColor: theme.border,
                  },
                ]}>
                <CreditCard size={18} color={BrandColors.primary} />
                <TextInput
                  value={documento}
                  onChangeText={setDocumento}
                  keyboardType="numeric"
                  placeholder="Número de cédula"
                  placeholderTextColor={theme.textMuted}
                  style={[styles.input, { color: theme.text }]}
                />
              </View>
            </View>

            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                Celular / WhatsApp *
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: isDarkMode ? '#131A24' : '#F8FAFC',
                    borderColor: theme.border,
                  },
                ]}>
                <Phone size={18} color={BrandColors.primary} />
                <TextInput
                  value={celular}
                  onChangeText={setCelular}
                  keyboardType="phone-pad"
                  placeholder="3XXXXXXXXX"
                  placeholderTextColor={theme.textMuted}
                  style={[styles.input, { color: theme.text }]}
                />
              </View>
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
              Correo Electrónico
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: isDarkMode ? '#131A24' : '#F8FAFC',
                  borderColor: theme.border,
                },
              ]}>
              <Mail size={18} color={BrandColors.primary} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="admin@prestago.app"
                placeholderTextColor={theme.textMuted}
                style={[styles.input, { color: theme.text }]}
              />
            </View>
          </View>

          {/* Botones de Acción */}
          <View style={styles.actionButtons}>
            <Pressable
              onPress={onClose}
              disabled={isSaving}
              style={[
                styles.cancelBtn,
                {
                  backgroundColor: isDarkMode ? '#1E2636' : '#F1F5F9',
                  borderColor: theme.border,
                },
              ]}>
              <Text style={[styles.cancelBtnText, { color: theme.text }]}>
                Cancelar
              </Text>
            </Pressable>

            <Pressable
              onPress={handleGuardar}
              disabled={isSaving}
              style={({ pressed }) => [
                styles.saveBtn,
                { opacity: pressed || isSaving ? 0.85 : 1 },
                Shadows.glowGreen,
              ]}>
              <LinearGradient
                colors={[BrandColors.primary, BrandColors.primaryDark]}
                style={styles.saveGradient}>
                <Save size={18} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>
                  {isSaving ? 'Guardando...' : 'Guardar Información'}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </View>
  );
};

export const AdminModalEdit: React.FC<AdminModalEditProps> = ({
  visible,
  admin,
  ...props
}) => {
  if (!visible || !admin) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={props.onClose}>
      <AdminModalEditContent key={admin.uid} admin={admin} {...props} />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    borderWidth: 1,
    maxHeight: '90%',
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  sheetHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
  },
  dragHandle: {
    width: 38,
    height: 4,
    backgroundColor: 'rgba(150, 150, 150, 0.4)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    height: 46,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 2,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});

