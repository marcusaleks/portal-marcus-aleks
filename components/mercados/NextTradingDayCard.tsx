import { useEffect, useState } from 'react';
import { parseHolidaysMarkdown, nextHolidays, MarketHoliday } from '../../lib/marketHolidays';

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

  // B3: feriados avaliados em horário de Brasília. NYSE: em horário de
  // Nova York. Evita que um feriado "de hoje" já encerrado numa timezone
  // mas ainda em curso na outra seja tratado de forma inconsistente.
  const nextB3 = nextHolidays(b3Holidays, 3, '-03:00');
  const nextNyse = nextHolidays(nyseHolidays, 3, '-05:00');

  const renderList = (label: string, holidays: MarketHoliday[]) => (
    <div className="flex-1">
      <div className="text-[9px] text-[#6a8db0] dark:text-slate-500 uppercase tracking-wider font-bold mb-1.5">
        {label}
      </div>
      {holidays.length === 0 ? (
        <div className="text-xs text-[#6a8db0] dark:text-slate-500">--</div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {holidays.map((h, idx) => (
            <div key={idx} className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-bold text-[#04101e] dark:text-slate-200 shrink-0">
                {h.date}
              </span>
              <span className="text-[10px] text-[#294c72] dark:text-slate-400 text-right truncate">
                {h.motivo}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#004ac6]/16 dark:border-slate-800 rounded-lg p-3.5 flex flex-col font-mono shadow-sm">
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-[10px] letter-spacing-[0.1em] uppercase text-[#6a8db0] dark:text-slate-400 flex items-center gap-1.5 font-bold">
          <span className="inline-block w-2.5 h-[2px] bg-[#004ac6] dark:bg-blue-500 rounded-sm"></span>
          Próximos Feriados · Bolsas
        </span>
      </div>

      <div className="flex gap-3">
        {renderList('B3 · Brasil', nextB3)}
        <div className="w-px bg-[#004ac6]/12 dark:bg-slate-800 self-stretch"></div>
        {renderList('NYSE/NASDAQ · EUA', nextNyse)}
      </div>

      <div className="text-[8px] text-[#6a8db0] dark:text-slate-500 mt-2.5 px-0.5 leading-snug">
        Datas sem pregão nos respectivos mercados. B3 inclui vésperas de Natal/Ano Novo (sem sessão de negociação, não feriado nacional). Calendário 2026 — atualizar manualmente ao virar o ano.
      </div>
    </div>
  );
}
