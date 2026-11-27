export type MarketHoliday = {
  date: string; // DD/MM/YYYY
  evento: string;
  tipo: string; // "Fechado" | "Horário reduzido" | "Horário especial"
  observacoes: string;
};

export type MercadoId = 'B3' | 'NYSE' | 'LSE';

export type MarketHolidayEntry = MarketHoliday & {
  mercado: MercadoId;
};

const TZ_BY_MERCADO: Record<MercadoId, string> = {
  B3: '-03:00',
  NYSE: '-05:00',
  LSE: '+00:00',
};

// Parseia tabelas markdown no formato
// "| DD/MM/YYYY | Evento | Tipo | Observações |" usado em
// public/feriados-b3.md, public/feriados-nyse.md e public/feriados-lse.md
// — mesmo estilo de public/copom.md e public/fomc.md.
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

// Combina as listas de feriados de todos os mercados numa única sequência
// cronológica, cada item marcado com o mercado de origem — para a tabela
// única do card.
export function mergeAndSortHolidays(
  sources: Partial<Record<MercadoId, MarketHoliday[]>>,
  count: number,
  now: number = Date.now()
): MarketHolidayEntry[] {
  const combined: MarketHolidayEntry[] = [];
  for (const mercado of Object.keys(sources) as MercadoId[]) {
    const holidays = sources[mercado] ?? [];
    combined.push(...holidays.map((h) => ({ ...h, mercado })));
  }

  return combined
    .filter((h) => parseBrDate(h.date, TZ_BY_MERCADO[h.mercado]) >= now)
    .sort((a, b) => parseBrDate(a.date, TZ_BY_MERCADO[a.mercado]) - parseBrDate(b.date, TZ_BY_MERCADO[b.mercado]))
    .slice(0, count);
}

// Um calendário é considerado desatualizado se não tiver nenhuma data no
// ano corrente ou no próximo — sinal objetivo de que a tabela não foi
// revisada na virada do ano (manutenção manual, sem automação).
export function isHolidayListStale(holidays: MarketHoliday[], now: Date = new Date()): boolean {
  if (holidays.length === 0) return true;
  const currentYear = now.getFullYear();
  return !holidays.some((h) => {
    const year = parseInt(h.date.split('/')[2], 10);
    return year === currentYear || year === currentYear + 1;
  });
}
