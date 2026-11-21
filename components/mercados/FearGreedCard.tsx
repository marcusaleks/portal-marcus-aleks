type FearGreedEntry = {
  vix: number | null;
  stage: string | null;
  status: 'live' | 'offline';
};

type FearGreedCardProps = {
  data: any;
};

const STAGE_LABELS: Record<string, string> = {
  'Extreme Greed': 'Ganância Extrema',
  'Greed': 'Ganância',
  'Neutral': 'Neutro',
  'Fear': 'Medo',
  'Extreme Fear': 'Medo Extremo',
};

const STAGE_COLORS: Record<string, string> = {
  'Extreme Greed': 'text-emerald-600 dark:text-emerald-500',
  'Greed': 'text-emerald-500 dark:text-emerald-400',
  'Neutral': 'text-[#6a8db0] dark:text-slate-400',
  'Fear': 'text-amber-600 dark:text-amber-400',
  'Extreme Fear': 'text-red-600 dark:text-red-500',
};

function fmtStage(stage: string | null): string {
  if (!stage) return '--';
  return STAGE_LABELS[stage] ?? stage;
}

function stageColor(stage: string | null): string {
  if (!stage) return 'text-[#6a8db0] dark:text-slate-500';
  return STAGE_COLORS[stage] ?? 'text-[#6a8db0] dark:text-slate-500';
}

export default function FearGreedCard({ data }: FearGreedCardProps) {
  const us: FearGreedEntry = data?.fearGreed?.VIX_US ?? { vix: null, stage: null, status: 'offline' };
  const br: FearGreedEntry = data?.fearGreed?.VXEWZ_BR ?? { vix: null, stage: null, status: 'offline' };
  const isOffline = data?.fearGreedOffline ?? false;

  const renderRow = (label: string, sub: string, entry: FearGreedEntry) => (
    <div className="flex items-center justify-between py-2.5 border-b border-[#004ac6]/08 dark:border-slate-800/40 last:border-none">
      <div>
        <div className="text-xs font-bold text-[#04101e] dark:text-slate-200">{label}</div>
        <div className="text-[9px] text-[#6a8db0] dark:text-slate-500 font-semibold uppercase tracking-wider">{sub}</div>
      </div>
      <div className="text-right">
        <div className={`text-sm font-black ${stageColor(entry.stage)}`}>
          {fmtStage(entry.stage)}
        </div>
        <div className="text-[9px] text-[#6a8db0] dark:text-slate-500 font-semibold">
          VIX {entry.vix !== null ? entry.vix.toFixed(2) : '--'}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#004ac6]/16 dark:border-slate-800 rounded-lg p-3.5 flex flex-col font-mono shadow-sm">
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-[10px] letter-spacing-[0.1em] uppercase text-[#6a8db0] dark:text-slate-400 flex items-center gap-1.5 font-bold">
          <span className="inline-block w-2.5 h-[2px] bg-[#004ac6] dark:bg-blue-500 rounded-sm"></span>
          Medo &amp; Ganância
        </span>
        {isOffline && (
          <span className="text-[9px] font-bold text-amber-500/80 dark:text-amber-400/70 uppercase tracking-wider" title="Dados de fallback — sem conexão com Yahoo Finance">
            Dados offline
          </span>
        )}
      </div>

      <div className="flex flex-col">
        {renderRow('Estados Unidos', 'CBOE VIX', us)}
        {renderRow('Brasil', 'VXEWZ · via ETF EWZ', br)}
      </div>

      <div className="text-[8px] text-[#6a8db0] dark:text-slate-500 mt-2 px-0.5 leading-snug">
        Estágios inspirados na escala do CNN Fear &amp; Greed Index, derivados da volatilidade implícita (VIX). Brasil medido via volatilidade do ETF EWZ (CBOE), não o VIX Brasil oficial da B3.
      </div>
    </div>
  );
}
