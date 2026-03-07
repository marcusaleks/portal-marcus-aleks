import React from 'react';
import Link from 'next/link';
import { TrendingUp, Calculator, PieChart, Lock, ExternalLink, BarChart3, Download, ArrowUpRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 font-sans selection:bg-blue-500/30">
      {/* Navbar com Marcus Aleks em Azul */}
      <nav className="border-b border-slate-800/50 bg-[#05070a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded shadow-lg shadow-blue-900/40 flex items-center justify-center font-bold text-white text-xs">MA</div>
            <span className="text-xl font-bold tracking-tighter text-blue-500 uppercase">MARCUS ALEKS</span>
          </div>
          <Link href="/login" className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-4 py-2 rounded text-xs font-bold hover:bg-slate-800 transition-all text-slate-400 hover:text-white">
            <Lock size={12} />
            ACESSO RESTRITO
          </Link>
        </div>
      </nav>

      {/* Hero: Engenharia de Portfólio */}
      <header className="max-w-7xl mx-auto px-6 py-20 border-b border-slate-900/50">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest">
              Financial Portfolio Management
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-tight text-white tracking-tighter">
              Estratégia e <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">Análise de Ativos</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
              Plataforma consolidada para monitorização de renda fixa, variável e ferramentas de cálculo tributário para investidores institucionais e privados.
            </p>
          </div>

          {/* Quadro de Mercado Atualizado (Março 2026) */}
          <div className="border border-slate-800 bg-slate-950/40 p-8 rounded-2xl backdrop-blur-sm shadow-2xl">
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                <span className="text-xs font-mono text-slate-500 uppercase">USD/BRL</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-white tracking-tighter">5,24</span>
                  <span className="text-xs text-slate-500 ml-2 font-mono">GOOGLE DATA</span>
                </div>
              </div>
              <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                <span className="text-xs font-mono text-slate-500 uppercase">EUR/BRL</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-white tracking-tighter">6,10</span>
                  <span className="text-xs text-slate-500 ml-2 font-mono">GOOGLE DATA</span>
                </div>
              </div>
              <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                <span className="text-xs font-mono text-slate-500 uppercase">SELIC (META)</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-500 tracking-tighter">15,00%</span>
                  <span className="text-[10px] text-slate-500 ml-2 font-mono uppercase italic">ATUALIZADO</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Grid de Ferramentas */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
        
        <div className="p-8 border border-slate-800 bg-slate-900/10 rounded-2xl hover:border-blue-500/40 transition-all group">
          <BarChart3 className="text-blue-500 mb-6" size={32} />
          <h3 className="text-white text-xl font-bold mb-3">Tesouro Direto</h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">Acompanhamento de taxas e preços dos títulos públicos atualizados via Secretaria do Tesouro Nacional.</p>
          <a href="https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm" target="_blank" className="text-xs font-bold text-blue-500 flex items-center gap-2 uppercase tracking-widest hover:gap-3 transition-all">
            CONSULTAR TAXAS <ArrowUpRight size={14} />
          </a>
        </div>

        <div className="p-8 border border-slate-800 bg-slate-900/10 rounded-2xl hover:border-blue-500/40 transition-all">
          <Calculator className="text-blue-500 mb-6" size={32} />
          <h3 className="text-white text-xl font-bold mb-3">Cálculo Financeiro</h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">Acesso à Calculadora do Cidadão para correção de valores por índices de preços e juros.</p>
          <a href="https://www3.bcb.gov.br/CALCIDADAO/publico/exibirFormCorrecaoValores.do?method=exibirFormCorrecaoValores&aba=4" target="_blank" className="text-xs font-bold text-blue-500 flex items-center gap-2 uppercase tracking-widest hover:gap-3 transition-all">
            CORREÇÃO MONETÁRIA <ExternalLink size={14} />
          </a>
        </div>

        <div className="p-8 border border-slate-800 bg-slate-900/10 rounded-2xl hover:border-blue-500/40 transition-all">
          <PieChart className="text-blue-500 mb-6" size={32} />
          <h3 className="text-white text-xl font-bold mb-3">Gestão de Portfólio</h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">Baixe o projeto de controle de ativos desenvolvido em Python com interface gráfica integrada.</p>
          <a href="/downloads/portfolio-management-v1.zip" download className="bg-blue-600/10 border border-blue-600/30 text-blue-500 px-4 py-2 rounded-lg text-xs font-black flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all">
            <Download size={14} /> DOWNLOAD PROJETO
          </a>
        </div>

      </section>

      {/* Footer Ajustado */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-900 flex justify-between items-center">
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
          2026 MAD MARCUS ALEKS DEVELOPERS - SYSTEM ARCHITECTURE
        </p>
        <span className="text-[10px] font-mono text-slate-800">FINTECH INTERFACE V2.0</span>
      </footer>
    </div>
  );
}
