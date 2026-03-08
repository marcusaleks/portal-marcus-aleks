import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Shield, Activity, AlertTriangle, Search, ExternalLink, Globe, 
  Database, Fingerprint, Terminal, LogOut, Zap, Lock, BookOpen, 
  Gavel, FileText, LayoutDashboard, Copy, Check
} from 'lucide-react';

export default function SifazDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState('painel');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [osintQuery, setOsintQuery] = useState('');

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('mad_access_token');
      if (!token) {
        router.push('/');
        return;
      }
      setAuthorized(true);
    };
    checkAuth();
  }, [router]);

  // Lógica de Cópia de Dorks
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('mad_access_token');
    router.push('/');
  };

  const handleKillSwitch = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  if (!authorized) return (
    <div className="min-h-screen bg-[#020408] flex flex-col items-center justify-center text-slate-600 font-mono text-[10px] uppercase tracking-[0.5em]">
      <Lock size={20} className="mb-4 animate-pulse text-red-900" />
      SIFAZ: Authenticating Session...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020408] text-slate-400 font-sans selection:bg-blue-500/30">
      
      {/* 1. TOPBAR SIFAZ */}
      <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white shadow-lg shadow-blue-900/40">
              <Shield size={20}/>
            </div>
            <div>
              <h1 className="text-white font-black text-xl uppercase tracking-tighter">SIFAZ <span className="text-blue-500 text-xs ml-1">v.0.0.1</span></h1>
              <p className="text-[9px] text-slate-500 font-mono uppercase tracking-[0.3em]">Sistema de Inteligência Fazendária</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-1 mr-8">
              {[
                { id: 'painel', label: 'Painel', icon: <LayoutDashboard size={14}/> },
                { id: 'osint', label: 'OSINT & Dorks', icon: <Search size={14}/> },
                { id: 'legislacao', label: 'Legislação', icon: <Gavel size={14}/> }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>
            <div className="flex gap-2">
              <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-white transition-colors" title="Sair"><LogOut size={18}/></button>
              <button onClick={handleKillSwitch} className="p-2 text-red-600 hover:text-red-400 transition-colors" title="PANIC BUTTON"><Zap size={18}/></button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {/* ABA: PAINEL PRINCIPAL */}
        {activeTab === 'painel' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-xl">
                <p className="text-[10px] font-mono text-slate-500 uppercase mb-2">Casos Ativos</p>
                <p className="text-3xl font-black text-white">47</p>
              </div>
              <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-xl border-red-900/20">
                <p className="text-[10px] font-mono text-red-500 uppercase mb-2">Alertas Críticos</p>
                <p className="text-3xl font-black text-red-600">12</p>
              </div>
              <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-xl">
                <p className="text-[10px] font-mono text-blue-500 uppercase mb-2">Sync Status</p>
                <p className="text-3xl font-black text-blue-500 uppercase text-sm">Operacional</p>
              </div>
              <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-xl">
                <p className="text-[10px] font-mono text-slate-500 uppercase mb-2">Operador</p>
                <p className="text-xl font-black text-white uppercase truncate">MARCUS ALEKS</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
               <section className="bg-slate-900/10 border border-slate-800 p-6 rounded-xl">
                  <h2 className="text-blue-500 font-bold mb-6 flex items-center gap-2 uppercase tracking-widest text-[10px] border-b border-blue-900/20 pb-2">
                     <Activity size={14}/> Market Intelligence Radar
                  </h2>
                  <div className="space-y-4">
                     <div className="p-4 bg-black/40 border border-slate-800 rounded-lg">
                        <span className="text-[9px] text-blue-600 font-bold uppercase">08/03/2026</span>
                        <h3 className="text-white text-xs font-bold mt-1">Operação Longa Manus: Fraude de R$380M no ICMS-ST detectada</h3>
                     </div>
                  </div>
               </section>
               <section className="bg-slate-900/10 border border-slate-800 p-6 rounded-xl">
                  <h2 className="text-red-600 font-bold mb-6 flex items-center gap-2 uppercase tracking-widest text-[10px] border-b border-red-900/20 pb-2">
                     <AlertTriangle size={14}/> Cyber Intel Feed
                  </h2>
                  <div className="space-y-4">
                     <div className="p-4 bg-red-900/5 border border-red-900/20 rounded-lg">
                        <span className="text-[9px] text-red-600 font-bold uppercase">ALERTA</span>
                        <h3 className="text-white text-xs font-bold mt-1">Acesso atípico detectado no módulo SPED</h3>
                     </div>
                  </div>
               </section>
            </div>
          </div>
        )}

        {/* ABA: OSINT & DORKS */}
        {activeTab === 'osint' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <section className="bg-blue-900/5 border border-blue-900/30 p-8 rounded-2xl">
              <h2 className="text-blue-500 font-bold mb-6 flex items-center gap-2 uppercase tracking-widest text-xs"><Search size={18}/> Módulo de Busca Avançada OSINT</h2>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  className="bg-black border border-slate-800 rounded-lg px-4 py-3 flex-1 text-white font-mono text-sm focus:border-blue-500 outline-none transition-all"
                  placeholder="Inserir alvo, CNPJ ou Dork..."
                  value={osintQuery}
                  onChange={(e) => setOsintQuery(e.target.value)}
                />
                <button onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(osintQuery)}`, '_blank')} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-black text-xs uppercase tracking-widest transition-all">Scan Intelligence</button>
              </div>
            </section>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { id: 'd1', title: 'Consulta Cadastral RFB', code: 'site:receita.fazenda.gov.br OR site:cnpj.biz "CNPJ"', cat: 'Empresarial' },
                { id: 'd2', title: 'Sócios e Administradores', code: '"NOME EMPRESA" intext:"sócio" OR "administrador" site:jucesp.sp.gov.br', cat: 'Societário' },
                { id: 'd3', title: 'Documentos Fiscais Expostos', code: 'filetype:xml "nfeProc" OR "NFe xmlns" intext:"CNPJ"', cat: 'Vazamentos', risk: 'High' },
                { id: 'd4', title: 'Declarações de Bens (TSE)', code: 'site:divulgacandcontas.tse.jus.br "NOME ALVO" "bens"', cat: 'Patrimonial' }
              ].map((dork) => (
                <div key={dork.id} className="bg-slate-900/20 border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-slate-800 px-2 py-1 rounded text-[8px] font-black uppercase text-slate-400 tracking-widest">{dork.cat}</span>
                    {dork.risk && <span className="text-red-600 text-[8px] font-black uppercase tracking-widest">⚠ Risco Alto</span>}
                  </div>
                  <h3 className="text-white font-bold text-sm mb-3">{dork.title}</h3>
                  <div className="bg-black p-3 rounded border border-slate-800 font-mono text-[11px] text-blue-400 relative group">
                    <code className="break-all">{dork.code}</code>
                    <button 
                      onClick={() => copyToClipboard(dork.code, dork.id)}
                      className="absolute top-2 right-2 text-slate-600 hover:text-white transition-colors"
                    >
                      {copiedId === dork.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA: LEGISLAÇÃO */}
        {activeTab === 'legislacao' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-gradient-to-br from-blue-900/20 to-transparent border border-blue-900/30 p-8 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><BookOpen size={120}/></div>
              <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">Norma em Destaque</span>
              <h2 className="text-white text-2xl font-black mt-4 mb-2 uppercase tracking-tighter">Protocolo ICMS CONFAZ 66/2009</h2>
              <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">Dispõe sobre a utilização do Sistema de Informações sobre Movimentação de Pessoas — SIIAP pelos órgãos de inteligência fazendária.</p>
              <div className="grid md:grid-cols-3 gap-4 mt-8">
                <div className="bg-black/40 p-4 border border-slate-800 rounded">
                  <p className="text-[9px] text-slate-500 uppercase font-bold">Publicação</p>
                  <p className="text-white text-xs font-mono">DOU 17/08/2009</p>
                </div>
                <div className="bg-black/40 p-4 border border-slate-800 rounded">
                  <p className="text-[9px] text-slate-500 uppercase font-bold">Âmbito</p>
                  <p className="text-white text-xs font-mono">Estados + DF</p>
                </div>
                <div className="bg-black/40 p-4 border border-slate-800 rounded">
                  <p className="text-[9px] text-slate-500 uppercase font-bold">Status</p>
                  <p className="text-emerald-500 text-xs font-mono font-bold">VIGENTE</p>
                </div>
              </div>
            </div>

            <section className="bg-slate-900/20 border border-slate-800 rounded-xl overflow-hidden">
               <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/40">
                  <h3 className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2"><FileText size={16}/> Compêndio Legal SIFAZ</h3>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                     <thead className="bg-black/50 text-slate-500 font-mono text-[10px] uppercase">
                        <tr>
                           <th className="px-6 py-4">Norma</th>
                           <th className="px-6 py-4">Objeto</th>
                           <th className="px-6 py-4">Classificação</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-800">
                        {[
                          { id: 'CTN', title: 'Lei 5.172/66 (CTN)', desc: 'Código Tributário Nacional: Normas Gerais', cat: 'Federal' },
                          { id: 'LC87', title: 'LC 87/1996 (Lei Kandir)', desc: 'Regulamentação do ICMS e Substituição Tributária', cat: 'Federal' },
                          { id: 'AML', title: 'Lei 9.613/1998 (COAF)', desc: 'Lavagem de Capitais e Ocultação de Bens', cat: 'Investigação' },
                          { id: 'LGPD', title: 'Lei 13.709/18 (LGPD)', desc: 'Tratamento de Dados e Bases Legais Fiscais', cat: 'Proteção' }
                        ].map(norm => (
                           <tr key={norm.id} className="hover:bg-blue-600/5 transition-colors">
                              <td className="px-6 py-4 font-bold text-blue-500">{norm.title}</td>
                              <td className="px-6 py-4 text-slate-300">{norm.desc}</td>
                              <td className="px-6 py-4"><span className="bg-slate-800 px-2 py-1 rounded text-[9px] text-slate-400 uppercase font-black">{norm.cat}</span></td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </section>
          </div>
        )}

      </main>

      {/* 4. FOOTER SIFAZ */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-900 mt-20 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-3">
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.3em]">© 2026 SIFAZ v.0.0.1 - NÚCLEO DE INTELIGÊNCIA MARCUS ALEKS</p>
          <div className="flex gap-4">
            {['Turbopack', 'Auth Guard v5', 'OSINT Core'].map(t => (
              <span key={t} className="text-[8px] font-bold text-slate-800 border border-slate-900 px-2 py-0.5 rounded uppercase">{t}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-mono bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10 shadow-sm shadow-emerald-900/20">
          <Activity size={12} className="animate-pulse" /> SYSTEM: OPTIMAL
        </div>
      </footer>
    </div>
  );
}
