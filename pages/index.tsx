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
  const [market, setMarket] = useState({ 
    usd: '...', selic: '...', ibov: '...', ibovChange: '...', stocks: [] 
  });

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_BRAPI_TOKEN;

    const fetchUsd = async () => {
      try {
        const res = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL');
        const data = await res.json();
        setMarket(prev => ({ ...prev, usd: parseFloat(data.USDBRL.bid).toFixed(4).replace('.', ',') }));
      } catch (e) { console.error("Erro USD"); }
    };

    const fetchSelic = async () => {
      try {
        const res = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.1178/dados/ultimos/1?formato=json');
        const data = await res.json();
        setMarket(prev => ({ ...prev, selic: data[0].valor.replace('.', ',') }));
      } catch (e) { console.error("Erro Selic"); }
    };

    const fetchIbov = async () => {
      if (!token) return;
      try {
        // Consulta apenas 1 ativo por vez para respeitar o plano gratuito
        const res = await fetch(`https://brapi.dev/api/quote/^BVSP?token=${token}`);
        const data = await res.json();
        const ibovData = data.results[0];
        setMarket(prev => ({ 
          ...prev, 
          ibov: ibovData.regularMarketPrice.toLocaleString('pt-BR'),
          ibovChange: (ibovData.regularMarketChangePercent > 0 ? '+' : '') + ibovData.regularMarketChangePercent.toFixed(2) + '%'
        }));
      } catch (e) { console.error("Erro IBOV"); }
    };

    const fetchTickerStocks = async () => {
      if (!token) return;
      // Para o ticker, buscaremos os 2 principais ativos individualmente para evitar o erro 400
      const symbols = ['PETR4', 'VALE3'];
      const results: any[] = [];
      for (const symbol of symbols) {
        try {
          const res = await fetch(`https://brapi.dev/api/quote/${symbol}?token=${token}`);
          const data = await res.json();
          if (data.results) results.push(data.results[0]);
        } catch (e) { console.error(`Erro ${symbol}`); }
      }
      setMarket(prev => ({ ...prev, stocks: results }));
    };

    fetchUsd();
    fetchSelic();
    fetchIbov();
    fetchTickerStocks();
  }, []);

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 font-sans selection:bg-blue-500/30 font-bold">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
        .ticker-wrap { display: flex; animation: marquee 25s linear infinite; }
      `}} />

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
            )) : <div className="text-[9px] font-mono uppercase px-6 text-slate-600">Sincronizando B3 (Limitação de Plano)...</div>}
         </div>
      </div>

      <nav className="border-b border-slate-800/50 bg-[#05070a]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 px-2 py-0.5 rounded font-black text-white text-[11px]">MAD</div>
          <span className="text-sm font-black tracking-widest text-blue-500 uppercase">MARCUS ALEKS</span>
        </div>
        <Link href="/login" className="bg-slate-900 border border-slate-700 px-4 py-2 rounded text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-white transition-all shadow-md">
          <Lock size={12} className="inline mr-2"/> ACESSO RESTRITO
        </Link>
      </nav>

      <header className="max-w-7xl mx-auto px-6 py-20 border-b border-slate-900/30">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <h1 className="text-7xl md:text-8xl font-black leading-none text-white tracking-tighter uppercase italic">Mercado <br/><span className="text-blue-500 not-italic uppercase">Capitais</span></h1>
          </div>

          <div className="lg:col-span-5 bg-slate-950/40 border border-slate-800 p-8 rounded-2xl backdrop-blur-sm space-y-8 shadow-2xl">
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
                 <span className="text-3xl font-black text-white tracking-tighter">R$ {market.usd}</span>
              </div>
              <Sparkline trend="up" />
            </div>
            <div className="flex justify-between items-center">
              <div>
                 <span className="text-[9px] font-mono text-blue-500 uppercase block mb-1 tracking-widest">SELIC EFETIVA</span>
                 <span className="text-3xl font-black text-blue-500 tracking-tighter">{market.selic}%</span>
              </div>
              <div className="text-right">
                 <span className="text-[8px] font-mono text-slate-600 uppercase block mb-1">REUNIÃO COPOM</span>
                 <span className="text-[10px] font-bold text-slate-400">17/03/2026</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* ... Restante das caixas de Tesouro e Download permanecem iguais ... */}
    </div>
  );
}
