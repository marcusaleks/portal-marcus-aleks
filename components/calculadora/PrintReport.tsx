"use client";

import type { ResultadoTriplo } from "../../pages/calculadora";
import type { IndiceType, MarketData, Fluxo } from "../../lib/types/market-data";
import { indiceSelicNaData } from "../../lib/calculadora/selic";
import { indiceIPCANaData } from "../../lib/calculadora/ipca";
import { indicePTAXNaData } from "../../lib/calculadora/ptax";

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
  selic: { stroke: "#2563eb", label: "SELIC", desc: "Taxa Básica de Juros" },
  ipca:  { stroke: "#d97706", label: "IPCA",  desc: "Inflação Oficial"    },
  ptax:  { stroke: "#059669", label: "PTAX",  desc: "Câmbio USD/BRL"      },
} as const;

type Idx = keyof typeof COR;

// ── Motores reais (mesma lógica do EvolutionChart) ────────────────────────────

function obterIndice(indice: IndiceType, data: Date, md: MarketData): number {
  switch (indice) {
    case "selic": return indiceSelicNaData(data, md.selic, md.feriados);
    case "ipca":  return indiceIPCANaData(data, md.ipca, md.feriados);
    case "ptax":  return indicePTAXNaData(data, md.ptax, md.feriados);
  }
}

function saldoEm(
  data: Date,
  fluxosBase: { data: Date; valor: number }[],
  indice: IndiceType,
  md: MarketData
): number {
  let indiceFim: number;
  try { indiceFim = obterIndice(indice, data, md); } catch { return 0; }

  let saldo = 0;
  for (const f of fluxosBase) {
    if (f.data > data) break;
    let indiceIni: number;
    try { indiceIni = obterIndice(indice, f.data, md); } catch { continue; }
    if (indiceIni === 0) continue;
    saldo += f.valor * (indiceFim / indiceIni);
  }
  return parseFloat(saldo.toFixed(2));
}

function buildChartPoints(resultado: ResultadoTriplo) {
  const { data_inicial, data_final, valor_inicial, fluxos, marketData } = resultado;

  const todosFluxos: { data: Date; valor: number }[] = [
    { data: data_inicial, valor: valor_inicial },
    ...fluxos.map((f: Fluxo) => ({ data: f.data, valor: f.valor })),
  ].sort((a, b) => a.data.getTime() - b.data.getTime());

  const datas: Date[] = [new Date(data_inicial)];
  const cursor = new Date(data_inicial.getFullYear(), data_inicial.getMonth() + 1, 1);
  while (cursor < data_final) {
    datas.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  datas.push(new Date(data_final));

  return datas.map((d) => ({
    label: d.toLocaleDateString("pt-BR", { month: "2-digit", year: "2-digit" }),
    selic: saldoEm(d, todosFluxos, "selic", marketData),
    ipca:  saldoEm(d, todosFluxos, "ipca",  marketData),
    ptax:  saldoEm(d, todosFluxos, "ptax",  marketData),
  }));
}

// ── Gráfico SVG ───────────────────────────────────────────────────────────────

function ChartSVG({ resultado }: { resultado: ResultadoTriplo }) {
  const points = buildChartPoints(resultado);
  if (points.length < 2) return null;

  const W = 660, H = 220;
  const PAD_L = 72, PAD_R = 110, PAD_T = 14, PAD_B = 28;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const allVals = points.flatMap((p) => [p.selic, p.ipca, p.ptax]);
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);
  const range = maxV - minV || 1;
  // pad mínimo de 20% do range ou 10% do valor máximo, o que for maior
  const pad = Math.max(range * 0.20, maxV * 0.10, 1);
  const lo = minV - pad * 0.6;
  const hi = maxV + pad * 1.4;

  function px(i: number) { return PAD_L + (i / (points.length - 1)) * chartW; }
  function py(v: number) { return PAD_T + chartH - ((v - lo) / (hi - lo)) * chartH; }

  function polylinePts(key: Idx) {
    return points.map((p, i) => `${px(i)},${py(p[key])}`).join(" ");
  }

  const gridVals = Array.from({ length: 5 }, (_, i) => lo + (hi - lo) * (i / 4));

  const step = Math.max(1, Math.floor((points.length - 1) / 5));
  const xIdxs = Array.from({ length: Math.ceil(points.length / step) }, (_, i) => Math.min(i * step, points.length - 1));
  if (!xIdxs.includes(points.length - 1)) xIdxs.push(points.length - 1);

  // Ordena índices por valor final desc para posicionar labels sem colisão
  const finalOrder = (["selic", "ipca", "ptax"] as Idx[])
    .map((key) => ({
      key,
      val: key === "selic" ? resultado.selic.valor_final
         : key === "ipca"  ? resultado.ipca.valor_final
         : resultado.ptax.valor_final,
    }))
    .sort((a, b) => b.val - a.val);

  // Calcula posições Y dos labels, forçando separação mínima de 13px
  const MIN_SEP = 13;
  const labelPositions: Record<string, number> = {};
  finalOrder.forEach(({ key, val }, rank) => {
    const rawY = py(val);
    if (rank === 0) { labelPositions[key] = rawY; return; }
    const prevKey = finalOrder[rank - 1].key;
    const prevY = labelPositions[prevKey];
    labelPositions[key] = Math.max(rawY, prevY + MIN_SEP);
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <style>{`.lb{font-family:'IBM Plex Mono',monospace;font-size:8.5px;fill:#aaa}`}</style>

      {/* Grid horizontal */}
      {gridVals.map((v, i) => (
        <g key={i}>
          <line x1={PAD_L} y1={py(v)} x2={W - PAD_R} y2={py(v)} stroke="#eeebe4" strokeWidth="1"/>
          <text x={PAD_L - 5} y={py(v) + 3} className="lb" textAnchor="end">
            {v.toLocaleString("pt-BR", { notation: "compact", maximumFractionDigits: 1 })}
          </text>
        </g>
      ))}

      {/* X labels */}
      {xIdxs.map((i) => (
        <text key={i} x={px(i)} y={H - 4} className="lb" textAnchor="middle">
          {points[i].label}
        </text>
      ))}

      {/* Linhas */}
      {(["selic", "ipca", "ptax"] as Idx[]).map((key, ki) => (
        <polyline
          key={key}
          points={polylinePts(key)}
          fill="none"
          stroke={COR[key].stroke}
          strokeWidth={key === "selic" ? 2.5 : 2}
          strokeDasharray={ki === 1 ? "6,3" : ki === 2 ? "2,5" : undefined}
          strokeLinejoin="round"
        />
      ))}

      {/* Dots no ponto final + labels à direita com separação garantida */}
      {(["selic", "ipca", "ptax"] as Idx[]).map((key) => {
        const last = points[points.length - 1];
        const xDot = px(points.length - 1);
        const yDot = py(last[key]);
        const yLabel = labelPositions[key] ?? yDot;
        const val = key === "selic" ? resultado.selic.valor_final
                  : key === "ipca"  ? resultado.ipca.valor_final
                  : resultado.ptax.valor_final;
        return (
          <g key={key}>
            <circle cx={xDot} cy={yDot} r="3.5" fill="white" stroke={COR[key].stroke} strokeWidth="2"/>
            {/* linha conectando dot ao label quando deslocado */}
            {Math.abs(yLabel - yDot) > 2 && (
              <line x1={xDot + 3} y1={yDot} x2={xDot + 8} y2={yLabel} stroke={COR[key].stroke} strokeWidth="0.8" opacity="0.5"/>
            )}
            <text
              x={xDot + 10}
              y={yLabel + 3}
              style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fill: COR[key].stroke, fontWeight: 600 }}
            >
              {formatBRL(val)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function PrintReport({ resultado, printTime }: PrintReportProps) {
  const selicR     = resultado.selic;
  const ipcaR      = resultado.ipca;
  const ptaxR      = resultado.ptax;
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
              {resultado.fluxos.map((f) => {
                const tipo = f.valor >= 0 ? "Aporte" : "Resgate";
                const sinal = f.valor >= 0 ? "+" : "−";
                return `${sinal} ${tipo} ${formatBRL(Math.abs(f.valor))} em ${formatDate(f.data)}`;
              }).join(" · ")}
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
