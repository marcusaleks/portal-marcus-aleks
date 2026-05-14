"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ResultadoTriplo } from "../../pages/calculadora";

interface ResultadoCardsProps {
  resultado: ResultadoTriplo;
}

function formatBRL(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatPct(v: number): string {
  return `${v >= 0 ? "+" : ""}${v.toFixed(4).replace(".", ",")}%`;
}

const INDICES = [
  {
    key:    "selic" as const,
    label:  "SELIC",
    desc:   "Taxa básica de juros",
    border: "border-blue-500/40",
    text:   "text-blue-400",
    bg:     "bg-blue-500/5",
    star:   true,
  },
  {
    key:    "ipca" as const,
    label:  "IPCA",
    desc:   "Inflação oficial",
    border: "border-amber-500/40",
    text:   "text-amber-400",
    bg:     "bg-amber-500/5",
    star:   false,
  },
  {
    key:    "ptax" as const,
    label:  "PTAX",
    desc:   "Câmbio USD/BRL",
    border: "border-emerald-500/40",
    text:   "text-emerald-400",
    bg:     "bg-emerald-500/5",
    star:   false,
  },
];

export default function ResultadoCards({ resultado }: ResultadoCardsProps) {
  const selicFinal = resultado.selic.valor_final;

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {INDICES.map(({ key, label, desc, border, text, bg, star }) => {
        const r          = resultado[key];
        const vsSelicAbs = r.valor_final - selicFinal;
        const positivo   = r.taxa_retorno >= 0;
        const melhorSelic = vsSelicAbs >  0.005;
        const piorSelic   = vsSelicAbs < -0.005;

        const IconeTendencia = positivo ? TrendingUp : TrendingDown;
        const corTendencia   = positivo ? "text-emerald-400" : "text-red-400";

        return (
          <div key={key} className={`p-6 border ${border} ${bg} rounded-[2rem] space-y-4`}>

            {/* Cabeçalho */}
            <div className="flex items-center justify-between">
              <div>
                <span className={`text-xs font-black uppercase tracking-widest ${text}`}>
                  {label}{star ? " ★" : ""}
                </span>
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">
                  {desc}
                </p>
              </div>
              <IconeTendencia size={18} className={corTendencia} />
            </div>

            {/* Valor final */}
            <div>
              <p className="text-2xl font-black text-white font-mono leading-none">
                {formatBRL(r.valor_final)}
              </p>
              <p className="text-xs text-slate-600 font-mono mt-1">
                de {formatBRL(resultado.valor_inicial)}
              </p>
            </div>

            {/* Retorno */}
            <div className={`text-sm font-black font-mono ${corTendencia}`}>
              {formatPct(r.taxa_retorno)}
            </div>

            {/* vs SELIC */}
            {star ? (
              <div className="text-xs font-bold text-slate-600 uppercase tracking-widest pt-1 border-t border-slate-800">
                Referência
              </div>
            ) : (
              <div className={`flex items-center gap-1.5 text-xs font-bold pt-1 border-t border-slate-800 ${
                melhorSelic ? "text-emerald-400" : piorSelic ? "text-red-400" : "text-slate-500"
              }`}>
                {melhorSelic
                  ? <TrendingUp size={12} />
                  : piorSelic
                    ? <TrendingDown size={12} />
                    : <Minus size={12} />}
                {vsSelicAbs >= 0 ? "+" : ""}{formatBRL(vsSelicAbs)} vs SELIC
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
