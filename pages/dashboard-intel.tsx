import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import MadSignature from '../components/MadSignature';
import { 
  Shield, Activity, Search, Newspaper, ShieldAlert, ArrowUpRight, X, 
  LogOut, Gavel, Network, Camera, Copy, Check, ExternalLink 
} from 'lucide-react';

export default function SifazDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState('briefing');
  const [intelNews, setIntelNews] = useState([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAtifBanner, setShowAtifBanner] = useState(false); // ESTADO DO POPUP

  useEffect(() => {
    fetch('/api/session').then(r => r.json()).then(d => {
      if (!d.valid) { router.push('/login'); return; }
      setAuthorized(true);
      setShowAtifBanner(true);
    });

    const fetchNews = async () => {
      try {
        const res = await fetch('/data/news.json');
        const data = await res.json();
        setIntelNews(data.intel || []);
      } catch (e) { console.error("Erro Uplink."); }
    };
    fetchNews();

    const interval = setInterval(fetchNews, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/');
  };

  const copyToClipboard = (text: string, id: string) => { 
    navigator.clipboard.writeText(text); 
    setCopiedId(id); 
    setTimeout(() => setCopiedId(null), 2000); 
  };

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
    <div className="min-h-screen bg-[#020408] text-slate-400 font-sans font-bold" style={{ fontSize: '1.2em' }}>
      
      {/* REINCLUSÃO DO POPUP ATIF */}
      {showAtifBanner && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-950 border border-blue-500/30 p-16 rounded-[3rem] shadow-[0_0_80px_rgba(37,99,235,0.2)] relative max-w-2xl w-full text-center animate-in zoom-in duration-300">
            <button onClick={() => setShowAtifBanner(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={32}/></button>
            <Shield size={80} className="text-blue-500 mx-auto mb-8" />
            <h2 className="text-white text-4xl font-black uppercase tracking-tighter mb-6 italic">Bem-vindo(a)</h2>
            <p className="text-slate-400 text-lg font-bold">à área restrita e exclusiva deste portal</p>
            <button onClick={() => setShowAtifBanner(false)} className="mt-10 bg-blue-600 text-white font-black text-sm uppercase py-5 px-12 rounded-2xl tracking-[0.2em] hover:bg-blue-700 transition-all shadow-lg">Entrar</button>
          </div>
        </div>
      )}

      <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white"><Shield size={28}/></div>
            <div><h1 className="text-white font-black text-2xl uppercase tracking-tighter leading-none">SIFAZ <span className="text-blue-500 text-[12px] ml-1">v.0.0.1</span></h1><p className="text-[11px] text-slate-500 font-mono uppercase tracking-[0.3em] font-black mt-1">Sistema de Inteligência Fazendária</p></div>
          </div>
          <nav className="flex gap-4 items-center">
            {[{ id: 'briefing', label: 'Briefing', icon: <Newspaper size={20}/> }, { id: 'osint', label: 'Dorks', icon: <Search size={20}/> }, { id: 'legislacao', label: 'Legislação', icon: <Gavel size={20}/> }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-3 px-6 py-4 rounded text-[14px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}>{tab.icon} {tab.label}</button>
            ))}
            <button onClick={handleLogout} className="flex items-center gap-3 p-4 text-red-600 hover:bg-red-600/10 rounded-xl ml-8 uppercase text-[14px] font-black"><LogOut size={26}/> SAIR</button>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-16">
        
        {/* ABA BRIEFING: RESTAURADA */}
        {activeTab === 'briefing' && (
          <div className="space-y-12">
            <h2 className="text-white font-black text-2xl uppercase tracking-tighter border-b border-slate-800 pb-6 flex items-center gap-4"><ShieldAlert className="text-red-600" size={28} /> Intel Briefing</h2>
            <div className="grid gap-6">
              {intelNews.map((news: any, idx: number) => (
                <div key={idx} className="p-10 bg-slate-900/20 border border-slate-800 rounded-3xl font-bold group">
                  <span className="text-[12px] font-mono text-blue-500 uppercase tracking-widest">{news.date}</span>
                  <h3 className="text-white text-xl font-bold mt-3 uppercase">{news.title}</h3>
                  <p className="text-sm text-slate-500 mt-4 leading-relaxed">{news.summary}</p>
                  <a href={news.link} target="_blank" className="inline-flex items-center gap-2 text-blue-500 text-[12px] font-black uppercase mt-6 hover:underline">Analisar Origem <ArrowUpRight size={16}/></a>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'osint' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {dorkLibrary.map((d) => (
              <div key={d.id} className="bg-slate-950/60 border border-slate-800 p-10 rounded-[3rem] font-bold shadow-2xl">
                <div className="flex justify-between items-center mb-8"><span className="text-[12px] font-black bg-slate-800 text-slate-400 px-4 py-2 rounded uppercase">{d.cat}</span>{d.risk && <span className="text-red-600 text-[12px] font-black uppercase animate-pulse">! Sigilo</span>}</div>
                <h3 className="text-white text-[1.2em] font-bold mb-6 tracking-tight">{d.title}</h3>
                <div className="bg-black/80 p-6 rounded-2xl border border-slate-800 font-mono text-[14px] text-blue-400 relative"><code className="break-all">{d.code}</code><button onClick={() => copyToClipboard(d.code, d.id)} className="absolute top-4 right-4 text-slate-600 hover:text-white">{copiedId === d.id ? <Check size={24} className="text-emerald-500" /> : <Copy size={24} />}</button></div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'legislacao' && (
          <section className="bg-slate-900/20 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-black text-slate-500 font-mono text-[14px] uppercase"><tr><th className="px-10 py-8">Ato Legal</th><th className="px-10 py-8 text-right">Repositório</th></tr></thead>
              <tbody className="divide-y divide-slate-800 text-[1.1em]">
                {legislationList.map((l, i) => (
                  <tr key={i} className="hover:bg-blue-600/5 transition-all font-bold"><td className="px-10 py-10"><p className="text-blue-500 uppercase tracking-tighter text-[1.2em]">{l.title}</p><p className="text-[14px] text-slate-500 italic mt-3">{l.desc}</p></td><td className="px-10 py-10 text-right"><a href={l.url} target="_blank" className="inline-flex items-center gap-3 text-slate-500 hover:text-white font-black text-[14px] uppercase border border-slate-800 px-6 py-3 rounded-2xl transition-all">Fonte Planalto <ExternalLink size={16}/></a></td></tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900 flex justify-between items-center text-[14px] font-mono text-slate-600 font-black uppercase tracking-[0.3em]"><p>© 2026 MARCUS ALEKS DEVELOPERS</p><div className="flex items-center gap-4 text-emerald-500 bg-emerald-500/5 px-8 py-4 rounded-full border border-emerald-500/10">SISTEMA OPERACIONAL</div></footer>
      <MadSignature />
    </div>
  );
}
