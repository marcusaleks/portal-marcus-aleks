import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Shield, Activity, Search, Newspaper, ShieldAlert, ArrowUpRight, X, LogOut, Gavel, Network, Camera, Copy, Check, ExternalLink } from 'lucide-react';

export default function SifazDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState('briefing');
  const [intelNews, setIntelNews] = useState([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('mad_access_token');
    if (!token) { router.push('/login'); return; }
    setAuthorized(true);
    const fetchNews = async () => {
      try {
        const res = await fetch('/data/news.json');
        const data = await res.json();
        setIntelNews(data.intel || []);
      } catch (e) { console.error("Erro news."); }
    };
    fetchNews();
  }, [router]);

  const handleLogout = () => { localStorage.removeItem('mad_access_token'); router.push('/'); };
  const copyToClipboard = (text: string, id: string) => { navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); };

  if (!authorized) return <div className="min-h-screen bg-[#020408]" />;

  const dorkLibrary = [
    { id: 'dc1', cat: 'Empresa', title: 'CNPJ em Portais Oficiais', code: 'site:receita.fazenda.gov.br OR site:cnpj.biz "CNPJ"' },
    { id: 'dc2', cat: 'Societário', title: 'Sócios e Quadro Diretivo', code: '"NOME" intext:"sócio" OR "administrador" site:redesim.gov.br' },
    { id: 'dc3', cat: 'Diário Oficial', title: 'Atos em DOU/DOE/DOM', code: '"RAZÃO SOCIAL" site:in.gov.br filetype:pdf' },
    { id: 'dc4', cat: 'Empresa', title: 'Endereços Não Declarados', code: '"NOME" intext:"localizado em" -site:gov.br' },
    { id: 'dc5', cat: 'Docs', title: 'NF-e / DANFE Expostas', code: 'filetype:xml "nfeProc" intext:"CNPJ"', risk: true },
    { id: 'dc6', cat: 'Docs', title: 'Planilhas Fiscais Públicas', code: 'filetype:xlsx intext:"CNPJ" "faturamento" OR "ICMS"', risk: true },
    { id: 'dc7', cat: 'Docs', title: 'SPED / EFD Expostos', code: 'filetype:txt "|0000|" "SPED" intext:"CNPJ"', risk: true },
    { id: 'dc8', cat: 'Docs', title: 'Contratos e Procurações', code: '"RAZÃO SOCIAL" filetype:pdf intext:"procuração"' },
    { id: 'dc9', cat: 'Financeiro', title: 'Declarações de Bens', code: 'site:divulgacandcontas.tse.jus.br "ALVO" "bens"', risk: true },
    { id: 'dc10', cat: 'Imóveis', title: 'Anúncios de Patrimônio', code: '"NOME" site:zapimoveis.com.br OR "matrícula imóvel"' },
    { id: 'dc11', cat: 'Licitação', title: 'Participação em Compras', code: '"CNPJ" site:comprasgovernamentais.gov.br OR site:pncp.gov.br' },
    { id: 'dc12', cat: 'Processo', title: 'Execuções Fiscais', code: '"NOME/CNPJ" site:jus.br "execução fiscal"' },
    { id: 'dc13', cat: 'Shodan', title: 'Servidor SEFAZ Exposto', code: 'http.title:"SEFAZ" country:BR port:443', risk: true },
    { id: 'dc14', cat: 'Shodan', title: 'MySQL Público', code: 'product:"MySQL" country:BR org:"NOME"', risk: true },
    { id: 'dc15', cat: 'Leaks', title: 'Domínios em Breaches', code: 'site:haveibeenpwned.com "@empresa.com.br"', risk: true },
    { id: 'dc16', cat: 'Leaks', title: 'Pastes de Credenciais', code: 'site:pastebin.com "CNPJ" "@empresa.com.br"', risk: true },
    { id: 'dc17', cat: 'Sanções', title: 'Empresas Inidôneas (CEIS)', code: '"CNPJ" site:portaldatransparencia.gov.br "CEIS"' },
    { id: 'dc18', cat: 'Pessoal', title: 'CPF em Bases Públicas', code: '"CPF" filetype:pdf -site:gov.br', risk: true }
  ];

  const legislationList = [
    { title: 'CF/88 Art. 145–162', desc: 'Sistema Tributário Nacional', url: 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm#art145' },
    { title: 'Lei 5.172/66 (CTN)', desc: 'Código Tributário Nacional', url: 'https://www.planalto.gov.br/ccivil_03/leis/l5172compilado.htm' },
    { title: 'LC 87/1996 (Kandir)', desc: 'Regulamentação do ICMS', url: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp87.htm' },
    { title: 'Lei 9.613/98 (Lavagem)', desc: 'Crimes de Lavagem de Bens', url: 'https://www.planalto.gov.br/ccivil_03/leis/l9613.htm' },
    { title: 'Prot. CONFAZ 66/2009', desc: 'Sistemas de Inteligência', url: 'https://www.confaz.fazenda.gov.br/legislacao/protocolos/2009/pt066_09' },
    { title: 'LC 105/2001', desc: 'Sigilo Bancário', url: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp105.htm' },
    { title: 'Lei 12.527/11 (LAI)', desc: 'Acesso à Informação', url: 'https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12527.htm' },
    { title: 'LGPD Lei 13.709/18', desc: 'Proteção de Dados', url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm' },
    { title: 'LC 116/2003 (ISS)', desc: 'Normas Gerais do ISSQN', url: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp116.htm' },
    { title: 'Lei 9.296/96', desc: 'Interceptação de Comunicações', url: 'https://www.planalto.gov.br/ccivil_03/leis/l9296.htm' },
    { title: 'Conv. ICMS 142/18', desc: 'Regras de ST Interestadual', url: 'https://www.confaz.fazenda.gov.br/legislacao/convenios/2018/cv142_18' }
  ];

  return (
    <div className="min-h-screen bg-[#020408] text-slate-400 font-sans font-bold">
      <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white"><Shield size={20}/></div>
            <div><h1 className="text-white font-black text-xl uppercase tracking-tighter leading-none">SIFAZ <span className="text-blue-500 text-[10px] ml-1">v.0.0.1</span></h1><p className="text-[9px] text-slate-500 font-mono uppercase tracking-[0.3em] font-black mt-1">Sistema de Inteligência Fazendária</p></div>
          </div>
          <nav className="flex gap-2 items-center">
            {[{ id: 'briefing', label: 'Briefing', icon: <Newspaper size={14}/> }, { id: 'osint', label: 'Dorks', icon: <Search size={14}/> }, { id: 'legislacao', label: 'Legislação', icon: <Gavel size={14}/> }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}>{tab.icon} {tab.label}</button>
            ))}
            <button onClick={handleLogout} className="flex items-center gap-2 p-2 text-red-600 hover:bg-red-600/10 rounded-lg ml-4 uppercase text-[10px] font-black"><LogOut size={18}/> SAIR</button>
          </nav>
        </div>
      </div>
      <main className="max-w-7xl mx-auto px-6 py-10">
        {activeTab === 'briefing' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-white font-black text-lg uppercase tracking-tighter border-b border-slate-800 pb-4 flex items-center gap-3"><ShieldAlert className="text-red-600" size={20} /> Intel Briefing</h2>
              <div className="grid gap-4">
                {intelNews.map((news: any, idx: number) => (
                  <div key={idx} className="p-6 bg-slate-900/20 border border-slate-800 rounded-xl font-bold group">
                    <span className="text-[9px] font-mono text-blue-500 uppercase tracking-widest">{news.date}</span>
                    <h3 className="text-white text-sm font-bold mt-2 uppercase">{news.title}</h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">{news.summary}</p>
                    <a href={news.link} target="_blank" className="inline-flex items-center gap-1 text-blue-500 text-[9px] font-black uppercase mt-4 hover:underline">Analisar <ArrowUpRight size={12}/></a>
                  </div>
                ))}
              </div>
            </div>
            <aside className="space-y-6"><div className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl shadow-xl"><h3 className="text-blue-500 font-black text-[10px] uppercase mb-4 flex items-center gap-2"><Network size={14}/> Infra Recon</h3><input className="w-full bg-black border border-slate-800 rounded px-3 py-2 text-[10px] text-white font-mono mb-3" placeholder="domínio.com.br" id="dns-input" /><div className="grid grid-cols-2 gap-2"><button onClick={() => { const v = (document.getElementById('dns-input') as HTMLInputElement).value; if(v) window.open(`https://viewdns.info/dnsrecord/?domain=${v}`, '_blank')}} className="bg-slate-900 border border-slate-700 text-[8px] font-black py-2">DNS</button><button onClick={() => { const v = (document.getElementById('dns-input') as HTMLInputElement).value; if(v) window.open(`https://who.is/whois/${v}`, '_blank')}} className="bg-slate-900 border border-slate-700 text-[8px] font-black py-2">WHOIS</button></div></div></aside>
          </div>
        )}
        {activeTab === 'osint' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dorkLibrary.map((d) => (
              <div key={d.id} className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl font-bold">
                <div className="flex justify-between items-center mb-4"><span className="text-[8px] font-black bg-slate-800 text-slate-400 px-2 py-1 rounded uppercase">{d.cat}</span>{d.risk && <span className="text-red-600 text-[8px] font-black uppercase animate-pulse">! Sigilo</span>}</div>
                <h3 className="text-white text-xs font-bold mb-3 tracking-tight">{d.title}</h3>
                <div className="bg-black/60 p-3 rounded border border-slate-800 font-mono text-[10px] text-blue-400 relative"><code className="break-all">{d.code}</code><button onClick={() => copyToClipboard(d.code, d.id)} className="absolute top-2 right-2 text-slate-600 hover:text-white">{copiedId === d.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}</button></div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'legislacao' && (
          <section className="bg-slate-900/20 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/50 text-slate-500 font-mono text-[10px] uppercase"><tr><th className="px-6 py-4">Ato Legal</th><th className="px-6 py-4 text-right">Repositório</th></tr></thead>
              <tbody className="divide-y divide-slate-800">
                {legislationList.map((l, i) => (
                  <tr key={i} className="hover:bg-blue-600/5 transition-all font-bold"><td className="px-6 py-4"><p className="text-blue-500 uppercase tracking-tighter">{l.title}</p><p className="text-[10px] text-slate-500 italic mt-1">{l.desc}</p></td><td className="px-6 py-4 text-right"><a href={l.url} target="_blank" className="inline-flex items-center gap-2 text-slate-500 hover:text-white font-black text-[10px] uppercase border border-slate-800 px-3 py-1 rounded transition-all">Fonte <ExternalLink size={12}/></a></td></tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-900 flex justify-between items-center text-[10px] font-mono text-slate-600 font-black uppercase tracking-[0.3em]"><p>© 2026 MARCUS ALEKS DEVELOPERS</p><div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10"><Activity size={12} className="animate-pulse" /> STATUS: OPERACIONAL</div></footer>
    </div>
  );
}
