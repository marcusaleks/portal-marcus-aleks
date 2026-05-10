"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ResultadoTriplo } from "../../pages/calculadora";
import type { IndiceType, MarketData, Fluxo } from "../../lib/types/market-data";
import { indiceSelicNaData } from "../../lib/calculadora/selic";
import { indiceIPCANaData } from "../../lib/calculadora/ipca";
import { indicePTAXNaData } from "../../lib/calculadora/ptax";

interface EvolutionChartProps {
  resultado: ResultadoTriplo;
}

const COR: Record<IndiceType, string> = {
  selic: "#3B82F6",
  ipca:  "#10B981",
  ptax:  "#F59E0B",
};

function formatBRL(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateLabel(d: Date): string {
  return d.toLocaleDateString("pt-BR", { month: "2-digit", year: "2-digit" });
}

function obterIndice(indice: IndiceType, data: Date, md: MarketData): number {
  switch (indice) {
    case "selic": return indiceSelicNaData(data, md.selic, md.feriados);
    case "ipca":  return indiceIPCANaData(data, md.ipca, md.feriados);
    case "ptax":  return indicePTAXNaData(data, md.ptax, md.feriados);
  }
}

// Calcula o saldo de todos os fluxos já aplicados até 'data', corrigidos pelo índice em 'data'.
// Fluxos posteriores a 'data' são ignorados.
// saldo = Σ fluxo_i × (indice_data / indice_i)  para fluxo_i.data <= data
function saldoEm(
  data: Date,
  fluxosBase: { data: Date; valor: number }[],
  indice: IndiceType,
  md: MarketData
): number {
  let indiceFim: number;
  try {
    indiceFim = obterIndice(indice, data, md);
  } catch {
    return 0;
  }

  let saldo = 0;
  for (const f of fluxosBase) {
    if (f.data > data) break;
    let indiceIni: number;
    try {
      indiceIni = obterIndice(indice, f.data, md);
    } catch {
      continue;
    }
    if (indiceIni === 0) continue;
    saldo += f.valor * (indiceFim / indiceIni);
  }
  return parseFloat(saldo.toFixed(2));
}

function buildChartData(resultado: ResultadoTriplo) {
  const { data_inicial, data_final, valor_inicial, fluxos, marketData } = resultado;

  // Fluxos completos: aporte inicial + fluxos adicionais, ordenados por data
  const todosFluxos: { data: Date; valor: number }[] = [
    { data: data_inicial, valor: valor_inicial },
    ...fluxos.map((f: Fluxo) => ({ data: f.data, valor: f.valor })),
  ].sort((a, b) => a.data.getTime() - b.data.getTime());

  // Datas de amostragem: data_inicial + primeiros dias de cada mês do intervalo + data_final
  const datas: Date[] = [new Date(data_inicial)];

  const cursor = new Date(data_inicial.getFullYear(), data_inicial.getMonth() + 1, 1);
  while (cursor < data_final) {
    datas.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  datas.push(new Date(data_final));

  return datas.map((d) => ({
    label: formatDateLabel(d),
    selic: saldoEm(d, todosFluxos, "selic", marketData),
    ipca:  saldoEm(d, todosFluxos, "ipca",  marketData),
    ptax:  saldoEm(d, todosFluxos, "ptax",  marketData),
  }));
}

interface TooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const sorted = [...payload].sort((a, b) => b.value - a.value);
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 shadow-xl space-y-1.5 min-w-[180px]">
      <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">{label}</p>
      {sorted.map((p) => (
        <div key={p.name} className="flex justify-between items-center gap-4">
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: p.color }}>
            {p.name.toUpperCase()}
          </span>
          <span className="text-sm font-mono font-bold text-white">{formatBRL(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function EvolutionChart({ resultado }: EvolutionChartProps) {
  const data = buildChartData(resultado);
  if (data.length < 2) return null;

  const allValues = data.flatMap((d) => [d.selic, d.ipca, d.ptax]);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const padding = (maxVal - minVal) * 0.08 || 10;

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="label"
            tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }}
            axisLine={{ stroke: "#1e293b" }}
            tickLine={false}
          />
          <YAxis
            domain={[minVal - padding, maxVal + padding]}
            tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }}
            axisLine={{ stroke: "#1e293b" }}
            tickLine={false}
            tickFormatter={(v) =>
              v.toLocaleString("pt-BR", { notation: "compact", maximumFractionDigits: 1 })
            }
            width={72}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span style={{ color: COR[value as IndiceType], fontSize: 11, fontWeight: 900, letterSpacing: "0.1em" }}>
                {value.toUpperCase()}
              </span>
            )}
            wrapperStyle={{ paddingTop: "12px" }}
          />
          {(["selic", "ipca", "ptax"] as IndiceType[]).map((key) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={key}
              stroke={COR[key]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
