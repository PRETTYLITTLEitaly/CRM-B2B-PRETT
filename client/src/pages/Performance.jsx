import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell
} from 'recharts';
import { TrendingUp, Users, Target, Calendar } from 'lucide-react';

const data = [
  { name: 'Gen', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 2000 },
  { name: 'Apr', value: 2780 },
  { name: 'Mag', value: 1890 },
  { name: 'Giu', value: 2390 },
  { name: 'Lug', value: 3490 },
];

const customerData = [
  { name: 'Tech Gadgets', revenue: 12500, region: 'Lombardia', city: 'Milano' },
  { name: 'Fashion Boutique', revenue: 9800, region: 'Lazio', city: 'Roma' },
  { name: 'Lombardi Vini', revenue: 15600, region: 'Toscana', city: 'Firenze' },
  { name: 'Bio Store XL', revenue: 7200, region: 'Piemonte', city: 'Torino' },
];

const Performance = () => {
  const [filterRegion, setFilterRegion] = useState('All');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-text-main">Analisi di Performance</h2>
          <p className="text-text-dim mt-1">Monitora il fatturato e l'andamento dei clienti in tempo reale.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-text-dim px-1">Regione</span>
            <select 
              className="bg-bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent"
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
            >
              <option value="All">Tutte</option>
              <option value="Lombardia">Lombardia</option>
              <option value="Lazio">Lazio</option>
              <option value="Toscana">Toscana</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-text-dim px-1">Range</span>
            <select className="bg-bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent">
              <option>Ultimi 12 Mesi</option>
              <option>Anno Corrente</option>
              <option>Trimestre</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Stats Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp size={20} className="text-accent" />
                Fatturato Mensile
              </h3>
              <div className="text-sm font-medium text-text-dim">
                Totale YTD: <span className="text-text-main font-bold">€194,560</span>
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3139" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#16181d', border: '1px solid #2d3139', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="card bg-accent/5 border-accent/20">
              <Users size={24} className="text-accent mb-4" />
              <h4 className="text-text-dim text-xs font-bold uppercase tracking-wider">Nuovi Clienti</h4>
              <p className="text-2xl font-bold mt-1">12 <span className="text-success text-xs">+20%</span></p>
            </div>
            <div className="card bg-success/5 border-success/20">
              <Target size={24} className="text-success mb-4" />
              <h4 className="text-text-dim text-xs font-bold uppercase tracking-wider">Tasso Conversione</h4>
              <p className="text-2xl font-bold mt-1">4.8% <span className="text-success text-xs">+0.2%</span></p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card h-full">
            <h3 className="text-lg font-bold mb-6">Top Clienti</h3>
            <div className="space-y-6">
              {customerData.sort((a, b) => b.revenue - a.revenue).map((c, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-text-main">{c.name}</span>
                    <span className="text-accent font-bold">€{c.revenue.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent rounded-full shadow-lg shadow-accent-glow" 
                      style={{ width: `${(c.revenue / 16000) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-text-dim uppercase tracking-tighter">{c.region}</span>
                    <span className="text-[10px] text-text-dim italic">{c.city}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Performance;
