import React from 'react';
import Link from 'next/link';
import { TrendingUp, Calculator, PieChart, Lock, ExternalLink, BarChart3, ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 font-sans selection:bg-blue-500/30">
      {/* Navbar Executiva */}
      <nav className="border-b border-slate-800/50 bg-[#05070a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded shadow-lg shadow-blue-900/40 flex items-center justify-center font-bold text-white text-xs">MA</div>
            <span className="text-xl font-bold tracking-tighter text-white">MARCUS.ALEKS<span className="text-blue-500">.NOM.BR</span></span>
          </div>
          <Link href="/login" className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-4 py-2 rounded text-xs font-bold hover:bg-slate-800 transition-all text-slate-400 hover:text-white">
            <Lock size={12} />
            ACESSO RESTRITO
          </Link>
        </div>
      </nav>

      {/* Hero: Engenharia de Portfólio */}
      <header className="max-w-7xl mx-auto px-6 py-20 border-b border-slate-900/50">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest">
            Portfolio Architecture & Risk Analysis
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-tight text-white tracking-tighter">
            Sistemas de <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">Gestão de Ativos</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
            Soluções customizadas para análise de custódia, monitoramento de renda fixa e ferramentas automatizadas de cálculo tributário para investidores.
          </p>
        </div>
      </header>

      {/* Grid de Ferramentas Financeiras */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Card: Mercado em Tempo Real */}
          <div className="md:col-span-2 p-8 border border-slate-800 bg-slate-900/10 rounded-2xl relative overflow-hidden">
             <div className="flex justify-between items-start mb-8">
                <div>
                   <h3 className="text-white text-xl font-bold tracking-tight">Monitoramento B3</h3>
                   <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Principais Índices e Cotações</p>
                </div>
                <TrendingUp className="text-emerald-500" size={24} />
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'IBOVESPA', val: '128.450', change: '+1.12%', color: 'text-emerald-500' },
                  { label: 'DÓLAR (P)', val: '4,98', change: '-0.32%', color: 'text-red-500' },
                  { label: 'IFIX', val: '3.342', change: '+0.05%', color: 'text-emerald-500' },
                  { label: 'SELIC', val: '10,75%', change: 'STABLE', color: 'text-blue-500' }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-950/50 border border-slate-800 rounded-lg">
                    <p className="text-[10px] text-slate-500 mb-1">{item.label}</p>
                    <p className="text-lg font-bold text-white tracking-tight">{item.val}</p>
                    <p className={`text-[10px] font-mono ${item.color}`}>{item.change}</p>
                  </div>
                ))}
             </div>
          </div>

          {/* Card: Tesouro Direto */}
          <div className="p-8 border border-slate-800 bg-slate-900/10 rounded-2xl hover:border-blue-500/40 transition-all group">
            <BarChart3 className="text-blue-500 mb-6" size={32} />
            <h3 className="text-white text-xl font-bold mb-3">Tesouro Direto</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">Acompanhamento oficial de taxas e preços atualizados pela Secretaria do Tesouro Nacional.</p>
            <a href="https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm" target="_blank" className="text-xs font-bold text-blue-500 flex items-center gap-2 uppercase tracking-widest hover:gap-3 transition-all">
              Consultar Taxas <ArrowUpRight size={14} />
            </a>
          </div>

          {/* Card: Calculadora do Cidadão */}
          <div className="p-8 border border-slate-800 bg-slate-900/10 rounded-2xl hover:border-blue-500/40 transition-all">
            <Calculator className="text-blue-500 mb-6" size={32} />
            <h3 className="text-white text-xl font-bold mb-3">Cálculo Financeiro</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">Correção monetária e simuladores de juros compostos integrados ao Banco Central.</p>
            <a href="https://www3.bcb.gov.br/CALCID/publico/exibirFormCorrecaoValores.do?method=exibirFormCorrecaoValores" target="_blank" className="text-xs font-bold text-blue-500 flex items-center gap-2 uppercase tracking-widest hover:gap-3 transition-all">
              Acessar Simulação <ExternalLink size={14} />
            </a>
          </div>

          {/* Card: Gestão de Portfólio (Python Core) */}
          <div className="p-8 border border-slate-800 bg-slate-900/10 rounded-2xl hover:border-blue-500/40 transition-all">
            <PieChart className="text-blue-500 mb-6" size={32} />
            <h3 className="text-white text-xl font-bold mb-3">Portfolio Engine</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">Módulo em Python para otimização de carteira e rebalanceamento dinâmico de ativos.</p>
            <span className="text-[10px] font-bold text-slate-600 border border-slate-800 px-2 py-1 rounded">ESTÁGIO: BETA TESTING</span>
          </div>

        </div>
      </section>

      {/* Footer Profissional */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-900/50 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">© 2026 Marcus Aleks // Senior Software Architect</p>
        <div className="flex gap-4">
           <span className="flex items-center gap-1 text-[10px] text-slate-600 uppercase tracking-widest">
              <ShieldCheck size={12} className="text-emerald-500" /> System Verified
           </span>
        </div>
      </footer>
    </div>
  );
}
