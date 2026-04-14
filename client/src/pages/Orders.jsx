import React from 'react';
import { 
  ShoppingCart, 
  ExternalLink, 
  Package, 
  CircleDot, 
  CheckCircle2, 
  Clock,
  Search,
  Filter
} from 'lucide-react';

const orders = [
  { id: '#1052', customer: 'Tech Gadgets Hub', date: '2 ore fa', items: 3, total: '€450.00', status: 'In elaborazione', type: 'Shopify' },
  { id: '#1051', customer: 'Fashion Boutique', date: '5 ore fa', items: 1, total: '€1,200.00', status: 'Spedito', type: 'Shopify' },
  { id: '#1050', customer: 'Lombardi Vini', date: 'Ieri', items: 12, total: '€2,450.00', status: 'Consegnato', type: 'Manuale' },
  { id: '#1049', customer: 'Bio Store XL', date: '2 giorni fa', items: 5, total: '€320.00', status: 'Cancellato', type: 'Shopify' },
];

const StatusBadge = ({ status }) => {
  const styles = {
    'In elaborazione': 'bg-accent/10 text-accent border-accent/20',
    'Spedito': 'bg-indigo-400/10 text-indigo-400 border-indigo-400/20',
    'Consegnato': 'bg-success/10 text-success border-success/20',
    'Cancellato': 'bg-danger/10 text-danger border-danger/20',
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${styles[status]}`}>
      {status}
    </span>
  );
};

const Orders = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-text-main">Gestione Ordini</h2>
          <p className="text-text-dim mt-1">Sincronizzazione in tempo reale con Shopify Admin API.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg border border-border hover:bg-white/5 transition-colors flex items-center gap-2">
            <Filter size={18} />
            Filtri Avanzati
          </button>
          <button className="btn-primary flex items-center gap-2">
            Sincronizza Shopify
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card border-l-4 border-l-accent flex items-center gap-4">
          <div className="p-3 rounded-xl bg-accent/10 text-accent">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-text-dim text-xs font-bold uppercase">In Sospeso</p>
            <h4 className="text-xl font-bold">14 Ordini</h4>
          </div>
        </div>
        <div className="card border-l-4 border-l-success flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success/10 text-success">
            <Package size={24} />
          </div>
          <div>
            <p className="text-text-dim text-xs font-bold uppercase">Da Spedire oggi</p>
            <h4 className="text-xl font-bold">5 Ordini</h4>
          </div>
        </div>
        <div className="card border-l-4 border-l-indigo-400 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-400/10 text-indigo-400">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-text-dim text-xs font-bold uppercase">Completati (30gg)</p>
            <h4 className="text-xl font-bold">128 Ordini</h4>
          </div>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center bg-white/5">
           <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={16} />
              <input type="text" placeholder="Cerca ordine..." className="w-full bg-bg-primary border border-border rounded-lg py-1.5 pl-9 pr-3 text-sm focus:outline-none" />
           </div>
           <div className="flex gap-2">
             <button className="text-xs font-bold px-3 py-1.5 rounded-lg bg-accent text-white">Tutti</button>
             <button className="text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-white/5 text-text-dim transition-colors">Shopify</button>
             <button className="text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-white/5 text-text-dim transition-colors">Manuali</button>
           </div>
        </div>
        <table className="w-full text-left">
          <thead className="text-[10px] uppercase text-text-dim font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Ordine</th>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Prodotti</th>
              <th className="px-6 py-4">Totale</th>
              <th className="px-6 py-4">Stato</th>
              <th className="px-6 py-4 text-right">Shopify</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4 font-bold text-text-main">{order.id}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium">{order.customer}</div>
                </td>
                <td className="px-6 py-4 text-xs text-text-dim">{order.date}</td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1.5 text-xs">
                    <Package size={12} className="text-text-dim" /> {order.items} SKU
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-sm text-text-main">{order.total}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  {order.type === 'Shopify' && (
                    <button className="p-2 rounded-lg hover:bg-accent/10 text-text-dim hover:text-accent transition-colors">
                      <ExternalLink size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
