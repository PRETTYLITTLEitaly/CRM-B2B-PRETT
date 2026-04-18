import React, { useState, useEffect, useMemo } from 'react';
import { Search, RefreshCw, Mail, Phone, X, TrendingUp, ShoppingBag, ChevronUp, ChevronDown, Edit2, Check, AlertTriangle, Clock, ArrowLeft, MapPin, Users, Hash, Trash2 } from 'lucide-react';
import OrderDrawer from '../components/OrderDrawer';
import SegmentBadge from '../components/SegmentBadge';

// ─── Utility ───────────────────────────────────────────────────────────────
const MONTHS = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];

function groupByMonth(orders, year) {
  const map = Array(12).fill(0);
  orders.forEach(o => {
    const d = new Date(o.date);
    if (d.getFullYear() === year) map[d.getMonth()] += parseFloat(o.totalAmount || 0);
  });
  return map;
}

function daysSince(dateStr) {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

// ─── Bar Chart component (pure CSS, no lib) ─────────────────────────────────
function BarChart({ orders }) {
  const now = new Date();
  const curYear = now.getFullYear();
  const prevYear = curYear - 1;

  const cur  = groupByMonth(orders, curYear);
  const prev = groupByMonth(orders, prevYear);
  const max  = Math.max(...cur, ...prev, 1);

  const [showPrev, setShowPrev] = useState(true);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-600 shadow-sm shadow-indigo-200" />
            <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{curYear}</span>
          </div>
          {showPrev && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-200 shadow-sm" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{prevYear}</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowPrev(v => !v)}
          className="px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-100 bg-white text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:shadow-lg hover:shadow-indigo-50 transition-all active:scale-95"
        >
          {showPrev ? `Nascondi ${prevYear}` : `Confronta con ${prevYear}`}
        </button>
      </div>

      <div className="flex items-end gap-4 h-64 px-2">
        {MONTHS.map((m, i) => {
          const cv = cur[i];
          const pv = prev[i];
          const ch = max > 0 ? (cv / max) * 100 : 0;
          const ph = max > 0 ? (pv / max) * 100 : 0;
          return (
            <div key={m} className="flex-1 flex flex-col items-center gap-3 group translate-y-2">
              <div className="w-full flex items-end justify-center gap-1.5" style={{ height: '220px' }}>
                {showPrev && (
                  <div
                    style={{ height: `${ph}%`, minHeight: pv > 0 ? '6px' : '0' }}
                    className="flex-1 bg-slate-100 rounded-t-xl group-hover:bg-slate-200 transition-all relative"
                    title={`${prevYear} ${m}: €${pv.toLocaleString()}`}
                  />
                )}
                <div
                  style={{ height: `${ch}%`, minHeight: cv > 0 ? '6px' : '0' }}
                  className="flex-1 bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-xl group-hover:from-indigo-600 group-hover:to-indigo-500 transition-all relative shadow-lg shadow-indigo-100"
                  title={`${curYear} ${m}: €${cv.toLocaleString()}`}
                >
                  {cv > 0 && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-white text-[10px] font-black px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 whitespace-nowrap pointer-events-none z-20 shadow-xl">
                      €{cv.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter group-hover:text-indigo-600 transition-colors">{m}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
const Customers = () => {
  const [customers, setCustomers]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [selectedCustomer, setSelected] = useState(null);
  const [sortBy, setSortBy]             = useState('name');
  const [sortDir, setSortDir]           = useState('asc');
  const [isEditing, setIsEditing]       = useState(false);
  const [editForm, setEditForm]         = useState({});
  const [saving, setSaving]             = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ACTIVE'); // ALL, ACTIVE, ARCHIVED
  const [yearFilter, setYearFilter]     = useState('ALL');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res  = await fetch('/api/customers');
      const data = await res.json();
      if (Array.isArray(data)) {
        // --- Deduplication by businessName ---
        const dedupedMap = new Map();
        data.forEach(c => {
          if (!c.businessName) {
            dedupedMap.set(c.id, { ...c, orders: c.orders || [] });
            return;
          }
          
          const key = c.businessName.trim().toLowerCase();
          if (dedupedMap.has(key)) {
            const existing = dedupedMap.get(key);
            const combinedOrders = [...(existing.orders || []), ...(c.orders || [])];
            
            const isEmailDummy = (e) => !e || e.includes('no-email-');
            if (isEmailDummy(existing.email) && !isEmailDummy(c.email)) {
               existing.email = c.email;
               existing.phone = c.phone || existing.phone;
               existing.city = c.city || existing.city;
            }
            existing.orders = combinedOrders;
            if (existing._count) existing._count.orders = combinedOrders.length;
          } else {
            dedupedMap.set(key, { ...c, orders: c.orders || [] });
          }
        });
        
        setCustomers(Array.from(dedupedMap.values()));
      } else {
        console.error('API non ha restituito un array:', data);
        setCustomers([]);
      }
    } catch (e) { 
      console.error('Errore fetch:', e);
      setCustomers([]);
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCustomers(); }, []);

  useEffect(() => {
    if (selectedCustomer) {
      setEditForm({
        businessName: selectedCustomer.businessName || '',
        contactName:  selectedCustomer.contactName  || '',
        email:        selectedCustomer.email        || '',
        phone:        selectedCustomer.phone        || '',
        vatNumber:    selectedCustomer.vatNumber    || '',
        sdiCode:      selectedCustomer.sdiCode      || '',
        city:         selectedCustomer.city         || '',
        region:       selectedCustomer.region       || '',
        address:      selectedCustomer.address      || '',
        country:      selectedCustomer.country      || 'Italia',
        status:       selectedCustomer.status       || 'POTENZIALE',
        notes:        selectedCustomer.notes        || '',
      });
      setIsEditing(false);
    }
  }, [selectedCustomer]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/customers/${selectedCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setCustomers(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c));
        setSelected(prev => ({ ...prev, ...updated }));
        setIsEditing(false);
      } else {
        const err = await res.json();
        alert('Errore salvataggio: ' + (err.message || 'Controlla i log del server. Potrebbe servire una migrazione DB.'));
      }
    } catch (e) { 
      console.error(e);
      alert('Errore di rete o server');
    }
    finally { setSaving(false); }
  };

  const handleSort = field => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <ChevronUp className="w-3 h-3 opacity-20 ml-1 inline" />;
    return sortDir === 'asc'
      ? <ChevronUp   className="w-3 h-3 text-indigo-600 ml-1 inline" />
      : <ChevronDown className="w-3 h-3 text-indigo-600 ml-1 inline" />;
  };

  const filtered = useMemo(() => {
    if (!Array.isArray(customers)) return [];
    return customers.filter(c => {
      // 1. Filtro per Stato
      const currentStatus = (c.status || 'POTENZIALE').toUpperCase();
      if (statusFilter === 'ACTIVE' && currentStatus === 'INATTIVO') return false;
      if (statusFilter === 'ARCHIVED' && currentStatus !== 'INATTIVO') return false;

      // 2. Filtro per Anno
      if (yearFilter !== 'ALL') {
        const yearOrders = (c.orders || []).filter(o => o.date && new Date(o.date).getFullYear().toString() === yearFilter);
        if (yearOrders.length === 0) return false;
      }

      // 3. Filtro per Ricerca
      const search = searchTerm.toLowerCase();
      if (!search) return true;
      
      return (
        (c.businessName || '').toLowerCase().includes(search) ||
        (c.email || '').toLowerCase().includes(search) ||
        (c.city || '').toLowerCase().includes(search)
      );
    });
  }, [customers, searchTerm, statusFilter, yearFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        const va = (a.businessName || '').toLowerCase();
        const vb = (b.businessName || '').toLowerCase();
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      const getYearLtv = (cust) => {
        const ords = yearFilter === 'ALL' ? (cust.orders || []) : (cust.orders || []).filter(o => o.date && new Date(o.date).getFullYear().toString() === yearFilter);
        return ords.reduce((s, o) => s + parseFloat(o.totalAmount || 0), 0);
      };
      const va = getYearLtv(a);
      const vb = getYearLtv(b);
      return sortDir === 'asc' ? va - vb : vb - va;
    });
  }, [filtered, sortBy, sortDir, yearFilter]);

  const analytics = useMemo(() => {
    if (!selectedCustomer) return null;
    let orders = Array.isArray(selectedCustomer.orders) ? selectedCustomer.orders : [];
    if (yearFilter !== 'ALL') {
      orders = orders.filter(o => o.date && new Date(o.date).getFullYear().toString() === yearFilter);
    }
    const sortedOrders = [...orders].sort((a, b) => {
      const db = b.date ? new Date(b.date).getTime() : 0;
      const da = a.date ? new Date(a.date).getTime() : 0;
      return db - da;
    });
    
    const ltv      = orders.reduce((s, o) => s + parseFloat(o.totalAmount || 0), 0);
    const avgOrder = orders.length ? ltv / orders.length : 0;
    const lastOrder = sortedOrders[0] || null;
    const days = (lastOrder && lastOrder.date) ? daysSince(lastOrder.date) : null;
    
    return { orders: sortedOrders, ltv, avgOrder, lastOrder, days };
  }, [selectedCustomer, yearFilter]);

  const reorderBanner = (days) => {
    if (days === null) return null;
    if (days <= 30)  return { bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-700', icon: <Check className="w-5 h-5" />, label: `Operativo: Ultimo ordine ${days} giorni fa` };
    if (days <= 90)  return { bg: 'bg-amber-50 border-amber-100',   text: 'text-amber-700',   icon: <Clock className="w-5 h-5" />,  label: `Attenzione: Non riordina da ${days} giorni` };
    return             { bg: 'bg-red-50 border-red-100',            text: 'text-red-700',     icon: <AlertTriangle className="w-5 h-5" />, label: `CRITICO: Inattivo da ${days} giorni — agire subito!` };
  };

  const inputCls = "w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all";
  const labelCls = "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block";

  const closePanel = () => { setSelected(null); setIsEditing(false); };

  // ─── RENDERING CUSTOMER CONTROL PANEL (FULL PAGE) ───────────────────────
  if (selectedCustomer && analytics) {
    const banner = reorderBanner(analytics.days);
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        
        {/* Navigation & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <button 
            onClick={closePanel}
            className="group flex items-center gap-3 text-slate-400 hover:text-indigo-600 transition-all"
          >
            <div className="p-3 bg-white border border-slate-100 rounded-2xl group-hover:border-indigo-200 group-hover:shadow-lg group-hover:shadow-indigo-50 transition-all active:scale-90">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="text-sm font-black uppercase tracking-widest">Torna ai clienti</span>
          </button>

          <div className="flex items-center gap-4">
            <a href={`mailto:${selectedCustomer.email}`} className="p-4 bg-white border border-slate-100 rounded-[1.5rem] text-slate-600 hover:text-indigo-600 hover:shadow-lg hover:shadow-indigo-50 transition-all active:scale-95 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Contatta</span>
            </a>
            {!isEditing ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="btn-primary flex items-center gap-3 px-8 shadow-xl shadow-indigo-100"
                >
                  <Edit2 className="w-4 h-4" /> Modifica
                </button>
                <button 
                  onClick={async () => {
                    const nextStatus = selectedCustomer.status === 'INATTIVO' ? 'ATTIVO' : 'INATTIVO';
                    setSaving(true);
                    await fetch(`/api/customers/${selectedCustomer.id}`, { 
                      method: 'PUT', 
                      headers: {'Content-Type':'application/json'},
                      body: JSON.stringify({ status: nextStatus })
                    });
                    await fetchCustomers();
                    setSaving(false);
                    closePanel();
                  }}
                  className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCustomer.status === 'INATTIVO' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  {selectedCustomer.status === 'INATTIVO' ? 'Ripristina' : 'Archivia'}
                </button>
                <button 
                  onClick={async () => {
                    if (window.confirm('Eliminare definitivamente il cliente dal CRM? (Ordini Shopify intoccabili)')) {
                      setSaving(true);
                      await fetch(`/api/customers/${selectedCustomer.id}`, { method: 'DELETE' });
                      fetchCustomers();
                      closePanel();
                    }
                  }}
                  className="p-4 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-all active:scale-90"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={() => setIsEditing(false)} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">Annulla</button>
                <button 
                  onClick={handleUpdate} 
                  disabled={saving}
                  className="px-8 py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-600 transition-all flex items-center gap-2"
                >
                  {saving ? 'Salvataggio...' : <><Check className="w-4 h-4" /> Salva</>}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Analytics & Charts */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-8 bg-indigo-600 text-white rounded-[2.5rem] shadow-2xl shadow-indigo-200 flex flex-col gap-1 relative overflow-hidden group">
                <TrendingUp className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform duration-500" />
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Revenue (LTV)</p>
                <p className="text-4xl font-black tracking-tighter italic">€{analytics.ltv.toLocaleString()}</p>
              </div>
              <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex flex-col gap-1 relative overflow-hidden">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AOV</p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter italic">€{Math.round(analytics.avgOrder).toLocaleString()}</p>
              </div>
              <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex flex-col gap-1 relative overflow-hidden">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vol. Ordini</p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter italic">{analytics.orders.length}</p>
              </div>
              <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl shadow-slate-200 flex flex-col gap-1 relative overflow-hidden group">
                <Clock className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform duration-500" />
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 text-indigo-400">Churn Check</p>
                <p className="text-4xl font-black tracking-tighter italic">{analytics.days ?? '—'}g</p>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Dall'ultimo acquisto</p>
              </div>
            </div>

            {/* Reorder Alert Banner */}
            {banner && (
              <div className={`flex items-center gap-5 px-8 py-6 rounded-[2rem] border-2 ${banner.bg} ${banner.text} shadow-sm`}>
                <div className="p-3 bg-white/50 rounded-xl">{banner.icon}</div>
                <div>
                  <p className="font-black text-base uppercase tracking-tight">{banner.label}</p>
                  {analytics.lastOrder && <p className="text-xs font-bold opacity-70">Ultima transazione: #{analytics.lastOrder.orderNumber} il {new Date(analytics.lastOrder.date).toLocaleDateString()}</p>}
                </div>
              </div>
            )}

            {/* Main Growth Chart */}
            <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Performance Commerciale</h3>
                <div className="p-2 bg-slate-50 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">Valori in €</div>
              </div>
              <BarChart orders={selectedCustomer.orders || []} />
            </div>

            {/* History List */}
            <div className="bg-white border border-slate-100 rounded-[3rem] shadow-sm overflow-hidden">
              <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Cronologia Transazioni</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full">{analytics.orders.length} ordini totali</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="px-10 py-5">Identificativo</th>
                      <th className="px-6 py-5">Data Ordine</th>
                      <th className="px-6 py-5 text-right">Totale Pagato</th>
                      <th className="px-10 py-5 text-center">Stato</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {analytics.orders.map((o, idx) => (
                      <tr 
                        key={o.id || idx} 
                        className={`group hover:bg-indigo-50/50 transition-colors cursor-pointer ${idx === 0 ? 'bg-indigo-50/30' : ''}`}
                        onClick={() => setSelectedOrder(o)}
                      >
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-3">
                            <span className="font-black text-slate-900 italic tracking-tighter">#{o.orderNumber}</span>
                            {idx === 0 && <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[9px] font-black uppercase rounded-full tracking-tighter">Newest</span>}
                          </div>
                        </td>
                        <td className="px-6 py-6 text-sm font-bold text-slate-500 uppercase">
                          {new Date(o.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-6 text-right font-black text-slate-900">€{parseFloat(o.totalAmount).toLocaleString()}</td>
                        <td className="px-10 py-6 text-center">
                          <span className="px-3 py-1.5 bg-white border border-slate-100 text-slate-400 text-[9px] font-black uppercase rounded-full shadow-sm">
                            {o.paymentStatus || 'Inviato'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Info & Details */}
          <div className="lg:col-span-4 space-y-8">
            
            <div className="bg-white border border-slate-100 rounded-[3rem] shadow-sm overflow-hidden sticky top-8">
              <div className="p-10 border-b border-slate-100 bg-slate-50/30 text-center">
                <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-3xl text-white font-black uppercase shadow-2xl shadow-indigo-100 mb-6 mx-auto">
                  {selectedCustomer.businessName?.substring(0, 2)}
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-tight mb-2 flex items-center justify-center gap-2">
                  {selectedCustomer.businessName}
                  {analytics && <SegmentBadge totalSpent={analytics.ltv} />}
                </h3>
                <div className="flex justify-center flex-wrap gap-2 mt-4">
                  <span className="px-3 py-1 bg-slate-200/50 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-full">B2B Verified</span>
                </div>
              </div>

              <div className="p-10 space-y-10">
                {isEditing ? (
                  <div className="space-y-5">
                    <div><label className={labelCls}>Ragione Sociale</label><input type="text" className={inputCls} value={editForm.businessName} onChange={e => setEditForm({...editForm, businessName: e.target.value})} /></div>
                    <div><label className={labelCls}>Referente</label><input type="text" className={inputCls} value={editForm.contactName} onChange={e => setEditForm({...editForm, contactName: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className={labelCls}>P.IVA</label><input type="text" className={inputCls} value={editForm.vatNumber} onChange={e => setEditForm({...editForm, vatNumber: e.target.value})} /></div>
                      <div><label className={labelCls}>Codice SDI</label><input type="text" className={inputCls} value={editForm.sdiCode} onChange={e => setEditForm({...editForm, sdiCode: e.target.value})} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className={labelCls}>Email</label><input type="email" className={inputCls} value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} /></div>
                      <div><label className={labelCls}>Telefono</label><input type="tel" className={inputCls} value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div><label className={labelCls}>Città</label><input type="text" className={inputCls} value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} /></div>
                      <div><label className={labelCls}>Prov.</label><input type="text" className={inputCls} value={editForm.region} onChange={e => setEditForm({...editForm, region: e.target.value})} /></div>
                      <div>
                        <label className={labelCls}>Stato Nazione</label>
                        <select 
                          className={inputCls + " appearance-none cursor-pointer"} 
                          value={editForm.country || 'Italia'} 
                          onChange={e => setEditForm({...editForm, country: e.target.value})}
                        >
                          <option value="Italia">Italia</option>
                          <option value="Svizzera">Svizzera</option>
                          <option value="Francia">Francia</option>
                          <option value="Germania">Germania</option>
                          <option value="Spagna">Spagna</option>
                          <option value="Austria">Austria</option>
                        </select>
                      </div>
                    </div>
                    <div><label className={labelCls}>Indirizzo</label><input type="text" className={inputCls} value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Stato Cliente (Mappa)</label>
                        <select 
                          className={inputCls + " appearance-none cursor-pointer"} 
                          value={editForm.status} 
                          onChange={e => setEditForm({...editForm, status: e.target.value})}
                        >
                          <option value="ATTIVO">Attivo (Verde)</option>
                          <option value="INATTIVO">Inattivo (Rosso)</option>
                          <option value="POTENZIALE">Potenziale (Giallo)</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Note Interne</label>
                        <textarea rows={1} className={`${inputCls} resize-none`} value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-6">
                      <h4 className="flex items-center gap-3 text-slate-900 border-l-4 border-indigo-600 pl-4">
                        <span className="text-[10px] font-black uppercase tracking-widest">Contatti & Anagrafica</span>
                      </h4>
                    <div className="space-y-4">
                      <div>
                        <label className={labelCls}>Referente</label>
                        <div className={inputCls + " bg-slate-50/50 border-slate-100"}>{selectedCustomer.contactName || '—'}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>P.IVA</label>
                          <div className={inputCls + " bg-slate-50/50 border-slate-100"}>{selectedCustomer.vatNumber || '—'}</div>
                        </div>
                        <div>
                          <label className={labelCls}>Codice SDI</label>
                          <div className={inputCls + " bg-slate-50/50 border-slate-100"}>{selectedCustomer.sdiCode || '—'}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Email</label>
                          <div className={inputCls + " bg-slate-50/50 border-slate-100"}>{selectedCustomer.email || '—'}</div>
                        </div>
                        <div>
                          <label className={labelCls}>Telefono</label>
                          <div className={inputCls + " bg-slate-50/50 border-slate-100"}>{selectedCustomer.phone || '—'}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className={labelCls}>Città</label>
                          <div className={inputCls + " bg-slate-50/50 border-slate-100"}>{selectedCustomer.city || '—'}</div>
                        </div>
                        <div>
                          <label className={labelCls}>Prov.</label>
                          <div className={inputCls + " bg-slate-50/50 border-slate-100"}>{selectedCustomer.region || '—'}</div>
                        </div>
                        <div>
                          <label className={labelCls}>Stato</label>
                          <div className={inputCls + " bg-indigo-50 border-indigo-100 text-indigo-700 font-black"}>{selectedCustomer.country || 'Italia'}</div>
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Indirizzo</label>
                        <div className={inputCls + " bg-slate-50/50 border-slate-100"}>{selectedCustomer.address || '—'}</div>
                      </div>
                    </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="flex items-center gap-3 text-slate-900 border-t border-slate-100 pt-8">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Annotazioni Interne</span>
                      </h4>
                      <div className="p-6 bg-amber-50/30 border border-amber-100 rounded-[2rem] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10 font-bold">INFO</div>
                        {selectedCustomer.notes ? (
                          <p className="text-sm text-slate-700 leading-relaxed font-medium italic">"{selectedCustomer.notes}"</p>
                        ) : (
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest text-center py-4 italic opacity-50">Nessuna nota presente</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="px-10 py-8 bg-slate-100/50 border-t border-slate-100">
                <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95">Espandi Statistiche Avanzate</button>
              </div>
            </div>
          </div>

        </div>

        {/* Global OrderDrawer for this view */}
        <OrderDrawer 
          order={selectedOrder} 
          isOpen={!!selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onUpdate={fetchCustomers}
        />
      </div>
    );
  }

  // ─── RENDERING CUSTOMER LIST (DEFAULT) ──────────────────────────────────
  return (
    <div className="space-y-6 relative min-h-screen pb-20 animate-in fade-in duration-700">

      {/* ── Header & Search ── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
            Portafoglio <span className="text-indigo-600">Clienti.</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{filtered.length} aziende censite nel database</p>
        </div>
        
        <div className="flex flex-col flex-1 max-w-2xl gap-4">
          <div className="flex gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              <input
                type="text"
                placeholder="Cerca cliente per nome, email, città..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-[1.5rem] text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
              />
            </div>
            <button onClick={fetchCustomers} className="p-4 bg-white border border-slate-100 rounded-[1.5rem] text-slate-600 hover:text-indigo-600 hover:shadow-xl hover:shadow-indigo-50 transition-all active:scale-90">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-1 bg-slate-50 border border-slate-100 p-1 rounded-[1.5rem] overflow-x-auto scrollbar-none whitespace-nowrap">
              {['ALL', '2026', '2025', '2024', '2023'].map((y) => (
                <button
                  key={y}
                  onClick={() => setYearFilter(y)}
                  className={`px-4 py-3 flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    yearFilter === y ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {y === 'ALL' ? 'Totale' : y}
                </button>
              ))}
            </div>
            <div className="flex bg-white border border-slate-100 p-1 rounded-[1.5rem] divide-x divide-slate-50">
              {[
                { id: 'ACTIVE',   label: 'Attivi' },
                { id: 'ARCHIVED', label: 'Archiviati' },
                { id: 'ALL',      label: 'Tutti' }
              ].map(f => (
                <button 
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === f.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-indigo-600 transition-colors select-none" onClick={() => handleSort('name')}>
                  Denominazione <SortIcon field="name" />
                </th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recapiti</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sede Operativa</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cod. Fiscale/P.Iva</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right cursor-pointer hover:text-indigo-600 transition-colors select-none" onClick={() => handleSort('volume')}>
                  Affari (LTV) <SortIcon field="volume" />
                </th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Dashboard</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="6" className="py-24 text-center"><RefreshCw className="w-10 h-10 animate-spin text-indigo-600 mx-auto opacity-20" /></td></tr>
              ) : sorted.length === 0 ? (
                <tr><td colSpan="6" className="py-24 text-center font-black text-slate-300 uppercase italic tracking-widest">Nessun cliente corrispondente</td></tr>
              ) : sorted.map(c => {
                const validOrders = yearFilter === 'ALL' ? (c.orders || []) : (c.orders || []).filter(o => o.date && new Date(o.date).getFullYear().toString() === yearFilter);
                const ltv = validOrders.reduce((s, o) => s + parseFloat(o.totalAmount || 0), 0);
                const ordersCount = validOrders.length;
                
                return (
                  <tr key={c.id} className="hover:bg-indigo-50/30 transition-all group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 text-sm group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-200 transition-all uppercase">
                          {c.businessName?.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase leading-none mb-1.5 tracking-tight flex items-center gap-2 flex-wrap">
                            {c.businessName}
                            <SegmentBadge totalSpent={ltv} />
                            {c.status === 'INATTIVO' && <span className="text-[8px] bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full border border-rose-100 uppercase tracking-widest">Archiviato</span>}
                          </p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter opacity-50"># {c.id ? c.id.substring(0, 8) : '---'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1.5">
                        <span className="flex items-center gap-2 text-xs text-slate-600 font-bold"><Mail className="w-3.5 h-3.5 text-slate-300" /> {c.email || '—'}</span>
                        <span className="flex items-center gap-2 text-xs text-slate-600 font-bold"><Phone className="w-3.5 h-3.5 text-slate-300" /> {c.phone || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-xs font-bold text-slate-500 uppercase tracking-tight">
                      {[c.city, c.region].filter(Boolean).join(', ') || 'DA DEFINIRE'}
                    </td>
                    <td className="px-6 py-6">
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[9px] font-black uppercase rounded-lg tracking-widest whitespace-nowrap">{c.vatNumber || '—'}</span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <p className="font-black text-slate-900 text-base italic leading-none mb-1 tracking-tighter">€{ltv.toLocaleString()}</p>
                      <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">{ordersCount} ORDINI TOTALI</p>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <button
                        onClick={() => setSelected(c)}
                        className="px-6 py-3 bg-white border border-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 hover:shadow-xl hover:shadow-indigo-50 transition-all active:scale-95"
                      >
                        Apri Dashboard
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <OrderDrawer 
        order={selectedOrder} 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        onUpdate={fetchCustomers}
      />
    </div>
  );
};

export default Customers;
