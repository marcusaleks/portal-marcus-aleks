import type { IPCAData, FeriadosData } from "../types/market-data";
import {
  toISO,
  fromISO,
  addDays,
  ultimoDiaUtil,
  buildFeriadosSet,
  contarDiasUteis,
  buscaAnteriorOuIgual,
} from "./utils";

export interface IndiceIPCAResult {
  vna_ini: number;
  vna_fim: number;
  fator: number;
  data_ini_efetiva: string;
  data_fim_efetiva: string;
}

/**
 * Calcula o VNA (Valor Nominal Atualizado) para uma data específica.
 *
 * Fórmula: VNA_d = VNA_15ant × (1 + IPCA_mes)^(du / DU)
 *   - VNA_15ant: VNA do dia 15 do mês anterior
 *   - IPCA_mes:  IPCA do mês corrente (decimal, ex: 0.0052 para 0,52%)
 *   - du:        dias úteis de [15_ant+1 .. d] inclusive
 *   - DU:        total de dias úteis de [15_ant+1 .. 15_cor] inclusive
 *
 * Para datas no dia 15 ou anteriores do mês, usa o VNA do mês anterior.
 * Usa o último IPCA disponível (oficial ou projeção) como estimativa.
 */
export function calcularVNA(
  data: Date,
  ipca: IPCAData,
  feriados: FeriadosData
): number {
  const feriadosSet = buildFeriadosSet(feriados);

  // Determinar o 15 do mês anterior como âncora
  const ano = data.getFullYear();
  const mes = data.getMonth(); // 0-based
  const dia = data.getDate();

  // Se data <= dia 15 do mês corrente, âncora é 15 do mês anterior
  // Se data > dia 15 do mês corrente, âncora é 15 do mês corrente
  let anoAncora: number;
  let mesAncora: number; // 0-based
  let ipcaMesDecimal: number;

  if (dia <= 15) {
    // Âncora: 15 do mês anterior
    if (mes === 0) {
      anoAncora = ano - 1;
      mesAncora = 11;
    } else {
      anoAncora = ano;
      mesAncora = mes - 1;
    }
    // IPCA do mês corrente (ainda não completou o mês)
    const ipcaMesStr = `${String(ano).padStart(4, "0")}-${String(mes + 1).padStart(2, "0")}`;
    ipcaMesDecimal = obterIPCAMes(ipcaMesStr, ipca) / 100;
  } else {
    // Âncora: 15 do mês corrente
    anoAncora = ano;
    mesAncora = mes;
    // IPCA do mês corrente
    const ipcaMesStr = `${String(ano).padStart(4, "0")}-${String(mes + 1).padStart(2, "0")}`;
    ipcaMesDecimal = obterIPCAMes(ipcaMesStr, ipca) / 100;
  }

  const dataAncora = new Date(anoAncora, mesAncora, 15);

  // VNA na âncora — usa buscaAnteriorOuIgual no histórico
  const isoAncora = toISO(dataAncora);
  const entryAncora = buscaAnteriorOuIgual(ipca.vna_historico, isoAncora);
  const vnaAncora = entryAncora ? entryAncora.vna : 1000; // base 1000 se não há histórico

  // Calcular du = dias úteis de (âncora, data] exclusive âncora, inclusive data
  const du = contarDiasUteis(addDays(dataAncora, 1), addDays(data, 1), feriadosSet);

  // Calcular DU = dias úteis do mês correto: de (âncora, próximo_15] exclusive âncora
  let anoProx15: number;
  let mesProx15: number;
  if (mesAncora === mes) {
    // âncora é 15 do mês corrente — DU até 15 do próximo mês
    if (mes === 11) {
      anoProx15 = ano + 1;
      mesProx15 = 0;
    } else {
      anoProx15 = ano;
      mesProx15 = mes + 1;
    }
  } else {
    // âncora é 15 do mês anterior — DU até 15 do mês corrente
    anoProx15 = ano;
    mesProx15 = mes;
  }
  const dataProx15 = new Date(anoProx15, mesProx15, 15);
  const DU = contarDiasUteis(addDays(dataAncora, 1), addDays(dataProx15, 1), feriadosSet);

  if (DU === 0) return vnaAncora;

  // VNA interpolado
  const vna = vnaAncora * Math.pow(1 + ipcaMesDecimal, du / DU);
  return parseFloat(vna.toFixed(6));
}

/**
 * Obtém o IPCA (em %) de um mês no formato "YYYY-MM".
 * Prioridade: histórico real > oficial > projeção.
 */
function obterIPCAMes(mesISO: string, ipca: IPCAData): number {
  // Busca no histórico de VNA: o valor do mês anterior ao solicitado
  // O vna_historico guarda o IPCA mensal em cada registro — tentamos encontrar o mês correto
  const entry = buscaAnteriorOuIgual(
    ipca.vna_historico,
    `${mesISO}-28` // último possível do mês
  );
  if (entry && entry.date.startsWith(mesISO)) {
    return entry.vna; // vna aqui é o % mensal na série 433
  }

  // Fallback: oficial ou projeção
  if (ipca.oficial && ipca.oficial.mes === mesISO) {
    return ipca.oficial.valor;
  }
  if (ipca.projecao && ipca.projecao.mes === mesISO) {
    return ipca.projecao.valor;
  }

  // Último valor disponível como estimativa
  if (ipca.vna_historico.length > 0) {
    return ipca.vna_historico[ipca.vna_historico.length - 1].vna;
  }

  return ipca.oficial?.valor ?? ipca.projecao?.valor ?? 0;
}

/**
 * Retorna o fator IPCA entre duas datas via razão de VNAs.
 */
export function calcularFatorIPCA(
  dataIni: Date,
  dataFim: Date,
  ipca: IPCAData,
  feriados: FeriadosData
): IndiceIPCAResult {
  const feriadosSet = buildFeriadosSet(feriados);
  const dataIniEfetiva = ultimoDiaUtil(dataIni, feriadosSet);
  const dataFimEfetiva = ultimoDiaUtil(dataFim, feriadosSet);

  const vnaIni = calcularVNA(dataIniEfetiva, ipca, feriados);
  const vnaFim = calcularVNA(dataFimEfetiva, ipca, feriados);

  if (vnaIni === 0) throw new Error("IPCA: VNA inicial é zero");

  return {
    vna_ini: vnaIni,
    vna_fim: vnaFim,
    fator: vnaFim / vnaIni,
    data_ini_efetiva: toISO(dataIniEfetiva),
    data_fim_efetiva: toISO(dataFimEfetiva),
  };
}

/**
 * VNA para uma data específica — exposto para uso no orquestrador de fluxo.
 */
export function indiceIPCANaData(
  data: Date,
  ipca: IPCAData,
  feriados: FeriadosData
): number {
  const feriadosSet = buildFeriadosSet(feriados);
  const dataEfetiva = ultimoDiaUtil(data, feriadosSet);
  return calcularVNA(dataEfetiva, ipca, feriados);
}
