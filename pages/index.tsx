import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Shield, Lock, ArrowRight, Activity, AlertCircle, 
  Terminal, ShieldCheck, Eye, EyeOff, Fingerprint, Zap
} from 'lucide-react';

export default function Login() {
  const [key, setKey] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const router = useRouter();

  // Protocolo de Boas-vindas e Logs de Inicialização
  useEffect(() => {
    const token = localStorage.getItem('mad_access_token');
    if (token) {
      router.push('/dashboard-intel');
    }

    const initLogs = [
      "Initializing SIFAZ Security Layer...",
      "Uplink established with Vercel Edge...",
      "Waiting for operational credentials..."
    ];
    
    initLogs.forEach((log, i) => {
      setTimeout(() => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`]), i * 800);
    });
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Validating key: ${'*'.repeat(key.length)}`]);
    
    // Recupera chaves autorizadas do ambiente
    const allowedKeys = process.env.NEXT_PUBLIC_ALLOWED_KEYS || "";
    const keysArray = allowedKeys.split(',').map(k => k.trim());

    setTimeout(() => {
      if (keysArray.includes(key)) {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Access Granted. Redirecting to SIFAZ...`]);
        localStorage.setItem('mad_access_token', 'session_' + Date.now());
        setTimeout(() => router.push('/dashboard-intel'), 1000);
      } else {
        setAttempts(prev => prev + 1);
        setError(true);
        setLoading(false);
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ERROR: Unauthorized access attempt #${attempts + 1}`]);
        setTimeout(() => setError(false), 3000);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#020408] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Background Grid Dinâmico */}
      <div className="absolute inset-0 z-0 opacity-20" 
           style={{ backgroundImage: 'radial-gradient(#1e40af 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md space-y-8 z-10 animate-in fade-in zoom-in duration-700">
        
        {/* Branding SIFAZ */}
        <div className="text-center space-y-4">
          <div className="inline-flex w-20 h-20 bg-blue-600 rounded-3xl items-center justify-center text-white shadow-[0_0_50px_rgba(37,99,235,0.4)] border border-blue-500/30 mx-auto">
            <Shield size={40} className="animate-pulse" />
          </div>
          <div className="space-y-1">
            <h1 className="text-white text-4xl font-black uppercase tracking-tighter italic">SIFAZ <span className="text-blue-500 text-xs ml-1 not-italic font-bold">v.0.0.1</span></h1>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.4em] font-black">Sistema de Inteligência Fazendária</p>
          </div>
        </div>

        {/* Módulo de Autenticação com Glassmorphism */}
        <div className="bg-slate-950/60 border border-slate-800 p-10 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-50"></div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Fingerprint size={12} /> Chave Operacional
              </label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-4.5 transition-colors ${error ? 'text-red-500' : 'text-slate-700 group-focus-within:text-blue-500'}`} size={20} />
                <input 
                  type={showKey ? "text" : "password"}
                  required
                  className={`w-full bg-black/60 border ${error ? 'border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.1)]' : 'border-slate-800 focus:border-blue-600'} rounded-2xl pl-12 pr-12 py-5 text-white font-mono text-sm outline-none transition-all`}
                  placeholder="DIGITE A CREDENCIAL"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-4 top-5 text-slate-700 hover:text-slate-400 transition-colors"
                >
                  {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-600/10 border border-red-600/20 p-3 rounded-xl flex items-center gap-3 text-red-500 text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top-2">
                <AlertCircle size={16} /> Credencial Inválida
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className={`w-full h-16 ${loading ? 'bg-slate-800' : 'bg-blue-600 hover:bg-blue-700'} text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.97] uppercase text-xs tracking-[0.2em] shadow-lg shadow-blue-900/20`}
            >
              {loading ? <Activity size={18} className="animate-spin" /> : <>Iniciar Protocolo <ArrowRight size={18} /></>}
            </button>
          </form>

          {/* Terminal de Logs Interno (Restaurado) */}
          <div className="bg-black/80 rounded-xl p-4 font-mono text-[8px] space-y-1 h-24 overflow-y-auto border border-slate-900/50 scrollbar-hide">
            {logs.map((log, i) => (
              <p key={i} className="text-slate-600"><span className="text-blue-900 font-bold">#</span> {log}</p>
            ))}
          </div>
        </div>

        <div className="text-center space-y-4">
          <button onClick={() => window.location.href = '/'} className="text-[9px] font-black text-slate-700 hover:text-blue-500 uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto">
             <Zap size={10} /> Retornar ao Terminal Financeiro
          </button>
        </div>
      </div>

      {/* Status de Sistema */}
      <footer className="fixed bottom-10 flex items-center gap-3 text-[10px] text-emerald-500 font-mono bg-emerald-500/5 px-6 py-3 rounded-full border border-emerald-500/10 backdrop-blur-md">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        SYSTEM CORE: <span className="font-black">OPTIMAL</span>
        <span className="text-slate-800 px-2">|</span>
        ENCRYPTION: <span className="font-black">AES-256</span>
      </footer>
    </div>
  );
}
