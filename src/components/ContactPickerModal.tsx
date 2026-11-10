import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Search,
  Phone,
  ShieldAlert,
  Check,
  Users,
} from 'lucide-react-native';
import * as Contacts from 'expo-contacts';
import { BrandColors, Colors, BorderRadius, Shadows } from '@/constants/theme';

export interface ContactoSeleccionado {
  id: string;
  nombre: string;
  celular: string;
}

interface ContactPickerModalProps {
  visible: boolean;
  isDarkMode: boolean;
  onClose: () => void;
  onSelectContact: (contacto: ContactoSeleccionado) => void;
}

/**
 * Normaliza un número de celular colombiano a 10 dígitos (3XXXXXXXXX)
 */
export function normalizarCelularColombia(rawPhone: string): string {
  if (!rawPhone) return '';
  const digits = rawPhone.replace(/\D/g, '');

  // Si tiene código de país 57 adelante (ej. 573001234567) -> tomar últimos 10
  if (digits.length === 12 && digits.startsWith('57')) {
    return digits.slice(2);
  }
  // Si empieza con 03 (ej. 033001234567) -> tomar últimos 10
  if (digits.length === 12 && digits.startsWith('03')) {
    return digits.slice(2);
  }
  // Si tiene más de 10 dígitos y termina en 10 dígitos válidos
  if (digits.length > 10) {
    return digits.slice(-10);
  }
  return digits;
}

const ContactPickerContent: React.FC<Omit<ContactPickerModalProps, 'visible'>> = ({
  isDarkMode,
  onClose,
  onSelectContact,
}) => {
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState<boolean>(true);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  const [contactsList, setContactsList] = useState<ContactoSeleccionado[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    async function fetchContacts() {
      if (Platform.OS === 'web') {
        // En entorno web simulamos contactos de prueba colombianos con un tick asíncrono
        await new Promise((resolve) => setTimeout(resolve, 50));
        if (!isMounted) return;
        setContactsList([
          { id: 'web-1', nombre: 'Carlos Andrés Montoya', celular: '3124567890' },
          { id: 'web-2', nombre: 'Mariana Restrepo Gómez', celular: '3007654321' },
          { id: 'web-3', nombre: 'Julián David Cárdenas', celular: '3159876543' },
          { id: 'web-4', nombre: 'Valentina Osorio Ruiz', celular: '3201234567' },
          { id: 'web-5', nombre: 'Sebastián Morales Duque', celular: '3118901234' },
          { id: 'web-6', nombre: 'Camila Pineda Toro', celular: '3045558899' },
        ]);
        setLoading(false);
        return;
      }

      try {
        const { status } = await Contacts.requestPermissionsAsync();
        if (!isMounted) return;

        if (status !== 'granted') {
          setPermissionDenied(true);
          setLoading(false);
          return;
        }

        const res = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
          pageSize: 200,
        });
        const rawData = res.data || [];

        const mapped: ContactoSeleccionado[] = [];
        for (const item of rawData) {
          const rawItem = item as any;
          const name =
            rawItem.name ||
            rawItem.fullName ||
            `${rawItem.firstName || rawItem.givenName || ''} ${rawItem.lastName || rawItem.familyName || ''}`.trim();

          const phonesList = rawItem.phoneNumbers || rawItem.phones || [];
          if (phonesList.length > 0 && name) {
            const rawNum = phonesList[0].number || '';
            const cleanNum = normalizarCelularColombia(rawNum);
            if (cleanNum) {
              mapped.push({
                id: rawItem.id || String(Math.random()),
                nombre: name,
                celular: cleanNum,
              });
            }
          }
        }

        mapped.sort((a, b) => a.nombre.localeCompare(b.nombre));
        if (isMounted) {
          setContactsList(mapped);
        }
      } catch (error) {
        console.warn('Error al cargar contactos:', error);
        if (isMounted) {
          setPermissionDenied(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchContacts();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenSettings = () => {
    if (Platform.OS === 'web') {
      alert('Por favor habilita los permisos de contactos en tu navegador.');
    } else {
      Linking.openSettings().catch(() => {
        Alert.alert(
          'Permisos requeridos',
          'Abre la app de Ajustes de tu dispositivo y otorga permisos de Contactos a PrestaGo.'
        );
      });
    }
  };

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contactsList;
    const q = searchQuery.toLowerCase().trim();
    return contactsList.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.celular.includes(q)
    );
  }, [contactsList, searchQuery]);

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
              <View style={styles.headerTitleGroup}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>
                  Contactos del Dispositivo
                </Text>
                <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                  Importa el WhatsApp y nombre de tu cliente
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

            {/* Barra de Búsqueda */}
            <View
              style={[
                styles.searchBar,
                {
                  backgroundColor: isDarkMode ? '#141A24' : '#F8FAFC',
                  borderColor: theme.border,
                },
              ]}>
              <Search size={18} color={theme.textMuted} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Buscar por nombre o celular..."
                placeholderTextColor={theme.textMuted}
                style={[styles.searchInput, { color: theme.text }]}
                clearButtonMode="while-editing"
              />
            </View>
          </View>

          {/* Contenido Principal */}
          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={BrandColors.primary} />
              <Text style={[styles.statusText, { color: theme.textSecondary }]}>
                Leyendo libreta de contactos...
              </Text>
            </View>
          ) : permissionDenied ? (
            <View style={styles.permissionBox}>
              <View style={styles.shieldCircle}>
                <ShieldAlert size={36} color="#F59E0B" />
              </View>
              <Text style={[styles.permissionTitle, { color: theme.text }]}>
                Permiso de Contactos Requerido
              </Text>
              <Text style={[styles.permissionDesc, { color: theme.textSecondary }]}>
                Para importar automáticamente el nombre y número de tu cliente, PrestaGo necesita acceso a los contactos del dispositivo.
              </Text>
              <Pressable
                onPress={handleOpenSettings}
                style={[styles.permissionBtn, Shadows.glowGreen]}>
                <LinearGradient
                  colors={[BrandColors.primary, BrandColors.primaryDark]}
                  style={styles.permissionGradient}>
                  <Text style={styles.permissionBtnText}>Abrir Ajustes y Permitir</Text>
                </LinearGradient>
              </Pressable>
            </View>
          ) : filteredContacts.length === 0 ? (
            <View style={styles.centered}>
              <Users size={36} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {searchQuery
                  ? `No se encontraron contactos con "${searchQuery}"`
                  : 'No se encontraron contactos con número telefónico registrado.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredContacts}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onSelectContact(item);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.contactItem,
                    {
                      backgroundColor: pressed
                        ? isDarkMode
                          ? '#1A2230'
                          : '#F1F5F9'
                        : isDarkMode
                        ? '#121722'
                        : '#FFFFFF',
                      borderColor: theme.border,
                    },
                  ]}>
                  <LinearGradient
                    colors={['#1AA965', '#0E7A46']}
                    style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {item.nombre.slice(0, 2).toUpperCase()}
                    </Text>
                  </LinearGradient>

                  <View style={styles.contactInfo}>
                    <Text
                      style={[styles.contactName, { color: theme.text }]}
                      numberOfLines={1}>
                      {item.nombre}
                    </Text>
                    <View style={styles.phoneBadgeRow}>
                      <Phone size={13} color={BrandColors.primary} />
                      <Text
                        style={[styles.contactPhone, { color: BrandColors.primary }]}>
                        {item.celular}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.importIconCircle}>
                    <Check size={16} color="#FFFFFF" />
                  </View>
                </Pressable>
              )}
            />
          )}
        </View>
      </View>
  );
};

export const ContactPickerModal: React.FC<ContactPickerModalProps> = ({
  visible,
  ...props
}) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={props.onClose}>
      <ContactPickerContent {...props} />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    borderWidth: 1,
    maxHeight: '85%',
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  sheetHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.15)',
  },
  dragHandle: {
    width: 38,
    height: 4,
    backgroundColor: 'rgba(150,150,150,0.4)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitleGroup: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  listContent: {
    padding: 16,
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '700',
  },
  phoneBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  contactPhone: {
    fontSize: 13,
    fontWeight: '700',
  },
  importIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BrandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  permissionBox: {
    padding: 30,
    alignItems: 'center',
    textAlign: 'center',
  },
  shieldCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  permissionBtn: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 280,
  },
  permissionGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

