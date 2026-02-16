
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface AdminPanelProps {
  onClose: () => void;
  currentUser: User | null;
}

const USERS_DB_KEY = 'deepvera_users_database';
const TOKENS_KEY = 'deepvera_tokens';

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, currentUser }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'stats' | 'system'>('users');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const saved = localStorage.getItem(USERS_DB_KEY);
    if (saved) setUsers(JSON.parse(saved));
  };

  const saveUsers = (updatedUsers: any[]) => {
    setUsers(updatedUsers);
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(updatedUsers));
  };

  const handleUpdateTokens = (userId: string, amount: number) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, tokenBalance: (u.tokenBalance || 0) + amount };
      }
      return u;
    });
    saveUsers(updated);
  };

  const togglePro = (userId: string) => {
    const updated = users.map(u => {
      if (u.id === userId) return { ...u, isPro: !u.isPro };
      return u;
    });
    saveUsers(updated);
  };

  const deleteUser = (userId: string) => {
    if (confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
      const updated = users.filter(u => u.id !== userId);
      saveUsers(updated);
    }
  };

  const totalTokens = users.reduce((acc, u) => acc + (u.tokenBalance || 0), 0);
  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(search.toLowerCase()) || 
    u.companyName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[500] bg-slate-900/95 backdrop-blur-2xl flex flex-col text-white overflow-hidden animate-fade-in">
      {/* HUD Header */}
      <div className="h-24 border-b border-white/5 flex items-center justify-between px-12 shrink-0">
         <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-[0_0_30px_rgba(37,99,235,0.4)]">DV</div>
            <div>
               <h2 className="text-white font-black text-2xl uppercase tracking-tighter">Command Center</h2>
               <p className="text-[8px] font-black text-blue-400 uppercase tracking-[0.4em] mt-1">Sistem_Yönetici_Arayüzü v2.4</p>
            </div>
         </div>

         <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-[1.5rem] border border-white/5">
            <button onClick={() => setActiveTab('users')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Üye Listesi</button>
            <button onClick={() => setActiveTab('stats')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'stats' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>İstatistikler</button>
            <button onClick={() => setActiveTab('system')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'system' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Sistem</button>
         </div>

         <button onClick={onClose} className="px-8 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border border-red-500/20">Paneli Kapat</button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-12">
        {activeTab === 'users' && (
          <div className="max-w-7xl mx-auto space-y-8">
             <div className="flex justify-between items-end">
                <div>
                   <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">Kullanıcı Veritabanı</h3>
                   <p className="text-slate-400 text-xs font-medium">Toplam {users.length} kayıtlı kullanıcı bulundu.</p>
                </div>
                <div className="relative">
                   <input 
                     type="text" 
                     placeholder="Kullanıcı veya Şirket Ara..." 
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     className="w-80 h-12 bg-white/5 border border-white/10 rounded-xl px-6 text-sm font-bold outline-none focus:border-blue-500 transition-all"
                   />
                </div>
             </div>

             <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                         <th className="p-6">Kullanıcı / Şirket</th>
                         <th className="p-6">E-posta</th>
                         <th className="p-6">Bakiye</th>
                         <th className="p-6">Statü</th>
                         <th className="p-6 text-right">İşlemler</th>
                      </tr>
                   </thead>
                   <tbody className="text-xs font-bold divide-y divide-white/5">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                           <td className="p-6">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-blue-400 border border-white/10">{u.username?.charAt(0)}</div>
                                 <div>
                                    <div className="text-white">{u.username}</div>
                                    <div className="text-slate-500 text-[10px] uppercase tracking-tighter">{u.companyName || 'Bireysel'}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="p-6 text-slate-400">{u.email}</td>
                           <td className="p-6">
                              <div className="flex items-center gap-3">
                                 <span className="text-blue-400">{u.tokenBalance?.toLocaleString() || 0}</span>
                                 <div className="flex gap-1">
                                    <button onClick={() => handleUpdateTokens(u.id, 500)} className="w-6 h-6 bg-emerald-500/20 text-emerald-500 rounded flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all">+</button>
                                    <button onClick={() => handleUpdateTokens(u.id, -500)} className="w-6 h-6 bg-red-500/20 text-red-500 rounded flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">-</button>
                                 </div>
                              </div>
                           </td>
                           <td className="p-6">
                              <button 
                                onClick={() => togglePro(u.id)}
                                className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                                  u.isPro ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-slate-800 border-white/10 text-slate-500'
                                }`}
                              >
                                {u.isPro ? 'PRO ÜYE' : 'STANDART'}
                              </button>
                           </td>
                           <td className="p-6 text-right">
                              <button 
                                onClick={() => deleteUser(u.id)}
                                className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                              >
                                Sil
                              </button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] text-center">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 block">Toplam Ekonomi</span>
                <div className="text-5xl font-black text-white">{totalTokens.toLocaleString()}</div>
                <p className="text-slate-500 text-[10px] uppercase mt-4">Dolaşımdaki Toplam Kredi</p>
             </div>
             <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] text-center">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4 block">Aktif Operatörler</span>
                <div className="text-5xl font-black text-white">{users.length}</div>
                <p className="text-slate-500 text-[10px] uppercase mt-4">Kayıtlı Kullanıcı Sayısı</p>
             </div>
             <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] text-center">
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4 block">Tahmini Veri Hacmi</span>
                <div className="text-5xl font-black text-white">{(users.length * 42).toLocaleString()}</div>
                <p className="text-slate-500 text-[10px] uppercase mt-4">Toplanan Toplam Lead (Tahmini)</p>
             </div>
          </div>
        )}

        {activeTab === 'system' && (
           <div className="max-w-4xl mx-auto space-y-8">
              <div className="bg-red-500/5 border border-red-500/20 p-10 rounded-[3rem]">
                 <h4 className="text-xl font-black text-red-500 uppercase tracking-tighter mb-4">Tehlikeli Bölge</h4>
                 <p className="text-slate-400 text-sm mb-8">Bu işlemler geri alınamaz. Dikkatli kullanın.</p>
                 <button 
                   onClick={() => { if(confirm('TÜM veritabanı silinecek! Onaylıyor musunuz?')) { localStorage.clear(); window.location.reload(); }}}
                   className="px-10 py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-500/20"
                 >
                   Tüm Sistemi Sıfırla (LocalDB Clear)
                 </button>
              </div>
              
              <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem]">
                 <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-4">Admin Bilgileri</h4>
                 <div className="space-y-4 text-xs font-bold">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                       <span className="text-slate-500 uppercase">Aktif Yönetici</span>
                       <span className="text-blue-400">{currentUser?.username}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                       <span className="text-slate-500 uppercase">Yetki Seviyesi</span>
                       <span className="text-emerald-400">Root / Full Access</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-slate-500 uppercase">Sistem Durumu</span>
                       <span className="text-emerald-400 animate-pulse">ONLINE</span>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
