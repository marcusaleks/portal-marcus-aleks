import React, { useState, useEffect } from 'react';
import { Shield, Activity, TrendingUp, AlertTriangle } from 'lucide-react';

export default function DashboardIntel() {
  const [intelStream, setIntelStream] = useState({ finance: [], intel: [] });

  useEffect(() => {
    const uplinkIntel = async () => {
      try {
        const netResponse = await fetch(`/data/news.json?t=${new Date().getTime()}`);
        if (!netResponse.ok) throw new Error();
        const jsonPayload = await netResponse.json();
        setIntelStream(jsonPayload);
      } catch (err) { console.error("Falha no uplink"); }
    };
    uplinkIntel();
  }, []);

  return (
    <div className="min-h-screen bg-[#020408] text-slate-400 p-8 font-sans font-bold">
       <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center border-b border-red-900/30 pb-6 mb-12">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600 rounded flex items-center justify-center text-white shadow-lg"><Shield size={24}/></div>
                <div><h1 className="text-white font-black text-2xl uppercase tracking-tighter leading-none">Intelligence Ops</h1><p className="text-[10px] text-red-600 font-mono uppercase tracking-[0.4em] mt-1 font-bold">Restricted Access Level 5</p></div>
             </div>
             <div className="text-right hidden md:block"><p className="text-white text-sm font-bold tracking-widest">{new Date().toLocaleTimeString()}</p></div>
          </div>
          <div className="grid md:grid-cols-2 gap-12 text-xs uppercase font-bold text-slate-600 tracking-widest">
             <section className="space-y-6">
                <h2 className="text-blue-500 flex items-center gap-2 border-b border-blue-900/20 pb-2"><Activity size={18}/> Market Radar</h2>
                {intelStream.finance.length > 0 ? intelStream.finance.map((item: any, i: number) => (
                   <div key={i} className="p-5 border border-slate-800 bg-slate-900/20 rounded-lg hover:border-blue-500/40 transition-all font-bold"><h3 className="text-white mb-2">{item.title}</h3><a href={item.link} target="_blank" className="text-blue-500 text-[9px] hover:underline font-bold uppercase tracking-widest">Open Source Analysis</a></div>
                )) : <div className="animate-pulse">Awaiting data uplink...</div>}
             </section>
             <section className="space-y-6">
                <h2 className="text-red-600 flex items-center gap-2 border-b border-red-900/20 pb-2"><AlertTriangle size={18}/> Cyber Intel Feed</h2>
                {intelStream.intel.length > 0 ? intelStream.intel.map((item: any, i: number) => (
                   <div key={i} className="p-5 border border-slate-800 bg-red-900/5 rounded-lg hover:border-red-600/40 transition-all font-bold"><h3 className="text-white mb-2">{item.title}</h3><a href={item.link} target="_blank" className="text-red-600 text-[9px] hover:underline font-bold uppercase tracking-widest">Analyze Threat Pattern</a></div>
                )) : <div className="animate-pulse">Scanning network...</div>}
             </section>
          </div>
       </div>
    </div>
  );
}
