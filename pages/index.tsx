import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calculator, PieChart, Lock, ExternalLink, BarChart3, 
  Download, ArrowUpRight, Activity, Newspaper, Cpu, Globe 
} from 'lucide-react';

// Componente de Sparkline aprimorado com lógica de tendência
const Sparkline = ({ trend = "up" }) => {
  const color = trend === "up" ? "stroke-emerald-500" : "stroke-red-500";
  return (
    <svg className="w-12 h-6" viewBox="0 0 48 24" fill="none">
      <path 
        d={trend === "up" ? "M0 20L10 16L20 18L30 8L40 10L48 2" : "M0 2L10 8L20 6L30 18L40 16L48 22"} 
        className={color} 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
};

export default function Home() {
  const [marketData, setMarketData] = useState({ 
    usd: '5,24', eur: '6,06', selic: '14,90', ibov: '128.450', ibovChange: '+1,12%' 
  });
  const [lastSync, setLastSync] = useState('...');
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Sincronização de Mercado (Google Finance / AwesomeAPI)
        const resCoins = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL');
        const dataCoins = await resCoins.json();
        
        // SELIC Efetiva (SGS Banco Central)
        const resSelic = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.1178/dados/ultimos/1?formato=json');
        const dataSelic = await resSelic.json();

        setMarketData(prev => ({
          ...prev,
          usd: parseFloat(dataCoins.USDBRL.bid).toFixed(2).replace('.', ','),
          eur: parseFloat(dataCoins.EURBRL.bid).toFixed(2).replace('.', ','),
          selic: dataSelic[0].valor.replace('.', ',')
        }));

        setLastSync(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));

        // News Feed
        const resNews = await fetch(`/data/news.json?t=${new Date().getTime()}`);
        if (resNews.ok) {
          const dataNews = await resNews.json();
          setNews(dataNews.finance.slice(0, 4));
        }
      } catch (e) { console.log("Re-sincronizando bases..."); }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 font-sans selection:bg-blue-500/30 relative overflow-hidden">
      
      {/* Background Effect: Scanlines de Terminal Industrial */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

      {/* Navbar: MAD MARCUS ALEKS */}
      <nav className="border-b border-slate-800/50 bg-[#05070a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 px-2 py-0.5 rounded font-black text-white text-[11px] tracking-tighter shadow-lg shadow-blue-900/40">MAD</div>
            <span className="text-sm font-black tracking-[0.2em] text-blue-500 uppercase">MARCUS ALEKS</span>
          </div>
          <Link href="/login" className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-4 py-2 rounded text-[10px] font-bold hover:bg-slate-800 transition-all text-slate-400 uppercase tracking-widest">
            <Lock size={12} /> Acesso Restrito
          </Link>
        </div>
      </nav>

      <header className="max-w-7xl mx-auto px-6 py-20 border-b border-slate-900/50">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Posicionamento Estratégico e Texto Profissional */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/20 text-blue-500 text-[9px] font-bold uppercase tracking-[0.3em]">
              Arquitetura Financeira e Engenharia de Software
            </div>
            <h1 className="text-6xl md:text-8xl font-black leading-none text-white tracking-tighter">
              Mercado de <br/><span className="text-blue-500 italic uppercase">Capitais</span>
            </h1>
            <p className="text-slate-400 text-xl max-w-2xl leading-relaxed font-light">
              Desenvolvimento de ecossistemas de alta performance para monitoramento de ativos, gestão de risco e ferramentas de cálculo financeiro aplicadas a portfólios institucionais e custódia privada.
            </p>
            <div className="flex gap-6 pt-4">
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase"><Globe size={14}/> B3 Connection Active</div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase"><Cpu size={14}/> Python Core V0.0.1</div>
            </div>
          </div>

          {/* Terminal de Mercado: IBOV, USD, EUR e SELIC EFETIVA */}
          <div className="lg:col-span-5 border border-slate-800 bg-slate-950/40 p-8 rounded-2xl backdrop-blur-sm shadow-2xl relative">
            <div className="absolute -top-3 -right-3 bg-blue-600 text-white text-[8px] font-black px-2 py-1 rounded uppercase shadow-lg shadow-blue-900/60">Live Analytics</div>
            
            <div className="space-y-6">
              {/* IBOVESPA com fonte de variação aumentada */}
              <div className="flex justify-between items-center border-b border-slate-800/50 pb-5">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1 tracking-widest">IBOVESPA</span>
                  <span className="text-3xl font-bold text-white tracking-tighter">{marketData.ibov}</span>
                  <span className="text-sm text-emerald-500 ml-3 font-mono font-black">{marketData.ibovChange}</span>
                </div>
                <Sparkline trend="up" />
              </div>

              {/* USD com Sparkline corrigida para verde (up) */}
              <div className="flex justify-between items-center border-b border-slate-800/50 pb-5">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1 tracking-widest">USD / BRL</span>
                  <span className="text-3xl font-bold text-white tracking-tighter">R$ {marketData.usd}</span>
                </div>
                <Sparkline trend="up" /> 
              </div>

              {/* EUR / BRL Adicionado */}
              <div className="flex justify-between items-center border-b border-slate-800/50 pb-5">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1 tracking-widest">EUR / BRL</span>
                  <span className="text-3xl font-bold text-white tracking-tighter">R$ {marketData.eur}</span>
                </div>
                <Sparkline trend="down" />
              </div>

              {/* SELIC EFETIVA + Reunião COPOM */}
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-mono text-blue-500 font-bold uppercase block mb-1 italic">SELIC EFETIVA</span>
                  <span className="text-3xl font-bold text-blue-500 tracking-tighter">{marketData.selic}%</span>
                </div>
                <div className="text-right">
                   <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Próxima Reunião COPOM</span>
                   <span className="text-xs font-black text-slate-400 font-mono tracking-tighter italic">17/03/2026</span>
                </div>
              </div>
            </div>

            {/* Sincronização em Negrito */}
            <div className="mt-8 pt-4 border-t border-slate-900 text-[9px] font-mono text-slate-600 flex justify-between uppercase tracking-widest">
              <span className="font-bold">Sync: BCB / Google Analytics Engine</span>
              <span className="font-bold">Last Update: {lastSync}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Painel de Market Intelligence */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-b border-slate-900/50">
        <div className="flex items-center gap-4 mb-10">
          <Newspaper className="text-blue-500" size={24} />
          <h2 className="text-white text-2xl font-black uppercase tracking-tighter">Market Intelligence</h2>
          <div className="h-[1px] flex-1 bg-slate-900"></div>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {news.length > 0 ? news.map((item, i) => (
            <a key={i} href={item.link} target="_blank" className="p-5 border border-slate-800 bg-slate-950/20 rounded-xl hover:border-blue-500/30 transition-all group">
              <span className="text-[9px] text-blue-600 font-bold uppercase block mb-3 font-mono">{item.date}</span>
              <h3 className="text-sm text-slate-200 font-bold leading-tight group-hover:text-blue-400 transition-colors line-clamp-3">{item.title}</h3>
            </a>
          )) : (
            <div className="col-span-4 py-10 border border-dashed border-slate-800 rounded-xl text-center">
              <p className="text-xs font-mono text-slate-700 uppercase animate-pulse tracking-[0.4em]">Iniciando sincronização de fluxos de dados...</p>
            </div>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
        <div className="p-8 border border-slate-800 bg-slate-900/10 rounded-2xl hover:border-blue-500/40 transition-all group">
          <BarChart3 className="text-blue-500 mb-6" size={32} />
          <h3 className="text-white text-xl font-bold mb-3 uppercase tracking-tighter">Tesouro Direto</h3>
          <a href="https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm" target="_blank" className="text-[10px] font-bold text-blue-500 flex items-center gap-2 uppercase tracking-widest hover:underline">Consultar Taxas <ArrowUpRight size={14} /></a>
        </div>

        <div className="p-8 border border-slate-800 bg-slate-900/10 rounded-2xl hover:border-blue-500/40 transition-all">
          <Calculator className="text-blue-500 mb-6" size={32} />
          <h3 className="text-white text-xl font-bold mb-3 uppercase tracking-tighter">Cálculo Financeiro</h3>
          <a href="https://www3.bcb.gov.br/CALCIDADAO/publico/exibirFormCorrecaoValores.do?method=exibirFormCorrecaoValores&aba=4" target="_blank" className="text-[10px] font-bold text-blue-500 flex items-center gap-2 uppercase tracking-widest hover:underline">Correção Monetária <ExternalLink size={14} /></a>
        </div>

        <div className="p-8 border border-slate-800 bg-slate-900/10 rounded-2xl border-blue-500/20 bg-blue-500/5 transition-all">
          <PieChart className="text-blue-500 mb-6" size={32} />
          <h3 className="text-white text-xl font-bold mb-3 uppercase tracking-tighter">Gestão de Portfólio</h3>
          <a href="https://github.com/marcusaleks/Portfolio_Manager/releases/download/v0.0.1/PortfolioManager_v0.0.1.zip" className="w-full bg-blue-600 text-white px-4 py-3 rounded text-[10px] font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition-all uppercase shadow-lg shadow-blue-900/40"><Download size={14} /> Download Engine</a>
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-2 text-center md:text-left">
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.3em]">
            2026 MAD MARCUS ALEKS DEVELOPERS - SYSTEM ARCHITECTURE
          </p>
          <div className="flex gap-4 justify-center md:justify-start">
            {['Next.js', 'Tailwind', 'Python Core', 'Vercel Edge'].map(tech => (
              <span key={tech} className="text-[8px] font-bold text-slate-800 border border-slate-900 px-2 py-0.5 rounded uppercase">{tech}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-mono bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10 shadow-sm shadow-emerald-900/20">
          <Activity size={12} className="animate-pulse" /> SYSTEM STATUS: OPTIMAL
        </div>
      </footer>
    </div>
  );
}
