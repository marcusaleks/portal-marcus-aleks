import type { SELICData, FeriadosData } from "../types/market-data";
import {
  toISO,
  fromISO,
  addDays,
  isDiaUtil,
  ultimoDiaUtil,
  buildFeriadosSet,
  buscaAnteriorOuIgual,
} from "./utils";

export interface IndiceSelicResult {
  indice_ini: number;
  indice_fim: number;
  fator: number;
  data_ini_efetiva: string; // dia útil usado (pode diferir do pedido)
  data_fim_efetiva: string;
}

/**
 * Retorna o fator SELIC entre duas datas.
 *
 * Regras da especificação:
 * - Acumulação começa em data_ini e termina no dia útil ANTERIOR a data_fim
 * - Feriados/fins de semana: fator = 1 (índice não muda)
 * - Se data_ini ou data_fim forem não-úteis, retroatua para o último dia útil
 *
 * Os dados em SELICData.data contêm o índice acumulado pré-calculado.
 * Se o dado exato não existir, interpola usando o último disponível anterior.
 */
export function calcularFatorSelic(
  dataIni: Date,
  dataFim: Date,
  selic: SELICData,
  feriados: FeriadosData
): IndiceSelicResult {
  const feriadosSet = buildFeriadosSet(feriados);

  // Regra: SELIC termina no dia útil anterior a data_fim
  const dataFimEfetiva = ultimoDiaUtil(addDays(dataFim, -1), feriadosSet);
  const dataIniEfetiva = ultimoDiaUtil(dataIni, feriadosSet);

  const isoIni = toISO(dataIniEfetiva);
  const isoFim = toISO(dataFimEfetiva);

  // Buscar registros — usa buscaAnteriorOuIgual para tolerar gaps de dados
  const entryIni = buscaAnteriorOuIgual(selic.data, isoIni);
  const entryFim = buscaAnteriorOuIgual(selic.data, isoFim);

  if (!entryIni) {
    throw new Error(
      `SELIC: sem dados disponíveis para ou antes de ${isoIni}`
    );
  }
  if (!entryFim) {
    throw new Error(
      `SELIC: sem dados disponíveis para ou antes de ${isoFim}`
    );
  }

  const fator = entryFim.indice_acumulado / entryIni.indice_acumulado;

  return {
    indice_ini: entryIni.indice_acumulado,
    indice_fim: entryFim.indice_acumulado,
    fator,
    data_ini_efetiva: isoIni,
    data_fim_efetiva: isoFim,
  };
}

/**
 * Retorna o fator SELIC de uma data específica (para cálculo de fluxo individualizado).
 * Retroatua para o último dia útil se necessário.
 */
export function indiceSelicNaData(
  data: Date,
  selic: SELICData,
  feriados: FeriadosData
): number {
  const feriadosSet = buildFeriadosSet(feriados);
  const dataEfetiva = ultimoDiaUtil(data, feriadosSet);
  const iso = toISO(dataEfetiva);

  const entry = buscaAnteriorOuIgual(selic.data, iso);
  if (!entry) {
    throw new Error(`SELIC: sem dados para ${iso}`);
  }
  return entry.indice_acumulado;
}
