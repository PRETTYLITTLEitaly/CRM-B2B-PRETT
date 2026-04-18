import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  Users, 
  UserCircle, 
  ShoppingCart, 
  ArrowRight, 
  RefreshCw, 
  Package, 
  MapPin, 
  Mail,
  ChevronRight,
  SearchX
} from 'lucide-react';

const SearchResults = () => {
  const [results, setResults] = useState({ leads: [], customers: [], orders: [] });
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get('q') || '';

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.success) {
          setResults(result.data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const SectionHeader = ({ icon: Icon, title, count }) => (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-indigo-600">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">{title}</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trovati {count} risultati</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <RefreshCw className="w-10 h-10 animate-spin text-indigo-600 opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scansione database in corso...</p>
      </div>
    );
  }

  const hasResults = results.leads.length > 0 || results.customers.length > 0 || results.orders.length > 0;

  if (!hasResults) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-sm mx-auto">
        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-100">
          <SearchX className="w-10 h-10 text-slate-300" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Nessun Risultato</h2>
        <p className="text-xs font-bold text-slate-400 mt-2 leading-relaxed">
          Non abbiamo trovato nulla per <span className="text-indigo-600">"{query}"</span>. <br />
          Prova a cercare un numero d'ordine, un'email o un nome differente.
        </p>
        <button onClick={() => navigate(-1)} className="mt-10 btn-primary">Torna Indietro</button>
      </div>
    );
  }

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
          Risultati per <span className="text-indigo-600">"{query}"</span>
        </h1>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-indigo-50 rounded-full text-[10px] font-black text-indigo-600 uppercase">
            {results.leads.length + results.customers.length + results.orders.length} Totali
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-16">
        
        {/* ORDERS SECTION */}
        {results.orders.length > 0 && (
          <section>
            <SectionHeader icon={ShoppingCart} title="Ordini" count={results.orders.length} />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {results.orders.map(order => (
                <Link 
                  to={`/orders?id=${order.id}`} 
                  key={order.id}
                  className="card p-8 group hover:border-indigo-600 transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                    <Package className="w-12 h-12" />
                  </div>
                  <div className="relative z-10 space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ordine</p>
                        <h4 className="text-xl font-black text-slate-900 italic uppercase">#{order.orderNumber}</h4>
                      </div>
                      <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase">
                        {order.shopifyPaymentStatus || 'Success'}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cliente</p>
                      <p className="text-xs font-black text-slate-900 uppercase truncate">{order.customer?.businessName || '—'}</p>
                    </div>
                    <div className="flex items-center justify-between pt-4">
                      <p className="text-lg font-black text-slate-900 italic">€{parseFloat(order.totalAmount).toLocaleString()}</p>
                      <ChevronRight className="w-5 h-5 text-indigo-600 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CUSTOMERS SECTION */}
        {results.customers.length > 0 && (
          <section>
            <SectionHeader icon={UserCircle} title="Clienti" count={results.customers.length} />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {results.customers.map(customer => (
                <Link 
                  to={`/customers?id=${customer.id}`} 
                  key={customer.id}
                  className="card p-8 group hover:border-emerald-500 transition-all cursor-pointer overflow-hidden border-hidden relative"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-400 text-lg uppercase italic group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                      {customer.businessName?.substring(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-slate-900 uppercase truncate">{customer.businessName}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {customer.city}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-slate-500">
                      <Mail className="w-4 h-4" />
                      <span className="text-[11px] font-bold truncate">{customer.email || '—'}</span>
                    </div>
                    <button className="w-full py-3 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest group-hover:bg-emerald-500 group-hover:text-white transition-all">Apri Profilo Cliente</button>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* LEADS SECTION */}
        {results.leads.length > 0 && (
          <section>
            <SectionHeader icon={Users} title="Leads" count={results.leads.length} />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {results.leads.map(lead => (
                <Link 
                  to={`/leads?id=${lead.id}`} 
                  key={lead.id}
                  className="card p-8 group hover:border-amber-500 transition-all cursor-pointer relative bg-white border-slate-100"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                      {lead.status}
                    </div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">{lead.source || 'Direct'}</span>
                  </div>
                  <h4 className="text-base font-black text-slate-900 uppercase mb-2 group-hover:text-amber-600 transition-colors italic">{lead.storeName}</h4>
                  <p className="text-[11px] font-bold text-slate-500 mb-6 flex items-center gap-2">
                    <UserCircle className="w-3 h-3" /> {lead.contactName || 'Senza contatto'}
                  </p>
                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between group-hover:text-amber-600 transition-colors">
                    <span className="text-[10px] font-black uppercase tracking-widest">Dettagli Lead</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default SearchResults;
