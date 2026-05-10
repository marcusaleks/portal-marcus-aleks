"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DetalhamentoFluxo, IndiceType } from "../../lib/types/market-data";

interface EvolutionChartProps {
  detalhamento: DetalhamentoFluxo[];
  indice: IndiceType;
  valorFinal: number;
}

const COR_LINHA: Record<IndiceType, string> = {
  selic: "#3B82F6", // blue-500
  ipca:  "#10B981", // emerald-500
  ptax:  "#EF4444", // red-500
};

function formatDate(d: Date): string {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function formatBRL(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Gera pontos intermediários entre data_ini e data_fim usando interpolação linear de índice
function buildChartData(detalhamento: DetalhamentoFluxo[], valorFinal: number) {
  if (detalhamento.length === 0) return [];

  // Último ponto: valor corrigido final
  const pontos = detalhamento.map((d) => ({
    label: formatDate(d.data),
    valor: d.valor_corrigido,
    fluxo: d.fluxo,
  }));

  // Adicionar ponto final se diferente do último fluxo
  const ultimo = detalhamento[detalhamento.length - 1];
  if (Math.abs(ultimo.valor_corrigido - valorFinal) > 0.01) {
    pontos.push({
      label: "Final",
      valor: valorFinal,
      fluxo: 0,
    });
  }

  return pontos;
}

interface TooltipPayload {
  payload?: { valor: number; fluxo: number };
  label?: string;
}

function CustomTooltip({ payload, label }: TooltipPayload) {
  if (!payload?.valor) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">{label}</p>
      <p className="text-white font-mono font-bold text-sm">{formatBRL(payload.valor)}</p>
      {payload.fluxo !== 0 && (
        <p className={`text-xs font-mono font-bold ${payload.fluxo > 0 ? "text-emerald-400" : "text-red-400"}`}>
          {payload.fluxo > 0 ? "+" : ""}{formatBRL(payload.fluxo)}
        </p>
      )}
    </div>
  );
}

export default function EvolutionChart({ detalhamento, indice, valorFinal }: EvolutionChartProps) {
  const cor = COR_LINHA[indice];
  const data = buildChartData(detalhamento, valorFinal);

  if (data.length < 2) return null;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="gradiente-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={cor} stopOpacity={0.25} />
              <stop offset="95%" stopColor={cor} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="label"
            tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }}
            axisLine={{ stroke: "#1e293b" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }}
            axisLine={{ stroke: "#1e293b" }}
            tickLine={false}
            tickFormatter={(v) =>
              v.toLocaleString("pt-BR", { notation: "compact", maximumFractionDigits: 1 })
            }
            width={72}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="valor"
            stroke={cor}
            strokeWidth={2}
            fill="url(#gradiente-area)"
            dot={{ fill: cor, r: 4, strokeWidth: 0 }}
            activeDot={{ fill: cor, r: 6, strokeWidth: 2, stroke: "#0f172a" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
