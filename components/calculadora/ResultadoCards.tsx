"use client";

import { TrendingUp, TrendingDown, Calendar, DollarSign, Activity } from "lucide-react";
import type { OutputCalculadora } from "../../lib/types/market-data";

interface ResultadoCardsProps {
  resultado: OutputCalculadora;
}

const COR_INDICE: Record<string, { border: string; text: string; bg: string; label: string }> = {
  selic: {
    border: "border-blue-500/40",
    text:   "text-blue-400",
    bg:     "bg-blue-500/5",
    label:  "SELIC",
  },
  ipca: {
    border: "border-emerald-500/40",
    text:   "text-emerald-400",
    bg:     "bg-emerald-500/5",
    label:  "IPCA",
  },
  ptax: {
    border: "border-red-500/40",
    text:   "text-red-400",
    bg:     "bg-red-500/5",
    label:  "PTAX",
  },
};

function formatBRL(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatPct(v: number): string {
  return `${v >= 0 ? "+" : ""}${v.toFixed(4).replace(".", ",")}%`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("pt-BR");
}

export default function ResultadoCards({ resultado }: ResultadoCardsProps) {
  const {
    valor_inicial,
    valor_final,
    taxa_retorno,
    data_inicial,
    data_final,
    indice,
    dias_uteis,
    custo_oportunidade,
    detalhamento,
  } = resultado;

  const cor = COR_INDICE[indice] ?? COR_INDICE.selic;
  const positivo = custo_oportunidade >= 0;
  const IconeTendencia = positivo ? TrendingUp : TrendingDown;
  const corTendencia = positivo ? "text-emerald-400" : "text-red-400";

  return (
    <div className="space-y-4">

      {/* Badge do índice */}
      <div className="flex items-center gap-3">
        <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${cor.border} ${cor.text} ${cor.bg}`}>
          {cor.label}
        </span>
        <span className="text-xs text-slate-600 font-bold uppercase tracking-widest">
          {formatDate(data_inicial)} → {formatDate(data_final)}
        </span>
      </div>

      {/* Cards principais */}
      <div className="grid md:grid-cols-3 gap-4">

        {/* Card 1: Valor Final */}
        <div className={`p-6 border ${cor.border} ${cor.bg} rounded-[2rem] space-y-2`}>
          <div className="flex items-center gap-2">
            <DollarSign size={16} className={cor.text} />
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Valor final</span>
          </div>
          <p className="text-2xl font-black text-white font-mono">
            {formatBRL(valor_final)}
          </p>
          <p className="text-xs text-slate-600 font-bold font-mono">
            Inicial: {formatBRL(valor_inicial)}
          </p>
        </div>

        {/* Card 2: Taxa de Retorno */}
        <div className={`p-6 border ${positivo ? "border-emerald-500/30" : "border-red-500/30"} ${positivo ? "bg-emerald-500/5" : "bg-red-500/5"} rounded-[2rem] space-y-2`}>
          <div className="flex items-center gap-2">
            <IconeTendencia size={16} className={corTendencia} />
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Taxa de retorno</span>
          </div>
          <p className={`text-2xl font-black font-mono ${corTendencia}`}>
            {formatPct(taxa_retorno)}
          </p>
          <p className="text-xs text-slate-600 font-bold font-mono">
            {positivo ? "+" : ""}{formatBRL(custo_oportunidade)} de rendimento
          </p>
        </div>

        {/* Card 3: Período */}
        <div className="p-6 border border-slate-800 bg-slate-950/20 rounded-[2rem] space-y-2">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-500" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Período</span>
          </div>
          <p className="text-2xl font-black text-white font-mono">
            {dias_uteis} <span className="text-sm text-slate-500">d.u.</span>
          </p>
          <p className="text-xs text-slate-600 font-bold">
            {formatDate(data_inicial)} até {formatDate(data_final)}
          </p>
        </div>
      </div>

      {/* Detalhamento de fluxos */}
      {detalhamento.length > 1 && (
        <div className="mt-2">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={14} className="text-slate-600" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-600">Detalhamento dos fluxos</span>
          </div>
          <div className="overflow-hidden border border-slate-800 rounded-2xl">
            <table className="w-full text-xs">
              <thead className="bg-slate-900/60 text-slate-500 uppercase font-black">
                <tr>
                  <th className="px-4 py-3 text-left">Data</th>
                  <th className="px-4 py-3 text-right">Fluxo</th>
                  <th className="px-4 py-3 text-right">Índice</th>
                  <th className="px-4 py-3 text-right">Valor corrigido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {detalhamento.map((d, i) => (
                  <tr key={i} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-400">{formatDate(d.data)}</td>
                    <td className={`px-4 py-3 font-mono text-right font-bold ${d.fluxo >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {d.fluxo >= 0 ? "+" : ""}{formatBRL(d.fluxo)}
                    </td>
                    <td className="px-4 py-3 font-mono text-right text-slate-500">
                      {d.indice_valor.toFixed(6)}
                    </td>
                    <td className="px-4 py-3 font-mono text-right text-white font-bold">
                      {formatBRL(d.valor_corrigido)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
