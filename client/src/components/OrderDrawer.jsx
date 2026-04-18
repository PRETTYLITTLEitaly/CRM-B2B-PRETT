import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Package, 
  Truck, 
  MapPin, 
  ShoppingCart, 
  Calendar, 
  CreditCard,
  ExternalLink,
  Info,
  Save,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

const OrderDrawer = ({ order, isOpen, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [commissionEnabled, setCommissionEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (order) {
      setPaymentStatus(order.paymentStatus || 'IN_ATTESA');
      setPaymentMethod(order.paymentMethod || '');
      setCommissionEnabled(order.commissionEnabled !== false); // Defaults to true unless explicitly false
      
      let dVal = '';
      if (order.deliveryDate) {
        const d = new Date(order.deliveryDate);
        if (!isNaN(d.getTime())) {
          dVal = d.toISOString().split('T')[0];
        }
      }
      setDeliveryDate(dVal);
      setSaveSuccess(false);
    }
  }, [order, isOpen]);

  if (!order) return null;

  // Parsea i prodotti se sono in formato stringa JSON
  let products = [];
  try {
    products = typeof order.productsJson === 'string' 
      ? JSON.parse(order.productsJson) 
      : (order.productsJson || []);
  } catch (e) {
    console.error("Errore parsing prodotti:", e);
  }

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus, paymentMethod, deliveryDate: deliveryDate || null, commissionEnabled }),
      });
      
      if (res.ok) {
        setSaveSuccess(true);
        if (onUpdate) onUpdate(); // NOTIFICA IL PADRE
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Errore salvataggio ordine:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const paymentOptions = [
    { value: 'IN_ATTESA', label: 'Pagamento in attesa', color: 'bg-amber-100 text-amber-700', icon: Clock },
    { value: 'SALDATO', label: 'Saldato', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
    { value: 'PARZIALE', label: 'Pagato Parzialmente', color: 'bg-blue-100 text-blue-700', icon: Info },
    { value: 'ANNULLATO', label: 'Annullato', color: 'bg-rose-100 text-rose-700', icon: AlertCircle },
  ];

  const methodOptions = [
    { value: 'BONIFICO', label: 'Bonifico Bancario' },
    { value: 'CONTANTI', label: 'Contanti' },
    { value: 'RIBA', label: 'Ri.Ba.' },
    { value: 'CARTA', label: 'Carta / POS' },
    { value: 'PAYPAL', label: 'PayPal' },
    { value: 'ASSEGNO BANCARIO', label: 'Assegno Bancario' },
    { value: 'ASSEGNO BANCARIO P.D.', label: 'Assegno Bancario P.D.' },
    { value: 'ALTRO', label: 'Altro / Specifica nelle note' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-[110] transform transition-transform duration-500 ease-out border-l border-slate-100 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-sm font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-lg">Gestione Ordine</span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic">#{order.orderNumber || order.shopifyOrderId || '---'}</h2>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Acquisito il {order.date ? new Date(order.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' }) : '---'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 hover:shadow-lg transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          
          {/* Status Override Form */}
          <div className="space-y-6 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-indigo-500" /> Settaggi Interni B2B
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Stato del Pagamento</label>
                <select 
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-black uppercase tracking-tight focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none appearance-none cursor-pointer"
                >
                  {paymentOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Metodo di Pagamento</label>
                <select 
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-black uppercase tracking-tight focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none appearance-none cursor-pointer"
                >
                  <option value="">Non specificato</option>
                  {methodOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={isSaving}
              className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl ${
                saveSuccess 
                ? 'bg-emerald-500 text-white shadow-emerald-100' 
                : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700'
              }`}
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : saveSuccess ? (
                <><CheckCircle2 className="w-4 h-4" /> Salvato con Successo</>
              ) : (
                <><Save className="w-4 h-4" /> Aggiorna Stato Interno</>
              )}
            </button>
            <div className="pt-6 border-t border-slate-200 mt-6 md:col-span-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block flex items-center gap-2">
                <Calendar className="w-3 h-3 text-indigo-500" /> Data di Consegna Prevista
              </label>
              <input 
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-black uppercase tracking-tight focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none cursor-pointer"
              />
            </div>
            
            {user?.commissionRate > 0 && (
              <div className="pt-6 border-t border-slate-200 mt-6 md:col-span-2">
                <label className="flex items-center gap-4 cursor-pointer group select-none">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      className="sr-only"
                      checked={commissionEnabled}
                      onChange={async (e) => {
                        const isChecked = e.target.checked;
                        setCommissionEnabled(isChecked);
                        // Save automatically when toggled to ensure immediate persist
                        try {
                          setIsSaving(true);
                          await fetch(`/api/orders/${order.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ paymentStatus, paymentMethod, deliveryDate: deliveryDate || null, commissionEnabled: isChecked }),
                          });
                          if (onUpdate) onUpdate();
                        } catch (err) {
                          console.error('Failed to quick-save commission state', err);
                        } finally {
                          setIsSaving(false);
                        }
                      }}
                    />
                    <div className={`w-8 h-8 rounded-xl border-2 transition-all flex items-center justify-center ${commissionEnabled ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-100 border-slate-200 group-hover:border-emerald-300'}`}>
                      {commissionEnabled && <CheckCircle2 className="w-5 h-5 text-white" />}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${commissionEnabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {commissionEnabled ? 'Provvigione Attivata' : 'Provvigione Esclusa'}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">Attiva o disattiva il calcolo commissionale su questo ordine</span>
                  </div>
                </label>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={`p-6 rounded-[2rem] border ${order.fulfillmentStatus === 'fulfilled' ? 'bg-indigo-50 border-indigo-100' : 'bg-amber-50 border-amber-100'}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2 ${order.fulfillmentStatus === 'fulfilled' ? 'text-indigo-700' : 'text-amber-700'}`}>
                <Truck className="w-4 h-4" /> Spedizione Shopify
              </p>
              <span className={`text-xl font-black uppercase italic tracking-tighter ${order.fulfillmentStatus === 'fulfilled' ? 'text-indigo-900' : 'text-amber-900'}`}>
                {order.fulfillmentStatus === 'fulfilled' ? 'Spedito' : 'Inevaso'}
              </span>
            </div>
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" /> Stato Shopify
              </p>
              <span className="text-xl font-black text-slate-600 uppercase italic tracking-tighter">
                {order.shopifyPaymentStatus || order.financialStatus || 'N/A'}
              </span>
            </div>
          </div>

          {/* Customer Section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Informazioni Cliente
            </h3>
            <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-xl shadow-slate-100 relative overflow-hidden group">
              <ShoppingCart className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-10">
                <p className="text-2xl font-black italic tracking-tighter mb-2 uppercase">{order.customer?.businessName || 'Cliente Shopify'}</p>
                <div className="flex flex-col gap-1 opacity-60 text-xs font-bold">
                  <span>{order.customer?.email}</span>
                  <span>{order.customer?.city}, {order.customer?.region}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Products List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Package className="w-4 h-4" /> Articoli Ordinati ({products.length})
              </h3>
            </div>
            
            <div className="space-y-4">
              {products.length === 0 ? (
                <div className="p-10 bg-slate-50 rounded-3xl text-center text-slate-400 flex flex-col items-center gap-3">
                  <Info className="w-8 h-8 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-widest italic">Nessun dettaglio prodotti disponibile</p>
                </div>
              ) : products.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-3xl hover:border-indigo-200 hover:shadow-lg transition-all group">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-900 uppercase tracking-tight truncate text-sm mb-1">{item.title || item.name || 'Prodotto'}</p>
                    <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                      SKU: {item.sku || 'N/A'} <span className="mx-2 text-slate-200">|</span> Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900 italic tracking-tighter">€{(parseFloat(item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                    <p className="text-[9px] font-bold text-slate-400 opacity-60">CAD. €{parseFloat(item.price || 0).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Summary */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-4">
          
          <div className="space-y-3 pb-4 border-b border-slate-200/60">
            {(() => {
              const actualSubtotal = products.reduce((sum, item) => sum + (parseFloat(item.price || 0) * (item.quantity || 1)), 0);
              const totalLineDiscounts = products.reduce((sum, item) => sum + parseFloat(item.total_discount || 0), 0);
              const calculatedShipping = Math.max(0, parseFloat(order.totalAmount || 0) - (actualSubtotal - totalLineDiscounts));
              
              let discounts = [];
              try { discounts = typeof order.discountsJson === 'string' ? JSON.parse(order.discountsJson) : (order.discountsJson || []); } catch(e) {}

              // Determiniamo i nomi degli sconti, se presenti
              let discountNames = [];
              if (discounts && discounts.length > 0) {
                discountNames = discounts.map(d => d.code || d.title).filter(Boolean);
              }
              
              if (discountNames.length === 0 && totalLineDiscounts > 0) {
                discountNames = ['SUGLI ARTICOLI']; // Fallback dinamico
              }

              // Estraiamo un'unica etichetta per tutti gli sconti uniti, garantendo l'integrità matematica del Totale Linee
              const discountLabel = discountNames.length > 0 
                ? discountNames.join(', ') 
                : 'APPLICATO';

              return (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-500 uppercase tracking-tight">Subtotale ({products.reduce((sum, item) => sum + (item.quantity || 1), 0)} articoli)</span>
                    <span className="text-sm font-black text-slate-700 italic">€{actualSubtotal.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-500 uppercase tracking-tight">Spedizione / Tasse</span>
                    <span className="text-sm font-black text-slate-700 italic">€{calculatedShipping.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  {totalLineDiscounts > 0 && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100/50">
                      <span className="text-xs font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
                        🛍️ Sconto {discountLabel}
                      </span>
                      <span className="text-sm font-black text-rose-600 italic">
                        -€{totalLineDiscounts.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </>
              );
            })()}
          </div>


          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Totale Finale</span>
            <div className="flex flex-col items-end">
              <span className="text-4xl font-black text-indigo-600 tracking-tighter italic leading-none">
                €{parseFloat(order.totalAmount || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              {(user?.commissionRate > 0) && (() => {
                const subtotal = products.reduce((sum, item) => sum + (parseFloat(item.price || 0) * (item.quantity || 1)), 0);
                
                let discounts = [];
                try { discounts = typeof order.discountsJson === 'string' ? JSON.parse(order.discountsJson) : (order.discountsJson || []); } catch(e) {}
                const hasSconto = discounts.some(d => d.code && d.code.toUpperCase().replace(/\s/g, '') === 'SCONTO22');
                const commissionBase = hasSconto ? subtotal : (subtotal * 0.78);

                return (
                  <span className={`text-[9px] font-black uppercase tracking-widest mt-2 px-3 py-1 rounded-full ring-1 ${commissionEnabled ? 'bg-emerald-50 text-emerald-600 ring-emerald-100' : 'bg-slate-50 text-slate-400 ring-slate-200 line-through'}`}>
                    Provvigione ({user.commissionRate}%): €{commissionEnabled ? ((commissionBase * user.commissionRate) / 100).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}
                  </span>
                );
              })()}
            </div>
          </div>
          
          <div className="pt-2">
            <a 
              href={`https://${import.meta.env.VITE_SHOPIFY_SHOP_NAME}/admin/orders/${order.id}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <ExternalLink className="w-4 h-4" /> Apri su Shopify
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDrawer;
