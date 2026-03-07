import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Calculator, PieChart, Lock, ExternalLink, BarChart3, Download, ArrowUpRight } from 'lucide-react';

export default function Home() {
  // Estado para os dados auto-atualizáveis
  const [marketData, setMarketData] = useState({ usd: '...', eur: '...', selic: '...' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Busca Cotações USD e EUR (AwesomeAPI - Dados Google)
        const resCoins = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL');
        const dataCoins = await resCoins.json();
        
        // 2. Busca SELIC Meta Atual (API Oficial do Banco Central do Brasil)
        const resSelic = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.1178/dados/ultimos/1?formato=json');
        const dataSelic = await resSelic.json();

        setMarketData({
          usd: parseFloat(dataCoins.USDBRL.bid).toFixed(2).replace('.', ','),
          eur: parseFloat(dataCoins.EURBRL.bid).toFixed(2).replace('.', ','),
          selic: dataSelic[0].valor.replace('.', ',')
        });
      } catch (error) {
        console.error("Erro ao sincronizar dados financeiros:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 600000); // Atualiza a cada 10 min
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 font-sans selection:bg-blue-500/30">
      {/* Navbar: Ajuste 1 - Marcus Aleks em azul no canto superior */}
      <nav className="border-b border-slate-800/50 bg-[#05070a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded shadow-lg shadow-blue-900/40 flex items-center justify-center font-bold text-white text-xs uppercase">MA</div>
          </div>
          
          <div className="flex items-center gap-8">
            <span className="text-sm font-black tracking-widest text-blue-500 uppercase">MARCUS ALEKS</span>
            <Link href="/login" className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-4 py-2 rounded text-[10px] font-bold hover:bg-slate-800 transition-all text-slate-400 hover:text-white uppercase">
              <Lock size={12} /> ACESSO RESTRITO
            </Link>
          </div>
        </div>
      </nav>

      <header className="max-w-7xl mx-auto px-6 py-20 border-b border-slate-900/50">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-black leading-tight text-white tracking-tighter">
              Estratégia e <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">Análise de Ativos</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
              Plataforma consolidada para monitorização de renda fixa, variável e ferramentas de cálculo tributário.
            </p>
          </div>

          {/* Ajuste 2: Card Auto-atualizável (Selic, USD, EUR) */}
          <div className="border border-slate-800 bg-slate-950/40 p-8 rounded-2xl backdrop-blur-sm shadow-2xl">
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                <span className="text-xs font-mono text-slate-500 uppercase tracking-tighter">USD / BRL</span>
                <div className="text-right">
                  <span className="text-3xl font-bold text-white tracking-tighter">R$ {marketData.usd}</span>
                </div>
              </div>
              <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                <span className="text-xs font-mono text-slate-500 uppercase tracking-tighter">EUR / BRL</span>
                <div className="text-right">
                  <span className="text-3xl font-bold text-white tracking-tighter">R$ {marketData.eur}</span>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xs font-mono text-slate-500 uppercase tracking-tighter font-bold">SELIC META</span>
                <div className="text-right">
                  <span className="text-3xl font-bold text-blue-500 tracking-tighter">{marketData.selic}%</span>
                  <div className="text-[8px] text-emerald-500 font-mono font-bold animate-pulse mt-1 uppercase">LIVE FROM BCB</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
        <div className="p-8 border border-slate-800 bg-slate-900/10 rounded-2xl hover:border-blue-500/40 transition-all group">
          <BarChart3 className="text-blue-500 mb-6" size={32} />
          <h3 className="text-white text-xl font-bold mb-3">Tesouro Direto</h3>
          <a href="https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm" target="_blank" className="text-xs font-bold text-blue-500 flex items-center gap-2 uppercase tracking-widest hover:underline">
            CONSULTAR TAXAS <ArrowUpRight size={14} />
          </a>
        </div>

        {/* Ajuste 3: Link Específico do Banco Central */}
        <div className="p-8 border border-slate-800 bg-slate-900/10 rounded-2xl hover:border-blue-500/40 transition-all">
          <Calculator className="text-blue-500 mb-6" size={32} />
          <h3 className="text-white text-xl font-bold mb-3">Cálculo Financeiro</h3>
          <a href="https://www3.bcb.gov.br/CALCIDADAO/publico/exibirFormCorrecaoValores.do?method=exibirFormCorrecaoValores&aba=4" target="_blank" className="text-xs font-bold text-blue-500 flex items-center gap-2 uppercase tracking-widest hover:underline">
            CORREÇÃO MONETÁRIA <ExternalLink size={14} />
          </a>
        </div>

        {/* Ajuste 4: Download Embedded do Projeto Python */}
        <div className="p-8 border border-slate-800 bg-slate-900/10 rounded-2xl hover:border-blue-500/40 transition-all">
          <PieChart className="text-blue-500 mb-6" size={32} />
          <h3 className="text-white text-xl font-bold mb-3">Gestão de Portfólio</h3>
          <p className="text-xs text-slate-500 mb-4 uppercase font-bold tracking-tighter">Projeto Python GUI</p>
          <a href="/downloads/portfolio-management-v1.zip" download className="w-full bg-blue-600 text-white px-4 py-3 rounded text-[10px] font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition-all uppercase">
            <Download size={14} /> DOWNLOAD PROJECT.EXE
          </a>
        </div>
      </section>

      {/* Ajuste 5: Footer Personalizado */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-900">
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.3em]">
          2026 MAD MARCUS ALEKS DEVELOPERS - SYSTEM ARCHITECTURE
        </p>
      </footer>
    </div>
  );
}
