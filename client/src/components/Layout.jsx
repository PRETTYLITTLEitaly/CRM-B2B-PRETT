import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  ShoppingCart, 
  MapPin, 
  TrendingUp, 
  Bell,
  Search,
  Settings,
  Menu,
  X
} from 'lucide-react';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/leads', icon: Users, label: 'Leads' },
    { path: '/customers', icon: UserCircle, label: 'Clienti' },
    { path: '/orders', icon: ShoppingCart, label: 'Ordini' },
    { path: '/maps', icon: MapPin, label: 'Mappa' },
    { path: '/performance', icon: TrendingUp, label: 'Performance' },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] w-80 bg-white border-r border-slate-100 flex flex-col p-8 transition-transform duration-300 lg:relative lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="mb-12 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl italic">
              P
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">
              Pretty<span className="text-indigo-600">B2B</span>
            </h1>
          </div>
          <button 
            className="lg:hidden p-2 text-slate-400 hover:text-slate-900"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto p-4 bg-slate-50 rounded-3xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky" 
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 uppercase">Luca Vitale</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Admin</p>
            </div>
            <Settings className="w-4 h-4 text-slate-300 ml-auto cursor-pointer hover:text-indigo-600 transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Header */}
        <header className="h-20 lg:h-24 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 md:px-8 lg:px-12 sticky top-0 z-50">
          <div className="flex items-center gap-4 flex-1">
            <button 
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-xl"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative flex-1 max-w-96 hidden md:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Cerca..." 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-2.5 lg:py-3 pl-12 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600/10 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="p-2.5 lg:p-3 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all relative group">
              <Bell className="w-5 h-5 text-slate-600 group-hover:text-indigo-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full border-2 border-slate-50"></span>
            </div>
            <button className="btn-primary py-2.5 px-6 lg:py-4 lg:px-8">
              <span className="hidden sm:inline">Nuovo Ordine</span>
              <span className="sm:hidden text-lg">+</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 md:p-8 lg:p-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
