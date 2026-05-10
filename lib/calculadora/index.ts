import type {
  InputCalculadora,
  OutputCalculadora,
  ErroCalculadora,
  ResultadoCalculadora,
  DetalhamentoFluxo,
  MarketData,
} from "../types/market-data";
import { indiceSelicNaData } from "./selic";
import { indiceIPCANaData } from "./ipca";
import { indicePTAXNaData } from "./ptax";
import { toISO, contarDiasUteis, buildFeriadosSet, ultimoDiaUtil } from "./utils";

// Limite de segurança contra overflow numérico
const PERIODO_MAXIMO_ANOS = 50;

type ObterIndiceFn = (data: Date, marketData: MarketData) => number;

function resolverObterIndice(
  indice: InputCalculadora["indice"]
): ObterIndiceFn {
  switch (indice) {
    case "selic":
      return (d, md) => indiceSelicNaData(d, md.selic, md.feriados);
    case "ipca":
      return (d, md) => indiceIPCANaData(d, md.ipca, md.feriados);
    case "ptax":
      return (d, md) => indicePTAXNaData(d, md.ptax, md.feriados);
  }
}

/**
 * Calcula a evolução de uma carteira indexada com múltiplos fluxos de caixa.
 *
 * Algoritmo — Valor Presente Individualizado:
 *   Saldo_Final = Σ V_i × (Índice_final / Índice_i)
 *
 * Onde:
 *   V_i       = valor do fluxo i (positivo = aporte, negativo = resgate)
 *   Índice_i  = índice na data do fluxo i
 *   Índice_final = índice na data_final
 */
export function calcular(input: InputCalculadora): ResultadoCalculadora {
  const { valor_inicial, fluxos, data_inicial, data_final, indice, marketData } = input;

  // ── Validações ──────────────────────────────────────────────────────────────

  if (isNaN(data_inicial.getTime()) || isNaN(data_final.getTime())) {
    return erro("DATA_INVALIDA", "data_inicial ou data_final inválida.");
  }

  if (data_final <= data_inicial) {
    return erro("PERIODO_INVALIDO", "data_final deve ser posterior a data_inicial.");
  }

  const anosDecorridos =
    (data_final.getTime() - data_inicial.getTime()) / (365.25 * 24 * 3600 * 1000);
  if (anosDecorridos > PERIODO_MAXIMO_ANOS) {
    return erro(
      "OVERFLOW_NUMERICO",
      `Período de ${anosDecorridos.toFixed(1)} anos excede o limite de ${PERIODO_MAXIMO_ANOS} anos.`
    );
  }

  for (const f of fluxos) {
    if (f.data < data_inicial || f.data > data_final) {
      return erro(
        "FLUXO_FORA_PERIODO",
        `Fluxo de ${toISO(f.data)} está fora do período [${toISO(data_inicial)}, ${toISO(data_final)}].`,
        { data: toISO(f.data) }
      );
    }
  }

  // ── Cálculo ─────────────────────────────────────────────────────────────────

  const feriadosSet = buildFeriadosSet(marketData.feriados);
  const obterIndice = resolverObterIndice(indice);

  let indice_final: number;
  try {
    indice_final = obterIndice(data_final, marketData);
  } catch (e: any) {
    return erro("DADOS_INCOMPLETOS", `Índice ${indice} indisponível em data_final: ${e.message}`);
  }

  // Montar lista de fluxos (valor_inicial + aportes/resgates)
  const todosFluxos = [
    { data: data_inicial, valor: valor_inicial },
    ...fluxos.map((f) => ({ data: f.data, valor: f.valor })),
  ];

  const detalhamento: DetalhamentoFluxo[] = [];
  let saldo_final = 0;

  for (const f of todosFluxos) {
    let indice_data: number;
    try {
      indice_data = obterIndice(f.data, marketData);
    } catch (e: any) {
      return erro(
        "INDICE_NAO_ENCONTRADO",
        `Índice ${indice} indisponível em ${toISO(f.data)}: ${e.message}`,
        { data: toISO(f.data) }
      );
    }

    if (indice_data === 0) {
      return erro(
        "INDICE_NAO_ENCONTRADO",
        `Índice ${indice} é zero em ${toISO(f.data)} — divisão impossível.`,
        { data: toISO(f.data) }
      );
    }

    const valor_corrigido = f.valor * (indice_final / indice_data);
    saldo_final += valor_corrigido;

    detalhamento.push({
      data: f.data,
      fluxo: f.valor,
      indice_valor: indice_data,
      valor_corrigido: parseFloat(valor_corrigido.toFixed(2)),
    });
  }

  saldo_final = parseFloat(saldo_final.toFixed(2));

  const taxa_retorno_decimal = (saldo_final - valor_inicial) / valor_inicial;
  const dias_uteis = contarDiasUteis(data_inicial, data_final, feriadosSet);

  return {
    valor_inicial,
    valor_final: saldo_final,
    taxa_retorno: parseFloat((taxa_retorno_decimal * 100).toFixed(4)),
    taxa_retorno_decimal: parseFloat(taxa_retorno_decimal.toFixed(6)),
    data_inicial,
    data_final,
    indice,
    dias_uteis,
    custo_oportunidade: parseFloat((saldo_final - valor_inicial).toFixed(2)),
    detalhamento,
  };
}

function erro(
  codigo: ErroCalculadora["codigo"],
  mensagem: string,
  detalhe?: any
): ErroCalculadora {
  return { codigo, mensagem, detalhe };
}

export { calcular as calcularFluxoIndexado };
