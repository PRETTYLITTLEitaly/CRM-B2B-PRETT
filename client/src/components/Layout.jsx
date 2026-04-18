import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users as UsersIcon, 
  UserCircle, 
  ShoppingCart, 
  Wallet,
  Calendar,
  MapPin, 
  TrendingUp, 
  Bell,
  Search,
  Settings,
  PanelLeft,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  ShieldCheck,
  Package,
  Clock,
  ChevronRight,
  SearchX
} from 'lucide-react';
import AIAssistant from './AIAssistant';

const DigitalClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const dayName = time.toLocaleDateString('it-IT', { weekday: 'short' }).split('.')[0].toUpperCase();
  const dateStr = time.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }).replace('.', '').toUpperCase();

  return (
    <div className="hidden lg:flex flex-col items-center border-l border-slate-100 px-10 h-12 justify-center">
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black text-slate-900 leading-none">{hours}</span>
        <span className="text-xl font-black text-slate-900 opacity-20">:</span>
        <span className="text-2xl font-black text-slate-900 leading-none">{minutes}</span>
        <span className="text-[10px] font-black text-slate-300 ml-1">:{seconds}</span>
      </div>
      <div className="flex gap-2 mt-1">
        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em]">{dayName}</span>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{dateStr}</span>
      </div>
    </div>
  );
};

const Layout = () => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [suggestions, setSuggestions] = useState({ leads: [], customers: [], orders: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const result = await res.json();
          if (result.success) {
            const custMap = new Map();
            (result.data.customers || []).forEach(c => {
              if (!c.businessName) {
                custMap.set(c.id, c);
                return;
              }
              const key = c.businessName.trim().toLowerCase();
              if (custMap.has(key)) {
                const existing = custMap.get(key);
                const isEmailDummy = (e) => !e || e.includes('no-email-');
                if (isEmailDummy(existing.email) && !isEmailDummy(c.email)) {
                  existing.email = c.email;
                  existing.city = c.city || existing.city;
                }
              } else {
                custMap.set(key, { ...c });
              }
            });
            result.data.customers = Array.from(custMap.values());
            
            setSuggestions(result.data);
            setShowSuggestions(true);
          }
        } catch (err) {
          console.error('Fetch suggestions error:', err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions({ leads: [], customers: [], orders: [] });
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/alerts');
      const result = await res.json();
      if (result.success) {
        setNotifications(result.data.notifications || []);
        setUnreadCount(result.data.count || 0);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // Polling ogni minuto
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const SuggestionItem = ({ icon: Icon, title, sub, link, type }) => (
    <div 
      onClick={() => {
        navigate(link);
        setSearchQuery('');
        setShowSuggestions(false);
      }}
      className="p-4 hover:bg-slate-50 cursor-pointer flex items-center gap-4 group transition-colors border-b border-slate-50 last:border-none"
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        type === 'order' ? 'bg-indigo-50 text-indigo-600' :
        type === 'customer' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
      }`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black text-slate-900 uppercase truncate group-hover:text-indigo-600 transition-colors">{title}</p>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{sub}</p>
      </div>
      <ChevronRight className="ml-auto w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
    </div>
  );

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/leads', icon: UsersIcon, label: 'Leads' },
    { path: '/customers', icon: UserCircle, label: 'Clienti' },
    { path: '/orders', icon: ShoppingCart, label: 'Ordini' },
    { path: '/payments', icon: Wallet, label: 'Pagamenti' },
    { path: '/calendar', icon: Calendar, label: 'Calendario' },
    { path: '/maps', icon: MapPin, label: 'Mappa' },
    { path: '/performance', icon: TrendingUp, label: 'Performance' },
  ];

  // Aggiungi Gestione Team solo se Super Admin
  if (user?.role === 'SUPER_ADMIN') {
    navItems.push({ path: '/team', icon: ShieldCheck, label: 'Gestione Team' });
  }

  return (
    <div className="flex h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-24' : 'w-80'} bg-white border-r border-slate-100 flex flex-col p-6 transition-all duration-500 ease-in-out relative`}>
        <div className={`mb-12 flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-4'}`}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl italic shrink-0 shadow-lg shadow-indigo-100">
            P
          </div>
          {!collapsed && (
            <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic animate-in fade-in slide-in-from-left-4 duration-500">
              Pretty<span className="text-indigo-600">B2B</span>
            </h1>
          )}
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${collapsed ? 'justify-center px-0' : ''} ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
              }
              title={collapsed ? item.label : ''}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="animate-in fade-in duration-500">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={`mt-auto p-4 bg-slate-50 rounded-3xl border border-slate-100 ${collapsed ? 'px-2' : ''}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden shrink-0">
              <img 
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.firstName || 'User'}&backgroundColor=6366f1`} 
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            {!collapsed && (
              <div className="min-w-0 animate-in fade-in duration-500">
                <p className="text-xs font-black text-slate-900 uppercase truncate">
                  {user?.firstName} {user?.lastName || ''}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{user?.role || 'Admin'}</p>
              </div>
            )}
            {!collapsed && (
              <div className="ml-auto flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-300 cursor-pointer hover:text-indigo-600 transition-colors" />
                <button onClick={logout} title="Logout">
                  <LogOut className="w-4 h-4 text-slate-300 cursor-pointer hover:text-rose-600 transition-colors" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center px-12 sticky top-0 z-50">
          
          {/* Collapse Toggle */}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:shadow-lg transition-all active:scale-90 mr-8"
          >
            {collapsed ? <PanelLeft className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-2xl">
            <form onSubmit={handleSearch} className="relative">
              <Search className={`w-4 h-4 absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${isSearching ? 'text-indigo-600 animate-pulse' : 'text-slate-400'}`} />
              <input 
                type="text" 
                placeholder="Cerca globalmente (Ordine #, Cliente, Email Lead...)" 
                value={searchQuery}
                onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-full py-4 pl-14 pr-6 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:bg-white transition-all border-none shadow-inner"
              />
            </form>

            {/* Instant Suggestions Dropdown */}
            {showSuggestions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSuggestions(false)} />
                <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-3xl shadow-2xl border border-slate-50 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    
                    {/* Orders */}
                    {suggestions.orders.length > 0 && (
                      <div className="p-2">
                        <p className="px-4 py-2 text-[9px] font-black text-slate-300 uppercase tracking-widest">Ordini Trovati</p>
                        {suggestions.orders.map(o => (
                          <SuggestionItem 
                            key={o.id}
                            icon={ShoppingCart}
                            type="order"
                            title={`Ordine #${o.orderNumber}`}
                            sub={o.customer?.businessName || 'Caricamento...'}
                            link={`/orders?id=${o.id}`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Customers */}
                    {suggestions.customers.length > 0 && (
                      <div className="p-2 border-t border-slate-50">
                        <p className="px-4 py-2 text-[9px] font-black text-slate-300 uppercase tracking-widest">Clienti</p>
                        {suggestions.customers.map(c => (
                          <SuggestionItem 
                            key={c.id}
                            icon={UserCircle}
                            type="customer"
                            title={c.businessName}
                            sub={`${c.city || ''} ${c.email || ''}`}
                            link={`/customers?id=${c.id}`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Leads */}
                    {suggestions.leads.length > 0 && (
                      <div className="p-2 border-t border-slate-50">
                        <p className="px-4 py-2 text-[9px] font-black text-slate-300 uppercase tracking-widest">Leads</p>
                        {suggestions.leads.map(l => (
                          <SuggestionItem 
                            key={l.id}
                            icon={UsersIcon}
                            type="lead"
                            title={l.storeName}
                            sub={`${l.contactName || ''} • ${l.status}`}
                            link={`/leads?id=${l.id}`}
                          />
                        ))}
                      </div>
                    )}

                    {/* No suggestions logic moved here within results check */}
                    {suggestions.orders.length === 0 && suggestions.customers.length === 0 && suggestions.leads.length === 0 && (
                      <div className="p-10 text-center opacity-40">
                        <SearchX className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Nessun suggerimento rapido</p>
                      </div>
                    )}

                  </div>
                  <div className="p-4 bg-slate-50 text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Premi INVIO per la ricerca avanzata</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Header Area */}
          <div className="flex items-center gap-6 ml-auto">
            <DigitalClock />

            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <div 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-4 rounded-2xl cursor-pointer transition-all relative group border ${showNotifications ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100/50 hover:bg-slate-100'}`}
              >
                <Bell className={`w-5 h-5 ${showNotifications ? 'text-indigo-600' : 'text-slate-600 group-hover:text-indigo-600'}`} />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-5 h-5 bg-rose-500 text-[9px] text-white font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </div>

              {/* Dropdown Panel */}
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-4 w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <Bell className="w-4 h-4 text-indigo-600" /> Centro Notifiche
                      </h3>
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">
                        {unreadCount} Recenti
                      </span>
                    </div>

                    <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-12 text-center">
                          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-6 h-6 text-slate-300" />
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tutto aggiornato!</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            className="p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group relative overflow-hidden"
                            onClick={() => {
                              if (notif.type === 'ORDER') navigate('/orders');
                              if (notif.type === 'CHURN') navigate('/customers');
                              setShowNotifications(false);
                            }}
                          >
                            <div className="flex gap-4 relative z-10">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                notif.severity === 'info' ? 'bg-blue-50 text-blue-600' :
                                notif.severity === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                              }`}>
                                {notif.type === 'ORDER' ? <ShoppingCart className="w-4 h-4" /> :
                                 notif.type === 'CHURN' ? <AlertTriangle className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight mb-1 group-hover:text-indigo-600 transition-colors">{notif.title}</p>
                                <p className="text-[11px] text-slate-500 leading-relaxed mb-2">{notif.message}</p>
                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                  <Clock className="w-3 h-3" /> {new Date(notif.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                            <div className="absolute right-0 top-0 h-full w-1 bg-transparent group-hover:bg-indigo-600 transition-all" />
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-4 bg-slate-50 text-center">
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                      >
                        Chiudi Pannello
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <button className="btn-primary">
              Nuovo Ordine
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-12 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
      <AIAssistant />
    </div>
  );
};

export default Layout;
