import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calculator, PieChart, Lock, ExternalLink, BarChart3, 
  Download, ArrowUpRight, Activity, Newspaper, Cpu, Globe 
} from 'lucide-react';

const Sparkline = ({ trend = "up" }) => {
  const color = trend === "up" ? "stroke-emerald-500" : "stroke-red-500";
  return (
    <svg className="w-12 h-6" viewBox="0 0 48 24" fill="none">
      <path 
        d={trend === "up" ? "M0 20L10 16L20 18L30 8L40 10L48 2" : "M0 2L10 8L20 6L30 18L40 16L48 22"} 
        className={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" 
      />
    </svg>
  );
};

export default function Home() {
  const [marketData, setMarketData] = useState({ 
    usd: '5,24', eur: '6,06', selic: '14,90', ibov: '128.450', ibovChange: '+1,12%' 
  });
  const [ticker, setTicker] = useState([
    { t: 'PETR4', v: '...', c: '...' }, { t: 'VALE3', v: '...', c: '...' },
    { t: 'BTC/BRL', v: '...', c: '...' }, { t: 'USD/BRL', v: '...', c: '...' }
  ]);
  const [lastSync, setLastSync] = useState('...');
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // 1. Moedas e Cripto (AwesomeAPI)
        const resCoins = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL');
        const d = await resCoins.json();
        
        // 2. Selic (BCB)
        const resSelic = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.1178/dados/ultimos/1?formato=json');
        const s = await resSelic.json();

        // 3. Ações B3 (Exemplo via Brapi - API Gratuita p/ Testes)
        // Nota: Substitua 'TOKEN_AQUI' por sua chave em brapi.dev se necessário
        const resB3 = await fetch('https://brapi.dev/api/quote/PETR4,VALE3?range=1d&interval=1d');
        const dB3 = resB3.ok ? await resB3.json() : null;

        setMarketData(prev => ({
          ...prev,
          usd: parseFloat(d.USDBRL.bid).toFixed(2).replace('.', ','),
          eur: parseFloat(d.EURBRL.bid).toFixed(2).replace('.', ','),
          selic: s[0].valor.replace('.', ',')
        }));

        const petr = dB3?.results[0] || { regularMarketPrice: 36.42, regularMarketChangePercent: 0.85 };
        const vale = dB3?.results[1] || { regularMarketPrice: 68.10, regularMarketChangePercent: -1.20 };

        setTicker([
          { t: 'PETR4', v: petr.regularMarketPrice.toFixed(2), c: (petr.regularMarketChangePercent > 0 ? '+' : '') + petr.regularMarketChangePercent.toFixed(2) + '%' },
          { t: 'VALE3', v: vale.regularMarketPrice.toFixed(2), c: (vale.regularMarketChangePercent > 0 ? '+' : '') + vale.regularMarketChangePercent.toFixed(2) + '%' },
          { t: 'BTC/BRL', v: parseFloat(d.BTCBRL.bid).toLocaleString('pt-BR'), c: (parseFloat(d.BTCBRL.pctChange) > 0 ? '+' : '') + d.BTCBRL.pctChange + '%' },
          { t: 'USD/BRL', v: d.USDBRL.bid, c: (parseFloat(d.USDBRL.pctChange) > 0 ? '+' : '') + d.USDBRL.pctChange + '%' }
        ]);

        setLastSync(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
        const resNews = await fetch(`/data/news.json?t=${new Date().getTime()}`);
        if (resNews.ok) {
          const n = await resNews.json();
          setNews(n.finance.slice(0, 4));
        }
      } catch (e) { console.log("Atualização via cache local."); }
    };
    fetchAll();
    const interval = setInterval(fetchAll, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 font-sans selection:bg-blue-500/30 relative overflow-hidden">
      
      {/* 1. TICKER TAPE LARGO - CORREÇÃO: Cursor Pointer e Padding Aumentado */}
      <div className="w-full bg-slate-950 border-b border-slate-800 py-4 overflow-hidden whitespace-nowrap z-[60] relative group">
        <div className="flex animate-marquee hover:[animation-play-state:paused] gap-16 items-center cursor-default">
          {[...ticker, ...ticker].map((asset, i) => (
            <div key={i} className="flex items-center gap-3 font-mono text-[11px] font-bold">
              <span className="text-slate-500 tracking-tighter uppercase">{asset.t}</span>
              <span className="text-white">R$ {asset.v}</span>
              <span className={asset.c.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}>{asset.c}</span>
            </div>
          ))}
        </div>
      </div>

      <nav className="border-b border-slate-800/50 bg-[#05070a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 px-2 py-0.5 rounded font-black text-white text-[11px] tracking-tighter">MAD</div>
            <span className="text-sm font-black tracking-[0.2em] text-blue-500 uppercase">MARCUS ALEKS</span>
          </div>
          <Link href="/login" className="bg-slate-900 border border-slate-700 px-4 py-2 rounded text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-white transition-all"><Lock size={12} className="inline mr-2"/> Acesso Restrito</Link>
        </div>
      </nav>

      <header className="max-w-7xl mx-auto px-6 py-20 border-b border-slate-900/50">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-8">
            <h1 className="text-6xl md:text-8xl font-black leading-none text-white tracking-tighter uppercase italic">Engenharia <br/><span className="text-blue-500 not-italic">Financeira</span></h1>
            <p className="text-slate-400 text-xl max-w-2xl leading-relaxed font-light font-sans">Desenvolvimento de arquiteturas de alta performance para monitoramento de ativos e ferramentas de cálculo financeiro aplicadas a portfólios institucionais.</p>
            <div className="flex gap-6 pt-4">
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase font-bold"><Globe size={14}/> B3 Connection Active</div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase font-bold"><Cpu size={14}/> Python Engine V3.0</div>
            </div>
          </div>

          <div className="lg:col-span-5 border border-slate-800 bg-slate-950/40 p-8 rounded-2xl backdrop-blur-sm shadow-2xl relative">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800/50 pb-5">
                <div><span className="text-[10px] font-mono text-slate-500 uppercase block mb-1 font-bold">IBOVESPA</span><span className="text-3xl font-bold text-white tracking-tighter">{marketData.ibov}</span><span className="text-sm text-emerald-500 ml-3 font-mono font-black">{marketData.ibovChange}</span></div>
                <Sparkline trend="up" />
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/50 pb-5">
                <div><span className="text-[10px] font-mono text-slate-500 uppercase block mb-1 font-bold">USD / BRL</span><span className="text-3xl font-bold text-white tracking-tighter">R$ {marketData.usd}</span></div>
                <Sparkline trend="up" />
              </div>
              <div className="flex justify-between items-center">
                <div><span className="text-[10px] font-mono text-blue-500 font-bold uppercase block mb-1 italic">SELIC EFETIVA</span><span className="text-3xl font-bold text-blue-500 tracking-tighter">{marketData.selic}%</span></div>
                <div className="text-right"><span className="text-[9px] font-mono text-slate-500 uppercase block mb-1 font-bold">PRÓXIMA REUNIÃO COPOM</span><span className="text-xs font-black text-slate-400 font-mono tracking-tighter">17/03/2026</span></div>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-900 text-[9px] font-mono flex justify-between uppercase font-bold text-slate-600">
              <span>Sync: BCB/Google Analytics Engine</span>
              <span>Last: {lastSync}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Market Intelligence Feed */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-6">
        {news.length > 0 ? news.map((item, i) => (
          <a key={i} href={item.link} target="_blank" className="p-5 border border-slate-800 bg-slate-950/20 rounded-xl hover:border-blue-500/30 transition-all group">
            <span className="text-[9px] text-blue-600 font-bold uppercase block mb-3 font-mono">{item.date}</span>
            <h3 className="text-sm text-slate-200 font-bold leading-tight line-clamp-3 group-hover:text-blue-400">{item.title}</h3>
          </a>
        )) : <div className="col-span-4 text-center py-10 font-mono text-[10px] uppercase animate-pulse">Estabelecendo conexão com agências de notícias...</div>}
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8 border-t border-slate-900">
        <div className="p-8 border border-slate-800 bg-slate-900/10 rounded-2xl group hover:border-blue-500/40 transition-all">
          <BarChart3 className="text-blue-500 mb-6" size={32} />
          <h3 className="text-white text-xl font-bold mb-3 uppercase tracking-tighter">Tesouro Direto</h3>
          <a href="https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm" target="_blank" className="text-[10px] font-bold text-blue-500 uppercase hover:underline">Consultar Taxas <ArrowUpRight size={14} className="inline ml-1" /></a>
        </div>
        <div className="p-8 border border-slate-800 bg-slate-900/10 rounded-2xl group hover:border-blue-500/40 transition-all">
          <Calculator className="text-blue-500 mb-6" size={32} />
          <h3 className="text-white text-xl font-bold mb-3 uppercase tracking-tighter">Cálculo Financeiro</h3>
          <a href="https://www3.bcb.gov.br/CALCIDADAO/publico/exibirFormCorrecaoValores.do?method=exibirFormCorrecaoValores&aba=4" target="_blank" className="text-[10px] font-bold text-blue-500 uppercase hover:underline">Correção Monetária <ExternalLink size={14} className="inline ml-1" /></a>
        </div>
        <div className="p-8 border border-slate-800 bg-blue-500/5 rounded-2xl border-blue-500/20 shadow-lg shadow-blue-900/10">
          <PieChart className="text-blue-500 mb-6" size={32} />
          <h3 className="text-white text-xl font-bold mb-3 uppercase tracking-tighter">Gestão de Portfólio</h3>
          <a href="https://github.com/marcusaleks/Portfolio_Manager/releases/download/v0.0.1/PortfolioManager_v0.0.1.zip" className="w-full bg-blue-600 text-white px-4 py-3 rounded text-[10px] font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition-all uppercase"><Download size={14} /> Download Engine</a>
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.3em]">2026 MAD MARCUS ALEKS DEVELOPERS - SYSTEM ARCHITECTURE</p>
        <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-mono bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10">
          <Activity size={12} className="animate-pulse" /> SYSTEM STATUS: OPTIMAL
        </div>
      </footer>
    </div>
  );
}
