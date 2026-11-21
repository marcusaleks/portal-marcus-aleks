import { classifyFreshness } from '../../lib/freshness';

type TreasuryItem = {
  series_id: string;
  label: string;
  taxa: number | null;
  taxa_str: string;
  taxa_anterior: number | null;
  var_pb: number | null;
};

type InflationItem = {
  series_id: string;
  label: string;
  valor: number | null;
  valor_str: string;
  data_obs: string | null;
};

type TreasuriesCardProps = {
  data: any;
  fedFunds?: string | null;
  fedFundsStatus?: 'loading' | 'live' | 'offline';
  fedFundsFetchedAt?: string | null;
  nextFomc?: string;
};

const FALLBACK_ITEMS: TreasuryItem[] = [
  { series_id: 'DGS1MO', label: 'T-Bill 1 mês',             taxa: null, taxa_str: '--', taxa_anterior: null, var_pb: null },
  { series_id: 'DGS2',   label: 'T-Note 2 anos',            taxa: null, taxa_str: '--', taxa_anterior: null, var_pb: null },
  { series_id: 'DGS10',  label: 'T-Note 10 anos',           taxa: null, taxa_str: '--', taxa_anterior: null, var_pb: null },
  { series_id: 'DGS30',  label: 'T-Bond 30 anos',           taxa: null, taxa_str: '--', taxa_anterior: null, var_pb: null },
  { series_id: 'T5YIE',  label: 'Breakeven 5a (TIPS)',      taxa: null, taxa_str: '--', taxa_anterior: null, var_pb: null },
  { series_id: 'T10YIE', label: 'Breakeven 10a (TIPS)',     taxa: null, taxa_str: '--', taxa_anterior: null, var_pb: null },
];

function fmtSpread(spread_pb: number | null): string {
  if (spread_pb === null) return '—';
  if (spread_pb === 0) return '0 p.b.';
  return `${spread_pb > 0 ? '+' : ''}${spread_pb} p.b.`;
}

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
  return taxa_anterior.toFixed(2).replace('.', ',') + '%';
}

function fmtInflation(valor_str: string): string {
  return valor_str === '--' ? '--' : valor_str.replace('.', ',') + '%';
}

export default function TreasuriesCard({
  data,
  fedFunds = null,
  fedFundsStatus = 'loading',
  fedFundsFetchedAt = null,
  nextFomc = '17/06/2026',
}: TreasuriesCardProps) {
  const fedFundsTimeLabel = fedFundsFetchedAt
    ? new Date(fedFundsFetchedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
    : null;
  const rawTreasuries = data?.treasuries;
  const items: TreasuryItem[] = rawTreasuries?.items ?? FALLBACK_ITEMS;
  const lastUpdated: string | null = rawTreasuries?.last_updated ?? null;
  const spread10a2a: number | null = rawTreasuries?.spread_10a_2a_pb ?? null;
  const inflation: InflationItem[] = rawTreasuries?.inflation ?? [];
  const cpiRealizado = inflation.find((i) => i.series_id === 'CPIAUCSL') ?? null;
  const cpiEsperado = inflation.find((i) => i.series_id === 'MICH') ?? null;
  const asOf: string | null = rawTreasuries?.asOf ?? null;
  const freshness = classifyFreshness(asOf);

  const asOfLabel = lastUpdated
    ? new Date(lastUpdated).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Sao_Paulo' })
    : null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#004ac6]/16 dark:border-slate-800 rounded-lg p-3.5 flex flex-col font-mono shadow-sm">
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-[10px] letter-spacing-[0.1em] uppercase text-[#6a8db0] dark:text-slate-400 flex items-center gap-1.5 font-bold">
          <span className="inline-block w-2.5 h-[2px] bg-[#004ac6] dark:bg-blue-500 rounded-sm"></span>
          Treasuries · EUA
        </span>
        {asOfLabel && (
          <span
            className={`text-[9px] font-bold uppercase tracking-wider ${
              freshness === 'stale'
                ? 'text-red-500/90 dark:text-red-400/80'
                : 'text-emerald-600/90 dark:text-emerald-400/80'
            }`}
            title={
              freshness === 'stale'
                ? 'Dados defasados há mais de 1 dia útil — verificar pipeline de atualização'
                : 'Fonte: FRED (Federal Reserve Economic Data) — atualizado diariamente após fechamento'
            }
          >
            Ref. {asOfLabel}
          </span>
        )}
      </div>

      <table className="w-full border-collapse table-fixed">
        <thead>
          <tr className="border-b border-[#004ac6]/12 dark:border-slate-800">
            <th className="text-[9px] text-[#6a8db0] dark:text-slate-400 font-bold uppercase tracking-wider text-left pb-1.5 w-[35%]">
              Título
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
          {items.map((item, idx) => {
            const varPb = item.var_pb;
            const varColor = varPb === null || varPb === 0
              ? 'text-[#6a8db0] dark:text-slate-500'
              : varPb > 0
                ? 'text-emerald-600 dark:text-emerald-500'
                : 'text-red-600 dark:text-red-500';
            return (
              <tr key={item.series_id ?? idx} className="border-b border-[#004ac6]/08 dark:border-slate-800/40 last:border-none">
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

      {/* Spread 10a-2a */}
      <div className="flex items-center justify-between mt-2 px-1.5">
        <span
          className="text-[9px] text-[#6a8db0] dark:text-slate-500 uppercase tracking-wider font-bold select-none"
          title="DGS10 − DGS2. Negativo indica curva invertida, sinal historicamente associado a recessão."
        >
          Spread 10a–2a
        </span>
        <span className={`text-[11px] font-bold ${
          spread10a2a === null || spread10a2a === 0
            ? 'text-[#6a8db0] dark:text-slate-500'
            : spread10a2a > 0
              ? 'text-emerald-600 dark:text-emerald-500'
              : 'text-red-600 dark:text-red-500'
        }`}>
          {fmtSpread(spread10a2a)}
        </span>
      </div>

      {/* CPI realizado & expectativa */}
      <div className="flex items-center justify-between mt-2 px-1.5">
        <div>
          <span
            className="text-[9px] text-[#6a8db0] dark:text-slate-500 uppercase tracking-wider font-bold select-none"
            title="CPI-U, variação acumulada 12 meses (BLS via FRED)"
          >
            CPI 12m
          </span>
          <span className="block text-[11px] font-bold text-[#294c72] dark:text-slate-300">
            {fmtInflation(cpiRealizado?.valor_str ?? '--')}
          </span>
        </div>
        <div className="text-right">
          <span
            className="text-[9px] text-[#6a8db0] dark:text-slate-500 uppercase tracking-wider font-bold select-none"
            title="Expectativa de inflação para os próximos 12 meses — pesquisa de consumidores da University of Michigan"
          >
            Expectativa 12m
          </span>
          <span className="block text-[11px] font-bold text-[#294c72] dark:text-slate-300">
            {fmtInflation(cpiEsperado?.valor_str ?? '--')}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#004ac6]/12 dark:border-slate-800 my-2"></div>

      {/* Fed Funds Rate & FOMC Info */}
      <div className="flex items-center justify-between mt-1 px-1.5">
        <div>
          <span className="text-[9px] text-[#6a8db0] dark:text-slate-500 uppercase tracking-wider font-bold mb-0.5 select-none flex items-center gap-1">
            Fed Funds Rate
            {fedFundsStatus === 'offline' && (
              <span
                title="Indisponível — última cotação não pôde ser obtida da FRED"
                className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400"
              />
            )}
          </span>
          {fedFundsStatus === 'loading' ? (
            <span className="text-[13px] font-black text-[#6a8db0] dark:text-slate-500 animate-pulse">
              ...
            </span>
          ) : fedFundsStatus === 'offline' || !fedFunds ? (
            <span
              className="text-[13px] font-black text-amber-600 dark:text-amber-400"
              title="Fonte FRED indisponível"
            >
              —
            </span>
          ) : (
            <span className="text-[13px] font-black text-[#004ac6] dark:text-blue-400">
              {fedFunds}
              {fedFundsTimeLabel && (
                <span className="ml-1.5 text-[9px] font-bold text-[#6a8db0] dark:text-slate-500 uppercase tracking-wider">
                  {fedFundsTimeLabel}
                </span>
              )}
            </span>
          )}
        </div>
        <div className="text-right">
          <span className="text-[9px] text-[#6a8db0] dark:text-slate-500 uppercase block tracking-wider font-bold mb-0.5 select-none">
            Próxima Reunião FOMC
          </span>
          <span className="text-[11px] font-bold text-[#294c72] dark:text-slate-300">
            {nextFomc}
          </span>
        </div>
      </div>
    </div>
  );
}
