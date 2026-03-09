import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, Activity, TrendingUp, ArrowUpRight, Calculator, Download } from 'lucide-react';

const Sparkline = ({ trend = "up" }) => (
  <svg className="w-16 h-8" viewBox="0 0 48 24" fill="none">
    <path d={trend === "up" ? "M0 20L10 16L20 18L30 8L40 10L48 2" : "M0 2L10 8L20 6L30 18L40 16L48 22"} 
          className={trend === "up" ? "stroke-emerald-500" : "stroke-red-500"} 
          strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Home() {
  const [market, setMarket] = useState({ usd: '...', selic: '...', ibov: '...', ibovChange: '...', stocks: [] });

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const resCur = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL');
        const dataCur = await resCur.json();
        const resSelic = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.1178/dados/ultimos/1?formato=json');
        const dataSelic = await resSelic.json();

        const token = process.env.NEXT_PUBLIC_BRAPI_TOKEN;
        const symbols = ['^BVSP', 'PETR4', 'VALE3', 'ITUB4', 'BBAS3', 'BBDC4', 'ABEV3', 'MGLU3'];
        const results: any[] = [];
        
        // Loop individual para respeitar o plano gratuito de 1 ativo por vez
        for (const s of symbols) {
          const r = await fetch(`https://brapi.dev/api/quote/${s}?token=${token}`);
          const d = await r.json();
          if (d.results) results.push(d.results[0]);
        }

        const ibov = results.find(r => r.symbol === '^BVSP');
        setMarket({
          usd: parseFloat(dataCur.USDBRL.bid).toFixed(4).replace('.', ','),
          selic: dataSelic[0].valor.replace('.', ','),
          ibov: ibov.regularMarketPrice.toLocaleString('pt-BR'),
          ibovChange: (ibov.regularMarketChangePercent > 0 ? '+' : '') + ibov.regularMarketChangePercent.toFixed(2) + '%',
          stocks: results.filter(r => r.symbol !== '^BVSP')
        });
      } catch (e) { console.error("Erro Uplink."); }
    };
    fetchMarket();
    const interval = setInterval(fetchMarket, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 font-sans selection:bg-blue-500/30 font-bold">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
        .ticker-wrap { display: flex; animation: marquee 60s linear infinite; width: max-content; }
      `}} />

      {/* Banner Animado - Conteúdo replicado 8x para preencher o banner sem espaços */}
      <div className="w-full bg-slate-950 border-b border-slate-800 py-3 overflow-hidden z-[60] relative">
         <div className="ticker-wrap gap-12 items-center flex whitespace-nowrap">
            {[...market.stocks, ...market.stocks, ...market.stocks, ...market.stocks, ...market.stocks, ...market.stocks, ...market.stocks, ...market.stocks].map((stock: any, i) => (
              <div key={i} className="flex items-center gap-3 px-4 border-r border-slate-800/50">
                <span className="text-[10px] font-black text-white">{stock.symbol}</span>
                <span className="text-[10px] font-mono text-slate-400">R$ {stock.regularMarketPrice.toFixed(2)}</span>
                <span className={`text-[9px] font-bold ${stock.regularMarketChangePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {stock.regularMarketChangePercent >= 0 ? '▲' : '▼'} {Math.abs(stock.regularMarketChangePercent).toFixed(2)}%
                </span>
              </div>
            ))}
         </div>
      </div>

      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 px-2 py-0.5 rounded font-black text-white text-[11px]">MAD</div>
          <span className="text-sm font-black tracking-widest text-blue-500 uppercase">MARCUS ALEKS</span>
        </div>
        <Link href="/login" className="bg-slate-900 border border-slate-800 px-5 py-2.5 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all shadow-xl">
          <Lock size={12} className="inline mr-2"/> ACESSO RESTRITO
        </Link>
      </nav>

      <header className="max-w-7xl mx-auto px-6 py-20 border-b border-slate-900/50">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7">
            <h1 className="text-8xl font-black leading-none text-white tracking-tighter uppercase italic">Mercado <br/><span className="text-blue-500 not-italic uppercase">Capitais</span></h1>
          </div>
          <div className="lg:col-span-5 bg-slate-950/40 border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl space-y-10">
            <div className="flex justify-between items-center border-b border-slate-900 pb-8">
              <div>
                 <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">IBOVESPA</span>
                 <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white tracking-tighter">{market.ibov}</span>
                    <span className={`text-sm font-bold ${market.ibovChange.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{market.ibovChange}</span>
                 </div>
              </div>
              <Sparkline trend={market.ibovChange.startsWith('+') ? "up" : "down"} />
            </div>
            <div className="flex justify-between items-center border-b border-slate-900 pb-8">
              <div><span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">USD / BRL</span><span className="text-4xl font-black text-white tracking-tighter font-bold">R$ {market.usd}</span></div>
              <Sparkline trend="up" />
            </div>
            <div className="flex justify-between items-center">
              <div><span className="text-[10px] font-mono text-blue-500 uppercase block mb-1 tracking-widest">SELIC EFETIVA</span><span className="text-4xl font-black text-blue-500 tracking-tighter">{market.selic}%</span></div>
              <div className="text-right"><span className="text-[9px] font-mono text-slate-600 uppercase block font-bold mb-1">REUNIÃO COPOM</span><span className="text-xs font-bold text-slate-400">17/03/2026</span></div>
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-3 gap-10">
        {/* Restaurando todas as caixas conforme solicitado */}
        <a href="https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm" target="_blank" className="p-10 border border-slate-800 bg-slate-950/20 rounded-[2rem] group hover:border-emerald-500 transition-all shadow-xl">
          <TrendingUp className="text-emerald-500 mb-8" size={40} />
          <h3 className="text-white text-2xl font-black mb-3 uppercase tracking-tighter italic">Tesouro Direto</h3>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed font-bold">Consulta de preços e taxas de títulos públicos em tempo real.</p>
          <div className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-2">Ver Taxas Atuais <ArrowUpRight size={14} /></div>
        </a>
        <a href="https://www3.bcb.gov.br/CALCIDADAO/publico/exibirFormCorrecaoValores.do?method=exibirFormCorrecaoValores&aba=4" target="_blank" className="p-10 border border-slate-800 bg-slate-950/20 rounded-[2rem] group hover:border-blue-500 transition-all shadow-xl">
          <Calculator className="text-blue-500 mb-8" size={40} />
          <h3 className="text-white text-2xl font-black mb-3 uppercase tracking-tighter italic">Calculadora Bacen</h3>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed font-bold">Simulador oficial de correção de valores por índices e Selic.</p>
          <div className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-2">Simular Agora <ArrowUpRight size={14} /></div>
        </a>
        <div className="p-10 border border-slate-800 bg-blue-600/5 rounded-[2rem] shadow-2xl">
          <Download className="text-blue-500 mb-8" size={40} />
          <h3 className="text-white text-2xl font-black mb-3 uppercase tracking-tighter italic">Portfolio Manager</h3>
          <p className="text-sm text-slate-400 mb-8 leading-relaxed font-bold">Gestão quantitativa de ativos em Python para uso local.</p>
          <a href="https://github.com/marcusaleks/Portfolio_Manager/releases/download/v0.0.1/PortfolioManager_v0.0.1.zip" className="w-full bg-blue-600 text-white py-4 rounded-xl text-[11px] font-black flex items-center justify-center gap-3 hover:bg-blue-700 transition-all uppercase tracking-widest shadow-lg">
            <Activity size={16} /> Download v.0.0.1
          </a>
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-900 flex justify-between items-center text-[10px] font-mono text-slate-600 font-bold uppercase tracking-[0.3em]">
        <p>© 2026 MAD MARCUS ALEKS - QUANTITATIVE SYSTEMS</p>
        <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10">
          <Activity size={12} className="animate-pulse" /> ENGINE: OPTIMAL
        </div>
      </footer>
    </div>
  );
}
