import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Shield, Activity, AlertTriangle, Search, ExternalLink, Globe, 
  Database, Fingerprint, LogOut, Zap, Lock, BookOpen, 
  Gavel, FileText, LayoutDashboard, Copy, Check, Eye, UserSearch, Newspaper, ShieldAlert
} from 'lucide-react';

export default function SifazDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState('briefing');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [osintQuery, setOsintQuery] = useState('');
  const [intelNews, setIntelNews] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('mad_access_token');
    if (!token) { router.push('/'); return; }
    setAuthorized(true);

    const fetchIntelData = async () => {
      try {
        const res = await fetch(`/data/news.json?t=${new Date().getTime()}`);
        if (res.ok) {
          const data = await res.json();
          setIntelNews(data.intel || []);
        }
      } catch (e) { console.error("Falha no uplink de inteligência."); }
    };
    fetchIntelData();
  }, [router]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!authorized) return <div className="min-h-screen bg-[#020408]" />;

  // DICIONÁRIO DE DORKS CATEGORIZADO
  const dorkLibrary = [
    { id: 'd1', cat: 'Empresarial', title: 'Busca CNPJ em Portais Oficiais', code: 'site:receita.fazenda.gov.br OR site:cnpj.biz "CNPJ"' },
    { id: 'd2', cat: 'Societário', title: 'Mapeamento de Sócios e Juntas', code: '"NOME EMPRESA" intext:"sócio" OR "administrador" site:jucesp.sp.gov.br' },
    { id: 'd3', cat: 'Docs Expostos', title: 'NF-e / DANFE em XML/PDF', code: 'filetype:xml "nfeProc" OR "NFe xmlns" intext:"CNPJ"', risk: true },
    { id: 'd4', cat: 'Docs Expostos', title: 'Planilhas de Faturamento/ICMS', code: 'filetype:xlsx OR filetype:csv intext:"CNPJ" "faturamento" OR "ICMS"', risk: true },
    { id: 'd5', cat: 'Patrimonial', title: 'Declaração de Bens (TSE/Transparência)', code: 'site:divulgacandcontas.tse.jus.br OR site:portaldatransparencia.gov.br "NOME DO ALVO" "bens"' },
    { id: 'd6', cat: 'Shodan', title: 'Servidor Fiscal Exposto', code: 'http.title:"SEFAZ" OR "NF-e" country:BR port:443,80', risk: true },
    { id: 'd7', cat: 'Leaks', title: 'E-mails em Bases Vazadas', code: 'site:pastebin.com OR site:gist.github.com "CNPJ" "@empresa.com.br"', risk: true }
  ];

  return (
    <div className="min-h-screen bg-[#020408] text-slate-400 font-sans selection:bg-blue-500/30">
      
      {/* HEADER SIFAZ v.0.0.1 */}
      <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white shadow-lg shadow-blue-900/40 border border-blue-500/20"><Shield size={20}/></div>
            <div>
              <h1 className="text-white font-black text-xl uppercase tracking-tighter">SIFAZ <span className="text-blue-500 text-xs ml-1 font-bold">v.0.0.1</span></h1>
              <p className="text-[9px] text-slate-500 font-mono uppercase tracking-[0.3em]">Operational Intelligence Terminal</p>
            </div>
          </div>

          <nav className="flex gap-2">
            {[
              { id: 'briefing', label: 'Briefing', icon: <Newspaper size={14}/> },
              { id: 'osint', label: 'Dorks & SOCINT', icon: <Search size={14}/> },
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
        
        {/* ABA BRIEFING: NOTÍCIAS PARA A COMUNIDADE DE INTELIGÊNCIA */}
        {activeTab === 'briefing' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <section className="grid lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                     <ShieldAlert className="text-red-600" size={20} />
                     <h2 className="text-white font-black text-lg uppercase tracking-tighter">Briefing de Inteligência Fazendária</h2>
                  </div>
                  <div className="grid gap-4">
                     {intelNews.length > 0 ? intelNews.map((news: any, idx: number) => (
                        <div key={idx} className="p-6 bg-slate-900/20 border border-slate-800 rounded-xl hover:border-blue-900/40 transition-all group">
                           <div className="flex justify-between items-start mb-3">
                              <span className="text-[9px] font-mono text-blue-500 font-bold uppercase tracking-widest">{news.date}</span>
                              <span className="bg-red-900/20 text-red-500 text-[8px] font-black px-2 py-0.5 rounded uppercase">Uso Restrito</span>
                           </div>
                           <h3 className="text-white font-bold text-sm mb-2 group-hover:text-blue-400 transition-colors">{news.title}</h3>
                           <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{news.summary}</p>
                           <a href={news.link} target="_blank" className="inline-flex items-center gap-1 text-blue-500 text-[9px] font-black uppercase tracking-widest mt-4 hover:underline">Analisar Evidência <ArrowUpRight size={10}/></a>
                        </div>
                     )) : <div className="text-xs font-mono animate-pulse text-slate-700">Sincronizando canais de inteligência...</div>}
                  </div>
               </div>

               <aside className="space-y-6">
                  <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl">
                     <h3 className="text-blue-500 font-black text-[10px] uppercase tracking-[0.2em] mb-4">Comandos de Acesso</h3>
                     <div className="space-y-3">
                        {[
                           { name: 'Córtex (MJSP)', url: 'https://cortex.mj.gov.br' },
                           { name: 'SINTEGRA', url: 'http://www.sintegra.gov.br/' },
                           { name: 'CENSEC', url: 'https://censec.org.br' }
                        ].map(sys => (
                           <a key={sys.name} href={sys.url} target="_blank" className="flex items-center justify-between p-3 bg-black/40 border border-slate-800 rounded hover:border-blue-500/50 transition-all group">
                              <span className="text-[10px] font-bold text-slate-400 group-hover:text-white uppercase">{sys.name}</span>
                              <ExternalLink size={12} className="text-slate-600" />
                           </a>
                        ))}
                     </div>
                  </div>
               </aside>
            </section>
          </div>
        )}

        {/* ABA OSINT & DORKS: DICIONÁRIO DE QUERIES */}
        {activeTab === 'osint' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <section className="bg-blue-900/5 border border-blue-900/30 p-10 rounded-2xl shadow-2xl">
               <div className="flex items-center gap-3 mb-6">
                  <UserSearch className="text-blue-500" size={24} />
                  <h2 className="text-white font-black text-lg uppercase tracking-tighter">Dicionário de Dorks SIFAZ</h2>
               </div>
               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dorkLibrary.map((dork) => (
                     <div key={dork.id} className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl hover:border-slate-700 transition-all group">
                        <div className="flex justify-between items-center mb-4">
                           <span className="text-[8px] font-black bg-slate-800 text-slate-400 px-2 py-1 rounded uppercase tracking-widest">{dork.cat}</span>
                           {dork.risk && <span className="text-red-600 text-[8px] font-black uppercase tracking-widest animate-pulse">! Sensível</span>}
                        </div>
                        <h3 className="text-white font-bold text-xs mb-3">{dork.title}</h3>
                        <div className="bg-black/60 p-3 rounded border border-slate-800 font-mono text-[10px] text-blue-400 relative">
                           <code className="break-all">{dork.code}</code>
                           <button 
                              onClick={() => copyToClipboard(dork.code, dork.id)}
                              className="absolute top-2 right-2 text-slate-600 hover:text-white transition-colors"
                           >
                              {copiedId === dork.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                           </button>
                        </div>
                        <button onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(dork.code)}`, '_blank')} className="w-full mt-4 text-[9px] font-black uppercase text-slate-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-1 tracking-widest">
                           Executar no Motor <ArrowUpRight size={12}/>
                        </button>
                     </div>
                  ))}
               </div>
            </section>
          </div>
        )}

        {/* ABA LEGISLAÇÃO: LINKS DIRETOS PARA FONTES OFICIAIS */}
        {activeTab === 'legislacao' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <section className="bg-slate-900/20 border border-slate-800 rounded-xl overflow-hidden">
               <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/40">
                  <h3 className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2"><Gavel size={16}/> Repositório Normativo SIFAZ</h3>
               </div>
               <table className="w-full text-left text-xs">
                  <thead className="bg-black/50 text-slate-500 font-mono text-[10px] uppercase">
                     <tr><th className="px-6 py-4">Norma</th><th className="px-6 py-4">Finalidade</th><th className="px-6 py-4 text-right">Fonte Oficial</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                     {[
                        { title: 'Lei 5.172/66 (CTN)', desc: 'Código Tributário Nacional: Base para lançamento e prescrição', url: 'https://www.planalto.gov.br/ccivil_03/leis/l5172compilado.htm' },
                        { title: 'Lei 9.613/98 (Lavagem)', desc: 'Crimes de ocultação de bens e obrigações do COAF', url: 'https://www.planalto.gov.br/ccivil_03/leis/l9613.htm' },
                        { title: 'Prot. CONFAZ 66/2009', desc: 'Regulamenta o uso do SIIAP em investigações estaduais', url: 'https://www.confaz.fazenda.gov.br/legislacao/protocolos/2009/pt066_09' }
                     ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-blue-600/5 transition-colors">
                           <td className="px-6 py-4 font-bold text-blue-500">{item.title}</td>
                           <td className="px-6 py-4 text-slate-400">{item.desc}</td>
                           <td className="px-6 py-4 text-right">
                              <a href={item.url} target="_blank" className="inline-flex items-center gap-2 text-slate-500 hover:text-white font-black text-[10px] uppercase border border-slate-800 px-3 py-1 rounded transition-all">
                                 Abrir Repositório <ExternalLink size={12}/>
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
        <p className="uppercase tracking-[0.3em]">© 2026 SIFAZ v.0.0.1 - NÚCLEO OPERACIONAL MARCUS ALEKS</p>
        <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10 shadow-sm shadow-emerald-900/20">
          <Activity size={12} className="animate-pulse" /> SYSTEM STATUS: OPTIMAL
        </div>
      </footer>
    </div>
  );
}
