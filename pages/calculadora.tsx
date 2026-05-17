import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { ArrowLeft, RefreshCw, AlertTriangle, Printer } from "lucide-react";
import MadSignature from "../components/MadSignature";
import CalculadoraForm from "../components/calculadora/CalculadoraForm";
import ResultadoCards from "../components/calculadora/ResultadoCards";
import EvolutionChart from "../components/calculadora/EvolutionChart";
import PrintReport from "../components/calculadora/PrintReport";
import { calcularFluxoIndexado } from "../lib/calculadora/index";
import { isErroCalculadora } from "../lib/types/market-data";
import type { OutputCalculadora, MarketData, Fluxo } from "../lib/types/market-data";

export interface ResultadoTriplo {
  selic: OutputCalculadora;
  ipca:  OutputCalculadora;
  ptax:  OutputCalculadora;
  data_inicial: Date;
  data_final:   Date;
  valor_inicial: number;
  dias_uteis: number;
  marketData: MarketData;
  fluxos: Fluxo[];
}

interface InputBase {
  valor_inicial: number;
  fluxos: Fluxo[];
  data_inicial: Date;
  data_final: Date;
}

const DISCLAIMER = "⚠ Esta calculadora é uma ferramenta de referência com fins exclusivamente informativos. Os resultados podem divergir de portais oficiais em função de diferenças metodológicas, arredondamentos ou datas de corte dos dados. Não nos responsabilizamos por decisões tomadas com base nestes cálculos. Consulte sempre fontes oficiais (BCB, IBGE) para fins jurídicos, financeiros ou contratuais.";

export default function CalculadoraPage() {
  const [marketData, setMarketData]   = useState<MarketData | null>(null);
  const [loadError, setLoadError]     = useState<string | null>(null);
  const [resultado, setResultado]     = useState<ResultadoTriplo | null>(null);
  const [erroCalculo, setErroCalculo] = useState<string | null>(null);
  const [carregando, setCarregando]   = useState(false);
  const [printTime, setPrintTime]     = useState("");

  useEffect(() => {
    window.history.replaceState(null, '', '/');
    async function carregar() {
      try {
        const [selic, ipca, ptax, feriados] = await Promise.all([
          fetch("/data/selic.json").then((r) => r.json()),
          fetch("/data/ipca.json").then((r) => r.json()),
          fetch("/data/ptax.json").then((r) => r.json()),
          fetch("/data/feriados_nacionais.json").then((r) => r.json()),
        ]);
        setMarketData({ selic, ipca, ptax, feriados, loaded_at: new Date().toISOString() });
      } catch {
        setLoadError("Falha ao carregar dados de mercado. Tente recarregar a página.");
      }
    }
    carregar();
  }, []);

  const selicDates = marketData?.selic.data.map((e) => e.date).sort() ?? [];
  const dataMin = selicDates[0];
  const dataMax = selicDates[selicDates.length - 1];

  function handleCalcular(input: InputBase) {
    if (!marketData) return;
    setCarregando(true);
    setErroCalculo(null);

    setTimeout(() => {
      try {
        const base = { ...input, marketData };
        const rSelic = calcularFluxoIndexado({ ...base, indice: "selic" });
        const rIpca  = calcularFluxoIndexado({ ...base, indice: "ipca"  });
        const rPtax  = calcularFluxoIndexado({ ...base, indice: "ptax"  });

        if (isErroCalculadora(rSelic)) { setErroCalculo(rSelic.mensagem); setResultado(null); return; }
        if (isErroCalculadora(rIpca))  { setErroCalculo(rIpca.mensagem);  setResultado(null); return; }
        if (isErroCalculadora(rPtax))  { setErroCalculo(rPtax.mensagem);  setResultado(null); return; }

        setResultado({
          selic: rSelic,
          ipca:  rIpca,
          ptax:  rPtax,
          data_inicial:  input.data_inicial,
          data_final:    input.data_final,
          valor_inicial: input.valor_inicial,
          dias_uteis:    rSelic.dias_uteis,
          marketData,
          fluxos:        input.fluxos,
        });
        setErroCalculo(null);
        setTimeout(() => {
          document.getElementById("resultado")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } finally {
        setCarregando(false);
      }
    }, 0);
  }

  function handleLimpar() {
    setResultado(null);
    setErroCalculo(null);
  }

  function handleImprimir() {
    const agora = new Date();
    setPrintTime(
      `${agora.toLocaleDateString("pt-BR")} às ${agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
    );
    setTimeout(() => window.print(), 50);
  }

  return (
    <>
      <Head>
        <title>Calculadora de Fluxo Indexado — Marcus Aleks</title>
        <meta name="description" content="Compare a evolução de investimentos indexados a SELIC, IPCA e PTAX com múltiplos fluxos de caixa." />
      </Head>

      {/* ── Relatório de impressão Bloomberg Noir (oculto na tela) ────────── */}
      {resultado && <PrintReport resultado={resultado} printTime={printTime} />}

      <div className="screen-only min-h-screen bg-[#eef3fd] dark:bg-slate-950 text-[#04101e] dark:text-slate-100 transition-colors duration-300 font-mono">
        <div className="max-w-7xl mx-auto px-2 md:px-4 py-4 md:py-8">
          
          <div className="bg-white dark:bg-slate-900 border border-[#004ac6]/25 dark:border-slate-800 rounded-lg overflow-hidden flex flex-col shadow-xl">
            {/* ── Navbar ─────────────────────────────────────────────────────── */}
            <div className="print-hidden flex flex-row items-center justify-between gap-1.5 sm:gap-2 md:gap-3 px-2 sm:px-3.5 py-2 bg-[#f5f9ff] dark:bg-slate-950 border-b border-[#004ac6]/35 dark:border-slate-800 w-full select-none sticky top-0 z-[100]">
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/"
                  className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wider text-[#004ac6] dark:text-blue-400 border border-[#004ac6]/40 dark:border-blue-500/40 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded hover:bg-[#004ac6]/10 transition-all"
                >
                  <ArrowLeft size={14} /> <span className="hidden sm:inline">Portal</span>
                </Link>
                <span className="text-[10px] sm:text-xs md:text-sm lg:text-base font-bold text-[#004ac6] dark:text-[#5ea2ff] tracking-widest uppercase">
                  Calculadora de Fluxo
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] text-[#6a8db0] dark:text-slate-500 font-bold uppercase select-none">
                    <span className="hidden sm:inline">ATUALIZADO:</span>
                    <span className="inline sm:hidden">ATT:</span>
                  </span>
                  <span className="text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] text-[#04101e] dark:text-slate-300 font-bold uppercase select-none">
                    {marketData ? new Date(marketData.selic.last_updated).toLocaleDateString("pt-BR") : "..."}
                  </span>
                </div>
                {!marketData && !loadError && (
                  <RefreshCw size={12} className="text-[#004ac6] dark:text-blue-400 animate-spin" />
                )}
              </div>
            </div>

            {/* ── Hero ───────────────────────────────────────────────────────── */}
            <header className="print-hidden max-w-5xl mx-auto px-6 pt-12 pb-8 border-b border-[#004ac6]/15 dark:border-slate-800">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#004ac6] dark:text-blue-500 mb-3">
                Ferramenta Financeira
              </p>
              <h1 className="text-3xl md:text-4xl font-black text-[#04101e] dark:text-white uppercase tracking-tighter italic leading-none mb-4">
                Calculadora<br />
                <span className="text-[#6a8db0] dark:text-slate-500">de Fluxo Indexado</span>
              </h1>
              <p className="text-[#294c72] dark:text-slate-400 font-bold text-sm max-w-xl leading-relaxed">
                Compare a evolução do mesmo capital corrigido por SELIC, IPCA e PTAX.
                Suporta múltiplos aportes e resgates com capitalização individualizada.
              </p>
            </header>

            {/* ── Erro de carga ──────────────────────────────────────────────── */}
            {loadError && (
              <div className="print-hidden max-w-5xl mx-auto px-6 mt-8">
                <div className="border border-red-500/30 bg-red-50 dark:bg-red-950/20 rounded-xl p-6 flex items-start gap-4">
                  <AlertTriangle size={20} className="text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-red-600 dark:text-red-400 font-bold text-sm">{loadError}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-2 text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-all border border-red-500/30 px-3 py-1 rounded"
                    >
                      Recarregar →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Formulário ─────────────────────────────────────────────────── */}
            <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
              <section className="print-hidden p-6 md:p-10 border border-[#004ac6]/15 dark:border-slate-800 bg-[#f8fbff] dark:bg-slate-900/50 rounded-2xl shadow-sm">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#6a8db0] dark:text-slate-500 mb-6">
                  Parâmetros de cálculo
                </h2>
                {!marketData && !loadError ? (
                  <div className="flex items-center gap-3 text-[#294c72] dark:text-slate-400 font-bold text-sm py-8">
                    <RefreshCw size={16} className="animate-spin text-[#004ac6] dark:text-blue-500" />
                    Carregando dados de mercado...
                  </div>
                ) : (
                  <CalculadoraForm
                    onCalcular={handleCalcular}
                    onLimpar={handleLimpar}
                    dataMin={dataMin}
                    dataMax={dataMax}
                    carregando={carregando}
                    resultado={resultado}
                  />
                )}
              </section>

              {/* ── Erro de cálculo ──────────────────────────────────────────── */}
              {erroCalculo && (
                <div className="print-hidden border border-red-500/30 bg-red-50 dark:bg-red-950/20 rounded-xl p-6 flex items-start gap-4 shadow-sm">
                  <AlertTriangle size={20} className="text-red-500 mt-0.5 shrink-0" />
                  <p className="text-red-600 dark:text-red-400 font-bold text-sm">{erroCalculo}</p>
                </div>
              )}

              {/* ── Resultado ────────────────────────────────────────────────── */}
              {resultado && (
                <section id="resultado" className="p-6 md:p-10 border border-[#004ac6]/25 dark:border-slate-800 bg-white dark:bg-slate-900/80 rounded-2xl shadow-xl space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#004ac6] to-[#5ea2ff] opacity-80"></div>
                  
                  {/* Cabeçalho da seção */}
                  <div className="flex justify-between items-center flex-wrap gap-3">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#6a8db0] dark:text-slate-500">
                      Resultado
                    </h2>
                    <span className="text-[10px] font-bold text-[#294c72] dark:text-slate-400 tracking-wider bg-[#f5f9ff] dark:bg-slate-950 px-2.5 py-1 rounded border border-[#004ac6]/15 dark:border-slate-800">
                      {resultado.data_inicial.toLocaleDateString("pt-BR")} →{" "}
                      {resultado.data_final.toLocaleDateString("pt-BR")} · {resultado.dias_uteis} d.u.
                    </span>
                  </div>

                  {/* Disclaimer na tela */}
                  <div className="print-hidden flex items-start gap-3 border border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 rounded-xl px-4 py-3 shadow-sm">
                    <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-amber-800 dark:text-amber-200/80 font-bold leading-relaxed">
                      {DISCLAIMER}
                    </p>
                  </div>

                  <ResultadoCards resultado={resultado} />

                  <div className="print-chart pt-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#294c72] dark:text-slate-400 mb-4 px-1 border-l-2 border-[#004ac6] dark:border-blue-500 pl-2">
                      Evolução do saldo
                    </p>
                    <div className="bg-white dark:bg-slate-950 border border-[#004ac6]/10 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                      <EvolutionChart resultado={resultado} />
                    </div>
                  </div>

                  {/* Botão imprimir */}
                  <div className="print-hidden border-t border-[#004ac6]/15 dark:border-slate-800 pt-6 mt-4">
                    <button
                      onClick={handleImprimir}
                      className="w-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-white bg-[#004ac6] hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg px-6 py-3.5 transition-all shadow-md active:scale-[0.99]"
                    >
                      <Printer size={16} /> Imprimir resultado detalhado
                    </button>
                  </div>
                </section>
              )}
            </main>

            {/* ── Footer ─────────────────────────────────────────────────────── */}
            <footer className="print-hidden px-4 py-4 border-t border-[#004ac6]/25 dark:border-slate-800 bg-[#f5f9ff] dark:bg-slate-950">
              <div className="flex flex-wrap justify-center gap-4 text-[9px] font-bold text-[#6a8db0] dark:text-slate-500 uppercase tracking-widest">
                {marketData && (
                  <>
                    <span>SELIC: {marketData.selic.source}</span>
                    <span>IPCA: {marketData.ipca.source}</span>
                    <span>PTAX: {marketData.ptax.source}</span>
                  </>
                )}
              </div>
            </footer>
          </div>

        {/* ── Assinatura MAD — obrigatória (Lei MAD Seção 2.2) ────────────── */}
        <div className="mt-6">
          <MadSignature />
        </div>

        {/* ── Rodapé exclusivo de impressão com assinatura MAD ────────────── */}
        <div className="print-only hidden px-6 pt-4 mt-4 border-t border-gray-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/favicon.png" width={16} height={16} alt="MAD" style={{ borderRadius: 3 }} />
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">MAD Developers · marcus.aleks.nom.br</span>
            </div>
            {marketData && (
              <span className="text-[10px] text-gray-400 font-mono">
                Fontes: BCB SEAD (SELIC · IPCA · PTAX)
              </span>
            )}
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
