import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Truck, 
  MapPin, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import OrderDrawer from '../components/OrderDrawer';

const Calendar = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewDate, setViewDate] = useState(new Date());

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const deliveries = orders
    .filter(o => o.deliveryDate)
    .sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));

  const upcoming = deliveries.filter(o => new Date(o.deliveryDate) >= new Date().setHours(0,0,0,0));
  const past = deliveries.filter(o => new Date(o.deliveryDate) < new Date().setHours(0,0,0,0));

  const daysUntil = (date) => {
    const diff = new Date(date) - new Date().setHours(0,0,0,0);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
            Piano <span className="text-indigo-600">Consegne.</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3">Monitoraggio logistico e pianificazione ordini</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Oggi è il</p>
            <p className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">{new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <CalendarIcon className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Main Schedule */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 italic tracking-tighter flex items-center gap-3">
              <Clock className="w-5 h-5 text-indigo-600" /> Prossime Spedizioni
            </h3>
          </div>

          <div className="space-y-6">
            {loading ? (
              <div className="p-20 text-center bg-white rounded-[3rem] border border-slate-100">
                <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Caricamento logistica...</p>
              </div>
            ) : upcoming.length === 0 ? (
              <div className="p-20 text-center bg-slate-50 rounded-[3rem] border border-slate-100 opacity-50 italic">
                Nessuna spedizione programmata per il futuro.
              </div>
            ) : (
              upcoming.map((order) => {
                const days = daysUntil(order.deliveryDate);
                return (
                  <div 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:scale-[1.01] transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className={`absolute top-0 left-0 w-2 h-full ${days === 0 ? 'bg-rose-500' : days <= 2 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col items-center justify-center w-20 h-20 bg-slate-50 rounded-[1.5rem] border border-slate-100 group-hover:bg-indigo-50 transition-colors">
                          <span className="text-2xl font-black text-slate-900 leading-none">{new Date(order.deliveryDate).getDate()}</span>
                          <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{new Date(order.deliveryDate).toLocaleDateString('it-IT', { month: 'short' })}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-black bg-slate-900 text-white px-2 py-0.5 rounded tracking-widest uppercase">#{order.orderNumber}</span>
                            <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{order.customer?.businessName}</h4>
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                             <MapPin className="w-3 h-3 text-indigo-400" /> {order.customer?.city}, {order.customer?.region}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${days === 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                            {days === 0 ? 'Consegna Oggi!' : `Tra ${days} giorni`}
                          </p>
                          <p className={`text-xs font-black uppercase tracking-tight ${order.paymentStatus === 'SALDATO' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {order.paymentStatus === 'SALDATO' ? 'Pagato' : 'Da Saldare'}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-indigo-600 transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar Alerts */}
        <div className="space-y-8">
           <h3 className="text-xl font-black text-slate-900 italic tracking-tighter flex items-center gap-3">
             <AlertCircle className="w-5 h-5 text-amber-500" /> Avvisi Logistici
           </h3>
           
           <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-100 flex flex-col gap-6 relative overflow-hidden group">
              <Truck className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
              <div className="relative z-10">
                <p className="text-3xl font-black italic tracking-tighter mb-2">{upcoming.length}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Spedizioni in arrivo nei prossimi 7 giorni</p>
              </div>
           </div>

           <div className="space-y-4">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2">Storico Recente (Passate)</p>
             {past.slice(0, 5).map(order => (
               <div 
                 key={order.id} 
                 onClick={() => setSelectedOrder(order)}
                 className="p-6 bg-white border border-slate-100 rounded-3xl opacity-60 hover:opacity-100 transition-all cursor-pointer flex items-center justify-between"
               >
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                     <CheckCircle2 className="w-4 h-4" />
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-slate-900 uppercase truncate max-w-[120px]">{order.customer?.businessName}</p>
                     <p className="text-[9px] font-bold text-slate-400">{new Date(order.deliveryDate).toLocaleDateString()}</p>
                   </div>
                 </div>
                 <ChevronRight className="w-4 h-4 text-slate-300" />
               </div>
             ))}
           </div>
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

export default Calendar;
