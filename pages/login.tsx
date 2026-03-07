import React, { useState } from 'react';

export default function Login() {
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // A lógica de validação avançada faremos no próximo passo
    alert('Validando credencial: ' + password);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white tracking-tight">ACESSO RESTRITO</h2>
          <p className="text-slate-500 text-sm mt-2">Insira sua credencial de 8 dígitos</p>
        </div>
        <input 
          type="password" 
          maxLength={8}
          className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-lg focus:outline-none focus:border-red-500 transition-all text-center tracking-[1em] text-xl"
          placeholder="********"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button 
          onClick={handleLogin}
          className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg transition-all shadow-lg shadow-red-900/20"
        >
          AUTENTICAR
        </button>
      </div>
    </div>
  );
}
