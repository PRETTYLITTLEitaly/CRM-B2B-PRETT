import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Download,
  MoreVertical,
  Mail,
  Phone,
  ArrowUpDown
} from 'lucide-react';

const STATUS_COLORS = {
  NEW: 'bg-accent/10 text-accent border-accent/20',
  CONTACTED: 'bg-warning/10 text-warning border-warning/20',
  NEGOTIATION: 'bg-indigo-400/10 text-indigo-400 border-indigo-400/20',
  CLOSED: 'bg-success/10 text-success border-success/20',
};

const Leads = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock Data (will be fetched from API later)
  const leads = [
    { id: '1', storeName: 'Tech Gadgets Hub', contactName: 'Mario Rossi', phone: '+39 333 1234567', email: 'mario@techhub.com', city: 'Milano', source: 'Google', status: 'NEW', createdAt: '2024-04-10' },
    { id: '2', storeName: 'Fashion Boutique', contactName: 'Laura Bianchi', phone: '+39 347 9876543', email: 'laura@boutique.it', city: 'Roma', source: 'Instagram', status: 'CONTACTED', createdAt: '2024-04-09' },
    { id: '3', storeName: 'Lombardi Vini', contactName: 'Giuseppe Lombardi', phone: '+39 338 1112233', email: 'info@lombardivini.com', city: 'Firenze', source: 'Referral', status: 'NEGOTIATION', createdAt: '2024-04-08' },
    { id: '4', storeName: 'Bio Store XL', contactName: 'Anna Verde', phone: '+39 339 4445566', email: 'anna@biostore.com', city: 'Torino', source: 'Google Maps', status: 'CLOSED', createdAt: '2024-04-07' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-text-main">Gestione Lead</h2>
          <p className="text-text-dim mt-1">Monitora e aggiorna i potenziali clienti acquisiti.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg border border-border hover:bg-white/5 transition-colors flex items-center gap-2">
            <Download size={18} />
            Esporta CSV
          </button>
          <button className="btn-primary flex items-center gap-2">
            Importa da Google Sheets
          </button>
        </div>
      </header>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
          <input 
            type="text" 
            placeholder="Cerca per nome negozio, email o città..."
            className="w-full bg-bg-secondary border border-border rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-accent transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
          <select className="w-full bg-bg-secondary border border-border rounded-xl py-2.5 pl-10 pr-4 appearance-none focus:outline-none focus:border-accent">
            <option>Tutti gli stati</option>
            <option>Nuovo</option>
            <option>Contattato</option>
            <option>Trattativa</option>
            <option>Chiuso</option>
          </select>
        </div>
        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
          <select className="w-full bg-bg-secondary border border-border rounded-xl py-2.5 pl-10 pr-4 appearance-none focus:outline-none focus:border-accent">
            <option>Data decrescente</option>
            <option>Data crescente</option>
            <option>Nome A-Z</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="card overflow-hidden !p-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-white/5">
              <th className="px-6 py-4 font-semibold text-sm">Negozio</th>
              <th className="px-6 py-4 font-semibold text-sm">Città</th>
              <th className="px-6 py-4 font-semibold text-sm">Contatti</th>
              <th className="px-6 py-4 font-semibold text-sm">Stato</th>
              <th className="px-6 py-4 font-semibold text-sm">Fonte</th>
              <th className="px-6 py-4 font-semibold text-sm text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-text-main">{lead.storeName}</div>
                  <div className="text-xs text-text-dim">{lead.contactName}</div>
                </td>
                <td className="px-6 py-4 text-sm text-text-dim italic">
                  {lead.city}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs text-text-dim hover:text-accent transition-colors cursor-pointer capitalize">
                      <Mail size={12} /> {lead.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-dim hover:text-accent transition-colors cursor-pointer">
                      <Phone size={12} /> {lead.phone}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${STATUS_COLORS[lead.status]}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-text-dim">
                  {lead.source}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 rounded-lg hover:bg-white/10 text-text-dim">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leads;
