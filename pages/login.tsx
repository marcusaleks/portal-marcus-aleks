import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    setError('');
    
    // Chamada à API que criámos no passo anterior
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (data.authenticated) {
      // Se a senha estiver correta, redireciona para o Dashboard de Intel
      router.push('/dashboard-intel');
    } else {
      setError('Credencial Inválida. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl text-center">
        <h2 className="text-2xl font-bold text-white tracking-tight mb-2 font-mono">AUTENTICAÇÃO DE NÍVEL 1</h2>
        <p className="text-slate-500 text-sm mb-8">Insira a sua credencial de 8 dígitos</p>
        
        <input 
          type="password" 
          maxLength={8}
          className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-lg focus:outline-none focus:border-red-500 transition-all text-center tracking-[1em] text-xl font-mono"
          placeholder="********"
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />

        {error && <p className="text-red-500 text-xs mt-4 font-mono uppercase tracking-tighter">{error}</p>}

        <button 
          onClick={handleLogin}
          className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg transition-all shadow-lg shadow-red-900/20"
        >
          ENTRAR NO SISTEMA
        </button>
      </div>
    </div>
  );
}
