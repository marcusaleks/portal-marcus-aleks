import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Shield, Activity, AlertTriangle, Search, ExternalLink, Globe, 
  Database, Fingerprint, LogOut, Zap, Lock, BookOpen, 
  Gavel, FileText, LayoutDashboard, Copy, Check, Eye, UserSearch, 
  Newspaper, ShieldAlert, ArrowUpRight, Camera, Network, X
} from 'lucide-react';

export default function SifazDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState('briefing');
  const [showAtifBanner, setShowAtifBanner] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [osintQuery, setOsintQuery] = useState('');
  const [intelNews, setIntelNews] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('mad_access_token');
    if (!token) { router.push('/'); return; }
    
    setAuthorized(true);
    // Dispara o banner popup após autorização
    setShowAtifBanner(true);

    const fetchIntelData = async () => {
      try {
        const res = await fetch(`/data/news.json?t=${new Date().getTime()}`);
        if (res.ok) {
          const data = await res.json();
          setIntelNews(data.intel || []);
        }
      } catch (e) { console.error("Uplink Error"); }
    };
    fetchIntelData();
  }, [router]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!authorized) return <div className="min-h-screen bg-[#020408]" />;

  return (
    <div className="min-h-screen bg-[#020408] text-slate-400 font-sans selection:bg-blue-500/30">
      
      {/* BANNER POPUP ATIF [Protocolo de Saudação] */}
      {showAtifBanner && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-950 border-2 border-red-600 p-12 rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.3)] relative max-w-lg w-full text-center">
            <button onClick={() => setShowAtifBanner(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={24}/></button>
            <ShieldAlert size={64} className="text-red-600 mx-auto mb-6 animate-bounce" />
            <h2 className="text-white text-4xl font-black uppercase tracking-tighter mb-4 italic">AQUI É ATIF, PORRA!!!</h2>
            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.3em]">Operação Iniciada · Nível 5 Ativo</p>
            <button onClick={() => setShowAtifBanner(false)} className="mt-8 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase py-3 px-8 rounded-lg tracking-widest transition-all">Assumir Comando</button>
          </div>
        </div>
      )}

      {/* HEADER SIFAZ v.0.0.1 */}
      <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white shadow-lg border border-blue-500/20"><Shield size={20}/></div>
            <div>
              <h1 className="text-white font-black text-xl uppercase tracking-tighter">SIFAZ <span className="text-blue-500 text-xs ml-1 font-bold">v.0.0.1</span></h1>
              {/* SUBTÍTULO ALTERADO */}
              <p className="text-[9px] text-slate-500 font-mono uppercase tracking-[0.3em] font-bold">Sistema de Inteligência Fazendária</p>
            </div>
          </div>

          <nav className="flex gap-2">
            {[{ id: 'briefing', label: 'Briefing', icon: <Newspaper size={14}/> },
              { id: 'osint', label: 'Dorks & Recon', icon: <Search size={14}/> },
              { id: 'legislacao', label: 'Legislação', icon: <Gavel size={14}/> }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}>
                {tab.icon} {tab.label}
              </button>
            ))}
            <button onClick={() => window.location.href = '/'} className="p-2 text-red-600 hover:text-red-400 ml-4 transition-colors"><Zap size={18}/></button>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {/* ABA BRIEFING: MÓDULOS DE INFRAESTRUTURA */}
        {activeTab === 'briefing' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="grid lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                     <ShieldAlert className="text-red-600" size={20} />
                     <h2 className="text-white font-black text-lg uppercase tracking-tighter">Intel Intelligence Briefing</h2>
                  </div>
                  <div className="grid gap-4">
                     {intelNews.length > 0 ? intelNews.map((news: any, idx: number) => (
                        <div key={idx} className="p-6 bg-slate-900/20 border border-slate-800 rounded-xl hover:border-blue-900/40 transition-all group font-bold">
                           <div className="flex justify-between items-start mb-3">
                              <span className="text-[9px] font-mono text-blue-500 font-bold uppercase tracking-widest">{news.date}</span>
                              <span className="bg-red-900/20 text-red-500 text-[8px] font-black px-2 py-0.5 rounded uppercase">Uso Restrito</span>
                           </div>
                           <h3 className="text-white font-bold text-sm mb-2 group-hover:text-blue-400 transition-colors uppercase">{news.title}</h3>
                           <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{news.summary}</p>
                           <a href={news.link} target="_blank" className="inline-flex items-center gap-1 text-blue-500 text-[9px] font-black uppercase tracking-widest mt-4 hover:underline">Analisar Documentação <ArrowUpRight size={12}/></a>
                        </div>
                     )) : <div className="text-xs font-mono animate-pulse text-slate-700 tracking-widest font-bold">Iniciando uplink...</div>}
                  </div>
               </div>

               <aside className="space-y-6">
                  {/* NOVO: DNS & WHOIS CHECKER */}
                  <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl shadow-xl">
                     <h3 className="text-blue-500 font-black text-[10px] uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Network size={14}/> DNS & Infrastructure</h3>
                     <div className="space-y-3">
                        <input className="w-full bg-black border border-slate-800 rounded px-3 py-2 text-[10px] text-white font-mono outline-none focus:border-blue-500" placeholder="domínio.com.br" id="dns-input" />
                        <div className="grid grid-cols-2 gap-2">
                           <button onClick={() => { const val = (document.getElementById('dns-input') as HTMLInputElement).value; if(val) window.open(`https://viewdns.info/dnsrecord/?domain=${val}`, '_blank')}} className="bg-slate-900 border border-slate-700 text-[8px] font-black uppercase py-2 hover:bg-slate-800 transition-all">DNS Record</button>
                           <button onClick={() => { const val = (document.getElementById('dns-input') as HTMLInputElement).value; if(val) window.open(`https://who.is/whois/${val}`, '_blank')}} className="bg-slate-900 border border-slate-700 text-[8px] font-black uppercase py-2 hover:bg-slate-800 transition-all">WHOIS Look</button>
                        </div>
                     </div>
                  </div>
               </aside>
            </div>
          </div>
        )}

        {/* ABA OSINT: DICIONÁRIO + IDENTIFICAÇÃO DE FOTOS */}
        {activeTab === 'osint' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            {/* NOVO: PHOTO IDENTIFICATION MODULE */}
            <section className="bg-gradient-to-r from-slate-900 to-blue-950/20 border border-slate-800 p-8 rounded-2xl">
               <h2 className="text-blue-500 font-bold mb-6 flex items-center gap-2 uppercase tracking-widest text-[10px] font-bold"><Camera size={18}/> Image Analysis & Photo ID</h2>
               <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { name: 'Google Lens', url: 'https://lens.google.com/upload', desc: 'Reconhecimento visual amplo' },
                    { name: 'Yandex Images', url: 'https://yandex.com/images', desc: 'Forte em rostos e locais' },
                    { name: 'TinEye', url: 'https://tineye.com', desc: 'Rastreio de modificações' }
                  ].map(tool => (
                    <a key={tool.name} href={tool.url} target="_blank" className="p-4 bg-black/40 border border-slate-800 rounded-xl hover:border-blue-500/50 transition-all group">
                       <p className="text-white font-black text-[10px] uppercase group-hover:text-blue-400">{tool.name}</p>
                       <p className="text-[8px] text-slate-500 uppercase mt-1">{tool.desc}</p>
                    </a>
                  ))}
               </div>
            </section>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { id: 'd1', cat: 'Empresarial', title: 'CNPJ em Portais Oficiais', code: 'site:receita.fazenda.gov.br OR site:cnpj.biz "CNPJ"' },
                { id: 'd3', cat: 'Docs Expostos', title: 'NF-e em XML Indexado', code: 'filetype:xml "nfeProc" intext:"CNPJ"', risk: true },
                { id: 'd7', cat: 'Leaks', title: 'Emails em Bases Vazadas', code: 'site:pastebin.com "@empresa.com.br"', risk: true }
              ].map((dork) => (
                <div key={dork.id} className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl hover:border-slate-700 transition-all font-bold">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[8px] font-black bg-slate-800 text-slate-400 px-2 py-1 rounded uppercase">{dork.cat}</span>
                    {dork.risk && <span className="text-red-600 text-[8px] font-black uppercase animate-pulse">! Sensível</span>}
                  </div>
                  <h3 className="text-white font-bold text-xs mb-3">{dork.title}</h3>
                  <div className="bg-black/60 p-3 rounded border border-slate-800 font-mono text-[10px] text-blue-400 relative">
                    <code className="break-all">{dork.code}</code>
                    <button onClick={() => copyToClipboard(dork.code, dork.id)} className="absolute top-2 right-2 text-slate-600 hover:text-white">
                      {copiedId === dork.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA LEGISLAÇÃO: REPOSITÓRIO FUNCIONAL */}
        {activeTab === 'legislacao' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <section className="bg-slate-900/20 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
               <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/40">
                  <h3 className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2"><Gavel size={16}/> Repositório Normativo SIFAZ</h3>
               </div>
               <table className="w-full text-left text-xs">
                  <thead className="bg-black/50 text-slate-500 font-mono text-[10px] uppercase">
                     <tr><th className="px-6 py-4">Ato Legal</th><th className="px-6 py-4 text-right">Fonte Oficial</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                     {[
                        { title: 'Lei 5.172/66 (CTN)', url: 'https://www.planalto.gov.br/ccivil_03/leis/l5172compilado.htm' },
                        { title: 'LC 87/1996 (Kandir)', url: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp87.htm' },
                        { title: 'Prot. CONFAZ 66/2009', url: 'https://www.confaz.fazenda.gov.br/legislacao/protocolos/2009/pt066_09' }
                     ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-blue-600/5 transition-all font-bold group">
                           <td className="px-6 py-4 font-bold text-blue-500 uppercase">{item.title}</td>
                           <td className="px-6 py-4 text-right">
                              <a href={item.url} target="_blank" className="inline-flex items-center gap-2 text-slate-500 hover:text-white font-black text-[10px] uppercase border border-slate-800 px-3 py-1 rounded transition-all">
                                 Acessar Repositório <ExternalLink size={12}/>
                              </a>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </section>
          </div>
        )}

      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-900 mt-20 flex justify-between items-center text-[9px] font-mono text-slate-600 font-bold">
        <p className="uppercase tracking-[0.3em]">© 2026 SIFAZ v.0.0.1 - UNIT OPS MARCUS ALEKS</p>
        <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10">
          <Activity size={12} className="animate-pulse" /> STATUS: READY
        </div>
      </footer>
    </div>
  );
}
