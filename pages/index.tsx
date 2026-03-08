import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calculator, PieChart, Lock, ExternalLink, BarChart3, 
  Download, ArrowUpRight, Activity, Newspaper, Cpu, Globe 
} from 'lucide-react';

// Componente de Mini Gráfico (Sparkline) para estética de terminal
const Sparkline = ({ color = "stroke-emerald-500" }) => (
  <svg className="w-12 h-6" viewBox="0 0 48 24" fill="none">
    <path 
      d="M0 18L8 14L16 20L24 10L32 14L40 4L48 12" 
      className={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
);

export default function Home() {
  const [marketData, setMarketData] = useState({ 
    usd: '5,24', eur: '6,06', selic: '14,90', ibov: '128.450', ibovChange: '+1,12%' 
  });
  const [lastSync, setLastSync] = useState('...');
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Sincronização de Mercado
        const resCoins = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL');
        const dataCoins = await resCoins.json();
        const resSelic = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.1178/dados/ultimos/1?formato=json');
        const dataSelic = await resSelic.json();

        setMarketData(prev => ({
          ...prev,
          usd: parseFloat(dataCoins.USDBRL.bid).toFixed(2).replace('.', ','),
          eur: parseFloat(dataCoins.EURBRL.bid).toFixed(2).replace('.', ','),
          selic: dataSelic[0].valor.replace('.', ',')
        }));

        setLastSync(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));

        // Busca de Notícias (Painel de Inteligência)
        const resNews = await fetch(`/data/news.json?t=${new Date().getTime()}`);
        if (resNews.ok) {
          const dataNews = await resNews.json();
          setNews(dataNews.finance.slice(0, 4));
        }
      } catch (e) { console.log("Erro na atualização de rede."); }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 font-sans selection:bg-blue-500/30 relative overflow-hidden">
      
      {/* Efeito de Scanline/Ruído sutil no fundo */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

      {/* Navbar: Ajuste 1 e 2 - MAD MARCUS ALEKS */}
      <nav className="border-b border-slate-800/50 bg-[#05070a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 px-2 py-0.5 rounded font-black text-white text-[11px] tracking-tighter">MAD</div>
            <span className="text-sm font-black tracking-[0.2em] text-blue-500 uppercase">MARCUS ALEKS</span>
          </div>
          <Link href="/login" className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-4 py-2 rounded text-[10px] font-bold hover:bg-slate-800 transition-all text-slate-400 uppercase tracking-widest">
            <Lock size={12} /> Acesso Restrito
          </Link>
        </div>
      </nav>

      <header className="max-w-7xl mx-auto px-6 py-20 border-b border-slate-900/50">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Texto Profissional Focado no Mercado */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/20 text-blue-500 text-[9px] font-bold uppercase tracking-[0.3em]">
              Sistemas de Alta Disponibilidade
            </div>
            <h1 className="text-6xl md:text-8xl font-black leading-none text-white tracking-tighter">
              Infraestrutura <br/><span className="text-blue-500 italic">Quantitativa</span>
            </h1>
            <p className="text-slate-400 text-xl max-w-2xl leading-relaxed font-light">
              Desenvolvimento de arquiteturas robustas para gestão de ativos, monitoramento de fluxos em tempo real e ferramentas avançadas de análise e cálculo financeiro para o mercado de capitais brasileiro.
            </p>
            <div className="flex gap-6 pt-4">
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase"><Globe size={14}/> B3 Connection Active</div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase"><Cpu size={14}/> Python Core Engine</div>
            </div>
          </div>

          {/* Quadro de Mercado com IBOV, Sparklines e Selic Efetiva */}
          <div className="lg:col-span-5 border border-slate-800 bg-slate-950/40 p-8 rounded-2xl backdrop-blur-sm shadow-2xl relative group">
            <div className="absolute -top-3 -right-3 bg-blue-600 text-white text-[8px] font-black px-2 py-1 rounded uppercase animate-pulse">Live Data</div>
            <div className="space-y-8">
              <div className="flex justify-between items-center border-b border-slate-800/50 pb-6">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">IBOVESPA</span>
                  <span className="text-3xl font-bold text-white tracking-tighter">{marketData.ibov}</span>
                  <span className="text-[10px] text-emerald-500 ml-2 font-mono font-bold">{marketData.ibovChange}</span>
                </div>
                <Sparkline />
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/50 pb-6">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">USD / BRL</span>
                  <span className="text-3xl font-bold text-white tracking-tighter">R$ {marketData.usd}</span>
                </div>
                <Sparkline color="stroke-red-500" />
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-mono text-blue-500 font-bold uppercase block mb-1 italic">SELIC EFETIVA</span>
                  <span className="text-3xl font-bold text-blue-500 tracking-tighter">{marketData.selic}%</span>
                </div>
                <Activity className="text-blue-900/50" size={32} />
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-900 text-[9px] font-mono text-slate-600 flex justify-between uppercase tracking-widest">
              <span>Sync: BCB/Google APIs</span>
              <span>Last: {lastSync}</span>
            </div>
          </div>
        </div>
      </header>

      {/* NOVO: Painel de Notícias Relevantes */}
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
              <p className="text-xs font-mono text-slate-700 uppercase animate-pulse tracking-[0.4em]">Sincronizando feeds de notícias...</p>
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
          <a href="https://github.com/marcusaleks/Portfolio_Manager/releases/download/v0.0.1/PortfolioManager_v0.0.1.zip" className="w-full bg-blue-600 text-white px-4 py-3 rounded text-[10px] font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition-all uppercase shadow-lg shadow-blue-900/40"><Download size={14} /> Download Projeto</a>
        </div>
      </section>

      {/* Footer com Tech Stack (Sugestão de Melhoria) */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-2 text-center md:text-left">
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.3em]">
            2026 MAD MARCUS ALEKS DEVELOPERS - SYSTEM ARCHITECTURE
          </p>
          <div className="flex gap-4 justify-center md:justify-start">
            {['Next.js', 'Tailwind', 'Python', 'Vercel Edge'].map(tech => (
              <span key={tech} className="text-[8px] font-bold text-slate-800 border border-slate-900 px-2 py-0.5 rounded uppercase">{tech}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-mono bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10">
          <Activity size={12} className="animate-pulse" /> SYSTEM STATUS: OPTIMAL
        </div>
      </footer>
    </div>
  );
}
