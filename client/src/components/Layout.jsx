import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';

const NavItem = ({ to, label }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `
      flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold uppercase text-[10px] tracking-widest ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'}
    `}
  >
    <span>{label}</span>
  </NavLink>
);

const Layout = () => {
  const location = useLocation();
  
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
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="w-80 h-screen bg-white border-r border-slate-100 flex flex-col p-8 fixed left-0 top-0 z-50">
        <div className="flex items-center gap-4 px-2 mb-12">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center">
            <span className="text-white font-black italic text-xl">P</span>
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter">PRETTYB2B</h1>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <NavItem to="/" label="Dashboard" />
          <NavItem to="/leads" label="Lead" />
          <NavItem to="/customers" label="Clienti" />
          <NavItem to="/orders" label="Ordini" />
          <NavItem to="/maps" label="Mappe" />
          <NavItem to="/find-clients" label="Trova Cliente" />
          <NavItem to="/invoices" label="Fatturazione" />
          <NavItem to="/performance" label="Andamento" />
        </nav>
      </aside>

      <main className="flex-1 ml-80 p-12">
        <header className="mb-12">
           <h2 className="text-5xl font-black italic tracking-tight uppercase">
              {titles[location.pathname] || 'PrettyB2B'}
           </h2>
        </header>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
