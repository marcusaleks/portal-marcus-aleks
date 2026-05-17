import React from 'react';
import Link from 'next/link';

export default function FerramentasCard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 p-2 font-mono">
      
      {/* 1. Calculadora de Fluxo Indexado */}
      <div className="bg-white dark:bg-slate-900 border border-[#004ac6]/22 dark:border-slate-800 rounded-lg p-4.5 flex flex-col justify-between gap-3.5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#004ac6]"></div>
        <div className="flex items-start justify-between">
          <span className="text-[9px] font-bold text-[#004ac6] bg-[#004ac6]/08 border border-[#004ac6]/22 px-2 py-0.5 rounded uppercase tracking-wider">
            MAD Tool
          </span>
          <span className="text-[9px] text-[#6a8db0] dark:text-slate-500 font-bold uppercase">
            Interno
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#e4eefb] dark:bg-slate-800 border border-[#004ac6]/20 flex items-center justify-center font-bold text-base text-[#004ac6] dark:text-blue-400 shrink-0 select-none">
            ⟨∑⟩
          </div>
          <div>
            <div className="text-xs font-bold text-[#04101e] dark:text-slate-200 leading-tight">Calculadora de Fluxo Indexado</div>
            <div className="text-[9px] text-[#294c72] dark:text-slate-400 font-semibold mt-0.5">SELIC · IPCA · PTAX</div>
          </div>
        </div>
        <p className="text-[10px] text-[#294c72] dark:text-slate-400 leading-relaxed flex-1">
          Compare a evolução do mesmo capital corrigido por SELIC, IPCA e PTAX. Suporta múltiplos aportes e resgates com capitalização individualizada.
        </p>
        <div className="flex items-center gap-1.5 text-[9px] text-[#6a8db0] dark:text-slate-500 font-bold uppercase">
          <span className="w-1 h-1 rounded-full bg-[#6a8db0] shrink-0"></span>
          <span>Taxas do dia pré-carregadas</span>
        </div>
        <Link 
          href="/calculadora"
          className="flex items-center justify-between bg-[#e4eefb] dark:bg-slate-800/60 border border-[#004ac6]/25 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs font-bold text-[#004ac6] dark:text-blue-400 hover:bg-[#004ac6]/10 transition-all select-none mt-2"
        >
          <span>Abrir calculadora</span>
          <span>→</span>
        </Link>
      </div>

      {/* 2. Portfolio Manager */}
      <div className="bg-white dark:bg-slate-900 border border-[#004ac6]/22 dark:border-slate-800 rounded-lg p-4.5 flex flex-col justify-between gap-3.5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#004ac6]"></div>
        <div className="flex items-start justify-between">
          <span className="text-[9px] font-bold text-[#004ac6] bg-[#004ac6]/08 border border-[#004ac6]/22 px-2 py-0.5 rounded uppercase tracking-wider">
            MAD Engine
          </span>
          <span className="text-[9px] text-emerald-600 dark:text-emerald-500 font-bold uppercase flex items-center gap-1">
            ● v0.0.1
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#e4eefb] dark:bg-slate-800 border border-[#004ac6]/20 flex items-center justify-center font-bold text-xs text-[#004ac6] dark:text-blue-400 shrink-0 select-none">
            Py
          </div>
          <div>
            <div className="text-xs font-bold text-[#04101e] dark:text-slate-200 leading-tight">Portfolio Manager</div>
            <div className="text-[9px] text-[#294c72] dark:text-slate-400 font-semibold mt-0.5">Engine quantitativa · Python</div>
          </div>
        </div>
        <p className="text-[10px] text-[#294c72] dark:text-slate-400 leading-relaxed flex-1">
          Engine quantitativa local para gestão de carteiras. Análise de ações, FIIs e renda fixa com conformidade ao IR brasileiro e cálculo de DARF.
        </p>
        <div className="flex items-center gap-1.5 text-[9px] text-[#6a8db0] dark:text-slate-500 font-bold uppercase">
          <span className="w-1 h-1 rounded-full bg-[#6a8db0] shrink-0"></span>
          <span>Uso local · Windows / macOS / Linux</span>
        </div>
        <a 
          href="https://github.com/marcusaleks/Portfolio_Manager/releases/download/v0.0.1/PortfolioManager_v0.0.1.zip" 
          download="PortfolioManager_v0.0.1.zip"
          className="flex items-center justify-between bg-[#e4eefb] dark:bg-slate-800/60 border border-[#004ac6]/25 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs font-bold text-[#004ac6] dark:text-blue-400 hover:bg-[#004ac6]/10 transition-all select-none mt-2"
        >
          <span>Download v0.0.1</span>
          <span>↓</span>
        </a>
      </div>

      {/* 3. Tesouro Direto */}
      <div className="bg-white dark:bg-slate-900 border border-[#004ac6]/22 dark:border-slate-800 rounded-lg p-4.5 flex flex-col justify-between gap-3.5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#004ac6]"></div>
        <div className="flex items-start justify-between">
          <span className="text-[9px] font-bold text-[#6a8db0] bg-[#6a8db0]/08 border border-[#6a8db0]/22 px-2 py-0.5 rounded uppercase tracking-wider">
            Externo
          </span>
          <span className="text-[9px] text-[#6a8db0] dark:text-slate-500 font-bold uppercase">
            Tesouro Nacional
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#e4eefb] dark:bg-slate-800 border border-[#004ac6]/20 flex items-center justify-center font-bold text-xs text-[#294c72] dark:text-slate-300 shrink-0 select-none">
            TD
          </div>
          <div>
            <div className="text-xs font-bold text-[#04101e] dark:text-slate-200 leading-tight">Tesouro Direto</div>
            <div className="text-[9px] text-[#294c72] dark:text-slate-400 font-semibold mt-0.5">Preços e taxas oficiais</div>
          </div>
        </div>
        <p className="text-[10px] text-[#294c72] dark:text-slate-400 leading-relaxed flex-1">
          Preços e taxas de todos os títulos do Tesouro Nacional em tempo real. Selic, IPCA+, Prefixado e variações com vencimento e rentabilidade.
        </p>
        <div className="flex items-center gap-1.5 text-[9px] text-[#6a8db0] dark:text-slate-500 font-bold uppercase">
          <span className="w-1 h-1 rounded-full bg-[#6a8db0] shrink-0"></span>
          <span>tesourodireto.com.br · dados oficiais</span>
        </div>
        <a 
          href="https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-between bg-[#e4eefb] dark:bg-slate-800/60 border border-[#004ac6]/25 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs font-bold text-[#004ac6] dark:text-blue-400 hover:bg-[#004ac6]/10 transition-all select-none mt-2"
        >
          <span>Ver preços e taxas</span>
          <span className="text-[#6a8db0] dark:text-slate-500">↗</span>
        </a>
      </div>

    </div>
  );
}
