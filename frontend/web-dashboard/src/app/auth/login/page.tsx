'use client';
import { useState } from 'react';
import { useAppStore } from '@/store';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAppStore(state => state.login);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login({ id: '1', email, role: 'SUPER_ADMIN' }, 'mock-jwt-token');
    router.push('/dashboard');
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-background relative overflow-hidden" id="login-page">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="glass p-10 rounded-2xl shadow-2xl z-10 w-full max-w-md transition-all hover:shadow-primary/20">
        <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent" id="login-title">SentinAI SOC</h1>
        <p className="text-gray-400 mb-8 text-sm">Ingresa a tu central interconectada</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input 
              id="email-input"
              type="email" 
              className="mt-1 w-full bg-surface border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              value={email} onChange={(e) => setEmail(e.target.value)} required 
              placeholder="soc.ops@sentinai.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Contraseña</label>
            <input 
              id="password-input"
              type="password" 
              className="mt-1 w-full bg-surface border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              value={password} onChange={(e) => setPassword(e.target.value)} required 
              placeholder="••••••••••••"
            />
          </div>
          <button id="login-submit" type="submit" className="w-full bg-primary hover:bg-sky-400 text-slate-900 font-semibold py-2 px-4 rounded-lg transition-colors shadow-[0_0_15px_rgba(56,189,248,0.4)]">
            Ingreso Seguro
          </button>
        </form>
      </div>
    </main>
  );
}
