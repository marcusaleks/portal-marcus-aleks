import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { ArrowLeft, RefreshCw, AlertTriangle, Download } from "lucide-react";
import MadSignature from "../components/MadSignature";
import CalculadoraForm from "../components/calculadora/CalculadoraForm";
import ResultadoCards from "../components/calculadora/ResultadoCards";
import EvolutionChart from "../components/calculadora/EvolutionChart";
import { calcularFluxoIndexado } from "../lib/calculadora/index";
import { isErroCalculadora } from "../lib/types/market-data";
import type {
  InputCalculadora,
  OutputCalculadora,
  MarketData,
} from "../lib/types/market-data";

export default function CalculadoraPage() {
  const [marketData, setMarketData]   = useState<MarketData | null>(null);
  const [loadError, setLoadError]     = useState<string | null>(null);
  const [resultado, setResultado]     = useState<OutputCalculadora | null>(null);
  const [erroCalculo, setErroCalculo] = useState<string | null>(null);
  const [carregando, setCarregando]   = useState(false);

  // ── Carregar dados de mercado ──────────────────────────────────────────────
  useEffect(() => {
    async function carregar() {
      try {
        const [selic, ipca, ptax, feriados] = await Promise.all([
          fetch("/data/selic.json").then((r) => r.json()),
          fetch("/data/ipca.json").then((r) => r.json()),
          fetch("/data/ptax.json").then((r) => r.json()),
          fetch("/data/feriados_nacionais.json").then((r) => r.json()),
        ]);
        setMarketData({ selic, ipca, ptax, feriados, loaded_at: new Date().toISOString() });
      } catch (e: any) {
        setLoadError("Falha ao carregar dados de mercado. Tente recarregar a página.");
      }
    }
    carregar();
  }, []);

  // Derivar datas mínima e máxima disponíveis (para limitar pickers)
  // dados podem estar em ordem crescente ou decrescente — usar sort para garantir
  const selicDates = marketData?.selic.data.map((e) => e.date).sort() ?? [];
  const dataMin = selicDates[0];
  const dataMax = selicDates[selicDates.length - 1];

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleCalcular(input: InputCalculadora) {
    if (!marketData) return;
    setCarregando(true);
    setErroCalculo(null);

    // setTimeout 0 para não bloquear o render antes do "Calculando..."
    setTimeout(() => {
      try {
        const r = calcularFluxoIndexado({ ...input, marketData });
        if (isErroCalculadora(r)) {
          setErroCalculo(r.mensagem);
          setResultado(null);
        } else {
          setResultado(r);
          setErroCalculo(null);
          // Rolar para o resultado
          setTimeout(() => {
            document.getElementById("resultado")?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      } finally {
        setCarregando(false);
      }
    }, 0);
  }

  function handleLimpar() {
    setResultado(null);
    setErroCalculo(null);
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>Calculadora de Fluxo Indexado — Marcus Aleks</title>
        <meta name="description" content="Calcule a evolução de investimentos indexados a SELIC, IPCA ou PTAX com múltiplos fluxos de caixa." />
      </Head>

      <div className="min-h-screen bg-[#05070a] text-slate-300 font-sans">

        {/* ── Navbar ─────────────────────────────────────────────────────── */}
        <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-[100]">
          <div className="max-w-5xl mx-auto px-6 py-5 flex justify-between items-center">
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-500 hover:text-white transition-all text-sm font-black uppercase tracking-widest"
            >
              <ArrowLeft size={16} /> Portal
            </Link>
            <span className="text-xs font-black uppercase tracking-widest text-slate-600">
              Calculadora de Fluxo Indexado
            </span>
            <div className="flex items-center gap-2">
              {marketData && (
                <span className="text-xs font-mono text-slate-700">
                  dados: {new Date(marketData.selic.last_updated).toLocaleDateString("pt-BR")}
                </span>
              )}
              {!marketData && !loadError && (
                <RefreshCw size={14} className="text-slate-700 animate-spin" />
              )}
            </div>
          </div>
        </div>

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <header className="max-w-5xl mx-auto px-6 pt-16 pb-10 border-b border-slate-900/50">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-500 mb-4">
            Ferramenta Financeira
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic leading-none mb-4">
            Calculadora<br />
            <span className="text-slate-600">de Fluxo Indexado</span>
          </h1>
          <p className="text-slate-500 font-bold max-w-xl leading-relaxed">
            Simule a evolução de investimentos indexados a SELIC, IPCA ou PTAX.
            Suporta múltiplos aportes e resgates com capitalização individualizada.
          </p>
        </header>

        {/* ── Erro de carga ──────────────────────────────────────────────── */}
        {loadError && (
          <div className="max-w-5xl mx-auto px-6 mt-8">
            <div className="border border-red-500/30 bg-red-950/20 rounded-2xl p-6 flex items-start gap-4">
              <AlertTriangle size={20} className="text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-red-400 font-bold text-sm">{loadError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-all"
                >
                  Recarregar →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Formulário ─────────────────────────────────────────────────── */}
        <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
          <section className="p-8 md:p-12 border border-slate-800 bg-slate-950/20 rounded-[3rem] shadow-xl">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-8">
              Parâmetros de cálculo
            </h2>
            {!marketData && !loadError ? (
              <div className="flex items-center gap-3 text-slate-600 font-bold text-sm py-8">
                <RefreshCw size={16} className="animate-spin" />
                Carregando dados de mercado...
              </div>
            ) : (
              <CalculadoraForm
                onCalcular={handleCalcular}
                onLimpar={handleLimpar}
                dataMin={dataMin}
                dataMax={dataMax}
                carregando={carregando}
              />
            )}
          </section>

          {/* ── Erro de cálculo ──────────────────────────────────────────── */}
          {erroCalculo && (
            <div className="border border-red-500/30 bg-red-950/20 rounded-2xl p-6 flex items-start gap-4">
              <AlertTriangle size={20} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-red-400 font-bold text-sm">{erroCalculo}</p>
            </div>
          )}

          {/* ── Resultado ────────────────────────────────────────────────── */}
          {resultado && (
            <section id="resultado" className="p-8 md:p-12 border border-slate-800 bg-slate-950/20 rounded-[3rem] shadow-xl space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">
                  Resultado
                </h2>
                <a
                  href={`/api/calculadora/export?format=json&data=${encodeURIComponent(JSON.stringify({
                    valor_inicial: resultado.valor_inicial,
                    valor_final: resultado.valor_final,
                    taxa_retorno: resultado.taxa_retorno,
                    indice: resultado.indice,
                    data_inicial: resultado.data_inicial,
                    data_final: resultado.data_final,
                    dias_uteis: resultado.dias_uteis,
                  }))}`}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all border border-slate-800 hover:border-slate-600 rounded-xl px-4 py-2"
                >
                  <Download size={12} /> Exportar
                </a>
              </div>

              <ResultadoCards resultado={resultado} />

              {resultado.detalhamento.length >= 2 && (
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-600 mb-4">
                    Evolução do saldo
                  </p>
                  <EvolutionChart
                    detalhamento={resultado.detalhamento}
                    indice={resultado.indice}
                    valorFinal={resultado.valor_final}
                  />
                </div>
              )}
            </section>
          )}

          {/* ── Nota sobre dados ─────────────────────────────────────────── */}
          <footer className="border-t border-slate-900 pt-8 pb-4">
            <div className="flex flex-wrap gap-6 text-xs font-bold text-slate-700">
              {marketData && (
                <>
                  <span>SELIC: {marketData.selic.source}</span>
                  <span>IPCA: {marketData.ipca.source}</span>
                  <span>PTAX: {marketData.ptax.source}</span>
                  <span>Feriados: {marketData.feriados.source}</span>
                </>
              )}
              <span className="ml-auto">Calculadora de Fluxo Indexado v1.0</span>
            </div>
          </footer>
        </main>

        <MadSignature />
      </div>
    </>
  );
}
