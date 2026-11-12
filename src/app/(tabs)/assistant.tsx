import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Linking,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bot,
  Send,
  MessageCircle,
  User,
  Share2,
  Mic,
  Trash2,
  Play,
  Pause,
  Sparkles,
} from 'lucide-react-native';
import {
  useAudioRecorder,
  useAudioRecorderState,
  useAudioPlayer,
  useAudioPlayerStatus,
  RecordingPresets,
  AudioModule,
} from 'expo-audio';
import { usePrestago } from '@/context/PrestagoContext';
import { ChatMessage, Cliente } from '@/types';
import { BrandColors, Colors, BorderRadius, Shadows, MaxContentWidth } from '@/constants/theme';
import { HeaderBar } from '@/components/HeaderBar';
import { formatCurrency, formatDate } from '@/utils/finance';

/**
 * Componente reproductor para notas de voz en las burbujas de chat
 */
function VoiceMessageBubble({
  uri,
  duration,
  isUser,
  theme,
}: {
  uri?: string;
  duration?: string;
  isUser: boolean;
  theme: any;
}) {
  const player = useAudioPlayer(uri ? { uri } : null);
  const status = useAudioPlayerStatus(player);

  const handleTogglePlay = async () => {
    if (!player) return;
    try {
      if (status.playing) {
        player.pause();
      } else {
        if (status.didJustFinish || (status.currentTime >= status.duration && status.duration > 0)) {
          await player.seekTo(0);
        }
        player.play();
      }
    } catch (e) {
      console.warn('Error reproduciendo nota de voz:', e);
    }
  };

  const progressPercent =
    status.duration > 0
      ? Math.min(100, Math.max(0, (status.currentTime / status.duration) * 100))
      : status.playing
      ? 50
      : 0;

  return (
    <View style={styles.voiceBubbleContainer}>
      <Pressable
        onPress={handleTogglePlay}
        style={[
          styles.voicePlayBtn,
          {
            backgroundColor: isUser ? '#FFFFFF' : BrandColors.primary,
          },
        ]}>
        {status.playing ? (
          <Pause size={14} color={isUser ? BrandColors.primary : '#FFFFFF'} />
        ) : (
          <Play size={14} color={isUser ? BrandColors.primary : '#FFFFFF'} />
        )}
      </Pressable>

      <View style={styles.voiceProgressWrapper}>
        <View style={styles.voiceWaveRow}>
          {[40, 70, 100, 60, 85, 45, 90, 65, 80, 50, 75, 95, 60, 40].map((h, idx) => {
            const barFraction = (idx / 14) * 100;
            const isFilled = progressPercent >= barFraction;
            return (
              <View
                key={idx}
                style={[
                  styles.waveBar,
                  {
                    height: (h / 100) * 18 + 4,
                    backgroundColor: isUser
                      ? isFilled
                        ? '#FFFFFF'
                        : 'rgba(255,255,255,0.4)'
                      : isFilled
                      ? BrandColors.primary
                      : theme.border,
                  },
                ]}
              />
            );
          })}
        </View>

        <View style={styles.voiceMetaRow}>
          <Text
            style={[
              styles.voiceDurationLabel,
              { color: isUser ? 'rgba(255,255,255,0.85)' : theme.textMuted },
            ]}>
            {status.playing
              ? `${Math.floor(status.currentTime)}s / ${duration || '0:00'}`
              : `Nota de voz • ${duration || '0:00'}`}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function AssistantScreen() {
  const { clientes, isDarkMode, toggleTheme, metricas } = usePrestago();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const tabOffset = Platform.OS === 'ios' ? 56 + Math.max(insets.bottom, 10) : 0;
  const chatScrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);

  const [inputMessage, setInputMessage] = useState('');
  const [selectedClienteId, setSelectedClienteId] = useState<string>(clientes[0]?.id || '');

  const selectedCliente = clientes.find((c) => c.id === selectedClienteId) || clientes[0];

  // Configuración del grabador nativo de audio
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 200);

  // Animación de pulso para el indicador de grabación
  const [pulseAnim] = useState(() => new Animated.Value(1));
  useEffect(() => {
    if (recorderState.isRecording) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.25,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [recorderState.isRecording, pulseAnim]);

  const INITIAL_MESSAGES: ChatMessage[] = [
    {
      id: 'msg-1',
      sender: 'assistant',
      text: `¡Hola! Soy tu Asistente IA PrestaGo con tecnología Gemini 🤖💼.\n\nPuedo redactar mensajes persuasivos de cobro para WhatsApp, liquidar intereses en tiempo real y asesorarte en reestructuración de deudas.\n\nEscribe o pulsa el micrófono 🎙️ para dictarme tu consulta por voz.`,
      timestamp: 'Ahora',
    },
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);

  // Generador inteligente de respuestas locales
  const generarRespuesta = (prompt: string, cli?: Cliente) => {
    const targetCli = cli || selectedCliente;
    const lower = prompt.toLowerCase();

    let reply = '';
    let waText = '';

    if (lower.includes('cordial') || lower.includes('recordatorio')) {
      reply = `He redactado un recordatorio cordial de cobro para ${targetCli.nombre}.\n\nPuedes enviarlo directamente por WhatsApp con el botón a continuación:`;
      waText = `Hola estimado/a ${targetCli.nombre}, te saludo de PrestaGo. Esperamos que todo marche excelente.\n\nQueremos recordarte de manera atenta tu cuota de ${formatCurrency(
        targetCli.cuota
      )} programada para el ${formatDate(
        targetCli.proximoCobro
      )}.\n\nSi necesitas los datos para realizar tu transferencia o deseas consultar tu saldo actual (${formatCurrency(
        targetCli.totalPendiente
      )}), con gusto estamos atentos. ¡Muchas gracias por tu compromiso!`;
    } else if (lower.includes('mora') || lower.includes('formal') || lower.includes('jurídico')) {
      reply = `He redactado un mensaje formal de notificación de mora para ${targetCli.nombre} (${targetCli.diasMora} días en retraso):`;
      waText = `Apreciado/a ${targetCli.nombre}, le saludamos del Departamento de Cobranzas de PrestaGo.\n\nLe notificamos formalmente que su crédito presenta un saldo pendiente de ${formatCurrency(
        targetCli.totalPendiente
      )} con cuota vencida de ${formatCurrency(
        targetCli.cuota
      )}.\n\nLe solicitamos comunicarse hoy mismo para regularizar su estado y evitar reportes o sobrecostos por mora. Por favor confirme el recibo de este mensaje para acordar la fecha exacta de su pago.`;
    } else if (lower.includes('liquidar') || lower.includes('anticipada') || lower.includes('paz y salvo')) {
      reply = `Análisis de Liquidación Anticipada para ${targetCli.nombre}:\n\n` +
        `• Capital por amortizar: ${formatCurrency(targetCli.capitalPendiente)}\n` +
        `• Interés acumulado: ${formatCurrency(targetCli.interesPendiente)}\n` +
        `• Total neto para quedar A PAZ Y SALVO hoy: ${formatCurrency(targetCli.totalPendiente)}\n\n` +
        `Si el cliente cancela los ${formatCurrency(targetCli.totalPendiente)}, el crédito queda cerrado inmediatamente y puede calificar para una renovación con tasa preferencial.`;
      waText = `Hola ${targetCli.nombre}, de acuerdo con tu solicitud te comparto el valor total para quedar A Paz y Salvo con PrestaGo hoy: ${formatCurrency(
        targetCli.totalPendiente
      )}. Al cancelar este saldo quedas libre de deuda y preaprobado/a para un nuevo préstamo.`;
    } else if (lower.includes('refinanciar') || lower.includes('propuesta')) {
      const nuevoPlazo = 12;
      const nuevaCuotaSugerida = Math.round(
        (targetCli.totalPendiente + targetCli.totalPendiente * 0.1 * nuevoPlazo) / nuevoPlazo
      );
      reply = `Propuesta de Reestructuración sugerida para ${targetCli.nombre}:\n\n` +
        `• Deuda actual consolidada: ${formatCurrency(targetCli.totalPendiente)}\n` +
        `• Nuevo plazo sugerido: ${nuevoPlazo} meses amortizados\n` +
        `• Nueva cuota mensual cómoda: ${formatCurrency(nuevaCuotaSugerida)}\n\n` +
        `Esta alternativa ayuda a sanear la cartera de clientes con mora crítica sin perder capital.`;
      waText = `Hola ${targetCli.nombre}, en PrestaGo queremos apoyarte a ponerte al día. Te ofrecemos una alternativa de refinanciación con una cuota mensual más accesible de ${formatCurrency(
        nuevaCuotaSugerida
      )}. ¿Cuándo podríamos coordinar una llamada para formalizar el acuerdo?`;
    } else {
      reply = `He analizado tu consulta sobre "${prompt}".\n\n` +
        `Para el crédito de ${targetCli.nombre} (Modalidad: ${targetCli.modalidad}), la cuota pactada es de ${formatCurrency(
          targetCli.cuota
        )} y el total pendiente es ${formatCurrency(
          targetCli.totalPendiente
        )}.\n\nRecuerda que con la regla de cuota fija, cualquier abono extraordinario reduce la deuda directamente pero mantiene la cuota mensual inalterada.`;
    }

    return { reply, waText };
  };

  // Generador de respuestas contextuales para consultas de voz
  const generarRespuestaParaVoz = (targetCli: Cliente, durationSecs: number) => {
    let reply = '';
    let waText = '';

    const tieneMora = targetCli.diasMora > 0;
    const esPazYSalvo = targetCli.estadoMora === 'paz_y_salvo' || targetCli.totalPendiente <= 0;

    if (esPazYSalvo) {
      reply = `🎙️ **Audio recibido (${durationSecs}s)** — *Consulta sobre ${targetCli.nombre}*\n\n` +
        `He procesado tu consulta de voz. Este cliente se encuentra actualmente **A Paz y Salvo** con su crédito completamente cancelado ($0 saldo pendiente).\n\n` +
        `💡 **Recomendación IA:** Por su excelente cumplimiento, califica para una renovación de crédito o ampliación de cupo. He preparado un mensaje listo para WhatsApp por si deseas ofrecerle una nueva opción de préstamo.`;
      waText = `Hola estimado/a ${targetCli.nombre}, desde PrestaGo te felicitamos por haber completado el pago total de tu crédito. Por tu excelente cumplimiento, tienes preaprobado un cupo preferencial. Si requieres financiamiento, ¡avísanos con gusto!`;
    } else if (tieneMora) {
      reply = `🎙️ **Audio recibido (${durationSecs}s)** — *Diagnóstico de Cartera para ${targetCli.nombre}*\n\n` +
        `He analizado el crédito del cliente en base a tu consulta:\n` +
        `• **Estado:** En mora (${targetCli.diasMora} días de retraso)\n` +
        `• **Cuota vencida:** ${formatCurrency(targetCli.cuota)}\n` +
        `• **Deuda total activa:** ${formatCurrency(targetCli.totalPendiente)}\n` +
        `• **Celular registrado:** ${targetCli.celular}\n\n` +
        `He generado abajo una notificación formal de cobro lista para compartir por WhatsApp:`;
      waText = `Hola ${targetCli.nombre}, te saludo de PrestaGo. Registramos un saldo pendiente de ${formatCurrency(targetCli.totalPendiente)} con ${targetCli.diasMora} días de retraso en tu cuota de ${formatCurrency(targetCli.cuota)}. Agradecemos tu confirmación hoy para regularizar el estado de tu crédito. ¡Gracias!`;
    } else {
      reply = `🎙️ **Audio recibido (${durationSecs}s)** — *Resumen de ${targetCli.nombre}*\n\n` +
        `Tu cliente está **Al Día** en sus pagos:\n` +
        `• **Próximo cobro:** ${formatDate(targetCli.proximoCobro)}\n` +
        `• **Valor cuota:** ${formatCurrency(targetCli.cuota)}\n` +
        `• **Saldo restante:** ${formatCurrency(targetCli.totalPendiente)}\n` +
        `• **Cuotas pagadas:** ${targetCli.cuotasPagadas} de ${targetCli.cuotasTotales === 999 ? 'Indefinido' : targetCli.cuotasTotales}\n\n` +
        `Te preparé un recordatorio preventivo cordial para mantener su compromiso de pago:`;
      waText = `Hola ${targetCli.nombre}, esperamos que tengas un excelente día. Te recordamos cordialmente tu cuota de ${formatCurrency(targetCli.cuota)} de PrestaGo programada para el ${formatDate(targetCli.proximoCobro)}. ¡Muchas gracias por tu puntualidad!`;
    }

    return { reply, waText };
  };

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: 'Ahora',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');

    // Respuesta IA
    setTimeout(() => {
      const { reply, waText } = generarRespuesta(text, selectedCliente);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        actionableWhatsAppText: waText || undefined,
        timestamp: 'Ahora',
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 400);
  };

  // Iniciar grabación de audio
  const handleStartRecording = async () => {
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permiso de Micrófono',
          'PrestaGo necesita acceso a tu micrófono para dictar tus consultas y redactar mensajes por voz al Asistente IA. Por favor actívalo en los ajustes de tu dispositivo.',
          [{ text: 'Entendido' }]
        );
        return;
      }

      await AudioModule.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (error) {
      console.error('Error al iniciar grabación:', error);
      Alert.alert('Error', 'No se pudo activar el micrófono.');
    }
  };

  // Detener y enviar grabación
  const handleStopAndSendRecording = async () => {
    try {
      const durationSecs = Math.max(1, Math.round(recorderState.durationMillis / 1000));
      const mins = Math.floor(durationSecs / 60);
      const secs = durationSecs % 60;
      const durationStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

      await recorder.stop();
      const uri = recorder.uri;

      const userVoiceMsg: ChatMessage = {
        id: `user-voice-${Date.now()}`,
        sender: 'user',
        text: 'Nota de voz dictada al Asistente IA',
        isAudio: true,
        audioDuration: durationStr,
        audioUri: uri || undefined,
        timestamp: 'Ahora',
      };

      setMessages((prev) => [...prev, userVoiceMsg]);

      // Respuesta de la IA
      setTimeout(() => {
        const { reply, waText } = generarRespuestaParaVoz(selectedCliente, durationSecs);
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: reply,
          actionableWhatsAppText: waText || undefined,
          timestamp: 'Ahora',
        };
        setMessages((prev) => [...prev, aiMsg]);
      }, 500);
    } catch (error) {
      console.error('Error al enviar nota de voz:', error);
      Alert.alert('Error', 'No se pudo procesar la grabación de voz.');
    }
  };

  // Cancelar y descartar grabación
  const handleCancelRecording = async () => {
    try {
      await recorder.stop();
    } catch (error) {
      console.warn('Error cancelando grabación:', error);
    }
  };

  const handleOpenWhatsApp = (text: string) => {
    if (!selectedCliente) return;
    const cleanNumber = selectedCliente.celular.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(text);
    Linking.openURL(`https://wa.me/${cleanNumber}?text=${encoded}`).catch(() => {
      Linking.openURL(`https://wa.me/?text=${encoded}`).catch(() => {});
    });
  };

  const formatDurationMillis = (millis: number) => {
    const totalSecs = Math.floor(millis / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <HeaderBar
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        capitalEnLaCalle={metricas.capitalEnLaCalle}
        clientesActivos={metricas.clientesActivos}
      />

      {/* Selector de Cliente Contextual */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={tabOffset}>
        <View
          style={[
            styles.contextBar,
            {
              backgroundColor: theme.card,
              borderBottomColor: theme.border,
            },
          ]}>
          <View style={styles.responsiveInner}>
            <View style={styles.contextLabelRow}>
              <User size={14} color={BrandColors.primary} />
              <Text style={[styles.contextLabel, { color: theme.textSecondary }]}>
                Cliente en contexto:
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {clientes.map((c) => {
                const isSel = c.id === selectedCliente?.id;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => setSelectedClienteId(c.id)}
                    style={[
                      styles.clientChip,
                      {
                        backgroundColor: isSel
                          ? BrandColors.primary
                          : isDarkMode
                          ? '#161D27'
                          : '#F1F5F9',
                        borderColor: isSel ? BrandColors.primary : theme.border,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.clientChipText,
                        { color: isSel ? '#FFFFFF' : theme.text },
                      ]}>
                      {c.nombre.split(' ')[0]} ({formatCurrency(c.totalPendiente)})
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>

        {/* Lista de Mensajes del Chat */}
        <ScrollView
          ref={chatScrollRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={true}
          onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={styles.chatScroll}>
          <View style={styles.responsiveInner}>
            {messages.map((m) => {
              const isAI = m.sender === 'assistant';

              return (
                <View
                  key={m.id}
                  style={[
                    styles.messageBubbleWrapper,
                    isAI ? styles.aiWrapper : styles.userWrapper,
                  ]}>
                  {isAI && (
                    <LinearGradient
                      colors={[BrandColors.primary, BrandColors.primaryDark]}
                      style={styles.aiAvatar}>
                      <Bot size={15} color="#FFFFFF" />
                    </LinearGradient>
                  )}

                  <View
                    style={[
                      styles.messageBubble,
                      isAI
                        ? [
                            styles.aiBubble,
                            {
                              backgroundColor: theme.card,
                              borderColor: theme.border,
                            },
                          ]
                        : [
                            styles.userBubble,
                            { backgroundColor: BrandColors.primary },
                          ],
                    ]}>
                    {/* Reproductor si es nota de voz */}
                    {m.isAudio ? (
                      <VoiceMessageBubble
                        uri={m.audioUri}
                        duration={m.audioDuration}
                        isUser={!isAI}
                        theme={theme}
                      />
                    ) : (
                      <Text
                        style={[
                          styles.messageText,
                          { color: isAI ? theme.text : '#FFFFFF' },
                        ]}>
                        {m.text}
                      </Text>
                    )}

                    {/* Caja de Acción WhatsApp si la IA redactó un mensaje */}
                    {m.actionableWhatsAppText && (
                      <View
                        style={[
                          styles.waActionBox,
                          {
                            backgroundColor: isDarkMode ? '#13231B' : '#E8F8F0',
                            borderColor: BrandColors.primary,
                          },
                        ]}>
                        <View style={styles.waHeader}>
                          <MessageCircle size={15} color={BrandColors.primary} />
                          <Text style={[styles.waHeaderTitle, { color: BrandColors.primaryDark }]}>
                            Mensaje listo para WhatsApp:
                          </Text>
                        </View>

                        <Text style={[styles.waBodyText, { color: theme.text }]}>
                          {m.actionableWhatsAppText}
                        </Text>

                        <Pressable
                          onPress={() => handleOpenWhatsApp(m.actionableWhatsAppText!)}
                          style={[styles.sendWaBtn, Shadows.glowGreen]}>
                          <LinearGradient
                            colors={[BrandColors.primary, BrandColors.primaryDark]}
                            style={styles.sendWaGradient}>
                            <Share2 size={15} color="#FFFFFF" />
                            <Text style={styles.sendWaBtnText}>
                              Enviar a WhatsApp de {selectedCliente?.nombre.split(' ')[0]}
                            </Text>
                          </LinearGradient>
                        </Pressable>
                      </View>
                    )}

                    <Text
                      style={[
                        styles.messageTime,
                        { color: isAI ? theme.textMuted : 'rgba(255,255,255,0.7)' },
                      ]}>
                      {m.timestamp}
                    </Text>
                  </View>
                </View>
              );
            })}

            {/* Sugerencias Rápidas */}
            <View style={styles.suggestionsContainer}>
              <View style={styles.suggestionsHeaderRow}>
                <Sparkles size={13} color={BrandColors.primary} />
                <Text style={[styles.suggestionsTitle, { color: theme.textMuted }]}>
                  Prompts Rápidos para {selectedCliente?.nombre.split(' ')[0]}:
                </Text>
              </View>

              <View style={styles.chipsRow}>
                <Pressable
                  onPress={() =>
                    handleSend(
                      `Redacta un recordatorio de cobro cordial para ${selectedCliente?.nombre}`
                    )
                  }
                  style={[
                    styles.promptPill,
                    {
                      backgroundColor: isDarkMode ? '#161D27' : '#FFFFFF',
                      borderColor: theme.border,
                    },
                  ]}>
                  <Text style={[styles.promptText, { color: theme.text }]}>
                    💬 Recordatorio Cordial
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() =>
                    handleSend(
                      `Redacta una notificación formal de mora para ${selectedCliente?.nombre}`
                    )
                  }
                  style={[
                    styles.promptPill,
                    {
                      backgroundColor: isDarkMode ? '#161D27' : '#FFFFFF',
                      borderColor: theme.border,
                    },
                  ]}>
                  <Text style={[styles.promptText, { color: theme.text }]}>
                    ⚠️ Cobro Formal de Mora
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() =>
                    handleSend(
                      `Calcula la liquidación anticipada para paz y salvo de ${selectedCliente?.nombre}`
                    )
                  }
                  style={[
                    styles.promptPill,
                    {
                      backgroundColor: isDarkMode ? '#161D27' : '#FFFFFF',
                      borderColor: theme.border,
                    },
                  ]}>
                  <Text style={[styles.promptText, { color: theme.text }]}>
                    🧮 Liquidar Paz y Salvo
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() =>
                    handleSend(
                      `Genera una propuesta de refinanciación para ${selectedCliente?.nombre}`
                    )
                  }
                  style={[
                    styles.promptPill,
                    {
                      backgroundColor: isDarkMode ? '#161D27' : '#FFFFFF',
                      borderColor: theme.border,
                    },
                  ]}>
                  <Text style={[styles.promptText, { color: theme.text }]}>
                    🤝 Propuesta Refinanciación
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={{ height: 20 }} />
          </View>
        </ScrollView>

        {/* Input Bar / Barra de Grabación en la Parte Inferior */}
        {recorderState.isRecording ? (
          <View
            style={[
              styles.inputBar,
              styles.recordingBar,
              {
                backgroundColor: isDarkMode ? '#201314' : '#FEF2F2',
                borderTopColor: isDarkMode ? '#7F1D1D' : '#FCA5A5',
              },
            ]}>
            <View style={styles.recordingInnerRow}>
              {/* Descartar nota */}
              <Pressable
                onPress={handleCancelRecording}
                style={({ pressed }) => [
                  styles.cancelRecordingBtn,
                  { opacity: pressed ? 0.7 : 1 },
                ]}>
                <Trash2 size={19} color="#EF4444" />
              </Pressable>

              {/* Indicador con pulso y contador */}
              <View style={styles.recordingTimerContainer}>
                <Animated.View style={[styles.blinkingDot, { opacity: pulseAnim }]} />
                <Text style={[styles.recordingStatusText, { color: isDarkMode ? '#FCA5A5' : '#DC2626' }]}>
                  Grabando consulta...
                </Text>
                <Text style={[styles.recordingTimerText, { color: isDarkMode ? '#FFFFFF' : '#991B1B' }]}>
                  {formatDurationMillis(recorderState.durationMillis)}
                </Text>
              </View>

              {/* Detener y Enviar a la IA */}
              <Pressable
                onPress={handleStopAndSendRecording}
                style={({ pressed }) => [
                  styles.sendBtn,
                  Shadows.glowGreen,
                  { opacity: pressed ? 0.8 : 1 },
                ]}>
                <LinearGradient
                  colors={[BrandColors.primary, BrandColors.primaryDark]}
                  style={styles.sendGradient}>
                  <Send size={18} color="#FFFFFF" />
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.inputBar,
              {
                backgroundColor: theme.card,
                borderTopColor: theme.border,
              },
            ]}>
            <View style={styles.inputInnerRow}>
              <TextInput
                value={inputMessage}
                onChangeText={setInputMessage}
                onFocus={() => {
                  setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 150);
                }}
                placeholder="Escribe o pulsa el micrófono para hablar..."
                placeholderTextColor={theme.textMuted}
                style={[styles.chatInput, { color: theme.text }]}
                onSubmitEditing={() => handleSend()}
              />

              {/* Botón de Micrófono */}
              <Pressable
                onPress={handleStartRecording}
                style={({ pressed }) => [
                  styles.micBtn,
                  {
                    backgroundColor: isDarkMode ? '#13231B' : '#E8F8F0',
                    borderColor: BrandColors.primary,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}>
                <Mic size={19} color={BrandColors.primary} />
              </Pressable>

              {/* Botón de Enviar texto */}
              <Pressable
                onPress={() => handleSend()}
                disabled={!inputMessage.trim()}
                style={({ pressed }) => [
                  styles.sendBtn,
                  {
                    opacity: !inputMessage.trim() ? 0.4 : pressed ? 0.8 : 1,
                  },
                  inputMessage.trim() ? Shadows.glowGreen : undefined,
                ]}>
                <LinearGradient
                  colors={[BrandColors.primary, BrandColors.primaryDark]}
                  style={styles.sendGradient}>
                  <Send size={18} color="#FFFFFF" />
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  contextBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  contextLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  contextLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  clientChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  clientChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chatScroll: {
    padding: 16,
  },
  messageBubbleWrapper: {
    flexDirection: 'row',
    marginBottom: 14,
    gap: 8,
  },
  aiWrapper: {
    alignSelf: 'flex-start',
    maxWidth: '92%',
  },
  userWrapper: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  messageBubble: {
    borderRadius: BorderRadius.xl,
    padding: 14,
  },
  aiBubble: {
    borderWidth: 1,
  },
  userBubble: {},
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  voiceBubbleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
    minWidth: 200,
  },
  voicePlayBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceProgressWrapper: {
    flex: 1,
  },
  voiceWaveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 22,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
  },
  voiceMetaRow: {
    marginTop: 4,
  },
  voiceDurationLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  waActionBox: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: 12,
    marginTop: 10,
  },
  waHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  waHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  waBodyText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  sendWaBtn: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  sendWaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
  },
  sendWaBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  suggestionsContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  suggestionsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  suggestionsTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  promptPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  promptText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  recordingBar: {
    paddingVertical: 10,
  },
  responsiveInner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  inputInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    fontSize: 14,
    height: 44,
  },
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtn: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  sendGradient: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: 12,
  },
  cancelRecordingBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingTimerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  blinkingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  recordingStatusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  recordingTimerText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
