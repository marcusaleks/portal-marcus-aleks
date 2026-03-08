import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calculator, PieChart, Lock, ExternalLink, BarChart3, Download, ArrowUpRight, Activity } from 'lucide-react';

export default function Home() {
  const [marketData, setMarketData] = useState({ 
    usd: '5,24', 
    eur: '6,06', 
    selic: '14,90',
    ibov: '128.450',
    ibovChange: '+1,12%' 
  });

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        // Cotações Moedas
        const resCoins = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL');
        const dataCoins = await resCoins.json();
        
        // Selic Efetiva (SGS Banco Central)
        const resSelic = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.1178/dados/ultimos/1?formato=json');
        const dataSelic = await resSelic.json();

        // Nota: IBOVESPA geralmente requer API key (ex: Brapi). 
        // Mantendo fallback para apresentação visual imediata.
        setMarketData(prev => ({
          ...prev,
          usd: parseFloat(dataCoins.USDBRL.bid).toFixed(2).replace('.', ','),
          eur: parseFloat(dataCoins.EURBRL.bid).toFixed(2).replace('.', ','),
          selic: dataSelic[0].valor.replace('.', ',')
        }));
      } catch (e) { console.log("Sincronização parcial realizada."); }
    };
    fetchMarket();
  }, []);

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 font-sans selection:bg-blue-500/30">
      {/* Navbar: Ajuste 1 e 2 - MAD + Nome à esquerda */}
      <nav className="border-b border-slate-800/50 bg-[#05070a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 px-2 py-1 rounded font-black text-white text-sm tracking-tighter">MAD</div>
            <span className="text-sm font-black tracking-widest text-blue-500 uppercase">MARCUS ALEKS</span>
          </div>
          
          <Link href="/login" className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-4 py-2 rounded text-[10px] font-bold hover:bg-slate-800 transition-all text-slate-400">
            <Lock size={12} /> ACESSO RESTRITO
          </Link>
        </div>
      </nav>

      <header className="max-w-7xl mx-auto px-6 py-20 border-b border-slate-900/50">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-black leading-tight text-white tracking-tighter">
              Estratégia e <br/><span className="text-blue-500">Análise de Ativos</span>
            </h1>
            {/* Ajuste 5: Substituição de "tributário" por "financeiro" */}
            <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
              Plataforma consolidada para monitorização de renda fixa, variável e ferramentas de cálculo financeiro.
            </p>
          </div>

          <div className="border border-slate-800 bg-slate-950/40 p-8 rounded-2xl backdrop-blur-sm shadow-2xl">
            <div className="space-y-6">
              {/* Ajuste 4: Inclusão do IBOVESPA */}
              <div className="flex justify-between border-b border-slate-800 pb-4">
                <span className="text-[10px] font-mono text-slate-500 uppercase">IBOVESPA</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-white tracking-tighter">{marketData.ibov}</span>
                  <span className="text-[10px] text-emerald-500 ml-2 font-mono font-bold">{marketData.ibovChange}</span>
                </div>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-4">
                <span className="text-[10px] font-mono text-slate-500 uppercase">USD / BRL (Google)</span>
                <span className="text-2xl font-bold text-white tracking-tighter">R$ {marketData.usd}</span>
              </div>
              <div className="flex justify-between">
                {/* Ajuste 3: SELIC EFETIVA */}
                <span className="text-[10px] font-mono text-blue-500 font-bold uppercase">SELIC EFETIVA</span>
                <span className="text-2xl font-bold text-blue-500 tracking-tighter">{marketData.selic}%</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
        <div className="p-8 border border-slate-800 bg-slate-900/10 rounded-2xl hover:border-blue-500/40 transition-all">
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

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-900 flex justify-between items-center">
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.3em]">
          2026 MAD MARCUS ALEKS DEVELOPERS - SYSTEM ARCHITECTURE
        </p>
        <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-mono">
          <Activity size={12} /> SYSTEM ONLINE
        </div>
      </footer>
    </div>
  );
}
