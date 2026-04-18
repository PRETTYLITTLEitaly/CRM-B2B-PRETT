import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  CreditCard, 
  Wallet, 
  Banknote, 
  Clock, 
  CheckCircle2, 
  Filter,
  ArrowRight,
  ChevronRight,
  TrendingDown,
  Info
} from 'lucide-react';
import OrderDrawer from '../components/OrderDrawer';

import SegmentBadge from '../components/SegmentBadge';

const Payments = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, SETTLED
  const [methodFilter, setMethodFilter] = useState('ALL'); // ALL, BONIFICO, CONTANTI, etc.
  const [yearFilter, setYearFilter] = useState('2026'); // Prevents loading all historical data at once

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      const result = await response.json();
      setOrders(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getCustomerTotal = (customerId) => {
    if (!customerId) return 0;
    return orders.filter(o => o.customerId === customerId).reduce((s, o) => s + parseFloat(o.totalAmount || 0), 0);
  };

  const filteredOrders = orders.filter(order => {
    const statusMatch = filter === 'ALL' || (filter === 'PENDING' && order.paymentStatus !== 'SALDATO') || (filter === 'SETTLED' && order.paymentStatus === 'SALDATO');
    const methodMatch = methodFilter === 'ALL' || order.paymentMethod === methodFilter;
    
    let yearMatch = true;
    if (yearFilter !== 'ALL') {
      if (order.date) {
        const orderYear = new Date(order.date).getFullYear().toString();
        yearMatch = orderYear === yearFilter;
      } else {
        yearMatch = false;
      }
    }
    
    return statusMatch && methodMatch && yearMatch;
  });

  const stats = {
    pending: filteredOrders.filter(o => o.paymentStatus !== 'SALDATO').reduce((s, o) => s + (parseFloat(o.totalAmount) || 0), 0),
    settled: filteredOrders.filter(o => o.paymentStatus === 'SALDATO').reduce((s, o) => s + (parseFloat(o.totalAmount) || 0), 0),
    bonifico: filteredOrders.filter(o => o.paymentMethod === 'BONIFICO').reduce((s, o) => s + (parseFloat(o.totalAmount) || 0), 0),
    contanti: filteredOrders.filter(o => o.paymentMethod === 'CONTANTI').reduce((s, o) => s + (parseFloat(o.totalAmount) || 0), 0),
    assegno: filteredOrders.filter(o => o.paymentMethod?.includes('ASSEGNO')).reduce((s, o) => s + (parseFloat(o.totalAmount) || 0), 0),
    provvigione: (user?.commissionRate || 0) > 0 ? filteredOrders.reduce((s, order) => {
      if (order.commissionEnabled === false) return s;
      let products = [];
      try { products = typeof order.productsJson === 'string' ? JSON.parse(order.productsJson) : (order.productsJson || []); } catch(e) {}
      let discounts = [];
      try { discounts = typeof order.discountsJson === 'string' ? JSON.parse(order.discountsJson) : (order.discountsJson || []); } catch(e) {}
      
      const hasSconto = discounts.some(d => d.code && d.code.toUpperCase().replace(/\s/g, '') === 'SCONTO22');
      const subtotal = products.reduce((sum, item) => sum + (parseFloat(item.price || 0) * (item.quantity || 1)), 0);
      const commissionBase = hasSconto ? subtotal : (subtotal * 0.78);

      return s + ((commissionBase * user.commissionRate) / 100);
    }, 0) : 0
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative z-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
            Monitor <span className="text-indigo-600">Pagamenti.</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Gestione flussi finanziari e pendenze B2B</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100 overflow-x-auto scrollbar-none max-w-full">
            {['ALL', '2026', '2025', '2024', '2023'].map((y) => (
              <button
                key={y}
                onClick={() => setYearFilter(y)}
                className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  yearFilter === y ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {y === 'ALL' ? 'Totale' : y}
              </button>
            ))}
          </div>

          <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
            {['ALL', 'PENDING', 'SETTLED'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {f === 'ALL' ? 'Tutti' : f === 'PENDING' ? 'Pendenze' : 'Saldati'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-2 gap-4 ${user?.commissionRate > 0 ? 'xl:grid-cols-6 lg:grid-cols-3' : 'xl:grid-cols-5 lg:grid-cols-3'}`}>
        <div className="p-6 bg-amber-500 text-white rounded-[2rem] shadow-xl shadow-amber-100 flex flex-col justify-center gap-1 relative overflow-hidden group">
          <Clock className="absolute -right-4 -bottom-4 w-16 h-16 opacity-10 group-hover:scale-110 transition-transform duration-500" />
          <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">Pendente</p>
          <h3 className="text-2xl font-black italic tracking-tighter">€{stats.pending.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
        </div>
        <div className="p-6 bg-indigo-600 text-white rounded-[2rem] shadow-xl shadow-indigo-100 flex flex-col justify-center gap-1 relative overflow-hidden group">
          <CheckCircle2 className="absolute -right-4 -bottom-4 w-16 h-16 opacity-10 group-hover:scale-110 transition-transform duration-500" />
          <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">Incassato</p>
          <h3 className="text-2xl font-black italic tracking-tighter">€{stats.settled.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
        </div>
        {user?.commissionRate > 0 && (
          <div className="p-6 bg-emerald-500 text-white rounded-[2rem] shadow-xl shadow-emerald-100 flex flex-col justify-center gap-1 relative overflow-hidden group">
            <TrendingDown className="absolute -right-4 -bottom-4 w-16 h-16 opacity-10 group-hover:scale-110 transition-transform duration-500" />
            <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">Provvigioni</p>
            <h3 className="text-2xl font-black italic tracking-tighter">€{stats.provvigione.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        )}
        <div className="p-6 bg-white border border-slate-100 rounded-[2rem] flex flex-col justify-center gap-1 relative overflow-hidden group">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Bonifici</p>
          <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter border-b-2 border-slate-100 pb-1 max-w-max">€{stats.bonifico.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
        </div>
        <div className="p-6 bg-white border border-slate-100 rounded-[2rem] flex flex-col justify-center gap-1 relative overflow-hidden group">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Contanti</p>
          <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter border-b-2 border-emerald-100 pb-1 max-w-max">€{stats.contanti.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
        </div>
        <div className="p-6 bg-white border border-slate-100 rounded-[2rem] flex flex-col justify-center gap-1 relative overflow-hidden group">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Assegni</p>
          <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter border-b-2 border-slate-100 pb-1 max-w-max">€{stats.assegno.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
        {['ALL', 'BONIFICO', 'CONTANTI', 'RIBA', 'CARTA', 'PAYPAL', 'ASSEGNO BANCARIO', 'ASSEGNO BANCARIO P.D.'].map(m => (
          <button
            key={m}
            onClick={() => setMethodFilter(m)}
            className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
              methodFilter === m 
              ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
              : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-200'
            }`}
          >
            {m === 'ALL' ? 'Tutti i Metodi' : m}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden !p-0 rounded-[3rem] border-slate-100 shadow-xl shadow-slate-100/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-10 py-6">Emettitore / Data</th>
                <th className="px-6 py-6">Metodo</th>
                <th className="px-6 py-6 text-center">Sconto 22</th>
                <th className="px-6 py-6 text-right">Importo</th>
                {user?.commissionRate > 0 && (
                  <th className="px-6 py-6 text-center">Provvigione</th>
                )}
                <th className="px-6 py-6">Stato</th>
                <th className="px-10 py-6 text-center">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={user?.commissionRate > 0 ? "7" : "6"} className="py-24 text-center">
                    <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={user?.commissionRate > 0 ? "7" : "6"} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                      <Wallet className="w-12 h-12" />
                      <p className="text-[10px] font-black uppercase tracking-widest italic">Nessuna pendenza trovata</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-indigo-50/30 transition-all group cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-10 py-7">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-all">
                          {order.customer?.businessName || 'Cliente Shopify'}
                          <SegmentBadge totalSpent={getCustomerTotal(order.customerId)} />
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">#{order.orderNumber} - {new Date(order.date).toLocaleDateString('it-IT')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-7">
                       <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${order.paymentMethod === 'BONIFICO' ? 'bg-blue-50 text-blue-600' : (order.paymentMethod === 'CONTANTI' || order.paymentMethod?.includes('ASSEGNO')) ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                            {order.paymentMethod === 'BONIFICO' ? <CreditCard className="w-4 h-4" /> : <Banknote className="w-4 h-4" />}
                          </div>
                          <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{order.paymentMethod || 'Da Definire'}</span>
                       </div>
                    </td>
                    <td className="px-6 py-7 text-center">
                      {(() => {
                        let discounts = [];
                        try { discounts = typeof order.discountsJson === 'string' ? JSON.parse(order.discountsJson) : (order.discountsJson || []); } catch(e) {}
                        const hasSconto = discounts.some(d => d.code && d.code.toUpperCase().replace(/\s/g, '') === 'SCONTO22');
                        return hasSconto ? (
                          <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-md text-[10px] font-black uppercase tracking-widest">Si</span>
                        ) : (
                          <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-md text-[10px] font-black uppercase tracking-widest">No</span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-7 text-right">
                      <span className="text-lg font-black text-slate-900 italic tracking-tighter leading-none">
                        €{parseFloat(order.totalAmount).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    {user?.commissionRate > 0 && (
                      <td className="px-6 py-7 text-center">
                        {(() => {
                          if (order.commissionEnabled === false) {
                            return (
                              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg line-through">
                                €0,00
                              </span>
                            );
                          }
                          let products = [];
                          try { products = typeof order.productsJson === 'string' ? JSON.parse(order.productsJson) : (order.productsJson || []); } catch(e) {}
                          let discounts = [];
                          try { discounts = typeof order.discountsJson === 'string' ? JSON.parse(order.discountsJson) : (order.discountsJson || []); } catch(e) {}
                          
                          const hasSconto = discounts.some(d => d.code && d.code.toUpperCase().replace(/\s/g, '') === 'SCONTO22');
                          const subtotal = products.reduce((sum, item) => sum + (parseFloat(item.price || 0) * (item.quantity || 1)), 0);
                          const commissionBase = hasSconto ? subtotal : (subtotal * 0.78);

                          return (
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg ring-1 ring-emerald-100">
                              €{((commissionBase * user.commissionRate) / 100).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          );
                        })()}
                      </td>
                    )}
                    <td className="px-6 py-7">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight border ${
                        order.paymentStatus === 'SALDATO' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {order.paymentStatus === 'SALDATO' ? 'Saldato' : 'In Sospeso'}
                      </span>
                    </td>
                    <td className="px-10 py-7 text-center">
                      <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 group-hover:text-indigo-600 group-hover:shadow-lg transition-all active:scale-95">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderDrawer 
        order={selectedOrder} 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        onUpdate={() => fetchOrders()}
      />
    </div>
  );
};

export default Payments;
