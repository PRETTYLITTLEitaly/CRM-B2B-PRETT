import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign,
  RefreshCw,
  Clock,
  Award,
  Calendar,
  ChevronRight,
  AlertCircle,
  MapPin
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import OrderDrawer from '../components/OrderDrawer';

// ─── UTILS ────────────────────────────────────────────────────────────────
const MONTHS = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];

const getStats = (customers = [], orders = []) => {
  try {
    const safeCustomers = Array.isArray(customers) ? customers : [];
    const safeOrders = Array.isArray(orders) ? orders : [];
    
    const now = new Date();
    const curYear = 2026;
    const trackingStartDate = new Date(2026, 0, 1);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Filtriamo gli ordini per tracciare solo dal 2026
    const orders2026 = safeOrders.filter(o => o && o.date && new Date(o.date) >= trackingStartDate);

    // 1. Ordini Recenti (sempre ultimi 5 ma cronologici)
    const recentOrdersList = [...orders2026]
      .sort((a,b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    const recentOrders7Days = orders2026.filter(o => new Date(o.date) >= last7Days);
    const recentOrdersRevenue = recentOrders7Days.reduce((s, o) => s + (parseFloat(o.totalAmount || 0) || 0), 0);
    
    // 2. Performance Mensile 2026
    const monthlyData = MONTHS.map((m, i) => {
      const revenue = orders2026.filter(o => new Date(o.date).getMonth() === i)
        .reduce((s, o) => s + (parseFloat(o.totalAmount || 0) || 0), 0);
      return { name: m, revenue };
    });

    // 3. Top Customer 2026
    const customersByRevenue = safeCustomers.map(c => {
      const custOrders2026 = (c.orders || []).filter(o => o.date && new Date(o.date) >= trackingStartDate);
      const rev = custOrders2026.reduce((s, o) => s + (parseFloat(o.totalAmount || 0) || 0), 0);
      return { ...c, totalRevenue: rev, orders2026: custOrders2026 };
    }).sort((a,b) => b.totalRevenue - a.totalRevenue);

    // 4. Churn Alert (Basato su tutta la storia o solo 2026? Solitamente churn è globale ma lo mettiamo sensibile al 2026)
    const churnList = safeCustomers.filter(c => c && c.id).map(c => {
      const sorted = [...(c.orders || [])].sort((a,b) => new Date(b.date) - new Date(a.date));
      const last = sorted[0];
      let days = 999;
      if (last && last.date) {
        days = Math.floor((now.getTime() - new Date(last.date).getTime()) / 86400000);
      }
      return { ...c, daysSinceLastOrder: days, lastOrder: last };
    }).sort((a,b) => b.daysSinceLastOrder - a.daysSinceLastOrder);

    // 5. Prossime Consegne
    const upcomingDeliveries = orders2026
      .filter(o => o.deliveryDate && new Date(o.deliveryDate) >= today)
      .sort((a,b) => new Date(a.deliveryDate) - new Date(b.deliveryDate))
      .slice(0, 5);

    return {
      recentOrdersCount: recentOrders7Days.length,
      recentOrdersRevenue,
      topCustomer3Months: customersByRevenue[0] || null,
      topCustomerRevenue: customersByRevenue[0]?.totalRevenue || 0,
      customersByRevenue,
      churnList: churnList.filter(c => c.daysSinceLastOrder > 30).slice(0, 5),
      monthlyData,
      recentOrdersList,
      upcomingDeliveries,
      totalRevenue: orders2026.reduce((s, o) => s + (parseFloat(o.totalAmount || 0) || 0), 0)
    };
  } catch (err) {
    console.error('[CRITICAL DASHBOARD STATS RECOVERY]', err);
    return {
      recentOrdersCount: 0, 
      recentOrdersRevenue: 0, 
      topCustomer3Months: null, 
      topCustomerRevenue: 0, 
      customersByRevenue: [], 
      churnList: [], 
      monthlyData: MONTHS.map(m => ({ name: m, revenue: 0 })),
      recentOrdersList: [], 
      upcomingDeliveries: [], 
      totalRevenue: 0
    };
  }
};

// ─── COMPONENTS ────────────────────────────────────────────────────────────

const KPI = ({ title, value, sub, icon: Icon, color = "indigo" }) => {
  const colors = {
    indigo: "bg-indigo-600 shadow-indigo-100",
    emerald: "bg-emerald-500 shadow-emerald-100",
    amber: "bg-amber-500 shadow-amber-100",
    slate: "bg-slate-900 shadow-slate-200"
  };

  return (
    <div className={`p-8 rounded-[2.5rem] text-white shadow-2xl ${colors[color]} relative overflow-hidden group`}>
      <Icon className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform duration-500" />
      <div className="relative z-10 space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{title}</p>
        <h3 className="text-4xl font-black italic tracking-tighter">{value}</h3>
        <p className="text-[9px] font-bold uppercase tracking-widest opacity-40">{sub}</p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const [cusRes, ordRes] = await Promise.all([
        fetch('/api/customers', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/orders', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (!cusRes.ok || !ordRes.ok) {
        throw new Error('Server returned error status');
      }

      const customersResult = await cusRes.json();
      const ordResult = await ordRes.json();
      
      const customers = Array.isArray(customersResult) ? customersResult : (customersResult.data || []);
      const orders = Array.isArray(ordResult) ? ordResult : (ordResult.data || []);
      
      const stats = getStats(customers, orders);
      setData(stats);
    } catch (e) {
      console.error('[DASHBOARD FETCH ERROR]', e);
      // Imposta uno stato vuoto ma valido per evitare il crash totale
      setData(getStats([], []));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <RefreshCw className="w-10 h-10 animate-spin text-indigo-600 opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Analisi dati in corso...</p>
      </div>
    </div>
  );

  if (!data && !loading) return (
    <div className="p-20 text-center">
      <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-6 opacity-20" />
      <h2 className="text-2xl font-black text-slate-900 uppercase italic">Errore Caricamento</h2>
      <p className="text-xs font-bold text-slate-400 mt-2">Impossibile recuperare i dati dal server. Riprova tra istante.</p>
      <button onClick={fetchData} className="mt-8 btn-primary">Ricarica Dashboard</button>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
            Bentornato, <span className="text-indigo-600">{user?.firstName || 'Collaboratore'}.</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4 flex items-center gap-2">
            <Calendar className="w-3 h-3" /> Report aggiornato al {new Date().toLocaleDateString('it-IT')}
          </p>
        </div>
        <div className="flex gap-4">
          <button onClick={fetchData} className="p-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-xl transition-all active:scale-95">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPI 
          title="Fatturato Totale" 
          value={`€${Math.round(data.totalRevenue).toLocaleString()}`} 
          sub="Volume storico complessivo"
          icon={DollarSign}
        />
        <KPI 
          title="Ordini 7 Giorni" 
          value={data.recentOrdersCount} 
          sub={`Volume: €${Math.round(data.recentOrdersRevenue).toLocaleString()}`}
          icon={ShoppingCart}
          color="emerald"
        />
        <KPI 
          title="Top Customer (3m)" 
          value={data.topCustomer3Months?.businessName?.substring(0, 15) || '—'} 
          sub={`Fatturato: €${Math.round(data.topCustomerRevenue).toLocaleString()}`}
          icon={Award}
          color="amber"
        />
        <KPI 
          title="Fatturato Mensile" 
          value={`€${Math.round(data.monthlyData?.[new Date().getMonth()]?.revenue || 0).toLocaleString()}`} 
          sub="Performance mese corrente"
          icon={TrendingUp}
          color="slate"
        />
      </div>

      {/* ── Charts & Recent Transactions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Upcoming Deliveries (NEW) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="p-8 border-b border-white/5 bg-white/5 relative z-10">
            <h3 className="text-lg font-black text-white tracking-tight uppercase italic flex items-center gap-3">
              <Calendar className="w-5 h-5 text-indigo-400" /> Agenda Consegne
            </h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Spedizioni programmate</p>
          </div>
          <div className="flex-1 divide-y divide-white/5 overflow-y-auto max-h-[400px] relative z-10 custom-scrollbar-dark">
            {data.upcomingDeliveries.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center gap-3 opacity-30 h-full justify-center">
                <Clock className="w-8 h-8 text-white" />
                <p className="text-[10px] font-black text-white uppercase tracking-widest italic font-bold">Nessuna consegna pianificata</p>
              </div>
            ) : data.upcomingDeliveries.map((ord) => (
              <div 
                key={ord.id} 
                className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors group cursor-pointer"
                onClick={() => setSelectedOrder(ord)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex flex-col items-center justify-center border border-white/10 group-hover:border-indigo-500 transition-colors">
                     <span className="text-lg font-black text-white leading-none">
                       {ord.deliveryDate ? new Date(ord.deliveryDate).getDate() : '—'}
                     </span>
                     <span className="text-[7px] font-black text-indigo-400 uppercase">
                       {ord.deliveryDate ? new Date(ord.deliveryDate).toLocaleDateString('it-IT', { month: 'short' }) : '—'}
                     </span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-white uppercase tracking-tight truncate max-w-[150px]">{ord.customer?.businessName || 'Cliente'}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {ord.customer?.city || 'Sede'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
              </div>
            ))}
          </div>
          <a href="/calendar" className="p-6 bg-white/5 text-center text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Apri Calendario Logistico</a>
        </div>

        {/* Main Growth Chart */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm flex flex-col gap-8 min-h-[500px]">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Performance Annuale</h3>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Revenue Flow</div>
          </div>
          <div className="w-full h-[350px] translate-x-[-20px]">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={data.monthlyData || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                    fontSize: '11px',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    padding: '16px'
                  }}
                  formatter={(val) => [`€${val?.toLocaleString() || 0}`, 'Fatturato']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#6366f1" 
                  strokeWidth={6}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders List (NEW) */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-[3rem] shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50">
            <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase italic">Ultimi Ordini</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In tempo reale</p>
          </div>
          <div className="flex-1 divide-y divide-slate-50 overflow-y-auto max-h-[400px]">
            {data.recentOrdersList.map((ord) => (
              <div 
                key={ord.id} 
                className="p-6 flex items-center justify-between hover:bg-indigo-50/50 transition-colors group cursor-pointer"
                onClick={() => setSelectedOrder(ord)}
              >
                <div>
                  <p className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">#{ord.orderNumber || ord.shopifyOrderId || 'ORD'}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">{ord.date ? new Date(ord.date).toLocaleDateString('it-IT') : '---'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900 italic tracking-tighter">€{parseFloat(ord.totalAmount || 0).toLocaleString()}</p>
                  <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Completato</p>
                </div>
              </div>
            ))}
          </div>
          <a href="/orders" className="p-6 bg-slate-50 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Vedi tutto il registro</a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Churn Alert List */}
        <div className="bg-white border border-slate-100 rounded-[3rem] shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Alert Inattività</h3>
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Recupero Clienti</p>
            </div>
            <AlertCircle className="w-6 h-6 text-rose-500 animate-pulse" />
          </div>
          <div className="flex-1 divide-y divide-slate-50">
            {data.churnList.map(c => (
              <div key={c.id} className="p-6 flex items-center justify-between hover:bg-rose-50/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 text-xs uppercase">
                    {c.businessName?.substring(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{c.businessName}</p>
                    {c.lastOrder && (
                      <button 
                        onClick={() => setSelectedOrder(c.lastOrder)}
                        className="text-[9px] font-bold text-indigo-600 uppercase hover:underline"
                      >
                        Ultimo ordine: {c.lastOrder.date && !isNaN(new Date(c.lastOrder.date)) ? new Date(c.lastOrder.date).toLocaleDateString() : 'data non valida'}
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-rose-500 italic tracking-tighter">{c.daysSinceLastOrder}g</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Senza ordini</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Spend Horizontal Bars */}
        <div className="bg-slate-900 rounded-[3rem] shadow-2xl p-10 flex flex-col gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight uppercase italic">Top Spending Tier</h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ranking Volume d'Affari</p>
          </div>
          <div className="space-y-6 relative z-10">
            {data.customersByRevenue.slice(0, 5).map((c, i) => {
              const maxRev = data.customersByRevenue?.[0]?.totalRevenue || 1;
              const widthPerc = c.totalRevenue > 0 ? (c.totalRevenue / maxRev) * 100 : 0;
              return (
                <div key={c.id || Math.random()} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">{c.businessName}</span>
                    <span className="text-indigo-400">€{c.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full" 
                      style={{ width: `${widthPerc}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <OrderDrawer 
        order={selectedOrder} 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        onUpdate={fetchData}
      />
    </div>
  );
};

export default Dashboard;
