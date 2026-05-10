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
  date: string; // ISO 8601: YYYY-MM-DD
  taxa_diaria: number; // Taxa SELIC anualizada (%)
  indice_acumulado: number; // Índice acumulado (base 100.000 em 15/07/2000)
  is_feriado: boolean;
  is_weekend: boolean;
}

/**
 * Dados completos da série SELIC (Série 11 do BCB)
 */
export interface SELICData {
  series: "11";
  series_name: string; // "Taxa SELIC — média diária"
  unit: "%"; // Porcentagem ao ano
  last_updated: string; // ISO 8601 timestamp
  source: string; // "SEAD Banco Central (bcdata.sgs.11)"
  data: SELICEntry[];
}

/**
 * Entrada individual de IPCA (VNA)
 */
export interface IPCAEntry {
  date: string; // ISO 8601: YYYY-MM-DD
  vna: number; // Valor Nominal Atualizado (base 1.000,00 em 15/07/2000)
  tipo: "oficial" | "projecao"; // Rastreabilidade de fonte
}

/**
 * Informação sobre IPCA oficial divulgado
 */
export interface IPCAOficial {
  mes: string; // YYYY-MM
  valor: number; // Porcentagem (ex: 0.52 para 0,52%)
  data_divulgacao: string; // ISO 8601 timestamp
}

/**
 * Informação sobre projeção IPCA (até divulgação oficial)
 */
export interface IPCAProjecao {
  mes: string; // YYYY-MM
  valor: number; // Porcentagem
  fonte: string; // "Focus BCB", "ANBIMA", etc
  data_atualizacao: string; // ISO 8601 timestamp
}

/**
 * Dados completos da série IPCA (Série 433 do BCB)
 */
export interface IPCAData {
  series: "433";
  series_name: string; // "IPCA — Índice de Preços ao Consumidor Amplo"
  unit: "%"; // Porcentagem ao mês
  last_updated: string; // ISO 8601 timestamp
  source: string; // "SEAD Banco Central + Focus Bacen"
  oficial: IPCAOficial;
  projecao: IPCAProjecao;
  vna_historico: IPCAEntry[];
}

/**
 * Entrada individual de PTAX
 */
export interface PTAXEntry {
  date: string; // ISO 8601: YYYY-MM-DD
  cotacao: number; // Taxa de câmbio BRL/USD (venda)
  is_feriado: boolean;
  is_weekend: boolean;
}

/**
 * Dados completos da série PTAX (Série 10813 do BCB)
 */
export interface PTAXData {
  series: "10813";
  series_name: string; // "Taxa de câmbio nominal — USD/BRL (venda)"
  unit: "BRL/USD";
  last_updated: string; // ISO 8601 timestamp
  source: string; // "SEAD Banco Central (bcdata.sgs.10813)"
  data: PTAXEntry[];
}

/**
 * Feriado nacional
 */
export interface Feriado {
  date: string; // ISO 8601: YYYY-MM-DD
  nome: string; // "Ano Novo", "Ascensão de Jesus", etc
  tipo: "recorrente" | "móvel" | "decretal";
  categoria: "nacional"; // Pode ser expandido: estadual, municipal
}

/**
 * Dados de feriados nacionais
 */
export interface FeriadosData {
  year: number;
  last_updated: string; // ISO 8601 timestamp
  source: string; // "brazilian-holidays (npm) + decretos manuais"
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
