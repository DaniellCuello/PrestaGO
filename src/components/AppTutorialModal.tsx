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
  Moon,
  Mic,
  Calendar,
  TrendingUp,
  User,
  BookUser,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Layers,
  Calculator,
  PieChart,
  Bot,
  Camera,
  Edit3,
  LogOut,
  Bell,
  Clock,
} from 'lucide-react-native';
import { BrandColors, Colors, BorderRadius, Shadows } from '@/constants/theme';

export interface AppTutorialModalProps {
  visible: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

interface StepItem {
  id: number;
  tabName: string;
  tabIcon: any;
  title: string;
  subtitle: string;
  heroIcon: any;
  gradientColors: [string, string];
  badgeTag: string;
  sections: {
    pointer: string; // "👉 Seña 1", "👉 Paso 1", etc.
    badgeColor: string;
    icon: any;
    name: string;
    description: string;
  }[];
  formulaOrRule?: {
    title: string;
    description: string;
  };
  tip: string;
}

const TUTORIAL_TABS: StepItem[] = [
  // 1. APARTADO: CLIENTES
  {
    id: 1,
    tabName: 'Clientes',
    tabIcon: UsersIcon,
    title: 'Apartado 1: Cartera y Clientes',
    subtitle: 'Aprende a registrar clientes nuevos y antiguos, entender el semáforo y cobrar.',
    heroIcon: UsersIcon,
    gradientColors: ['#1AA965', '#0D6839'],
    badgeTag: 'PESTAÑA 1 DE 5',
    sections: [
      {
        pointer: '👉 Seña 1',
        badgeColor: '#10B981',
        icon: Plus,
        name: '¿Cómo registrar un Cliente NUEVO?',
        description: 'Toca el botón verde flotante "+" (Nuevo Crédito) abajo a la derecha. Escribe su nombre, documento, celular, el monto que le vas a prestar, la tasa de interés y el plazo en meses. ¡La app calcula su cuota mensual de inmediato!',
      },
      {
        pointer: '👉 Seña 2',
        badgeColor: '#8B5CF6',
        icon: Layers,
        name: '¿Cómo registrar un Cliente ANTIGUO o MIGRADO?',
        description: 'Si traes un cliente que ya te venía pagando en cuaderno o en otra app, dentro del formulario activa el interruptor "¿Es un préstamo anterior/migrado?". La app te abrirá casillas para poner cuánto capital aún te debe, cuánto interés le falta y cuántas cuotas ya te pagó.',
      },
      {
        pointer: '👉 Seña 3',
        badgeColor: '#F59E0B',
        icon: AlertTriangle,
        name: 'El Semáforo de Colores en la Lista',
        description: 'En cada cliente verás una bolita de color: 🟢 Verde si está Al Día con su pago, 🟡 Amarillo si debe 1 mes, 🟠 Naranja si debe 2 meses, 🔴 Rojo si tiene 3+ meses de mora crítica, y 🟣 Púrpura si ya quedó a Paz y Salvo con saldo $0.',
      },
      {
        pointer: '👉 Seña 4',
        badgeColor: '#2563EB',
        icon: Phone,
        name: 'Ficha del Cliente y Acciones de Cobro',
        description: 'Toca sobre cualquier cliente para abrir su ficha completa. Verás el botón verde "Llamar" para marcarle directo, el botón "WhatsApp" con mensaje de cobro pre-redactado, "Enviar Estado de Cuenta" con desglose formal y "Enviar Recordatorio por Correo".',
      },
      {
        pointer: '👉 Seña 5',
        badgeColor: '#EC4899',
        icon: BookUser,
        name: 'Importar Contactos y Ubicación GPS',
        description: 'Al registrar o editar, toca el icono de libreta junto al teléfono para autocompletar el contacto desde tu agenda, o toca "Abrir Mapa GPS" para marcar con una chincheta la casa o negocio del cliente.',
      },
    ],
    formulaOrRule: {
      title: '⚡ Regla de Oro en Abonos a Capital',
      description: 'Cuando un cliente te hace un Abono a Capital, se le descuenta directamente a la deuda, PERO su cuota mensual acordada NO disminuye. Permanece fija para que termine de pagar su crédito mucho más rápido.',
    },
    tip: 'Puedes usar la barra de búsqueda arriba para buscar a cualquier cliente escribiendo su nombre, cédula o municipio.',
  },

  // 2. APARTADO: CALENDARIO & CALCULADORA
  {
    id: 2,
    tabName: 'Calendario',
    tabIcon: Calendar,
    title: 'Apartado 2: Calendario y Calculadora',
    subtitle: 'Monitorea las fechas de cobro mes a mes y usa la calculadora integrada.',
    heroIcon: Calendar,
    gradientColors: ['#3B82F6', '#1D4ED8'],
    badgeTag: 'PESTAÑA 2 DE 5',
    sections: [
      {
        pointer: '👉 Seña 1',
        badgeColor: '#3B82F6',
        icon: Calendar,
        name: 'El Día del Préstamo se repite cada Mes',
        description: 'Si le prestas dinero a alguien un día 15, esa persona aparecerá automáticamente agendada el día 15 de cada mes mientras mantenga saldo pendiente. ¡Nunca olvidarás a quién cobrarle!',
      },
      {
        pointer: '👉 Seña 2',
        badgeColor: '#10B981',
        icon: Clock,
        name: 'Puntos de Colores en los Días del Calendario',
        description: 'Cada número del calendario que tenga una bolita de color indica que hay un cobro ese día. Toca cualquier día con bolitas para ver abajo la lista de personas que deben pagar en esa fecha y el dinero total que debes recaudar.',
      },
      {
        pointer: '👉 Seña 3',
        badgeColor: '#F59E0B',
        icon: CheckCircle2,
        name: 'Botón "Registrar Cobro" en el Día',
        description: 'Junto a cada cliente que vence en el día verás el botón verde "Registrar Cobro". Tócalo para registrar el abono del día sin salirte de la agenda.',
      },
      {
        pointer: '👉 Seña 4',
        badgeColor: '#8B5CF6',
        icon: Calculator,
        name: '¿Dónde está la Calculadora Rápida?',
        description: 'Desliza hacia abajo en esta misma pantalla de Calendario: justo debajo de la lista de cobros encontrarás la "Calculadora Rápida de Crédito" integrada.',
      },
      {
        pointer: '👉 Seña 5',
        badgeColor: '#10B981',
        icon: DollarSign,
        name: '¿Cómo usar la Calculadora con señas?',
        description: '1) Ingresa el Monto en la primera casilla (ej: $1.000.000). 2) Pon la Tasa de Interés en la segunda (ej: 10%). 3) Elige los Meses de Plazo. ¡Al instante verás la cuota mensual exacta y cuánto ganarás en total de intereses antes de prestar!',
      },
    ],
    tip: 'Si un cliente ya pagó la totalidad de su deuda (Paz y Salvo), desaparece automáticamente del calendario para no saturar tu agenda.',
  },

  // 3. APARTADO: ANÁLISIS
  {
    id: 3,
    tabName: 'Análisis',
    tabIcon: TrendingUp,
    title: 'Apartado 3: Análisis y De Dónde Salen los Números',
    subtitle: 'Entiende con total claridad cada cifra, porcentaje y métrica de tu negocio.',
    heroIcon: TrendingUp,
    gradientColors: ['#10B981', '#065F46'],
    badgeTag: 'PESTAÑA 3 DE 5',
    sections: [
      {
        pointer: '👉 Número 1',
        badgeColor: '#10B981',
        icon: DollarSign,
        name: 'Capital en la Calle (Tarjeta Verde)',
        description: '¿De dónde sale? Es la suma exacta de todo el dinero prestado neto que tus clientes aún tienen en sus manos y todavía no te han devuelto. Representa tu capital activo expuesto.',
      },
      {
        pointer: '👉 Número 2',
        badgeColor: '#3B82F6',
        icon: TrendingUp,
        name: 'Dinero Recuperado (Tarjeta Azul)',
        description: '¿De dónde sale? Es la suma total acumulada de todos los pagos y abonos que tus clientes han realizado en la historia de la app (abonos a capital + cobros de cuotas ya recibidas).',
      },
      {
        pointer: '👉 Número 3',
        badgeColor: '#F59E0B',
        icon: DollarSign,
        name: 'Ganancia de Intereses (Tarjeta Amarilla)',
        description: '¿De dónde sale? Es tu ganancia neta o utilidad real. Muestra exclusivamente el dinero que has recibido por concepto de intereses cobrados a tus deudores.',
      },
      {
        pointer: '👉 Número 4',
        badgeColor: '#8B5CF6',
        icon: PieChart,
        name: 'Semáforo de Salud de Cartera & Efectividad',
        description: 'La barra de colores te muestra qué porcentaje de tu dinero está seguro y pagando a tiempo (Verde) contra qué porcentaje está atrasado en mora (Amarillo, Naranja o Rojo).',
      },
      {
        pointer: '👉 Número 5',
        badgeColor: '#EC4899',
        icon: Layers,
        name: 'Gráfico de Proyección Mensual',
        description: 'Curva visual que te muestra en qué meses recuperarás la totalidad de tu cartera según los plazos pactados con cada deudor.',
      },
    ],
    tip: 'Todas las métricas se actualizan de forma automática e inmediata cada vez que registras un nuevo préstamo o aplicas un abono.',
  },

  // 4. APARTADO: ASISTENTE IA (EXPLICADO COMO A UN BEBÉ)
  {
    id: 4,
    tabName: 'Asistente IA',
    tabIcon: Bot,
    title: 'Apartado 4: Asistente IA Paso a Paso',
    subtitle: 'Explicado súper fácil, con señas claras para que cualquier persona lo domine.',
    heroIcon: Bot,
    gradientColors: ['#EF4444', '#991B1B'],
    badgeTag: 'PESTAÑA 4 DE 5',
    sections: [
      {
        pointer: '👉 Paso 1',
        badgeColor: '#EF4444',
        icon: Bot,
        name: 'Toca el icono del Robot abajo (Asistente)',
        description: 'En la barra inferior de la app, toca la cuarta pestaña con la carita de robot. Entrarás al chat inteligente de tu negocio.',
      },
      {
        pointer: '👉 Paso 2',
        badgeColor: '#3B82F6',
        icon: Sparkles,
        name: 'Toca las Burbujas Rápidas (Si no quieres escribir)',
        description: 'Arriba del chat verás burbujitas de texto. Con solo tocar una con tu dedo (ejemplo: "¿Quiénes tienen que pagar hoy?" o "¿Cuál es mi cliente más moroso?"), la IA empezará a responderte sin que tengas que teclear nada.',
      },
      {
        pointer: '👉 Paso 3',
        badgeColor: '#10B981',
        icon: Mic,
        name: 'Habla por el Micrófono con tu propia voz',
        description: 'Mira abajo a la derecha: verás un botón con un Micrófono verde. Tócalo una vez, la barra se pondrá en modo grabación. Habla claro a tu celular (ejemplo: "Dime cuánto dinero tengo en la calle") y presiona el botón Enviar.',
      },
      {
        pointer: '👉 Paso 4',
        badgeColor: '#F59E0B',
        icon: Lightbulb,
        name: 'La IA lee tus datos y te da la respuesta exacta',
        description: 'La IA no inventa nada: revisa tus clientes reales en vivo y te dice nombres con apellidos, teléfonos, cuántos días de atraso llevan y cuánto deben abonar hoy.',
      },
      {
        pointer: '👉 Paso 5',
        badgeColor: '#25D366',
        icon: MessageCircle,
        name: 'Mensajes listos para WhatsApp con un solo toque',
        description: 'Cuando la IA analiza a un cliente, te redacta un mensaje formal de cobro y te pone un botón verde "Compartir en WhatsApp". ¡Lo tocas y se abre WhatsApp con el mensaje listo para mandárselo al deudor!',
      },
    ],
    tip: 'Puedes escuchar tus propias notas de voz dictadas tocando el botón de reproducir (Play) que queda guardado en la burbuja del chat.',
  },

  // 5. APARTADO: PERFIL Y CONFIGURACIÓN
  {
    id: 5,
    tabName: 'Perfil',
    tabIcon: User,
    title: 'Apartado 5: Perfil y Configuración',
    subtitle: 'Conoce todo lo que aparece en tu perfil y cómo modificarlo con total libertad.',
    heroIcon: User,
    gradientColors: ['#8B5CF6', '#5B21B6'],
    badgeTag: 'PESTAÑA 5 DE 5',
    sections: [
      {
        pointer: '👉 Seña 1',
        badgeColor: '#8B5CF6',
        icon: Camera,
        name: 'Tu Foto de Perfil (Avatar)',
        description: 'En el círculo con tus iniciales o foto, toca el botoncito de la cámara. Se abrirá una ventana para que te tomes una foto en vivo con la cámara de tu celular o elijas una foto guardada en tu galería.',
      },
      {
        pointer: '👉 Seña 2',
        badgeColor: '#10B981',
        icon: Edit3,
        name: 'Botón "Editar Datos de Administrador"',
        description: 'Toca este botón para cambiar tu nombre, tu número de celular, tu cédula y el Nombre de tu Negocio de Préstamos (este nombre es el que verán tus clientes en los extractos y correos).',
      },
      {
        pointer: '👉 Seña 3',
        badgeColor: '#3B82F6',
        icon: Moon,
        name: 'Modo Oscuro / Modo Claro',
        description: 'El interruptor de Modo Oscuro te permite cambiar los colores de toda la aplicación a tonos oscuros elegantes o tonos claros según tu gusto.',
      },
      {
        pointer: '👉 Seña 4',
        badgeColor: '#F59E0B',
        icon: Bell,
        name: 'Notificaciones de Cobro Diarias',
        description: 'Enciende o apaga las alertas recordatorias de los cobros matutinos para estar siempre al día con los vencimientos.',
      },
      {
        pointer: '👉 Seña 5',
        badgeColor: '#2563EB',
        icon: Mail,
        name: 'Servicio de Correos Electrónicos (Resend)',
        description: 'Aquí puedes configurar tu clave gratuita de Resend, enviar un correo de prueba a tu bandeja de entrada o pedir el "Resumen de Cobros de Hoy" en formato ejecutivo.',
      },
      {
        pointer: '👉 Seña 6',
        badgeColor: '#6366F1',
        icon: Sparkles,
        name: 'Botón "Guía y Tutorial de PrestaGo"',
        description: 'En la sección Ayuda encontrarás este botón. Tócalo cada vez que quieras repasar estas explicaciones y señas de la app.',
      },
      {
        pointer: '👉 Seña 7',
        badgeColor: '#EF4444',
        icon: LogOut,
        name: 'Botón Rojo "Cerrar Sesión"',
        description: 'Ubicado al final de la pantalla. Cierra tu sesión de forma segura para proteger la información confidencial de tu negocio si prestas el teléfono.',
      },
    ],
    tip: 'Recuerda pulsar "Guardar Cambios" cuando edites tus datos en el modal de administrador para sincronizarlos con la nube.',
  },
];

// Helper component for Users icon
function UsersIcon(props: any) {
  return <User {...props} />;
}

export const AppTutorialModal: React.FC<AppTutorialModalProps> = ({
  visible,
  onClose,
  isDarkMode,
}) => {
  const insets = useSafeAreaInsets();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const step = TUTORIAL_TABS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TUTORIAL_TABS.length - 1;

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

  const handleSelectTab = (index: number) => {
    setCurrentStepIndex(index);
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
        {/* Barra Superior con Logo, Contador y Botón Omitir */}
        <View style={styles.topBar}>
          <View style={styles.topLeft}>
            <Image
              source={require('../../assets/images/PrestaGo.png')}
              style={styles.logoMini}
              contentFit="contain"
            />
            <View>
              <Text style={[styles.topAppTitle, { color: theme.text }]}>
                Presta<Text style={{ color: BrandColors.primary }}>Go</Text> · Guía Completa
              </Text>
              <Text style={[styles.stepCounterText, { color: theme.textSecondary }]}>
                Apartado {currentStepIndex + 1} de {TUTORIAL_TABS.length} · {step.tabName}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={onClose}
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

        {/* Pestañas de Acceso Rápido a los 5 Apartados */}
        <View style={styles.tabsScrollWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScrollContent}>
            {TUTORIAL_TABS.map((t, idx) => {
              const TabIcon = t.tabIcon;
              const isSelected = idx === currentStepIndex;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => handleSelectTab(idx)}
                  style={[
                    styles.tabPill,
                    {
                      backgroundColor: isSelected
                        ? t.gradientColors[0]
                        : isDarkMode
                        ? '#141C2B'
                        : '#FFFFFF',
                      borderColor: isSelected
                        ? t.gradientColors[0]
                        : theme.border,
                    },
                    isSelected && Shadows.sm,
                  ]}>
                  <TabIcon
                    size={14}
                    color={isSelected ? '#FFFFFF' : theme.textSecondary}
                  />
                  <Text
                    style={[
                      styles.tabPillText,
                      {
                        color: isSelected ? '#FFFFFF' : theme.text,
                        fontWeight: isSelected ? '800' : '600',
                      },
                    ]}>
                    {t.tabName}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
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
                width: `${((currentStepIndex + 1) / TUTORIAL_TABS.length) * 100}%`,
                backgroundColor: step.gradientColors[0],
              },
            ]}
          />
        </View>

        {/* Contenido Desplazable del Apartado Actual */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* Tarjeta Hero del Apartado */}
          <LinearGradient
            colors={step.gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.heroCard, Shadows.md]}>
            <View style={styles.heroHeaderRow}>
              <View style={[styles.heroIconBox, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <step.heroIcon size={26} color="#FFFFFF" />
              </View>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>{step.badgeTag}</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>{step.title}</Text>
            <Text style={styles.heroSubtitle}>{step.subtitle}</Text>
          </LinearGradient>

          {/* Listado de Funciones, Señas y Botones Explicados */}
          <View style={styles.sectionsContainer}>
            <Text style={[styles.sectionsHeader, { color: theme.text }]}>
              Instrucciones y Señas Paso a Paso:
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
                  {/* Encabezado con Seña destacada */}
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
                            { backgroundColor: `${sec.badgeColor}22` },
                          ]}>
                          <Text
                            style={[
                              styles.sectionBadgeText,
                              { color: sec.badgeColor },
                            ]}>
                            {sec.pointer}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.sectionName, { color: theme.text }]}>
                        {sec.name}
                      </Text>
                    </View>
                  </View>

                  {/* Explicación didáctica */}
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

          {/* Caja Especial de Regla Financiera si aplica */}
          {step.formulaOrRule && (
            <View
              style={[
                styles.ruleBox,
                {
                  backgroundColor: isDarkMode ? '#172722' : '#E8F8F0',
                  borderColor: BrandColors.primary,
                },
              ]}>
              <View style={styles.ruleHeader}>
                <Sparkles size={16} color={BrandColors.primary} />
                <Text style={[styles.ruleTitle, { color: BrandColors.primary }]}>
                  {step.formulaOrRule.title}
                </Text>
              </View>
              <Text style={[styles.ruleText, { color: theme.text }]}>
                {step.formulaOrRule.description}
              </Text>
            </View>
          )}

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
                Consejo Práctico PrestaGo
              </Text>
            </View>
            <Text style={[styles.tipText, { color: theme.text }]}>
              {step.tip}
            </Text>
          </View>

          <View style={{ height: 20 }} />
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
              {TUTORIAL_TABS.map((s, i) => (
                <Pressable
                  key={s.id}
                  onPress={() => handleSelectTab(i)}
                  hitSlop={8}>
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          i === currentStepIndex
                            ? step.gradientColors[0]
                            : isDarkMode
                            ? '#1E2638'
                            : '#CBD5E1',
                        width: i === currentStepIndex ? 22 : 6,
                      },
                    ]}
                  />
                </Pressable>
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
                  {isLastStep ? '¡Entendido, Comenzar!' : 'Siguiente'}
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
    paddingHorizontal: 16,
    paddingVertical: 10,
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
  tabsScrollWrapper: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.1)',
  },
  tabsScrollContent: {
    paddingHorizontal: 14,
    gap: 8,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  tabPillText: {
    fontSize: 12,
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
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  sectionsContainer: {
    marginBottom: 14,
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sectionBadgeText: {
    fontSize: 10,
    fontWeight: '900',
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
  ruleBox: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  ruleTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  ruleText: {
    fontSize: 12,
    lineHeight: 18,
  },
  tipBox: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: 14,
    marginTop: 4,
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
