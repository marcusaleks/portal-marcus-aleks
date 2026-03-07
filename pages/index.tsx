import React from 'react';
import Link from 'next/link';
import { TrendingUp, Calculator, LineChart, PieChart, Lock, ExternalLink, BarChart3 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 font-sans selection:bg-blue-500/30">
      {/* Navbar Minimalista */}
      <nav className="border-b border-slate-800/50 bg-[#05070a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-blue-600 rounded shadow-lg shadow-blue-900/20 flex items-center justify-center font-bold text-white text-xs">MA</div>
            <span className="text-lg font-bold tracking-tighter text-white">MARCUS.ALEKS<span className="text-blue-500">.NOM.BR</span></span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-4 py-2 rounded text-xs font-bold hover:bg-red-950/20 hover:border-red-900/50 transition-all text-slate-400 hover:text-red-500">
              <Lock size={12} />
              ACESSO RESTRITO
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero: Terminal de Gestão */}
      <header className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest">
              Financial Portfolio Management
            </div>
            <h1 className="text-5xl md:text-6xl font-black leading-none text-white tracking-tighter">
              Estratégia e <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">Análise de Ativos</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-lg leading-relaxed">
              Plataforma consolidada para monitorização de renda fixa, variável e ferramentas de cálculo tributário para investidores institucionais e privados.
            </p>
          </div>
          
          {/* Widget Simulado de Mercado */}
          <div className="border border-slate-800 bg-slate-900/20 p-6 rounded-xl backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <LineChart size={80} />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-mono text-slate-500">IBOVESPA</span>
                <span className="text-xs font-mono text-emerald-500 font-bold">+1.24%</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-mono text-slate-500">USD/BRL</span>
                <span className="text-xs font-mono text-red-500 font-bold">-0.45%</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-mono text-slate-500">SELIC (META)</span>
                <span className="text-xs font-mono text-blue-500 font-bold">10.75%</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Grid de Ferramentas */}
      <section className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-6">
        
        {/* Card 1: Tesouro Direto */}
        <div className="p-6 border border-slate-800 bg-slate-900/10 rounded-xl hover:border-blue-500/40 transition-all group">
          <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded flex items-center justify-center mb-4">
            <BarChart3 size={20} />
          </div>
          <h3 className="text-white font-bold mb-2">Tesouro Direto</h3>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">Acompanhamento de taxas e preços dos títulos públicos atualizados via Secretaria do Tesouro Nacional.</p>
          <a href="https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm" target="_blank" className="text-[10px] font-bold text-blue-500 flex items-center gap-1 hover:underline">
            CONSULTAR TAXAS <ExternalLink size={10} />
          </a>
        </div>

        {/* Card 2: Calculadora do Cidadão */}
        <div className="p-6 border border-slate-800 bg-slate-900/10 rounded-xl hover:border-blue-500/40 transition-all">
          <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded flex items-center justify-center mb-4">
            <Calculator size={20} />
          </div>
          <h3 className="text-white font-bold mb-2">Cálculo Financeiro</h3>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">Acesso às calculadoras do Banco Central para correção de valores, juros compostos e inflação.</p>
          <a href="https://www3.bcb.gov.br/CALCID/publico/exibirFormCorrecaoValores.do?method=exibirFormCorrecaoValores" target="_blank" className="text-[10px] font-bold text-blue-500 flex items-center gap-1 hover:underline">
            CORREÇÃO MONETÁRIA <ExternalLink size={10} />
          </a>
        </div>

        {/* Card 3: Gestão de Portfólio */}
        <div className="p-6 border border-slate-800 bg-slate-900/10 rounded-xl hover:border-blue-500/40 transition-all">
          <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded flex items-center justify-center mb-4">
            <PieChart size={20} />
          </div>
          <h3 className="text-white font-bold mb-2">Gestão de Portfólio</h3>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">Módulo de integração para análise de custódia e balanceamento de carteira automatizado.</p>
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Módulo em Desenvolvimento</span>
        </div>

      </section>

      {/* Footer Profissional */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-900 text-[10px] font-mono text-slate-600 flex justify-between uppercase tracking-widest">
        <p>© 2026 Marcus Aleks - Systems Architecture</p>
        <p>FinTech Interface v2.0</p>
      </footer>
    </div>
  );
}
