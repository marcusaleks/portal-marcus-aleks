import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Lock, Search, Activity, Newspaper, ArrowUpRight, 
  Shield, Fingerprint, Zap, Terminal, Eye, UserSearch 
} from 'lucide-react';

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
  const [osintQuery, setOsintQuery] = useState('');
  const [intelNews, setIntelNews] = useState([]);

  useEffect(() => {
    const runFullUplink = async () => {
      try {
        // 1. Câmbio (AwesomeAPI) - Forçando precisão de 4 casas
        const resCur = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL');
        const dataCur = await resCur.json();
        const usdValue = parseFloat(dataCur.USDBRL.bid).toFixed(4).replace('.', ',');

        // 2. Selic (BCB)
        const resSelic = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.1178/dados/ultimos/1?formato=json');
        const dataSelic = await resSelic.json();

        // 3. IBOVESPA e Ticker (Brapi/Market Data)
        const resB3 = await fetch('https://brapi.dev/api/quote/^BVSP,PETR4,VALE3,ITUB4,BBDC4,ABEV3,BBAS3,SANB11,MGLU3,B3SA3');
        const dataB3 = await resB3.json();
        const ibov = dataB3.results.find((r: any) => r.symbol === '^BVSP');

        setMarket({
          usd: usdValue,
          selic: dataSelic[0].valor.replace('.', ','),
          ibov: ibov.regularMarketPrice.toLocaleString('pt-BR'),
          ibovChange: (ibov.regularMarketChangePercent > 0 ? '+' : '') + ibov.regularMarketChangePercent.toFixed(2) + '%',
          stocks: dataB3.results.filter((r: any) => r.symbol !== '^BVSP')
        });

        // 4. Intel News Feed
        const resNews = await fetch(`/data/news.json?t=${new Date().getTime()}`);
        if (resNews.ok) {
          const newsData = await resNews.json();
          setIntelNews(newsData.intel.slice(0, 4));
        }
      } catch (e) { console.error("Falha no uplink operacional."); }
    };

    runFullUplink();
    const interval = setInterval(runFullUplink, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 font-sans selection:bg-blue-500/30">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
        .ticker-wrap { display: flex; animation: marquee 35s linear infinite; }
        .ticker-wrap:hover { animation-play-state: paused; }
      `}} />

      {/* BANNER ANIMADO: 10 AÇÕES B3 */}
      <div className="w-full bg-slate-950 border-b border-slate-800 py-3 overflow-hidden z-[60] relative">
         <div className="ticker-wrap gap-12 items-center flex whitespace-nowrap">
            {[...market.stocks, ...market.stocks].map((stock: any, i) => (
              <div key={i} className="flex items-center gap-3 px-4 border-r border-slate-800/50">
                <span className="text-[10px] font-black text-white">{stock.symbol}</span>
                <span className="text-[10px] font-mono text-slate-400">R$ {stock.regularMarketPrice.toFixed(2)}</span>
                <span className={`text-[9px] font-bold ${stock.regularMarketChangePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {stock.regularMarketChangePercent >= 0 ? '+ ' : ''}{stock.regularMarketChangePercent.toFixed(2)}%
                </span>
              </div>
            ))}
         </div>
      </div>

      <nav className="border-b border-slate-800/50 bg-[#05070a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 px-2 py-0.5 rounded font-black text-white text-[11px] tracking-tighter">MAD</div>
            <span className="text-sm font-black tracking-[0.2em] text-blue-500 uppercase font-bold">SIFAZ <span className="text-xs text-slate-600 font-mono italic">v.0.0.1</span></span>
          </div>
          <Link href="/login" className="bg-slate-900 border border-slate-800 px-4 py-2 rounded text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-white transition-all shadow-md">
            <Lock size={12} className="inline mr-2"/> ACESSO RESTRITO
          </Link>
        </div>
      </nav>

      <header className="max-w-7xl mx-auto px-6 py-20 border-b border-slate-900/50">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8">
            <h1 className="text-6xl md:text-8xl font-black leading-none text-white tracking-tighter uppercase italic">Intel <br/><span className="text-blue-500 not-italic uppercase">Operational</span></h1>
            
            {/* FERRAMENTA DE BUSCA OSINT/SOCMINT */}
            <form onSubmit={(e) => { e.preventDefault(); if(osintQuery) window.open(`https://www.google.com/search?q=${encodeURIComponent(osintQuery)}`, '_blank') }} className="flex gap-3 max-w-xl">
               <div className="relative flex-1">
                  <Search size={18} className="absolute left-4 top-3.5 text-slate-600" />
                  <input 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-12 pr-4 py-4 text-white font-mono text-sm focus:border-blue-600 outline-none"
                    placeholder="Alvo, CNPJ ou Username (SOCMINT)..."
                    value={osintQuery} onChange={(e) => setOsintQuery(e.target.value)}
                  />
               </div>
               <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-lg font-black text-xs uppercase tracking-widest transition-all">Scan</button>
            </form>
          </div>

          {/* QUADROS ENRIQUECIDOS */}
          <div className="lg:col-span-5 bg-slate-950/40 border border-slate-800 p-8 rounded-2xl backdrop-blur-sm shadow-2xl space-y-8">
            <div className="flex justify-between items-center border-b border-slate-900 pb-6">
              <div>
                 <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1 font-bold">IBOVESPA</span>
                 <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white tracking-tighter">{market.ibov}</span>
                    <span className={`text-xs font-bold ${market.ibovChange.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{market.ibovChange}</span>
                 </div>
              </div>
              <Sparkline trend={market.ibovChange.startsWith('+') ? "up" : "down"} />
            </div>

            <div className="flex justify-between items-center border-b border-slate-900 pb-6">
              <div>
                 <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1 font-bold">USD / BRL (PRECISÃO INVESTIGATIVA)</span>
                 <span className="text-3xl font-black text-white tracking-tighter">R$ {market.usd}</span>
              </div>
              <Sparkline trend={market.usd < "5,2500" ? "down" : "up"} />
            </div>

            <div className="flex justify-between items-center">
              <div>
                 <span className="text-[9px] font-mono text-blue-500 uppercase block mb-1 font-bold tracking-widest">SELIC EFETIVA</span>
                 <span className="text-3xl font-black text-blue-500 tracking-tighter">{market.selic}%</span>
              </div>
              <div className="text-right">
                 <span className="text-[8px] font-mono text-slate-600 uppercase block font-bold">ÚLTIMA ATUALIZAÇÃO</span>
                 <span className="text-[10px] font-bold text-slate-400">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* FEED DE NOTÍCIAS DE INTELIGÊNCIA */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-900/50">
        <div className="flex items-center gap-4 mb-10">
          <Newspaper className="text-blue-500" size={24} />
          <h2 className="text-white text-2xl font-black uppercase tracking-tighter font-bold">Intelligence Ops Feed</h2>
          <div className="h-[1px] flex-1 bg-slate-900"></div>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {intelNews.map((item: any, i: number) => (
            <div key={i} className="p-5 border border-slate-800 bg-slate-950/20 rounded-xl group hover:border-red-600/30 transition-all font-bold">
              <span className="text-[9px] text-red-600 font-bold uppercase block mb-3 font-mono">{item.date}</span>
              <h3 className="text-sm text-slate-200 font-bold leading-tight group-hover:text-red-400 uppercase tracking-tight">{item.title}</h3>
            </div>
          ))}
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-900 flex justify-between items-center text-[9px] font-mono text-slate-600 font-bold">
        <p className="uppercase tracking-[0.3em]">© 2026 SIFAZ - UNIT OPS MARCUS ALEKS</p>
        <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10 shadow-sm shadow-emerald-900/20">
          <Activity size={12} className="animate-pulse" /> SYSTEM: OPTIMAL
        </div>
      </footer>
    </div>
  );
}
