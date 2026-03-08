import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Shield, Activity, AlertTriangle, Search, ExternalLink, Globe, 
  Database, Fingerprint, LogOut, Zap, Lock, BookOpen, 
  Gavel, FileText, LayoutDashboard, Copy, Check, Eye, UserSearch, 
  Newspaper, ShieldAlert, ArrowUpRight 
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
      } catch (e) { console.error("Sync Error"); }
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
    { id: 'd1', cat: 'Empresarial', title: 'Busca CNPJ em Portais Oficiais', code: 'site:receita.fazenda.gov.br OR site:cnpj.biz "CNPJ"' },
    { id: 'd2', cat: 'Societário', title: 'Mapeamento de Sócios e Juntas', code: '"NOME EMPRESA" intext:"sócio" OR "administrador" site:jucesp.sp.gov.br' },
    { id: 'd3', cat: 'Docs Expostos', title: 'NF-e / DANFE em XML/PDF', code: 'filetype:xml "nfeProc" OR "NFe xmlns" intext:"CNPJ"', risk: true },
    { id: 'd4', cat: 'Docs Expostos', title: 'Planilhas de Faturamento/ICMS', code: 'filetype:xlsx OR filetype:csv intext:"CNPJ" "faturamento" OR "ICMS"', risk: true },
    { id: 'd5', cat: 'Patrimonial', title: 'Declaração de Bens (TSE/Transparência)', code: 'site:divulgacandcontas.tse.jus.br OR site:portaldatransparencia.gov.br "NOME DO ALVO" "bens"' }
  ];

  return (
    <div className="min-h-screen bg-[#020408] text-slate-400 font-sans selection:bg-blue-500/30">
      
      {/* HEADER SIFAZ v.0.0.1 */}
      <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white shadow-lg border border-blue-500/20"><Shield size={20}/></div>
            <div>
              <h1 className="text-white font-black text-xl uppercase tracking-tighter">SIFAZ <span className="text-blue-500 text-xs ml-1 font-bold tracking-widest">v.0.0.1</span></h1>
              <p className="text-[9px] text-slate-500 font-mono uppercase tracking-[0.3em] font-bold">Terminal Operacional de Inteligência</p>
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
        
        {/* ABA BRIEFING: TRANSFORMAÇÃO EM CENTRAL ATIVA */}
        {activeTab === 'briefing' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            
            {/* NOVO: QUICK SEARCH OPERACIONAL (Substitui os quadros inúteis) */}
            <section className="bg-gradient-to-r from-slate-900/40 to-blue-900/10 border border-slate-800 p-10 rounded-2xl shadow-2xl">
               <div className="flex items-center gap-3 mb-6">
                  <UserSearch className="text-blue-500" size={24} />
                  <h2 className="text-white font-black text-lg uppercase tracking-tighter">Iniciador de Alvos</h2>
               </div>
               <form onSubmit={(e) => { e.preventDefault(); if (osintQuery) window.open(`https://www.google.com/search?q=${encodeURIComponent(osintQuery)}`, '_blank'); }} className="flex gap-4">
                  <input 
                    type="text" 
                    className="flex-1 bg-black/60 border border-slate-700 rounded-lg px-5 py-4 text-white font-mono text-sm focus:border-blue-500 outline-none transition-all shadow-inner font-bold"
                    placeholder="Identificar: Nome, CPF, CNPJ ou Username (SOCMINT)..."
                    value={osintQuery}
                    onChange={(e) => setOsintQuery(e.target.value)}
                  />
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-10 rounded-lg font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 font-bold">Executar Scan</button>
               </form>
            </section>

            <section className="grid lg:grid-cols-3 gap-8">
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
                              <span className="bg-red-900/20 text-red-500 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-tighter italic">Nível de Sigilo: Restrito</span>
                           </div>
                           <h3 className="text-white font-bold text-sm mb-2 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{news.title}</h3>
                           <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{news.summary}</p>
                           <a href={news.link} target="_blank" className="inline-flex items-center gap-1 text-blue-500 text-[9px] font-black uppercase tracking-widest mt-4 hover:underline">
                             Analisar Documentação <ArrowUpRight size={12}/>
                           </a>
                        </div>
                     )) : <div className="text-xs font-mono animate-pulse text-slate-700 tracking-[0.2em] font-bold">Aguardando Uplink de Canais de Inteligência...</div>}
                  </div>
               </div>

               <aside className="space-y-6">
                  <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl shadow-xl">
                     <h3 className="text-blue-500 font-black text-[10px] uppercase tracking-[0.2em] mb-4 italic">Canais Oficiais de Acesso</h3>
                     <div className="space-y-3">
                        {[
                           { name: 'Córtex (MJSP)', url: 'https://cortex.mj.gov.br', icon: <Shield size={12}/> },
                           { name: 'SINTEGRA', url: 'http://www.sintegra.gov.br/', icon: <Database size={12}/> },
                           { name: 'CENSEC', url: 'https://censec.org.br', icon: <FileText size={12}/> },
                           { name: 'Portal SEFAZ RS', url: 'https://rpe-portal.sefaz.rs.gov.br/apl/index.html', icon: <ExternalLink size={12}/> }
                        ].map(sys => (
                           <a key={sys.name} href={sys.url} target="_blank" className="flex items-center justify-between p-3 bg-black/40 border border-slate-800 rounded hover:border-blue-500/50 transition-all group shadow-sm font-bold">
                              <div className="flex items-center gap-2">
                                <span className="text-blue-600 group-hover:text-blue-400">{sys.icon}</span>
                                <span className="text-[10px] font-bold text-slate-400 group-hover:text-white uppercase tracking-tighter">{sys.name}</span>
                              </div>
                              <ArrowUpRight size={12} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-all" />
                           </a>
                        ))}
                     </div>
                  </div>
               </aside>
            </section>
          </div>
        )}

        {/* ABA OSINT: DICIONÁRIO E BUSCA */}
        {activeTab === 'osint' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <section className="bg-blue-900/5 border border-blue-900/30 p-10 rounded-2xl shadow-2xl">
               <div className="flex items-center gap-3 mb-6">
                  <Eye className="text-blue-500" size={24} />
                  <h2 className="text-white font-black text-lg uppercase tracking-tighter">Catálogo de Queries SIFAZ</h2>
               </div>
               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dorkLibrary.map((dork) => (
                     <div key={dork.id} className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl hover:border-slate-700 transition-all group font-bold">
                        <div className="flex justify-between items-center mb-4">
                           <span className="text-[8px] font-black bg-slate-800 text-slate-400 px-2 py-1 rounded uppercase tracking-widest">{dork.cat}</span>
                           {dork.risk && <span className="text-red-600 text-[8px] font-black uppercase tracking-widest animate-pulse font-bold tracking-tighter">! Alerta de Sigilo</span>}
                        </div>
                        <h3 className="text-white font-bold text-xs mb-3 tracking-tight">{dork.title}</h3>
                        <div className="bg-black/60 p-3 rounded border border-slate-800 font-mono text-[10px] text-blue-400 relative group-hover:border-blue-500/30">
                           <code className="break-all">{dork.code}</code>
                           <button 
                              onClick={() => copyToClipboard(dork.code, dork.id)}
                              className="absolute top-2 right-2 text-slate-600 hover:text-white transition-colors"
                           >
                              {copiedId === dork.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                           </button>
                        </div>
                        <button onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(dork.code)}`, '_blank')} className="w-full mt-4 text-[9px] font-black uppercase text-slate-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-1 tracking-[0.2em]">
                           Executar em Motor Externo <ArrowUpRight size={12}/>
                        </button>
                     </div>
                  ))}
               </div>
            </section>
          </div>
        )}

        {/* ABA LEGISLAÇÃO: REPOSITÓRIO FUNCIONAL COM LINKS OFICIAIS */}
        {activeTab === 'legislacao' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <section className="bg-slate-900/20 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
               <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/40">
                  <h3 className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2"><Gavel size={16}/> Repositório Legal SIFAZ</h3>
               </div>
               <table className="w-full text-left text-xs">
                  <thead className="bg-black/50 text-slate-500 font-mono text-[10px] uppercase">
                     <tr><th className="px-6 py-4">Ato Legal</th><th className="px-6 py-4">Finalidade Investigativa</th><th className="px-6 py-4 text-right">Repositório</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                     {[
                        { title: 'Lei 5.172/66 (CTN)', desc: 'Código Tributário Nacional: Base normativa fundamental', url: 'https://www.planalto.gov.br/ccivil_03/leis/l5172compilado.htm' },
                        { title: 'LC 87/1996 (Lei Kandir)', desc: 'Regras de ICMS e Substituição Tributária', url: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp87.htm' },
                        { title: 'Lei 9.613/98 (Lavagem)', desc: 'Crimes de lavagem de dinheiro e o COAF', url: 'https://www.planalto.gov.br/ccivil_03/leis/l9613.htm' },
                        { title: 'Prot. CONFAZ 66/2009', desc: 'Sistemas de Inteligência Fazendária Interestadual', url: 'https://www.confaz.fazenda.gov.br/legislacao/protocolos/2009/pt066_09' },
                        { title: 'Lei 13.709/18 (LGPD)', desc: 'Privacidade e Proteção de Dados', url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm' }
                     ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-blue-600/5 transition-colors font-bold group">
                           <td className="px-6 py-4 font-bold text-blue-500 uppercase tracking-tighter">{item.title}</td>
                           <td className="px-6 py-4 text-slate-400 group-hover:text-slate-300 italic">{item.desc}</td>
                           <td className="px-6 py-4 text-right">
                              <a href={item.url} target="_blank" className="inline-flex items-center gap-2 text-slate-500 hover:text-white font-black text-[10px] uppercase border border-slate-800 px-3 py-1 rounded transition-all shadow-sm">
                                 Acessar Fonte <ExternalLink size={12} className="text-blue-600"/>
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
        <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10 shadow-sm shadow-emerald-900/20">
          <Activity size={12} className="animate-pulse" /> STATUS: READY
        </div>
      </footer>
    </div>
  );
}
