import { useEffect, useState } from 'react';
import { parseHolidaysMarkdown, mergeAndSortHolidays, MarketHoliday, MarketHolidayEntry } from '../../lib/marketHolidays';

function tipoColor(tipo: string): string {
  if (tipo === 'Fechado') return 'text-red-600 dark:text-red-500';
  return 'text-amber-600 dark:text-amber-400';
}

export default function NextTradingDayCard() {
  const [b3Holidays, setB3Holidays] = useState<MarketHoliday[]>([]);
  const [nyseHolidays, setNyseHolidays] = useState<MarketHoliday[]>([]);

  useEffect(() => {
    fetch('/feriados-b3.md')
      .then((r) => (r.ok ? r.text() : ''))
      .then((text) => setB3Holidays(parseHolidaysMarkdown(text)))
      .catch(() => setB3Holidays([]));

    fetch('/feriados-nyse.md')
      .then((r) => (r.ok ? r.text() : ''))
      .then((text) => setNyseHolidays(parseHolidaysMarkdown(text)))
      .catch(() => setNyseHolidays([]));
  }, []);

  const events: MarketHolidayEntry[] = mergeAndSortHolidays(b3Holidays, nyseHolidays, 6);

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#004ac6]/16 dark:border-slate-800 rounded-lg p-3.5 flex flex-col font-mono shadow-sm">
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-[10px] letter-spacing-[0.1em] uppercase text-[#6a8db0] dark:text-slate-400 flex items-center gap-1.5 font-bold">
          <span className="inline-block w-2.5 h-[2px] bg-[#004ac6] dark:bg-blue-500 rounded-sm"></span>
          Próximos Feriados · Bolsas
        </span>
      </div>

      <table className="w-full border-collapse table-fixed">
        <thead>
          <tr className="border-b border-[#004ac6]/12 dark:border-slate-800">
            <th className="text-[9px] text-[#6a8db0] dark:text-slate-400 font-bold uppercase tracking-wider text-left pb-1.5 pr-1 pl-0.5 w-[16%]">
              Data
            </th>
            <th className="text-[9px] text-[#6a8db0] dark:text-slate-400 font-bold uppercase tracking-wider text-left pb-1.5 px-1 w-[12%]">
              Bolsa
            </th>
            <th className="text-[9px] text-[#6a8db0] dark:text-slate-400 font-bold uppercase tracking-wider text-left pb-1.5 px-1 w-[30%]">
              Evento
            </th>
            <th className="text-[9px] text-[#6a8db0] dark:text-slate-400 font-bold uppercase tracking-wider text-left pb-1.5 pl-1 pr-0.5 w-[42%]">
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
                <td className="py-2 px-1 text-left text-[10px] font-bold text-[#294c72] dark:text-slate-400">
                  {ev.mercado}
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
