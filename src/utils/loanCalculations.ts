/**
 * Helper financiero central para PrestaGo.
 * Implementa las reglas matemáticas y de negocio obligatorias:
 * 1. Modalidad "Amortizado (Capital + Interés)":
 *    - Plazo Fijo: Interés Total = Monto * (%interés / 100). Cuota = (Monto + Interés Total) / Plazo.
 *    - Plazo Indefinido (999): Cuota mensual = Monto * (%interés / 100).
 * 2. Modalidad "Solo Intereses (Capital al final)":
 *    - Cuota fija mensual = Monto * (%interés / 100). El capital permanece intacto hasta abono a capital.
 * 3. Regla de Oro en Abonos Libres:
 *    - La Cuota Mensual NO SE REDUCE NI SE RECALCULA. Permanece fija e inalterada hasta saldo $0.
 */

export type ModalidadLoanInput =
  | 'Amortizado (Capital + Interés)'
  | 'Solo Intereses (Capital al final)'
  | 'Amortizado'
  | 'Solo Intereses';

export interface LoanCalculationInput {
  monto: number;
  porcentajeInteres: number;
  cuotasTotales: number; // 999 para Plazo Indefinido
  modalidad: ModalidadLoanInput;
}

export interface LoanCalculationResult {
  cuotaMensual: number;
  capitalPendiente: number;
  interesPendiente: number;
  totalPendiente: number;
  interesTotal: number;
  totalAPagar: number;
  abonoCapitalPorCuota: number;
  abonoInteresPorCuota: number;
}

/**
 * Calcula la proyección inicial de un préstamo nuevo
 */
export function calcularNuevoPrestamo(input: LoanCalculationInput): LoanCalculationResult {
  const { monto, porcentajeInteres, cuotasTotales, modalidad } = input;
  const esIndefinido = cuotasTotales === 999;
  const esSoloIntereses =
    modalidad === 'Solo Intereses (Capital al final)' || modalidad === 'Solo Intereses';

  let cuotaMensual = 0;
  let interesTotal = 0;
  let abonoCapitalPorCuota = 0;
  let abonoInteresPorCuota = 0;

  if (esIndefinido || esSoloIntereses) {
    // Cuota de interés mensual fija basada en el monto principal
    cuotaMensual = monto * (porcentajeInteres / 100);
    // En plazo indefinido o solo intereses, el interés del ciclo base inicial es la cuota mensual
    interesTotal = cuotaMensual * (esIndefinido ? 1 : cuotasTotales);
    abonoCapitalPorCuota = 0;
    abonoInteresPorCuota = cuotaMensual;
  } else {
    // Amortizado con plazo fijo:
    // 1. Interés Total = Monto * (Interés % / 100)
    interesTotal = monto * (porcentajeInteres / 100);
    // 2. Deuda Total Inicial = Monto + Interés Total
    const totalPagar = monto + interesTotal;
    // 3. Cuota Mensual Fija = Deuda Total / Plazo
    const plazoValido = cuotasTotales > 0 ? cuotasTotales : 1;
    cuotaMensual = totalPagar / plazoValido;
    // 4. Desglose interno por cuota
    abonoCapitalPorCuota = monto / plazoValido;
    abonoInteresPorCuota = interesTotal / plazoValido;
  }

  const capitalPendiente = monto;
  const interesPendiente = interesTotal;
  const totalPendiente = capitalPendiente + interesPendiente;

  return {
    cuotaMensual: Math.round(cuotaMensual),
    capitalPendiente: Math.round(capitalPendiente),
    interesPendiente: Math.round(interesPendiente),
    totalPendiente: Math.round(totalPendiente),
    interesTotal: Math.round(interesTotal),
    totalAPagar: Math.round(capitalPendiente + interesTotal),
    abonoCapitalPorCuota: Math.round(abonoCapitalPorCuota),
    abonoInteresPorCuota: Math.round(abonoInteresPorCuota),
  };
}

/**
 * Procesa un Abono Libre a Capital o Interés sin alterar la cuota fija
 */
export function procesarAbonoLibre(params: {
  capitalPendiente: number;
  interesPendiente: number;
  cuotaMensual: number;
  abonoIngresado: number;
  tipoAbono: 'capital' | 'interes';
}) {
  let simCapital = params.capitalPendiente;
  let simInteres = params.interesPendiente;
  const { abonoIngresado, tipoAbono } = params;

  if (tipoAbono === 'interes') {
    if (abonoIngresado > simInteres) {
      const sobrante = abonoIngresado - simInteres;
      simInteres = 0;
      simCapital = Math.max(0, simCapital - sobrante);
    } else {
      simInteres -= abonoIngresado;
    }
  } else {
    // Abono a Capital
    if (abonoIngresado > simCapital) {
      const sobrante = abonoIngresado - simCapital;
      simCapital = 0;
      simInteres = Math.max(0, simInteres - sobrante);
    } else {
      simCapital -= abonoIngresado;
    }
  }

  const totalRestante = Math.max(0, simCapital + simInteres);

  return {
    nuevoCapitalPendiente: Math.round(simCapital),
    nuevoInteresPendiente: Math.round(simInteres),
    nuevoTotalPendiente: Math.round(totalRestante),
    // La cuota mensual NO se modifica
    cuotaMensual: params.cuotaMensual,
    pagoCompletado: totalRestante <= 0,
  };
}

