import { useEffect, useState } from 'react';
import {
  parseHolidaysMarkdown,
  mergeAndSortHolidays,
  groupHolidaysByDateAndType,
  isHolidayListStale,
  MarketHoliday,
  MercadoId,
} from '../../lib/marketHolidays';

const MERCADO_LABELS: Record<MercadoId, string> = {
  B3: 'BR',
  NYSE: 'USA',
  LSE: 'UK',
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

  const entries = mergeAndSortHolidays(holidaysByMercado, 12);
  const groups = groupHolidaysByDateAndType(entries).slice(0, 8);

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

      {/* Layout em lista, um bloco por grupo (data + tipo) — mercados que
          fecham juntos na mesma data e com o mesmo tipo (Fechado /
          Horário reduzido) aparecem na mesma linha, evitando repetir a
          data 2-3 vezes seguidas quando os mercados coincidem. */}
      <div className="flex flex-col">
        {groups.length === 0 ? (
          <div className="py-3 text-center text-xs text-[#6a8db0] dark:text-slate-500">--</div>
        ) : (
          groups.map((g, idx) => {
            const obsComTexto = g.observacoesPorMercado.filter((o) => o.observacoes !== '—');
            return (
              <div key={idx} className="py-2 border-b border-[#004ac6]/08 dark:border-slate-800/40 last:border-none">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-xs font-bold text-[#04101e] dark:text-slate-200">
                    {g.date}
                  </span>
                  <span className="text-[10px] font-bold text-[#294c72] dark:text-slate-400 uppercase tracking-wider">
                    {g.mercados.map((m) => MERCADO_LABELS[m]).join(', ')}
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ml-auto ${tipoColor(g.tipo)}`}>
                    {g.tipo}
                  </span>
                </div>
                <div className="text-[11px] font-bold text-[#04101e] dark:text-slate-200 leading-tight">
                  {g.evento}
                </div>
                {obsComTexto.length > 0 && (
                  <div className="text-[9px] text-[#6a8db0] dark:text-slate-500 leading-snug mt-0.5">
                    {obsComTexto.length === 1 && g.mercados.length === 1
                      ? obsComTexto[0].observacoes
                      : obsComTexto.map((o) => `${MERCADO_LABELS[o.mercado]}: ${o.observacoes}`).join(' · ')}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="text-[8px] text-[#6a8db0] dark:text-slate-500 mt-2.5 px-0.5 leading-snug">
        Calendário 2026 — atualizar manualmente ao virar o ano.
      </div>
    </div>
  );
}
