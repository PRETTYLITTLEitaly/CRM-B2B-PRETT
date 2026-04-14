import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  Users, UserCheck, ShoppingCart, Map as MapIcon, 
  Search, FileText, BarChart3, LayoutDashboard,
  Settings, LogOut
} from 'lucide-react';

const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `
      sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}
    `}
  >
    <Icon size={20} />
    <span>{label}</span>
  </NavLink>
);

const Layout = () => {
  const location = useLocation();
  
  // Mappa dei titoli per la testata
  const titles = {
    '/': 'Dashboard Overview',
    '/leads': 'Gestione Lead',
    '/customers': 'Database Clienti',
    '/orders': 'Monitoraggio Ordini',
    '/maps': 'Geolocalizzazione',
    '/find-clients': 'Ricerca Nuovi Prospect',
    '/invoices': 'Fiscale & Fatturazione',
    '/performance': 'Performance Analytics'
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* SIDEBAR FISSA */}
      <aside className="w-80 h-screen bg-white border-r border-slate-100 flex flex-col p-8 fixed left-0 top-0 z-50">
        {/* LOGO */}
        <div className="flex items-center gap-4 px-2 mb-12">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
            <span className="text-white font-black italic text-xl">P</span>
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter text-slate-900">PRETTYB2B</h1>
        </div>

        {/* NAVIGAZIONE PRINCIPALE */}
        <nav className="flex flex-col gap-2 flex-1">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <div className="my-4 h-px bg-slate-100 mx-4" />
          <NavItem to="/leads" icon={Users} label="Lead" />
          <NavItem to="/customers" icon={UserCheck} label="Clienti" />
          <NavItem to="/orders" icon={ShoppingCart} label="Ordini" />
          <NavItem to="/maps" icon={MapIcon} label="Mappe" />
          <NavItem to="/find-clients" icon={Search} label="Trova Cliente" />
          <NavItem to="/invoices" icon={FileText} label="Fatturazione" />
          <NavItem to="/performance" icon={BarChart3} label="Andamento" />
        </nav>

        {/* PROFILO UTENTE (BASSO) */}
        <div className="mt-auto pt-8 border-t border-slate-50">
          <div className="bg-slate-50 p-4 rounded-3xl flex items-center gap-4 border border-slate-100 group cursor-pointer hover:bg-white transition-all">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-black text-white shrink-0">LV</div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[10px] font-black uppercase text-slate-900 truncate">Luca Vitale</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase italic">Admin Platinum</span>
            </div>
            <LogOut size={16} className="ml-auto text-slate-300 group-hover:text-rose-500 transition-colors" />
          </div>
        </div>
      </aside>

      {/* CONTENT AREA */}
      <main className="flex-1 ml-80 p-12">
        <header className="mb-12 flex justify-between items-end">
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1 italic">
              Sezione Attuale
            </p>
            <h2 className="text-5xl font-black text-slate-900 italic tracking-tight uppercase">
              {titles[location.pathname] || 'PrettyB2B'}
            </h2>
          </div>
          
          <div className="flex gap-4">
             <button className="btn-secondary flex items-center gap-2">
                <Settings size={16} />
                <span>Impostazioni</span>
             </button>
             <button className="btn-primary">
                Quick Action
             </button>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
