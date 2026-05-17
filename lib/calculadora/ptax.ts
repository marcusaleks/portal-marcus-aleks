import type { PTAXData, FeriadosData } from "../types/market-data";
import {
  toISO,
  ultimoDiaUtil,
  buildFeriadosSet,
  buscaAnteriorOuIgual,
} from "./utils";

export interface IndicePTAXResult {
  cotacao_ini: number;
  cotacao_fim: number;
  fator: number;
  data_ini_efetiva: string;
  data_fim_efetiva: string;
}

/**
 * Retorna o fator PTAX entre duas datas.
 *
 * Regras da especificação:
 * - Se data_ini ou data_fim forem feriado/fim de semana → retroatuar para último dia útil anterior
 * - Fator = PTAX_fim / PTAX_ini
 */
export function calcularFatorPTAX(
  dataIni: Date,
  dataFim: Date,
  ptax: PTAXData,
  feriados: FeriadosData
): IndicePTAXResult {
  const feriadosSet = buildFeriadosSet(feriados);

  const dataIniEfetiva = ultimoDiaUtil(dataIni, feriadosSet);
  const dataFimEfetiva = ultimoDiaUtil(dataFim, feriadosSet);

  const cotacaoIni = buscarCotacao(dataIniEfetiva, ptax);
  const cotacaoFim = buscarCotacao(dataFimEfetiva, ptax);

  if (cotacaoIni === 0) throw new Error(`PTAX: cotação zero em ${toISO(dataIniEfetiva)}`);

  return {
    cotacao_ini: cotacaoIni,
    cotacao_fim: cotacaoFim,
    fator: cotacaoFim / cotacaoIni,
    data_ini_efetiva: toISO(dataIniEfetiva),
    data_fim_efetiva: toISO(dataFimEfetiva),
  };
}

/**
 * Cotação PTAX para uma data específica — exposto para uso no orquestrador de fluxo.
 * Retroatua para o último dia útil com dados disponíveis.
 */
export function indicePTAXNaData(
  data: Date,
  ptax: PTAXData,
  feriados: FeriadosData
): number {
  const feriadosSet = buildFeriadosSet(feriados);
  const dataEfetiva = ultimoDiaUtil(data, feriadosSet);
  return buscarCotacao(dataEfetiva, ptax);
}

function buscarCotacao(data: Date, ptax: PTAXData): number {
  const iso = toISO(data);
  const entry = buscaAnteriorOuIgual(ptax.data, iso);
  if (!entry) {
    throw new Error(`PTAX: sem dados disponíveis para ou antes de ${iso}`);
  }
  return entry.cotacao;
}
