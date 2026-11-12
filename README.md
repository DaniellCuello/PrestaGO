# 💸 PrestaGo Mobile App — v1.1.1

![PrestaGo Banner](https://img.shields.io/badge/PrestaGo-v1.1.1-1AA965?style=for-the-badge&logo=expo&logoColor=white)
![Expo](https://img.shields.io/badge/Expo_Go-SDK_58-000020?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-0.88-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-Firestore_%26_Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

**PrestaGo** es una aplicación móvil financiera moderna desarrollada desde cero en **React Native con Expo Go (SDK 58)** y TypeScript. Diseñada para prestamistas, administradores de créditos y carteras financieras con un diseño vanguardista **Material 3**, soporte nativo para **Modo Oscuro / Claro**, sincronización en vivo con **Firebase Cloud Firestore**, y un **Asistente Financiero con Inteligencia Artificial**.

---

## 🚀 Novedades de la Versión 1.1.1

- 🟢 **Sincronización en Vivo con Firebase (Cloud Firestore & Auth):** Conexión transparente y compartida con la base de datos de producción existente en Android Studio/Flutter (`prestago-2002`).
- 🤖 **Asistente Financiero con Inteligencia Artificial:** Resuelve dudas sobre la cartera, identifica clientes en mora y genera recordatorios de cobro listos para WhatsApp.
- 🎙️ **Consultas por Voz en el Asistente IA (`expo-audio`):** Grabación nativa de voz con temporizador en tiempo real, reproductor de notas de voz con barra de onda en el chat y diagnósticos financieros automáticos.
- 📱 **Integración de Contactos del Dispositivo:** Importación instantánea del nombre y teléfono de clientes desde la libreta de contactos (`expo-contacts`).
- 🗺️ **Selector de Ciudades y Mapa GPS:** Catálogo de municipios de Colombia con autocompletado y selección de coordenadas exactas mediante mapa interactivo (`expo-location` y `react-native-maps`).
- 📸 **Foto de Perfil del Administrador:** Captura directa con la cámara o selección desde galería (`expo-image-picker`).
- 🔐 **Módulo Completo de Autenticación:** Login, Registro de Administrador y Recuperación de Contraseña protegidos por Firebase Auth.
- 🧹 **Limpieza de Modo Prueba:** Eliminada la tarjeta obsoleta de reseteo de datos mock para resguardar la información real.

---

## 🧮 Reglas de Negocio y Lógica Financiera

La app implementa con exactitud las reglas matemáticas y financieras de PrestaGo:

### 1. Modalidad "Amortizado (Capital + Interés)"
- **Plazo Fijo (ej. 5 meses):**
  $$\text{Interés Total} = \text{Monto} \times \left(\frac{\text{Interés \%}}{100}\right)$$
  $$\text{Deuda Total} = \text{Monto} + \text{Interés Total}$$
  $$\text{Cuota Mensual Fija} = \frac{\text{Deuda Total}}{\text{Plazo (Meses)}}$$
- **Plazo Indefinido (Mes a Mes / 999):**
  $$\text{Cuota Mensual Fija} = \text{Monto} \times \left(\frac{\text{Interés \%}}{100}\right)$$

### 2. Modalidad "Solo Intereses (Capital al final)"
- En cada cuota mensual el cliente cancela el 100% del interés pactado. El capital se mantiene intacto hasta que realice abonos libres o devuelva la totalidad.
  $$\text{Cuota Mensual Fija} = \text{Monto} \times \left(\frac{\text{Interés \%}}{100}\right)$$

### 3. Regla de Oro en Abonos Libres
- **Abono a Capital:** Reduce directamente `capitalPendiente`. **La cuota mensual acordada NO se reduce ni se recalcula;** permanece inalterada hasta saldo $0.
- **Abono a Interés:** Reduce `interesPendiente`. Si cubre cuotas vencidas, avanza automáticamente el contador de `cuotasPagadas`.
- **A Paz y Salvo:** Cuando `totalPendiente <= 0`, el cliente pasa automáticamente a estado *Paz y Salvo* y queda preaprobado para renovación de crédito.

---

## 📱 Módulos y Pantallas

| Pestaña / Pantalla | Descripción |
|---|---|
| **💼 Cartera (`/`)** | Lista en tiempo real de clientes con semáforo de moras (Al Día, 1 Mes, 2 Meses, 3+ Meses, Paz y Salvo), buscador predictivo, simulador de abonos y envío de estado por WhatsApp. |
| **📅 Calendario (`/calendar`)** | Vista mensual interactiva de vencimientos y recaudos programados con filtrado por fecha. |
| **📊 Analítica (`/analytics`)** | Métricas financieras globales (capital en la calle, dinero recuperado, intereses) y Calculadora Rápida interactiva. |
| **🤖 Asistente IA (`/assistant`)** | Chat inteligente entrenado en la cartera para sugerencias de cobro y redacción de mensajes. |
| **👤 Perfil (`/profile`)** | Edición de perfil de administrador, cambio de tema oscuro/claro, foto de perfil y botón de cerrar sesión. |
| **➕ Nuevo Préstamo (`/new-client`)** | Modal de registro con selector de contactos, buscador de ciudades de Colombia, mapa GPS y conciliación de préstamos migrados. |
| **🔒 Autenticación (`/(auth)`)** | Pantallas de Iniciar Sesión, Registrarse y Recuperar Contraseña conectadas a Firebase Auth. |

---

## 🛠️ Stack Tecnológico

- **Framework:** Expo 58.0.19 (SDK 58)
- **Librería Base:** React 19.3.0 & React Native 0.88.0
- **Enrutamiento:** Expo Router v58 (File-based navigation)
- **Base de Datos & Auth:** Firebase v13.0.0 (Cloud Firestore & Authentication)
- **Persistencia Local:** `@react-native-async-storage/async-storage`
- **Iconografía:** Lucide React Native (`lucide-react-native`)
- **Gradientes & UI:** `expo-linear-gradient`, `expo-image`, `react-native-safe-area-context`
- **Hardware & Sensores:** `expo-contacts`, `expo-location`, `expo-image-picker`, `react-native-maps`

---

## ⚙️ Estructura de Firestore Compatible con Flutter

La estructura en Cloud Firestore es idéntica a la implementada en Flutter/Android Studio para permitir convivencia simultánea:

```text
📁 administradores / {adminUID}
   ├── nombres: "Denilson Daniel"
   ├── apellidos: "Cuello Palmezano"
   ├── correo: "denilsonpc30@gmail.com"
   ├── celular: "3122064526"
   ├── documento: "1006615831"
   └── 📁 clientes / {clienteId}
         ├── nombre: "Rosmira Palmezano"
         ├── celular: "3102202148"
         ├── modalidad: "Solo Intereses (Capital al final)"
         ├── monto: "1000000"          (String)
         ├── cuota: "400000"           (String)
         ├── capitalPendiente: "1000000" (String)
         ├── interesPendiente: "200000"  (String)
         ├── totalPendiente: "1200000"   (String)
         ├── cuotasPagadas: 3          (Number)
         ├── cuotasTotales: 3          (Number)
         ├── fechaInicio: Timestamp
         └── 📁 historial_pagos / {pagoId}
               ├── monto: "400000"     (String)
               ├── tipo: "Abono Libre" (String)
               ├── numeroCuota: 2      (Number)
               └── fechaPago: Timestamp
```

---

## 💻 Instalación y Ejecución

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar el empaquetador Metro:**
   ```bash
   npx expo start -c
   ```

3. **Abrir en tu dispositivo:**
   - **iPhone / iOS:** Abre la app de la Cámara y escanea el código QR para abrir en **Expo Go**.
   - **Android:** Escanea el código QR desde la app de **Expo Go**.
   - **Web:** Presiona `w` en la consola para visualizar en el navegador.

4. **Verificación de Tipos y Compilación:**
   ```bash
   npx tsc --noEmit
   ```

---

## 📄 Licencia

Desarrollado para el sistema financiero **PrestaGo**. Todos los derechos reservados © 2026.
