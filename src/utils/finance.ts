import { Cliente, EstadoMora, ModalidadCredito } from '@/types';
import {
  calcularNuevoPrestamo,
  procesarAbonoLibre,
  LoanCalculationInput,
  LoanCalculationResult,
  ModalidadLoanInput,
} from './loanCalculations';

export const PLAZO_INDEFINIDO_CUOTAS = 999;

export {
  calcularNuevoPrestamo,
  procesarAbonoLibre,
  LoanCalculationInput,
  LoanCalculationResult,
  ModalidadLoanInput,
};

/**
 * Calcula la cuota mensual y totales según las reglas oficiales de PrestaGo:
 * 1. Amortizado (Capital + Interés):
 *    - Plazo Fijo: Interés Total = Monto * (%interés / 100)
 *                  Deuda Total = Monto + Interés Total
 *                  Cuota Mensual Fija = Deuda Total / Plazo
 *    - Plazo Indefinido (999): Cuota mensual fija = Monto * (%interés / 100)
 * 2. Solo Intereses (Capital al final):
 *    - Cuota fija mensual = Monto * (%interés / 100). El capital prestado permanece intacto.
 */
export function calcularCuota({
  monto,
  tasaInteres,
  cuotasTotales,
  modalidad,
}: {
  monto: number;
  tasaInteres: number;
  cuotasTotales: number;
  modalidad: ModalidadCredito;
}): {
  cuota: number;
  interesTotal: number;
  totalAPagar: number;
  abonoCapitalPorCuota: number;
  abonoInteresPorCuota: number;
} {
  const res = calcularNuevoPrestamo({
    monto,
    porcentajeInteres: tasaInteres,
    cuotasTotales,
    modalidad,
  });

  return {
    cuota: res.cuotaMensual,
    interesTotal: res.interesTotal,
    totalAPagar: res.totalAPagar,
    abonoCapitalPorCuota: res.abonoCapitalPorCuota,
    abonoInteresPorCuota: res.abonoInteresPorCuota,
  };
}

/**
 * Determina el estado del semáforo según los días de mora o si está a paz y salvo
 */
export function determinarEstadoMora(
  capitalPendiente: number,
  interesPendiente: number,
  diasMora: number
): EstadoMora {
  if (capitalPendiente <= 0 && interesPendiente <= 0) {
    return 'paz_y_salvo';
  }
  if (diasMora >= 90) return 'mora_3';
  if (diasMora >= 60) return 'mora_2';
  if (diasMora >= 30) return 'mora_1';
  return 'al_dia';
}

/**
 * Obtiene la configuración visual del semáforo según el estado
 */
export function getInfoEstadoMora(estado: EstadoMora) {
  switch (estado) {
    case 'paz_y_salvo':
      return {
        label: 'A Paz y Salvo',
        color: '#475569',
        bgColor: '#F1F5F9',
        borderColor: '#475569',
        badge: 'PAZ Y SALVO',
        descripcion: 'Deuda liquidada al 100%',
      };
    case 'al_dia':
      return {
        label: 'Al Día',
        color: '#1AA965',
        bgColor: '#E8F8F0',
        borderColor: '#1AA965',
        badge: 'AL DÍA',
        descripcion: 'Pagos al corriente',
      };
    case 'mora_1':
      return {
        label: '1 Mes de Mora',
        color: '#F59E0B',
        bgColor: '#FEF3C7',
        borderColor: '#F59E0B',
        badge: '1 MES MORA',
        descripcion: 'Retraso de 30 a 59 días',
      };
    case 'mora_2':
      return {
        label: '2 Meses de Mora',
        color: '#F97316',
        bgColor: '#FFEDD5',
        borderColor: '#F97316',
        badge: '2 MESES MORA',
        descripcion: 'Retraso de 60 a 89 días',
      };
    case 'mora_3':
      return {
        label: '3+ Meses de Mora',
        color: '#EF4444',
        bgColor: '#FEE2E2',
        borderColor: '#EF4444',
        badge: 'EN COBRO JURÍDICO',
        descripcion: 'Mora crítica superior a 90 días',
      };
  }
}

/**
 * Aplica un abono libre a un cliente respetando la Regla de Oro de PrestaGo:
 * 1. Abono a Capital: Se descuenta directamente de capitalPendiente. Si excede capital, el excedente amortiza interés.
 * 2. Abono a Interés: Se descuenta directamente de interesPendiente. Si excede interés, el excedente amortiza capital.
 * 3. LA CUOTA MENSUAL NO SE REDUCE NI SE RECALCULA. Permanecerá fija e inalterada hasta saldo $0.
 * 4. Si totalPendiente <= 0, el préstamo pasa a estado Paz y Salvo.
 */
export function aplicarAbonoACliente(
  cliente: Cliente,
  montoAbono: number,
  tipoAbono: 'Capital' | 'Interés' | 'Mixto' | 'Cuota'
): {
  nuevoCapitalPendiente: number;
  nuevoInteresPendiente: number;
  nuevoTotalPendiente: number;
  nuevoEstado: EstadoMora;
  abonoCapital: number;
  abonoInteres: number;
  cuotasPagadasIncremento: number;
} {
  let nuevoCap = cliente.capitalPendiente;
  let nuevoInt = cliente.interesPendiente;
  let abonoCap = 0;
  let abonoInt = 0;
  let cuotasIncremento = 0;

  if (tipoAbono === 'Capital') {
    const res = procesarAbonoLibre({
      capitalPendiente: nuevoCap,
      interesPendiente: nuevoInt,
      cuotaMensual: cliente.cuota,
      abonoIngresado: montoAbono,
      tipoAbono: 'capital',
    });
    abonoCap = nuevoCap - res.nuevoCapitalPendiente;
    abonoInt = nuevoInt - res.nuevoInteresPendiente;
    nuevoCap = res.nuevoCapitalPendiente;
    nuevoInt = res.nuevoInteresPendiente;
  } else if (tipoAbono === 'Interés') {
    const res = procesarAbonoLibre({
      capitalPendiente: nuevoCap,
      interesPendiente: nuevoInt,
      cuotaMensual: cliente.cuota,
      abonoIngresado: montoAbono,
      tipoAbono: 'interes',
    });
    abonoCap = nuevoCap - res.nuevoCapitalPendiente;
    abonoInt = nuevoInt - res.nuevoInteresPendiente;
    nuevoCap = res.nuevoCapitalPendiente;
    nuevoInt = res.nuevoInteresPendiente;
    cuotasIncremento = Math.floor(montoAbono / (cliente.cuota > 0 ? cliente.cuota : 1));
  } else if (tipoAbono === 'Cuota') {
    cuotasIncremento = 1;
    if (
      cliente.modalidad === 'Solo Intereses' ||
      cliente.cuotasTotales === PLAZO_INDEFINIDO_CUOTAS
    ) {
      // En Solo Intereses o Plazo Indefinido la cuota regular es interés
      const res = procesarAbonoLibre({
        capitalPendiente: nuevoCap,
        interesPendiente: nuevoInt,
        cuotaMensual: cliente.cuota,
        abonoIngresado: montoAbono,
        tipoAbono: 'interes',
      });
      abonoCap = nuevoCap - res.nuevoCapitalPendiente;
      abonoInt = nuevoInt - res.nuevoInteresPendiente;
      nuevoCap = res.nuevoCapitalPendiente;
      nuevoInt = res.nuevoInteresPendiente;
    } else {
      // En Amortizado con plazo definido:
      // Abono a Capital por cuota = Monto / Plazo
      // Abono a Interés por cuota = Interés Total / Plazo
      const plazoValido = cliente.cuotasTotales > 0 ? cliente.cuotasTotales : 1;
      const interesTotalCalculado = cliente.monto * (cliente.tasaInteres / 100);
      const intPorCuota = Math.round(interesTotalCalculado / plazoValido);
      const capPorCuota = Math.round(cliente.monto / plazoValido);

      const intAPagar = Math.min(intPorCuota, nuevoInt);
      nuevoInt -= intAPagar;
      abonoInt = intAPagar;

      const capRestante = montoAbono - intAPagar;
      if (capRestante > 0) {
        const capAPagar = Math.min(capRestante, nuevoCap);
        nuevoCap -= capAPagar;
        abonoCap = capAPagar;

        const sobrante = capRestante - capAPagar;
        if (sobrante > 0 && nuevoInt > 0) {
          const extraInt = Math.min(sobrante, nuevoInt);
          nuevoInt -= extraInt;
          abonoInt += extraInt;
        }
      }
    }
  } else {
    // Mixto o Liquidación Total: Primero cubre intereses y el remanente amortiza capital
    const res = procesarAbonoLibre({
      capitalPendiente: nuevoCap,
      interesPendiente: nuevoInt,
      cuotaMensual: cliente.cuota,
      abonoIngresado: montoAbono,
      tipoAbono: 'interes',
    });
    abonoCap = nuevoCap - res.nuevoCapitalPendiente;
    abonoInt = nuevoInt - res.nuevoInteresPendiente;
    nuevoCap = res.nuevoCapitalPendiente;
    nuevoInt = res.nuevoInteresPendiente;
    cuotasIncremento = Math.floor(montoAbono / (cliente.cuota > 0 ? cliente.cuota : 1));
  }

  const nuevoTotal = Math.max(0, nuevoCap + nuevoInt);
  const nuevoEstado = nuevoTotal <= 0 ? 'paz_y_salvo' : cliente.estadoMora;

  return {
    nuevoCapitalPendiente: nuevoCap,
    nuevoInteresPendiente: nuevoInt,
    nuevoTotalPendiente: nuevoTotal,
    nuevoEstado,
    abonoCapital: abonoCap,
    abonoInteres: abonoInt,
    cuotasPagadasIncremento: cuotasIncremento,
  };
}

/**
 * Formateador de moneda colombiana / estándar latino ($ 1.250.000)
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '$0';
  return '$' + Math.round(amount).toLocaleString('es-CO');
}

/**
 * Formateador de fecha legible
 */
export function formatDate(dateString: string): string {
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const months = [
        'Ene',
        'Feb',
        'Mar',
        'Abr',
        'May',
        'Jun',
        'Jul',
        'Ago',
        'Sep',
        'Oct',
        'Nov',
        'Dic',
      ];
      return `${day} ${months[monthIndex]} ${year}`;
    }
    const d = new Date(dateString);
    return d.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}
