type FearGreedEntry = {
  vix: number | null;
  stage: string | null;
  score: number | null;
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

// Zonas do gauge em score 0-100 (escala estilo CNN: 0=medo extremo,
// 100=ganância extrema), cores alinhadas ao STAGE_COLORS acima.
const GAUGE_ZONES = [
  { from: 0, to: 24, color: '#dc2626' },   // Extreme Fear
  { from: 24, to: 44, color: '#f59e0b' },  // Fear
  { from: 44, to: 56, color: '#94a3b8' },  // Neutral
  { from: 56, to: 76, color: '#34d399' },  // Greed
  { from: 76, to: 100, color: '#059669' }, // Extreme Greed
];

function fmtStage(stage: string | null): string {
  if (!stage) return '--';
  return STAGE_LABELS[stage] ?? stage;
}

function stageColor(stage: string | null): string {
  if (!stage) return 'text-[#6a8db0] dark:text-slate-500';
  return STAGE_COLORS[stage] ?? 'text-[#6a8db0] dark:text-slate-500';
}

// Gauge semicircular estilo CNN Fear & Greed: arco de 180°, zonas coloridas
// fixas, ponteiro na posição do score (0=esquerda/medo, 100=direita/ganância).
function Gauge({ score }: { score: number | null }) {
  const cx = 60;
  const cy = 58;
  const r = 48;
  const strokeWidth = 10;

  const scoreToAngleDeg = (s: number) => 180 - (s / 100) * 180; // 0->180°(esquerda), 100->0°(direita)
  const polar = (angleDeg: number, radius: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy - radius * Math.sin(rad) };
  };

  const arcPath = (fromScore: number, toScore: number) => {
    const a0 = scoreToAngleDeg(fromScore);
    const a1 = scoreToAngleDeg(toScore);
    const p0 = polar(a0, r);
    const p1 = polar(a1, r);
    const largeArc = Math.abs(a0 - a1) > 180 ? 1 : 0;
    return `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
  };

  const needleScore = score ?? 50;
  const needleAngle = scoreToAngleDeg(needleScore);
  const needleTip = polar(needleAngle, r - 14);

  return (
    <svg viewBox="0 0 120 68" className="w-full h-auto">
      {GAUGE_ZONES.map((zone, idx) => (
        <path
          key={idx}
          d={arcPath(zone.from, zone.to)}
          fill="none"
          stroke={zone.color}
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
        />
      ))}
      {score !== null && (
        <line
          x1={cx}
          y1={cy}
          x2={needleTip.x}
          y2={needleTip.y}
          stroke="currentColor"
          className="text-[#04101e] dark:text-slate-100"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )}
      <circle cx={cx} cy={cy} r="3.5" fill="currentColor" className="text-[#04101e] dark:text-slate-100" />
    </svg>
  );
}

export default function FearGreedCard({ data }: FearGreedCardProps) {
  const us: FearGreedEntry = data?.fearGreed?.VIX_US ?? { vix: null, stage: null, score: null, status: 'offline' };
  const br: FearGreedEntry = data?.fearGreed?.VXEWZ_BR ?? { vix: null, stage: null, score: null, status: 'offline' };
  const isOffline = data?.fearGreedOffline ?? false;

  const renderGaugeBlock = (label: string, sub: string, entry: FearGreedEntry) => (
    <div className="flex flex-col items-center flex-1">
      <Gauge score={entry.score} />
      <div className={`text-sm font-black -mt-1 ${stageColor(entry.stage)}`}>
        {fmtStage(entry.stage)}
      </div>
      <div className="text-[9px] text-[#6a8db0] dark:text-slate-500 font-semibold">
        VIX {entry.vix !== null ? entry.vix.toFixed(2) : '--'}
      </div>
      <div className="text-[9px] text-[#04101e] dark:text-slate-200 font-bold">{label}</div>
      <div className="text-[8px] text-[#6a8db0] dark:text-slate-500 uppercase tracking-wider">{sub}</div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#004ac6]/16 dark:border-slate-800 rounded-lg p-3.5 flex flex-col font-mono shadow-sm">
      <div className="flex items-center justify-between mb-2">
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

      <div className="flex items-start gap-2 mt-1">
        {renderGaugeBlock('Estados Unidos', 'CBOE VIX', us)}
        {renderGaugeBlock('Brasil', 'VXEWZ · via ETF EWZ', br)}
      </div>

      <div className="text-[8px] text-[#6a8db0] dark:text-slate-500 mt-2.5 px-0.5 leading-snug">
        Estágios inspirados na escala do CNN Fear &amp; Greed Index, derivados da volatilidade implícita (VIX) e calibrados contra leituras reais do índice. Brasil medido via volatilidade do ETF EWZ (CBOE), não o VIX Brasil oficial da B3.
      </div>
    </div>
  );
}
