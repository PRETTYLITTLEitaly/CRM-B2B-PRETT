import React, { useState, useEffect } from 'react';
import { Users, Filter, Plus, RefreshCw, Mail, Phone, Globe } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/customers');
      if (!response.ok) throw new Error('Errore nel caricamento clienti');
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter italic uppercase">
          Portafoglio <span className="text-indigo-600">Clienti.</span>
        </h1>
        <div className="flex gap-3 md:gap-4">
          <button 
            onClick={fetchCustomers}
            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:text-indigo-600 transition-all flex-none"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="btn-primary flex items-center justify-center gap-2 flex-1 md:flex-none whitespace-nowrap">
            <Plus className="w-4 h-4" /> Nuovo Cliente
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
        </div>
      ) : customers.length === 0 ? (
        <div className="card py-20 text-center border-dashed">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Nessun cliente in portafoglio. Sincronizza gli ordini Shopify per iniziare.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {customers.map((customer) => {
            const ltv = customer.orders?.reduce((acc, o) => acc + parseFloat(o.totalAmount || 0), 0) || 0;
            return (
              <div key={customer.id} className="card group hover:border-indigo-200 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-3xl group-hover:bg-indigo-50 transition-colors">
                    🏢
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    customer.status === 'ATTIVO' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {customer.status || 'ATTIVO'}
                  </span>
                </div>
                
                <h3 className="font-black text-xl text-slate-900 mb-1 leading-tight tracking-tight uppercase group-hover:text-indigo-600 transition-colors">
                  {customer.businessName}
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                  {customer.city}, {customer.region}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ordini</p>
                    <p className="text-lg font-black text-slate-900">{customer._count?.orders || 0}</p>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-2xl">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">LTV</p>
                    <p className="text-lg font-black text-indigo-600">€{ltv.toLocaleString()}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex items-center gap-2">
                  <a href={`mailto:${customer.email}`} className="p-3 hover:bg-indigo-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all">
                    <Mail className="w-4 h-4" />
                  </a>
                  <a href={`tel:${customer.phone}`} className="p-3 hover:bg-indigo-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all">
                    <Phone className="w-4 h-4" />
                  </a>
                  <button className="flex-1 text-right text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                    Scheda Cliente →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Customers;
