import React, { useState, useEffect } from 'react';
import { Shield, Activity, TrendingUp, AlertTriangle } from 'lucide-react';

export default function DashboardIntel() {
  const [news, setNews] = useState({ finance: [], intel: [] });

  useEffect(() => {
    const carregarData = async () => {
      try {
        const response = await fetch(`/data/news.json?t=${new Date().getTime()}`);
        if (!response.ok) throw new Error();
        const data = await response.json();
        setNews(data);
      } catch (err) {
        console.error("Falha na sincronização de inteligência");
      }
    };
    carregarData();
  }, []);

  return (
    <div className="min-h-screen bg-[#020408] text-slate-400 p-8 font-sans">
       <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center border-b border-red-900/30 pb-6 mb-12">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600 rounded flex items-center justify-center text-white"><Shield size={24}/></div>
                <div>
                   <h1 className="text-white font-black text-2xl uppercase tracking-tighter">Intelligence Operations</h1>
                   <p className="text-[10px] text-red-600 font-mono uppercase tracking-[0.4em] mt-1">RESTRICTED ACCESS // LEVEL 5</p>
                </div>
             </div>
             <div className="text-right hidden md:block"><span className="text-[10px] font-mono text-slate-600 uppercase">System Time</span><p className="text-white font-bold text-sm">{new Date().toLocaleTimeString()}</p></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
             <section className="space-y-6">
                <h2 className="text-blue-500 font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-xs border-b border-blue-900/20 pb-2"><Activity size={18}/> Market Radar</h2>
                {news.finance.length > 0 ? news.finance.map((item, i) => (
                   <div key={i} className="p-5 border border-slate-800 bg-slate-900/20 rounded-lg hover:border-blue-500/40 transition-all">
                      <span className="text-[9px] font-mono text-blue-600 font-bold uppercase">{item.date}</span>
                      <h3 className="text-white font-bold text-sm mt-1 mb-2 leading-tight">{item.title}</h3>
                      <p className="text-[11px] leading-relaxed text-slate-500 mb-3">{item.summary}</p>
                      <a href={item.link} target="_blank" className="text-blue-500 text-[9px] font-black uppercase hover:underline">Open Source</a>
                   </div>
                )) : <div className="text-xs font-mono animate-pulse uppercase tracking-widest text-slate-600">Awaiting data uplink...</div>}
             </section>

             <section className="space-y-6">
                <h2 className="text-red-600 font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-xs border-b border-red-900/20 pb-2"><AlertTriangle size={18}/> Cyber Intel</h2>
                {news.intel.length > 0 ? news.intel.map((item, i) => (
                   <div key={i} className="p-5 border border-slate-800 bg-red-900/5 rounded-lg hover:border-red-600/40 transition-all">
                      <span className="text-[9px] font-mono text-red-600 font-bold uppercase">{item.date}</span>
                      <h3 className="text-white font-bold text-sm mt-1 mb-2 leading-tight">{item.title}</h3>
                      <p className="text-[11px] leading-relaxed text-slate-500 mb-3">{item.summary}</p>
                      <a href={item.link} target="_blank" className="text-red-600 text-[9px] font-black uppercase hover:underline tracking-widest">Analyze Threat</a>
                   </div>
                )) : <div className="text-xs font-mono animate-pulse uppercase tracking-widest text-slate-600">Scanning network...</div>}
             </section>
          </div>
       </div>
    </div>
  );
}
