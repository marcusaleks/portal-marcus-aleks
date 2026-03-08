import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Shield, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function Login() {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const authResponse = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });

      if (authResponse.ok) {
        // Sucesso: Salvando o token exatamente como o Dashboard espera
        localStorage.setItem('mad_access_token', 'AUTHORIZED_LEVEL_5');
        router.push('/dashboard-intel');
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full">
        <Link href="/" className="text-slate-600 hover:text-blue-500 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-12 transition-all">
          <ArrowLeft size={14} /> Voltar ao Terminal
        </Link>

        <div className="bg-slate-950 border border-slate-800 p-10 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-500 mb-4 border border-blue-500/20">
              <Shield size={32} />
            </div>
            <h1 className="text-white text-2xl font-black uppercase tracking-tighter">Acesso Restrito</h1>
            <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] mt-2 font-bold">Autenticação de Agente</p>
          </div>

          <form onSubmit={handleAccess} className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Chave de Operação</label>
              <div className="relative">
                <input 
                  type="password" 
                  autoFocus
                  className={`w-full bg-black border ${error ? 'border-red-600' : 'border-slate-800'} rounded-lg px-4 py-3 text-white font-mono focus:border-blue-600 outline-none transition-all`}
                  placeholder="••••••••••••"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                />
                <Lock size={16} className="absolute right-4 top-3.5 text-slate-700" />
              </div>
              {error && <p className="text-red-600 text-[9px] font-black uppercase mt-2 tracking-widest">Acesso Negado: Credencial Inválida</p>}
            </div>

            <button 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white py-4 rounded-lg font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Sincronizar Credencial'}
            </button>
          </form>
        </div>
        
        <p className="text-center mt-8 text-[8px] font-mono text-slate-700 uppercase tracking-widest leading-loose">
          AVISO: Tentativas de acesso não autorizado são <br/> monitoradas e registradas pelo núcleo MAD.
        </p>
      </div>
    </div>
  );
}
