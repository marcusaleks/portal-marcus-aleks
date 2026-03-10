import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
    if (token) router.push('/dashboard-intel');
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: key.trim() })
      });
      if (res.ok) {
        localStorage.setItem('mad_access_token', 'session_' + Date.now());
        router.push('/dashboard-intel');
      } else { throw new Error(); }
    } catch (err) { setError(true); setLoading(false); setTimeout(() => setError(false), 3000); }
  };

  return (
    <div className="min-h-screen bg-[#020408] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden" style={{ fontSize: '1.2em' }}>
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#2563eb 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="w-full max-w-xl space-y-12 z-10 animate-in fade-in zoom-in duration-1000">
        
        {/* Janela de Login: Referências SIFAZ Removidas */}
        <div className="bg-slate-950/60 border border-slate-800 p-16 rounded-[4rem] backdrop-blur-2xl shadow-2xl space-y-12 relative overflow-hidden">
          <div className="text-center space-y-4">
             <div className="inline-flex w-20 h-20 bg-blue-600 rounded-2xl items-center justify-center text-white border border-blue-500/30 mx-auto shadow-2xl"><Lock size={36} /></div>
             <h2 className="text-white text-3xl font-black uppercase tracking-widest italic">Autenticação</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-10">
            <div className="space-y-4">
              <label className="text-[14px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-3"><Fingerprint size={20} /> Credencial Operacional</label>
              <div className="relative group">
                <Lock className={`absolute left-6 top-7 transition-colors ${error ? 'text-red-500' : 'text-slate-700 group-focus-within:text-blue-500'}`} size={28} />
                <input type={showKey ? "text" : "password"} required autoFocus className="w-full bg-black/60 border border-slate-800 focus:border-blue-600 rounded-2xl pl-16 pr-16 py-8 text-white font-mono text-xl outline-none transition-all" placeholder="CHAVE" value={key} onChange={(e) => setKey(e.target.value)} />
                <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-6 top-8 text-slate-700 hover:text-slate-400">{showKey ? <EyeOff size={26} /> : <Eye size={26} />}</button>
              </div>
            </div>
            {error && <div className="bg-red-600/10 border border-red-600/20 p-6 rounded-2xl flex items-center gap-4 text-[16px] font-black uppercase text-red-500 animate-in slide-in-from-top-3"><AlertCircle size={26} /> Acesso Negado</div>}
            <button type="submit" disabled={loading} className={`w-full h-24 ${loading ? 'bg-slate-800' : 'bg-blue-600 hover:bg-blue-700'} text-white font-black rounded-2xl flex items-center justify-center gap-4 transition-all uppercase text-[16px] tracking-[0.3em] shadow-2xl`}>{loading ? <Activity size={32} className="animate-spin" /> : <>Entrar <ArrowRight size={32} /></>}</button>
          </form>
          <div className="text-center pt-4"><Link href="/" className="text-[14px] font-black text-slate-700 hover:text-blue-500 uppercase tracking-widest inline-flex items-center gap-3"><X size={16} /> Cancelar</Link></div>
        </div>
      </div>
      <footer className="fixed bottom-12 flex items-center gap-5 text-[14px] text-emerald-500 font-mono bg-emerald-500/5 px-10 py-5 rounded-full border border-emerald-500/10 backdrop-blur-xl">© 2026 - MARCUS ALEKS DEVELOPERS</footer>
    </div>
  );
}
