type FearGreedEntry = {
  vix: number | null;
  stage: string | null;
  score: number | null;
  status: 'live' | 'offline';
};

type FearGreedCardProps = {
  data: any;
};

// Nomenclatura ajustada a pedido do usuário (validada visualmente via
// protótipo antes de aplicar ao componente real):
//   Extreme Fear -> Pânico | Fear -> Medo | Neutral -> Neutro
//   Greed -> Euforia | Extreme Greed -> Ganância
const STAGE_LABELS: Record<string, string> = {
  'Extreme Greed': 'Ganância',
  'Greed': 'Euforia',
  'Neutral': 'Neutro',
  'Fear': 'Medo',
  'Extreme Fear': 'Pânico',
};

const STAGE_COLORS: Record<string, string> = {
  'Extreme Greed': 'text-emerald-600 dark:text-emerald-500',
  'Greed': 'text-emerald-500 dark:text-emerald-400',
  'Neutral': 'text-[#6a8db0] dark:text-slate-400',
  'Fear': 'text-amber-600 dark:text-amber-400',
  'Extreme Fear': 'text-red-600 dark:text-red-500',
};

// Zonas do gauge em score 0-100 (escala estilo CNN: 0=pânico, 100=ganância),
// cores alinhadas ao STAGE_COLORS acima. textColor define a cor do rótulo
// escrito dentro do próprio arco (branco sobre tons escuros/saturados,
// escuro sobre o verde-claro de "Euforia", que é claro demais para texto branco).
const GAUGE_ZONES = [
  { from: 0, to: 24, color: '#dc2626', label: 'PÂNICO', textColor: '#ffffff' },
  { from: 24, to: 44, color: '#f59e0b', label: 'MEDO', textColor: '#ffffff' },
  { from: 44, to: 56, color: '#94a3b8', label: 'NEUTRO', textColor: '#1a1a1a' },
  { from: 56, to: 76, color: '#34d399', label: 'EUFORIA', textColor: '#1a1a1a' },
  { from: 76, to: 100, color: '#059669', label: 'GANÂNCIA', textColor: '#ffffff' },
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
// fixas com o nome do estágio escrito em texto curvo acompanhando o arco,
// ponteiro na posição do score (0=esquerda/pânico, 100=direita/ganância).
function Gauge({ score, uid }: { score: number | null; uid: string }) {
  const cx = 60;
  const cy = 58;
  const r = 48;
  const strokeWidth = 10;
  const arcFontSize = 4.6;

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
      {GAUGE_ZONES.map((zone, idx) => {
        const d = arcPath(zone.from, zone.to);
        const pathId = `${uid}-arc-${idx}`;
        return (
          <g key={idx}>
            <path d={d} fill="none" stroke={zone.color} strokeWidth={strokeWidth} strokeLinecap="butt" />
            <path id={pathId} d={d} fill="none" stroke="none" />
            <text fontSize={arcFontSize} fontWeight="800" fill={zone.textColor} letterSpacing="0.02em">
              <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
                {zone.label}
              </textPath>
            </text>
          </g>
        );
      })}
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

  const renderGaugeBlock = (uid: string, label: string, sub: string, entry: FearGreedEntry) => (
    <div className="flex flex-col items-center flex-1">
      <Gauge score={entry.score} uid={uid} />
      <div className={`text-sm font-black -mt-1 ${stageColor(entry.stage)}`}>
        {fmtStage(entry.stage)}
      </div>
      <div className="text-[9px] text-[#6a8db0] dark:text-slate-500 font-semibold">
        VIX {entry.vix !== null ? entry.vix.toFixed(2) : '--'}
      </div>
      <div className="text-[11px] text-[#04101e] dark:text-slate-200 font-black uppercase tracking-wide mt-0.5">{label}</div>
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
        {renderGaugeBlock('fg-us', 'Estados Unidos', 'CBOE VIX', us)}
        {renderGaugeBlock('fg-br', 'Brasil', 'S&P/B3 Ibovespa VIX', br)}
      </div>

      <div className="text-[8px] text-[#6a8db0] dark:text-slate-500 mt-2.5 px-0.5 leading-snug">
        Estágios inspirados na escala do CNN Fear &amp; Greed Index, derivados da volatilidade implícita (VIX) e calibrados contra leituras reais do índice. Brasil medido pelo S&amp;P/B3 Ibovespa VIX oficial, calculado sobre opções do Ibovespa.
      </div>
    </div>
  );
}
