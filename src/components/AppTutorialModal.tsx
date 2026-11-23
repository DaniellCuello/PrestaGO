import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Phone,
  MessageCircle,
  Mail,
  Plus,
  Search,
  Moon,
  Mic,
  Calendar,
  TrendingUp,
  User,
  BookUser,
  Navigation,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Layers,
  Send,
} from 'lucide-react-native';
import { BrandColors, Colors, BorderRadius, Shadows } from '@/constants/theme';

export interface AppTutorialModalProps {
  visible: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

interface StepItem {
  id: number;
  title: string;
  subtitle: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  gradientColors: [string, string];
  sections: {
    badge: string;
    badgeColor: string;
    icon: any;
    name: string;
    description: string;
  }[];
  tip: string;
}

const TUTORIAL_STEPS: StepItem[] = [
  {
    id: 1,
    title: 'Pantalla de Cartera y Barra de Control',
    subtitle: 'El centro de mando para monitorear tu dinero en la calle en tiempo real.',
    icon: Layers,
    iconBg: '#ECFDF5',
    iconColor: '#1AA965',
    gradientColors: ['#1AA965', '#0E7A46'],
    sections: [
      {
        badge: 'BARRA SUPERIOR',
        badgeColor: '#10B981',
        icon: DollarSign,
        name: 'Métricas de Capital & Cartera Activa',
        description: 'Muestra en vivo la suma total de capital prestado en la calle y la cantidad de clientes activos.',
      },
      {
        badge: 'TEMA VISUAL',
        badgeColor: '#8B5CF6',
        icon: Moon,
        name: 'Alternador Modo Oscuro / Claro',
        description: 'El icono de luna/sol en la esquina superior derecha te permite cambiar la interfaz a modo noche para descanso visual.',
      },
      {
        badge: 'BÚSQUEDA RÁPIDA',
        badgeColor: '#3B82F6',
        icon: Search,
        name: 'Buscador Predictivo',
        description: 'Escribe el nombre del cliente, número de cédula o ciudad para encontrar cualquier crédito al instante.',
      },
      {
        badge: 'NUEVO CRÉDITO',
        badgeColor: '#059669',
        icon: Plus,
        name: 'Botón Flotante "+" (Nuevo Crédito)',
        description: 'El botón verde flotante abajo a la derecha abre el formulario inmediato para desembolsar un nuevo préstamo.',
      },
    ],
    tip: 'Puedes tocar la tarjeta de cualquier cliente en la lista para abrir su ficha completa con el historial y simulador de cobros.',
  },
  {
    id: 2,
    title: 'Semáforo de Moras y Estados de Cobro',
    subtitle: 'Identifica la puntualidad de cada cliente mediante colores universales.',
    icon: AlertTriangle,
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
    gradientColors: ['#F59E0B', '#D97706'],
    sections: [
      {
        badge: 'VERDE',
        badgeColor: '#10B981',
        icon: CheckCircle2,
        name: 'Al Día (Verde)',
        description: 'El cliente no tiene cuotas vencidas y su fecha de pago está vigente o dentro del plazo acordado.',
      },
      {
        badge: 'AMARILLO',
        badgeColor: '#F59E0B',
        icon: AlertTriangle,
        name: '1 Mes de Mora (Amarillo)',
        description: 'El cliente tiene una cuota vencida. Requiere un recordatorio preventivo cordial.',
      },
      {
        badge: 'NARANJA',
        badgeColor: '#F97316',
        icon: AlertTriangle,
        name: '2 Meses de Mora (Naranja)',
        description: 'Atraso considerable. Es momento de contactarlo por llamada o acordar un plan de abono.',
      },
      {
        badge: 'ROJO',
        badgeColor: '#EF4444',
        icon: AlertTriangle,
        name: '3+ Meses de Mora (Rojo)',
        description: 'Mora crítica. Cliente en alto riesgo financiero o gestión de cobro jurídica/especial.',
      },
      {
        badge: 'PÚRPURA',
        badgeColor: '#8B5CF6',
        icon: Sparkles,
        name: 'Paz y Salvo (Púrpura)',
        description: 'Saldo $0. El cliente liquidó completamente su deuda y califica para una Renovación Inmediata con un solo toque.',
      },
    ],
    tip: 'Usa las pestañas de filtro arriba de la lista ("Al Día", "1 Mes", "2 Meses", "Paz y Salvo") para enfocar tu ruta de cobranza.',
  },
  {
    id: 3,
    title: 'Ficha del Cliente y Acciones de Cobro',
    subtitle: 'Comunícate con el deudor en un toque y envía estados de cuenta oficiales.',
    icon: Phone,
    iconBg: '#DBEAFE',
    iconColor: '#2563EB',
    gradientColors: ['#2563EB', '#1D4ED8'],
    sections: [
      {
        badge: 'LLAMADA',
        badgeColor: '#10B981',
        icon: Phone,
        name: 'Botón "Llamar"',
        description: 'Abre el marcador de tu teléfono con el número del cliente listo para marcar sin tener que copiarlo.',
      },
      {
        badge: 'WHATSAPP',
        badgeColor: '#25D366',
        icon: MessageCircle,
        name: 'Botón "WhatsApp"',
        description: 'Abre el chat de WhatsApp con un mensaje predeterminado que incluye el nombre del cliente, cuota y saldo.',
      },
      {
        badge: 'ESTADO FORMAL',
        badgeColor: '#128C7E',
        icon: Send,
        name: 'Botón "Enviar Estado de Cuenta por WhatsApp"',
        description: 'Genera una carta formal con desglose completo: capital pendiente, interés, cuotas pagadas y estado de mora.',
      },
      {
        badge: 'CORREO RESEND',
        badgeColor: '#3B82F6',
        icon: Mail,
        name: 'Botón "Enviar Recordatorio por Correo"',
        description: 'Emite un correo electrónico transaccional formal con diseño corporativo al email del cliente o a tu correo.',
      },
    ],
    tip: 'Arriba a la derecha de la ficha tienes el botón del Lápiz (Editar cliente) y la Caneca Roja (Eliminar cliente).',
  },
  {
    id: 4,
    title: 'Simulador de Abonos y la "Regla de Oro"',
    subtitle: 'Aplica pagos parciales con cálculo automático de saldos y cuotas.',
    icon: DollarSign,
    iconBg: '#DCFCE7',
    iconColor: '#16A34A',
    gradientColors: ['#10B981', '#059669'],
    sections: [
      {
        badge: 'TIPO CUOTA',
        badgeColor: '#10B981',
        icon: DollarSign,
        name: 'Pago de Cuota',
        description: 'Registra el valor acordado mensual. Disminuye el interés y el capital correspondiente y avanza el contador de cuotas.',
      },
      {
        badge: 'REGLA DE ORO',
        badgeColor: '#047857',
        icon: Lightbulb,
        name: 'Abono a Capital (Regla de Oro)',
        description: 'Reduce directamente el capital principal. IMPORTANTE: La cuota mensual acordada NO se reduce; se mantiene fija para liquidar antes la deuda.',
      },
      {
        badge: 'TIPO INTERÉS',
        badgeColor: '#F59E0B',
        icon: DollarSign,
        name: 'Abono a Intereses',
        description: 'Permite al cliente ponerse al día pagando solo el interés del periodo si no dispone del capital.',
      },
      {
        badge: 'PAGO TOTAL',
        badgeColor: '#8B5CF6',
        icon: Sparkles,
        name: 'Pago Total',
        description: 'Liquida la deuda total pendiente de un solo pago y pasa al cliente automáticamente a estado Paz y Salvo.',
      },
    ],
    tip: 'Antes de guardar, el simulador te muestra en tiempo real cómo quedará el capital, el interés y el saldo total proyectado.',
  },
  {
    id: 5,
    title: 'Registro de Nuevos Préstamos en Segundos',
    subtitle: 'Modalidades financieras flexibles adaptadas al mercado de microcréditos.',
    icon: Plus,
    iconBg: '#F3E8FF',
    iconColor: '#7C3AED',
    gradientColors: ['#8B5CF6', '#6D28D9'],
    sections: [
      {
        badge: 'CONTACTOS',
        badgeColor: '#6366F1',
        icon: BookUser,
        name: 'Importar desde la Agenda de Contactos',
        description: 'Toca el icono de contactos junto al celular para importar automáticamente el nombre y teléfono de tu agenda.',
      },
      {
        badge: 'MAPA GPS',
        badgeColor: '#EC4899',
        icon: Navigation,
        name: 'Ubicación y Mapa GPS',
        description: 'Buscador de municipios de Colombia y mapa interactivo para colocar un pin exacto en la dirección del deudor.',
      },
      {
        badge: 'MODALIDAD',
        badgeColor: '#10B981',
        icon: Layers,
        name: 'Amortizado vs Solo Intereses',
        description: 'Elige si el cliente paga capital e interés en cada cuota, o si paga solo el interés mensual y devuelve el capital al final.',
      },
      {
        badge: 'PLAZOS',
        badgeColor: '#F59E0B',
        icon: Calendar,
        name: 'Plazo Fijo vs Mes a Mes (999)',
        description: 'Define un plazo cerrado (ej. 3, 6, 12 meses) o plazo indefinido "Mes a Mes" para créditos continuos.',
      },
    ],
    tip: 'Si traes clientes antiguos de otro sistema o cuaderno, puedes activar el interruptor "Préstamo Migrado" para registrar saldos anteriores.',
  },
  {
    id: 6,
    title: 'Asistente IA con Voz, Calendario y Analítica',
    subtitle: 'Herramientas inteligentes para maximizar el cobro y la rentabilidad.',
    icon: Sparkles,
    iconBg: '#FEF2F2',
    iconColor: '#DC2626',
    gradientColors: ['#EF4444', '#B91C1C'],
    sections: [
      {
        badge: 'AUDIO IA',
        badgeColor: '#EF4444',
        icon: Mic,
        name: 'Asistente IA con Dictado por Voz',
        description: 'En la pestaña Asistente, mantén presionado o pulsa el botón del micrófono para preguntarle a la IA qué clientes vencen hoy o quién está en mora.',
      },
      {
        badge: 'CALENDARIO',
        badgeColor: '#3B82F6',
        icon: Calendar,
        name: 'Calendario de Vencimientos',
        description: 'Visualiza en un calendario mensual qué días exactos debes salir a cobrar y cuánto dinero recaudarás.',
      },
      {
        badge: 'ANALÍTICA',
        badgeColor: '#10B981',
        icon: TrendingUp,
        name: 'Analítica Financiera & Calculadora',
        description: 'Revisa tu ganancia neta en intereses, efectividad de recaudo y usa la Calculadora Rápida para cotizar préstamos en segundos.',
      },
      {
        badge: 'PERFIL & RESEND',
        badgeColor: '#8B5CF6',
        icon: User,
        name: 'Perfil de Administrador',
        description: 'Configura tu nombre de negocio, foto de perfil, servicio de correos Resend y vuelve a abrir este tutorial cuando lo desees.',
      },
    ],
    tip: '¡Ya estás listo para operar tu cartera con total seguridad y control financiero inteligente!',
  },
];

export const AppTutorialModal: React.FC<AppTutorialModalProps> = ({
  visible,
  onClose,
  isDarkMode,
}) => {
  const insets = useSafeAreaInsets();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const step = TUTORIAL_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDarkMode ? '#0B0F17' : '#F8FAFC',
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}>
        {/* Barra Superior con Progreso y Saltar */}
        <View style={styles.topBar}>
          <View style={styles.topLeft}>
            <Image
              source={require('../../assets/images/PrestaGo.png')}
              style={styles.logoMini}
              contentFit="contain"
            />
            <View>
              <Text style={[styles.topAppTitle, { color: theme.text }]}>
                Presta<Text style={{ color: BrandColors.primary }}>Go</Text> Guía
              </Text>
              <Text style={[styles.stepCounterText, { color: theme.textSecondary }]}>
                Paso {currentStepIndex + 1} de {TUTORIAL_STEPS.length}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={handleSkip}
            hitSlop={10}
            style={[
              styles.skipBtn,
              { backgroundColor: isDarkMode ? '#1E2636' : '#F1F5F9' },
            ]}>
            <Text style={[styles.skipBtnText, { color: theme.textSecondary }]}>
              Omitir
            </Text>
            <X size={14} color={theme.textSecondary} />
          </Pressable>
        </View>

        {/* Barra de Progreso Continua */}
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: isDarkMode ? '#1E2638' : '#E2E8F0' },
          ]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((currentStepIndex + 1) / TUTORIAL_STEPS.length) * 100}%`,
                backgroundColor: step.gradientColors[0],
              },
            ]}
          />
        </View>

        {/* Contenido Desplazable del Paso Actual */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* Tarjeta Hero del Paso */}
          <LinearGradient
            colors={step.gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.heroCard, Shadows.md]}>
            <View style={styles.heroHeaderRow}>
              <View style={[styles.heroIconBox, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <step.icon size={26} color="#FFFFFF" />
              </View>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>
                  MÓDULO {step.id} DE {TUTORIAL_STEPS.length}
                </Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>{step.title}</Text>
            <Text style={styles.heroSubtitle}>{step.subtitle}</Text>
          </LinearGradient>

          {/* Listado de Funciones y Botones Explicados */}
          <View style={styles.sectionsContainer}>
            <Text style={[styles.sectionsHeader, { color: theme.text }]}>
              Botones y Funciones Clave:
            </Text>

            {step.sections.map((sec, idx) => {
              const SecIcon = sec.icon;
              return (
                <View
                  key={idx}
                  style={[
                    styles.sectionItemCard,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                    },
                    Shadows.sm,
                  ]}>
                  <View style={styles.sectionItemTop}>
                    <View
                      style={[
                        styles.sectionIconBox,
                        { backgroundColor: `${sec.badgeColor}18` },
                      ]}>
                      <SecIcon size={18} color={sec.badgeColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.badgeLine}>
                        <View
                          style={[
                            styles.sectionBadge,
                            { backgroundColor: `${sec.badgeColor}20` },
                          ]}>
                          <Text
                            style={[
                              styles.sectionBadgeText,
                              { color: sec.badgeColor },
                            ]}>
                            {sec.badge}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.sectionName, { color: theme.text }]}>
                        {sec.name}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.sectionDescription,
                      { color: theme.textSecondary },
                    ]}>
                    {sec.description}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Caja de Consejo Práctico */}
          <View
            style={[
              styles.tipBox,
              {
                backgroundColor: isDarkMode ? '#13231B' : '#ECFDF5',
                borderColor: BrandColors.primary,
              },
            ]}>
            <View style={styles.tipHeader}>
              <Lightbulb size={16} color={BrandColors.primary} />
              <Text style={[styles.tipTitle, { color: BrandColors.primary }]}>
                Consejo PrestaGo
              </Text>
            </View>
            <Text style={[styles.tipText, { color: theme.text }]}>
              {step.tip}
            </Text>
          </View>
        </ScrollView>

        {/* Barra de Navegación Inferior (Anterior / Siguiente) */}
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: theme.card,
              borderTopColor: theme.border,
            },
          ]}>
          <View style={styles.bottomBarInner}>
            {!isFirstStep ? (
              <Pressable
                onPress={handlePrev}
                style={[
                  styles.prevBtn,
                  {
                    backgroundColor: isDarkMode ? '#1E2636' : '#F1F5F9',
                    borderColor: theme.border,
                  },
                ]}>
                <ChevronLeft size={18} color={theme.text} />
                <Text style={[styles.prevBtnText, { color: theme.text }]}>
                  Anterior
                </Text>
              </Pressable>
            ) : (
              <View style={{ width: 85 }} />
            )}

            {/* Indicador de Bolitas (Dots) */}
            <View style={styles.dotsRow}>
              {TUTORIAL_STEPS.map((s, i) => (
                <View
                  key={s.id}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        i === currentStepIndex
                          ? step.gradientColors[0]
                          : isDarkMode
                          ? '#1E2638'
                          : '#CBD5E1',
                      width: i === currentStepIndex ? 20 : 6,
                    },
                  ]}
                />
              ))}
            </View>

            {/* Botón Siguiente / Comenzar */}
            <Pressable
              onPress={handleNext}
              style={[styles.nextBtn, Shadows.glowGreen]}>
              <LinearGradient
                colors={step.gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.nextGradient}>
                <Text style={styles.nextBtnText}>
                  {isLastStep ? '¡Comenzar!' : 'Siguiente'}
                </Text>
                {isLastStep ? (
                  <CheckCircle2 size={16} color="#FFFFFF" />
                ) : (
                  <ChevronRight size={16} color="#FFFFFF" />
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoMini: {
    width: 34,
    height: 34,
    borderRadius: 8,
  },
  topAppTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  stepCounterText: {
    fontSize: 11,
    marginTop: 1,
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  skipBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressTrack: {
    height: 4,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  heroCard: {
    borderRadius: BorderRadius['2xl'],
    padding: 20,
    marginBottom: 20,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  sectionsContainer: {
    marginBottom: 16,
  },
  sectionsHeader: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  sectionItemCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  sectionItemTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  sectionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLine: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  sectionBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  sectionBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionName: {
    fontSize: 14,
    fontWeight: '700',
  },
  sectionDescription: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  tipBox: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: 14,
    marginTop: 6,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  tipText: {
    fontSize: 12,
    lineHeight: 18,
  },
  bottomBar: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bottomBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prevBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  prevBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  nextBtn: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  nextGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
