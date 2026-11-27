import { useEffect, useState } from 'react';
import {
  parseHolidaysMarkdown,
  mergeAndSortHolidays,
  isHolidayListStale,
  MarketHoliday,
  MarketHolidayEntry,
  MercadoId,
} from '../../lib/marketHolidays';

const MERCADO_LABELS: Record<MercadoId, string> = {
  B3: 'Brasil',
  NYSE: 'EUA',
  LSE: 'Reino Unido',
};

function tipoColor(tipo: string): string {
  if (tipo === 'Fechado') return 'text-red-600 dark:text-red-500';
  return 'text-amber-600 dark:text-amber-400';
}

export default function NextTradingDayCard() {
  const [holidaysByMercado, setHolidaysByMercado] = useState<Partial<Record<MercadoId, MarketHoliday[]>>>({});

  useEffect(() => {
    const sources: { mercado: MercadoId; path: string }[] = [
      { mercado: 'B3', path: '/feriados-b3.md' },
      { mercado: 'NYSE', path: '/feriados-nyse.md' },
      { mercado: 'LSE', path: '/feriados-lse.md' },
    ];

    sources.forEach(({ mercado, path }) => {
      fetch(path)
        .then((r) => (r.ok ? r.text() : ''))
        .then((text) => {
          const parsed = parseHolidaysMarkdown(text);
          setHolidaysByMercado((prev) => ({ ...prev, [mercado]: parsed }));
        })
        .catch(() => {
          setHolidaysByMercado((prev) => ({ ...prev, [mercado]: [] }));
        });
    });
  }, []);

  const events: MarketHolidayEntry[] = mergeAndSortHolidays(holidaysByMercado, 8);

  const staleMercados = (Object.keys(holidaysByMercado) as MercadoId[]).filter((m) =>
    isHolidayListStale(holidaysByMercado[m] ?? [])
  );
  const hasLoadedAll = Object.keys(holidaysByMercado).length === 3;
  const showStaleBanner = hasLoadedAll && staleMercados.length > 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#004ac6]/16 dark:border-slate-800 rounded-lg p-3.5 flex flex-col font-mono shadow-sm">
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-[10px] letter-spacing-[0.1em] uppercase text-[#6a8db0] dark:text-slate-400 flex items-center gap-1.5 font-bold">
          <span className="inline-block w-2.5 h-[2px] bg-[#004ac6] dark:bg-blue-500 rounded-sm"></span>
          Próximos Feriados · Bolsas
        </span>
      </div>

      {showStaleBanner && (
        <div className="mb-2.5 px-2 py-1.5 rounded bg-red-500/10 border border-red-500/30 text-[9px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">
          ⚠ Calendário desatualizado: {staleMercados.map((m) => MERCADO_LABELS[m]).join(', ')} — atualizar tabela manual
        </div>
      )}

      <table className="w-full border-collapse table-fixed">
        <thead>
          <tr className="border-b border-[#004ac6]/12 dark:border-slate-800">
            <th className="text-[9px] text-[#6a8db0] dark:text-slate-400 font-bold uppercase tracking-wider text-left pb-1.5 pr-1 pl-0.5 w-[15%]">
              Data
            </th>
            <th className="text-[9px] text-[#6a8db0] dark:text-slate-400 font-bold uppercase tracking-wider text-left pb-1.5 px-1 w-[18%]">
              Bolsa
            </th>
            <th className="text-[9px] text-[#6a8db0] dark:text-slate-400 font-bold uppercase tracking-wider text-left pb-1.5 px-1 w-[28%]">
              Evento
            </th>
            <th className="text-[9px] text-[#6a8db0] dark:text-slate-400 font-bold uppercase tracking-wider text-left pb-1.5 pl-1 pr-0.5 w-[39%]">
              Observações
            </th>
          </tr>
        </thead>
        <tbody>
          {events.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-3 text-center text-xs text-[#6a8db0] dark:text-slate-500">--</td>
            </tr>
          ) : (
            events.map((ev, idx) => (
              <tr key={idx} className="border-b border-[#004ac6]/08 dark:border-slate-800/40 last:border-none align-top">
                <td className="py-2 pr-1 pl-0.5 text-left text-xs font-bold text-[#04101e] dark:text-slate-200">
                  {ev.date}
                </td>
                <td className="py-2 px-1 text-left text-[11px] font-bold text-[#294c72] dark:text-slate-400 leading-tight">
                  {MERCADO_LABELS[ev.mercado]}
                </td>
                <td className="py-2 px-1 text-left">
                  <span className="text-[11px] font-bold text-[#04101e] dark:text-slate-200 block leading-tight">
                    {ev.evento}
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${tipoColor(ev.tipo)}`}>
                    {ev.tipo}
                  </span>
                </td>
                <td className="py-2 pl-1 pr-0.5 text-left text-[9px] text-[#6a8db0] dark:text-slate-500 leading-snug">
                  {ev.observacoes === '—' ? '' : ev.observacoes}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="text-[8px] text-[#6a8db0] dark:text-slate-500 mt-2.5 px-0.5 leading-snug">
        Calendário 2026 — atualizar manualmente ao virar o ano.
      </div>
    </div>
  );
}
