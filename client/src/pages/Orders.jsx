import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  RefreshCw, 
  ChevronRight
} from 'lucide-react';
import OrderDrawer from '../components/OrderDrawer';
import SegmentBadge from '../components/SegmentBadge';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const getCustomerTotal = (customerId) => {
    if (!customerId) return 0;
    return orders.filter(o => o.customerId === customerId).reduce((s, o) => s + parseFloat(o.totalAmount || 0), 0);
  };

  const fetchOrders = async (sync = false) => {
    try {
      setLoading(true);
      const url = sync ? '/api/shopify/sync' : '/api/orders';
      const response = await fetch(url);
      const result = await response.json();
      
      const actualOrders = result.data || result;
      
      if (sync) {
        const dbResponse = await fetch('/api/orders');
        const dbResult = await dbResponse.json();
        setOrders(dbResult.data || []);
      } else {
        setOrders(Array.isArray(actualOrders) ? actualOrders : []);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Search & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative z-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
            Registro <span className="text-indigo-600">Ordini.</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{orders.length} Transazioni sincronizzate</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => fetchOrders(true)} 
            disabled={loading}
            className={`px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-100 hover:bg-black transition-all active:scale-95 flex items-center gap-3 ${loading ? 'opacity-50' : ''}`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sincronizza Shopify
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-indigo-600 text-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 flex flex-col gap-1 relative overflow-hidden group">
          <ShoppingCart className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform duration-500" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Totale Ordini</p>
          <h3 className="text-4xl font-black italic tracking-tighter">{orders.length}</h3>
        </div>
        <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] flex flex-col gap-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">In Sospeso</p>
          <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter">
            {orders.filter(o => o.fulfillmentStatus !== 'fulfilled').length}
          </h3>
        </div>
        <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] flex flex-col gap-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Faturato Today</p>
          <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter">
            €{orders.filter(o => new Date(o.date).toDateString() === new Date().toDateString()).reduce((s,o) => s + o.totalAmount, 0).toLocaleString()}
          </h3>
        </div>
      </div>

      <div className="card overflow-hidden !p-0 rounded-[3rem] border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-10 py-6">Ordine / Data</th>
                <th className="px-6 py-6">Cliente</th>
                <th className="px-6 py-6 text-right">Totale</th>
                <th className="px-6 py-6">Stato Pagamento</th>
                <th className="px-6 py-6">Evasione</th>
                <th className="px-6 py-6 border-l border-slate-50">Consegna</th>
                <th className="px-6 py-6">Articoli</th>
                <th className="px-10 py-6 text-center">Gestione</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-24 text-center">
                    <RefreshCw className="w-10 h-10 animate-spin text-indigo-600 mx-auto opacity-20" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-24 text-center text-slate-300 font-black uppercase italic tracking-widest">
                    Nessun ordine sincronizzato.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-indigo-50/30 transition-all group cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-10 py-7">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 italic tracking-tighter text-base">#{order.orderNumber || order.shopifyOrderId}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(order.date).toLocaleDateString('it-IT')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-7">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-all">
                          {order.customer?.businessName || 'Cliente Shopify'}
                          <SegmentBadge totalSpent={getCustomerTotal(order.customerId)} />
                        </span>
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">{order.customer?.email || 'Sync automatica'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-7 text-right">
                      <span className="text-sm font-black text-slate-900 italic tracking-tighter">€{parseFloat(order.totalAmount).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-7">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight border ${
                        order.paymentStatus === 'SALDATO' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {order.paymentStatus === 'SALDATO' ? 'Saldato' : (order.paymentStatus || 'Pagamento in attesa')}
                      </span>
                    </td>
                    <td className="px-6 py-7">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight border ${
                        order.fulfillmentStatus === 'fulfilled'
                          ? 'bg-slate-50 text-slate-400 border-slate-100'
                          : order.fulfillmentStatus === 'partial'
                          ? 'bg-blue-50 text-blue-600 border-blue-100'
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {order.fulfillmentStatus === 'fulfilled' ? 'Evaso' : (order.fulfillmentStatus === 'partial' ? 'Parziale' : 'Inevaso')}
                      </span>
                    </td>
                    <td className="px-6 py-7 border-l border-slate-50/50">
                      {order.deliveryDate ? (
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">{new Date(order.deliveryDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}</span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase">{new Date(order.deliveryDate).toLocaleDateString('it-IT', { year: '2-digit' })}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-slate-300 uppercase italic">---</span>
                      )}
                    </td>
                    <td className="px-6 py-7">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{order.itemsCount || 0} articoli</span>
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

      {/* Widget Dettaglio Ordine */}
      <OrderDrawer 
        order={selectedOrder} 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        onUpdate={() => fetchOrders()}
      />
    </div>
  );
};

export default Orders;
