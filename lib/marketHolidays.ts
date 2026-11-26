export type MarketHoliday = {
  date: string; // DD/MM/YYYY
  motivo: string;
};

// Parseia tabelas markdown no formato "| DD/MM/YYYY | Motivo |" usado em
// public/feriados-b3.md e public/feriados-nyse.md — mesmo estilo de
// public/copom.md e public/fomc.md.
export function parseHolidaysMarkdown(text: string): MarketHoliday[] {
  const lines = text.split('\n');
  const holidays: MarketHoliday[] = [];

  for (const line of lines) {
    const match = line.match(/\|\s*(\d{2}\/\d{2}\/\d{4})\s*\|\s*([^|]+?)\s*\|/);
    if (match) {
      holidays.push({ date: match[1], motivo: match[2] });
    }
  }

  return holidays;
}

function parseBrDate(dateStr: string, tzOffset: string): number {
  const [day, month, year] = dateStr.split('/');
  return new Date(`${year}-${month}-${day}T23:59:59${tzOffset}`).getTime();
}

// Retorna os próximos N feriados futuros (>= agora), ordenados por data.
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
