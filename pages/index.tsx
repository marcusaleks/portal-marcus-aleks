import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, Activity, TrendingUp, ArrowUpRight, Calculator, Download, ExternalLink } from 'lucide-react';

const Sparkline = ({ trend = "up" }) => (
  <svg className="w-16 h-8" viewBox="0 0 48 24" fill="none">
    <path d={trend === "up" ? "M0 20L10 16L20 18L30 8L40 10L48 2" : "M0 2L10 8L20 6L30 18L40 16L48 22"} 
          className={trend === "up" ? "stroke-emerald-500" : "stroke-red-500"} 
          strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Home() {
  const [market, setMarket] = useState({ 
    usd: '...', selic: '...', ibov: '...', ibovChange: '...', stocks: [] 
  });

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // 1. Câmbio (AwesomeAPI) - 4 casas decimais
        const resCur = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL');
        const dataCur = await resCur.json();
        const usdVal = parseFloat(dataCur.USDBRL.bid).toFixed(4).replace('.', ',');

        // 2. Selic (BCB)
        const resSelic = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.1178/dados/ultimos/1?formato=json');
        const dataSelic = await resSelic.json();

        // 3. IBOVESPA e Ativos B3 (Brapi) - ADICIONE SEU TOKEN NO FINAL DA URL ABAIXO
        const resB3 = await fetch('https://brapi.dev/api/quote/^BVSP,PETR4,VALE3,ITUB4,BBDC4,ABEV3,BBAS3,SANB11,MGLU3,B3SA3?token=SEU_TOKEN_AQUI');
        const dataB3 = await resB3.json();
        const ibovData = dataB3.results.find((r: any) => r.symbol === '^BVSP');

        setMarket({
          usd: usdVal,
          selic: dataSelic[0].valor.replace('.', ','),
          ibov: ibovData.regularMarketPrice.toLocaleString('pt-BR'),
          ibovChange: (ibovData.regularMarketChangePercent > 0 ? '+' : '') + ibovData.regularMarketChangePercent.toFixed(2) + '%',
          stocks: dataB3.results.filter((r: any) => r.symbol !== '^BVSP')
        });
      } catch (err) {
        console.error("Uplink falhou. Verifique a conectividade e os tokens das APIs.");
      }
    };
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 font-sans selection:bg-blue-500/30">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
        .ticker-wrap { display: flex; animation: marquee 35s linear infinite; }
        .ticker-wrap:hover { animation-play-state: paused; }
      `}} />

      {/* BANNER ANIMADO B3 */}
      <div className="w-full bg-slate-950 border-b border-slate-800 py-3 overflow-hidden z-[60] relative">
         <div className="ticker-wrap gap-12 items-center flex whitespace-nowrap">
            {market.stocks.length > 0 ? [...market.stocks, ...market.stocks].map((stock: any, i) => (
              <div key={i} className="flex items-center gap-3 px-4 border-r border-slate-800/50">
                <span className="text-[10px] font-black text-white">{stock.symbol}</span>
                <span className="text-[10px] font-mono text-slate-400">R$ {stock.regularMarketPrice.toFixed(2)}</span>
                <span className={`text-[9px] font-bold ${stock.regularMarketChangePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {stock.regularMarketChangePercent >= 0 ? '▲' : '▼'} {Math.abs(stock.regularMarketChangePercent).toFixed(2)}%
                </span>
              </div>
            )) : <div className="text-[9px] font-mono uppercase animate-pulse px-6 text-slate-600 italic">Aguardando autorização do pregão B3...</div>}
         </div>
      </div>

      <nav className="border-b border-slate-800/50 bg-[#05070a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center font-bold">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 px-2 py-0.5 rounded font-black text-white text-[11px]">MAD</div>
            <span className="text-sm font-black tracking-widest text-blue-500 uppercase">MARCUS ALEKS</span>
          </div>
          <Link href="/login" className="bg-slate-900 border border-slate-700 px-4 py-2 rounded text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-white transition-all shadow-md">
            <Lock size={12} className="inline mr-2"/> ACESSO RESTRITO
          </Link>
        </div>
      </nav>

      <header className="max-w-7xl mx-auto px-6 py-20 border-b border-slate-900/30 font-bold">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <h1 className="text-7xl md:text-8xl font-black leading-none text-white tracking-tighter uppercase italic">Mercado <br/><span className="text-blue-500 not-italic uppercase">Capitais</span></h1>
            <p className="mt-8 text-slate-500 text-xl max-w-lg leading-relaxed">Arquitetura quantitativa e ferramentas de cálculo aplicadas a portfólios institucionais.</p>
          </div>

          <div className="lg:col-span-5 bg-slate-950/40 border border-slate-800 p-8 rounded-2xl backdrop-blur-sm shadow-2xl space-y-8">
            <div className="flex justify-between items-center border-b border-slate-900 pb-6">
              <div>
                 <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">IBOVESPA</span>
                 <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white tracking-tighter">{market.ibov}</span>
                    <span className={`text-xs font-bold ${market.ibovChange.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{market.ibovChange}</span>
                 </div>
              </div>
              <Sparkline trend={market.ibovChange.startsWith('+') ? "up" : "down"} />
            </div>
            <div className="flex justify-between items-center border-b border-slate-900 pb-6">
              <div>
                 <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">USD / BRL</span>
                 <span className="text-3xl font-black text-white tracking-tighter font-bold">R$ {market.usd}</span>
              </div>
              <Sparkline trend="up" />
            </div>
            <div className="flex justify-between items-center">
              <div>
                 <span className="text-[9px] font-mono text-blue-500 uppercase block mb-1 tracking-[0.2em]">SELIC EFETIVA</span>
                 <span className="text-3xl font-black text-blue-500 tracking-tighter">{market.selic}%</span>
              </div>
              <div className="text-right">
                 <span className="text-[8px] font-mono text-slate-600 uppercase block mb-1 font-bold">REUNIÃO COPOM</span>
                 <span className="text-[10px] font-bold text-slate-400">17/03/2026</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8 font-bold">
        {/* Caixa 1: Tesouro Direto */}
        <a href="https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm" target="_blank" className="p-8 border border-slate-800 bg-slate-900/10 rounded-2xl group hover:border-emerald-500/40 transition-all">
          <TrendingUp className="text-emerald-500 mb-6" size={32} />
          <h3 className="text-white text-xl font-bold mb-2 uppercase tracking-tighter">Tesouro Direto</h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">Consulta de preços e taxas de títulos públicos federais em tempo real.</p>
          <span className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-2">Ver Taxas Atuais <ExternalLink size={14} /></span>
        </a>

        {/* Caixa 2: Calculadora Bacen */}
        <a href="https://www3.bcb.gov.br/CALCIDADAO/publico/exibirFormCorrecaoValores.do?method=exibirFormCorrecaoValores&aba=4" target="_blank" className="p-8 border border-slate-800 bg-slate-900/10 rounded-2xl group hover:border-blue-500/40 transition-all shadow-lg">
          <Calculator className="text-blue-500 mb-6" size={32} />
          <h3 className="text-white text-xl font-bold mb-2 uppercase tracking-tighter">Calculadora Bacen</h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">Correção de valores por índices de preços e taxa Selic oficial.</p>
          <span className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-2">Acessar Simulador <ExternalLink size={14} /></span>
        </a>

        {/* Caixa 3: Portfolio Manager (Download) */}
        <div className="p-8 border border-slate-800 bg-blue-600/5 border-blue-500/20 rounded-2xl shadow-xl shadow-blue-900/10">
          <Download className="text-blue-500 mb-6" size={32} />
          {/* Título Restaurado conforme pedido */}
          <h3 className="text-white text-xl font-bold mb-2 uppercase tracking-tighter">Portfolio Manager</h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">Gestão de portfólios e análise quantitativa otimizada para uso local.</p>
          <a href="https://github.com/marcusaleks/Portfolio_Manager/releases/download/v0.0.1/PortfolioManager_v0.0.1.zip" 
             className="w-full bg-blue-600 text-white py-3 rounded text-[10px] font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition-all uppercase tracking-widest">
            <Activity size={14} /> Download v.0.0.1
          </a>
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-900 flex justify-between items-center text-[9px] font-mono text-slate-600 font-bold uppercase tracking-widest">
        <p>© 2026 MAD MARCUS ALEKS - QUANTITATIVE SYSTEMS</p>
        <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10">
          <Activity size={12} className="animate-pulse" /> ENGINE STATUS: OPTIMAL
        </div>
      </footer>
    </div>
  );
}
