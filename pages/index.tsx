import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, Activity, TrendingUp, ArrowUpRight, Calculator, Download } from 'lucide-react';

const Sparkline = ({ trend = "up" }) => (
  <svg className="w-16 h-8" viewBox="0 0 48 24" fill="none">
    <path d={trend === "up" ? "M0 20L10 16L20 18L30 8L40 10L48 2" : "M0 2L10 8L20 6L30 18L40 16L48 22"} 
          className={trend === "up" ? "stroke-emerald-500" : "stroke-red-500"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Home() {
  const [market, setMarket] = useState({ usd: '...', usdChange: '...', selic: '...', ibov: '...', ibovChange: '...', stocks: [] });
  const [nextCopom, setNextCopom] = useState('...');

  useEffect(() => {
    const fetchMarket = async () => {
      const [resCur, resSelic, resMarket] = await Promise.allSettled([
        fetch('https://economia.awesomeapi.com.br/last/USD-BRL').then(r => r.json()),
        fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.1178/dados/ultimos/1?formato=json').then(r => r.json()),
        fetch('/api/market').then(r => r.json()),
      ]);

      setMarket(prev => {
        const next = { ...prev };

        if (resCur.status === 'fulfilled') {
          try {
            next.usd = parseFloat(resCur.value.USDBRL.bid).toFixed(4).replace('.', ',');
            next.usdChange = (parseFloat(resCur.value.USDBRL.pctChange) > 0 ? '+' : '') + resCur.value.USDBRL.pctChange + '%';
          } catch {}
        }

        if (resSelic.status === 'fulfilled') {
          try {
            next.selic = resSelic.value[0].valor.replace('.', ',');
          } catch {}
        }

        if (resMarket.status === 'fulfilled') {
          try {
            const results: any[] = resMarket.value.results || [];
            const ibov = results.find(r => r.symbol === '^BVSP');
            if (ibov) {
              next.ibov = ibov.regularMarketPrice.toLocaleString('pt-BR');
              next.ibovChange = (ibov.regularMarketChangePercent > 0 ? '+' : '') + ibov.regularMarketChangePercent.toFixed(2) + '%';
            }
            next.stocks = results.filter(r => r.symbol !== '^BVSP').sort((a: any, b: any) => a.symbol.localeCompare(b.symbol));
          } catch {}
        }

        return next;
      });
    };

    const fetchCopom = async () => {
      try {
        const res = await fetch('/copom.md');
        if (!res.ok) throw new Error('Not found');
        const text = await res.text();
        const lines = text.split('\n');
        let nextDate = 'A definir';
        const now = Date.now();
        for (const line of lines) {
          const match = line.match(/\|\s*([^|]+)\s*\|\s*(\d{2}\/\d{2}\/\d{4})\s*\|/);
          if (match && !match[1].includes('Reunião |')) {
             const dateStr = match[2].trim();
             const [day, month, year] = dateStr.split('/');
             const timestamp = new Date(`${year}-${month}-${day}T23:59:59-03:00`).getTime();
             if (timestamp >= now) {
                nextDate = dateStr;
                break;
             }
          }
        }
        setNextCopom(nextDate);
      } catch (error) {
        console.error("Erro ao carregar dados do COPOM local:", error);
      }
    };

    fetchMarket();
    fetchCopom();
  }, []);

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 font-sans selection:bg-blue-500/30 font-bold" style={{ fontSize: '1.2em' }}>
      <style dangerouslySetInnerHTML={{ __html: `.ticker-wrap { display: flex; animation: marquee 180s linear infinite; width: max-content; } @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }`}} />
      
      {/* Banner Ampliado: Texto +20% e Velocidade -80% */}
      <div className="w-full bg-slate-950 border-b border-slate-800 py-8 overflow-hidden z-[60] relative">
         <div className="ticker-wrap gap-16 items-center flex whitespace-nowrap">
            {[...market.stocks, ...market.stocks, ...market.stocks, ...market.stocks, ...market.stocks, ...market.stocks].map((stock: any, i) => (
              <div key={i} className="flex items-center gap-6 px-8 border-r border-slate-800/50">
                <span className="text-[18px] font-black text-white">{stock.symbol}</span>
                <span className="text-[18px] font-mono text-slate-400">R$ {stock.regularMarketPrice.toFixed(2)}</span>
                <span className={`text-[16px] font-bold ${stock.regularMarketChangePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{stock.regularMarketChangePercent >= 0 ? '▲' : '▼'} {Math.abs(stock.regularMarketChangePercent).toFixed(2)}%</span>
              </div>
            ))}
         </div>
      </div>

      <nav className="max-w-7xl mx-auto px-6 py-10 flex justify-between items-center">
        <div className="flex items-center gap-3"><div className="bg-blue-600 px-3 py-1 rounded font-black text-white text-[16px]">MAD</div><span className="text-[1.2em] font-black tracking-widest text-blue-500 uppercase">MARCUS ALEKS DEVS</span></div>
        <Link href="/login" className="bg-slate-900 border border-slate-800 px-8 py-4 rounded-xl text-[14px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all shadow-xl"><Lock size={18} className="inline mr-2"/> ACESSO RESTRITO</Link>
      </nav>

      <header className="max-w-7xl mx-auto px-6 py-24 border-b border-slate-900/50">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 space-y-10">
            {/* Título: Tamanho Original Restaurado */}
            <h1 className="text-6xl md:text-8xl font-black leading-none text-white tracking-tighter uppercase italic">MERCADO<br/>FINANCEIRO<br/><span className="text-blue-500 not-italic uppercase">BRASILEIRO</span></h1>
            <p className="text-slate-500 text-[1.2em] max-w-2xl leading-relaxed font-bold">Ferramentas de análise, cálculo e gestão desenvolvidas para investidores que tomam decisões com dados — não com achismos. Ações, FIIs, renda fixa e derivativos em um só lugar.</p>
          </div>
          <div className="lg:col-span-5 bg-slate-950/40 border border-slate-800 p-12 rounded-[3rem] shadow-2xl space-y-12">
            <div className="flex justify-between items-center border-b border-slate-900 pb-10">
              <div><span className="text-[14px] font-mono text-slate-500 uppercase block mb-1">IBOVESPA</span><div className="flex items-baseline gap-2"><span className="text-5xl font-black text-white tracking-tighter">{market.ibov}</span><span className={`text-sm font-bold ${market.ibovChange.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{market.ibovChange}</span></div></div>
              <Sparkline trend={market.ibovChange.startsWith('+') ? "up" : "down"} />
            </div>
            <div className="flex justify-between items-center border-b border-slate-900 pb-10">
              <div><span className="text-[14px] font-mono text-slate-500 uppercase block mb-1">USD / BRL</span><div className="flex items-baseline gap-2"><span className="text-4xl font-black text-white tracking-tighter">R$ {market.usd}</span><span className={`text-sm font-bold ${market.usdChange.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{market.usdChange}</span></div></div>
              <Sparkline trend={market.usdChange.startsWith('+') ? "up" : "down"} />
            </div>
            <div className="flex justify-between items-center">
              <div><span className="text-[14px] font-mono text-blue-500 uppercase block mb-1 tracking-widest">SELIC EFETIVA</span><span className="text-4xl font-black text-blue-500 tracking-tighter">{market.selic}%</span></div>
              <div className="text-right"><span className="text-[12px] font-mono text-slate-600 uppercase block font-bold mb-1">REUNIÃO COPOM</span><span className="text-sm font-bold text-slate-400">{nextCopom}</span></div>
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-28 grid md:grid-cols-3 gap-12">
        <a href="https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm" target="_blank" className="p-12 border border-slate-800 bg-slate-950/20 rounded-[3rem] group hover:border-emerald-500/40 transition-all shadow-xl"><TrendingUp className="text-emerald-500 mb-8" size={56} /><h3 className="text-white text-[1.4em] font-black mb-4 uppercase tracking-tighter italic">Tesouro Direto</h3><p className="text-[1em] text-slate-500 mb-10 leading-relaxed font-bold">Preços e taxas de títulos federais em tempo real.</p></a>
        <a href="https://www3.bcb.gov.br/CALCIDADAO/publico/exibirFormCorrecaoValores.do?method=exibirFormCorrecaoValores&aba=4" target="_blank" className="p-12 border border-slate-800 bg-slate-950/20 rounded-[3rem] group hover:border-blue-500/40 transition-all shadow-xl"><Calculator className="text-blue-500 mb-8" size={56} /><h3 className="text-white text-[1.4em] font-black mb-4 uppercase tracking-tighter italic">Calculadora Bacen</h3><p className="text-[1em] text-slate-500 mb-10 leading-relaxed font-bold">Simulador oficial de correção de valores.</p></a>
        <div className="p-12 border border-slate-800 bg-blue-600/5 border-blue-500/10 rounded-[3rem] shadow-2xl"><Download className="text-blue-500 mb-8" size={56} /><h3 className="text-white text-[1.4em] font-black mb-4 uppercase tracking-tighter italic">Portfolio Manager</h3><p className="text-[1em] text-slate-400 mb-10 leading-relaxed font-bold">Engine quantitativa em Python para uso local.</p><a href="https://github.com/marcusaleks/Portfolio_Manager/releases/download/v0.0.1/PortfolioManager_v0.0.1.zip" className="w-full bg-blue-600 text-white py-6 rounded-2xl text-[16px] font-black flex items-center justify-center gap-4 hover:bg-blue-700 transition-all uppercase tracking-widest shadow-lg shadow-blue-900/20"><Activity size={24} /> Download v.0.0.1</a></div>
      </section>
      <footer className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-900 flex justify-between items-center text-[12px] font-mono text-slate-600 font-bold uppercase tracking-[0.3em]"><p>© 2026 MARCUS ALEKS DEVELOPERS</p><div className="flex items-center gap-3 text-emerald-500 bg-emerald-500/5 px-6 py-3 rounded-full border border-emerald-500/10"><Activity size={16} className="animate-pulse" /> ENGINE: OPTIMAL</div></footer>
    </div>
  );
}
