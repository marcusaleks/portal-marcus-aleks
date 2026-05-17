/**
 * Market Data Types — Calculadora de Fluxo Indexado
 * Define interfaces para SELIC, IPCA, PTAX e Feriados
 *
 * Arquivo: lib/types/market-data.ts
 * Versão: 1.0
 * Data: 2026-05-10
 */

/**
 * Entrada individual de taxa SELIC
 */
export interface SELICEntry {
  date: string;         // ISO 8601: YYYY-MM-DD
  taxa_diaria: number;  // Taxa diária % a.d. (Série 11)
  indice: number;       // Número-índice acumulado (base 1,00000000 em 31/12/1999)
  tipo: "historico" | "projecao"; // projecao = projeção COPOM via Série 432
}

/**
 * Dados completos da série SELIC
 */
export interface SELICData {
  series: string;
  series_name: string;
  base_date: string;    // "1999-12-31"
  base_value: number;   // 1
  last_updated: string; // ISO 8601 timestamp
  source: string;
  data: SELICEntry[];
}

/**
 * Entrada individual de IPCA (registros diários, um por DU)
 */
export interface IPCAEntry {
  date: string;         // ISO 8601: YYYY-MM-DD (dia útil)
  taxa_diaria: number;  // Taxa diária equivalente pro-rata do mês (% a.d.)
  indice: number;       // Número-índice acumulado (base 1,00000000 em 31/12/1999)
  tipo: "oficial" | "projecao";
}

/**
 * Dados completos da série IPCA (Série 433 do BCB)
 */
export interface IPCAData {
  series: string;
  series_name: string;
  base_date: string;    // "1999-12-31"
  base_value: number;   // 1
  last_updated: string; // ISO 8601 timestamp
  source: string;
  data: IPCAEntry[];
}

/**
 * Entrada individual de PTAX
 */
export interface PTAXEntry {
  date: string;    // ISO 8601: YYYY-MM-DD
  cotacao: number; // Cotação BRL/USD (venda)
  indice: number;  // Número-índice acumulado (base 1,00000000 em 31/12/1999)
}

/**
 * Dados completos da série PTAX (Série 10813 do BCB)
 */
export interface PTAXData {
  series: string;
  series_name: string;
  base_date: string;    // "1999-12-31"
  base_value: number;   // 1
  last_updated: string; // ISO 8601 timestamp
  source: string;
  data: PTAXEntry[];
}

/**
 * Feriado nacional
 */
export interface Feriado {
  date: string; // ISO 8601: YYYY-MM-DD
  nome: string;
}

/**
 * Dados de feriados nacionais
 */
export interface FeriadosData {
  last_updated: string; // ISO 8601 timestamp
  source: string;
  feriados: Feriado[];
}

/**
 * Agregação de todos os dados de mercado
 * Usado para carregar e passar dados para a calculadora
 */
export interface MarketData {
  selic: SELICData;
  ipca: IPCAData;
  ptax: PTAXData;
  feriados: FeriadosData;
  loaded_at: string; // ISO 8601 timestamp de quando foi carregado no frontend
}

/**
 * Resposta bruta do Banco Central (SEAD BCB)
 * Formato padrão para séries: { data: "DD/MM/YYYY", valor: "xx.xx" }
 */
export interface BCBRawEntry {
  data: string; // Formato: "DD/MM/YYYY"
  valor: string; // Formato string (ex: "10.50")
}

/**
 * Tipo de fluxo de caixa (aporte ou resgate)
 */
export type FluxoType = "aporte" | "resgate";

/**
 * Um fluxo individual (aporte ou resgate)
 */
export interface Fluxo {
  data: Date;
  valor: number; // Positivo = aporte, Negativo = resgate
  tipo?: FluxoType; // Opcional — derivado do sinal de valor
  descricao?: string; // Opcional
}

/**
 * Tipo de índice disponível
 */
export type IndiceType = "selic" | "ipca" | "ptax";

/**
 * Entrada para função de cálculo
 */
export interface InputCalculadora {
  valor_inicial: number;
  fluxos: Fluxo[];
  data_inicial: Date;
  data_final: Date;
  indice: IndiceType;
  marketData: MarketData;
}

/**
 * Detalhe de um fluxo no resultado
 */
export interface DetalhamentoFluxo {
  data: Date;
  fluxo: number; // Valor do fluxo (pode ser negativo)
  indice_valor: number; // Valor do índice nesta data
  valor_corrigido: number; // V_i × (Índice_final / Índice_i)
}

/**
 * Saída da função de cálculo
 */
export interface OutputCalculadora {
  valor_inicial: number;
  valor_final: number;
  taxa_retorno: number; // Porcentagem (ex: 24.5 para 24,5%)
  taxa_retorno_decimal: number; // Em decimal (ex: 0.245)
  data_inicial: Date;
  data_final: Date;
  indice: IndiceType;
  dias_uteis: number; // Contagem de dias úteis
  custo_oportunidade: number; // valor_final - valor_inicial (com juros)
  detalhamento: DetalhamentoFluxo[];
}

/**
 * Código de erro da calculadora
 */
export type ErroCodigoCalculadora =
  | "DATA_INVALIDA"
  | "PERIODO_INVALIDO"
  | "DADOS_INCOMPLETOS"
  | "FLUXO_FORA_PERIODO"
  | "INDICE_NAO_ENCONTRADO"
  | "OVERFLOW_NUMERICO";

/**
 * Erro estruturado da calculadora
 */
export interface ErroCalculadora {
  codigo: ErroCodigoCalculadora;
  mensagem: string;
  detalhe?: any; // JSON com info adicional (ex: { date: "2026-05-15" })
}

/**
 * Resultado da calculadora (ou erro)
 */
export type ResultadoCalculadora = OutputCalculadora | ErroCalculadora;

/**
 * Type guard para verificar se é erro
 */
export function isErroCalculadora(result: ResultadoCalculadora): result is ErroCalculadora {
  return "codigo" in result;
}

/**
 * Configuração de validação
 */
export interface ConfigValidacao {
  periodo_maximo_anos: number; // Padrão: 50
  tolerancia_decimais: number; // Padrão: 2 casas decimais
  validar_feriados: boolean; // Padrão: true
}
