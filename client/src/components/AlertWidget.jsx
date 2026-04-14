import React from 'react';
import { AlertCircle, AlertTriangle, Info, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const severityStyles = {
  critical: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    text: 'text-rose-500',
    icon: AlertCircle,
    pulse: 'animate-pulse'
  },
  high: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-500',
    icon: AlertTriangle,
    pulse: ''
  },
  medium: {
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    text: 'text-indigo-500',
    icon: Info,
    pulse: ''
  }
};

const AlertItem = ({ alert }) => {
  const style = severityStyles[alert.severity] || severityStyles.medium;
  const Icon = style.icon;

  return (
    <div className={`flex items-center justify-between p-6 ${style.bg} border ${style.border} rounded-3xl transition-all hover:bg-opacity-20 cursor-pointer group`}>
      <div className="flex items-center gap-5">
        <div className={`p-3 rounded-2xl bg-white shadow-sm ${style.pulse}`}>
          <Icon size={20} className={style.text} />
        </div>
        <div>
          <p className={`text-[10px] font-black uppercase tracking-widest ${style.text} mb-1`}>
            {alert.type || 'SISTEMA'}
          </p>
          <p className="text-sm font-bold text-white leading-tight">
            {alert.message}
          </p>
        </div>
      </div>
      <Link to={alert.link || '#'} className="p-3 bg-white/5 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-slate-900">
        <ArrowUpRight size={18} />
      </Link>
    </div>
  );
};

const AlertWidget = ({ alerts = [] }) => {
  // Mock data per demo se non ci sono alert
  const demoAlerts = alerts.length > 0 ? alerts : [
    { type: 'FISCALE', severity: 'critical', message: 'Fattura cliente "Gino Shop" scaduta da 12 giorni', link: '/invoices' },
    { type: 'ANDAMENTO', severity: 'high', message: 'Top Customer "Moda Milano" non ordina da oltre 90 giorni', link: '/performance' },
    { type: 'LEAD', severity: 'medium', message: '5 nuovi Lead importati da Google Sheets attendono contatto', link: '/leads' }
  ];

  return (
    <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-200/50">
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-3xl font-black italic uppercase flex items-center gap-4 tracking-tighter">
            <span className="w-3 h-3 bg-rose-500 rounded-full animate-ping"></span>
            Critical Hub
          </h3>
          <span className="text-[10px] font-black text-slate-400 bg-white/5 px-4 py-2 rounded-full tracking-widest uppercase border border-white/5">
            {demoAlerts.length} Notifiche Attive
          </span>
        </div>

        <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
          {demoAlerts.map((alert, idx) => (
            <AlertItem key={idx} alert={alert} />
          ))}
        </div>
      </div>

      {/* Luce decorativa */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[120px] -z-0"></div>
    </div>
  );
};

export default AlertWidget;
