import React, { useState, useEffect } from 'react';
import { 
  Users, ShoppingBag, TrendingUp, AlertCircle, 
  ArrowRight, UserPlus, FileText, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AlertWidget from '../components/AlertWidget';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="card group">
    <div className="flex justify-between items-start mb-8">
      <div className={`p-5 rounded-3xl ${color} bg-opacity-10`}>
        <Icon size={32} className={color.replace('bg-', 'text-')} />
      </div>
      <div className={`flex items-center gap-1 text-[10px] font-black uppercase italic ${trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
        {trend >= 0 ? '+' : ''}{trend}%
        {trend >= 0 ? <TrendingUp size={14} /> : <Activity size={14} />}
      </div>
    </div>
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{title}</p>
    <h3 className="text-4xl font-black text-slate-900 italic tracking-tight">{value}</h3>
    <div className="mt-6 flex items-center justify-between text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
       <span>Aggiornato ora</span>
       <ArrowRight size={14} className="group-hover:translate-x-1 group-hover:text-indigo-600 transition-all cursor-pointer" />
    </div>
  </div>
);

const Dashboard = () => {
  // Demo data (in produzione verrebbe da axios.get('/api/dashboard/stats'))
  const stats = [
    { title: "Totale Lead", value: "1,284", icon: Users, color: "bg-indigo-600", trend: 12 },
    { title: "Clienti Attivi", value: "482", icon: UserCheck, color: "bg-indigo-600", trend: 5 },
    { title: "Ordini Mensili", value: "156", icon: ShoppingBag, color: "bg-indigo-600", trend: 22 },
    { title: "Fatturato Mese", value: "€42,850", icon: TrendingUp, color: "bg-indigo-600", trend: 18 }
  ];

  return (
    <div className="space-y-12">
      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ALERT HUB (LARGHEZZA 2/3) */}
        <div className="lg:col-span-2">
           <AlertWidget />
        </div>

        {/* QUICK MENU (LARGHEZZA 1/3) */}
        <div className="card !bg-slate-900 border-0 p-12">
           <h3 className="text-xl font-black text-white italic uppercase mb-10 tracking-tight">Focus Rapido</h3>
           <div className="space-y-4">
              <Link to="/find-clients" className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all text-white group">
                  <div className="flex items-center gap-4">
                    <Search className="text-indigo-400" size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Trova Clienti</span>
                  </div>
                  <ArrowRight size={16} className="text-white/20 group-hover:translate-x-1 transition-all" />
              </Link>
              <Link to="/invoices" className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all text-white group">
                  <div className="flex items-center gap-4">
                    <FileText className="text-indigo-400" size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Insoluti</span>
                  </div>
                  <ArrowRight size={16} className="text-white/20 group-hover:translate-x-1 transition-all" />
              </Link>
              <Link to="/leads" className="flex items-center justify-between p-6 bg-white/10 rounded-3xl border border-indigo-500/30 hover:bg-white/20 transition-all text-white group">
                  <div className="flex items-center gap-4">
                    <UserPlus className="text-indigo-400" size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Aggiungi Lead</span>
                  </div>
                  <ArrowRight size={16} className="text-white/20 group-hover:translate-x-1 transition-all" />
              </Link>
           </div>
           <p className="mt-8 text-[9px] font-bold text-slate-500 uppercase italic text-center leading-relaxed">
             Software ottimizzato per <br/> vendite B2B retail alta gamma
           </p>
        </div>
      </div>
    </div>
  );
};

// Mock del componente UserCheck che non avevo importato
const UserCheck = ({ size, className }) => <Users size={size} className={className} />;

export default Dashboard;
