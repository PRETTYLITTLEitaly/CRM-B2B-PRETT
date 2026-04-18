import React, { useState } from 'react';
import { Mail, Lock, LogIn, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Errore di connessione al server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />

      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-indigo-100/50 p-10 border border-slate-100 relative z-10">
          
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl italic mb-6 shadow-xl shadow-indigo-100">
              P
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
              Pretty<span className="text-indigo-600">B2B</span>
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Pannello Direzionale CRM</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Email Aziendale</label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@prettylittle.it"
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-rose-50 text-rose-600 rounded-2xl animate-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-[10px] font-black uppercase tracking-tight">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Accedi alla Piattaforma
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-slate-50 text-center">
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
              SISTEMA CRITTOGRAFATO A 256 BIT <br />© {new Date().getFullYear()} PRETTYLITTLEITALY CRM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
