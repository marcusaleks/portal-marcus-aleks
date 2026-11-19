/**
 * Classifica o frescor de uma data de referência (asOf) de dados de mercado
 * que atualizam 1x por dia útil. "Atualizado" tolera até 1 dia útil de
 * defasagem (cobre o período entre o fechamento do pregão e a publicação
 * do fetch do dia seguinte); mais que isso indica que o pipeline parou.
 */

export type Freshness = 'live' | 'stale';

function countBusinessDaysBetween(from: Date, to: Date): number {
  let count = 0;
  const cursor = new Date(from);
  cursor.setUTCHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setUTCHours(0, 0, 0, 0);

  while (cursor < end) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    const day = cursor.getUTCDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
}

export function classifyFreshness(asOf: string | null, now: Date = new Date()): Freshness | null {
  if (!asOf) return null;
  const asOfDate = new Date(`${asOf}T00:00:00Z`);
  if (isNaN(asOfDate.getTime())) return null;

  const businessDaysLate = countBusinessDaysBetween(asOfDate, now);
  return businessDaysLate <= 1 ? 'live' : 'stale';
}
