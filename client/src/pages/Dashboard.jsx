import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const data = [
  { name: 'Gen', sales: 4000, leads: 2400 },
  { name: 'Feb', sales: 3000, leads: 1398 },
  { name: 'Mar', sales: 2000, leads: 9800 },
  { name: 'Apr', sales: 2780, leads: 3908 },
  { name: 'May', sales: 1890, leads: 4800 },
  { name: 'Jun', sales: 2390, leads: 3800 },
  { name: 'Jul', sales: 3490, leads: 4300 },
];

const StatCard = ({ title, value, percentage, icon: Icon, trend, loading }) => (
  <div className="card flex flex-col gap-6">
    <div className="flex items-center justify-between">
      <div className="p-4 bg-indigo-50 rounded-3xl text-indigo-600">
        <Icon className="w-6 h-6" />
      </div>
      <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
        {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {percentage}%
      </div>
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</p>
      {loading ? (
        <div className="h-10 w-24 bg-slate-100 animate-pulse rounded-lg"></div>
      ) : (
        <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{value}</h3>
      )}
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    leadsCount: 0,
    ordersCount: 0,
    recentLeads: []
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [leadsRes, ordersRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/orders')
      ]);

      const leadsData = await leadsRes.json();
      const ordersResult = await ordersRes.json();
      const ordersData = ordersResult.data || [];

      const totalSales = ordersData.reduce((acc, order) => acc + parseFloat(order.totalAmount || 0), 0);

      setStats({
        totalSales,
        leadsCount: leadsData.length,
        ordersCount: ordersData.length,
        recentLeads: leadsData.slice(0, 4)
      });
    } catch (err) {
      console.error('Errore nel caricamento dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-12">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2 md:mb-4">
            Dashboard <span className="text-indigo-600">Overview.</span>
          </h1>
          <p className="text-xs md:text-sm font-semibold text-slate-400">
            Bentornato, Luca. Ecco cosa è successo nelle ultime 24 ore.
          </p>
        </div>
        <div className="flex gap-3 md:gap-4">
          <button className="btn-secondary flex-1 md:flex-none justify-center" onClick={fetchDashboardData}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> 
            <span className="whitespace-nowrap">Aggiorna</span>
          </button>
          <button className="btn-primary flex-1 md:flex-none justify-center whitespace-nowrap">
            Esporta Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Vendite Totali" 
          value={`€${stats.totalSales.toLocaleString()}`} 
          percentage="12.5" 
          icon={DollarSign} 
          trend="up" 
          loading={loading}
        />
        <StatCard 
          title="Nuovi Leads" 
          value={stats.leadsCount} 
          percentage="4.3" 
          icon={Users} 
          trend="up" 
          loading={loading}
        />
        <StatCard 
          title="Ordini Attivi" 
          value={stats.ordersCount} 
          percentage="2.1" 
          icon={ShoppingCart} 
          trend="up" 
          loading={loading}
        />
        <StatCard 
          title="Performance" 
          value="+18.4%" 
          percentage="8.1" 
          icon={TrendingUp} 
          trend="up" 
          loading={loading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card h-[500px] flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Andamento Vendite</h3>
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2026 Prediction</span>
            </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#6366f1" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card h-[500px] flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Leads per Canale</h3>
            <MoreHorizontal className="w-5 h-5 text-slate-400 cursor-pointer" />
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase'
                  }}
                />
                <Bar 
                  dataKey="leads" 
                  fill="#slate-900" 
                  radius={[10, 10, 0, 0]} 
                  className="fill-slate-900"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Leads Table */}
      <div className="card overflow-hidden !p-0">
        <div className="p-10 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Ultimi Leads Acquisiti</h3>
          <a href="/leads" className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">Vedi Tutti</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-10 py-6">Nome Azienda</th>
                <th className="px-6 py-6">Email</th>
                <th className="px-6 py-6">Status</th>
                <th className="px-10 py-6 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stats.recentLeads.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-10 text-center text-xs text-slate-400">Nessun lead recente.</td>
                </tr>
              ) : (
                stats.recentLeads.map((lead, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-6">
                      <span className="text-xs font-bold text-slate-900">{lead.companyName || lead.name}</span>
                    </td>
                    <td className="px-6 py-6">
                      <span className="text-xs font-semibold text-slate-500">{lead.email}</span>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        lead.status === 'NEW' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {lead.status || 'NEW'}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button className="p-2 hover:bg-white hover:shadow-lg rounded-xl transition-all group-hover:text-indigo-600 text-slate-300">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
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

export default Dashboard;
