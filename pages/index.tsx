import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calculator, PieChart, Lock, ExternalLink, BarChart3, 
  Download, ArrowUpRight, Activity, Newspaper, Cpu, Globe 
} from 'lucide-react';

const Sparkline = ({ trend = "up" }) => {
  const color = trend === "up" ? "stroke-emerald-500" : "stroke-red-500";
  return (
    <svg className="w-16 h-8" viewBox="0 0 48 24" fill="none">
      <path d={trend === "up" ? "M0 20L10 16L20 18L30 8L40 10L48 2" : "M0 2L10 8L20 6L30 18L40 16L48 22"} 
            className={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default function Home() {
  const [market, setMarket] = useState({ usd: '5,24', eur: '6,06', selic: '14,90', ibov: '128.450', ibovChange: '+1,12%' });
  const [tickerData, setTickerData] = useState([]);
  const [syncTime, setSyncTime] = useState('...');
  const [newsFeed, setNewsFeed] = useState([]);

  useEffect(() => {
    const runUplink = async () => {
      try {
        // Nomes de variáveis únicos para evitar erros de redeclaração (TypeScript Safe)
        const resAwesome = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL,ETH-BRL');
        const dataAwesome = await resAwesome.json();
        
        const resBcb = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.1178/dados/ultimos/1?formato=json');
        const dataBcb = await resBcb.json();

        const stocks = 'PETR4,VALE3,ITUB4,BBDC4,ABEV3,BBAS3,ITSA4,SANB11,RENT3,LREN3';
        const resBrapi = await fetch(`https://brapi.dev/api/quote/${stocks}`);
        const dataBrapi = resBrapi.ok ? await resBrapi.json() : { results: [] };

        const b3Assets = dataBrapi.results.map((s: any) => ({
          t: s.symbol, v: s.regularMarketPrice.toFixed(2).replace('.', ','), 
          c: (s.regularMarketChangePercent > 0 ? '+' : '') + s.regularMarketChangePercent.toFixed(2) + '%'
        }));

        setTickerData([...b3Assets, 
          { t: 'USD/BRL', v: dataAwesome.USDBRL.bid.replace('.', ','), c: (parseFloat(dataAwesome.USDBRL.pctChange) > 0 ? '+' : '') + dataAwesome.USDBRL.pctChange + '%' },
          { t: 'EUR/BRL', v: dataAwesome.EURBRL.bid.replace('.', ','), c: (parseFloat(dataAwesome.EURBRL.pctChange) > 0 ? '+' : '') + dataAwesome.EURBRL.pctChange + '%' },
          { t: 'BTC/BRL', v: parseFloat(dataAwesome.BTCBRL.bid).toLocaleString('pt-BR'), c: (parseFloat(dataAwesome.BTCBRL.pctChange) > 0 ? '+' : '') + dataAwesome.BTCBRL.pctChange + '%' },
          { t: 'ETH/BRL', v: parseFloat(dataAwesome.ETHBRL.bid).toLocaleString('pt-BR'), c: (parseFloat(dataAwesome.ETHBRL.pctChange) > 0 ? '+' : '') + dataAwesome.ETHBRL.pctChange + '%' }
        ]);

        setMarket(prev => ({ 
          ...prev, 
          usd: dataAwesome.USDBRL.bid.replace('.', ','), 
          eur: dataAwesome.EURBRL.bid.replace('.', ','), 
          selic: dataBcb[0].valor.replace('.', ',') 
        }));
        setSyncTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));

        const resNews = await fetch(`/data/news.json?t=${new Date().getTime()}`);
        if (resNews.ok) { 
          const dataNews = await resNews.json(); 
          setNewsFeed(dataNews.finance.slice(0, 4)); 
        }
      } catch (e) { console.log("Erro na sincronização."); }
    };
    runUplink();
    const timer = setInterval(runUplink, 300000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 font-sans selection:bg-blue-500/30 relative overflow-hidden">
      
      {/* CSS INLINE PARA GARANTIR MOVIMENTO DO BANNER */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
        .ticker-flow { display: flex; animation: marquee 40s linear infinite; }
        .ticker-flow:hover { animation-play-state: paused; }
      `}} />

      {/* 1. Banner Superior Ultra Largo (py-8) */}
      <div className="w-full bg-slate-950 border-b border-slate-800 py-8 overflow-hidden whitespace-nowrap z-[60] relative group">
        <div className="ticker-flow gap-24 items-center cursor-default">
          {(tickerData.length > 0 ? [...tickerData, ...tickerData] : []).map((asset, i) => (
            <div key={i} className="flex items-center gap-4 font-mono text-xs font-black tracking-tighter">
              <span className="text-slate-500 uppercase">{asset.t}</span>
              <span className="text-white">R$ {asset.v}</span>
              <span className={asset.c.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}>{asset.c}</span>
            </div>
          ))}
        </div>
      </div>

      <nav className="border-b border-slate-800/50 bg-[#05070a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 px-2 py-0.5 rounded font-black text-white text-[11px] tracking-tighter shadow-lg shadow-blue-900/40">MAD</div>
            <span className="text-sm font-black tracking-[0.2em] text-blue-500 uppercase">MARCUS ALEKS</span>
          </div>
          <Link href="/login" className="bg-slate-900 border border-slate-700 px-4 py-2 rounded text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-white transition-all shadow-md">
            <Lock size={12} className="inline mr-2"/> Acesso Restrito
          </Link>
        </div>
      </nav>

      <header className="max-w-7xl mx-auto px-6 py-20 border-b border-slate-900/50">
        <div className="grid lg:grid-cols-12 gap-12 items-start font-bold">
          <div className="lg:col-span-7 space-y-8">
            <h1 className="text-6xl md:text-8xl font-black leading-none text-white tracking-tighter uppercase italic">Mercado <br/><span className="text-blue-500 not-italic uppercase">Capitais</span></h1>
            <p className="text-slate-400 text-xl max-w-2xl leading-relaxed font-light">Arquitetura quantitativa para monitoramento de ativos e ferramentas de cálculo financeiro aplicadas a portfólios institucionais.</p>
          </div>

          <div className="lg:col-span-5 border border-slate-800 bg-slate-950/40 p-8 rounded-2xl backdrop-blur-sm shadow-2xl relative">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800/50 pb-5">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1 font-bold tracking-widest">IBOVESPA</span>
                  <span className="text-3xl font-bold text-white tracking-tighter">{market.ibov}</span>
                  <span className="text-lg text-emerald-500 ml-4 font-mono font-black">{market.ibovChange}</span>
                </div>
                <Sparkline trend="up" />
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/50 pb-5">
                <div><span className="text-[10px] font-mono text-slate-500 uppercase block mb-1 font-bold tracking-widest">USD / BRL</span><span className="text-3xl font-bold text-white tracking-tighter">R$ {market.usd}</span></div>
                <Sparkline trend="up" />
              </div>
              <div className="flex justify-between items-center">
                <div><span className="text-[10px] font-mono text-blue-500 font-bold uppercase block mb-1 italic font-bold tracking-widest">SELIC EFETIVA</span><span className="text-3xl font-bold text-blue-500 tracking-tighter">{market.selic}%</span></div>
                <div className="text-right font-bold"><span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Reunião COPOM</span><span className="text-xs font-black text-slate-400 font-mono tracking-tighter italic">17/03/2026</span></div>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-900 text-[9px] font-mono flex justify-between uppercase font-black text-slate-600 tracking-widest">
              <span>Sync: BCB / Google Analytics Engine</span>
              <span>Last Update: {syncTime}</span>
            </div>
          </div>
        </div>
      </header>

      {/* RESTAURAÇÃO: NOTÍCIAS */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-b border-slate-900/50">
        <div className="flex items-center gap-4 mb-10">
          <Newspaper className="text-blue-500" size={24} />
          <h2 className="text-white text-2xl font-black uppercase tracking-tighter font-bold">Market Intelligence</h2>
          <div className="h-[1px] flex-1 bg-slate-900"></div>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {newsFeed.length > 0 ? newsFeed.map((item: any, i: number) => (
            <a key={i} href={item.link} target="_blank" className="p-5 border border-slate-800 bg-slate-950/20 rounded-xl hover:border-blue-500/30 transition-all group">
              <span className="text-[9px] text-blue-600 font-bold uppercase block mb-3 font-mono">{item.date}</span>
              <h3 className="text-sm text-slate-200 font-bold leading-tight line-clamp-3 group-hover:text-blue-400">{item.title}</h3>
            </a>
          )) : <div className="col-span-4 text-center py-10 font-mono text-[10px] uppercase animate-pulse text-slate-700 tracking-[0.4em]">Sincronizando feeds de notícias...</div>}
      </section>

      {/* RESTAURAÇÃO: GRID DE LINKS */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
        <div className="p-8 border border-slate-800 bg-slate-900/10 rounded-2xl group hover:border-blue-500/40 transition-all">
          <BarChart3 className="text-blue-500 mb-6" size={32} />
          <h3 className="text-white text-xl font-bold mb-3 uppercase tracking-tighter">Tesouro Direto</h3>
          <a href="https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm" target="_blank" className="text-[10px] font-bold text-blue-500 uppercase hover:underline flex items-center gap-2 tracking-widest">Consultar Taxas <ArrowUpRight size={14} /></a>
        </div>
        <div className="p-8 border border-slate-800 bg-slate-900/10 rounded-2xl group hover:border-blue-500/40 transition-all">
          <Calculator className="text-blue-500 mb-6" size={32} />
          <h3 className="text-white text-xl font-bold mb-3 uppercase tracking-tighter">Cálculo Financeiro</h3>
          <a href="https://www3.bcb.gov.br/CALCIDADAO/publico/exibirFormCorrecaoValores.do?method=exibirFormCorrecaoValores&aba=4" target="_blank" className="text-[10px] font-bold text-blue-500 uppercase hover:underline flex items-center gap-2 tracking-widest">Correção Monetária <ExternalLink size={14} /></a>
        </div>
        <div className="p-8 border border-slate-800 bg-blue-500/5 rounded-2xl border-blue-500/20 shadow-lg shadow-blue-900/10">
          <PieChart className="text-blue-500 mb-6" size={32} />
          <h3 className="text-white text-xl font-bold mb-3 uppercase tracking-tighter">Gestão de Portfólio</h3>
          <a href="https://github.com/marcusaleks/Portfolio_Manager/releases/download/v0.0.1/PortfolioManager_v0.0.1.zip" className="w-full bg-blue-600 text-white px-4 py-3 rounded text-[10px] font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition-all uppercase shadow-md shadow-blue-900/40"><Download size={14} /> Download Engine</a>
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-3 font-bold"><p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.3em]">2026 MAD MARCUS ALEKS DEVELOPERS - SYSTEM ARCHITECTURE</p>
          <div className="flex gap-4">{['Next.js', 'Tailwind CSS', 'Python Core', 'Vercel Edge'].map(t => (<span key={t} className="text-[8px] font-bold text-slate-800 border border-slate-900 px-2 py-0.5 rounded uppercase">{t}</span>))}</div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-mono bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10 shadow-sm shadow-emerald-900/20">
          <Activity size={12} className="animate-pulse" /> SYSTEM STATUS: OPTIMAL
        </div>
      </footer>
    </div>
  );
}
