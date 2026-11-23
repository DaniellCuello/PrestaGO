import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cliente } from '@/types';
import { formatCurrency, formatDate } from '@/utils/finance';

const STORAGE_KEY_RESEND_API_KEY = '@prestago_resend_api_key';
const STORAGE_KEY_CUSTOM_FROM = '@prestago_resend_from_email';
const RESEND_API_URL = 'https://api.resend.com/emails';

/**
 * Obtiene la API Key de Resend guardada en AsyncStorage o en variables de entorno
 */
export async function getResendApiKey(): Promise<string> {
  try {
    const savedKey = await AsyncStorage.getItem(STORAGE_KEY_RESEND_API_KEY);
    if (savedKey && savedKey.trim().length > 0) {
      return savedKey.trim();
    }
  } catch (e) {
    console.warn('Error leyendo API Key de Resend de AsyncStorage:', e);
  }

  // Fallback a variable de entorno si existe
  return (process.env.EXPO_PUBLIC_RESEND_API_KEY || '').trim();
}

/**
 * Guarda la API Key de Resend en AsyncStorage
 */
export async function saveResendApiKey(apiKey: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY_RESEND_API_KEY, apiKey.trim());
}

/**
 * Elimina la API Key de Resend guardada
 */
export async function removeResendApiKey(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY_RESEND_API_KEY);
}

/**
 * Obtiene el remitente configurado (por defecto 'PrestaGo <onboarding@resend.dev>')
 */
export async function getResendFromEmail(): Promise<string> {
  try {
    const customFrom = await AsyncStorage.getItem(STORAGE_KEY_CUSTOM_FROM);
    if (customFrom && customFrom.trim().length > 0) {
      return customFrom.trim();
    }
  } catch {}
  return 'PrestaGo <onboarding@resend.dev>';
}

/**
 * Guarda un remitente personalizado (si se verifica un dominio propio en Resend)
 */
export async function saveResendFromEmail(fromEmail: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY_CUSTOM_FROM, fromEmail.trim());
}

export interface SendEmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

/**
 * Envía un correo electrónico transaccional usando la API REST de Resend
 */
export async function sendEmailWithResend(
  payload: SendEmailPayload
): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = await getResendApiKey();

  if (!apiKey) {
    return {
      success: false,
      error: 'No se ha configurado la API Key de Resend. Ingrésala en Perfil > Servicio de Correos.',
    };
  }

  const defaultFrom = await getResendFromEmail();
  const from = payload.from || defaultFrom;
  const toList = Array.isArray(payload.to) ? payload.to : [payload.to];

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: toList,
        subject: payload.subject,
        html: payload.html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.message || data.error || `Error HTTP ${response.status}`;
      return { success: false, error: errMsg };
    }

    return { success: true, id: data.id };
  } catch (error: any) {
    console.error('Error al enviar correo con Resend:', error);
    return {
      success: false,
      error: error.message || 'Error de conexión con el servicio de correo Resend.',
    };
  }
}

/**
 * Genera la plantilla HTML para el Resumen Diario de Cobros del Administrador
 */
export function generateResumenDiarioCobrosHtml({
  adminNombre,
  clientesHoy,
  totalARecaudar,
  fecha,
}: {
  adminNombre: string;
  clientesHoy: Cliente[];
  totalARecaudar: number;
  fecha: string;
}): string {
  const clientesRows = clientesHoy
    .map(
      (c, index) => `
      <tr style="border-bottom: 1px solid #E2E8F0;">
        <td style="padding: 14px 10px; font-weight: 700; color: #1E293B;">
          ${index + 1}. ${c.nombre}
          <div style="font-size: 11px; font-weight: 400; color: #64748B;">Doc: ${c.documento} • Cel: ${c.celular}</div>
        </td>
        <td style="padding: 14px 10px; text-align: right; font-weight: 800; color: #1AA965; font-size: 15px;">
          ${formatCurrency(c.cuota)}
        </td>
        <td style="padding: 14px 10px; text-align: right; color: #475569; font-size: 13px;">
          ${formatCurrency(c.totalPendiente)}
        </td>
        <td style="padding: 14px 10px; text-align: center;">
          <a href="https://wa.me/57${c.celular.replace(/[^0-9]/g, '')}" 
             style="display: inline-block; background: #E8F8F0; color: #1AA965; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: 700;">
            WhatsApp 💬
          </a>
        </td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px; }
    .card { max-width: 620px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #1AA965 0%, #13834E 100%); padding: 32px 24px; text-align: center; color: #FFFFFF; }
    .header h1 { margin: 8px 0 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 4px 0 0; font-size: 13px; opacity: 0.95; }
    .body { padding: 28px 24px; color: #1E293B; }
    .hero-metric { background: #ECFDF5; border: 1.5px solid #10B981; border-radius: 12px; padding: 18px 20px; text-align: center; margin-bottom: 24px; }
    .hero-metric-label { font-size: 12px; text-transform: uppercase; font-weight: 700; color: #047857; letter-spacing: 0.5px; }
    .hero-metric-value { font-size: 30px; font-weight: 900; color: #065F46; margin: 4px 0 0; }
    .hero-metric-sub { font-size: 12px; color: #047857; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 13px; }
    th { background: #F1F5F9; color: #475569; font-size: 11px; text-transform: uppercase; font-weight: 700; padding: 10px; text-align: left; }
    th.right { text-align: right; }
    th.center { text-align: center; }
    .footer { background: #F1F5F9; padding: 20px 24px; text-align: center; font-size: 11px; color: #64748B; border-top: 1px solid #E2E8F0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div style="font-size: 32px; margin-bottom: 4px;">💸</div>
      <h1>PrestaGo</h1>
      <p>Reporte Diario de Cobros Programados</p>
    </div>

    <div class="body">
      <p style="margin-top: 0; font-size: 15px;">Hola <strong>${adminNombre}</strong>,</p>
      <p style="color: #475569; font-size: 14px; line-height: 22px;">
        Este es el resumen oficial de las cuotas programadas para recaudar hoy <strong>${fecha}</strong> en tu cartera de PrestaGo:
      </p>

      <div class="hero-metric">
        <div class="hero-metric-label">Total a Recaudar Hoy</div>
        <div class="hero-metric-value">${formatCurrency(totalARecaudar)}</div>
        <div class="hero-metric-sub">${clientesHoy.length} ${clientesHoy.length === 1 ? 'cliente con cuota hoy' : 'clientes con cuota hoy'}</div>
      </div>

      <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #334155; margin-bottom: 8px;">
        Detalle de Clientes a Cobrar:
      </h3>

      <table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th class="right">Cuota</th>
            <th class="right">Saldo Deuda</th>
            <th class="center">Acción</th>
          </tr>
        </thead>
        <tbody>
          ${clientesRows}
        </tbody>
      </table>

      <div style="margin-top: 24px; background: #F8FAFC; border-radius: 8px; padding: 12px 16px; border-left: 4px solid #1AA965;">
        <p style="margin: 0; font-size: 12px; color: #475569;">
          💡 <strong>Consejo PrestaGo:</strong> Puedes abrir PrestaGo en tu teléfono y utilizar el Asistente IA para redactar recordatorios cordiales personalizados por WhatsApp para cada cliente.
        </p>
      </div>
    </div>

    <div class="footer">
      PrestaGo Mobile App • Control Financiero Inteligente de Créditos<br>
      Este es un reporte automático generado para tu cuenta de administrador.
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Genera la plantilla HTML para enviar el Recordatorio de Pago directamente al Cliente
 */
export function generateRecordatorioCuotaClienteHtml({
  cliente,
  negocio = 'PrestaGo',
}: {
  cliente: Cliente;
  negocio?: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px; }
    .card { max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #1AA965 0%, #13834E 100%); padding: 30px 24px; text-align: center; color: #FFFFFF; }
    .header h1 { margin: 8px 0 0; font-size: 24px; font-weight: 800; }
    .header p { margin: 4px 0 0; font-size: 13px; opacity: 0.95; }
    .body { padding: 28px 24px; color: #1E293B; }
    .quote-box { background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
    .quote-title { font-size: 12px; text-transform: uppercase; font-weight: 700; color: #047857; letter-spacing: 0.5px; }
    .quote-val { font-size: 32px; font-weight: 900; color: #065F46; margin: 6px 0 0; }
    .info-list { margin: 20px 0; background: #F8FAFC; border-radius: 10px; padding: 14px 18px; border: 1px solid #E2E8F0; }
    .info-item { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
    .info-label { color: #64748B; font-weight: 600; }
    .info-value { color: #1E293B; font-weight: 700; }
    .footer { background: #F1F5F9; padding: 18px 24px; text-align: center; font-size: 11px; color: #64748B; border-top: 1px solid #E2E8F0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div style="font-size: 32px;">💳</div>
      <h1>${negocio}</h1>
      <p>Notificación Oficial de Cuota de Crédito</p>
    </div>

    <div class="body">
      <p style="margin-top: 0; font-size: 15px;">Estimado/a <strong>${cliente.nombre}</strong>,</p>
      <p style="color: #475569; font-size: 14px; line-height: 22px;">
        Te saludamos de <strong>${negocio}</strong>. Te recordamos que el día de hoy está programada la cuota periódica de tu crédito:
      </p>

      <div class="quote-box">
        <div class="quote-title">Valor de la Cuota</div>
        <div class="quote-val">${formatCurrency(cliente.cuota)}</div>
      </div>

      <div class="info-list">
        <div class="info-item">
          <span class="info-label">Fecha de Cobro:</span>
          <span class="info-value">${formatDate(cliente.proximoCobro)}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Modalidad:</span>
          <span class="info-value">${cliente.modalidad}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Saldo Total Activo:</span>
          <span class="info-value" style="color: #1AA965;">${formatCurrency(cliente.totalPendiente)}</span>
        </div>
      </div>

      <p style="color: #475569; font-size: 13px; line-height: 20px;">
        Por favor coordina tu abono por transferencia bancaria o en efectivo con tu administrador de crédito para mantener tu historial positivo y calificar a futuros aumentos de cupo.
      </p>
    </div>

    <div class="footer">
      ${negocio} • Gestión de Microcréditos y Control Financiero<br>
      Mensaje informativo automático.
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Genera el correo de prueba para verificar que la integración con Resend funcione
 */
export function generateTestEmailHtml(adminNombre: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F8FAFC; margin: 0; padding: 24px; }
    .card { max-width: 500px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #1AA965 0%, #13834E 100%); padding: 32px 20px; text-align: center; color: #FFFFFF; }
    .body { padding: 28px 24px; color: #1E293B; }
    .tag { display: inline-block; background: #DCFCE7; color: #15803D; font-size: 12px; font-weight: 800; padding: 4px 12px; border-radius: 20px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div style="font-size: 36px; margin-bottom: 6px;">🚀</div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 800;">¡Conexión Exitosa con Resend!</h1>
      <p style="margin: 6px 0 0; opacity: 0.9; font-size: 13px;">PrestaGo Mobile App • Servicio de Correos</p>
    </div>
    <div class="body">
      <span class="tag">✓ SISTEMA DE CORREOS OPERATIVO</span>
      <p style="font-size: 15px; margin-top: 4px;">Hola <strong>${adminNombre}</strong>,</p>
      <p style="color: #475569; font-size: 14px; line-height: 22px;">
        Tu integración con <strong>Resend</strong> se ha completado correctamente en <strong>PrestaGo</strong>. 
        A partir de ahora, tu aplicación puede enviar reportes matutinos de cobro, resúmenes ejecutivos y recordatorios de cuotas con diseño profesional.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Envía el Resumen Diario de Cobros de Hoy al correo del Administrador
 */
export async function sendResumenCobrosHoy(
  adminEmail: string,
  adminNombre: string,
  clientesHoy: Cliente[]
): Promise<{ success: boolean; error?: string; enviados?: number }> {
  if (!adminEmail || !adminEmail.includes('@')) {
    return {
      success: false,
      error: 'El administrador no tiene un correo válido configurado.',
    };
  }

  if (clientesHoy.length === 0) {
    return {
      success: false,
      error: 'No hay clientes con cuotas programadas para el día de hoy.',
    };
  }

  const totalARecaudar = clientesHoy.reduce((acc, c) => acc + (c.cuota || 0), 0);
  const fechaHoyStr = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = generateResumenDiarioCobrosHtml({
    adminNombre,
    clientesHoy,
    totalARecaudar,
    fecha: fechaHoyStr,
  });

  const subject = `💸 Resumen de Cobros de Hoy (${clientesHoy.length} cuotas — ${formatCurrency(totalARecaudar)}) — PrestaGo`;

  const res = await sendEmailWithResend({
    to: adminEmail,
    subject,
    html,
  });

  if (res.success) {
    return { success: true, enviados: clientesHoy.length };
  } else {
    return { success: false, error: res.error };
  }
}

/**
 * Envía un correo de prueba de verificación
 */
export async function sendTestEmailToAdmin(
  adminEmail: string,
  adminNombre: string
): Promise<{ success: boolean; error?: string }> {
  if (!adminEmail || !adminEmail.includes('@')) {
    return {
      success: false,
      error: 'Ingresa un correo electrónico de destino válido.',
    };
  }

  const html = generateTestEmailHtml(adminNombre);
  const subject = '🚀 Prueba de Envío de Correo — PrestaGo & Resend';

  return await sendEmailWithResend({
    to: adminEmail,
    subject,
    html,
  });
}
