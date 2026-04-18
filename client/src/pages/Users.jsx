import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Shield, Mail, User as UserIcon, ShieldAlert, Trash2, RefreshCw } from 'lucide-react';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [commissionRate, setCommissionRate] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState('');
  
  // Modal State
  const [showConfirm, setShowConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setUsers(result.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsCreating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, password, firstName, lastName, role, commissionRate })
      });
      const result = await res.json();
      if (result.success) {
        setMessage('Utente creato con successo!');
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
        setCommissionRate('');
        fetchUsers();
      } else {
        setMessage('Errore: ' + result.message);
      }
    } catch (err) {
      setMessage('Errore di connessione');
    } finally {
      setIsCreating(false);
    }
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowConfirm(true);
  };

  const executeDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/auth/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setShowConfirm(false);
        setUserToDelete(null);
        fetchUsers();
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert('Errore eliminazione user');
    } finally {
      setIsDeleting(false);
    }
  };

  if (currentUser.role !== 'SUPER_ADMIN') {
    return (
      <div className="p-20 text-center">
        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-6 opacity-20" />
        <h2 className="text-2xl font-black text-slate-900 uppercase italic">Accesso Negato</h2>
        <p className="text-xs font-bold text-slate-400 mt-2">Questa sezione è riservata ai Super Admin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      
      {/* Custom Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <ShieldAlert className="w-10 h-10 text-rose-500" />
            </div>
            <h3 className="text-xl font-black text-slate-900 text-center uppercase italic mb-4">Elimina Account?</h3>
            <p className="text-xs font-medium text-slate-400 text-center leading-relaxed mb-8">
              Stai per revocare l'accesso a <span className="font-black text-slate-900">{userToDelete?.firstName} {userToDelete?.lastName}</span>. <br />
              Questa azione non può essere annullata.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={executeDelete}
                disabled={isDeleting}
                className="w-full py-4 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
              >
                {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Sì, conferma eliminazione'}
              </button>
              <button 
                onClick={() => setShowConfirm(false)}
                className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
              >
                Annulla operazione
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">
          Gestione <span className="text-indigo-600">Team.</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        
        {/* Creation Form */}
        <div className="xl:col-span-4 card !p-10 space-y-8 h-fit sticky top-36">
          <div>
            <h3 className="text-xl font-black text-slate-900 uppercase italic flex items-center gap-3">
              <UserPlus className="w-6 h-6 text-indigo-600" /> Nuovo Account
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Inserisci le credenziali per il nuovo membro del team</p>
          </div>

          <form onSubmit={handleCreate} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Nome</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                    <input 
                      type="text" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Mario"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-10 pr-4 text-xs font-bold focus:ring-4 focus:ring-indigo-600/5 focus:bg-white transition-all outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Cognome</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                    <input 
                      type="text" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Rossi"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-10 pr-4 text-xs font-bold focus:ring-4 focus:ring-indigo-600/5 focus:bg-white transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Email Aziendale</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@prettylittle.it"
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-10 pr-4 text-xs font-bold focus:ring-4 focus:ring-indigo-600/5 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Password Temporanea</label>
                <div className="relative">
                  <RefreshCw className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimo 8 caratteri"
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-10 pr-4 text-xs font-bold focus:ring-4 focus:ring-indigo-600/5 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Livello Autorizzazione</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-10 pr-4 text-xs font-bold focus:ring-4 focus:ring-indigo-600/5 focus:bg-white transition-all outline-none appearance-none"
                  >
                    <option value="ADMIN">ADMIN (Accesso Standard)</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Controllo Totale)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Provvigione (%)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    step="0.1"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    placeholder="Es. 15.5"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-10 pr-4 text-xs font-bold focus:ring-4 focus:ring-indigo-600/5 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-tight ${message.includes('successo') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {message}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isCreating}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isCreating ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Attiva Nuovo Collaboratore'}
            </button>
          </form>
        </div>

        {/* User List */}
        <div className="xl:col-span-8 space-y-8">
          <div className="card !p-0 overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase italic">Team Attivo</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Lista completa dei membri con accesso al CRM</p>
              </div>
              <div className="px-4 py-2 bg-slate-50 rounded-full text-[10px] font-black text-slate-400 uppercase">
                {users.length} Utenti
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Collaboratore</th>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</th>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ruolo</th>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Provvigione</th>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-10 py-20 text-center">
                        <RefreshCw className="w-8 h-8 text-indigo-200 animate-spin mx-auto mb-4" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Caricamento collaboratori...</p>
                      </td>
                    </tr>
                  ) : users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs border-2 border-white shadow-sm ring-1 ring-slate-100">
                            {u.firstName?.charAt(0) || u.email?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 uppercase tracking-tight">
                              {u.firstName || 'Senza'} {u.lastName || 'Nome'}
                            </p>
                            <p className="text-[9px] text-slate-400 font-bold">{u.id === currentUser.id ? 'TU (Profilo Attivo)' : 'Membro del Team'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <span className="text-xs font-bold text-slate-500">{u.email}</span>
                      </td>
                      <td className="px-10 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          u.role === 'SUPER_ADMIN' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-10 py-6">
                        <span className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1 rounded-lg">
                          {u.commissionRate ? `${u.commissionRate}%` : '0%'}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        {u.id !== currentUser.id && (
                          <button 
                            onClick={() => confirmDelete(u)}
                            className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Elimina Utente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Users;
