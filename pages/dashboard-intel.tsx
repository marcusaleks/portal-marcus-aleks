import React, { useEffect, useState } from 'react';
import { Shield, TrendingUp, Globe, ExternalLink, Clock } from 'lucide-react';

export default function DashboardIntel() {
  const [news, setNews] = useState({ finance: [], intel: [] });

  useEffect(() => {
    const carregarNoticias = async () => {
      try {
        // O timestamp (?t=...) no final impede que o navegador use o cache antigo
        const timestamp = new Date().getTime();
        const response = await fetch(`/data/news.json?t=${timestamp}`);
        const response = await fetch(`/data/news.json?nocache=${new Date().getTime()}`);
        
        if (!response.ok) throw new Error('Falha ao carregar arquivo');
        
        const data = await response.json();
        console.log("Dados recebidos:", data);
        setNews(data);
      } catch (err) {
        console.error("Erro na sincronização:", err);
      }
    };

    carregarNoticias();
    // Tenta atualizar novamente a cada 5 minutos enquanto a aba estiver aberta
    const interval = setInterval(carregarNoticias, 300000);
    return () => clearInterval(interval);
  }, []);

  const NewsCard = ({ item, color }) => (
    <div className={`p-5 bg-slate-900 border-l-4 ${color} border-slate-800 rounded-r-xl mb-4 hover:bg-slate-800/50 transition-all`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
          <Clock size={10} /> {item.date}
        </span>
        <a href={item.link} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white">
          <ExternalLink size={14} />
        </a>
      </div>
      <h3 className="font-bold text-slate-200 text-sm leading-tight mb-2">{item.title}</h3>
      <p className="text-xs text-slate-400 leading-relaxed">{item.summary}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-red-900/30 pb-8 mb-12 gap-4">
          <div>
            <h1 className="text-4xl font-black text-red-600 tracking-tighter uppercase italic">Operações de Inteligência</h1>
            <p className="text-slate-500 font-mono text-xs mt-1 uppercase tracking-widest">Acesso Autorizado // marcus.aleks.nom.br</p>
          </div>
          <div className="flex gap-4">
             <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded text-center">
                <p className="text-[10px] text-slate-500 uppercase">Nível de Risco</p>
                <p className="text-sm font-bold text-emerald-500 uppercase italic">Baixo</p>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Coluna de Inteligência / OSINT */}
          <section>
            <div className="flex items-center gap-2 mb-6 text-red-500">
              <Shield size={20} />
              <h2 className="text-xl font-bold uppercase tracking-wider">Radar Intel & Compliance</h2>
            </div>
            {news.intel.length > 0 ? (
              news.intel.map((item, i) => <NewsCard key={i} item={item} color="border-red-600" />)
            ) : (
              <p className="text-slate-600 italic text-sm">Sincronizando com bases internacionais...</p>
            )}
          </section>

          {/* Coluna Financeira Estratégica */}
          <section>
            <div className="flex items-center gap-2 mb-6 text-blue-500">
              <TrendingUp size={20} />
              <h2 className="text-xl font-bold uppercase tracking-wider">Inteligência Financeira</h2>
            </div>
            {news.finance.length > 0 ? (
              news.finance.map((item, i) => <NewsCard key={i} item={item} color="border-blue-600" />)
            ) : (
              <p className="text-slate-600 italic text-sm">Aguardando dados da B3/Reuters...</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
