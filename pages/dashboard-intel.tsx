import React from 'react';

export default function DashboardIntel() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="border-b border-red-900/30 pb-6 mb-10">
          <h1 className="text-3xl font-black text-red-500 tracking-tighter">CENTRO DE OPERAÇÕES DE INTELIGÊNCIA</h1>
          <p className="text-slate-500 font-mono text-sm mt-1 uppercase">Acesso Autorizado // Nível de Segurança: Alpha</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
            <h3 className="font-bold mb-4 text-slate-300 uppercase text-xs">Radar OSINT</h3>
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                <div className="h-4 bg-slate-800 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
