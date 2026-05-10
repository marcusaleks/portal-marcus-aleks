import type { IPCAData, FeriadosData } from "../types/market-data";
import {
  toISO,
  addDays,
  ultimoDiaUtil,
  buildFeriadosSet,
  buscaAnteriorOuIgual,
} from "./utils";

export interface IndiceIPCAResult {
  indice_ini: number;
  indice_fim: number;
  fator: number;
  data_ini_efetiva: string;
  data_fim_efetiva: string;
}

/**
 * Retorna o fator IPCA entre duas datas via razão de números-índice diários.
 *
 * Convenção overnight (alinhada com SELIC):
 *   ini = índice do DU anterior a data_ini
 *   fim = índice do DU anterior a data_fim
 * Assim a taxa do dia de entrada entra no acumulado; a do dia de saída não.
 */
export function calcularFatorIPCA(
  dataIni: Date,
  dataFim: Date,
  ipca: IPCAData,
  feriados: FeriadosData
): IndiceIPCAResult {
  const feriadosSet = buildFeriadosSet(feriados);
  const dataIniEfetiva = ultimoDiaUtil(addDays(dataIni, -1), feriadosSet);
  const dataFimEfetiva = ultimoDiaUtil(addDays(dataFim, -1), feriadosSet);

  const isoIni = toISO(dataIniEfetiva);
  const isoFim = toISO(dataFimEfetiva);

  const entryIni = buscaAnteriorOuIgual(ipca.data, isoIni);
  const entryFim = buscaAnteriorOuIgual(ipca.data, isoFim);

  if (!entryIni) throw new Error(`IPCA: sem dados disponíveis para ou antes de ${isoIni}`);
  if (!entryFim) throw new Error(`IPCA: sem dados disponíveis para ou antes de ${isoFim}`);

  const fator = entryFim.indice / entryIni.indice;

  return {
    indice_ini: entryIni.indice,
    indice_fim: entryFim.indice,
    fator,
    data_ini_efetiva: isoIni,
    data_fim_efetiva: isoFim,
  };
}

/**
 * Retorna o número-índice IPCA na data informada.
 *
 * Convenção overnight (alinhada com SELIC): recua 1 dia e pega o último DU
 * anterior, de modo que a taxa do próprio dia de entrada entra no acumulado.
 */
export function indiceIPCANaData(
  data: Date,
  ipca: IPCAData,
  feriados: FeriadosData
): number {
  const feriadosSet = buildFeriadosSet(feriados);
  const dataAnterior = ultimoDiaUtil(addDays(data, -1), feriadosSet);
  const iso = toISO(dataAnterior);

  const entry = buscaAnteriorOuIgual(ipca.data, iso);
  if (!entry) {
    return ipca.base_value ?? 1;
  }
  return entry.indice;
}
