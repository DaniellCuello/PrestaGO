export type ModalidadCredito = 'Amortizado' | 'Solo Intereses';

export type EstadoMora = 'al_dia' | 'mora_1' | 'mora_2' | 'mora_3' | 'paz_y_salvo';

export type TipoPago = 'Cuota' | 'Abono Capital' | 'Abono Interés' | 'Pago Total' | 'Abono Libre';

export interface Administrador {
  uid: string;
  nombres: string;
  documento: string;
  celular: string;
  fotoPerfil?: string;
  email?: string;
  negocio?: string;
}

export interface UsuarioAuth extends Administrador {
  password?: string;
  createdAt?: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  documento: string;
  celular: string;
  ubicacion: string;
  coordenadas?: { lat: number; lng: number };
  direccionDetalle?: string;
  modalidad: ModalidadCredito;
  monto: number; // Monto inicial prestado
  tasaInteres: number; // Porcentaje mensual ej. 10 (%)
  cuota: number; // Cuota fija acordada
  cuotasPagadas: number;
  cuotasTotales: number; // 999 = Plazo Indefinido (Mes a Mes)
  capitalPendiente: number;
  interesPendiente: number;
  totalPendiente: number;
  fechaInicio: string; // Formato YYYY-MM-DD
  proximoCobro: string; // Formato YYYY-MM-DD
  estadoMora: EstadoMora;
  diasMora: number;
  esMigrado?: boolean;
  notas?: string;
  createdAt?: string;
}

export interface HistorialPago {
  id: string;
  clienteId: string;
  clienteNombre?: string;
  monto: number;
  tipo: TipoPago;
  abonoCapital: number;
  abonoInteres: number;
  numeroCuota: number;
  fechaPago: string; // ISO string o YYYY-MM-DD
  nota?: string;
}

export interface MetricasFinancieras {
  capitalEnLaCalle: number;
  dineroRecuperado: number;
  gananciasIntereses: number;
  clientesActivos: number;
  clientesEnMora: number;
  totalClientes: number;
}

export interface ProyeccionRecaudoMes {
  mes: string;
  capitalEsperado: number;
  interesEsperado: number;
  totalEsperado: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionableWhatsAppText?: string;
}

