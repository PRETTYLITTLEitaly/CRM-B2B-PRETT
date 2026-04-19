import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart, Calendar, CreditCard, RefreshCw } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async (sync = false) => {
    try {
      setLoading(true);
      const url = sync ? '/api/webhooks/shopify/sync' : '/api/orders';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Errore nella comunicazione con il server');
      const result = await response.json();
      
      // Se è un sync, ricarichiamo gli ordini dal DB per sicurezza subito dopo
      if (sync) {
        const dbResponse = await fetch('/api/orders');
        const dbResult = await dbResponse.json();
        setOrders(dbResult.data || []);
      } else {
        setOrders(result.data || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter italic uppercase">
          Ordini <span className="text-indigo-600">Sync.</span>
        </h1>
        <button 
          onClick={() => fetchOrders(true)}
          className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sincronizza Shopify
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-indigo-600 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Totale Ordini</p>
          <h3 className="text-3xl font-black">{orders.length}</h3>
        </div>
        <div className="card">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Da Spedire</p>
          <h3 className="text-3xl font-black text-slate-900">0</h3>
        </div>
        <div className="card">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">In Consegna</p>
          <h3 className="text-3xl font-black text-slate-900">0</h3>
        </div>
      </div>

      <div className="card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-10 py-6">ID Ordine</th>
                <th className="px-6 py-6">Data</th>
                <th className="px-6 py-6">Cliente</th>
                <th className="px-6 py-6">Totale</th>
                <th className="px-6 py-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <div className="flex justify-center"><RefreshCw className="animate-spin text-indigo-600" /></div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                    Nessun ordine trovato. Sincronizza con Shopify.
                  </td>
                </tr>
              ) : (
                orders.map((order, i) => (
                  <tr key={order.id || i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-10 py-6">
                      <span className="text-xs font-bold text-slate-900">#{order.orderNumber || order.shopifyOrderId}</span>
                    </td>
                    <td className="px-6 py-6">
                      <span className="text-xs font-semibold text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-6">
                      <span className="text-xs font-semibold text-slate-900">{order.customerEmail}</span>
                    </td>
                    <td className="px-6 py-6">
                      <span className="text-xs font-bold text-indigo-600">€{parseFloat(order.totalAmount).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-6">
                      <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                        Completo
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
