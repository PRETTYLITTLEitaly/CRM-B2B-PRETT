import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  Users, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download,
  PieChart as PieIcon,
  BarChart as BarIcon,
  RefreshCw,
  Clock
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';

const Performance = () => {
  const [timeRange, setTimeRange] = useState('30D'); // 7D, 30D, 90D, 1Y, ALL
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const [cusRes, ordRes] = await Promise.all([
        fetch('/api/customers', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/orders', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const cusData = await cusRes.json();
      const ordData = await ordRes.json();
      setCustomers(Array.isArray(cusData) ? cusData : (cusData.data || []));
      setOrders(Array.isArray(ordData) ? ordData : (ordData.data || []));
    } catch (e) {
      console.error('Performance fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ─── DATA PROCESSING ───
  const stats = useMemo(() => {
    if (!orders.length) return null;

    const now = new Date();
    let startDate = new Date();
    
    if (timeRange === '7D') startDate.setDate(now.getDate() - 7);
    else if (timeRange === '30D') startDate.setDate(now.getDate() - 30);
    else if (timeRange === '90D') startDate.setDate(now.getDate() - 90);
    else if (timeRange === '1Y') startDate.setFullYear(now.getFullYear() - 1);
    else startDate = new Date(2000, 0, 1);

    const filteredOrders = orders.filter(o => new Date(o.date) >= startDate);
    
    // Total Revenue
    const totalRev = filteredOrders.reduce((s, o) => s + (parseFloat(o.totalAmount) || 0), 0);
    
    // Average Order Value (AOV)
    const aov = filteredOrders.length ? totalRev / filteredOrders.length : 0;

    // Daily Aggregation for main chart
    const dailyDataMap = {};
    filteredOrders.forEach(o => {
      const d = new Date(o.date).toLocaleDateString();
      if (!dailyDataMap[d]) dailyDataMap[d] = { date: d, revenue: 0, count: 0 };
      dailyDataMap[d].revenue += (parseFloat(o.totalAmount) || 0);
      dailyDataMap[d].count += 1;
    });

    const chartData = Object.values(dailyDataMap).sort((a,b) => new Date(a.date) - new Date(b.date));

    // Distribution by Segment (GOLD, SILVER, SP)
    const segments = { GOLD: 0, SILVER: 0, SP: 0 };
    customers.forEach(c => {
      const rev = (c.orders || []).reduce((s, o) => s + (parseFloat(o.totalAmount) || 0), 0);
      if (rev >= 10000) segments.GOLD++;
      else if (rev >= 5000) segments.SILVER++;
      else segments.SP++;
    });

    const pieData = [
      { name: 'GOLD', value: segments.GOLD, color: '#f59e0b' },
      { name: 'SILVER', value: segments.SILVER, color: '#94a3b8' },
      { name: 'SP', value: segments.SP, color: '#6366f1' }
    ];

    // Regional Performance
    const regMap = {};
    filteredOrders.forEach(o => {
      const reg = o.customer?.region || 'ALTRO';
      if (!regMap[reg]) regMap[reg] = 0;
      regMap[reg] += (parseFloat(o.totalAmount) || 0);
    });
    const regionalData = Object.entries(regMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value)
      .slice(0, 6);

    return {
      totalRev,
      orderCount: filteredOrders.length,
      aov,
      chartData,
      pieData,
      regionalData,
      customerGrowth: customers.length
    };
  }, [orders, customers, timeRange]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
      <RefreshCw className="w-10 h-10 animate-spin text-indigo-600 opacity-20" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Analisi Performance...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20">
      
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
            Business <span className="text-indigo-600">Analytics.</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4 flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-indigo-600" /> Analisi predittiva e andamento volumi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 relative z-10">
          <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-inner">
            {[
              { id: '7D', l: '7 Giorni' },
              { id: '30D', l: '30 Giorni' },
              { id: '90D', l: '90 Giorni' },
              { id: '1Y', l: 'Un Anno' },
              { id: 'ALL', l: 'Storico' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setTimeRange(r.id)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  timeRange === r.id ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {r.l}
              </button>
            ))}
          </div>
          <button onClick={fetchData} className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm active:scale-90">
             <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Fatturato Periodo" 
          value={`€${Math.round(stats?.totalRev || 0).toLocaleString()}`} 
          trend="+12.4%" 
          up={true} 
          icon={DollarSign} 
        />
        <MetricCard 
          title="Volume Ordini" 
          value={stats?.orderCount || 0} 
          trend="+5.2%" 
          up={true} 
          icon={ShoppingCart} 
          color="emerald" 
        />
        <MetricCard 
          title="Ticket Medio (AOV)" 
          value={`€${Math.round(stats?.aov || 0).toLocaleString()}`} 
          trend="-2.1%" 
          up={false} 
          icon={BarIcon} 
          color="amber" 
        />
        <MetricCard 
          title="Clienti Totali" 
          value={stats?.customerGrowth || 0} 
          trend="+3" 
          up={true} 
          icon={Users} 
          color="slate" 
        />
      </div>

      {/* ── Main Growth Trend ── */}
      <div className="bg-white border border-slate-100 rounded-[3.5rem] p-12 shadow-sm flex flex-col gap-10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic font-black">Revenue Timeline</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Andamento flussi di cassa giornalieri</p>
          </div>
          <div className="flex gap-3">
             <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl">
               <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
               <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Real-time Sync</span>
             </div>
          </div>
        </div>
        
        <div className="w-full h-[450px] -ml-8">
          <ResponsiveContainer width="100%" height={450}>
            <AreaChart data={stats?.chartData || []}>
              <defs>
                <linearGradient id="performanceRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} 
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} 
                tickFormatter={(val) => `€${(val/1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '24px', 
                  border: 'none', 
                  boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                  fontSize: '11px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  padding: '20px'
                }}
                formatter={(val) => [`€${val.toLocaleString()}`, 'Fatturato']}
                itemStyle={{ color: '#6366f1' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#6366f1" 
                strokeWidth={5} 
                fillOpacity={1} 
                fill="url(#performanceRev)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Market Segmentation */}
        <div className="bg-slate-900 rounded-[3.5rem] p-12 shadow-2xl flex flex-col gap-10 relative overflow-hidden group">
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight uppercase italic">Customer Segments</h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Distribuzione per valore vita (LTV)</p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.pieData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {(stats?.pieData || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '15px', border: 'none', background: '#ffffff', color: '#000' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-6 w-full">
               {(stats?.pieData || []).map(seg => (
                 <div key={seg.name} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }}></div>
                      <span className="text-[11px] font-black text-white uppercase tracking-widest">{seg.name}</span>
                    </div>
                    <span className="text-lg font-black text-white italic">{seg.value}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Region Performance */}
        <div className="bg-white border border-slate-100 rounded-[3.5rem] p-12 shadow-sm flex flex-col gap-10">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">Regional Performance</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Top performig geographic areas</p>
          </div>
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.regionalData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} 
                />
                <YAxis hide />
                <Tooltip 
                   cursor={{fill: '#f8fafc'}}
                   contentStyle={{ borderRadius: '15px', border: 'none', textTransform: 'uppercase', fontSize: '10px', fontWeight: 900 }}
                />
                <Bar dataKey="value" radius={[15, 15, 15, 15]} barSize={40}>
                  {(stats?.regionalData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : '#f1f5f9'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6">
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
               <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Market Leader</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 bg-slate-100 rounded-full"></div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expansion Areas</span>
             </div>
          </div>
        </div>
      </div>

    </div>
  );
};

const MetricCard = ({ title, value, trend, up, icon: Icon, color = "indigo" }) => {
  const colors = {
    indigo: "text-indigo-600 bg-indigo-50",
    emerald: "text-emerald-600 bg-emerald-50",
    amber: "text-amber-600 bg-amber-50",
    slate: "text-slate-900 bg-slate-50"
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black ${up ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
          {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </div>
      </div>
      <div>
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</h4>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-black text-slate-900 tracking-tighter italic">{value}</span>
        </div>
      </div>
    </div>
  );
};

export default Performance;
