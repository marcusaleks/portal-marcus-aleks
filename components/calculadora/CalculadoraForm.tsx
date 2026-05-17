"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, Calculator, RotateCcw } from "lucide-react";
import type { InputCalculadora, Fluxo } from "../../lib/types/market-data";
import type { ResultadoTriplo } from "../../pages/calculadora";

interface FluxoInput {
  id: number;
  data: string;
  valor: string;
  tipo: "aporte" | "resgate";
  dataErro?: string;
}

interface CalculadoraFormProps {
  onCalcular: (input: Omit<InputCalculadora, "indice" | "marketData">) => void;
  onLimpar: () => void;
  dataMin?: string;
  dataMax?: string;
  carregando?: boolean;
  resultado?: ResultadoTriplo | null;
}

function formatBRL(v: number): string {
  return Math.abs(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function mascaraBRL(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const centavos = parseInt(digits, 10);
  return (centavos / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseBRL(formatted: string): number {
  return parseFloat(formatted.replace(/\./g, "").replace(",", ".")) || 0;
}

export default function CalculadoraForm({
  onCalcular,
  onLimpar,
  dataMin,
  dataMax,
  carregando,
  resultado,
}: CalculadoraFormProps) {
  const [dataInicial, setDataInicial]   = useState("");
  const [dataFinal, setDataFinal]       = useState("");
  const [valorInicial, setValorInicial] = useState("");
  const [fluxos, setFluxos]             = useState<FluxoInput[]>([]);
  const [erros, setErros]               = useState<string[]>([]);
  const nextId = useRef(1);

  function adicionarFluxo() {
    setFluxos((prev) => [
      ...prev,
      { id: nextId.current++, data: "", valor: "", tipo: "aporte" },
    ]);
  }

  function removerFluxo(id: number) {
    setFluxos((prev) => prev.filter((f) => f.id !== id));
  }

  function atualizarFluxo(id: number, campo: keyof FluxoInput, valor: string) {
    setFluxos((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        const updated = { ...f, [campo]: valor };
        if (campo === "data") {
          if (valor && dataInicial && valor < dataInicial)
            updated.dataErro = `Data anterior à data inicial (${dataInicial})`;
          else if (valor && dataFinal && valor > dataFinal)
            updated.dataErro = `Data posterior à data final (${dataFinal})`;
          else
            updated.dataErro = undefined;
        }
        return updated;
      })
    );
  }

  function limpar() {
    setDataInicial("");
    setDataFinal("");
    setValorInicial("");
    setFluxos([]);
    setErros([]);
    onLimpar();
  }

  function validar(): string[] {
    const errs: string[] = [];
    if (!dataInicial) errs.push("Data inicial é obrigatória.");
    if (!dataFinal)   errs.push("Data final é obrigatória.");
    if (dataInicial && dataFinal && dataInicial >= dataFinal)
      errs.push("Data final deve ser posterior à data inicial.");

    const valor = parseBRL(valorInicial);
    if (!valorInicial || valor <= 0)
      errs.push("Valor inicial deve ser maior que zero.");

    fluxos.forEach((f, i) => {
      if (!f.data)
        errs.push(`Fluxo ${i + 1}: data obrigatória.`);
      else if (dataInicial && dataFinal && (f.data < dataInicial || f.data > dataFinal))
        errs.push(`Fluxo ${i + 1}: data fora do período.`);
      const v = parseBRL(f.valor);
      if (!f.valor || v <= 0)
        errs.push(`Fluxo ${i + 1}: valor deve ser maior que zero.`);
    });

    return errs;
  }

  function submeter(e: React.FormEvent) {
    e.preventDefault();
    const errs = validar();
    if (errs.length > 0) { setErros(errs); return; }
    setErros([]);

    const fluxosConvertidos: Fluxo[] = fluxos.map((f) => {
      const [y, m, d] = f.data.split("-").map(Number);
      const v = parseBRL(f.valor);
      return {
        data: new Date(y, m - 1, d),
        valor: f.tipo === "resgate" ? -v : v,
        tipo: f.tipo,
      };
    });

    const [yi, mi, di] = dataInicial.split("-").map(Number);
    const [yf, mf, df] = dataFinal.split("-").map(Number);

    onCalcular({
      valor_inicial: parseBRL(valorInicial),
      fluxos: fluxosConvertidos,
      data_inicial: new Date(yi, mi - 1, di),
      data_final:   new Date(yf, mf - 1, df),
    });
  }

  // detalhamento[0] = valor inicial, detalhamento[1..n] = fluxos adicionais
  // usamos SELIC como referência para o valor corrigido exibido por linha
  const detSelic = resultado?.selic.detalhamento ?? [];

  const inputClass =
    "w-full bg-[#f5f9ff] dark:bg-[#061426] border border-[#004ac6]/20 dark:border-[#004ac6]/30 " +
    "focus:border-[#004ac6] dark:focus:border-[#5ea2ff] " +
    "rounded-2xl px-6 py-4 text-[#04101e] dark:text-white font-mono text-sm outline-none transition-all " +
    "placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-inner";

  const labelClass = "block text-xs font-black uppercase tracking-widest text-[#004ac6] dark:text-[#5ea2ff] mb-2";

  return (
    <form onSubmit={submeter} className="space-y-6">

      {/* Linha 1: datas */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Data inicial</label>
          <input
            type="date"
            value={dataInicial}
            min={dataMin}
            max={dataMax}
            onChange={(e) => setDataInicial(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Data final</label>
          <input
            type="date"
            value={dataFinal}
            min={dataMin}
            max={dataMax}
            onChange={(e) => setDataFinal(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Valor inicial */}
      <div>
        <label className={labelClass}>Valor inicial (R$)</label>
        <input
          type="text"
          inputMode="numeric"
          placeholder="0,00"
          value={valorInicial}
          onChange={(e) => setValorInicial(mascaraBRL(e.target.value))}
          className={inputClass}
        />
      </div>

      {/* Fluxos adicionais */}
      {fluxos.length > 0 && (
        <div className="space-y-3">
          <p className={labelClass}>Aportes / Resgates</p>
          {fluxos.map((f, i) => {
            const isAporte = f.tipo === "aporte";
            // detalhamento[0] = valor inicial, fluxos adicionais começam no índice 1
            const det = detSelic[i + 1];
            const valorCorrigido = det?.valor_corrigido;
            const valorOriginal  = det ? Math.abs(det.fluxo) : null;
            const pct = (valorCorrigido != null && valorOriginal != null && valorOriginal > 0)
              ? ((Math.abs(valorCorrigido) - valorOriginal) / valorOriginal) * 100
              : null;

            // cores por tipo
            const corBorda  = isAporte ? "border-blue-500/30"  : "border-red-500/30";
            const corFundo  = isAporte ? "bg-blue-50 dark:bg-blue-950/20" : "bg-red-50 dark:bg-red-950/20";
            const corTexto  = isAporte ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400";
            const corValor  = isAporte ? "text-blue-700 dark:text-blue-300" : "text-red-700 dark:text-red-300";

            return (
              <div
                key={f.id}
                className={`rounded-2xl border ${corBorda} ${corFundo} p-3 transition-all`}
              >
                <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-3 items-end">
                  {/* Data */}
                  <div>
                    {i === 0 && <label className={labelClass}>Data</label>}
                    <input
                      type="date"
                      value={f.data}
                      onChange={(e) => atualizarFluxo(f.id, "data", e.target.value)}
                      className={inputClass + (f.dataErro ? " border-red-500/60" : "")}
                    />
                    {f.dataErro && (
                      <p className="text-red-400 text-xs font-bold mt-1">{f.dataErro}</p>
                    )}
                  </div>

                  {/* Valor */}
                  <div>
                    {i === 0 && <label className={labelClass}>Valor (R$)</label>}
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0,00"
                      value={f.valor}
                      onChange={(e) => atualizarFluxo(f.id, "valor", mascaraBRL(e.target.value))}
                      className={inputClass}
                    />
                  </div>

                  {/* Tipo */}
                  <div>
                    {i === 0 && <label className={labelClass}>Tipo</label>}
                    <select
                      value={f.tipo}
                      onChange={(e) => atualizarFluxo(f.id, "tipo", e.target.value)}
                      className={inputClass + " cursor-pointer"}
                    >
                      <option value="aporte">Aporte</option>
                      <option value="resgate">Resgate</option>
                    </select>
                  </div>

                  {/* Valor corrigido (SELIC) — só exibe após cálculo */}
                  <div className="min-w-30">
                    {i === 0 && (
                      <label className={labelClass + " " + corTexto}>
                        Corrigido (SELIC)
                      </label>
                    )}
                    {valorCorrigido != null ? (
                      <div className={`rounded-2xl border ${corBorda} bg-white/50 dark:bg-black/40 px-4 py-4 text-right shadow-sm`}>
                        <p className={`text-sm font-mono font-bold ${corValor}`}>
                          {isAporte ? "+" : "−"}{formatBRL(valorCorrigido)}
                        </p>
                        {pct != null && (
                          <p className={`text-xs font-bold mt-0.5 ${corTexto}`}>
                            {pct >= 0 ? "+" : ""}{pct.toFixed(2)}%
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-[#004ac6]/10 dark:border-slate-800 bg-[#f5f9ff] dark:bg-black/20 px-4 py-4 text-right shadow-sm">
                        <p className="text-xs font-mono text-slate-400 dark:text-slate-700">—</p>
                      </div>
                    )}
                  </div>

                  {/* Remover */}
                  <div className={i === 0 ? "mt-6" : ""}>
                    <button
                      type="button"
                      onClick={() => removerFluxo(f.id)}
                      className="p-4 border border-[#004ac6]/20 dark:border-slate-800 rounded-2xl text-slate-400 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-500 hover:border-red-500/40 transition-all bg-white dark:bg-transparent shadow-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Botão adicionar fluxo */}
      <button
        type="button"
        onClick={adicionarFluxo}
        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#004ac6] dark:text-[#5ea2ff] hover:text-blue-700 dark:hover:text-blue-400 transition-all"
      >
        <Plus size={14} /> Adicionar aporte / resgate
      </button>

      {/* Erros */}
      {erros.length > 0 && (
        <div className="border border-red-500/30 bg-red-950/20 rounded-2xl p-4 space-y-1">
          {erros.map((e, i) => (
            <p key={i} className="text-red-400 text-xs font-bold">{e}</p>
          ))}
        </div>
      )}

      {/* Botões de ação */}
      <div className="flex gap-4 pt-2">
        <button
          type="submit"
          disabled={carregando}
          className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all uppercase text-sm tracking-[0.2em] shadow-xl"
        >
          <Calculator size={18} />
          {carregando ? "Calculando..." : "Calcular"}
        </button>
        <button
          type="button"
          onClick={limpar}
          className="h-14 px-6 border border-[#004ac6]/20 dark:border-slate-800 bg-[#f5f9ff] dark:bg-slate-900 text-[#294c72] dark:text-slate-400 hover:text-[#004ac6] dark:hover:text-white hover:border-[#004ac6]/40 dark:hover:border-slate-600 font-black rounded-2xl flex items-center gap-2 transition-all uppercase text-sm tracking-widest shadow-sm"
        >
          <RotateCcw size={16} /> Limpar
        </button>
      </div>
    </form>
  );
}
