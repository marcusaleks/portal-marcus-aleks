import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Shield, Activity, TrendingUp, AlertTriangle, 
  Search, ExternalLink, Globe, Database, Fingerprint, Terminal,
  LogOut, Zap
} from 'lucide-react';

export default function DashboardIntel() {
  const router = useRouter();
  const [intelStream, setIntelStream] = useState({ finance: [], intel: [] });
  const [osintQuery, setOsintQuery] = useState('');

  useEffect(() => {
    const fetchIntel = async () => {
      try {
        const response = await fetch(`/data/news.json?t=${new Date().getTime()}`);
        if (response.ok) {
          const data = await response.json();
          setIntelStream(data);
        }
      } catch (err) { console.error("Link de dados offline."); }
    };
    fetchIntel();
  }, []);

  const handleOSINT = (e: React.FormEvent) => {
    e.preventDefault();
    if (!osintQuery) return;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(osintQuery)}`, '_blank');
  };

  // 1. Lógica de Logout Convencional
  const handleLogout = () => {
    // Aqui você pode limpar o cookie específico de auth se houver
    router.push('/');
  };

  // 2. Lógica de Kill Switch (Botão de Pânico)
  const handleKillSwitch = () => {
    localStorage.clear();
    sessionStorage.clear();
    // Força o redirecionamento imediato para a main page
    window.location.href = '/';
  };

  const services = [
    { name: "Alerta Brasil", url: "https://www.gov.br/prf/pt-br/servicos/alerta-brasil", desc: "Consultas PRF" },
    { name: "Pandora", url: "https://pandora.com", desc: "Análise de Dados" },
    { name: "CENSEC", url: "https://censec.org.br", desc: "Escrituras e Procurações" },
    { name: "Córtex", url: "https://cortex.mj.gov.br", desc: "Inteligência MJSP" },
    { name: "SEFAZ RS", url: "https://rpe-portal.sefaz.rs.gov.br/apl/index.html", desc: "Portal de Autorização" },
    { name: "SINTEGRA", url: "http://www.sintegra.gov.br/", desc: "Informações Fiscais" }
  ];

  return (
    <div className="min-h-screen bg-[#020408] text-slate-400 p-8 font-sans selection:bg-red-500/30">
       <div className="max-w-7xl mx-auto">
          
          {/* Header Operacional com Logout e Kill Switch */}
          <div className="flex justify-between items-center border-b border-red-900/30 pb-6 mb-12">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600 rounded flex items-center justify-center text-white shadow-lg shadow-red-900/40 border border-red-500/20">
                   <Shield size={24}/>
                </div>
                <div>
                   <h1 className="text-white font-black text-2xl uppercase tracking-tighter">Intelligence Ops</h1>
                   <p className="text-[10px] text-red-600 font-mono uppercase tracking-[0.4em] mt-1 font-bold">Restricted Access // Level 5</p>
                </div>
             </div>
             
             <div className="flex items-center gap-6">
                <div className="text-right hidden md:block">
                   <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">Operation Time</span>
                   <p className="text-white font-bold text-sm font-mono tracking-widest">{new Date().toLocaleTimeString()}</p>
                </div>
                
                {/* Botões de Controle */}
                <div className="flex gap-2">
                   <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-4 py-2 rounded text-[10px] font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all uppercase tracking-widest"
                   >
                      <LogOut size={14} /> Sair
                   </button>
                   <button 
                      onClick={handleKillSwitch}
                      className="flex items-center gap-2 bg-red-900/20 border border-red-900/50 px-4 py-2 rounded text-[10px] font-black text-red-500 hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest shadow-lg shadow-red-900/20"
                      title="KILL SWITCH: Limpar cache e sair"
                   >
                      <Zap size={14} /> Pânico
                   </button>
                </div>
             </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
             {/* COLUNA ESQUERDA: OSINT & SERVIÇOS */}
             <div className="lg:col-span-1 space-y-8">
                <section className="bg-slate-900/20 border border-slate-800 p-6 rounded-xl">
                   <h2 className="text-blue-500 font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                      <Search size={14}/> OSINT SEARCH MODULE
                   </h2>
                   <form onSubmit={handleOSINT} className="space-y-3">
                      <input 
                         type="text" 
                         className="w-full bg-black border border-slate-800 rounded px-3 py-2 text-xs text-white font-mono focus:border-blue-500 outline-none transition-all"
                         placeholder="Target name, IP or Dork..."
                         value={osintQuery}
                         onChange={(e) => setOsintQuery(e.target.value)}
                      />
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all font-bold">
                         Executar Scan
                      </button>
                   </form>
                </section>

                <section className="bg-slate-900/20 border border-slate-800 p-6 rounded-xl">
                   <h2 className="text-red-600 font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-[10px] font-bold">
                      <Globe size={14}/> INTELLIGENCE ASSETS
                   </h2>
                   <div className="grid grid-cols-1 gap-2">
                      {services.map((s, i) => (
                         <a key={i} href={s.url} target="_blank" className="flex items-center justify-between p-3 border border-slate-800/50 bg-black/40 rounded hover:border-red-600/30 group transition-all">
                            <div>
                               <p className="text-[10px] font-black text-white group-hover:text-red-500">{s.name}</p>
                               <p className="text-[8px] text-slate-600 uppercase font-bold">{s.desc}</p>
                            </div>
                            <ExternalLink size={12} className="text-slate-700 group-hover:text-red-500" />
                         </a>
                      ))}
                   </div>
                </section>
             </div>

             {/* COLUNA DIREITA: FEEDS */}
             <div className="lg:col-span-2 space-y-8">
                <section>
                   <h2 className="text-blue-500 font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-[10px] border-b border-blue-900/20 pb-2 font-bold">
                      <Activity size={14}/> MARKET RADAR
                   </h2>
                   <div className="grid md:grid-cols-2 gap-4">
                      {intelStream.finance.slice(0, 6).map((item, i) => (
                         <div key={i} className="p-4 border border-slate-800 bg-slate-900/10 rounded-lg hover:border-blue-500/40 transition-all">
                            <h3 className="text-white font-bold text-[11px] leading-tight mb-2">{item.title}</h3>
                            <a href={item.link} target="_blank" className="text-blue-500 text-[9px] font-black uppercase hover:underline">Open Source Analysis</a>
                         </div>
                      ))}
                   </div>
                </section>

                <section>
                   <h2 className="text-red-600 font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-[10px] border-b border-red-900/20 pb-2 font-bold">
                      <AlertTriangle size={14}/> CYBER INTEL FEED
                   </h2>
                   <div className="grid md:grid-cols-2 gap-4">
                      {intelStream.intel.slice(0, 6).map((item, i) => (
                         <div key={i} className="p-4 border border-slate-800 bg-red-900/5 rounded-lg hover:border-red-600/40 transition-all">
                            <h3 className="text-white font-bold text-[11px] leading-tight mb-2">{item.title}</h3>
                            <a href={item.link} target="_blank" className="text-red-600 text-[9px] font-black uppercase hover:underline">Analyze Threat</a>
                         </div>
                      ))}
                   </div>
                </section>
             </div>
          </div>
       </div>

       {/* System Log Footer */}
       <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-900 flex justify-between items-center text-[9px] font-mono text-slate-600 font-bold">
          <div className="flex gap-4">
             <span className="flex items-center gap-1 uppercase"><Fingerprint size={10}/> Auth: Verified</span>
             <span className="flex items-center gap-1 uppercase"><Terminal size={10}/> Status: Encryption Active</span>
          </div>
          <span className="uppercase tracking-widest">© 2026 MAD - Intel Ops Unit</span>
       </div>
    </div>
  );
}
