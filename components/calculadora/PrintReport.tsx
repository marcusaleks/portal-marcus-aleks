"use client";

import type { ResultadoTriplo } from "../../pages/calculadora";

interface PrintReportProps {
  resultado: ResultadoTriplo;
  printTime: string;
}

const DISCLAIMER = "Esta calculadora é uma ferramenta de referência com fins exclusivamente informativos. Os resultados podem divergir de portais oficiais em função de diferenças metodológicas, arredondamentos ou datas de corte dos dados. Não nos responsabilizamos por decisões tomadas com base nestes cálculos. Consulte sempre fontes oficiais (BCB, IBGE) para fins jurídicos, financeiros ou contratuais.";

function formatBRL(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatPct(v: number): string {
  return `${v >= 0 ? "+" : ""}${v.toFixed(4).replace(".", ",")}%`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("pt-BR");
}

// SVG inline do logo MAD (igual ao favicon.svg do projeto)
function MadLogo({ size = 20 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width={size} height={size} style={{ flexShrink: 0 }}>
      <rect width="32" height="32" rx="6" fill="#004ac6"/>
      <path d="M5 21 L5 6 L10 6 L16 16 L22 6 L27 6 L27 21 L23 21 L23 11 L17.5 20 L14.5 20 L9 11 L9 21 Z" fill="#ffffff"/>
      <text fontFamily="Arial, sans-serif" fontSize="6.2" fontWeight="700" fill="#ffffff" y="27">
        <tspan x="5">m</tspan><tspan x="14.4">a</tspan><tspan x="23.3">d</tspan>
      </text>
    </svg>
  );
}

const COR = {
  selic: { stroke: "#2563eb", light: "#dbeafe", dark: "#1e3a8a", label: "SELIC", desc: "Taxa Básica de Juros" },
  ipca:  { stroke: "#d97706", light: "#fef3c7", dark: "#78350f", label: "IPCA",  desc: "Inflação Oficial"    },
  ptax:  { stroke: "#059669", light: "#d1fae5", dark: "#064e3b", label: "PTAX",  desc: "Câmbio USD/BRL"      },
} as const;

type Idx = keyof typeof COR;

// Gera pontos SVG para o gráfico baseado nos valores reais
function buildChartPoints(resultado: ResultadoTriplo) {
  // Amostragem: data_inicial + primeiros dias de cada mês + data_final
  const { data_inicial, data_final, valor_inicial, fluxos, marketData } = resultado;

  // Importar motores dinamicamente seria circular — usamos os valores já calculados
  // do detalhamento para reconstruir os pontos mensais via proporção do índice final
  // Simplificação: usamos os valores finais como âncoras e interpolamos linearmente
  // para manter o relatório independente dos motores no componente de impressão.
  // Os valores exatos aparecem nos cards — o gráfico é ilustrativo da tendência.

  const selicFinal = resultado.selic.valor_final;
  const ipcaFinal  = resultado.ipca.valor_final;
  const ptaxFinal  = resultado.ptax.valor_final;
  const base       = valor_inicial;

  const totalMs = data_final.getTime() - data_inicial.getTime();

  // Datas de amostragem
  const datas: Date[] = [new Date(data_inicial)];
  const cursor = new Date(data_inicial.getFullYear(), data_inicial.getMonth() + 1, 1);
  while (cursor < data_final) {
    datas.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  datas.push(new Date(data_final));

  return datas.map((d) => {
    const t = totalMs > 0 ? (d.getTime() - data_inicial.getTime()) / totalMs : 1;
    return {
      label: d.toLocaleDateString("pt-BR", { month: "2-digit", year: "2-digit" }),
      selic: base + (selicFinal - base) * t,
      ipca:  base + (ipcaFinal  - base) * t,
      ptax:  base + (ptaxFinal  - base) * t,
    };
  });
}

function ChartSVG({ resultado }: { resultado: ResultadoTriplo }) {
  const points = buildChartPoints(resultado);
  if (points.length < 2) return null;

  const W = 660, H = 160;
  const PAD_L = 60, PAD_R = 60, PAD_T = 10, PAD_B = 24;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const allVals = points.flatMap((p) => [p.selic, p.ipca, p.ptax]);
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);
  const range = maxV - minV || 1;
  const pad = range * 0.12;
  const lo = minV - pad, hi = maxV + pad;

  function px(i: number) { return PAD_L + (i / (points.length - 1)) * chartW; }
  function py(v: number) { return PAD_T + chartH - ((v - lo) / (hi - lo)) * chartH; }

  function polyline(key: Idx) {
    return points.map((p, i) => `${px(i)},${py(p[key])}`).join(" ");
  }

  // Grid lines (5 horizontais)
  const gridVals = Array.from({ length: 5 }, (_, i) => lo + (hi - lo) * (i / 4));

  // X labels: primeiro, meio e último
  const xLabels = [0, Math.floor((points.length - 1) / 2), points.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <style>{`.lb{font-family:'IBM Plex Mono',monospace;font-size:9px;fill:#aaa}`}</style>

      {/* Grid horizontal */}
      {gridVals.map((v, i) => (
        <g key={i}>
          <line x1={PAD_L} y1={py(v)} x2={W - PAD_R} y2={py(v)} stroke="#eeebe4" strokeWidth="1"/>
          <text x={PAD_L - 4} y={py(v) + 3} className="lb" textAnchor="end">
            {v.toLocaleString("pt-BR", { notation: "compact", maximumFractionDigits: 1 })}
          </text>
        </g>
      ))}

      {/* X labels */}
      {xLabels.map((i) => (
        <text key={i} x={px(i)} y={H - 4} className="lb" textAnchor="middle">
          {points[i].label}
        </text>
      ))}

      {/* Linhas */}
      {(["selic", "ipca", "ptax"] as Idx[]).map((key, ki) => (
        <polyline
          key={key}
          points={polyline(key)}
          fill="none"
          stroke={COR[key].stroke}
          strokeWidth={key === "selic" ? 2.5 : 2}
          strokeDasharray={ki === 1 ? "6,3" : ki === 2 ? "2,5" : undefined}
          strokeLinejoin="round"
        />
      ))}

      {/* Dots e labels nos valores finais */}
      {(["selic", "ipca", "ptax"] as Idx[]).map((key) => {
        const last = points[points.length - 1];
        const x = px(points.length - 1);
        const y = py(last[key]);
        const val = key === "selic" ? resultado.selic.valor_final
                  : key === "ipca"  ? resultado.ipca.valor_final
                  : resultado.ptax.valor_final;
        return (
          <g key={key}>
            <circle cx={x} cy={y} r="3.5" fill="white" stroke={COR[key].stroke} strokeWidth="2"/>
            <text x={x + 6} y={y + 3} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fill: COR[key].stroke, fontWeight: 600 }}>
              {formatBRL(val)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function PrintReport({ resultado, printTime }: PrintReportProps) {
  const selicR = resultado.selic;
  const ipcaR  = resultado.ipca;
  const ptaxR  = resultado.ptax;
  const selicFinal = selicR.valor_final;

  const indices: { key: Idx; r: typeof selicR }[] = [
    { key: "selic", r: selicR },
    { key: "ipca",  r: ipcaR  },
    { key: "ptax",  r: ptaxR  },
  ];

  return (
    <div className="print-report-page">

      {/* HEADER */}
      <div className="pr-header">
        <div className="pr-header-title">Calculadora de Fluxo Financeiro</div>
        <div className="pr-header-datetime">{printTime}</div>
      </div>

      {/* DISCLAIMER */}
      <div className="pr-disclaimer">
        <span className="pr-disclaimer-icon">⚠</span>
        <span className="pr-disclaimer-text">{DISCLAIMER}</span>
      </div>

      {/* PARAMS */}
      <div className="pr-params">
        <span className="pr-params-label">Parâmetros</span>
        <span className="pr-params-value">{formatBRL(resultado.valor_inicial)}</span>
        <span className="pr-params-sep">·</span>
        <span className="pr-params-value">
          {formatDate(resultado.data_inicial)} → {formatDate(resultado.data_final)}
        </span>
        {resultado.fluxos.length > 0 && (
          <>
            <span className="pr-params-sep">·</span>
            <span className="pr-params-value">
              {resultado.fluxos.map(f =>
                `${f.valor >= 0 ? "+" : ""}${formatBRL(f.valor)} em ${formatDate(f.data)}`
              ).join(" · ")}
            </span>
          </>
        )}
        <span className="pr-params-du">{resultado.dias_uteis} d.u.</span>
      </div>

      {/* SECTION HEADER */}
      <div className="pr-section-header">
        <span className="pr-section-label">Resultado</span>
        <span className="pr-section-period">
          {formatDate(resultado.data_inicial)} → {formatDate(resultado.data_final)} · {resultado.dias_uteis} dias úteis
        </span>
      </div>

      {/* CARDS */}
      <div className="pr-cards">
        {indices.map(({ key, r }) => {
          const cor = COR[key];
          const vsSelicAbs = r.valor_final - selicFinal;
          const pos = r.taxa_retorno >= 0;
          return (
            <div key={key} className={`pr-card pr-card-${key}`}>
              <div className="pr-card-index">{cor.label}{key === "selic" ? " ★" : ""}</div>
              <div className="pr-card-desc">{cor.desc}</div>
              <div className="pr-card-value">{formatBRL(r.valor_final)}</div>
              <div className="pr-card-base">de {formatBRL(resultado.valor_inicial)}</div>
              <div className={`pr-card-pct ${pos ? "pos" : "neg"}`}>{formatPct(r.taxa_retorno)}</div>
              {key === "selic" ? (
                <div className="pr-card-ref">REFERÊNCIA</div>
              ) : (
                <div className="pr-card-vs">
                  {vsSelicAbs >= 0 ? "+" : "−"}{formatBRL(Math.abs(vsSelicAbs))} vs SELIC
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CHART */}
      <div className="pr-chart-section">
        <div className="pr-chart-title">Evolução do Saldo</div>
        <div className="pr-chart-wrap">
          <ChartSVG resultado={resultado} />
        </div>
        <div className="pr-chart-legend">
          {(["selic", "ipca", "ptax"] as Idx[]).map((key) => (
            <div key={key} className="pr-legend-item">
              <div className="pr-legend-dot" style={{ background: COR[key].stroke }}/>
              {COR[key].label}
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className="pr-footer">
        <div className="pr-footer-brand">
          <MadLogo size={20} />
          MAD Developers
        </div>
        <div className="pr-footer-url">marcus.aleks.nom.br/calculadora</div>
        <div className="pr-footer-sources">Fontes: BCB SEAD · SELIC · IPCA · PTAX</div>
      </div>

    </div>
  );
}
