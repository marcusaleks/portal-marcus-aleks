export type MarketHoliday = {
  date: string; // DD/MM/YYYY
  evento: string;
  tipo: string; // "Fechado" | "Horário reduzido" | "Horário especial"
  observacoes: string;
};

export type MarketHolidayEntry = MarketHoliday & {
  mercado: 'B3' | 'NYSE';
};

// Parseia tabelas markdown no formato
// "| DD/MM/YYYY | Evento | Tipo | Observações |" usado em
// public/feriados-b3.md e public/feriados-nyse.md — mesmo estilo de
// public/copom.md e public/fomc.md.
export function parseHolidaysMarkdown(text: string): MarketHoliday[] {
  const lines = text.split('\n');
  const holidays: MarketHoliday[] = [];

  for (const line of lines) {
    const match = line.match(/\|\s*(\d{2}\/\d{2}\/\d{4})\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/);
    if (match) {
      holidays.push({ date: match[1], evento: match[2], tipo: match[3], observacoes: match[4] });
    }
  }

  return holidays;
}

function parseBrDate(dateStr: string, tzOffset: string): number {
  const [day, month, year] = dateStr.split('/');
  return new Date(`${year}-${month}-${day}T23:59:59${tzOffset}`).getTime();
}

// Retorna os próximos N eventos futuros (>= agora) de uma única lista,
// ordenados por data.
export function nextHolidays(
  holidays: MarketHoliday[],
  count: number,
  tzOffset: string,
  now: number = Date.now()
): MarketHoliday[] {
  return holidays
    .filter((h) => parseBrDate(h.date, tzOffset) >= now)
    .sort((a, b) => parseBrDate(a.date, tzOffset) - parseBrDate(b.date, tzOffset))
    .slice(0, count);
}

// Combina B3 e NYSE numa única lista cronológica, cada item marcado com
// o mercado de origem — para a tabela única do card.
export function mergeAndSortHolidays(
  b3: MarketHoliday[],
  nyse: MarketHoliday[],
  count: number,
  now: number = Date.now()
): MarketHolidayEntry[] {
  const combined: MarketHolidayEntry[] = [
    ...b3.map((h) => ({ ...h, mercado: 'B3' as const })),
    ...nyse.map((h) => ({ ...h, mercado: 'NYSE' as const })),
  ];

  const tzFor = (m: 'B3' | 'NYSE') => (m === 'B3' ? '-03:00' : '-05:00');

  return combined
    .filter((h) => parseBrDate(h.date, tzFor(h.mercado)) >= now)
    .sort((a, b) => parseBrDate(a.date, tzFor(a.mercado)) - parseBrDate(b.date, tzFor(b.mercado)))
    .slice(0, count);
}
