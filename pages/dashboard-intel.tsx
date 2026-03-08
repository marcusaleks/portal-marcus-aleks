import React, { useState, useEffect } from 'react';
import { Shield, Activity, TrendingUp, AlertTriangle } from 'lucide-react';

export default function DashboardIntel() {
  const [intelData, setIntelData] = useState({ finance: [], intel: [] });

  useEffect(() => {
    const uplinkIntel = async () => {
      try {
        // Nomes de variáveis alterados para evitar conflito de redeclaração
        const fetchResponse = await fetch(`/data/news.json?t=${new Date().getTime()}`);
        if (!fetchResponse.ok) throw new Error();
        const payload = await fetchResponse.json();
        setIntelData(payload);
      } catch (err) { console.error("Falha no uplink de inteligência."); }
    };
    uplinkIntel();
  }, []);

  return (
    <div className="min-h-screen bg-[#020408] text-slate-400 p-8 font-sans font-bold">
       <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center border-b border-red-900/30 pb-6 mb-12">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600 rounded flex items-center justify-center text-white shadow-lg shadow-red-900/40"><Shield size={24}/></div>
                <div><h1 className="text-white font-black text-2xl uppercase tracking-tighter">Intelligence Ops</h1><p className="text-[10px] text-red-600 font-mono uppercase tracking-[0.4em] mt-1">Restricted Access Level 5</p></div>
             </div>
             <div className="text-right hidden md:block"><p className="text-white font-bold text-sm tracking-widest">{new Date().toLocaleTimeString()}</p></div>
          </div>
          <div className="grid md:grid-cols-2 gap-12 text-xs uppercase font-bold text-slate-600 tracking-widest">
             <section className="space-y-6">
                <h2 className="text-blue-500 flex items-center gap-2 border-b border-blue-900/20 pb-2"><Activity size={18}/> Market Radar</h2>
                {intelData.finance.length > 0 ? intelData.finance.map((item: any, i: number) => (
                   <div key={i} className="p-5 border border-slate-800 bg-slate-900/20 rounded-lg hover:border-blue-500/40 transition-all"><h3 className="text-white mb-2">{item.title}</h3><a href={item.link} target="_blank" className="text-blue-500 text-[9px] hover:underline uppercase tracking-widest">Open Source</a></div>
                )) : <div className="animate-pulse">Awaiting data uplink...</div>}
             </section>
             <section className="space-y-6">
                <h2 className="text-red-600 flex items-center gap-2 border-b border-red-900/20 pb-2"><AlertTriangle size={18}/> Cyber Intel</h2>
                {intelData.intel.length > 0 ? intelData.intel.map((item: any, i: number) => (
                   <div key={i} className="p-5 border border-slate-800 bg-red-900/5 rounded-lg hover:border-red-600/40 transition-all font-bold"><h3 className="text-white mb-2">{item.title}</h3><a href={item.link} target="_blank" className="text-red-600 text-[9px] hover:underline uppercase tracking-widest">Analyze Threat</a></div>
                )) : <div className="animate-pulse">Scanning network vulnerabilities...</div>}
             </section>
          </div>
       </div>
    </div>
  );
}
