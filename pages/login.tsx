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
        <div className="text-center space-y-8">
          <div className="inline-flex w-24 h-24 bg-blue-600 rounded-[2.5rem] items-center justify-center text-white shadow-2xl border border-blue-500/30 mx-auto"><Shield size={54} className="animate-pulse" /></div>
          <div className="space-y-4"><h1 className="text-white text-5xl font-black uppercase tracking-tighter italic">SIFAZ <span className="text-blue-500 text-sm not-italic font-bold ml-1">v.0.0.1</span></h1><p className="text-[12px] text-slate-500 font-mono uppercase tracking-[0.5em] font-black">Sistema de Inteligência Fazendária</p></div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 p-14 rounded-[3.5rem] backdrop-blur-2xl shadow-2xl space-y-12 relative overflow-hidden">
          <form onSubmit={handleLogin} className="space-y-10">
            <div className="space-y-4">
              <label className="text-[12px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-3"><Fingerprint size={18} /> Credencial Operacional</label>
              <div className="relative group">
                <Lock className={`absolute left-6 top-6 transition-colors ${error ? 'text-red-500' : 'text-slate-700 group-focus-within:text-blue-500'}`} size={26} />
                <input type={showKey ? "text" : "password"} required autoFocus className="w-full bg-black/60 border border-slate-800 focus:border-blue-600 rounded-2xl pl-16 pr-16 py-7 text-white font-mono text-lg outline-none transition-all placeholder:text-slate-900" placeholder="KEY" value={key} onChange={(e) => setKey(e.target.value)} />
                <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-6 top-7 text-slate-700 hover:text-slate-400">{showKey ? <EyeOff size={24} /> : <Eye size={24} />}</button>
              </div>
            </div>
            {error && <div className="bg-red-600/10 border border-red-600/20 p-5 rounded-2xl flex items-center gap-4 text-sm font-black uppercase text-red-500 animate-in slide-in-from-top-3"><AlertCircle size={24} /> Acesso Não Autorizado</div>}
            <button type="submit" disabled={loading} className={`w-full h-24 ${loading ? 'bg-slate-800' : 'bg-blue-600 hover:bg-blue-700'} text-white font-black rounded-2xl flex items-center justify-center gap-4 transition-all uppercase text-sm tracking-[0.3em] shadow-2xl`}>{loading ? <Activity size={28} className="animate-spin" /> : <>Validar Acesso <ArrowRight size={28} /></>}</button>
          </form>
          <div className="text-center pt-4"><Link href="/" className="text-[12px] font-black text-slate-700 hover:text-blue-500 uppercase tracking-widest inline-flex items-center gap-3"><X size={14} /> Abortar</Link></div>
        </div>
      </div>
      <footer className="fixed bottom-12 flex items-center gap-5 text-[13px] text-emerald-500 font-mono bg-emerald-500/5 px-10 py-4 rounded-full border border-emerald-500/10 backdrop-blur-xl">CORE: <span className="font-black">OPTIMAL</span> | ENCRYPTION: <span className="font-black">AES-256</span></footer>
    </div>
  );
}
