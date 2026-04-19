import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Mail, Phone, ExternalLink, RefreshCw } from 'lucide-react';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leads');
      if (!response.ok) throw new Error('Errore nel caricamento dei dati');
      const data = await response.json();
      setLeads(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter italic uppercase">
          Leads <span className="text-indigo-600">Pipeline.</span>
        </h1>
        <div className="flex gap-3 md:gap-4">
          <button 
            onClick={fetchLeads}
            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:text-indigo-600 transition-all flex-none"
            title="Aggiorna Dati"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="btn-primary flex items-center justify-center gap-2 flex-1 md:flex-none">
            <Plus className="w-4 h-4" /> Importa Nuovi
          </button>
        </div>
      </div>

      <div className="card flex items-center gap-6 !p-6 bg-slate-50/50">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Filtra per nome o zona..." 
            className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600/10 transition-all"
          />
        </div>
        <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:text-indigo-600 transition-all">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Caricamento in corso...</p>
        </div>
      ) : error ? (
        <div className="card border-rose-100 bg-rose-50 text-rose-600 p-10 text-center">
          <p className="font-black uppercase tracking-widest text-sm mb-2">Ops! Qualcosa è andato storto</p>
          <p className="text-xs">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {leads.length === 0 ? (
            <div className="card py-20 text-center">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Nessun lead trovato.</p>
            </div>
          ) : (
            leads.map((lead, i) => (
              <div key={lead.id || i} className="card group hover:scale-[1.01] !p-6 md:!p-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center text-xl md:text-2xl group-hover:bg-indigo-50 transition-colors shrink-0">
                      🏢
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight mb-1">{lead.companyName || lead.name}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>{lead.contactPerson || 'Nessun contatto'}</span>
                        <span className="hidden sm:block w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="truncate max-w-[200px]">{lead.email || 'No email'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-6 md:gap-12 pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        lead.status === 'NEW' ? 'bg-indigo-50 text-indigo-600' : 
                        lead.status === 'CONTACTED' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {lead.status || 'NEW'}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <a href={`mailto:${lead.email}`} className="p-3 bg-slate-50 rounded-2xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                        <Mail className="w-4 h-4" />
                      </a>
                      <a href={`tel:${lead.phone}`} className="p-3 bg-slate-50 rounded-2xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                        <Phone className="w-4 h-4" />
                      </a>
                      <button className="p-3 bg-slate-900 rounded-2xl text-white hover:bg-indigo-600 transition-all">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Leads;
