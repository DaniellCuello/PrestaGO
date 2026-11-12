# 🤖 AI-LOG — Historial de Desarrollo y Decisiones de Arquitectura

**Proyecto:** PrestaGo Mobile App  
**Versión Actual:** v1.1.1  
**Framework:** Expo Go SDK 58 / React Native 0.88 / React 19 / TypeScript  

---

## 📅 Registro Cronológico de Hitos y Actualizaciones

### [Hito 1] — Inicio de Proyecto y Migración desde Flutter a Expo Go
- **Objetivo:** Desarrollar desde cero la aplicación PrestaGo en React Native y Expo Go conservando la totalidad de la lógica de negocio y reglas financieras de la versión previa de Flutter.
- **Implementaciones Clave:**
  - Estructuración de rutas modulares mediante **Expo Router** dentro de `src/app/(tabs)` (Cartera, Calendario, Analítica, Asistente IA, Perfil).
  - Implementación de la paleta verde financiero (`#1AA965`), diseño responsivo **Material 3**, bordes redondeados (`rounded-2xl`), sombras suaves y soporte completo para Modo Oscuro y Claro.
  - Implementación de las funciones financieras en `src/utils/finance.ts` y `loanCalculations.ts`:
    - Modalidad "Amortizado (Capital + Interés)".
    - Modalidad "Solo Intereses (Capital al final)".
    - Plazo Indefinido (`cuotasTotales = 999`).
    - Regla de Oro en Abonos Libres (cuota mensual fija sin recalcular).

### [Hito 2] — Hardware, Sensores y Mejoras de Usabilidad
- **Contactos del Dispositivo:**
  - Integración de `expo-contacts` con modal de permisos para exportar nombre y número celular/WhatsApp directamente en la creación y edición de clientes.
  - Normalización de números telefónicos para Colombia (+57).
- **Geolocalización y Mapas:**
  - Catálogo de municipios y departamentos de Colombia (`src/constants/colombiaLocations.ts`) con búsqueda predictiva.
  - Integración de `expo-location` y `react-native-maps` con selector interactivo de coordenadas GPS para marcar el punto exacto de cobro del cliente.
- **Cámara y Galería en Perfil:**
  - Integración de `expo-image-picker` para captura con cámara o selección de foto de perfil de administrador con persistencia.
- **Gestión Completa de Clientes:**
  - Opciones para editar información personal y financiera de clientes.
  - Eliminación segura de clientes con alerta de confirmación.
  - Botón de envío directo del estado de cuenta y recibos por **WhatsApp**.

### [Hito 3] — Actualización de Entorno a Expo SDK 58
- **Motivo:** Adaptar el proyecto a la versión SDK 58.0.0 instalada en el dispositivo móvil (iPhone con Expo Go).
- **Resolución Técnica:**
  - Actualización de paquetes: `expo@58.0.19`, `react@19.3.0`, `react-dom@19.3.0`, `react-native@0.88.0`, `expo-router@58.0.26`.
  - Corrección de `ColorSchemeName` en `use-theme.ts` acorde a React Native 0.88.
  - Cambio en `app.json` de `"web": { "output": "static" }` a `"web": { "output": "single" }` para evitar caídas de Metro en Node.js al evaluar módulos nativos de dispositivo en SSR.
  - Creación de `metro.config.js` oficial extendido de `expo/metro-config`.

### [Hito 4] — Módulo Completo de Autenticación
- **Objetivo:** Preparar la infraestructura de seguridad antes de vincular la base de datos en la nube.
- **Implementaciones:**
  - Rutas de autenticación en `src/app/(auth)`:
    - `login.tsx`: Inicio de sesión con correo/documento y contraseña con botón mostrar/ocultar.
    - `register.tsx`: Formulario de alta para nuevos administradores con validaciones completas.
    - `forgot-password.tsx`: Solicitud y flujo de restablecimiento de contraseña.
  - Auth Guard en `_layout.tsx`: Redirección automática de usuarios no autenticados a login y de usuarios autenticados a las pestañas principales.
  - Botón de **Cerrar Sesión** en el perfil de administrador.

### [Hito 5] — Integración en Vivo con Firebase (Cloud Firestore & Auth)
- **Objetivo:** Conectar la aplicación a la base de datos existente de Firebase (`prestago-2002`) sin alterar ni corromper datos utilizados por la app de Android Studio/Flutter.
- **Hallazgos y Decisiones de Arquitectura:**
  - **Jerarquía:** Multi-administrador por subcolecciones `/administradores/{user.uid}/clientes/{id}/historial_pagos/{id}`.
  - **Mapeo de Tipos de Datos (Interoperabilidad):**
    - En Flutter, los valores de moneda se guardaban como `String` (ej. `"1000000"`).
    - En Expo, convertimos a `number` internamente para ejecutar los cálculos y guardamos como `String` en Firestore, garantizando compatibilidad bidireccional al 100%.
  - **Reglas de Seguridad:** Reglas validadas para lectura y escritura seguras condicionadas a `request.auth != null`.
  - **Sincronización:** Uso de `onSnapshot` para sincronización en tiempo real reactiva.
- **Limpieza de Producción:**
  - Retirada la tarjeta de reseteo de datos mock en la pestaña de perfil para proteger la información real de producción.
  - Incremento de versión a **v1.1.1** en `package.json`, `app.json` y `profile.tsx`.

### [Hito 6] — Refinamiento de UI, Ajustes Legales y Prevención de Superposición de Teclado
- **Pantalla de Login (`login.tsx`):**
  - Removido el botón / tarjeta de demostración ("Cuenta Principal Firebase") para mantener la interfaz neutral para cualquier administrador que se registre.
- **Pestaña de Perfil (`profile.tsx`):**
  - Removido el interruptor duplicado de "Modo Oscuro" en la sección de Preferencias (ya accesible globalmente desde el icono en la barra superior).
  - Añadido el interruptor de **Notificaciones de Cobro** con persistencia en `AsyncStorage` (`@prestago_notificaciones_activas`) para control de recordatorios de cobro y vencimientos.
  - Implementado modal interactivo de **Términos y Condiciones** que contempla normativas colombianas de microcrédito, límites de tasa de usura de la SuperFinanciera y cobranza ética (Ley 2300 de 2023 "Dejen de Fregar").
  - Implementado modal interactivo de **Política de Privacidad y Habeas Data** en estricto cumplimiento con la Ley 1581 de 2012 y el Decreto 1377 de 2013 de Colombia.
- **Corrección de Teclado en Pantalla e Inputs (`KeyboardAvoidingView`):**
  - En `AdminModalEdit.tsx`: El sheet modal ahora está contenido dentro de `KeyboardAvoidingView` con ajuste dinámico y `automaticallyAdjustKeyboardInsets={true}`, evitando que el teclado tape los campos de texto y el botón de guardado.
  - En `ClienteModalEdit.tsx` y `ClienteModalDetail.tsx`: Se implementó la misma arquitectura para edición de clientes y registro de abonos.
  - En `assistant.tsx` (Asistente IA): La barra de entrada de mensajes y el feed de chat ahora se desplazan y elevan suavemente por encima del teclado mediante `useSafeAreaInsets` (`tabOffset`), con desplazamiento automático al final (`scrollToEnd`) al enfocar el campo de texto.
- **Verificación:**
  - `npx tsc --noEmit` completado con 0 errores de tipado.
  - `npx eslint .` completado con 0 errores de linter.

### [Hito 7] — Pulido de Notificaciones en Perfil e Identificación Visual de Clientes a Paz y Salvo en Gris Oscuro
- **Ajuste de Notificaciones en Perfil (`profile.tsx`):**
  - Solucionado el desbordamiento horizontal del `Switch` en la tarjeta de preferencias.
  - Implementado un contenedor con ancho controlado (`prefSwitchContainer`) y fila responsiva unificada (`prefRow`) con márgenes de 16px para todas las filas (`Notificaciones`, `Términos` y `Privacidad`).
  - Añadido un indicador de estado dinámico (`Activo` en verde / `Pausado` en gris) junto al título para una visualización premium y clara.
- **Identificación de Clientes a Paz y Salvo en Gris Oscuro:**
  - Modificado el semáforo y configuración visual en `src/utils/finance.ts` (`getInfoEstadoMora`) para que `paz_y_salvo` utilice `#475569` (gris oscuro / slate) en lugar del verde de préstamos activos al día.
  - Actualizado el filtro de estado en `src/app/(tabs)/index.tsx` para reflejar el color gris oscuro en la pestaña de clientes.
  - En `ClienteCard.tsx`, los créditos a paz y salvo ahora muestran:
    - Indicador lateral y badge en gris oscuro (`#475569`).
    - Borde y contenedor en gris neutro para distinguir préstamos saldados de préstamos activos.
    - Cuota y saldo pendiente en gris oscuro (`$0 (Saldado)`).
    - Barra de progreso de amortización y botón de comprobante en degradado gris pizarra (`['#475569', '#334155']`).
  - En `ClienteModalDetail.tsx`, la tarjeta de cliente a paz y salvo y los badges adoptan la estética en gris oscuro.
- **Verificación:**
  - `npx tsc --noEmit` completado con 0 errores.
  - `npx eslint .` completado con 0 errores.

### [Hito 8] — Integración de Micrófono, Grabación y Asistente IA por Voz (Opción 1)
- **Objetivo:** Permitir al administrador dictar consultas de voz y mensajes al Asistente IA directamente desde la barra de chat de `assistant.tsx`.
- **Módulo Nativo de Audio Compatible con SDK 58 (`expo-audio`):**
  - Migración a `expo-audio` (~58.0.12), el reemplazo oficial y modular del legacy `expo-av` para Expo SDK 58.
  - Configuración del plugin en `app.json` con permisos de micrófono nativos (`microphonePermission` en iOS y `recordAudioAndroid: true` en Android).
  - Manejo de permisos en tiempo de ejecución con `AudioModule.requestRecordingPermissionsAsync()` y configuración de sesión de audio con `AudioModule.setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true })`.
- **Interfaz de Grabación Interactiva en `assistant.tsx`:**
  - **Barra de Entrada:** Botón de micrófono dedicado (`Mic`, `#1AA965`) ubicado al lado del campo de texto y botón de envío.
  - **Modo Grabación Activo:**
    - Reemplazo fluido de la barra de texto por un contenedor de grabación en tonos rojizos con borde suave.
    - Indicador de grabación con punto rojo parpadeante mediante `Animated.loop`.
    - Temporizador en tiempo real (`mm:ss`) vía `useAudioRecorderState(recorder, 200)`.
    - Botón de **Descartar / Cancelar** (`Trash2`) con parada segura del recorder.
    - Botón de **Detener y Enviar** (`Send` con degradado verde y sombra luminosa).
- **Reproducción y Visualización de Notas de Voz en Chat:**
  - Creación del subcomponente `VoiceMessageBubble` que representa una tarjeta de nota de voz con botón Play/Pause (`Play`, `Pause`), ondas de sonido representativas (waveform bars con progreso de tiempo) y duración formateada.
  - Reproducción con `useAudioPlayer` y monitoreo de estado con `useAudioPlayerStatus`.
- **Procesamiento Inteligente de Voz por la IA:**
  - Generador contextual de respuestas para notas de voz (`generarRespuestaParaVoz`) que analiza el crédito del cliente en contexto:
    - **Paz y Salvo:** Diagnóstico de cumplimiento y propuesta de renovación preferencial.
    - **En Mora:** Análisis de atraso, cuota vencida y redacción automática de notificación para WhatsApp.
    - **Al Día:** Detalle de cuotas restantes y redacción de recordatorio cordial preventivo.
- **Verificación Técnica:**
  - `npx tsc --noEmit`: 0 errores de tipado.
  - `npx eslint "src/app/(tabs)/assistant.tsx"`: 0 errores de linter.

---

## 📐 Resumen del Modelo de Datos Firestore

| Colección / Subcolección | Campos Clave | Tipos de Datos |
|---|---|---|
| `/administradores/{uid}` | `nombres`, `apellidos`, `correo`, `celular`, `documento`, `usuario`, `fotoPerfil`, `fecha_creacion` | String, Timestamp |
| `/administradores/{uid}/clientes/{cliId}` | `nombre`, `celular`, `documento`, `ubicacion`, `modalidad`, `monto`, `cuota`, `cuotasPagadas`, `cuotasTotales`, `capitalPendiente`, `interesPendiente`, `totalPendiente`, `fechaInicio`, `tipoRegistro` | String (montos), Number (cuotas), Timestamp (fechas) |
| `/.../clientes/{cliId}/historial_pagos/{pagoId}` | `monto`, `tipo`, `numeroCuota`, `fechaPago` | String (monto), Number/String (cuota), Timestamp |

