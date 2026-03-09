import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Shield, Lock, ArrowRight, Activity, AlertCircle, Fingerprint, Eye, EyeOff, X } from 'lucide-react';

export default function Login() {
  const [key, setKey] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('mad_access_token');
    if (token) { router.push('/dashboard-intel'); }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const allowedKeys = process.env.NEXT_PUBLIC_ALLOWED_KEYS || "";
    const keysArray = allowedKeys.split(',').map(k => k.trim());

    if (keysArray.includes(key)) {
      localStorage.setItem('mad_access_token', 'session_' + Date.now());
      router.push('/dashboard-intel');
    } else {
      setError(true);
      setLoading(false);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Grid Pattern de Fundo Restaurado */}
      <div className="absolute inset-0 z-0 opacity-10" 
           style={{ backgroundImage: 'radial-gradient(#2563eb 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/10 blur-[150px] rounded-full"></div>

      <div className="w-full max-w-md space-y-10 z-10 animate-in fade-in zoom-in duration-1000">
        
        {/* BRANDING SIFAZ INTEGRAL */}
        <div className="text-center space-y-6">
          <div className="inline-flex w-24 h-24 bg-blue-600 rounded-[2.5rem] items-center justify-center text-white shadow-[0_0_60px_rgba(37,99,235,0.4)] border border-blue-500/30 mx-auto transition-transform hover:scale-105 duration-500">
            <Shield size={48} className="animate-pulse" />
          </div>
          <div className="space-y-2">
            <h1 className="text-white text-5xl font-black uppercase tracking-tighter italic">SIFAZ <span className="text-blue-500 text-sm not-italic font-bold tracking-normal ml-1">v.0.0.1</span></h1>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.5em] font-black">Sistema de Inteligência Fazendária</p>
          </div>
        </div>

        {/* MÓDULO DE AUTENTICAÇÃO GLASSMORPHISM */}
        <div className="bg-slate-950/60 border border-slate-800 p-12 rounded-[3rem] backdrop-blur-2xl shadow-2xl space-y-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-40"></div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Fingerprint size={14} /> Credencial de Acesso Operacional
              </label>
              <div className="relative group">
                <Lock className={`absolute left-5 top-5 transition-colors duration-500 ${error ? 'text-red-500' : 'text-slate-700 group-focus-within:text-blue-500'}`} size={22} />
                <input 
                  type={showKey ? "text" : "password"}
                  required
                  autoFocus
                  className={`w-full bg-black/60 border ${error ? 'border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.15)]' : 'border-slate-800 focus:border-blue-600'} rounded-2xl pl-14 pr-14 py-6 text-white font-mono text-base outline-none transition-all duration-500 placeholder:text-slate-900`}
                  placeholder="CERTIFICADO DIGITAL / KEY"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-5 top-6 text-slate-700 hover:text-slate-400 transition-colors"
                >
                  {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-600/10 border border-red-600/20 p-4 rounded-2xl flex items-center gap-4 text-red-500 text-xs font-black uppercase tracking-widest animate-in slide-in-from-top-3">
                <AlertCircle size={20} /> Acesso Não Autorizado
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className={`w-full h-20 ${loading ? 'bg-slate-800 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/30'} text-white font-black rounded-2xl flex items-center justify-center gap-4 transition-all duration-500 active:scale-[0.96] uppercase text-sm tracking-[0.3em] shadow-2xl`}
            >
              {loading ? <Activity size={24} className="animate-spin" /> : <>Validar Acesso <ArrowRight size={22} /></>}
            </button>
          </form>

          {/* RODAPÉ DO MÓDULO */}
          <div className="text-center pt-2">
             <Link href="/" className="text-[10px] font-black text-slate-700 hover:text-blue-500 uppercase tracking-widest transition-colors inline-flex items-center gap-2">
                <X size={12} /> Abortar Procedimento
             </Link>
          </div>
        </div>
      </div>

      <footer className="fixed bottom-12 flex items-center gap-4 text-[11px] text-emerald-500 font-mono bg-emerald-500/5 px-8 py-4 rounded-full border border-emerald-500/10 backdrop-blur-xl shadow-inner">
        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
        SYSTEM CORE: <span className="font-black">OPTIMAL</span>
        <span className="text-slate-800 mx-2">|</span>
        ENCRYPTION: <span className="font-black">MIL-SPEC AES-256</span>
      </footer>
    </div>
  );
}
