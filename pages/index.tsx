import React from 'react';
import Link from 'next/link';
import { TrendingUp, ShieldAlert, Calculator, BookOpen, Lock, Globe } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      {/* Barra de Navegação Superior */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white">M</div>
            <span className="text-xl font-bold tracking-tight">MARCUS.ALEKS<span className="text-blue-500">.NOM.BR</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-wider">
            <a href="#financeiro" className="hover:text-blue-400 transition">Finanças</a>
            <a href="#ferramentas" className="hover:text-blue-400 transition">Ferramentas</a>
            <Link href="/login" className="flex items-center gap-2 bg-red-950/40 border border-red-500/50 px-4 py-2 rounded-md hover:bg-red-600 hover:text-white transition">
              <Lock size={14} />
              Acesso Restrito
            </Link>
          </div>
        </div>
      </nav>

      {/* Seção Hero / Boas-vindas */}
      <header className="max-w-7xl mx-auto px-6 py-20 text-center md:text-left">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-black leading-tight text-white">
              Sistemas de <br />
              <span className="text-blue-500 underline decoration-slate-700">Inteligência Estratégica</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl">
              Portal integrado de monitoramento B3, Tesouro Direto e ferramentas avançadas para investigações financeiras e tributárias.
            </p>
          </div>
          <div className="hidden md:block relative">
             <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full"></div>
             <div className="relative border border-slate-800 bg-slate-900/40 p-8 rounded-2xl backdrop-blur-sm">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-mono text-slate-500 uppercase">Status do Sistema</span>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                </div>
                <div className="space-y-4">
                  <div className="h-2 w-full bg-slate-800 rounded"></div>
                  <div className="h-2 w-3/4 bg-slate-800 rounded"></div>
                  <div className="h-2 w-1/2 bg-slate-800 rounded"></div>
                </div>
             </div>
          </div>
        </div>
      </header>

      <hr className="border-slate-900" />

      {/* Seleção de Ramos */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-8">
        
        {/* Ramo Financeiro */}
        <div id="financeiro" className="group p-8 border border-slate-800 bg-slate-900/20 rounded-3xl hover:border-blue-500/50 transition-all">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors">
            <TrendingUp size={24} />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-white">Terminal Financeiro</h2>
          <ul className="space-y-3 text-slate-400">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Cotações B3 em tempo real</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Preços e Taxas do Tesouro Direto</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Calculadora do Cidadão (BC)</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Notícias para Investidores</li>
          </ul>
        </div>

        {/* Ramo Inteligência */}
        <div className="group p-8 border border-slate-800 bg-slate-900/20 rounded-3xl hover:border-red-500/50 transition-all">
          <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-500 group-hover:text-white transition-colors">
            <ShieldAlert size={24} />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-white">Hub de Inteligência</h2>
          <ul className="space-y-3 text-slate-400">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> Rastreio de Ativos e Bens</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> Ferramentas OSINT Avançadas</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> Monitoramento Tributário</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> Acesso Restrito via Credenciais</li>
          </ul>
        </div>

      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-900 text-slate-600 text-sm flex justify-between">
        <p>© 2026 MARCUS.ALEKS - Todos os direitos reservados.</p>
        <p className="font-mono">Security Level: High</p>
      </footer>
    </div>
  );
}
