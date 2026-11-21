/**
 * Classes extras (negrito + pulso) para destacar uma variação percentual
 * que cruza o limiar de alta/baixa relevante do portal: +3% ou mais,
 * -5% ou mais. Pensado para ações, índices, câmbio, cripto e commodities
 * (qualquer valor expresso em %) — não se aplica a cards medidos em
 * pontos-base (Curva DI, yields de Treasuries).
 */

const UP_THRESHOLD = 3;
const DOWN_THRESHOLD = -5;

export function pctAlertClass(pctChange: number | null | undefined): string {
  if (pctChange === null || pctChange === undefined || isNaN(pctChange)) return '';
  if (pctChange >= UP_THRESHOLD) {
    return 'font-bold text-emerald-600 dark:text-emerald-500 animate-pulse-alert';
  }
  if (pctChange <= DOWN_THRESHOLD) {
    return 'font-bold text-red-600 dark:text-red-500 animate-pulse-alert';
  }
  return '';
}
