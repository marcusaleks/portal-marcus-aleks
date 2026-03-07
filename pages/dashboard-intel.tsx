import React, { useState, useEffect } from 'react';
import { Shield, Activity, TrendingUp, AlertTriangle } from 'lucide-react';

export default function DashboardIntel() {
  const [news, setNews] = useState({ finance: [], intel: [] });

  useEffect(() => {
    const carregarData = async () => {
      try {
        // Correção: Apenas uma declaração de 'response' com timestamp para evitar cache
        const response = await fetch(`/data/news.json?t=${new Date().getTime()}`);
        if (!response.ok) throw new Error();
        const data = await response.json();
        setNews(data);
      } catch (err) {
        console.error("Erro na sincronização");
      }
    };
    carregarData();
  }, []);

  return (
    <div className="min-h-screen bg-[#020408] text-slate-400 p-8">
       {/* Layout do Dashboard permanece o mesmo, agora funcional */}
       <h1 className="text-red-600 font-black text-4xl mb-8 uppercase tracking-tighter">Operações de Inteligência</h1>
       <div className="grid md:grid-cols-2 gap-8">
          <section>
             <h2 className="text-blue-500 font-bold mb-4 flex items-center gap-2 uppercase tracking-widest"><Activity size={18}/> Radar de Notícias</h2>
             {news.intel.length > 0 ? (
                news.intel.map((item, i) => (
                   <div key={i} className="mb-4 p-4 border border-slate-800 bg-slate-900/20 rounded">
                      <h3 className="text-white font-bold text-sm mb-1">{item.title}</h3>
                      <p className="text-[10px] leading-relaxed mb-2">{item.summary}</p>
                      <a href={item.link} target="_blank" className="text-blue-500 text-[9px] font-bold uppercase hover:underline">Ver Fonte Original</a>
                   </div>
                ))
             ) : <p className="text-xs animate-pulse">Sincronizando base de dados...</p>}
          </section>
       </div>
    </div>
  );
}
