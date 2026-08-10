type DIItem = {
  label: string;
  taxa: number;
  taxa_str: string;
  taxa_anterior: number | null;
  var_pb: number | null;
};

type CurvaDICardProps = {
  data: any;
  selic?: string | null;
  selicStatus?: 'loading' | 'live' | 'offline';
  selicFetchedAt?: string | null;
  nextCopom?: string;
};

const FALLBACK_ITEMS: DIItem[] = [
  { label: 'DI 1 ano',   taxa: 0, taxa_str: '--', taxa_anterior: null, var_pb: null },
  { label: 'DI 2 anos',  taxa: 0, taxa_str: '--', taxa_anterior: null, var_pb: null },
  { label: 'DI 5 anos',  taxa: 0, taxa_str: '--', taxa_anterior: null, var_pb: null },
  { label: 'DI 10 anos', taxa: 0, taxa_str: '--', taxa_anterior: null, var_pb: null },
];

function fmtVar(var_pb: number | null): string {
  if (var_pb === null) return '—';
  if (var_pb === 0) return '0 p.b.';
  return `${var_pb > 0 ? '+' : ''}${var_pb} p.b.`;
}

function fmtTaxa(taxa_str: string): string {
  return taxa_str === '--' ? '--' : taxa_str + '%';
}

function fmtAnterior(taxa_anterior: number | null): string {
  if (taxa_anterior === null) return '--';
  return taxa_anterior.toFixed(4).replace('.', ',') + '%';
}


export default function CurvaDICard({
  data,
  selic = null,
  selicStatus = 'loading',
  selicFetchedAt = null,
  nextCopom = '17/06/2026',
}: CurvaDICardProps) {
  const selicTimeLabel = selicFetchedAt
    ? new Date(selicFetchedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
    : null;
  const rawCurve = data.diCurve;
  const diCurve: DIItem[] = rawCurve?.items ?? FALLBACK_ITEMS;
  const lastUpdated: string | null = rawCurve?.last_updated ?? null;

  const asOfLabel = lastUpdated
    ? new Date(lastUpdated).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Sao_Paulo' })
    : null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#004ac6]/16 dark:border-slate-800 rounded-lg p-3.5 flex flex-col font-mono shadow-sm">
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-[10px] letter-spacing-[0.1em] uppercase text-[#6a8db0] dark:text-slate-400 flex items-center gap-1.5 font-bold">
          <span className="inline-block w-2.5 h-[2px] bg-[#004ac6] dark:bg-blue-500 rounded-sm"></span>
          Curva DI · Juros Futuros
        </span>
        {asOfLabel && (
          <span className="text-[9px] font-bold text-amber-500/80 dark:text-amber-400/70 uppercase tracking-wider" title="Fonte: ANBIMA ETTJ — atualizado diariamente após fechamento">
            Ref. {asOfLabel}
          </span>
        )}
      </div>

      <table className="w-full border-collapse table-fixed">
        <thead>
          <tr className="border-b border-[#004ac6]/12 dark:border-slate-800">
            <th className="text-[9px] text-[#6a8db0] dark:text-slate-400 font-bold uppercase tracking-wider text-left pb-1.5 w-[35%]">
              Vencimento
            </th>
            <th className="text-[9px] text-[#6a8db0] dark:text-slate-400 font-bold uppercase tracking-wider text-right pb-1.5 w-[22%]">
              Ontem
            </th>
            <th className="text-[9px] text-[#6a8db0] dark:text-slate-400 font-bold uppercase tracking-wider text-right pb-1.5 w-[22%]">
              Hoje
            </th>
            <th className="text-[9px] text-[#6a8db0] dark:text-slate-400 font-bold uppercase tracking-wider text-right pb-1.5 w-[21%]">
              Var.
            </th>
          </tr>
        </thead>
        <tbody>
          {diCurve.map((item, idx) => {
            const varPb = item.var_pb;
            const varColor = varPb === null || varPb === 0
              ? 'text-[#6a8db0] dark:text-slate-500'
              : varPb > 0
                ? 'text-emerald-600 dark:text-emerald-500'
                : 'text-red-600 dark:text-red-500';
            return (
              <tr key={idx} className="border-b border-[#004ac6]/08 dark:border-slate-800/40 last:border-none">
                <td className="py-2.5 text-left text-[11px] text-[#294c72] dark:text-slate-400 font-bold">
                  {item.label}
                </td>
                <td className="py-2.5 text-right text-xs text-[#6a8db0] dark:text-slate-500 font-medium">
                  {fmtAnterior(item.taxa_anterior)}
                </td>
                <td className="py-2.5 text-right text-xs text-[#04101e] dark:text-slate-200 font-bold">
                  {fmtTaxa(item.taxa_str)}
                </td>
                <td className={`py-2.5 text-right text-xs font-bold ${varColor}`}>
                  {fmtVar(item.var_pb)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Divider */}
      <div className="border-t border-[#004ac6]/12 dark:border-slate-800 my-2"></div>

      {/* Selic & Copom Info */}
      <div className="flex items-center justify-between mt-1 px-1.5">
        <div>
          <span className="text-[9px] text-[#6a8db0] dark:text-slate-500 uppercase tracking-wider font-bold mb-0.5 select-none flex items-center gap-1">
            Selic Meta
            {selicStatus === 'offline' && (
              <span
                title="Indisponível — última cotação não pôde ser obtida do BCB"
                className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400"
              />
            )}
          </span>
          {selicStatus === 'loading' ? (
            <span className="text-[13px] font-black text-[#6a8db0] dark:text-slate-500 animate-pulse">
              ...
            </span>
          ) : selicStatus === 'offline' || !selic ? (
            <span
              className="text-[13px] font-black text-amber-600 dark:text-amber-400"
              title="Fonte BCB indisponível"
            >
              —
            </span>
          ) : (
            <span className="text-[13px] font-black text-[#004ac6] dark:text-blue-400">
              {selic}
              {selicTimeLabel && (
                <span className="ml-1.5 text-[9px] font-bold text-[#6a8db0] dark:text-slate-500 uppercase tracking-wider">
                  {selicTimeLabel}
                </span>
              )}
            </span>
          )}
        </div>
        <div className="text-right">
          <span className="text-[9px] text-[#6a8db0] dark:text-slate-500 uppercase block tracking-wider font-bold mb-0.5 select-none">
            Reunião Copom
          </span>
          <span className="text-[11px] font-bold text-[#294c72] dark:text-slate-300">
            {nextCopom}
          </span>
        </div>
      </div>
    </div>
  );
}
