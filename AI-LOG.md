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

---

## 📐 Resumen del Modelo de Datos Firestore

| Colección / Subcolección | Campos Clave | Tipos de Datos |
|---|---|---|
| `/administradores/{uid}` | `nombres`, `apellidos`, `correo`, `celular`, `documento`, `usuario`, `fotoPerfil`, `fecha_creacion` | String, Timestamp |
| `/administradores/{uid}/clientes/{cliId}` | `nombre`, `celular`, `documento`, `ubicacion`, `modalidad`, `monto`, `cuota`, `cuotasPagadas`, `cuotasTotales`, `capitalPendiente`, `interesPendiente`, `totalPendiente`, `fechaInicio`, `tipoRegistro` | String (montos), Number (cuotas), Timestamp (fechas) |
| `/.../clientes/{cliId}/historial_pagos/{pagoId}` | `monto`, `tipo`, `numeroCuota`, `fechaPago` | String (monto), Number/String (cuota), Timestamp |
