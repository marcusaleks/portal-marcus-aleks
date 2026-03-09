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
    setShowAtifBanner(true);

    const fetchIntelData = async () => {
      try {
        const res = await fetch(`/data/news.json?t=${new Date().getTime()}`);
        if (res.ok) {
          const data = await res.json();
          setIntelNews(data.intel || []);
        }
      } catch (e) { console.error("Erro no Uplink."); }
    };
    fetchIntelData();
  }, [router]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!authorized) return <div className="min-h-screen bg-[#020408]" />;

  const dorkLibrary = [
    { id: 'dc1', cat: 'Empresa', title: 'CNPJ em Portais Oficiais', code: 'site:receita.fazenda.gov.br OR site:cnpj.biz "CNPJ"' },
    { id: 'dc2', cat: 'Societário', title: 'Sócios e Quadro Diretivo', code: '"NOME" intext:"sócio" OR "administrador" site:redesim.gov.br' },
    { id: 'dc5', cat: 'Docs', title: 'NF-e / DANFE Expostas', code: 'filetype:xml "nfeProc" intext:"CNPJ"', risk: true },
    { id: 'dc13', cat: 'Shodan', title: 'Servidor SEFAZ Exposto', code: 'http.title:"SEFAZ" country:BR port:443', risk: true }
  ];

  const legislationList = [
    { title: 'Lei 5.172/66 (CTN)', desc: 'Código Tributário Nacional: Normas Gerais', url: 'https://www.planalto.gov.br/ccivil_03/leis/l5172compilado.htm' },
    { title: 'Prot. CONFAZ 66/2009', desc: 'Uso do SIIAP para Inteligência', url: 'https://www.confaz.fazenda.gov.br/legislacao/protocolos/2009/pt066_09' }
  ];

  return (
    <div className="min-h-screen bg-[#020408] text-slate-400 font-sans">
      
      {showAtifBanner && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-950 border-2 border-red-600 p-12 rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.3)] relative max-w-lg w-full text-center">
            <button onClick={() => setShowAtifBanner(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={24}/></button>
            <ShieldAlert size={64} className="text-red-600 mx-auto mb-6 animate-bounce" />
            <h2 className="text-white text-4xl font-black uppercase tracking-tighter mb-4 italic">AQUI É ATIF, PORRA!!!</h2>
            <button onClick={() => setShowAtifBanner(false)} className="mt-8 bg-red-600 text-white font-black text-xs uppercase py-3 px-8 rounded-lg tracking-widest hover:bg-red-700 transition-all">Assumir Comando</button>
          </div>
        </div>
      )}

      <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white"><Shield size={20}/></div>
            <div>
              <h1 className="text-white font-black text-xl uppercase tracking-tighter leading-none">SIFAZ <span className="text-blue-500 text-[10px] ml-1">v.0.0.1</span></h1>
              <p className="text-[9px] text-slate-500 font-mono uppercase tracking-[0.3em] font-bold mt-1">Sistema de Inteligência Fazendária</p>
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
            <button onClick={() => window.location.href = '/'} className="p-2 text-red-600 hover:text-red-400 ml-4"><Zap size={18}/></button>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {activeTab === 'briefing' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="grid lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 space-y-6">
                  <h2 className="text-white font-black text-lg uppercase tracking-tighter border-b border-slate-800 pb-4 flex items-center gap-3"><ShieldAlert className="text-red-600" size={20} /> Intel Briefing</h2>
                  <div className="grid gap-4">
                     {intelNews.map((news: any, idx: number) => (
                        <div key={idx} className="p-6 bg-slate-900/20 border border-slate-800 rounded-xl hover:border-blue-900/40 transition-all font-bold">
                           <span className="text-[9px] font-mono text-blue-500 uppercase tracking-widest">{news.date}</span>
                           <h3 className="text-white text-sm font-bold mt-2 uppercase">{news.title}</h3>
                           <p className="text-xs text-slate-500 mt-2 line-clamp-2">{news.summary}</p>
                           <a href={news.link} target="_blank" className="inline-flex items-center gap-1 text-blue-500 text-[9px] font-black uppercase mt-4 hover:underline">Analisar <ArrowUpRight size={12}/></a>
                        </div>
                     ))}
                  </div>
               </div>
               <aside className="space-y-6">
                  <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl shadow-xl">
                     <h3 className="text-blue-500 font-black text-[10px] uppercase mb-4 flex items-center gap-2"><Network size={14}/> Infrastructure Recon</h3>
                     <input className="w-full bg-black border border-slate-800 rounded px-3 py-2 text-[10px] text-white font-mono mb-3 outline-none focus:border-blue-500" placeholder="domínio.com.br" id="dns-input" />
                     <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => { const v = (document.getElementById('dns-input') as HTMLInputElement).value; if(v) window.open(`https://viewdns.info/dnsrecord/?domain=${v}`, '_blank')}} className="bg-slate-900 border border-slate-700 text-[8px] font-black uppercase py-2 hover:bg-slate-800">DNS Record</button>
                        <button onClick={() => { const v = (document.getElementById('dns-input') as HTMLInputElement).value; if(v) window.open(`https://who.is/whois/${v}`, '_blank')}} className="bg-slate-900 border border-slate-700 text-[8px] font-black uppercase py-2 hover:bg-slate-800">WHOIS</button>
                     </div>
                  </div>
               </aside>
            </div>
          </div>
        )}

        {activeTab === 'osint' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <section className="bg-gradient-to-r from-slate-900 to-blue-950/20 border border-slate-800 p-8 rounded-2xl">
               <h2 className="text-blue-500 font-black text-[10px] uppercase mb-6 flex items-center gap-2"><Camera size={18}/> Photo & Image Analysis</h2>
               <div className="grid md:grid-cols-3 gap-4">
                  {[{ name: 'Google Lens', url: 'https://lens.google.com/upload' }, { name: 'Yandex Images', url: 'https://yandex.com/images' }, { name: 'TinEye', url: 'https://tineye.com' }].map(t => (
                    <a key={t.name} href={t.url} target="_blank" className="p-4 bg-black/40 border border-slate-800 rounded-xl hover:border-blue-500/50 transition-all text-center">
                       <p className="text-white font-black text-[10px] uppercase">{t.name}</p>
                    </a>
                  ))}
               </div>
            </section>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dorkLibrary.map((d) => (
                <div key={d.id} className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl hover:border-slate-700 transition-all font-bold">
                  <div className="flex justify-between items-center mb-4"><span className="text-[8px] font-black bg-slate-800 text-slate-400 px-2 py-1 rounded uppercase">{d.cat}</span>{d.risk && <span className="text-red-600 text-[8px] font-black uppercase animate-pulse">! Sigilo</span>}</div>
                  <h3 className="text-white text-xs font-bold mb-3 tracking-tight">{d.title}</h3>
                  <div className="bg-black/60 p-3 rounded border border-slate-800 font-mono text-[10px] text-blue-400 relative">
                    <code className="break-all">{d.code}</code>
                    <button onClick={() => copyToClipboard(d.code, d.id)} className="absolute top-2 right-2 text-slate-600 hover:text-white">{copiedId === d.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'legislacao' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <section className="bg-slate-900/20 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
               <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/40 flex items-center gap-2"><Gavel size={16} className="text-white"/><h3 className="text-white text-xs font-black uppercase tracking-widest">Repositório Legal Integral</h3></div>
               <table className="w-full text-left text-xs">
                  <thead className="bg-black/50 text-slate-500 font-mono text-[10px] uppercase">
                     <tr><th className="px-6 py-4">Ato Legal</th><th className="px-6 py-4 text-right">Repositório Oficial</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                     {legislationList.map((l, i) => (
                        <tr key={i} className="hover:bg-blue-600/5 transition-all font-bold">
                           <td className="px-6 py-4">
                              <p className="text-blue-500 uppercase tracking-tighter">{l.title}</p>
                              <p className="text-[10px] text-slate-500 italic mt-1">{l.desc}</p>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <a href={l.url} target="_blank" className="inline-flex items-center gap-2 text-slate-500 hover:text-white font-black text-[10px] uppercase border border-slate-800 px-3 py-1 rounded transition-all shadow-sm">Fonte Planalto <ExternalLink size={12}/></a>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </section>
          </div>
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-900 flex justify-between items-center text-[9px] font-mono text-slate-600 font-bold uppercase tracking-widest">
        <p>© 2026 SIFAZ v.0.0.1 - UNIT OPS MARCUS ALEKS</p>
        <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10">
          <Activity size={12} className="animate-pulse" /> STATUS: READY
        </div>
      </footer>
    </div>
  );
}
