import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calculator, PieChart, Lock, ExternalLink, BarChart3, Download, ArrowUpRight } from 'lucide-react';

export default function Home() {
  const [marketData, setMarketData] = useState({ usd: '5,24', eur: '6,10', selic: '15,00' });

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const resCoins = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL');
        const dataCoins = await resCoins.json();
        const resSelic = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.1178/dados/ultimos/1?formato=json');
        const dataSelic = await resSelic.json();

        setMarketData({
          usd: parseFloat(dataCoins.USDBRL.bid).toFixed(2).replace('.', ','),
          eur: parseFloat(dataCoins.EURBRL.bid).toFixed(2).replace('.', ','),
          selic: dataSelic[0].valor.replace('.', ',')
        });
      } catch (e) { console.log("Usando dados de reserva."); }
    };
    fetchMarket();
  }, []);

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 font-sans selection:bg-blue-500/30">
      <nav className="border-b border-slate-800/50 bg-[#05070a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white text-xs">MA</div>
          <div className="flex items-center gap-8">
            <span className="text-sm font-black tracking-widest text-blue-500 uppercase">MARCUS ALEKS</span>
            <Link href="/login" className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-4 py-2 rounded text-[10px] font-bold hover:bg-slate-800 transition-all text-slate-400">
              <Lock size={12} /> ACESSO RESTRITO
            </Link>
          </div>
        </div>
      </nav>

      <header className="max-w-7xl mx-auto px-6 py-20 border-b border-slate-900/50">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-7xl font-black leading-tight text-white tracking-tighter mb-6">Estratégia e <br/><span className="text-blue-500">Análise de Ativos</span></h1>
            <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">Plataforma consolidada para monitorização de renda fixa, variável e ferramentas de cálculo tributário.</p>
          </div>

          <div className="border border-slate-800 bg-slate-950/40 p-8 rounded-2xl backdrop-blur-sm shadow-2xl">
            <div className="space-y-6">
              <div className="flex justify-between border-b border-slate-800 pb-4">
                <span className="text-[10px] font-mono text-slate-500 uppercase">USD / BRL (Google)</span>
                <span className="text-2xl font-bold text-white tracking-tighter">R$ {marketData.usd}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-4">
                <span className="text-[10px] font-mono text-slate-500 uppercase">EUR / BRL (Google)</span>
                <span className="text-2xl font-bold text-white tracking-tighter">R$ {marketData.eur}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] font-mono text-blue-500 font-bold uppercase">SELIC META</span>
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

        {/* Card Atualizado com o novo nome de arquivo */}
        <div className="p-8 border border-slate-800 bg-slate-900/10 rounded-2xl hover:border-blue-500/40 transition-all">
          <PieChart className="text-blue-500 mb-6" size={32} />
          <h3 className="text-white text-xl font-bold mb-3 uppercase tracking-tighter">Gestão de Portfólio</h3>
          <a href="/downloads/PortfolioManager_v0.0.1.zip" download className="w-full bg-blue-600 text-white px-4 py-3 rounded text-[10px] font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition-all uppercase"><Download size={14} /> Download Projeto</a>
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-900">
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.3em]">2026 MAD MARCUS ALEKS DEVELOPERS - SYSTEM ARCHITECTURE</p>
      </footer>
    </div>
  );
}
