"use client";

import { useState } from "react";
import { Plus, Trash2, Calculator, RotateCcw } from "lucide-react";
import type { InputCalculadora, Fluxo } from "../../lib/types/market-data";

interface FluxoInput {
  id: number;
  data: string;
  valor: string;
  tipo: "aporte" | "resgate";
}

interface CalculadoraFormProps {
  onCalcular: (input: Omit<InputCalculadora, "indice" | "marketData">) => void;
  onLimpar: () => void;
  dataMin?: string;
  dataMax?: string;
  carregando?: boolean;
}

export default function CalculadoraForm({
  onCalcular,
  onLimpar,
  dataMin,
  dataMax,
  carregando,
}: CalculadoraFormProps) {
  const [dataInicial, setDataInicial]   = useState("");
  const [dataFinal, setDataFinal]       = useState("");
  const [valorInicial, setValorInicial] = useState("");
  const [fluxos, setFluxos]             = useState<FluxoInput[]>([]);
  const [erros, setErros]               = useState<string[]>([]);
  let nextId = 1;

  function adicionarFluxo() {
    setFluxos((prev) => [
      ...prev,
      { id: nextId++, data: "", valor: "", tipo: "aporte" },
    ]);
  }

  function removerFluxo(id: number) {
    setFluxos((prev) => prev.filter((f) => f.id !== id));
  }

  function atualizarFluxo(id: number, campo: keyof FluxoInput, valor: string) {
    setFluxos((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [campo]: valor } : f))
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

    const valor = parseFloat(valorInicial.replace(",", "."));
    if (!valorInicial || isNaN(valor) || valor <= 0)
      errs.push("Valor inicial deve ser maior que zero.");

    fluxos.forEach((f, i) => {
      if (!f.data)
        errs.push(`Fluxo ${i + 1}: data obrigatória.`);
      else if (dataInicial && dataFinal && (f.data < dataInicial || f.data > dataFinal))
        errs.push(`Fluxo ${i + 1}: data fora do período.`);
      const v = parseFloat(f.valor.replace(",", "."));
      if (!f.valor || isNaN(v) || v <= 0)
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
      const v = parseFloat(f.valor.replace(",", "."));
      return {
        data: new Date(y, m - 1, d),
        valor: f.tipo === "resgate" ? -v : v,
        tipo: f.tipo,
      };
    });

    const [yi, mi, di] = dataInicial.split("-").map(Number);
    const [yf, mf, df] = dataFinal.split("-").map(Number);

    onCalcular({
      valor_inicial: parseFloat(valorInicial.replace(",", ".")),
      fluxos: fluxosConvertidos,
      data_inicial: new Date(yi, mi - 1, di),
      data_final:   new Date(yf, mf - 1, df),
    });
  }

  const inputClass =
    "w-full bg-black/60 border border-slate-800 focus:border-blue-600 " +
    "rounded-2xl px-6 py-4 text-white font-mono text-sm outline-none transition-all " +
    "placeholder:text-slate-700";

  const labelClass = "block text-xs font-black uppercase tracking-widest text-slate-500 mb-2";

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
          type="number"
          min="0.01"
          max="99999999.99"
          step="0.01"
          placeholder="10000.00"
          value={valorInicial}
          onChange={(e) => setValorInicial(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Fluxos adicionais */}
      {fluxos.length > 0 && (
        <div className="space-y-3">
          <p className={labelClass}>Aportes / Resgates</p>
          {fluxos.map((f, i) => (
            <div key={f.id} className="grid grid-cols-[1fr_1fr_auto_auto] gap-3 items-end">
              <div>
                {i === 0 && <label className={labelClass}>Data</label>}
                <input
                  type="date"
                  value={f.data}
                  min={dataInicial || dataMin}
                  max={dataFinal   || dataMax}
                  onChange={(e) => atualizarFluxo(f.id, "data", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                {i === 0 && <label className={labelClass}>Valor (R$)</label>}
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="5000.00"
                  value={f.valor}
                  onChange={(e) => atualizarFluxo(f.id, "valor", e.target.value)}
                  className={inputClass}
                />
              </div>
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
              <div className={i === 0 ? "mt-6" : ""}>
                <button
                  type="button"
                  onClick={() => removerFluxo(f.id)}
                  className="p-4 border border-slate-800 rounded-2xl text-slate-600 hover:text-red-500 hover:border-red-500/40 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botão adicionar fluxo */}
      <button
        type="button"
        onClick={adicionarFluxo}
        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-blue-400 transition-all"
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
          className="h-14 px-6 border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-600 font-black rounded-2xl flex items-center gap-2 transition-all uppercase text-sm tracking-widest"
        >
          <RotateCcw size={16} /> Limpar
        </button>
      </div>
    </form>
  );
}
